---
title: Exhibits and static files
description: The six static exhibit sites, how they are routed and built, and the /static drop folder.
sidebar:
  order: 10
---

The six digital exhibits are **static builds served by the `exhibits` nginx container** straight off `/data/exhibits`. Drupal doesn't render them. `/exhibits` (the listing page) *is* Drupal: a View of `exhibit` nodes.

## The six

Slugs are frozen: they match the legacy `sacda.ca/exhibits/*` links.

| URL | Repo | Build |
|---|---|---|
| `/exhibits/km` | `komagata-maru-exhibit` | legacy PHP, flattened (keeps `.php` filenames) |
| `/exhibits/disenfranchisement` | `disenfranchisement-exhibit` | legacy PHP, flattened |
| `/exhibits/union-zindabad` | `union-zindabad-exhibit` | SvelteKit `adapter-static` |
| `/exhibits/legal-history` | `legal-history-exhibit` | SvelteKit |
| `/exhibits/sacmbc` | `muslims-in-bc-exhibit` | SvelteKit |
| `/exhibits/emergence` | `emergence-movie-exhibit` | SvelteKit (SPA fallback); builds `sacda-exhibits-common` from source |

## Routing

- `conf/traefik/exhibits.yml` matches **each slug explicitly** at priority 1100. A blanket `PathPrefix(/exhibits)` would swallow the Drupal listing.
- nginx (`conf/exhibits/nginx.conf`) serves `/data/exhibits` read-only and serves `.php` as `text/html`.

## Update an exhibit

Push to the exhibit repo's `main`, then on the server:

```
./scripts/deploy-exhibits.sh union-zindabad
./scripts/deploy-exhibits.sh
```

The first form rebuilds one exhibit; the second rebuilds all six. Each build shallow-clones the repo in a throwaway `node:20` / `php:8.2` container and writes to `/data/exhibits/<slug>`. There's nothing to restart. The script pins SvelteKit `kit.paths.base` to the slug, overriding whatever the repo ships.

## Add an exhibit

1. Pick the slug. It's permanent.
2. The repo must be public and in the org. SvelteKit must use `adapter-static`.
3. Add a row to `EXHIBITS=(…)` in `scripts/deploy-exhibits.sh`.
4. Add `|| PathPrefix(`/exhibits/<slug>`)` to `conf/traefik/exhibits.yml`. Without it the path falls through to Drupal and 404s.
5. Run `./scripts/deploy-exhibits.sh <slug>`.
6. In Drupal, create an Exhibit node: title, description, thumbnail, `field_slug`, and **URL alias `/exhibits/<slug>`**. The card links via the alias. To show it on the homepage, tick *Promoted to front page*.
7. Commit the script and Traefik changes.

## Exhibit nodes

- They're content, so `cim` doesn't carry them. Recreate them with `scripts/restore-exhibits.sh apply` (seed data in `scripts/exhibits-seed/`, taken from prod nodes 7130–7135).
- The homepage "Featured Exhibits" block shows promoted exhibit nodes that have a thumbnail. Sticky ones come first, then most recently updated.
- Thumbnails must use the `media_thumbnail` formatter, not the media `default` view mode, which dumps Islandora's metadata table into the card.

## Dead code to remove

`isle-modules` still ships the **abandoned Shadow DOM exhibit viewer**:

- `src/Controller/ExhibitController.php`
- `js/sacda-exhibit.js`
- `templates/sacda-exhibit.html.twig`
- `exhibits/`
- the `/exhibits/{node}` and `/exhibits/{node}/assets/{path}` routes

Traefik only shadows the six slugs, so `/exhibits/<nid>` still reaches it. SvelteKit can't hydrate in a shadow root (`document.currentScript` is null there), which is why the approach was dropped.

## `/static/`

A drop folder served verbatim from `/opt/islandora-prod/static` (for example `/static/update.ps1`, used by the ingest machine's updater). It lives in the repo because `/data` is root-owned and the service account has no passwordless sudo.
