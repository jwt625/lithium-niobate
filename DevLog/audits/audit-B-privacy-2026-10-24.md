# Audit B: public-repo privacy and rights (2026-10-24)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Auditor | Fresh-context subagent (Claude Code), read-only except this file |
| Scope | Every file in the repo except `.git/`: `README.md`, `DevLog/DevLog-000-kickoff-and-requirements.md`, `DevLog/DevLog-001-proposal.md`, `research/R01`..`R13` (15 files) |
| Method | Full read of README, DevLog-000, DevLog-001, R01-R07, R09, R12, R13; targeted grep plus section reads of R08, R10, R11. Case-insensitive grep for local paths, private-project and employer terms, secrets, emails, phone numbers, internal links. Python scan of every non-ASCII code point. Visibility of every referenced repo checked with `gh repo view` (all PUBLIC); every referenced PlayGround folder confirmed present on `PlayGround` `origin/main`. Context of one blog quote checked read-only in the public blog repo. |
| Note on this report | Written to be public-safe itself: no confidential text is reproduced, and blog-side exposures are described only at the level already present in the audited files. Details outside this repo were sent to the coordinator, not written here. |

## Verdict

**Safe to publish: NO, conditional.** Publish after fixing B1 and B2 (Medium). B3-B4 are recommended before publishing; B5-B9 are optional.

Clean on: absolute local paths (none), secrets/tokens/API keys (none), email addresses and phone numbers (none), private startup or business names, decks, customers, investors or business plans of the author (none), employer references (none; every "lambda" is the wavelength symbol or QPM period), private diary references (none), lab-internal links (none reproduced), emoji (none). All repo names cited are public (`PlayGround`, `eo-modulator-atlas`, `photonics-atlas`, `advanced-packaging-atlas`, `mode-guessr`, `gdsjam`, `magic-crystals`, `hardware-milestones`, `WebSpice`, `BPM`, `interactwave`, `SLM-Guessr`, `jwt625.github.io`). Colleague names appear only as published co-authors (R01 sec. 4b, 10), published researchers (R07, R08) or a published thesis author (R02:36).

## Findings

| ID | Severity | File:line | Excerpt (redacted where needed) | Why | Fix |
|---|---|---|---|---|---|
| B1 | Medium | `research/R02-blog-corpus.md` (two lines) | [redacted by coordinator] | A sentence OCR'd from a third-party conference slide carrying a confidentiality marking, plus the marking itself, were quoted. | Delete both quotes; keep only "booth/slide photos: do not reuse; cite public statements only". |
| B2 | Medium | `DevLog/DevLog-001-proposal.md` sec. 16; `research/R02-blog-corpus.md` per-post remarks and sec. 6 | [redacted by coordinator] | Per-post pointers to sensitive material in the author's public blog source. | Make generic ("sanitize before reuse: paths, names, links"); raise blog-side issues with the author privately. |
| B3 | Low | `research/R05-blender-3d-workflow.md` | [redacted by coordinator] | Wording conflicted with DevLog-000 requirement 8. | Remove the wording; use "author practice (generic)" source tags. |
| B4 | Low | `research/R05-blender-3d-workflow.md` | [redacted by coordinator] | Described local machine contents; no public value. | Remove; cite "installed version". |
| B5 | Low | `DevLog/DevLog-001-proposal.md` Q4; `research/R01-author-public-record.md`; `research/R02-blog-corpus.md` | [redacted by coordinator] | Date-range framing questions belong with the author, not in public text. | Rephrase neutrally ("confirm the date range for the My LN story page"). |
| B6 | Info | `DevLog/DevLog-000-kickoff-and-requirements.md`; `DevLog/DevLog-001-proposal.md` | [redacted by coordinator] | Internal process note about research-agent API requests; no personal data in the repo. Not needed publicly. | Move to a private log. |
| B7 | Info | `research/R03-reusable-tools.md:31, 40, 111`; `research/R11-browser-simulations.md:61` | "media and manifests are local-only"; "`logs/bench-baseline-20261015T0926.json`, local log"; "Author's own LN COMSOL GIF library ... local-only" | Names local-only artifacts of public repos; no content. R03:111 already requires screening clips for unpublished or lab-owned content before use. | None required. Enforce the R03:111 screening if the GIF library is used. |
| B8 | Info | `research/R02-blog-corpus.md:143-154`; `research/R06-material-properties-data.md:150-155, 171-182, 199-202` | COMSOL material-library tensor values; Sellmeier coefficient tables (refractiveindex.info CC0, Wikipedia, CTI 1999 vendor sheet) | Numeric facts, short, re-arranged into the notes' own columns; low copyright risk. The CTI vendor coefficient table (R06:199-202) is the closest to a copied table. No embedded third-party figures anywhere; no verbatim quotation longer than about one sentence found (longest are single-sentence abstract quotes, e.g. R06:37). | None required now. When building the site, follow R06 sec. 4.2 (re-key values with per-value citation, no handbook tables in original layout). |
| B9 | Info | `research/R05-blender-3d-workflow.md:47, 138`; `research/R11-browser-simulations.md:20, 28` | "Apple M4 Pro" | Hardware model given as benchmark context. Harmless. | None. |

## Non-ASCII scan (no emoji found)

Code points found (all acceptable): `≤ ≥ ≈ ≠ − · ²`, Greek `λ Λ ω π`, `Å`, box drawing `─ └` (diagram), Latin diacritics in names (`č` in Lončar, `ü` in Günter/Untersuchungen), one `’` in a URL.

| File | Lines with non-ASCII |
|---|---|
| `research/R05-blender-3d-workflow.md` | 143, 207, 216-220, 247, 335, 345-349, 352, 384, 385, 391, 406, 412 |
| `research/R06-material-properties-data.md` | 192, 195, 254, 278, 286, 347, 527, 528 |
| `research/R07-history.md` | 27, 86, 87, 92, 93, 100, 101, 104-107, 111, 112, 114, 115, 151, 152, 199, 237 |
| `research/R09-industry-market.md` | 389 |
| `research/R11-browser-simulations.md` | 135, 136, 204, 289, 291 |

All other files are pure ASCII.

## Counts

9 findings: 0 High, 2 Medium (B1, B2), 3 Low (B3-B5), 4 Info (B6-B9).

## Resolution (coordinator, 2026-10-24)

| ID | Action |
|---|---|
| B1 | Fixed: both quotes removed from R02. |
| B2 | Fixed: R02 per-post remarks and sec. 6 made generic; DevLog-001 sec. 16 reduced to a generic note; specifics reported to the author outside the repo. Excerpts in this report redacted. |
| B3 | Fixed: R05 no longer states the existence of private projects; source tags read "author practice (generic)". |
| B4 | Fixed: local folder listing removed; Info.plist source changed to "installed version". |
| B5 | Fixed: DevLog-001 Q4, R01 sec. 1 note and R02 Uncertainties rephrased neutrally. |
| B6 | Fixed: internal process note removed from public files. |
| B7-B9 | No action needed. |
