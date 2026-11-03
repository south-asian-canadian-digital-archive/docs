---
title: "Komagata Maru: Continuing the Journey"
description: "The Komagata Maru exhibit at /exhibits/km: history, structure and how it is built."
sidebar:
  order: 1
---

**Live:** [sacda.ufv.ca/exhibits/km](https://sacda.ufv.ca/exhibits/km/) ·
**Repo:** [`komagata-maru-exhibit`](https://github.com/south-asian-canadian-digital-archive/komagata-maru-exhibit)

## About

A digital archive and educational resource on the 1914 Komagata Maru incident, when 376
passengers from India, most of them Sikh, were refused entry at Vancouver under
discriminatory immigration law. It covers the incident, collections (government
documents, court transcripts, diaries, photographs, video, oral histories, research),
biographies, a timeline and lesson plans.

It is published in **four languages**: English, French, Hindi and Punjabi, each under its
own folder (`/english/`, `/french/`, `/hindi/`, `/punjabi/`).

## Technical specification

| | |
|---|---|
| Stack | Legacy PHP templates (header/footer includes, Bootstrap, jQuery) |
| Build | `deploy-exhibits.sh` runs the PHP in a `php:8.2` container and **flattens it to static HTML**, keeping the `.php` filenames |
| Serving | The `exhibits` nginx serves `.php` files as `text/html` |
| Branches | `main` (PHP, live), `svelte-port` (unfinished SvelteKit port) |

## History

- Built for the CollectiveAccess-era site and served from `sacda.ca/exhibits/km`.
- Put into git on 2025-06-25 (5 commits; the code predates the repo).
- A SvelteKit port was started on `svelte-port` and not finished.
- Moved to `sacda.ufv.ca/exhibits/km` in September 2026 as a flattened static build. The slug `km` is frozen to match old links.

The matching archival collection is 2021_07, *Komagata Maru: Continuing the Journey*.

## Updating it

Push to the repo's `main`, then on the server:

```bash
./scripts/deploy-exhibits.sh km
```

See [Exhibit hosting](/docs/islandora/exhibits/hosting/) for how the build and routing
work.
