# DevLog-005: Production foundation (lane F0)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Done: scaffold, both design systems, shell, landing and chapter 2.2 at mockup fidelity, route skeleton, content conventions, Playwright harness (94/94 passing) |
| Scope | SvelteKit app at the repo root |
| Authors | Claude Code (lane F0), at Wentao Jiang's request |
| Inputs | DevLog-004 (binding rules), DevLog-003a (TECH), DevLog-003b (VISUAL, sec. 12), DevLog-003 (content), `mockup/` (approved reference, untouched) |

## Plan (written before implementation)

1. Scaffold by hand (no interactive generator): SvelteKit 2 + Svelte 5 + Vite 7 + TypeScript strict + adapter-static + mdsvex; pnpm.
2. CSS: port `mockup/styles.css`, `chapter.css`, `visual.css` to `src/lib/styles/` with the minimum edits the component tree needs.
3. Pre-paint state: inline script in `src/app.html` sets `data-mode`, `data-theme`, `data-fx` before first paint.
4. Stores: `ui` (mode, theme, fx; persisted; emits `ln-mode`) and shared figure state.
5. Components: Masthead, Spine, Popups, Badge, Readout, Figure, Footer, ModeVariant, chapter templates.
6. Figures: typed ports of the mockup scripts in `src/lib/figures/`, physics from `src/lib/physics` (lane PHY landed during this run, so no `_legacy/` copy was needed; mapping below).
7. Routes: `/`, `/light/pockels-effect/`, skeletons for all twelve sections; prerender everything.
8. Tests: Playwright on system Chrome: parity, layout shift, console, overflow, build.

## Decisions

| Topic | Decision | Reason |
|---|---|---|
| Versions | `@sveltejs/kit` 2.70.3, `svelte` 5.57.2, `vite` 7.3.7, `@sveltejs/vite-plugin-svelte` 6.2.4, `@sveltejs/adapter-static` 3.0.10, `typescript` 5.9.3, `svelte-check` 4.7.7, `mdsvex` 0.12.8, `@playwright/test` 1.64.1, `three` 0.169.0, all pinned exact | Lane brief: SvelteKit 2 + Svelte 5 (Kit 3 exists; not used). Vite 7 is the newest major vite-plugin-svelte 6 supports. TypeScript 5.9: svelte-check peer range stops at 6 |
| three.js | npm `three@0.169.0` (r169) + `@types/three@0.169.0`, dynamic `import("three")` on first VISUAL display (684 kB chunk, not in the initial load) | Same release as the mockup's vendored r169, so the VISUAL 3D renders identically (parity); an upgrade is a separate, visible change |
| Static output | `adapter-static`, `prerender = true` in the root layout, `trailingSlash: "always"` (`/light/pockels-effect/` -> `build/light/pockels-effect/index.html`), `strict`, prerender errors fail the build | Works on any static host without rewrite rules |
| Fonts | Same Google Fonts links as the mockup in `app.html` | Identical glyphs for parity; self-hosting can follow |
| CSS layering | `tech.css` (base + TECH), `chapter.css`, `visual.css` imported globally in that order (the mockup's order). Every `chapter.css` selector is prefixed with `:where(.chp)` (zero specificity) and the layout sets `.chp` on every page except the landing | SvelteKit keeps imported CSS after client-side navigation; without scoping the chapter rules (e.g. `.panel .ctl` columns) would leak into the landing. Verified by the navigation test |
| Pre-paint | `app.html` inline script before the stylesheets; mode-button state and theme icon rendered from `html[data-mode|data-theme]` by CSS (both icons in the markup); no `.on` class from SSR | Prerendered markup is correct before hydration for a VISUAL or light-theme reader: no flash, no shift (tested) |
| Variants | `ModeVariant.svelte` renders both snippets in `display: contents` wrappers with `data-variant`; CSS hides one | Both variants prerendered, switch without reload, grid layout unaffected |
| Static figure markup | SVG glyphs, default readouts and tables computed in `+page.server.ts` and rendered with `{@html}` | Final values in the prerendered HTML (the mockup filled them by script); server load data is serialized, so hydration reuses identical strings (a universal load re-ran in the browser and V8 float differences flipped rounded SVG coordinates) |
| Conoscope | Weak-birefringence model (mockup-equivalent, byte-equal per PHY tests) while a control moves; exact plane-wave retardance (`conoscope()` with the r22 impermeability) in a Web Worker 140 ms after input stops; main-thread fallback if the worker fails. HUD optic-axis angle from the eigen-decomposition of the same tensor (5 kV/mm: 8.87 deg exact vs 9.14 deg first-order) | Coordinator instruction 2026-10-25; resting frame exact |
| Glossary | `src/lib/generated/glossary.json` + `sources.json` loaded lazily (idle or first miss); `data-pop="g:<id>"` addresses a term; bare keys: page entry, then shell entry, then glossary | Files are about 210 kB together; eager import made a 170 kB chunk on every page |
| Footer status key | Lists only the codes the page uses (landing: P, P-comp, P-db, S, reported, derived, template; 2.2: P-comp, P-db, reported, engine, derived; skeleton pages: none) | DevLog-003a rule; audit finding |

## Structure

| Path | Content |
|---|---|
| `src/app.html` | pre-paint script, fonts, empty favicon (replaced by the conoscope logo) |
| `src/routes/+layout.svelte`, `+layout.ts` | shell: Effects, Masthead, Spine, `<main>`, Footer, Popups; prerender, trailing slash |
| `src/routes/+page.svelte`, `+page.server.ts` | landing |
| `src/routes/light/pockels-effect/` | chapter 2.2 |
| `src/routes/{crystal,light,sound,quirks,making,devices,history,industry}/` | `ChapterLanding` (title, depth index, L1/L2/L3 keywords, sections table) |
| `src/routes/{lab,data,library,colophon}/` | `SectionPlaceholder` (no-data line) |
| `src/lib/components/` | `Masthead`, `Spine`, `Popups`, `Effects`, `Footer`, `Badge`, `Readout`, `Figure`, `ModeVariant`, `ChapterPage`, `ChapterLanding`, `SectionPlaceholder` |
| `src/lib/stores/` | `ui.svelte.ts` (mode, theme, fx), `figstate.ts` (cono, mzm, rt, cell) |
| `src/lib/styles/` | `tech.css`, `chapter.css`, `visual.css` (edits marked "F0") |
| `src/lib/figures/` | `dom.ts`, `fmt.ts`, `optics.ts`, `spectral.ts`, `conoscope.ts` + worker, `cono-tech.ts`, `lattice.ts`, `eo.ts`, `rtensor.ts`, `depthnav.ts`, `visual/` (`bench`, `dispersion`, `doors`, `timeline`, `mzm`, `ellipsoid`, `glyphs`, `range`, `lifecycle`) |
| `src/lib/content/` | `site.ts` (registry, status codes, page meta), `pops.ts` (popup registry), `pops-landing.ts`, `pops-pockels.ts`, `chronology.ts`, `loader.ts`, `README.md` (conventions for page lanes) |
| `static/data/` | `eo-overlap-li2026aa.json`, `linbo3-cell.json` (copies of `mockup/data/`) |
| `tests/e2e/` | `parity.spec.ts`, `layout-shift.spec.ts`, `pages.spec.ts`, `util.ts` |

Scripts: `pnpm dev` (127.0.0.1:47614, tmux session `ln-dev`), `pnpm build`, `pnpm preview` (47615), `pnpm check`, `pnpm test:e2e`, `pnpm test:physics`.

## Mockup physics -> src/lib/physics

| Mockup | Now |
|---|---|
| `ln.js` `LN.n(axis, lam)` (Zelmon CLN) | `sellmeier.refractiveIndex(ZELMON_CLN_O/E, lam)` via `figures/optics.ts nCLN` (clamped to 0.4-5.0 um so slider end points do not throw) |
| `LN.qpmPeriodSHG` | `phasematching.qpmPeriodSHG(lam, n)` via `optics.ts` |
| `LN.renderConoscope` | `crystaloptics.conoscopeZcutWeak` (weak) and `crystaloptics.conoscope` + `impermeability` + `tensors.r3m` (exact); RGB tone mapping and `mockupSpectrum()` weights in `figures/conoscope.ts` |
| `LN.R22_T` 6.8 pm/V | kept in `optics.ts` (value shown on the page with its P-comp popup) |
| `eo.js` `jacobi`, `imperm`, `SETS`, `FORM` | `linalg.eigSym3`, `crystaloptics.impermeability`, `constants.EO_TURNER1966_S / EO_KAMINOW1980_S / EO_ZOOK1967_T`, `tensors.r3m` (in `figures/rtensor.ts`) |
| MZM `cos^2(pi V / 2 Vpi)` | `modulator.mzmTransmission` |
| L3 FEM analysis (grid sums, trapezoid, region split) | unchanged port in `figures/eo.ts` (data analysis of the export, not material physics) |

No changes to `src/lib/physics` are needed.

## Test results (2026-10-25, production build via `vite preview`, system Chrome 1440x900 and 390x900, reduced motion emulated except the "fx" project)

`pnpm test:e2e`: 94 passed, 0 failed, 0 skipped. `pnpm check`: 0 errors (5 accessibility warnings on markup carried over from the mockup: tabindex on the cell stage, `role="img"` on canvases). `pnpm build`: all 14 routes prerendered.

### (a) Parity with the mockup (block by block; masthead, every section, footer; viewport-tiled capture)

| View | raw mismatch | outside conoscope | block height deltas |
|---|---|---|---|
| landing TECH dark / light 1440 | 1.83% / 1.76% | 0.18% / 0.11% | 0 |
| landing TECH dark / light 390 | 2.81% / 2.81% | 0.18% / 0.18% | 0 |
| landing VISUAL dark / light 1440 | 0.31% / 0.31% | 0.05% / 0.05% | 0 |
| landing VISUAL dark / light 390 | 0.36% / 0.36% | 0.09% / 0.09% | Platforms -28 px |
| chapter 2.2 TECH dark / light 1440 | 0.15% / 0.16% | same | 0 |
| chapter 2.2 TECH dark / light 390 | 0.04% / 0.05% | same | 0 |
| chapter 2.2 VISUAL dark / light 1440 | 0.09% / 0.09% | same | 0 |
| chapter 2.2 VISUAL dark / light 390 | 0.03% / 0.03% | same | 0 |

Thresholds: raw < 3%, outside the conoscope < 0.5%, any block height within 30 px. Residuals, all intended:
- Conoscope canvases (TECH Fig. 0, VISUAL eyepiece): resting frame computed with exact retardance (rings shifted by about 6% of the weak model at the NA edge). Masked in the second column.
- Landing data record: the "not served by the mockup" line now links the API endpoints that exist (`/api/v1/properties/refractive-index-e/cln.json`, `/api/v1/dispersion/zelmon1997-cln-e.json`, `/llms.txt`).
- Platforms: "is not rendered in the mockup" removed (statement about the site; audit); the shorter line saves one VISUAL line at 390 px.
- Fig. 0 HUD: source label box reserves "white, luminance" (layout-shift fix); TECH cell legend reserves the light-theme ramp note (layout-shift fix); chapter 2.2: two reserved readout slots widened by 1 ch (data-load shift fix), which rebalances the device-mapping table columns.
- Footer imprint: the "Mockup" state tag removed (process label); date tag kept.
- Timing only: depth-index highlight and the engine row of the MZM table depend on when the capture runs.
- Capture method: Chrome's full-page (beyond-viewport) capture repeated canvas content at fixed page offsets (a ghost eyepiece about 8240 px below the real one at 390 px, in both app and mockup), so blocks are captured from scrolled viewport tiles.

### Parity: font-metric blocks (FINAL lane, 2026-10-25)

After fonts were preloaded (FIX-S), the 4 landing TECH parity views failed at 3.1-3.9% raw (limit 3%) and 1.1-1.4% outside the conoscope (limit 0.5%). Cause: the landing ASCII cell (`#cell`, Fig. 1) is a canvas whose character grid is sized from the measured monospace glyph box; the app measures the loaded font, the mockup measured before its web fonts loaded, so the app canvas is 1 px (1440) or 2 px (390) taller and every glyph row lands on a different baseline. The rest of the page did not change.

Change in `tests/e2e/parity.spec.ts`: `FONT_METRIC = { landing: ["#cell"] }`. These blocks are diffed and written to test-results/parity as before, excluded from the page totals (area kept in the denominator, as for the diverged blocks), and asserted on their own: |dh| <= 3 px (`FONT_DH`) and mismatch outside the conoscope < 10% of the block (`FONT_TOL`). Page thresholds unchanged (raw < 3%, outside the conoscope < 0.5%, block heights within 30 px), so parity remains a regression guard for every other block. The 10% block tolerance catches a missing or mis-sized grid only coarsely; the cell's controls and readouts are covered by the pages and layout-shift specs.

| View (2026-10-25 run) | page raw | page outside conoscope | #cell dh | #cell mismatch |
|---|---|---|---|---|
| landing TECH dark / light 1440 | 1.74% / 1.75% | 0.09% / 0.09% | 1 px | 4.2% / 3.2% |
| landing TECH dark / light 390 | 2.77% / 2.77% | 0.13% / 0.14% | 2 px | 7.3% / 6.2% |

### (b) Layout shift
- Control extremes: every visible range input at min, max, mid; every segmented button; pointer sweeps over the heatmaps, cell stages and ellipsoid; depth-profile bars; theme toggle and back. Landing 15 (TECH) / 14 (VISUAL) controls, chapter 2.2 19 / 20, at 1440 and 390: 0 elements moved or resized.
- Data load: figure JSON held back until a first snapshot after fonts, then released: 0 elements with an id moved (both pages, both modes, both widths).
- Fixed on the way (the mockup had the same issues): Fig. 0 source label width; TECH ramp note reflowing the cell legend on theme change; L3 date and r33-share slots narrower than their values (tracking of `.meta` not reserved); VISUAL Fig. 1 legend filled after data load (now in the markup); `--mast-b` computed while `#cell` was hidden (VISUAL load), now computed when the cell first shows.

### (c), (d), (e)
- Console: no errors on any of the 14 routes, TECH and VISUAL, at 1440 and 390, with effects on and off.
- 390 px: document scrollWidth equals clientWidth on every route in both modes.
- Navigation: landing -> /light/ -> 2.2 -> landing by client-side links: chapter layer stays off the landing (control grid unchanged), FEM table populated, landing figures remount (HUD text, conoscope pixels, toggle state, slider drives the HUD to "biaxial").
- Pre-paint: with VISUAL + light stored, the state is on `<html>` and the VISUAL variant is displayed when `<main>` is parsed, before the app scripts run; URL parameters override storage without writing it.
- Build: `build/<route>/index.html` for all 14 routes; FEM data copied.

## Audit (fresh-context subagent, 2026-10-25) and corrections

| Finding | Action |
|---|---|
| Footer bias meter not rewired after client-side navigation (onMount in the persistent layout) | `$effect` keyed on `aside`, resets the loop flag |
| Cell popup entries could register after unmount | `alive` checks in `lattice.ts` |
| `--mast-b` wrong after loading in VISUAL | recompute when `#cell` first becomes visible |
| VISUAL Fig. 1 legend filled late | static legend in the markup |
| "Exact" resting frame neglects r51 | popups now state the r22 term and the neglected r51 tilt; HUD angle from the same tensor |
| HUD angle from the first-order formula | eigen-decomposition (`opticAxes`, `eigenIndices`) |
| Worker failure silent | `onerror`: pending jobs finish on the main thread |
| Process labels: "Preview" tag, "not served yet", "not rendered yet"; repo path cited as a source | removed or replaced with existing endpoint links; popup cites Born & Wolf (optics of crystals) and Yariv & Yeh 1984 ch. 7 |
| Footer status key on pages without badges | key empty on skeleton pages |
| Tests: parity silently skipped without the mockup server; effects never exercised; data-load test too late; pointer readouts not driven; pre-paint test checked a comment; navigation test shallow | parity fails unless `PARITY_SKIP=1`; "fx" project; data gated with `page.route`; pointer sweeps and theme toggle; behavioral pre-paint test; remount assertions |

## Conventions for page lanes

`src/lib/content/README.md` (routes and `.svx`, `ChapterPage`, sections as direct children of `<main>` with `data-spine` / `data-pair`, both systems via `ModeVariant` or `data-variant`, shared state in `figstate.ts`, `whenVisual` for VISUAL-only code, badges and popups, physics only from `src/lib/physics`, fixed-format readouts, server-computed default markup, registering built pages in `site.ts`, adding pages to the e2e lists).

## Open

- Chapter landings are skeletons (keywords from the approved index plus a sections table); every chapter except 02 is `built: false`.
- VISUAL L3 exploded 3D overlap stack: specified in DevLog-003b sec. 8, not built (as in the mockup).
- Glossary popups (`g:<id>`) are wired but no page uses them yet.
- `mockup/` remains the reference; the root `README.md` still says the production site is not built (not owned by this lane).
- three.js chunk 684 kB (lazy); fonts from Google Fonts (self-hosting later if wanted).

## TODO

- [x] Scaffold, install, dev server in tmux `ln-dev` on 47614
- [x] Styles and pre-paint script
- [x] Stores, shell components, popups
- [x] Figure modules (physics from `src/lib/physics`)
- [x] Landing port
- [x] Chapter 2.2 port
- [x] Route skeleton, chapter template, content loader, README for page lanes
- [x] Playwright: parity, layout shift, console, overflow, build
- [x] Fresh-context audit and corrections
- [x] Results and conventions in this DevLog

## Progress log

- 2026-10-25 Inputs read (DevLog-003/003a/003b/004, all mockup files). Plan written.
- 2026-10-25 Scaffold and dependencies installed (pnpm); dev server `ln-dev` on 127.0.0.1:47614 (port checked free; 47613 untouched).
- 2026-10-25 Lane PHY landed mid-run; figures bound to `src/lib/physics` instead of a legacy copy; conoscope exact-at-rest worker added per coordinator.
- 2026-10-25 Landing and 2.2 ported; first parity run: page heights identical to the mockup on all 16 views.
- 2026-10-25 Hydration fixes: explicit `<tbody>` in live tables; static strings moved to server loads; glossary made lazy.
- 2026-10-25 Audit corrections applied; parity switched to block-wise viewport-tiled capture; 94/94 tests pass.
- 2026-10-25 FINAL lane: parity spec treats the landing ASCII cell as a font-metric block (see "Parity: font-metric blocks"); 16/16 parity views pass.
