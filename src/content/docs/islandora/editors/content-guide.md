---
title: Content guide
description: Adding and changing pages, people, exhibits, carousel slides, collections and items in the Drupal admin.
sidebar:
  order: 1
---

For editors and maintainers working in the Drupal admin at `https://sacda.ufv.ca/user/login`. For code or styling changes see [Theme Guide](/docs/islandora/development/theme/).

## Before you start

- You need your own Drupal account with **administrator** (or content_editor), plus **`fedoraadmin` if you'll upload files**. See [Environments and Access](/docs/islandora/start/environments-and-access/).
- **Know content from config.** It decides whether your change survives the next deploy:

| Content: edit on prod, it sticks | Config: prod edits are **wiped on the next deploy** |
|---|---|
| Nodes (collections, items, team members, media items, exhibits, pages) | Views, blocks, fields, content types, facets |
| Media and files | Hero sections (`/admin/structure/sacda-hero`) |
| Taxonomy terms | Theme settings (carousel, footer partners, social links, colours), if exported to `config/sync` |
| Menu links, URL aliases, redirects | Anything under `/admin/structure` or `/admin/config` |

  To change config: do it on dev/local, export it (`drush cex`), commit it to `isle`, and let it deploy. See [Config Management](/docs/islandora/operations/config-management/). If you must fix config on prod in an emergency, also put the same change in git, or it disappears.
- Don't upload big videos or run ingests while a deploy is going out. Check with whoever is deploying.

## Team members (`/about/team`)

1. **Content → Add content → Team Member** (`/node/add/team_member`).
2. Fill in:
   - **Title**: the person's name
   - **Role**: job title shown under the name
   - **Bio**: rich text; long bios collapse behind "Read more"
   - **Photo**: image media. Upload a new one or pick an existing one. Roughly square works best.
   - **Team Group**: `Team Members` or `Advisory Committee`. A person can have both and appears in both. The old `Project Management` group is treated as Advisory Committee. **No group** puts them in an untitled grid at the bottom.
   - **Weight**: lower comes first within a group.
3. Save, published.

To remove someone, unpublish rather than delete if you might want them back.

## Media & publications (`/about/media`)

These are press coverage, articles, radio clips and so on. Not archival items.

1. **Add content → Media Item** (`/node/add/media_item`).
2. Fill in:
   - **Title**
   - **Description**: plain text, no formatting
   - **Author**: outlet or author, e.g. "Global News"
   - **Publication date**
   - **Category**: `Media` or `Publications`
   - **Source link**: the original URL
   - **Media**: optional upload. A PDF (document), video or audio file plays or previews inline.
   - **Weight**: lower comes first.
3. Save.

## Exhibits (`/exhibits` and the homepage)

An exhibit has two halves:

- the **static site** (built from its own GitHub repo, served at `/exhibits/<slug>`), which needs a maintainer with server access;
- the **Exhibit node** (the card on `/exhibits` and the homepage), which any editor can manage.

**Editing an existing card:** edit the Exhibit node's title, description and thumbnail. To feature it on the homepage, tick **Promoted to front page** under *Promotion options*. **Sticky at top of lists** puts it first. Cards without a thumbnail aren't shown on the homepage.

**Adding a new exhibit:** a maintainer follows [Exhibits and Static Files](/docs/islandora/exhibits/hosting/) → *Add an exhibit*: repo, deploy script, Traefik rule, build. Then create the node:

1. **Add content → Exhibit**: title, description, thumbnail, **Slug** (e.g. `union-zindabad`).
2. Under *URL alias*, set **`/exhibits/<slug>`**, exactly matching the slug. The card's button links through the alias.
3. Promote it if it should be on the homepage.

## Homepage carousel

**Appearance → Settings → SACDA** (`/admin/appearance/settings/sacda`) → *Landing Page Carousel*: up to 5 slides, each with an image (max 5 MB), title, subtitle and link, plus the autoplay delay.

- If no slides are set, the theme shows five built-in fallback photos that **link to the old `sacda.ca` site**. Setting real slides (linking to `/collections/...`) is recommended before `sacda.ca` goes away.
- These are theme settings, i.e. config. If `sacda.settings` is in `config/sync`, a deploy reverts UI edits. Check with a maintainer: set them on prod, then run `drush cex` and commit, **or** confirm `sacda.settings` isn't tracked.

## Footer partners and social links

The same settings page, *Footer Settings*: partner logos (name, logo, URL, weight) and social links (title, icon, URL, weight). The same config caveat applies.

## Page heroes (banner at the top of About, Team, Media, Exhibits, Collections…)

**Structure → SACDA Hero sections** (`/admin/structure/sacda-hero`). Each hero has a **path** (exact alias, e.g. `/about/team`), title, subtitle, background image and optional image style.

Heroes are **config**: change them on dev/local, export and commit. A new hero also needs its image to exist on prod. The deploy hook creates missing hero images from the theme's `static/graphics/` using the hero's *image fallback* path, so add the image to the theme too.

## About, Contact, Newsletter pages

- **About** (`/about`) and **Contact** (`/contact`): the intro text and the contact card are **part of the theme templates**. Changing them needs a theme change ([Theme Guide](/docs/islandora/development/theme/)). The page node's body renders below the intro and can be edited normally.
- **Newsletter** (`/newsletter`): issues come automatically from the Mailchimp campaign archive RSS (cached). The signup and archive are Mailchimp's; nothing to edit in Drupal.
- **New basic page:** **Add content → Basic page**, set a URL alias, then add a menu link (below). A dedicated layout needs a theme template named after the alias.

## Main menu

**Structure → Menus → Main navigation** (`/admin/structure/menu/manage/main`). Menu links are content, so editing on prod sticks. Drag to reorder; nest a link under another for a dropdown (like About → Team / Media).

## Collections and items

Pick the path by where the description comes from:

| Situation | Use |
|---|---|
| Whole collection catalogued in **CollectiveAccess** | [Ingest CA Pipeline](/docs/migration/ca-pipeline/) (Workbench, maintainer) |
| Whole collection catalogued in an **archivist spreadsheet** | [Ingest Sheet Pipeline](/docs/islandora/ingest/sheet-pipeline/) (Workbench, RA machine) |
| Bulk edit of existing records (fix titles, add a field) | Workbench `update` task with `node_id` ([Workbench Gotchas](/docs/islandora/workbench/gotchas/)) |
| One or a few items, or a fix | Drupal UI (below) |

After any bulk ingest, run the checks in the ingest page's *Verify* step, and see [Collections Ledger](/docs/migration/collections-ledger/) to record what went in.

### Add a single item by hand

1. **Add content → Repository Item** (`/node/add/islandora_object`).
2. Fill in:
   - **Title** and **Identifier** (the accession-style id, e.g. `2023_09_01_015`). The alias becomes `/collections/<identifier>`.
   - **Member of**: the parent collection or series (start typing its title).
   - **Model**: Image, Digital Document (any PDF, even multi-page), Video, Audio, Compound Object (parent with children, no file), or Paged Content (scrapbook-style, with Page children).
   - Descriptive fields as needed: dates are EDTF (e.g. `1925`, `1925-03`, `192X`, `1925/1930`); subjects, places and people are taxonomy references.
3. Save, then open the item's **Media** tab → *Add media* → choose the type (Image/Document/Video/Audio). Upload the access copy (JPG/PDF/MP4/MP3/WAV, not TIF masters) and set **Media use = Original File**.
4. Thumbnails and derivatives appear on their own: images and PDFs within minutes; video can take **hours** because transcodes run one at a time. If nothing appears after a day, see [Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/).

A new **top-level collection**: *Add content → Collection* with no *Member of*. It appears on `/collections` automatically. If it has no thumbnail of its own, the first child with a thumbnail is used.

### Places, subjects, people

- **Places:** before adding a new place term, use **Content → Place lookup** (`/admin/content/places/lookup`) to find its TGN/CGNDB id and check whether it already exists. On prod the lookup data **hasn't been loaded yet** ([Authorities and Place Lookup](/docs/islandora/development/authorities-and-place-lookup/)).
- **Subjects:** prefer existing LCSH/TGM-linked terms. The authority link lives in `field_authority_link` on the term.
- Merge duplicate terms with **Term Merge** rather than deleting them.

## Redirects

**Configuration → Search and metadata → URL redirects** (`/admin/config/search/redirect`). Add one when you change an alias that people may have linked to. Old `sacda.ca` CollectiveAccess URLs are already mapped ([Redirects](/docs/migration/redirects/)).

## Users

**People → Add user** (`/admin/people/create`). Give editors `content_editor`; add `fedoraadmin` only if they'll upload files. Don't share the `admin` account.
