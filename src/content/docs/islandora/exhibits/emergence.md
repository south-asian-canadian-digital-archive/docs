---
title: "Emergence: Out of the Shadows"
description: "The Emergence film exhibit at /exhibits/emergence."
sidebar:
  order: 6
---

**Live:** [sacda.ufv.ca/exhibits/emergence](https://sacda.ufv.ca/exhibits/emergence/) ·
**Repo:** [`emergence-movie-exhibit`](https://github.com/south-asian-canadian-digital-archive/emergence-movie-exhibit)

## About

An exhibit for SACDA's documentary *Emergence: Out of the Shadows*, which follows three
South Asian LGBTQ+ people navigating identity, family and belonging, especially in BC.
The film has won seven awards. The site has a multilingual synopsis, cast and crew
profiles with interviews, festival recognition, trailers and the full film.

## Technical specification

| | |
|---|---|
| Stack | SvelteKit 2, Svelte 5, Tailwind CSS 4, GSAP, embla-carousel |
| Adapter | `adapter-static` with an SPA fallback |
| Package manager | pnpm 10 (required) |
| Build | `deploy-exhibits.sh` in `node:20`; it builds `sacda-exhibits-common` from source first |
| Branches | `main`, `dev` |

## History

- Started 2025-08-01; about 76 commits.
- SEO and performance work in December 2025. `og:image` must not be WebP; social previews ignore it.

## Updating it

Push to the repo's `main`, then on the server:

```bash
./scripts/deploy-exhibits.sh emergence
```

See [Exhibit hosting](/docs/islandora/exhibits/hosting/) for how the build and routing
work.
