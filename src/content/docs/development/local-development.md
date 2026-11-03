---
title: Local development
description: Run the stack on your machine, the dev override, config sync discipline, Composer, and the DEV instance.
sidebar:
  order: 1
---

## Run it

```bash
git clone --recurse-submodules git@github.com:south-asian-canadian-digital-archive/isle.git
cd isle
cp sample.env .env          # then set DOMAIN, TAG and anything else you need
ln -s docker-compose.dev.yml docker-compose.override.yml
make up
```

The local site is `https://islandora.traefik.me` (`traefik.me` is wildcard DNS to
localhost).

| Command | What |
|---|---|
| `make build` | Pull base images and build the drupal image (runs `composer install`) |
| `make up` / `make down` | Start or remove the stack |
| `make up-drupal` | Start one service |
| `make logs-drupal` | Tail a service |
| `make deploy` | Pull the image, then `updb`, `cim`, `cr` and the rest (see [Deploying](/docs/operations/deploying/)) |
| `docker exec isle-sacda-drupal-1 drush <cmd>` | Run drush |

## What the dev override does

`docker-compose.dev.yml` sits on top of `docker-compose.yml`:

- **Bind-mounts** the theme, custom modules, `config/sync` and
  `composer.json`/`composer.lock`, so edits are live.
- Points Drupal at Fedora over the internal network (`http://fcrepo:8080/fcrepo/rest/`).
- Lets Cantaloupe fetch sources over the self-signed internal HTTPS.
- Mounts `./place-dumps` for the place lookup import.

Never load it on PROD. Machine-specific overrides (tunnels, ports) live in their own
untracked files since 2026-10-27.

## Config sync discipline

`drush cim` overwrites the live database from `config/sync` and **deletes anything not in
it**. Any config edited on a running box, in the UI or by a script, is live-only until
exported. So:

1. **When you arrive**, run `drush config:status`. If it isn't "No differences", those
   rows are someone's uncaptured live edits. Look at each one, `drush cex`, and commit it
   **separately** from your own work.
2. Make your change, export it immediately (`drush cex`, or a targeted
   `drush config:get <name> --format=yaml > config/sync/<name>.yml`), and commit it on its
   own.
3. **Leave** with `config:status` reporting "No differences".

Prefer editing the live database and exporting over hand-writing YAML and importing,
because an import can clobber someone else's live edits.

Content-side fixes that `cex` can't see (roles on users, media entities, file metadata,
derivative rebuilds) don't travel either. Commit the script that does them to `scripts/`
and note that it needs running on each environment.

Comments in `config/sync/*.yml` are stripped by the next `cex`. Document here instead.

## Composer changes need a rebuild

`composer.json` and `composer.lock` are bind-mounted, but `vendor/` and
`web/modules/contrib/` are **baked into the image**. `make up` doesn't run
`composer install`, so a `composer require` inside the container vanishes on the next
recreate:

```bash
docker exec isle-sacda-drupal-1 composer require drupal/foo -d /var/www/drupal
make build
make up
```

Contrib patches live in `drupal/rootfs/var/www/drupal/assets/patches` and are applied by
`cweagans/composer-patches`.

## Settings that come from the environment

Several settings are overridden in `settings.php` from the container environment, so the
stored config is a placeholder. **Don't "fix" these in `config/sync`.** That would bake
one environment's hostname into every other.

- `islandora_iiif.settings:iiif_server` and `openseadragon.settings:iiif_server` come from
  `DRUPAL_DEFAULT_CANTALOUPE_URL` (`${URI_SCHEME}://${DOMAIN}/cantaloupe/iiif/2`). It must
  be the **public** URL, because browsers fetch it from the manifest.
- The Islandora broker URL, the Solr connector and the Islandora RSA key are overridden
  the same way.

`drush cget` shows the stored placeholder and looks broken. Check the effective value:

```bash
docker exec isle-sacda-drupal-1 drush cget islandora_iiif.settings iiif_server --include-overridden
```

Related: upstream's `configure_openseadragon` step is never called by this image's
install script, so `media.settings:standalone_url` stayed `false` and media have no
view page (`/media/N` redirects to the edit form).

## Internal traffic

Container-to-container calls should use in-network endpoints (`http://fcrepo:8080`,
`http://cantaloupe:8182`) rather than the public hostname, unless the certificate chain
is known good. If you add a JVM service that calls `https://${DOMAIN}`, give it the
`CERT_PUBLIC_KEY` and `CERT_AUTHORITY` secrets. See [Certificates](/docs/operations/certificates/).

## Common local problems

- `PluginNotFoundException: The "..." plugin does not exist` after a down/up: stale
  plugin cache. `drush cr`.
- Deep zoom shows the viewer but no tiles: check whether `cantaloupe` has exited
  (`docker compose ps -a`). Nothing alerts on it.
- Traefik can't bind 443 although `docker ps` shows the port: something else on the host
  already listens on 443. Stop it, recreate traefik, then start it again, or run with
  `HOST_SECURE_PORT=8443`.

## The DEV instance

DEV is a public developer instance on a maintainer's machine, behind a tunnel that runs as
a Compose service. It runs `main`-track code with the newest experiments (Drupal 11 first,
the thesaurus, Skosmos, VocBench tests). It's acceptable to break DEV; it is not
acceptable to touch PROD without being asked.

DEV has had Drupal's development settings on (page, render and dynamic caches off), so
performance numbers from DEV understate caching.

## Staging builds

Running the *Build and Deploy* workflow by hand builds a `:dev` image from chosen theme
and module branches. It refuses branches that are behind `main`. Nothing deploys it
automatically, because TEST isn't reachable from GitHub. On TEST: `git pull && make deploy`,
then `drush cr`. When `.env` has `TAG=dev`, `make deploy` extracts the theme and modules
from the image.
