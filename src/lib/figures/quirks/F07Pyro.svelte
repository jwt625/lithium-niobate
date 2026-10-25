<!-- fig-04-07 Heat a wafer: pyroelectric charge on an unscreened isolated plate (pyro.ts). sigma_b = p3 dT on the +c face,
     E = -p3 dT / (eps33 eps0) (z-cut plate; the plate formula needs c along the plate normal), V = E d, Delta n_e =
     -(1/2) n_e^3 r33 E, screening E0 exp(-t/tau), tau = eps eps0 / sigma. Linear in dT with the 25 C coefficient; below
     25 C p3 is not in the held sources (U). p3 choice shared with fig-04-11 through stores/quirks.ts. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { pyroCharge, pyroField, screenedDecay, P3_OPTIONS, EPS33T_WARNER } from "$lib/physics/pyro.ts";
  import { pockelsDeltaN, dielectricRelaxationTime } from "$lib/physics/prslab.ts";
  import { dnedT } from "$lib/physics/thermal.ts";
  import { quirks, type P3Choice } from "$lib/stores/quirks";
  import { axis, px, path, ticks, logspace, linspace } from "./plot.ts";
  import { e, f, sf, dur, pow10 } from "./fmtq.ts";

  let dT = $state(95);
  let cut = $state<"z" | "x">("z");
  let th = $state<"w05" | "w10" | "film">("w05");
  let p3c = $state<P3Choice>(quirks.p3);
  let lgS = $state(-15);
  $effect(() => { quirks.p3 = p3c; });

  const EPS = EPS33T_WARNER.value;
  const NE = 2.1376, R33 = 32.2e-12; // n_e 1550 nm (Zelmon, derived); r33^T 633 nm (weis1985, P-comp)
  const DNDT = dnedT(1.55, 25);
  const EC = 2.1e7; // V/m, congruent coercive field, volk2008 Table 7.1 (P-comp)
  const D: Record<string, number> = { w05: 0.5e-3, w10: 1e-3, film: 600e-9 };
  const p3s = $derived(p3c === "spread" ? [P3_OPTIONS[0].value, P3_OPTIONS[3].value] : [P3_OPTIONS.find((o) => o.id === p3c)!.value]);
  const lo = $derived(Math.min(...p3s.map(Math.abs))), hi = $derived(Math.max(...p3s.map(Math.abs)));
  const sig = (p: number) => pyroCharge(-p, dT); // C/m^2 on +c face (p3 < 0)
  const Ef = (p: number) => pyroField(-p, dT, EPS);
  const d = $derived(D[th]);
  const film = $derived(th === "film");
  const vU = (v: number) => (film ? v : v / 1000);
  const rngS = (a: number, b: number, dd: number, w: number) => (Math.abs(a - b) < 1e-12 * Math.max(1, Math.abs(a)) ? f(a, dd, w).padEnd(2 * w + 1, " ") : `${f(Math.min(a, b), dd, w)}–${f(Math.max(a, b), dd, w)}`);
  const rngE = (a: number, b: number) => (Math.abs(a - b) <= 1e-12 * Math.abs(a) ? e(a, 1, false).padEnd(15, " ") : `${e(Math.min(a, b), 1, false)}–${e(Math.max(a, b), 1, false)}`);
  const sigTxt = $derived(rngS(Math.abs(sig(lo)) * 100, Math.abs(sig(hi)) * 100, 2, 6)); // |uC/cm^2|
  const ETxt = $derived(cut === "z" ? rngE(Math.abs(Ef(lo)), Math.abs(Ef(hi))) : "n/a, x-cut".padEnd(15, " "));
  const VTxt = $derived(cut === "z" ? rngS(Math.abs(vU(Ef(lo) * d)), Math.abs(vU(Ef(hi) * d)), 1, 6) : "n/a".padEnd(13, " "));
  const dnTxt = $derived(cut === "z" ? rngE(Math.abs(pockelsDeltaN(NE, R33, Ef(lo))), Math.abs(pockelsDeltaN(NE, R33, Ef(hi)))) : "n/a".padEnd(15, " "));
  const dnK = $derived(rngE(Math.abs(pockelsDeltaN(NE, R33, pyroField(lo, 1, EPS))), Math.abs(pockelsDeltaN(NE, R33, pyroField(hi, 1, EPS)))));
  const plusTop = $derived(sig(lo) > 0); // +c face (top in z-cut) positive on cooling
  const overEc = $derived(cut === "z" && Math.abs(Ef(hi)) > EC);
  const tau = $derived(dielectricRelaxationTime(EPS, 10 ** lgS));
  const cooling = $derived(dT < 0);

  // ---------- TECH: |V| vs dT with spread band, decay curve ----------
  const W = 560, H = 230, X0 = 52, X1 = 548, Y0 = 18, Y1 = 196;
  const dts = linspace(-50, 200, 126);
  const vMax = $derived(Math.abs(vU(pyroField(9.5e-5, 200, EPS) * d)));
  const xa = axis(-50, 200, X0, X1);
  const ya = $derived(axis(0, vMax * 1.05, Y1, Y0));
  const band = $derived.by(() => {
    if (cut !== "z") return "";
    const top = Array.from(dts, (t) => `${px(xa, t).toFixed(1)} ${px(ya, Math.abs(vU(pyroField(hi, t, EPS) * d))).toFixed(1)}`);
    const bot = Array.from(dts, (t) => `${px(xa, t).toFixed(1)} ${px(ya, Math.abs(vU(pyroField(lo, t, EPS) * d))).toFixed(1)}`).reverse();
    return `M${top.join(" L")} L${bot.join(" L")} Z`;
  });
  const ecV = $derived(vU(EC * d));
  const tsd = logspace(1e-6, 1e8, 141);
  const xd = axis(1e-6, 1e8, X0, X1, true), yd = axis(0, 1.05, Y1, Y0);
  const decay = $derived(path(xd, yd, tsd, Float64Array.from(tsd, (t) => screenedDecay(1, t, tau))));
  const MARKS = [{ s: 1e-16, l: "bulk σ_d" }, { s: 1e-14, l: "" }, { s: 2.1e-8, l: "TFLN 11.9 ms" }, { s: 2.8e-6, l: "TFLN 88.6 µs" }];

  // ASCII plate
  const nCh = $derived(Math.max(1, Math.min(30, Math.round((Math.abs(sig(hi)) * 100) / 0.04))));
  const ascii = $derived.by(() => {
    const pos = "+", neg = "−";
    const top = plusTop ? pos : neg, bot = plusTop ? neg : pos;
    const row = (c: string) => (c + " ").repeat(nCh).padEnd(60, " ").slice(0, 60);
    if (Math.abs(dT) < 0.25) return [" ".repeat(60), "+-" + "-".repeat(56) + "-+", "|" + " ".repeat(58) + "|", "|" + " ".repeat(26) + "c (z) ↑" + " ".repeat(25) + "|", "|" + " ".repeat(58) + "|", "+-" + "-".repeat(56) + "-+", " ".repeat(60)].join("\n");
    if (cut === "z") return [row(top), "+" + "-".repeat(58) + "+", "|" + " ".repeat(58) + "|", "|" + " ".repeat(22) + "+c ↑  E " + (plusTop ? "↓" : "↑") + "  z-cut" + " ".repeat(16) + "|", "|" + " ".repeat(58) + "|", "+" + "-".repeat(58) + "+", row(bot)].join("\n");
    const k = Math.min(5, Math.ceil(nCh / 6));
    const side = (c: string) => (c + " ").repeat(k).trimEnd().padEnd(10, " ").slice(0, 10);
    const mid = "+" + "-".repeat(36) + "+";
    const lines = [" ".repeat(60), " ".repeat(11) + mid];
    for (let i = 0; i < 3; i++) lines.push(side(plusTop ? "−" : "+") + " |" + (i === 1 ? "   +c →   x-cut, c in plane    " : " ".repeat(30)).padEnd(36, " ") + "| " + side(plusTop ? "+" : "−"));
    lines.push(" ".repeat(11) + mid, " ".repeat(60));
    return lines.join("\n");
  });
  const TO = $derived(DNDT * dT);
  const pyDn = $derived(cut === "z" ? Math.abs(pockelsDeltaN(NE, R33, Ef(hi))) : 0);
  const barMax = $derived(Math.max(1e-12, Math.abs(TO), pyDn));

  // ---------- VISUAL ----------
  const glyphs = $derived(Math.max(0, Math.min(36, Math.round((Math.abs(sig(hi)) * 100) / 0.025))));
  const needle = $derived.by(() => {
    const frac = cut === "z" ? Math.min(1, Math.abs(Ef(hi)) / (EC * 1.25)) : 0;
    const a = Math.PI * (0.9 - 0.8 * frac);
    return `M520 210 L${(520 + 62 * Math.cos(a)).toFixed(1)} ${(210 - 62 * Math.sin(a)).toFixed(1)}`;
  });
  const ecA = Math.PI * (0.9 - 0.8 / 1.25);
  const OPTS: [P3Choice, string][] = [["spread", "spread"], ["savage1966", "4.0e-5"], ["schwesyg2011", "6.4e-5"], ["cti1999", "8.3e-5"], ["popescu2013", "9.5e-5"]];
</script>

<div class="q-fig" id="fig-04-07">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Heat a wafer: unscreened pyroelectric charge, field, voltage</span><span>isolated plate, no screening unless σ set</span></div>
    <div class="q-two">
      <div>
        <pre class="q-ascii q-plate" aria-label="ASCII cross-section of the plate with surface charge">{ascii}</pre>
        <div class="q-bars">
          <div class="q-bl2"><span>Δnₑ pyro (max p3)</span><span class="q-bar"><i class="q-live" style="width:{((100 * pyDn) / barMax).toFixed(1)}%"></i></span><span class="q-o">{e(pyDn, 1, false)}</span></div>
          <div class="q-bl2"><span>Δnₑ thermo-optic</span><span class="q-bar"><i class="q-live" style="width:{((100 * Math.abs(TO)) / barMax).toFixed(1)}%"></i></span><span class="q-o">{e(TO, 1)}</span></div>
        </div>
        <dl class="q-kv q-f7kv">
          <dt>ΔT</dt><dd>{sf(dT, 1, 7)} K</dd>
          <dt>|σ<sub>b</sub>|</dt><dd>{sigTxt} µC/cm²</dd>
          <dt>|E|</dt><dd>{ETxt} V/m</dd>
          <dt>|V|</dt><dd>{VTxt} {film ? "V " : "kV"}</dd>
          <dt>|Δn<sub>e</sub>|</dt><dd>{dnTxt}</dd>
          <dt>|Δn<sub>e</sub>| per K</dt><dd>{dnK}</dd>
          <dt>+c face</dt><dd>{Math.abs(dT) < 0.25 ? "neutral " : plusTop ? "positive" : "negative"}</dd>
          <dt>p3 below 25 °C</dt><dd class="q-ufix">{#if cooling}<Badge code="U" pop="f7-u" /> none found{:else}not used (heating step){/if}</dd>
        </dl>
      </div>
      <div>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Unscreened voltage versus temperature change with the coefficient spread">
          {#each ticks(xa, 5) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={Y0} y2={Y1} /><text x={t.p} y={Y1 + 14} text-anchor="middle">{t.label}</text>{/each}
          {#each ticks(ya, 4) as t (t.v)}<line class="gl" x1={X0} x2={X1} y1={t.p} y2={t.p} /><text x={X0 - 4} y={t.p + 3} text-anchor="end">{t.label}</text>{/each}
          <rect x={X0} y={Y0} width={px(xa, 0) - X0} height={Y1 - Y0} class="shade" />
          <text x={X0 + 4} y={Y0 + 12} class="lab">U: no p3 found below 25 °C</text>
          {#if cut === "z"}<path d={band} class="q-band" /><line class="c3" x1={X0} x2={X1} y1={px(ya, ecV)} y2={px(ya, ecV)} /><text x={X1 - 4} y={px(ya, ecV) - 4} text-anchor="end" class="lab">coercive field 21 kV/mm</text>{:else}<text x={(X0 + X1) / 2} y={(Y0 + Y1) / 2} text-anchor="middle" class="lab">x-cut: plate formula not applicable</text>{/if}
          <line class="cur" x1={px(xa, dT)} x2={px(xa, dT)} y1={Y0} y2={Y1} />
          <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          <text x={(X0 + X1) / 2} y={H - 4} text-anchor="middle">ΔT (K) from 25 °C</text>
          <text x={X0} y={Y0 - 5}>|V| ({film ? "V" : "kV"})</text>
        </svg>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Screening decay of the field versus time">
          {#each ticks(xd, 7, 2) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={Y0} y2={Y1} />{#if t.label}<text x={t.p} y={Y1 + 14} text-anchor="middle">{t.label}</text>{/if}{/each}
          <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          <path class="c0" d={decay} />
          {#if tau >= 1e-6 && tau <= 1e8}<line class="cur" x1={px(xd, tau)} x2={px(xd, tau)} y1={Y0} y2={Y1} />{/if}
          <text x={(X0 + X1) / 2} y={H - 4} text-anchor="middle">t (s)</text><text x={X0} y={Y0 - 5}>E/E₀</text>
          <text x={X1 - 4} y={Y0 + 12} text-anchor="end" class="lab">τ = εε₀/σ = {dur(tau).trim()}</text>
        </svg>
      </div>
    </div>
    <TCtl id="f7-dt-t" label="ΔT" bind:value={dT} min={-50} max={200} step={0.5} out="{sf(dT, 1, 7)} K" />
    <TCtl id="f7-s-t" label="σ, screening" bind:value={lgS} min={-16} max={-6} step={0.05} out="{e(10 ** lgS, 2)} S/m" />
    <div class="ctl"><span class="k">p3, C/(m² K)</span><Seg bind:value={p3c} options={OPTS} label="Pyroelectric coefficient" /><span></span></div>
    <div class="ctl"><span class="k">Cut</span><Seg bind:value={cut} options={[["z", "z-cut"], ["x", "x-cut"]]} label="Cut" /><span></span></div>
    <div class="ctl"><span class="k">Thickness</span><Seg bind:value={th} options={[["w05", "0.5 mm"], ["w10", "1 mm"], ["film", "600 nm film"]]} label="Thickness" /><span></span></div>
    <div class="pf">
      <span>p3: 4.0e-5 <Src id="savage1966" code="reported" cite={false} />, 6.4e-5 <Src id="bartholomaus1994" code="S" cite={false} />, 8.3e-5 <Src id="cti1999" code="V" cite={false} />, 9.5e-5 <Src id="popescu2013" code="reported" cite={false} /></span>
      <span>sign rule <Src id="weis1985" loc="p. 196" code="P" cite={false} /></span>
      <span>&epsilon;<sub>33</sub><sup>T</sup> 28.7 <Src id="weis1985" code="P-comp" cite={false} /></span>
      <span>E<sub>c</sub> 21 kV/mm <Src id="volk2008" loc="Table 7.1" code="P-comp" cite={false} /></span>
      <span>r<sub>33</sub><sup>T</sup> 32.2 pm/V (free, static field) <Src id="weis1985" loc="Table 4" code="P-comp" cite={false} /></span><span>n<sub>e</sub> 2.1376 <Badge code="P-db" pop="q-zel" /></span><span>dn<sub>e</sub>/dT 3.75e-5 /K <Badge code="derived" pop="f7-d" /></span>
      <span>thicknesses: geometry; &sigma; beyond the bulk range: model parameter, no data <Badge code="template" pop="f7-t" /></span>
    </div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>Kilovolts from a hotplate</h3><span class="q-vq">temperature step on an isolated LN plate, no screening</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 640 330" role="img" aria-label="Isometric wafer on a hotplate with surface charge glyphs, field lines and a voltmeter">
          <defs><linearGradient id="f7-hot" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff7a3d" stop-opacity={(Math.max(0, dT) / 200 * 0.8 + 0.1).toFixed(3)} /><stop offset="1" stop-color="#ff7a3d" stop-opacity="0" /></linearGradient></defs>
          <!-- hotplate -->
          <path d="M60 250 L230 300 L420 250 L250 200 Z" class="q-hp" />
          <path d="M60 250 L60 266 L230 316 L420 266 L420 250 L230 300 Z" class="q-hps" />
          <path d="M60 250 L230 300 L420 250 L250 200 Z" fill="url(#f7-hot)" />
          <!-- wafer (isometric ellipse slab) -->
          <ellipse cx="240" cy="226" rx="140" ry="44" class="q-wside" />
          <rect x="100" y="206" width="280" height="20" class="q-wside" />
          <ellipse cx="240" cy="206" rx="140" ry="44" class="q-wtop" />
          {#if cut === "z"}
            {#each Array.from({ length: glyphs }, (_, i) => i) as i (i)}
              {@const a = (i * 2.399963) % (2 * Math.PI)}{@const r = Math.sqrt((i + 0.5) / 36)}
              <text x={240 + 120 * r * Math.cos(a)} y={206 + 36 * r * Math.sin(a) + 4} text-anchor="middle" class={plusTop ? "q-gp" : "q-gn"}>{plusTop ? "+" : "−"}</text>
            {/each}
            {#if glyphs > 0}<path d={plusTop ? "M396 200 L396 234 M391 226 L396 234 L401 226" : "M396 234 L396 200 M391 208 L396 200 L401 208"} class="q-fl" /><text x="404" y="222" class="q-vt">E inside</text>{/if}
            <text x="240" y="140" text-anchor="middle" class="q-vt">top face: +c</text>
          {:else}
            {#each Array.from({ length: Math.min(12, Math.ceil(glyphs / 3)) }, (_, i) => i) as i (i)}
              <text x={104 + (i % 2) * 8} y={196 + i * 4} class={plusTop ? "q-gn" : "q-gp"}>{plusTop ? "−" : "+"}</text>
              <text x={368 + (i % 2) * 8} y={196 + i * 4} class={plusTop ? "q-gp" : "q-gn"}>{plusTop ? "+" : "−"}</text>
            {/each}
            <text x="240" y="140" text-anchor="middle" class="q-vt">c in plane: charge on edges facing ±c</text>
          {/if}
          <!-- voltmeter -->
          <path d="M458 210 A62 62 0 0 1 582 210" class="q-dial" />
          <path d="M520 210 L{(520 + 66 * Math.cos(ecA)).toFixed(1)} {(210 - 66 * Math.sin(ecA)).toFixed(1)}" class="q-ec" />
          <path d={needle} class="q-needle" class:pinned={overEc} />
          <circle cx="520" cy="210" r="4" class="q-hub" />
          <text x="520" y="236" text-anchor="middle" class="q-vv">{cut === "z" ? `${VTxt.replace(/\s/g, "")} ${film ? "V" : "kV"}` : "n/a"}</text>
          <text x="520" y="256" text-anchor="middle" class="q-vt">unscreened voltage</text>
          {#if overEc}<path d="M150 190 L190 214 L214 202 L262 230 L290 214 L330 236" class="q-kin" /><text x="240" y="322" text-anchor="middle" class="q-vt">past the coercive field: drawn crack, illustrative; real wafers discharge first</text>{/if}
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="f7-dt-v" label="Temperature step" bind:value={dT} min={-50} max={200} step={0.5} out="{sf(dT, 1, 7)} K" w={9} />
        <div class="v-ctl"><span class="v-lab">Pyroelectric coefficient, 10⁻⁵ C/(m² K)</span><Seg kind="v" bind:value={p3c} options={[["spread", "All"], ["savage1966", "4.0"], ["schwesyg2011", "6.4"], ["cti1999", "8.3"], ["popescu2013", "9.5"]]} label="Pyroelectric coefficient" /></div>
        <div class="v-ctl"><span class="v-lab">Cut</span><Seg kind="v" bind:value={cut} options={[["z", "z-cut"], ["x", "x-cut"]]} label="Cut" /></div>
        <div class="v-ctl"><span class="v-lab">Plate</span><Seg kind="v" bind:value={th} options={[["w05", "0.5 mm"], ["w10", "1 mm"], ["film", "600 nm"]]} label="Thickness" /></div>
        <VCtl id="f7-s-v" label="Leakage conductivity" bind:value={lgS} min={-16} max={-6} step={0.05} out="{e(10 ** lgS, 1, false)} S/m" w={11} />
        <dl class="v-hud">
          <dt>Surface charge</dt><dd>{sigTxt.replace(/\s/g, "")} µC/cm²</dd>
          <dt>Field</dt><dd>{cut === "z" ? ETxt.replace(/\s/g, "") + " V/m" : "n/a"}</dd>
          <dt>Index change, 1550 nm</dt><dd>{cut === "z" ? dnTxt.replace(/\s/g, "") : "n/a"}</dd>
          <dt>Thermo-optic Δn<sub>e</sub>, same ΔT</dt><dd>{e(TO, 1)}</dd>
          <dt>Coercive field E<sub>c</sub></dt><dd>21 kV/mm</dd>
          <dt>+c face</dt><dd>{Math.abs(dT) < 0.25 ? "neutral " : plusTop ? "positive" : "negative"}</dd>
          <dt>Charge leaks away in</dt><dd>{dur(tau)}</dd>
        </dl>
      </div>
    </div>
    <div class="v-prov"><span>p3: 4.0 <Src id="savage1966" code="reported" cite={false} />, 6.4 <Src id="bartholomaus1994" code="S" cite={false} />, 8.3 <Src id="cti1999" code="V" cite={false} />, 9.5 <Src id="popescu2013" code="reported" cite={false} /> &times;10⁻⁵ C/(m² K)</span><span>&epsilon;<sub>33</sub><sup>T</sup> 28.7 <Src id="weis1985" code="P-comp" cite={false} /></span><span>E<sub>c</sub> 21 kV/mm <Src id="volk2008" loc="Table 7.1" code="P-comp" cite={false} /></span><span>n<sub>e</sub> 2.1376, dn<sub>e</sub>/dT 3.75e-5 /K at 1550 nm, r<sub>33</sub><sup>T</sup> 32.2 pm/V <Badge code="derived" pop="f7-d" /></span><span>thicknesses: geometry; leakage beyond the bulk range: model parameter <Badge code="template" pop="f7-t" /></span><span>sign: cooling makes +c positive <Src id="weis1985" code="P" cite={false} /></span><span>linear in ΔT with the 25 °C coefficient; below 25 °C no p3 found <Badge code="U" pop="f7-u" /></span></div>
  </div>
</div>

<style>
  .q-plate { height: 96px; }
  .q-bars { padding: 4px 8px 8px; display: grid; gap: 4px; }
  .q-bl2 { display: grid; grid-template-columns: 150px minmax(0, 1fr) 76px; gap: 8px; align-items: center; font: 400 10.5px/16px var(--mono); color: var(--fg2); }
  .q-bar { height: 8px; border: 1px solid var(--rule2); display: block; }
  .q-bar i { display: block; height: 100%; background: var(--fg2); }
  .q-band { fill: var(--acc-dim); stroke: var(--fg); stroke-width: 1; }
  .q-ufix { height: 18px; }
  .q-f7kv { padding: 4px 8px 10px; }
  .q-hp { fill: var(--v-ink3); stroke: var(--v-line2); }
  .q-hps { fill: var(--v-ink2); stroke: var(--v-line2); }
  .q-wtop { fill: color-mix(in srgb, var(--v-ln) 22%, var(--v-ink1)); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-wside { fill: color-mix(in srgb, var(--v-ln) 10%, var(--v-ink1)); stroke: none; }
  .q-gp { font: 700 calc(15px * var(--q-k)) var(--v-ui) !important; fill: var(--v-au) !important; }
  .q-gn { font: 700 calc(15px * var(--q-k)) var(--v-ui) !important; fill: var(--nb) !important; }
  .q-fl { fill: none; stroke: var(--v-text3); stroke-width: 1.2; }
  .q-vt { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-vv { font: 500 calc(17px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text) !important; font-variant-numeric: tabular-nums; }
  .q-dial { fill: none; stroke: var(--v-line2); stroke-width: 6; }
  .q-ec { stroke: var(--v-au); stroke-width: 1.5; stroke-dasharray: 3 2; }
  .q-needle { stroke: var(--v-text); stroke-width: 2.5; }
  .q-needle.pinned { stroke: var(--v-au); }
  .q-hub { fill: var(--v-text); }
  .q-kin { fill: none; stroke: var(--v-au); stroke-width: 3; stroke-linejoin: bevel; }
</style>
