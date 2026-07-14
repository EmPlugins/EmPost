# Maintainer release guide

How EmPost versions and publishes `@emplugins/*` packages, including lessons from the emdash@0.29.0 / **2.0.0** release (2026).

## Per-repo config

[`.cursor/emdash-release.json`](../.cursor/emdash-release.json) drives the Cursor skill and release scripts (`publish.packageDirs`, GitHub release recovery). Schema: [`.cursor/emdash-release.schema.json`](../.cursor/emdash-release.schema.json).

Multi-repo personal skill: `~/.cursor/skills/emdash-plugin-release/` (reads the same config file in each repo).

## Overview

| Step | What happens |
|------|----------------|
| 1. Changeset on a PR | Describe bump type in `.changeset/<slug>.md` |
| 2. Merge to `main` | Release workflow runs `changesets/action` |
| 3. Version Packages PR | Bumps versions + changelogs; **you merge** to approve publish |
| 4. Publish | `release.yml` runs `pnpm release:publish` → npm (+ GitHub Release when changesets consume in the same run) |

Publishable packages are **linked** (same semver): `@emplugins/emdash-plugin-md-draft`, `@emplugins/mcp-emdash-drafts`.

## Prerequisites

| Credential | Where | Notes |
|------------|-------|-------|
| `NPM_TOKEN` | GitHub repo secret | Granular token: **All packages** write + **Bypass 2FA** |
| `gh auth login` | Your machine | PRs, verification, `pnpm release:github` |
| Org: Actions create PRs | GitHub org/repo settings | Automatic Version Packages PRs |

Full token setup: [NPM_ORG_PUBLISH.md](./NPM_ORG_PUBLISH.md).

### GitHub CLI and `GITHUB_TOKEN`

```bash
env -u GITHUB_TOKEN gh auth status
env -u GITHUB_TOKEN gh pr create ...
```

### npm 2FA

- **CI publish** uses `NPM_TOKEN` (automation/granular with bypass) — no OTP.
- **Local publish** (`pnpm release:publish`) prompts for OTP when your npm account has 2FA. Prefer CI for routine releases.

## Release scripts

| Script | Purpose |
|--------|---------|
| `pnpm release:publish` | build, test, pack:check, `npm-auth-publish.mjs` (CI + local) |
| `pnpm release:verify` | npm versions + GitHub Release tag match `package.json` |
| `pnpm release:github` | Create missing GitHub Release from CHANGELOG (recovery) |

Config for publish dirs and changelog path: `.cursor/emdash-release.json` → `publish`.

## Two publish outcomes (important)

### A. Happy path

Version Packages PR merges → Release workflow consumes changesets **and** publishes in one run → npm **and** GitHub Release `v*`.

### B. Delayed npm publish (2.0.0 lesson)

Version Packages PR merged while `NPM_TOKEN` was invalid (`EOTP`). Changesets were **already consumed** (versions bumped on `main`), but npm publish failed.

Later, when auth is fixed, the next Release run logs:

```text
No changesets found. Attempting to publish any unpublished packages to npm
```

That fallback **publishes to npm** but **does not** create a GitHub Release. This happened when the publish-fix PR (#6) merged — npm went to 2.0.0, but no `v2.0.0` on GitHub.

**Recovery:**

```bash
pnpm release:verify          # npm OK, github missing
pnpm release:github          # creates v2.0.0 from CHANGELOG
```

Or manually:

```bash
env -u GITHUB_TOKEN gh release create v2.0.0 --repo EmPlugins/EmPost \
  --title v2.0.0 --notes-file packages/emdash-plugin-md-draft/CHANGELOG.md
```

### Re-running Release after npm already published

Manual `gh workflow run release.yml` may fail with:

```text
403 Forbidden - You cannot publish over the previously published versions: X.Y.Z
```

That means **npm is already done** — not a regression. `npm-auth-publish.mjs` now treats this as success on re-runs. Check npm first:

```bash
pnpm release:verify
```

Do **not** assume a red Release run means nothing published — check registry versions and which workflow run succeeded.

## Release workflow details

Config: [`.github/workflows/release.yml`](../.github/workflows/release.yml)

```yaml
publish: pnpm release:publish   # do NOT use inline && in changesets/action
```

`changesets/action` misparses inline shell chains. Always use the `release:publish` script.

### CI pnpm setup

Do **not** set `version: 9` on `pnpm/action-setup` when `package.json` has `"packageManager": "pnpm@9.15.4"`. Let `packageManager` drive the version.

## Changeset hygiene

```bash
ls .changeset/*.md
```

`changeset version` consumes **all** pending files on the Version Packages PR. With linked packages, the **highest** bump wins (patch + major → **major**).

Clear stale `.changeset/*.md` before a compat-only patch release.

## EmDash compatibility upgrades

See [EMDASH_COMPAT.md](../EMDASH_COMPAT.md) and `.cursor/skills/emdash-release/`.

Agent command: **`update to latest emdash release`**

## Troubleshooting

| Symptom | Action |
|---------|--------|
| `EOTP` on publish | Recreate `NPM_TOKEN` with **Bypass 2FA** — [NPM_ORG_PUBLISH.md](./NPM_ORG_PUBLISH.md) |
| `E404` on PUT | Token needs **All packages** write scope |
| Version Packages PR not created | `gh pr create --head changeset-release/main` |
| npm published, no GitHub Release | `pnpm release:github` |
| Re-run fails E403 “already published” | npm is done; run `pnpm release:verify` |
| Unexpected major bump | Stale major changeset was pending |

### Version Packages PR not created

```bash
env -u GITHUB_TOKEN gh pr create --base main --head changeset-release/main \
  --title "Version Packages" --body "Version bump from changesets."
```

### Local publish fallback

```bash
git fetch origin main && git checkout main && git pull origin main
pnpm install
pnpm release:publish
```

### Verify publish

```bash
pnpm release:verify
npm view @emplugins/emdash-plugin-md-draft version
npm view @emplugins/mcp-emdash-drafts version
env -u GITHUB_TOKEN gh release list --repo EmPlugins/EmPost --limit 5
```

## Related docs

- [RELEASES.md](./RELEASES.md) — semver policy and release commands
- [release-checklist.md](./release-checklist.md) — pre/post merge checklist
- [NPM_ORG_PUBLISH.md](./NPM_ORG_PUBLISH.md) — npm token setup
- [EMDASH_COMPAT.md](../EMDASH_COMPAT.md) — EmDash version policy
- [.changeset/README.md](../.changeset/README.md) — changeset basics
