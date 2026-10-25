<!-- F8.04 Lane-rate ladder. Top: atlas research symbol rates (GBd) of TFLN and TFLT device rows, yearly maximum as a step
     line (chart-specs B2 values). Bottom: product milestones as graded tags on the same year axis. Hover or focus the
     "400 G/lane sampling" tag: research points above 200 GBd light up (PAM4 at about 200 GBd carries 400 Gb/s gross). -->
<script lang="ts">
  import G from "./G.svelte";
  import { LANE_MS } from "./facts";
  import { scale, linTicks } from "./plot";

  interface Pt { id: string; plat: string; year: number; v: number }
  let { pts, max }: { pts: Pt[]; max: Record<string, [number, number, string][]> } = $props();
  const prods = LANE_MS.filter((m) => !m.research);
  let hl = $state(-1);
  const lit = (p: Pt): boolean => hl >= 0 && prods[hl].tag?.includes("400 G/lane") === true && p.v > 200;

  let rwT = $state(0), rwV = $state(0);
  const geo = (v: boolean) => {
    const mw = v ? rwV : rwT;
    const W = mw > 200 ? mw : v ? 1000 : 760, H = v ? 320 : 230, L = v ? 64 : 48, Rr = 16, T = 14, B = v ? 54 : 48;
    const x = scale([2016.5, 2026.9], [L, W - Rr]), y = scale([0, 260], [H - B, T]);
    return { W, H, L, Rr, T, B, x, y };
  };
  const step = (g: ReturnType<typeof geo>, s: [number, number, string][]): string =>
    s.map(([yr, v], i) => { const x0 = g.x(yr - 0.5).toFixed(1), x1 = g.x(yr + 0.5).toFixed(1), y = g.y(v).toFixed(1);
      return i && s[i - 1][0] === yr - 1 ? `V${y} H${x1}` : `M${x0} ${y} H${x1}`; }).join(" ");
  const jit = (id: string): number => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997; return (h / 997 - 0.5) * 0.6; };
</script>

{#snippet chart(v: boolean)}
  {@const g = geo(v)}
  <svg class="i8-ll-svg" class:v width={g.W} height={g.H} viewBox="0 0 {g.W} {g.H}" role="img" aria-label="Highest symbol rate per year, TFLN and TFLT, atlas sample">
    {#each linTicks(0, 250, 50) as t (t)}<line x1={g.L} x2={g.W - g.Rr} y1={g.y(t)} y2={g.y(t)} class="gl" /><text x={g.L - 6} y={g.y(t) + 3.5} text-anchor="end" class="tk">{t}</text>{/each}
    {#each linTicks(2017, 2026, g.W < 600 ? 3 : 1) as yr (yr)}<text x={g.x(yr)} y={g.H - g.B + 16} text-anchor="middle" class="tk">{yr}</text>{/each}
    <text x={g.L} y={g.T - 3} class="tk">GBd</text>
    <line x1={g.L} x2={g.W - g.Rr} y1={g.y(200)} y2={g.y(200)} class="rf" class:on={hl >= 0 && prods[hl].tag?.includes("400 G/lane")} />
    {#each ["TFLT", "TFLN"] as p (p)}{#if max[p]}<path d={step(g, max[p])} class="st {p}" />{/if}{/each}
    {#each prods as m, i (m.date)}
      {@const px = g.x(m.year)}
      <line x1={px} x2={px} y1={g.T} y2={g.H - g.B} class="pm" class:on={hl === i} />
      <g class="pmk" class:on={hl === i} transform="translate({px.toFixed(1)} {g.H - g.B + (v ? 30 : 26)})"><rect x="-6" y="-6" width="12" height="12" /><text y="3.5" text-anchor="middle">{i + 1}</text></g>
    {/each}
    {#each pts as q (q.id)}
      {@const cx = g.x(q.year + jit(q.id))}
      {@const cy = g.y(q.v)}
      {#if q.plat === "TFLN"}<path d="M{cx} {cy - 4}l4 4l-4 4l-4 -4Z" class="pt TFLN" class:lit={lit(q)} data-pop="a:{q.id}" />
      {:else}<path d="M{cx} {cy - 4}l4 4l-4 4l-4 -4Z" class="pt TFLT" class:lit={lit(q)} data-pop="a:{q.id}" />{/if}
    {/each}
  </svg>
  <div class="i8-ll-tags" class:v>
    {#each prods as m, i (m.date)}
      <button type="button" class="i8-ptag" class:on={hl === i} onmouseenter={() => (hl = i)} onmouseleave={() => (hl = -1)} onfocus={() => (hl = i)} onblur={() => (hl = -1)}>
        <span class="i8-ptag-d"><b>{i + 1}</b> {m.date}</span><span class="i8-ptag-t">{m.tag}</span><G g={m.g} r={m.r} />
      </button>
    {/each}
  </div>
{/snippet}

<div class="panel i8-ll" data-variant="tech">
  <div class="ph"><span>Research: symbol rate per device row, step = yearly maximum</span><span>&#9670; TFLN &#9671; TFLT</span></div>
  <div class="i8-ll-b"><div class="i8-ll-m" bind:clientWidth={rwT}>{@render chart(false)}</div></div>
  <div class="pf">Bottom row: product milestones (grades F, V, T only). Hover a tag; the 400 G/lane tag lights research points above 200 GBd (PAM4, 2 bit per symbol). Maximum per year in the atlas sample; single demonstrations.</div>
</div>
<div class="i8-llv" data-variant="visual">
  <div class="i8-ll-m" bind:clientWidth={rwV}>{@render chart(true)}</div>
  <p class="v-cap">Diamonds: TFLN (filled) and TFLT (outline) device rows; steps: yearly maximum in the atlas sample; single demonstrations. Product milestones: grades F, V, T only. Hover a product tag; the 400 G/lane tag lights the research points above 200 GBd that make 400 Gb/s PAM4 possible (2 bit per symbol).</p>
</div>

<style>
  .i8-ll-b { padding: 8px 8px 4px; }
  .i8-ll-m { min-width: 0; }
  .i8-ll-svg { display: block; overflow: visible; max-width: 100%; }
  .gl { stroke: var(--rule); }
  .tk { font: 400 10px var(--mono); fill: var(--fg3); }
  .rf { stroke: var(--rule2); stroke-dasharray: 2 3; }
  .rf.on { stroke: var(--fg); }
  .st { fill: none; stroke: var(--fg2); stroke-width: 1.2; }
  .st.TFLT { stroke-dasharray: 4 3; }
  .pt.TFLN { fill: var(--fg2); } .pt.TFLT { fill: var(--bg); stroke: var(--fg2); }
  .pt { cursor: help; transition: opacity 120ms; }
  .pt.lit { fill: var(--fg); stroke: var(--fg); }
  .pm { stroke: var(--rule2); stroke-dasharray: 1 3; } .pm.on { stroke: var(--fg); stroke-dasharray: none; }
  .pmk rect { fill: var(--bg); stroke: var(--fg2); } .pmk text { font: 500 9px var(--mono); fill: var(--fg); }
  .pmk.on rect { fill: var(--fg); } .pmk.on text { fill: var(--bg); }
  .i8-ll-tags { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 6px; }
  .i8-ptag { display: grid; gap: 1px; justify-items: start; padding: 3px 6px; background: var(--bg); border: 1px solid var(--rule2); color: var(--fg); font: 400 10.5px/14px var(--mono); text-align: left; cursor: help; }
  .i8-ptag-d b { font-weight: 500; color: var(--fg); margin-right: 4px; }
  .i8-ptag-d { color: var(--fg3); }
  .i8-ptag.on { border-color: var(--fg); box-shadow: inset 0 0 0 1px var(--fg); }
  .i8-ptag:focus-visible { outline: 1px solid var(--fg); outline-offset: 2px; }
  .i8-ll-svg.v .tk { font: 500 13px var(--v-ui); fill: var(--v-text3); }
  .i8-ll-svg.v .gl { stroke: var(--v-line); }
  .i8-ll-svg.v .st.TFLN { stroke: var(--v-l532); stroke-width: 2; } .i8-ll-svg.v .st.TFLT { stroke: var(--v-au); stroke-width: 2; }
  .i8-ll-svg.v .pt.TFLN { fill: color-mix(in srgb, var(--v-l532) 50%, transparent); } .i8-ll-svg.v .pt.TFLT { fill: var(--v-ink0); stroke: var(--v-au); }
  .i8-ll-svg.v .pt.lit { fill: var(--v-text); stroke: var(--v-text); }
  .i8-ll-svg.v .rf.on { stroke: var(--v-l532); }
  .i8-ll-svg.v .pm { stroke: var(--v-line2); } .i8-ll-svg.v .pm.on { stroke: var(--v-l532); }
  .i8-ll-svg.v .pmk rect { fill: var(--v-ink1); stroke: var(--v-line2); } .i8-ll-svg.v .pmk text { font: 600 10px var(--v-ui); fill: var(--v-text); }
  .i8-ll-svg.v .pmk.on rect { fill: var(--v-l532); } .i8-ll-svg.v .pmk.on text { fill: var(--v-l532-ink); }
  .i8-ll-tags.v { gap: 12px; margin-top: 12px; }
  .i8-ll-tags.v .i8-ptag { padding: 10px 14px; background: var(--v-ink1); border: 1px solid var(--v-line); font: 500 13px/18px var(--v-ui); min-height: 44px; }
  .i8-ll-tags.v .i8-ptag-t { font: 400 16px/21px var(--v-serif); }
  .i8-ll-tags.v .i8-ptag.on { border-color: var(--v-l532); box-shadow: inset 0 0 0 1px var(--v-l532); }
  @media (max-width: 760px) { .i8-ll-tags { grid-template-columns: minmax(0, 1fr); } }
</style>
