#!/usr/bin/env node
/**
 * fix-composer-json.mjs — Remove private prophecy dependencies from composer.json
 * and composer.lock, auto-adopt their transitive dependencies, and ensure the
 * inlined prophecy/ PSR-4 autoload mapping is present.
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

// Static list — audit when upstream adds new prophecy-* packages.
const PROPHECY_PACKAGES = new Set([
	'stellarwp/prophecy-container',
	'stellarwp/prophecy-image-downloader',
	'stellarwp/prophecy-log',
	'stellarwp/prophecy-storage',
]);

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

// 3. Auto-adopt transitive dependencies from prophecy packages
//    Before stripping prophecy entries from the lock, read their require blocks
//    and ensure those dependencies are present in composer.json.
if (existsSync(lockPath)) {
	const lockData = JSON.parse(readFileSync(lockPath, 'utf8'));
	const allLockPackages = [
		...(lockData.packages || []),
		...(lockData['packages-dev'] || []),
	];

	// Build a map of package name -> resolved version from the lock
	const resolvedVersions = new Map();
	for (const pkg of allLockPackages) {
		resolvedVersions.set(pkg.name, pkg.version);
	}

	// Collect transitive deps from prophecy packages
	const transitiveDeps = new Map(); // dep name -> [source packages]
	for (const pkg of allLockPackages) {
		if (!PROPHECY_PACKAGES.has(pkg.name)) continue;
		for (const [dep, constraint] of Object.entries(pkg.require || {})) {
			if (dep.startsWith('php') || dep.startsWith('ext-')) continue;
			if (PROPHECY_PACKAGES.has(dep)) continue;
			if (!transitiveDeps.has(dep)) transitiveDeps.set(dep, []);
			transitiveDeps.get(dep).push({ source: pkg.name, constraint });
		}
	}

	// Add missing transitive deps to composer.json
	const adopted = [];
	for (const [dep, sources] of transitiveDeps) {
		if (data.require?.[dep]) continue; // already explicitly required

		const resolved = resolvedVersions.get(dep);
		if (!resolved) continue; // not in lock — shouldn't happen but be safe

		const caretConstraint = toCaretConstraint(resolved);
		if (!data.require) data.require = {};
		data.require[dep] = caretConstraint;
		const sourceNames = sources.map((s) => s.source.replace('stellarwp/', '')).join(', ');
		adopted.push(`${dep}: ${caretConstraint} (via ${sourceNames})`);
	}

	if (adopted.length > 0) {
		// Sort require keys for consistency
		data.require = Object.fromEntries(
			Object.entries(data.require).sort(([a], [b]) => a.localeCompare(b))
		);
		changes.push(`Auto-adopted transitive dependencies:\n    ${adopted.join('\n    ')}`);
	}
}

// 4. Ensure PSR-4 autoload for prophecy/ directory
if (!data.autoload) data.autoload = {};
if (!data.autoload['psr-4']) data.autoload['psr-4'] = {};

if (data.autoload['psr-4'][AUTOLOAD_KEY] !== AUTOLOAD_PATH) {
	data.autoload['psr-4'][AUTOLOAD_KEY] = AUTOLOAD_PATH;
	changes.push('Added prophecy PSR-4 autoload mapping');
}

// Write back with tab indentation to match upstream style (only if changes were made)
if (changes.length > 0) {
	writeFileSync(composerPath, JSON.stringify(data, null, '\t') + '\n');
}

// 5. Remove prophecy packages from composer.lock
if (existsSync(lockPath)) {
	const lockData = JSON.parse(readFileSync(lockPath, 'utf8'));
	let lockRemoved = 0;

	for (const section of ['packages', 'packages-dev']) {
		if (Array.isArray(lockData[section])) {
			const before = lockData[section].length;
			lockData[section] = lockData[section].filter(
				(pkg) => !PROPHECY_PACKAGES.has(pkg.name)
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

/**
 * Convert a resolved version string (e.g. "v5.4.45", "2.11.0") to a caret
 * constraint pinned to the major.minor (e.g. "^5.4", "^2.11").
 */
function toCaretConstraint(version) {
	const clean = version.replace(/^v/i, '');
	const parts = clean.split('.');
	if (parts.length >= 2) {
		return `^${parts[0]}.${parts[1]}`;
	}
	return `^${clean}`;
}