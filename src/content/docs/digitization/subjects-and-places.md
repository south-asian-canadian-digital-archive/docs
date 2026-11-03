---
title: Subjects and places
description: Choosing LCSH, TGM and SACDA Thesaurus headings, and recording places, coordinates and people.
sidebar:
  order: 3
---

## Subject headings: the rules for both fields

- Assign headings by the record's **aboutness**, not its form. See the Library of
  Congress training module
  [How do we determine aboutness?](https://www.loc.gov/catworkshop/lcsh/PDF%20scripts/1-4-Aboutness.pdf)
- **Every record at every level** (item, file, series, sub-series, sous-fonds, fonds,
  collection) needs at least one heading in LCSH Terms or the SACDA Thesaurus.
- Aim for **five or six at most**. Some records need only one or two.
- Always choose the **narrowest** heading: a guide dog photo gets "Guide dogs", not also
  "Working dogs" or "Dogs".

## LCSH Terms

Headings from [Library of Congress Subject Headings](https://id.loc.gov/authorities/subjects.html)
or the [Thesaurus for Graphic Materials](https://www.loc.gov/pictures/collection/tgm/).

- Photographs and graphic material use TGM; everything else uses LCSH. Mixing both for
  graphic material is fine.
- **Enter only the identifiers, never the heading text**, separated by semicolons. The
  ingest reads identifiers.
- Use real LCSH headings only: no Children's Subject Headings, no other schemes, and no
  headings marked as not used for indexing.

Finding an identifier:

- **LCSH:** search, open the heading, and copy the identifier from the URL or the
  "Bookmark this record" field.
- **TGM:** search and copy the identifier from the result.

These identifiers become authority links on Islandora's subject terms; see
[Authorities](/docs/islandora/development/authorities-and-place-lookup/).

## SACDA Thesaurus

:::caution[TODO: Islandora steps]
The thesaurus lookup still uses the team spreadsheet from the CollectiveAccess era. Replace it with the published thesaurus (Skosmos) or the term lookup page once they are live.
:::

SACDA's own headings, which add to or replace LCSH and TGM headings that are missing or
not culturally appropriate.

- Look headings up in the SACDA Thesaurus spreadsheet (ask the archivist for access).
- **Unlike LCSH, enter the heading text**, not its `SACDA_` identifier: `Sikh couples`,
  not `SACDA_0001627`. Separate with semicolons.
- If nothing in LCSH, TGM or the thesaurus fits, ask the archivist about adding a heading.

The thesaurus is being published as its own linked-data authority; see
[Authorities and thesaurus research](/docs/islandora/research/authorities-and-thesaurus/).

## Subject Geographic

Where the record was created, or the place it shows or discusses.

- Check the [Getty Thesaurus of Geographic Names (TGN)](http://www.getty.edu/research/tools/vocabularies/tgn/)
  first, then the [Canadian Geographical Names Database (CGNDB)](https://geonames.nrcan.gc.ca/),
  then ask the archivist.
- If the exact place is uncertain, use the closest broader area you can establish: if it's
  either Abbotsford or Chilliwack, use "Fraser Valley". You should almost always manage a
  region at least.
- Write simple places as `City, Province (abbr.)`.

:::caution[TODO: Islandora steps]
Rewrite the steps in this section around the Islandora Place lookup and the Workbench place column, and remove the CollectiveAccess Providence instructions.
:::

:::note[Changed since the manual]
The manual says to copy a place identifier such as `surrey_bc` from CollectiveAccess
Providence. That system is gone. In Islandora, use the **Place lookup** at
`/admin/content/places/lookup`, which searches TGN and CGNDB and shows whether the place
already exists as a term, then copy its authority identifier. See
[Place lookup](/docs/islandora/development/authorities-and-place-lookup/).
:::

## Geographical Coordinates

The latitude and longitude of the geographic subject.

- Canada: from CGNDB. Elsewhere: from TGN.
- **Always decimal degrees**: `49.05, -122.28333`, not `49° 3′ 0″ N, 122° 17′ 0″ W`.
- Every record with a geographic subject needs coordinates. Ask the archivist if you
  can't find them.

## Subject Personal

The main people or organisations shown or described in the record. They may also be the
creator, contributor or publisher, but don't list those here unless the record is about
them. Headings follow RAD chapters 22 and 24; separate with semicolons, in order of
appearance or importance; leave blank if none.
