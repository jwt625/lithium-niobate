<!-- Fig. 3.1 Longitudinal piezoelectric response d_L(n) = d_ijk n_i n_j n_k (content/chapters/03-sound/figures.md F3.1).
     TECH: two polar sections (XY at theta = 90 deg, YZ plane), 3m stereogram glyph, coefficient table, sliders.
     VISUAL: software-3D surface r = |d_L(n)| colored by sign, drag to place the press; squeeze card with face charge;
     equator strip showing the sin(3 phi) sign alternation. Physics: src/lib/physics/piezo.ts, tensors.ts. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import type { DSetIn } from "./types";
  import { longitudinal, longitudinalMaxAbs, dirFromAngles } from "$lib/physics/piezo.ts";
  import { d3m, voigtToTensor3 } from "$lib/physics/tensors.ts";
  import { f31 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { polarLobes, r1 } from "./plot.ts";
  import { sf, sp, zf, padL } from "./f.ts";
  import { drawMeshes, line3, arrow3, project, unproject, fitCanvas, rgb, type Mesh, type View } from "./soft3d.ts";
  import { canvasHooks, tok } from "./page.ts";

  let { sets }: { sets: DSetIn[] } = $props();

  const D2R = Math.PI / 180;
  const cur = $derived(sets.find((s) => s.id === f31.set) ?? sets[0]);
  const dFull = $derived(voigtToTensor3(d3m(cur), "d"));
  const n = $derived(dirFromAngles(f31.th * D2R, f31.ph * D2R));
  const dL = $derived(longitudinal(dFull, n));
  const mx = $derived(longitudinalMaxAbs(dFull, 2));

  // polar sections
  const NP = 360;
  const ts = Array.from({ length: NP }, (_, i) => (2 * Math.PI * i) / NP);
  const RMAX = 45, PR = 104, PC = 130;
  const xy = $derived(polarLobes(ts, ts.map((t) => longitudinal(dFull, [Math.cos(t), Math.sin(t), 0])), PC, PC, PR / RMAX));
  const yz = $derived(polarLobes(ts, ts.map((t) => longitudinal(dFull, [0, Math.cos(t), Math.sin(t)])), PC, PC, PR / RMAX));
  // projections of n on the two planes (screen angle) and the dot at |d_L(n)|
  const pXY = $derived.by(() => { const a = Math.atan2(n[1], n[0]), L = Math.hypot(n[0], n[1]); return { a, L, inPlane: Math.abs(n[2]) < 1e-9 }; });
  const pYZ = $derived.by(() => { const a = Math.atan2(n[2], n[1]), L = Math.hypot(n[1], n[2]); return { a, L, inPlane: Math.abs(n[0]) < 1e-9 }; });
  const rings = [10, 20, 30, 40];

  // readouts (fixed widths)
  const ro = $derived({
    dL: sf(dL, 2, 2) + " pC/N",
    sig: sf(-dL, 2, 2) + " µC/m²",
    disp: sf(dL, 2, 2) + " pm/V",
    th: zf(f31.th, 3, 1) + "°",
    ph: zf(f31.ph, 3, 1) + "°",
  });
  const dRows = $derived([
    ["d<sub>15</sub>", cur.d15], ["d<sub>22</sub>", cur.d22], ["d<sub>31</sub>", cur.d31], ["d<sub>33</sub>", cur.d33], ["d<sub>16</sub> = −2d<sub>22</sub>", -2 * cur.d22],
  ] as [string, number][]);
  const setOpts = $derived(sets.map((s) => ({ v: s.id, t: s.label })));

  // equator strip (VISUAL): d_L(phi) at theta = 90 deg
  const EW = 520, EH = 120;
  const eqPath = $derived.by(() => {
    let d = "";
    for (let i = 0; i <= 360; i += 2) { const v = longitudinal(dFull, [Math.cos(i * D2R), Math.sin(i * D2R), 0]); d += `${i ? "L" : "M"}${r1(20 + (i / 360) * (EW - 40))} ${r1(EH / 2 - (v / RMAX) * (EH / 2 - 12))}`; }
    return d;
  });
  const eqX = $derived(20 + (((f31.ph % 360) + 360) % 360 / 360) * (EW - 40));
  const eqV = $derived(longitudinal(dFull, [Math.cos(f31.ph * D2R), Math.sin(f31.ph * D2R), 0]));

  // squeeze card: number of charge marks per face follows |d_L| (24 marks at 40 pC/N)
  const nq = $derived(Math.round((Math.abs(dL) / 40) * 24));
  const faceSign = $derived(dL > 0.005 ? -1 : dL < -0.005 ? 1 : 0); // +n face under compression: sign of -d_L

  // ---------- VISUAL 3D ----------
  let stage: HTMLDivElement | undefined = $state();
  let cv: HTMLCanvasElement | undefined = $state();
  let lab: HTMLDivElement | undefined = $state();
  let view: View | null = null;
  const cam = () => (f31.view === "top" ? { yaw: -Math.PI / 2, pitch: Math.PI / 2 - 1e-4 } : { yaw: 0.62, pitch: 0.36 });
  function draw(): void {
    if (!cv || !stage || !lab || stage.offsetParent === null) return;
    const { ctx, W, H } = fitCanvas(cv);
    const R = 0.36 * Math.min(W, H);
    const c = cam();
    view = { W, H, cx: W / 2, cy: H / 2, cam: { ...c, scale: R } };
    const pos = rgb(tok("--v-ln")), neg = rgb(tok("--nb")), line = tok("--v-text3"), acc = tok("--v-au");
    const nu = 61, nv = 120, P = new Float64Array(nu * nv * 3), S = new Int8Array(nu * nv);
    const k = 1 / 40;
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const th = (i / (nu - 1)) * Math.PI, ph = (j / nv) * 2 * Math.PI, nn = dirFromAngles(th, ph), v = longitudinal(dFull, nn), r = Math.abs(v) * k, q = i * nv + j;
      P[3 * q] = r * nn[0]; P[3 * q + 1] = r * nn[1]; P[3 * q + 2] = r * nn[2]; S[q] = v >= 0 ? 1 : -1;
    }
    const mesh: Mesh = { P, nu, nv, wrapV: true, color: (i, j) => { const s = S[i * nv + j] + S[(i + 1) * nv + j]; return s >= 0 ? [pos[0], pos[1], pos[2], 0.92] : [neg[0], neg[1], neg[2], 0.92]; } };
    // axes behind and in front
    for (const a of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) line3(ctx, view, [[-1.25 * a[0], -1.25 * a[1], -1.25 * a[2]], [1.25 * a[0], 1.25 * a[1], 1.25 * a[2]]], line, 1, [3, 4]);
    drawMeshes(ctx, view, [mesh], 0.4);
    const nn = n;
    arrow3(ctx, view, [1.6 * nn[0], 1.6 * nn[1], 1.6 * nn[2]], [1.12 * nn[0], 1.12 * nn[1], 1.12 * nn[2]], acc, 3, 11);
    arrow3(ctx, view, [-1.6 * nn[0], -1.6 * nn[1], -1.6 * nn[2]], [-1.12 * nn[0], -1.12 * nn[1], -1.12 * nn[2]], acc, 3, 11);
    const L = ([[1.38, 0, 0, "X"], [0, 1.38, 0, "Y"], [0, 0, 1.38, "Z (c)"]] as [number, number, number, string][]).map(([x, y, z, t]) => { const [px, py, pz] = project(view as View, [x, y, z]); return `<span style="left:${px.toFixed(1)}px;top:${py.toFixed(1)}px;opacity:${pz < -0.2 ? 0.45 : 1}">${t}</span>`; });
    lab.innerHTML = L.join("");
  }
  function dirTo(e: PointerEvent): void {
    if (!view || !stage) return;
    const r = stage.getBoundingClientRect();
    const d = unproject(view, e.clientX - r.left, e.clientY - r.top, view.cam.scale * 1.3);
    if (!d) return;
    f31.th = Math.round((Math.acos(Math.max(-1, Math.min(1, d[2]))) / D2R) * 2) / 2;
    f31.ph = Math.round(((((Math.atan2(d[1], d[0]) / D2R) % 360) + 360) % 360) * 2) / 2;
  }
  let dragging = false;
  function down(e: PointerEvent): void { dragging = true; try { stage?.setPointerCapture(e.pointerId); } catch { /* inactive pointer */ } dirTo(e); }
  function move(e: PointerEvent): void { if (dragging) dirTo(e); }
  function up(): void { dragging = false; }
  function key(e: KeyboardEvent): void {
    const s = e.shiftKey ? 15 : 5;
    if (e.key === "ArrowLeft") f31.ph = (f31.ph - s + 360) % 360;
    else if (e.key === "ArrowRight") f31.ph = (f31.ph + s) % 360;
    else if (e.key === "ArrowUp") f31.th = Math.max(0, f31.th - s);
    else if (e.key === "ArrowDown") f31.th = Math.min(180, f31.th + s);
    else return;
    e.preventDefault();
  }
  let redraw = (): void => {};
  onMount(() => {
    if (!stage) return;
    const off = canvasHooks(stage, () => draw());
    redraw = () => requestAnimationFrame(draw);
    return off;
  });
  $effect(() => { void dFull; void n; void f31.view; redraw(); });
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f31" id="f31">
  <div class="ph"><span>Longitudinal response d<sub>L</sub>(<b>n</b>) = d<sub>ijk</sub>n<sub>i</sub>n<sub>j</sub>n<sub>k</sub></span><Seg options={setOpts} bind:value={f31.set} label="Data set" /></div>
  <div class="snd-g3">
    <div class="snd-cell">
      <p class="snd-cap">θ = 90°: XY plane, φ from +X</p>
      <svg class="snd-svg" viewBox="0 0 260 260" role="img" aria-label="Polar plot of d_L in the XY plane">
        {#each rings as r (r)}<circle class="gl" cx={PC} cy={PC} r={r1((r * PR) / RMAX)} /><text class="tk" x={PC + 3} y={r1(PC - (r * PR) / RMAX - 2)}>{r}</text>{/each}
        <line class="ax" x1="18" y1={PC} x2="242" y2={PC} /><line class="ax" x1={PC} y1="18" x2={PC} y2="242" />
        <text class="lb" x="246" y={PC + 4}>X</text><text class="lb" x={PC - 4} y="12">Y</text>
        {#each [30, 150] as a (a)}<line class="c5" x1={r1(PC - 112 * Math.cos(a * D2R))} y1={r1(PC + 112 * Math.sin(a * D2R))} x2={r1(PC + 112 * Math.cos(a * D2R))} y2={r1(PC - 112 * Math.sin(a * D2R))} />{/each}
        <path class="c1" d={xy.pos} /><path class="c2" d={xy.neg} />
        <line class="cur" x1={PC} y1={PC} x2={r1(PC + 112 * Math.cos(pXY.a) * pXY.L)} y2={r1(PC - 112 * Math.sin(pXY.a) * pXY.L)} />
        {#if pXY.inPlane}<circle class="mko" r="3.5" cx={r1(PC + (Math.abs(dL) * PR / RMAX) * Math.cos(pXY.a))} cy={r1(PC - (Math.abs(dL) * PR / RMAX) * Math.sin(pXY.a))} />{/if}
      </svg>
    </div>
    <div class="snd-cell">
      <p class="snd-cap">YZ plane (φ = 90°, 270°)</p>
      <svg class="snd-svg" viewBox="0 0 260 260" role="img" aria-label="Polar plot of d_L in the YZ plane">
        {#each rings as r (r)}<circle class="gl" cx={PC} cy={PC} r={r1((r * PR) / RMAX)} /><text class="tk" x={PC + 3} y={r1(PC - (r * PR) / RMAX - 2)}>{r}</text>{/each}
        <line class="ax" x1="18" y1={PC} x2="242" y2={PC} /><line class="ax" x1={PC} y1="18" x2={PC} y2="242" />
        <text class="lb" x="246" y={PC + 4}>Y</text><text class="lb" x={PC - 4} y="12">Z</text>
        <path class="c1" d={yz.pos} /><path class="c2" d={yz.neg} />
        <line class="cur" x1={PC} y1={PC} x2={r1(PC + 112 * Math.cos(pYZ.a) * pYZ.L)} y2={r1(PC - 112 * Math.sin(pYZ.a) * pYZ.L)} />
        {#if pYZ.inPlane}<circle class="mko" r="3.5" cx={r1(PC + (Math.abs(dL) * PR / RMAX) * Math.cos(pYZ.a))} cy={r1(PC - (Math.abs(dL) * PR / RMAX) * Math.sin(pYZ.a))} />{/if}
      </svg>
    </div>
    <div class="snd-cell">
      <p class="snd-cap">3m, viewed down +Z</p>
<pre class="snd-asc" aria-label="Stereogram of point group 3m: threefold axis and three mirror planes">            +Y
             |
 `-.         |         .-'
    `-.      |      .-'
       `-.   |   .-'
          `-.|.-'
 -X ········ ▲ ········ +X
          .-'|`-.
       .-'   |   `-.
    .-'      |      `-.
 .-'         |         `-.
             |</pre>
      <table class="idx snd-tab snd-fixtab" style="margin-top:6px"><colgroup><col class="k" /><col class="v" /><col class="b" /></colgroup>
        <thead><tr><th>pC/N</th><th class="r">value</th><th class="r">status</th></tr></thead>
        <tbody>{#each dRows as [k, v] (k)}<tr><td>{@html k}</td><td class="num">{sp(v, 2, 2)}</td><td class="r"><span class="snd-stack">{#each sets as st (st.id)}<span class:off={st.id !== cur.id}><Badge code={st.code} pop={st.pop} /></span>{/each}</span></td></tr>{/each}</tbody>
      </table>
    </div>
  </div>
  <div class="ctl"><label for="f31-th">Polar angle θ from +Z</label><input id="f31-th" type="range" min="0" max="180" step="0.5" bind:value={f31.th} /><output for="f31-th">{ro.th}</output></div>
  <div class="ctl"><label for="f31-ph">Azimuth φ from +X</label><input id="f31-ph" type="range" min="0" max="360" step="0.5" bind:value={f31.ph} /><output for="f31-ph">{ro.ph}</output></div>
  <dl class="snd-kv c4">
    <dt>d<sub>L</sub>(n)</dt><dd>{ro.dL}</dd>
    <dt>+n face, 1 MPa squeeze</dt><dd>{ro.sig}</dd>
    <dt>free stroke per volt</dt><dd>{ro.disp}</dd>
    <dt>|d<sub>L</sub>| max</dt><dd>{padL(sf(mx.value, 2, 2), 6)} pC/N</dd>
  </dl>
  <div class="snd-note">max at θ = {zf(mx.theta / D2R, 3, 1)}°, φ = 30° + k·120°. Solid: d<sub>L</sub> &gt; 0; dashed: d<sub>L</sub> &lt; 0; dotted lines and the Y axis: mirror-plane traces.</div>
  <div class="pf"><span class="snd-stack"><span class:off={cur.id !== "kushibiki1999"}>d = e s<sup>E</sup> from Kushibiki et al. 1999 e, c<sup>E</sup>, ε<sup>S</sup> <Badge code="P" pop="r:kushibiki1999" /> <Badge code="derived" pop="m-forms" /></span><span class:off={cur.id === "kushibiki1999"}>Smith &amp; Welsh 1971 d via Weis & Gaylord 1985 Table 3 <Badge code="P-comp" pop="r:weis1985" /></span></span> Frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f31">
  <div>
    <div class="snd-stage" bind:this={stage} tabindex="0" role="application" aria-label="Surface of |d_L| over all press directions; drag to set the press direction, arrow keys step it"
      onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} onkeydown={key}>
      <canvas bind:this={cv}></canvas><div class="lab" bind:this={lab}></div>
    </div>
    <div class="snd-legend" style="margin-top:12px"><span><i style="background:var(--v-ln)"></i>d<sub>L</sub> &gt; 0: the +n face turns negative when squeezed</span><span><i style="background:var(--nb)"></i>d<sub>L</sub> &lt; 0: it turns positive</span></div>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>Squeeze along n, 1 MPa</h3>
      <div class="snd-big"><span class="snd-n">{ro.dL.replace(" pC/N", "")}</span><small>pC/N</small></div>
      <svg class="snd-vsvg" viewBox="0 0 420 150" role="img" aria-label="Crystal block squeezed along n with face charges">
        <rect class="lnf" x="120" y="25" width="180" height="100" />
        <rect x="88" y="20" width="22" height="110" fill="var(--v-line2)" /><rect x="310" y="20" width="22" height="110" fill="var(--v-line2)" />
        <path class="au" d="M20 75H80M70 67l10 8-10 8M400 75H340M350 67l-10 8 10 8" />
        {#each Array.from({ length: 24 }, (_, i) => i) as i (i)}
          <text x={290 + Math.floor(i / 12) * 8} y={33 + (i % 12) * 8.2} visibility={i < nq ? "visible" : "hidden"} style="font-size:13px;font-weight:600" fill={faceSign > 0 ? "var(--v-l532)" : "var(--v-text)"}>{faceSign > 0 ? "+" : "−"}</text>
          <text x={124 + Math.floor(i / 12) * 8} y={33 + (i % 12) * 8.2} visibility={i < nq ? "visible" : "hidden"} style="font-size:13px;font-weight:600" fill={faceSign > 0 ? "var(--v-text)" : "var(--v-l532)"}>{faceSign > 0 ? "−" : "+"}</text>
        {/each}
        <text x="300" y="145" class="lbv">+n face</text><text x="104" y="145" class="lbv">−n face</text>
      </svg>
      <dl class="snd-vhud">
        <dt>θ, φ</dt><dd>{ro.th}  {ro.ph}</dd>
        <dt>charge on the +n face</dt><dd>{ro.sig}</dd>
        <dt>free stroke per volt along n</dt><dd>{ro.disp}</dd>
      </dl>
    </div>
    <div class="snd-card">
      <h3>Around the equator (θ = 90°): d<sub>L</sub> = −d<sub>22</sub> sin 3φ</h3>
      <svg class="snd-vsvg" viewBox="0 0 {EW} {EH + 22}" role="img" aria-label="d_L along the equator">
        <line class="ax" x1="20" y1={EH / 2} x2={EW - 20} y2={EH / 2} />
        {#each [0, 60, 120, 180, 240, 300, 360] as a (a)}<line class="gl" x1={r1(20 + (a / 360) * (EW - 40))} y1="8" x2={r1(20 + (a / 360) * (EW - 40))} y2={EH - 8} /><text x={r1(20 + (a / 360) * (EW - 40))} y={EH + 16} text-anchor="middle">{a}°</text>{/each}
        <path class="acc" d={eqPath} />
        <line class="au" x1={r1(eqX)} y1="4" x2={r1(eqX)} y2={EH - 4} />
        <circle class="accf" r="5" cx={r1(eqX)} cy={r1(EH / 2 - (eqV / RMAX) * (EH / 2 - 12))} />
      </svg>
    </div>
    <div class="snd-vctl">
      <div class="v-ctl" style="--w:8ch"><label for="f31v-th">Press direction θ from +Z</label><output for="f31v-th">{ro.th}</output><input id="f31v-th" type="range" min="0" max="180" step="0.5" bind:value={f31.th} /></div>
      <div class="v-ctl" style="--w:8ch"><label for="f31v-ph">Azimuth φ from +X</label><output for="f31v-ph">{ro.ph}</output><input id="f31v-ph" type="range" min="0" max="360" step="0.5" bind:value={f31.ph} /></div>
      <div class="v-ctl"><span class="v-lab">View</span><Seg visual options={[{ v: "oblique", t: "Oblique" }, { v: "top", t: "Down the c axis" }]} bind:value={f31.view} label="View" /></div>
      <div class="v-ctl"><span class="v-lab">Constants</span><Seg visual options={setOpts} bind:value={f31.set} label="Data set" /></div>
    </div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span class="snd-stack"><span class:off={cur.id !== "kushibiki1999"}>d = e s<sup>E</sup> from Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" /> <Badge code="derived" pop="m-forms" /></span><span class:off={cur.id === "kushibiki1999"}>Smith &amp; Welsh 1971 via Weis & Gaylord 1985 <Badge code="P-comp" pop="r:weis1985" /></span></span><span>largest |d<sub>L</sub>|: <span class="snd-n" style="width:3.6em">{sf(mx.value, 2, 2)}</span> pC/N at θ = <span class="snd-n" style="width:2.9em">{zf(mx.theta / D2R, 3, 1)}</span>°, φ = 30° + k·120°</span><span>frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></span></div>
