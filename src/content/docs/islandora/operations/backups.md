---
title: Backups
description: What is at risk and the plan to back it up.
tags: [docker]
sidebar:
  order: 5
---

## Current state

The Docker data root and every volume live on the `/data` drive, and **that drive is
backed up by snapshots** (November 2026). The snapshots cover the database, public
files, Fedora, Solr and the exhibit builds together.

Not on `/data`, so check they are covered separately:

- the server checkout's `secrets/`, `certs/` and `.env` (in `/opt/islandora-prod`)
- `/` (OS and the containerd image store), which is rebuildable

A hand-made database dump from 2026-06-24 also exists; it is stale and not part of the
backup plan.

## What's at risk

| Data | Volume | Size | Rebuildable? |
|---|---|---|---|
| MariaDB (content, users, taxonomy, redirects) | `isle-sacda_mariadb-data` | 5.6 GB | **No** |
| Public files (originals + derivatives) | `isle-sacda_drupal-public-files` | 59 GB | **No** (originals) |
| Fedora (audio/video/`file` binaries, RDF) | `isle-sacda_fcrepo-data` | 84.5 GB | **No** (binaries) |
| `secrets/`, `certs/`, `.env` | checkout | tiny | **No**; the DB and services read passwords from `secrets/` |
| Blazegraph | `isle-sacda_blazegraph-data` | 0.3 GB | Yes, from Fedora |
| Solr | `isle-sacda_drupal-solr-config` | 84 MB | Yes, reindex |
| ActiveMQ | `isle-sacda_activemq-data` | 45 MB | Transient |
| Config | git | – | Yes |
| Exhibits | `/data/exhibits` | ~700 MB | Yes, `deploy-exhibits.sh` |

The original source media is on the SASI shared drive (see [Ingest CA Pipeline](/docs/migration/ca-pipeline/)) and possibly on the legacy CA server, so some of it could be re-ingested. Metadata edits made in Drupal since ingest could not.

## Orphaned `isle-sacda-prod_*` volumes

Ten volumes (about 13.5 GB) are left over from before the compose project was renamed from `isle-sacda-prod` (derived from the `/opt/islandora-prod` dir) to `isle-sacda`. Nothing uses them.

They are an **older partial copy** of prod (DB 2.9 GB, public files 10.4 GB), not a backup. Don't delete them until real backups exist, and even then only on purpose.

## Good practice on top of snapshots

1. Record the snapshot schedule, retention and who runs restores in the team's notes.
2. A snapshot taken while MariaDB is writing is crash-consistent, not clean. For an
   extra safety net, take a logical dump before risky changes (upgrades, bulk deletes):

```bash
docker compose exec -T mariadb sh -c 'mariadb-dump -uroot -p"$(cat /run/secrets/DB_ROOT_PASSWORD)" --single-transaction --all-databases' | gzip > /data/backups/db-$(date +%F).sql.gz
```

3. Keep `secrets/`, `certs/` and `.env` somewhere the snapshots or IT cover.
4. Test a restore onto the test server now and then.
