---
title: "Legal history exhibit"
description: "The South Asian Canadian legal history exhibit at /exhibits/legal-history."
tags: [svelte, sveltekit, tailwind]
sidebar:
  order: 4
---

**Live:** [sacda.ufv.ca/exhibits/legal-history](https://sacda.ufv.ca/exhibits/legal-history/) ·
**Repo:** [`legal-history-exhibit`](https://github.com/south-asian-canadian-digital-archive/legal-history-exhibit)

## About

An exhibit on South Asian Canadian legal history. Its repo README is still the SvelteKit
template, so this page is the only description; fill in the exhibit's subject and
partners here.

## Technical specification

| | |
|---|---|
| Stack | SvelteKit 2, Svelte 4, Tailwind CSS 3, Vite 5 |
| Adapter | `adapter-static` |
| Package manager | pnpm 10 |
| Build | `deploy-exhibits.sh` in `node:20`, base pinned to `/exhibits/legal-history` |
| Branches | `main`, `build`, `design-2` |

## History

- Started 2024-01-30 (same day as Union Zindabad!); about 20 commits; mobile work and a title change in February–March 2024.
- A GitHub Actions build workflow was added 2025-11-14.
- The `design-2` branch holds an alternative design.

## Updating it

Push to the repo's `main`, then on the server:

```bash
./scripts/deploy-exhibits.sh legal-history
```

See [Exhibit hosting](/docs/islandora/exhibits/hosting/) for how the build and routing
work.
