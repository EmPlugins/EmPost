# Maintainer release guide

How EmPost versions and publishes `@emplugins/*` packages, including lessons from the emdash@0.29.0 upgrade (2026).

## Per-repo config (multi-repo)

Each EmPlugins plugin repo should have `.cursor/emdash-release.json`. The personal skill `~/.cursor/skills/emdash-plugin-release/` reads it at runtime.

Copy template from `~/.cursor/skills/emdash-plugin-release/emdash-release.json.example`. Setup guide: `~/.cursor/skills/emdash-plugin-release/bootstrap.md`.

## Overview

| Step | What happens |
|------|----------------|
| 1. Changeset on a PR | Describe bump type in `.changeset/<slug>.md` |
| 2. Merge to `main` | Release workflow runs `changesets/action` |
| 3. Version Packages PR | Bumps versions + changelogs; **you merge** to approve publish |
| 4. Publish | `release.yml` runs `pnpm release:publish` → npm + GitHub Release |

Publishable packages are **linked** (same semver): `@emplugins/emdash-plugin-md-draft`, `@emplugins/mcp-emdash-drafts`.

## Prerequisites

| Credential | Where | Notes |
|------------|-------|-------|
| `NPM_TOKEN` | GitHub repo secret | Automation or granular token with publish + 2FA bypass for `@emplugins/*` |
| `gh auth login` | Your machine | For PRs and agent-driven compat merges |
| Org: Actions create PRs | GitHub org/repo settings | Required for automatic Version Packages PRs |

### GitHub CLI and `GITHUB_TOKEN`

If `gh auth login` reports that `GITHUB_TOKEN` is in use, the shell env is overriding keyring auth:

```bash
env -u GITHUB_TOKEN gh auth status
env -u GITHUB_TOKEN gh pr create ...
```

Or store keyring credentials explicitly: `echo "$GITHUB_TOKEN" | gh auth login --with-token` (only if the token has `repo` scope).

### npm 2FA

- **CI publish** uses `NPM_TOKEN` (automation/granular with bypass) — no OTP.
- **Local publish** (`pnpm release:publish`) prompts for OTP when your npm account has 2FA. Prefer CI for routine releases.

### `NPM_TOKEN` 404 or EOTP on publish

See [docs/NPM_ORG_PUBLISH.md](./NPM_ORG_PUBLISH.md) (aligned with [EmPrivacy](https://github.com/EmPlugins/EmPrivacy/blob/main/docs/NPM_ORG_PUBLISH.md)).

| Error | Meaning |
|-------|---------|
| `E404` on PUT | Token lacks publish scope — use **All packages** write on granular token |
| `EOTP` | Token requires interactive 2FA — enable **Bypass 2FA for automation** |

Publish uses `scripts/npm-auth-publish.mjs` (explicit `.npmrc` + `npm publish` per package).

## Release workflow details

Config: [`.github/workflows/release.yml`](../.github/workflows/release.yml)

```yaml
publish: pnpm release:publish   # root script in package.json — do NOT use inline && here
```

`changesets/action` misparses inline shell chains like `pnpm build && pnpm test && ...`, passing `&&` arguments into `pnpm build`. Always use the `release:publish` script.

### CI pnpm setup

Do **not** set `version: 9` on `pnpm/action-setup` when `package.json` has `"packageManager": "pnpm@9.15.4"`. That duplicate version spec fails CI immediately. Let `packageManager` drive the version (omit `version` in the action).

## Changeset hygiene

Before an EmDash compatibility release, check for **stale pending changesets**:

```bash
ls .changeset/*.md
```

`changeset version` consumes **all** pending files on the Version Packages PR. With linked packages, the **highest** bump wins:

| Pending changesets | Result |
|--------------------|--------|
| patch only | patch release |
| patch + major | **major** release |

Example: a leftover `major` changeset from an earlier peer-range raise combined with a new `patch` compat changeset produced **2.0.0** instead of a patch.

**Before starting a compat upgrade:** ship or remove stale `.changeset/*.md` files so the Version Packages PR matches intent.

## EmDash compatibility upgrades

See [EMDASH_COMPAT.md](../EMDASH_COMPAT.md) and the Cursor skill `.cursor/skills/emdash-release/`.

Agent command: **`update to latest emdash release`**

Quick manual equivalent:

```bash
npm view emdash version
pnpm emdash:conformance
# update dev dep, CI matrix, EMDASH_COMPAT.md, README.md
# add .changeset/<slug>.md, open PR, merge when CI green
```

## Troubleshooting

### Version Packages PR not created

Release workflow may push `changeset-release/main` but fail to open the PR:

> GitHub Actions is not permitted to create or approve pull requests

**Fix (org):** Settings → Actions → General → allow workflows to create PRs.

**Workaround (manual):**

```bash
env -u GITHUB_TOKEN gh pr create --base main --head changeset-release/main \
  --title "Version Packages" --body "Version bump from changesets."
```

### Publish failed after merging Version Packages PR

1. Check [Actions → Release](https://github.com/EmPlugins/EmPost/actions/workflows/release.yml) logs.
2. Common causes:
   - Inline publish command (fixed: use `pnpm release:publish`)
   - Missing or invalid `NPM_TOKEN`
   - npm 2FA blocking non-automation token
   - **`E404` on PUT** — `NPM_TOKEN` lacks write access to `@emplugins/*` (see npm 2FA section above)
3. After fixing `NPM_TOKEN` or workflow files, re-run: Actions → Release → **Run workflow**.
4. Merge fix PR from `origin/main` if workflow files need updates.

### Local publish fallback

```bash
git fetch origin main && git checkout main && git pull origin main
pnpm install
pnpm release:publish
```

Enter npm OTP when prompted.

### Verify publish

```bash
npm view @emplugins/emdash-plugin-md-draft version
npm view @emplugins/mcp-emdash-drafts version
```

### Branch conflicts on fix PRs

Always create fix branches from current remote main:

```bash
git fetch origin main
git checkout -b fix/my-fix origin/main
```

Never stack local unpushed history onto release-fix branches.

## Related docs

- [release-checklist.md](./release-checklist.md) — pre/post release smoke
- [EMDASH_COMPAT.md](../EMDASH_COMPAT.md) — EmDash version policy
- [.changeset/README.md](../.changeset/README.md) — changeset basics
