---
title: Traefik and rate limits
description: Routers, priorities and the rate limits that keep crawlers from taking the site down.
sidebar:
  order: 7
---

Config lives in `conf/traefik/*.yml` (bind-mounted, **hot-reloads**) plus labels on the
`traefik` service in `docker-compose.yml`. The files are the source of truth for the
numbers, and their comments explain each one. This page explains why they are shaped the
way they are. It reflects `main` as of 2026-10-29.

## Routers by priority

| Priority | Router | Match | Goes to |
|---|---|---|---|
| 1100 | `exhibits` | the six `/exhibits/<slug>` prefixes | `exhibits` nginx |
| 1100 | `static` | `/static/` | `exhibits` nginx |
| 1100 | `hooks` (label) | `/hooks/`, HTTPS only, 6/min burst 3 | host `:9000` |
| 1005 | `block-meta` | Meta crawler user agents (and Facebook's previewer on facet URLs) | deny all |
| 1004 | `search-page` | `/search` with any facet | drupal, 3/min. **Temporary**, see below |
| 1003 | `search-shell` | anonymous `GET`/`HEAD` of `/search` (no session cookie) | `exhibits` nginx serving the static page |
| 1002 | `search-deep` | any URL with `f[3]` (4+ facets) | drupal, 2/min burst 2 |
| 1001 | `search` | `/search` and `/api/search` | drupal, 20/s burst 60 |
| 999 | `facets` | any other URL with `f[0]` (collection pages and other listings) | drupal, 3/min burst 3 |
| 997 | `legacy-limited` | old CollectiveAccess paths (`/Browse/…`, `/Search/…`) and `/search-legacy` | drupal, 20/min burst 10 |
| default | `drupal` | `Host(DOMAIN)` | drupal |

The Matterport tour adds its own routers through container labels; see
[Matterport tour](/docs/operations/matterport-tour/).

**Any new host-wide router must sit below 1100**, or it will capture `/exhibits`,
`/static` and `/hooks`. The facet and bot routers match on query or user agent alone,
which is why those three sit at 1100. Within the search group, the order matters too:
deep facet URLs must hit `search-deep` before `search`.

## Why the limits exist: facet crawls

Faceted search is combinatorial. Every stacked `f[N]` is a new URL, so crawlers walk an
unbounded space, and every new URL is a cache miss. With **`pm.max_children=5`** on
2 cores:

- On 2026-08-18 and 08-25, about 35 requests a minute of deep-facet searches pinned
  every php-fpm worker and the whole site returned 502.
- On 2026-10-26 and again on 10-29, crawlers took the site down through `/search` and
  then through faceted collection pages once `/search` was throttled. On PROD these
  renders cost several CPU-seconds each.

The budget spends roughly one worker's worth on expensive requests and keeps the other
four for normal pages. One to three facet searches on the fast search page are cheap, so
they get a generous limit; four or more are past what browsing needs.

The structural fix was to make search cheap, not to tune the limits. See
[Search](/docs/operations/search/).

## Global buckets, not per-IP

The UFV proxy puts its own address in `X-Forwarded-For`, so per-client limiting is
impossible. Every limit keyed on `requestHost` is **one bucket for the whole internet**.
During a crawl some real users get 429s too. That's deliberate: a 429 for a slice beats a
502 for everyone.

If UFV ever fixes the forwarding chain, switch the middlewares to
`ipStrategy: {depth: 1}` and raise the numbers.

**Don't loosen the limits without also raising `PHP_PM_MAX_CHILDREN`**, and note the
trade-off. Tests on DEV showed more workers alone doesn't help: 3, 5 and 8 workers all
saturated the same way.

## The temporary `search-page` router

The 2026-10-29 deploy timed out during a crawl, so the static `/search` page was never
generated and nginx proxied every anonymous `/search` to Drupal unmetered.
`search-page` meters faceted `/search` at 3 a minute until the shell exists. Remove it
(and its middleware) once `drush sacda-fast-search:shell` has written
`/var/www/drupal/search-shell` on PROD.

## Logging

Traefik's access log is enabled only on the search routers, with a size cap. Full access
logging cost too much CPU. Without logs, a crawl's rate and source can't be diagnosed
afterwards, so keep at least the search logs. The `traffic-monitor` service records
metrics every 5 minutes; see the [Runbook](/docs/operations/runbook/).

## robots.txt

Core's `Disallow: /search/` (with a trailing slash) doesn't match `/search?f[0]=…`. The
fix is `assets/patches/robots_append.txt`, appended at Composer scaffold time, so it's in
the image. It also disallows `/api/`. Check it with:

```bash
curl -s https://sacda.ufv.ca/robots.txt | tail -8
```

Meta's crawlers ignore robots.txt, which is why `block-meta` exists.

## Recognising a crawl

- Symptoms: 502s or hangs, php-fpm workers pinned, faceted URLs all over the access log.
- `ps` %CPU is a lifetime average, so sample `TIME` twice.
- When the limits engage, Traefik returns 429.
- Referrers claiming `islandora.ufv.ca` are faked.
- If static routes (`/exhibits/km/`) answer but every Drupal route hangs, Drupal is stuck:
  `docker compose restart drupal`.
