#!/usr/bin/env bash
#
# post-merge-fixup.sh — After merging an upstream tag, fix composer.json
# and regenerate composer.lock to remove private prophecy dependencies.
#
# This script:
#   1. Patches composer.json (removes private repos, adds prophecy autoload)
#   2. Updates composer.lock to match (removes prophecy lock entries)
#   3. Runs composer install to validate
#
# Safe to run multiple times (idempotent).
#
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

echo "==> Fixing composer.json after upstream merge..."
node "${REPO_ROOT}/scripts/fix-composer-json.mjs" "${REPO_ROOT}/composer.json"

# Update the lock file to reflect the removed packages.
# --no-install just updates the lock without installing anything yet.
echo ""
echo "==> Updating composer.lock..."
# --no-scripts prevents the post-update-cmd (strauss) from running,
# which would fail because vendor/ doesn't exist yet.
composer update --lock --no-install --no-scripts --no-interaction --working-dir="${REPO_ROOT}"

echo ""
echo "==> Running composer install to validate..."
if composer install --no-interaction --working-dir="${REPO_ROOT}"; then
    echo ""
    echo "==> Committing composer patches..."
    git add "${REPO_ROOT}/composer.json" "${REPO_ROOT}/composer.lock"
    git diff --cached --quiet || git commit -m "Apply fork composer patches"
    echo "==> Done. composer.json and composer.lock are clean."
else
    echo ""
    echo "==> composer install failed. Check the output above."
    exit 1
fi