# Release checklist

Use before merging the **Version Packages** PR and after npm publish.

## Before merge (Version Packages PR)

- [ ] Review **all consumed changesets** — check `.changeset/` deletions in the PR diff; no stale `major`/`minor` files you did not intend to ship.
- [ ] Version bump matches intent (patch compat vs major peer raise).
- [ ] `pnpm build` and `pnpm test` pass locally and in CI.
- [ ] `pnpm pack:check` shows only intended files in tarballs.
- [ ] README compatibility note: **EmDash 0.14.x+** (`emdash >=0.14.0`); ingest body is JSON `{ "markdown" }` (see operator runbook).
- [ ] `@emplugins/emdash-plugin-md-draft` peer range for `emdash` still correct.
- [ ] `NPM_TOKEN` repo secret is set (granular token: **All packages** write + **Bypass 2FA**). See [NPM_ORG_PUBLISH.md](./NPM_ORG_PUBLISH.md).

## After merge (publish verification)

Run:

```bash
pnpm release:verify
```

Checklist:

- [ ] [Release workflow](https://github.com/EmPlugins/EmPost/actions/workflows/release.yml) — if the **latest** run is red, check whether an **earlier** run on the same merge already published (E403 “already published” on re-run is OK).
- [ ] `npm view @emplugins/emdash-plugin-md-draft version` shows the new version.
- [ ] `npm view @emplugins/mcp-emdash-drafts version` shows the same linked version.
- [ ] GitHub Release `v<version>` exists.

If npm is correct but GitHub Release is missing (delayed publish — see [maintainer-release.md](./maintainer-release.md)):

```bash
pnpm release:github
pnpm release:verify
```

## Optional smoke (staging)

- [ ] Smoke on **emdash@0.14.x**: health, default ingest, optional `locale` / `translationOf` ingest, MCP `validate_markdown` + `ingest_markdown`.
- [ ] Smoke: install plugin in a minimal EmDash app; run MCP via `npx` against staging.
- [ ] Update compatibility notes in package READMEs if EmDash API changed.
