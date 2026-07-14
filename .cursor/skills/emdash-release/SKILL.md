---
name: emdash-release
description: >-
  Orchestrates an on-demand EmDash compatibility upgrade for EmPost: discover the
  latest emdash release, bump dev deps and CI matrix, run conformance checks,
  open and auto-merge the compatibility PR, then stop at the Version Packages PR
  for user approval before npm publish. After the user merges Version Packages,
  guide verify/recovery (release:verify, release:github). Use when the user says
  "update to latest emdash release", "emdash compatibility release", "emdash
  conformance check", or asks about publish verification / GitHub releases.
---

# EmDash release workflow

Execute every step below. Do not only advise — run commands, edit files, open PRs, and merge when allowed.

## 0. Load config

Read [`.cursor/emdash-release.json`](../../emdash-release.json) for repo slug, publishable packages, paths, and approval gates.

## Prerequisites

Before starting, verify:

```bash
env -u GITHUB_TOKEN gh auth status
pnpm --version
git remote get-url origin   # must match repo.github in config
```

If `gh` is not authenticated, stop and tell the user to run `gh auth login`.

Read [reference.md](reference.md) for API touchpoints, release scripts, credentials, and troubleshooting.

### Before step 1: changeset hygiene

```bash
ls .changeset/*.md
```

Warn if stale files exist. Multiple pending changesets combine on the Version Packages PR; the **highest** bump wins. Remove or ship stale files before a patch-only compat release.

## Definitions

- **Conforming**: `pnpm emdash:conformance` exits 0 with no plugin code changes beyond version/docs bumps. Ship a **patch** changeset.
- **Non-conforming**: conformance fails due to `emdash` / `emdash/astro` API changes. Fix code, adjust peer range if needed, ship **minor** or **major** changeset.

Minimum supported EmDash peer floor: **`0.14.0`** (from config; do not lower).

## Workflow

```
- [ ] Load .cursor/emdash-release.json
- [ ] Discover latest emdash version
- [ ] Create branch and bump versions
- [ ] Run conformance
- [ ] Add changeset and open PR
- [ ] Wait for CI and auto-merge compatibility PR
- [ ] Report Version Packages PR and STOP
- [ ] (After user merges Version Packages) Verify publish / recover GitHub Release
```

### 1. Discover

```bash
npm view emdash version
```

Compare to the latest matrix entry in `paths.ciWorkflow`. If already current, report "already on emdash@X" and stop.

### 2. Branch and bump

```bash
git fetch origin main
git checkout -B emdash/<version>-compat origin/main
```

Always branch from **`origin/main`**. Update for `<version>`:

| File | Change |
|------|--------|
| `emdash.pluginPackageJson` | `devDependencies.emdash` → `^<version>` |
| `pnpm-lock.yaml` | `pnpm install` |
| `paths.ciWorkflow` | replace latest matrix cell (keep min peer) |
| `paths.compatDoc` | CI-tested latest version |
| `paths.readme` | compatibility line |

### 3. Conformance

```bash
pnpm emdash:conformance
```

**Conforming** → **patch** changeset. **Non-conforming** → fix `paths.pluginSourceDir` / `apiTouchpoints`, re-run until green, then **minor** or **major**.

### 4. Changeset and PR

Create `.changeset/emdash-<version>-compat.md` with every package in `publishablePackages` at the same bump type.

```bash
git add -A
git commit -m "chore: test against emdash@<version>"
git push -u origin HEAD
env -u GITHUB_TOKEN gh pr create --title "chore: emdash@<version> compatibility" --body "..."
```

### 5. CI and auto-merge

```bash
env -u GITHUB_TOKEN gh pr checks --watch
env -u GITHUB_TOKEN gh pr merge --squash --auto   # if approval.autoMergeCompatPr
```

### 6. Publish gate — STOP HERE

```bash
env -u GITHUB_TOKEN gh pr list --search "Version Packages" --state open
```

If missing:

```bash
env -u GITHUB_TOKEN gh pr create --base main --head changeset-release/main \
  --title "Version Packages" --body "Version bump from changesets."
```

Report to the user:

- Version Packages PR URL
- Summary (conforming vs non-conforming, bump type, consumed changesets)
- Checklist from `paths.releaseChecklist`
- Reminder: merge Version Packages → Release workflow publishes; then run verification (step 7)

**Do not merge the Version Packages PR** unless the user explicitly asks.

### 7. After user merges Version Packages — verify / recover

Run when the user says they merged Version Packages, publish failed, or “nothing published”:

```bash
git fetch origin main && git checkout main && git pull origin main
pnpm release:verify
```

Interpret results:

| `release:verify` | Meaning | Action |
|----------------|---------|--------|
| Exit 0 | npm + GitHub Release OK | Done |
| npm OK, GitHub missing | Delayed publish (changesets consumed earlier) | `pnpm release:github` then `pnpm release:verify` |
| npm missing | `NPM_TOKEN` or workflow issue | Check [Actions → Release](https://github.com/EmPlugins/EmPost/actions/workflows/release.yml); fix token per `docs/NPM_ORG_PUBLISH.md`; merge minimal fix from `origin/main` if needed |

**Important:** A **red** latest Release run may still mean npm published on an **earlier** run (E403 “already published” on re-run). Always check `pnpm release:verify` and npm versions — do not only read the latest workflow status.

If publish workflow still needed after token fix, the next **merge to main** (not necessarily manual `workflow_dispatch`) triggers Release. `npm-auth-publish.mjs` skips versions already on npm.

If publish fix PR needed, branch from `origin/main` only — see `docs/maintainer-release.md`.

## Hard rules

1. Never merge the Version Packages PR unless the user explicitly requests it.
2. Never skip `pnpm emdash:conformance` before opening the compatibility PR.
3. Always update CI matrix, compat doc, and README together with the dev dep bump.
4. All `publishablePackages` share the same changeset bump type.
5. Branch from `origin/main` only.
6. Use `env -u GITHUB_TOKEN` for all `gh` commands when the env var overrides keyring auth.
7. After Version Packages merge, always run `pnpm release:verify` before concluding publish failed.
