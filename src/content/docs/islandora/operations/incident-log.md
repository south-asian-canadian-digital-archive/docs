---
title: Incident log
description: 'Past incidents, newest first: symptom, cause, fix, and how to spot it again.'
sidebar:
  order: 13
---

Newest first. Each entry covers symptom, cause, fix, and how to spot it next time.

## 2026-10-29 · Facet crawl during the /search switch deploy

- **Symptom:** every route that reached Drupal hung, including `/search-legacy`, while
  static routes (`/exhibits/km/`) answered in 0.13 s.
- **Cause:** a crawler walked faceted URLs, first on `/search`, then on collection pages
  once `/search` was throttled (up to 11 stacked facets, several CPU-seconds each). The
  deploy that switched `/search` to the fast search timed out on the Drupal health
  wait, so `cim` and the static-shell step never ran, and nginx proxied every anonymous
  `/search` to the legacy view unmetered.
- **Fix:** `docker compose restart drupal`; facet-depth limits on `/search`, a 3/min limit
  on faceted collection pages, limits on legacy CollectiveAccess paths, and a temporary
  `search-page` router until the shell exists.
- **Spot it:** static routes fast, Drupal routes hanging; faceted URLs in the search
  access log. See [Traefik and rate limits](/docs/islandora/operations/traefik-and-rate-limits/).

## 2026-10-26 · CPU saturation from search load

- **Cause:** uncached search and facet requests cost about 0.13 CPU-seconds of Drupal
  page building each (more on PROD), on 2 CPUs and 5 workers. The exact trigger was never
  confirmed because Traefik wasn't keeping access logs.
- **Fix:** the fast search page and stored collection thumbnails. See [Search](/docs/islandora/operations/search/).
- **Lesson:** keep enough access logging to diagnose the next one.

## 2026-10-13 · `/search` facets empty (`drupalSettings` missing)

- **Cause:** an unclosed `<div>` in `block--advanced-search.html.twig` pushed the
  settings JSON out of `<body>`, so `drupalSettings` was empty on `/search` and facets
  logged soft-limit errors.
- **Fix:** close the tag (theme bump, 2026-10-13).

## 2026-09-22 → 09-28 · Milliner stops writing media to Fedora

- **Symptom:** Milliner errors: `Cannot parse 'alternate' link header from response to HEAD …/media/N`, `Could not parse http://schema.org/dateModified`, then Fedora `400 Invalid value` on `ebucore:hasMimeType`. The `islandora-indexing-fcrepo-media` queue backs up.
- **Cause, three stacked problems:**
  1. `islandora_workbench_integration`'s route subscriber made media GET access *neutral* without a Request, so every `rel="alternate"` link header was stripped. Patched in `ff17cfc`.
  2. The `fits_technical_metadata` bundle had no RDF mapping (`ceaefe7`).
  3. FITS mime `text/xml; charset=utf-8` is rejected by Fedora (`5467b7c`).
- **Fix:** the commits above. Same day, JWT expiry went from 2h to 24h (`73733d8`).
- **Cleanup:** `scripts/resync-fedora.sh`, about 3.2k media. See [Scheduled Jobs](/docs/islandora/operations/scheduled-jobs/).

## 2026-09-22 · Box swapping to death (heap caps)

- **Symptom:** about 5.8 GB in swap; everything slow.
- **Cause:** no JVM had `-Xmx`, so each took ¼ of RAM, about 13 GB reserved on a 7.7 GB VM. Cantaloupe alone was `-Xms3G -Xmx5G` for a 57 MB live set.
- **Fix:** heap caps in compose (`67ac808`).
- **Open:** Alpaca leaks `TrustAnchor` objects (about 611k; the truststore is reloaded per HTTPS client). The 768m cap makes it OOM loudly instead of eating the host. `heap-monitor.sh` watches it.
- **Spot it:** swap growth, OOM-killer lines in `dmesg`, Alpaca restarts.

## 2026-09-21 · Root filesystem 96% full mid-ingest

- **Cause:** the containerd store (`/opt/containerd`) stayed on `/` when the Docker data-root moved to `/data`, and image layers and build cache piled up.
- **Fix:** the nightly `docker-image-cleanup.sh`.

## 2026-09-18 · About 5,800 image derivatives silently dropped

- **Cause:** a bulk ingest saturated php-fpm. Alpaca's derivative PUTs failed, and with no DLQ the messages were gone.
- **Fix:** `backfill-image-derivatives.sh` every 15 min. (Now committed.)

## 2026-09-15 · Deploy ran 12 commits behind

- **Cause:** the hook ran `make deploy` from a stale checkout.
- **Fix:** the `deploy-auto` target, which pulls first and then runs a fresh make.

## 2026-09-03 · IIIF images all 500 (cert drift)

- **Cause:** a hand-rolled `mkcert` on 08-27 during the domain move.
- **Fix:** `make traefik-certs` plus a recreate. See [Certificates](/docs/islandora/operations/certificates/) and `docs/tls-cert-drift-runbook.md`.

## 2026-08-11 → 09-04 · No deploys for 3.5 weeks

- **Symptom:** every workflow failed with `404 Hook not found.`
- **Cause:** the unit expected `hooks.yaml`, the file was `hooks.yml`, so `webhook` served zero hooks. The working dir also pointed at `/opt/sacda-islandora`, which never existed.
- **Fix:** rename, fix the path, restart. See `docs/webhook-deploy.md`.

## 2026-08-25 (and 08-18) · Facet crawl takes the site down

- **Symptom:** hours of 502s; all 5 php-fpm workers pinned by `/search` with 8–9 stacked facets.
- **Fix:** facet-depth rate limits, the bot throttle and the robots.txt patch. See [Traefik and Rate Limits](/docs/islandora/operations/traefik-and-rate-limits/).
- **Gotcha found on the way:** `kill -USR2 1` in the drupal container kills s6, and with it the container.

## 2026-08-04 · Deleting a content type took out search

- **Symptom:** after deleting the unused `collection_file` content type, `/search` lost
  its view, all 33 facets and 43 blocks.
- **Cause:** the search view depended on one of the type's field storages, so Drupal
  deleted it and everything depending on it. Watchdog logged none of the cascaded
  deletes.
- **Lesson:** never delete types or fields in the UI. Export the change and review the
  config diff; a view, facet or block in the delete list means stop. Take a database
  backup first. See [Data model research](/docs/islandora/research/data-model/).

## ~2026-08-04 → 08-18 · Objects never reached Fedora

- **Cause:** the ingest account lacked `fedoraadmin`.
- **Impact:** about 4,256 objects missing in Fedora.
- **Status:** unknown. See [Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/).

## 2026-07-31 → 08-04 · Disk full → ActiveMQ backlog → fake auth errors

- **Symptom:** Milliner `401 ExpiredTokenException` everywhere; 533 messages stuck in `fcrepo-file-external`.
- **Cause:** the root LV was full, so KahaDB couldn't checkpoint.
- **Lesson:** the 401 was a symptom. Free disk and leave the queue alone; don't purge it or rotate credentials. Watch `QueueSize` fall while `EnqueueCount` stays flat. Discarded messages mean objects need re-indexing as uid 1.
- **Follow-up:** the Docker data-root moved to `/data`.

## 2026-07-23 → ~09-04 · Every audio/video derivative failed

- **Symptom:** A/V derivatives never appeared; about 20k `statusCode: 500` retries in the Alpaca logs; the site looked fine.
- **Cause:** a stray `%canonical` arg in `conf/homarus/scyllaridae.yml` put the node URL where ffmpeg expects the output filename.
- **Fix:** remove it, then backfill (`docs/video-service-file-backfill.md`).
- **Spot it:** diff the file against the image copy ([Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/)).

## 2026-07-23 · `/search` 500 "Query type numeric doesn't exist"

- **Cause:** a `granularity_item` processor added through the UI on `facets.facet.year`.
- **Fix:** removed. If it recurs, check facet processors, not the theme.

## 2026-07-21 · Alpaca/fcrepo PKIX errors

- **Cause:** those services lacked the `CERT_PUBLIC_KEY`/`CERT_AUTHORITY` secrets, which meant a 0-byte CA (`de8fad6`).

## 2026-07-17 · Derivatives had never worked

- **Symptom:** no thumbnails, service files or OCR for any media type since setup.
- **Cause, two stacked bugs:**
  1. Alpaca had no CA certificate secrets, so its CA files were 0 bytes and its Java
     truststore had no mkcert entry. `curl` in the same container worked (the OS store
     was fine), which hid it. Every PUT back to Drupal failed with PKIX errors. Fedora had
     the same problem and returned `400 Unable to access external binary`.
  2. uid 1 lacked `fedoraadmin`, so its JWT couldn't authorise writes: 403, not 401.
- **Fix:** give every JVM service that talks to `https://${DOMAIN}` the
  `CERT_PUBLIC_KEY` and `CERT_AUTHORITY` secrets, and `drush user:role:add fedoraadmin
  admin` (now `make fedora-grant` on every deploy).

## Domain change: `islandora.ufv.ca` → `sacda.ufv.ca`

- `9a407c2` (08-13) made every hostname derive from `DOMAIN`. `.env` was switched around 09-03/04, and the docs followed on 09-15.
- Leftovers: faked referrers claiming the old name; hardcoded `sacda.ca` links in the theme ([Environments and Access](/docs/islandora/start/environments-and-access/)).
