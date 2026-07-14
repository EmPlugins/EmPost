---
name: emdash-release
description: >-
  Orchestrates an on-demand EmDash compatibility upgrade for EmPost: discover the
  latest emdash release, bump dev deps and CI matrix, run conformance checks,
  open and auto-merge the compatibility PR, then stop at the Version Packages PR
  for user approval before npm publish. Use when the user says "update to latest
  emdash release", "emdash compatibility release", or "emdash conformance check".
---

# EmDash release workflow

> **Prefer the personal skill:** `~/.cursor/skills/emdash-plugin-release/` reads [`.cursor/emdash-release.json`](../emdash-release.json). This project skill is a legacy copy; keep in sync or remove once the personal skill is verified.

Execute every step below.

## Prerequisites

Before starting, verify:

```bash
env -u GITHUB_TOKEN gh auth status   # unset GITHUB_TOKEN if it overrides keyring auth
pnpm --version
git remote get-url origin   # must be EmPlugins/EmPost
```

If `gh` is not authenticated, stop and tell the user to run `gh auth login` (or `env -u GITHUB_TOKEN gh auth login`).

Read [reference.md](reference.md) for API touchpoints, file checklist, credentials, and troubleshooting.

### Before step 1: changeset hygiene

List pending changesets:

```bash
ls .changeset/*.md
```

Warn the user if stale files exist. Multiple pending changesets combine on the Version Packages PR; the **highest** bump wins (e.g. patch + major → major). Remove or ship stale files before proceeding if the user wants a patch-only compat release.

## Definitions

- **Conforming**: `pnpm emdash:conformance` exits 0 with no plugin code changes beyond version/docs bumps. Ship a **patch** changeset.
- **Non-conforming**: conformance fails due to `emdash` / `emdash/astro` API changes. Fix code, adjust peer range if needed, ship **minor** (peer unchanged) or **major** (peer floor raised) changeset.

Minimum supported EmDash peer floor: **`0.14.0`** (do not lower).

## Workflow

Copy this checklist and track progress:

```
- [ ] Discover latest emdash version
- [ ] Create branch and bump versions
- [ ] Run conformance
- [ ] Add changeset and open PR
- [ ] Wait for CI and auto-merge compatibility PR
- [ ] Report Version Packages PR and STOP
```

### 1. Discover

```bash
npm view emdash version
```

Compare to the latest matrix entry in `.github/workflows/ci.yml` (second `emdash_version` value). If already current, report "already on emdash@X" and stop.

### 2. Branch and bump

```bash
git fetch origin main
git checkout -B emdash/<version>-compat origin/main
```

Always branch from **`origin/main`**, not a diverged local `main`. Never include unrelated local commits in compat or fix PRs.

Update these files for `<version>`:

| File | Change |
|------|--------|
| `packages/emdash-plugin-md-draft/package.json` | `devDependencies.emdash` → `^<version>` |
| `pnpm-lock.yaml` | `pnpm install` |
| `.github/workflows/ci.yml` | replace latest matrix cell (keep `0.14.0`) |
| `EMDASH_COMPAT.md` | CI-tested latest version |
| `README.md` | compatibility line (`0.14.0` and `<version>`) |

### 3. Conformance

```bash
pnpm emdash:conformance
```

**If exit 0 (conforming)** → proceed to step 4 with a **patch** changeset.

**If exit 1 (non-conforming)** → diagnose failures using [reference.md](reference.md) API touchpoints. Fix `packages/emdash-plugin-md-draft/src/`, tests, and peer range if needed. Re-run `pnpm emdash:conformance` until green. Then proceed with **minor** or **major** changeset as appropriate.

### 4. Changeset and PR

Create a changeset file under `.changeset/` (do not use interactive `pnpm changeset`):

```markdown
---
"@emplugins/emdash-plugin-md-draft": patch
"@emplugins/mcp-emdash-drafts": patch
---

Test against EmDash <version>. [Add API fix notes if non-conforming.]
```

Adjust bump type (`patch` / `minor` / `major`) for both linked packages per `.changeset/config.json`.

Commit all changes, push, and open a PR:

```bash
git add -A
git commit -m "chore: test against emdash@<version>"
git push -u origin HEAD
gh pr create --title "chore: emdash@<version> compatibility" --body "..."
```

### 5. CI and auto-merge

Poll until CI is green:

```bash
env -u GITHUB_TOKEN gh pr checks --watch
```

When green, auto-merge the **compatibility PR only**:

```bash
env -u GITHUB_TOKEN gh pr merge --squash --auto
```

If auto-merge fails (branch protection, reviews required), report the PR URL and stop. Do not force-merge.

### 6. Publish gate — STOP HERE

After the compatibility PR merges, `changesets/action` on `main` opens a **Version Packages** PR (or pushes `changeset-release/main`).

Poll for it:

```bash
env -u GITHUB_TOKEN gh pr list --search "Version Packages" --state open
```

If no PR exists but Release workflow pushed `changeset-release/main`, create it manually:

```bash
env -u GITHUB_TOKEN gh pr create --base main --head changeset-release/main \
  --title "Version Packages" --body "Version bump from changesets."
```

Report to the user:

- Version Packages PR URL
- Summary of changes (conforming vs non-conforming, bump type, **all consumed changesets**)
- Checklist from `docs/release-checklist.md`
- Link to `docs/maintainer-release.md` if Release workflow failed

**Do not merge the Version Packages PR.** Publishing uses `pnpm release:publish` via `release.yml` and the `NPM_TOKEN` repo secret.

If publish fails after the user merges Version Packages, open a **minimal fix PR from `origin/main`** (typically `package.json` + `release.yml` only). See `docs/maintainer-release.md`.

## Hard rules

1. Never merge the Version Packages PR — user approval required for publish.
2. Never skip `pnpm emdash:conformance` before opening the compatibility PR.
3. Always update CI matrix, `EMDASH_COMPAT.md`, and `README.md` together with the dev dep bump.
4. Linked publishable packages must share the same changeset bump type.
5. Branch from `origin/main` only; never push diverged local history into compat or fix PRs.
6. Use `env -u GITHUB_TOKEN` for all `gh` commands when the env var overrides keyring auth.
