---
title: Glossary
description: Terms, tools and abbreviations used across these docs.
sidebar:
  order: 4
---

| Term | Meaning |
|---|---|
| **Alpaca** | Islandora's queue consumer. It reads ActiveMQ messages and calls the derivative microservices |
| **cim / cex** | `drush config:import` / `config:export`: load `config/sync` into the database, or write the database's config to it |
| **cr / updb** | `drush cache:rebuild` / `drush updatedb` (run pending database updates) |
| **CA** | CollectiveAccess, the old collections system at `sacda.ca` |
| **CGNDB** | Canadian Geographical Names Database (Natural Resources Canada) |
| **DLQ** | Dead-letter queue: where failed messages would go. Alpaca has none, so failures are lost |
| **EDTF** | Extended Date/Time Format, e.g. `1925`, `192X`, `1925/1930` |
| **Fonds** | All the records from one creator or family: the top archival level |
| **g/** | The private `islandora-workbench-ops` repo, checked out as `g/` inside a Workbench clone |
| **Hairpin** | Containers fetching `https://<DOMAIN>/…` and reaching Traefik inside the Docker network, so they validate our internal certificate |
| **Ingest machine / RA machine** | The SASI Windows PCs that run Workbench; RA means research assistant |
| **isle-buildkit** | The Islandora project's Docker images; `ISLANDORA_TAG` picks the version |
| **JWT** | The signed token Drupal gives microservices; its roles decide what Fedora lets them write |
| **LCSH, LCGFT, NAF, TGM** | Library of Congress authorities: subject headings, genre/form terms, name authority file, Thesaurus for Graphic Materials |
| **Media use** | The term saying what a file is for: Original File, Service File, Thumbnail, Extracted Text |
| **Milliner** | Syncs Drupal nodes and media into Fedora |
| **mkcert** | Tool that makes our internal TLS certificate and its local CA |
| **OSD** | OpenSeadragon, the deep-zoom image viewer |
| **s6** | The process supervisor that is PID 1 in Islandora containers |
| **scyllaridae** | The Go wrapper behind the houdini and homarus microservices; configured by `scyllaridae.yml` |
| **Service File** | The derivative viewers and IIIF serve, made from the Original File |
| **SKOS** | W3C model for publishing thesauri as linked data |
| **TGN** | Getty Thesaurus of Geographic Names |
| **Thin pool** | LVM storage that over-commits disk; `df` free space isn't guaranteed |
| **Workbench** | Islandora Workbench, the CSV-driven ingest tool; `secondary_tasks` chain child tasks after a parent task |
