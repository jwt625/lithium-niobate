<!-- F8.08 LN in your life: ten cards, caveat always visible. TECH: 2 x 5 boxed grid with mono grade tags. VISUAL: one
     pictogram per card; card 1 counts 50 filter glyphs (the sourced "> 50" for a 2018 4G mid/high-tier phone); card 10 flips
     to the mass of each element in a 6-inch wafer (the to-scale Nb cube waits for a sourced Nb metal density). -->
<script lang="ts">
  import G from "./G.svelte";
  import Icon8 from "./Icon8.svelte";
  import { LIFE } from "./facts";
  import { waferMass, ATOMIC_WEIGHT as AW, MOLAR_MASS } from "$lib/physics/fab.ts";
  import { DENSITY_KUSHIBIKI1999 } from "$lib/physics/constants.ts";

  let flip = $state(false);
  const m = waferMass(150, 0.5, DENSITY_KUSHIBIKI1999.value).LN_g;
  const parts: [string, number][] = [["Nb", (m * AW.Nb) / MOLAR_MASS.LiNbO3], ["O", (m * 3 * AW.O) / MOLAR_MASS.LiNbO3], ["Li", (m * AW.Li) / MOLAR_MASS.LiNbO3]];
</script>

<div class="i8-life" data-variant="tech">
  {#each LIFE as c (c.n)}
    <article class="i8-lc">
      <header><span class="i8-num">{String(c.n).padStart(2, "0")}</span><b>{c.obj}</b><G g={c.g} r={c.r} /></header>
      <p>{c.hook}</p>
      <p class="cv"><span class="lbl">Caveat</span> {c.caveat}</p>
      {#if c.n === 10}<p class="cv">One 6-inch, 0.5 mm wafer, {m.toFixed(1)} g (density 4,642.8 kg/m<sup>3</sup>, standard atomic weights): {parts.map(([e, g]) => `${e} ${g.toFixed(1)} g`).join(", ")} <G g="E" r="i8-nbwafer" /></p>{/if}
    </article>
  {/each}
</div>

<div class="i8-lifev" data-variant="visual">
  {#each LIFE as c (c.n)}
    <article class="i8-lv v-facet" class:flip={c.n === 10 && flip}>
      <div class="face front">
        <div class="ico"><Icon8 name={c.icon} size={64} /><span class="no">{c.n}</span></div>
        <h4>{c.obj}</h4>
        {#if c.count}
          <div class="iso" role="img" aria-label="{c.count.label}">{#each Array.from({ length: c.count.n }, (_, i) => i) as i (i)}<i></i>{/each}</div>
          <p class="isol">{c.count.label}</p>
        {/if}
        <p class="hook">{c.hook}</p>
        <p class="cv">{c.caveat}</p>
        <div class="ft"><G g={c.g} r={c.r} />{#if c.n === 10}<button type="button" class="i8-flipb" onclick={() => (flip = !flip)} aria-pressed={flip}>Weigh the wafer</button>{/if}</div>
      </div>
      {#if c.n === 10}
        <div class="face back" aria-hidden={!flip}>
          <h4>One 6-inch, 0.5 mm wafer: {m.toFixed(1)} g</h4>
          <svg viewBox="0 0 300 120" role="img" aria-label="Mass of niobium, oxygen, lithium in a 6-inch LN wafer, bar lengths proportional to mass">
            {#each parts as [e, g], i (e)}
              <rect x="40" y={10 + i * 36} width={(g / m) * 250} height="24" class="el {e}" />
              <text x="32" y={27 + i * 36} text-anchor="end">{e}</text>
              <text x={46 + (g / m) * 250} y={27 + i * 36} class="v">{g.toFixed(1)} g</text>
            {/each}
          </svg>
          <p class="cv">Bar lengths proportional to mass; standard atomic weights, density 4,642.8 kg/m<sup>3</sup>. <G g="E" r="i8-nbwafer" /></p>
          <div class="ft"><button type="button" class="i8-flipb" onclick={() => (flip = !flip)} aria-pressed={flip}>Back</button></div>
        </div>
      {/if}
    </article>
  {/each}
</div>

<style>
  .i8-life { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .i8-lc { border: 1px solid var(--rule2); background: var(--bg); box-shadow: 2px 2px 0 var(--shadow); padding: 6px 9px; }
  .i8-lc header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 8px; align-items: baseline; padding-bottom: 4px; margin-bottom: 4px; border-bottom: 1px solid var(--rule); }
  .i8-lc header .i8-num { color: var(--fg3); font-size: 11px; }
  .i8-lc header b { font-weight: 600; }
  .i8-lc p { margin: 0 0 4px; font-size: 12.5px; line-height: 18px; }
  .i8-lc .cv { font-size: 11.5px; color: var(--fg2); }
  @media (max-width: 760px) { .i8-life { grid-template-columns: minmax(0, 1fr); } }

  .i8-lifev { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .i8-lv { position: relative; display: grid; background: var(--v-ink1); border: 1px solid var(--v-line); }
  .face { grid-area: 1 / 1; display: flex; flex-direction: column; gap: 10px; padding: 20px; transition: opacity 240ms var(--v-ease); }
  .back { opacity: 0; visibility: hidden; }
  .i8-lv.flip .front { opacity: 0; visibility: hidden; } .i8-lv.flip .back { opacity: 1; visibility: visible; }
  .ico { display: flex; justify-content: space-between; align-items: flex-start; color: var(--v-text2); }
  .ico .no { font: 300 40px/40px var(--v-serif); color: var(--v-text3); font-variant-numeric: lining-nums; }
  h4 { margin: 0; font: 400 24px/30px var(--v-serif); color: var(--v-text); }
  .hook { font: 400 16px/25px var(--v-serif); color: var(--v-text); }
  .cv { font: 400 14px/21px var(--v-ui); color: var(--v-text3); border-left: 2px solid var(--v-line2); padding-left: 10px; }
  .ft { margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .iso { display: grid; grid-template-columns: repeat(10, 12px); gap: 5px 6px; }
  .iso i { display: block; width: 12px; height: 8px; border: 1.5px solid var(--v-au); }
  .isol { font: 500 13px/18px var(--v-ui); color: var(--v-au); }
  .i8-flipb { min-height: 44px; padding: 0 14px; background: none; border: 2px solid var(--v-line2); color: var(--v-text2); font: 500 14px/1 var(--v-ui); cursor: pointer; }
  .i8-flipb:hover { background: var(--v-l532-dim); color: var(--v-text); }
  .i8-flipb:focus-visible { outline: 3px solid var(--v-l532); outline-offset: 3px; }
  .back svg { width: 100%; height: auto; }
  .back text { font: 500 13px var(--v-ui); fill: var(--v-text2); } .back text.v { fill: var(--v-text); }
  .el.Nb { fill: var(--nb); } .el.O { fill: #e5664f; } .el.Li { fill: var(--gold); }
  :global(:root[data-theme="light"]) .el.O { fill: #c2402c; }
</style>
