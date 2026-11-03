---
title: Config management
description: config/sync, drush cim on every deploy, and what config does not carry.
tags: [drupal]
sidebar:
  order: 2
---

## Rules

- Drupal config lives in `drupal/rootfs/var/www/drupal/config/sync` and is **baked into the image**.
- **Every deploy runs `drush cim -y`.** Whatever is in git wins, and UI changes on prod are reverted on the next deploy.
- To change config: make the change locally or on dev, then run `drush cex -y`, review the YAML, commit and push.
- If someone did change prod through the UI, capture it before the next deploy:

```
docker compose exec drupal drush config:status
docker compose exec drupal drush cex -y --destination=/tmp/prod-config
docker compose cp drupal:/tmp/prod-config ./prod-config
```

  Diff that against `config/sync`, then commit what you want to keep. Commit `db02c0c` ("capture live DB drift into config/sync") is the precedent.

## What `cim` does NOT carry

These are **content**, not config. Recreate them per environment with the listed script.

| Thing | How it gets onto an environment |
|---|---|
| Hero background media | `sacda_modules` deploy hook `pin_hero_media` creates them from `image_fallback` in the theme (runs automatically via `drush deploy:hook`) |
| Exhibit nodes (six) | `scripts/restore-exhibits.sh apply` |
| Subject term authority links | `scripts/authority-reconcile.sh` ([Authorities and Place Lookup](/docs/islandora/development/authorities-and-place-lookup/)) |
| Team members, media items, supplement pages | `scripts/seed/seed-supplement-content.php` in the theme, or Workbench configs in `g/config/supplement/` |
| Main menu links, URL aliases, redirects | By hand or Workbench |
| `fedoraadmin` on uid 1 | `make fedora-grant` (runs on every deploy) |
| Place lookup table | `drush sacda-place:sync-authority` (needs dumps) |
| Bundle field map | Derived state; `make rebuild-bundle-field-map` (runs on every deploy) |

## Deploy steps that exist because of past breakage

- **`legacy-modules-uninstall`** is a one-time migration from the old `sacda_hero`/`sacda_exhibits`/`sacda_search` modules to the merged `sacda_modules`. It no-ops now and can be removed eventually.
- **`rebuild-bundle-field-map`** clears ghost bundles such as `collection_file` from the persistent field map. Without it, every `cim` logs `A non-existent config entity name returned by FieldStorageConfigInterface::getBundles()`. `drush cr` can't fix that.
- **`custom-modules-enable`** runs `pm:install sacda_modules`. It's belt-and-braces; on prod it should no-op.
- **`fedora-grant`** runs `drush user:role:add fedoraadmin admin`. It's DB state, so re-applied every time.

## Dev modules

PROD runs the image CI builds, so development and debugging modules are not enabled there. Keep them out of `core.extension.yml`; enable them on DEV only.
