<!-- Fig. 3.3 Bulk slowness with piezoelectric stiffening (figures.md F3.3). Christoffel equation with and without the
     stiffening term (acoustics.christoffel), group velocity and power-flow angle (piezo.groupVelocity), kushibiki1999.
     TECH: slowness curves in a crystal plane, measured kushibiki1999 velocities as + markers, readouts.
     VISUAL: three nested slowness sheets in software 3D, the quasi-longitudinal sheet tinted by the stiffening increment;
     probe arrow and polarization segment; stiffening toggle eases the sheets within 0.4 s (static with reduced motion). -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { christoffel, LN_KUSHIBIKI1999 } from "$lib/physics/acoustics.ts";
  import { groupVelocity } from "$lib/physics/piezo.ts";
  import { VELOCITIES_KUSHIBIKI1999 } from "$lib/physics/constants.ts";
  import { f33 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { r1 } from "./plot.ts";
  import { sf, uf, zf } from "./f.ts";
  import { drawMeshes, line3, arrow3, project, fitCanvas, rgb, type Mesh, type View } from "./soft3d.ts";
  import { canvasHooks, tok } from "./page.ts";
  import { fxOn } from "../dom.ts";

  const M = LN_KUSHIBIKI1999;
  const D2R = Math.PI / 180;
  type V3 = [number, number, number];
  const AX: Record<string, [V3, V3, string, string]> = { XY: [[1, 0, 0], [0, 1, 0], "X", "Y"], YZ: [[0, 1, 0], [0, 0, 1], "Y", "Z"], XZ: [[1, 0, 0], [0, 0, 1], "X", "Z"] };
  const dirOf = (plane: string, t: number): V3 => { const [a, b] = AX[plane]; return [Math.cos(t) * a[0] + Math.sin(t) * b[0], Math.cos(t) * a[1] + Math.sin(t) * b[1], Math.cos(t) * a[2] + Math.sin(t) * b[2]]; };
  const NS = 360;
  const curves = $derived.by(() => {
    const out = { s: [[], [], []] as number[][], u: [[], [], []] as number[][] };
    for (let i = 0; i <= NS; i++) {
      const n = dirOf(f33.plane, (2 * Math.PI * i) / NS);
      const a = christoffel(M, n, true).v, b = christoffel(M, n, false).v;
      for (let q = 0; q < 3; q++) { out.s[q].push(1000 / a[q]); out.u[q].push(1000 / b[q]); }
    }
    return out;
  });
  // plot geometry: slowness in s/km (= us/mm), radius scale
  const PC = 150, SMAX = 0.30, PR = 128;
  const pathOf = (rs: number[]): string => rs.map((r, i) => { const t = (2 * Math.PI * i) / NS; return `${i ? "L" : "M"}${r1(PC + (r / SMAX) * PR * Math.cos(t))} ${r1(PC - (r / SMAX) * PR * Math.sin(t))}`; }).join("") + "Z";
  const nProbe = $derived(dirOf(f33.plane, f33.ang * D2R));
  const gS = $derived(groupVelocity(M, nProbe, true));
  const gU = $derived(christoffel(M, nProbe, false));
  const q = $derived(f33.mode);
  const vSel = $derived(f33.stiff ? gS.v[q] : gU.v[q]);
  const ro = $derived({
    v: uf(vSel, 4, 1) + " m/s",
    dv: sf(gS.v[q] - gU.v[q], 3, 1) + " m/s",
    pfa: sf(f33.stiff ? gS.pfa[q] / D2R : NaN, 2, 1) + "°",
    pol: (f33.stiff ? gS.u[q] : gU.u[q]).map((c) => sf(c, 1, 3)).join(" "),
    ang: zf(f33.ang, 3, 1) + "°",
    all: [0, 1, 2].map((k) => uf(f33.stiff ? gS.v[k] : gU.v[k], 4, 1)),
  });
  // measured markers in the current plane: direction label -> unit vector
  const DIRS: Record<string, V3> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
  const marks = $derived.by(() => {
    const [a, b] = AX[f33.plane];
    return VELOCITIES_KUSHIBIKI1999.filter((m) => { const d = DIRS[m.dir]; return Math.abs(d[0] * a[0] + d[1] * a[1] + d[2] * a[2]) + Math.abs(d[0] * b[0] + d[1] * b[1] + d[2] * b[2]) > 0.5; }).map((m) => {
      const d = DIRS[m.dir], t = Math.atan2(d[0] * b[0] + d[1] * b[1] + d[2] * b[2], d[0] * a[0] + d[1] * a[1] + d[2] * a[2]), r = (1000 / m.v / SMAX) * PR;
      return { x: PC + r * Math.cos(t), y: PC - r * Math.sin(t), lab: `${m.dir} ${m.mode === "L" ? "longitudinal" : "shear"}: ${m.v.toFixed(2)} m/s` };
    });
  });
  const ringsS = [0.1, 0.2, 0.3];
  // table: measured vs computed (kushibiki1999 Table II)
  const MODEIDX: Record<string, number> = { "L-Z": 0, "S-Z": 1, "L-X": 0, "L-Y": 0, "S-Y": 2, "S-X": 1 };
  const rows = VELOCITIES_KUSHIBIKI1999.map((m) => {
    const n = DIRS[m.dir], k = MODEIDX[`${m.mode}-${m.dir}`];
    return { m, vs: christoffel(M, n, true).v[k], vu: christoffel(M, n, false).v[k] };
  });
  const modeOpts = [{ v: 0 as const, t: "quasi-L" }, { v: 1 as const, t: "fast shear" }, { v: 2 as const, t: "slow shear" }];
  const planeOpts = [{ v: "XY" as const, t: "XY" }, { v: "YZ" as const, t: "YZ" }, { v: "XZ" as const, t: "XZ" }];

  // ---------- VISUAL ----------
  let stage: HTMLDivElement | undefined = $state();
  let cv: HTMLCanvasElement | undefined = $state();
  let lab: HTMLDivElement | undefined = $state();
  const nu = 37, nv = 72;
  const grid = (() => {
    const S = new Float64Array(nu * nv * 3), U = new Float64Array(nu * nv * 3), N = new Float64Array(nu * nv * 3);
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const th = (i / (nu - 1)) * Math.PI, ph = (j / nv) * 2 * Math.PI, n: V3 = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], k = i * nv + j;
      const a = christoffel(M, n, true).v, b = christoffel(M, n, false).v;
      for (let c = 0; c < 3; c++) { S[3 * k + c] = 1000 / a[c]; U[3 * k + c] = 1000 / b[c]; N[3 * k + c] = n[c]; }
    }
    return { S, U, N };
  })();
  let mix = 1; // 1 = stiffened, 0 = unstiffened (eased)
  let anim = 0;
  const camOf = () => (f33.view === "top" ? { yaw: -Math.PI / 2, pitch: Math.PI / 2 - 1e-4 } : f33.view === "side" ? { yaw: 0, pitch: 0.02 } : { yaw: 0.6, pitch: 0.32 });
  function draw(): void {
    if (!cv || !stage || !lab || stage.offsetParent === null) return;
    const { ctx, W, H } = fitCanvas(cv);
    const v: View = { W, H, cx: W / 2, cy: H / 2, cam: { ...camOf(), scale: 0.37 * Math.min(W, H) } };
    const shear = rgb(tok("--v-text2")), ln = rgb(tok("--v-ln")), acc = rgb(tok("--v-l532"));
    const meshes: Mesh[] = [];
    for (const br of [2, 1, 0]) {
      const P = new Float64Array(nu * nv * 3), dv = new Float64Array(nu * nv);
      for (let k = 0; k < nu * nv; k++) {
        const s = (mix * grid.S[3 * k + br] + (1 - mix) * grid.U[3 * k + br]) / SMAX;
        for (let c = 0; c < 3; c++) P[3 * k + c] = s * grid.N[3 * k + c];
        dv[k] = 1000 / grid.S[3 * k + br] - 1000 / grid.U[3 * k + br];
      }
      meshes.push({ P, nu, nv, wrapV: true, color: (i, j) => {
        if (br !== 0) return [shear[0], shear[1], shear[2], br === 2 ? 0.16 : 0.22];
        const t = Math.min(1, (mix * dv[i * nv + j]) / 230);
        return [ln[0] + (acc[0] - ln[0]) * t, ln[1] + (acc[1] - ln[1]) * t, ln[2] + (acc[2] - ln[2]) * t, 0.95];
      } });
    }
    const line = tok("--v-text3");
    for (const a of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) line3(ctx, v, [[-1.15 * a[0], -1.15 * a[1], -1.15 * a[2]], [1.15 * a[0], 1.15 * a[1], 1.15 * a[2]]], line, 1, [3, 4]);
    drawMeshes(ctx, v, meshes, 0.42);
    const n = nProbe, sp = (f33.stiff ? 1000 / gS.v[q] : 1000 / gU.v[q]) / SMAX, tip: V3 = [n[0] * sp, n[1] * sp, n[2] * sp];
    arrow3(ctx, v, [0, 0, 0], [n[0] * 1.12, n[1] * 1.12, n[2] * 1.12], tok("--v-au"), 2.5, 10);
    const u = f33.stiff ? gS.u[q] : gU.u[q];
    line3(ctx, v, [[tip[0] - 0.12 * u[0], tip[1] - 0.12 * u[1], tip[2] - 0.12 * u[2]], [tip[0] + 0.12 * u[0], tip[1] + 0.12 * u[1], tip[2] + 0.12 * u[2]]], tok("--v-text"), 3.5);
    const L = ([[1.25, 0, 0, "X"], [0, 1.25, 0, "Y"], [0, 0, 1.25, "Z (c)"]] as [number, number, number, string][]).map(([x, y, z, t]) => { const [px, py] = project(v, [x, y, z]); return `<span style="left:${px.toFixed(1)}px;top:${py.toFixed(1)}px">${t}</span>`; });
    lab.innerHTML = L.join("");
  }
  let redraw = (): void => {};
  function toggleTo(target: number): void {
    cancelAnimationFrame(anim);
    if (!fxOn()) { mix = target; redraw(); return; }
    const m0 = mix, t0 = performance.now();
    const step = (t: number): void => { const k = Math.min(1, (t - t0) / 400), e = 1 - (1 - k) ** 3; mix = m0 + (target - m0) * e; draw(); if (k < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  let lastStiff = f33.stiff;
  onMount(() => {
    mix = f33.stiff ? 1 : 0;
    if (!stage) return;
    const off = canvasHooks(stage, () => draw());
    redraw = () => requestAnimationFrame(draw);
    return () => { off(); cancelAnimationFrame(anim); };
  });
  $effect(() => {
    const s = f33.stiff; void f33.plane; void f33.ang; void f33.mode; void f33.view;
    if (s !== lastStiff) { lastStiff = s; toggleTo(s ? 1 : 0); } else redraw();
  });
  const stiffOpts = [{ v: true, t: "with piezo stiffening" }, { v: false, t: "without" }];
  const zl = $derived(f33.stiff ? rows[0].vs : rows[0].vu);
  const ys = $derived(f33.stiff ? rows[4].vs : rows[4].vu);
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f33" id="f33">
  <div class="ph"><span>Slowness 1/v (s/km) in a crystal plane, Kushibiki et al. 1999</span><Seg options={planeOpts} bind:value={f33.plane} label="Plane" /></div>
  <div class="snd-g2">
    <div class="snd-cell">
      <p class="snd-cap">solid: stiffened; dashed: e = 0; +: measured (Table II)</p>
      <svg class="snd-svg snd-sq" viewBox="0 0 300 300" role="img" aria-label="Slowness curves">
        {#each ringsS as r (r)}<circle class="gl" cx={PC} cy={PC} r={r1((r / SMAX) * PR)} /><text class="tk" x={r1(PC + 0.71 * (r / SMAX) * PR + 2)} y={r1(PC + 0.71 * (r / SMAX) * PR + 10)}>{r.toFixed(1)}</text>{/each}
        <line class="ax" x1="10" y1={PC} x2="290" y2={PC} /><line class="ax" x1={PC} y1="10" x2={PC} y2="290" />
        <text class="lb" x="282" y={PC - 5}>{AX[f33.plane][2]}</text><text class="lb" x={PC + 5} y="16">{AX[f33.plane][3]}</text>
        {#each [0, 1, 2] as k (k)}<path class="c4" d={pathOf(curves.u[k])} /><path class={k === f33.mode ? "c1" : "c3"} d={pathOf(curves.s[k])} />{/each}
        {#each marks as m (m.lab)}<path class="c1" d="M{r1(m.x - 4)} {r1(m.y)}h8M{r1(m.x)} {r1(m.y - 4)}v8"><title>{m.lab}</title></path>{/each}
        <line class="cur" x1={PC} y1={PC} x2={r1(PC + 140 * Math.cos(f33.ang * D2R))} y2={r1(PC - 140 * Math.sin(f33.ang * D2R))} />
      </svg>
    </div>
    <div class="snd-cell">
      <p class="snd-cap">probe direction n</p>
      <dl class="snd-kv" style="border-top:0">
        <dt>v quasi-L, fast, slow</dt><dd>{ro.all.join("  ")}</dd>
        <dt>selected v</dt><dd>{ro.v}</dd>
        <dt>Δv piezo (stiff − bare)</dt><dd>{ro.dv}</dd>
        <dt>power-flow angle</dt><dd>{ro.pfa}</dd>
        <dt>polarization u</dt><dd>{ro.pol}</dd>
        <dt>n</dt><dd>{nProbe.map((c) => sf(c, 1, 3)).join(" ")}</dd>
      </dl>
      <div class="snd-ctl" style="border-top:0;padding-left:0"><span class="lbl">Mode</span><Seg options={modeOpts} bind:value={f33.mode} label="Mode" /></div>
      <div class="snd-ctl" style="padding-left:0"><span class="lbl">Readouts</span><Seg options={stiffOpts} bind:value={f33.stiff} label="Stiffening" /></div>
    </div>
  </div>
  <div class="ctl"><label for="f33-a">Direction from {AX[f33.plane][2]}</label><input id="f33-a" type="range" min="0" max="360" step="0.5" bind:value={f33.ang} /><output for="f33-a">{ro.ang}</output></div>
  <div class="pf">Kushibiki et al. 1999 c<sup>E</sup>, e, ε<sup>S</sup>, ρ <Badge code="P" pop="r:kushibiki1999" /> Christoffel with stiffening <Badge code="derived" pop="m-christoffel" /> measured: Table II <Badge code="P" pop="r:kushibiki1999" /> frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f33">
  <div>
    <div class="snd-stage flat" bind:this={stage} role="img" aria-label="Nested slowness sheets of lithium niobate; the quasi-longitudinal sheet is tinted by the piezoelectric stiffening">
      <canvas bind:this={cv}></canvas><div class="lab" bind:this={lab}></div>
    </div>
    <div class="snd-legend" style="margin-top:12px"><span><i style="background:var(--v-ln)"></i>quasi-longitudinal, no stiffening</span><span><i style="background:var(--v-l532)"></i>stiffened by 230 m/s</span><span><i style="background:var(--v-text2);opacity:0.5"></i>shear sheets</span></div>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>Along the probe: {modeOpts[f33.mode].t}</h3>
      <div class="snd-big"><span class="snd-n" style="--nw:3.9em">{uf(vSel, 4, 1)}</span><small>m/s</small></div>
      <dl class="snd-vhud">
        <dt>piezo stiffening Δv</dt><dd>{ro.dv}</dd>
        <dt>power-flow angle</dt><dd>{ro.pfa}</dd>
        <dt>polarization</dt><dd>{ro.pol}</dd>
      </dl>
    </div>
    <div class="snd-card">
      <h3>Against Kushibiki et al. 1999 Table II</h3>
      <dl class="snd-vhud">
        <dt>Z longitudinal, measured 7328.20</dt><dd>{uf(zl, 4, 2)}</dd>
        <dt>Y shear along X, measured 3940.49</dt><dd>{uf(ys, 4, 2)}</dd>
      </dl>
    </div>
    <div class="v-ctl"><span class="v-lab">Constants</span><Seg visual options={[{ v: true, t: "With piezo stiffening" }, { v: false, t: "e = 0" }]} bind:value={f33.stiff} label="Stiffening" /></div>
    <div class="v-ctl"><span class="v-lab">Probe plane</span><Seg visual options={planeOpts} bind:value={f33.plane} label="Plane" /></div>
    <div class="v-ctl" style="--w:7ch"><label for="f33v-a">Probe direction, from {AX[f33.plane][2]}</label><output for="f33v-a">{ro.ang}</output><input id="f33v-a" type="range" min="0" max="360" step="0.5" bind:value={f33.ang} /></div>
    <div class="v-ctl"><span class="v-lab">Mode</span><Seg visual options={modeOpts} bind:value={f33.mode} label="Mode" /></div>
    <div class="v-ctl"><span class="v-lab">View</span><Seg visual options={[{ v: "oblique", t: "Oblique" }, { v: "top", t: "Down c" }, { v: "side", t: "Along X" }]} bind:value={f33.view} label="View" /></div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>Kushibiki et al. 1999 constants and Table II <Badge code="P" pop="r:kushibiki1999" /></span><span>Christoffel with stiffening <Badge code="derived" pop="m-christoffel" /></span><span>frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></span><span>sheet radius = slowness 1/v, 0.30 s/km at the box edge</span></div>

<h3 class="h3">Bulk velocities, computed vs measured (m/s)</h3>
<div class="scrollx">
  <table class="idx snd-tab">
    <thead><tr><th>Direction</th><th>Mode</th><th class="r">Measured</th><th class="r">Computed, stiffened</th><th class="r">Computed, e = 0</th></tr></thead>
    <tbody>
      {#each rows as r (r.m.dir + r.m.mode)}
        <tr><td class="h">{r.m.dir}</td><td>{r.m.mode === "L" ? (r.m.dir === "Y" ? "quasi-longitudinal" : "longitudinal") : r.m.dir === "Z" ? "shear (degenerate)" : r.m.dir === "Y" ? "shear, polarized along X" : "fast shear (resonance method)"}</td><td class="num">{r.m.v.toFixed(2)} &plusmn; {r.m.u.toFixed(2)} <Badge code="P" pop="r:kushibiki1999" /></td><td class="num">{r.vs.toFixed(2)} <Badge code="derived" pop="m-christoffel" /></td><td class="num">{r.vu.toFixed(2)}</td></tr>
      {/each}
    </tbody>
  </table>
</div>
