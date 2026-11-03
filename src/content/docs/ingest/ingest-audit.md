---
title: Ingest audit
description: Check a collection's source spreadsheet against what the repository actually holds, row by row and field by field.
sidebar:
  order: 3
---

**`/admin/content/ingest-audit`** (Content → Ingest audit) compares the spreadsheet a
collection was ingested from with what Drupal holds. It was added on 2026-10-05 and is
granted to `content_editor` through the `use ingest audit` permission.

It lives in `sacda_modules` as the submodule `sacda_ingest_audit`. All data is read
through core JSON:API in your browser; PHP only passes the field schema and proxies Google
Sheets. The module README covers the UI in full.

## Use it

1. Upload a Workbench CSV, an Excel or ODS file, or paste a Google Sheets link.
2. Pick the identifier column under **Match rows on**. Rows are matched to nodes of any
   type (Repository Item, Collection, Archival Component) by `field_identifier`.
3. Check the column mapping. Columns named after a field or a Workbench column
   (`parent_id`, `file`) map themselves; common aliases ("Object ID", "Parent ID") are
   pre-added; anything else you map with **+ Add**. Mappings are remembered per header
   name in your browser.
4. Read the results. Colours in the detail panel: **red** is in the file but missing in
   the repository, **yellow** differs, **blue** is only in the repository.
5. Review: mark differences **resolved** (dropped from the export) or **⚑ problem**
   (kept in the CSV export as `confirmed problem`). Identical differences across rows can
   be marked together. Keys: R resolve, F problem, U undo, Esc clear.
6. Export the problems CSV for the archivist or for a Workbench `update` run.

Matching is deliberately loose for dates, languages and places, so a place slug matching
the place's label counts as the same value.

## Agent-assisted triage

The page can hand open differences to an AI agent running on **your own machine**. The
server holds no AI API key and calls no AI service.

1. On the audit page, click **Start agent session**. You get a temporary token that lasts
   8 hours or until **End session**.
2. **Copy agent prompt** copies everything the agent needs: the URL, the token, how to
   upload and check a file, how to answer, and the triage rules.
3. Paste it into your agent and tell it which sheet to upload. Keep the tab open; uploads
   wait until the page is open.

The agent can upload a sheet, read the audit result and mapping, and pull and answer
differences. **Nothing is marked until you accept it.** Saved verdicts expire after two
days, so a wrong answer can't persist. The token travels in the request body, because
the campus proxy strips unknown headers.

## Known limits

- A collection ingested "nodes only" shows every item as missing media. That's real
  drift, not a bug.
- macOS `._` AppleDouble files listed in a sheet's `file` column show as mismatches.
- `dist/` is committed. After editing `ui/src`, rebuild with `bun run build`.
