---
title: SACDA / Islandora
description: sacda.ufv.ca, the South Asian Canadian Digital Archive, an Islandora 2 repository.
sidebar:
  order: 0
  label: Overview
---

The **South Asian Canadian Digital Archive (SACDA)** is SASI's digital archive at
**[sacda.ufv.ca](https://sacda.ufv.ca/)**. It is an [Islandora 2](https://islandora.ca/)
repository (Drupal plus Fedora, Solr and derivative microservices) running in Docker on a
UFV VM. It replaced the CollectiveAccess site at `sacda.ca`; how that move was done is in
the [migration archive](/docs/migration/).

| If you are… | Start with |
|---|---|
| A new maintainer | [How it works (diagrams)](/docs/islandora/start/how-it-works/), [Architecture](/docs/islandora/start/architecture/), then [Gotchas](/docs/islandora/start/gotchas/) |
| An editor | [Content guide](/docs/islandora/editors/content-guide/) |
| Fixing an outage | [Runbook](/docs/islandora/operations/runbook/) and the [Incident log](/docs/islandora/operations/incident-log/) |
| Working on an exhibit | [Exhibits](/docs/islandora/exhibits/) |
| Ingesting or bulk-editing | [Workbench](/docs/islandora/workbench/) and [Ingest](/docs/islandora/ingest/sheet-pipeline/) |
| A developer | [Local development](/docs/islandora/development/local-development/) |
| Planning what's next | [Research and roadmap](/docs/islandora/research/) |

**PROD, TEST and DEV** mean `sacda.ufv.ca`, `sacda-test.ufv.ca` and the developer
instance. Open questions are collected in [Needs review](/docs/islandora/reference/needs-review/).
