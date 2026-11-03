---
title: Derivatives and Fedora
description: How thumbnails, service files, OCR and Fedora sync work, and the rules that keep them working.
sidebar:
  order: 9
---

## How it works

When media is saved, Drupal fires context reactions, which put messages on ActiveMQ. Alpaca consumes them and calls a microservice:

| Service | Produces |
|---|---|
| houdini | Image thumbnails and service files, PDF thumbnails |
| homarus | Video/audio service files |
| hypercube | OCR |
| fits | Technical metadata |

The microservice PUTs the result back to Drupal. Milliner mirrors nodes and media into Fedora.

Media-use terms:

| Term | Meaning |
|---|---|
| 897 | Original File |
| 899 | Service File |
| 900 | Thumbnail |
| 895 | Extracted Text |

## Expected gaps (not bugs)

- **Audio has no thumbnail.** No action is wired, so audio nodes sit in every "missing thumbnail" query forever.
- **PDFs / Digital Documents have no service file.** The PDF context doesn't define one.
- Compound Object and Paged Content parents have no media of their own.

## Rules

1. **Processing is serial.** One video transcode (13–50 min at about 180% CPU on 2 cores) blocks every other homarus message. Bulk-ingest video in the evening, not during the day.
2. **Alpaca has no dead-letter queue.** A message that fails its retries is gone. The 15-min `backfill-image-derivatives.sh` cron is the only safety net ([Scheduled Jobs](/docs/operations/scheduled-jobs/)).
3. **Re-saving media regenerates nothing.** `islandora_media_update()` exits unless the file field itself changed.
4. **Derivatives fired from plain `drush` run as anonymous.** The JWT has no roles, so the write-back 403s. Always switch to uid 1. `scripts/backfill-fire-derivative.php` does this:

```
docker compose cp scripts/backfill-fire-derivative.php drupal:/tmp/fire.php
docker compose exec -T -e NID=<nid> -e ACTION=<bundle>_generate_a_service_file_from_an_original_file drupal drush php:script /tmp/fire.php
```

   `AbstractGenerateDerivative::execute()` takes the **node**, not the media. Fire one named action rather than `executeDerivativeReactions()`, which on video includes the hour-long transcode.
5. **Fedora needs the literal `fedoraadmin` role** in the JWT. `administrator` isn't enough. Without it, `fedora://` fields (audio, video, `file`) fail with the misleading `Destination file path is not writable`.
6. **JWT expiry is 24h** (raised from 2h on 09-28), because audio transcodes queue for hours and their PUTs were 403ing.
7. **`conf/homarus/scyllaridae.yml` overrides the image's file.** Before debugging any A/V failure, diff it:

```
docker run --rm --entrypoint cat islandora/homarus:6.2.9 /app/scyllaridae.yml | diff - conf/homarus/scyllaridae.yml
```

   The only intended local change is `image/webp` in `allowedMimeTypes`. A stray `%canonical` arg broke every A/V derivative for six weeks.
8. Videos are H.264/AAC but not faststart (`moov` at the end), so the service file really is needed for playback. The re-encode is **bigger** than the source (fixed libx264 preset), so budget disk.

## Health snapshot (2026-09-29)

- Queues: all 0 except homarus (15, transcoding).
- Image objects missing 899/900: **0**.
- Documents missing thumbnails: **129**. `scripts/backfill-document-thumbnails.sh` exists for this; it was last run 09-21.
- Video missing thumbnails: 23 (probably in the homarus queue).
- Leaf objects with **no media at all**: 873 (828 Image, 43 Digital Document, 2 Video). These are metadata-only stubs; see [Known Issues](/docs/reference/known-issues/).

## Fedora sync gaps

| Gap | Window | Size | Status |
|---|---|---|---|
| Milliner/FITS incident | 2026-09-22 19:00 UTC → 09-28 | ~3.2k media RDF | `resync-fedora.sh` scheduled for the night of 09-30 |
| Ingest account lacked `fedoraadmin` | ~2026-08-04 → 08-18 | ~4,256 objects never reached Fedora (40/40 sampled were 404) | **Unknown; backfill never recorded as run** |

Drupal is the source of truth for the public site, so these gaps don't break browsing. They matter for preservation, and for anything reading from Fedora or the triplestore.

The real fix is a Drupal-vs-Fedora count comparison, then re-firing the Index reactions (as uid 1) for anything missing; `resync-fedora.sh` shows the pattern. **TODO**
