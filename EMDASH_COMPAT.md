# EmDash compatibility — EmPost

| Package | Version line | Min EmDash (peer) | CI-tested EmDash | Notes |
|---------|--------------|-------------------|------------------|-------|
| `@emplugins/emdash-plugin-md-draft` | **2.x** | `>=0.14.0` | `0.14.0`, `0.29.0` | Raised from `>=0.9.0` at 1.0.0; **2.0.0** shipped with emdash@0.29.0 compat |
| `@emplugins/mcp-emdash-drafts` | linked to plugin | — | same site requirement | Needs plugin + EmDash on target site |

Publishable packages are **version-linked** via Changesets (same semver on each release).

## When EmDash releases

1. **Renovate** (or a manual bump) updates the dev dependency `emdash` in `@emplugins/emdash-plugin-md-draft`.
2. CI matrix runs against **minimum supported** and **latest** EmDash versions.
3. If green: merge and optionally ship a patch release.
4. If red: fix imports/API usage (`emdash`, `emdash/astro`), raise peer range if needed, ship minor/major.

## Agent-driven upgrade

Per-repo config: [`.cursor/emdash-release.json`](.cursor/emdash-release.json). Personal skill: `~/.cursor/skills/emdash-plugin-release/` (works in any EmPlugins repo with that file).

Run **`update to latest emdash release`** in Cursor.

1. Discovers the latest `emdash` on npm and bumps dev dep, lockfile, CI matrix, and docs.
2. Runs `pnpm emdash:conformance` (min `0.14.0` + latest).
3. Opens a compatibility PR and **auto-merges** when CI is green.
4. **Stops** at the Changesets **Version Packages** PR — you merge that PR to publish to npm.

See [docs/maintainer-release.md](docs/maintainer-release.md) for troubleshooting (manual Version PR, publish failures, changeset hygiene).

### Credentials (one-time)

| Credential | Where |
|------------|-------|
| `gh auth login` | Your machine (branch, PR, auto-merge compat PR) |
| `NPM_TOKEN` | GitHub repo secret on `EmPlugins/EmPost` (npm publish via `release.yml`) |

See `.cursor/emdash-release.json`, `~/.cursor/skills/emdash-plugin-release/bootstrap.md`, and `docs/maintainer-release.md` for full details.

## Lessons learned (2026 emdash@0.29.0 release)

| Issue | Mitigation |
|-------|------------|
| Stale `major` changeset + compat `patch` → shipped **2.0.0** | Clear pending `.changeset/*.md` before compat upgrades |
| `changesets/action` misparsed inline `&&` publish command | Use `pnpm release:publish` in `release.yml` |
| Org blocked Actions from creating Version Packages PR | Enable in org settings, or `gh pr create --head changeset-release/main` |
| `pnpm/action-setup version: 9` conflicted with `packageManager` | Omit `version`; let `packageManager` pin pnpm |
| Local `gh` used invalid `GITHUB_TOKEN` env var | `env -u GITHUB_TOKEN gh ...` |
| Local `npm publish` required OTP | Prefer CI publish via `NPM_TOKEN` |
| Fix PR branched from diverged local `main` → conflicts | Branch fixes from `origin/main` only |

## Consumer install

```bash
pnpm add @emplugins/emdash-plugin-md-draft
npx -y @emplugins/mcp-emdash-drafts
```

Upstream: [emdash-cms/emdash](https://github.com/emdash-cms/emdash)
