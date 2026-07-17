![EmPost Logo](/artwork/logo/EmPost.png)

# EmPost

> **Project sunset — no longer maintained (July 2026)**  
> EmPost is **archived**. Use [EmDash’s built-in MCP server](https://docs.emdashcms.com/guides/ai-tools/) instead. See [Migration](#migration-to-emdash-mcp) below.

Markdown-first **draft ingestion** for [EmDash](https://emdashcms.com): an npm-installable plugin plus an MCP server so **Cursor** and **Goose** could create `posts` drafts without publishing.

**Source:** [https://github.com/EmPlugins/EmPost](https://github.com/EmPlugins/EmPost)

---

## Why this project is shutting down

EmPost was created before EmDash shipped first-class agent tooling. EmDash now includes:

- A **built-in MCP server** at `/_emdash/api/mcp` with content create/update/publish, schema discovery, media, search, taxonomies, and more
- **Personal Access Tokens** and OAuth for secure agent authentication
- Official [AI Tools](https://docs.emdashcms.com/guides/ai-tools/) and [MCP Server Reference](https://docs.emdashcms.com/reference/mcp-server/) documentation

Those features cover — and exceed — what EmPost provided. Maintaining a separate plugin and MCP proxy is no longer justified.

**Status:**

| Item | Status |
|------|--------|
| GitHub repository | Archived (read-only) |
| npm packages | Deprecated — no further releases |
| Issues / PRs | Not accepted |
| Security fixes | None planned — migrate off EmPost |

---

## Migration to EmDash MCP

### 1. Remove EmPost from your site

In `astro.config.mjs`, remove `empostMdDraftPlugin()` from the `emdash({ plugins: [...] })` array, then uninstall:

```bash
pnpm remove @emplugins/emdash-plugin-md-draft
```

Redeploy so the ingest routes are no longer exposed.

### 2. Remove the EmPost MCP server from your agent

Delete the `@emplugins/mcp-emdash-drafts` entry from Cursor, Goose, or other MCP client configs (including `EMDASH_INGEST_URL`, `EMDASH_HMAC_SECRET`, and `EMDASH_KEY_ID`).

### 3. Connect to EmDash’s built-in MCP

Your site’s MCP endpoint:

```
https://YOUR_SITE/_emdash/api/mcp
```

For local development:

```
http://localhost:4321/_emdash/api/mcp
```

Create a **Personal Access Token** in `/_emdash/admin` with at least the `content:write` scope (Contributor role or higher). Then configure your MCP client, for example in Cursor:

```json
{
  "mcpServers": {
    "emdash": {
      "url": "https://YOUR_SITE/_emdash/api/mcp",
      "headers": {
        "Authorization": "Bearer ec_pat_YOUR_TOKEN"
      }
    }
  }
}
```

See the official guides for setup details and OAuth alternatives:

- [AI Tools](https://docs.emdashcms.com/guides/ai-tools/)
- [MCP Server Reference](https://docs.emdashcms.com/reference/mcp-server/)

### 4. Ask agents to use schema-aware content tools

EmDash MCP exposes tools such as `schema_get_collection` and `content_create`. Rich text fields use **Portable Text** (JSON blocks), not Markdown. Ask the agent to inspect the collection schema before creating content, and to create items as **drafts** for human review before publishing.

---

## npm packages (deprecated)

| Package | Last version | Replacement |
|---------|--------------|-------------|
| `@emplugins/emdash-plugin-md-draft` | 2.0.0 | Remove; use built-in EmDash MCP |
| `@emplugins/mcp-emdash-drafts` | 2.0.0 | Connect agents to `/_emdash/api/mcp` |
| `@emplugins/shared` | workspace-only | N/A |

Installing these packages will show an npm deprecation warning pointing to this repository.

---

## Historical documentation

The docs below describe the original EmPost design. They are **not updated** and kept for reference only.

| Resource | Description |
|----------|-------------|
| [`docs/operator-runbook.md`](./docs/operator-runbook.md) | Plugin install, HMAC setup, ingest URL |
| [`docs/cursor-mcp.md`](./docs/cursor-mcp.md) · [`docs/goose-mcp.md`](./docs/goose-mcp.md) | Legacy MCP client setup |
| [`docs/threat-model.md`](./docs/threat-model.md) | HMAC ingest security model |
| [`EMDASH_COMPAT.md`](./EMDASH_COMPAT.md) | Version compatibility matrix (final: EmDash ≥0.14.0) |
| [`examples/`](./examples/) | Sample post and MCP config snippets |

### Original packages

| Package | Description |
|---------|-------------|
| `@emplugins/shared` | Frontmatter, Zod, HMAC helpers, Markdown → Portable Text (workspace-only) |
| `@emplugins/emdash-plugin-md-draft` | EmDash plugin: signed ingest + health |
| `@emplugins/mcp-emdash-drafts` | MCP stdio server: `ingest_path`, `ingest_markdown`, `validate_markdown` |

## Repo layout

- [`emPost.md`](./emPost.md) — full v1 specification
- [`docs/`](./docs/) — threat model, runbook, client setup, [releases](./docs/RELEASES.md), [maintainer release guide](./docs/maintainer-release.md)
- [`examples/`](./examples/) — sample post + config snippets

## Compatibility

Tested against **EmDash `0.14.0` and `0.29.0`** (`emdash` peer **`>=0.14.0`** on `@emplugins/emdash-plugin-md-draft`). See [EMDASH_COMPAT.md](./EMDASH_COMPAT.md). Ingest uses `POST` with `Content-Type: application/json` and `{ "markdown": "..." }` because EmDash’s plugin route host parses JSON before the handler runs (see [`docs/operator-runbook.md`](./docs/operator-runbook.md)). Multi-locale sites may set optional YAML `locale` and `translationOf` in the markdown frontmatter.

## License

MIT — source remains available under the same license. No warranty or support is offered for archived code.
