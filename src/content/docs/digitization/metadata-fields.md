---
title: Metadata fields
description: Field-by-field guidance for describing SACDA records, from the SACDA Metadata Manual.
sidebar:
  order: 1
---

RAD rule numbers are given per field. Most fields cite the same rule across formats:
General Rules (1), Textual (3), Graphic (4), Cartographic (5), Architectural and
technical drawings (6), Moving images (7), Sound (8), Electronic (9), Microform (10),
Objects (11), Philatelic (12) and Discrete items (13), so "rule x.1" means 1.1, 3.1, 4.1
and so on.

## Item Title

The title of the item, transcribed or supplied. RAD rule x.1.

- Transcribe the title from the item itself (book title, caption, artist's title, object
  name) with RAD punctuation.
- If there is none, use a title from the holding institution or a reference source.
- **Supplied titles always go in square brackets**, and should be as descriptive as
  possible.
- Leave out initial articles unless they're essential.
- Avoid abbreviations and slang in supplied titles; if transcribed, explain them in the
  Description.
- If a transcribed title uses slurs or offensive terms, move it to Alternative Title,
  supply a culturally appropriate Item Title, and add a note.

## Alternative Title

Use only to: transcribe a title with offensive terms; spell out abbreviations or
misspellings in the main title; or translate the title. Not for parallel titles, which
follow RAD.

## Date

When the original was created or published, exact or estimated. **Not** when it was
digitized. RAD rule x.4.

- With several dates (creation, copyright, revision, edition), use the creation date
  unless the record is a significant revision.
- Exact dates use ISO 8601: `YYYY-MM-DD`. Otherwise follow RAD.
- **No square brackets around estimates**; mark them with Date Type instead. (This was a
  CollectiveAccess limit; Islandora stores dates as EDTF, e.g. `192X` or `1925/1930`.)
- `n.d.` is a last resort. You should be able to give at least a century, usually a
  decade.

## Date Type

Must match one of these codes exactly:

| Date type | Code |
|---|---|
| Date(s) of creation | `creation` |
| Date(s) broadcast | `broadcast` |
| Date(s) of publication | `publication` |
| Estimated dates | `estimated_dates` |
| Inclusive date(s) | `inclusive` |
| Predominant dates | `predominant_dates` |

## Extent

The number and form of the original record, usually the analogue original. Record an
electronic extent only for born-digital records. RAD rule x.5.

## Scale

Only for maps, architectural drawings and technical drawings. Record it exactly as written
on the record; leave it blank if none is given. RAD 5.3B and 6.3.

## Description

A summary of the content: subject matter, form, what it records, scope and arrangement.
RAD 1.7D4 and 13.7D.

- Take information from the object, the repository's records or other sources.
- Don't repeat offensive terms or misinformation unless you give full context.
- Write so someone with low vision understands what the item is and how it can be used.
- Spell out every abbreviation on first use; explain slang.

## Level of Description

One of: Fonds, Sous-fonds, Series, Sub-series, File, Item.

## Creator, Contributor, Publisher

- **Creator:** whoever was primarily responsible (author, artist, photographer).
- **Contributor:** others who contributed significantly (an actor, an illustrator, an
  interviewee).
- **Publisher:** whoever made it available by publication or broadcast. Leave blank if it
  is the creator, or unknown.

Headings follow RAD chapter 22 (people and families, from 22.25B) and chapter 24
(organisations). Separate several names with semicolons, in order of appearance or
importance. Leave blank if none can be identified. Repeat a name as a subject only if the
record is also about them (a self-portrait lists the artist as creator and subject).

## Type

The broad material designation of the **original**: dataset, still image, moving image,
physical object, textile, textual record, sound recording, electronic record, artwork,
map, microform, newspaper, book, periodical, architectural record, technical drawing,
website, citation, album, ephemera, government publication, technical report.

## Rights

The copyright status, from the dropdown:

- RightsStatements.org: In copyright; In copyright – educational use permitted; In
  copyright – non-commercial use permitted; In copyright – rights-holder(s) unlocatable or
  unidentifiable; No copyright – contractual restrictions; No copyright – non-commercial
  use only; No copyright – other known legal restrictions; Copyright not evaluated;
  Copyright undetermined; No known copyright.
- No copyright; Public domain dedication.
- Creative Commons 4.0: BY, BY-SA, BY-ND, BY-NC, BY-NC-SA, BY-NC-ND.

If unsure, ask the Digital Asset Archivist; otherwise choose **Copyright not evaluated**.

## Language

The language of the content, from an ISO 639-3 dropdown (nearly 8,000 languages). Ask the
archivist about missing languages. Flag records in more than one language for manual
entry.

## Fonds/Collection Title

The title of the fonds or collection the record belongs to. Ask the archivist if you
don't know it.

## Repository, Repository URL, Local Identifier

For material held by another institution:

- **Repository:** the holding institution's name (RAD chapter 24). Blank for privately
  held material.
- **Repository URL:** its home page, or better, its online finding aid for the record or
  collection. Blank if privately held.
- **Local Identifier:** the holder's own accession or registration number, exactly as
  written on the item or its container. Blank if none or privately held.

## Access Identifier and Filename

See [Identifiers and filenames](/docs/digitization/identifiers-and-filenames/).

## Notes

Any other comments about the item. RAD rule x.8B.

## LCSH Terms, SACDA Thesaurus, Subject Geographic, Coordinates, Subject Personal

See [Subjects and places](/docs/digitization/subjects-and-places/).
