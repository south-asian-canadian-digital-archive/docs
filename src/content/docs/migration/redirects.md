---
title: Redirects
description: How old CollectiveAccess URLs are redirected to the new site.
sidebar:
  order: 5
---

Old CollectiveAccess URLs (`sacda.ca/Detail/objects/<CA id>`, `Detail/collections/…`, `Detail/entities/…`) are 301'd to the new aliases by Drupal `redirect` entities. The paths are the same on the new host, so once `sacda.ca` forwards to `sacda.ufv.ca` old links keep working.

## Prod (2026-09-29): 14,997 redirects

| Source | Count | Target |
|---|---|---|
| `Detail/objects/*` | 13,365 | `/collections/<identifier>` |
| `Detail/entities/*` | 1,271 | `/search?...` (people and organisations became search queries) |
| `Detail/collections/*` | 342 | `/collections/<identifier>` |
| misc (about, browse, exhibits…) | ~20 | pages |

## How they were made

| Batch | How | Evidence |
|---|---|---|
| Legacy 7 collections (2,303) | `legacy_redirects.py` → `g/config/ca-legacy-redirects.config.yml`. 1,887 on 08-13; the remaining 416 (2021_07) landed on 09-15 through the 2021_07 per-collection run | `g/logs/workbench-ca-legacy-redirects.log`, `prod_ingest_run/2021_07_redirects.log` |
| Per-collection | `prepared/<coll>/redirects.config.yml`, run after each ingest | `g/logs/workbench-ca-redirects.log`, `prod_ingest_run/overnight/*_redirects.log` |
| 2020_03 and extras from the CA server | `tmp/redirects.csv` (4,912) plus held 2020_03 (2,431 on 09-28) | `workbench-redirects-from-tmp.log`, `workbench-redirects-held-2020_03.log` |
| CA entity pages and legacy site pages | `scripts/create-legacy-redirects.{sh,php}` plus `docs/redirects/*.csv` in `isle` | Committed in October 2026 |

`ca-legacy-redirects-remaining.csv` does **not** need to be run again. Re-running any redirect config is harmless, because Workbench skips existing sources.

## Requirements for Workbench `create_redirects`

- The `redirect` module and its REST resource (`rest.resource.entity.redirect`, GET+POST, json, basic_auth) must be enabled. They are, and it's in config.
- The account needs `administer redirects`.
- Workbench can only **create** redirects. Delete or edit them in the UI at `/admin/config/search/redirect`.

## Open loose ends

These are on the ingest machine under `prepared/redirect-audit/`:

- `missing-redirects.csv`: 41 rows, possibly covered by the 09-28 held run. Re-verify.
- `targets-broken.csv`: 24 targets 404'd at audit time. Most were created on 09-28, so re-check.
- `targets-to-verify.csv`: 1,055 not spot-checked.

Spot check:

```
curl -sI https://sacda.ufv.ca/Detail/objects/614 | grep -i '^location\|^HTTP'
```
