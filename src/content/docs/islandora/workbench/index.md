---
title: Workbench
description: How SACDA uses Islandora Workbench, where its configs live, and where to read the upstream docs.
tags: [python]
sidebar:
  order: 0
  label: Overview
---

[Islandora Workbench](https://github.com/mjordan/islandora_workbench) is a command-line
tool that creates, updates and deletes Islandora content from CSV files through Drupal's
REST API. SACDA uses it for every bulk change: ingesting collections, bulk metadata
fixes, creating terms and redirects, and the team and media pages.

## Upstream documentation

- **[Workbench docs](https://mjordan.github.io/islandora_workbench_docs/)**: configuration
  options, task types, CSV format, checks and rollback.
- Task types SACDA uses: `create`, `update`, `delete`, `add_media`, `create_terms`,
  `create_redirects`, plus `secondary_tasks` for parent/child chains.
- [Configuration reference](https://mjordan.github.io/islandora_workbench_docs/configuration/)
  and [rolling back](https://mjordan.github.io/islandora_workbench_docs/rolling_back/).

## SACDA's setup

- Workbench is a plain upstream clone. SACDA's configs, scripts, logs and rollbacks are a
  separate private repo,
  [`islandora-workbench-ops`](https://github.com/south-asian-canadian-digital-archive/islandora-workbench-ops),
  checked out **inside** it as `g/` and excluded with `.git/info/exclude`.
- **Always run from the Workbench root**; configs use `./g/...` paths.
- Credentials are gitignored files in `g/`, one per site. Site profiles in
  `g/config/sites.toml` (on the `research/camp-2026` branch) name the host, credentials and
  target bundle.
- The SASI ingest PCs run Windows with Git Bash and `uv`; the research assistants'
  machine runs plain `python` and is kept current by `update.ps1` (see
  [Scripts](/docs/islandora/workbench/scripts/)).
- Every create run writes a rollback config and CSV under `g/rollback/`. Commit them.

## Before any run

1. Check the account has `fedoraadmin` and, for redirects, `administer redirects`.
2. Run with `--check` first.
3. Set `http_max_retries: 0` on create tasks and keep `remind_user_to_run_check: false`
   on secondary tasks.
4. Don't run during a deploy, and ingest video in the evening.
5. Afterwards, verify on the site and with the [Ingest audit](/docs/islandora/ingest/ingest-audit/),
   not by the exit code.

The full list of traps is on [Workbench gotchas](/docs/islandora/workbench/gotchas/).

## Where the pipelines are documented

- New collections from a spreadsheet: [Spreadsheet pipeline](/docs/islandora/ingest/sheet-pipeline/).
- The CollectiveAccess migration (archive): [Migration](/docs/migration/).
- A desktop GUI around the CLI is in progress: [Workflows research](/docs/islandora/research/workflows/).
