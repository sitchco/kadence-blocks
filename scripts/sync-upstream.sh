#!/usr/bin/env bash
#
# sync-upstream.sh — Sync fork with an upstream release tag.
#
# Usage:
#   ./scripts/sync-upstream.sh <tag>
#   ./scripts/sync-upstream.sh 3.7.0
#
# Prerequisites:
#   - Clean working tree
#
set -euo pipefail

TAG="${1:?Usage: $0 <upstream-tag>}"
BRANCH="sync/${TAG}"
REPO_ROOT="$(git rev-parse --show-toplevel)"

# --- Preflight checks ---

if ! git remote get-url upstream &>/dev/null; then
    echo "Adding upstream remote..."
    git remote add upstream https://github.com/stellarwp/kadence-blocks.git
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: Working tree is not clean. Commit or stash changes first."
    exit 1
fi

# --- Fetch and branch ---

echo "Fetching upstream tags..."
git fetch upstream --tags

if ! git rev-parse "refs/tags/${TAG}" &>/dev/null; then
    echo "Error: Tag '${TAG}' not found. Available upstream tags:"
    git tag -l --sort=-creatordate | head -20
    exit 1
fi

echo "Creating branch ${BRANCH} from current HEAD..."
git checkout -b "${BRANCH}"

# --- Merge upstream tag ---

echo "Merging upstream tag ${TAG}..."
if ! git merge "${TAG}" --no-edit; then
    echo ""
    echo "==> Merge conflicts detected."
    echo "    1. Resolve conflicts (composer.json conflicts will be fixed by the fixup script)"
    echo "    2. git add -A && git commit"
    echo "    3. ./scripts/post-merge-fixup.sh"
    exit 1
fi

echo ""
echo "Merge clean. Running post-merge fixup..."
"${REPO_ROOT}/scripts/post-merge-fixup.sh"

echo ""
echo "==> Sync complete on branch ${BRANCH}"
echo "    Review changes, test, then merge to master:"
echo "    git checkout master && git merge ${BRANCH}"
echo "    git tag sitchco/${TAG}"