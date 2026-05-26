# Operator runbook

## Prerequisites

- EmDash **0.14.x or later** site with the `posts` collection (default Markdown → Portable Text field `content`).
- Ability to add a **native** plugin to `astro.config` (`plugins: []`).

Site-wide secrets: installs typically get an **`EMDASH_ENCRYPTION_KEY`** in `.dev.vars` / `.env` (or generate one with `emdash secrets generate`). **`EMDASH_AUTH_SECRET`** is legacy as an IP-salt fallback for upgrades from older EmDash—new installs do not need it for EmPost.

## Install plugin

```bash
pnpm add @emplugins/emdash-plugin-md-draft
```

Register `empostMdDraftPlugin()` per the [plugin README](../packages/emdash-plugin-md-draft/README.md).

Deploy or restart the site so the plugin loads.

## Configure secrets

1. Open `/_emdash/admin`.
2. Find **empost-md-draft** plugin settings.
3. Set **HMAC signing secret** (≥ 16 characters; generate with `openssl rand -hex 32`).
4. Confirm **Expected key id** matches what clients send (`default` unless you changed it).
5. Tune rate limits and payload caps if needed.

## Ingest URL

Give authors the full ingest URL (must match what clients put in `EMDASH_INGEST_URL`):

`https://<your-domain>/_emdash/api/plugins/empost-md-draft/ingest`

Health check:

`https://<your-domain>/_emdash/api/plugins/empost-md-draft/health`

## JSON body and HMAC

Because EmDash’s plugin route host reads **JSON** before invoking the handler, clients must send:

```http
POST /_emdash/api/plugins/empost-md-draft/ingest
Content-Type: application/json
Authorization: HMAC-SHA256 keyId=default, ts=<unix>, nonce=<uuid>, signature=<hex>
Idempotency-Key: <optional>

{"markdown":"---\ntitle: \"Post\"\n---\n\nBody"}
```

The HMAC covers `sha256(utf8(JSON.stringify({markdown})))` after the same validation the plugin applies (see `@emplugins/shared`).

## Multilingual ingest (optional)

When i18n is enabled on the site, authors may set locale in the markdown frontmatter:

```yaml
---
title: "Bonjour"
locale: fr
translationOf: 01JXXXXXXXXXXXXXXX
---
```

`translationOf` must be the id of an existing entry; `locale` is required when `translationOf` is set. Omit both for the site default locale. Slug de-duplication is scoped per locale.

## Rotate secret

1. Set a new **HMAC signing secret** in admin.
2. Update all MCP / automation env vars (`EMDASH_HMAC_SECRET`) to match.
3. Old signatures fail immediately — coordinate the cutover.

## Edge / WAF (optional)

- Rate-limit `/_emdash/api/plugins/empost-md-draft/ingest` at your CDN.
- Require TLS; block anonymous geographies if appropriate.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| 503 NOT_CONFIGURED | Signing secret missing or too short in admin. |
| 401 | Clock skew, wrong secret, bad `keyId`, reused nonce, or signature/path mismatch. |
| 403 Rate limited / quota | Per-IP or per-key limits in plugin settings. |
| 400 `VALIDATION_ERROR` / `CREATE_FAILED` / `NOT_FOUND` | EmDash rejected the payload (required fields, invalid SEO on this collection, bad `translationOf` id, invalid `seo.image` on strict image fields, etc.). Response includes structured `details` when provided by EmDash. |
| 409 `SLUG_CONFLICT` / `CONFLICT` | Slug already in use or other conflict from EmDash. |
