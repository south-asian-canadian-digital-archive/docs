---
title: Site and access
description: Transcript panel, PDF viewer, download menu, restricted items, TK Labels and the facet filter box.
sidebar:
  order: 4
---

Research from 2026-11-02. All theme work targets `sacda`.

## Transcript panel

OCR text lives on Extracted Text media, not on the node.

**Recommendation:** a collapsible panel in `node--islandora-object.html.twig`, fed by a
Views block of the node's Extracted Text media. Audio and video transcripts can use the
same media type later. Plain text with a `lang` attribute so non-Latin scripts render
properly, and no empty box when there's no text.

**State:** built on the theme's `dev` branch and rendering on DEV. Not on PROD.

Tests: keyboard and screen-reader operable; Gurmukhi, Devanagari and Arabic-script
samples render, with Urdu right to left; a restricted item never exposes its text.

## PDF viewer

Today `media--pdfjs.html.twig` shows a poster, and "View full PDF" lazily loads pdf.js.
PDFs get no service file.

**Recommendation:** first define what "better" means. Then use pdf.js with its full
viewer UI (thumbnails, in-document search, zoom; 1 to 3 days), and split scanned books
into page images for Mirador with IIIF and hOCR search (1 to 2 weeks).

**State:** a standalone prototype on `pdfjs-dist` is in the theme at
`prototypes/pdf-viewer/`, with search and highlights from the text layer and optional
OCR word coordinates for scanned PDFs. It isn't wired into the site. EmbedPDF is the
alternative worth trialling.

Tests: a 200+ page scan opens its first page in under 3 seconds and reaches page 150
without downloading the whole file; search works on a text layer; usable at phone width;
one working viewer per PDF item.

## Download menu

Today only models with no viewer (Binary) get a download card.

**Recommendation:** a dropdown listing the node's media by use (Original, Service File,
Extracted Text) with format and size, built in a preprocess function so access is checked
per file. FITS stays admin-only. **SASI must decide whether the public may download
high-resolution originals.** Until then, offer service files only.

Tests: correct files, filenames and sizes; anonymous users never see files they can't
access, and direct file URLs return 403 for restricted items; no menu on nodes without
media; one user's options never cached for another.

## Restricted items

No access-control modules are installed. Search uses Search API's content access, so
results can already respect node access.

**The biggest risk:** blocking the node isn't enough. Files in `public://` are served
directly, IIIF tiles go through Cantaloupe, and text reaches search, OAI-PMH and JSON-LD.
A restriction only counts if every path is blocked.

| Option | Notes |
|---|---|
| Embargo module | The access-control approach documented for Islandora 2 by BC ELN's Arca; IP ranges and user exemptions, with expiry. Check Drupal 11 status |
| `ip_range_access` with Context | Built for Islandora. Needs Drupal to see the real client IP, which the campus proxy currently hides |
| University SSO | Strongest, but needs UFV IT |
| Enforce at the proxy | Needs UFV IT for every change |

**Recommendation:** evaluate Embargo first, then `ip_range_access`; add SSO later if
needed. Restricted files move to a private file system, with Cantaloupe fetching through
an authorised path. **SASI should confirm which collections are restricted** first.
About 1 to 2 weeks including files and IIIF.

Tests, as an outside user on a restricted item, all must be blocked: node, media and file
URLs for every derivative; IIIF manifest, `info.json` and tiles; `/search`, the search
API, facet counts, OAI-PMH and `?_format=jsonld`; a cached copy. A spoofed
`X-Forwarded-For` header must not grant access.

## TK Labels

Traditional Knowledge Labels communicate community protocols and context. **They don't
enforce access**; restriction has to come from the mechanisms above.

The `local_context_int` Drupal module pulls labels from the Local Contexts Hub by project
ID and caches them; it needs a Hub API key and Drupal 11 support must be checked.
Technically this is 2 to 3 days. **It is community work first:** labels are applied by or
with communities, so SASI decides whether and how to engage before anything is built.

## Facet filter box

The search page's facet filter input took the heavy global form style. Unlayered rules
next to the facet styles fix it without touching the Svelte markup: 2.5 rem tall, the
body font at 1 rem (so iOS doesn't zoom on focus), a visible focus ring, and a border that
meets 3:1 contrast. **State:** styled on the theme's `dev` branch; not browser-tested.
