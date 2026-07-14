# Release checklist

Use before merging the **Version Packages** PR and after npm publish.

## Before merge (Version Packages PR)

- [ ] Review **all consumed changesets** — check `.changeset/` deletions in the PR diff; no stale `major`/`minor` files you did not intend to ship.
- [ ] Version bump matches intent (patch compat vs major peer raise).
- [ ] `pnpm build` and `pnpm test` pass locally and in CI.
- [ ] `pnpm pack:check` shows only intended files in tarballs.
- [ ] README compatibility note: **EmDash 0.14.x+** (`emdash >=0.14.0`); ingest body is JSON `{ "markdown" }` (see operator runbook).
- [ ] `@emplugins/emdash-plugin-md-draft` peer range for `emdash` still correct.
- [ ] `NPM_TOKEN` repo secret is set (automation/granular token with 2FA bypass).

## After merge (publish verification)

- [ ] [Release workflow](https://github.com/EmPlugins/EmPost/actions/workflows/release.yml) completed successfully.
- [ ] `npm view @emplugins/emdash-plugin-md-draft version` shows the new version.
- [ ] `npm view @emplugins/mcp-emdash-drafts version` shows the same linked version.
- [ ] GitHub Release created (if `createGithubReleases` is enabled).

If publish failed, see [maintainer-release.md](./maintainer-release.md) troubleshooting.

## Optional smoke (staging)

- [ ] Smoke on **emdash@0.14.x**: health, default ingest, optional `locale` / `translationOf` ingest, MCP `validate_markdown` + `ingest_markdown`.
- [ ] Smoke: install plugin in a minimal EmDash app; run MCP via `npx` against staging.
- [ ] Update compatibility notes in package READMEs if EmDash API changed.
