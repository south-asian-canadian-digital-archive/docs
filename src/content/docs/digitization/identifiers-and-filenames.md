---
title: Identifiers and filenames
description: How SACDA access identifiers are built from the loan number, and how to record filenames.
sidebar:
  order: 2
---

## Access Identifier

The unique identifier SACDA staff give each record. It usually matches the digitized
file's name, and in Islandora it becomes the record's URL:
`https://sacda.ufv.ca/collections/<identifier>`.

It always starts with the collection's **loan number**, which the archivist assigns when
a loan is accepted (for example `2020_03`).

Default pattern, unless the archivist says otherwise:

```
2020_06_01_001
└─┬──┘ └┬┘ └┬┘
 loan  file item
```

When the archivist or lender has defined series or sub-series, include them:

```
2020_06_1.1.4_001
└─┬──┘ └─┬─┘ └┬┘
 loan  series item
       .sub-series
       .file
```

When in doubt, ask the archivist before assigning one. Identifiers are permanent: they
are URLs, and the old `sacda.ca` links redirect to them.

Batch folders and files can be normalised to this pattern with the `access-cleaner`
tool; see [Scripts](/docs/islandora/workbench/scripts/).

## Filename

The name of the digital file for the record, copied verbatim from your file manager.

**Windows:** select the files, hold **Shift** and right-click, choose **Copy as path**,
then paste into the Filename column.

**Mac:** select the files in Finder and copy (**⌘C**), then in the sheet paste values only
(**⇧⌘V**, or right-click → Paste special → Values).

Don't list hidden files such as macOS `._` files; they show up as mismatches in the
[Ingest audit](/docs/islandora/ingest/ingest-audit/).
