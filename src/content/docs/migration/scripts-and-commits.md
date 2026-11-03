---
title: Scripts and commits
description: The migration's scripts, one-off repairs, branches and key commits, with links to GitHub.
sidebar:
  order: 3
---

The migration code lives in the private
[`islandora-workbench-ops`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops)
repo (`g/`), with site-side pieces in
[`isle`](https://github.com/south-asian-canadian-digital-archive/isle). Links work for org
members.

## Pipeline scripts (`g/scripts/ca-migration/`)

[Browse the folder](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/tree/main/scripts/ca-migration).

| Script | Role |
|---|---|
| `extract.py` | Pulls objects, collections and hierarchy from the CollectiveAccess MySQL database into `exports/final_export_id_<CA id>.csv`. Keeps each object's deepest collection link |
| `export__.py`, `fetch_hierarchy.py` | Earlier and supporting export helpers |
| `migrate.py` | Maps CollectiveAccess columns to Drupal fields and splits rows into fonds, subcollections and items; writes the redirects CSV |
| `prepare_ingest.py` | Runs `migrate.py`'s logic, matches staged files, writes Workbench CSVs and configs plus `ingest_report.md` |
| `legacy_redirects.py` | Redirects for the seven collections ingested before redirects existed |
| `check_parents.py`, `fetch_parents.py` | Verify and recover parents against `sacda.ca` and the new site |
| `to_review.py` | Archivist review workbooks per collection |
| `edtf_normalize.py`, `sheet_io.py` | Date normalisation; spreadsheet input |
| `exports/`, `migrated/`, `prepared/` | Committed raw exports, converted CSVs and prepared runs |

## One-off repairs (`prepared/<fix-dir>/`)

Each folder holds the configs and CSVs for one repair applied to PROD. They are not
replayable by `prepare_ingest`:

| Folder | Repair |
|---|---|
| `audit-fixes/` | Corrections from the post-ingest audit |
| `overnight/` | Overnight batch runs, plus `dup_audit.py` and `media_audit.py` |
| `ca-supplement/` | Objects missing from the export, rebuilt from CollectiveAccess database pulls |
| `f-only/` | Files present on the shared drive but not in CollectiveAccess |
| `missing-media/` | Media attached after the fact with `add_media` |
| `second-parents/` | Items with a second parent in CollectiveAccess |
| `fake-compound-fix/` | Compound objects that should have been single items |
| `reparent-orphans.*` | Items reattached to the right parent |
| `fix-pagedcontent-model.*` | Single-file PDFs changed from Paged Content to Digital Document |
| `redirect-audit/` | Missing and broken redirect checks |

Many September logs, rollbacks and some repair configs were still uncommitted on the
ingest machine at the end of September 2026; see
[Known issues](/docs/islandora/reference/known-issues/).

## Branches

| Repo | Branch | What |
|---|---|---|
| `islandora-workbench-ops` | `main` | Everything the migration ran |
| `islandora-workbench-ops` | `ca-migration-tests` | Tests for the migration scripts |
| `islandora-workbench-ops` | `research/camp-2026` | After the migration: site profiles, task registry, resumable runner, Collection-level archival components |

## Key commits

`islandora-workbench-ops`:

| Commit | Date | What |
|---|---|---|
| [`329740f`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/329740f) | 2026-05-20 | Migration scripts and exported files |
| [`93a20ae`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/93a20ae) | 2026-07-28 | Output ingest-ready CSVs directly, skipping the preprocessor |
| [`645144d`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/645144d) | 2026-07-28 | Fix coordinates extracted wrongly |
| [`61c4e8c`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/61c4e8c) | 2026-07-28 | Recover real archival parents for about 2,000 items |
| [`388f773`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/388f773) | 2026-07-28 | Correct `field_model` from the staged files |
| [`4f5d07c`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/4f5d07c) | 2026-07-28 | `allow_missing_files` instead of `nodes_only` |
| [`3a68600`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/3a68600) | 2026-07-28 | Park unplaced items in an Extras container |
| [`1eb062a`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/1eb062a) | 2026-07-30 | Join languages on ISO code |
| [`1189cea`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/1189cea) | 2026-08-12 | Workbench ingest for the team and media pages |
| [`7ae3e2d`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/7ae3e2d) | 2026-08-13 | Redirects bundle, full re-export, export sanity checks |
| [`0db6527`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/0db6527) | 2026-08-13 | Redirects for the 7 pre-redirect collections |
| [`002dff4`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/002dff4) | 2026-09-03 | `sacda.ufv.ca` rename, portable paths |
| [`253a809`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/commit/253a809) | 2026-09-08 | Carry LCSH URIs into the ingest |

`isle`:

| Commit | Date | What |
|---|---|---|
| [`0bfa6bc`](https://github.com/south-asian-canadian-digital-archive/isle/commit/0bfa6bc) | 2026-08-12 | Enable the `redirect` module and its REST resource |
| [`6991633`](https://github.com/south-asian-canadian-digital-archive/isle/commit/6991633) | 2026-09-08 | Add `authority_resolver` |
| [`b54b76d`](https://github.com/south-asian-canadian-digital-archive/isle/commit/b54b76d) | 2026-09-08 | Make the authority reconcile runnable on PROD |
| [`1279068`](https://github.com/south-asian-canadian-digital-archive/isle/commit/1279068) | 2026-10-21 | Skip self-loop rows in the legacy redirect script |
| [`57026bb`](https://github.com/south-asian-canadian-digital-archive/isle/commit/57026bb) | 2026-10-28 | Rate-limit legacy CollectiveAccess paths |
