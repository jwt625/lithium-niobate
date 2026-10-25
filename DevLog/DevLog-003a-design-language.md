# DevLog-003a: Design language (from the usgraphics.com reference)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Rules adopted in `mockup/styles.css`, `mockup/app.js`, `mockup/index.html` (lane D1) |
| Scope | Observed design facts of the reference page; derived rules for lithium-niobate.com |
| Authors | Claude Code (lane D1), at Wentao Jiang's request |

Reference: the author's local save of usgraphics.com ("Office" page): HTML, PDF print, and `_files/` (main stylesheet `usgraphics-wds.min.css`, 130 kB). Read as data only; no script from it was run. Nothing from it (fonts, logos, images, text) is copied into the site.

## 1. Observed facts (selector: value)

### Page frame and grid
| Item | Observed |
|---|---|
| Root size | `html{font-size:14px;line-height:1.5rem}`, so 14 px text on a 21 px line |
| Sheet | `body.max-w-60` = `max-width:60rem` (840 px), centered; `body{border:1px solid #888; box-shadow:2px 2px #ccc; padding:.5rem 1rem .25rem; margin:2rem auto}` on `html{background:#eee}`. The page is a bordered sheet on a gray desk |
| Phone (<= 436 px) | root drops to 12 px; sheet border and shadow removed; `h1..h6{font-size:14px}` |
| Grid | 12-column flexbox (`.columns` / `.column.col-N`), gutter `.4rem`; breakpoints 1280 / 960 / 720 / 436 / 330 px; content pairs are `col-6` that collapse to `col-md-12` at 720 px |
| Vertical rhythm | spacing utilities in rem steps: `mb-0.25`, `mb-0.5`, `mb-1`, `mb-2` |

### Type
| Item | Observed |
|---|---|
| Families | Text: Univers LT Pro (grotesque) 400/700, normal and condensed (`font-stretch:75%`). Data: TX-02-Data (their mono) for `.sku`, `.mono`, `.table-log th`, `.btn-ctrl`, product cards. A separate arrow font covers only U+2192 so "->" glyphs match |
| Heading sizes | `h1..h6{font-size:1rem;font-weight:700;line-height:1.2}`. Every heading is body size; hierarchy is weight plus a rule, not size. `h3` is regular weight, underlined |
| Logotype | `.logo-logotype`: 16 px, 700, condensed, nowrap |
| Case and tracking | uppercase only in mono tags (`.sku{letter-spacing:.1rem;text-transform:uppercase}`) and the footer line (`small.text-condensed.text-uppercase`, silver) |
| Definition | `blockquote{border-left:.1rem solid #000;padding:.4rem .8rem}` holding a dictionary-style definition: italic term, em dash, one sentence |

### Rules, borders, objects
| Item | Observed |
|---|---|
| Section rule | `hr{border-top:1px dashed #000;margin:.5rem 0}` under every section `h2` |
| Title rule | `hr.solid-header.pattern-dots-gray.h-fixed-1`: a 1rem band of 3 px dot pattern (`radial-gradient(#777 .5px, transparent 1px) 0 0/3px 3px`) under the page title |
| Tables | `.table`: every cell boxed (`td{border:.1rem solid #bfbfbf;height:1.85rem;padding:.2rem .4rem 0}`), `th{border-bottom:.1rem solid #000}`, top edge `2px dotted #ddd`, hard shadow `2px 2px #ddd`; optional 4 px colored left stripe (`.table-light-silver{border-left:4px solid #aaa}`) |
| Log tables | `.table-log`: no cell borders, rows 1.2rem, mono uppercase header with a 1 px black underline |
| Tooltip table | `.table-tt`: bottom borders only (#ccc), 1.6rem rows |
| Objects | Buttons, nav cells, tables, image cards all carry a hard offset shadow (`box-shadow:2px 2px #bbb` / `#ddd`), no blur. Corner radius 0 everywhere; the one round element is the 10 px red "active" dot |
| Buttons | `.btn-classic`: 1px black border, 1.75rem high, invert on hover/focus (`background:#000;color:#fff`); disabled = `opacity:.5` |
| Nav | six equal cells (`col-2`), each a bordered `.btn-nav` 1.5rem high; active cell marked by `.nav-active-icon` (10 px red dot) |
| Tags | `.sku`: mono, uppercase, `.1rem` tracking, `1px dotted` border; footer shows `PROD` (filled green) and `v3.2.2` (dotted) as state tags |
| Tooltips | tippy: `border:1px solid #000;border-radius:0;padding:.75rem .75rem .5rem;box-shadow:0 0 30px rgba(0,0,0,.25)`, max width 350 px, follows cursor, HTML allowed |

### Color
| Item | Observed |
|---|---|
| Base | black on white, grays for secondary (`#999` silver, `#ccc` moon gray, `#bfbfbf` cell borders) |
| Links | `#002dce`, underlined; underline removed on hover |
| Meaning-bound color | gold `#ffb700` on the one call-to-action, dark green `#00794c` on the PROD state tag and success, red `#ff4136` for the active dot. A named palette (about 40 colors, P3 variants) exists but the page uses almost none of it |
| Ornament | one 600 x 8 swatch strip as logo motif (process colors, an 11-step gray ramp, 8 hues) |
| Theme | light only; no dark mode |

### Content and restraint
| Item | Observed |
|---|---|
| Copy | One-line positioning, one definition blockquote, one sentence of ethos, then a 13-row table of principles ("Dense, not sparse", "Expose state and inner workings", "Explicit is better than implicit", "Flat, not hierarchical", "Don't infantilize users") |
| Motion | none, except a 2-step blinking request indicator (`animation:.2s steps(2,start)`) |
| Imagery | flat line marks in bordered square cards (4-column grid); no photos, gradients, or hero art |
| State | deployment environment and version printed in the footer as tags |

## 2. Derived rules for lithium-niobate.com

### Adopt
1. **Sheet.** Content sits on one bordered sheet (`body`: 1 px `--rule2` border, hard 3 px offset shadow in `--rule`), max width 1180 px (wider than the reference's 840 px because the landing pairs a 10-row property table with a live figure). Outer page `--bg0`. Below 760 px the border and shadow drop.
2. **One heading size.** `h1`, `h2`, `h3` all 13 px, weight 600; hierarchy by weight, the rule under the heading, and position. Only the masthead logotype is larger (16 px, condensed).
3. **Two families, one superfamily.** IBM Plex Sans for text, IBM Plex Mono for every number, unit, tag, table of values, control readout; IBM Plex Sans Condensed for the logotype and uppercase footer line. All OFL, from Google Fonts. Mirrors the reference's grotesque + data-mono split without its commercial fonts.
4. **Rules carry structure.** Section `h2` followed by a 1 px dashed rule; masthead closed by a dot-pattern band (3 px pitch). In VISUAL mode the dashed rules become poled-domain stripes and the dot band becomes a poled grating labeled with a computed QPM period.
5. **Boxed-cell tables for properties, log tables for events.** Specification, index, and instruments tables box every cell (1 px `--rule`, header underline `--fg3`). The chronology is a log table: no cell borders, mono uppercase header.
6. **Status tags as SKU tags.** Provenance badges are mono, uppercase, tracked, 1 px border: solid = read directly (P), dotted = compilation or database transcription (P-comp, P-db), dashed = computed (derived) or assumed (template). Each opens its source.
7. **Invert for state.** Segmented controls and nav cells: 1 px border; active = inverted (`--fg` background); hover = `--acc-dim` fill; unavailable = 45% opacity, not a link.
8. **Popups as bordered boxes.** 1 px border, radius 0, hard offset shadow, max width 360 px; anchored to the element (not the cursor) so keyboard focus and tap work.
9. **Expose state.** Footer prints state tags (MOCKUP, date). Unbuilt chapters and instruments are plain text, not links. The conoscope HUD prints the computed induced birefringence, uniaxial/biaxial state, and optic-axis angle.
10. **Color only with meaning.** TECH mode is monochrome (accent = foreground). VISUAL mode adds only physically motivated color: 532 nm green accent, IR false color for 1550 nm values, white-light interference colors, provenance grades.
11. **No motion in TECH.** Effects exist only in VISUAL and are listed in DevLog-003 "Modes"; `prefers-reduced-motion` turns all of them off (colors stay).
12. **Copy.** A dictionary-style definition block (bold term, em dash, two sentences); everything else is tables, labels, and control instructions. No subtitles, no slogans, no statements about the site itself.

### Do not copy
- Univers, TX-02 / Berkeley Mono, the arrow font, logos, the swatch-strip logo motif, project marks, text, or the light-only palette.
- The red active dot (our active state is inversion).
- Blurred tooltip shadow (we keep every shadow hard).
- 840 px measure for the landing (too narrow for figure + table side by side).

## 3. Interface contract for lane D2

- Tokens unchanged: `--bg --bg2 --fg --fg2 --fg3 --rule --rule2 --acc --acc-dim --link --shg --ir --gold --nb --mono --serif`; added `--bg0` (desk), `--bg3`, `--sans`, `--cond`, `--hud` (text on the always-black stage).
- `html[data-mode="tech|visual"]`, `html[data-theme="dark|light"]`, `html[data-fx="on|off"]` (effects: visual and not reduced motion). Style color with `[data-mode="visual"]`, motion/texture with `[data-fx="on"]`.
- `window.LNUI`: `mode()`, `visual()` (VISUAL mode, for color maps), `fx()` (effects allowed), `paintUnits()`. Event `ln-mode` on `window` after any mode or theme change.
- Masthead markup (copy into chapter pages):

```html
<header class="mast">
  <div class="row">
    <a class="brand" href="index.html"><canvas id="logo" aria-hidden="true"></canvas><b>lithium niobate</b><span>LiNbO<sub>3</sub></span></a>
    <div class="tools">
      <div class="seg mode" role="group" aria-label="Display mode"><button data-m="tech">TECH</button><button data-m="visual">VISUAL</button></div>
      <button class="iconbtn" id="theme-btn" aria-label="Toggle light or dark theme"></button>
    </div>
  </div>
  <div class="band" data-pop="qpm"><span class="qpm-lab"></span></div>
  <nav class="nav" aria-label="Chapters">...</nav>
</header>
```

- Section head: `<div class="sh"><h2 class="biref">Title</h2><span class="meta">...</span></div>`. Tables: `table.spec`, `table.idx` (boxed), `table.log` (log). Badges: `.b` plus `.p` (P), `.pc` (P-comp, P-db), `.d` (derived), `.t` (template), `.r` (reported), `.s` (S), `.u` (U).

## Progress log

- 2026-10-25 Reference read (HTML, PDF pages 1-3, main stylesheet split to 1901 rules); facts and rules written.
- 2026-10-25 Implemented: `styles.css` (sheet, one heading size, Plex Sans/Mono/Condensed, boxed and log tables, SKU badges, inverted controls, hard-shadow popups, `data-fx` gating), `app.js` (mode/theme/fx state with URL params and localStorage, popups with focus/tap/Esc, spine, effects, bias meter on T = cos^2(phi/2), wafer site map, logo), `index.html` (definition, specification table with sourced popups, Data record beside it to balance the Fig. 0 column, Fig. 0 conoscope with readout row, Index, Instruments, Chronology, Platforms no-data line, footer).
- 2026-10-25 Bug fixed in the old `app.js`: it tested `window.LN`, but `const LN` in `ln.js` is a global lexical binding, not a `window` property, so the logo, favicon, and QPM label never rendered. Now `typeof LN !== "undefined"`. `ln.js` unchanged.
- 2026-10-25 Verified with headless Chrome: 1440 px TECH dark, VISUAL dark, TECH light; 390 px via same-origin iframe (document scrollWidth 390, tables scroll inside `.scrollx`); keyboard focus opens the n_o/n_e popup with live values at 632.8, 1064, 1550 nm.
