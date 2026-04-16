#!/usr/bin/env bash
#
# release.sh — Tag a release with built assets on a dedicated release branch.
#
# Usage:
#   ./scripts/release.sh          → converts upstream version to fork version (e.g. 3.6.7 → 1003.6.7.0)
#   ./scripts/release.sh bump     → increments the fork patch segment (e.g. 1003.6.7.0 → 1003.6.7.1)
#
# This script:
#   1. Ensures we're on the release branch with a clean tree
#   2. Sets the version via set-version.mjs (auto-convert or bump)
#   3. Commits the version change to release
#   4. Creates releases/<version> from release
#   5. Builds composer (vendor/) and npm (dist/) assets
#   6. Commits the build artifacts and tags releases/<version>
#   7. Pushes release, the releases/<version> branch, and the tag to origin
#
# The release branch stays free of build artifacts. Tags and built
# assets live on releases/<version> branches, which is what downstream
# consumers (composer, deployments) should reference.
#
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

cleanup_on_error() {
    echo ""
    echo "==> Release failed. Returning to release branch."
    git checkout release 2>/dev/null || true
    echo "    To retry, you may need to:"
    echo "    1. git reset --hard HEAD~1   (undo the version commit on release)"
    echo "    2. git branch -D ${RELEASE_BRANCH:-}   (remove partial release branch)"
    echo "    3. git tag -d ${TAG:-}   (remove partial tag)"
}
trap cleanup_on_error ERR

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

if [ ! -d "${REPO_ROOT}/node_modules" ]; then
    echo "Error: node_modules not found. Run 'npm install' first."
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
RELEASE_BRANCH="releases/${VERSION}"

# Check if tag already exists
if git rev-parse "refs/tags/${TAG}" &>/dev/null; then
    echo "Error: Tag '${TAG}' already exists."
    git checkout "${REPO_ROOT}/kadence-blocks.php" "${REPO_ROOT}/readme.txt"
    exit 1
fi

# --- Commit version bump to release ---

echo ""
echo "==> Committing version ${VERSION} to release..."
git add "${REPO_ROOT}/kadence-blocks.php" "${REPO_ROOT}/readme.txt"
git commit -m "Version ${VERSION}"

# --- Create release branch and build ---

echo "==> Creating ${RELEASE_BRANCH} from release..."
if git show-ref --verify --quiet "refs/heads/${RELEASE_BRANCH}"; then
    echo "    Removing leftover branch from a prior failed run..."
    git branch -D "${RELEASE_BRANCH}"
fi
git checkout -b "${RELEASE_BRANCH}"

echo ""
echo "==> Cleaning build directories..."
rm -rf "${REPO_ROOT}/dist/" "${REPO_ROOT}/vendor/"

echo "==> Building composer dependencies..."
composer install --no-dev --no-interaction --working-dir="${REPO_ROOT}"

echo ""
echo "==> Building JS assets..."
npm run build

echo "==> Adding build artifacts to ${RELEASE_BRANCH}..."
git add -f "${REPO_ROOT}/vendor/"
git add -f "${REPO_ROOT}/dist/"
git add -f "${REPO_ROOT}/includes/assets/"
git commit -m "Release ${TAG}"

echo "==> Tagging ${TAG}..."
git tag "${TAG}"

# --- Push ---

echo "==> Pushing to origin..."
git checkout release
git push --atomic origin release "${RELEASE_BRANCH}" "${TAG}"

echo ""
echo "==> Released ${TAG}"
echo "    Tag and built assets: ${RELEASE_BRANCH}"
echo "    Working branch (release) has no build artifacts."