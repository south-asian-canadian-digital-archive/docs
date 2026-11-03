---
title: About these docs
description: How this site is organised and how to contribute.
tags: [astro, bun]
sidebar:
  order: 0
  label: Contributing
---

The site has one area per website or practice, each with its own sidebar. Switch areas
from the list at the top of the sidebar or from the [home page](/docs/).

## Contributing

Source: [`south-asian-canadian-digital-archive/docs`](https://github.com/south-asian-canadian-digital-archive/docs).
Every page has an **Edit page** link at the bottom.

```bash
bun install
bun run dev      # http://localhost:4321/docs/
bun run build
```

- Pages are Markdown in `src/content/docs/<area>/`. Order pages with `sidebar.order`.
- Link with absolute paths: `/docs/<area>/<section>/<page>/`.
- Date every number or state, and put the command that verifies it next to it.
- The repo is **public**. UFV hostnames and UFV email addresses are fine. Never commit
  credentials, IP addresses, private individuals' details, or anything about unpublished
  donor material.
- Pushing to `main` deploys to GitHub Pages.

Areas and their folders:

| Area | Folder |
|---|---|
| SACDA / Islandora | `islandora/` |
| CollectiveAccess migration | `migration/` |
| Digitization and metadata | `digitization/` |
| South Asian Canadian Heritage | `sach/` |
| Canadian Sikh Heritage | `csh/` |
| SACLP | `saclp/` |
| About | `about/` |
