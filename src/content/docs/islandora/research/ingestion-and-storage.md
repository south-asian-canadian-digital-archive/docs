---
title: Ingestion and storage
description: Masters-only ingest, pyramidal TIFF service files, Cantaloupe vs Triplet, OCR and transcription, Fedora placement, and admin triage views.
sidebar:
  order: 3
---

Research from 2026-11-02, based on a read-only DEV audit. PROD wasn't audited.

**In short:** fix what the audit found first. Originals sit in `public://`, PDFs have no
service file, and image service files are plain JPEG. Then move to masters-only ingest with
pyramidal TIFF service files. Keep Cantaloupe. Choose OCR per script by benchmark.

## Masters-only ingest

Today archivists make access copies by hand and ingest those. The alternative is to
ingest the master (usually a TIFF) as the Original File and let Islandora derive
everything.

DEV had 140 JPEG, 1 PNG, 6 GIF, 5 PDF, 12 MP4, 3 file and 1 audio originals; 177
objects had no media at all, and some DEV collections use placeholder files.

**Recommendation:** move new ingests to masters-only once the archivist confirms the
workflow; backfill older items collection by collection after confirming a master exists
for each and how it maps to the identifier. About a week for workflow and config.

Tests: ingest 20 real TIFFs including the largest; every item must get a service file and
thumbnail with no failed messages; an archivist compares with existing access files at
normal and full zoom; storage and derivative time must fit disk and an overnight window.

## Pyramidal TIFF service files

Cantaloupe serves IIIF from service files. JPEG service files are the slowest path for
deep zoom on large images.

Benchmarks on DEV with 20 images (15 real), caches off, 5 warm rounds:

| Service file | Total size | Median 6-tile batch | Overview | Served PSNR |
|---|---|---|---|---|
| JPEG (current) | 38.6 MB | 0.221 s | 0.069 s | 48.5 |
| RGB tiled TIFF | 104.9 MB | 0.068 s | 0.062 s | 47.3 |
| YCbCr JPEG-in-TIFF Q75 | 45.3 MB | 0.047 s | 0.042 s | 43.3 |
| YCbCr Q85 | 59.1 MB | 0.050 s | 0.046 s | 45.0 |
| libvips pyramid Q75 | 33 MB | | | 43.7 |
| libvips pyramid Q85 | 42 MB | | | 46.9 |

**YCbCr Q75 passes** the provisional thresholds (30% faster tiles, acceptable storage);
the fidelity drop needs archivist review. ImageMagick's `ptif:` writes SubIFDs that
Cantaloupe can't see, so `conf/houdini/cmd.sh` writes linked tiled levels instead. DEV's
service files are already tiled multi-level JPEG TIFFs at Q75, because that file is
bind-mounted into Houdini. libvips was used only in benchmarks; making it the default
means adding it to Houdini's image or a separate step. HTJ2K isn't a supported path in
Cantaloupe (501).

A browser can't display a PTIF directly, so check anything that uses the service file
outside IIIF. Filename, mime type and allowed extensions must change together.

## Cantaloupe vs Triplet

[Triplet](https://github.com/libops/triplet) is a small Go and libvips IIIF server.
**Verdict: no-go for swapping now; keep Cantaloupe and adopt libvips-built pyramids.**

- Triplet is IIIF Image API 3 only. SACDA's manifests are Presentation 2 with
  `/cantaloupe/iiif/2/.../full/full/...` URLs, which Triplet rejects, so it can't drop in
  without manifest and viewer changes.
- Triplet won single-request speed and memory on small images (6-tile median about
  0.05 s vs 0.11 s; 68 to 92 MiB vs 166 to 199 MiB).
- **Cantaloupe won throughput on large pyramidal files by 4 to 10 times** (a 386-megapixel
  image at concurrency 16: about 74 vs 380 to 470 requests a second).
- Triplet's defaults reject sources over 1 GiB or 250 megapixels.

Retest both on real archival TIFFs, multi-GB masters and server hardware before the
expected million-TIFF ingest.

## Scale

SACDA expects about a million TIFFs. Open questions: storage (each 100 MB per item is
about 100 TB per million), derivative throughput (one image a second is about 12 days per
million, before OCR and retries), file placement, Solr and ingest load, and backups.
Needed from the team: average TIFF size, PROD disk capacity, a timeline, and whether all
TIFFs go through Islandora.

## OCR and transcription

OCR text lives in `field_edited_text` on Extracted Text media; there's no node-level
transcript field. DEV had only 7 Extracted Text media. hOCR derivatives fail because the
action writes `.html` and the `file` media type doesn't allow that extension.

No published source compares current tools on Gurmukhi, Devanagari and Nastaliq in
historical documents. An Urdu newspaper benchmark found Tesseract, EasyOCR, Kraken and
UTRNet struggle badly with Nastaliq.

**Recommendation:** build a small ground-truth set and pick a route **per script**. Run
OCR as an offline batch and upload the text, because long GPU jobs don't fit the server
queue. Transcribe audio and video with faster-whisper offline, with human review, saving
VTT with timestamps. Using a cloud model needs a decision about sending material outside.

### OCR lab results (smoke tests only)

`sacda-ocr-lab` ran Tesseract (`tessdata_best`) on **synthetic** pages rendered from
system fonts, so these are not accuracy predictions. Character error rate, raw:

| Script | Clean | Degraded |
|---|---|---|
| Latin | 0.000 | 0.000 |
| Gurmukhi | 0.006 | 0.793 |
| Devanagari | 0.000 | 0.018 |
| Nastaliq | 0.613 | 0.588 |

- A small local LLM correction pass (Qwen2 1.5B, with a guard that rejects changes to
  word count, digits or more than 15% of a line) **never improved a sample** and often made
  it worse. Keep it off.
- Page segmentation mode changes results sharply (Gurmukhi clean: 0.568 at psm 6, 0.006
  at psm 4), so it needs tuning per document.
- Tesseract is weak on Nastaliq.
- faster-whisper (base, int8, CPU) transcribed a short English clip in 2.7 s but misheard
  "Khalsa Diwan". Non-English speech wasn't tested.

Next: real pages with hand-verified transcriptions.

## Fedora and file placement

Of 723 files on DEV, 707 were in `public://` and only 16 in `fedora://`. Image and
document fields use `public://`; audio, video and `file` use `fedora://`. So
Fedora holds almost no images or PDFs as files, and any plan that treats Fedora as the
preservation copy assumes something that isn't true. Milliner also logged no `/media`
requests for 240 hours on DEV, so the media sync path is unproven.

**Recommendation:** explain the Milliner gaps first, then decide whether originals move
to `fedora://`. Masters shouldn't stay in a web-served public path. Fedora alone isn't
redundancy; it needs a separate copy too. Follow the Islandora community's OCFL work
rather than inventing a format. A proposed versioned-object filesystem is only a possible
2027–2028 project, so nothing should depend on it.

## Custom label:value metadata

Some collections need one-off fields (for example a classification number). Use a
repeating label-and-value field if a maintained Drupal 11 option exists; otherwise plain
text with Workbench validating labels against an approved list. Promote widely used
labels to real fields, and keep these out of OAI and facets at first.

## Admin triage views

Build Views now for: items with no media, no service file, no alt text, suspiciously
small files, and originals still lacking OCR. Check counts against SQL. About 2 to 3 days.
