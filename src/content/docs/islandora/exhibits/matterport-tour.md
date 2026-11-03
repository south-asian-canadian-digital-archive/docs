---
title: Matterport tour
description: The archived CSHM virtual tour at /cshm-tour/, a separate Compose project behind the same Traefik.
sidebar:
  order: 11
---

`https://sacda.ufv.ca/cshm-tour/` hosts an archived Matterport virtual tour. **The
trailing slash is required.**

It is a separate Compose project from the Islandora stack. It only joins the stack's
Docker network (`isle-sacda_default`) so that Traefik can route to it.

## Where things are

- Deploy directory on the server: `/opt/matterport-dl` (Compose file, `.env`, `Makefile`,
  `patch.py`, README).
- Source: the org's fork of `matterport-dl`.
- Base image: `ghcr.io/south-asian-canadian-digital-archive/matterport-dl:latest`. The
  tour data (1.7 GB) is baked into the image; there is no volume.
- Local image: `matterport-dl:local`, the base image plus `patch.py`.
- Container health check on `127.0.0.1:8080`.

## Routing

```
campus proxy
  → traefik :443  Host(DOMAIN)
       /cshm-tour       → 301 /cshm-tour/
       /cshm-tour/...   → matterport :8080  (StripPrefix /cshm-tour)
       /*               → drupal
```

Traefik picks up the routers from container labels. Without the trailing slash, the
tour's relative asset requests go to Drupal and the viewer stays blank.

## Config (`.env`)

| Variable | Value |
|---|---|
| `MODEL_ID` | the tour's Matterport model ID |
| `DOMAIN` | must match the Islandora stack's `DOMAIN` |
| `PUBLIC_PATH` | `/cshm-tour` |
| `ISLANDORA_NETWORK` | `isle-sacda_default` |
| `LOCAL_PORT` | `8080` (loopback only) |

After changing `.env`, run `make restart`. Traefik reads labels only when the container is
created.

## Commands

Run in `/opt/matterport-dl`:

| Command | What |
|---|---|
| `make up` | Build and start |
| `make restart` | Rebuild and recreate (after an `.env` change) |
| `make update` | Pull a new base image, re-apply the patch, roll onto it |
| `make health` | Check the container directly and through the public URL |
| `make logs`, `make tours`, `make shell`, `make route` | |

## Why there is a patch

- The tour assumed it owned the web root, so its API calls went to `/api/...` on Drupal.
  `patch.py` makes the proxy base follow the page's own location.
- The capture's access keys expired on 2026-08-06. Each response moves every
  `validUntil` to 2099 as it is served, so the tour can't expire.
- It also rewrites CSS `url()` values and adds a fallback for plugin versions.

These fixes are now in the fork. Once the GHCR image is rebuilt from the fork, delete
`patch.py` and the Dockerfile. `patch.py` prints "already applied" when that's the case.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Blank viewer, 404s on assets | Missing trailing slash |
| Drupal 404 at `/cshm-tour/` | Traefik didn't pick up the labels; check the container is on `isle-sacda_default` |
| Tour stops loading with no console error | Expiry. `curl -s https://sacda.ufv.ca/cshm-tour/ \| grep -o 'validUntil[^,]*' \| sort -u` should show only 2099 dates |
| Traefik 502 | Run `make health`. If the local check is 200, the fault is in routing |

## Embedding in Drupal

```html
<iframe src="/cshm-tour/" width="100%" height="640" allowfullscreen style="border:0"></iframe>
```

On 2026-10-26 the tour moved from `islandora.ufv.ca` to `sacda.ufv.ca`.
