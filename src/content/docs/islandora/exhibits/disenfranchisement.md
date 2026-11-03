---
title: "Disenfranchisement 1907–1947"
description: "The Disenfranchisement exhibit at /exhibits/disenfranchisement."
tags: [php]
sidebar:
  order: 2
---

**Live:** [sacda.ufv.ca/exhibits/disenfranchisement](https://sacda.ufv.ca/exhibits/disenfranchisement/) ·
**Repo:** [`disenfranchisement-exhibit`](https://github.com/south-asian-canadian-digital-archive/disenfranchisement-exhibit)

## About

*The Forty-Year Struggle for the Vote* tells how South Asian Canadians fought for the
vote in British Columbia between 1907 and 1947. It is based on the 2017 exhibit at the
Sikh Heritage Museum, National Historic Site, Gur Sikh Temple. Sections: About,
Solidarity, and the forty-year timeline.

## Technical specification

| | |
|---|---|
| Stack | Legacy PHP (`index.php`, `header.php`, `footer.php`, section folders), Bootstrap 4, jQuery |
| Build | Flattened to static HTML by `deploy-exhibits.sh`, like Komagata Maru |
| Branches | `main` (PHP, live), `svelte-port` (unfinished) |

## History

- From the 2017 physical exhibit; first online on `sacda.ca`.
- In git since 2025-06-26.
- Matching archival collection: 2021_05, *(DIS)Enfranchisement exhibit collection*.
- Moved to `sacda.ufv.ca` in September 2026.

## Updating it

Push to the repo's `main`, then on the server:

```bash
./scripts/deploy-exhibits.sh disenfranchisement
```

See [Exhibit hosting](/docs/islandora/exhibits/hosting/) for how the build and routing
work.
