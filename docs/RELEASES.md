# Releases and versioning

Published **npm** versions of `@emplugins/emdash-plugin-md-draft` and `@emplugins/mcp-emdash-drafts` follow **[Semantic Versioning 2.0.0](https://semver.org/)** (`MAJOR.MINOR.PATCH`). The two packages are **linked** — they share the same semver on every release (see `.changeset/config.json`).

**Toolchain:** **pnpm** + **[Changesets](https://github.com/changesets/changesets)** + GitHub Actions ([`release.yml`](../.github/workflows/release.yml)). Packages publish to the **[emplugins](https://www.npmjs.com/org/emplugins)** npm org via `scripts/npm-auth-publish.mjs`.

## What each bump means

| Level | When to use it |
|--------|----------------|
| **PATCH** | EmDash compat-only (conformance green, no API fixes); bug fixes; safe refactors. |
| **MINOR** | Non-breaking API fixes for a new EmDash release; additive plugin behavior. |
| **MAJOR** | Peer floor raised (e.g. `>=0.9.0` → `>=0.14.0`); breaking ingest or MCP contract changes. |

## Safe publishing

- **`release:publish`** runs `build`, `test`, `pack:check`, then `npm-auth-publish.mjs` (explicit `.npmrc` + `npm publish` per package).
- **`release:verify`** checks npm registry versions and GitHub Release tag for the current `package.json` versions.
- **`release:github`** creates a missing GitHub Release from the primary package CHANGELOG (recovery when npm published but changesets did not create a release).

Before publishing locally (usually unnecessary once CI is configured):

```bash
pnpm build
pnpm pack:check
```

## Cutting a release (maintainers)

### EmDash compatibility (agent-driven)

In Cursor:

```
update to latest emdash release
```

Uses [`.cursor/skills/emdash-release/`](../.cursor/skills/emdash-release/SKILL.md) and [`.cursor/emdash-release.json`](../.cursor/emdash-release.json):

1. Conformance at min peer + latest EmDash
2. Compatibility PR → auto-merge when CI is green
3. **You merge** the Version Packages PR (publish gate)
4. Release workflow publishes to npm; verify with `pnpm release:verify`

Details: [maintainer-release.md](./maintainer-release.md).

### Feature or fix release (Changesets)

1. On a feature PR, add `.changeset/<slug>.md` (or `pnpm changeset`).
2. Merge to `main` → Release workflow opens a **Version Packages** PR.
3. Merge Version Packages PR → `pnpm release:publish` on CI → npm + GitHub Release (when publish succeeds in the same run that consumes changesets).

Requires **`NPM_TOKEN`** on the repo — see [NPM_ORG_PUBLISH.md](./NPM_ORG_PUBLISH.md).

### Verify after publish

```bash
pnpm release:verify
```

If npm is correct but GitHub Release is missing:

```bash
pnpm release:github
```

## Tags

Release tags use the **`v` prefix** (e.g. `v2.0.0`) via Changesets / GitHub Releases when publish and release creation happen in one successful changesets run.

## EmDash compatibility

See [EMDASH_COMPAT.md](../EMDASH_COMPAT.md) for tested upstream versions and the agent upgrade path.

## Consumers

```bash
pnpm add @emplugins/emdash-plugin-md-draft@^2.0.0
npx -y @emplugins/mcp-emdash-drafts@^2.0.0
```
