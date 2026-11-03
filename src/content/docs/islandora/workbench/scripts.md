---
title: Scripts
description: Reusable scripts in isle and islandora-workbench-ops that are useful beyond the migration, with links to their source.
sidebar:
  order: 2
---

Both repos are private, so the links work for org members. One-off migration repairs
are listed in the [migration archive](/docs/migration/scripts-and-commits/) instead.

## Workbench ops (`g/scripts/`)

Source: [`islandora-workbench-ops/scripts`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops/tree/main/scripts).

| Script | What it does |
|---|---|
| [`workbench-preprocessor`](https://github.com/south-asian-canadian-digital-archive/workbench-preprocessor) (`organise`) | Rust CLI: cleans an archivist sheet (CSV, XLSX, ODS or Google Sheet), derives `parent_id`, file paths, `field_model` and language term IDs, and with `--full` writes item and container CSVs. See [Spreadsheet pipeline](/docs/islandora/ingest/sheet-pipeline/) |
| `access-cleaner/` | Rust tool that normalises batch folder and file names to the `yyyy_nn_nn` pattern, pads numbers, swaps hyphens for underscores and resolves duplicates, with a dry-run report first |
| `migrate_access_identifiers.py` | Moves `field_accessidentifier` values into `field_identifier` with a reviewable `scan` → `apply` split. The pattern to copy for any bulk field move |
| `post_action_commit.py` | Workbench shutdown hook: commits and pushes `g/logs` and rollbacks after a run |
| `update.ps1` / `publish-update.ps1` | Keeps the Windows ingest machines current: commits pending logs, rebases both repos and drops in the latest `organise` binary. Published at `https://sacda.ufv.ca/static/update.ps1` |
| `ca-migration/prepare_ingest.py` | Turns a CollectiveAccess-style export or a Google Sheet into Workbench CSVs, configs and an `ingest_report.md`, with `--self-check`, `--allow-missing` and `--hold-back-flagged`. Useful for any sheet in that format |
| `ca-migration/edtf_normalize.py` | Normalises free-text dates to EDTF |
| `ca-migration/check_parents.py`, `fetch_parents.py`, `hierarchy.py` | Read-only checks of `field_member_of` against the live site |
| `ca-migration/run_ingest.py`, `tasks.py` | Resumable runner over a dependency-ordered task list (new, not yet used on PROD) |
| `prepared/overnight/dup_audit.py`, `media_audit.py` | Read-only audits for duplicate nodes and missing media after a run |

## Server and site (`isle/scripts/`)

Source: [`isle/scripts`](https://github.com/south-asian-canadian-digital-archive/isle/tree/main/scripts).
Run from the server checkout unless noted.

| Script | What it does |
|---|---|
| `authority-reconcile.sh` | Scan, review and apply LCSH/TGM links on subject terms. See [Authorities](/docs/islandora/development/authorities-and-place-lookup/) |
| `extract-authority-pairs.py`, `authority-label-candidates.py` | Build heading/URI pairs from exports; suggest label matches for review |
| `backfill-fire-derivative.php` | Fire one named derivative action for one node as uid 1 |
| `backfill-image-derivatives.sh` | Re-dispatch missing image service files and thumbnails (runs every 15 minutes) |
| `backfill-document-thumbnails.sh`, `backfill-service-files.sh`, `rederive-missing-service-files.sh` | Other derivative backfills |
| `resync-fedora.sh` | Re-push RDF to Fedora since a cutoff, resumable |
| `fix-exif-orientation.sh` | Repair images that render rotated |
| `consolidate-team-groups.sh` | Fold one team-group term into another |
| `restore-exhibits.sh` | Recreate the exhibit nodes from seed data |
| `deploy-exhibits.sh` | Build static exhibits into `/data/exhibits` |
| `create-legacy-redirects.sh` | Create redirects from a CSV of old paths |
| `rebuild-bundle-field-map.sh` | Clear ghost bundles from Drupal's field map |
| `generate-certs.sh` (`make traefik-certs`) | Regenerate the internal certificate |
| `check-reachability.sh` | Check the public hostname from wherever it runs |
| `search-stats.sh`, `traffic-export.sh` | Per-router request counts and latency; traffic reports from the monitor |
| `heap-monitor.sh` | JVM heap stats over time |
| `docker-image-cleanup.sh` | Nightly image and build-cache cleanup |
| `create-pr.sh` | Export config, branch, commit and open a PR |
| `prod-upgrade-d11.sh`, `migrate-buildkit-7.sh` | The Drupal 11 / buildkit 7 upgrade. See [Upgrades](/docs/islandora/operations/upgrades/) |
