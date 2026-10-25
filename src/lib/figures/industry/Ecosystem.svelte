<!-- F8.02 Ecosystem map: stage x region, verified entries only (F, V, T; T/C printed). TECH: boxed matrix with mono company
     tags and a fixed company card. VISUAL: faceted company cards per stage, region named on each card. Hovering or focusing
     a stage lights its companies and marks every other stage the same companies appear in. -->
<script lang="ts">
  import G from "./G.svelte";
  import { COMPANIES, REGIONS, STAGES, type Co, type Stage } from "./facts";
  import { gradeCls } from "./refs";

  const RNAME: Record<string, string> = { US: "United States", CA: "Canada", "EU/CH": "Europe and Switzerland", UK: "United Kingdom", CN: "China", JP: "Japan", TW: "Taiwan" };
  let sel = $state("hyperlight");
  let hl = $state<Stage | null>(null);
  const stagesOf = (co: string): Set<Stage> => new Set(COMPANIES.filter((c) => c.co === co).map((c) => c.stage));
  const multi = new Set([...new Set(COMPANIES.map((c) => c.co))].filter((co) => stagesOf(co).size > 1 || new Set(COMPANIES.filter((c) => c.co === co).map((c) => c.region)).size > 1));
  const hlCos = $derived(hl ? new Set(COMPANIES.filter((c) => c.stage === hl).map((c) => c.co)) : new Set<string>());
  const cell = (s: Stage, r: string): Co[] => COMPANIES.filter((c) => c.stage === s && c.region === r).filter((c, i, a) => a.findIndex((x) => x.co === c.co) === i);
  const entries = $derived(COMPANIES.filter((c) => c.co === sel));
  const look = (c: Co): string => (hl === null ? "" : c.stage === hl ? "lit" : hlCos.has(c.co) ? "also" : "dim");
</script>

{#snippet card(v: boolean)}
  <div class="i8-ecard" class:v aria-live="polite">
    <div class="i8-ecard-h"><b>{entries[0]?.name}</b><span>{RNAME[entries[0]?.region]}</span></div>
    <ul class="i8-facts">{#each entries as e (e.stage + e.fact)}<li><span><span class="i8-st8">{e.stage}</span> {e.fact} <span class="i8-dt">{e.date}</span></span><span><G g={e.g} r={e.r} /></span></li>{/each}</ul>
  </div>
{/snippet}

<div class="i8-eco" data-variant="tech">
  <div class="scrollx">
    <table class="idx i8-mx">
      <thead><tr><th>Stage</th>{#each REGIONS as r (r)}<th>{r}</th>{/each}</tr></thead>
      <tbody>
        {#each STAGES as s (s)}
          <tr class:hl={hl === s}>
            <td class="i8-sth" tabindex="0" onmouseenter={() => (hl = s)} onmouseleave={() => (hl = null)} onfocus={() => (hl = s)} onblur={() => (hl = null)}>{s}</td>
            {#each REGIONS as r (r)}
              <td>{#each cell(s, r) as c (c.co)}<button type="button" class="i8-co {look(c)}" class:on={sel === c.co} onclick={() => (sel = c.co)} aria-pressed={sel === c.co}>{c.name.replace(/ \(.*\)$/, "")}<i class="{gradeCls(c.g)}">{c.g.replace(/\s/g, "")}</i>{#if multi.has(c.co)}<sup>+</sup>{/if}</button>{/each}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {@render card(false)}
  <p class="fine i8-eco-k">Hover or focus a stage name: its companies invert, the same companies in other stages or regions get a solid outline. <sup>+</sup> = company appears in more than one cell. Select a tag for its facts.</p>
</div>

<div class="i8-ecov" data-variant="visual">
  <div class="i8-bands">
  {#each STAGES as s (s)}
    <div class="i8-band" class:hl={hl === s}>
      <button type="button" class="i8-bandh" onmouseenter={() => (hl = s)} onmouseleave={() => (hl = null)} onfocus={() => (hl = s)} onblur={() => (hl = null)}>{s}</button>
      <div class="i8-bandc">
        {#each REGIONS as r (r)}{#each cell(s, r) as c (c.co)}
          <button type="button" class="i8-cc v-facet {look(c)}" class:on={sel === c.co} onclick={() => (sel = c.co)} aria-pressed={sel === c.co}>
            <span class="i8-cc-r">{RNAME[r]}</span><span class="i8-cc-n">{c.name.replace(/ \(.*\)$/, "")}</span><span class="i8-cc-g"><span class="b g8 {gradeCls(c.g)}">{c.g.replace(/\s/g, "")}</span>{#if multi.has(c.co)}<span class="i8-cc-m">in {stagesOf(c.co).size > 1 ? `${stagesOf(c.co).size} stages` : "2 regions"}</span>{/if}</span>
          </button>
        {/each}{/each}
      </div>
    </div>
  {/each}
  </div>
  <div class="i8-ecside">{@render card(true)}</div>
</div>

<style>
  .i8-eco { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 12px; align-items: start; }
  .i8-eco > .scrollx { grid-column: 1 / -1; }
  .i8-eco-k { margin: 0; }
  .i8-mx td { vertical-align: top; min-width: 96px; }
  .i8-mx td:first-child { min-width: 0; }
  .i8-sth { cursor: help; font-family: var(--mono); font-size: 11px; color: var(--fg2) !important; white-space: nowrap; }
  .i8-sth:focus-visible { outline: 1px solid var(--fg); outline-offset: -2px; }
  tr.hl .i8-sth { background: var(--acc-dim); color: var(--fg) !important; }
  .i8-co { display: flex; width: 100%; justify-content: space-between; gap: 4px; margin: 0 0 3px; padding: 1px 4px; background: none; border: 1px dotted var(--fg3); color: var(--fg); font: 400 10.5px/14px var(--mono); text-align: left; cursor: pointer; }
  .i8-co i { font-style: normal; color: var(--fg3); white-space: nowrap; }
  .i8-co sup { color: var(--fg3); line-height: 0; }
  .i8-co:hover { background: var(--acc-dim); }
  .i8-co.on { border-style: solid; box-shadow: inset 2px 0 0 var(--fg); }
  .i8-co.lit { background: var(--fg); color: var(--bg); } .i8-co.lit i, .i8-co.lit sup { color: var(--bg); }
  .i8-co.also { border: 1px solid var(--fg); }
  .i8-co.dim { opacity: 0.35; }
  .i8-co:focus-visible { outline: 1px solid var(--fg); outline-offset: 1px; }
  .i8-ecard { height: 200px; overflow-y: auto; border: 1px solid var(--rule2); background: var(--bg); box-shadow: 3px 3px 0 var(--shadow); padding: 6px 9px; }
  .i8-ecard-h { display: flex; justify-content: space-between; gap: 8px; padding-bottom: 4px; margin-bottom: 4px; border-bottom: 1px solid var(--rule2); font: 400 11px/16px var(--mono); color: var(--fg3); }
  .i8-ecard-h b { font-weight: 500; color: var(--fg); }
  .i8-st8 { font: 400 10px/14px var(--mono); color: var(--fg3); text-transform: uppercase; letter-spacing: 0.06em; }
  .i8-dt { color: var(--fg3); white-space: nowrap; }
  @media (max-width: 760px) { .i8-eco { grid-template-columns: minmax(0, 1fr); } }

  .i8-ecov { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; align-items: start; }
  .i8-ecside { position: sticky; top: 64px; }
  @media (max-width: 1100px) { .i8-ecov { grid-template-columns: minmax(0, 1fr); } .i8-ecside { position: static; } }
  .i8-band { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 16px; align-items: start; padding: 12px 0; border-top: 1px solid var(--v-line); }
  .i8-bandh { min-height: 44px; padding: 0; background: none; border: 0; text-align: left; font: 400 22px/28px var(--v-serif); color: var(--v-text); cursor: help; }
  .i8-band.hl .i8-bandh { color: var(--v-l532); }
  .i8-bandh:focus-visible { outline: 3px solid var(--v-l532); outline-offset: 3px; }
  .i8-bandc { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
  .i8-cc { position: relative; display: grid; gap: 4px; align-content: start; min-height: 108px; padding: 12px 14px; background: var(--v-ink1); border: 1px solid var(--v-line); color: var(--v-text); text-align: left; cursor: pointer; transition: opacity 240ms var(--v-ease), border-color 240ms var(--v-ease); }
  .i8-cc-r { font: 500 12px/16px var(--v-ui); color: var(--v-text3); }
  .i8-cc-n { font: 400 18px/23px var(--v-serif); }
  .i8-cc-g { display: flex; gap: 8px; align-items: center; margin-top: auto; }
  .i8-cc-m { font: 500 12px/16px var(--v-ui); color: var(--v-text3); }
  .i8-cc:hover, .i8-cc.on { border-color: var(--v-l532); }
  .i8-cc.on { box-shadow: inset 0 0 0 1px var(--v-l532); }
  .i8-cc.lit { background: color-mix(in srgb, var(--v-l532) 14%, var(--v-ink1)); border-color: var(--v-l532); }
  .i8-cc.also { border: 1px dashed var(--v-l532); }
  .i8-cc.dim { opacity: 0.3; }
  .i8-cc:focus-visible { outline: 3px solid var(--v-l532); outline-offset: 3px; }
  .i8-ecard.v { height: 420px; padding: 18px 22px; background: var(--v-ink1); border: 1px solid var(--v-line); box-shadow: none; }
  .i8-ecard.v .i8-ecard-h { font: 400 15px/22px var(--v-ui); color: var(--v-text3); border-color: var(--v-line); align-items: baseline; }
  .i8-ecard.v .i8-ecard-h b { font: 400 28px/32px var(--v-serif); color: var(--v-text); }
  .i8-ecard.v .i8-st8 { font: 500 12px/18px var(--v-ui); letter-spacing: 0; color: var(--v-text3); }
  @media (max-width: 760px) { .i8-band { grid-template-columns: minmax(0, 1fr); gap: 8px; } .i8-bandc { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); } .i8-ecard.v { height: 320px; } }
</style>
