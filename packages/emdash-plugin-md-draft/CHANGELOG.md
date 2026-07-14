# @emplugins/emdash-plugin-md-draft

## 2.0.0

### Major Changes

- 25df0d1: EmDash **0.14.x** support: peer `emdash >=0.14.0`, optional i18n frontmatter (`locale`, `translationOf`) on ingest. MCP: tool descriptions and validate output for locale fields.

### Patch Changes

- 25df0d1: Test against EmDash 0.29.0. CI matrix and dev dependency updated; peer range unchanged (`>=0.14.0`).
- Updated dependencies [25df0d1]
  - @emplugins/shared@0.3.0

## 1.0.0

### Major Changes

- 44c51c2: EmDash **0.14.x** support: peer `emdash >=0.14.0`, optional i18n frontmatter (`locale`, `translationOf`) on ingest. MCP: tool descriptions and validate output for locale fields.

### Patch Changes

- Updated dependencies [44c51c2]
  - @emplugins/shared@0.2.0

## 0.3.0

### Minor Changes

- d5b9cf9: EmDash **0.9.x** support: peer `emdash >=0.9.0`, capability `content:write`, forward structured errors from `ctx.content.create`. MCP package: docs compatibility note only.

## 0.2.0

### Minor Changes

- Initial public release: EmDash draft-ingest plugin + MCP server for Cursor/Goose.
