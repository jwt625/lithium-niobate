<!-- Fig. 3.6 IDT designer (figures.md F3.6): f0 = v/p with v from the partial-wave solver for the chosen cut and surface;
     normalized array factor H(f) = sin X/(N sin(X/N)), X = N pi (f - f0)/f0 (saw.idtArrayFactor), nulls at f0(1 +- 1/N).
     Absolute conductance is not modelled. TECH: |H|^2 in dB, ASCII comb with the wavelength
     row to scale. VISUAL: top view of the comb on the die with the wave field summed gap by gap at a test tone. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { idtArrayFactor, idtF0, idtNullBandwidth } from "$lib/physics/saw.ts";
  import { f36 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { lin, path, r1, ticks } from "./plot.ts";
  import { uf, zf, sf } from "./f.ts";
  import { fitCanvas, rgb } from "./soft3d.ts";
  import { canvasHooks, tok } from "./page.ts";
  import type { IdtCut } from "./types";

  let { cuts }: { cuts: IdtCut[] } = $props();
  const cut = $derived(cuts.find((c) => c.id === f36.cut) ?? cuts[0]);
  const v = $derived(f36.surface === "open" ? cut.open : cut.short);
  let lp = $state(Math.log10(f36.p_um / 0.5));
  $effect(() => { f36.p_um = 0.5 * 10 ** lp; });
  const f0 = $derived(idtF0(v, f36.p_um * 1e-6));
  const bw = $derived(idtNullBandwidth(f0, f36.N) / f0);
  const fT = $derived(f0 * (1 + f36.tone));
  const HT = $derived(idtArrayFactor(fT, f0, f36.N));
  const fmtF = (f: number): string => (f >= 1e9 ? uf(f / 1e9, 2, 3) + " GHz" : uf(f / 1e6, 4, 1) + " MHz");
  const ro = $derived({
    f0: fmtF(f0), v: uf(v, 4, 1) + " m/s", p: uf(f36.p_um, 2, 3) + " µm", N: String(f36.N).padStart(3, " "),
    w: uf((f36.eta * f36.p_um) / 2, 2, 3) + " µm", bw: uf(bw * 100, 3, 2) + " %", eta: f36.eta.toFixed(2),
    tone: sf(f36.tone * 100, 2, 2) + " %", toneN: sf(f36.tone * f36.N, 2, 2), H2: sf(10 * Math.log10(Math.max(1e-12, HT * HT)), 3, 1) + " dB",
  });
  // response plot
  let mw = $state(0);
  const W = $derived(mw > 120 ? mw : 900);
  const H = 220, L = 46, R = 12, T = 10, B = 26;
  const SPAN = 0.2;
  const xs = Array.from({ length: 801 }, (_, i) => 1 - SPAN + (2 * SPAN * i) / 800);
  const sx = $derived(lin(1 - SPAN, 1 + SPAN, L, W - R));
  let logY = $state(true);
  const sy = $derived(logY ? lin(-50, 0, H - B, T) : lin(0, 1, H - B, T));
  const ys = $derived(xs.map((x) => { const h = idtArrayFactor(x * f0, f0, f36.N), p = h * h; return logY ? Math.max(-50, 10 * Math.log10(Math.max(p, 1e-9))) : p; }));
  const curve = $derived(path(xs, ys, sx, sy));
  const yT = $derived(logY ? [-50, -40, -30, -20, -10, 0] : ticks(0, 1, 4));
  const nulls = $derived([1 - 1 / f36.N, 1 + 1 / f36.N].filter((x) => x >= 1 - SPAN && x <= 1 + SPAN));
  // ASCII comb: up to 40 pairs, 4 characters per period (finger, gap, finger, gap)
  const ascii = $derived.by(() => {
    const n = Math.min(40, f36.N), w = 4 * n + 1;
    const top = "=".repeat(w), bot = "=".repeat(w);
    let a = "", b = "";
    for (let i = 0; i < n; i++) { a += " |  "; b += "   |"; }
    const wv = "/‾\\_".repeat(n);
    return `${top}\n${a}\n${a}\n${b}\n${b}\n${bot}\n${wv.slice(0, w)}  λ = p\n${f36.N > 40 ? `(first 40 of ${f36.N} pairs drawn)` : `${f36.N} pair${f36.N > 1 ? "s" : ""}`}`;
  });
  const cutOpts = $derived(cuts.map((c) => ({ v: c.id, t: c.label })));

  // ---------- phasor sum: pair n contributes (1/N) exp(i phi_n), phi_n = -2 pi delta n (delta = (f - f0)/f0);
  // |sum| = |sin X / (N sin(X/N))| = |H(f)| (same array factor as saw.idtArrayFactor) ----------
  const phasors = $derived.by(() => {
    const N = f36.N, a = -2 * Math.PI * f36.tone;
    const pts: [number, number][] = [[0, 0]];
    let x = 0, y = 0;
    for (let n = 0; n < N; n++) { x += Math.cos(n * a) / N; y += Math.sin(n * a) / N; pts.push([x, y]); }
    const arg = Math.hypot(x, y) > 1e-6 ? Math.atan2(y, x) : 0;
    const proj = Array.from({ length: N }, (_, n) => Math.cos(n * a - arg));
    return { pts, mag: Math.hypot(x, y), arg, proj, spread: Math.abs(a) * (N - 1) * 180 / Math.PI };
  });
  const PS = 150; // px for the full synchronous sum
  const chain = $derived.by(() => {
    const P = phasors.pts, segs: { d: string; pos: boolean }[] = [];
    for (let n = 0; n < P.length - 1; n++) segs.push({ d: `M${r1(40 + P[n][0] * PS)} ${r1(120 - P[n][1] * PS)}L${r1(40 + P[n + 1][0] * PS)} ${r1(120 - P[n + 1][1] * PS)}`, pos: phasors.proj[n] >= 0 });
    return segs;
  });
  const endPt = $derived(phasors.pts[phasors.pts.length - 1]);
  // mini |H| vs detuning plot (VISUAL)
  const HW = 230, HH = 110;
  const hx = lin(-0.2, 0.2, 10, HW - 10), hy = lin(0, 1, HH - 18, 8);
  const hPath = $derived(path(xs.map((x) => x - 1), xs.map((x) => Math.abs(idtArrayFactor(x * f0, f0, f36.N))), hx, hy));

  // ---------- VISUAL: comb top view + summed wave field ----------
  let stage: HTMLDivElement | undefined = $state();
  let cv: HTMLCanvasElement | undefined = $state();
  function draw(): void {
    if (!cv || !stage || stage.offsetParent === null) return;
    const { ctx, Wc, Hc } = (() => { const r = fitCanvas(cv as HTMLCanvasElement); return { ctx: r.ctx, Wc: r.W, Hc: r.H }; })();
    const N = f36.N, die = rgb(tok("--v-ln")), au = tok("--v-au"), acc = rgb(tok("--v-l532"));
    ctx.fillStyle = `rgba(${die.join(",")},0.08)`; ctx.fillRect(0, 0, Wc, Hc);
    const x0 = 24, idtW = Math.min(0.58 * Wc, Math.max(30, N * Math.min(44, (0.58 * Wc) / N))), pp = idtW / N; // px per period
    const yTop = 0.12 * Hc, yBot = 0.52 * Hc, busH = 10;
    // field strip under the comb and to the right: travelling to +x, built gap by gap; 2 gaps per period, alternating sign
    const k = (2 * Math.PI * (1 + f36.tone)) / pp; // wavenumber of the test tone, px^-1 (lambda_t = p f0/f)
    const yF0 = yBot + 24, yF1 = Hc - 50;
    for (let px = x0; px < Wc; px += 2) {
      let re = 0, im = 0;
      for (let g = 0; g < 2 * N; g++) {
        const xg = x0 + (g + 0.5) * (pp / 2);
        if (xg > px) break;
        const s = g % 2 ? -1 : 1, a = -k * xg;
        re += s * Math.cos(a); im += s * Math.sin(a);
      }
      const amp = Math.hypot(re, im) / (2 * N);
      const val = (re * Math.cos(k * px) - im * Math.sin(k * px)) / (2 * N);
      const t = Math.max(0, Math.min(1, 0.5 + 0.5 * val / Math.max(amp, 1e-9))) * Math.min(1, amp * 1.0);
      ctx.fillStyle = `rgba(${acc.join(",")},${(t * 0.9).toFixed(3)})`;
      ctx.fillRect(px, yF0, 2, yF1 - yF0);
      // envelope trace
      ctx.fillStyle = tok("--v-text");
      ctx.fillRect(px, yF1 + 8 - Math.min(1, amp) * 34, 2, 2);
    }
    // comb: two buses, interleaved fingers, width = eta p / 2
    ctx.fillStyle = au;
    ctx.fillRect(x0 - 6, yTop - busH, idtW + 12, busH);
    ctx.fillRect(x0 - 6, yBot, idtW + 12, busH);
    const fw = Math.max(1, (f36.eta * pp) / 2);
    const nb = rgb(tok("--nb"));
    for (let i = 0; i < N; i++) {
      const q = phasors.proj[i] ?? 1, c = q >= 0 ? acc : nb;
      ctx.fillStyle = `rgba(${c.join(",")},${(0.12 + 0.5 * Math.abs(q)).toFixed(3)})`;
      ctx.fillRect(x0 + i * pp + 1, yTop - 2, pp - 2, yBot - yTop + 2);
    }
    ctx.fillStyle = au;
    for (let i = 0; i < N; i++) {
      const xa = x0 + i * pp + pp / 4 - fw / 2, xb = x0 + i * pp + (3 * pp) / 4 - fw / 2;
      ctx.fillRect(xa, yTop, fw, yBot - yTop - 8);
      ctx.fillRect(xb, yTop + 8, fw, yBot - yTop - 8);
    }
    ctx.fillStyle = tok("--v-text3"); ctx.font = "12px Inter, sans-serif";
    const y1 = yF1 + 8 - 34, y0 = yF1 + 8;
    ctx.fillRect(4, y1, 6, 1); ctx.fillRect(4, y0, 6, 1); ctx.fillRect(4, y1, 1, 34);
    ctx.fillText("1", 12, y1 + 4); ctx.fillText("0", 12, y0 + 4);
    ctx.fillText("envelope |Σ|/2N along the path (1 = all gaps in phase)", x0 + 10, Hc - 6);
  }
  let redraw = (): void => {};
  onMount(() => {
    if (!stage) return;
    const off = canvasHooks(stage, () => draw());
    redraw = () => requestAnimationFrame(draw);
    return off;
  });
  $effect(() => { void f36.N; void f36.tone; void f36.eta; void f36.p_um; redraw(); });
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f36" id="f36">
  <div class="ph"><span>Uniform IDT: synchronous frequency and array factor</span><Seg options={[{ v: "open", t: "free" }, { v: "short", t: "metallized" }]} bind:value={f36.surface} label="Surface" /></div>
  <div class="snd-ctl" style="border-top:0"><span class="lbl">Cut</span><Seg options={cutOpts} bind:value={f36.cut} label="Cut" /><span class="lbl">Axis</span><Seg options={[{ v: true, t: "dB" }, { v: false, t: "linear" }]} bind:value={logY} label="Response axis" /></div>
  <div class="snd-g2">
    <div class="snd-cell"><div bind:clientWidth={mw}>
      <p class="snd-cap">|H(f)|², f/f₀ from 0.8 to 1.2; dashed: −3 dB and first nulls f₀(1 ± 1/N); dotted: test tone</p>
      <svg class="snd-svg snd-fixh" style="height:{H}px" viewBox="0 0 {W} {H}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="IDT array factor">
        {#each yT as y (y)}<line class="gl" x1={L} x2={W - R} y1={r1(sy(y))} y2={r1(sy(y))} /><text class="tk" x={L - 5} y={r1(sy(y) + 3)} text-anchor="end">{logY ? y : y.toFixed(2)}</text>{/each}
        {#each [0.8, 0.9, 1, 1.1, 1.2] as x (x)}<text class="tk" x={r1(sx(x))} y={H - 9} text-anchor="middle">{x.toFixed(1)}</text>{/each}
        <rect class="fr" x={L} y={T} width={W - R - L} height={H - B - T} />
        {#if logY}<line class="c4" x1={L} x2={W - R} y1={r1(sy(-3))} y2={r1(sy(-3))} />{:else}<line class="c4" x1={L} x2={W - R} y1={r1(sy(0.5))} y2={r1(sy(0.5))} />{/if}
        {#each nulls as x (x)}<line class="c4" x1={r1(sx(x))} x2={r1(sx(x))} y1={T} y2={H - B} />{/each}
        <path class="c1" d={curve} />
        <line class="c5" x1={r1(sx(1 + f36.tone))} x2={r1(sx(1 + f36.tone))} y1={T} y2={H - B} />
      </svg>
    </div></div>
    <div class="snd-cell">
<pre class="snd-asc snd-comb" aria-label="Comb drawn in text">{ascii}</pre>
      <dl class="snd-kv" style="border-top:0;padding:4px 0">
        <dt>v ({f36.surface === "open" ? "free" : "metallized"})</dt><dd>{ro.v}</dd>
        <dt>f₀ = v/p</dt><dd>{ro.f0}</dd>
        <dt>finger width ηp/2</dt><dd>{ro.w}</dd>
        <dt>null-to-null bandwidth 2/N</dt><dd>{ro.bw}</dd>
        <dt>test tone (f − f₀)/f₀</dt><dd>{ro.tone}</dd>
        <dt>in units of f₀/N</dt><dd>{ro.toneN}</dd>
        <dt>|H|² at the test tone</dt><dd>{ro.H2}</dd>
        <dt>|H| = |Σ of N pair phasors|/N</dt><dd>{phasors.mag.toFixed(3)}</dd>
        <dt>phase turned across the comb</dt><dd>{uf(phasors.spread % 100000, 5, 0)}°</dd>
      </dl>
    </div>
  </div>
  <div class="ctl"><label for="f36-p">Period p (one pair)</label><input id="f36-p" type="range" min="0" max="1.60206" step="any" bind:value={lp} /><output for="f36-p">{ro.p}</output></div>
  <div class="ctl"><label for="f36-n">Finger pairs N</label><input id="f36-n" type="range" min="1" max="200" step="1" bind:value={f36.N} /><output for="f36-n">{ro.N}</output></div>
  <div class="ctl"><label for="f36-e">Metallization η</label><input id="f36-e" type="range" min="0.3" max="0.7" step="0.01" bind:value={f36.eta} /><output for="f36-e">{ro.eta}</output></div>
  <div class="ctl"><label for="f36-t">Test tone detuning</label><input id="f36-t" type="range" min="-0.2" max="0.2" step="0.001" bind:value={f36.tone} /><output for="f36-t">{ro.tone}</output></div>
  <div class="snd-note">Measured TFLN IDT for comparison: 1.9 mS peak conductance, 3.36 MHz bandwidth (0.18%), matched to 50 Ω at 1.85 GHz (Jiang et al. 2020 arXiv v1 <Badge code="reported" pop="r:p05" />). Absolute conductance: not computed (needs the k², capacitance-per-pair and aperture prefactor).</div>
  <div class="pf">v: partial-wave solver, Kushibiki et al. 1999 <Badge code="derived" pop="m-saw" /> response: delta-function array factor <Badge code="derived" pop="m-idt" /> η is a display parameter <Badge code="template" pop="m-idt" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v wide" data-variant="visual" data-pair="f36">
  <div class="snd-stage wide flat" bind:this={stage} role="img" aria-label="Top view of the interdigital transducer on the crystal and the wave it launches at the test tone">
    <canvas bind:this={cv}></canvas>
  </div>
  <div class="snd-legend"><span><i style="background:var(--v-au)"></i>electrode fingers, width ηp/2, to scale with the wave</span><span><i style="background:var(--v-l532)"></i>finger pair in phase with the sum; wave crests</span><span><i style="background:var(--nb)"></i>finger pair against the sum</span></div>
  <div class="snd-card snd-phasor">
    <h3>Each finger pair adds one phasor of length 1/N, turned by 2π(f − f₀)/f₀ from its neighbour; the sum is H(f)</h3>
    <div class="snd-phrow">
      <svg class="snd-vsvg" viewBox="0 0 230 240" style="max-width:440px" role="img" aria-label="Phasor chain of the finger pairs at the test tone">
        <line class="gl" x1="40" y1="120" x2={40 + PS} y2="120" /><text x={40 + PS} y="136" text-anchor="end">1 (all in phase)</text>
        {#each chain as c, i (i)}<path d={c.d} stroke={c.pos ? "var(--v-l532)" : "var(--nb)"} stroke-width="2.2" fill="none" />{/each}
        <path class="au" d="M40 120L{r1(40 + endPt[0] * PS)} {r1(120 - endPt[1] * PS)}" stroke-width="3" />
        <circle cx="40" cy="120" r="3" fill="var(--v-text2)" />
      </svg>
      <svg class="snd-vsvg" viewBox="0 0 {HW} {HH + 10}" style="max-width:440px" role="img" aria-label="Magnitude of the array factor versus detuning">
        {#each [0, 0.5, 1] as v (v)}<line class="gl" x1="10" x2={HW - 10} y1={r1(hy(v))} y2={r1(hy(v))} /><text x={HW - 8} y={r1(hy(v) + 4)} text-anchor="end">{v}</text>{/each}
        <path class="acc" d={hPath} />
        <line class="au" x1={r1(hx(f36.tone))} x2={r1(hx(f36.tone))} y1="6" y2={HH - 16} />
        <circle class="auf" r="4" cx={r1(hx(f36.tone))} cy={r1(hy(phasors.mag))} />
        <text x="10" y={HH + 6}>−20%</text><text x={HW / 2} y={HH + 6} text-anchor="middle">f₀</text><text x={HW - 10} y={HH + 6} text-anchor="end">+20%</text>
      </svg>
    </div>
    <dl class="snd-vhud"><dt>|H| = |sum|, gold arrow</dt><dd>{phasors.mag.toFixed(3)}</dd><dt>phase turned across the comb</dt><dd>{uf(phasors.spread % 100000, 5, 0)}°</dd></dl>
  </div>
  <div class="snd-row3">
    <div class="snd-card">
      <h3>{cut.label}, {f36.surface === "open" ? "free" : "metallized"}: f₀ = v/p</h3>
      <div class="snd-big"><span class="snd-n" style="--nw:4.6em">{ro.f0.replace(/ [MG]Hz/, "")}</span><small class="u3">{ro.f0.slice(-3)}</small></div>
      <dl class="snd-vhud"><dt>test tone off f₀</dt><dd>{ro.tone}  ({ro.toneN} f₀/N)</dd><dt>response at the test tone</dt><dd>{ro.H2}</dd><dt>null-to-null bandwidth</dt><dd>{ro.bw}</dd><dt>finger width ηp/2</dt><dd>{ro.w}</dd><dt>v used</dt><dd>{ro.v}</dd></dl>
    </div>
    <div class="snd-vctl">
      <div class="v-ctl" style="--w:8ch"><label for="f36v-t">Test tone</label><output for="f36v-t">{ro.tone}</output><input id="f36v-t" type="range" min="-0.2" max="0.2" step="0.001" bind:value={f36.tone} /></div>
      <div class="v-ctl" style="--w:5ch"><label for="f36v-n">Finger pairs N</label><output for="f36v-n">{ro.N}</output><input id="f36v-n" type="range" min="1" max="200" step="1" bind:value={f36.N} /></div>
      <div class="v-ctl" style="--w:9ch"><label for="f36v-p">Period p</label><output for="f36v-p">{ro.p}</output><input id="f36v-p" type="range" min="0" max="1.60206" step="any" bind:value={lp} /></div>
      <div class="v-ctl"><span class="v-lab">Cut</span><Seg visual options={cutOpts} bind:value={f36.cut} label="Cut" /></div>
      <div class="v-ctl"><span class="v-lab">Surface</span><Seg visual options={[{ v: "open", t: "Free" }, { v: "short", t: "Metallized" }]} bind:value={f36.surface} label="Surface" /></div>
      <div class="v-ctl" style="--w:5ch"><label for="f36v-e">Metallization η</label><output for="f36v-e">{ro.eta}</output><input id="f36v-e" type="range" min="0.3" max="0.7" step="0.01" bind:value={f36.eta} /></div>
    </div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>v from the partial-wave solver <Badge code="derived" pop="m-saw" /></span><span>array factor, delta-function model <Badge code="derived" pop="m-idt" /></span><span>η is a display parameter <Badge code="template" pop="m-idt" /></span><span>absolute conductance not computed</span><span>Jiang et al. 2020 TFLN IDT 1.9 mS, 3.36 MHz (0.18%) at 1.85 GHz <Badge code="reported" pop="r:p05" /></span></div>
