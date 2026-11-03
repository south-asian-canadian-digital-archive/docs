---
title: Research and roadmap
description: Research from Islandora Camp SFU 2026 (October 28–30), what was tested on DEV, and the decisions still open.
sidebar:
  order: 0
  label: Overview
---

After Islandora Camp at SFU (2026-10-28 to 10-30), the team turned the camp's ideas into
concrete options for SACDA, audited DEV (2026-11-02), and built and tested several of
them on DEV. **Nothing in this section has been changed on PROD.** Effort figures are
estimates.

| Area | Main recommendation | State |
|---|---|---|
| [Data model](/docs/islandora/research/data-model/) | Retire the `collection` type by converting the nodes in place to Collection-level archival components | Converted on DEV; Workbench side built, not run |
| [Authorities and thesaurus](/docs/islandora/research/authorities-and-thesaurus/) | Backfill authority links per vocabulary; publish the SACDA Thesaurus as its own authority with Skosmos | Thesaurus test data and Skosmos running on DEV |
| [Ingestion and storage](/docs/islandora/research/ingestion-and-storage/) | Masters-only ingest; pyramidal TIFF service files on Cantaloupe; per-script OCR; fix Fedora placement | PTIF and Triplet benchmarked; OCR lab smoke-tested |
| [Site and access](/docs/islandora/research/site-and-access/) | Transcript panel, better PDF viewer, download menu, restricted items, TK Labels | Transcript panel and PDF prototype on the theme's `dev` branch |
| [Workflows](/docs/islandora/research/workflows/) | Finish the Workbench GUI; config PR flow; a task registry for ingest; docs in this repo | Task registry and runner built on a branch |

## Decisions waiting on people

- **Thesaurus scope, approval and URIs.** Who approves terms, whether community
  consultation is needed, and whether to add a persistent URI layer (w3id.org or ARK).
- **Rights for downloads.** May the public download high-resolution originals, per item
  or at all? Until decided, offer service files only.
- **Restricted collections.** Which collections, if any, must be restricted. This sets how
  much of the access-control work is needed.
- **TK Labels.** Whether and how to engage communities. Labels are applied by or with
  communities, not by the archive alone.
- **Masters-only ingest.** The archivist's confirmation of the workflow, and a review of
  the pyramid image quality.
- **Scale.** The average TIFF size, PROD disk capacity and the timeline for the expected
  million-TIFF ingest.
- **Fonds level.** Whether the new archival-level vocabulary needs a Fonds term.
- **Sending material to cloud OCR.** Whether archive material may leave UFV for OCR,
  especially restricted items.
