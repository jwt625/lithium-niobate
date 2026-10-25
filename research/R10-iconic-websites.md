# R10: Iconic websites, design and technical teardown

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R10 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Method | Page source and asset inspection (curl, one or two requests per site), public GitHub repos (file trees, `package.json`, file headers), authors' own write-ups. Stack claims are only made where source, repo, or author write-up shows them. |
| Evidence tags | **[src]** page source / served asset, **[repo]** public repository, **[author]** author's own write-up, **[3p]** third-party or search snippet (lower confidence), **[inf]** my inference |

Contents: 1. Deep teardowns (ciechanow.ski, bruno-simon.com 2019 and 2025, gwern.net). 2. Survey of 24 more sites. 3. Patterns. 4. 2026 tech stack implications. 5. Website implications for lithium-niobate.com.

---

## 1. Deep teardowns

### 1.1 ciechanow.ski (Bartosz Ciechanowski)

| Aspect | Finding | Evidence |
|---|---|---|
| Format | Long single-page articles on one physical/engineering system (Moon, Airfoil, Bicycle, Sound, Mechanical Watch, GPS, Cameras and Lenses, ...). Tagline meta: "Interactive articles about science and engineering." | [src] https://ciechanow.ski/ |
| Cadence | Archive: 2019: 5 articles, 2020: 3, 2021: 3, 2022: 3, 2023: 1 (Bicycle, 2023-03-28), 2024: 2 (Airfoil 2024-02-27, Moon 2024-12-17). No new article listed between 2024-12-17 and 2026-10-24. Earlier 2014 iOS-era posts listed separately. | [src] https://ciechanow.ski/archives/ |
| Authoring time | No author statement found on process time. Inter-article gaps are 3 to 10 months (2019 to 2022), longer since. A search snippet attributes "weekend hobby ... a few articles per year" to his Patreon page; the Patreon page fetched 2026-10-24 only showed "creating interactive articles", 547 paid members, "Starting at $3 /article". Treat as unverified. | [src] archive; [3p] snippet |
| Funding | Patreon per-article (link on every page). No ads; Google Analytics tag present. | [src] |
| Rendering stack | Hand-written JavaScript, no framework or library. Each article ships `/js/base.js` (34 KB, shared) plus one article script (`/js/moon.js`, 551 KB raw, 85 KB gzip, ~16k lines). Pattern inside `moon.js`: one `GLDrawer` creates a single WebGL1 context (`getContext('experimental-webgl', {antialias:true, stencil:true})`), and each figure's `Drawer` owns a plain 2D canvas that receives `ctx.drawImage(gl.finish(), ...)`. That is: one shared offscreen GL context renders every 3D figure, blitted into per-figure 2D canvases, so dozens of figures never exceed browser WebGL-context limits. | [src] https://ciechanow.ski/js/moon.js |
| Lazy activation | `IntersectionObserver` with `rootMargin: "300px"` toggles `drawer.set_visible()`; only visible figures animate. A scroll listener picks the best-placed active container when several are in view. | [src] moon.js |
| Controls | Custom slider divs (`long_slider`, `slider_date`, `slider_time`, `slider_camera`, `time_scrub`), drag-to-rotate cameras, touch handled (`touchstart` in base.js, `matchMedia("(pointer:coarse)")`). | [src] |
| Units toggle | Classes `metric_word` / `imperial_word` / `unit_switch` throughout prose and figures: a global metric/imperial switch rewrites numbers in text and drawings. | [src] home HTML |
| Personalization | Moon article seeds observer location (default lat/lon near Cupertino) and can query `geolocation`; uses `localStorage`; start date = visit date. Ephemeris shipped as binary `/models/moon_eph.dat` (1.04 MB). | [src] |
| Page weight (Moon) | HTML 164 KB + base.js 34 KB + moon.js 85 KB gzip + ephemeris 1.04 MB + textures (not measured). Text is server-rendered HTML; figures are injected by JS. | [src] curl sizes 2026-10-24 |
| Typography | Inter (body), IBM Plex Sans (some UI), Menlo stack for code. Single light theme; no `prefers-color-scheme` or `prefers-reduced-motion` found in `base.css` or the article HTML. | [src] base.css |
| Accessibility | No `aria-*`, `role=`, `tabindex`, or `keydown` hits in base.js/moon.js: sliders appear pointer/touch-only. | [src] grep; [inf] |
| Hosting | nginx on Ubuntu (self-hosted), gzip. | [src] response headers |
| Structure per article | Opening manipulable demo, first-principles build-up, "Further Reading", "Final Words", Patreon call. Inline Wikipedia and paper links (arXiv, ADS). | [src] |

Transferable: one shared GL context blitted into many 2D canvases; IntersectionObserver gating; global unit switch (for LN: nm / THz / eV, pm/V vs m/V); first figure is the hook; plain HTML prose that survives without JS. Not to copy: no dark mode, no keyboard access, no reduced motion.

### 1.2 bruno-simon.com (Bruno Simon), 2019 and 2025

| Aspect | 2019 folio | 2025 folio (live at bruno-simon.com) |
|---|---|---|
| Repo | https://github.com/brunosimon/folio-2019 , MIT, created 2019-07-13, 4,750 stars [repo] | https://github.com/brunosimon/folio-2025 , MIT, created 2024-10-12, last push 2026-04-07, 1,979 stars [repo] |
| Concept | Drive a small car around an isometric world; sections are areas | Same core idea (drive a vehicle through a world), expanded: areas for projects, career, lab, achievements, bowling, circuit with leaderboard, altar, "time machine", toilet, cookie, behind-the-scenes [repo `sources/Game/World/Areas/`] |
| 3D | three ^0.164.1 (current package.json; repo migrated to Vite in 2024) [repo] | three ^0.183.2 via `three/webgpu` and TSL (`three/tsl`): `new THREE.WebGPURenderer({ forceWebGL: false, ... })`, bloom and a custom "cheapDOF" pass in a `RenderPipeline`; optional three.js Inspector via `#inspector` hash [repo `Rendering.js`] |
| Renderer fallback | WebGL only | Options panel exposes "Renderer: WebGPU ... Best for performance" toggle [src bruno-simon.com HTML]; three's WebGPURenderer falls back to its WebGL2 backend when WebGPU is absent [inf from `forceWebGL:false` plus Options toggle] |
| Physics | cannon ^0.6.2 (Cannon.js) [repo] | @dimforge/rapier3d ^0.17.3 (Rapier, WASM; `vite-plugin-wasm`, `vite-plugin-top-level-await`) [repo] |
| Materials / lighting | Matcap materials (`Materials/Matcap.js`, 19 matcap files such as `beige.png`, `emeraldGreen.png`), baked floor shadow texture (`floorShadow.png`) plus custom shadow shaders, glow and blur passes [repo tree] | Shared color palette texture (`palette.png`, set in code), real shadow maps (reduced on mobile), bloom, DOF, procedural grass/foliage/water/weather/day and year cycles [repo tree; author] |
| Blender workflow | Models exported from Blender (`resources/3d`) [repo] | Whole world built in Blender; object-name conventions drive code: names with "ref" + "Physical" become physics bodies; Empties mark collision shapes, respawn points, area bounds [author, Awwwards case study 2026-03-11] |
| Asset pipeline | Plain GLB/PNG | `npm run compress`: gltf-transform + KTX-Software, embedded textures to ETC1S (`--quality 255`), PNG/JPG to ETC1S, UI images to WebP; originals preserved [repo readme]. Author also cites UASTC and Draco quantization [author]. Repo: 32 `*-compressed.glb` totaling 1.09 MB; 88 `.ktx` files totaling 3.2 MB [repo sizes] |
| Loading | Single loader with progress | `<link rel="preload" as="fetch">` for a few critical GLB/KTX files in `index.html` [src]; `ResourcesLoader.js`, `PreRenderer.js` [repo] |
| Perf techniques | Matcaps (no lights), baked shadows | Instancing, frustum culling, merged geometry, hidden-face removal, shared palette, looping grass [author] |
| Mobile | Touch controls (`src/images/mobile/` arrows) [repo] | `Quality.js`: UA regex `/Mobi|Android|iPhone|iPad|iPod/` sets level 1 (water blur and DOF off, smaller shadow maps); joystick (`Inputs/Nipple.js`), gamepad, wheel inputs [repo; author] |
| Sound | howler ^2.2.4 [repo] | howler; three CC0 music tracks by Kounine; spatialized object sounds; engine and tire sounds; GarageBand projects committed under `resources/sounds/` [repo; author] |
| Social / server | none | Optional WebSocket (`VITE_SERVER_URL`, msgpack) for shared state: "Whispers" (messages left in the world, up to 30, moderated with OpenAI's moderation model), global cookie counter, daily circuit leaderboard; players do not share physics [repo `Server.js`; author] |
| Delight | `EasterEggs.js` [repo] | `KonamiCode.js`, `Easter.js`, `BlackFriday/`, `Achievements.js`, confetti, explosive crates, tornado, "I'm stuck!" respawn button, "Reset" objects [repo; src] |
| UI chrome | dat.gui debug | Tweakpane debug panel, Options modal (Audio, Quality, Renderer, Server), controls cheat-sheet per input type [src] |
| Effort | n/a | "a little over a year"; built in public as a YouTube devlog series [author]. Devlog count and award claims (FWA) only from search snippets [3p] |
| Write-ups | Medium case study (https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b ; returned HTTP 403 to fetch, not read) | Awwwards case study https://www.awwwards.com/brunos-portfolio-case-study.html [author] |

Transferable: Blender object-name conventions as the content API between artist and code; ETC1S/KTX2 + quantized GLB keeps an entire world near 1 MB of geometry; explicit Quality and Renderer toggles in an Options panel; "I'm stuck" escape hatch; physics as play rather than simulation. Not to copy: game-only navigation (content locked behind driving), UA-sniffing for quality (prefer capability probing), no non-3D content path in the HTML.

### 1.3 gwern.net (Gwern Branwen; front-end largely by Said Achmiz)

| Aspect | Finding | Evidence |
|---|---|---|
| Build | Static site "compiled via Hakyll from Pandoc Markdown"; dedicated server; Cloudflare in front; backlinks computed by nightly cron | [author] https://gwern.net/design |
| Repo | https://github.com/gwern/gwern.net , created 2020-10-31, pushed 2026-10-20; no top-level LICENSE file; CONTRIBUTING: contributions take "the same terms as the file they modify", generally CC-0, "MIT where CC-0 is legally problematic"; site content not covered by the repo | [repo] |
| Per-file licenses | `popups.js` header: original by Lukas Mathis (2010-04-20), public domain ("No attribution is necessary"); `extracts.js`: authors Said Achmiz, Shawn Presser (mobile, YouTube), "license: MIT (derivative of footnotes.js, which is PD)"; `sidenotes.js`: Said Achmiz, MIT; `dark-mode.js`: Said Achmiz, PD; `paper-marble.js`: CC-0 (vendored html-to-image MIT); design page credits image-focus.js as GPL | [repo file headers]; [author] |
| JS size | `popups.js` 94 KB, `extracts.js` 38 KB + `extracts-content.js` 51 KB, `transclude.js` 96 KB, `sidenotes.js` 51 KB, `rewrite.js` 185 KB, bundled `script-GENERATED.js` 905 KB raw. Not minified on purpose (Brotli makes minification marginal) | [repo]; [author] |
| Popups | Hover links open annotation popups (title/author/date/abstract), recursive (popups inside popups), draggable, resizable, pinnable, full-screen; `popupTriggerDelay: 750` ms; on mobile, tap opens "popovers" instead; users can disable popups in the theme toggle | [repo popups.js config]; [author] |
| Annotation source | Annotations are generated at build time by `LinkMetadata.hs` (arXiv, bioRxiv, Wikipedia, PDFs, hand-written); client transcludes lazily | [repo extracts.js header]; [author] |
| Sidenotes | Margin sidenotes on wide windows, floating footnotes fallback; long notes partially collapsed; layout re-flows on resize. Inspired by Tufte CSS | [repo sidenotes.js header]; [author] |
| Margin notes | Short paragraph summaries in left margin (inline italics on mobile) | [author] |
| Link icons | Hundreds of icons by filetype, domain, topic, author; fraktur "G" for internal essays; arrows for within-page links; three underline styles (plain, live-link preview, annotated) | [author] |
| Dark mode | Three-way toggle (auto / light / dark); images inverted only if classified invertible (InvertOrNot.com classifier, `.invert-auto` / `.invert` classes); inversion removed on hover | [repo dark-mode.js]; [author] |
| Reader mode | Strips link icons and underlines | [author] |
| Typography | Grayscale palette; self-hosted subset Source Serif/Sans; IBM Plex Mono (slashed zero); Quivira for icons; dropcaps, smallcaps; Hyphenopoly; fonts ~0.5 MB on heavy pages, non-blocking | [author]; [repo js list] |
| Math | MathJax pre-rendered to HTML at build, no client JS for math; load "from over 5 seconds to <0.5s" | [author] |
| Metadata | Status, confidence, importance (0 to 10) per page; annotated link bibliography; embedding-based "similar links" | [author] |
| No-JS | Core reading works without JS (usable in elinks) | [author] |
| Whimsy | `special-occasions.js` (seasonal theming), `paper-marble.js` (idle "screensaver" that marbles the page in historical marbled-paper palettes), 404-guesser | [repo] |
| llms.txt | `/llms.txt` 301-redirects to `/index` (none served) | [src] 2026-10-24 |

Transferable: build-time annotation database + lazy client transclusion; per-link affordance (underline style tells you whether hover will preview); recursive popups for glossary chains; three-way theme toggle with per-image invert policy; epistemic status per page; idle-time whimsy that never blocks reading. Reuse: code is PD/MIT/CC-0 per file, so reuse is legally possible with attribution, but it is coupled to Hakyll annotations and transclude.js [inf]; a small reimplementation on the native Popover API / CSS anchor positioning (Section 4) is simpler.

---

## 2. Survey (24 sites, URLs checked 2026-10-24)

HTTP status from one GET with a research user agent. 403 = server responded but blocked the automated request; content not inspected.

| # | Site | URL (status) | Stack evidence | Transferable idea(s) |
|---|---|---|---|---|
| 1 | Distill | https://distill.pub/ (200) | Web-component template, Apache-2.0, https://github.com/distillpub/template [repo]; MathJax/KaTeX; BibTeX in `<script type="text/bibliography">` [author guide] | (a) Layout grid classes `l-body`, `l-middle`, `l-page`, `l-screen`, `l-gutter` give figures named widths beyond the text column. (b) Hover citations and footnotes. (c) Cost warning: hiatus post 2021-07-02: "the primary bottleneck is the amount of effort it takes to produce these articles"; editors gave 50+ hours per article https://distill.pub/2021/distill-hiatus/ |
| 2 | Red Blob Games (Amit Patel) | https://www.redblobgames.com/ (200) | D3 v4 + SVG + plain JS on the making-of page [author] | Build order: static diagram, then algorithm output, then draggable inputs, then step-split explanation, then polish; separate inputs from outputs; enlarged invisible hit areas behind handles; "easier to keep the hack" than abstract early. https://www.redblobgames.com/making-of/line-drawing/ (2017-05-15, updated 2026-09-29) |
| 3 | Nicky Case | https://ncase.me/ (200) | `ncase/trust` repo CC0-1.0 [repo] | (a) All work under CC0 public-domain waiver [src]. (b) "Nutshell": expandable, embeddable, recursive inline explanations that can transclude headings from other pages, https://ncase.me/nutshell/ (200). (c) Play-first framing ("shtuff you can play"). |
| 4 | Explorable Explanations hub | https://explorabl.es/ (200) | Static, JS-loaded; noscript note "no tracking code" [src] | Curated hub with a manifesto ("learning through play"); an LN site could list external LN/optics explorables as a mini-hub. |
| 5 | Bret Victor, Explorable Explanations | https://worrydream.com/ExplorableExplanations/ (200) | Tangle.js [author] | Three ideas (2011-03-10): reactive documents (reader changes an assumption, numbers in prose update), explorable examples, contextual information. Also https://worrydream.com/LadderOfAbstraction/ (200). |
| 6 | acko.net (Steven Wittens) | https://acko.net/ (200) | MathBox (WebGL), MIT, https://github.com/unconed/mathbox [repo]; "Diagrams powered by MathBox" [src] | Presentation-quality math animation tied to prose; dismissable "no WebGL" notice is the only fallback (avoid). https://acko.net/blog/how-to-fold-a-julia-fractal/ (2013-01-05) |
| 7 | Seeing Theory | https://seeing-theory.brown.edu/ (200) | D3.js ("designed using Mike Bostock's JavaScript library D3.js") [src] | Six chapters as colored tiles, each with three sub-sections: a visual table of contents that is itself the hook. Daniel Kunin et al., Brown. |
| 8 | The Book of Shaders | https://thebookofshaders.com/ (200) | `GlslCanvas.js`, `glslEditor.js`, `glslGallery.js` [src]; "All rights reserved" (c) 2015 Patricio Gonzalez Vivo [src] | Live-editable code beside a running canvas; for LN: editable Sellmeier/phase-matching formula beside its plot. |
| 9 | Josh W. Comeau | https://www.joshwcomeau.com/ (200) | Next.js 15 App Router, React 19 RSC, MDX 3, Linaria (zero-runtime CSS), Shiki at build, MongoDB for likes, Algolia search [author post 2024-09-24, updated 2026-10-20] | Micro-interactions (like button up to 16 clicks, rainbow bending toward cursor, icon stretch on hover), View Transitions between pages, "Disable sounds" and dark-mode controls in footer. Note: PartyKit shared rainbow broke when that service shut down (2026-10): avoid third-party realtime dependencies on a static site. https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/ |
| 10 | Maggie Appleton | https://maggieappleton.com/ (200) | Astro (`data-astro`, `_astro/`) [src]; `prefers-reduced-motion` present [src] | Growth-stage badges (seedling / budding / evergreen) signal completeness; topographic not chronological organization. https://maggieappleton.com/garden-history |
| 11 | The Pudding | https://pudding.cool/ (200) | SvelteKit (`_app/immutable`, `__sveltekit`) [src]; MIT starter https://github.com/the-pudding/svelte-starter : static builds, ArchieML from Google Docs, `Scrolly.svelte`, `MotionToggle.svelte`, `DarkModeToggle`, Slider, Range, Tip, Layercake [repo] | Closest production precedent for the author's default stack: SvelteKit static output for scrollytelling at scale, with an explicit motion toggle component. |
| 12 | Mathigon | https://mathigon.org/ (200) | Custom bundles (`home.*.js`) [src]; https://github.com/mathigon/textbooks (no license field) [repo] | Progressive reveal: "To reveal more content, you have to complete all the activities" plus a "Reveal all steps" escape; glossary side panel; tutor character. Polypad https://polypad.org/ redirects to polypad.amplify.com (200). |
| 13 | Falstad simulators | https://www.falstad.com/circuit/ (200) | Original Java, JavaScript port credited to Iain Sharp; GitHub repo linked [src] | Decades-durable single-purpose simulators with shareable state URLs [inf]; related: https://www.falstad.com/ripple/ (200), index at falstad.com/mathphysics.html. |
| 14 | Ray Optics Simulator | https://phydemo.app/ray-optics/ (200) | jQuery + Bootstrap [src]; Apache-2.0, https://github.com/ricktu288/ray-optics [repo] | Open-source 2D optics sandbox with gallery of scenes: embeddable precedent for free-space optics demos (and a license that permits reuse). |
| 15 | PhET | https://phet.colorado.edu/ (200) | HTML5 sims; scene graph `phetsims/scenery` MIT [repo] | Accessibility gold standard: keyboard alternative input, sonification, interactive description via a parallel DOM for screen readers, voicing, pan and zoom [3p: snow.idrc.ocadu.ca, PhET write-ups]. |
| 16 | Complexity Explorables (Dirk Brockmann) | https://www.complexity-explorables.org/ (200) | not stated | Catalog browsable by field and topic tags; each explorable has a short teaser; CC BY 2.0 DE [src]. |
| 17 | Quantum Country (Matuschak, Nielsen) | https://quantum.country/ (200) | React chunk bundles [src] | "Mnemonic medium": review prompts embedded in the essay so readers retain it [src tagline; mechanism per authors' essays, not re-read here]. For LN: optional "remember this" cards for key numbers (r33, bandgap, Curie temperature). |
| 18 | Setosa Explained Visually | https://setosa.io/ev/ (200) | not inspected | Short single-concept explainers; one idea per page. |
| 19 | Tufte CSS | https://edwardtufte.github.io/tufte-css/ (repo https://github.com/edwardtufte/tufte-css , MIT) | CSS only [repo] | Sidenote and margin-figure CSS that degrades to toggles on mobile; lineage of gwern sidenotes. |
| 20 | Kurzgesagt | https://kurzgesagt.org/ (200) | Next.js (`__NEXT_DATA__`) [src] | One consistent illustration system across every page and product [inf]. |
| 21 | NASA's Eyes | https://eyes.nasa.gov/ redirects to https://science.nasa.gov/eyes/ (200) | browser 3D apps [src] | Time scrubbing as the primary control (solar system 1950 to 2050); real data in 3D. For LN: a time slider through LN history and a wafer-size or loss-figure timeline. |
| 22 | Google Arts & Culture | https://artsandculture.google.com/ (200) | not inspected | Museum formats: "Online Exhibit" stories, "Click on the dots to zoom into the details" deep-zoom images, Street View virtual tours, themed collections [src]. For LN: deep-zoom SEM/optical micrographs with hotspot annotations. |
| 23 | NYT "Snow Fall" | https://www.nytimes.com/projects/2012/snow-fall/index.html (200 via curl; WebFetch blocked) | page meta `pdate` 20121121; John Branch [src] | Canonical scrollytelling: full-bleed media interleaved with long text. |
| 24 | periodictable.com (Theodore Gray) | https://periodictable.com/Elements/003/index.html (200, Lithium page) | static HTML, Google CSE [src] | Element page = gallery of real samples, each with "Larger", "Spin", "3D" views and provenance metadata (source, acquired date, price, purity), first-person anecdotes, black/white/gray background switch, links to full technical data. Direct template for an LN "specimen cabinet" (boules, wafers, chips, PPLN). |

Also checked: single-material sites https://graphene-flagship.eu/ (200) and https://copper.org/ (200) are institutional/industry portals, not inspected in depth; https://refractiveindex.info/?shelf=main&book=LiNbO3&page=Zelmon-e (200) is the de facto open optical-constants database including LN (relevant to R06 data endpoints). https://neal.fun/ and https://neal.fun/deep-sea/ returned 403 (bot protection); not inspected, so no claims made. https://www.cmog.org/ and https://www.si.edu/exhibitions/online returned 403. https://www.r2d3.us/visual-intro-to-machine-learning-part-1/ returned 522 (origin down) on 2026-10-24.

---

## 3. Patterns

| Pattern | Best exemplars | Mechanism | Notes for LN |
|---|---|---|---|
| Progressive disclosure (hero, chapter, deep dive) | Seeing Theory tiles; Mathigon locked steps + "Reveal all"; Nutshell inline expansion; gwern collapses | Layered pages, inline expanders, recursive popups | Three layers: hero (no jargon), chapter (one effect per page with one explorable), deep dive (equations, tensors, data, citations). Never lock content (Mathigon-style gating annoys experts); always offer "show all". |
| First-10-seconds hook | ciechanow.ski (manipulable figure at top); Bruno (car already drivable); Seeing Theory (tiles) | Something moves or responds before any reading | Hero object that responds to cursor/touch within 1 s, with a static poster image painted first. |
| Hover previews | gwern (750 ms delay, recursive, pin, drag); Distill hover citations; Wikipedia Page Previews (cited in extracts.js) | Build-time metadata, lazy client fetch | Glossary and citation popups from a build-time JSON; distinct underline style for "previewable" links. |
| Sidenotes / margin | gwern, Tufte CSS, Distill `l-gutter` | Margin column on wide screens, inline toggle on narrow | Expert asides ("in x-cut TFLN, use r33 with TE modes") in the margin, out of the lay reader's path. |
| Scroll-driven animation | Snow Fall; Pudding `Scrolly.svelte` | IntersectionObserver step triggers or CSS `animation-timeline` | Use sparingly: for narrative (history, fab process flow), not for explorables (readers need to stop and play). |
| Explorable sliders | ciechanow.ski; Bret Victor reactive documents; Red Blob | Inputs separate from outputs; drag handles; numbers in prose update | Voltage, wavelength, poling period, cut, temperature sliders; prose numbers update live (reactive documents). |
| Global unit switch | ciechanow.ski metric/imperial | CSS class swap across text and figures | nm / um / THz / eV; pm/V; dB/cm vs dB/m. |
| Easter eggs | Bruno (`KonamiCode.js`, achievements); gwern special occasions, paper-marble | Hidden triggers, date-based theming, idle toys | LN-themed: Konami toggles a "poled" inverted palette; idle screensaver grows ferroelectric domains; anniversaries in LN history (dates from R07). |
| Personal voice | periodictable.com anecdotes; ciechanow.ski "Final Words"; Comeau | First-person asides, dated | Author's lab anecdotes (public-safe), "why I love this crystal". |
| Delight details | Comeau (sound, micro-interactions, View Transitions); Bruno (sound design, confetti) | Small, optional, togglable | Optional soft sounds (click of a slider detent), cursor that refracts; global sound off by default. |
| Themes | gwern three-way toggle with smart image inversion | `prefers-color-scheme` + manual override persisted | Auto / light / dark; plots re-render with theme tokens, not CSS invert. |
| Status / confidence | gwern confidence + importance; Maggie growth stages | Per-page metadata badges | "Last verified YYYY-MM-DD", depth level (lay / grad / expert), source count. |
| Perf budget | gwern no-JS core; ciechanow.ski 85 KB gzip JS per article; Bruno ~1.1 MB compressed GLB for a full world | Static HTML first, lazy heavy assets | See Section 5 budget. |
| Accessibility | PhET (parallel DOM, sonification, keyboard); Pudding MotionToggle; Maggie reduced-motion CSS | Native inputs, `aria-valuetext`, motion toggle | Gaps in the iconic sites (ciechanow.ski no keyboard; Bruno game-only) are where LN site can be better. |
| Mobile | gwern popovers on tap; Bruno quality preset and joystick; Tufte inline sidenotes | Tap-to-preview, reduced effects | Capability-probe (WebGPU adapter, `deviceMemory`, frame-time sampling) rather than UA regex. |
| Licensing generosity | Nicky Case CC0; gwern PD/MIT/CC-0; Red Blob making-of; Ray Optics Apache-2.0 | Open code and content | Matches "lift the floor for everyone": open data (CC BY or CC0) and MIT code. |

---

## 4. Tech stack implications for 2026

### 4.1 Site framework

| Option | Evidence | Fit |
|---|---|---|
| SvelteKit + `adapter-static` + TS + Vite + pnpm (author default) | The Pudding ships production scrollytelling with SvelteKit static builds [src, repo]; sveltejs/kit MIT, active (pushed 2026-10-24) [repo]; svelte.dev serves `/llms.txt` (200 text/plain) [src] | Recommended. Explorables are naturally Svelte components; prerender every route to HTML; hydrate only what needs it. |
| Astro islands | Maggie Appleton uses Astro [src]; Cloudflare acquired The Astro Technology Company 2026-01-16, pledged to keep it open source [Business Wire via search] | Strong for content-heavy sites (zero JS by default, can host Svelte islands). Viable alternative if pages are mostly prose. |
| Plain HTML + hand JS | ciechanow.ski, Fabien Sanglard (https://fabiensanglard.net/ homepage 23.6 KB, no framework fingerprint) [src] | Maximum durability, but no component reuse across many explorables. |
| Next.js / React | Comeau, Kurzgesagt [src] | Works, but outside the author's stack; no advantage here. |

### 4.2 3D and GPU

| Item | Status (with source) | Implication |
|---|---|---|
| WebGPU | Chrome/Edge 113+ desktop; Chrome Android 121+ (Android 12+, Qualcomm/ARM GPUs); Firefox 141 (Windows), 145 (macOS ARM); Safari 26 (macOS/iOS/iPadOS/visionOS 26); Firefox Linux/Android in progress [web.dev "WebGPU is now supported in major browsers", via search] | Write shaders in TSL and use `three/webgpu` WebGPURenderer with automatic WebGL2 fallback (Bruno 2025 pattern). Never require WebGPU. |
| three.js | r183 in Bruno 2025 [repo]; threejs.org serves `/llms.txt` [src] | Default 3D engine. |
| Threlte | Svelte 3D framework, MIT, active (pushed 2026-10-21); packages `@threlte/core`, `@threlte/extras`, `@threlte/rapier`, `@threlte/gltf`, Theatre.js integration [repo; threlte.xyz] | Good for declarative scenes inside Svelte; for the ciechanow.ski shared-context trick (many small figures), a plain three.js singleton renderer blitting into figure canvases is simpler [inf]. |
| Physics | Rapier (WASM) in Bruno 2025 [repo] | Only if a physics toy is in scope (e.g., tossing wafers). Adds a WASM payload. |
| Assets | gltf-transform + KTX2 ETC1S/UASTC + Draco/quantization [repo; author] | Directly reusable with the author's Blender workflow (R05). |

### 4.3 Text, math, popups, search

| Item | Status | Implication |
|---|---|---|
| Math | KaTeX MIT, active [repo]; gwern pre-renders MathJax at build, "<0.5s" vs ">5 seconds" [author]; Distill supports both [author guide] | Render math at build (KaTeX server-side) so pages carry no math JS. MathJax 4 status not verified (search budget exhausted). |
| Native popups | Popover API: "Baseline 2025: Newly available" [MDN]; CSS anchor positioning Baseline newly available 2026-01 (Chrome 125, Firefox 147, Safari 26) [web.dev Jan 2026 roundup, via search]; `interestfor` hover invokers documented on MDN, browser status not verified | Popups can be `popover` + anchor positioning with a small JS hover/focus controller; feature-detect and fall back to Floating UI. |
| Popup libs | Floating UI MIT, active (pushed 2026-10-22) [repo]; Tippy.js archived (repo `archived=true`, last push 2024-05-27) [repo]; gwern popups PD/MIT but coupled to its build [repo] | Use Floating UI for positioning fallback; do not adopt Tippy. |
| Scroll animation | CSS scroll-driven animations: Chrome 115, Safari 26; Firefox stable not confirmed [developer.chrome.com, via search] | Progressive enhancement only; IntersectionObserver for anything essential. |
| Search | Pagefind MIT, "Static low-bandwidth search at scale", active [repo] | Build-time index, works on GitHub Pages. |
| Sidenotes | Tufte CSS MIT [repo]; gwern sidenotes.js MIT [repo] | Small custom Svelte sidenote component is enough. |

### 4.4 AI-accessible structure

| Item | Finding |
|---|---|
| llms.txt | Proposed by Jeremy Howard 2024-09-03; Markdown at `/llms.txt`; H1 required, then blockquote summary, H2 link lists, an "Optional" H2 section; companion Markdown per page at `page.html.md` or `page.md`, discoverable via `rel="alternate" type="text/markdown"` [src https://llmstxt.org/] |
| Adoption among checked sites (2026-10-24) | 200: svelte.dev, threejs.org. 404 or redirect: ciechanow.ski, gwern.net (301 to /index), joshwcomeau.com, maggieappleton.com, pudding.cool, redblobgames.com, bruno-simon.com, distill.pub [src]. None of the iconic personal sites expose AI endpoints: an opening for lithium-niobate.com. |
| OpenGraph | All framework sites carry `og:image`; Bruno uses one static share image with cache-buster `?cb=a` [src]. Generate per-page OG cards at build (title + small render of the page's hero figure). |

### 4.5 Hosting (GitHub Pages)

| Constraint | Source |
|---|---|
| Published site <= 1 GB; deploy timeout 10 min; soft bandwidth 100 GB/month; soft 10 builds/hour (not applied to custom Actions workflows); HTTP 429 when rate-limited | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits |
| Custom response headers not mentioned in the limits doc. GitHub Pages does not let sites set headers such as COOP/COEP, which `SharedArrayBuffer` (multi-threaded WASM) needs [inf, well-known; not stated on that page] | Keep in-browser sims single-threaded or use a service-worker shim; or host on a CDN that supports custom headers if R11 needs threads. |
| Bandwidth budget [inf] | At ~3 MB per full 3D visit, 100 GB/month is ~33,000 heavy visits; a viral day could exceed it. Keep 3D lazy and cache-friendly; consider a CDN in front if traffic spikes. |

### 4.6 Where the author's defaults should bend

| Default | Keep / bend | Reason |
|---|---|---|
| SvelteKit + TS + Vite + pnpm | Keep | Pudding precedent; component reuse for explorables. |
| GitHub Pages | Keep with care | Fine for static; watch header limits (WASM threads) and bandwidth. |
| Dark by default | Bend to auto (`prefers-color-scheme`) with manual three-way toggle | Lay visitors on phones in daylight; gwern shows the three-way pattern. A dark "lab" look can remain the brand for 3D hero and tools. |
| Sharp corners | Keep | Fits a trigonal crystal (faceted, cleaved edges); can be a signature. |
| Dense pro-tool feel | Bend on hero and chapter layers; keep in deep-dive, data, and simulator panels | Lay first impression needs air, large type, one idea per screen; experts get COMSOL/Grafana-grade density 2 clicks down. |
| Minimal text, details in tooltips | Bend partially | Explanatory sites live on prose (ciechanow.ski); use tooltips for glossary/citations, not for core narrative. |
| Plots: data only, no captions | Keep in data/tool layer; allow short captions in chapter layer | Lay readers need a one-line "what you are seeing". |

---

## 5. Website implications for lithium-niobate.com

### 5.1 Ranked principles

1. **Something responds within the first second, with no reading required.** A static poster (AVIF/WebP) paints first; the interactive hero (3D LN crystal or TFLN chip) hydrates after. Precedents: ciechanow.ski opening figure, Bruno's drivable car.
2. **Plain HTML prose first, interactivity as enhancement.** Every page readable with JS off (gwern); every explorable has a static frame + caption fallback. This also serves search engines and LLM crawlers.
3. **Layered depth with no gates.** Hero (lay) -> chapter (one effect, one explorable) -> deep dive (tensor, equations, data, citations) reachable in <= 2 clicks or via inline expansion; "show everything" always available (Mathigon's gate is the anti-pattern; Nutshell, gwern collapses are the pattern).
4. **Hover to learn, never leave the page.** Glossary and citation popups, recursive one level or more, with distinct underline styles for previewable links (gwern); tap-to-preview on mobile.
5. **Few, excellent explorables over many mediocre ones.** Distill and ciechanow.ski show the cost (50+ editor hours per article; 1 to 5 articles per year). Pick 3 to 5 flagship explorables and reuse the author's existing tools (R03).
6. **Be better than the icons on accessibility.** Native `<input type="range">` sliders with `aria-valuetext` including units, keyboard everywhere, `prefers-reduced-motion` honored with a visible motion toggle (Pudding), optional sonification later (PhET).
7. **Performance budget is a design constraint.** Proposed (not measured): initial HTML+CSS+JS <= ~150 KB gzip per page excluding 3D; 3D hero assets <= ~3 MB total, loaded after first paint and only if capability probe passes; each explorable lazy-loaded via IntersectionObserver (ciechanow.ski 300 px margin pattern).
8. **Open by default, machine-readable by default.** `/llms.txt`, `.md` twin for every page, JSON property endpoints with sources and units (R06), CC BY or CC0 data, MIT code (Nicky Case, gwern, Ray Optics precedents). None of the iconic sites do the AI-endpoint part: a differentiator.
9. **Personal voice and visible care.** First-person notes, dated "last verified" stamps, a specimen cabinet with provenance (periodictable.com), status/confidence badges (gwern, Maggie Appleton).
10. **Whimsy that never blocks reading.** Easter eggs, idle toys, seasonal touches are optional and off under reduced motion (gwern paper-marble, special occasions; Bruno Konami code).

### 5.2 Concrete features

| # | Feature | Layer | Precedent | Implementation sketch |
|---|---|---|---|---|
| F1 | Interactive hero: LN boule -> wafer -> TFLN chip zoom, light pulse through a modulator when cursor/touch moves | Hero | Bruno 2025, NASA Eyes | Blender bake, gltf-transform + KTX2 ETC1S, `three/webgpu` + TSL with WebGL2 fallback; poster image first; Quality + Renderer + Motion toggles in an Options popover (Bruno). |
| F2 | Shared-context figure engine | All | ciechanow.ski `GLDrawer` | One three.js renderer offscreen; each figure is a 2D canvas fed by `drawImage`; IntersectionObserver gating; avoids per-figure WebGL contexts. |
| F3 | Flagship explorables (pick 3 to 5): Pockels phase shift and MZI transfer vs voltage; birefringence and crystal cuts (x/z-cut, TE/TM, r33); quasi-phase matching with poling-period slider; optical mode in a TFLN ridge (reuse author's mode tools per R03); domain inversion / poling animation | Chapter | ciechanow.ski, Red Blob build order, Bret Victor reactive docs | Inputs separate from outputs; numbers in prose update live; reset button; shareable state in URL hash. |
| F4 | Global unit switch | All | ciechanow.ski metric/imperial | nm / THz / eV; V*cm vs V*mm for V-pi*L; dB/cm vs dB/m. CSS class swap + store in `localStorage`. |
| F5 | Glossary + citation popups | All | gwern, Distill, Wikipedia Page Previews | Build-time `glossary.json` and `refs.json` (DOI, arXiv); `popover` + anchor positioning, Floating UI fallback; 300 to 750 ms hover delay; recursive; tap on mobile; three underline styles. |
| F6 | Sidenotes for expert asides; inline on narrow screens | Chapter, deep dive | Tufte CSS, gwern | Small Svelte component; no layout shift. |
| F7 | Depth and status badges per page: lay / grad / expert, "last verified YYYY-MM-DD", source count | All | gwern confidence, Maggie growth stages | Front-matter fields rendered as a compact header row. |
| F8 | Specimen cabinet: photographed boules, wafers, PPLN, chips, packaged modulators with Spin/3D views and provenance metadata (public-safe) | Hero-adjacent | periodictable.com Lithium page | Turntable photo sequences or baked GLB; each item links to the physics it illustrates. |
| F9 | Time slider through LN history and technology milestones | Chapter | NASA Eyes time control | Data from R07/R04; one scrubbable timeline; dates ISO. |
| F10 | Deep-zoom micrographs with hotspots (SEM of ridges, domain patterns) | Deep dive | Google Arts & Culture zoom stories | Tiled images (DZI) or single large AVIF with hotspots; captions in popups. |
| F11 | Live-formula panels (Sellmeier, phase matching) editable beside the plot | Deep dive | The Book of Shaders live editor | Safe expression evaluator, not arbitrary JS. |
| F12 | AI and data endpoints | Infrastructure | llmstxt.org; svelte.dev, threejs.org adoption | `/llms.txt`, `/llms-full.txt` (optional), `page.md` twins, `/api/properties.json` (+ CSV), JSON-LD `Dataset`, CORS-friendly static files; every value with units, source DOI, and ISO date (R06). |
| F13 | Search | Infrastructure | Pagefind | Build-time index; keyboard shortcut `/`. |
| F14 | Theme: auto / light / dark, plots re-rendered from tokens; sharp corners as brand | Infrastructure | gwern three-way toggle | Avoid CSS invert on plots; per-image invert policy for diagrams only. |
| F15 | Motion and sound controls | Infrastructure | Pudding MotionToggle, Comeau "Disable sounds" | Reduced motion default from OS; sound off by default. |
| F16 | Thematic decoration (subtle): domain-wall line textures, Li-vacancy dot lattices, three-wave-mixing interference motifs as section dividers | All | gwern dropcaps and marbling, Kurzgesagt consistent style | SVG/CSS patterns, < 5 KB each; coordinate with R12 theme note. |
| F17 | Easter eggs: Konami code flips page into "poled" (inverted-domain) palette; idle screensaver grows ferroelectric domains; "I'm stuck" reset on every explorable | Delight | Bruno `KonamiCode.js`, gwern paper-marble, Bruno respawn | All disabled under reduced motion. |
| F18 | Per-page OG cards generated at build from each page's hero figure | Sharing | Bruno share image, framework sites' `og:image` | Static PNG per route; consistent template. |
| F19 | Mini-hub of external LN/optics explorables and open tools (e.g., Ray Optics Simulator, refractiveindex.info LN entries) | Deep dive | explorabl.es, Complexity Explorables catalog | Curated list with tags; respects licenses (Apache-2.0 tools can be embedded with attribution). |
| F20 | Optional "remember this" cards for key LN numbers | Chapter | Quantum Country mnemonic medium | Low priority; stored locally only. |

### 5.3 Risks and caveats

- Authoring cost dominates (Distill hiatus, ciechanow.ski cadence, Bruno's year). Scope explorables tightly.
- WebGPU coverage is still incomplete on Firefox Linux/Android and older Android; fallback path must be tested, not assumed.
- GitHub Pages: no custom headers (affects threaded WASM sims, R11), 100 GB/month soft bandwidth.
- Hover-only affordances fail on touch; every popup needs a tap path and a full-page link.
- Native anchor positioning is newly Baseline (2026-01); keep the Floating UI fallback for older browsers.

### 5.4 Unverified or not covered

- Bartosz Ciechanowski's own statement on time per article: not found.
- Bruno Simon 2019 Medium case study: HTTP 403, not read; 2025 devlog count and FWA award only from search snippets.
- neal.fun, cmog.org, si.edu online exhibits: 403 to automated fetch; not inspected.
- MathJax 4 release status and `interestfor` browser support: not verified (web search budget exhausted during this track).
- Transfer sizes for Bruno 2025 were inferred from repo file sizes, not measured in a browser.
