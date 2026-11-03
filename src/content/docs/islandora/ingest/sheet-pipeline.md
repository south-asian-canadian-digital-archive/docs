---
title: Spreadsheet pipeline
description: Ingesting a collection catalogued in an archivist spreadsheet rather than CollectiveAccess.
tags: [rust, python]
sidebar:
  order: 2
---

Used for collections catalogued directly in an archivist spreadsheet rather than in CollectiveAccess. So far only **2024_19 Chandra Bodalia fonds** (nid 2) went through it, box by box, Feb–Apr 2026, mostly from the research-assistant machine.

## Tools

- **`organise`**, from `workbench-preprocessor` (Rust, releases for Linux and Windows). Keep `field_model_mappings.toml` next to the binary. What it does:
  - reads CSV/XLSX/ODS or a Google Sheet URL
  - derives `parent_id` from `accessIdentifier`
  - derives file paths and extensions, and `field_model` from the extension
  - maps language codes to term IDs
  - cleans text
  - with `--full`, writes an items/containers CSV
- **Configs:** `g/config/files-items-batch.config.yml` (File-level containers, `nodes_only`) runs `g/config/create-items.config.yml` (items) as a secondary task.
- **The RA machine has no uv**, so it runs plain `python`. It's kept current by `update.ps1`, served from `https://sacda.ufv.ca/static/update.ps1`. That script commits and pushes pending logs, rebases both repos, and drops in the latest `organise` binary.

## Steps

1. Update the machine by running the published `update.ps1` (`irm <url> | iex`).
2. Create the top-level Collection node **by hand** in Drupal and note its nid.
3. Run the preprocessor:

```
organise --full metadata.xlsx --node <collection nid> --access-dir <path to access files>
```

   This gives the processed `metadata.csv` plus a containers CSV. Rename or move them to what the configs expect (`metadata.csv` and `metadata-items.csv` in the Workbench input dir). Files resolve as `access/<file>`.
4. Check, then run:

```
python workbench --config g/config/files-items-batch.config.yml --check
python workbench --config g/config/files-items-batch.config.yml
```

   It asks two prompts first ("created the main Collection?" and "added --node?"). That's fine on the primary task. **`create-items` must keep `remind_user_to_run_check: false`**, or the secondary task dies with EOFError and every item is silently skipped.
5. Verify as in [Ingest CA Pipeline](/docs/migration/ca-pipeline/).
6. Commit logs and rollback with `update.ps1`, because the `shutdown:` hook needs uv.

**Strip commented rows from the sheet.** A row starting `# 2024_19_801_023` was ingested as a real node (4865, since deleted).
