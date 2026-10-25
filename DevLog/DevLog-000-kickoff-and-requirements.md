# DevLog-000: Kickoff and requirements

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Status | Research phase |
| Scope | Requirements capture, research plan, research progress |
| Domain | lithium-niobate.com |
| Authors | Claude Code, at Wentao Jiang's request |

## Intent

A public website at lithium-niobate.com dedicated to lithium niobate (LiNbO3, LN), the material the author worked on from 2017 to 2024, starting with a Stanford Applied Physics PhD. It augments published review papers with what a PDF cannot offer, and should leave every visitor, expert or not, with a lasting, joyful association with the material.

## Requirements (from the kickoff request)

1. Research the author's public record on LN, especially thin-film LN (TFLN), via Google Scholar (`scholar.google.com/citations?user=ocbnVOMAAAAJ`) and other public indexes.
2. Augment, do not duplicate, existing review papers. Focus on what a PDF lacks:
   - true 3D visualization
   - interactivity
   - in-browser simulations
   - easy-for-AI-to-access endpoints for material properties
3. Reuse and modernize the author's older, fragmented blog material (pre-AI era), especially "Lithium Niobate properties" and "LN photonics literature" (outside5sigma.com).
4. Progressive depth on theory and practice, plus a proper historical review and industry trends (as identifiable from the eo-modulator-atlas repo).
   - A visitor without optics, RF, or nanofab background appreciates the site at first glance.
   - Deeper technical information is reachable within 2 to 3 clicks.
5. DYOR on local and public sources; delegate to subagents; discuss what can be presented.
6. Iconic, joyful, personal-and-educational quality bar. References:
   - ciechanow.ski: animated, interactive explanatory illustrations
   - bruno-simon.com: 3D, playful (Blender-rendered TFLN products and components; reuse existing Blender workflows)
   - gwern.net: hover popups
   - The material should feel welcoming; show love, care, passion; lift the floor for everyone in the industry.
7. Subtle thematic details throughout (background textures, decorative page elements) with a consistent theme, borrowing from art, architecture, nature, industry, to echo fabrication processes, applications, and physical effects (GRIIRA, Li diffusion and vacancies, charge screening/shielding, bias drift, three-wave mixing, four-wave mixing, OPO, etc.).
8. Repo is public: no non-public information (no private repo contents, names, or existence; no absolute local paths; no private notes). Derived meta information (e.g. Blender workflow and preferences) is fine.
9. Deliverable for this phase: a researched, detailed proposal. Notes and progress tracked in DevLog md docs.

## Plan

1. Parallel research by subagents, each writing one public-safe note into `research/`.
2. Synthesize into `DevLog/DevLog-001-proposal.md`.
3. Fresh-context audit (accuracy, privacy leak check, scope), record corrections.
4. Open questions for the author, numbered, at the end of the proposal.

## Research tracks

| # | Track | Output |
|---|---|---|
| R01 | Author's public LN record (Scholar, arXiv, thesis, talks, patents) | `research/R01-author-public-record.md` |
| R02 | Local blog corpus on LN (outside5sigma.com posts) | `research/R02-blog-corpus.md` |
| R03 | Reusable local interactive tools and code (poling animation, EO FEM solver, mode-guessr, etc.) | `research/R03-reusable-tools.md` |
| R04 | Industry trends from eo-modulator-atlas and sibling atlases | `research/R04-atlas-industry-trends.md` |
| R05 | Blender and 3D workflow (meta only), web 3D delivery | `research/R05-blender-3d-workflow.md` |
| R06 | Material properties: authoritative data and machine-readable API design | `research/R06-material-properties-data.md` |
| R07 | History of LN, primary sources | `research/R07-history.md` |
| R08 | TFLN science and technology state of the art; gaps in reviews | `research/R08-tfln-state-of-art.md` |
| R09 | Industry, market, and supply chain (public sources) | `research/R09-industry-market.md` |
| R10 | Iconic websites: design and tech teardown | `research/R10-iconic-websites.md` |
| R11 | In-browser simulation feasibility | `research/R11-browser-simulations.md` |
| R12 | Theme and visual language (coordinator) | `research/R12-theme-and-visual-language.md` |
| R13 | Inspirations: advanced-packaging-atlas process animation and hybrid bonding video (coordinator) | `research/R13-apa-process-animation-and-video.md` |

## TODO

- [x] R01..R11 research notes (subagents)
- [x] R12 theme and visual language (coordinator draft)
- [x] R13 APA process animation and hybrid bonding video
- [x] DevLog-001 proposal (draft)
- [x] Fresh-context audits (A accuracy/coverage, B privacy, C fix verification) and corrections
- [ ] Author decisions on DevLog-001 sec. 15
- [x] README

## Progress log

- 2026-10-24 21:10 Repo initialized (`git init -b main`), requirements captured, research tracks defined.
- 2026-10-24 21:15 R01-R10 subagents launched (R11 queued, concurrency cap 10).
- 2026-10-24 21:40 Author request added: read advanced-packaging-atlas process animation (DevLog-016) and hybrid bonding video (DevLog-015, STYLE.md) as examples; done, see R13. R12 theme draft written.
- 2026-10-24 22:00-23:30 R01-R11 notes delivered. Notable: web-search budget exhausted in R05-R10 tracks (some items left unverified, labeled in notes); core property handbooks not read (anti-bot / paywall).
- 2026-10-24 23:40 DevLog-001 proposal drafted. Fresh-context audits launched: A (accuracy, traceability, requirements coverage, physics), B (public-repo privacy).
- 2026-10-25 00:30 Audit A (0 critical / 7 major / 23 minor) and audit B (2 medium / 3 low / 4 info) fixed: Kaminow 1973 reframed, QPM example corrected to 6.8 um, launch set unified (F1-F6, phases P1-P3), F6 playful 3D added to P1, R09 misquotes corrected, private and blog-pointer text removed, audit excerpts redacted.
- 2026-10-25 01:00 Audit C (fix verification): 28/34 verified, 6 partial, 16 new (1 medium, 13 low, 2 info); all fixed except N16 (no action) and A25 (Rose 1844 vs 1846, tracked in DevLog-001 sec. 18). Proposal ready for author review.
