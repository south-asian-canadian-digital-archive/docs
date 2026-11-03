---
title: Digitization and metadata
description: How SACDA describes digitized material, the core metadata fields, and the rules every record follows.
sidebar:
  order: 0
  label: Overview
---

SACDA collects, digitizes, preserves and makes accessible material with significant ties
to the South Asian diaspora in Canada. Archival collections held publicly and privately
across British Columbia are acquired or **borrowed** to be digitized and described, so
they can be found and used online.

This area is for practicum students and anyone on the SACDA team who digitizes and
describes material. It is based on the **SACDA Metadata Manual**, which was written for
the CollectiveAccess era. Where the archive has since changed (Islandora replaced
CollectiveAccess, and the place lookup replaced Providence place identifiers), the pages
say so. More digitization guidance (scanning, file formats, storage) will be added here.

| Page | What |
|---|---|
| [Metadata fields](/docs/digitization/metadata-fields/) | Every core field: what it holds, the rules, and the standard behind it |
| [Identifiers and filenames](/docs/digitization/identifiers-and-filenames/) | Building access identifiers and copying filenames |
| [Subjects and places](/docs/digitization/subjects-and-places/) | LCSH, TGM, the SACDA Thesaurus, places and coordinates |

## Ground rules

- **One row is one record, and one column is one field.** Fonds, series, files and items
  each get their own row.
- **Rules for Archival Description (RAD)** is the content standard for most fields; the
  field pages cite the RAD rule numbers.
- **Describe the original**, not the digital file. Dates, extent and type are about the
  analogue record unless it was born digital.
- **Write for someone who can't see the item.** Spell out abbreviations, explain slang,
  and give context.
- **Don't reproduce offensive terms as titles or descriptions.** Put a transcribed title
  that uses a slur in Alternative Title, supply a culturally appropriate Item Title, and
  explain the change in Notes.
- **Ask the Digital Asset Archivist** when unsure about rights, fonds titles, identifiers,
  new places or new thesaurus terms. Don't guess.

## Core fields at a glance

| Field | Template code | Required | Standard |
|---|---|---|---|
| Item Title | `itemTitle` | Yes | RAD |
| Alternative Title | `alternativeTitle` | No | RAD |
| Date | `date` | Yes | RAD; ISO 8601 for known dates |
| Date Type | `dateType` | Yes | Controlled list |
| Extent | `extent` | Yes | RAD |
| Scale | `scale` | No | RAD |
| Description | `description` | Yes | RAD |
| Level of Description | `levelOfDescription` | Yes | Controlled list |
| Creator | `creator` | No | RAD |
| Contributor | `contributor` | No | RAD |
| Publisher | `publisher` | No | RAD |
| Type | `type` | Yes | Controlled list |
| Rights | `rights` | Yes | RightsStatements.org and Creative Commons |
| Language | `language` | No | ISO 639-3 |
| Fonds/Collection Title | `fondsCollectionTitle` | Yes | RAD |
| Repository | `repository` | When applicable | |
| Repository URL | `repositoryURL` | When applicable | URI |
| Local Identifier | `localIdentifier` | When applicable | Repository's own |
| Access Identifier | `accessIdentifier` | Yes | SACDA pattern |
| Notes | `notes` | No | RAD |
| LCSH Terms | `lcsh terms` | Yes* | LCSH, TGM |
| SACDA Thesaurus | `sacda thesaurus` | Yes* | SACDA Thesaurus |
| Subject Geographic | `subjectGeographic` | Yes | TGN, CGNDB |
| Geographical Coordinates | `coordinates` | Yes | TGN, CGNDB |
| Subject Personal | `subjectPersonal` | Yes | RAD |
| Filename | `filename` | Yes | SACDA |

\* Every record needs at least one heading in LCSH Terms or the SACDA Thesaurus.

How these sheets become Islandora records is covered in the
[Spreadsheet pipeline](/docs/islandora/ingest/sheet-pipeline/), and you can check a sheet
against the live archive with the [Ingest audit](/docs/islandora/ingest/ingest-audit/).
