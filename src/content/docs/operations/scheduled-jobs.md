---
title: Scheduled jobs
description: 'Host cron and Drupal cron: what runs, when, and why.'
sidebar:
  order: 4
---

## Service account crontab (host local time)

| Schedule | Command | Why | Keep? |
|---|---|---|---|
| `*/15 * * * *` | `MAX_NODES=100 scripts/backfill-image-derivatives.sh` | Makeshift **dead-letter queue**: re-dispatches missing image Service File (899) and Thumbnail (900). Alpaca has no DLQ and silently dropped about 5,800 derivatives during a bulk ingest on 09-18 | **Yes.** Committed to `isle` in October 2026. It persistently logs "still missing service_file=1, thumbnail=1"; direct SQL finds 0, so it's probably a join quirk |
| `0 22,23,0-5 * * *` | `scripts/backfill-service-files.sh` | Serial video/audio Service File backfill, one file at a time, 22:00–06:00 | Backlog is 0. Safety net for future A/V ingests; cheap when idle |
| `30 3 * * *` | `scripts/docker-image-cleanup.sh` | Prune unused images older than 72h plus build cache (containerd lives on `/`) | Yes |
| `5 * * * *` | `scripts/heap-monitor.sh` | Hourly JVM heap stats → `logs/heap-monitor/heap.tsv` | Temporary: watches the Alpaca truststore leak ([Incident Log](/docs/operations/incident-log/)) |
| `35 */6 * * *` | `HISTO=1 scripts/heap-monitor.sh` | Class histograms | Same |
| `0 22,23 30 9 *` and `0 0-5 1 10 *` | `scripts/resync-fedora.sh` | One-off Fedora RDF resync after the Milliner/FITS incident, night of 2026-09-30 | **Remove after it completes**; see below |

No project systemd timers exist. The only project unit is `webhook.service`. Root's crontab couldn't be read (sudo needs a password), so **root cron is unknown**.

## `resync-fedora.sh` status

- It fixes about 3.2k media (mostly FITS) whose RDF never reached Fedora between 2026-09-22 19:00 UTC and the 09-28 hotfixes.
- As of 09-29 only a 2-node smoke test had run. State file: `logs/fedora-resync.state`.
- The cron covers **one night** (09-30 22:00 → 10-01 06:00). After that, read `logs/fedora-resync.log`:
  - If it reached the end of both node and media lists: delete the cron lines.
  - If it stopped at the window edge: add more nights, or run it by hand in a quiet period. It resumes from the state file.

```
WINDOW_START=0 WINDOW_END=24 scripts/resync-fedora.sh
```

## Drupal cron

- **Mechanism:** `automated_cron`, interval 10800s. It fires only on a web request after the interval, and no system cron calls `drush cron`.
- **What it does:** among other things, `authority_resolver` refreshes up to 200 cached authority records per run.
- **Last run:**

```
docker compose exec drupal drush state:get system.cron_last
```
