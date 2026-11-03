---
title: AI tools and agent skill
description: Search these docs, read them as Markdown or llms.txt, or give an AI agent the docs skill.
sidebar:
  order: 1
---

## Search

The search box in the header searches **every area** (it uses Pagefind, built with the
site). Press <kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd> to open it.

## Copy page

Every page has a **Copy page** control next to its title. Its menu can copy the page as
Markdown, open the Markdown source, open the page in ChatGPT or Claude, or copy the
`llms-full.txt` URL.

## Plain-text versions

| URL | What |
|---|---|
| `<page URL>.md` | One page as Markdown, e.g. [`/docs/islandora/start/architecture.md`](/docs/islandora/start/architecture.md) |
| [`/docs/llms.txt`](/docs/llms.txt) | An index of the docs and each area's set |
| `/docs/_llms-txt/<area>.txt` | One area's pages in one file, linked from `llms.txt` |
| [`/docs/llms-full.txt`](/docs/llms-full.txt) | The whole site in one file |
| [`/docs/llms-small.txt`](/docs/llms-small.txt) | A condensed version |

## Agent skill

[`/docs/skills/sasi-docs/SKILL.md`](/docs/skills/sasi-docs/SKILL.md) is an
[Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) that tells an
agent when to consult these docs, how to find the right page through `llms.txt`, and the
rules to follow (don't touch PROD, check config drift before importing). The source is
`public/skills/sasi-docs/SKILL.md` in the docs repo.

Install it for Claude Code in a repo you work on:

```bash
mkdir -p .claude/skills/sasi-docs
curl -o .claude/skills/sasi-docs/SKILL.md \
  https://south-asian-canadian-digital-archive.github.io/docs/skills/sasi-docs/SKILL.md
```

Codex and other agents can read the same file, or be pointed at `llms.txt` directly.

There is no MCP server: the site is static, and the Markdown and `llms.txt` files cover
the same need.
