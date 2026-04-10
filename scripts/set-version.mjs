#!/usr/bin/env node
/**
 * set-version.mjs — Update the plugin version across all version locations.
 *
 * Converts upstream versions to fork versions by adding 1000 to the major
 * and appending a patch segment, or accepts explicit fork versions.
 *
 * Usage:
 *   node scripts/set-version.mjs <upstream-version> [fork-patch]
 *   node scripts/set-version.mjs 3.6.7        → sets 1003.6.7.0
 *   node scripts/set-version.mjs 3.6.7 2      → sets 1003.6.7.2
 *   node scripts/set-version.mjs 1003.6.7.2   → sets 1003.6.7.2 (explicit)
 *   node scripts/set-version.mjs bump          → increments the fork patch segment
 *
 * Updates:
 *   - kadence-blocks.php: Version header and KADENCE_BLOCKS_VERSION constant
 *   - readme.txt: Stable tag
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const FORK_MAJOR_OFFSET = 1000;
const root = resolve(import.meta.dirname, '..');

function getCurrentVersion() {
	const content = readFileSync(resolve(root, 'kadence-blocks.php'), 'utf8');
	const match = content.match(/define\(\s*'KADENCE_BLOCKS_VERSION',\s*'([^']+)'/);
	return match ? match[1] : null;
}

function toForkVersion(input, forkPatch = 0) {
	const parts = input.split('.').map(Number);

	// Already a fork version (major >= 1000)
	if (parts[0] >= FORK_MAJOR_OFFSET) {
		return input;
	}

	if (parts.length < 3) {
		console.error(`Invalid version format: "${input}" — expected X.Y.Z`);
		process.exit(1);
	}

	// Upstream version: 3.6.7 → 1003.6.7.0
	const [major, minor, patch] = parts;
	return `${FORK_MAJOR_OFFSET + major}.${minor}.${patch}.${forkPatch}`;
}

function bumpForkPatch(version) {
	const parts = version.split('.').map(Number);
	if (parts.length < 4 || parts[0] < FORK_MAJOR_OFFSET) {
		console.error(`Cannot bump: current version "${version}" is not a fork version.`);
		console.error('Set a fork version first: node scripts/set-version.mjs <upstream-version>');
		process.exit(1);
	}
	parts[3]++;
	return parts.join('.');
}

// Parse args
let arg = process.argv[2];
const forkPatch = process.argv[3];

if (!arg) {
	const current = getCurrentVersion();
	if (!current) {
		console.error('Could not read current version from kadence-blocks.php');
		process.exit(1);
	}
	const parts = current.split('.').map(Number);
	if (parts[0] >= FORK_MAJOR_OFFSET) {
		console.log(`  Already a fork version: ${current}`);
		process.exit(0);
	}
	// Auto-convert upstream version to fork version
	arg = current;
}

let version;
if (arg === 'bump') {
	const current = getCurrentVersion();
	if (!current) {
		console.error('Could not read current version from kadence-blocks.php');
		process.exit(1);
	}
	version = bumpForkPatch(current);
} else {
	version = toForkVersion(arg, forkPatch ?? 0);
}

// Apply to files
const replacements = [
	{
		file: 'kadence-blocks.php',
		patterns: [
			[/(Version:\s+)(.+)/, `$1${version}`],
			[/(define\(\s*'KADENCE_BLOCKS_VERSION',\s*')([^']+)/, `$1${version}`],
		],
	},
	{
		file: 'readme.txt',
		patterns: [
			[/(Stable tag:\s+)(.+)/, `$1${version}`],
		],
	},
];

for (const { file, patterns } of replacements) {
	const filePath = resolve(root, file);
	let content = readFileSync(filePath, 'utf8');
	let changed = false;

	for (const [regex, replacement] of patterns) {
		const before = content;
		content = content.replace(regex, replacement);
		if (content !== before) changed = true;
	}

	if (changed) {
		writeFileSync(filePath, content);
		console.log(`  Updated ${file} → ${version}`);
	} else {
		console.log(`  ${file} already at ${version}`);
	}
}

console.log(`\n  Version: ${version}`);