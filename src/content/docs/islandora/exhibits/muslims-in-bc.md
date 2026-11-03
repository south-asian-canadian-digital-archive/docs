---
title: "South Asian Canadian Muslims in BC"
description: "The SACMBC exhibit at /exhibits/sacmbc."
sidebar:
  order: 5
---

**Live:** [sacda.ufv.ca/exhibits/sacmbc](https://sacda.ufv.ca/exhibits/sacmbc/) ·
**Repo:** [`muslims-in-bc-exhibit`](https://github.com/south-asian-canadian-digital-archive/muslims-in-bc-exhibit)

## About

*South Asian Canadian Muslims in British Columbia* (SACMBC), developed 2024–2025,
documents South Asian Canadian Muslim communities in BC across three periods: early
migration (1900s–1962, including figures connected to the Komagata Maru), 1962–2001
(communities from Pakistan, Bangladesh, East Africa, Fiji and the Caribbean), and 2001 to
today. It has an interactive timeline, oral-history videos, case studies, and covers
Sunni, Shia, Ismaili and Ahmadiyya communities.

## Technical specification

| | |
|---|---|
| Stack | SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4, GSAP, embla-carousel |
| Adapter | `adapter-static` for SACDA (Vercel and Cloudflare adapters remain in the repo from earlier hosting) |
| Package manager | pnpm |
| Build | `deploy-exhibits.sh` in `node:20`, base pinned to `/exhibits/sacmbc` |
| Branches | `main`, `dev`, `beta` |

## History

- Started April 2024; over 100 commits.
- A new deploy workflow was added in November 2025.
- The most recently edited exhibit (a spelling fix on 2026-09-28).

## Updating it

Push to the repo's `main`, then on the server:

```bash
./scripts/deploy-exhibits.sh sacmbc
```

See [Exhibit hosting](/docs/islandora/exhibits/hosting/) for how the build and routing
work.
