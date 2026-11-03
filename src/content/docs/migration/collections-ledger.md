---
title: Collections ledger
description: Every collection on PROD, its top node, and how it got in.
sidebar:
  order: 4
---

State of PROD on **2026-09-29**:
- 57 top-level `collection` nodes
- 1,080 `archival_component`
- 19,745 `islandora_object`
- 74,867 media
- Solr 100% (20,986)

Identifiers are CA accession numbers (`YYYY_NN`). Every collection, component and item has the alias `/collections/<identifier>` (lowercased by pathauto).

Sources: the PROD database, plus the ingest machine's rollback files and logs (`islandora-workbench-ops`).

Pipeline key:
- **CA:** `extract.py` → `migrate.py` → `prepare_ingest.py` → Workbench
- **Sheet:** `organise` → `files-items-batch`
- **Supp.:** hand-built supplement from CA DB pulls or shared-drive sheets

| Id | Title | Top nid | Pipeline | Ingested | Notes |
|---|---|---|---|---|---|
| 2020_01 | Baltej Singh Dhillon fonds | 8093 | CA | re-ingested 09-15 | Scrapbook rebuilt as Paged Content 19021 (09-22), moved under series 8094 (09-29); 1 item no media |
| 2020_03 | Del Monte Studio collection | 12927 | CA + supp. | 09-15, +2,431 items 09-28 | Largest (about 7.3k items). 16 undecoded CA IDs, `subjectPersonal` missing on the 09-28 items, 17 no media |
| 2020_04 | Dr. Kanwal Inder Singh Neel Collection | 6185 | CA (legacy) + supp. | before 08-13, +15 on 09-28 | |
| 2020_05 | Mayo Singh Family fonds | 12351 | CA | 09-15 | 18 empty containers |
| 2020_06 | Joan Mayo fonds | 6340 | CA (legacy) | before 08-13 | Media count needs checking (see Known issues) |
| 2020_07 | Ram Sundaram Family fonds | 7238 | CA | 09-03 | |
| 2021_01 | Yucho Chow Collection | 6135 | CA (legacy) | before 08-13 | |
| 2021_02 | Jeavan Deol Family fonds | 10460 | CA | 09-15 | |
| 2021_03 | Charan Gill Family fonds | 7252 | CA | 09-03 | |
| 2021_04 | Bhagleant "Bonto" Singh family fonds | 6145 | CA (legacy) + supp. | before 08-13 | |
| 2021_05 | (DIS)Enfranchisement exhibit collection | 7028 | CA (legacy) | before 08-13 | |
| 2021_06 | Chandra Bodalia fonds | 18285 | CA | 09-21, media 09-28 | **Same title as 2024_19**, see Known Issues |
| 2021_07 | Komagata Maru: Continuing the Journey | 8970 | CA | re-ingested 09-15 | First 09-15 run rolled back and redone; big videos attached 09-29; 8 no media |
| 2021_08 | Labour History exhibit collection | 10830 | CA | 09-15 | **Partial**: about 43 items wait on series records |
| 2021_09 | Chindow Sidhu Family fonds | 7380 | CA | 09-03 | |
| 2021_C_001–003 | SACDA Family Photo / Home Movies / Migration Stories | 22179–22181 | hand-built | 09-29 | Empty collections plus redirects |
| 2022_01 | South Asian Studies Institute fonds | 18096 | CA | 09-21, media 09-22 | 2 no media |
| 2022_02, 03, 04, 07, 08, 09, 10, 11, 14 | various | 7419, 7449, 7482, 7568, 7608, 7691, 7759, 7817, 7821 | CA | 09-03 | Duplicate second runs deleted the same evening |
| 2022_05 | Where are the Women Exhibit collection | 10812 | CA + supp. | 09-15, +83 on 09-28 | |
| 2022_06, 13, 16 | Mit Singh Pandori; Canadian Sikh Heritage Interviews; Sawmill Worker Stories | 10493, 11120, 11835 | CA | 09-15 | Media backfilled from the shared drive 09-22 |
| 2022_12 | Foncie's Fotos collection | 18080 | CA | 09-21 | Fonds only |
| 2022_15 | Dr. Gurdev Singh Gill fonds | 10734 | CA + supp. | 09-15, +83 on 09-28 | 5 **placeholder** series; 37 records pending place/creator |
| 2023_01, 04, 17, 19, 20, 21, 22, 26 | various | 7837, 8061, 7908, 7960, 7990, 8003, 8006, 8030 | CA | 09-03/04 | |
| 2023_02, 11, 16, 23 | Canadian Gurdwaras; Jaito Morcha; Sports; Maps | 18094, 18079, 18095, 18093 | CA | 09-21 | Fonds only (2023_02 and 2023_16 have no-media items) |
| 2023_03 | Langar collection | 18081 | CA + drive-only files | 09-21, media 09-22 | |
| 2023_05, 06, 07, 08, 14, 27 | various | 10540, 10515, 10658, 10480, 11391, 10591 | CA | 09-15 | 2023_27 has real digitisation gaps |
| 2023_09 | Paldi collection | 10954 | CA + drive-only files | 09-15, +200 on 09-22 | |
| 2023_13 | Lumber Industry collection | 10468 | CA | 09-15 | **Partial**: about 52 items wait on series records |
| 2023_18 | Judge Gurmail Gill fonds | 19025 | Drive sheet via prepare | 09-22 | Fonds created 3×, dupes deleted 09-28 |
| 2024_19 | Chandra Bodalia fonds | **2** | **Sheet** | Feb–Apr 2026 | The only sheet-pipeline collection |

Also on prod: the 42 `media_item` nodes for `/about/media` (08-18) and 56 `team_member` nodes.

## Legacy five: no ingest logs

2020_04, 2020_06, 2021_01, 2021_04 and 2021_05 went to prod before 08-13 from a machine whose logs weren't kept. Their exports post-date the parent-link fix (07-22), so parents are very likely right.

## Every other run

Every other run has a rollback file in `islandora-workbench-ops`: `g/rollback/config/*.yml` and `g/rollback/csv/*`. **Most September rollbacks and logs are still uncommitted** on the ingest machine, so commit them.

For counts after October 2026, query PROD rather than trusting this table:

```bash
docker compose exec drupal drush sqlq "SELECT type, COUNT(*) FROM node_field_data GROUP BY type"
```
