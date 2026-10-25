<!-- F8.10 Neighbors and rivals: the same four atlas numbers per platform in the same positions, n beside each median.
     TECH: boxed table. VISUAL: one card per platform with its median electrode drawn to scale on a shared 10 mm ruler. -->
<script lang="ts">
  import G from "./G.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import type { PlatStats } from "./atlas";
  import { pad } from "$lib/figures/fmt";

  let { stats }: { stats: PlatStats[] } = $props();
  const NOTE: Record<string, { t: string; g: string; r: string } | null> = {
    TFLN: null, TFLT: { t: "LT is already used in 5G RF filters (EPFL and SIMIT, Nature 2024)", g: "reported", r: "r:wang2024nat" },
    SiPh: null, InP: null, BTO: { t: "PsiQuantum's Omega chipset uses BTO switches on SiN", g: "C", r: "r:r09-s54" }, Polymer: null,
  };
  const NAME: Record<string, string> = { TFLN: "Thin-film LN", TFLT: "Thin-film LT", SiPh: "Silicon (carrier depletion)", InP: "InP", BTO: "Barium titanate", Polymer: "EO polymer (incl. SOH/POH)" };
  const vp = (s: PlatStats): string => (s.vpil.med === null ? "no push-pull rows" : `${pad(s.vpil.med.toFixed(2), 5)} V cm`);
  const bw = (s: PlatStats): string => (s.bw.med === null ? "N/A" : `${s.bw.lb > 0 ? ">=" : "  "}${pad(s.bw.med.toFixed(1), 5)} GHz`);
  const ln = (s: PlatStats): string => (s.len.med === null ? "N/A" : `${pad(s.len.med.toFixed(2), 5)} mm`);
</script>

<div class="scrollx" data-variant="tech">
  <table class="idx i8-rv">
    <thead><tr><th>Platform</th><th>Definition</th><th>Papers / rows</th><th class="r">V&pi;L median</th><th class="r">n</th><th class="r">Bandwidth median</th><th class="r">n</th><th class="r">Bounds</th><th class="r">Electrode median</th><th class="r">n</th><th>Note</th></tr></thead>
    <tbody>
      {#each stats as s (s.plat)}
        <tr><td class="h">{s.plat}</td><td>{NAME[s.plat]}</td><td class="num">{s.papers} / {s.rows}</td><td class="r i8-num">{vp(s)}</td><td class="r num">{s.vpil.n}</td><td class="r i8-num">{bw(s)}</td><td class="r num">{s.bw.n}</td><td class="r num">{(s.bw.lb * 100).toFixed(0)}%</td><td class="r i8-num">{ln(s)}</td><td class="r num">{s.len.n}</td>
          <td>{#if NOTE[s.plat]}{NOTE[s.plat]?.t} <G g={NOTE[s.plat]?.g ?? ""} r={NOTE[s.plat]?.r} />{:else}<span class="dim">atlas only</span>{/if}</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="i8-rvv" data-variant="visual">
  {#each stats as s (s.plat)}
    <article class="i8-rc v-facet">
      <header><b>{s.plat}</b><span>{NAME[s.plat]}<br>{s.papers} papers, {s.rows} rows</span></header>
      <dl>
        <dt>V&pi;L median</dt><dd>{s.vpil.med === null ? "no push-pull rows" : `${s.vpil.med.toFixed(2)} V cm`}<small>n = {s.vpil.n}</small></dd>
        <dt>Bandwidth median</dt><dd>{s.bw.med === null ? "N/A" : `${s.bw.lb > 0 ? "≥ " : ""}${s.bw.med} GHz`}<small>n = {s.bw.n}, {(s.bw.lb * 100).toFixed(0)}% bounds</small></dd>
        <dt>Electrode median</dt><dd>{s.len.med === null ? "N/A" : `${+s.len.med.toFixed(2)} mm`}<small>n = {s.len.n}</small></dd>
      </dl>
      <svg class="i8-rul" viewBox="0 0 300 26" role="img" aria-label="Median electrode {s.len.med} mm on a 10 mm ruler">
        <line x1="0" x2="300" y1="6" y2="6" class="rl" />
        {#each Array.from({ length: 11 }, (_, i) => i) as i (i)}<line x1={i * 30} x2={i * 30} y1="6" y2={i % 5 ? 10 : 13} class="rl" />{/each}
        <rect x="0" y="15" width={(s.len.med ?? 0) * 30} height="6" class="el" class:ln={s.plat === "TFLN" || s.plat === "TFLT"} />
      </svg>
      <p class="i8-rn">{#if NOTE[s.plat]}{NOTE[s.plat]?.t} <G g={NOTE[s.plat]?.g ?? ""} r={NOTE[s.plat]?.r} />{:else}Atlas statistics only.{/if}</p>
    </article>
  {/each}
</div>
<p class="fine">Telecom bands, MZM and IQ device rows; V&pi;L push-pull only; "&ge;" where bandwidth lower bounds could raise the median <Badge code="derived" pop="i8-atlas" />. Ruler: 10 mm, ticks every 1 mm.</p>

<style>
  .i8-rv td { white-space: nowrap; }
  .i8-rvv { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .i8-rc { position: relative; display: grid; gap: 12px; align-content: start; padding: 20px; background: var(--v-ink1); border: 1px solid var(--v-line); }
  .i8-rc header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .i8-rc header b { font: 400 30px/34px var(--v-serif); font-weight: 400; }
  .i8-rc header span { font: 500 13px/18px var(--v-ui); color: var(--v-text3); text-align: right; }
  .i8-rc dl { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 14px; margin: 0; font: 400 15px/22px var(--v-ui); }
  .i8-rc dt { color: var(--v-text3); }
  .i8-rc dd { margin: 0; text-align: right; color: var(--v-text); font-variant-numeric: tabular-nums; }
  .i8-rc dd small { display: block; font-size: 12px; line-height: 16px; color: var(--v-text3); }
  .i8-rul { width: 100%; height: auto; display: block; }
  .i8-rul .rl { stroke: var(--v-text3); }
  .i8-rul .el { fill: var(--v-text2); } .i8-rul .el.ln { fill: var(--v-l532); }
  .i8-rn { font: 400 14px/21px var(--v-ui); color: var(--v-text3); }
  @media (max-width: 1100px) { .i8-rvv { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .i8-rvv { grid-template-columns: minmax(0, 1fr); } }
</style>
