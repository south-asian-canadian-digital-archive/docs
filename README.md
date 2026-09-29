# SACDA Islandora docs

These docs are for whoever maintains **sacda.ufv.ca** after the migration team. The `isle` repo README covers local dev. These docs cover the running system: how it's deployed, what runs on the server, how content got in, and every quirk we hit.

Snapshot date: **2026-09-29**. If a page and the server disagree, the server wins. Fix the page in a PR.

## Start here

1. [Architecture](Architecture.md): what the pieces are and how they connect
2. [Environments and Access](Environments-and-Access.md): hosts, domains, accounts, and who owns what
3. [Gotchas](Gotchas.md): the 10 things most likely to break the site
4. [Known Issues](Known-Issues.md): what's unfinished, plus the handover checklist

## Guides

- [Content Guide](Content-Guide.md): adding team members, media items, exhibits, carousel slides, heroes, collections and items
- [Theme Guide](Theme-Guide.md): working on the `sacda` theme and shipping changes

## Operating the site

- [Deploying](Deploying.md): push to `main` → live, and how to roll back
- [Config Management](Config-Management.md): `config/sync`, `drush cim`, what doesn't travel
- [Ops Runbook](Ops-Runbook.md): day-to-day commands
- [Scheduled Jobs](Scheduled-Jobs.md): cron on the host and Drupal cron
- [Backups](Backups.md): read this one early
- [Traefik and Rate Limits](Traefik-and-Rate-Limits.md)
- [Certificates](Certificates.md)
- [Derivatives and Fedora](Derivatives-and-Fedora.md)
- [Exhibits and Static Files](Exhibits-and-Static-Files.md)
- [Incident Log](Incident-Log.md)

## Code

- [Custom Code](Custom-Code.md): theme, `sacda_modules`, `authority_resolver`, and how they ship
- [Authorities and Place Lookup](Authorities-and-Place-Lookup.md)

## Content and ingest

- [Collections Ledger](Collections-Ledger.md): every collection, its top node, and how it got in
- [Ingest CA Pipeline](Ingest-CA-Pipeline.md)
- [Ingest Sheet Pipeline](Ingest-Sheet-Pipeline.md)
- [Workbench Gotchas](Workbench-Gotchas.md)
- [Redirects](Redirects.md)

## Repos

| Repo | What |
|---|---|
| `isle` (private) | Main repo. Compose stack, Drupal image, `config/sync`, ops scripts, deploy machinery |
| `docs` | These docs |
| `isle-theme` | `sacda` Drupal theme (submodule) |
| `isle-modules` | `sacda_modules` custom module (submodule) |
| `authority_resolver` | Authority ID resolver module (submodule) |
| `islandora-workbench-ops` (private) | Workbench configs, CA migration scripts, ingest logs and rollbacks. Lives as `g/` inside an upstream Workbench clone |
| `workbench-preprocessor` | `organise` CLI for the sheet pipeline |
| six `*-exhibit` repos + `sacda-exhibits-common` | Static exhibit sites, see [Exhibits and Static Files](Exhibits-and-Static-Files.md) |
| `matterport-dl` | Matterport tour downloader behind `/cshm-tour/` |
| `sacda-scripts-server`, `sacda-ocr` | Legacy (2023), not used by this stack |
