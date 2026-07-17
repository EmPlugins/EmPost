# `@emplugins/mcp-emdash-drafts`

> **Deprecated — unmaintained.** This package is no longer supported. Connect agents directly to [EmDash’s built-in MCP server](https://docs.emdashcms.com/guides/ai-tools/) instead.  
> Migration guide: [EmPost README — Migration to EmDash MCP](https://github.com/EmPlugins/EmPost#migration-to-emdash-mcp)

---

Stdio **MCP server** for [Model Context Protocol](https://modelcontextprotocol.io) clients (**Cursor**, **Goose**, etc.): validated Markdown locally, then signed and POSTed drafts to an EmDash site running `@emplugins/emdash-plugin-md-draft`.

**Do not add this MCP server to new configs.** Remove it from existing agent setups.

## Replacement

Remove this stdio server and point your MCP client at EmDash’s HTTP MCP endpoint with a Personal Access Token:

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

Documentation: [AI Tools](https://docs.emdashcms.com/guides/ai-tools/) · [MCP Server Reference](https://docs.emdashcms.com/reference/mcp-server/)

Also remove `@emplugins/emdash-plugin-md-draft` from your EmDash site if installed.

---

<details>
<summary>Original documentation (archived)</summary>

## Tools

| Tool | Description |
|------|-------------|
| `validate_markdown` | Parse frontmatter + body locally (no network write). |
| `ingest_markdown` | POST a full markdown string to the ingest URL. |
| `ingest_path` | Read a file from disk, then same as `ingest_markdown`. |

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `EMDASH_INGEST_URL` | Yes | Full URL to ingest |
| `EMDASH_HMAC_SECRET` | Yes | Same secret configured in EmDash plugin admin |
| `EMDASH_KEY_ID` | No | Defaults to `default` |

## Run

```bash
npx -y @emplugins/mcp-emdash-drafts
```

</details>
