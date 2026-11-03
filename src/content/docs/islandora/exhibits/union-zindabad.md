---
title: "Union Zindabad!"
description: "The South Asian Canadian labour history exhibit at /exhibits/union-zindabad."
tags: [svelte, sveltekit, typescript, tailwind]
sidebar:
  order: 3
---

**Live:** [sacda.ufv.ca/exhibits/union-zindabad](https://sacda.ufv.ca/exhibits/union-zindabad/) ·
**Repo:** [`union-zindabad-exhibit`](https://github.com/south-asian-canadian-digital-archive/union-zindabad-exhibit)

## About

A digital exhibit on South Asian Canadians and the labour movement in British Columbia:
early migration and the 1907 riots, finding work, the Ghadar movement and the IWW, union
organising and the 1931 Fraser Mills strike, the International Woodworkers of America,
women workers, the Canadian Farmworkers Union, and new economies (taxis, longshoring,
trucking). "Zindabad" means "long live".

Partners: SASI, the BC Labour Heritage Centre, UFV and the Province of BC, as part of the
South Asian Canadian Legacy Project (a $1.14 million provincial contribution).

## Technical specification

| | |
|---|---|
| Stack | SvelteKit 2, Svelte 4, TypeScript, Tailwind CSS 3, Vite 5 |
| Adapter | `adapter-static` (the repo also lists auto and Vercel adapters) |
| Package manager | pnpm 10 |
| Build | `deploy-exhibits.sh` builds in a `node:20` container and pins `kit.paths.base` to `/exhibits/union-zindabad` |
| Branches | `main`, `build` |

## History

- Started 2024-01-30 with scripts to scrape the source content; about 56 commits.
- Mobile fixes in October 2024; a trailing-slash fix for page rendering in May 2025.
- A GitHub Actions build workflow was added 2025-11-14.
- Matching archival collection: 2021_08, *Labour History exhibit collection*.

## Updating it

Push to the repo's `main`, then on the server:

```bash
./scripts/deploy-exhibits.sh union-zindabad
```

See [Exhibit hosting](/docs/islandora/exhibits/hosting/) for how the build and routing
work.
