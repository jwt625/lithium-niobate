<!-- Dies per wafer for a thin-film LN modulator die at 100, 150, and 200 mm. Gross-die formula DPW = pi d^2 / (4 S) -
     pi d / sqrt(2 S), d = D - 2 x edge exclusion, S = die area (the common formula compared with exact counts by
     de Vries 2005), beside the exact count of whole dies placed on the drawn wafer (best of four grid offsets). Die size and
     edge exclusion are display parameters (template); the default 10 x 1 mm die holds a 9 mm electrode such as the
     li2026aa MZM of chapter 2.2. TECH: mono form and table; VISUAL: large wafers with the dies placed. Shared state. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { diesInCircle } from "./plot";
  import { pad } from "$lib/figures/fmt";

  const D = [100, 150, 200];
  let L = $state(10), W = $state(1), E = $state(3);
  const S = $derived(L * W);
  const formula = (Dm: number): number => { const d = Dm - 2 * E; return Math.max(0, (Math.PI * d * d) / (4 * S) - (Math.PI * d) / Math.sqrt(2 * S)); };
  const placed = $derived(D.map((Dm) => diesInCircle(Dm / 2 - E, L, W)));
  const fmtN = (n: number): string => pad(Math.round(n).toLocaleString("en-US"), 6);
  const canv: Record<string, HTMLCanvasElement | undefined> = $state({});

  function draw(): void {
    const css = getComputedStyle(document.documentElement);
    const visual = document.documentElement.dataset.mode === "visual";
    const dieFill = (visual ? css.getPropertyValue("--v-ln") : css.getPropertyValue("--fg3")).trim() || "#999";
    const edge = (visual ? css.getPropertyValue("--v-text2") : css.getPropertyValue("--fg2")).trim() || "#888";
    for (const [key, c] of Object.entries(canv)) {
      if (!c || !c.clientWidth) continue;
      const i = Number(key.slice(1)), Dm = D[i];
      const dpr = Math.min(2, devicePixelRatio || 1), px = c.clientWidth;
      if (c.width !== Math.round(px * dpr)) { c.width = Math.round(px * dpr); c.height = Math.round(px * dpr); }
      const g = c.getContext("2d"); if (!g) continue;
      // canvas width = Dm / 204 of the column, so this px-per-mm is the same on every wafer (drawn to one scale)
      const kk = (px * dpr) / (Dm * 1.02);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
      const cx = c.width / 2, cy = c.height / 2;
      g.save(); g.translate(cx, cy);
      const R = (Dm / 2) * kk;
      g.beginPath(); g.arc(0, 0, R, 0, 2 * Math.PI); g.strokeStyle = edge; g.lineWidth = 1 * dpr; g.stroke();
      g.beginPath(); g.arc(0, 0, (Dm / 2 - E) * kk, 0, 2 * Math.PI); g.setLineDash([3 * dpr, 3 * dpr]); g.globalAlpha = 0.6; g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      g.fillStyle = dieFill; g.globalAlpha = visual ? 0.75 : 0.55;
      const gap = Math.min(0.15, W * 0.1, L * 0.1);
      for (const [x, y] of placed[i].ll) g.fillRect((x + gap / 2) * kk, (y + gap / 2) * kk, (L - gap) * kk, (W - gap) * kk);
      g.restore();
    }
  }
  onMount(() => {
    const ro = new ResizeObserver(() => draw());
    Object.values(canv).forEach((c) => c && ro.observe(c));
    const onUi = (): void => { requestAnimationFrame(draw); };
    addEventListener("ln-mode", onUi);
    return () => { ro.disconnect(); removeEventListener("ln-mode", onUi); };
  });
  $effect(() => { void placed; void E; const id = requestAnimationFrame(draw); return () => cancelAnimationFrame(id); });
</script>

{#snippet ctl(v: boolean)}
  {#if v}
    <div class="v-ctl" style="--w:8ch"><label for="dw-lv">Die length</label><output>{L.toFixed(1)} mm</output><input id="dw-lv" type="range" min="2" max="20" step="0.5" bind:value={L}></div>
    <div class="v-ctl" style="--w:8ch"><label for="dw-wv">Die width</label><output>{W.toFixed(1)} mm</output><input id="dw-wv" type="range" min="0.5" max="5" step="0.1" bind:value={W}></div>
    <div class="v-ctl" style="--w:8ch"><label for="dw-ev">Edge exclusion</label><output>{E.toFixed(1)} mm</output><input id="dw-ev" type="range" min="0" max="10" step="0.5" bind:value={E}></div>
  {:else}
    <div class="ctl"><label for="dw-l">Die length</label><input id="dw-l" type="range" min="2" max="20" step="0.5" bind:value={L}><output>{pad(L.toFixed(1), 4)} mm</output></div>
    <div class="ctl"><label for="dw-w">Die width</label><input id="dw-w" type="range" min="0.5" max="5" step="0.1" bind:value={W}><output>{pad(W.toFixed(1), 4)} mm</output></div>
    <div class="ctl"><label for="dw-e">Edge exclusion</label><input id="dw-e" type="range" min="0" max="10" step="0.5" bind:value={E}><output>{pad(E.toFixed(1), 4)} mm</output></div>
  {/if}
{/snippet}

<div class="panel i8-dw" data-variant="tech">
  <div class="ph"><span>Dies per wafer: DPW = &pi;d<sup>2</sup>/(4S) &minus; &pi;d/&radic;(2S), d = D &minus; 2E</span><span><Badge code="derived" pop="i8-dpw" /></span></div>
  {@render ctl(false)}
  <div class="i8-dw-row">
    {#each D as Dm, i (Dm)}
      <figure class="i8-dw-w"><canvas bind:this={canv[`c${i}`]} style="width:{(Dm / 204) * 100}%" aria-label="{Dm} mm wafer with {placed[i].n} whole dies placed"></canvas><figcaption>{Dm} mm</figcaption></figure>
    {/each}
  </div>
  <table class="kv i8-dwt"><colgroup><col><col class="cv"><col class="cv"><col class="cv"></colgroup><tbody>
    <tr><td>wafer diameter D</td>{#each D as Dm (Dm)}<td class="v">{Dm} mm</td>{/each}</tr>
    <tr><td>formula DPW</td>{#each D as Dm (Dm)}<td class="v">{fmtN(formula(Dm))}</td>{/each}</tr>
    <tr><td>whole dies placed (drawn)</td>{#each placed as p, i (i)}<td class="v">{fmtN(p.n)}</td>{/each}</tr>
    <tr><td>ratio to 100 mm (placed)</td>{#each placed as p, i (i)}<td class="v">{placed[0].n ? (p.n / placed[0].n).toFixed(2) : "-"}</td>{/each}</tr>
  </tbody></table>
  <div class="pf">S = die area <span class="i8-num i8-sv">{pad(S.toFixed(2), 6)}</span> mm<sup>2</sup>. Die size and edge exclusion: display parameters <Badge code="template" pop="i8-dpw" />; default 10 &times; 1 mm holds a 9 mm traveling-wave electrode (the li2026aa MZM of section 2.2 is 9 mm long). Gross count: no scribe lanes, flats, or yield. Wafers drawn to one scale.</div>
</div>

<div class="i8-dwv" data-variant="visual">
  <div class="i8-dwv-ctl">{@render ctl(true)}</div>
  <div class="i8-dwv-row">
    {#each D as Dm, i (Dm)}
      <figure class="i8-dwv-w">
        <canvas bind:this={canv[`v${i}`]} style="width:{(Dm / 204) * 100}%" aria-label="{Dm} mm wafer with {placed[i].n} whole dies placed"></canvas>
        <figcaption><b class="i8-num">{fmtN(placed[i].n)}</b> dies placed<br><span>{Dm} mm; formula <span class="i8-num">{fmtN(formula(Dm))}</span></span></figcaption>
      </figure>
    {/each}
  </div>
  <p class="v-cap">DPW = &pi;d<sup>2</sup>/(4S) &minus; &pi;d/&radic;(2S) with d = D &minus; 2 &times; edge exclusion and S = <span class="i8-num i8-sv">{pad(S.toFixed(2), 6)}</span> mm<sup>2</sup> <Badge code="derived" pop="i8-dpw" />; the drawn dies are the exact count of whole dies inside the dashed edge-exclusion circle. Die size and edge exclusion are display parameters <Badge code="template" pop="i8-dpw" />; the default 10 &times; 1 mm die holds a 9 mm electrode like the 2.2 MZM. No scribe lanes, flats, or yield. Wafers to one scale.</p>
</div>

<style>
  .i8-sv { display: inline-block; width: 6ch; text-align: right; }
  .i8-dw-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; align-items: end; padding: 8px; }
  .i8-dw-w { margin: 0; display: grid; justify-items: center; gap: 2px; }
  .i8-dw-w canvas, .i8-dwv-w canvas { display: block; aspect-ratio: 1; }
  .i8-dw-w figcaption { font: 400 10.5px/14px var(--mono); color: var(--fg3); }
  .i8-dwt col.cv { width: 22%; }
  .i8-dwt td.v { text-align: right; }
  .i8-dwv-ctl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 32px; margin-bottom: 24px; }
  .i8-dwv-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: end; }
  .i8-dwv-w { margin: 0; display: grid; justify-items: center; gap: 10px; }
  .i8-dwv-w figcaption { text-align: center; font: 400 14px/21px var(--v-ui); color: var(--v-text3); }
  .i8-dwv-w figcaption b { display: inline-block; width: 3.6em; text-align: right; font: 300 34px/38px var(--v-serif); color: var(--v-text); font-variant-numeric: tabular-nums lining-nums; }
  .i8-dwv-w figcaption span .i8-num { display: inline-block; width: 6ch; text-align: right; }
  @media (max-width: 760px) { .i8-dwv-ctl { grid-template-columns: minmax(0, 1fr); } .i8-dwv-row { gap: 10px; } .i8-dwv-w figcaption b { font-size: 22px; line-height: 26px; } .i8-dwv-w figcaption { font-size: 12px; line-height: 17px; } }
</style>
