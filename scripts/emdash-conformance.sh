#!/usr/bin/env bash
set -euo pipefail

MIN_VERSION="0.14.0"
LATEST="${1:-$(npm view emdash version)}"
PLUGIN_FILTER="@emplugins/emdash-plugin-md-draft"

echo "EmDash conformance: min=${MIN_VERSION} latest=${LATEST}"

for VERSION in "$MIN_VERSION" "$LATEST"; do
  echo "--- emdash@${VERSION} ---"
  pnpm add -D "emdash@${VERSION}" --filter "$PLUGIN_FILTER"
  pnpm build
  pnpm test
  pnpm pack:check
done

echo "CONFORMING at emdash@${LATEST} (min ${MIN_VERSION})"
