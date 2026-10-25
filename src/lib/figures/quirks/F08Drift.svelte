<!-- fig-04-08 Drift simulator: series RC layers (pyro.ts stackStep / stackResponse, exact partial fractions of drift.ts).
     Layer 0 = LN film, layer 1 = partner (cladding for "TFLN clad", buried oxide otherwise), optional thin interface
     layer. sigma_i(T) = Arrhenius(sigma_i(295 K), E_a template). Bias phase phi(t) = (pi/2) h(t)/h(0+) (step to
     quadrature at t = 0+, V/V_pi = 0.5 template); T = cos^2(phi/2). Li+ migration is not a mechanism here (U, sec. 4.7). -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { stackStep, stackResponse, arrhenius, DRIFT_PRESETS, type StackLayer } from "$lib/physics/pyro.ts";
  import { axis, px, path, ticks, logspace, linspace } from "./plot.ts";
  import { e, f, sf, dur, pow10 } from "./fmtq.ts";

  type PId = "bulk" | "clad" | "airclad";
  let preset = $state<PId>("clad");
  const P0 = DRIFT_PRESETS.find((p) => p.id === "clad")!;
  let lgS0 = $state(Math.log10(P0.layers[0].sigma));
  let lgS1 = $state(Math.log10(P0.layers[1].sigma));
  let eps1 = $state(P0.layers[1].epsR);
  let iface = $state(false);
  let lgSi = $state(-12);
  let T = $state(295);
  let wave = $state<"step" | "square">("step");
  let lgPer = $state(-1.5);
  let lgt = $state(-2); // time cursor for the bias dot, log10 s
  const EA = 0.5; // eV, template

  function applyPreset(id: PId): void {
    const p = DRIFT_PRESETS.find((x) => x.id === id)!;
    lgS0 = Math.max(-18, Math.log10(p.layers[0].sigma));
    lgS1 = Math.max(-18, Math.log10(p.layers[1].sigma));
    eps1 = p.layers[1].epsR;
  }
  let last: PId = "clad";
  $effect(() => { if (preset !== last) { last = preset; applyPreset(preset); } });

  const P = $derived(DRIFT_PRESETS.find((p) => p.id === preset)!);
  const layers = $derived.by((): StackLayer[] => {
    const a = (lg: number) => arrhenius(10 ** lg, EA, T, 295);
    const L: StackLayer[] = [
      { ...P.layers[0], sigma: a(lgS0) },
      { ...P.layers[1], sigma: a(lgS1), epsR: eps1 },
    ];
    if (iface) L.push({ name: "interface", epsR: 28, sigma: a(lgSi), thickness_m: 10e-9 });
    return L;
  });
  const lim = $derived(stackStep(layers, 1, [0, 1e40]));
  const v0 = $derived(lim.V[0][0]), vInf = $derived(lim.V[0][1]);
  const taus = $derived(lim.taus);
  const positive = $derived(vInf > v0);
  const ts = logspace(1e-6, 1e6, 241);
  const stepV = $derived(stackStep(layers, 1, ts).V[0]);
  const per = $derived(10 ** lgPer);
  const tsq = $derived(linspace(0, 4 * per, 241));
  const sqV = $derived.by(() => {
    const out = new Float64Array(tsq.length);
    const nSteps = 8;
    const shifts: number[] = [];
    for (let k = 0; k <= nSteps; k++) shifts.push((k * per) / 2);
    for (let k = 0; k < shifts.length; k++) {
      const amp = k === 0 ? 1 : 2 * (k % 2 ? -1 : 1);
      const tt = Float64Array.from(tsq, (t) => Math.max(0, t - shifts[k]));
      const h = stackStep(layers, 1, tt).V[0];
      for (let i = 0; i < tsq.length; i++) if (tsq[i] >= shifts[k]) out[i] += amp * h[i];
    }
    return out;
  });
  const fs = logspace(1e-3, 1e6, 181);
  const H = $derived(stackResponse(layers, fs, 0).mag);
  const tNow = $derived(10 ** lgt);
  const hNow = $derived(stackStep(layers, 1, [tNow]).V[0][0]);
  const phi = $derived((Math.PI / 2) * (hNow / v0)); // unwrapped
  const phiW = $derived(((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)); // on the periodic transfer curve
  const Tm = (ph: number) => Math.cos(ph / 2) ** 2;

  // ---------- TECH geometry ----------
  const W = 560, HH = 210, X0 = 50, X1 = 548, Y0 = 16, Y1 = 178;
  const xt = axis(1e-6, 1e6, X0, X1, true);
  const yt = axis(0, 1.05, Y1, Y0);
  const xsq = $derived(axis(0, 4 * per, X0, X1));
  const ysq = axis(-1.1, 1.1, Y1, Y0);
  const xf = axis(1e-3, 1e6, X0, X1, true);
  const vxf = axis(1e-3, 1e6, 60, 620, true), vyf = axis(1e-4, 1.5, 136, 14, true);
  const yf = axis(1e-4, 1.5, Y1, Y0, true);
  const curve = Array.from({ length: 121 }, (_, i) => (i / 120) * 2 * Math.PI);
  const TW = 560, TH = 190;
  const tx = axis(0, 2 * Math.PI, 30, 548), ty = axis(0, 1, 160, 18);
  const tPath = path(tx, ty, curve, curve.map(Tm));
  const label = (lid: string) => ({ bulk: "bulk-like", clad: "TFLN clad", airclad: "TFLN air-clad" })[lid];

  // ---------- VISUAL ----------
  const relax = $derived(Math.abs(vInf - v0) > 1e-12 ? Math.min(1, Math.max(0, (hNow - v0) / (vInf - v0))) : 0);
  const nDots = $derived(Math.round(14 * relax));
  const arrowLen = $derived(10 + 60 * Math.min(1, hNow));
  let raf = 0;
  function run(): void {
    cancelAnimationFrame(raf);
    if (document.documentElement.dataset.fx !== "on") { lgt = 6; return; }
    const t0 = performance.now();
    const step = (): void => { const u = Math.min(1, (performance.now() - t0) / 4000); lgt = -6 + 12 * u; if (u < 1) raf = requestAnimationFrame(step); };
    lgt = -6;
    raf = requestAnimationFrame(step);
  }
  function relock(): void { cancelAnimationFrame(raf); lgt = -6; }
  onMount(() => () => cancelAnimationFrame(raf));

  // Footer bias meter (shared store from lane FIX-S): hand over the reader's stack, debounced. Loaded through a glob so the
  // page still works if the store module does not exist; then the footer line below is not rendered either.
  type BiasApi = { setBiasParams: (p: unknown) => void };
  const BIAS = import.meta.glob<BiasApi>("/src/lib/stores/bias.ts");
  const hasBias = Object.keys(BIAS).length > 0;
  let biasT = 0;
  $effect(() => {
    const p = { source: "/quirks/dc-bias-drift/", preset, layers: layers.map((l) => ({ name: l.name ?? "", epsR: l.epsR, sigma: l.sigma, thickness_m: l.thickness_m })), T_K: T, Ea_eV: EA, vOverVpi: 0.5, taus: [...taus] };
    if (!hasBias) return;
    clearTimeout(biasT);
    biasT = window.setTimeout(() => { void Object.values(BIAS)[0]?.().then((m) => m.setBiasParams(p)).catch(() => {}); }, 400);
    return () => clearTimeout(biasT);
  });
  const PRE: [PId, string][] = [["bulk", "bulk-like"], ["clad", "TFLN clad"], ["airclad", "TFLN air-clad"]];
</script>

<div class="q-fig" id="fig-04-08">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Drift simulator: series RC layers, voltage share on the LN film</span><span>1D series stack, unit area</span></div>
    <div class="q-two">
      <div>
        {#if wave === "step"}
          <svg class="q-svg" viewBox="0 0 {W} {HH}" role="img" aria-label="LN voltage share after a bias step versus time, log axis">
            {#each ticks(xt, 6, 2) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={Y0} y2={Y1} />{#if t.label}<text x={t.p} y={Y1 + 13} text-anchor="middle">{t.label}</text>{/if}{/each}
            {#each ticks(yt, 4) as t (t.v)}<line class="gl" x1={X0} x2={X1} y1={t.p} y2={t.p} /><text x={X0 - 4} y={t.p + 3} text-anchor="end">{t.label}</text>{/each}
            <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
            <path class="c0" d={path(xt, yt, ts, stepV)} />
            <line class="cur" x1={px(xt, tNow)} x2={px(xt, tNow)} y1={Y0} y2={Y1} />
            <text x={(X0 + X1) / 2} y={HH - 2} text-anchor="middle">t (s) after a bias step</text><text x={X0} y={Y0 - 4}>V<tspan dy="2" font-size="8">LN</tspan><tspan dy="-2"> / V</tspan></text>
          </svg>
        {:else}
          <svg class="q-svg" viewBox="0 0 {W} {HH}" role="img" aria-label="LN voltage share under a square-wave bias versus time">
            {#each ticks(ysq, 4) as t (t.v)}<line class="gl" x1={X0} x2={X1} y1={t.p} y2={t.p} /><text x={X0 - 4} y={t.p + 3} text-anchor="end">{t.label}</text>{/each}
            {#each [0, 1, 2, 3, 4] as k (k)}<line class="gl" x1={px(xsq, k * per)} x2={px(xsq, k * per)} y1={Y0} y2={Y1} /><text x={px(xsq, k * per)} y={Y1 + 13} text-anchor="middle">{k}T</text>{/each}
            <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
            <path class="c2" d={path(xsq, ysq, tsq, Float64Array.from(tsq, (t) => (Math.floor((2 * t) / per) % 2 ? -1 : 1)))} />
            <path class="c0" d={path(xsq, ysq, tsq, sqV)} />
            <text x={(X0 + X1) / 2} y={HH - 2} text-anchor="middle">t, period T = {dur(per).trim()}</text><text x={X0} y={Y0 - 4}>V<tspan dy="2" font-size="8">LN</tspan><tspan dy="-2"> / V (thin: applied)</tspan></text>
          </svg>
        {/if}
        <svg class="q-svg" viewBox="0 0 {W} {HH}" role="img" aria-label="Small-signal voltage share on the LN film versus frequency">
          <rect x={px(xf, 1e3)} y={Y0} width={px(xf, 2e4) - px(xf, 1e3)} height={Y1 - Y0} class="shade" />
          <text x={px(xf, 1e3) + 3} y={Y0 + 11} class="lab">reported band, one device</text>
          {#each ticks(xf, 6, 3) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={Y0} y2={Y1} />{#if t.label}<text x={t.p} y={Y1 + 13} text-anchor="middle">{t.label}</text>{/if}{/each}
          {#each ticks(yf, 4, 2) as t (t.v)}<line class="gl" x1={X0} x2={X1} y1={t.p} y2={t.p} />{#if t.label}<text x={X0 - 4} y={t.p + 3} text-anchor="end">{t.label}</text>{/if}{/each}
          <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          <path class="c0" d={path(xf, yf, fs, H)} />
          <text x={(X0 + X1) / 2} y={HH - 2} text-anchor="middle">f (Hz)</text><text x={X0} y={Y0 - 4}>|H(f)| = |V<tspan dy="2" font-size="8">LN</tspan><tspan dy="-2"> / V|</tspan></text>
        </svg>
      </div>
      <div>
        <svg class="q-svg" viewBox="0 0 {TW} {TH}" role="img" aria-label="Modulator transfer curve with the bias point">
          <rect class="fr" x="30" y="18" width="518" height="142" />
          <path class="c2" d={tPath} />
          <line class="c3" x1={px(tx, Math.PI / 2)} x2={px(tx, Math.PI / 2)} y1="18" y2="160" />
          <rect x={px(tx, phiW) - 4} y={px(ty, Tm(phi)) - 4} width="8" height="8" class="mk" />
          <text x="30" y="12">T = cos²(φ/2), dot at φ mod 2π</text><text x="30" y="176">0</text><text x={px(tx, Math.PI / 2)} y="176" text-anchor="middle">π/2</text><text x="548" y="176" text-anchor="end">2π</text>
        </svg>
        <dl class="q-kv q-f8kv">
          <dt>τ</dt><dd>{taus.length ? e(taus[0], 2, false) : "     n/a"} s{taus.length > 1 ? "," : " "} {taus.length > 1 ? e(taus[1], 2, false) : "        "}</dd>
          <dt>V<sub>LN</sub>(0+)/V</dt><dd>{f(v0, 3, 6)} V/V</dd>
          <dt>V<sub>LN</sub>(∞)/V</dt><dd>{f(vInf, 3, 6)} V/V</dd>
          <dt>drift</dt><dd>{positive ? "LN share grows (positive)" : "LN share shrinks (negative)"}</dd>
          <dt>t cursor</dt><dd>{e(tNow, 2, false)} s</dd>
          <dt>bias phase, unwrapped</dt><dd>{f((phi * 180) / Math.PI, 1, 8)} deg</dd>
        </dl>
        <table class="idx q-tab q-f8t">
          <colgroup><col style="width:34%"><col style="width:22%"><col style="width:16%"><col style="width:28%"></colgroup>
          <thead><tr><th>layer</th><th class="r">t</th><th class="r">ε<sub>r</sub></th><th class="r">σ(T), S/m</th></tr></thead>
          <tbody>{#each layers as l, i (i)}<tr><td>{l.name}</td><td class="r q-v">{f(l.thickness_m * 1e9, 0, 5)} nm</td><td class="r q-v">{f(l.epsR, 1, 4)}</td><td class="r q-v">{e(l.sigma, 1, false)}</td></tr>{/each}{#if !iface}<tr><td class="dim">interface off</td><td></td><td></td><td></td></tr>{/if}</tbody>
        </table>
      </div>
    </div>
    <div class="ctl"><span class="k">Preset</span><Seg bind:value={preset} options={PRE} label="Stack preset" /><span></span></div>
    <TCtl id="f8-s0-t" label="σ LN film" bind:value={lgS0} min={-18} max={-4} step={0.001} out="{e(10 ** lgS0, 2)} S/m" />
    <TCtl id="f8-s1-t" label="σ {preset === 'clad' ? 'cladding' : 'buried oxide'}" bind:value={lgS1} min={-18} max={-4} step={0.001} out="{e(10 ** lgS1, 2)} S/m" />
    <TCtl id="f8-e1-t" label="ε<sub>r</sub> partner" bind:value={eps1} min={2} max={10} step={0.1} out={f(eps1, 1, 5)} />
    <TCtl id="f8-si-t" label="σ interface" bind:value={lgSi} min={-18} max={-4} step={0.001} out="{e(10 ** lgSi, 2)} S/m" disabled={!iface} />
    <TCtl id="f8-T-t" label="Temperature" bind:value={T} min={77} max={400} step={1} out="{f(T, 0, 4)} K" />
    <TCtl id="f8-t-t" label="Bias dot time" bind:value={lgt} min={-6} max={6} step={0.02} out="{e(tNow, 2)} s" />
    <TCtl id="f8-p-t" label="Square period" bind:value={lgPer} min={-3} max={4} step={0.02} out="{e(per, 2)} s" disabled={wave !== "square"} />
    <div class="ctl"><span class="k">Interface</span><Seg bind:value={iface} options={[[false, "off"], [true, "10 nm layer"]]} label="Interface layer" /><span></span></div>
    <div class="ctl"><span class="k">Waveform</span><Seg bind:value={wave} options={[["step", "step"], ["square", "square"]]} label="Bias waveform" /><span></span></div>
    {#if hasBias}<p class="q-note q-biasline">The footer bias meter on every page now runs this stack with your settings.</p>{/if}
    <div class="pf">
      <span>presets tuned to the RC fits 11.9 ms (clad) and 88.6 &micro;s (air-clad) <Src id="li2026photonics" code="reported" cite={false} /></span>
      <span>1-20 kHz band <Src id="holzgrafe2024" code="reported" cite={false} /></span>
      <span>bulk &sigma;<sub>d</sub> range <Src id="volk2008" loc="p. 60" code="P-comp" cite={false} /></span>
      <span>thicknesses, oxide &epsilon; and &sigma;, interface layer, E<sub>a</sub> 0.5 eV, V/V<sub>&pi;</sub> 0.5: model parameters, no data <Badge code="template" pop="f8-tmpl" /></span>
      <span>Li<sup>+</sup> migration: not a mechanism here <Badge code="U" pop="f8-li" /></span>
    </div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>Bias walk after a DC step</h3><span class="q-vq">series RC layers, unit area; voltage share on the LN film</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 640 380" role="img" aria-label="Cross-section of a thin-film LN modulator with field arrows and drifting charge, and the transfer curve with the operating point">
          <rect x="40" y="200" width="560" height="44" class="q-si" /><text x="48" y="232" class="q-vt">Si</text>
          <rect x="40" y="150" width="560" height="50" class="q-ox" /><text x="48" y="182" class="q-vt">SiO₂ BOX</text>
          <path d="M40 150 L40 136 L250 136 L270 110 L370 110 L390 136 L600 136 L600 150 Z" class="q-lnf" /><text x="236" y="148" class="q-vt">LN</text>
          {#if preset === "clad"}<path d="M40 136 L40 70 L600 70 L600 136 L390 136 L370 110 L270 110 L250 136 Z" class="q-clad" /><text x="48" y="90" class="q-vt">cladding</text>{/if}
          <rect x="120" y="112" width="110" height="22" class="q-au" /><rect x="410" y="112" width="110" height="22" class="q-au" />
          <text x="175" y="106" text-anchor="middle" class="q-vt">Au +</text><text x="465" y="106" text-anchor="middle" class="q-vt">Au −</text>
          <!-- field arrow across the rib, length tracks V_LN / V -->
          <path d="M{320 - arrowLen} 124 L{320 + arrowLen} 124" class="q-farr" /><path d="M{320 + arrowLen - 7} 119 L{320 + arrowLen} 124 L{320 + arrowLen - 7} 129" class="q-farr" />
          {#each Array.from({ length: nDots }, (_, i) => i) as i (i)}<circle cx={positive ? 236 + (i % 7) * 3 : 270 + (i % 7) * 14} cy={positive ? 96 + Math.floor(i / 7) * 8 : 140 + Math.floor(i / 7) * 5} r="2.6" class={i % 2 ? "q-qp" : "q-qn"} />{/each}
          <!-- transfer curve -->
          <path d={path(axis(0, 2 * Math.PI, 60, 600), axis(0, 1, 360, 270), curve, curve.map(Tm))} class="q-tc" />
          <line x1={px(axis(0, 2 * Math.PI, 60, 600), Math.PI / 2)} x2={px(axis(0, 2 * Math.PI, 60, 600), Math.PI / 2)} y1="266" y2="364" class="q-q" />
          <circle cx={px(axis(0, 2 * Math.PI, 60, 600), phiW)} cy={px(axis(0, 1, 360, 270), Tm(phi))} r="7" class="q-dot" />
          <text x="60" y="378" class="q-vt">bias phase 0</text><text x="600" y="378" text-anchor="end" class="q-vt">2π</text>
        </svg>
        <svg class="q-svg" viewBox="0 0 640 170" role="img" aria-label="Voltage share on the LN film versus frequency, with the reported 1 to 20 kHz band">
          <rect x={px(vxf, 1e3)} y="14" width={px(vxf, 2e4) - px(vxf, 1e3)} height="122" class="q-band" />
          <text x={px(vxf, 1e3) + 4} y="28" class="q-vt">reported band, one device</text>
          {#each [1e-3, 1, 1e3, 1e6] as fq (fq)}<text x={px(vxf, fq)} y="156" text-anchor="middle">{pow10(Math.round(Math.log10(fq)))} Hz</text>{/each}
          <line x1="60" x2="620" y1="136" y2="136" class="ax" />
          <path d={path(vxf, vyf, fs, H)} class="q-hf" />
          <text x="60" y="10" class="q-vt">|V<tspan dy="3" font-size="9">LN</tspan><tspan dy="-3"> / V| vs frequency, log-log</tspan></text>
        </svg>
      </div>
      <div class="q-vctl">
        <div class="v-ctl"><span class="v-lab">Stack</span><Seg kind="v" bind:value={preset} options={[["bulk", "Bulk-like"], ["clad", "Clad"], ["airclad", "Air-clad"]]} label="Stack preset" /></div>
        <VCtl id="f8-s1-v" label={preset === "clad" ? "Cladding conductivity" : "Oxide conductivity"} bind:value={lgS1} min={-18} max={-4} step={0.001} out="{e(10 ** lgS1, 1, false)} S/m" w={11} />
        <VCtl id="f8-s0-v" label="LN film conductivity" bind:value={lgS0} min={-18} max={-4} step={0.001} out="{e(10 ** lgS0, 1, false)} S/m" w={11} />
        <VCtl id="f8-t-v" label="Time after the bias step" bind:value={lgt} min={-6} max={6} step={0.02} out={dur(tNow)} w={11} />
        <VCtl id="f8-T-v" label="Temperature (Arrhenius, 0.5 eV)" bind:value={T} min={77} max={400} step={1} out="{f(T, 0, 3)} K" w={6} />
        <div class="v-ctl"><span class="v-lab">Interface layer, 10 nm</span><Seg kind="v" bind:value={iface} options={[[false, "Off"], [true, "On"]]} label="Interface layer" /></div>
        <div class="q-vrow"><button type="button" class="q-vbtn" onclick={run}>Run</button><button type="button" class="q-vbtn" onclick={relock}>Re-lock</button></div>
        <dl class="v-hud">
          <dt>Relaxation time</dt><dd>{taus.length ? dur(taus[0]) : "n/a"}</dd>
          <dt>LN share, start to end</dt><dd>{f(v0, 2, 4)} → {f(vInf, 2, 4)}</dd>
          <dt>Drift</dt><dd>{positive ? "positive" : "negative"}</dd>
          <dt>Transmission now</dt><dd>{f(Tm(phi), 3, 5)}</dd>
          <dt>Bias phase, unwrapped</dt><dd>{f((phi * 180) / Math.PI, 0, 6)}°</dd>
          {#each layers as l, i (i)}<dt>{l.name}</dt><dd>{f(l.thickness_m * 1e9, 0, 5)} nm, ε {f(l.epsR, 1, 4)}, σ {e(l.sigma, 1, false)} S/m</dd>{/each}{#if !iface}<dt>interface layer</dt><dd>off</dd>{/if}
          <dt>E<sub>a</sub>, V/V<sub>π</sub> at 0+</dt><dd>0.5 eV, 0.5</dd>
        </dl>
      </div>
    </div>
    {#if hasBias}<p class="v-cap q-biasline">The footer bias meter on every page now runs this stack with your settings.</p>{/if}
    <div class="v-prov"><span>preset time constants 11.9 ms (clad) and 88.6 µs (air-clad) <Src id="li2026photonics" code="reported" cite={false} /></span><span>1-20 kHz band <Src id="holzgrafe2024" code="reported" cite={false} /></span><span>bulk σ<sub>d</sub> range <Src id="volk2008" loc="p. 60" code="P-comp" cite={false} /></span><span>layer values: model parameters, no data <Badge code="template" pop="f8-tmpl" /></span><span>Li<sup>+</sup> migration not modelled <Badge code="U" pop="f8-li" /></span></div>
  </div>
</div>

<style>
  .q-f8kv { padding: 4px 8px; }
  .panel .q-biasline { padding: 4px 8px; margin: 0; border-top: 1px solid var(--rule); }
  .q-f8t { margin: 4px 8px 8px; width: calc(100% - 16px); }
  .q-f8t { table-layout: fixed; }
  .q-f8t td, .q-f8t th { font-size: 11px; overflow: hidden; white-space: nowrap; }
  .q-si { fill: var(--v-si); opacity: 0.55; }
  .q-ox { fill: var(--v-sio2); stroke: var(--v-line2); }
  .q-lnf { fill: color-mix(in srgb, var(--v-ln) 22%, transparent); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-clad { fill: var(--v-sio2); stroke: var(--v-line2); stroke-dasharray: 4 3; }
  .q-au { fill: var(--v-au); }
  .q-farr { fill: none; stroke: var(--v-text); stroke-width: 2.5; }
  .q-qp { fill: var(--v-au); }
  .q-qn { fill: var(--nb); }
  .q-tc { fill: none; stroke: var(--v-ir1550); stroke-width: 2; stroke-dasharray: 6 3; }
  .q-q { stroke: var(--v-line2); stroke-dasharray: 3 3; }
  .q-dot { fill: var(--v-l532); }
  .q-band { fill: var(--v-l532-dim); }
  .q-hf { fill: none; stroke: var(--v-l532); stroke-width: 2; }
  .q-vt { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-vrow { display: flex; gap: 12px; }
</style>
