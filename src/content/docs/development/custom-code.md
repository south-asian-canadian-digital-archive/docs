---
title: Custom code
description: The theme and custom modules, how they ship, and what each one does.
sidebar:
  order: 3
---

The theme and two of the custom modules are **git submodules** of `isle`; `sacda_fast_search` lives directly in `isle`. Everything is baked into the image by CI.

| Path in `isle` | Repo | What |
|---|---|---|
| `drupal/rootfs/var/www/drupal/web/themes/custom/sacda` | `isle-theme` | Theme: Tailwind 4 + TypeScript + GSAP + embla-carousel, built with **bun** |
| `drupal/rootfs/var/www/drupal/web/modules/custom/sacda_modules` | `isle-modules` | Heroes, place lookup, facets extras, homepage exhibits, thumbnail fallback |
| `drupal/rootfs/var/www/drupal/web/modules/custom/authority_resolver` | `authority_resolver` | Resolves authority IDs → labels, reconciles terms |
| `drupal/rootfs/var/www/drupal/web/modules/custom/sacda_fast_search` | in `isle` (mirrored to `isle-fast-search`) | The `/search` page: JSON API plus Svelte |

## Workflow

1. Change code in the submodule repo; commit and push there (use `dev` → `main` if you want).
2. In `isle`, bump the pointer and push to `main`:

```
cd drupal/rootfs/var/www/drupal/web/themes/custom/sacda
git pull origin main
cd -
git add drupal/rootfs/var/www/drupal/web/themes/custom/sacda
git commit -m "bump theme"
git push
```

   **Don't start the message with `chore:` or `ci:`**, or nothing deploys.
3. CI builds the theme (`bun install --frozen-lockfile && bun run build`) and bakes everything into the image.

`dist/` is gitignored in the theme. It only exists in the image or after a local build. To see what's *live*, look inside the container, not at the checkout:

```
docker compose exec drupal ls /var/www/drupal/web/themes/custom/sacda/dist
```

## Theme (`sacda`)

- Dev: `bun run dev` (watch plus livereload), or `make check-theme` from `isle`.
- Page templates are picked by alias suggestions (`includes/suggestions.inc`): `/about/team` → `page--about--team.html.twig`.
- Theme settings (carousel slides, colours, footer) live under `includes/theme_settings*.inc`. With no slides configured, the carousel falls back to hardcoded images that **link to legacy `sacda.ca`**.
- **There's no README in the theme repo.** `.agent/rules/*.md` point at `~/islandora-dev` and old container names, so they're stale for anyone else.

Theme gotchas:

- **Unlayered CSS beats layered Tailwind.** Core's `.hidden{display:none}` defeats layered utilities like `md:inline-block`. That's why some visibility rules live unlayered in `src/css/_base.css`. If "the class is right but the style doesn't apply", suspect this first.
- The `--secondary` token is dark grey despite its "yellow" comment. Use `--light` for light yellow.
- `field_description` storage is shared with Islandora bundles, so it's plain text on `media_item`/`exhibit`.

## `sacda_modules`

A merge of the old `sacda_hero`, `sacda_exhibits` and `sacda_search` modules.

**Heroes.**
- Stored as config entities at `/admin/structure/sacda-hero`, matched by exact URL alias.
- Media is stored by UUID. The `pin_hero_media` deploy hook creates missing media from theme images, so heroes survive a fresh environment.

**Promoted exhibits.** Feeds the homepage Featured Exhibits from promoted Exhibit nodes that have a thumbnail.

**Thumbnail fallback.** `DiscoverFirstAvailableChildThumbnailSubscriber`: collections without their own thumbnail use the first child that has one. Depends on `dgi_image_discovery`. Since 2026-10-28 the result is stored in the `sacda_thumbnail` table (`StoredImageDiscovery`), filled by `drush sacda:thumbnails:rebuild` and cleared for ancestors when a node or media is saved. See [Search](/docs/operations/search/).

**Ingest audit.** Submodule `sacda_ingest_audit`, a Svelte page at `/admin/content/ingest-audit`. See [Ingest audit](/docs/ingest/ingest-audit/).

**Year range facet widget.** `YearRangeWidget`, needs `facets_date_range`.

**Place lookup.**
- `/admin/content/places/lookup`. See [Authorities and Place Lookup](/docs/development/authorities-and-place-lookup/).
- **Uninstalling the module drops its table.**
- Drush 13 command discovery is convention-only and fails silently. It needs `src/Drush/Commands/*Commands.php` with a namespace ending in `\Drush\Commands`, then `drush cr`.

**Dead code:** the Shadow DOM exhibit viewer. See [Exhibits and Static Files](/docs/operations/exhibits-and-static-files/).

The module's README title still says "SACDA Hero".

## `authority_resolver`

A general-purpose module, well documented in its own README.

- Authorities are config entities at `/admin/config/services/authority-sources`.
- Shipped and enabled: `lcsh`, `tgm`, `lcgft`, `naf`. Shipped disabled: `wiki`, `aat`, `tgn`.
- **Never resolves during a page render.** Labels are stored in the entities.
- Cache table `authority_record` survives `drush cr`. Cron refreshes 200 records per run.
- `authority_resolver_cat` maps records onto `controlled_access_terms` authority-link fields.
- `user_agent` is empty in settings. id.loc.gov may throttle anonymous clients, so set one if error counts climb.

## `sacda_fast_search`

Serves `/search` and `/api/search`. Built for this site's theme and facet setup, not a
general module. Its UI is in `ui/` (Svelte 5); CI builds it. See
[Search](/docs/operations/search/).

## Thesaurus modules (DEV only)

`skos_export` (from `islandora-skosmos`) and `vocbench_sync` (from `islandora-vocbench`)
run on DEV only, bind-mounted from their repos. See
[Authorities and thesaurus research](/docs/research/authorities-and-thesaurus/).

## Contrib patches

Patches live in `drupal/rootfs/var/www/drupal/assets/patches` and are applied by `cweagans/composer-patches`, including the Milliner/workbench-integration fix. Composer runs in its own image layer, so it only re-runs when `composer.json`, `composer.lock` or `assets/` change.

Upgrading Islandora or Drupal: bump in `composer.json` on dev, then `composer update` in the dev container, commit the lock and test the derivatives. Don't change `ISLANDORA_TAG` on prod without testing on dev first.
