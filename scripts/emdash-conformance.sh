#!/usr/bin/env bash
set -euo pipefail

CONFIG="${EMDASH_RELEASE_CONFIG:-.cursor/emdash-release.json}"
LATEST="${1:-$(npm view emdash version)}"

if [[ ! -f "$CONFIG" ]]; then
  echo "Missing $CONFIG — copy from ~/.cursor/skills/emdash-plugin-release/emdash-release.json.example" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to read $CONFIG" >&2
  exit 1
fi

MIN_VERSION="$(jq -r '.emdash.minPeerVersion' "$CONFIG")"
PLUGIN_FILTER="$(jq -r '.emdash.pluginPackage' "$CONFIG")"

if [[ -z "$MIN_VERSION" || "$MIN_VERSION" == "null" || -z "$PLUGIN_FILTER" || "$PLUGIN_FILTER" == "null" ]]; then
  echo "Invalid $CONFIG: emdash.minPeerVersion and emdash.pluginPackage are required" >&2
  exit 1
fi

echo "EmDash conformance: min=${MIN_VERSION} latest=${LATEST} package=${PLUGIN_FILTER}"

for VERSION in "$MIN_VERSION" "$LATEST"; do
  echo "--- emdash@${VERSION} ---"
  pnpm add -D "emdash@${VERSION}" --filter "$PLUGIN_FILTER"
  pnpm build
  pnpm test
  pnpm pack:check
done

echo "CONFORMING at emdash@${LATEST} (min ${MIN_VERSION})"
