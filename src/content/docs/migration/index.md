---
title: CollectiveAccess migration
description: An archive of how SACDA's collections moved from CollectiveAccess (sacda.ca) to Islandora (sacda.ufv.ca) in 2026.
sidebar:
  order: 0
  label: Overview
---

This section is a **record**, not a runbook. It describes how the collections on the old
CollectiveAccess site at `sacda.ca` were moved into Islandora between May and September
2026, so that anyone can see why the data looks the way it does. For ingesting new
material today, see [Workbench](/docs/islandora/workbench/) and the
[Spreadsheet pipeline](/docs/islandora/ingest/sheet-pipeline/).

## Timeline

| When | What |
|---|---|
| 2026-05-20 | CollectiveAccess extraction scripts and the first full export committed ([`329740f`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/329740f)) |
| 2026-07-28 | Parent recovery: the export had flattened collections under their fonds; about 2,000 items got their real archival parents back ([`61c4e8c`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/61c4e8c)). `field_model` derived from real files; archivist review workbooks |
| 2026-07-30 | Languages mapped to term IDs by ISO code |
| before 08-13 | Five "legacy" collections ingested from a machine whose logs weren't kept |
| 2026-08-12 | Team and media pages ingested with Workbench; the `redirect` module and its REST resource enabled |
| 2026-08-13 | Redirects for old CollectiveAccess URLs, a full re-export, and export sanity checks ([`7ae3e2d`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/7ae3e2d)) |
| 2026-09-03/04 | First large batch of CollectiveAccess collections on PROD (now `sacda.ufv.ca`) |
| 2026-09-08 | LCSH URIs carried into new ingests ([`253a809`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/253a809)); `authority_resolver` added to reconcile existing terms |
| 2026-09-15 | Second large batch, including re-ingests of 2020_01 and 2021_07 |
| 2026-09-18 → 09-29 | Repairs: dropped derivatives, missing media from the shared drive, supplements from CollectiveAccess database pulls, reparenting, duplicate cleanup, big videos attached |

By 2026-09-29 PROD held 57 top-level collections, 1,080 archival components, 19,745
items, 74,867 media and 14,997 redirects.

## Pages

- [How the pipeline worked](/docs/migration/ca-pipeline/): `extract.py` → `migrate.py` →
  `prepare_ingest.py` → Workbench, and how to roll back.
- [Scripts and commits](/docs/migration/scripts-and-commits/): every script with a link
  to its source, and the key commits and branches.
- [Collections ledger](/docs/migration/collections-ledger/): every collection, its top
  node and how it got in.
- [Redirects](/docs/migration/redirects/): how old `sacda.ca` links still resolve.

## What re-running would not reproduce

Many September fixes were one-off repairs applied straight to PROD. Re-running the
pipeline for a collection would undo them. **Treat PROD as the source of truth** for
anything ingested before 2026-09-29.
