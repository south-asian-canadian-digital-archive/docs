---
name: sasi-docs
description: Look up how SASI's websites and archive work, from the public SASI docs site. Use this before working on sacda.ufv.ca (Islandora/Drupal, Docker, Traefik, Fedora, Solr, derivatives, deploys, the sacda theme or custom modules), SACDA exhibits, Islandora Workbench ingests and scripts, the CollectiveAccess migration history, SACDA metadata and digitization rules (fields, access identifiers, LCSH/TGM/SACDA Thesaurus, places), or the southasiancanadianheritage.ca, canadiansikhheritage.ca and saclp sites. Also use it to answer questions about any of these.
---

# SASI docs

The docs are published at https://south-asian-canadian-digital-archive.github.io/docs/
as a static site. Every page is also served as plain Markdown, so read those instead of
the HTML.

## How to look things up

1. **Find the page.** Fetch the index:
   `https://south-asian-canadian-digital-archive.github.io/docs/llms.txt`
   It lists every area's set and links to them.
2. **Read one area** when the question is about one site or topic. Each area has its own
   file, linked from `llms.txt`:
   - SACDA / Islandora: operations, exhibits, Workbench, ingest, development, research
   - CollectiveAccess migration (archive)
   - Digitization and metadata
   - South Asian Canadian Heritage, Canadian Sikh Heritage, SACLP
3. **Read one page** by appending `.md` to its URL, e.g.
   `https://south-asian-canadian-digital-archive.github.io/docs/islandora/start/gotchas.md`.
4. **Read everything** only when needed: `llms-full.txt` (large) or `llms-small.txt`.

Start a new SACDA task with `islandora/start/architecture.md` and
`islandora/start/gotchas.md`.

## Rules the docs expect you to follow

- Never touch PROD (sacda.ufv.ca) unless the user asks. DEV is for experiments.
- On any Drupal box: run `drush config:status` before `drush cim` or `make deploy`, and
  export live config changes before importing.
- Dates and numbers in the docs are dated snapshots. If the docs and the running system
  disagree, the system wins; tell the user and suggest a docs fix.
- Open questions are listed on `islandora/reference/needs-review.md`.
- Don't put credentials, IP addresses or details of unpublished donor material in the
  docs repo; it is public.

## Contributing a fix

Docs source: https://github.com/south-asian-canadian-digital-archive/docs
Pages are Markdown in `src/content/docs/<area>/`. Link between pages with absolute
`/docs/<area>/<section>/<page>/` paths. Build with `bun install && bun run build`.
