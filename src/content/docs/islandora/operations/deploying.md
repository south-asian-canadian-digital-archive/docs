---
title: Deploying
description: 'Push to main goes live: the deploy path, its surprises, staging, and rollback.'
tags: [github-actions, docker, make]
sidebar:
  order: 1
---

## The path

```
push to main
  → .github/workflows/build-deploy.yml
      build: bun build theme → buildx Drupal image → push :latest to GHCR
      deploy-production: POST https://$DOMAIN/hooks/deploy-sacda  (X-Webhook-Token)
  → campus proxy → traefik /hooks/ (6/min, burst 3) → host :9000
  → webhook.service (runs as the service account, EnvironmentFile=.env)
  → hooks.yaml → make deploy-auto   (in /opt/islandora-prod)
```

`make deploy-auto`:

1. Refuses to run on a detached HEAD, no upstream, or **tracked** local changes.
2. `git pull --ff-only`, then `git submodule update --init --recursive`.
3. Hands off to a *fresh* `make deploy`. This matters because make parses the Makefile once, so a pull inside `deploy` would run the old recipe.

`make deploy` then runs:

```
check-upstream
legacy-modules-uninstall
docker compose pull drupal
docker compose up -d exhibits      reload nginx before the /search shell route matters
up-drupal
wait up to 120 s for the drupal health check
drush updb -y
rebuild-bundle-field-map
drush cim -y
custom-modules-enable
drush deploy:hook -y
drush cr
drush sacda-fast-search:shell     regenerate the static /search page
fedora-grant
```

CI only builds and deploys after the quality checks pass (since 2026-10-13).

Only `drupal` and `exhibits` are recreated. **Changes to other services in `docker-compose.yml` need a manual** `docker compose up -d <svc>`.

## Things that will surprise you

- **A deploy under load can stop half way.** On 2026-10-29, during a crawl, the
  120-second health wait timed out, so `updb`, `cim` and the `/search` shell step never
  ran while the new image was already up. If a deploy fails mid-way, rerun `make deploy`
  on the server once the load is gone, then check `drush config:status`.

- **CI green ≠ deployed.** `webhook` answers 200 as soon as it *starts* make. If `deploy-auto` then aborts (dirty tree, pull fails), GitHub never knows. To confirm, compare digests:

```
docker inspect --format '{{.Image}}' isle-sacda-drupal-1
docker buildx imagetools inspect ghcr.io/south-asian-canadian-digital-archive/isle-sacda:latest
journalctl -u webhook.service --since today | grep -i 'finished handling\|error occurred'
```

- **Commits starting `ci:` or `chore:` don't build or deploy.** It's a `startsWith` check, so `chore(ops):` *does* deploy.
- **Every deploy runs `drush cim -y`.** UI config changes not exported to git are reverted. See [Config Management](/docs/islandora/operations/config-management/).
- **A deploy restarts php-fpm**, giving about 1–2 minutes of 502/503. In-flight uploads die, so don't deploy during an ingest.
- **`hooks.yaml` must be named exactly that**, and `webhook` doesn't hot-reload. After editing it:

```
sudo systemctl restart webhook.service
journalctl -u webhook.service --no-pager | grep -i "loaded\|couldn't load"
```

  You want `loaded: deploy-sacda`. A wrong filename means zero hooks and every deploy 404s. That happened from 08-11 to 09-04.
- **Wrong token → 403** (`trigger-rule-mismatch-http-response-code`). **404 `Hook not found.`** means routing is fine but the hooks didn't load. **A Drupal 404 page** means Traefik didn't match `/hooks/`.
- Every call logs `error parsing body payload due to unsupported content type header`. It's noise.
- Every call needs the webhook token, so keep it secret and rotate it in both GitHub and `.env` if it leaks.

## Manual deploy

On the server as the service account:

```
cd /opt/islandora-prod
git status
make deploy
```

`make deploy` deploys whatever is on disk. It warns and prompts if the checkout is behind origin. Use `make deploy-auto` to pull first.

## Staging

Manual dispatch of the workflow builds a `TAG=dev` image (Staging environment) from a chosen theme branch. **Nothing deploys it**, because the test server isn't reachable from GitHub runners. To use it, pull on the test box by hand.

## Rollback

**There has never been a rollback.** CI only pushes `:latest`. There are no per-commit tags, and the nightly cleanup deletes unused local images older than 72h.

**Preferred: revert and push.**

```
git revert <bad-commit>
git push origin main
```

CI builds a new `:latest` and deploys, and `cim` reverts config with the code. It takes about 5–10 min.

**Emergency, with CI down:** find the previous digest (GHCR package page → versions, or an old `docker compose pull` log). Then pin it in an **untracked** `docker-compose.override.yml`:

```
services:
  drupal:
    image: ghcr.io/south-asian-canadian-digital-archive/isle-sacda@sha256:<old-digest>
```

```
docker compose up -d drupal
```

**Delete the override afterwards**, or every future deploy is silently pinned.

**DB caveat:** `drush updb` is forward-only and there are no DB backups ([Backups](/docs/islandora/operations/backups/)). Rolling back across an update hook doesn't undo it.

## Suggested improvements (not done)

- Push a `:<sha>` tag alongside `:latest` so rollback is a one-liner.
- Take a `mariadb-dump` as the first step of `make deploy`.
- Have the deploy report back (Slack or a commit status) so CI green means deployed.
