---
title: Authorities and place lookup
description: Linking subject terms to LCSH/TGM, and the Getty TGN / CGNDB place lookup tool.
sidebar:
  order: 5
---

## Subject authority links (LCSH / TGM)

The CA exports carry a heading (`lcsh`) and its URI (`lcsh_terms`). Early ingests kept only the heading, so subject terms were created without links. `scripts/authority-reconcile.sh` in `isle` reconnects them.

It runs five steps:

1. **extract:** heading/URI pairs. On prod it reads the committed `scripts/authority-pairs.csv`.
2. **warm:** resolve every URI into the cache.
3. **scan:** classify every term. Writes nothing.
4. **review:** a human reads the CSV in `authority-reports/`.
5. **apply:** only with `APPLY=1`. Then reindex and verify idempotency.

```
scripts/authority-reconcile.sh
APPLY=1 scripts/authority-reconcile.sh
```

The first command is the dry run; the second applies the reviewed report.

- `link_ambiguous` rows are never auto-applied, because LCSH and TGM overlap. An archivist picks.
- To regenerate `authority-pairs.csv` (on a machine that has the CA exports):

```
scripts/extract-authority-pairs.py --dir ../islandora_workbench/g/scripts/ca-migration/exports --out scripts/authority-pairs.csv
```

**Prod status (2026-09-29):**

- 1,240 of 1,953 subject terms have `field_authority_link`, applied in three batches (09-15, 09-16, 09-21).
- About 713 have no link: no match, or deliberately skipped.
- Reports from 09-15 are in `authority-reports/`. There's no apply log.
- **Don't re-run with `APPLY=1` without reading a fresh report.**
- Cache: 1,431 records (lcsh 1,112 found / 2 not found / 1 error; tgm 407 / 19).

The ingest side also carries URIs now: g commit `253a809` puts `lcsh_terms` URIs into new ingests.

## Place lookup

An internal tool for research assistants: `/admin/content/places/lookup`, permission `use place lookup`. Type a place, get Getty TGN and CGNDB candidates plus whether a matching `geo_location` term exists, then copy the authority ID into the ingest sheet. The module README (`isle-modules`) explains the search layering and the data quirks in depth.

**On prod it's empty: 0 rows.** The dumps were only ever mounted in `docker-compose.dev.yml` (`./place-dumps:/opt/place-dumps`). Nothing mounts them on prod, and the original dump files are on the previous maintainer's machine.

To populate prod:

1. Download the dumps into a host dir, e.g. `/opt/islandora-prod/place-dumps/`:
   - `tgn_xml_0126.zip` (3.2 GB) from `tgndownloads.getty.edu/VocabData/`
   - `cgn_canada_csv_eng.zip` (15 MB) from `ftp.maps.canada.ca/pub/nrcan_rncan/vector/geobase_cgn_toponyme/prov_csv_eng/`
2. Add a bind mount for the drupal service in `docker-compose.yml` (committed): `./place-dumps:/opt/place-dumps:z,ro`. Then deploy.
3. Import:

```
docker compose exec drupal drush sacda-place:sync-authority
docker compose exec drupal drush sacda-place:status
```

   About 5 minutes. Opening the TGN zip costs about 1.2 GB of RSS outside PHP's heap, so do it when the box is quiet.
4. Refresh quarterly. Run `sacda-place:sync-local` nightly if RAs are actively using it.

Known coverage gaps: TGN lacks some Punjab villages (e.g. Anandpur Sahib); nation-level records are excluded by design.

Getty attribution in the page footer is required (ODC-By). The CGNDB advisory about offensive historical terminology is inline on purpose. Keep both.

`geo_location` currently has 144 terms. Almost none carry authority links yet, which is why local matching is by name.
