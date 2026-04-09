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
#   4. Creates release/<tag> from release
#   5. Runs npm build and force-adds dist/
#   6. Commits the build artifacts and tags release/<tag>
#   7. Pushes release, the release/<tag> branch, and the tag to origin
#
# The release branch stays free of build artifacts. Tags and built
# assets live on release/<tag> branches, which is what downstream
# consumers (composer, deployments) should reference.
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

if [ ! -d "${REPO_ROOT}/node_modules" ]; then
    echo "Error: node_modules not found. Run 'npm install' first."
    exit 1
fi

# --- Set version ---

VERSION_OUTPUT=$(node "${REPO_ROOT}/scripts/set-version.mjs" "$@")
echo "${VERSION_OUTPUT}"

# Extract the version from the last line of output ("  Version: X.Y.Z.N")
VERSION=$(echo "${VERSION_OUTPUT}" | grep "Version:" | awk '{print $NF}')

if [ -z "${VERSION}" ]; then
    # No "Version:" line means it was already a fork version (no-op).
    echo "Version is already set. Use './scripts/release.sh bump' to increment."
    exit 0
fi

TAG="v${VERSION}"
RELEASE_BRANCH="release/${VERSION}"

# Check if tag already exists
if git rev-parse "refs/tags/${TAG}" &>/dev/null; then
    echo "Error: Tag '${TAG}' already exists."
    git checkout kadence-blocks.php readme.txt
    exit 1
fi

# --- Commit version bump to release ---

echo ""
echo "==> Committing version ${VERSION} to release..."
git add kadence-blocks.php readme.txt
git commit -m "Version ${VERSION}"

# --- Create release branch and build ---

echo "==> Creating ${RELEASE_BRANCH} from release..."
git checkout -b "${RELEASE_BRANCH}"

echo "==> Building assets..."
npm run build

echo "==> Adding dist/ to ${RELEASE_BRANCH}..."
git add -f dist/
git commit -m "Release ${TAG}"

echo "==> Tagging ${TAG}..."
git tag "${TAG}"

# --- Push ---

echo "==> Pushing to origin..."
git checkout release
git push origin release "${RELEASE_BRANCH}" "${TAG}"

echo ""
echo "==> Released ${TAG}"
echo "    Tag and built assets: ${RELEASE_BRANCH}"
echo "    Working branch (release) has no build artifacts."