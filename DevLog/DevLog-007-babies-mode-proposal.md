# DevLog-007: Third mode "for babies" (proposal) and footer credit

| Field | Value |
|---|---|
| Date | 2026-10-28 |
| Status | Footer credit done (uncommitted); BABY mode approved 2026-10-28 (sec. 6); building harness + cover + 01 |
| Scope | Footer creator credit; a third display mode: one picture book per chapter, each drawn by code in its own art style |
| Authors | Claude Code (coordinator), at Wentao Jiang's request |
| Detail | DevLog-007a (page scripts, all 9 books), DevLog-007b (art-style research, recipes, PD/IP sources) |

## 1. Requests (Wentao, 2026-10-28)

1. Footer credit matching the page style, pointing to the creator, the blog main page and this repo (model: advanced-packaging-atlas footer).
2. A third style "for babies", in the spirit of the "X for Babies" board books; propose pages and topics; each chapter adopts a given art style or painting/drawing method (precedent: advanced-packaging-atlas hybrid-bonding short video, DevLog-015 there).

## 2. Footer credit (done)

- `src/lib/components/Footer.svelte`: `.imprint` row = `lithium-niobate.com` | `Created by Wentao Jiang | homepage | GitHub` | date tag. Links: https://outside5sigma.com, https://github.com/jwt625/lithium-niobate (`target="_blank" rel="noopener"`, class `u` like the License link).
- `tech.css:276`, `visual.css:364`: `.imprint .sep` spacing and muted color.
- Verified: `pnpm check` 0 errors; screenshots TECH/VISUAL x dark/light x 1280/375 on `/` and `/crystal/`; row wraps to 3 lines at 375 px, no footer overflow.
- Found, not fixed (outside scope): TECH at 375 px has 4 px horizontal scroll from the masthead search button (`header .tools > .search > button.iconbtn`); the e2e overflow check runs at 390 px and misses it.

## 3. Genre facts (research 2026-10-28, sources in the agent report, summarized)

| Item | Fact |
|---|---|
| Series | Baby University, Chris Ferrie, Sourcebooks; self-published origin 2013, series launch 2017; physics titles incl. Quantum Physics, Optical Physics (2017, linear optics: reflection, refraction, rainbows), Electromagnetism, Statistical Physics, Nuclear Physics, Quantum Information (2018) |
| "Electrical Engineering for Babies" | not found as a title; closest: Electromagnetism for Babies |
| Format | board book, 24 pages, ~20 x 20 cm, ages 0-3 |
| Pattern | every book opens on the same object ("This is a ball"); one new property per page, cumulative; last page names the reader an expert |
| Art | flat computer-generated vector, simple circles/lines/arrows, bright color, no recurring character |
| Existing LN / crystal / nonlinear-optics baby book | none found (web search, not a full catalog check) |
| Trademark | BABY UNIVERSITY, USPTO Reg. 5496731 (Sourcebooks, live). No "for Babies" mark found (indirect search). Reading: "Lithium Niobate for Babies" as a descriptive homage is low risk if the site avoids the series name, cover trade dress and ball-on-cover motif, and adds a one-line non-affiliation note (not legal advice) |

## 4. Proposal

### 4.1 Concept
"Lithium Niobate for Babies": 9 square picture books (cover book + 8 chapters), read-aloud text in a fixed band, one picture per page, one tap/drag/animation per page that shows the idea, last page "Now you know ...". Each page maps to a grown-up section (link out). Numbers only in parent hover notes, each with its repo source (DevLog-007a). Physics simplified by omission only; known traps listed per book (DevLog-007a flags).

Recurring object: the crystal's arrow (spontaneous polarization), same glyph in every book. No mascot (a Li hero implies Li alone makes P; a photon mascot invites "light slows down").

### 4.2 Books and topics (full scripts: DevLog-007a)

| Book | Pages | Cumulative build |
|---|---|---|
| Cover | 10 | one crystal, one page per chapter's main trick, eight doors |
| 01 Crystal | 14 | O ball, sheet, stacked rooms, Nb / empty / Li order, 3-fold turn, arrow appears on cooling (Curie), lost just below melting, missing Li, dopants (Fe trouble, Mg help), flipping with voltage, hexagonal domains, stripes and walls |
| 02 Light | 14 | beam, wave, wiggle direction, slower crests inside, two speeds, voltage changes speed, two paths rejoin (MZM), thin ridge waveguide, two IR bits join into one green (1064 to 532 nm), stripes keep it in step (QPM), splitting (OPO), comb |
| 03 Sound | 14 | squeeze, charge, shape change, bulk sound, surface ripple, 128-degree cut, comb electrodes (IDT), filter, phone, sound bends light, sound and light in one tiny structure |
| 04 Quirks | 14 | light-written mark, erasing, MgO cure (leaks charge back, does not block light), green-induced IR absorption, pyroelectric spark and dust, thermal shifts, DC drift, Li out-diffusion, faces etch differently |
| 05 Making | 14 | ore and brine, recipe, melt, pulling (Czochralski), boule, wafers, He implant, split, Ar etch, oxide cover, gold electrodes, poling, fiber attach |
| 06 Devices | 14 | message, modulator, microwave and light racing together, frequency doubling, OPO, EO comb, quantum light, acoustic devices, bonded laser, sister crystal LT |
| 07 History | 14 | 13 dated pages from `events.yaml` (1801 columbium to 2026 OFC 1.6T reference transceiver) |
| 08 Industry | 14 | rock to chip, regions, wafer sizes, point-at pages (phone filter, internet, data center, gyroscope, projector, quantum computer, lab laser), "estimates disagree" |

Not covered: 4.3, 4.5, 6.3, 6.12 (optional 4.3 page drafted in 007a).

### 4.3 Art style per chapter (research: DevLog-007b)

Each style is a method, not only a look, and its method is tied to the chapter's physics. All generated by code (SVG / Canvas2D / WebGL2), deterministic `render(t)`, seeded static textures, no images, no tracing (rules carried over from the hybrid-bonding video STYLE.md).

| Book | Primary | Method -> physics | Alternates | PD / IP | Effort |
|---|---|---|---|---|---|
| Cover | Jianzhi paper-cut | fold a 60 deg wedge, cut, unfold: the unfolded figure has exactly 3m symmetry; unfolding is the animation | sampler of all 8 styles; Scherenschnitte | none (folk art) | S |
| 01 Crystal | Counted cross-stitch | X on a cloth grid; the top leg's slant = sign of P; poling = re-stitching; wall = backstitch | hexagon patchwork (English paper piecing); Roman mosaic | none | M |
| 02 Light | Medieval stained glass | backlit panes; lead came = waveguide; 1 beam in, 2 out (birefringence); 1064 in, 532 out | Cubism after Juan Gris (double view); Delaunay color discs | none (13th c.) | M |
| 03 Sound | Black-line woodcut | gouge strokes on wavefront iso-lines; stroke density falls as exp(-z/lambda) (SAW confinement); carved comb = IDT | color ukiyo-e Great Wave (reuse from video); Chladni sand figures | none | M |
| 04 Quirks | Crayon scratch-art | scrape black off color: light writes and the writing stays (photorefraction, damage, drift) | generic surrealism (Grandville); paper marbling | none | S |
| 05 Making | Wordless isometric instruction manual | numbered exploded steps = process flow, stack building | blueprint / cyanotype (reuse); felt quiet-book | low (avoid IKEA / LEGO marks) | M |
| 06 Devices | Constructivism after Lissitzky's picture book "About Two Squares" (1922) | flat primitives on diagonals, letterpress texture; red / black / cream = newborn high-contrast palette | paper quilling (coils = rings); Ben-Day dots | none (Lissitzky d. 1941) | S |
| 07 History | Bayeux-style embroidered strip | one continuous stitched strip = timeline, scrolls horizontally | Chinese handscroll; early Sunday comic strip | none (1070s) | L |
| 08 Industry | Isotype counting book | quantity = repeated pictograms, never scaled; counting book is native to the genre | Bruegel bird's-eye panorama; transit map | low (draw own glyphs; Arntz estate claims the original pictograms) | S |

Coordinator note on 01: a square Aida grid contradicts LN's trigonal / hexagonal lattice (O sheets are hexagonal, domains grow as hexagons). Hexagon patchwork keeps a craft method and matches the symmetry; cross-stitch keeps the clever "top leg = P" rule. Author picks (sec. 6).

Avoid list (distinctive styles of recent or estate-enforced artists or marks): Miffy / Dick Bruna, Eric Carle collage, Escher, Magritte, Dali clocks, Lichtenstein, Picasso, Braque, Sonia Delaunay, TfL roundel, IKEA, LEGO.

### 4.4 Shell and page UI (recommendation)
- Book page always paper (scratch-art book: black ground), ignoring dark / light; surround and controls follow the theme. Page rectangle and UI chrome sharp; art inside exempt.
- One reading typeface across all books in a fixed text band (contrast >= 4.5:1), candidates Atkinson Hyperlegible or Andika (OFL), or the site's existing serif; title page lettered in each book's style.
- Square page, single page on phone, two-page spread on desktop; tap / arrow keys / swipe to turn; fixed page box (no layout shift); reduced motion = final frame.
- Deterministic scenes allow later export of each book to PDF (print) or a short video in the hybrid-bonding format.

### 4.5 Integration options
- A (recommended): third masthead toggle TECH | VISUAL | BABY (`ui.mode = "baby"`, same pre-paint path). Chapter landing in BABY = that chapter's book; section page in BABY = the book opened at the page mapped to that section (DevLog-007a "Sec" column); Lab / Data / Library / Colophon show the cover book's door page.
- B: separate route tree `/babies/<chapter>/` linked from the landing; TECH / VISUAL untouched.

### 4.6 Build plan (after decisions)
1. Harness: book runtime (page box, text band, turn controls, `render(t)` scene contract, seeded RNG, texture helpers), mode plumbing, one e2e spec (layout stability, overflow at 375 / 390, reduced motion).
2. Pilot: 2 books end to end (cover paper-cut S + 02 stained glass M); author review.
3. Waves: one subagent per remaining book (style kit + pages), max 10 concurrent; fresh-context physics + copy audit per wave; fix round.

## 5. TODO

- [x] Footer credit + verification (2026-10-28)
- [x] Genre, art-style and page-script research (2026-10-28)
- [x] Author decisions (sec. 6, 2026-10-28)
- [x] Harness lane H (BABY mode, runtime, routes, e2e) (2026-10-29)
- [x] Book lane C (cover, paper-cut) (2026-10-29)
- [x] Book lane K (01 crystal, hexagon patchwork) (2026-10-29)
- [x] Books 02-08 (2026-10-29)
- [x] Fresh-context physics + copy audit of all 9 books (audit H, 0 high / 3 medium / 9 low); fix round done (2026-10-29)
- [ ] Author review on localhost; commit (push to main deploys lithium-niobate.com)

## 6. Author decisions (Wentao, 2026-10-28)

1. Third masthead toggle named **BABY** (option A of 4.5).
2. No sound. Styles drawn directly in JavaScript, iteratively with screenshot inspection and feedback; no image generation. Add simple animations wherever they help (use the web medium).
3. Short, plain baby sentences, straight to the point. Total 32-40 pages; coordinator plan: cover 4 + 8 chapters x 4 = **36 pages** (sec. 7). DevLog-007a scripts are the long-form source; sec. 7 supersedes their page lists.
4. Title "Lithium Niobate for Babies" with a non-affiliation line; book page always paper. Core text and labels are lettered in each book's art style (supersedes the one-typeface recommendation in 4.4).
5. Audio and PDF later.
6. Build cover + chapter 01 first to gauge token use; parallelize with subagents.
8. (2026-10-29) Chapter transitions: camera zooms through the door of the cover's door page into the chapter slide placed behind the opening (reverse on exit; cross-chapter = exit then enter); door leaf open/close (the hover swing) synced with the zoom; the gold doorway fill rolls up / down like a paper blind (hard edge, not a fade).
9. (2026-10-29) Cover p1 cut = LN projected along c, holes on computed atom columns (cation columns gold hexagons, O triads three-lobed; p31m mirrors = folds).
10. (2026-10-29) Door page (cover p4) becomes a paper-cut street: doors on buildings grouped by topic, stop-motion paper figures (worker carrying a boule, phone with radio arcs, light pulses on a cable).
7. (2026-10-29) BABY view must be immersive: masthead omitted (or fully matching), only bare navigation and an "Exit baby mode" button. Coordinator scope: masthead, spine and full footer hidden in BABY; viewport-fit stage; prev / next / dots / home (door page) / exit (also Escape); quiet info marker + section link; tiny credit line and the cover-only non-affiliation line kept.

Coordinator choices (not asked): 01 Crystal uses hexagon patchwork (English paper piecing), not cross-stitch, because the square Aida grid contradicts the hexagonal O sheets and hexagonal domains. Single square page per view (no two-page spread). Woodcut stays the 03 primary.

## 7. 36-page plan

Exact text for the first two books; topic per page for the rest (text written when each book is built).

### Cover (paper-cut, `cover`)
| p | Text | Sec | Picture / motion |
|---|---|---|---|
| 1 | Lithium Niobate for Babies | `/` | folded red paper unfolds into a 3m-symmetric cut crystal; title cut into the paper |
| 2 | Lithium, niobium and oxygen make this crystal. People grow it. | `/crystal/` | three cut-paper balls join into one crystal shape |
| 3 | It has an arrow inside. The arrow lets it play with light and sound. | `/crystal/polarization/` | arrow cut out of the crystal; a light ray and a ripple cut-out wiggle past |
| 4 | Pick a door! | `/` | eight cut-paper doors (Crystal, Light, Sound, Quirks, Making, Devices, History, Industry) open on hover; each links to its chapter |

### 01 Crystal (hexagon patchwork, `crystal`)
| p | Text | Sec | Picture / motion | Parent note (source) |
|---|---|---|---|---|
| 1 | These are oxygen balls. They pack into flat sheets. | `/crystal/lattice/` | patches stitch together into a close-packed sheet | O sublattice is hexagonal close packed (ch01) |
| 2 | Stack the sheets. In the gaps: niobium, empty, lithium. Again and again. | `/crystal/lattice/` | sheets stack; gaps fill in order Nb, empty, Li along the axis | octahedral sites 1/3 Nb, 1/3 Li, 1/3 empty (ch01) |
| 3 | Cool it down. Lithium and niobium both scoot one way. Now it has an arrow. | `/crystal/polarization/` | thermometer drops; Li and Nb patches slide; stitched arrow appears | Curie temperature about 1140 C, congruent (ch01:L90, ch01:L134) |
| 4 | Push with a big voltage. The arrow flips! Up, down, up, down. Now you know the crystal! | `/crystal/poling/` | tap: electrode comb flips stripes of arrows | coercive field about 21 kV/mm, congruent (ch01:L422) |

### 02-08 (topics; 4 pages each)
| Book | Style | p1 | p2 | p3 | p4 |
|---|---|---|---|---|---|
| 02 Light | stained glass | light is a wave; two wiggle directions, two speeds (birefringence) | voltage changes the speed; two paths rejoin: bright or dark (Pockels, MZM) | two infrared bits join into one green bit; stripes keep it in step (SHG, QPM) | a thin ridge holds the light (TFLN waveguide) |
| 03 Sound | woodcut | squeeze it: charge appears (piezo) | a ripple runs on the surface (SAW) | comb electrodes make and catch ripples: the filter in a phone (IDT) | sound bends light (acousto-optics) |
| 04 Quirks | scratch-art | light writes a mark (photorefraction) | magnesium lets the mark leak away (MgO) | warm it: charge appears (pyroelectric) | the bias drifts slowly (DC drift) |
| 05 Making | isometric manual | melt and pull a crystal (Czochralski) | slice wafers | split off a thin film and bond it (ion slicing) | carve ridges, add gold, pole |
| 06 Devices | Constructivism | a modulator writes messages on light | new colors: doubling, OPO | a comb of colors | filters and quantum light |
| 07 History | embroidered strip | discovery of the arrow (1949, events.yaml) | Bell Labs grows the crystal (1960s) | the internet's modulator | thin film to the AI data center |
| 08 Industry | Isotype | rock to chip | count the steps / makers | in your phone | in the internet and data centers |

## 8. Book contract (harness <-> books)

`src/lib/babies/types.ts` (created by the harness lane exactly as below; book lanes use `import type` only):

```ts
export interface SceneHost {
  /** Square container owned by the scene. Logical coordinates 0..1000 on both axes (SVG viewBox or a dpr-scaled canvas). */
  el: HTMLElement;
  /** Seeded PRNG (mulberry32): same seed, same sequence. */
  rng: (seed: number) => () => number;
  /** prefers-reduced-motion: draw settled states, no idle motion; interactions jump to their end state. */
  reduced: boolean;
  /** Keep the runtime's frame loop running for `seconds` more (call on interaction). */
  wake: (seconds: number) => void;
}
export interface Scene {
  /** Draw at t seconds since the page was shown; depends only on t and the scene's own interaction state. */
  frame(t: number): void;
  /** Seconds after which frame(t) stops changing without input (Infinity = idle loop). Reduced motion: frame(settle) once. */
  settle: number;
  destroy?(): void;
}
export interface BabyPage {
  /** Read-aloud text. The scene letters exactly this text, in the book's style. */
  text: string;
  /** Grown-up section href from site.ts, e.g. "/crystal/lattice/". */
  sec: string;
  /** Parent note (numbers with their repo source), shown on hover of the page's info marker. */
  note?: string;
  scene(host: SceneHost): Scene;
}
export interface BabyBook { slug: string; title: string; style: string; pages: BabyPage[] }
```

- Book module: `src/lib/babies/books/<slug>.ts`, `export default` a `BabyBook`; helpers in `src/lib/babies/books/<slug>/`. Slug = chapter slug, `cover` for the landing. Registry via `import.meta.glob("./books/*.ts")` (files starting with `_` excluded).
- Runtime: square stage (fixed box, no layout shift), prev / next buttons, arrow keys, swipe, page dots, `#p<N>` hash; sr-only live copy of `text`; info marker with `note`; link to the grown-up section (number + title from site.ts). Pointer events inside the stage belong to the scene. Frame loop runs only while visible and t < settle or woken.
- Routes in BABY: `/` = cover; chapter landing = its book p1; section = its book at the first page whose `sec` matches, else p1; chapters without a book and the extras = cover p4 (doors).
- Lettering legible on a 320 px stage: x-height >= 30 logical units. Fonts: procedural lettering, or vendored OFL woff2 under `static/fonts/babies/` with the license file.

## Progress

- 2026-10-28: footer credit implemented by a subagent and checked (screenshots reviewed by coordinator). Three research subagents: genre facts, art styles (DevLog-007b), page scripts (DevLog-007a). Proposal written.
- 2026-10-28: author decisions recorded (sec. 6); 36-page plan (sec. 7) and book contract (sec. 8) written; lanes H, C, K launched in parallel.
- 2026-10-29: lanes done. H (195k tokens, 25 min): BABY in ui store / pre-paint / masthead (third button; VISUAL masthead padding tightened to fit, TECH <= 480 px hides the formula and wraps tools), VISUAL chrome reused via `:root:is([data-mode="visual"], [data-mode="baby"])`, `src/lib/babies/runtime/` (BabyStage, registry with lazy glob, rng), `baby.css`, `tests/e2e/baby.spec.ts` + `baby.config.ts`; pnpm check 0 errors, physics 260/261 pass (1 skip), layout-shift + baby e2e 125 passed on preview. C cover paper-cut (158k tokens, 19 min, 818 lines). K crystal patchwork (141k tokens, 15 min, 1371 lines; notes p1/p2 cite ch01:L28, L68). Author: quota use about 3 % for the session so far; serve for inspection on :47614 and continue with 02-08.
- 2026-10-29: open from H: `parity.spec.ts` not run (masthead now differs from mockup by design); a section link opened in a new tab keeps BABY; pre-existing 1 px overflow of the VISUAL landing timeline at 641 px.
- 2026-10-29: book lanes 02-08 launched in parallel (one per chapter, styles per sec. 7; each lane writes its own 4 page texts under the author's short-plain-text rule).
- 2026-10-29: author feedback 7 (immersive BABY view) sent to lane H (resumed).
- 2026-10-29: lane H round 2 (immersive BABY, +33k tokens): masthead, spine, footer hidden; viewport-fit stage; bare row home / prev / dots / next / Exit (Escape); quiet note + section link; credit line; optional `BabyBook.surround`; baby spec 34/34.
- 2026-10-29: books 02-08 done; each lane wrote its own 4 texts (sources in each book's notes). Tokens / wall time / lines: light stained glass 217k / 27 min / 1330; sound woodcut 159k / 16 min / 1239; quirks scratch-art 185k / 18 min / 1291; making isometric 184k / 20 min / 1208; devices Constructivism 165k / 18 min / 871 (all caps lettering); history Bayeux strip 189k / 21 min / 1350 (one continuous strip panning across pages); industry Isotype 175k / 18 min / 794. Total babies code 10,439 lines. `pnpm check` 0 errors. Coordinator contact sheet of all 36 pages from the dev site: no console errors.
- 2026-10-29: fresh-context audit of all 36 pages launched; production build + baby e2e running.
- 2026-10-29: audit H (`DevLog/audits/audit-H-baby-books-2026-10-29.md`, 113k tokens): 0 high, 3 medium (cover note citations), 9 low. All 12 fixed by the owning lanes (cover notes cited; light p1 note, p3 green lamp, banner leads only at phrase breaks; sound p2 note, p1 red minus row; quirks p4 note ch04:L344-L347; history p2 "pulls a crystal", p3 overland cable on poles instead of ship/sea, wider period). Coordinator recapture of all 36 pages from the dev site: no console errors; changed pages checked. pnpm check 0 errors; production build and baby e2e (34/34) passed before the fix round.
- 2026-10-29: author feedback: Next on a book's last page goes to the next chapter (lane H: Next/Prev cross books in site order with wrap, button/keys/swipe, boundary tooltips; baby spec 39/39). Author bug: sound p4 stripes travelled toward the transducer; fixed (stripe j at y = BY1 + j*LAMS - VS*t, moves away from the bar). Grown-up F3.7 checked: stripes step away from the transducer, correct.
- 2026-10-29: decisions 8-10 recorded; cover p1 atom-projection cut done (ch01:L38, L64-L66; overlay-checked); door hooks `data-open` / `data-aperture` / `--door-leaf-dur` added to cover p4; zoom transition (lane H) and street scene (cover lane) in progress.
- 2026-10-29: door transitions done (lane H, `travel()` in BabyStage): menu = frozen cover p4 copy in front, slide behind the door opening (clip from `[data-aperture]` via getScreenCTM), shared camera zooming log-linearly until the threshold square fills the stage; leaf swing synced (skipped when the door is already open); gold doorway rolls up / down as a hard-edged blind; cross-chapter = exit + 60 ms + enter (~1.2 s nominal; headless software rendering runs slower, needs a real-GPU look). Baby spec 45/45. Cover p4 street scene done (lab: Crystal, Light, Sound, Quirks; factory: Making; workshop: Devices; museum: History; data center: Industry; stop-motion 7 steps/s).
- 2026-10-29: author: history page turns too abrupt; make one consistent smooth horizontal move (variable speed). Plan: optional `SceneHost.from` (previous page index on an in-book turn) + seamless swap (lane H); history camera pans from `from` to the current stretch, nothing re-stitches (history lane).
- 2026-10-29: author: add a Play button that auto-advances so BABY plays from beginning to end. Plan (lane H): `.bb-play` toggle between Next and Exit (fixed 32 px slot, icon swap only); dwell = clamp(settle, 0, 12) + 2.5 s (Infinity settle: 8 s), min 5 s, counted only while visible and not mid-transition, reset on every page mount; advances via `step(1)` (door zoom across books); stops on the last page of the last book (no wrap); Play there restarts from cover p1; Space toggles; Exit stops; manual nav and stage pointerdown reset the timer.
- 2026-10-29: author: light p3 (SHG) must show the fundamental keeping photons through the crystal, fading out while green photons fade in. Plan (light lane, `light/p3-green.ts` only): IR bits run along the IR lane through and past the crystal; alpha of IR = 1 - displayed green fraction from the existing amp() tables (striped: monotonic depletion; unstriped: exchange each stripe); IR beam glow dims downstream to match; text and note unchanged.
- 2026-10-29: author: light p2 and sound p1: close the animation loop by taking the voltage back. Plan (one lane, `light/p2-switch.ts` + `sound/p1-squeeze.ts`): one closed cycle (on, hold about 1.5 s, back off), finite settle at the cycle end = start state; tap replays from the current state; reduced motion keeps the on / squeezed state.
- 2026-10-29: Play done (lane H, 85k tokens, 5 min): `.bb-play` between Next and Exit; P_CAP 12, P_HOLD 2.5, P_IDLE 8, P_MIN 5 s; 100 ms interval accumulator (max 0.2 s per tick) only while playing; stops on industry's last page; dev-only `window.__bbDwell` for e2e. pnpm check 0 errors; baby e2e 46/46 (new play test: boundary crossing, stop at end, no layout shift playing vs paused, Space, Exit). Real-books run: cover p1-p4 then door zoom into crystal p1, no console errors.
- 2026-10-29: author: sound p3 (3.5 IDT filter): add a frequency / wavelength sweep showing no transmission, transmitted, no transmission; every wavelength shown (input gauge, ripple, output gauge) tracks it. Plan (sound lane, `sound/p3-comb.ts` + the p3 note's tap sentence): ping-pong sweep lam 1.6 P -> P -> 0.58 P, about 6 s one way; one bandpass R(lam) peaked at P; ripple amplitude R, phone output R^2; ripple phase accumulated (no crest jumps); input and phone wiggles at the current frequency; tap freezes / resumes; reduced motion = matched state.
- 2026-10-29: author: sound p4 (3.6 acousto-optics): wobble the acoustic frequency and show the AOD steering angle following it. Plan (lane, `sound/p4-light.ts` only): f(t) = f0 (1 + A sin(2 pi t / T)), VS fixed; stripes launched at phi(t_j) = j and travel at VS (chirped, no jumps); deflection 2 TH f_local / f0 from the grating at the beam; source wiggle at the transducer frequency; block tilt fixed; reduced motion = centre frequency.
- 2026-10-29: author: quirks p1 (4.1): the lamp's drag affordance is not obvious; animate the beam moving or fade a hand in/out. Plan (quirks lane, `quirks/p1-write.ts`): after the intro, a scratch-art hand fades in on the lamp, presses (beam on), drags it up and down along the rail and back, releases, fades out; twice, then settle; the demo never writes the mark; first touch removes the cue for good; reduced motion shows the hand static on the lamp.
- 2026-10-29: light p2 / sound p1 closed loops done (85k tokens): light HOLD 1.5 s, cycle 2.9 s, settle 5.3 s; sound release at 2.6 s, settle 4.1 s, small needle overshoot at release; reduced motion keeps on / squeezed. Coordinator checked start / hold / end frames: end matches start on both.
- 2026-10-29: light p3 done (87k tokens): 3 IR pairs run lamp -> past the crystal; IR alpha 1 - frac(x), green alpha frac(x), frac = displayed green fraction x CONV 0.7 (so 30 % IR stays visible past the crystal); IR beam panes dim downstream; roundel lights when the lead green bit arrives; settle unchanged 2.95 s. Coordinator checked mid-run and settled frames. Open: unstriped exchange is subtle (max about 29 % IR dimming).
- 2026-10-29: author: devices p1 (6.1): fade hands in and out on the on / off keys. Plan (devices lane, `devices/p1-modulator.ts`): a flat Constructivist pointing hand performs the three intro presses (on 1.15, off 1.75, on 2.35 s), fades out, then one hint bob over on and off (no bits); first real press removes it; pointer-events none; reduced motion shows it static on "on".
- 2026-10-29: sound p4 AOD done (60k tokens): FA 0.22, FT 6 s, closed-form phase, stripes launched at phi(t_j) = j (Newton inversion), deflection 2 TH f(t - DHIT)/f0 with DHIT 6.41 s (transducer -> beam travel); drawn deflection 11.6-18.2 deg (14.9 centre); deflected beam thins up to 18 % off centre. Coordinator checked max / min frames: angle change and denser stripes at larger angle visible. Note: about 3.5 stripes per wobble period, so the chirp reads as uneven spacing.
- 2026-10-29: author: devices p4 (6.9): cycle over the three input waves. Plan (lane, `devices/p4-filter.ts` only): auto-select black (short) -> red (matched, lamp lit) -> gray (long), 2.3 s each, repeating, selection a pure function of t; a real tap stops the cycle and keeps the tapped wave; reduced motion = matched.
- 2026-10-29: author: history p3 (7.7): who in 1985, and add the company's logo in the strip's style at the booth top. Answer: Crystal Technology, Inc., Palo Alto (becker1988, single source). Plan (history lane, `history/pages.ts` page3): research the real logo in dated primary sources (archived site, period ads, trademark records); if verified, stitch a simplified emblem on the shop roof; else stitch the company name as the sign, no invented mark.
- 2026-10-29: sound p3 sweep done (105k tokens): lam 1.6 P -> 0.58 P cosine in log lam, 6 s one way, start 1.0 s, ping-pong; R = |sin(5h)/(5 sin h)|, h = (pi/2)(P/lam - 1) (5-finger array factor; zeros at 1.667 P and 0.714 P); ripple R, phone R^2 (not drawn below 0.08); shared phase table for input, crests, phone; tap freezes the sweep; note tap sentence updated. Ripple speed V 62 -> 80 (crest spacing tracks lam globally, so crests near the launcher would stall at 62). Coordinator checked long end / matched / short end frames.
- 2026-10-29: quirks p1 cue done (73k tokens): scratched white hand presses the lamp and drags it Y0 -> 240 -> 420 -> Y0 twice (cycles at 2.1 and 5.6 s, 3 s each), beam on while "pressed", demo never writes; settle 2.1 -> 8.6 s; first touch removes it; reduced motion: static hand on the lamp. Coordinator checked the top-of-drag frame.
- 2026-10-29: author: industry p4 (8.7): wire colour changes at the modulator (electrical in, optical out) and flow reverses (modulator is on Tx). Plan (industry lane, `internet()`): rack -> chip electrical segment and chip -> trunk -> globe optical segment in different colours (base strokes and dashes); runs rack -> chip (chip cue, unscaled) -> globe; tap a rack reruns its column. Page text ("... carry the internet to big computers") now conflicts; replacement to be put to the author.
- 2026-10-29: devices p4 cycle done (63k tokens): T_FIRST 0.9 s, DWELL 2.3 s, order black -> red -> gray; settle getter (Infinity while cycling, END after a tap or under reduced motion); tap stops the cycle. Coordinator checked red (lamp lit, strong ripples) and gray (weak ripple, lamp dark) frames.
- 2026-10-29: devices p1 hand cue done (75k tokens): flat black hand with red cuff (MISREG), cream outline; intro presses at 1.15 / 1.75 / 2.35 s, fade out 2.8 s; hint 4.3-6.3 s (bob over on, glide, bob over off, no bits); settle 3 -> 6.3 s; first real press fades it out in 0.12 s; pointer-events none. Coordinator checked press-off and hint-over-on frames; the cuff touches the lower electrode bar while hovering over "on" (cream outline separates them).
- 2026-10-29: industry p4 Tx done (68k tokens): electrical rack -> chip in PAL.blue (wire + 12/14 pulses), optical chip -> trunk -> globe ink fibre + gold 22/26 light; chip CY 250 -> 216; per column: send 1.5 + 0.12 i, pulses 0.10-0.50, gold outline flash 0.50-0.85, light 0.55-1.45; settle 3.0 -> 3.81 s; tap rack/chip reruns its column, globe reruns all four. Coordinator checked mid-optical and settled frames. Open for the author: page text says "carry the internet to big computers" (opposite direction); lane suggestion "Crystal chips turn big computers' talk / into light for the internet."; blue also = LT on p3 and the globe.
- 2026-10-29: history p3 sign (lane stopped by the author before its report): roof-ridge signboard with an emblem simplified from Crystal Technology's web header (Wayback 2000-04-17, EPCOS era; no 1985 mark verified) and stitched "CRYSTAL TECHNOLOGY". Coordinator compared the lane's settled render with the source header. pnpm check 0 errors. Baby e2e not rerun after the page edits (last run 46/46 after Play); rerun on a separate preview, not the shared dev server.
