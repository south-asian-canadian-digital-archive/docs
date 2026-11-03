---
title: Workbench gotchas
description: Islandora Workbench behaviours that silently lose or duplicate data, and what to do instead.
tags: [python]
sidebar:
  order: 1
---

| Gotcha | What happens | Do this |
|---|---|---|
| `remind_user_to_run_check: true` on a secondary task | `input()` has no stdin, so EOFError. **Workbench still exits 0**: the fonds is created and every item silently skipped | `false` on every secondary config |
| `nodes_only` vs `allow_missing_files` | `nodes_only` strips media from the **whole** batch | Items: `allow_missing_files: true` only when files are really missing; never `nodes_only` |
| HTTP retries | A timed-out POST that actually succeeded gets retried, creating duplicates (up to ×7) | `http_max_retries: 0` on creates; run `dup_audit.py` afterwards |
| `query_csv_id_to_node_id_map_for_parents` | The map in `temp_dir` is never pruned after a rollback, so children attach to deleted nodes | Prune after rollback ([Ingest CA Pipeline](/docs/migration/ca-pipeline/)) |
| Shared temp cache | Every collection's CSV is `ca-items-workbench.csv`, so parallel runs can splice rows between collections | Per-collection `temp_dir` |
| `field_model` templates | A `csv_value_templates` entry for `field_model` flattens every row to one model | Let prepare/organise derive it per row |
| Single-file PDFs as Paged Content | Empty viewer (no Page children) | Digital Document. 26 were fixed 09-04 |
| Big videos | 504s above ~450 MB through the campus load balancer until IT raised the timeout. The node gets created, the media doesn't | Attach later with `task: add_media`; files up to 1.6 GB worked on 09-29 |
| Exit 0 ≠ success | Cascades can create zero items; orphans log cleanly | Verify `field_member_of` on prod |
| `--check` on redirects | Probes every URL with `adaptive_pause: 3`, which takes hours | Check a 5-row slice |
| Windows console | `UnicodeEncodeError: 'charmap'` on diacritics killed a run | `export PYTHONIOENCODING=utf-8` |
| Commented CSV rows | Ingested as real nodes | Strip them |
| Files without extensions | Workbench can't type them | Copy with the right extension, then attach |
| Default Python User-Agent | 403 on some hosts | Send a browser UA on GETs |
| Duplicate aliases | Second node gets `-0`/`-1`; after deleting dups the kept node may keep the suffix | Check `/node/<nid>` redirects to the clean alias |
| Lowercased aliases | Aliases are lowercase; redirect targets are mixed case and rely on case-insensitive lookup | Spot-check |
| Ingest account | Without `fedoraadmin`, Fedora 403s audio/video/`file` | Check roles before ingesting |
| Deploys during ingest | php-fpm restarts and uploads die | Coordinate; see [Deploying](/docs/islandora/operations/deploying/) |
