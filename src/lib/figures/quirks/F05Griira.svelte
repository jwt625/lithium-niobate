<!-- fig-04-05 Polaron ladder and GRIIRA chain. Part A (data): absorption bands as Gaussians in photon energy at the tabulated
     centres and HWHM (schwesyg2011 Table 2.1; P-comp), peak-normalized; O^- (no width) as a marker. The Nb_Li-related bands
     scale with the template Nb_Li fraction, zero at the MgO threshold (volk2008 p. 96). Part B (template toy, prslab.ts
     griiraToy): green intensity -> polaron density -> 1064 nm absorption -> heating -> QPM detuning (Jundt dDk/dT) -> SHG. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { POLARON_BANDS, polaronBandShape, griiraToy, griiraNmaxScale, EV_TO_CM1, GRIIRA_MG_THRESHOLD } from "$lib/physics/prslab.ts";
  import { qpmDetuningDT } from "$lib/physics/thermal.ts";
  import { qpmPeriodSHG } from "$lib/physics/phasematching.ts";
  import { indexFn } from "$lib/physics/sellmeier.ts";
  import { JUNDT_CLN_E } from "$lib/physics/constants.ts";
  import { axis, px, path, ticks, linspace } from "./plot.ts";
  import { e, f } from "./fmtq.ts";

  let Ig = $state(2.5); // kW/cm^2
  let mg = $state(0); // % Mg
  let xtal = $state<"CLN" | "NSLN">("CLN");
  let Pir = $state(10); // W, template

  const PERIOD = qpmPeriodSHG(1.064, indexFn(JUNDT_CLN_E), 1, 25);
  const DDK = qpmDetuningDT(1.064, PERIOD, 25); // rad/m/K
  const T = { gen: 4.9e18, tau: 1e-3, sig: 2e-23, Nmax: 1e23, Gth: 0.1, L: 0.01 };
  const scale = $derived(griiraNmaxScale(mg, xtal));
  const res = $derived(griiraToy({ Ig_W_m2: Ig * 1e7, gen: T.gen, tauPol_s: T.tau, sigmaAbs_m2: T.sig, Nmax_m3: T.Nmax * scale, Pir_W: Pir, Gth_W_per_K: T.Gth, dDkdT_per_m_K: DDK, L_m: T.L }));
  const aMax = T.sig * T.Nmax; // 1/m
  const thr = $derived(GRIIRA_MG_THRESHOLD[xtal].value);

  // Part A
  const ev = (cm: number) => cm / EV_TO_CM1;
  const BANDS = POLARON_BANDS.filter((b) => b.hwhm_cm1 !== null);
  const OM = POLARON_BANDS.find((b) => b.id === "O-");
  const nbli = (id: string) => id === "NbLi4+" || id === "bipolaron";
  const Es = linspace(0.3, 3.5, 321);
  const W = 780, H = 250, X0 = 30, X1 = 770, Y0 = 18, Y1 = 206;
  const xa = axis(0.3, 3.5, X0, X1), ya = axis(0, 1.1, Y1, Y0);
  const bandPath = (b: (typeof BANDS)[number], a: Axis2) => path(a.x, a.y, Es, Float64Array.from(Es, (E) => (nbli(b.id) ? scale : 1) * polaronBandShape(b, E)));
  type Axis2 = { x: typeof xa; y: typeof ya };
  const A1: Axis2 = { x: xa, y: ya };
  const lines = [{ E: 1239.84 / 532, lab: "532 nm", ir: false }, { E: 1239.84 / 1064, lab: "1064 nm", ir: true }, { E: 1239.84 / 1550, lab: "1550 nm", ir: true }];
  const shortLab: Record<string, string> = { "NbLi4+": "Nb⁴⁺ on Li site, bound", "NbNb4+": "Nb⁴⁺ on Nb site, free", bipolaron: "bipolaron" };

  // VISUAL: configuration-coordinate sketch per polaron, chain dials
  const VA: Axis2 = { x: axis(0.3, 3.5, 30, 630), y: axis(0, 1.1, 190, 20) };
  function dial(cx: number, v: number): { needle: string; arc: string } {
    const a0 = Math.PI * 0.85, a1 = Math.PI * 0.15, r = 40;
    const a = a0 + (a1 - a0) * Math.max(0, Math.min(1, v));
    const pt = (aa: number, rr: number) => `${(cx + rr * Math.cos(aa)).toFixed(1)} ${(80 - rr * Math.sin(aa)).toFixed(1)}`;
    return { needle: `M${cx} 80 L${pt(a, r - 6)}`, arc: `M${pt(a0, r)} A${r} ${r} 0 0 1 ${pt(a1, r)}` };
  }
  const gauges = $derived([
    { lab: "green", v: Ig / 10, txt: `${f(Ig, 1, 4)} kW/cm²` },
    { lab: "polarons", v: res.Npol / T.Nmax, txt: `${f(res.Npol / T.Nmax, 2, 4)} Nₘₐₓ` },
    { lab: "IR absorption", v: res.alphaIR / aMax, txt: `${f(res.alphaIR / 100, 4, 6)} /cm` },
    { lab: "heating", v: res.dT / 4, txt: `${f(res.dT, 2, 5)} K` },
    { lab: "SHG", v: res.shgRel, txt: `${f(res.shgRel, 2, 4)}` },
  ]);
  // configuration-coordinate sketches (schematic): lower well E = c q^2, upper well E = c (q - 1)^2 + E_b / 4, c = 0.75 E_b,
  // so the vertical (optical) transition at q = 0 costs E_b and the thermal barrier is E_b / 4 (4:1, volk2008 pp. 18-19)
  function cc(Eb: number, ox: number): { lo: string; up: string; y0: number; y1: number; x: number } {
    const c = 0.75 * Eb, Y = (E: number) => 118 - E * 38, X = (q: number) => ox + 60 + q * 70;
    const qs = Array.from({ length: 41 }, (_, i) => -0.8 + (i / 40) * 2.6);
    const lo = qs.filter((q) => c * q * q < 3).map((q, i) => `${i ? "L" : "M"}${X(q).toFixed(1)} ${Y(c * q * q).toFixed(1)}`).join("");
    const up = qs.filter((q) => c * (q - 1) ** 2 + Eb / 4 < 3).map((q, i) => `${i ? "L" : "M"}${X(q).toFixed(1)} ${Y(c * (q - 1) ** 2 + Eb / 4).toFixed(1)}`).join("");
    return { lo, up, y0: Y(0), y1: Y(Eb), x: X(0) };
  }
  const CC = BANDS.map((b, i) => ({ b, g: cc(ev(b.center_cm1), i * 220) }));
  const irDim = $derived(1 - 0.75 * Math.min(1, res.alphaIR / aMax));
</script>

<div class="q-fig" id="fig-04-05">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>(A) Polaron absorption bands, Gaussian approximation, peak-normalized</span><span>Nb<sub>Li</sub> bands scale with the Nb<sub>Li</sub> fraction</span></div>
    <div class="q-pside"><div>
    <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Polaron absorption bands versus photon energy">
      {#each ticks(xa, 8) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={Y0} y2={Y1} /><text x={t.p} y={Y1 + 14} text-anchor="middle">{t.label}</text>{/each}
      <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
      {#each lines as l (l.lab)}<line class={l.ir ? "c3" : "c2"} x1={px(xa, l.E)} x2={px(xa, l.E)} y1={Y0} y2={Y1} /><text x={px(xa, l.E) + 3} y={Y1 - 4} class="lab">{l.lab}</text>{/each}
      {#each BANDS as b, i (b.id)}<path class={i === 0 ? "c0" : i === 1 ? "c1" : "c2"} d={bandPath(b, A1)} /><text x={px(xa, ev(b.center_cm1))} y={px(ya, (nbli(b.id) ? scale : 1) * 1) - 6} text-anchor="middle" class="labf">{shortLab[b.id]}</text>{/each}
      {#if OM}<path d="M{px(xa, ev(OM.center_cm1))} {Y0 + 30} l-4 -8 h8 Z" class="mk" /><text x={px(xa, ev(OM.center_cm1)) + 6} y={Y0 + 26} class="lab">O⁻ (no width tabulated)</text>{/if}
      <text x={(X0 + X1) / 2} y={H - 4} text-anchor="middle">photon energy (eV)</text>
    </svg></div>
    <div class="q-side"><dl class="q-kv">
      {#each BANDS as b (b.id)}<dt>{shortLab[b.id]}</dt><dd>{f(ev(b.center_cm1), 2, 4)} eV, HWHM {f(ev(b.hwhm_cm1 ?? 0), 2, 4)}</dd>{/each}
      <dt>O⁻ hole polaron</dt><dd>{f(ev(20000), 2, 4)} eV, n/a</dd>
      <dt>532 / 1064 / 1550 nm</dt><dd>2.33 / 1.17 / 0.80 eV</dd>
    </dl><p class="q-note">Solid: Nb<sub>Li</sub><sup>4+</sup>; dashed: Nb<sub>Nb</sub><sup>4+</sup>; thin: bipolaron. Nb<sub>Li</sub>-related bands scale with the Nb<sub>Li</sub> fraction (template, linear to zero at the threshold).</p></div></div>
    <div class="q-ph2">(B) GRIIRA chain, model parameters, no data <Badge code="template" pop="f5-tmpl" /></div>
    <pre class="q-flow">I<sub>g</sub> {f(Ig, 2, 5)} kW/cm² → N/N<sub>max</sub> {f(res.Npol / T.Nmax, 3, 5)} → α<sub>1064</sub> {e(res.alphaIR / 100, 2, false)} /cm → ΔT {f(res.dT, 3, 6)} K → SHG rel. {f(res.shgRel, 3, 5)}</pre>
    <TCtl id="f5-g-t" label="Green I<sub>g</sub>" bind:value={Ig} min={0} max={10} step={0.05} out="{f(Ig, 2, 5)} kW/cm²" />
    <TCtl id="f5-m-t" label="Mg content" bind:value={mg} min={0} max={6} step={0.05} out="{f(mg, 2, 4)} %" />
    <TCtl id="f5-p-t" label="IR power" bind:value={Pir} min={0} max={20} step={0.1} out="{f(Pir, 1, 4)} W" />
    <div class="ctl"><span class="k">Crystal</span><Seg bind:value={xtal} options={[["CLN", "CLN"], ["NSLN", "NSLN"]]} label="Crystal" /><span></span></div>
    <div class="q-ro">
      <span>E<sub>band</sub>  <b>1.60</b> eV (775 nm)</span><span>HWHM     <b>0.40</b> eV</span><span>threshold <b>{f(thr, 1, 3)}</b> % Mg</span><span>SHG rel. <b>{f(res.shgRel, 2, 4)}</b></span><span>∂Δk/∂T   <b>{f(DDK, 1, 5)}</b> rad/(m K)</span>
    </div>
    <div class="pf">
      <span>band centres and widths <Src id="schwesyg2011" loc="Table 2.1" code="P-comp" /></span>
      <span>thresholds 5% CLN, 1.5% NSLN <Src id="volk2008" loc="p. 96" code="P-comp" cite={false} /></span>
      <span>dDk/dT: Jundt Sellmeier, &Lambda; {f(PERIOD, 2, 4)} &micro;m at 25 &deg;C <Badge code="derived" pop="f5-dk" /></span>
      <span>no TFLN GRIIRA data found; bulk values</span>
    </div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>Green fills the traps, infrared pays</h3><span class="q-vq">where green-induced infrared absorption comes from</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 660 140" role="img" aria-label="Configuration-coordinate sketches of the three polarons, schematic">
          {#each CC as c (c.b.id)}
            <g style="opacity:{(nbli(c.b.id) ? 0.15 + 0.85 * scale : 1).toFixed(3)}">
              <path d={c.g.lo} class="q-well" /><path d={c.g.up} class="q-well q-up" />
              <path d="M{c.g.x} {c.g.y0} L{c.g.x} {c.g.y1 + 6}" class="q-opt" /><path d="M{c.g.x - 4} {c.g.y1 + 8} L{c.g.x} {c.g.y1} L{c.g.x + 4} {c.g.y1 + 8}" class="q-opt" />
              <text x={c.g.x + 8} y={(c.g.y0 + c.g.y1) / 2} class="q-bl">{f(ev(c.b.center_cm1), 2, 4)} eV</text>
              <text x={c.g.x - 50} y="136" class="q-bl">{shortLab[c.b.id]}</text>
            </g>
          {/each}
        </svg>
        <svg class="q-svg" viewBox="0 0 660 230" role="img" aria-label="Absorption bands of small polarons with 532, 1064 and 1550 nm marks">
          {#each ticks(VA.x, 7) as t (t.v)}<text x={t.p} y="212" text-anchor="middle">{t.label} eV</text>{/each}
          <line x1="30" x2="630" y1="190" y2="190" class="ax" />
          {#each BANDS as b, i (b.id)}<path class="q-band{i}" d={`${bandPath(b, VA)}L${px(VA.x, 3.5)} 190 L${px(VA.x, 0.3)} 190 Z`} /><text x={px(VA.x, ev(b.center_cm1))} y={px(VA.y, (nbli(b.id) ? scale : 1)) - 8} text-anchor="middle" class="q-bl">{shortLab[b.id]}</text>{/each}
          <line x1={px(VA.x, lines[0].E)} x2={px(VA.x, lines[0].E)} y1="16" y2="190" class="q-g532" />
          <text x={px(VA.x, lines[0].E) + 5} y="184" class="q-bl">532 nm</text>
          {#each lines.slice(1) as l (l.lab)}<line x1={px(VA.x, l.E)} x2={px(VA.x, l.E)} y1="16" y2="190" class="q-irl ir-el" style="opacity:{irDim.toFixed(3)}" /><text x={px(VA.x, l.E) + 5} y="184" class="q-bl">{l.lab}</text>{/each}
        </svg>
        <svg class="q-svg" viewBox="0 0 660 150" role="img" aria-label="Chain of gauges from green intensity to second-harmonic output">
          {#each gauges as gg, i (gg.lab)}
            {@const d = dial(66 + i * 132, gg.v)}
            <path d={d.arc} class="q-arc" /><path d={d.needle} class="q-needle" class:q-shg={i === 4} />
            <circle cx={66 + i * 132} cy="80" r="3.5" class="q-hub" />
            <text x={66 + i * 132} y="108" text-anchor="middle" class="q-bl">{gg.lab}</text>
            <text x={66 + i * 132} y="128" text-anchor="middle" class="q-gv">{gg.txt}</text>
            {#if i < 4}<text x={132 + i * 132} y="84" text-anchor="middle" class="q-bl">&rarr;</text>{/if}
          {/each}
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="f5-g-v" label="Green intensity" bind:value={Ig} min={0} max={10} step={0.05} out="{f(Ig, 2, 5)} kW/cm²" w={11} />
        <VCtl id="f5-m-v" label="Magnesium" bind:value={mg} min={0} max={6} step={0.05} out="{f(mg, 2, 4)} %" w={7} />
        <div class="v-ctl"><span class="v-lab">Crystal</span><Seg kind="v" bind:value={xtal} options={[["CLN", "Congruent"], ["NSLN", "Near-stoich."]]} label="Crystal" /></div>
        <VCtl id="f5-p-v" label="1064 nm power" bind:value={Pir} min={0} max={20} step={0.1} out="{f(Pir, 1, 4)} W" w={7} />
        <dl class="v-hud">
          <dt>Threshold for this crystal</dt><dd>{f(thr, 1, 3)} % Mg</dd>
          <dt>Bound polaron band</dt><dd>1.60 eV, 775 nm</dd>
          <dt>SHG, relative</dt><dd>{f(res.shgRel, 2, 4)}</dd>
          <dt>QPM detuning per kelvin</dt><dd>{f(DDK, 1, 5)} rad/(m K)</dd>
        </dl>
        <p class="v-cap">Wells: configuration-coordinate schematic, vertical arrow = optical transition at the tabulated band energy.</p>
        <p class="v-cap">Push magnesium past the threshold: the 1.6 eV band vanishes and SHG returns to 1 (Nb<sub>Li</sub> fraction: template, linear to zero at the threshold). Detuning slope from the Jundt Sellmeier, Λ {f(PERIOD, 2, 4)} µm at 25 °C <Badge code="derived" pop="f5-dk" />. No GRIIRA measurement in thin films was found; bulk values only.</p>
      </div>
    </div>
    <div class="v-prov"><span>bands <Src id="schwesyg2011" loc="Table 2.1" code="P-comp" /></span><span>thresholds <Src id="volk2008" loc="p. 96" code="P-comp" /></span><span>chain: model parameters, no data <Badge code="template" pop="f5-tmpl" /></span><span>1064 and 1550 nm: <span class="term" data-pop="v-false">false color</span>, dashed</span></div>
  </div>
</div>

<style>
  .q-ph2 { padding: 3px 8px; border-top: 1px solid var(--rule2); font: 400 10.5px/16px var(--mono); color: var(--fg2); }
  .q-band0 { fill: color-mix(in srgb, var(--v-l775) 55%, transparent); stroke: var(--v-l633); stroke-width: 1.5; }
  .q-band1 { fill: color-mix(in srgb, var(--v-text3) 25%, transparent); stroke: var(--v-text2); stroke-width: 1.2; }
  .q-band2 { fill: color-mix(in srgb, var(--v-au) 22%, transparent); stroke: var(--v-au); stroke-width: 1.2; }
  .q-bl { font: 500 calc(12px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text2) !important; }
  .q-g532 { stroke: var(--v-l532); stroke-width: 2.5; }
  .q-irl { stroke: var(--v-ir1550); stroke-width: 2; stroke-dasharray: 6 4; transition: opacity 240ms var(--v-ease); }
  .q-well { fill: none; stroke: var(--v-text2); stroke-width: 1.5; }
  .q-well.q-up { stroke: var(--v-text3); stroke-dasharray: 4 3; }
  .q-opt { fill: none; stroke: var(--v-l633); stroke-width: 2; }
  .q-arc { fill: none; stroke: var(--v-line2); stroke-width: 6; }
  .q-needle { stroke: var(--v-text); stroke-width: 2.5; transition: d 240ms var(--v-ease); }
  .q-needle.q-shg { stroke: var(--v-l532); }
  .q-hub { fill: var(--v-text); }
  .q-gv { font: 500 calc(14px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text) !important; font-variant-numeric: tabular-nums; }
</style>
