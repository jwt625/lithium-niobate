<!-- F8.07 plot body (wide or narrow layout; MarketStrips renders both and CSS shows one, so the height is fixed before
     hydration). -->
<script lang="ts">
  import { MARKET, type Mkt } from "./facts";
  import { scale, logTicks } from "./plot";

  let { v, nar, baseOnly }: { v: boolean; nar: boolean; baseOnly: boolean } = $props();
  let rw = $state(0);
  const w = $derived(rw > 200 ? rw - 16 : nar ? 324 : v ? 1244 : 1104); // clientWidth includes the 8 px side padding
  const narrow = $derived(nar);
  const GROUPS: [string, (m: Mkt) => boolean][] = [
    ["Thin-film LN modulators and devices", (m) => m.def.startsWith("TFLN")],
    ["Bulk LN crystal and wafer", (m) => m.def.startsWith("Bulk")],
    ["China only (CNY, not converted)", (m) => m.cur === "CNY"],
    ["Outlier, scope unclear (excluded from ranges)", (m) => m.def === "Outlier"],
  ];
  const RH = $derived(v ? 34 : 24), GH = $derived(v ? 30 : 22);
  const L = $derived(narrow ? 64 : v ? 300 : 260), R = $derived(narrow ? 72 : 180);
  const X = $derived(scale([10, 10000], [L, w - R], true));
  const lo = (m: Mkt): number | null => (m.base ? m.base[0] : null);
  const hi = (m: Mkt): number | null => (m.fc === null ? null : Array.isArray(m.fc) ? m.fc[1] : m.fc);
  const fmtM = (x: number): string => (x >= 1000 ? `${+(x / 1000).toFixed(2)} B` : `${+x.toFixed(2)} M`);
  const baseTxt = (m: Mkt): string => (m.base ? (m.base[0] === m.base[1] ? fmtM(m.base[0]) : `${fmtM(m.base[0])}-${fmtM(m.base[1])}`) : "N/A");
  const fcTxt = (m: Mkt): string => (m.fc === null ? "-" : Array.isArray(m.fc) ? `${fmtM(m.fc[0])}-${fmtM(m.fc[1])}` : fmtM(m.fc));
  // layout rows: group header, rows (narrow screens put the label on its own line)
  const rows = $derived.by(() => {
    const out: { kind: "g" | "r"; y: number; g?: string; m?: Mkt; gi?: number }[] = [];
    let y = 26;
    GROUPS.forEach(([g, f], gi) => {
      if (gi === 3) y += 10;
      out.push({ kind: "g", y, g, gi }); y += GH;
      for (const m of MARKET.filter(f)) { out.push({ kind: "r", y, m, gi }); y += narrow ? RH + 16 : RH; }
      y += 8;
    });
    return { out, H: y + 6 };
  });
  const bracket = (gi: number): string => {
    const ms = MARKET.filter(GROUPS[gi][1]).filter((m) => m.cur === "USD");
    const b = ms.flatMap((m) => (m.base ? [m.base[0], m.base[1]] : [])), f = ms.map(hi).filter((x): x is number => x !== null);
    if (!b.length && !f.length) return "";
    return `base US$${fmtM(Math.min(...b))}-${fmtM(Math.max(...b))}, forecast US$${fmtM(Math.min(...f))}-${fmtM(Math.max(...f))}`;
  };
  const pid = $derived(v ? "i8-hv" : "i8-ht");
</script>

<div class="i8-mk-plot" class:v bind:clientWidth={rw}>
    <svg width={w} height={rows.H} viewBox="0 0 {w} {rows.H}" role="img" aria-label="Published market values, base year to forecast year, log US dollar axis">
      <defs>
        <pattern id={pid} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="hb" /><line x1="0" x2="0" y1="0" y2="6" class="hl" /></pattern>
        <pattern id="{pid}x" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0L6 6M6 0L0 6" class="hl" /></pattern>
      </defs>
      {#each logTicks(10, 10000, !narrow) as t (t)}<line class="gl" x1={X(t)} x2={X(t)} y1="18" y2={rows.H - 4} /><text class="tk" x={X(t)} y="12" text-anchor="middle">{t >= 1000 ? `${t / 1000} B` : `${t} M`}</text>{/each}
      {#each rows.out as r, k (k)}
        {#if r.kind === "g"}
          <text class="gh" x="0" y={r.y + 12}>{narrow ? (r.g ?? "").replace(/ \(.*\)$/, "") : r.g}</text>
          {#if !narrow && r.gi !== undefined && r.gi < 2}<text class="br" x={w - R} y={r.y + 12} text-anchor="end">{bracket(r.gi)}</text>{/if}
          {#if r.gi === 3}<line class="rule" x1="0" x2={w} y1={r.y - 4} y2={r.y - 4} />{/if}
        {:else if r.m}
          {@const m = r.m}
          {@const yb = narrow ? r.y + 14 : r.y}
          <text class="pl" x="0" y={r.y + (narrow ? 10 : RH / 2 + 4)} data-pop={m.r}>{narrow ? m.pub.replace(/ \(.*\)$/, "") : m.pub}{m.date !== "undated" && !narrow ? `, ${m.date}` : ""}{narrow && m.baseYear ? ` · ${m.baseYear}${m.fcYear ? ` to ${m.fcYear}` : ""}` : narrow && m.fcYear ? ` · ${m.fcYear}` : ""}</text>
          {#if m.cur === "CNY"}
            <text class="val" x={narrow ? 0 : L + 4} y={yb + RH / 2 + 4}>{narrow ? `CNY ${m.base?.[0]} M, not converted` : `CNY ${m.base?.[0]} M (${m.baseYear}), ${m.cagr}; not plotted on the US$ axis`}</text>
          {:else}
            {@const x0 = lo(m) !== null ? X(lo(m) as number) : null}
            {@const x1 = hi(m) !== null ? X(hi(m) as number) : null}
            {#if x0 !== null && x1 !== null}<rect class="bar" class:gone={baseOnly} x={x0} y={yb + 5} width={Math.max(2, x1 - x0)} height={RH - 10} fill="url(#{m.g === 'LG' ? pid : pid + 'x'})" />{/if}
            {#if x0 !== null}
              {#if m.base && m.base[1] !== m.base[0]}<rect class="rng" x={x0} y={yb + 3} width={X(m.base[1]) - x0} height={RH - 6} />{/if}
              <line class="end" x1={x0} x2={x0} y1={yb + 2} y2={yb + RH - 2} />
              <text class="val" x={x0 - 4} y={yb + RH / 2 + 4} text-anchor="end">{baseTxt(m)}{narrow ? "" : ` (${m.baseYear})`}</text>
            {/if}
            {#if x1 !== null}
              <g class:gone={baseOnly}>
                <line class="end" x1={x1} x2={x1} y1={yb + 2} y2={yb + RH - 2} />
                <text class="val" x={x1 + 4} y={yb + RH / 2 + 4}>{fcTxt(m)}{narrow ? "" : ` (${m.fcYear})${m.cagr !== "N/A" ? `, ${m.cagr}` : ""}`}</text>
              </g>
            {/if}
          {/if}
        {/if}
      {/each}
    </svg>
</div>

<style>
    .i8-mk-plot { padding: 4px 8px 6px; overflow: hidden; }
  .i8-mk-plot svg { display: block; overflow: visible; }
  .gl { stroke: var(--rule); }
  .tk { font: 400 10px var(--mono); fill: var(--fg3); }
  .gh { font: 500 11px var(--mono); fill: var(--fg); }
  .br { font: 400 10.5px var(--mono); fill: var(--fg2); }
  .pl { font: 400 11.5px var(--sans); fill: var(--fg2); cursor: help; }
  .val { font: 400 10.5px var(--mono); fill: var(--fg); }
  .bar { stroke: var(--fg2); stroke-width: 0.8; transition: opacity 240ms; }
  .hb { fill: var(--bg); } .hl { stroke: var(--fg3); stroke-width: 1.2; }
  .rng { fill: var(--acc-dim); stroke: var(--fg2); stroke-dasharray: 2 2; }
  .end { stroke: var(--fg); stroke-width: 1.5; }
  .gone { opacity: 0; }
  .rule { stroke: var(--fg3); stroke-dasharray: 3 3; }
  .v .gl { stroke: var(--v-line); }
  .v .tk { font: 500 12px var(--v-ui); fill: var(--v-text3); }
  .v .gh { font: 400 18px var(--v-serif); fill: var(--v-text); }
  .v .br { font: 500 13px var(--v-ui); fill: var(--v-l532); }
  .v .pl { font: 400 14px var(--v-ui); fill: var(--v-text2); }
  .v .val { font: 500 13px var(--v-ui); fill: var(--v-text); }
  .v .bar { stroke: var(--v-au); }
  .v .hb { fill: var(--v-ink1); } .v .hl { stroke: color-mix(in srgb, var(--v-au) 70%, transparent); }
  .v .end { stroke: var(--v-au); stroke-width: 2.5; }
  .v .rng { fill: color-mix(in srgb, var(--v-au) 20%, transparent); stroke: var(--v-au); }
</style>
