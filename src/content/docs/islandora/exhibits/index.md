---
title: Exhibits
description: SACDA's digital exhibits, how they are hosted, and where each one came from.
sidebar:
  order: 0
  label: Overview
---

SACDA's digital exhibits are standalone static websites, each in its own GitHub repo,
served from the SACDA server under `https://sacda.ufv.ca/exhibits/<slug>`. Drupal only
renders the listing at `/exhibits` and the homepage cards. How the hosting works is in
[Exhibit hosting](/docs/islandora/exhibits/hosting/).

| Exhibit | URL | Stack | Repo |
|---|---|---|---|
| [Komagata Maru: Continuing the Journey](/docs/islandora/exhibits/komagata-maru/) | `/exhibits/km` | Legacy PHP, flattened to static HTML | [`komagata-maru-exhibit`](https://github.com/south-asian-canadian-digital-archive/komagata-maru-exhibit) |
| [Disenfranchisement 1907–1947](/docs/islandora/exhibits/disenfranchisement/) | `/exhibits/disenfranchisement` | Legacy PHP, flattened | [`disenfranchisement-exhibit`](https://github.com/south-asian-canadian-digital-archive/disenfranchisement-exhibit) |
| [Union Zindabad!](/docs/islandora/exhibits/union-zindabad/) | `/exhibits/union-zindabad` | SvelteKit 2, Svelte 4, Tailwind 3 | [`union-zindabad-exhibit`](https://github.com/south-asian-canadian-digital-archive/union-zindabad-exhibit) |
| [Legal history](/docs/islandora/exhibits/legal-history/) | `/exhibits/legal-history` | SvelteKit 2, Svelte 4, Tailwind 3 | [`legal-history-exhibit`](https://github.com/south-asian-canadian-digital-archive/legal-history-exhibit) |
| [South Asian Canadian Muslims in BC](/docs/islandora/exhibits/muslims-in-bc/) | `/exhibits/sacmbc` | SvelteKit 2, Svelte 5, Tailwind 4, GSAP | [`muslims-in-bc-exhibit`](https://github.com/south-asian-canadian-digital-archive/muslims-in-bc-exhibit) |
| [Emergence: Out of the Shadows](/docs/islandora/exhibits/emergence/) | `/exhibits/emergence` | SvelteKit 2, Svelte 5, Tailwind 4, GSAP | [`emergence-movie-exhibit`](https://github.com/south-asian-canadian-digital-archive/emergence-movie-exhibit) |

Also served from the same server: the archived [Matterport tour](/docs/islandora/exhibits/matterport-tour/)
of the Canadian Sikh Heritage Museum at `/cshm-tour/`.

## Shared pieces

[`sacda-exhibits-common`](https://github.com/south-asian-canadian-digital-archive/sacda-exhibits-common)
is a Svelte component library (header with search and mobile menu, footer) published to
GitHub Packages as `@south-asian-canadian-digital-archive/sacda-exhibits-common`.
Installing it needs a GitHub token with `read:packages` in `NODE_AUTH_TOKEN`. The
Emergence exhibit builds it from source during deploy instead.

## History in brief

- **Before 2024:** the Komagata Maru and Disenfranchisement exhibits were PHP sites on the
  CollectiveAccess-era server at `sacda.ca/exhibits/*`, deployed by a self-hosted GitHub
  runner.
- **2024:** Union Zindabad! and the legal history exhibit were built in SvelteKit (both
  started 2024-01-30), followed by SACMBC (started 2024-04).
- **2025:** the two PHP exhibits were put in git (June 2025), with `svelte-port` branches
  started. Emergence was built (August–December 2025). The SvelteKit exhibits gained
  GitHub Actions build workflows in November 2025.
- **August–September 2026:** with the move to `sacda.ufv.ca`, an embedded Shadow DOM
  viewer inside Drupal was tried and dropped (SvelteKit can't hydrate in a shadow root).
  All six now build into `/data/exhibits` on the SACDA server, keeping their
  `sacda.ca` slugs so old links still work.
