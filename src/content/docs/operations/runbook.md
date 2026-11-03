---
title: Runbook
description: Day-to-day commands for health, logs, queues, restarts, search and disk.
sidebar:
  order: 3
---

All commands run from `/opt/islandora-prod` as the service account unless noted. Container names are `isle-sacda-<service>-1`.

## Health

```
make status
docker compose ps
make ping
docker compose exec drupal drush status
docker compose exec drupal drush search-api:status
free -h
df -hT / /data
docker system df
```

`du` as the service account can't read `/data/docker` and under-reports. Measure volumes with:

```
docker run --rm -v /data/docker:/dd:ro alpine du -sh /dd/volumes/*
```

## Logs

```
docker compose logs --tail 100 -f drupal
docker compose logs --since 30m alpaca milliner homarus houdini
journalctl -u webhook.service --since today
ls -la logs/
```

`logs/` holds cron output: `cron.log`, `image-derivative-backfill.log`, `video-service-file-backfill.log`, `fedora-resync.log` and `heap-monitor/`. **Nothing rotates them**, so trim them occasionally.

## Queues (ActiveMQ)

Read-only queue depths through Jolokia:

```
docker compose exec activemq sh -c 'curl -s -u admin:$(cat /run/secrets/ACTIVEMQ_WEB_ADMIN_PASSWORD 2>/dev/null) "http://localhost:8161/api/jolokia/read/org.apache.activemq:type=Broker,brokerName=localhost,destinationType=Queue,destinationName=*/QueueSize"'
```

Adjust the credential path to whatever the image uses. Never use the REST `oneShot` endpoint: it **consumes** messages.

What normal looks like: every queue at 0 except `islandora-connector-homarus` while videos transcode. A queue whose depth keeps climbing while its dequeue count is flat is stuck.

## Restarting things

```
docker compose restart <svc>
docker compose up -d --force-recreate <svc>
```

- **Never `kill -USR2 1` in the drupal container.** PID 1 is `s6-svscan`, and USR2 takes the whole container down. To reload php-fpm:

```
docker exec isle-sacda-drupal-1 sh -c 'kill -USR2 $(pgrep -f "php-fpm: master")'
```

- Hand edits to `www.conf` or nginx inside the container are re-rendered by confd on restart. Use the `PHP_*` / `NGINX_*` env vars in `docker-compose.yml`.
- JVM services (fcrepo, alpaca, cantaloupe, blazegraph, solr) import the CA **only at start**. After any cert change: `docker compose up -d --force-recreate`.
- `conf/exhibits/nginx.conf` is a single-file bind mount. `nginx -s reload` keeps the old file, so use `docker compose up -d --force-recreate exhibits`.
- `conf/traefik/*.yml` hot-reloads. Docker-label changes on the `traefik` service need `docker compose up -d traefik`.

## Search

```
docker compose exec drupal drush search-api:status
docker compose exec drupal drush search-api:index
docker compose exec drupal drush search-api:reset-tracker
docker compose exec drupal drush search-api:rebuild-tracker
```

Solr is rebuildable from Drupal. There's one index, `default_solr_index`.

## Drupal cron

Drupal cron runs through `automated_cron` (every 3h, fired by web traffic). To run it now:

```
docker compose exec -T drupal drush cron
```

## Disk cleanup

```
./scripts/docker-image-cleanup.sh
```

It runs nightly anyway. **Never** `docker system prune --volumes`, and never remove unlabelled volumes without reading [Backups](/docs/operations/backups/). Check the service account's home directory for stray large files too (an old video and an old database dump were found there in September 2026).

## Useful one-off scripts in `scripts/`

| Script | What |
|---|---|
| `backfill-fire-derivative.php` | Fire one named derivative action for one node as uid 1 (used by the backfill scripts) |
| `backfill-service-files.sh` | Serial video/audio service file backfill |
| `resync-fedora.sh` | Re-push RDF to Fedora since a cutoff |
| `authority-reconcile.sh` | LCSH/TGM links on subject terms |
| `restore-exhibits.sh` | Recreate the six exhibit nodes |
| `rebuild-bundle-field-map.sh` | Clear ghost bundles |
| `deploy-exhibits.sh` | Build static exhibits into `/data/exhibits` |
| `generate-certs.sh` (`make traefik-certs`) | Regenerate the internal cert, see [Certificates](/docs/operations/certificates/) |
| `fix-exif-orientation.sh` | Re-orient images |

Also in `scripts/`: `backfill-image-derivatives.sh` (runs every 15 minutes from cron),
`backfill-document-thumbnails.sh`, `rederive-missing-service-files.sh`,
`create-legacy-redirects.{sh,php}`, `traffic-export.sh` and `search-stats.sh`.

## Traffic monitor

The `traffic-monitor` service snapshots Traefik metrics and container CPU every 5 minutes
and caps the search access log at 50 MB. It was added in late October 2026 to measure the
new search page. Export a report with `scripts/traffic-export.sh`. Start it with:

```bash
docker compose up -d traefik traffic-monitor
```
