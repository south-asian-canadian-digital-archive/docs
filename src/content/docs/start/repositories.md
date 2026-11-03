---
title: Repositories
description: Every repo that makes up SACDA, what it holds and whether it is public.
sidebar:
  order: 4
---

All repos are in the `south-asian-canadian-digital-archive` GitHub org.

## The site

| Repo | What |
|---|---|
| `isle` (private) | Main repo. Compose stack, Drupal image, `config/sync`, ops scripts, deploy machinery. A fork of upstream `isle-site-template` |
| `isle-theme` | The `sacda` Drupal theme. Submodule of `isle` |
| `isle-modules` | `sacda_modules` and its submodules (heroes, place lookup, ingest audit, stored thumbnails). Submodule of `isle` |
| `authority_resolver` | Resolves authority IDs to labels and reconciles terms. Submodule of `isle`, written to be publishable on drupal.org |
| `isle-fast-search` | Public copy of `sacda_fast_search`, the JSON + Svelte search page. Lives in `isle` at `web/modules/custom/sacda_fast_search` |
| `docs` | This site |

## Ingest

| Repo | What |
|---|---|
| `islandora-workbench-ops` (private) | Workbench configs, the CollectiveAccess migration scripts, ingest logs and rollbacks. Checked out as `g/` inside an upstream `islandora_workbench` clone |
| `workbench-preprocessor` | `organise`, the Rust CLI for the spreadsheet pipeline |
| `islandora_workbench_gui` | A desktop wrapper around the Workbench CLI (in progress) |

## Authorities and research

| Repo | What |
|---|---|
| `islandora-skosmos` | `skos_export` module plus a Skosmos container: publish any Islandora vocabulary as a linked-data authority |
| `islandora-vocbench` | Test project: VocBench 3 as a review editor next to Drupal, with `vocbench_sync` |
| `sacda-ocr-lab` (private) | OCR, LLM-correction and transcription experiments. Archive items are never committed |

## Exhibits and extras

| Repo | What |
|---|---|
| Six `*-exhibit` repos and `sacda-exhibits-common` | Static exhibit sites; see [Exhibits and static files](/docs/operations/exhibits-and-static-files/) |
| `matterport-dl` | Fork of the Matterport tour downloader behind `/cshm-tour/`; see [Matterport tour](/docs/operations/matterport-tour/) |
| `sacda-ocr`, `sacda-scripts-server` | Legacy (2023). Not used by this stack |

## Submodule workflow

Theme and module changes are committed in their own repo first, then `isle` bumps the
submodule pointer and pushes to `main`, which builds and deploys. See
[Custom code](/docs/development/custom-code/).
