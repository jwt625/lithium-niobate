# DevLog-002: Author decisions, static mockup, materials review, repo setup

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | In progress |
| Scope | Record answers to DevLog-001 sec. 15; static theme/layout mockup; materials review page; local-source property verification; GitHub repo setup |
| Authors | Claude Code, at Wentao Jiang's request |

## Decisions (Wentao, 2026-10-25)

| DevLog-001 Q | Decision |
|---|---|
| Q1 theme / Q2 default | Pending: author asked for a quick static mockup of theme, layout, and core elements to approve |
| Q3 licenses | GPL (site code GPL-3.0). Data license still to confirm (GPL is a code license; CC BY 4.0 proposed for data) |
| Q4 / story page | The author's own LN path is reference and inspiration only; no dedicated "My LN story" page on the site. The author's published work can still appear where it fits the physics (e.g. piezo-optomechanics in the Sound chapter) |
| Q5 / Q6 local materials | Agents may read local materials (including PDFs the author holds) for verification and selection. Selected materials go to a review page for approval before use |
| Q11 hosting | Set up the GitHub repo now (`jwt625/lithium-niobate`, public); DNS and custom domain later by the author |

## Requirements for this round

1. Static mockup (no build step) showing theme, layout, and core elements: top bar, axis spine with octahedron markers, 3m ornaments, live conoscope hero with voltage slider (real physics, provenance-tagged constants), chapter doors, poled-stripe divider with a real QPM period, vacancy-lattice texture, hover popup, sidenote, provenance badges, data card with API URL, timeline strip with verified events, wafer-map site map, bias-drift footer indicator, photorefractive cursor trace (off under reduced motion), dark/light toggle. One landing page plus one sample chapter page. No fabricated data: chart areas without real data are marked as layout placeholders.
2. Materials review page (local-only, git-ignored, may reference local files): everything the research picked for inclusion, grouped, each with source, license, status, and an approve/feedback slot.
3. Property verification against local PDFs: new public-safe note `research/R14-property-verification.md`.
4. Repo: GPL-3.0 LICENSE, `.gitignore` (ignores `review/`), `gh repo create jwt625/lithium-niobate --public`; Pages via workflow. Privacy review of staged files before the first commit.

## TODO

- [x] Mockup `mockup/index.html`, `mockup/chapter.html` (+ shared CSS/JS); screenshot-verified desktop and phone width, dark and light
- [x] `review/materials-review.md` (subagent; local-only, 253 rows)
- [ ] `research/R14-property-verification.md` (subagent)
- [x] LICENSE, .gitignore, Pages workflow, README update
- [x] Privacy review, first commit, repo create, push, Pages enable

## Progress log

- 2026-10-25 Decisions recorded; plan written.
- 2026-10-25 Mockup built: `styles.css` (tokens, dark default + light), `ln.js` (Zelmon CLN Sellmeier, QPM period, conoscope renderer: weak-birefringence doubled-angle sum of natural uniaxial term and r22 Pockels term, crossed polarizers, spectral white light), `app.js` (popups, spine, vacancy texture, photorefractive trace + GRIIRA dimming, bias-drift meter, wafer-map site map, unit switch, theme/motion toggles), `index.html`, `chapter.html`. Verified by headless Chrome screenshots (1440 px dark and light, chapter page) and a 390 px overflow measurement (no page-level overflow; only scroll containers). Fixes during verification: hero height cap, grid min-width, source-count badge.
- 2026-10-25 Materials review page delivered (local-only): data 38, history 39, images 19, author materials 51, industry 37, library 15, code/3D 23, motifs 10, do-not-use 21 rows. COMSOL clip library is on the NAS (not mounted); clips need clearance.
- 2026-10-25 05:42 UTC Repo created: github.com/jwt625/lithium-niobate (public), first commit 71bc5d1; Pages via workflow, deploy run succeeded; mockup live at outside5sigma.com/lithium-niobate/ (user-level custom domain) until lithium-niobate.com DNS is set by the author.
- 2026-10-25 Correction (author: "i only need localhost to review it"): Pages deployment was out of scope. Pages site deleted (`gh api -X DELETE repos/jwt625/lithium-niobate/pages`), workflow removed. Review happens on localhost only.
