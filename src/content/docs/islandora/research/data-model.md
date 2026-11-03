---
title: 'Data model: retiring the collection type'
description: Why and how to convert collection nodes into Collection-level archival components without losing IDs, URLs or Fedora identity.
sidebar:
  order: 1
  label: Data model
---

**Recommendation:** convert the existing `collection` nodes in place, keeping their nid
and UUID, and delete the content type in a separate, later deploy. Don't recreate
collections as new nodes.

## Why

SACDA has three hierarchy types: `collection` (top level), `archival_component`
(series, sub-series, file) and `islandora_object`. The collection type adds a second
code path everywhere (views, blocks, facets, templates, Workbench configs) for what is
really one more archival level.

## Current state (DEV audit, 2026-11-02)

- DEV has 6 `collection` nodes, all top level, and 8 `archival_component` nodes. 38
  objects and 5 components link directly to collections.
- `field_member_of` on `collection` targets only `collection`. On `archival_component`
  and `islandora_object` it already targets both.
- The pathauto pattern `/collections/[node:field_identifier]` covers all three bundles,
  so URLs survive if identifiers do.
- The `archival_levels` vocabulary has File, Sous-fonds, Series and Sub-series, but no
  Collection or Fonds term. `field_archival_level` is required on `archival_component`.

Things that depend on the bundle: `node.type.collection` and its 11 fields, 4 view
displays, the search view, the top-level collections view, 11 blocks, 30 facets, the
front page's promoted collections in `sacda.theme`, `node--collection.html.twig`,
`FastSearchController::BUNDLES`, and the Workbench configs and scripts.

## Options

| Option | Verdict |
|---|---|
| **A. Convert in place** | Recommended. nid and UUID stay, so `field_member_of`, URLs and Fedora identity are unaffected |
| B. Convert Bundles module | Usable as the tool for A. A direct `type` change alone leaves the old bundle in field tables, so every table must be updated |
| C. New nodes, repoint children | Loses nids and UUIDs, needs redirects, creates new Fedora resources |
| D. Re-ingest with Workbench | Same problems as C |

## Steps

Rehearse on DEV, then on a copy of PROD's database. PROD counts must be measured first.

1. **Inventory.** Map each of the 11 collection fields to `archival_component`, add it, or
   drop it explicitly. Record the data first.
2. **Additive deploy.** Add missing fields, and make every view, block, facet, template,
   `BUNDLES` and front-page reference accept both bundles.
3. **Term.** Create `Collection` in `archival_levels` with a committed, idempotent script
   (terms are content, so `cim` won't carry them). Look it up by name; tids differ per
   environment.
4. **Convert.** A committed script copies mapped field data, sets the archival level, and
   updates the bundle in `node`, `node_field_data`, revisions and every field table, then
   clears the entity cache.
5. **Verify.** Full Solr reindex; check Fedora and JSON-LD for the converted nodes.
6. **Switch Workbench** to create Collection-level archival components.
7. **Remove references** in a separate deploy: `field_member_of` targets,
   `auto_create_bundle`, view filters, pathauto, block conditions, `BUNDLES`.
8. **Delete the type** in another separate deploy, after a release cycle.

## Avoiding the deletion cascade

On 2026-08-04, deleting `collection_file` silently took out the search view, every facet
and 43 blocks ([Incident log](/docs/islandora/operations/incident-log/)). So:

- Never delete through the UI. Export the change and review the config diff.
- Before step 8, `grep -rl` each collection field and `node.type.collection` across
  `config/sync`; no hits may remain outside the files being deleted.
- Shared field names keep their storage. Fields used only by `collection` lose it; check
  those first.
- If the diff deletes any view, facet or block, stop.
- Back up the database first, and run `drush config:status` straight after.

## DEV result (2026-11-02)

All 6 collections were converted in place with Convert Bundles 3.0.0-beta1 (Drupal 11
compatible) through `scripts/convert-collections.php`:

- nid, UUID, aliases, child and media counts, and all field values matched the
  pre-conversion dump. Each node gained one revision.
- The Collection term was created; `field_full_title` added to `archival_component`; the
  top-level view, front page and template suggestion updated. The `collection` type and
  fields were kept.
- Pages returned 200, Solr found the converted nodes, and `config:status` was clean.
- Blocks and facets were reviewed: none filter on bundle in a way that breaks.
- **Not run:** a real Workbench ingest of a Collection-level component.

The Workbench side is built on the `research/camp-2026` branch of `g/`; see
[CollectiveAccess pipeline](/docs/migration/ca-pipeline/).

## Effort

About 3 to 5 days including rehearsal, over at least 2 to 3 deploys. Field mapping is the
biggest unknown.
