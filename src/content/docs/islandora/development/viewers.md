---
title: Viewers
description: How item viewers are chosen on this site, which is not the stock Islandora way, and the traps when editing them.
tags: [drupal, iiif, twig]
sidebar:
  order: 4
---

## Not the stock Islandora setup

Upstream Islandora picks viewers with the **Context** system. **This site doesn't.**
Viewers are plain blocks in the `sacda` theme's block layout, in a custom
`media_content` region defined in `sacda.info.yml`.

The stock contexts (`pdfjs`, `default_media_display`, `openseadragon_block`,
`mirador_block_*`) still exist and are enabled, but they place blocks into Olivero's
`content_above` region. On `sacda` they do nothing. Don't reason about viewers from
Context config, and don't add Context rules expecting them to fire.

| Block | Visibility (all conditions are ANDed) |
|---|---|
| PDF.js | bundle `islandora_object` and media with mime type `application/pdf` |
| OpenSeadragon | bundle `islandora_object`, media with an image mime type, and **not** model Digital Document |
| Mirador | bundle `islandora_object` or `archival_component`, and model Book (later extended to Publication Issues) |
| Download card | Binary objects, which have no viewer |

This table dates from July 2026 with October additions. Check the block layout before
relying on it.

## Which conditions work

Only conditions that take a **node** context work for blocks on node pages:
`media_has_mimetype` ("Node has Media with Mime type"), `node_has_term`,
`parent_node_of_node_has_term`, and core's `entity_bundle:node`.
`media_source_mimetype` and `entity_bundle:media` take a media context, which doesn't
exist on node pages.

## Traps

- **`media_has_mimetype` scans every media on the node, including derivatives.** Once a
  PDF gets its generated thumbnail, it matches image types too, so an image viewer appears
  on PDFs. That's why OpenSeadragon also excludes Digital Document. It only bites after
  derivatives run, so unprocessed nodes look fine.
- **Visibility is keyed by plugin ID**, so a block can't have two `media_has_mimetype`
  rules (one positive, one negated). Exclusion has to come from a different plugin.
- `media_has_mimetype` matches **exact strings**. `image/*` doesn't work, and an empty
  list evaluates to true.
- **Nothing filters by type in the views.** `views.view.media_display_blocks` filters on
  the current node, status and media use only. What stops the wrong viewer rendering is
  missing view-display config, which degrades to an empty box rather than an absent
  block. That's why viewers can stack.
- **Mirador can't render a raw PDF.** A single PDF marked as a Book shows a broken
  Mirador on top of a working PDF.js.

## Everything depends on Service Files

The viewer views and the IIIF manifest (`/node/N/manifest`) filter on media use
`http://pcdm.org/use#ServiceFile`. No service file means no viewer and an empty manifest.
Images get service files; **PDFs don't** (the PDF context dispatches only a thumbnail and
OCR). See [Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/).

Thumbnails are 650px WebP since 2026-07-23. Changing a derivative's format means changing
the action's mime type, its arguments **and** its path extension together, allowing the
extension on the media field, and allowing the mime type in the microservice's
`scyllaridae.yml`. Re-deriving an existing media replaces the contents but keeps the old
filename, so delete the old derivative media first.

## Theme behaviour

- OpenSeadragon shows a loading overlay, supports Ctrl/Cmd + wheel to zoom with a hint,
  and locks page scroll while zooming.
- Mirador runs without its top bar and with a restyled sidebar button.

## Direction

Moving viewer selection back to Context would remove the stacking problems. A better
PDF viewer and a transcript panel are prototyped; see
[Site and access research](/docs/islandora/research/site-and-access/).
