# EmDash compatibility — EmPost

| Package | Version line | Min EmDash (peer) | CI-tested EmDash | Notes |
|---------|--------------|-------------------|------------------|-------|
| `@emplugins/emdash-plugin-md-draft` | **1.x** | `>=0.14.0` | `0.14.0`, `0.29.0` | Raised from `>=0.9.0` at 1.0.0 |
| `@emplugins/mcp-emdash-drafts` | linked to plugin | — | same site requirement | Needs plugin + EmDash on target site |

Publishable packages are **version-linked** via Changesets (same semver on each release).

## When EmDash releases

1. **Renovate** (or a manual bump) updates the dev dependency `emdash` in `@emplugins/emdash-plugin-md-draft`.
2. CI matrix runs against **minimum supported** and **latest** EmDash versions.
3. If green: merge and optionally ship a patch release.
4. If red: fix imports/API usage (`emdash`, `emdash/astro`), raise peer range if needed, ship minor/major.

## Agent-driven upgrade

Run **`update to latest emdash release`** in Cursor (loads `.cursor/skills/emdash-release`). The agent:

1. Discovers the latest `emdash` on npm and bumps dev dep, lockfile, CI matrix, and docs.
2. Runs `pnpm emdash:conformance` (min `0.14.0` + latest).
3. Opens a compatibility PR and **auto-merges** when CI is green.
4. **Stops** at the Changesets **Version Packages** PR — you merge that PR to publish to npm.

### Credentials (one-time)

| Credential | Where |
|------------|-------|
| `gh auth login` | Your machine (branch, PR, auto-merge compat PR) |
| `NPM_TOKEN` | GitHub repo secret on `EmPlugins/EmPost` (npm publish via `release.yml`) |

See `.cursor/skills/emdash-release/reference.md` for full details.

## Consumer install

```bash
pnpm add @emplugins/emdash-plugin-md-draft
npx -y @emplugins/mcp-emdash-drafts
```

Upstream: [emdash-cms/emdash](https://github.com/emdash-cms/emdash)
