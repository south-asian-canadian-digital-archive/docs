---
title: Environments and access
description: The environments, how to get onto the server, and which accounts and tokens the site depends on.
sidebar:
  order: 2
---

## Environments

| Env | Domain | Notes |
|---|---|---|
| **PROD** | `sacda.ufv.ca` | UFV VM `sac-app02-x-prd.ad.ufv.ca`. Formerly `islandora.ufv.ca`, same server; node IDs carried over |
| **TEST** | `sacda-test.ufv.ca` | UFV test VM. Formerly `islandora-test.ufv.ca`. Not reachable from GitHub, so there is no auto-deploy |
| **DEV** | developer instance | A maintainer's own machine behind a tunnel. It is personal and leaves with that maintainer; see [Local development](/docs/islandora/development/local-development/) |
| **Local** | `islandora.traefik.me` | Your laptop, `make up` |
| **Legacy** | `sacda.ca` | `sac-app01-x-prd`, the old CollectiveAccess site, being retired; see below |

**Never hardcode a hostname.** Everything derives from `DOMAIN` in `.env`: Traefik rules,
the Cantaloupe URL, certificate SANs and exhibit builds. The rename from
`islandora.ufv.ca` broke every place a hostname had been hardcoded.

## Getting onto the server

- Login uses UFV's directory accounts, on the campus network or VPN. UFV IT grants the
  login and sudo groups for the project.
- Day-to-day operations run as the service account **`svcislandora`**, which is in
  the `docker` group. Anything that needs root (restarting `webhook.service`, root's crontab,
  reading `/data/docker` directly) needs the sudo credential. Make sure UFV IT knows who
  holds it **before** you need it.

## GitHub

- Org: `south-asian-canadian-digital-archive`. **Keep at least two org owners**, so
  someone can always reach Actions, Environments and secrets.
- The server pulls `isle` with a read-only **deploy key** that is not tied to a person.
  A second deploy key is used for `matterport-dl`.
- GitHub Environments: `Production` and `Staging`. Secrets include the webhook token and
  a Slack webhook; variables include `DOMAIN` and `ISLANDORA_TAG`. List what the
  workflows read with:

```bash
grep -oh 'vars\.[A-Z_]*\|secrets\.[A-Z_]*' .github/workflows/*.yml | sort -u
```

## Container registry (GHCR)

- CI pushes the Drupal image with the built-in `GITHUB_TOKEN`.
- The server **pulls** with a login stored in the service account's Docker config.
  If that token belongs to a person and lapses, deploys fail at `docker compose pull`
  with `unauthorized`. Use a `read:packages` token from a shared account, or make the
  package public.

## Drupal accounts

- The `admin` (uid 1) password is in `secrets/DRUPAL_DEFAULT_ACCOUNT_PASSWORD` on each
  server. Don't share it; create your own account.
- Give your account `fedoraadmin` if it will ingest or edit media:

```bash
docker compose exec drupal drush user:create <name> --mail=<email>
docker compose exec drupal drush user:role:add administrator <name>
docker compose exec drupal drush user:role:add fedoraadmin <name>
```

Without the literal `fedoraadmin` role, Fedora returns 403 on every write.
`administrator` alone doesn't count. See
[Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/).

Editors get `content_editor`, which also carries `use place lookup` and
`use ingest audit`.

## UFV-owned infrastructure

| Thing | Why you'd need it |
|---|---|
| Campus reverse proxy | Public certificate, virtual hosts, upload timeouts (raised for videos over 450 MB), the `X-Forwarded-For` header |
| The VM, its disks and thin pool | Disk growth, snapshots and backups |
| Network rules and firewall | Who can reach the VM; the VM runs a host firewall |
| `sacda.ca` DNS and the legacy server | Decommissioning the old site |
| Directory groups | Server access for new people |

Record the UFV IT contacts and ticket queue in the team's internal notes; they are not
published here.

## Legacy `sacda.ca`

- `sacda.ca` was flapping between 200 and 503 at the end of September 2026.
- The legacy server may hold the **only copy of the original CollectiveAccess data**.
  Don't let it be deleted without a snapshot.
- The theme still links to it in a few places: the default carousel slides
  (`includes/carousel.inc`), `page--front.html.twig`, and the seed content. These break
  when it goes away.
- Before decommissioning, ask UFV IT to 301 `sacda.ca/*` to `sacda.ufv.ca` at the proxy.
  Drupal already holds about 15,000 redirects from old CollectiveAccess paths
  ([Redirects](/docs/migration/redirects/)), so a blanket host redirect keeps old bookmarks
  working.
- An old self-hosted GitHub runner from the CollectiveAccess era may still be registered
  in the org. Check Settings → Actions → Runners and remove it.
