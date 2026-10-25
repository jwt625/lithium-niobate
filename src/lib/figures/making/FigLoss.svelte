<!-- F05-09 Loss and Q by fabrication route. Rows from manuscript 5.7 (each with DOI, issue date, route, metric, status).
     Loss in dB/m on a log axis; Q-only rows are placed with alpha = 2 pi n_g / (lambda Q) at 1550 nm with a template
     group index (labelled). Material limit about 0.2 dB/m after the O2 anneal (shamsansari2022), dashed. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import type { LossRow } from "./flow";
  import { alphaFromQ, alphaPerMToDbPerM, qFromAlpha, dbPerMToAlphaPerM } from "$lib/physics/units.ts";

  let { rows }: { rows: LossRow[] } = $props();
  const NG = 2.3; // template group index for Q-only rows
  let log = $state(true);
  let sel = $state(0);
  const SHAPES: Record<string, string> = { "EBL + Ar": "c", "DUV + Ar": "s", "DUV + DLC": "d", PLACE: "t", "CMP from bulk": "x" };
  const Y0 = 0.1, Y1 = 300;
  const PX = (y: number): number => 60 + ((y - 2016.5) / 8.5) * 400;
  const PY = $derived((v: number): number => (log ? 190 - (Math.log10(v / Y0) / Math.log10(Y1 / Y0)) * 176 : 190 - (Math.min(v, 160) / 160) * 176));
  const ticks = $derived(log ? [0.1, 1, 10, 100] : [0, 40, 80, 120, 160]);
  const qf = (q: number): string => { const e = Math.floor(Math.log10(q)); return `${Math.round(q / 10 ** e)}e${e}`; };
  const qAt = (dbm: number): number => qFromAlpha(dbPerMToAlphaPerM(dbm), NG, 1.55);
  const cur = $derived(rows[Math.min(sel, rows.length - 1)]);
  const best = $derived.by(() => { const s = [...rows].sort((a, b) => a.year - b.year); let m = Infinity; const pts: [number, number][] = []; for (const r of s) if (!r.viaQ && r.dbm < m) { m = r.dbm; pts.push([r.year, r.dbm]); } return pts; });
  void alphaFromQ; void alphaPerMToDbPerM;
</script>

{#snippet marker(r: LossRow, i: number, big: boolean)}
  {@const x = PX(r.year)}{@const y = PY(r.dbm)}{@const s = big ? 7 : 5}{@const sh = SHAPES[r.route] ?? "c"}
  <g class="mk-pt{i === sel ? ' on' : ''}" role="button" tabindex="0" aria-label="{r.who} {r.issued}, {r.metric}" onmouseenter={() => (sel = i)} onfocus={() => (sel = i)} onclick={() => (sel = i)} onkeydown={() => (sel = i)}>
    {#if sh === "c"}<circle cx={x} cy={y} r={s} />{:else if sh === "s"}<rect x={x - s} y={y - s} width={2 * s} height={2 * s} />{:else if sh === "d"}<path d="M{x} {y - s * 1.3}l{s * 1.3} {s * 1.3}l{-s * 1.3} {s * 1.3}l{-s * 1.3} {-s * 1.3}z" />{:else if sh === "t"}<path d="M{x} {y - s * 1.2}l{s * 1.2} {s * 2}h{-s * 2.4}z" />{:else}<path d="M{x - s} {y - s}l{2 * s} {2 * s}m0 {-2 * s}l{-2 * s} {2 * s}" class="xm" />{/if}
    {#if r.bound}<path d="M{x} {y + s + 2}v8m-3 -3l3 3l3 -3" class="xm" />{/if}
  </g>
{/snippet}

{#snippet chart(big: boolean)}
  <svg class="mk-plot mk-loss" viewBox="0 0 520 220" role="img" aria-label="Propagation loss versus year by fabrication route">
    {#each ticks as v (v)}<line class="gl" x1="60" x2="460" y1={PY(Math.max(v, 0.1))} y2={PY(Math.max(v, 0.1))} /><text class="tk e" x="56" y={PY(Math.max(v, 0.1)) + 3}>{v}</text>{#if log}<text class="tk" x="466" y={PY(v) + 3}>Q {qf(qAt(v))}</text>{/if}{/each}
    {#each [2017, 2019, 2021, 2023, 2025] as y (y)}<text class="tk m" x={PX(y)} y="206">{y}</text>{/each}
    <line class="dsh" x1="60" x2="460" y1={PY(0.2)} y2={PY(0.2)} /><text class="tl" x="64" y={PY(0.2) - 5}>material limit ~0.2 dB/m after O₂ anneal</text>
    <path class="ln2" d="M{PX(2022.6)} {PY(1.5)}V{PY(0.25)}" /><path d="M{PX(2022.6) - 4} {PY(0.27)}l4 7l4 -7" class="ln2" style="stroke-dasharray:none" />
    {#if big}<path class="acc" d={best.map((p, i) => `${i ? "H" + PX(p[0]).toFixed(1) + "V" : "M" + PX(p[0]).toFixed(1) + " "}${PY(p[1]).toFixed(1)}`).join("")} style="stroke-width:1.5" />{/if}
    {#each rows as r, i (r.key)}{@render marker(r, i, big)}{/each}
    <text class="tk" x="4" y="12">dB/m</text><text class="tk m" x="260" y="219">issue date</text>
  </svg>
{/snippet}

{#snippet card(big: boolean)}
  <div class="mk-card" class:big>
    <b>{cur.who} {cur.issued}</b> · {cur.route}<br>{cur.metric}{#if cur.viaQ} → {cur.dbm.toFixed(2)} dB/m at n<sub>g</sub> {NG} <Badge code="template" pop="src:ng" />{/if}<br>
    <span class="b p" data-pop={cur.pop}>{cur.status}</span> {#if cur.doi}<a class="u" href="https://doi.org/{cur.doi}">doi:{cur.doi}</a>{/if}
  </div>
{/snippet}

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Propagation loss by fabrication route</span><span>○ EBL+Ar □ DUV+Ar ◇ DUV+DLC △ PLACE × CMP from bulk</span></div>
  <div class="mk-duo2">
    <div>{@render chart(false)}</div>
    <div>
      <div class="ctl"><span class="k">Loss axis</span><div class="seg" role="group" aria-label="Axis"><button type="button" class:on={log} onclick={() => (log = true)}>LOG</button><button type="button" class:on={!log} onclick={() => (log = false)}>LIN</button></div><output>{log ? "log" : "linear"}</output></div>
      {@render card(false)}
      <table class="kv"><colgroup><col class="cn"><col><col class="cs"></colgroup><tbody>{#each rows as r, i (r.key)}<tr class:sel={i === sel} onmouseenter={() => (sel = i)}><td>{r.who} {r.issued.slice(0, 7)}, {r.route}</td><td class="v">{r.bound}{r.dbm < 10 ? r.dbm.toFixed(2) : r.dbm.toFixed(0)} dB/m</td><td class="s">{#if r.viaQ}<Badge code="template" pop="src:ng" />{:else}<span class="b p" data-pop={r.pop}>{r.status}</span>{/if}</td></tr>{/each}</tbody></table>
    </div>
  </div>
  <div class="pf">Q axis (log only): Q = 2π n<sub>g</sub> / (λ α), λ = 1550 nm, n<sub>g</sub> = {NG} (template). Arrow: anneal of ion-sliced LN from about 1.5 to 0.2 dB/m <Badge code="P" pop="src:shams" />. Arrow under a marker: upper bound.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <div>{@render chart(true)}</div>
    <div class="mk-vf-side">
      <div class="v-ctl"><span class="v-lab">Loss axis</span><div class="v-seg" role="group" aria-label="Axis"><button type="button" class:on={log} onclick={() => (log = true)}>Log</button><button type="button" class:on={!log} onclick={() => (log = false)}>Linear</button></div></div>
      {@render card(true)}
      <p class="v-cap">Green staircase: lowest reported loss up to each date among the rows shown (Q-only rows excluded). Q axis (log only): Q = 2π n<sub>g</sub> / (λ α), λ = 1550 nm, n<sub>g</sub> = {NG} <Badge code="template" pop="src:ng" />. Dashed arrow: anneal of ion-sliced LN from about 1.5 to 0.2 dB/m <Badge code="P" pop="src:shams" />. Arrow under a marker: upper bound. Hover or focus a marker for its paper.</p>
    </div>
  </div>
</figure>

<style>
  .mk-card { width: 360px; max-width: calc(100% - 16px); height: 74px; margin: 4px 8px 8px; padding: 6px 8px; border: 1px solid var(--rule2); font-size: 11.5px; line-height: 18px; color: var(--fg2); overflow: hidden; }
  .mk-card b { color: var(--fg); font-weight: 600; }
  .mk-card.big { width: auto; height: 104px; margin: 0; font: 400 15px/24px var(--v-ui, sans-serif); border-color: var(--v-line2, #444); padding: 8px 12px; }
  :global(.mk-loss .mk-pt) { fill: var(--fg2); stroke: var(--fg2); stroke-width: 1.4; cursor: pointer; outline: none; }
  :global(.mk-loss .mk-pt .xm) { fill: none; }
  :global(.mk-loss .mk-pt.on), :global(.mk-loss .mk-pt:focus-visible) { fill: var(--acc); stroke: var(--acc); }
</style>
