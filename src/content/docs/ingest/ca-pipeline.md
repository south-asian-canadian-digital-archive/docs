---
title: CollectiveAccess pipeline
description: How CollectiveAccess collections were migrated, and how to ingest another one.
sidebar:
  order: 1
---

How CollectiveAccess collections were migrated, and how to ingest another one.

## Where it lives

- **Repo:** `islandora-workbench-ops` (private), checked out as **`g/`** inside a plain
  upstream clone of `mjordan/islandora_workbench`. `g` is excluded with
  `.git/info/exclude`, not `.gitignore`.
- **Ingest machine:** a SASI Windows PC running Git Bash and **uv** (Python 3.14).
- **Always run from the Workbench root.** Configs use `./g/...` relative paths.
- **Credentials:** one gitignored credentials file per site, kept only on the ingest
  machine. Since November 2026 the site profiles in `g/config/sites.toml` name the host,
  credentials file and target bundle, so configs no longer hardcode hosts.
- **Source media:** the SASI shared drive, under the ingest folder for the current term.
  It holds `Metadata/` (xlsx), `Prepared/<coll>.csv` and `Assets/<coll>/`. Assets are
  **read in place, and the drive is read-only.**
- **CollectiveAccess database pulls** (missing media, hierarchy, metadata) were produced
  on the CA server and copied to the shared drive.

## The pipeline

```
CA MySQL ──extract.py──▶ exports/final_export_id_<CA id>.csv
                          │
                   prepare_ingest.py <coll>   (runs migrate.py logic + file matching + checks)
                          │
            prepared/<coll>/ ca-{fonds,subcollections,items,redirects,subjects}-workbench.csv
                             *.config.yml, ingest_report.md, tmp/
                          │
                 Workbench: fonds → subcollections → items → subjects → redirects
```

`extract.py` notes:
- It keeps each object's **deepest** collection link. The 07-22 fix (`61c4e8c`); before it, whole collections were flattened under the fonds.
- An object parent beats a collection parent.
- A CA object with several representations becomes a **Compound Object** plus `-1`, `-2`… children.
- The model comes from the file's **mimetype**, never CA's descriptive Format field.
- A single PDF is **Digital Document**, not Paged Content.

`migrate.py` notes:
- Maps CA columns to Drupal fields and splits rows by content type:

| CA level | Content type |
|---|---|
| Fonds | `collection` |
| Series / Sub-series / Sous-fonds / File | `archival_component` |
| everything else | `islandora_object` |

- Writes a redirects CSV (`Detail/objects/<id>` → `collections/<identifier>`).
- Output is final. It is **not** run through `workbench-preprocessor`.
- **Five fields are hardcoded blank:** `field_repository_link`, `field_biographical_sketch`, `field_custodial_history`, `field_scope_and_content`, `field_system_of_arrangement`. See [Known Issues](/docs/reference/known-issues/).

## Ingest a new CA collection

1. Make sure `g/scripts/ca-migration/exports/final_export_id_<CA id>.csv` exists (`extract.py`). Objects missing from the export need a CA DB pull and a supplement; see `prepared/ca-supplement/`.
2. Put the assets under `Assets/<coll>/` on the shared drive.
3. Prepare:

```
uv run python g/scripts/ca-migration/prepare_ingest.py <coll> --force
```

   Add `--allow-missing` only when files are genuinely missing; those rows become metadata-only. Read `prepared/<coll>/ingest_report.md` and `g/logs/<coll>_missing_files_*.log`.
4. Harden the generated configs:
   - Set `http_max_retries: 0` on the create configs. Retries created duplicates, up to 7× one record.
   - Keep `remind_user_to_run_check: false`.
   - Keep the per-collection `temp_dir`.
5. Check against test first if you can, then prod:

```
uv run python workbench --config g/scripts/ca-migration/prepared/<coll>/fonds.config.yml --check
```

6. Run fonds, subcollections and items **one at a time, in that order**. That's more reliable than the `secondary_tasks` cascade. Capture stdout:

```
uv run python workbench --config g/scripts/ca-migration/prepared/<coll>/fonds.config.yml 2>&1 | tee g/logs/prod_ingest_run/<coll>-fonds.log
uv run python workbench --config g/scripts/ca-migration/prepared/<coll>/subcollections.config.yml 2>&1 | tee g/logs/prod_ingest_run/<coll>-subs.log
uv run python workbench --config g/scripts/ca-migration/prepared/<coll>/items.config.yml 2>&1 | tee g/logs/prod_ingest_run/<coll>-items.log
```

7. Subjects, if `subjects.config.yml` exists. It's a `create_terms` task and idempotent.
8. Redirects **after** the nodes exist (see [Redirects](/docs/ingest/redirects/)):

```
uv run python workbench --config g/scripts/ca-migration/prepared/<coll>/redirects.config.yml
```

9. Verify on prod. Don't trust the exit code:
   - `GET https://sacda.ufv.ca/collections/<id>?_format=json` for the top node and a sample of children; check `field_member_of`. Use a browser-like User-Agent and sleep ≥0.3s between requests.
   - Run `prepared/overnight/dup_audit.py` and `overnight/media_audit.py` (read-only).
   - `curl -I https://sacda.ufv.ca/Detail/objects/<id>` should return 301.
10. Commit and push `g/`: logs, rollback, prepared.

Timing on the server side:
- Ingest in the evening if there's video; derivatives are serial.
- Don't deploy during an ingest.
- The ingesting account must have `fedoraadmin`.

## Roll back a bad batch

Every create run writes `g/rollback/config/rollback-<config>.<timestamp>.yml` (a `task: delete`) plus a CSV. **Check its `host:` line first.** Delete in reverse order: items, then subcollections, then fonds.

```
uv run python workbench --config g/rollback/config/rollback-ca-items.<ts>.yml
```

Then **prune the parent map**, or the next run attaches children to deleted nodes:

```
sqlite3 <temp_dir>/csv_id_to_node_id_map.db "DELETE FROM csv_id_to_node_id_map WHERE csv_id LIKE '<prefix>%' OR parent_csv_id LIKE '<prefix>%'"
```

Redirects can't be rolled back by Workbench; delete them in the Drupal UI.

## One-off fixes that re-running won't reproduce

The `prepared/<fix-dir>/` folders hold one-off repairs: `audit-fixes/`, `overnight/`, `ca-supplement/`, `f-only/`, `missing-media/`, `second-parents/`, `fake-compound-fix/`, `reparent-orphans.*`, `fix-pagedcontent-model.*`.

Re-running `prepare_ingest` for a collection would **not** reproduce them. Treat PROD as the source of truth for anything ingested before 2026-09-29. A few 09-21 fix configs were left in a scratch folder on the ingest machine; move them into `g/`.

## Newer tooling (November 2026, not yet used on PROD)

On the `research/camp-2026` branch of `g/`:

- **Fonds become Collection-level `archival_component` nodes** instead of `collection`
  nodes, matching the [data model plan](/docs/research/data-model/).
  `prepare_ingest.py --legacy-collection-root` keeps the old behaviour for PROD until it
  is converted; the site profiles keep PROD and TEST on `converted = false`.
- **`tasks.py`** declares each task with its dependencies, and **`run_order.json`** is
  generated from them, so subjects and redirects are part of the run order rather than
  printed reminders.
- **`run_ingest.py`** runs that order, stops at the first failure and resumes.
- **`hierarchy.py`** shares parent logic between `migrate.py`, `check_parents.py` and
  `fetch_parents.py`.

None of this has been run against Workbench for real yet. See
[Workflows research](/docs/research/workflows/).
