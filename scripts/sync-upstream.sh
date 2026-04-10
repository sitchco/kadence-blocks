#!/usr/bin/env bash
#
# sync-upstream.sh — Merge an upstream release tag into the release branch.
#
# Usage:
#   ./scripts/sync-upstream.sh <tag>
#   ./scripts/sync-upstream.sh 3.7.0
#
# This script:
#   1. Fetches upstream tags
#   2. Creates a sync branch from release
#   3. Merges the upstream tag into it
#   4. Runs post-merge-fixup (patches composer.json/lock)
#
# After the script completes (or after resolving conflicts):
#   1. Review and test changes
#   2. Merge into release:  git checkout release && git merge sync/<tag>
#   3. Tag the release:     ./scripts/release.sh
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

if git rev-parse --verify "refs/heads/${BRANCH}" &>/dev/null; then
    echo "Error: Branch '${BRANCH}' already exists (from a previous sync?)."
    echo "       Delete it first: git branch -D ${BRANCH}"
    exit 1
fi

echo "Creating branch ${BRANCH} from release..."
git checkout -b "${BRANCH}" release

# --- Merge upstream tag ---

echo "Merging upstream tag ${TAG}..."
if ! git merge "${TAG}" --no-edit; then
    echo ""
    echo "==> Merge conflicts detected."
    echo "    1. Resolve conflicts (composer.json conflicts will be fixed by the fixup script)"
    echo "    2. git add -A && git commit"
    echo "    3. ./scripts/post-merge-fixup.sh"
    echo ""
    echo "    Then merge into release and tag:"
    echo "    git checkout release && git merge ${BRANCH}"
    echo "    ./scripts/release.sh"
    exit 1
fi

echo ""
echo "Merge clean. Running post-merge fixup..."
"${REPO_ROOT}/scripts/post-merge-fixup.sh"

echo ""
echo "==> Sync complete on branch ${BRANCH}"
echo "    Next steps:"
echo "    1. Review and test changes"
echo "    2. Merge into release:  git checkout release && git merge ${BRANCH}"
echo "    3. Tag the release:     ./scripts/release.sh"