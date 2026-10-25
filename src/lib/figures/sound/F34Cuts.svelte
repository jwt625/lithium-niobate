<!-- Fig. 3.4 rotated Y-X cut sweep (figures.md F3.4): rotated Y-X cuts, (YXl) theta, X propagation; Rayleigh and leaky SAW,
     free and metallized surface, k^2 = 2 (v_free - v_met)/v_free. Data: build-time sweep at 0.5 deg from saw.sawSweepRotY
     (static/data/sound/saw-sweep-<set>.json, generator gen-saw-sweep.ts). Only isolated roots are plotted; threshold-
     pinned points are gaps. TECH: stacked velocity and k^2 panels. VISUAL: boule dial with the cutting plane and wafer. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { f34, type SawSetId } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { lin, logS, path, r1, ticks, decades, dec } from "./plot.ts";
  import { uf, zf } from "./f.ts";
  import type { SweepSet } from "./types";

  let { initial, theta }: { initial: SweepSet; theta: number[] } = $props();
  const cache = $state<Partial<Record<SawSetId, SweepSet>>>({});
  $effect.pre(() => { if (!cache.kushibiki1999) cache.kushibiki1999 = initial; });
  let shown = $state<SawSetId>("kushibiki1999");
  $effect(() => {
    const want = f34.set;
    if (cache[want]) { shown = want; return; }
    let alive = true;
    fetch(`/data/sound/saw-sweep-${want}.json`).then((r) => r.json()).then((j) => { if (!alive) return; cache[want] = j.sets[want]; shown = want; }).catch(() => {});
    return () => { alive = false; };
  });
  const S = $derived(cache[shown] ?? initial);
  const idx = $derived(Math.max(0, Math.min(theta.length - 1, Math.round(f34.theta * 2))));
  const pick = (arr: (number | null)[], st?: string[]) => arr.map((v, i) => (v === null || (st && st[i] !== "r") ? NaN : v));
  const thr = $derived(S.thresholds_mps);

  // ---- plot (a) velocity ----
  let mw = $state(0);
  const W = $derived(mw > 120 ? mw : 1100);
  const HA = 300, HB = 200, L = 52, R = 14, T = 12;
  const sx = $derived(lin(0, 180, L, W - R));
  const VLO = 3300, VHI = 4850;
  const sy = lin(VLO, VHI, HA - 26, T);
  const rayF = $derived(path(theta, pick(S.ray.vf), sx, sy));
  const rayM = $derived(path(theta, pick(S.ray.vm), sx, sy));
  const lsF = $derived(path(theta, pick(S.lsaw.vf, S.lsaw.sf), sx, sy));
  const lsM = $derived(path(theta, pick(S.lsaw.vm, S.lsaw.sm), sx, sy));
  // ---- plot (b) k^2 (%) ----
  const k2L = $derived(S.lsaw.k2.map((k, i) => (k !== null && S.lsaw.sf[i] === "r" && S.lsaw.sm[i] === "r" ? k * 100 : NaN)));
  const k2Li = $derived(S.lsaw.k2.map((k, i) => (k !== null && !(S.lsaw.sf[i] === "r" && S.lsaw.sm[i] === "r") ? k * 100 : NaN)));
  const k2R = $derived(S.ray.k2.map((k) => (k === null ? NaN : k * 100)));
  const syB = $derived(f34.logK ? logS(0.01, 30, HB - 24, 8) : lin(0, 24, HB - 24, 8));
  const yb = (v: number): number => (f34.logK ? (v > 0.01 ? syB(v) : NaN) : syB(v));
  const pB = (arr: number[]): string => path(theta, arr.map((v) => (f34.logK && !(v > 0.01) ? NaN : v)), sx, syB);
  const kTicks = $derived(f34.logK ? decades(0.01, 30) : ticks(0, 24, 4));
  const CUTS = [41, 64, 128];
  const VEND: [number, number][] = [[128, 3980], [64, 4690], [41, 4750]];

  // ---- readouts ----
  const fv = (v: number | null, ok = true): string => (v === null || !ok ? "  ---.-" : uf(v, 4, 1));
  const fk = (k: number | null): string => (k === null || !Number.isFinite(k) ? "---.--" : uf(k * 100, 2, 2));
  const fl = (v: number | null): string => (v === null ? "  ------" : v < 0.001 ? v.toExponential(1).replace("e-", "e−").padStart(8, " ") : uf(v, 1, 4).padStart(8, " "));
  const ro = $derived.by(() => {
    const i = idx, ls = S.lsaw;
    const okF = ls.sf[i] === "r", okM = ls.sm[i] === "r";
    return {
      th: zf(theta[i], 3, 1) + "°",
      rf: fv(S.ray.vf[i]), rm: fv(S.ray.vm[i]), rk: fk(S.ray.k2[i]),
      lf: fv(ls.vf[i], okF), lm: fv(ls.vm[i], okM), lk: okF && okM ? fk(ls.k2[i]) : ls.k2[i] !== null ? fk(ls.k2[i]) + "*" : "---.--",
      lossF: fl(okF ? ls.lf[i] : null), lossM: fl(okM ? ls.lm[i] : null),
      note: okF && okM ? "both leaky roots isolated" : ls.k2[i] !== null ? "* one surface threshold-pinned: k² indicative" : "no isolated leaky root",
    };
  });
  // gap list: theta ranges where the free or metallized leaky root is not isolated
  const gaps = $derived.by(() => {
    const rng = (st: string[]): string => {
      const out: string[] = [];
      let a = -1;
      for (let i = 0; i <= st.length; i++) {
        const bad = i < st.length && st[i] !== "r";
        if (bad && a < 0) a = i;
        if (!bad && a >= 0) { out.push(a === i - 1 ? `${theta[a]}` : `${theta[a]}-${theta[i - 1]}`); a = -1; }
      }
      return out.join(", ") || "none";
    };
    return { f: rng(S.lsaw.sf), m: rng(S.lsaw.sm) };
  });
  const setOpts = [{ v: "kushibiki1999" as const, t: "Kushibiki 1999" }, { v: "ogi2002" as const, t: "Ogi 2002" }, { v: "warner1967" as const, t: "Warner 1967" }];

  // ---- VISUAL boule dial ----
  const BC = 170, BR = 132;
  const nrm = $derived([Math.cos(f34.theta * Math.PI / 180), Math.sin(f34.theta * Math.PI / 180)]); // Y', in (Y, Z) screen coords
  let dial: SVGSVGElement | undefined = $state();
  let drag = false;
  function setFrom(e: PointerEvent): void {
    if (!dial) return;
    const r = dial.getBoundingClientRect(), k = 340 / r.width;
    const x = (e.clientX - r.left) * k - BC, y = BC - (e.clientY - r.top) * k;
    if (Math.hypot(x, y) < 12) return;
    let a = (Math.atan2(y, x) * 180) / Math.PI;
    a = ((a % 180) + 180) % 180;
    f34.theta = Math.round(a * 2) / 2;
  }
  const kR = $derived((S.ray.k2[idx] ?? 0) * 100);
  const kL = $derived(S.lsaw.k2[idx] !== null ? (S.lsaw.k2[idx] as number) * 100 : 0);
  // mini plots (VISUAL)
  const VW = 520, VH = 150;
  const vsx = lin(0, 180, 40, VW - 10);
  const vsk = lin(0, 22, VH - 22, 8);
  const vR = $derived(path(theta, k2R, vsx, vsk));
  const vL = $derived(path(theta, k2L, vsx, vsk));
  onMount(() => {});
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f34" id="f34">
  <div class="ph"><span>Rotated Y-X cuts, (YXl) θ, propagation along X</span><Seg options={setOpts} bind:value={f34.set} label="Constant set" /></div>
  <div class="snd-cell"><div bind:clientWidth={mw}>
    <p class="snd-cap">(a) phase velocity, m/s. Solid: free surface; dashed: metallized. Bold: Rayleigh; thin: leaky SAW; ◇ vendor</p>
    <svg class="snd-svg snd-fixh" style="height:{HA}px" viewBox="0 0 {W} {HA}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="SAW velocity versus cut angle">
      {#each ticks(VLO, VHI, 6) as v (v)}<line class="gl" x1={L} x2={W - R} y1={r1(sy(v))} y2={r1(sy(v))} /><text class="tk" x={L - 5} y={r1(sy(v) + 3)} text-anchor="end">{v}</text>{/each}
      {#each [0, 30, 60, 90, 120, 150, 180] as t (t)}<text class="tk" x={r1(sx(t))} y={HA - 10} text-anchor="middle">{t}°</text>{/each}
      <rect class="fr" x={L} y={T} width={W - R - L} height={HA - 26 - T} />
      {#each [thr[2], thr[1]] as v, i (i)}<line class="c5" x1={L} x2={W - R} y1={r1(sy(v))} y2={r1(sy(v))} /><text class="tk" x={W - R - 4} y={r1(sy(v) - 3)} text-anchor="end">{i ? "fast shear" : "slow shear"} {v.toFixed(1)}</text>{/each}
      {#each CUTS as c (c)}<line class="c5" x1={r1(sx(c))} x2={r1(sx(c))} y1={T} y2={HA - 26} /><text class="tk" x={r1(sx(c) + 3)} y={T + 10}>{c}°</text>{/each}
      {#if f34.ray}<path class="c1" d={rayF} style="stroke-width:1.8" /><path class="c2" d={rayM} style="stroke-width:1.5" />{/if}
      {#if f34.lsaw}<path class="c3" d={lsF} /><path class="c4" d={lsM} />{/if}
      {#each VEND as [t, v] (t)}<path class="mko" d="M{r1(sx(t))} {r1(sy(v) - 4)}l4 4-4 4-4-4z"><title>vendor (Fomos-Materials, V): {v} m/s at {t}°</title></path>{/each}
      <line class="cur" x1={r1(sx(f34.theta))} x2={r1(sx(f34.theta))} y1={T} y2={HA - 26} />
    </svg>
    <p class="snd-cap">(b) k² = 2(v<sub>free</sub> − v<sub>met</sub>)/v<sub>free</sub>, %. Dots: one surface threshold-pinned (indicative)</p>
    <svg class="snd-svg snd-fixh" style="height:{HB}px" viewBox="0 0 {W} {HB}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Coupling versus cut angle">
      {#each kTicks as v (v)}<line class="gl" x1={L} x2={W - R} y1={r1(syB(v))} y2={r1(syB(v))} /><text class="tk" x={L - 5} y={r1(syB(v) + 3)} text-anchor="end">{f34.logK ? dec(v) : v}</text>{/each}
      {#each [0, 30, 60, 90, 120, 150, 180] as t (t)}<text class="tk" x={r1(sx(t))} y={HB - 9} text-anchor="middle">{t}°</text>{/each}
      <rect class="fr" x={L} y="8" width={W - R - L} height={HB - 32} />
      {#each CUTS as c (c)}<line class="c5" x1={r1(sx(c))} x2={r1(sx(c))} y1="8" y2={HB - 24} />{/each}
      {#if f34.ray}<path class="c1" d={pB(k2R)} style="stroke-width:1.8" />{/if}
      {#if f34.lsaw}<path class="c3" d={pB(k2L)} />{#each k2Li as v, i (i)}{#if Number.isFinite(v) && Number.isFinite(yb(v)) && i % 2 === 0}<circle class="mk" r="1.3" cx={r1(sx(theta[i]))} cy={r1(yb(v))} />{/if}{/each}{/if}
      <line class="cur" x1={r1(sx(f34.theta))} x2={r1(sx(f34.theta))} y1="8" y2={HB - 24} />
    </svg>
  </div></div>
  <div class="ctl"><label for="f34-t">Rotation θ (YXl)</label><input id="f34-t" type="range" min="0" max="180" step="0.5" bind:value={f34.theta} /><input class="snd-numin" type="number" min="0" max="180" step="0.5" bind:value={f34.theta} aria-label="Rotation angle in degrees" /></div>
  <div class="snd-ctl"><span class="lbl">Show</span><Seg options={[{ v: true, t: "Rayleigh" }, { v: false, t: "hide" }]} bind:value={f34.ray} label="Rayleigh branch" /><Seg options={[{ v: true, t: "leaky SAW" }, { v: false, t: "hide" }]} bind:value={f34.lsaw} label="Leaky branch" /><span class="lbl">k² axis</span><Seg options={[{ v: false, t: "lin" }, { v: true, t: "log" }]} bind:value={f34.logK} label="k squared axis" /></div>
  <div class="snd-x">
    <table class="idx snd-tab snd-ro4">
      <thead><tr><th>θ = {ro.th}</th><th class="r">v<sub>free</sub> m/s</th><th class="r">v<sub>met</sub> m/s</th><th class="r">k² %</th><th class="r">loss free dB/λ</th><th class="r">loss met dB/λ</th></tr></thead>
      <tbody>
        <tr><td class="h">Rayleigh</td><td class="num">{ro.rf}</td><td class="num">{ro.rm}</td><td class="num">{ro.rk} </td><td class="num">       0</td><td class="num">       0</td></tr>
        <tr><td class="h">leaky SAW</td><td class="num">{ro.lf}</td><td class="num">{ro.lm}</td><td class="num">{ro.lk.padEnd(7, " ")}</td><td class="num">{ro.lossF}</td><td class="num">{ro.lossM}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="snd-note snd-n2">{ro.note}. Leaky gaps (not isolated), free: {gaps.f}°; metallized: {gaps.m}°.</div>
  <div class="pf">partial-wave solver, sweep at 0.5° <Badge code="derived" pop="m-saw" /> constants: <span class="snd-stack"><span class:off={shown !== "kushibiki1999"}>Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" /></span><span class:off={shown !== "ogi2002"}>Ogi et al. 2002 c, e, ρ with Kushibiki et al. 1999 ε<sup>S</sup> <Badge code="P" pop="r:ogi2002" /></span><span class:off={shown !== "warner1967"}>Warner c (P-comp), e (S), ε<sup>S</sup> 44.3/27.9, ρ 4700 assumed <Badge code="P-comp" pop="r:weis1985" /></span></span> vendor markers <Badge code="V" pop="m-vendor" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f34">
  <div class="snd-card">
    <h3>Drag the cutting plane around X (X points out of the page)</h3>
    <svg class="snd-vsvg" bind:this={dial} viewBox="0 0 340 340" style="max-width:520px;touch-action:none;cursor:grab" role="slider" tabindex="0" aria-label="Cut rotation angle" aria-valuemin="0" aria-valuemax="180" aria-valuenow={f34.theta}
      onpointerdown={(e) => { drag = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setFrom(e); }} onpointermove={(e) => { if (drag) setFrom(e); }} onpointerup={() => (drag = false)} onpointercancel={() => (drag = false)}
      onkeydown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { f34.theta = Math.min(180, f34.theta + 0.5); e.preventDefault(); } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { f34.theta = Math.max(0, f34.theta - 0.5); e.preventDefault(); } }}>
      <circle cx={BC} cy={BC} r={BR} class="lnf" />
      {#each Array.from({ length: 12 }, (_, i) => i) as i (i)}<circle cx={BC} cy={BC} r={BR - 6 - i * 10} fill="none" stroke="var(--v-ln)" stroke-opacity="0.08" />{/each}
      <line class="ax" x1={BC - BR - 14} y1={BC} x2={BC + BR + 14} y2={BC} /><line class="ax" x1={BC} y1={BC - BR - 14} x2={BC} y2={BC + BR + 14} />
      <text x={BC + BR + 6} y={BC - 6} class="lbv">Y</text><text x={BC + 6} y={BC - BR - 4} class="lbv">Z (c)</text>
      <circle cx={BC} cy={BC} r="4" class="ink" /><circle cx={BC} cy={BC} r="1.5" fill="var(--v-text)" />
      <!-- wafer slab: chord perpendicular to Y' -->
      <g transform="rotate({r1(-f34.theta)} {BC} {BC})">
        <rect x={BC - 8} y={BC - BR + 6} width="16" height={2 * BR - 12} fill="var(--v-ln)" fill-opacity="0.55" stroke="var(--v-ln)" />
        <path class="au" d="M{BC + 10} {BC}H{BC + BR - 4}M{BC + BR - 14} {BC - 7}l10 7-10 7" />
      </g>
      <text x={r1(BC + (BR - 30) * nrm[0])} y={r1(BC - (BR - 30) * nrm[1] - 14)} class="lbv" style="fill:var(--v-au)">Y′</text>
      {#each CUTS as c (c)}<path d="M{r1(BC + (BR + 2) * Math.cos(c * Math.PI / 180))} {r1(BC - (BR + 2) * Math.sin(c * Math.PI / 180))}L{r1(BC + (BR + 12) * Math.cos(c * Math.PI / 180))} {r1(BC - (BR + 12) * Math.sin(c * Math.PI / 180))}" class="tx2" /><text x={r1(BC + (BR + 22) * Math.cos(c * Math.PI / 180))} y={r1(BC - (BR + 22) * Math.sin(c * Math.PI / 180) + 4)} text-anchor="middle">{c}°</text>{/each}
    </svg>
    <div class="snd-legend"><span><i style="background:var(--v-ln)"></i>wafer, edge-on</span><span><i style="background:var(--v-au)"></i>plate normal Y′ = Y cos θ + Z sin θ</span></div>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>(YXl) {ro.th}: which wave couples</h3>
      <svg class="snd-vsvg" viewBox="0 0 420 110" role="img" aria-label="Coupling of the two surface waves at this cut">
        <!-- Rayleigh: elliptical orbit, size follows k^2 -->
        <ellipse cx="70" cy="55" rx={r1(6 + 34 * Math.sqrt(kR / 22))} ry={r1(9 + 48 * Math.sqrt(kR / 22))} fill="none" stroke="var(--v-l532)" stroke-width="2" />
        <text x="70" y="106" text-anchor="middle">Rayleigh {uf(kR, 2, 2)}%</text>
        <!-- leaky: in-plane shear arrows -->
        {#each [-1, 0, 1] as k (k)}{@const h = 4 + 40 * Math.sqrt(kL / 22)}<path d="M{240 + k * 40} {r1(55 - h)}V{r1(55 + h)}M{236 + k * 40} {r1(59 - h)}l4 -4 4 4M{236 + k * 40} {r1(51 + h)}l4 4 4 -4" stroke="var(--v-au)" stroke-width="2" fill="none" visibility={S.lsaw.k2[idx] === null ? "hidden" : "visible"} />{/each}
        <text x="280" y="106" text-anchor="middle">leaky SAW {S.lsaw.k2[idx] === null ? "no root" : uf(kL, 2, 2) + "%"}</text>
      </svg>
      <dl class="snd-vhud">
        <dt>Rayleigh v free / metallized</dt><dd>{ro.rf} / {ro.rm} m/s</dd>
        <dt>leaky v free / metallized</dt><dd>{ro.lf} / {ro.lm} m/s</dd><dt>leaky loss free / metallized</dt><dd>{ro.lossF.trim().padStart(8, " ")} / {ro.lossM.trim().padStart(8, " ")} dB/λ</dd><dt>leaky k²</dt><dd>{ro.lk.padEnd(7, " ")} %</dd>
      </dl>
    </div>
    <div class="snd-card">
      <h3>k² vs θ: Rayleigh (green), leaky (gold); dots: one surface threshold-pinned (indicative)</h3>
      <svg class="snd-vsvg" viewBox="0 0 {VW} {VH}" role="img" aria-label="Coupling versus cut angle">
        {#each [0, 5, 10, 15, 20] as v (v)}<line class="gl" x1="40" x2={VW - 10} y1={r1(vsk(v))} y2={r1(vsk(v))} /><text x="32" y={r1(vsk(v) + 4)} text-anchor="end">{v}%</text>{/each}
        {#each [0, 45, 90, 135, 180] as t (t)}<text x={r1(vsx(t))} y={VH - 4} text-anchor="middle">{t}°</text>{/each}
        <path class="acc" d={vR} /><path class="au" d={vL} />{#each k2Li as v, i (i)}{#if Number.isFinite(v) && i % 2 === 0}<circle r="1.6" cx={r1(vsx(theta[i]))} cy={r1(vsk(v))} fill="var(--v-au)" />{/if}{/each}
        <line class="tx3" x1={r1(vsx(f34.theta))} x2={r1(vsx(f34.theta))} y1="6" y2={VH - 20} />
      </svg>
      <p class="v-cap snd-n2v">{ro.note}. Leaky gaps (not isolated), free: {gaps.f}°; metallized: {gaps.m}°.</p>
    </div>
    <div class="v-ctl" style="--w:7ch"><label for="f34v-t">Rotation θ</label><output for="f34v-t">{ro.th}</output><input id="f34v-t" type="range" min="0" max="180" step="0.5" bind:value={f34.theta} /></div>
    <div class="v-ctl"><span class="v-lab">Constants</span><Seg visual options={setOpts} bind:value={f34.set} label="Constant set" /></div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>partial-wave solver, 0.5° sweep <Badge code="derived" pop="m-saw" /></span><span class="snd-stack"><span class:off={shown !== "kushibiki1999"}>constants Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" /></span><span class:off={shown !== "ogi2002"}>constants Ogi et al. 2002 (ε<sup>S</sup> Kushibiki et al. 1999) <Badge code="P" pop="r:ogi2002" /></span><span class:off={shown !== "warner1967"}>constants Warner 1967, ρ 4700 assumed <Badge code="P-comp" pop="r:weis1985" /></span></span><span>orbit and arrow size ∝ √k²</span></div>
