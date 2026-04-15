# Fork Maintenance Scripts

This directory contains scripts for maintaining the Sitchco fork of [Kadence Blocks](https://github.com/stellarwp/kadence-blocks). The fork carries substantial customizations on top of upstream releases, so these scripts provide a repeatable workflow for syncing upstream changes, managing versions, and cutting releases.

## Branching Strategy

```
upstream tag (e.g. 3.7.0)
         \
          sync/3.7.0  ──→  release  ──→  release/1003.7.0.0  ──→  v1003.7.0.0 (tag)
                              │
                         feature branches
```

- **`release`** — The fork's main working branch. All fork patches and feature branches live here. Contains source code only — no build artifacts (`dist/` is gitignored).
- **`release/<version>`** — Created by `release.sh` for each tagged release. Branches from `release` and adds built artifacts (`dist/`, `vendor/`, `includes/assets/`). Tags point here. This is what downstream consumers (composer, deployments) should reference.
- **`master`** — Tracks upstream. Not used in the sync or release flow; exists as a clean reference point for diffing against upstream (`git diff master..release`).
- **`sync/<tag>`** — Temporary branch created during an upstream sync. Branches from `release`, merges in the upstream tag, and gets merged back to `release` after review.
- **Feature branches** — Branch from and merge to `release`.

The key constraint: **`release` only moves forward via merge commits and version-bump commits** — never rebased, never force-pushed. This ensures that deployed SHAs and composer lock references remain permanently valid.

## Version Scheme

The fork uses a prefixed version number to prevent WordPress from auto-updating the plugin with the upstream version from wordpress.org.

**Format:** `10XX.Y.Z.P`

| Segment | Meaning | Example |
|---|---|---|
| `10XX` | `1000 + upstream major` | upstream `3.7.0` → `1003` |
| `Y.Z` | Upstream minor and patch | `7.0` |
| `P` | Fork patch number (starts at `0`) | `0`, `1`, `2`, ... |

Examples:
- Upstream `3.6.7` → fork `1003.6.7.0` (initial sync)
- Fork bugfix on top → `1003.6.7.1` (bump)
- Next upstream release `3.7.0` → `1003.7.0.0`

This works because PHP's `version_compare('1003.6.7.0', '3.7.0')` returns `1` (fork is always "newer"), so WordPress never offers an update from the upstream plugin listing.

## Private Dependency Handling

Upstream depends on 4 private `stellarwp/prophecy-*` packages that are split from an internal monorepo. Since we don't have access to those private repos, the fork inlines the source code directly:

- The prefixed source lives in `prophecy/` at the repo root
- A PSR-4 autoload entry maps `KadenceWP\KadenceBlocks\StellarWP\ProphecyMonorepo\` → `prophecy/`
- The private VCS repositories and `require` entries are removed from `composer.json`

This is handled automatically by `fix-composer-json.mjs` after each upstream merge.

## Scripts

### `sync-upstream.sh <tag>`

Syncs a specific upstream release tag into the fork.

```bash
./scripts/sync-upstream.sh 3.7.0
```

1. Adds the `upstream` remote if missing and fetches tags
2. Creates `sync/3.7.0` from `release`
3. Merges the upstream tag into it
4. Runs `post-merge-fixup.sh` to patch composer files

If there are merge conflicts, the script exits with instructions to resolve them manually, then run `post-merge-fixup.sh`.

After the sync branch is ready:
```bash
git checkout release && git merge sync/3.7.0
./scripts/release.sh
```

### `post-merge-fixup.sh`

Patches `composer.json` and `composer.lock` after an upstream merge to remove private dependency references.

```bash
./scripts/post-merge-fixup.sh
```

1. Runs `fix-composer-json.mjs` to patch both files
2. Runs `composer update --lock` to recalculate the lock content-hash
3. Runs `composer install` to validate everything resolves
4. Stages and commits `composer.json` and `composer.lock` (skips commit if nothing changed)

Safe to run multiple times (idempotent).

### `fix-composer-json.mjs`

Node script that performs the actual JSON patching on `composer.json` and `composer.lock`:

- Removes the 4 private `stellarwp/prophecy-*` VCS repository entries
- Removes prophecy packages from `require`
- Auto-adopts transitive dependencies from prophecy packages (reads their `require` blocks from the lock before stripping, adds missing deps to `composer.json` with `^major.minor` constraints based on locked versions)
- Removes prophecy packages from the lock file
- Ensures the `prophecy/` PSR-4 autoload mapping is present

```bash
node scripts/fix-composer-json.mjs [path/to/composer.json]
```

### `set-version.mjs`

Reads and sets the plugin version across `kadence-blocks.php` and `readme.txt`.

```bash
# Auto-convert current upstream version to fork version (no-op if already fork)
node scripts/set-version.mjs

# Set from an explicit upstream version
node scripts/set-version.mjs 3.6.7        # → 1003.6.7.0
node scripts/set-version.mjs 3.6.7 2      # → 1003.6.7.2

# Set an explicit fork version directly
node scripts/set-version.mjs 1003.6.7.2   # → 1003.6.7.2

# Increment the fork patch segment (e.g. 1003.7.0.0 → 1003.7.0.1)
node scripts/set-version.mjs bump
```

### `release.sh [bump]`

Tags and pushes a release with built assets on a dedicated release branch.

```bash
# After an upstream sync — auto-converts version and tags
./scripts/release.sh

# After fork-only patches — bumps the fork patch segment and tags
./scripts/release.sh bump
```

1. Verifies we're on the `release` branch with a clean working tree and `node_modules` installed
2. Runs `set-version.mjs` (auto-convert or bump)
3. Commits the version change to `release`
4. Creates `release/1003.7.0.0` from `release`
5. Cleans build dirs, runs `composer install --no-dev` and `npm run build`
6. Force-adds `vendor/`, `dist/`, and `includes/assets/` (gulp output)
7. Commits the build artifacts and creates the git tag on the release branch
8. Atomically pushes `release`, the `release/<version>` branch, and the tag to origin

The `release` branch stays free of build artifacts. Tags and built assets live on `release/<version>` branches.

## Full Workflow Example

### Syncing a new upstream release

```bash
# 1. Sync upstream tag into a working branch
./scripts/sync-upstream.sh 3.7.0

# 2. If conflicts: resolve, commit, then run fixup
#    If clean: fixup runs automatically

# 3. Review and test the sync branch
npm run build  # verify JS builds
composer install  # verify PHP deps

# 4. Merge into release
git checkout release && git merge sync/3.7.0

# 5. Release (builds assets, creates release/1003.7.0.0, tags)
./scripts/release.sh

# 6. Clean up
git branch -d sync/3.7.0
```

### Releasing a fork-only patch

```bash
git checkout release

# ... make changes, commit ...

# Build, bump, tag (e.g. v1003.7.0.0 → v1003.7.0.1)
./scripts/release.sh bump
```