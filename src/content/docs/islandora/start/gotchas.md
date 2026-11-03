---
title: Gotchas
description: The things most likely to break the site, each with a link to the fix.
sidebar:
  order: 3
---

Roughly in order of how often they have bitten.


1. **Editing config in the Drupal UI.** Every deploy runs `drush cim -y`, so anything
   not exported to git is silently reverted. → [Config management](/docs/islandora/operations/config-management/)
2. **Hand-editing tracked files on the server.** `deploy-auto` refuses a dirty tree, and
   CI still shows green. Change things in git. → [Deploying](/docs/islandora/operations/deploying/)
3. **Renaming or editing `hooks.yaml` without restarting `webhook`.** There's no hot
   reload, and a wrong filename means zero hooks and silent 404s for weeks.
   → [Deploying](/docs/islandora/operations/deploying/)
4. **Deleting the backfill cron scripts.** `scripts/backfill-image-derivatives.sh` runs
   every 15 minutes and is the only dead-letter queue. → [Scheduled jobs](/docs/islandora/operations/scheduled-jobs/)
5. **Running `mkcert` by hand.** Use `make traefik-certs`, then
   `docker compose up -d --force-recreate`. A bad internal certificate breaks IIIF and
   derivatives while the site looks fine. → [Certificates](/docs/islandora/operations/certificates/)
6. **Touching `conf/homarus/scyllaridae.yml` without diffing it against the image.** One
   stray argument killed all audio and video derivatives for six weeks.
   → [Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/)
7. **Ingesting without `fedoraadmin`, or firing derivatives from plain `drush`.** You get
   Fedora 403s and anonymous JWTs. Act as uid 1. Re-saving media regenerates nothing.
   → [Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/)
8. **`docker system prune --volumes`, changing `COMPOSE_PROJECT_NAME`, or deleting
   "unused" volumes.** Recovery means restoring a `/data` snapshot and losing everything since it. → [Backups](/docs/islandora/operations/backups/)
9. **`kill -USR2 1` in the drupal container, or deploying during an ingest or a crawl.**
   PID 1 is s6, so USR2 takes the container down. A deploy restarts php-fpm, and Alpaca
   has no dead-letter queue. → [Runbook](/docs/islandora/operations/runbook/)
10. **Adding Traefik routers or loosening rate limits.** A new host-wide router at the
    wrong priority captures `/exhibits`, `/static`, `/hooks` or `/search`. The limits are
    global buckets sized for 5 php-fpm workers.
    → [Traefik and rate limits](/docs/islandora/operations/traefik-and-rate-limits/)

Also:

- **Deleting a content type or field through the UI.** Config dependencies cascade:
  deleting `collection_file` on 2026-08-04 silently took the search view, all facets and
  43 blocks with it. Remove things by exporting and reviewing the config diff.
- **Composer changes in a running container** vanish on the next recreate. Rebuild the
  image. → [Local development](/docs/islandora/development/local-development/)
- **Comments in `config/sync/*.yml`** are deleted by the next `drush cex`. Document
  things here instead.
- Never load `docker-compose.dev.yml` on PROD. Its heap sizes and mounts are for a
  developer machine.
- Commits starting `chore:` or `ci:` don't deploy.
- Never hardcode a hostname; use `DOMAIN`.
- The internal mkcert certificate expires on **2028-12-03**.
