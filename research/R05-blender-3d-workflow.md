# R05: Blender and 3D workflow (author meta) and web 3D delivery

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R05 (DevLog-000) |
| Scope | (a) The author's existing Blender workflow and preferences, as meta information only. (b) Best practice for delivering web 3D in 2026. (c) Proposed asset list for lithium-niobate.com |
| Sources, local | Public repo `PlayGround` (github.com/jwt625/PlayGround): `20261002_interconnect_film`, `20261004_direct_3d_from_images`, `20261005_direct_3d_nvidia_switch`, `20261009_pigeon_pluggable`, `20260915_fruit_fly_nn`, `20261001_LN_poling_animation`, `20261001_eo_modulator_atlas` (`data/devices.csv`). Plus generic author practice (workflow meta only) |
| Sources, web | Primary pages, fetched 2026-10-24 (list in Sources) |
| Author | Claude Code (coordinator plus 5 read-only subagents), at Wentao Jiang's request |
| Mode | Read-only. No renders, installs or git writes |

Tags: [F] fact with a source; [D] derived from a sourced number; [P] proposal; [U] unverified. "N/A" means no source was found.

## Top findings

1. **The pipeline already exists in Blender.** The author has a mature, repeatable headless-`bpy` method across at least 4 public projects:
   - Blender 4.2.3 LTS run headless through a slot wrapper.
   - Dimensions in data files, each carrying a provenance grade.
   - One deterministic build script per asset, with JSON sidecars.
   - `.glb` export, checked by re-importing it.

   What is missing is the web half: compression, a three.js runtime, and budgets. No public project has shipped a Blender-built GLB to an interactive web page. The closest is the video-capture viewers in `20261004`/`20261005`.
2. **Glass.** Every real-time Blender path the author used avoids true transmission, because EEVEE Next renders it dark or white. All of them fall back to alpha "ghost glass". Cycles transmission was used only when realism mattered.
   - For LN (n about 2.2, a transparent crystal), this is the central rendering problem. three.js `MeshPhysicalMaterial` handles `ior` up to 2.333, and dispersion since r164 [F]. It cannot represent birefringence [F, by API].
3. **Recommended stack** [P], matching how Bruno Simon builds bruno-simon.com in 2025 [F]:
   - Author in Blender.
   - Export GLB.
   - Run `gltf-transform` with Meshopt or Draco plus KTX2.
   - Render with three.js r186 `three/webgpu` + TSL, with automatic WebGL 2 fallback.
4. **Hero shots of crystals and wafers should be pre-rendered in Cycles** as poster images, turntable video or stacked-alpha video. The interactive layer is lightweight real-time geometry. TFLN is a 0.3 to 0.9 um film on a 500 to 725 um handle, so every real-time device view needs an "illustrative vs true scale" toggle (same rule as R13).
5. **Reuse.** Public, reusable starting points:
   - Build scripts for photonics, packaging and interconnect assets (FAU/V-groove, MT ferrule, OSFP, wafers, PIC dies). The scripts are git-tracked, but the `.blend` files are gitignored, so they must be rebuilt by running the scripts.
   - The LN unit-cell three.js code in `20261001_LN_poling_animation`.
   - Sourced TFLN modulator geometry in the public `eo_modulator_atlas` `devices.csv`.

---

## Part A. The author's Blender workflow (meta)

### A1. Toolchain and invocation

| Item | Value | Source |
|---|---|---|
| Blender installed | 4.2.3 LTS (build date 2024-10-15), macOS app bundle, not on PATH | installed version [F]; all 4 PlayGround projects [F] |
| Newer LTS available | 5.2 LTS (2026-07-14; 5.2.3 on 2026-10-22). 4.5 LTS is supported. 4.2 moved to "previous LTS" (last 4.2.23, 2026-07) | blender.org/download/lts [F] |
| Machine | Apple M4 Pro, Metal | `20261002` DevLog v1 materials note [F] |
| Headless call | `Blender -b --factory-startup --python build_<id>.py -- <out> [k=v ...]`. Scripts parse args after `--` with `sys.argv[sys.argv.index("--")+1:]` | all projects [F] |
| Render a saved file | `Blender -b scene.blend --python render_x.py -- <out_dir> <shots/frames>` | all projects [F] |
| Concurrency | `bslot.sh`: `mkdir` lock dirs under `$TMPDIR`, a pid file per slot, stale slots reclaimed, poll every 2 to 3 s. Default 2 or 3 slots (`BLENDER_SLOTS`), set by the author ("max 3 Blender processes in parallel"). Agents "never kill other Blender processes" | `scripts/bslot.sh` in 4 projects [F] |
| Bundled Python | Blender's Python 3.11 has `tomllib` and numpy but no PyYAML. So parameters are TOML and frames are JSON, not YAML | `20261004` `scripts/model/lib.py` [F]; author practice |
| Outside Blender | Pillow texture generators, ffmpeg and evaluation run via `uv run`, sometimes `uv run --no-project --with pillow ... python -I` | all [F] |

### A2. Scripting patterns

- **One asset, one deterministic builder.** `build_<id>.py` writes:
  - `<id>.blend`
  - `<id>.glb`
  - a `<id>.json` sidecar with keys: `sources`, `dimension_table` (item, value, unit, source, accuracy grade), `hooks`, `material_slots`, `variants_size_mm`, triangle count, `simplifications`, `scene_scale_note`.

  An index is auto-generated (`make_index.py`) [F: `20261002/assets/ASSET_SPEC.md`].
- **No magic numbers.**
  - Dimensions live in `config/model/<group>.toml` in mm, with an inline provenance comment, e.g. `length = 201.4 # outer length ...; fit case_dims2` [F: `20261004`].
  - The rule is "No hard-coded dimensions in code".
  - A last-known-good copy of each group's TOML guards against half-saved edits [F].
  - The same TOML pattern is the author's general practice. Visual exaggerations go in a separate `[exag]` table that is logged in the metadata [F, generic].
- **Provenance grades.** A = spec or published, B = datasheet or measured on a figure against a known scale, C = photo-measured, D or C = estimate with a range [F: `20261009` DevLog-003; `20261002` ASSET_SPEC; author practice].
  - This maps directly to the `reported / derived / template` scheme proposed in R13.
- **Units and frames.**
  - 1 Blender unit (BU) = 1 m at real size, via `mm()` / `um()` helpers.
  - Z up, -Y front. The root origin sits at the bottom centre of the footprint.
  - Micro assets ship a true-size variant plus a scaled variant: `microring_modulator_cell` at x10000, `microring_array_closeup` at x15000 ("1 um = 15 mm") [F: `20261002`].
  - For macro shots the root is scaled x1000 at render time instead of using macro lenses [F: `20261009`].
- **Naming contract.** Collection `ASSET_<id>`, empty `ROOT_<id>`, objects `<id>_<part>`, materials `MAT_<cat>_<name>`, node groups `NG_<name>`, empties `HOOK_<name>`, sub-collections `VARIANT_<name>` and `LOD_high` / `LOD_low`, custom properties `p_*` [F: `20261002`; same scheme in author practice].
  - Helper objects start with `_` and are excluded from scoring [F: `20261004`].
- **Assembly.** `bpy.data.libraries.load(path, link=False)` appends `ASSET_*` collections [F]. Pitfalls:
  - Linked duplicates share actions; fix with `animation_data_clear()`.
  - Hook names collide on append with `.001` suffixes; look hooks up by membership [F: `20261002`].
- **Build-time asserts.**
  - Counts and clearances: `PIN_ASSERT_OK total=60`, `BOND_CLEARANCE_OK bonds=86`, RX ray landing error < 0.1 um [F: `20261009`].
  - Camera BVH clearance check with a 3 mm margin [F].
- **Geometry library helpers:**
  - Accumulator mesh builder (`from_pydata`, per-face material index).
  - Box-projected UVs.
  - Exact booleans, with the cutters deleted afterwards.
  - Angle-limited bevels.
  - Catmull-Rom or NURBS cables (Bezier AUTO handles overshoot and do not refresh under drivers).
  - Geometry Nodes instancers for arrays.

  [F: `20261002` `pl.py`, `pk.py`; `20261004` `lib.py`; author practice]
- **GLB export call** (every project):

  ```python
  export_scene.gltf(export_format="GLB", export_apply=True, export_yup=True, export_extras=True, export_materials="EXPORT")
  ```

  - Custom properties (e.g. per-part `explode` vectors) go out as glTF extras. A Y-up copy `explode_gltf` was added because extras stay in the Blender frame [F: `20261009`].
  - `check_*_glb.py` re-imports into a fresh Blender to check bounds, counts, materials and hooks [F].
- **Iteration and evaluation.** `20261004` and `20261005` fit models to photos (COLMAP cameras, SAM masks) with an eval loop:
  - Metrics: IoU, edge chamfer, PSNR.
  - About 12 s per iteration.
  - Holdout views are locked behind an environment flag.

  The rule "measure first, fit second" and the author's "start with a rough build, and then keep iterating" [F] carry over.

### A3. Asset spec conventions worth copying (`20261002/assets/ASSET_SPEC.md`) [F]

- At most 600k triangles per asset (film use).
- Instancing for arrays.
- Bevels on visible edges.
- No n-gons on curved parts.
- No overlapping coplanar faces.
- Previews: 900x675, EEVEE at 16 samples, front, three-quarter and top views, under about 400 KB each.
- No downloads in build scripts. Procedural or packed textures only, and the `.blend` opens with no missing files.
- No real logos: parody marks only. Every dimension is sourced or flagged as an estimate with a range.
- Each animated part gets its own object and material slot.

### A4. Materials (as used; Principled BSDF throughout so they survive glTF)

| Material | Settings used | Source |
|---|---|---|
| Gold (electrodes, ENIG, bond wires) | Base color (1.0, 0.77, 0.30) or (1.0, 0.72, 0.30), metallic 1, roughness 0.18 to 0.22. Author practice: linear base about (0.84, 0.66, 0.36), roughness 0.22; at 0.30 "gold read as flat peach"; never emissive | `20261002` `pl.py`; `20261009`; author practice |
| Copper | Base color (0.95, 0.52, 0.36), metallic 1, roughness 0.28 to 0.30 | `20261002`; author practice |
| Silicon die / handle | Variants: (0.34, 0.35, 0.38), metallic 0.85, roughness 0.32; dark (0.13, 0.15, 0.22), metallic 0.4, roughness 0.18; `NG_pbr_silicon` "dark polished mirror with a faint view-angle rainbow" (angle ColorRamp) | `20261002`; `20261009` [F] |
| Oxide / cladding | Author practice: dark tinted dielectric, roughness 0.26 to 0.28, Specular IOR Level 0.3 to 0.35, matched to micrograph colour. Film: alpha 0.22 (BOX), 0.05 (cladding). Glossy oxide caused haze, so it was made matte | author practice; `20261002` [F] |
| Glass / fiber | EEVEE: BLENDED alpha 0.22 to 0.45, or dithered alpha. Cycles: transmission 1.0, IOR 1.46 to 1.47, roughness 0.05 to 0.12. TX optics: fused silica IOR 1.447, BK7 1.504. Si lens AR coat as thin film 420 nm. Author practice shows bare fiber as opaque light grey | `20261002`, `20261009`, author practice |
| Thin-film colour | Principled Thin Film (4.2+, Cycles only per manual): pigeon neck 520 nm, IOR 1.6 | `20261009` [F]; Blender 4.2 manual [F] |
| Chip top layout | Layout rasterized with PIL into an albedo PNG plus a packed metal/roughness PNG (G = roughness, B = metallic, Non-Color), planar-mapped and packed; 600 px/mm on a TX PIC | `20261009`; author practice |
| Light / beams | Emission ribbons with a per-vertex `fx_dist` attribute and a node-driven pulse front. On-screen note "* beams invisible (1311 nm); rendered for viewing". Author practice: no beams or glow unless physically meaningful | `20261009`; author practice |
| glTF caveat | Procedural node textures export only as base colour, so image tiles go on box UVs instead. Fades use per-vertex `COLOR_0` alpha, which survives GLB | `20261004`; author practice |

### A5. Lighting and render settings

| Use | Engine and settings | Source |
|---|---|---|
| Film draft | EEVEE Next, 1 to 8 samples, 50% resolution (540x674); "p50" means draft at 50% resolution | `20261002`, `20261009` [F] |
| Film review / standard / hero | EEVEE Next 4 / 24 / 48 samples, 1080x1350 (4:5), 30 fps. Hero adds screen-space ray tracing, fast GI and motion blur. 0.43 / 1.7 / 3.5 to 4.2 s per frame on the M4 Pro, plus 6 to 9 s first-frame shader compile | `20261002` render_presets [F] |
| Hero stills | EEVEE Next, 64 samples, 1600x1200, AgX "Punchy", near-black world, Fog Glow; 1.5 to 5.6 s per still | `20261009` [F] |
| True-mm-scale optics | Cycles, 64 samples plus denoise, max and transmission bounces 24, 1920x1200. Moved to Cycles because EEVEE gave jagged self-shadows at mm scale | `20261009` [F] |
| Print-quality product renders | Cycles on Metal GPU, denoise, `max_bounces` 8, `transparent_max_bounces` 64. 64 to 128 spp for checks, 256 for finals (about 9 s each for a small object). AgX "Medium High Contrast". Transparent film to RGBA PNG at about 2x display size. Dim neutral world at 0.08 | author practice (generic) |
| Photo-fit renders | Workbench flat ID pass plus EEVEE 16 samples with screen-space ray tracing; uniform white world, Standard view transform | `20261004`/`20261005` [F] |
| Light rigs | Area-light studio rig: warm key front-left-above, cool fill, rim, soft top. Scaled to the subject radius and rotating with the camera azimuth. Standard strengths: key 0.3 / fill 0.12 / rim 0.25 / top 0.12, after the defaults blew out light metals. `macro_studio` gradient cyclorama "built for a ~0.3 m subject". Area power set from target irradiance, P = E·π·d². No HDRI anywhere | `20261002`; author practice |
| Delivery encode | PNG frames, then ffmpeg libx264 CRF 16 to 20, yuv420p, `+faststart`, 30 fps constant; AAC; -16 LUFS | all [F] |
| Speed rule | Author: "if the full film is taking 10+ min to render, you are doing it wrong"; "make sure the agents are using the fast render until after v2" | `20261009` DevLog-011 [F] |

### A6. Camera conventions [F]

- Rig: 36 mm sensor, TRACK_TO an empty, default lens 28 mm, range 20 to 55 mm, 85 mm for PIC macro. Product renders use 50 to 100 mm, three-quarter view from above, with every comparison panel in the same camera family.
- Orthographic views are used to match spec or manual figures (pin maps, layouts).
- Eased Bezier camera moves; the author's rule is "no linear motion: ease".
- DOF mostly off. It was keyed only in specific shots after the author's complaint ("why are the assembling and wirebonding scene out of focus/blurred?").
- Exploded views are driven by per-part `explode` vectors: eased explode and unexplode with a constant-speed 360 deg orbit, seamless at the loop point (frame 451 vs 1 differ by 0.004/255).
- Very small subjects need tiny clip starts, e.g. `clip_start` 0.004 to 0.01 m. Float32 precision garbled overlays at x = 1000 to 2000 m.

### A7. The author's preferences (quoted from public DevLogs; generic practice items paraphrased)

| Preference | Evidence |
|---|---|
| Accuracy first: "actual modelings are as accurate and complete as possible" | `20261002` DevLog-003 |
| Faithful components inside a playful form: "It should look like a pigeon, but with various components themselves faithfully modeled"; "the exploded png looks great" | `20261009` DevLog-003 |
| Wants layout detail on chips: "electrical routings, wirebonds (low speed and high speed differential), alignment marks, dummy filling" | `20261009` DevLog-005 |
| Clean labels: "the text label in your preview is horrible. Do not use any fancy color or angle." Fix only what was asked: "I only asked the additional callout txt labels to be removed." | `20261009` DevLog-020 |
| Make the optics visible: "cleanup the black fixtures so that the lens and light path is more visible" | `20261009` DevLog-018 |
| Get the physics right: "resonance dip must point down"; "'GSG bonds PD > TIA' is wrong, should be differential"; "Proper physics for the cable whip" | `20261002` DevLog-004; `20261009` |
| Zoom to the device, not just the connectors: "Zoom closer on the actual OEs" | `20261002` DevLog-004 |
| Iterate rough to fine: "dont get lost in the details. Start with a rough build, and then keep iterating"; "keep iterating at least three versions" | `20261004` DevLog-001; `20261005` DevLog-004 |
| Labels and textures matter: "labels ... should be as important as structural" | `20261004` DevLog-000 |
| Phone legibility (critic finding he acted on): "At phone size the rings cannot be seen" | `20261002` v1 critique |
| General practice (paraphrased): realism over stylization, production photos over CAD renders, at least 3 side-by-side reference rounds, no logos or text inside renders, colour carries meaning, gold must not read as the accent colour, remove what does not carry the story, judge every render composited on its final background | author practice |

### A8. Pitfalls and fixes (directly relevant to LN assets)

| Pitfall | Fix | Source |
|---|---|---|
| Transmission glass renders dark (no ray tracing) or white in EEVEE Next | Alpha "ghost glass" (alpha 0.05 to 0.3 plus facing-ratio edge glow), or Cycles | `20261002`, `20261004`, `20261009` [F] |
| Refractive glass or mirrors become black slabs on a dark world | Ghost glass, or a brighter environment for refraction | `20261009` [F] |
| A solid glass block gives refraction streaks | Opaque substrate plus a thin glass lid | author practice |
| Coincident coplanar faces render black (Cycles) or z-fight | Stagger by tiny offsets; no coplanar overlaps in the spec | author practice; `20261002` [F] |
| Low `transparent_max_bounces` turns stacked transparent tips black | 64 bounces | author practice |
| Stacked per-material alpha looks noisy | Two render passes with holdout, composited in PIL | author practice |
| EEVEE jagged self-shadows at true mm scale | Scale the root x1000 at render time, or use Cycles | `20261009` [F] |
| Depth-precision streaks on a wafer preview | Raise the near clip | `20261002` [F] |
| Mirrored text from die UVs | Mirror the glyphs in image space | `20261009` [F] |
| Smooth shading on a merged block gives blobs | Split parts; triangulate zero-area n-gons before bevelling | author practice |
| Render stamp metadata embeds absolute local paths into PNGs | Disable all `use_stamp_*`; strip PNG text chunks. Important for a public site | author practice |
| PNG-textured GLB was 23 MB | JPEG q90 brought it to 3.4 MB; KTX2 is better still (B3) | `20261004` [F] |
| GLB in m vs app in mm gave knobs about 20x too large | Single unit constant; test bounds in the browser | `20260915` DevLog-008 [F] |
| WebGL ignores `LineBasicMaterial.linewidth` (1 px cables) | Real tube geometry | `20260915` DevLog-008 [F] |
| glTF drops unused materials; hook axes not preserved | Use hook positions only; keep blend-only items out of the web path | `20261009` [F] |
| `Collection.hide_render` is not animatable in 4.2 | Key the objects | `20261002` [F] |

### A9. Public assets that depict photonics hardware

Git status was checked with read-only `git ls-files`. In all film projects, build scripts and DevLogs are tracked, while `*.blend`, `assets/components/`, `outputs/`, PNG and MP4 are gitignored. The only tracked Blender-built binaries are the `20261009` hero GLBs. `PlayGround` has no LICENSE file [F], so reusing it on the new site is the author's own call.

| Asset (builder) | Depicts | Size / data | Tracked | Reuse for LN site |
|---|---|---|---|---|
| `20261002 .../photonics/build_fau_v_groove.py` | Fiber array unit, V-groove, 6 variants plus MT-12 | MT ferrule 6.4 x 2.5 mm, 250 um pitch (audited CONFIRMED) | script | High: fiber attach scene (A09 below) |
| `.../photonics/build_microring_modulator_cell.py`, `..._array_closeup.py` | Si microring modulator cell | 500 x 220 nm rib, 90 nm slab, 180 nm gap (AMF reference); 15k / 156k tris | script | Medium: geometry pattern for an LN ring (restack to LN film) |
| `.../photonics/build_pic_die.py`, `pic_eic_stack`, `grating_coupler_closeup` | PIC die, EIC/PIC stack, grating coupler | PIC 7 x 9 x 0.8 mm (grade C estimate) | script | Medium: die template |
| `.../fab_test/build_wafer_300mm*.py`, `wafer_tape_frame`, `wafer_cassette`, `foup`, `probe_station_cm300_style`, `probe_card` | Wafers and test | SEMI M1 300 mm | script | High: wafer builder, re-parameterized to 100/150/200 mm LN |
| `.../interconnect/build_osfp_module.py`, `qsfp_dd_module`, `mpo_connector_and_adapter`, `fiber_connectors` | Pluggables and connectors | OSFP MSA Rev 5.22: 100.40 x 22.58 x 13.00 mm (audited) | script | Low: application context only |
| `20261009/assets/hero/pigeon_osfp_dr8.glb` | Playful pigeon-shaped 800G OSFP DR8 with faithful TX/RX optics | 19.56 MB, about 382k tris, 98 materials | GLB tracked | Low as an asset (too heavy, off-topic). Proves the "playful shape, faithful parts" style |
| `20261009 .../optics_tx`, `optics_rx` builders | TX PIC, DFB, Si lenses, isolator, prism, RX lenslets, PD, TIA, 25 um Au bonds | RX GLB 68k tris, 3.55 MB | script | Medium: lens, bond-wire and PIC texture techniques |
| `20260915_fruit_fly_nn/assets/generated/hardware-v2/*.glb` (made with trimesh, not Blender) | FC/APC plug, bulkhead, SMA, phase cassette, optical amplifier, collimator | 9 GLBs, 248,804 bytes, 14,608 tris total | GLB tracked | Medium: lightweight web-scale connector reference; three 0.169 |
| `20261001_LN_poling_animation` (three.js r147, vendored) | LN unit cell, lattice, domain inversion | Hsu 1997 CIF (COD 2101845), a = 5.148 Å, c = 13.863 Å | yes | High: direct reuse (R03) |

---

## Part B. Web 3D delivery (2026-10-24)

### B1. Recommended pipeline [P]

```
Blender 4.2.3 (local) or 5.2 LTS ── build_<id>.py ──> <id>.glb (+ <id>.json provenance sidecar)
   └─ gltf-transform optimize --compress meshopt --texture-compress ktx2 (ETC1S colour, UASTC normal/data)
       └─ three.js r186: three/webgpu + TSL (WebGL 2 fallback), KTX2Loader + MeshoptDecoder
           └─ poster PNG/AVIF first; real-time loaded lazily on interaction/visibility
Cycles stills/turntables (same .blend) ──> AVIF posters + H.264/AV1 video, stacked-alpha where compositing
```

Upgrade note [F]: Blender 5.2 LTS is the first manual version that documents `KHR_materials_dispersion` export (via the custom "glTF Material Output" node group, and only with `KHR_materials_volume`) and Meshopt compression in the exporter (https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html). The 4.2 to 5.0 exporters list transmission, volume, ior, specular, clearcoat, sheen, anisotropy and Draco, but not dispersion. Under 4.2, dispersion would have to be set in three.js after load [D].

### B2. Blender to glTF material mapping (manual 5.2) [F]

| Blender | glTF |
|---|---|
| Principled Transmission > 0 | `KHR_materials_transmission`. Manual: "may not be visible behind other transmissive materials" |
| Volume Absorption (Color, Density) on the Output Volume socket, plus transmission | `KHR_materials_volume`: attenuationColor, attenuationDistance = 1/Density. Thickness comes from the glTF Material Output group |
| IOR | `KHR_materials_ior`, exported only together with transmission, volume or specular; 1.5 is omitted |
| Specular IOR Level / Tint | `KHR_materials_specular` |
| Coat | `KHR_materials_clearcoat` |
| Dispersion socket (glTF Material Output group) | `KHR_materials_dispersion` (5.2 LTS) |
| Procedural textures | Not exported (base colour only), so bake them to images |

- Blender's own Principled BSDF manual pages (4.2, 4.5, latest) show no "Dispersion" input [F, text check]. So Cycles hero renders of LN dispersion need a workaround, e.g. separate per-channel IOR shaders [P, technique not verified in the author's work].
- Thin Film is "Cycles Only" in 4.2 [F]. That makes it usable for pre-rendered LNOI wafer interference colour but not for EEVEE or web (needs a custom TSL shader; see the TMM widget in R03).

### B3. Compression

| Tool / format | Facts | Source |
|---|---|---|
| gltf-transform CLI 4.5.1 (2026-09-28) | `optimize` defaults: `--compress meshopt` (alternatives: draco, quantize), `--texture-compress auto` (ktx2, webp, avif), `--texture-size 2048`, plus instance, palette, simplify, prune, weld, join. Docs: "Defaults ... may not be ideal for all scenes" | npm; github.com/donmccurdy/glTF-Transform `packages/cli/src/cli.ts`; gltf-transform.dev/cli [F] |
| meshoptimizer / gltfpack 1.3.0 (2026-09-25) | `EXT_meshopt_compression` (ratified); decode "3-6 GB/s" on desktop CPUs; indices about 1 to 1.2 bytes per triangle. `KHR_meshopt_compression` is still a Release Candidate. gltfpack cannot read Draco input | github.com/zeux/meshoptimizer; Khronos registry [F] |
| Draco (`KHR_draco_mesh_compression`, ratified) | Highest ratio, reorders vertices, WASM decoder. Bruno Simon 2025 uses Draco "primarily through quantization" | Khronos registry; Awwwards case study 2026-03-11 [F] |
| KTX2 / Basis (`KHR_texture_basisu`) | PNG, JPEG and WebP are decoded to raw RGBA on the GPU: a 4096² texture is about 90 MB of VRAM with mips, regardless of file size. ETC1S is about JPEG size, low-to-mid quality, poor for normals. UASTC is BC7-class quality at 1 to 2x JPEG size, for normal and data maps | donmccurdy.com/2024/02/11/web-texture-formats [F] |
| three.js KTX2Loader | `setTranscoderPath()` then `detectSupport(renderer)` (works with WebGL or WebGPU); requires WASM | threejs.org/docs KTX2Loader [F] |
| Bruno Simon 2025 numbers | 32 compressed GLBs totalling 1.09 MB; 88 `.ktx` totalling 3.2 MB; textures `etc1s --quality 255` | R10 (repo sizes) [F] |

[P] Use Meshopt by default: no WASM-heavy decoder, it keeps vertex order, and gltf-transform defaults to it. Use Draco only if an asset is clearly smaller with it.

### B4. Baked lighting and the bruno-simon.com method

| Item | Fact | Source |
|---|---|---|
| 2025 portfolio | Whole world authored in Blender. Object-name prefixes and empties define physics bodies and colliders. One palette texture for all colours via UVs. TSL shaders; "automatically runs on WebGPU when available". Rapier physics (`@dimforge/rapier3d` ^0.17.3), three ^0.183.2, Vite 7. Mobile preset drops water blur and DOF and lowers shadow-map resolution | awwwards.com/brunos-portfolio-case-study.html (2026-03-11); github.com/brunosimon/folio-2025 `package.json` [F, curl-checked] |
| Is the 2025 site baked? | The case study does not mention baked lighting: shading is real-time with a palette texture and shadow maps | same [F] |
| 2019 portfolio | Matcap materials plus a baked floor-shadow texture | R10 (repo tree) [F] |
| Bake workflow (Three.js Journey) | "baking consists of saving the good-looking render result into a texture". Steps: delete hidden faces, make objects single-user, fix normals, apply scale, UV unwrap; Blender 4.0+ Bake "View From = Active Camera", Margin Type = Extend | threejs-journey.com/lessons/baking-and-exporting-the-scene (free part) [F] |
| Blender bake engine | "Cycles shaders and lighting can be baked to image textures"; Cycles bakes with the render settings (samples, bounces) | docs.blender.org/manual/en/4.2/render/cycles/baking.html [F] |

[P] For LN scenes, baking suits opaque context only: the table, stage, package body, chip carrier, AO under the wafer. Transparent LN, glossy gold and view-dependent thin-film colour cannot be baked faithfully. Keep those as live PBR with an environment map, as the three.js docs advise ("always specify an environment map" for transmission).

### B5. Framework choice

| Option | Version (npm, 2026-10-24) | Notes | Fit |
|---|---|---|---|
| three.js (plain) | 0.186.1 (r186), 2026-09-24 | WebGL build about 194 KB gzip (core + module); WebGPU build about 309 KB gzip, before tree-shaking | Engine under either wrapper |
| Threlte (Svelte 5) | `@threlte/core` 8.6.1 (2026-09-24), `@threlte/extras` 9.22.3 | Peers svelte >= 5, three >= 0.172; WebGPU path `@threlte/core/webgpu` with `three/webgpu` + `three/tsl`; about 3.4k GitHub stars | Matches the author's default stack (SvelteKit + TS + pnpm) [P] |
| react-three-fiber | 9.8.2 (2026-10-14); v10 alpha (first-class WebGPU/TSL, needs three >= 0.185) | Largest ecosystem (about 33.2k stars, drei 10.7.9) | Not the author's stack |
| Google `<model-viewer>` | 4.4.0 (2026-10-09), about 289 KB gzip full bundle | `poster`, `alt`, `loading=lazy`, `reveal`, `camera-controls`, `ar` (WebXR / Scene Viewer / Quick Look), AgX tone mapping; Draco and KTX2 decoders from a Google CDN by default; Meshopt needs `meshoptDecoderLocation`. Transmission and dispersion fidelity unverified | Cheap path for a "specimen cabinet" spin view with AR [P] |

Sources: npm registry (curl-verified for three, @threlte/core, @react-three/fiber, @google/model-viewer, @gltf-transform/cli); threlte.xyz/docs; github.com/pmndrs/react-three-fiber/releases [F].

[P] Use SvelteKit with Threlte for declarative per-page scenes. For a page with many small figures, use one plain three.js renderer shared across figure canvases, the ciechanow.ski pattern in R10 F2.

### B6. WebGPU readiness

| Browser | Status | Source |
|---|---|---|
| Chrome / Edge desktop | 113+; on Linux "depends on hardware and drivers" | caniuse webgpu [F] |
| Chrome Android | 121+ on Android 12+ with Qualcomm or ARM GPUs | developer.chrome.com/blog/new-in-webgpu-121 [F] |
| Firefox | 141 (2025-07-22) on Windows; 147 (2026-01-13) on Apple Silicon macOS; Android behind a flag; Linux [U] | firefox.com release notes [F] |
| Safari | 26.0 (2025-09-15) on macOS, iOS, iPadOS and visionOS; caniuse: macOS only by default on macOS 26 | webkit.org/blog/17333 [F] |
| Global | 87.8% of usage incl. partial | caniuse [F] |

three.js WebGPURenderer [F, threejs.org manual]:
- Falls back to a WebGL 2 backend automatically; `forceWebGL: true` forces it. Needs `await renderer.init()`.
- No `ShaderMaterial`, `onBeforeCompile` or EffectComposer, so effects must be ported to node materials and TSL.
- Still described as "experimental", with some features missing or slower than WebGLRenderer.
- WebGLRenderer remains "the recommended choice for pure WebGL 2 applications".

[P] Write custom effects (thin-film colour, domain-wall shading, E-field overlays) in TSL so one code path serves both backends. Never require WebGPU.

### B7. Rendering transparent LN crystal in three.js

| Property | Value / limit | Source |
|---|---|---|
| `transmission` | 0 to 1; keep opacity 1 | threejs.org/docs MeshPhysicalMaterial [F] |
| `ior` | 1.0 to **2.333**, default 1.5. LN n_o is about 2.21 and n_e about 2.14 near 1550 nm; take exact values from the Sellmeier data in R06 [U until R06] | same [F] |
| `thickness`, `attenuationColor`, `attenuationDistance` | Volume look (pale yellow tint of congruent LN; colour to source in R06) | same [F] |
| `dispersion` | Added in r164 (PR #28051, merged 2024-04-03, milestone r164); WebGPU support in r165. glTF stores 20/V_d (Abbe number) and requires `KHR_materials_volume` | GitHub API (curl-checked); Khronos KHR_materials_dispersion README [F] |
| Birefringence | Not representable: `ior` is one scalar per material | API [D] |
| Transmissive vs transmissive | The transmission pass renders only opaque objects into the transmission target, so transmissive objects do not see each other; it costs an extra scene render | three.js r186 `WebGLRenderer.js` `renderTransmissionPass`; KHR_materials_transmission spec [F] |
| Cost | "higher performance cost, per pixel"; a quantified mobile cost was not found | three.js docs [F]; [U] |

[P] LN-specific approach:
1. Real-time LN uses `MeshPhysicalMaterial` with ior about 2.2 (one index; label it) and dispersion set from the Abbe number computed from the R06 Sellmeier data. At most 1 or 2 transmissive meshes per view.
2. Show birefringence explicitly with a custom TSL double-image or ray-split demo (o-ray and e-ray). It is a didactic effect the stock material cannot fake, and a signature "PDF cannot do this" interactive.
3. The boule hero uses Cycles stills and turntables for true refraction and caustics.

### B8. Pre-rendered vs real-time

| Mode | Facts | Source |
|---|---|---|
| Scroll-scrubbed image sequence (Apple style) | Demo: 148 JPGs, all preloaded. A multi-instance page made 1,609 requests and transferred 55.8 MB. Apple served a single image (about 347 KB) on 3G | css-tricks.com (2020-05-22) [F]; Apple's current practice [U] |
| Transparent video | VP9-alpha WebM: Chrome and Firefox, not Safari. HEVC-alpha: Safari only. AV1 has no native alpha. Same clip: stacked AV1 460 kB, stacked HEVC 1.14 MB, VP9 1.1 MB, HEVC-alpha 3.4 MB, animated AVIF 504 kB. Stacked alpha (colour above alpha, recombined in WebGL) via `<stacked-alpha-video>` | jakearchibald.com/2024/video-with-transparency [F] |
| AV1 decode | Chrome 70+, Firefox 67+, Edge 121+. Safari 17+ only with a hardware decoder | caniuse [F] |
| Author's video standard | H.264 yuv420p, AAC, `+faststart`, fixed fps | A5 [F] |

[P] Decision rule:
- Pre-render when the look depends on refraction, caustics, thin-film colour or many transparent layers (boule, wafer stack hero, PPLN glints), or when the asset is decorative.
- Use real-time when the visitor learns by manipulating something: rotate the crystal axes, change the cut, slide an etch depth, explode a package, scrub a process.
- Ship turntables as 36 to 72 frame AVIF/WebP sprite sequences (drag to spin) or short H.264 loops with an AV1 variant. Frame count and format are to be measured, not assumed.

### B9. Performance budgets

| Reference | File | Triangles | Draw calls | Textures | Source |
|---|---|---|---|---|---|
| Khronos 3D Commerce v1.0, single item, mobile web/AR | 3 MB | 150k | < 20 (max 500) | 2K | KhronosGroup/3DC-Asset-Creation v1.0 PublishingTargets [F] |
| Khronos v1.0, single item, desktop web | 3 MB | 250k | < 100 (max 800) | 2K | same [F] |
| Khronos v1.0, banner ad | 500 KB | 30k | < 5 | 512 | same [F] |
| Khronos v1.0, load-time target | < 3 s at about 10 Mb/s | - | - | - | same [F] |
| Google Scene Viewer | 10 MB recommended (15 MB max) | 100k (30 to 50k ideal) | 10 materials | 2048² | developers.google.com/ar/develop/scene-viewer [F] |
| Bruno Simon 2025 (whole world) | about 1.1 MB GLB + 3.2 MB KTX | - | - | ETC1S | R10 [F] |
| Author's packaging atlas process viewer (desktop tool) | lazy chunk 115 kB | about 0.75 to 0.9 M | about 130 | procedural | R13 [F] |

Khronos v2.0.0 (2025-08) dropped the numeric tables ("coming soon") [F].

Proposed LN-site budget [P]:

| Item | Mobile | Desktop |
|---|---|---|
| Hero 3D total (GLB + KTX2) | ≤ 2 MB, gzip/br | ≤ 5 MB |
| Triangles in view | ≤ 150k | ≤ 500k |
| Draw calls | ≤ 50 | ≤ 150 |
| Texture GPU memory | ≤ 64 MB, 2K maximum | ≤ 256 MB |
| Transmissive meshes | ≤ 1 | ≤ 3 |
| Device pixel ratio cap | 2 | 2 |
| Idle | Render on demand, 0 idle frames | Same |
| First paint | Poster AVIF ≤ 150 KB; 3D only after interaction or IntersectionObserver | Same |

### B10. Accessibility and fallback

| Requirement | Detail | Source |
|---|---|---|
| WCAG 2.2 SC 2.3.3 (AAA) | Interaction-triggered motion can be disabled; techniques C39 (CSS `prefers-reduced-motion`) and SCR40 (JS) | w3.org/WAI/WCAG22/Understanding/animation-from-interactions [F] |
| WCAG 2.2 SC 2.2.2 (A) | Auto-starting motion lasting > 5 s alongside other content needs pause, stop or hide. Auto-rotating turntables and looping heroes qualify | w3.org/WAI/WCAG22/Understanding/pause-stop-hide [F]; applying it to WebGL [D] |
| `prefers-reduced-motion` | Baseline since 2020-01 | MDN [F] |
| Canvas | Content "is not exposed to accessibility tools": put fallback content inside `<canvas>` | MDN canvas [F] |
| `<model-viewer>` | `alt`, `poster`, keyboard orbit ("Use mouse, touch or arrow keys to move"), `a11y` descriptions | model-viewer docs.json [F] |

[P] Every 3D block is built in four layers:
1. Static poster with alt text and a caption.
2. Optional video.
3. Interactive 3D after a capability probe (WebGL 2 or WebGPU adapter, frame-time sample), with keyboard controls and a Pause button.
4. A "data" link to the same geometry as JSON: dimensions with sources, the AI-endpoint angle.

Respect reduced motion: no auto-rotate, and video replaced by its poster. Also add Quality and Renderer toggles (Bruno Simon pattern, R10).

---

## Part C. Proposed asset list for lithium-niobate.com

Key:
- RT = real-time GLB.
- PR = pre-rendered (Cycles stills, turntable or video).
- Priority: P1 = launch, P2 = second wave, P3 = later.
- Dimension grade: [F] sourced, [D] derived, N/A = must be sourced before modelling.

| # | Asset | Real dimensions to model | Mode | Pri | Notes |
|---|---|---|---|---|---|
| A01 | LN unit cell and lattice (R3c), Li/Nb displacement, polarization flip | a = 5.148 Å, c = 13.863 Å; Li (0, 0, 0.2806), Nb (0, 0, -0.0010), O (0.04751, 0.34301, 0.0625) [F: Hsu 1997, COD 2101845, via `20261001_LN_poling_animation/references`] | RT | P1 | Reuse the existing three.js code (r147, so upgrade). Procedural, no Blender needed |
| A02 | Czochralski LN boule (seed, shoulder, body, tail) | Body diameter > target wafer diameter (≥ 100 or 150 mm for 4" or 6" wafers) [D]. Length, cone angles and colour: N/A (vendor or paper source needed; R07 found no open boule photo) | PR hero + light RT | P1 | Main "lasting association" object. Cycles caustics; RT version with transmission plus dispersion. Flat and orientation marks from the cut |
| A03 | Bulk LN wafer (X-, Z-, 128 deg Y-cut) with crystal-axis gizmo | 4": 100 mm x 0.35 mm; 6": 150 mm x 0.5 mm (Sumitomo 128 deg Y; R09 S3) [F]. 3" (76.2 mm) and 8" (200 mm) exist (R09) [F]. Flat lengths N/A (SEMI or vendor spec needed) | RT | P1 | Cut explorer (R02): pick a cut and in-plane angle, see Euler angles and tensors. Re-parameterize the `wafer_300mm` builder |
| A04 | LNOI / TFLN wafer stack (LN film / oxide / Si or quartz handle), with interference colour | LN film 400 to 600 nm; buffer oxide 2 to 3 um; handle Si 725 um or quartz 500 um [F: `eo_modulator_atlas` devices.csv rows chen2022, kharel2021, liu2021]. 150 mm production, 200 mm shown (R09 CCRAFT, Soitec) [F] | RT (TSL thin-film shader) + PR | P1 | Couple to the TMM wafer-colour widget (R03); needs LN o/e dispersion (R06) |
| A05 | TFLN Mach-Zehnder modulator (MZM) die, x-cut, GSG travelling-wave electrodes | Kharel 2021 (Optica 8, 357, doi:10.1364/OPTICA.416155): 600 nm film, 350 nm etch, 5 um gap, 0.8 um Au, 10 or 20 mm length, 500 um quartz [F]. Chen 2022 (APL Photonics 7, 026103, doi:10.1063/5.0077232): 400 nm film, 200 nm etch, 1.5 um rib, 1.8 um gap, 75 um signal, 1.1 um Au, 3 um buffer, 725 um Si with 35 um undercut, 5 / 7 / 10 mm [F] | RT | P1 | Illustrative vs true z-scale toggle mandatory. Light pulse plus RF wave animation. Pairs with EO FEM (R03) |
| A06 | Waveguide cross-section "slice" (rib, slab, electrodes, oxide, optical mode, E-field) | Same rows as A05 [F]; sidewall angle per paper (atlas field present, values sparse) | RT | P1 | Procedural extrusion, no Blender. Mode and field from the in-browser solver (R11) |
| A07 | Microring resonator (LN), with coupling gap | Radius, width, gap: N/A, to source in R08. Cell geometry pattern from the `microring_modulator_cell` builder | RT | P2 | Resonance-dip display must point down (author feedback) |
| A08 | Periodically poled LN (PPLN): thin-film waveguide and bulk chip with domain pattern | Poling period derived from QPM, Λ = λ_ω / (2(n_2ω − n_ω)) for SHG, using R06 Sellmeier [D]. Bulk chip size: N/A (vendor datasheet) | RT + PR | P2 | Reuse the poling animation; domain walls in TSL |
| A09 | Fiber-to-chip edge coupling with fiber array unit (FAU) | SMF cladding 125 um (ITU-T G.652) [U: standard not fetched here]; V-groove pitch 250 um, MT ferrule 6.4 x 2.5 mm [F: `20261002` audited] | RT | P2 | Re-parameterize `build_fau_v_groove.py`; glass as RT transmission or ghost alpha |
| A10 | Wire bonds and RF probe touchdown (GSG) on modulator pads | Au wire 25 um [F: `20261009` grade B]; probe pitch N/A | RT | P3 | Bond curves as tubes (no 1 px lines) |
| A11 | Packaged TFLN modulator (housing, RF connector, fiber pigtails, exploded view) | N/A: pull from a public datasheet drawing (R09); grade every value | PR turntable + RT exploded | P2 | Explode-vector pattern from `20261009`; no real logos |
| A12 | TFLN wafer with die/reticle layout | 150 mm wafer [F]; die count derived from die size and edge exclusion [D] | RT | P2 | Instanced dies; KTX2 layout texture |
| A13 | Fab-flow tools (Cz puller, smart-cut implant, bonder, CMP, ion mill, poling) | Per R13 process viewer; parameters graded reported / derived / template | RT procedural | P3 | Build in three.js per R13; Blender only for hero stills |
| A14 | Application context: pluggable transceiver with TFLN modulator inside | OSFP 100.40 x 22.58 x 13.00 mm (OSFP MSA Rev 5.22, audited in `20261002`) [F] | PR | P3 | Reuse `build_osfp_module.py`; keep it brief |
| A15 | Specimen cabinet: spin views of A02, A03, A04, A08, A11 | As above | PR sprite turntables (or `<model-viewer>`) | P2 | periodictable.com pattern (R10 F8) |

---

## Website implications (ranked)

1. **Keep the author's build-script method and add a web stage.** One `build_<id>.py` per asset, dimensions in TOML with A/B/C/D grades (map them to R13's reported / derived / template), a JSON sidecar per GLB. Then `gltf-transform optimize` (Meshopt plus KTX2), a re-import check, and a browser bounds/size test. Publish the sidecars as the AI-readable geometry endpoint.
2. **Give LN its own glass strategy.**
   - Real time: `MeshPhysicalMaterial` with ior about 2.2 (≤ 2.333 supported), dispersion from the R06 Abbe number, environment map, at most 1 to 3 transmissive meshes.
   - A custom TSL demo for birefringence, which stock materials cannot show.
   - Cycles pre-renders for boule and wafer hero shots.
   - Never let LN read as "glass" or as nothing on a dark background (R13 audit lesson).
3. **Make illustrative vs true scale a first-class control** in every device view (A04 to A10). A 0.4 to 0.6 um film on a 500 to 725 um handle is invisible at true scale.
4. **Stack: SvelteKit + Threlte on three.js r186** (`three/webgpu` + TSL, automatic WebGL 2 fallback). A shared renderer for multi-figure pages, and `<model-viewer>` only for simple spin and AR cards.
5. **Every 3D block has a poster first.** Lazy-load 3D, render on demand, enforce the mobile budget (≤ 2 MB hero, ≤ 150k triangles, ≤ 50 draw calls, ≤ 64 MB textures), and support reduced motion, Pause, keyboard and Quality/Renderer toggles.
6. **Launch set (P1):** A01 unit cell (reuse), A02 boule (PR plus light RT), A03 cut explorer wafer, A04 LNOI stack with interference colour, A05 and A06 MZM die and cross-section. Each needs an R06/R08 source pass before modelling, and every remaining N/A dimension must be sourced or graded.
7. **Decide the Blender version** (open question for the author): stay on the installed 4.2.3, which works and is proven but has no dispersion or Meshopt export, or move to 5.2 LTS, which has both. Either way, set dispersion in three.js until the export path is tested.
8. **Public-hygiene rules for every render:**
   - Strip Blender stamp metadata and PNG text chunks, which embed local paths.
   - No real logos.
   - Every dimension sourced.
   - Since `PlayGround` has no LICENSE, the author should state reuse terms or relicense the reused builders into this repo.

## Sources

Web (fetched 2026-10-24; npm versions curl-verified):
- Blender LTS: https://www.blender.org/download/lts/ ; releases: https://www.blender.org/download/releases/
- Blender glTF manual (5.2): https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html ; 4.5: https://docs.blender.org/manual/en/4.5/addons/import_export/scene_gltf2.html
- Blender 4.2 Principled BSDF: https://docs.blender.org/manual/en/4.2/render/shader_nodes/shader/principled.html ; baking: https://docs.blender.org/manual/en/4.2/render/cycles/baking.html ; 4.2 Cycles notes: https://developer.blender.org/docs/release_notes/4.2/cycles/
- glTF-Transform: https://gltf-transform.dev/cli ; https://github.com/donmccurdy/glTF-Transform ; https://www.npmjs.com/package/@gltf-transform/cli
- meshoptimizer / gltfpack: https://github.com/zeux/meshoptimizer ; https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md
- Khronos glTF extension registry: https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md ; KHR_materials_dispersion: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_dispersion/README.md ; KHR_materials_transmission: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_transmission/README.md ; KHR_meshopt_compression: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_meshopt_compression/README.md
- Web texture formats (D. McCurdy, 2024-02-11): https://www.donmccurdy.com/2024/02/11/web-texture-formats/ ; KTX: https://www.khronos.org/ktx/
- three.js: https://threejs.org/docs/pages/MeshPhysicalMaterial.html ; https://threejs.org/docs/pages/KTX2Loader.html ; https://threejs.org/manual/pages/webgpurenderer.html ; https://threejs.org/docs/pages/WebGPURenderer.html ; https://github.com/mrdoob/three.js/releases ; dispersion PR: https://github.com/mrdoob/three.js/pull/28051
- Bruno Simon: https://www.awwwards.com/brunos-portfolio-case-study.html ; https://github.com/brunosimon/folio-2025 ; https://github.com/brunosimon/folio-2019 ; https://www.threejs-journey.com/lessons/baking-and-exporting-the-scene
- Threlte: https://threlte.xyz/docs/learn/advanced/webgpu ; R3F: https://github.com/pmndrs/react-three-fiber/releases
- WebGPU: https://caniuse.com/webgpu ; https://developer.chrome.com/blog/new-in-webgpu-121 ; https://www.firefox.com/en-US/firefox/141.0/releasenotes/ ; https://www.firefox.com/en-US/firefox/147.0/releasenotes/ ; https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- Image sequences: https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/ ; transparent video: https://jakearchibald.com/2024/video-with-transparency/
- Budgets: https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines-1.0/full-version/sec99_PublishingTargets/PublishingTargets.md ; https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md ; https://developers.google.com/ar/develop/scene-viewer ; https://discoverthreejs.com/tips-and-tricks/
- Accessibility: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html ; https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html ; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion ; https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas
- model-viewer: https://github.com/google/model-viewer (docs data `packages/modelviewer.dev/data/docs.json`)
- TFLN geometry: Kharel et al., Optica 8(3), 357 (2021), doi:10.1364/OPTICA.416155 ; Chen et al., APL Photonics 7, 026103 (2022), doi:10.1063/5.0077232 ; Liu et al., arXiv:2103.03684 (2021), all as extracted in the public `eo_modulator_atlas` `data/devices.csv`. LN structure: Hsu et al., Acta Cryst. B53, 420 (1997), COD 2101845

Local (public `PlayGround` repo, relative paths): `20261002_interconnect_film/{assets/ASSET_SPEC.md, DevLog/*, scripts/*}`, `20261004_direct_3d_from_images/{README.md, AGENT_GUIDE.md, PLAYBOOK.md, VIDEO_WORKFLOW.md, DevLog/*, scripts/*}`, `20261005_direct_3d_nvidia_switch/{DevLog/*, scripts/*}`, `20261009_pigeon_pluggable/{DevLog/*, research/hero_component_dimensions.md, scripts/*}`, `20260915_fruit_fly_nn/{DevLog/005, 008, scripts/generate_hardware_assets.py}`, `20261001_LN_poling_animation/references/README.md`, `20261001_eo_modulator_atlas/data/{devices.csv, papers.csv}`. Sibling notes: R03, R09, R10, R13.

## Uncertainties and open items

- LN boule dimensions, wafer flat specs, packaged modulator outline, ring radius and bulk PPLN chip size: all N/A here. Source them (R06, R08, R09, vendor datasheets) before modelling.
- LN refractive indices and Abbe number are quoted as approximate. Take them from the R06 Sellmeier data.
- ITU-T G.652 125 um cladding was not fetched in this session.
- The Blender bake used for bruno-simon.com is not documented in the 2025 case study. "Bake" applies to the Three.js Journey workflow and the 2019 floor shadow only.
- No quantified mobile cost was found for `MeshPhysicalMaterial` transmission. Measure on a mid-range Android phone and an iPhone before committing to the real-time boule.
- three.js support for `KHR_meshopt_compression` (Release Candidate) is unverified; stay on `EXT_meshopt_compression`.
- The general web search budget was exhausted during this session; claims above rely on the pages fetched directly.
