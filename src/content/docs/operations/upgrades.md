---
title: Upgrades
description: Upgrading Drupal, Islandora and isle-buildkit, including the October 2026 move to Drupal 11 and buildkit 7.
sidebar:
  order: 12
---

## The general rule

Upgrade on DEV, test the derivatives and viewers, then ship through `main`. Composer
changes need an image rebuild (see [Local development](/docs/development/local-development/)).
Don't change `ISLANDORA_TAG` on PROD without testing on DEV first.

There are **two** version knobs, and they can drift apart:

- **The Drupal image** is built by CI from the GitHub Environment variable
  `ISLANDORA_TAG`.
- **Every other service** (Solr, MariaDB, Fedora, ActiveMQ, the microservices) takes
  `ISLANDORA_TAG` from `.env` on the server, which isn't in git. The webhook deploy
  recreates only `drupal`, so it never moves them.

## October 2026: Drupal 11 and isle-buildkit 7

isle-buildkit 6.x is end of life (last release 6.4.3, 2026-06-05). In October 2026 `main`
moved to:

| | Before | After |
|---|---|---|
| Drupal core | 10.6.1 | 11.4.11 (security release, 2026-10-21) |
| Islandora | 2.17.3 | 2.19 |
| isle-buildkit | 6.2.9 | 7.0.22 (PHP 8.4.27) |
| OpenSeadragon module / library | 2.2.2 / OSD 2.4 | 3.0.1 / OSD 6 |
| islandora_mirador / Mirador | 2.4.2 / Mirador 3 | 3.0.1 / Mirador 4 |

### Running it on a server

`scripts/prod-upgrade-d11.sh` does the per-server part in one pass. **Take a database
backup first.** From the server checkout:

```bash
scripts/prod-upgrade-d11.sh
```

It sets `ISLANDORA_TAG` in `.env`, pulls, runs `scripts/migrate-buildkit-7.sh`
(recreate services, `mariadb-upgrade`, regenerate the Solr 10 configset and fix the
misplaced `conf/core.properties`, reindex), then `cim`, `cr`, version checks and a dry
run of `rederive-missing-service-files.sh`. Fedora 7 needs no data migration. Also bump
the GitHub Environment variable `ISLANDORA_TAG`, or CI keeps building the Drupal image on
the old base.

### Things that bit

- **`tour` left core in Drupal 11.** It's enabled here, so the contrib `drupal/tour`
  carries it. Don't drop that package without uninstalling `tour` in an earlier deploy;
  `cim` can't uninstall a module whose code is gone.
- **`islandora_iiif_hocr` has no Drupal 11 release.** It's patched with
  `assets/patches/islandora-iiif-hocr-d11.patch` (info.yml only).
- **OSD 6 never raises `tile-drawn`** with its default WebGL drawer, and sends
  `tile-loaded` through `raiseEventAwaiting`. The theme's loading overlay handles both.
- **upgrade_status misses `.inc` files.** `format_size()` in the theme's
  `includes/pdf_preview.inc` returned 500 on every PDF page under Drupal 11. Grep for
  removed functions yourself.
- **symfony/yaml 6.4.47+ can't round-trip a lone `"\n"`**, so such config shows
  "Different" forever. Normalise it to `""`.
- **facets 3 is blocked**: `advanced_search` requires `facets ^2.0`.
- **composer-patches 2** is skipped, as upstream does.
- Video and GIF derivatives needed fixes under buildkit 7, and animated GIFs now get MP4
  service files.
- After the move, DEV showed no thumbnails and the OpenSeadragon scroll override stopped
  working until the theme was updated.
- `symfony/translation` jumped to 8.x through `nesbot/carbon` (used only by the EDTF
  parser). EDTF parsing was tested on DEV and it was kept.
- Known noise: `rest_oai_pmh` 2.3 calls date callbacks for empty fields, so every OAI
  `ListRecords` warns `Undefined array key "value"` and emits one empty `<dc:date/>`.

Whether PROD's non-Drupal services have been moved to 7.0.22 is on
[Needs review](/docs/reference/needs-review/). Check on the server with:

```bash
grep '^ISLANDORA_TAG=' .env
docker compose ps --format '{{.Service}} {{.Image}}'
docker compose exec drupal drush status --field=drupal-version
```
