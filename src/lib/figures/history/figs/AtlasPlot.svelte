<!-- Before and after 2018: V_pi L versus 3 dB bandwidth of thin-film LN and LT modulators from the eo-modulator-atlas
     (subset vendored under static/data/devices/, pinned commit), telecom band, both values present. The year slider
     shows the devices published up to the chosen year. Values as reported in each paper (as entered in the atlas). -->
<script lang="ts">
  import { onMount } from "svelte";
  import { registerPops } from "$lib/content/pops";
  interface Pt { id: string; pl: string; vpil: number; bw: number; year: number; gt: boolean; who: string; title: string; venue: string; doi: string; url: string }
  let { atlas }: { atlas: { repo: string; sha: string; date: string; pts: Pt[] } } = $props();
  const Y0 = Math.min(...atlas.pts.map((p) => p.year)), Y1 = Math.max(...atlas.pts.map((p) => p.year));
  let yr = $state(Y1), logA = $state(true);
  const shown = $derived(atlas.pts.filter((p) => p.year <= yr));
  const nTxt = $derived(`${String(shown.length).padStart(3, " ")} of ${atlas.pts.length}`);
  // axes: x = bandwidth (GHz) 10-400, y = V_pi L (V cm) 0.2-20
  const X = $derived((g: number): number => 60 + (logA ? Math.log10(g / 10) / Math.log10(40) : (g - 10) / 390) * 480);
  const Y = $derived((v: number): number => 250 - (logA ? Math.log10(v / 0.2) / 2 : (v - 0.2) / 19.8) * 220);
  const xt = $derived(logA ? [10, 20, 50, 100, 200, 400] : [10, 100, 200, 300, 400]);
  const yt = $derived(logA ? [0.2, 0.5, 1, 2, 5, 10, 20] : [0.2, 5, 10, 15, 20]);
  const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  onMount(() => registerPops(Object.fromEntries(atlas.pts.map((p) => [`atl:${p.id}`, {
    h: `${esc(p.who)}: ${p.pl}`, body: `<span class="v">V<sub>&pi;</sub>L ${p.vpil} V cm, ${p.gt ? "&gt; " : ""}${p.bw} GHz</span><br>${esc(p.title)}${p.venue ? `. ${esc(p.venue)}` : ""}`,
    badges: [["r", "reported"]], src: `${p.doi ? `<a href="https://doi.org/${esc(p.doi)}">doi:${esc(p.doi)}</a>. ` : p.url ? `<a href="${esc(p.url)}">source</a>. ` : ""}Entered in the eo-modulator-atlas, commit ${atlas.sha} (${atlas.date})`,
  }]))));
</script>

{#snippet plot(cls: string)}
  <svg class="hx-at {cls}" viewBox="0 0 600 290" role="img" aria-label="Half-wave voltage-length product versus 3 dB bandwidth of thin-film modulators">
    {#each yt as v (v)}<line class="gl" x1="60" x2="540" y1={Y(v)} y2={Y(v)}/><text class="tk" x="54" y={Y(v) + 4} text-anchor="end">{v}</text>{/each}
    {#each xt as g (g)}<line class="gl" x1={X(g)} x2={X(g)} y1="30" y2="250"/><text class="tk" x={X(g)} y="266" text-anchor="middle">{g}</text>{/each}
    <text class="tk" x="8" y="20">V&#960;L (V cm)</text><text class="tk" x="540" y="284" text-anchor="end">3 dB bandwidth (GHz)</text>
    {#each shown as p (p.id)}
      <g class="pt {p.pl}" class:new={p.year === yr} data-pop="atl:{p.id}" tabindex="0" role="button" aria-label="{p.who}, {p.vpil} V cm, {p.bw} GHz">
        {#if p.pl === "TFLT"}<rect x={X(p.bw) - 4} y={Y(p.vpil) - 4} width="8" height="8" class:gt={p.gt}/>{:else}<circle cx={X(p.bw)} cy={Y(p.vpil)} r="4.5" class:gt={p.gt}/>{/if}
        {#if p.gt}<path d="M{X(p.bw) + 6} {Y(p.vpil)} h7 m-3 -3 l3 3 l-3 3"/>{/if}
      </g>
    {/each}
    <circle class="lg" cx="72" cy="40" r="4.5"/><text class="tk" x="82" y="44">thin-film LN</text>
    <rect class="lg" x="168" y="36" width="8" height="8"/><text class="tk" x="182" y="44">thin-film LT</text>
    <path class="lga" d="M270 40 h10 m-3 -3 l3 3 l-3 3"/><text class="tk" x="286" y="44">bandwidth lower bound</text>
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-atp">
  <div class="ph"><span>V<sub>&pi;</sub>L vs 3 dB bandwidth, thin-film LN and LT modulators</span><span class="seg" role="group" aria-label="Axes"><button type="button" class:on={logA} onclick={() => (logA = true)}>LOG</button><button type="button" class:on={!logA} onclick={() => (logA = false)}>LIN</button></span></div>
  {@render plot("t")}
  <div class="ctl"><label for="at-y">Published up to</label><input id="at-y" type="range" min={Y0} max={Y1} step="1" bind:value={yr}><output>{yr}</output></div>
  <table class="kv"><colgroup><col><col class="cv"></colgroup><tbody><tr><td>Devices shown</td><td class="v">{nTxt}</td></tr></tbody></table>
  <div class="pf">Values as reported in each paper, as entered in the eo-modulator-atlas (<a class="u" href={atlas.repo}>{atlas.repo.replace("https://", "")}</a>, commit {atlas.sha}, {atlas.date}) <span class="b r">reported</span>; telecom-band devices with both V<sub>&pi;</sub>L and bandwidth. V<sub>&pi;</sub>L conventions (push-pull or single arm, DC or RF) follow the atlas entry of each device. The atlas holds no bulk Ti:LN rows.</div>
</div>

<div data-variant="visual" class="hx-vat">
  <div class="v-seg" role="group" aria-label="Axes"><button type="button" class:on={logA} onclick={() => (logA = true)}>Log axes</button><button type="button" class:on={!logA} onclick={() => (logA = false)}>Linear</button></div>
  {@render plot("v")}
  <div class="hx-vat-g">
    <div class="v-ctl" style="--w:5ch"><label for="vat-y">Published up to</label><output>{yr}</output><input id="vat-y" class="v-range" type="range" min={Y0} max={Y1} step="1" bind:value={yr}></div>
    <dl class="v-hud"><dt>Devices shown</dt><dd>{nTxt}</dd></dl>
  </div>
  <p class="v-cap">Values as reported in each paper, as entered in the eo-modulator-atlas (<a class="v-link" href={atlas.repo}>{atlas.repo.replace("https://", "")}</a>, commit {atlas.sha}, {atlas.date}) <span class="b r">reported</span>; telecom-band devices with both values; V<sub>&pi;</sub>L conventions follow each atlas entry. The atlas holds no bulk Ti:LN rows. Points published in the selected year are outlined.</p>
</div>
