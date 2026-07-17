# `@emplugins/emdash-plugin-md-draft`

> **Deprecated — unmaintained.** This package is no longer supported. Use [EmDash’s built-in MCP server](https://docs.emdashcms.com/guides/ai-tools/) instead.  
> Migration guide: [EmPost README — Migration to EmDash MCP](https://github.com/EmPlugins/EmPost#migration-to-emdash-mcp)

---

EmDash **native** plugin that exposed authenticated HTTP routes to create **`posts` drafts** from Markdown (via the `@emplugins/mcp-emdash-drafts` MCP server or any HMAC-aware client).

**Do not install on new sites.** Remove this plugin if it is already installed.

## Uninstall

1. Remove `empostMdDraftPlugin()` from `astro.config.mjs` (`emdash({ plugins: [...] })`).
2. Run `pnpm remove @emplugins/emdash-plugin-md-draft` (or your package manager equivalent).
3. Redeploy.

## Replacement

Connect AI tools to your site’s built-in MCP endpoint:

```
https://YOUR_SITE/_emdash/api/mcp
```

Documentation: [AI Tools](https://docs.emdashcms.com/guides/ai-tools/) · [MCP Server Reference](https://docs.emdashcms.com/reference/mcp-server/)

---

<details>
<summary>Original documentation (archived)</summary>

Peer: **`emdash` `>=0.14.0`**.

### Register (Astro)

```ts
import { defineConfig } from "astro/config";
import { emdash } from "emdash/astro";
import { empostMdDraftPlugin } from "@emplugins/emdash-plugin-md-draft";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [empostMdDraftPlugin()],
		}),
	],
});
```

This package used **`format: "native"`** so it could ship an admin **settings schema** (HMAC secret, quotas, payload limits). Native plugins had to be listed under `plugins: []` (not `sandboxed: []`).

### HTTP routes

| Route key | Method | Purpose |
|-----------|--------|---------|
| `health` | GET | Liveness (`public`) |
| `ingest` | POST | Create draft (`public`, HMAC-gated) |

Typical URLs:

- `GET /_emdash/api/plugins/empost-md-draft/health`
- `POST /_emdash/api/plugins/empost-md-draft/ingest`

</details>
