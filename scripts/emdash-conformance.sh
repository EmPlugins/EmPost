#!/usr/bin/env bash
set -euo pipefail

CONFIG="${EMDASH_RELEASE_CONFIG:-.cursor/emdash-release.json}"
MIN_VERSION="0.14.0"
PLUGIN_FILTER="@emplugins/emdash-plugin-md-draft"

if [[ -f "$CONFIG" ]] && command -v jq >/dev/null 2>&1; then
	MIN_VERSION="$(jq -r '.emdash.minPeerVersion // "0.14.0"' "$CONFIG")"
	PLUGIN_FILTER="$(jq -r '.emdash.pluginPackage // "@emplugins/emdash-plugin-md-draft"' "$CONFIG")"
fi

LATEST="${1:-$(npm view emdash version)}"

echo "EmDash conformance: min=${MIN_VERSION} latest=${LATEST}"

for VERSION in "$MIN_VERSION" "$LATEST"; do
	echo "--- emdash@${VERSION} ---"
	pnpm add -D "emdash@${VERSION}" --filter "$PLUGIN_FILTER"
	pnpm build
	pnpm test
	pnpm pack:check
done

echo "CONFORMING at emdash@${LATEST} (min ${MIN_VERSION})"
