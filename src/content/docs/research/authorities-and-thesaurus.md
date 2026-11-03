---
title: Authorities and thesaurus
description: Backfilling authority links, publishing the SACDA Thesaurus as its own linked-data authority, and a single term lookup page.
sidebar:
  order: 2
---

Research draft from 2026-11-02, with DEV builds and tests the same day. See also
[Authorities and place lookup](/docs/development/authorities-and-place-lookup/) for what
runs today.

## Taxonomy backfill

### State on DEV (2026-11-02)

| Vocabulary | Terms | With authority link | Ground truth |
|---|---|---|---|
| subject | 123 | 28 | CollectiveAccess `lcsh_terms` URI pairs |
| geo_location | 37 | 1 | None; label match only |
| person | 224 | 0 | None; label match only |
| corporate_body | 22 | 0 | None; label match only |

`authority_resolver` has LCGFT, LCSH, NAF and TGM enabled; AAT, TGN and Wikidata are
disabled. There's no GeoNames source yet. Two newspapers sit in both `person` and
`corporate_body`, which looks like misfiling.

### Recommendation: extend the existing scan/apply flow

A separate one-off script was rejected, because it would duplicate caching, verdicts and
safeguards. OpenRefine is useful for hard cases, not as the main path.

- **subject:** apply known pairs with `scripts/authority-reconcile.sh`. For the rest,
  take label candidates from LCSH and TGM. Exact label matches go to review; nothing
  auto-applies from a label match.
- **geo_location:** match against GeoNames, using hierarchy and country to separate
  same-named places, with Wikidata as a fallback for Punjab villages. Check GeoNames'
  licence and rate limits first.
- **person** and **corporate_body:** NAF first, Wikidata second. Every link needs human
  sign-off backed by dates or occupation. Many community members will have no record,
  which is a valid outcome.

New verdicts: `label_exact`, `label_candidates`, `no_match`, and `reviewed_none` (so
reviewers don't repeat work). `link_ambiguous` is still never auto-applied.

**Merging duplicates** is a separate reviewed step that repoints every reference
(`field_subject`, `field_sacda_thesaurus`, typed-relation fields) before deleting the
loser, with dry-run counts and a redirect from the old term path.

**On PROD:** database backup, scan, CSV review by a cataloguer, a small apply batch, a
check, then the rest. Links are content; `cim` won't carry them.

### DEV result

47 ground-truth subject links applied, so subject went to 75 of 123 linked; 5
`link_ambiguous`, 1 `link_mismatch` and 43 `no_match` remain for review. Label
suggestions for person, corporate body and place are report-only: 110 of 283 terms have
a candidate. A GeoNames report found candidates for 36 of 37 places, only one an exact
normalised match.

## The SACDA Thesaurus as an authority

SACDA's thesaurus terms are specific to South Asian Canadian history and not covered by
LCSH. The goal is to publish them as an authority others can link to.

### Starting point

`field_sacda_thesaurus` existed only on `islandora_object` and pointed at the general
`subject` vocabulary, holding 328 values. So there was no separate thesaurus, only a
field. The team also keeps a **thesaurus spreadsheet with stable IDs** of the form
`SACDA_0000001`: 1,884 rows and 1,682 unique IDs, with alternative terms, collection IDs,
some Wikidata Q codes and notes. All 32 terms used on DEV match it by name.

### Decisions (2026-11-02)

- The thesaurus is its **own vocabulary**, `sacda_thesaurus`, served from Drupal. Drupal
  stays the place terms are edited and the only place IDs are minted.
- **Use the sheet's `SACDA_` IDs** rather than minting new ones. The scope is the sheet,
  not just the terms in use.
- The thesaurus is **not matched against LCSH** or any external authority; it stands on
  its own. Backfill matching applies only to the other vocabularies. The team's own
  Wikidata codes stay as curated data.
- `sacda.ufv.ca` is the intended home for the thesaurus. Exact paths and any persistent
  URI layer are still open.

### Design

- **Stable URIs**: an opaque ID, never the label or the Drupal term ID. IDs are never
  reused; a retired term returns a deprecated record (410) with a replacement pointer.
- **Each concept**: `skos:prefLabel` (multilingual, including Gurmukhi, Devanagari and
  Shahmukhi where supplied), `altLabel`, `definition`, `scopeNote`, `broader`/`narrower`,
  mappings, `inScheme` and change dates.
- **Content negotiation**: one URI; HTML for browsers, Turtle and JSON-LD by `Accept`,
  plus explicit `.ttl` and `.jsonld` URLs.
- **Dumps**: a versioned SKOS file with a licence and changelog, so others can cache it.
- **Later**: a W3C Reconciliation API endpoint (usable from OpenRefine), and a Wikidata
  external-identifier property once URIs are stable and enough terms are published.
- **Governance**: decide who approves terms and whether communities are consulted on
  labels. Publishing a term as an authority is a stronger statement than using it locally.

### Tooling: `islandora-skosmos`

Built and tested on DEV, now a public repo. It publishes any Islandora vocabulary:

- `skos_export`, a Drupal module: an admin form to pick vocabularies, a permission,
  immutable identifiers, a concept URI resolver (Turtle, JSON-LD, or 303 to Skosmos),
  `drush skos:mint`, `skos:config` and `skos:sync`, and cron sync of changed vocabularies.
- A [Skosmos](https://skosmos.org/) container routed at `/skosmos`, reading from the
  stack's Blazegraph (about 79 MiB, plus Blazegraph's ~342 MiB).
- Term pages link to their concept URI and Skosmos page, and term JSON-LD gains
  `schema:sameAs`. The links are derived on read, never stored.

On DEV, all 1,884 sheet rows were imported as **TEST DATA**: 1,681 with real `SACDA_`
IDs and 203 with temporary `TEST_` IDs (202 missing, one malformed). All 328 node
references survived. Notes were sorted by keyword into definition and editorial notes;
editorial notes sit in a restricted field that isn't exported. That sort is unreviewed.

### Editors: VocBench and ShowVoc

`islandora-vocbench` (test project) runs **VocBench 3** next to the stack as a curator
review editor, with `vocbench_sync` in Drupal. Drupal stays the master: VocBench edits
are proposals pulled back with `vocbench:pull`; label and note changes apply,
relationship changes are only reported, conflicts are never applied, and push refuses to
overwrite unpulled edits. VocBench used about 280 to 450 MiB with 1,884 concepts.

ShowVoc 6.2.0 was also tested as a Skosmos alternative: it worked through its API but used
675 MiB. **Skosmos stays the recommendation** for publishing: lighter, public-ready, and
integrated with the concept URIs. VocBench is viable if curators need a dedicated review
workflow.

### Before publishing

- Fix the 203 `TEST_` rows and the repeated terms in the sheet, and review the notes.
- Point Workbench item templates at `sacda_thesaurus` (they still write to `subject`).
- Decide the URI path and persistent layer.

## Term lookup page

Place lookup works well for RAs, but there's no equivalent for subjects and names, so
students look terms up by hand and Workbench creates terms with no link.

**Recommendation:** extend place lookup into one page with a source filter (Places,
Subjects, Names). Generic source search goes in `authority_resolver`; SACDA specifics stay
in `sacda_modules`.

- **Search order:** local terms, then the SACDA Thesaurus, then external sources.
- **External calls:** places stay local (no request-time Getty or NRCan calls). LoC's
  suggest service may be called live from this staff-only page; the no-request-time rule
  covers public pages. Cache every result.
- **Result:** a copy button that gives one typed token for the metadata sheet, such as
  `lcsh::sh85088084`, `geonames::<id>`, `sacda::SACDA_0000038`, or `isle::<uuid>` for an
  existing local term. Never use a raw Drupal term ID: they differ between environments.
- `prepare_ingest.py` resolves tokens during preprocessing; an unresolvable token stops
  the run and names the row.

Effort: about a week for the page and LoC search, and about 3 days for token support.
