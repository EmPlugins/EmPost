# EmDash release — reference

## Credentials

| Credential | Where | Used for |
|------------|-------|----------|
| **GitHub CLI** (`gh auth login`) | Your machine | Branch, PR, CI polling, auto-merge compatibility PR |
| **`NPM_TOKEN`** | GitHub repo secret on `EmPlugins/EmPost` | `release.yml` npm publish (after you merge Version Packages PR) |
| **`GITHUB_TOKEN`** | Automatic in Actions | Version PR creation, changelog, GitHub Release |

**Not required:** local npm token, EmDash site HMAC secrets (only for optional post-publish smoke).

### One-time npm token setup

1. npmjs.com → Access Tokens → Granular Access Token (or automation token)
2. Publish scope: `@emplugins/emdash-plugin-md-draft`, `@emplugins/mcp-emdash-drafts`
3. Add as GitHub secret `NPM_TOKEN` on `EmPlugins/EmPost`

### Auto-merge prerequisites

Your GitHub user needs write + merge on `EmPlugins/EmPost`. Branch protection may block auto-merge — report the PR URL if merge fails.

## Files touched on every EmDash release

| File | What changes |
|------|--------------|
| `packages/emdash-plugin-md-draft/package.json` | `devDependencies.emdash`, possibly `peerDependencies.emdash` |
| `pnpm-lock.yaml` | lockfile after `pnpm install` |
| `.github/workflows/ci.yml` | latest `emdash_version` matrix cell |
| `EMDASH_COMPAT.md` | CI-tested latest version |
| `README.md` | compatibility paragraph |
| `.changeset/<slug>.md` | new changeset for linked packages |

## API touchpoints (likely break on upstream releases)

Primary sources:

- `packages/emdash-plugin-md-draft/src/plugin.ts`
- `packages/emdash-plugin-md-draft/src/map-content-create-error.ts`
- `packages/emdash-plugin-md-draft/src/index.ts`

| API / pattern | Notes |
|---------------|-------|
| `definePlugin`, `PluginRouteError`, `PluginDescriptor` | imports from `"emdash"` |
| `capabilities: ["content:write"]` | replaced deprecated `write:content` at 0.9.x |
| `ctx.content.create` | structured error codes: `VALIDATION_ERROR`, `SLUG_CONFLICT`, `CONFLICT`, `NOT_FOUND` |
| `ctx.content.list` | optional `where: { locale }` (0.14.x i18n) |
| `ctx.kv.set` TTL options | `ttlMs`, `expirationTtlMs`, `expireInMs`, `expiresInMs` — best-effort in `kvSetBestEffort()` |
| `ctx.input` | JSON body pre-parsed by EmDash host; ingest expects `{ "markdown": "..." }` |
| `emdash/astro` registration | consumer-facing; check examples if Astro integration API changes |

## Conformance script

```bash
pnpm emdash:conformance          # uses npm latest
pnpm emdash:conformance 1.2.3   # test a specific version
```

Runs build, test, and pack:check at minimum peer `0.14.0` and the target latest version. Mirrors `.github/workflows/ci.yml` matrix locally.

## Changeset policy

Publishable packages are **linked** in `.changeset/config.json`:

- `@emplugins/emdash-plugin-md-draft`
- `@emplugins/mcp-emdash-drafts`

Both get the same semver bump on each release. `@emplugins/shared` is private — do not include unless shared internals changed in a release-worthy way.

| Outcome | Bump |
|---------|------|
| Conforming (version bump only) | patch |
| API fixes, peer unchanged | minor |
| Peer floor raised | major |

## Post-publish checklist

After the user merges the Version Packages PR, point them to `docs/release-checklist.md` for optional smoke on a staging EmDash site.
