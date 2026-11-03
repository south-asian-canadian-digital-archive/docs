---
title: AI tools
description: Read these docs as Markdown or llms.txt, or hand a page to an assistant.
sidebar:
  order: 3
---

Every page has a **Copy page** control next to its title. Its menu can:

- copy the page as Markdown,
- open the Markdown source in a new tab,
- open the page in ChatGPT or Claude with a prompt to read it,
- copy the URL of the whole site as one file.

## Plain-text versions

| URL | What |
|---|---|
| `<page URL>.md` | One page as Markdown, e.g. [`/docs/start/architecture.md`](/docs/start/architecture.md) |
| [`/docs/llms.txt`](/docs/llms.txt) | An index of every page, following the llms.txt convention |
| [`/docs/llms-full.txt`](/docs/llms-full.txt) | The whole site in one file |
| [`/docs/llms-small.txt`](/docs/llms-small.txt) | A condensed version |

Point an agent at `llms-full.txt` when it needs the whole picture, for example before
working in the `isle` repo.

The site is static, so there is no MCP server here. The `isle` repo's own agent
instructions are the place for repo-specific rules.
