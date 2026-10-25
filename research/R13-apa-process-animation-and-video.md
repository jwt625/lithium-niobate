# R13: Inspirations from advanced-packaging-atlas (process animation, hybrid bonding video)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Sources | `advanced-packaging-atlas` repo: `DevLog/DevLog-016-process-flow-animation.md`, `DevLog/DevLog-015-hybrid-bonding-short-video.md`, `media/hybrid-bonding-short/STYLE.md`, `media/hybrid-bonding-short/scenes/` |
| Author | Claude Code (coordinator), at Wentao Jiang's request |

Both efforts are the author's most recent (2026-10-22..24) and most polished examples of code-generated, physically faithful technical visuals. They set the bar and the working method for lithium-niobate.com.

## 1. Process-flow animation (DevLog-016)

What it is: a Process mode in the atlas 3D tab that plays real packaging flows (CoWoS-S composite 30 steps, EMIB / EMIB-T, one 27-step ECTC 2025 paper flow with 3 routes) forward, backward, step, scrub, in three.js, fully client-side.

### Design rules worth copying

| Rule | Detail in APA | LN-site translation |
|---|---|---|
| Deterministic scene | Scene is a pure function of (step index, t in [0,1]); reverse play and scrub are evaluations at other times; step-boundary snapshots cached; forward vs backward state and pixel mismatch = 0 checked on all routes | TFLN fab flow (wafer bond, smart-cut split, CMP, litho, Ar ion mill with redeposition, clean, cladding, electrodes, poling) as f(step, t); same determinism test |
| Provenance per number | Every rendered number is `reported` (from a paper), `derived` (formula over reported), or `template` (illustrative, rationale required); template values look template (desaturated / dashed in HUD, "not reported; illustrative" tooltip) | Same three-level tag on every geometry value, process parameter, and material constant on the LN site; this is also what makes the AI endpoints trustworthy |
| Physical models, not keyframes | Washburn underfill, Faraday plating, Preston CMP + dishing, Bosch scallops, volume-conserving solder, step coverage | LN analogs: Ar+ milling sidewall angle and redeposition, smart-cut H/He implant depth (SRIM-like range table), CMP Preston, Ti/Au evaporation and lift-off, periodic poling domain nucleation and growth, wet etch of +z vs -z faces (HF differential etch) |
| Procedural materials, no image textures | One uber-shader, 38 material keys, F0 from refractiveindex.info n,k; ground vs polished Si, plated Cu grain | LN (transparent birefringent, faint yellow), SiO2 BOX, Si handle, a-Si / Cr hardmask, HSQ / ZEP resist, Au electrodes, SiN; F0 and tints from sourced n,k |
| Tool's most involved part | CMP pad + head + slurry arm, grind wheel, DRIE plasma, bond head; only the contact element at small scales | Czochralski puller (crucible, seed, meniscus), ion implanter beam, wafer bonder, CMP, e-beam writer column tip, ion mill grid and beam, poling electrodes with HV pulse |
| Linked multi-scale views | Wafer/tool, package block, feature unit cell; picture-in-picture synced to same t; layouts Main / Inset / Side by side / Stacked / Swap | Boule -> wafer -> die -> waveguide cross-section -> unit cell; the same linked-scale idea is the backbone of "progressive depth" |
| Illustrative vs actual scale toggle | Illustrative z-map per step; actual = true scale + ruler | Essential for TFLN: 600 nm film on 500 um handle is invisible at true scale |
| Constant aspect within a step | One frozen z-map per step; untouched bodies keep on-screen height while thinned bodies shrink (author directive) | Same rule for CMP thinning of the LN film and for etch depth |
| Camera persistence | Pose persists across steps, scrub, play; re-target only when the workpiece changes (flip, join, dice) (author directive) | Same |
| HUD | Step n/N, equipment, real elapsed process time, parameters with status, mini T(t) / F(t) / P(t) plot | Same, plus the reported/derived/template badge |
| Budgets and verification | max ~130 draw calls, ~0.75-0.9 M triangles (headless SwiftShader), render on demand (0 idle frames), lazy chunk 115 kB; 1224-shot render sweeps | Mobile budget must be tighter for a public site (see R05, R10) |
| Process | Research lanes (tool parameters with sourced row ids) -> content/provenance lane -> engine contract reviewed by coordinator -> engine, materials, tools lanes -> data / visual audits (A1, V1, A2, V2, final) | Reuse the lane structure for the LN fab-flow build |

### Lessons from its audits (avoid repeating)

- Camera inside tools, near-white metals from a bright environment map, layers floating with gaps, directional ops acting on the wrong face after a flip, melting solder regardless of liquidus. The LN equivalents to pre-empt: wafer flip at bonding (which face is +z), etch acting on the wrong side, transparent LN reading as glass or as nothing on a dark background.
- Composite flows ended mostly `template` (CoWoS-S: 34 reported of ~300 values). Honest labeling was kept rather than hidden. Expect the same for a generic TFLN flow; anchor to a few papers that publish full recipes (several TFLN papers do; see R02 literature post recipes and R08).

## 2. Hybrid bonding short video (DevLog-015, STYLE.md)

What it is: a 22.00 s, 1920x1080, 25 fps release-style film. One interface shrinking in pitch from 1 mm BGA to 0.4 um Cu-Cu hybrid bond, each level drawn in a different art style, all scenes generated by code (Canvas2D / SVG / raw WebGL2), music synthesized in code and the cut re-timed to the beat grid.

### Design rules worth copying

| Rule | Detail | LN-site translation |
|---|---|---|
| One fixed geometric motif | The bond plane sits on y = 600 px in every shot, in every style; pitch drawn at similar on-screen size so density looks equal while the number falls 3.4 decades | A single LN motif held fixed across all decorative and narrative pieces (candidates in R12: the optic axis / c-axis arrow, the waveguide line, the conoscopic cross) |
| Art-style ladder | Duerer engraving, ukiyo-e, risograph, Islamic geometric tiling, da Vinci red chalk, Bauhaus, Mondrian, Bridget Riley op art, Seurat, cyanotype, false-color TEM, Swiss International, Art Nouveau, Art Deco, sumi-e, 8-bit pixel; signature motion per style (Hokusai wave as capillary underfill front; Bauhaus red sun rises; girih strapwork constructs from each bump) | Directly answers the kickoff request to borrow from art / architecture / nature: one style per physical effect or era (R12 maps candidates). "The art style changes rendering, never geometry." |
| Geometry stays true | Topology and featured dimensions to scale in every style; deviations declared in per-scene notes with sources | Same: every decorative scene has a `notes.md` with its sources and declared exaggerations |
| Deterministic `render(t)` | No `Math.random`, `Date`, animation loops; seeded PRNG; < 400 ms per frame headless; valid for any t in [0, 3] s | Same contract makes every illustration screenshot-testable and exportable to video / social clips |
| No text in scenes | Overlay word is the only text, optionally lettered in the scene's style (textfx: halftone, stipple, pixelate, split-halves seam that heals) | Site headings could be lettered per chapter style sparingly; body text stays plain for accessibility |
| Code-synthesized sound | Organ ranks, pentatonic material ladder (pitch mapped to physical scale), beat-gridded cuts, loudness targets (-16 LUFS, <= -1.5 dBTP) | Optional, off-by-default sonification on the LN site (e.g. three-wave mixing as an audible chord, EO comb as harmonic series) |
| Harness | One self-contained HTML per scene + tiny runtime (`apa.js`), contact-sheet verifier (`render_video.py sheet`), cut list `edit.json` as source of truth | Same harness can render the LN site's hero loop and social preview clips from the same scene files the site embeds |
| Figure crops are visual references only | Never traced or embedded | Same rule for LN paper figures (copyright); see R02 on the blog's screenshotted tables |

### Author feedback recorded there (preferences that transfer)

- Wants signature motion visible within 0.5 s, settled by about 1 s.
- Rejected over-fragmented phrasing; preferred regular grids (powers of two).
- Asked for "grand enough" (organ), clean cards without decoration around text, sentence case.
- Iterates by direct, terse visual feedback; agents should present contact sheets for fast review.

## Website implications (ranked)

1. Adopt the APA provenance model (`reported` / `derived` / `template`, template visibly marked) site-wide, for 3D geometry, sim defaults, and the property API.
2. Build a TFLN fab-flow Process viewer on the DevLog-016 architecture (deterministic f(step, t), linked scales, illustrative vs actual toggle, constant aspect per step, persistent camera, HUD with real process time).
3. Use the hybrid-bonding scene contract (self-contained deterministic scenes, fixed motif, art style per scene, no text inside, per-scene notes with sources) for the decorative and narrative illustrations of physical effects.
4. Reuse the render harness to export a short LN film (hero loop and social clips) from the same scenes; music optional.
5. Reuse the multi-lane agent workflow with research lanes producing sourced row ids before any engine work, plus data and visual audits.
