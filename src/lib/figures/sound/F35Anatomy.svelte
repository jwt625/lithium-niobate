<!-- Fig. 3.5 SAW anatomy (figures.md F3.5): partial-wave solution of saw.sawCut / saw.sawFields for five cuts, free or
     metallized surface. TECH: |u1|, |u2|, |u3|, |phi| and their instantaneous values vs depth, ASCII surface orbit.
     VISUAL: deformed x1-x3 section (sagittal displacement exaggerated, shear-horizontal u2 as tint, potential above the
     surface), animated only while the reader holds Play. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { f35, type CutPreset } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { r1 } from "./plot.ts";
  import { uf, zf } from "./f.ts";
  import { fitCanvas, rgb } from "./soft3d.ts";
  import { canvasHooks, tok } from "./page.ts";
  import type { SawPreset } from "./types";

  let { presets }: { presets: SawPreset[] } = $props();
  const pr = $derived(presets.find((p) => p.id === f35.cut) ?? presets[1]);
  const P = $derived(f35.surface === "open" ? pr.open : pr.short);
  const n = $derived(P.depth.length);
  const ph = $derived((f35.phase * Math.PI) / 180);
  // instantaneous value at x1 = 0: Re(U e^{-i phase})
  const inst = (c: number[], i: number, a: number): number => c[2 * i] * Math.cos(a) + c[2 * i + 1] * Math.sin(a);
  const mag = (c: number[], i: number): number => Math.hypot(c[2 * i], c[2 * i + 1]);
  const phiMax = $derived(Math.max(1e-12, ...Array.from({ length: n }, (_, i) => mag(P.c[3], i))));
  const comps = $derived([0, 1, 2, 3].map((k) => {
    const s = k === 3 ? 1 / phiMax : 1;
    let m = "", r = "";
    for (let i = 0; i < n; i++) {
      const y = 14 + (-P.depth[i] / 3) * 220;
      m += `${i ? "L" : "M"}${r1(60 + 50 * s * mag(P.c[k], i))} ${r1(y)}`;
      r += `${i ? "L" : "M"}${r1(60 + 50 * s * inst(P.c[k], i, ph))} ${r1(y)}`;
    }
    return { m, r };
  }));
  const NAMES = ["u₁ along x₁", "u₂ shear-horizontal", "u₃ normal", "φ potential"];
  // ASCII orbit of the surface particle (u1 horizontal, u3 vertical), 9 rows x 21 columns
  const orbit = $derived.by(() => {
    const rows = 9, cols = 21, g = Array.from({ length: rows }, () => Array(cols).fill(" "));
    const a1 = mag(P.c[0], 0), a3 = mag(P.c[2], 0), A = Math.max(a1, a3, 1e-9);
    for (let k = 0; k < 48; k++) {
      const a = (2 * Math.PI * k) / 48, x = inst(P.c[0], 0, a) / A, z = inst(P.c[2], 0, a) / A;
      const cx = Math.round(10 + 9 * x), cy = Math.round(4 - 4 * z);
      if (cy >= 0 && cy < rows && cx >= 0 && cx < cols) g[cy][cx] = "·";
    }
    const x0 = inst(P.c[0], 0, ph) / A, z0 = inst(P.c[2], 0, ph) / A;
    const cx = Math.round(10 + 9 * x0), cy = Math.round(4 - 4 * z0);
    if (cy >= 0 && cy < rows && cx >= 0 && cx < cols) g[cy][cx] = "●";
    g[4][10] = g[4][10] === " " ? "+" : g[4][10];
    return g.map((r) => r.join("")).join("\n");
  });
  const ro = $derived({
    lam: uf(P.v / 1e3, 1, 3) + " µm at 1 GHz",
    orbit: P.orbit.padEnd(10, " "),
    frac: uf(P.frac * 100, 2, 1) + " %",
    v: uf(P.v, 4, 1) + (P.vIm ? ` − ${Math.abs(P.vIm).toFixed(3)}i` : "") + " m/s",
    ph: zf(f35.phase, 3, 0) + "°",
  });
  const cutOpts = $derived(presets.map((p) => ({ v: p.id as CutPreset, t: p.label })));
  const surfOpts = [{ v: "open" as const, t: "free" }, { v: "short" as const, t: "metallized" }];

  // ---------- VISUAL ----------
  let stage: HTMLDivElement | undefined = $state();
  let cv: HTMLCanvasElement | undefined = $state();
  const EXAG = 0.07; // peak displacement drawn as 0.07 wavelength
  function draw(): void {
    if (!cv || !stage || stage.offsetParent === null) return;
    const { ctx, W, H } = fitCanvas(cv);
    const top = 0.2 * H, lamPx = Math.min(W / 2.2, (H - top) / 2.6), x0 = 0, span = W / lamPx;
    const k2 = 2 * Math.PI;
    const ink = tok("--v-text2"), au = rgb(tok("--v-au")), nb = rgb(tok("--nb")), acc = rgb(tok("--v-l532"));
    // potential: tint columns above (vacuum, decays as e^{-k x3}) and below the surface
    const cell = 6;
    for (let py = 0; py < H; py += cell) {
      const x3 = (top - py) / lamPx; // wavelengths, > 0 in vacuum
      let ur = 0, ui = 0;
      if (x3 >= 0) { const d = Math.exp(-k2 * x3); ur = P.c[3][0] * d; ui = P.c[3][1] * d; }
      else { const i = Math.min(n - 1, Math.round((-x3 / 3) * (n - 1))); ur = P.c[3][2 * i]; ui = P.c[3][2 * i + 1]; }
      for (let px = 0; px < W; px += cell) {
        const x1 = (px - x0) / lamPx, a = k2 * x1 - ph;
        const v = (ur * Math.cos(a) - ui * Math.sin(a)) / phiMax;
        const c = v >= 0 ? acc : nb;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(Math.min(1, Math.abs(v)) * 0.22).toFixed(3)})`;
        ctx.fillRect(px, py, cell, cell);
      }
    }
    // deformed grid in the substrate
    const nx = Math.round(span * 16), nz = 40, dz = (H - top) / lamPx / nz;
    const node = (ix: number, iz: number): [number, number, number] => {
      const x1 = (ix / nx) * span, x3 = -iz * dz;
      const i = Math.min(n - 1, Math.round((-x3 / 3) * (n - 1)));
      const a = k2 * x1 - ph;
      const u1 = inst(P.c[0], i, -a), u2 = inst(P.c[1], i, -a), u3 = inst(P.c[2], i, -a);
      return [x0 + (x1 + EXAG * u1) * lamPx, top - (x3 + EXAG * u3) * lamPx, u2];
    };
    ctx.lineWidth = 1;
    for (let iz = 0; iz <= nz; iz++) {
      ctx.beginPath();
      for (let ix = 0; ix <= nx; ix++) { const [x, y] = node(ix, iz); if (ix) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.strokeStyle = iz === 0 ? tok("--v-ln") : ink; ctx.globalAlpha = iz === 0 ? 1 : 0.45; ctx.lineWidth = iz === 0 ? 2.5 : 1; ctx.stroke();
    }
    ctx.lineWidth = 1;
    for (let ix = 0; ix <= nx; ix++) {
      ctx.beginPath();
      for (let iz = 0; iz <= nz; iz++) { const [x, y] = node(ix, iz); if (iz) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.45; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // shear-horizontal u2: gold dots sized by |u2|
    for (let iz = 0; iz <= nz; iz += 2) for (let ix = 0; ix <= nx; ix += 2) {
      const [x, y, u2] = node(ix, iz);
      const r = Math.min(1, Math.abs(u2)) * 4.5;
      if (r < 0.4) continue;
      ctx.fillStyle = u2 >= 0 ? `rgb(${au.join(",")})` : `rgba(${au.join(",")},0.35)`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
    }
    // depth ticks
    ctx.fillStyle = tok("--v-text3"); ctx.font = "13px Inter, sans-serif";
    for (const d of [0, 1, 2]) { const y = top + d * lamPx; if (y < H - 6) { ctx.fillText(d ? `−${d} λ` : "surface", W - 64, y - 4); } }
    ctx.fillText("vacuum", W - 64, top - lamPx * 0.12);
  }
  let redraw = (): void => {};
  let play = $state(false);
  let raf = 0;
  function startPlay(e: PointerEvent): void {
    play = true;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    let t0 = performance.now(), p0 = f35.phase;
    const step = (t: number): void => { if (!play) return; f35.phase = Math.round((p0 + ((t - t0) / 1000) * 180) % 360); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  function stopPlay(): void { play = false; cancelAnimationFrame(raf); }
  onMount(() => {
    if (!stage) return;
    const off = canvasHooks(stage, () => draw());
    redraw = () => requestAnimationFrame(draw);
    return () => { off(); cancelAnimationFrame(raf); };
  });
  $effect(() => { void P; void f35.phase; redraw(); });
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f35" id="f35">
  <div class="ph"><span>SAW fields vs depth x<sub>3</sub>/λ, Kushibiki et al. 1999</span><Seg options={surfOpts} bind:value={f35.surface} label="Surface" /></div>
  <div class="snd-ctl" style="border-top:0"><span class="lbl">Cut</span><Seg options={cutOpts} bind:value={f35.cut} label="Cut preset" /></div>
  <div class="snd-prof">
    {#each [0, 1, 2, 3] as k (k)}
      <div class="snd-cell">
        <p class="snd-cap">{NAMES[k]}</p>
        <svg class="snd-svg" viewBox="0 0 120 244" role="img" aria-label="{NAMES[k]} versus depth">
          {#each [0, 1, 2, 3] as d (d)}<line class="gl" x1="6" x2="114" y1={14 + d * 73.3} y2={14 + d * 73.3} /><text class="tk" x="2" y={12 + d * 73.3}>{d ? `−${d}λ` : "0"}</text>{/each}
          <line class="ax" x1="60" x2="60" y1="14" y2="234" />
          <path class="c1" d={comps[k].m} /><path class="c2" d={comps[k].r} />
        </svg>
      </div>
    {/each}
    <div class="snd-cell">
      <p class="snd-cap">surface orbit (u₁ →, u₃ ↑)</p>
<pre class="snd-asc" aria-label="Surface particle orbit">{orbit}</pre>
      <dl class="snd-kv" style="border-top:0;padding:4px 0">
        <dt>v</dt><dd>{ro.v}</dd>
        <dt>λ</dt><dd>{ro.lam}</dd>
        <dt>orbit</dt><dd>{ro.orbit}</dd>
        <dt>E(&lt;1 λ)</dt><dd>{ro.frac}</dd>
      </dl>
    </div>
  </div>
  <div class="ctl"><label for="f35-p">Phase ωt</label><input id="f35-p" type="range" min="0" max="360" step="1" bind:value={f35.phase} /><output for="f35-p">{ro.ph}</output></div>
  <div class="snd-note">Solid: magnitude; dashed: value at the phase shown (x₁ = 0). u normalized to max |u| = 1; φ normalized separately. E(&lt;1 λ): share of ∫|u|²dx₃ within one wavelength (integrated to 3 λ).</div>
  <div class="pf">partial-wave solution, Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" /> <Badge code="derived" pop="m-saw" /> frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v wide" data-variant="visual" data-pair="f35">
  <div class="snd-stage wide flat" bind:this={stage} role="img" aria-label="Deformed cross-section of the crystal under a surface acoustic wave">
    <canvas bind:this={cv}></canvas>
  </div>
  <div class="snd-legend"><span><i style="background:var(--v-ln)"></i>surface</span><span><i style="background:var(--v-au)"></i>shear-horizontal motion u₂ (out of the page), dot size</span><span><i style="background:var(--v-l532)"></i>potential φ &gt; 0</span><span><i style="background:var(--nb)"></i>φ &lt; 0</span><span>displacement drawn ×{EXAG} λ at the peak</span></div>
  <div class="snd-row3">
    <div class="snd-card">
      <h3>{pr.label}, {pr.wave}, {f35.surface === "open" ? "free surface" : "metallized"}</h3>
      <div class="snd-big"><span class="snd-n" style="--nw:3.9em">{uf(P.v, 4, 1)}</span><small>m/s</small></div>
      <dl class="snd-vhud"><dt>wavelength at 1 GHz</dt><dd>{ro.lam.replace(" at 1 GHz", "")}</dd><dt>surface orbit</dt><dd>{ro.orbit}</dd><dt>energy within 1 λ (of ∫|u|²dx₃ to 3 λ)</dt><dd>{ro.frac}</dd></dl>
    </div>
    <div class="snd-vctl">
      <div class="v-ctl"><span class="v-lab">Cut</span><Seg visual options={cutOpts} bind:value={f35.cut} label="Cut preset" /></div>
      <div class="v-ctl"><span class="v-lab">Surface</span><Seg visual options={[{ v: "open", t: "Free" }, { v: "short", t: "Metallized" }]} bind:value={f35.surface} label="Surface" /></div>
      <div class="v-ctl" style="--w:5ch"><label for="f35v-p">Phase ωt</label><output for="f35v-p">{ro.ph}</output><input id="f35v-p" type="range" min="0" max="360" step="1" bind:value={f35.phase} /></div>
      <div><button type="button" class="snd-hold" class:on={play} onpointerdown={startPlay} onpointerup={stopPlay} onpointercancel={stopPlay} onpointerleave={stopPlay} aria-pressed={play}>Hold to play</button></div>
    </div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>partial-wave solution, Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" /> <Badge code="derived" pop="m-saw" /></span><span>frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></span><span>u normalized to max |u| = 1, φ separately</span><span>section along x₁ (propagation) and depth x₃, to scale in wavelengths</span></div>
