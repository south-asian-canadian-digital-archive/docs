# SACDA docs

Documentation for the South Asian Canadian Digital Archive (sacda.ufv.ca): how it is
built, run, ingested into and extended.

Published at **https://south-asian-canadian-digital-archive.github.io/docs/**.

## Working on the docs

Pages are Markdown in `src/content/docs/`, one folder per sidebar section. The sidebar
is generated from the folders; order pages with `sidebar.order` in the frontmatter.

```bash
bun install
bun run dev      # http://localhost:4321/docs/
bun run build    # static site in dist/
```

- Link between pages with absolute paths: `/docs/<section>/<page>/`.
- Date any number or state, and put the command that verifies it next to it.
- Never commit credentials, internal hostnames or IP addresses, personal details, or
  anything about unpublished donor material. This repo is public.
- If a page and the server disagree, the server wins. Fix the page.

Pushing to `main` builds the site with Astro Starlight and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`).

## Credits

The site's layout and components derive from the docs site of
[qrate](https://github.com/devnull03/qrate), which is AGPL-3.0. See `LICENSE`.
