#!/usr/bin/env node
/**
 * fix-composer-json.mjs — Remove private prophecy dependencies from composer.json
 * and composer.lock, and ensure the inlined prophecy/ PSR-4 autoload mapping is present.
 *
 * Usage: node scripts/fix-composer-json.mjs [path/to/composer.json]
 *
 * Also patches the sibling composer.lock if it exists.
 * Idempotent — safe to run multiple times.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';

const composerPath = resolve(process.argv[2] || 'composer.json');
const lockPath = join(dirname(composerPath), 'composer.lock');
const data = JSON.parse(readFileSync(composerPath, 'utf8'));

const PRIVATE_URLS = new Set([
	'git@github.com:stellarwp/prophecy-container.git',
	'git@github.com:stellarwp/prophecy-log.git',
	'git@github.com:stellarwp/prophecy-image-downloader.git',
	'git@github.com:stellarwp/prophecy-storage.git',
]);

const PROPHECY_PACKAGES = [
	'stellarwp/prophecy-container',
	'stellarwp/prophecy-image-downloader',
	'stellarwp/prophecy-log',
	'stellarwp/prophecy-storage',
];

const AUTOLOAD_KEY = 'KadenceWP\\KadenceBlocks\\StellarWP\\ProphecyMonorepo\\';
const AUTOLOAD_PATH = 'prophecy';

let changes = [];

// 1. Remove private VCS repositories
if (Array.isArray(data.repositories)) {
	const before = data.repositories.length;
	data.repositories = data.repositories.filter((r) => !PRIVATE_URLS.has(r.url));
	const removed = before - data.repositories.length;
	if (removed > 0) {
		changes.push(`Removed ${removed} private repository entries`);
	}
	if (data.repositories.length === 0) {
		delete data.repositories;
	}
}

// 2. Remove prophecy packages from require
const removedPackages = [];
for (const pkg of PROPHECY_PACKAGES) {
	if (data.require?.[pkg]) {
		delete data.require[pkg];
		removedPackages.push(pkg);
	}
}
if (removedPackages.length > 0) {
	changes.push(`Removed from require: ${removedPackages.join(', ')}`);
}

// 3. Ensure PSR-4 autoload for prophecy/ directory
if (!data.autoload) data.autoload = {};
if (!data.autoload['psr-4']) data.autoload['psr-4'] = {};

if (data.autoload['psr-4'][AUTOLOAD_KEY] !== AUTOLOAD_PATH) {
	data.autoload['psr-4'][AUTOLOAD_KEY] = AUTOLOAD_PATH;
	changes.push('Added prophecy PSR-4 autoload mapping');
}

// Write back with tab indentation to match upstream style
writeFileSync(composerPath, JSON.stringify(data, null, '\t') + '\n');

// 4. Remove prophecy packages from composer.lock
if (existsSync(lockPath)) {
	const lockData = JSON.parse(readFileSync(lockPath, 'utf8'));
	let lockRemoved = 0;

	for (const section of ['packages', 'packages-dev']) {
		if (Array.isArray(lockData[section])) {
			const before = lockData[section].length;
			lockData[section] = lockData[section].filter(
				(pkg) => !PROPHECY_PACKAGES.includes(pkg.name)
			);
			lockRemoved += before - lockData[section].length;
		}
	}

	if (lockRemoved > 0) {
		// Clear the content-hash so composer update --lock will recalculate it
		lockData['content-hash'] = '';
		writeFileSync(lockPath, JSON.stringify(lockData, null, '    ') + '\n');
		changes.push(`Removed ${lockRemoved} prophecy entries from composer.lock`);
	}
}

if (changes.length > 0) {
	for (const change of changes) {
		console.log(`  ${change}`);
	}
} else {
	console.log('  composer.json already clean — no changes needed');
}