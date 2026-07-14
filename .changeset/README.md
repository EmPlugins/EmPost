# Changesets

Publishable packages in this monorepo ( **linked** — same semver on each release):

- `@emplugins/emdash-plugin-md-draft`
- `@emplugins/mcp-emdash-drafts`

`@emplugins/shared` is **private** and versioned only for workspace builds.

## Release flow

1. `pnpm changeset` — describe changes and bump type on a PR (or add `.changeset/<slug>.md` by hand).
2. Merge to `main` — GitHub Actions opens a **Version Packages** PR (or publishes when that PR merges).
3. Merge the Version Packages PR — CI runs `pnpm release:publish` → npm + GitHub Releases.

Requires **`NPM_TOKEN`** on the repo (publish rights for `@emplugins/*`).

## Important

- **All pending changesets ship together.** Clear stale `.changeset/*.md` files before a compat-only patch, or you may get an unexpected major/minor bump.
- **Publish command** must be `pnpm release:publish` in `release.yml` — not an inline `&&` chain. See [docs/maintainer-release.md](../docs/maintainer-release.md).

See [docs/maintainer-release.md](../docs/maintainer-release.md) and [EMDASH_COMPAT.md](../EMDASH_COMPAT.md).
