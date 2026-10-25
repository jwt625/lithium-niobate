<!-- fig-04-06 Intensity ladder (data only). One log axis 1e-2 to 1e10 W/cm^2 for intensities, a separate parallel axis for
     fluence (J/cm^2); no conversion between the two. Vendor values in a separate dashed lane (not a material constant). -->
<script lang="ts">
  import Src from "./ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Seg from "./ui/Seg.svelte";
  import type { StatusCode } from "$lib/content/site";
  import { axis, px } from "./plot.ts";
  import { pow10 } from "./fmtq.ts";

  type Reg = "cw" | "pulsed";
  type X = "Fe" | "CLN" | "MgO" | "NSLN" | "any";
  interface Row { id: string; lo: number; hi?: number; lb?: boolean; reg: Reg; xt: X[]; val: string; def: string; src: string; loc: string; code: StatusCode; rev: boolean }
  const ROWS: Row[] = [
    { id: "onset", lo: 1e-2, reg: "cw", xt: ["Fe"], val: "10 mW/cm²", def: "photorefraction observed, no threshold; blue-green, LiNbO3:Fe", src: "volk2008", loc: "p. 52", code: "P-comp", rev: true },
    { id: "nsln", lo: 1e2, reg: "cw", xt: ["NSLN"], val: "0.1 kW/cm²", def: "photorefractive damage threshold, NSLN; green, 10 min", src: "volk2008", loc: "Table 4.3", code: "P-comp", rev: true },
    { id: "cln", lo: 1e3, reg: "cw", xt: ["CLN"], val: "1 kW/cm²", def: "photorefractive damage threshold, CLN; green, 10 min", src: "volk2008", loc: "Table 4.3", code: "P-comp", rev: true },
    { id: "mgo", lo: 8e6, lb: true, reg: "cw", xt: ["MgO", "NSLN"], val: "> 8 MW/cm²", def: "no damage, CLN:6% MgO and NSLN:1.8% MgO; green, 10 min", src: "volk2008", loc: "Table 4.3", code: "P-comp", rev: true },
    { id: "griira", lo: 2.5e3, reg: "cw", xt: ["CLN", "NSLN"], val: "2.5 kW/cm²", def: "GRIIRA measured, 532 nm pump; vanishes when pump stops", src: "volk2008", loc: "Fig. 4.14, p. 96", code: "P-comp", rev: true },
    { id: "color", lo: 1e8, reg: "pulsed", xt: ["any"], val: "~100 MW/cm²", def: "gray (dark) trace after repeated pulses; stable in CLN", src: "volk2008", loc: "p. 51", code: "P-comp", rev: true },
    { id: "break", lo: 1e9, hi: 1e10, reg: "pulsed", xt: ["any"], val: "GW/cm² range", def: "laser-induced breakdown, 1064 nm, pulse-length dependent; permanent", src: "volk2008", loc: "p. 51", code: "P-comp", rev: false },
  ];
  const VENDOR = { lo: 1e8, hi: 3e8, val: "100-300 MW/cm²", def: "vendor laser damage thresholds, 10 ns, 1064 nm", src: "" };
  const FLU = { v: 14, val: "14 J/cm²", def: "bulk laser damage, 1 mol% MgO:LN, 1.053 µm, 1 ns", src: "furukawa1991" };

  const LDY: Record<string, number> = { griira: -14, cln: 12 }; // label offsets for the close 1 and 2.5 kW/cm² rungs (VISUAL)
  let reg = $state<"all" | Reg>("all");
  let xt = $state<"none" | X>("none");
  let hov = $state<string>("");
  const on = (r: Row) => reg === "all" || r.reg === reg;
  const lit = (r: Row) => xt === "none" || r.xt.includes(xt) || r.xt.includes("any");
  const card = $derived(ROWS.find((r) => r.id === hov));

  // TECH geometry
  const W = 800, H = 560, AX = 250, T = 24, B = 520;
  const ya = axis(1e-2, 1e10, B, T, true);
  const fa = axis(1e-1, 1e2, B, T, true); // fluence axis drawn over the same height, independent scale
  // VISUAL geometry
  const VW = 640, VH = 670, VX = 120, VT = 30, VB = 600;
  const vya = axis(1e-2, 1e10, VB, VT, true);
  const vfa = axis(1e-1, 1e2, VB, VT, true);
</script>

<div class="q-fig" id="fig-04-06">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Intensity ladder: one log axis, value left, definition right</span><span>fluence on its own axis; no conversion</span></div>
    <div class="q-pside">
      <div>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Damage thresholds of lithium niobate on a log intensity axis">
          <line class="ax" x1={AX} x2={AX} y1={T} y2={B} />
          {#each Array.from({ length: 13 }, (_, i) => i - 2) as k (k)}<line class="ax" x1={AX - 4} x2={AX + 4} y1={px(ya, 10 ** k)} y2={px(ya, 10 ** k)} /><text x={AX + 8} y={px(ya, 10 ** k) + 3} class="q-dec">{pow10(k)}</text>{/each}
          <text x={AX} y={T - 10} text-anchor="middle">W/cm²</text>
          {#each ROWS as r (r.id)}
            {@const y = px(ya, r.lo)}
            <g class="q-row" class:off={!on(r)} class:dim={!lit(r)} class:hv={hov === r.id} role="img" aria-label="{r.val}: {r.def}" onpointerenter={() => (hov = r.id)} onpointerleave={() => (hov = "")}>
              {#if r.hi}<rect x={AX - 3} y={px(ya, r.hi)} width="6" height={y - px(ya, r.hi)} class="mk" />{:else}<rect x={AX - 4} y={y - 4} width="8" height="8" class={r.rev ? "mko" : "mk"} />{/if}
              {#if r.lb}<path d="M{AX} {y - 4} L{AX} {y - 20} M{AX - 4} {y - 14} L{AX} {y - 20} L{AX + 4} {y - 14}" class="c0" />{/if}
              <text x={AX - 12} y={y + 3} text-anchor="end" class="labf">{r.val} <tspan class="q-rg">{r.reg}</tspan></text>
              <line class="gl" x1={AX + 40} x2={AX + 52} y1={y} y2={y} />
              <text x={AX + 56} y={y + 3} class="lab">{r.def}</text>
              <rect x="0" y={y - 9} width={W - 120} height="18" class="hit" />
            </g>
          {/each}
          <!-- vendor lane -->
          <rect x={W - 104} y={px(ya, VENDOR.hi)} width="14" height={px(ya, VENDOR.lo) - px(ya, VENDOR.hi)} class="q-vend" />
          <text x={W - 97} y={px(ya, VENDOR.lo) + 14} text-anchor="middle" class="lab">vendor</text><text x={W - 97} y={px(ya, VENDOR.lo) + 26} text-anchor="middle" class="lab">not a</text><text x={W - 97} y={px(ya, VENDOR.lo) + 38} text-anchor="middle" class="lab">material</text><text x={W - 97} y={px(ya, VENDOR.lo) + 50} text-anchor="middle" class="lab">constant</text>
          <line x1={W - 112} x2={W - 112} y1={T} y2={B} class="c3" />
          <!-- fluence axis -->
          <line class="ax" x1={W - 30} x2={W - 30} y1={T} y2={B} />
          {#each [-1, 0, 1, 2] as k (k)}<line class="ax" x1={W - 34} x2={W - 26} y1={px(fa, 10 ** k)} y2={px(fa, 10 ** k)} /><text x={W - 22} y={px(fa, 10 ** k) + 3}>{pow10(k)}</text>{/each}
          <rect x={W - 34} y={px(fa, FLU.v) - 4} width="8" height="8" class="mk" />
          <text x={W - 30} y={T - 10} text-anchor="middle">J/cm²</text>
          <text x={W - 38} y={px(fa, FLU.v) + 3} text-anchor="end" class="labf">14</text>
        </svg>
      </div>
      <div class="q-side">
        <div class="q-card2" aria-live="polite">{#if card}<b>{card.val}</b> {card.reg}; {card.loc}<br>{card.def}{:else}hover a rung: value, regime, locator<br>and definition{/if}</div>
        <dl class="q-kv">
          <dt>span, cw onset to breakdown</dt><dd>11-12 decades</dd>
          <dt>vendor</dt><dd>100-300 MW/cm², 10 ns</dd>
          <dt>fluence, 1 mol% MgO:LN</dt><dd>14 J/cm², 1 ns</dd>
        </dl>
        <p class="q-note">Breakdown thresholds scatter: surface and bulk damage differ and depend on polishing and defects; measured values are often far below literature values (p. 51). Intensity and fluence are not interchangeable without the pulse shape.</p>
      </div>
    </div>
    <div class="ctl"><span class="k">Regime</span><Seg bind:value={reg} options={[["all", "all"], ["cw", "cw"], ["pulsed", "pulsed"]]} label="Regime filter" /><span></span></div>
    <div class="ctl"><span class="k">Highlight</span><Seg bind:value={xt} options={[["none", "none"], ["Fe", "Fe:LN"], ["CLN", "CLN"], ["MgO", "MgO:CLN"], ["NSLN", "NSLN"]]} label="Crystal highlight" /><span></span></div>
    <div class="pf"><span>rungs <Src id="volk2008" loc="pp. 51-52, Table 4.3" code="P-comp" /></span><span>fluence <Src id="furukawa1991" code="reported" /></span><span>vendor data sheets <Badge code="V" pop="f6-vend" /></span></div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>Three kinds of damage, 11-12 decades</h3><span class="q-vq">reversible at the bottom, permanent at the top</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 {VW} {VH}" role="img" aria-label="Thermometer-style column of damage intensities, reversible effects at the bottom and breakdown at the top">
          <defs><linearGradient id="f6-col" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#3b78b8" stop-opacity="0.55" /><stop offset="0.6" stop-color="var(--v-l532)" stop-opacity="0.35" /><stop offset="0.85" stop-color="#ff7a3d" stop-opacity="0.55" /><stop offset="1" stop-color="var(--v-l633)" stop-opacity="0.7" /></linearGradient></defs>
          <rect x={VX - 18} y={VT} width="36" height={VB - VT} fill="url(#f6-col)" class="q-tube" />
          <circle cx={VX} cy={VB + 30} r="26" fill="#3b78b8" opacity="0.6" />
          <!-- kintsugi crack across the breakdown band -->
          <path d="M{VX - 18} {px(vya, 6e9)} L{VX - 6} {px(vya, 4e9)} L{VX + 2} {px(vya, 5e9)} L{VX + 10} {px(vya, 2.2e9)} L{VX + 18} {px(vya, 2.8e9)}" class="q-kin" />
          {#each [-2, 0, 2, 4, 6, 8, 10] as k (k)}<text x={VX - 26} y={px(vya, 10 ** k) + 4} text-anchor="end">{pow10(k)}</text>{/each}
          <text x={VX - 26} y={VT - 10} text-anchor="end">W/cm²</text>
          {#each ROWS as r (r.id)}
            {@const y = px(vya, r.hi ? Math.sqrt(r.lo * r.hi) : r.lo)}
            <g class="q-vrow" class:off={!on(r)} class:dim={!lit(r)} role="img" aria-label="{r.val}: {r.def}" onpointerenter={() => (hov = r.id)} onpointerleave={() => (hov = "")}>
              <line x1={VX + 18} x2={VX + 52} y1={y} y2={y} class={r.rev ? "q-tick" : "q-tickp"} />
              <text x={VX + 58} y={y - 3 + (LDY[r.id] ?? 0)} class="q-vv">{r.val}{r.id === "griira" ? " GRIIRA" : ""}</text>
              <text x={VX + 58} y={y + 14 + (LDY[r.id] ?? 0)} class="q-vd">{r.id === "mgo" ? "no damage" : r.rev ? "reversible" : "permanent"}, {r.reg}</text>
              <rect x={VX + 18} y={y - 16} width="420" height="34" class="hit" />
            </g>
          {/each}
          <rect x="560" y={px(vya, VENDOR.hi)} width="12" height={px(vya, VENDOR.lo) - px(vya, VENDOR.hi)} class="q-vvend" />
          <text x="552" y={px(vya, VENDOR.hi) - 6} text-anchor="end" class="q-vd">vendor, not a material constant</text>
          <line x1="610" x2="610" y1={VT} y2={VB} class="q-flu" />
          <circle cx="610" cy={px(vfa, FLU.v)} r="6" class="q-flud" />
          <text x="602" y={px(vfa, FLU.v) + 22} text-anchor="end" class="q-vd">14 J/cm², 1 ns</text>
          <text x="610" y={VT - 10} text-anchor="middle">J/cm²</text>
        </svg>
      </div>
      <div class="q-vctl">
        <div class="v-ctl"><span class="v-lab">Regime</span><Seg kind="v" bind:value={reg} options={[["all", "All"], ["cw", "cw"], ["pulsed", "Pulsed"]]} label="Regime filter" /></div>
        <div class="v-ctl"><span class="v-lab">Crystal</span><Seg kind="v" bind:value={xt} options={[["none", "All"], ["Fe", "Fe"], ["CLN", "CLN"], ["MgO", "MgO"], ["NSLN", "NSLN"]]} label="Crystal highlight" /></div>
        <div class="q-vcard">{#if card}<b>{card.val}</b><span>{card.def}</span>{:else}<b>Hover a rung</b><span>value and definition</span>{/if}</div>
        <p class="v-cap">Fe-doped LN is distorted by cw light at 10 mW/cm²; breakdown needs GW/cm² nanosecond pulses. The fluence axis on the right is separate: intensity and fluence do not convert without the pulse shape.</p>
      </div>
    </div>
    <div class="v-prov"><span>rungs <Src id="volk2008" loc="pp. 51-52, Table 4.3" code="P-comp" /></span><span>fluence <Src id="furukawa1991" code="reported" /></span><span>vendor data sheets <Badge code="V" pop="f6-vend" /></span></div>
  </div>
</div>

<style>
  .q-dec { fill: var(--fg3); }
  .q-rg { fill: var(--fg3); }
  .q-row.off, .q-vrow.off { opacity: 0.12; }
  .q-row.dim, .q-vrow.dim { opacity: 0.35; }
  .q-row.hv text { fill: var(--fg); }
  .q-vend { fill: none; stroke: var(--fg2); stroke-dasharray: 3 2; }
  .q-card2 { height: 52px; font: 400 10.5px/16px var(--mono); color: var(--fg2); overflow: hidden; border: 1px solid var(--rule); padding: 4px 6px; }
  .q-card2 b { color: var(--fg); font-weight: 500; }
  .q-tube { stroke: var(--v-line2); stroke-width: 1.5; }
  .q-kin { fill: none; stroke: var(--v-au); stroke-width: 3; stroke-linejoin: bevel; }
  .q-tick { stroke: var(--v-text2); stroke-width: 1.5; }
  .q-tickp { stroke: var(--v-au); stroke-width: 2; }
  .q-vv { font: 500 calc(16px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text) !important; }
  .q-vd { font: 400 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-vvend { fill: none; stroke: var(--v-text3); stroke-width: 1.5; stroke-dasharray: 4 3; }
  .q-flu { stroke: var(--v-line2); stroke-width: 1.5; }
  .q-flud { fill: var(--v-au); }
  .q-vcard { display: grid; gap: 2px; align-content: start; height: 120px; overflow: hidden; padding: 12px 16px; border: 1px solid var(--v-line2); font: 400 15px/22px var(--v-ui); color: var(--v-text2); }
  .q-vcard b { font: 500 17px/24px var(--v-ui); color: var(--v-text); }
</style>
