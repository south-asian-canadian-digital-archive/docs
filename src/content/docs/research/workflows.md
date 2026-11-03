---
title: Workflows
description: The Workbench GUI, a config pull-request flow, an ingest task registry, and how these docs should be kept.
sidebar:
  order: 5
---

## Workbench GUI

`islandora_workbench_gui` is a desktop app in progress: settings, persistent storage,
workspaces, streamed Workbench output, a status bar and log upload. A hosted commercial
tool was ruled out (cloud-hosted, paid, Latin-only OCR).

**Recommendation:** finish the desktop app, always wrapping the Workbench CLI rather than
reimplementing it. Order: a `--check` gate that unlocks Ingest; per-run logs; workspaces;
rollback using Workbench's own rollback output; an overnight runner last.

Tests: Ingest stays disabled until `--check` passes; live logs survive an app restart;
a rollback leaves the [Ingest audit](/docs/ingest/ingest-audit/) extra-node count
unchanged.

## Config pull-request flow

`config/sync` lives in `isle` with the code. A camp talk suggested splitting config into
its own repo.

**Recommendation:** keep config in `isle` and adopt issue → branch → PR → merge. A split
adds a second pin to keep in step with the code it depends on (a module enabled alongside
its code). Add a small script: `cex`, branch, commit, open a PR (`scripts/create-pr.sh`).
Add a CI check if `cim` can safely run in a test stack. Skip a UI push button: it would
mean storing GitHub credentials in the web container.

Tests: change one view label and run the script; the PR contains only that file. Seed
unrelated drift; the script stops or commits it separately.

## Ingest task registry

`prepare_ingest.py` had a hardcoded order (subjects, fonds, subcollections, items,
redirects). Only fonds chained subcollections and items through `secondary_tasks`;
subjects and redirects were run by hand from a printed reminder. Subjects can't be a
secondary task, because secondary tasks run **after** their parent and terms must exist
first.

**Built (2026-11-02, `research/camp-2026` branch of `g/`, not yet run for real):**

- `config/sites.toml` site profiles (host, credentials, target bundle). PROD and TEST stay
  `converted = false`, so the default is safe for them.
- `tasks.py`: each task declares its template, CSV, row builder and `depends_on`; a
  topological sort produces `run_order.json`.
- `run_ingest.py`: runs the order, stops at the first failure, resumes.
- `hierarchy.py`: shared parent logic.

Remaining, in order: thesaurus targets in item templates after term approval; retire the
one-off mapping scripts and `collection_file`-named outputs; remove the legacy collection
flag once PROD is converted.

Tests: output for one collection is byte-identical to today's CSVs apart from the run
file; a dependency cycle refuses to generate; kill mid-run and resume with no duplicates.

## Documentation practice

The repo's `CLAUDE.md` was gitignored and had drifted: on 2026-11-02 it undercounted terms
and reported about 221 orphaned originals where the audit found 0. The camp notes flagged
single-developer risk.

**Practice for this site:**

- Separate dated history (the [Incident log](/docs/operations/incident-log/)) from current
  state.
- Put the verifying command next to any number.
- Add a doc-update checkbox to the PR template in `isle`.
- Handover test: can someone else deploy, ingest and restore using only these docs? Each
  place they get stuck becomes a doc fix.
