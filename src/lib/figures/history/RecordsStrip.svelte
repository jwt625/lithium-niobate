<!-- LN modulator records on the chronology time axis (same proportional axis as the VISUAL timeline: 1801-1948 in the
     first 15%, 1949-2026 linear). Top: 3 dB EO bandwidth (GHz); bottom: V_pi L (V cm); both log. Points: bulk LN values
     from this chapter's sources, modulator rows of the records table, thin-film LN rows of the eo-modulator-atlas. Step
     lines: best value so far (highest bandwidth, lowest V_pi L) over all points shown. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { registerPops } from "$lib/content/pops";
  import { axisX, Y0, YB, Y1 } from "./events";
  import type { RecPt } from "./load";

  let { pts, atlas }: { pts: RecPt[]; atlas: { repo: string; sha: string; date: string } } = $props();
  let width = $state(1140);
  let box: HTMLDivElement;
  const H = 300, P1 = [16, 128] as const, P2 = [156, 268] as const;
  const xOf = (t: number): number => 8 + axisX(t) * (width - 16);
  const yBw = (g: number): number => P1[1] - (Math.log10(g) / Math.log10(400)) * (P1[1] - P1[0]); // 1-400 GHz
  const yVl = (v: number): number => P2[1] - ((Math.log10(v) + 1) / 2) * (P2[1] - P2[0]); // 0.1-10 V cm
  const sorted = $derived([...pts].map((p, i) => ({ ...p, i })).sort((a, b) => a.t - b.t));
  function envelope(k: "bw" | "vpil"): string {
    let best = NaN, d = "";
    for (const p of sorted.filter((q) => q.k === k)) {
      const better = Number.isNaN(best) || (k === "bw" ? p.v > best : p.v < best);
      if (!better) continue;
      const x = xOf(p.t).toFixed(1), y = (k === "bw" ? yBw(p.v) : yVl(p.v)).toFixed(1);
      d += d ? ` H${x} V${y}` : `M${x} ${y}`;
      best = p.v;
    }
    return d ? `${d} H${xOf(Y1 + 1).toFixed(1)}` : "";
  }
  const decades = [1801, 1850, 1900, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  onMount(() => {
    const ro = new ResizeObserver(() => { const w = Math.round(box.clientWidth); if (w > 0) width = w; });
    ro.observe(box);
    const off = registerPops(Object.fromEntries(pts.map((p, i) => [`rp:${i}`, {
      h: `${esc(p.who)}: ${p.k === "bw" ? `${p.gt ? "&gt; " : ""}${p.v} GHz` : `${p.v} V cm`}`,
      body: esc(p.note) + (p.src === "atlas" ? `<br>Entered in the eo-modulator-atlas, commit ${atlas.sha} (${atlas.date})` : p.src === "rec" ? "<br>Records table (chapter 06)" : ""),
      badges: [[p.st === "rec" ? "rec" : "r", p.st === "rec" ? "rec" : "reported"]],
      src: p.doi ? `<a href="https://doi.org/${esc(p.doi)}">doi:${esc(p.doi)}</a>` : p.url ? `<a href="${esc(p.url)}">source</a>` : undefined,
    }])));
    return () => { ro.disconnect(); off(); };
  });
</script>

<div class="hx-rs">
  <div class="hx-rs-plot" bind:this={box}>
    <svg viewBox="0 0 {width} {H}" role="group" aria-label="Lithium niobate modulator bandwidth and V-pi-L records on the chronology time axis">
      {#each [1, 10, 100] as g (g)}<line class="gl" x1={xOf(Y0)} x2={xOf(Y1 + 1)} y1={yBw(g)} y2={yBw(g)}/><text class="tk" x={xOf(Y0)} y={yBw(g) - 3}>{g} GHz</text>{/each}
      {#each [0.1, 1, 10] as v (v)}<line class="gl" x1={xOf(Y0)} x2={xOf(Y1 + 1)} y1={yVl(v)} y2={yVl(v)}/><text class="tk" x={xOf(Y0)} y={yVl(v) - 3}>{v} V cm</text>{/each}
      <rect class="brk" x={xOf(YB) - 7} y="8" width="6" height={P2[1] - 4}/>
      {#each decades as y (y)}{#if width > 640 || y === 1801 || (y >= 1960 && y % 20 === 0)}<text class="tk" x={xOf(y)} y={H - 10} text-anchor={y === 1801 ? "start" : "middle"}>{y}</text>{/if}{/each}
      <text class="hd" x={xOf(1955)} y={P1[0] + 10}>3 dB EO bandwidth</text><text class="hd" x={xOf(1955)} y={P2[0] + 10}>V<tspan baseline-shift="sub" font-size="75%">&#960;</tspan>L</text>
      <path class="env" d={envelope("bw")}/><path class="env" d={envelope("vpil")}/>
      {#each sorted as p (p.i)}
        {@const x = xOf(p.t)}{@const y = p.k === "bw" ? yBw(p.v) : yVl(p.v)}
        <g class="pt {p.src}" data-pop="rp:{p.i}" tabindex={p.src === "atlas" ? -1 : 0} role="button" aria-label="{p.who}, {p.v} {p.k === 'bw' ? 'GHz' : 'V cm'}">
          {#if p.src === "hist"}<rect x={x - 4.5} y={y - 4.5} width="9" height="9"/>{:else if p.src === "rec"}<path d="M{x} {y - 6} l6 6 l-6 6 l-6 -6 z"/>{:else}<circle cx={x} cy={y} r="2.6"/>{/if}
        </g>
      {/each}
    </svg>
  </div>
  <div class="hx-rs-key">
    <span><svg viewBox="0 0 12 12" aria-hidden="true"><rect class="kh" x="1.5" y="1.5" width="9" height="9"/></svg>bulk LN, chapter sources <span class="b rec" data-pop="hst:V">rec</span></span>
    <span><svg viewBox="0 0 12 12" aria-hidden="true"><path class="kr" d="M6 0.5 l5.5 5.5 l-5.5 5.5 l-5.5 -5.5 z"/></svg>thin-film LN, records table <span class="b r">reported</span></span>
    <span><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="ka" cx="6" cy="6" r="2.6"/></svg>thin-film LN devices, eo-modulator-atlas commit {atlas.sha} <span class="b r">reported</span></span>
    <span><svg viewBox="0 0 16 12" aria-hidden="true"><path class="ke" d="M1 9 H7 V3 H15"/></svg>best value so far</span>
  </div>
  <p class="fine hx-rs-note">No dated bulk Ti:LN V<sub>&pi;</sub>L value is held, so that panel starts with the thin-film rows. Atlas bandwidths stated as lower bounds are plotted at the stated value; V<sub>&pi;</sub>L conventions follow each source.</p>
</div>
