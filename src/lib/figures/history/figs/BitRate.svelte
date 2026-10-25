<!-- F7.7 Bit rate by decade (figures.md F7.7): line rates named in dated sources only; points, no interpolation or trend.
     Product statements (vendor or press) and research results use different marks. Log or linear y. -->
<script lang="ts">
  import { lab } from "../labels";
  import { BITRATE } from "../data";
  import { HSTATUS } from "../status";
  let logY = $state(true);
  const X = (y: number): number => 60 + ((y - 1985) / 40) * 480;
  const Y = $derived((g: number): number => (logY ? 230 - (Math.log10(g) / 4) * 210 : 230 - (g / 2000) * 210));
  const ticks = $derived(logY ? [1, 10, 100, 1000, 10000] : [0, 500, 1000, 1500, 2000]);
  const fmt = (g: number): string => (g >= 1000 ? `${(g / 1000).toFixed(2)} Tb/s` : `${g} Gb/s`);
</script>

{#snippet chart(cls: string)}
  <svg class="hx-br {cls}" viewBox="0 0 600 270" role="img" aria-label="Line rates of LN modulators named in dated sources, 1985 to 2025">
    {#each ticks as t (t)}<line class="gl" x1="60" x2="540" y1={Y(t)} y2={Y(t)}/><text class="tk" x="54" y={Y(t) + 4} text-anchor="end">{t >= 1000 ? `${t / 1000}k` : t}</text>{/each}
    {#each [1985, 1995, 2005, 2015, 2025] as y (y)}<line class="gl" x1={X(y)} x2={X(y)} y1="20" y2="230"/><text class="tk" x={X(y)} y="248" text-anchor="middle">{y}</text>{/each}
    <text class="tk" x="8" y="14">Gb/s</text>
    {#each BITRATE as b (b.src)}
      <g class="pt {b.kind}" data-pop="src:{b.src}" tabindex="0" role="button" aria-label="{b.year}: {b.label}">
        {#if b.kind === "research"}<path d="M{X(b.year)} {Y(b.gbps) - 7} l7 7 l-7 7 l-7 -7 z"/>{:else}<rect x={X(b.year) - 5} y={Y(b.gbps) - 5} width="10" height="10"/>{/if}
        <text class="lb" x={X(b.year) + (b.year > 2015 ? -12 : 10)} y={Y(b.gbps) + 4} text-anchor={b.year > 2015 ? "end" : "start"}>{fmt(b.gbps)}</text>
      </g>
    {/each}
    <rect class="lg product" x="70" y="28" width="9" height="9"/><text class="tk" x="84" y="36">product statement (vendor or press)</text>
    <path class="lg research" d="M74 46 l5 5 l-5 5 l-5 -5 z"/><text class="tk" x="84" y="55">research result</text>
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-brp">
  <div class="ph"><span>Line rate per wavelength named in dated sources</span><span class="seg" role="group" aria-label="Y axis"><button type="button" class:on={logY} onclick={() => (logY = true)}>LOG</button><button type="button" class:on={!logY} onclick={() => (logY = false)}>LIN</button></span></div>
  {@render chart("t")}
  <table class="kv hx-br-kv"><colgroup><col class="cy"><col class="cv"><col><col class="cs"></colgroup><tbody>
    {#each BITRATE as b (b.src)}<tr><td class="v">{b.year}</td><td class="v">{fmt(b.gbps)}</td><td>{b.label}{b.note ? ` (${b.note})` : ""} <span class="hx-ref" data-pop="src:{b.src}">{lab(b.src)}</span></td><td class="s"><span class="b {HSTATUS[b.st].cls}" data-pop="hst:{b.st}">{HSTATUS[b.st].text}</span></td></tr>{/each}
  </tbody></table>
</div>

<div data-variant="visual" class="hx-vbr">
  <div class="v-seg" role="group" aria-label="Y axis"><button type="button" class:on={logY} onclick={() => (logY = true)}>Log scale</button><button type="button" class:on={!logY} onclick={() => (logY = false)}>Linear</button></div>
  {@render chart("v")}
  <ol class="hx-vbr-l">
    {#each BITRATE as b (b.src)}<li><b>{b.year}</b><span class="hx-vbr-g">{fmt(b.gbps)}</span><span>{b.label}{b.note ? ` (${b.note})` : ""}</span><span class="b {HSTATUS[b.st].cls}" data-pop="hst:{b.st}">{HSTATUS[b.st].name}</span> <span class="hx-ref" data-pop="src:{b.src}">{lab(b.src)}</span></li>{/each}
  </ol>
</div>
