---
title: Architecture
description: The services, the request path, what lives where, and how the pieces connect.
sidebar:
  order: 1
---

## One VM, one Compose stack

Production is a single virtual machine at UFV running RHEL 9 with **2 vCPU and about
7.7 GB of RAM**, plus generous swap. Everything runs as the Docker Compose project
**`isle-sacda`** from a git checkout at `/opt/islandora-prod`. The directory name is
historical; the repo is `isle`.

The stack is built on [isle-buildkit](https://github.com/Islandora-Devops/isle-buildkit),
the Islandora project's Docker images. The repo is a fork of the upstream
`isle-site-template`, kept mergeable (`git merge upstream/main`) with our own
`config/sync`.

| | PROD (2026-09-29 audit) | `main` and DEV (2026-11) |
|---|---|---|
| isle-buildkit (`ISLANDORA_TAG`) | 6.2.9 | 7.0.22 |
| Drupal | 10.6.1 | 11.4.11 |
| Islandora | 2.17.3 | 2.19 |

The `main` branch moved to Drupal 11 and buildkit 7 in October 2026, and the Drupal image
deployed from it. Whether every other PROD service was moved to 7.0.22 is
[listed for review](/docs/islandora/reference/needs-review/). See
[Upgrades](/docs/islandora/operations/upgrades/).

## Request path

```
browser
  → UFV campus reverse proxy (public TLS, owned by UFV IT)
    → the VM :443
      → traefik (internal mkcert cert, routing, rate limits)
        → drupal        everything not listed below
        → exhibits      /exhibits/<slug>, /static/*, and the static /search page
        → host :9000    /hooks/*  (deploy webhook)
        → matterport    /cshm-tour/*  (separate Compose project)
```

Two consequences show up everywhere:

- **Public TLS is not ours.** The campus proxy terminates it and does not verify our
  certificate. A broken Traefik certificate is invisible to browsers but breaks every
  JVM service. See [Certificates](/docs/islandora/operations/certificates/).
- **We never see client IPs.** The proxy sends its own address in `X-Forwarded-For`, so
  every rate limit is a global bucket. See
  [Traefik and rate limits](/docs/islandora/operations/traefik-and-rate-limits/).

## Services

About 17 containers. Everything except `drupal`, `exhibits` and `traefik` is
`islandora/<service>:${ISLANDORA_TAG}`.

| Service | Role | Notes |
|---|---|---|
| `drupal` | Drupal, php-fpm and nginx | Image `ghcr.io/south-asian-canadian-digital-archive/isle-sacda:latest`, built by CI. **5 php-fpm workers.** |
| `mariadb` | Drupal database | |
| `fcrepo` | Fedora | Binaries for audio, video and `file` fields, plus RDF for everything |
| `solr` | Search | One index, `default_solr_index` |
| `activemq` | Message broker | Queues for every derivative and indexing job. No dead-letter queue |
| `alpaca` | Queue consumer | Dispatches to the microservices below |
| `milliner` | Drupal to Fedora sync | |
| `houdini` | ImageMagick derivatives | Image thumbnails and service files, PDF thumbnails |
| `homarus` | ffmpeg derivatives | Video and audio. **Serial and slow** (13 to 50 minutes per video on 2 cores) |
| `hypercube` | OCR | Tesseract |
| `fits`, `crayfits` | Technical metadata | Creates `fits_technical_metadata` media |
| `mergepdf` | | Idle |
| `cantaloupe` | IIIF image server | Fetches sources over HTTPS through the hairpin to Traefik |
| `blazegraph` | Triplestore | Rebuildable from Fedora |
| `traefik` | Router | Pinned by digest |
| `exhibits` | Static nginx | Serves `/data/exhibits`, `./static` and the static `/search` page |

The indexing path is Drupal → ActiveMQ → Alpaca → microservice → back to Drupal, and
Drupal → ActiveMQ → Alpaca → Milliner → Fedora. See
[Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/).

JVM heaps are capped in `docker-compose.yml` (Cantaloupe 1 GB; Alpaca, Fedora and
Blazegraph 768 MB; FITS 512 MB). Without the caps each JVM takes a quarter of host RAM
and the box swaps to death. ActiveMQ is uncapped because its memory variable is a no-op.

## What lives where

| Thing | Where | In git? |
|---|---|---|
| Drupal code, theme, modules, `config/sync` | Baked into the drupal image | Yes |
| Compose file, Makefiles, `scripts/`, `conf/`, `hooks.yaml` | Server checkout | Yes |
| `.env` | Server checkout | **No**, maintained by hand on each server |
| `secrets/`, `certs/` | Server checkout | **No** |
| Database, files, Fedora, Solr | Docker volumes `isle-sacda_*` | Snapshotted with the `/data` drive; see [Backups](/docs/islandora/operations/backups/) |
| Exhibit builds | `/data/exhibits` | Rebuildable from the exhibit repos |

Three services **bind-mount from the git checkout**:

- `traefik` mounts `conf/traefik/` and hot-reloads it.
- `homarus` mounts `conf/homarus/scyllaridae.yml`; `houdini` mounts `conf/houdini/cmd.sh`.
- `exhibits` mounts `conf/exhibits/nginx.conf`, `/data/exhibits` and `./static`.

A `git pull` on the server therefore changes live routing and derivative behaviour
**without an image change**.

## Disks

| Mount | Size | Holds |
|---|---|---|
| `/` | 50 GB | OS, the containerd store (`/opt/containerd`), `/tmp` |
| `/data` | 1 TB | Docker data root (`/data/docker`), `/data/exhibits` |

Both sit on one **thin-provisioned** LVM pool, so free space in `df` isn't a guarantee.
The containerd store stayed on `/` when the Docker data root moved to `/data`, which is
why `/` filled up once. The nightly image cleanup exists for that reason.

Volume sizes on 2026-09-29: Fedora 84.5 GB, public files 59.2 GB, MariaDB 5.6 GB,
everything else under 0.5 GB.

## Data model in one paragraph

Top-level collections are `collection` nodes. Series, sub-series and files are
`archival_component` nodes, and items are `islandora_object` nodes ("Repository Item").
Hierarchy is `field_member_of`; files hang off nodes as media with a **media use** term
(Original File, Service File, Thumbnail, Extracted Text). Every node with an identifier
gets the alias `/collections/<identifier>`. A plan to retire the `collection` type is in
[Data model research](/docs/islandora/research/data-model/).
