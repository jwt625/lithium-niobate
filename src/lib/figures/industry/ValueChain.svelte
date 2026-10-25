<!-- F8.01 Rock-to-chip value chain. TECH: ASCII-style flow of boxed mono cells (snake on desktop, column on phone) with a
     fixed node card. VISUAL: engraved pictogram per node on one optic-axis line, card below. Both variants share the
     selected node. Ore node: "1 wafer = 25.8 g Nb"; its card scales a Nb ingot against a 6-inch wafer at true mass ratio
     (drawn areas proportional to mass). -->
<script lang="ts">
  import G from "./G.svelte";
  import Icon8 from "./Icon8.svelte";
  import { CHAIN, type Fact } from "./facts";
  import { waferMass, nbMassFraction } from "$lib/physics/fab.ts";
  import { DENSITY_KUSHIBIKI1999 } from "$lib/physics/constants.ts";

  let { atlasFact }: { atlasFact: Fact } = $props();
  let sel = $state("ore_nb");
  let grow = $state(0); // bumps on each ore click to replay the ingot scaling
  const node = $derived(CHAIN.find((n) => n.id === sel) ?? CHAIN[0]);
  const facts = $derived(node.atlasFact ? [...node.facts, atlasFact] : node.facts);
  const W6 = waferMass(150, 0.5, DENSITY_KUSHIBIKI1999.value);
  const wNb = nbMassFraction();
  // joy drawing: wafer disc R = 54 user units represents W6.LN_g; ingot face area = wNb x disc area
  const R = 54, A = Math.PI * R * R * wNb, H = 48, B = (2 * A) / H / 2.2; // trapezoid top B, bottom 1.2 B: area = 1.1 B H = A
  const f2 = (x: number): string => x.toFixed(2);
  const ingot = `M${f2(-B / 2)} ${-H / 2} L${f2(B / 2)} ${-H / 2} L${f2(0.6 * B)} ${H / 2} L${f2(-0.6 * B)} ${H / 2} Z`;
  let cardT: HTMLElement | undefined = $state(), cardV: HTMLElement | undefined = $state();
  function pick(id: string): void {
    sel = id; if (id === "ore_nb") grow++;
    // phone: the card sits below the flow; bring it into view
    if (matchMedia("(max-width: 900px)").matches) {
      const c = document.documentElement.dataset.mode === "visual" ? cardV : cardT;
      const r = c?.getBoundingClientRect();
      if (r && (r.top > innerHeight - 120 || r.bottom < 0)) c?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }
  const ICON: Record<string, string> = { ore_nb: "ore", ore_li: "brine", oxide: "powder", crystal: "boule", wafer_bulk: "wafer", wafer_thin: "stack", foundry: "fab", chip: "die", module: "module", system: "rack" };
  const AREA: Record<string, string> = { ore_nb: "ore", ore_li: "ore", oxide: "oxide", crystal: "crystal", wafer_bulk: "bulk", wafer_thin: "thin", foundry: "fab", chip: "chip", module: "mod", system: "sys" };
  const ARR = [["a1", "──>"], ["a2", "──>"], ["a3", "──>"], ["a4", "──>"], ["a5", "│"], ["a6", "<──"], ["a7", "<──"], ["a8", "<──"]];
</script>

{#snippet card(v: boolean)}
  <div class="i8-card" class:v aria-live="polite" {@attach (el: HTMLElement) => { if (v) cardV = el; else cardT = el; }}>
    <div class="i8-card-h"><b>{node.label}</b><span>{node.sub}</span></div>
    {#if sel === "ore_nb"}
      <svg class="i8-joy" viewBox="-150 -40 300 80" role="img" aria-label="Six-inch LN wafer, 41.0 g, beside its 25.8 g of niobium; drawn areas proportional to mass">
        <g transform="translate(-70 0)"><circle r={R * 0.74} class="i8-joy-w" /><text y="4" text-anchor="middle">{W6.LN_g.toFixed(1)} g LN</text></g>
        {#key grow}<g class="i8-joy-i" transform="translate(70 0) scale(0.74)"><path d={ingot} /><text y="5" text-anchor="middle">{W6.Nb_g.toFixed(1)} g Nb</text></g>{/key}
      </svg>
      <p class="i8-joy-c">150 mm &times; 0.5 mm wafer, density 4,642.8 kg/m<sup>3</sup>; Nb is {(wNb * 100).toFixed(1)} wt% of LiNbO<sub>3</sub>. Drawn areas proportional to mass. <G g="E" r="i8-nbwafer" /></p>
    {/if}
    <ul class="i8-facts">
      {#each facts as f (f.t)}<li><span>{f.t}</span><span><G g={f.g} r={f.r} /></span></li>{/each}
    </ul>
    {#if node.companies.length}<div class="i8-cos"><span class="lbl">Named in 8.2</span>{#each node.companies as c (c)}<span class="i8-tag">{c}</span>{/each}</div>{/if}
  </div>
{/snippet}

<div class="i8-vc" data-variant="tech">
  <div class="i8-flow" role="group" aria-label="Value chain nodes">
    <div class="i8-ore" style="grid-area:ore">
      {#each CHAIN.slice(0, 2) as n (n.id)}
        <button type="button" class="i8-node" class:on={sel === n.id} onclick={() => pick(n.id)} aria-pressed={sel === n.id}><b>{n.label}</b><span>{n.id === "ore_nb" ? "1 wafer = 25.8 g Nb" : n.sub}</span></button>
      {/each}
    </div>
    {#each CHAIN.slice(2) as n (n.id)}
      <button type="button" class="i8-node" style="grid-area:{AREA[n.id]}" class:on={sel === n.id} onclick={() => pick(n.id)} aria-pressed={sel === n.id}><b>{n.label}</b><span>{n.sub}</span></button>
    {/each}
    {#each ARR as [a, t] (a)}<span class="i8-arr {a}" style="grid-area:{a}" aria-hidden="true">{t}</span>{/each}
    <span class="i8-br" style="grid-area:br" aria-hidden="true">├─ SAW filters, PPLN, bulk modulators</span>
  </div>
  {@render card(false)}
</div>

<div class="i8-vcv" data-variant="visual">
  <div class="i8-line" role="group" aria-label="Value chain nodes">
    <div class="i8-st i8-st2">
      {#each CHAIN.slice(0, 2) as n (n.id)}
        <button type="button" class="i8-vn" class:on={sel === n.id} onclick={() => pick(n.id)} aria-pressed={sel === n.id}><Icon8 name={ICON[n.id]} size={44} /><b>{n.label}</b><span>{n.id === "ore_nb" ? "1 wafer = 25.8 g Nb" : n.sub}</span></button>
      {/each}
    </div>
    {#each CHAIN.slice(2) as n (n.id)}
      <div class="i8-st"><button type="button" class="i8-vn" class:on={sel === n.id} onclick={() => pick(n.id)} aria-pressed={sel === n.id}><Icon8 name={ICON[n.id]} size={56} /><b>{n.label}</b><span>{n.sub}</span></button></div>
    {/each}
  </div>
  {@render card(true)}
</div>

<style>
  /* TECH */
  .i8-vc { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 12px; align-items: start; }
  .i8-flow { height: 280px; display: grid; grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1fr) 30px minmax(0, 1fr) 30px minmax(0, 1fr) 30px minmax(0, 1fr);
    grid-template-rows: 112px 56px 112px; grid-template-areas: "ore a1 oxide a2 crystal a3 bulk a4 thin" ". . . . . . br . a5" ". . sys a8 mod a7 chip a6 fab"; font-family: var(--mono); }
  .i8-ore { display: grid; grid-template-rows: 1fr 1fr; gap: 6px; }
  .i8-node { display: flex; flex-direction: column; justify-content: center; gap: 2px; min-width: 0; padding: 4px 7px; background: var(--bg); border: 1px solid var(--rule2); box-shadow: 2px 2px 0 var(--shadow); color: var(--fg); font: inherit; text-align: left; cursor: pointer; }
  .i8-node b { font: 500 11.5px/15px var(--mono); }
  .i8-node span { font: 400 10.5px/14px var(--mono); color: var(--fg3); }
  .i8-node:hover { background: var(--acc-dim); }
  .i8-node.on { background: var(--fg); color: var(--bg); }
  .i8-node.on span { color: var(--bg); }
  .i8-node:focus-visible { outline: 1px solid var(--fg); outline-offset: 2px; }
  .i8-arr { align-self: center; justify-self: center; font: 400 12px/1 var(--mono); color: var(--fg3); white-space: pre; }
  .i8-arr.a5 { align-self: stretch; display: flex; align-items: center; justify-content: center; border-left: 1px solid var(--fg3); width: 0; justify-self: center; color: transparent; }
  .i8-br { align-self: start; padding-top: 6px; font: 400 10.5px/14px var(--mono); color: var(--fg3); white-space: nowrap; overflow: visible; }
  .i8-card { height: 280px; overflow-y: auto; border: 1px solid var(--rule2); background: var(--bg); box-shadow: 3px 3px 0 var(--shadow); padding: 6px 9px; }
  .i8-card-h { display: flex; justify-content: space-between; gap: 8px; padding-bottom: 4px; margin-bottom: 4px; border-bottom: 1px solid var(--rule2); font: 400 11px/16px var(--mono); color: var(--fg3); }
  .i8-card-h b { font-weight: 500; color: var(--fg); }
  .i8-cos { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin-top: 6px; padding-top: 5px; border-top: 1px solid var(--rule); }
  .i8-joy { width: 100%; height: 84px; display: block; }
  .i8-joy text { font: 400 10px var(--mono); fill: var(--fg); }
  .i8-joy-w { fill: var(--bg3); stroke: var(--fg3); }
  .i8-joy-i path { fill: var(--fg3); stroke: var(--fg); }
  .i8-joy-i text { fill: var(--bg); }
  .i8-joy-c { margin: 2px 0 6px; font-size: 11px; line-height: 16px; color: var(--fg3); }
  @media (max-width: 900px) {
    .i8-vc { grid-template-columns: minmax(0, 1fr); }
    .i8-flow { height: 760px; align-content: start; grid-template-columns: minmax(0, 1fr);
      grid-template-areas: "ore" "a1" "oxide" "a2" "crystal" "a3" "bulk" "br" "a4" "thin" "a5" "fab" "a6" "chip" "a7" "mod" "a8" "sys"; }
    .i8-flow { grid-template-rows: 92px 18px 52px 18px 52px 18px 52px 22px 18px 52px 18px 52px 18px 52px 18px 52px 18px 52px; }
    .i8-arr { color: transparent; border-left: 1px solid var(--fg3); width: 0; height: 100%; }
    .i8-br { padding: 3px 0 0 8px; }
    .i8-ore { grid-template-rows: none; grid-template-columns: 1fr 1fr; }
  }

  /* VISUAL */
  .i8-vcv { display: grid; gap: 28px; }
  .i8-line { position: relative; display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 8px; height: 300px; align-items: start; padding-top: 56px; }
  .i8-line::before { content: ""; position: absolute; left: 4%; right: 4%; top: 92px; height: 2px; margin-top: -1px; background: linear-gradient(90deg, var(--v-text3), var(--v-l532)); }
  .i8-st { position: relative; display: grid; justify-items: center; }
  .i8-st2 { gap: 10px; margin-top: 6px; }
  .i8-vn { position: relative; display: grid; justify-items: center; gap: 2px; width: 100%; min-height: 44px; padding: 8px 2px; background: none; border: 0; color: var(--v-text2); font: 500 14px/18px var(--v-ui); text-align: center; cursor: pointer; transition: color 120ms var(--v-ease); }
  .i8-vn b { font: 400 17px/22px var(--v-serif); color: var(--v-text); }
  .i8-vn span { font: 400 12px/16px var(--v-ui); color: var(--v-text3); }
  .i8-vn :global(.i8-ico) { position: relative; background: var(--v-ink0); }
  .i8-vn:hover :global(.i8-ico), .i8-vn.on :global(.i8-ico) { color: var(--v-l532); }
  .i8-vn.on b { color: var(--v-l532); }
  .i8-vn.on::after { content: ""; position: absolute; left: 50%; bottom: -6px; width: 9px; height: 9px; margin-left: -4.5px; background: var(--v-l532); transform: rotate(45deg); }
  .i8-vn:focus-visible { outline: 3px solid var(--v-l532); outline-offset: 2px; }
  .i8-card.v { height: 380px; padding: 20px 24px; background: var(--v-ink1); border: 1px solid var(--v-line); box-shadow: none; }
  .i8-card.v .i8-card-h { padding-bottom: 10px; margin-bottom: 8px; border-color: var(--v-line); font: 400 15px/22px var(--v-ui); color: var(--v-text3); align-items: baseline; }
  .i8-card.v .i8-card-h b { font: 400 28px/32px var(--v-serif); color: var(--v-text); }
  .i8-card.v .i8-cos { border-color: var(--v-line); gap: 8px; padding-top: 12px; margin-top: 12px; }
  .i8-card.v .i8-joy { height: 120px; max-width: 520px; }
  .i8-card.v .i8-joy text { font: 500 11px var(--v-ui); fill: var(--v-text); }
  .i8-card.v .i8-joy-w { fill: color-mix(in srgb, var(--v-ln) 18%, transparent); stroke: var(--v-ln); }
  .i8-card.v .i8-joy-i path { fill: color-mix(in srgb, var(--nb) 55%, transparent); stroke: var(--nb); }
  .i8-card.v .i8-joy-i text { fill: var(--v-ink0); }
  .i8-card.v .i8-joy-c { font: 400 14px/21px var(--v-ui); color: var(--v-text3); }
  :global(:root[data-fx="on"]) .i8-card.v .i8-joy-i path { animation: i8grow 600ms cubic-bezier(0.2, 0.7, 0.2, 1) both; transform-box: fill-box; transform-origin: 50% 100%; }
  @keyframes i8grow { from { transform: scale(0); } to { transform: scale(1); } }
  @media (max-width: 900px) {
    .i8-line { grid-template-columns: minmax(0, 1fr); height: auto; gap: 6px; padding: 0; }
    .i8-line::before { left: 31px; right: auto; top: 0; bottom: 0; width: 2px; height: auto; margin: 0; background: linear-gradient(180deg, var(--v-text3), var(--v-l532)); }
    .i8-st { justify-items: stretch; }
    .i8-st2 { grid-template-columns: 1fr 1fr; gap: 6px; }
    .i8-vn { grid-template-columns: 64px minmax(0, 1fr); grid-template-rows: auto auto; justify-items: start; text-align: left; column-gap: 10px; padding: 4px 0; background: none; }
    .i8-vn :global(.i8-ico) { grid-row: 1 / 3; justify-self: center; background: var(--v-ink0); }
    .i8-st2 .i8-vn { grid-template-columns: 64px minmax(0, 1fr); }
    .i8-vn.on::after { left: 27px; bottom: auto; top: 50%; margin: -4.5px 0 0; display: none; }
    .i8-card.v { height: 560px; padding: 16px; }
  }
</style>
