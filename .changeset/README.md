# Changesets

Publishable packages in this monorepo ( **linked** — same semver on each release):

- `@emplugins/emdash-plugin-md-draft`
- `@emplugins/mcp-emdash-drafts`

`@emplugins/shared` is **private** and versioned only for workspace builds.

## Release flow

1. `pnpm changeset` — describe changes and bump type on a PR.
2. Merge to `main` — GitHub Actions opens a **Version Packages** PR (or publishes when that PR merges).
3. Merge the Version Packages PR — CI publishes to npm and creates GitHub Releases.

Requires **`NPM_TOKEN`** on the repo (publish rights for `@emplugins/*`).

See [docs/maintainer-release.md](../docs/maintainer-release.md) and [EMDASH_COMPAT.md](../EMDASH_COMPAT.md).
