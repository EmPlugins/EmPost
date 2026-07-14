# Publishing EmPost under the emplugins npm org

EmPost publishes **`@emplugins/emdash-plugin-md-draft`** and **`@emplugins/mcp-emdash-drafts`** (linked semver) to the [emplugins](https://www.npmjs.com/org/emplugins) organization.

Same policy as [EmPrivacy](https://github.com/EmPlugins/EmPrivacy) — see [EmPrivacy/docs/NPM_ORG_PUBLISH.md](https://github.com/EmPlugins/EmPrivacy/blob/main/docs/NPM_ORG_PUBLISH.md) for the full npm token walkthrough.

## One-time npm token

1. Sign in as a member of [emplugins](https://www.npmjs.com/org/emplugins) with publish rights.
2. [Access Tokens](https://www.npmjs.com/settings/~/tokens) → **Granular Access Token**:
   - **Packages and scopes**: **Read and write**
   - **All packages** (not only existing packages — avoids misleading `404` on publish)
   - **Bypass two-factor authentication**: **checked** (required for CI; npm warns — expected)
3. Copy the token once.

Verify locally:

```bash
NPM_CONFIG_TOKEN='paste-token' npm whoami --registry=https://registry.npmjs.org
npm access list packages @emplugins
```

Expect `read-write` on both publishable packages.

## One-time GitHub setup (EmPlugins/EmPost)

1. Repo → **Settings** → **Secrets and variables** → **Actions** → `NPM_TOKEN`
2. CLI:

```bash
env -u GITHUB_TOKEN gh secret set NPM_TOKEN --repo EmPlugins/EmPost
```

3. (Recommended) Allow GitHub Actions to **create and approve pull requests** (Changesets Version Packages PRs).
4. Do **not** create a custom `GITHUB_TOKEN` secret.

## Publish flow

1. Compatibility PR merges with a changeset → Release opens **Version Packages** PR (or create manually from `changeset-release/main` if org blocks Actions PRs).
2. Merge Version Packages PR → [Release workflow](https://github.com/EmPlugins/EmPost/actions/workflows/release.yml) runs `pnpm release:publish` → npm + GitHub Release.

Manual re-run after fixing `NPM_TOKEN`:

```bash
env -u GITHUB_TOKEN gh workflow run release.yml --ref main --repo EmPlugins/EmPost
```

## Verify

```bash
npm view @emplugins/emdash-plugin-md-draft version
npm view @emplugins/mcp-emdash-drafts version
env -u GITHUB_TOKEN gh release list --repo EmPlugins/EmPost --limit 5
```

## Common CI errors

| Error | Fix |
|-------|-----|
| `EOTP` | Token lacks **Bypass 2FA** — create new granular token |
| `404` on PUT | Token lacks **All packages** write scope or wrong org membership |
| Publish command parses `&&` into build | Use `pnpm release:publish` only in `release.yml` |
| No Version Packages PR | Enable Actions PR creation or `gh pr create --head changeset-release/main` |

Publish uses [`scripts/npm-auth-publish.mjs`](../scripts/npm-auth-publish.mjs) (explicit `.npmrc` + `npm publish` per package), matching EmPrivacy's CI pattern.
