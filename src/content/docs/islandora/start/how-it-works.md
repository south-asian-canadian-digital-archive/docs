---
title: How it works (diagrams)
description: "Diagrams of the isle stack: the services, a request's path, deploys, derivatives, ingest and bot protection."
tags: [docker, islandora, drupal, traefik, mermaid]
sidebar:
  order: 2
---

The diagrams on this page are a map. The detail and the reasons behind each part are on
the pages each section links to. They reflect `isle` `main` as of 2026-11. The Markdown
copy of this page (append `.md`) holds the Mermaid source, so agents can read it too.

## The whole system

```mermaid
flowchart TD
  user([Visitor / editor]) --> proxy[UFV campus reverse proxy<br/>public TLS]
  proxy --> fw{{VM host firewall}}
  fw --> traefik[traefik<br/>routing + rate limits]

  subgraph vm [Production VM: Compose project isle-sacda]
    traefik --> drupal[drupal<br/>php-fpm + nginx]
    traefik --> exhibits[exhibits nginx<br/>static exhibits, /static, /search shell]
    traefik --> hooks[host :9000<br/>webhook.service]
    drupal --> mariadb[(mariadb)]
    drupal --> solr[(solr)]
    drupal --> activemq[[activemq]]
    activemq --> alpaca[alpaca]
    alpaca --> milliner[milliner] --> fcrepo[(fcrepo / Fedora)]
    alpaca --> micro[houdini · homarus · hypercube · fits]
    alpaca --> blazegraph[(blazegraph)]
    micro -->|derivatives| drupal
    cantaloupe[cantaloupe IIIF] -->|source images via traefik| traefik
    traefik --> cantaloupe
  end

  gh[GitHub Actions] -->|image| ghcr[(GHCR)]
  gh -->|POST /hooks/deploy-sacda| proxy
  hooks -->|make deploy-auto| drupal
  ghcr -.->|docker compose pull| drupal
```

Services and what they hold: [Architecture](/docs/islandora/start/architecture/).

## A page request

```mermaid
flowchart TD
  b([Browser]) -->|HTTPS| p[Campus proxy<br/>terminates public TLS,<br/>re-encrypts to the VM]
  p -->|:443| t[traefik]
  t --> q{Which router matches first?<br/>highest priority wins}
  q -->|"/exhibits/&lt;slug&gt;, /static/ (1100)"| ex[exhibits nginx]
  q -->|"/hooks/ (1100, 6/min)"| wh[webhook on the host]
  q -->|"Meta crawler UA (1005)"| deny[403 deny-all]
  q -->|"anonymous GET /search (1003)"| shell[static /search shell<br/>Svelte app]
  q -->|"/search, /api/search, facets<br/>(1002 to 997, rate limited)"| d[drupal]
  q -->|everything else| d
  shell -->|fetch /api/search| t
  d -->|over budget| r429[429 Too Many Requests]
```

Routers and numbers: [Traefik and rate limits](/docs/islandora/operations/traefik-and-rate-limits/).
Network details: [Networking](/docs/islandora/operations/networking/).

## A deploy

```mermaid
sequenceDiagram
  autonumber
  actor dev as Developer
  participant gh as GitHub (isle main)
  participant ci as Actions: build-deploy.yml
  participant ghcr as GHCR
  participant hook as webhook.service (VM)
  participant mk as make (in /opt/islandora-prod)
  participant c as drupal container

  dev->>gh: push to main (not ci: / chore:)
  gh->>ci: quality checks, then build
  ci->>ci: bun build theme and Svelte apps
  ci->>ghcr: push isle-sacda:latest
  ci->>hook: POST /hooks/deploy-sacda + token
  hook-->>ci: 200 as soon as make starts
  hook->>mk: make deploy-auto
  mk->>mk: git pull --ff-only, submodules
  mk->>ghcr: docker compose pull drupal
  mk->>c: up -d exhibits, drupal
  mk->>c: wait for health (120 s)
  mk->>c: drush updb, cim, deploy:hook, cr
  mk->>c: drush sacda-fast-search:shell
```

The `200` comes back before the deploy finishes, so a green CI run doesn't prove the
deploy worked. See [Deploying](/docs/islandora/operations/deploying/).

## Theme and module changes

```mermaid
flowchart LR
  subgraph sub [Submodule repos]
    theme[isle-theme]
    mods[isle-modules]
    auth[authority_resolver]
  end
  theme -->|commit, push| tm[(theme main)]
  mods -->|commit, push| mm[(modules main)]
  tm & mm --> bump[isle: bump submodule pointer]
  fs[sacda_fast_search<br/>lives in isle] --> bump
  bump -->|push to main| ci[CI builds the image<br/>bun build, composer] --> deploy[Deploy as above]
```

See [Custom code](/docs/islandora/development/custom-code/),
[Theme guide](/docs/islandora/development/theme/) and
[Modules](/docs/islandora/development/modules/).

## Derivatives: what happens after an upload

```mermaid
sequenceDiagram
  participant d as Drupal
  participant mq as ActiveMQ
  participant a as Alpaca
  participant m as Milliner
  participant f as Fedora
  participant h as houdini / homarus / hypercube / fits

  d->>mq: node or media saved (Islandora action)
  mq->>a: queue message
  a->>m: index request
  m->>f: write binary or RDF
  a->>h: derivative request (JWT)
  h->>d: fetch the original (HTTPS via traefik)
  h->>d: PUT the derivative as new media
  Note over mq,a: No dead-letter queue: a failed message is gone.
```

Video through `homarus` is serial and slow. See
[Derivatives and Fedora](/docs/islandora/operations/derivatives-and-fedora/).

## Ingest: spreadsheet to repository

```mermaid
flowchart LR
  sheet[Metadata sheet<br/>Excel / Google Sheets] --> org[organise<br/>Rust CLI]
  files[Access files] --> org
  org --> csv[Workbench CSVs]
  csv --> wb[Islandora Workbench<br/>Python, --check first]
  wb -->|REST + JSON:API| drupal[(sacda.ufv.ca)]
  drupal --> audit[Ingest audit page<br/>Svelte, compares the sheet<br/>with what was created]
  sheet --> audit
```

See [Spreadsheet pipeline](/docs/islandora/ingest/sheet-pipeline/) and
[Ingest audit](/docs/islandora/ingest/ingest-audit/).

## Bot protection, in order

```mermaid
flowchart TD
  r([Request]) --> ua{Meta crawler UA?}
  ua -->|yes| x[403]
  ua -->|no| st{Static: /exhibits, /static,<br/>anonymous /search shell?}
  st -->|yes| n[nginx, no PHP cost]
  st -->|no| fac{How many facets?}
  fac -->|"4+ (f[3])"| deep[2/min bucket]
  fac -->|"1 to 3 on /search, /api/search"| s[20/s bucket]
  fac -->|"facets on other pages"| f[3/min bucket]
  fac -->|"none"| legacy{Old CollectiveAccess path?}
  legacy -->|yes| l[20/min bucket]
  legacy -->|no| ok[drupal]
  deep & s & f & l -->|over| e429[429]
  deep & s & f & l -->|under| ok
```

Every bucket is global, because the campus proxy hides client IPs. See
[Bot protection](/docs/islandora/operations/bot-protection/).
