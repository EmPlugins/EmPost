# Changesets

Publishable packages in this monorepo ( **linked** — same semver on each release):

- `@emplugins/emdash-plugin-md-draft`
- `@emplugins/mcp-emdash-drafts`

`@emplugins/shared` is **private** and versioned only for workspace builds.

## Release flow

1. `pnpm changeset` — describe changes and bump type on a PR (or add `.changeset/<slug>.md` by hand).
2. Merge to `main` — GitHub Actions opens a **Version Packages** PR (or publishes when that PR merges).
3. **You merge** the Version Packages PR — CI runs `pnpm release:publish` → npm (+ GitHub Release when changesets consume in the same successful run).

Requires **`NPM_TOKEN`** on the repo — see [docs/NPM_ORG_PUBLISH.md](../docs/NPM_ORG_PUBLISH.md).

## Verify after publish

```bash
pnpm release:verify
```

If npm is correct but GitHub Release is missing, see [docs/maintainer-release.md](../docs/maintainer-release.md) (delayed publish recovery) and run `pnpm release:github`.

## Important

- **All pending changesets ship together.** Clear stale `.changeset/*.md` files before a compat-only patch, or you may get an unexpected major/minor bump.
- **Publish command** must be `pnpm release:publish` in `release.yml` — not an inline `&&` chain.
- **Re-running Release** after npm already published may show `E403` — that is OK; check `pnpm release:verify`.

See [docs/RELEASES.md](../docs/RELEASES.md), [docs/maintainer-release.md](../docs/maintainer-release.md), and [EMDASH_COMPAT.md](../EMDASH_COMPAT.md).
