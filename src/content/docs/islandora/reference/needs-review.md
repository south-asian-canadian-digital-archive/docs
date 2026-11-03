---
title: Needs review
description: Places where the sources behind these docs disagreed, how each was resolved, and what still needs checking on a real server.
sidebar:
  order: 2
---

These docs were compiled in November 2026 from the earlier docs set (snapshot
2026-09-29), the Notion project pages, the code in the repos, and past working notes.
Where sources disagreed, the code and the newest date won. Each item below says what
was chosen and what to verify.

| # | Topic | Conflict | Docs say | Verify with |
|---|---|---|---|---|
| 1 | PROD versions | The 09-29 audit found Drupal 10.6.1 on isle-buildkit 6.2.9. `main` has been on Drupal 11.4.11 and buildkit 7.0.22 since 10-21, and a PROD deploy of it succeeded. The non-Drupal services take `ISLANDORA_TAG` from the server's `.env`, which the deploy doesn't change | Both states shown; [Upgrades](/docs/islandora/operations/upgrades/) | `grep ISLANDORA_TAG .env`; `docker compose ps`; `drush status` on PROD |
| 2 | `/search` on PROD | The 10-29 deploy timed out before `cim` and the shell step; a temporary router was added | [Search](/docs/islandora/operations/search/) describes the target state and the temporary router | Does `/var/www/drupal/search-shell` exist? Is `/search-legacy` the view? |
| 3 | Fedora resync | Scheduled for the night of 09-30 → 10-01; no record of completion | Listed as open | `logs/fedora-resync.log` and the state file |
| 4 | Orphaned originals | Older code notes: about 221 originals with no parent. 2026-11-02 DEV audit: 0 (4 dangling rows) | The audit figure (DEV only) | Count on PROD |
| 5 | Subject authority links | Code notes (09-08): 1,098 PROD subject terms, 0 linked. Ops snapshot (09-29): 1,240 of 1,953 linked | The 09-29 figure | Count `field_authority_link` on PROD |
| 6 | Docs hosting | A 11-02 decision named `sacda.ufv.ca` as the home for docs and thesaurus; these docs are published on GitHub Pages | GitHub Pages now; the thesaurus path is open | Decide whether `sacda.ufv.ca` should proxy or link to this site |
| 7 | Matterport router priority | The tour's notes say its routers use priority 100 "the same as exhibits"; the exhibits router is 1100 | Not stated in docs | `docker inspect` the tour container's labels |
| 8 | Cantaloupe heap | DEV ran 128M/512M while `docker-compose.yml` sets 256M/1G | Not stated | Check the running JVM flags |
| 9 | Viewer visibility | The viewer table dates from July; October added Mirador for Publication Issues, a download card for Binary objects and a per-node viewer override field tested on DEV | [Viewers](/docs/islandora/development/viewers/) flags it as needing a check | Block layout on PROD |
| 10 | Milliner `alternate` link header | Code notes (07-23) say media sync 500s on a missing `Link: rel="alternate"`. The 09-22 fix patched it, and the 11-02 audit saw the header present, but no media requests reached Milliner in 240 hours | Treated as fixed but unproven | Save one image media with tracing on and check Fedora |
| 11 | Image service files | DEV now writes pyramidal JPEG-in-TIFF service files through the mounted `conf/houdini/cmd.sh`; PROD makes JPEG | Research page states DEV only | Confirm `conf/houdini/cmd.sh` on `main` before PROD pulls it |
| 12 | Drupal versions on DEV | Research notes say DEV is 11.4.11; older notes say 11.4.9 | 11.4.11 | `drush status` |
| 13 | Ingest status file | `PROD_INGEST_STATUS.md` in the Workbench ops repo was last updated 08-13 and says media items stopped after one row; the 09-29 ledger lists 42 media items on PROD | The ledger | Retire or update that file |

If you resolve one, update the page it points to and remove the row.
