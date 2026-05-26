# Release checklist

- [ ] `pnpm build` and `pnpm test` pass locally and in CI.
- [ ] `pnpm pack:check` shows only intended files in tarballs.
- [ ] Version bumps via Changesets (or manual SemVer) for publishable packages.
- [ ] README compatibility note: **EmDash 0.14.x+** (`emdash >=0.14.0`); ingest body is JSON `{ "markdown" }` (see operator runbook).
- [ ] Smoke on **emdash@0.14.x**: health, default ingest, optional `locale` / `translationOf` ingest, MCP `validate_markdown` + `ingest_markdown`.
- [ ] `@emplugins/emdash-plugin-md-draft` peer range for `emdash` still correct.
- [ ] Smoke: install plugin in a minimal EmDash app; run MCP via `npx` against staging.
- [ ] Update compatibility notes in package READMEs if EmDash API changed.
- [ ] Tag release as **`vX.Y.Z`** and publish to npm (scoped `@emplugins/*`).
