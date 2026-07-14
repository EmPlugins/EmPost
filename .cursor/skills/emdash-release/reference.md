# EmDash release — reference

Config: [`.cursor/emdash-release.json`](../../emdash-release.json)  
Schema: [`.cursor/emdash-release.schema.json`](../../emdash-release.schema.json)

## Credentials

| Credential | Where | Used for |
|------------|-------|----------|
| **GitHub CLI** (`gh auth login`) | Your machine | Branch, PR, CI polling, `release:github`, `release:verify` |
| **`NPM_TOKEN`** | GitHub repo secret | `release.yml` npm publish |
| **`GITHUB_TOKEN`** | Automatic in Actions | Version PR creation, changelog, GitHub Release (happy path) |

### npm token (CI)

Granular Access Token with:

- **Read and write**
- **All packages** scope (avoids `E404` on publish)
- **Bypass 2FA** (avoids `EOTP` in CI)

Setup: [docs/NPM_ORG_PUBLISH.md](../../../docs/NPM_ORG_PUBLISH.md)

### GitHub CLI

```bash
env -u GITHUB_TOKEN gh auth status
env -u GITHUB_TOKEN gh pr create ...
```

## Release scripts

| Command | Purpose |
|---------|---------|
| `pnpm release:publish` | build, test, pack:check, `npm-auth-publish.mjs` |
| `pnpm release:verify` | npm versions + GitHub Release tag vs `package.json` |
| `pnpm release:github` | Create missing GitHub Release from CHANGELOG |

Publish dirs and changelog path: `.cursor/emdash-release.json` → `publish`.

`npm-auth-publish.mjs` treats npm `E403` “already published” as success (idempotent re-runs).

## Files touched on every EmDash release

| File | What changes |
|------|--------------|
| `emdash.pluginPackageJson` | `devDependencies.emdash`, possibly peer |
| `pnpm-lock.yaml` | lockfile after `pnpm install` |
| `paths.ciWorkflow` | latest `emdash_version` matrix cell |
| `paths.compatDoc` | CI-tested latest version |
| `paths.readme` | compatibility paragraph |
| `.changeset/<slug>.md` | new changeset for `publishablePackages` |

## API touchpoints

See `apiTouchpoints` in `.cursor/emdash-release.json`:

- `packages/emdash-plugin-md-draft/src/plugin.ts`
- `packages/emdash-plugin-md-draft/src/map-content-create-error.ts`
- `packages/emdash-plugin-md-draft/src/index.ts`

| API / pattern | Notes |
|---------------|-------|
| `definePlugin`, `PluginRouteError` | imports from `"emdash"` |
| `capabilities: ["content:write"]` | replaced `write:content` at 0.9.x |
| `ctx.content.create` | structured error codes |
| `ctx.content.list` | optional `where: { locale }` (0.14.x i18n) |
| `ctx.kv.set` TTL options | best-effort in `kvSetBestEffort()` |
| `ctx.input` | JSON body `{ "markdown": "..." }` |

## Conformance

```bash
pnpm emdash:conformance          # reads .cursor/emdash-release.json via jq
pnpm emdash:conformance 1.2.3   # test a specific version
```

## Changeset policy

Linked packages in `.changeset/config.json` — same semver bump. Highest pending bump wins. Clear stale `.changeset/*.md` before compat-only releases.

| Outcome | Bump |
|---------|------|
| Conforming | patch |
| API fixes, peer unchanged | minor |
| Peer floor raised | major |

## Publish outcomes

### Happy path

Version Packages merge → changesets consume + publish in one Release run → npm + GitHub Release `v*`.

### Delayed publish (2.0.0 lesson)

Version Packages merged while `NPM_TOKEN` invalid. Versions on `main`, changesets consumed, npm empty. Later fix merges → Release logs “No changesets found”, publishes npm, **skips** GitHub Release.

Recovery: `pnpm release:github` → `pnpm release:verify`.

### Re-run after npm published

Manual `workflow_dispatch` may fail E403. Check `pnpm release:verify` — do not assume red workflow = unpublished.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Version Packages PR not created | `gh pr create --head changeset-release/main` |
| `EOTP` / `E404` on publish | Fix `NPM_TOKEN` per NPM_ORG_PUBLISH.md |
| npm OK, no GitHub Release | `pnpm release:github` |
| Latest Release run red, E403 | npm likely done — `pnpm release:verify` |
| Unexpected major bump | Stale major changeset pending |
| Fix PR conflicts | Recreate from `origin/main` |

Full guide: [docs/maintainer-release.md](../../../docs/maintainer-release.md)  
Checklist: [docs/release-checklist.md](../../../docs/release-checklist.md)  
Semver policy: [docs/RELEASES.md](../../../docs/RELEASES.md)
