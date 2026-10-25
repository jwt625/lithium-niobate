<!-- fig-04-03 MgO threshold plot (data only). Damage threshold intensity, cw green, beam distortion after 10 min, re-keyed
     from Volk & Woehlecke Table 4.3 (data Furukawa et al. 2001). Lower bounds drawn as upward arrows; guide lines are not
     fits. Threshold markers: GRIIRA (volk2008 p. 96), Bryan 1984 (at.%), Furukawa 2000 (mol%, NSLN). -->
<script lang="ts">
  import Src from "./ui/Src.svelte";
  import Seg from "./ui/Seg.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import { axis, px, ticks } from "./plot.ts";
  import { f } from "./fmtq.ts";

  interface Pt { s: "CLN" | "NSLN"; mg: number; v: number; lb: boolean; lab: string }
  const PTS: Pt[] = [
    { s: "CLN", mg: 0, v: 1, lb: false, lab: "CLN" },
    { s: "CLN", mg: 3, v: 10, lb: false, lab: "CLN:3% MgO" },
    { s: "CLN", mg: 4.5, v: 75, lb: false, lab: "CLN:4.5% MgO" },
    { s: "CLN", mg: 6, v: 8000, lb: true, lab: "CLN:6% MgO" },
    { s: "NSLN", mg: 0, v: 0.1, lb: false, lab: "NSLN" },
    { s: "NSLN", mg: 0.6, v: 10, lb: false, lab: "NSLN:0.6% MgO" },
    { s: "NSLN", mg: 1.8, v: 8000, lb: true, lab: "NSLN:1.8% MgO" },
  ];
  const MARKS = [
    { x: 5, lab: "GRIIRA, CLN ~5%", who: "volk2008", loc: "p. 96" },
    { x: 1.5, lab: "GRIIRA, NSLN ~1.5%", who: "volk2008", loc: "p. 96" },
    { x: 4.5, lab: "Bryan 1984: ≥ 4.5 at.%", who: "bryan1984", loc: "" },
    { x: 0.78, lab: "Furukawa 2000: > 0.78 mol%, NSLN", who: "furukawa2000", loc: "" },
  ];
  let log = $state(true);
  let show = $state<"both" | "CLN" | "NSLN">("both");
  let hov = $state(-1);
  let mg = $state(2.5); // VISUAL strip, mol%

  const fmtV = (p: Pt) => `${p.lb ? "> " : ""}${p.v >= 1 ? p.v.toLocaleString("en-US") : p.v} kW/cm²`;
  const card = $derived(hov >= 0 ? PTS[hov] : null);

  function geom(Wd: number, Hd: number, L: number, R: number, T: number, B: number) {
    const xa = axis(0, 7, L, R);
    const ya = log ? axis(0.01, 1e5, B, T, true) : axis(0, 10000, B, T);
    return { xa, ya, Wd, Hd, L, R, T, B };
  }
  const G = $derived(geom(800, 380, 60, 784, 20, 340));
  const V = $derived(geom(640, 330, 60, 620, 20, 270));
  const vis = (p: Pt) => show === "both" || show === p.s;
  function guide(g: ReturnType<typeof geom>, s: "CLN" | "NSLN"): string {
    return PTS.filter((p) => p.s === s).map((p, i) => `${i ? "L" : "M"}${px(g.xa, p.mg).toFixed(1)} ${px(g.ya, p.v).toFixed(1)}`).join("");
  }
  const yTicks = (g: ReturnType<typeof geom>) => (log ? ticks(g.ya, 7, 1) : ticks(g.ya, 5, 1, (v) => v.toLocaleString("en-US")));
  // VISUAL strip: 60 Li sites, congruent antisite fraction drawn as 6 glyphs (illustrative); Mg replaces antisites up to threshold
  const SITES = 60, ANTI = [5, 14, 23, 33, 44, 53];
  const replaced = $derived(Math.min(ANTI.length, Math.round((mg / 5) * ANTI.length)));
</script>

{#snippet plot(g: ReturnType<typeof geom>, vmode: boolean)}
  <svg class="q-svg" viewBox="0 0 {g.Wd} {g.Hd}" role="img" aria-label="Photorefractive damage threshold intensity versus MgO concentration">
    {#each yTicks(g) as t (t.v)}<line class="gl" x1={g.L} x2={g.R} y1={t.p} y2={t.p} /><text x={g.L - 5} y={t.p + 3} text-anchor="end">{t.label}</text>{/each}
    {#each ticks(g.xa, 7) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={g.T} y2={g.B} /><text x={t.p} y={g.B + 14} text-anchor="middle">{t.label}</text>{/each}
    <rect class="fr" x={g.L} y={g.T} width={g.R - g.L} height={g.B - g.T} />
    {#each MARKS as mk, k (k)}<line class={vmode ? "q-vmark" : "c3"} x1={px(g.xa, mk.x)} x2={px(g.xa, mk.x)} y1={g.T} y2={g.B} /><text x={px(g.xa, mk.x) - 4} y={g.B - 6} class="lab" transform="rotate(-90 {px(g.xa, mk.x) - 4} {g.B - 6})">{mk.lab}</text>{/each}
    {#each ["CLN", "NSLN"] as s (s)}{#if show === "both" || show === s}<path class={vmode ? (s === "CLN" ? "q-gv1" : "q-gv2") : "c2"} stroke-dasharray="3 3" d={guide(g, s as "CLN" | "NSLN")} />{/if}{/each}
    {#each PTS as p, i (i)}{#if vis(p)}
      {@const x = px(g.xa, p.mg)}{@const y = px(g.ya, p.v)}
      <g class="q-pt" class:hv={hov === i} role="img" aria-label="{p.lab} {fmtV(p)}" onpointerenter={() => (hov = i)} onpointerleave={() => (hov = -1)}>
        {#if p.lb}<path d="M{x} {y} L{x} {y - 22} M{x - 4} {y - 16} L{x} {y - 22} L{x + 4} {y - 16}" class={vmode ? (p.s === "CLN" ? "q-av1" : "q-av2") : "c0"} />{/if}
        {#if p.s === "CLN"}<rect x={x - 4} y={y - 4} width="8" height="8" class={vmode ? "q-mv1" : "mk"} />{:else}<circle cx={x} cy={y} r="4.2" class={vmode ? "q-mv2" : "mko"} />{/if}
        <circle cx={x} cy={y} r="11" class="hit" />
      </g>
    {/if}{/each}
    <text x={(g.L + g.R) / 2} y={g.Hd - 6} text-anchor="middle">MgO (% in the source's unit)</text>
    <text x={g.L} y={g.T - 5}>damage threshold, kW/cm²</text>
    <text x={g.R} y={g.B - 6} text-anchor="end" class="lab">dashed: guide, not a fit</text>
  </svg>
{/snippet}

<div class="q-fig" id="fig-04-03">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Photorefractive damage threshold vs MgO (cw green, beam distortion after 10 min)</span><span>&#9632; CLN  &#9675; NSLN</span></div>
    <div class="q-f3">
      <div>{@render plot(G, false)}</div>
      <div class="q-f3t">
        <table class="idx q-tab">
          <thead><tr><th>Crystal</th><th class="r">kW/cm²</th></tr></thead>
          <tbody>{#each PTS as p, i (i)}<tr class:sel={hov === i}><td>{p.lab}</td><td class="r q-v">{p.lb ? "> " : ""}{p.v >= 1 ? p.v.toLocaleString("en-US") : p.v}</td></tr>{/each}</tbody>
        </table>
        <div class="q-card" aria-live="polite">{#if card}<b>{card.lab}</b>  {fmtV(card)}<br>cw green, 10 min; Table 4.3; P-comp{:else}hover a point: crystal, value,<br>condition, locator, status{/if}</div>
      </div>
    </div>
    <div class="ctl"><span class="k">y axis</span><Seg bind:value={log} options={[[true, "log"], [false, "lin"]]} label="Y axis scale" /><span></span></div>
    <div class="ctl"><span class="k">Series</span><Seg bind:value={show} options={[["both", "both"], ["CLN", "CLN"], ["NSLN", "NSLN"]]} label="Series" /><span></span></div>
    <div class="pf"><span>7 points <Src id="volk2008" loc="Table 4.3, p. 97 (data Furukawa 2001)" code="P-comp" /></span><span>markers: <Src id="volk2008" loc="p. 96" code="P-comp" cite={false} /> <Src id="bryan1984" code="reported" cite={false} /> <Src id="furukawa2000" code="reported" cite={false} /></span><span>units as in each source; not converted</span></div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>The MgO cliff</h3><span class="q-vq">same green beam, same 10 minutes, rising MgO</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        {@render plot(V, true)}
        <svg class="q-svg" viewBox="0 0 640 96" role="img" aria-label="Illustration: Mg ions replacing Nb antisites on Li sites as MgO rises">
          <text x="20" y="16" class="q-st">Li sites, illustrative: Nb antisites (gold) replaced by Mg (green) up to the threshold</text>
          {#each Array.from({ length: SITES }, (_, i) => i) as i (i)}
            {@const a = ANTI.indexOf(i)}
            {@const x = 26 + i * 9.9}
            {#if a >= 0 && a < replaced}<rect x={x - 3.5} y="40" width="7" height="7" class="q-mg" transform="rotate(45 {x} 43.5)" />{:else if a >= 0}<circle cx={x} cy="43.5" r="4" class="q-nb" />{:else}<circle cx={x} cy="43.5" r="1.6" class="q-li" />{/if}
          {/each}
          <text x="20" y="78" class="q-st">{mg >= 5 ? "above threshold: further Mg goes onto Nb sites; the OH band shifts" : `${ANTI.length - replaced} of ${ANTI.length} antisite glyphs remain`}</text>
        </svg>
      </div>
      <div class="q-vctl">
        <div class="v-ctl"><span class="v-lab">Intensity axis</span><Seg kind="v" bind:value={log} options={[[true, "Log"], [false, "Linear"]]} label="Y axis scale" /></div>
        <div class="v-ctl"><span class="v-lab">Crystal</span><Seg kind="v" bind:value={show} options={[["both", "Both"], ["CLN", "Congruent"], ["NSLN", "Near-stoich."]]} label="Series" /></div>
        <VCtl id="f3-mg-v" label="MgO in the drawing" bind:value={mg} min={0} max={7} step={0.1} out="{f(mg, 1, 4)} %" w={7} />
        <div class="q-vcard">{#if card}<b>{card.lab}</b><span>{fmtV(card)}</span><span>cw green, 10 min; Table 4.3</span>{:else}<b>Hover a point</b><span>value, condition, locator</span><span>&nbsp;</span>{/if}</div>
        <p class="v-cap">Three decades between 3% and 6% MgO in congruent crystals, and 6% is a lower bound. Near-stoichiometric crystals exceed 8000 kW/cm² at 1.8%; both top values are lower bounds, not a measured plateau.</p>
      </div>
    </div>
    <div class="v-prov"><span>data <Src id="volk2008" loc="Table 4.3" code="P-comp" /></span><span>thresholds <Src id="bryan1984" code="reported" /> <Src id="furukawa2000" code="reported" /></span><span>lattice strip: drawing, not a model</span></div>
  </div>
</div>

<style>
  .q-f3 { display: grid; grid-template-columns: minmax(0, 1fr) 250px; }
  .q-f3 > * { min-width: 0; }
  .q-f3t { border-left: 1px solid var(--rule2); padding: 8px; display: grid; gap: 8px; align-content: start; }
  .q-f3t table td:first-child { font-size: 11.5px; }
  .q-f3t tr.sel td { background: var(--acc-dim); color: var(--fg); }
  .q-card { height: 44px; font: 400 10.5px/16px var(--mono); color: var(--fg2); white-space: pre; overflow: hidden; border: 1px solid var(--rule); padding: 4px 6px; }
  .q-card b { color: var(--fg); font-weight: 500; }
  @media (max-width: 760px) { .q-f3 { grid-template-columns: minmax(0, 1fr); } .q-f3t { border-left: 0; border-top: 1px solid var(--rule2); } }
  .q-pt { cursor: pointer; }
  .q-pt.hv rect, .q-pt.hv circle:not(.hit) { stroke-width: 2.5; }
  .q-vmark { stroke: var(--v-au); stroke-width: 1; stroke-dasharray: 2 3; }
  .q-gv1 { fill: none; stroke: var(--v-text2); stroke-width: 1.2; }
  .q-gv2 { fill: none; stroke: var(--v-l532); stroke-width: 1.2; }
  .q-mv1 { fill: var(--v-text); }
  .q-mv2 { fill: var(--v-ink0); stroke: var(--v-l532); stroke-width: 2; }
  .q-av1 { fill: none; stroke: var(--v-text); stroke-width: 1.5; }
  .q-av2 { fill: none; stroke: var(--v-l532); stroke-width: 1.5; }
  .q-st { font: 500 calc(12px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-mg { fill: var(--v-l532); }
  .q-nb { fill: var(--v-au); }
  .q-li { fill: var(--v-text3); }
  .q-vcard { display: grid; gap: 2px; align-content: start; height: 120px; overflow: hidden; padding: 12px 16px; border: 1px solid var(--v-line2); font: 400 15px/22px var(--v-ui); color: var(--v-text2); }
  .q-vcard b { font: 500 17px/24px var(--v-ui); color: var(--v-text); }
</style>
