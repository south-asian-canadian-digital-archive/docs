---
title: Backups
description: What is at risk and the plan to back it up.
sidebar:
  order: 5
---

## Current state: there are none

As of 2026-09-29, **nothing backs up this stack** that the service account can see:

- no backup script in the repo
- no backup cron entry for the service account
- no backup agent installed

VM-level snapshots by UFV IT are **unknown**. `/opt/netapp_prepare_vm.sh` hints that IT uses NetApp tooling, but nothing confirms a schedule covers this VM.

The only DB dump is a hand-made one from 2026-06-24, stale and on the same disk.

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

The original source media is on the SASI `F:` drive (see [Ingest CA Pipeline](/docs/ingest/ca-pipeline/)) and possibly on the legacy CA server, so some of it could be re-ingested. Metadata edits made in Drupal since ingest could not.

## Orphaned `isle-sacda-prod_*` volumes

Ten volumes (about 13.5 GB) are left over from before the compose project was renamed from `isle-sacda-prod` (derived from the `/opt/islandora-prod` dir) to `isle-sacda`. Nothing uses them.

They are an **older partial copy** of prod (DB 2.9 GB, public files 10.4 GB), not a backup. Don't delete them until real backups exist, and even then only on purpose.

## To do (priority order)

1. Ask UFV IT whether this VM is snapshotted: how often, what retention, and whether a restore has ever been tested. Also ask whether the thin pool is monitored.
2. Nightly DB dump:

```
docker compose exec -T mariadb sh -c 'mariadb-dump -uroot -p"$(cat /run/secrets/DB_ROOT_PASSWORD)" --single-transaction --all-databases' | gzip > /data/backups/db-$(date +%F).sql.gz
```

   Check the secret path inside the container first, and ship the dump **off the VM**.
3. Off-box copy of public files and fcrepo (about 145 GB) to an IT-provided share. A copy on the same VM or thin pool isn't a backup.
4. Store `secrets/`, `certs/` and `.env` somewhere IT controls.
5. Test a restore onto the test server.
