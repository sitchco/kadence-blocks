#!/usr/bin/env bash
#
# release.sh — Tag a release on the release branch.
#
# Usage:
#   ./scripts/release.sh          → converts upstream version to fork version (e.g. 3.6.7 → 1003.6.7.0)
#   ./scripts/release.sh bump     → increments the fork patch segment (e.g. 1003.6.7.0 → 1003.6.7.1)
#
# This script:
#   1. Ensures we're on the release branch with a clean tree
#   2. Sets the version via set-version.mjs (auto-convert or bump)
#   3. Commits the version change
#   4. Tags with the fork version
#   5. Pushes the branch and tag to origin
#
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

# --- Preflight checks ---

CURRENT_BRANCH="$(git branch --show-current)"
if [ "${CURRENT_BRANCH}" != "release" ]; then
    echo "Error: Must be on the 'release' branch (currently on '${CURRENT_BRANCH}')."
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: Working tree is not clean. Commit or stash changes first."
    exit 1
fi

# --- Set version ---

VERSION_OUTPUT=$(node "${REPO_ROOT}/scripts/set-version.mjs" "$@")
echo "${VERSION_OUTPUT}"

# Extract the version from the last line of output ("  Version: X.Y.Z.N")
VERSION=$(echo "${VERSION_OUTPUT}" | grep "Version:" | awk '{print $NF}' || true)

if [ -z "${VERSION}" ]; then
    # No "Version:" line means it was already a fork version (no-op).
    echo "Version is already set. Use './scripts/release.sh bump' to increment."
    exit 0
fi

TAG="v${VERSION}"

# Check if tag already exists
if git rev-parse "refs/tags/${TAG}" &>/dev/null; then
    echo "Error: Tag '${TAG}' already exists."
    git checkout "${REPO_ROOT}/kadence-blocks.php" "${REPO_ROOT}/readme.txt"
    exit 1
fi

# --- Commit and tag ---

echo ""
echo "==> Building composer dependencies..."
composer install --no-dev --no-interaction --working-dir="${REPO_ROOT}"

echo ""
echo "==> Committing version ${VERSION}..."
git add "${REPO_ROOT}/kadence-blocks.php" "${REPO_ROOT}/readme.txt"
git add -f "${REPO_ROOT}/vendor/"
git commit -m "Release ${TAG}"

echo "==> Tagging ${TAG}..."
git tag "${TAG}"

# --- Push ---

echo "==> Pushing release branch and tag to origin..."
git push origin release "${TAG}"

echo ""
echo "==> Released ${TAG}"