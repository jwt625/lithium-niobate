<!-- F8.03 Wafer-size ladder. TECH: concentric to-scale outlines (76.2, 100, 150, 200 mm; 300 mm dashed, LG) with numbered
     milestone marks beside a mono table. VISUAL: wafers side by side to scale with flats, milestone cards below. Product
     filter dims rows and marks (no resize). -->
<script lang="ts">
  import G from "./G.svelte";
  import { WAFER_MS, type Product } from "./facts";

  const SIZES: [number, string][] = [[76.2, '3"'], [100, '4"'], [150, '6"'], [200, '8"'], [300, '12"']];
  let prod = $state<"all" | Product>("all");
  let hov = $state(-1);
  const on = (i: number): boolean => prod === "all" || WAFER_MS[i].product === prod;
  // milestone marks: per ring, evenly spread over the lower 220 degrees in date order
  const marks: { i: number; d: number; x: number; y: number }[] = [];
  for (const [d] of SIZES) {
    const idx = WAFER_MS.map((m, i) => (m.sizes.includes(d) ? i : -1)).filter((i) => i >= 0);
    idx.forEach((i, k) => {
      const a = ((200 - (220 * (k + 0.5)) / Math.max(idx.length, 3)) * Math.PI) / 180;
      marks.push({ i, d, x: (d / 2) * Math.cos(a), y: -(d / 2) * Math.sin(a) });
    });
  }
  const flat = (D: number): string => { const R = D / 2, c = R * 0.94, hw = Math.sqrt(R * R - c * c); return `M${(-hw).toFixed(2)} ${c.toFixed(2)} A${R} ${R} 0 1 1 ${hw.toFixed(2)} ${c.toFixed(2)} Z`; };
  const short = (t: string): string => (t.length > 70 ? t.slice(0, 68).replace(/[ ,;]+\S*$/, "") + "…" : t);
</script>

{#snippet ctl(v: boolean)}
  <div class={v ? "i8-wl-ctl v" : "i8-ctlrow"}>
    <span class="lbl">Product</span>
    <div class={v ? "v-seg" : "seg"} role="group" aria-label="Product filter">
      {#each [["all", "all"], ["thin", "thin film"], ["bulk", "bulk"]] as [k, l] (k)}<button type="button" class:on={prod === k} onclick={() => (prod = k as typeof prod)}>{l}</button>{/each}
    </div>
  </div>
{/snippet}

<div class="panel i8-wl" data-variant="tech">
  <div class="ph"><span>Wafer outlines to scale, 1 unit = 1 mm</span><span>12-inch dashed: <G g="LG" r="r:r09-s9" /></span></div>
  {@render ctl(false)}
  <div class="i8-wl-grid">
    <svg viewBox="-158 -158 316 316" class="i8-wl-svg" role="img" aria-label="Concentric wafer outlines with numbered milestones">
      {#each SIZES as [d, l] (d)}
        <circle r={d / 2} class:lg={d === 300} class="ring" />
        <text x="0" y={d / 2 - 3} text-anchor="middle" class="rl">{l}</text>
      {/each}
      {#each marks as m (m.i + "-" + m.d)}
        <g class="mk" class:off={!on(m.i)} class:hl={hov === m.i} transform="translate({m.x.toFixed(2)} {m.y.toFixed(2)})" role="presentation" onmouseenter={() => (hov = m.i)} onmouseleave={() => (hov = -1)}>
          <rect x="-5.5" y="-5.5" width="11" height="11" /><text y="3" text-anchor="middle">{m.i + 1}</text>
        </g>
      {/each}
    </svg>
    <div class="scrollx i8-wl-t">
      <table class="log">
        <thead><tr><th>#</th><th>Date</th><th>Size</th><th>Milestone</th><th>Grade</th></tr></thead>
        <tbody>
          {#each WAFER_MS as m, i (i)}
            <tr class:off={!on(i)} class:hl={hov === i} onmouseenter={() => (hov = i)} onmouseleave={() => (hov = -1)}><td>{i + 1}</td><td>{m.date}</td><td>{m.label}</td><td class="e">{m.t}</td><td><G g={m.g} r={m.r} /></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="pf">Milestone numbers match the table; marks dim with the product filter. Dies per wafer: next figure.</div>
</div>

<div class="i8-wlv" data-variant="visual">
  {@render ctl(true)}
  <div class="i8-row">
    {#each SIZES as [d, l] (d)}
      {@const n = WAFER_MS.filter((m, i) => m.sizes.includes(d) && on(i)).length}
      <figure class="i8-w" style="--d:{d}">
        <svg viewBox="{-d / 2 - 2} {-d / 2 - 2} {d + 4} {d + 4}" role="img" aria-label="{l} wafer, {d} mm, to scale">
          <path d={flat(d)} class="wf" class:lg={d === 300} />
        </svg>
        <figcaption><b>{l}</b> {d} mm<br><span>milestones: {n}{d === 300 ? ", LG only" : ""}</span></figcaption>
      </figure>
    {/each}
  </div>
  <ol class="i8-msc">
    {#each WAFER_MS as m, i (i)}
      <li class:off={!on(i)}><span class="d">{m.date}</span><span class="s">{m.label} &middot; {m.product === "bulk" ? "bulk" : "thin film"}</span><span class="t">{m.t}</span><G g={m.g} r={m.r} /></li>
    {/each}
  </ol>
</div>

<style>
  .i8-wl .seg button { padding: 3px 8px; }
  .i8-wl-grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 10px; padding: 8px; }
  .i8-wl-svg { width: 100%; max-width: 460px; aspect-ratio: 1; display: block; }
  .ring { fill: none; stroke: var(--fg3); stroke-width: 0.6; }
  .ring.lg { stroke-dasharray: 3 3; }
  .rl { font: 400 6px var(--mono); fill: var(--fg3); }
  .mk rect { fill: var(--bg); stroke: var(--fg); stroke-width: 0.6; }
  .mk text { font: 400 6.5px var(--mono); fill: var(--fg); pointer-events: none; }
  .mk { cursor: default; transition: opacity 120ms; }
  .mk.off { opacity: 0.2; }
  .mk.hl rect { fill: var(--fg); } .mk.hl text { fill: var(--bg); }
  .i8-wl-t { max-height: 460px; }
  .i8-wl-t tr.off td { opacity: 0.3; }
  .i8-wl-t tr.hl td { background: var(--acc-dim); }
  .i8-wl-t td.e { min-width: 220px; }
  @media (max-width: 900px) { .i8-wl-grid { grid-template-columns: minmax(0, 1fr); } .i8-wl-t { max-height: none; } }

  .i8-wlv { --s: 1.3px; }
  .i8-wl-ctl.v { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center; margin-bottom: 24px; }
  .i8-wl-ctl.v .lbl { font: 500 14px/20px var(--v-ui); letter-spacing: 0; text-transform: none; color: var(--v-text3); }
  .i8-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 28px 32px; }
  .i8-w { margin: 0; display: grid; justify-items: center; gap: 8px; }
  .i8-w svg { width: calc(var(--d) * var(--s)); height: calc(var(--d) * var(--s)); display: block; }
  .i8-w figcaption { font: 400 14px/20px var(--v-ui); color: var(--v-text2); text-align: center; }
  .i8-w figcaption b { font: 400 22px/26px var(--v-serif); color: var(--v-text); font-weight: 400; }
  .i8-w figcaption span { color: var(--v-text3); font-size: 13px; font-variant-numeric: tabular-nums; }
  .wf { fill: color-mix(in srgb, var(--v-text3) 12%, transparent); stroke: var(--v-text2); stroke-width: 0.8; }
  .wf.lg { fill: none; stroke-dasharray: 4 4; stroke: var(--v-text3); }
  .i8-msc { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
  .i8-msc li { display: grid; gap: 4px; align-content: start; justify-items: start; padding: 14px 16px; background: var(--v-ink1); border: 1px solid var(--v-line); transition: opacity 240ms var(--v-ease); }
  .i8-msc li.off { opacity: 0.25; }
  .i8-msc .d { font: 400 24px/28px var(--v-serif); font-variant-numeric: lining-nums; color: var(--v-text); }
  .i8-msc .s { font: 500 12px/16px var(--v-ui); color: var(--v-text3); }
  .i8-msc .t { font: 400 15px/22px var(--v-ui); color: var(--v-text2); }
  @media (max-width: 640px) { .i8-wlv { --s: 1.05px; } .i8-row { gap: 20px; } }
</style>
