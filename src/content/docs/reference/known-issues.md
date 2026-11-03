---
title: Known issues
description: Open work and the handover checklist.
sidebar:
  order: 1
---

Compiled on 2026-09-29 and updated in November 2026. Tick items off in a pull request as
they are done. Items where the sources disagree are on [Needs review](/docs/reference/needs-review/).

## Handover (blocking)

- [ ] **Backups.** Ask UFV IT about VM snapshots, and set up a nightly database dump plus
      an off-box copy of files and Fedora. → [Backups](/docs/operations/backups/)
- [ ] **A second GitHub org owner.**
- [ ] **GHCR pull token** on the server replaced with a shared-account token, or the
      package made public. → [Environments and access](/docs/start/environments-and-access/)
- [ ] **Service account sudo.** Confirm who holds it, or have UFV IT take it over.
- [ ] **Record UFV IT contacts** (VM, campus proxy, network, directory groups) in the
      team's internal notes.
- [ ] **Commit scripts that existed only on the server:** the backfill scripts,
      `create-legacy-redirects.{sh,php}` and `docs/redirects/`. Most are now in `isle`;
      check the checkout is clean.
- [ ] **Commit the ingest machine's `g/`:** September logs, rollbacks and templates were
      uncommitted at the end of September, plus scratch configs outside the repo.
- [ ] **Place-lookup dumps** onto the server. → [Authorities and place lookup](/docs/development/authorities-and-place-lookup/)
- [ ] **DEV.** The developer instance is a personal machine. Hand it over, or move
      day-to-day testing to TEST.
- [ ] **Slack webhook.** Confirm which workspace `SLACK_WEBHOOK_URL` posts to.

## Operations

- [ ] Confirm the Fedora resync finished after its 2026-10-01 window, then remove its
      cron lines. → [Scheduled jobs](/docs/operations/scheduled-jobs/)
- [ ] The August Fedora gap (about 4,256 objects, 08-04 → 08-18): compare Drupal with
      Fedora and re-index. → [Derivatives and Fedora](/docs/operations/derivatives-and-fedora/)
- [ ] 129 documents missing thumbnails: run `backfill-document-thumbnails.sh`.
- [ ] The image-backfill cron reports "1 missing" forever: find the row and fix the query
      or the data.
- [ ] Decide which development modules PROD should have, and remove the rest from
      `core.extension.yml`.
- [ ] Delete the orphaned `isle-sacda-prod_*` volumes (13.5 GB), **after** backups exist.
- [ ] Log rotation for `logs/` in the server checkout.
- [ ] Alpaca truststore leak: decide on a fix, then remove the `heap-monitor.sh` cron.
- [ ] Bind the deploy webhook listener to internal interfaces only.
- [ ] Push a per-commit image tag alongside `:latest` so rollback is easy.
- [ ] Confirm the static `/search` page exists on PROD, then remove the temporary
      `search-page` Traefik router. → [Search](/docs/operations/search/)
- [ ] Confirm every PROD service runs the same `ISLANDORA_TAG` as the Drupal image.
      → [Upgrades](/docs/operations/upgrades/)
- [ ] Legacy `sacda.ca`: agree a decommission date, snapshot the legacy server first, 301
      `sacda.ca/*` to `sacda.ufv.ca` at the proxy, remove the old self-hosted runner, and
      replace the hardcoded `sacda.ca` links in the theme carousel and front page.

## Code and docs cleanup

- [ ] Remove the dead Shadow DOM exhibit viewer from `isle-modules`: controller, JS,
      template, `exhibits/` and routes.
- [ ] Update the `isle-modules` README title ("SACDA Hero").
- [ ] Add a README to `isle-theme`; delete or fix `.agent/rules/*` (stale paths).
- [ ] The `isle` README says two submodules; there are three.
- [ ] `docs/webhook-deploy.md` in `isle` says `make deploy`; it's `make deploy-auto`.
- [ ] Delete `docs/supplement-pages-progress.md` in `isle` (describes a superseded design).
- [ ] Remove `legacy-modules-uninstall` from `make deploy`.
- [ ] Mark the superseded Notion pages (CI/CD, Dev Instance, Workbench Setup, v2
      preprocessor) as replaced by this site.
- [ ] `CLAUDE.md` in `isle` is gitignored and drifting from reality; move what's still
      true here.

## Content and data

- [ ] **Two fonds share a title**: 2024_19 (spreadsheet pipeline, nid 2) and 2021_06
      (CollectiveAccess). The archivist decides whether to merge or delete, with redirects.
- [ ] **2021_08 and 2023_13** are partial, waiting on series records.
- [ ] **2022_15:** replace the 5 placeholder series; some records are pending place and
      creator.
- [ ] **2020_03:** 16 undecoded CollectiveAccess list IDs; `subjectPersonal` missing on
      the items added 09-28.
- [ ] **2020_06:** do an authenticated per-node media count to confirm whether media are
      missing.
- [ ] **873 leaf objects with no media** (grew from 715 on 09-21). Lists are in the
      ingest repo's audit folder.
- [ ] **Five archival fields blank on every CollectiveAccess node:** map them in
      `migrate.py`, then run a bulk `update`.
- [ ] 520 sheet-vs-PROD text differences awaiting archivist review.
- [ ] About 73 remaining bad parents, 40 unresolved second parents, 135 items with
      unresolvable CollectiveAccess parents.
- [ ] Legacy 2020_01 / 2021_07 nodes from before the 09-15 re-ingests: query for
      `islandora_object`s with an empty `field_member_of`.
- [ ] About 713 subject terms without authority links: archivist review of the
      reconcile report.
- [ ] Redirect loose ends. → [Redirects](/docs/ingest/redirects/)
