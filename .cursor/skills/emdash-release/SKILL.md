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

Execute every step below. Do not only advise — run commands, edit files, open PRs, and merge when allowed.

## Prerequisites

Before starting, verify:

```bash
gh auth status
pnpm --version
git remote get-url origin   # must be EmPlugins/EmPost
```

If `gh` is not authenticated, stop and tell the user to run `gh auth login`.

Read [reference.md](reference.md) for API touchpoints, file checklist, and credentials.

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
git checkout main && git pull origin main
git checkout -b emdash/<version>-compat
```

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
gh pr checks --watch
```

When green, auto-merge the **compatibility PR only**:

```bash
gh pr merge --squash --auto
```

If auto-merge fails (branch protection, reviews required), report the PR URL and stop. Do not force-merge.

### 6. Publish gate — STOP HERE

After the compatibility PR merges, `changesets/action` on `main` opens a **Version Packages** PR.

Poll for it:

```bash
gh pr list --search "Version Packages" --state open
```

Report to the user:

- Version Packages PR URL
- Summary of changes (conforming vs non-conforming, bump type)
- Checklist from `docs/release-checklist.md`

**Do not merge the Version Packages PR.** Publishing to npm happens only when the user merges it; `release.yml` then runs build, test, pack:check, and `pnpm publish -r --access public` using the `NPM_TOKEN` repo secret.

## Hard rules

1. Never merge the Version Packages PR — user approval required for publish.
2. Never skip `pnpm emdash:conformance` before opening the compatibility PR.
3. Always update CI matrix, `EMDASH_COMPAT.md`, and `README.md` together with the dev dep bump.
4. Linked publishable packages must share the same changeset bump type.
