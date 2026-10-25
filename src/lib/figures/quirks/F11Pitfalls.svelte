<!-- fig-04-11 Pitfall cards. Six practitioner-reported pitfalls with mechanism, a live number where one is sourced (bake
     voltage from the fig-04-07 plate model, p3 choice shared through stores/quirks.ts), and the fix as recorded. Practitioner
     notes are cited neutrally (kind and date). No author images (DevLog-004a Q6-Q7 open). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import Seg from "./ui/Seg.svelte";
  import type { StatusCode } from "$lib/content/site";
  import { pyroVoltage, P3_OPTIONS, EPS33T_WARNER, pyroField } from "$lib/physics/pyro.ts";
  import { quirks, type P3Choice } from "$lib/stores/quirks";
  import { f } from "./fmtq.ts";

  let p3c = $state<P3Choice>(quirks.p3);
  $effect(() => { quirks.p3 = p3c; });
  let flipped = $state<boolean[]>([false, false, false, false, false, false]);

  const p3s = $derived(p3c === "spread" ? [P3_OPTIONS[0].value, P3_OPTIONS[3].value] : [P3_OPTIONS.find((o) => o.id === p3c)!.value]);
  const kv = $derived(p3s.map((p) => Math.abs(pyroVoltage(p, 95, EPS33T_WARNER.value, 0.5e-3)) / 1000));
  const kvTxt = $derived(kv.length > 1 ? `${f(Math.min(...kv), 1, 4)}–${f(Math.max(...kv), 1, 4)} kV` : `${f(kv[0], 1, 4)} kV`.padStart(12, " "));
  const ekv = $derived(p3s.map((p) => Math.abs(pyroField(p, 1, EPS33T_WARNER.value)) / 1e5));
  const eTxt = $derived(ekv.length > 1 ? `${f(Math.min(...ekv), 2, 4)}–${f(Math.max(...ekv), 2, 4)} kV/cm per K` : `${f(ekv[0], 2, 4)} kV/cm per K`.padStart(21, " "));

  interface Card { k: string; title: string; cause: string; mech: string; num: () => string; fix: string; status: [StatusCode, string, string][] }
  const CARDS: Card[] = [
    { k: "bake", title: "Hotplate bake", cause: "Bakes fry devices or crack the whole substrate; worse on z-cut.", mech: "Pyroelectric charge: a 25 → 120 °C step on a 0.5 mm z-cut wafer, unscreened (4.6).", num: () => kvTxt, fix: "Conductive coating or aluminum-foil wrap as a discharge path.", status: [["reported", "practitioner", "blog-ofs79"], ["derived", "derived", ""]] },
    { k: "cut", title: "z-cut interferometers", cause: "1980s z-cut channel-waveguide interferometers drift more than x-cut.", mech: "z-cut pyroelectric instability; unscreened field per kelvin on a z-cut plate:", num: () => eTxt, fix: "x-cut layout.", status: [["reported", "reported", "bulmer1986"], ["reported", "practitioner", "blog-ofs79"]] },
    { k: "cryo", title: "4 K cooldown", cause: "An LN chip's field damaged a device on another chip; released x-cut structures on Si collapsed after a change of wafer.", mech: "Pyroelectric charge on cooling; collapse attributed in the note to charge plus electrostatic pull-in (hypothesis). No p3 value below room temperature was found, so no number.", num: () => "no number", fix: "Shielding electrodes; Al electrodes shorting LN parts to the Si substrate stopped the collapse.", status: [["reported", "practitioner", "blog-ofs79"], ["U", "U (specifics)", ""]] },
    { k: "ebl", title: "E-beam lithography", cause: "An insulating substrate charges under the electron beam.", mech: "Charging; a discharge layer and a clamp touching it carry the charge away.", num: () => "5-10 nm Al", fix: "Thin low-melting-point metal (Al), removed in an alkaline developer; a 5 nm Ti layer once ran hot and cross-linked the resist top.", status: [["reported", "practitioner", "blog-ebl-2024"]] },
    { k: "mask", title: "a-Si hard mask, Ar+ mill", cause: "An a-Si mask on oxide over y-cut TFLN cracked and etched non-uniformly; cracks transferred to the LN edges; the mask ran out first.", mech: "Film stress and fragile mask edges; films grown on LN may differ from the same films on Si (the note's hypothesis).", num: () => "no number", fix: "Lower mill angle tried; conclusion: mask poor and fragile near edges.", status: [["reported", "practitioner", "blog-hardmask-2018"]] },
    { k: "hf", title: "HF clean", cause: "Hole sidewalls of a y-cut nanobeam came out asymmetric after HF.", mech: "The −c end of domains etches much faster than +c, so sidewalls facing −c and +c recede differently. Which side faced +c is not recorded.", num: () => "−c > +c", fix: "None stated; the chip had been annealed before fabrication.", status: [["P-comp", "P-comp", "volk2008"], ["reported", "practitioner", "blog-ln-properties"]] },
  ];
  const SCENE: Record<string, string> = { bake: "Wafer on a hotplate with negative surface charge and a crack", cut: "Mach-Zehnder interferometer on z-cut with electrodes above and below", cryo: "Two chips in a 4 K cryostat with a spark between them", ebl: "Electron-beam column over an Al discharge layer on LN", mask: "Ion beams milling through a cracked a-Si mask on oxide over LN", hf: "LN chip in an HF beaker with -c and +c faces marked" };
  const toggle = (i: number) => { flipped[i] = !flipped[i]; };
</script>

{#snippet scene(k: string)}
  <svg class="q-svg q-scene" viewBox="0 0 200 110" role="img" aria-label={SCENE[k]}>
    {#if k === "bake"}
      <path d="M20 80 L100 100 L180 80 L100 60 Z" class="s-hp" /><ellipse cx="100" cy="72" rx="56" ry="14" class="s-ln" />
      {#each [60, 80, 100, 120, 140] as x (x)}<text x={x} y="74" text-anchor="middle" class="s-q">−</text>{/each}
      <path d="M70 66 L86 74 L96 68 L112 78 L126 70" class="s-au" />
      <path d="M60 50 q5 -10 0 -20 M100 46 q5 -10 0 -20 M140 50 q5 -10 0 -20" class="s-heat" />
    {:else if k === "cut"}
      <path d="M10 55 L50 55 L70 35 L130 35 L150 55 L190 55 M50 55 L70 75 L130 75 L150 55" class="s-wg" />
      <rect x="75" y="22" width="50" height="8" class="s-au0" /><rect x="75" y="80" width="50" height="8" class="s-au0" />
      <text x="100" y="104" text-anchor="middle" class="s-t">z-cut: charge on top and bottom</text>
    {:else if k === "cryo"}
      <rect x="60" y="10" width="80" height="90" class="s-cry" /><rect x="72" y="62" width="24" height="10" class="s-ln" /><rect x="104" y="62" width="24" height="10" class="s-chip" />
      <path d="M96 66 L100 60 L102 68 L106 62" class="s-au" /><text x="100" y="30" text-anchor="middle" class="s-t">4 K</text>
    {:else if k === "ebl"}
      <path d="M70 10 L130 10 L110 50 L90 50 Z" class="s-cry" /><line x1="100" y1="50" x2="100" y2="82" class="s-beam" />
      <rect x="40" y="82" width="120" height="6" class="s-al" /><rect x="40" y="88" width="120" height="14" class="s-ln" />
      <text x="166" y="88" class="s-t">Al</text>
    {:else if k === "mask"}
      {#each [50, 80, 110, 140] as x (x)}<line x1={x - 20} y1="10" x2={x} y2="50" class="s-beam" />{/each}
      <rect x="40" y="52" width="120" height="10" class="s-si" /><path d="M70 52 L76 62 M110 52 L104 62 M130 52 L134 62" class="s-crack" />
      <rect x="30" y="62" width="140" height="16" class="s-ox" /><rect x="30" y="78" width="140" height="18" class="s-ln" />
    {:else}
      <path d="M60 20 L60 96 L140 96 L140 20" class="s-beak" /><rect x="62" y="50" width="76" height="44" class="s-hf" />
      <rect x="84" y="62" width="32" height="16" class="s-ln" /><text x="100" y="44" text-anchor="middle" class="s-t">HF</text>
      <text x="78" y="74" text-anchor="end" class="s-t">−c</text><text x="122" y="74" class="s-t">+c</text>
    {/if}
  </svg>
{/snippet}

<div class="q-fig" id="fig-04-11">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Fabrication pitfalls: cause, mechanism, number, fix, status</span><span>numbers from the 4.6 plate model</span></div>
    <div class="scrollx">
      <table class="idx q-tab q-f11">
        <thead><tr><th>Pitfall</th><th>Cause</th><th>Mechanism</th><th class="r">Number</th><th>Fix as recorded</th><th>Status</th></tr></thead>
        <tbody>{#each CARDS as c (c.k)}<tr><td>{c.title}</td><td class="q-w">{c.cause}</td><td class="q-w">{c.mech}</td><td class="r q-v q-o">{c.num()}</td><td class="q-w">{c.fix}</td><td class="q-s">{#each c.status as [code, txt, id] (txt)}{#if id}<Src {id} {code} text={txt} cite={false} />{:else}<Badge {code} text={txt} pop={code === "U" ? "f11-u" : "f11-d"} />{/if} {/each}</td></tr>{/each}</tbody>
      </table>
    </div>
    <div class="ctl"><span class="k">p3, C/(m² K)</span><Seg bind:value={p3c} options={[["spread", "spread"], ["savage1966", "4.0e-5"], ["schwesyg2011", "6.4e-5"], ["cti1999", "8.3e-5"], ["popescu2013", "9.5e-5"]]} label="Pyroelectric coefficient" /><span></span></div>
    <div class="pf"><span>practitioner notes: public posts, cited by kind and date</span><span>bake voltage: plate model of 4.6 <Badge code="derived" pop="f11-d" /></span><span>&minus;c etch rule <Src id="volk2008" loc="p. 168" code="P-comp" cite={false} /></span></div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>Six fabrication pitfalls</h3><span class="q-vq">click a card for mechanism, number and fix</span></header>
    <div class="q-cards">
      {#each CARDS as c, i (c.k)}
        <button type="button" class="q-card v-facet" class:flip={flipped[i]} aria-pressed={flipped[i]} onclick={() => toggle(i)}>
          <span class="q-face q-front">
            <span class="q-ct">{c.title}</span>
            {@render scene(c.k)}
            <span class="q-cc">{c.cause}</span>
          </span>
          <span class="q-face q-back">
            <span class="q-ct">{c.title}</span>
            <span class="q-cn">{c.num()}</span>
            <span class="q-cm">{c.mech}</span>
            <span class="q-cf"><b>Fix:</b> {c.fix}</span>
            <span class="q-cs">{#each c.status as [code, txt] (txt)}<span class="b {code === 'P-comp' ? 'pc' : code === 'U' ? 'u' : code === 'derived' ? 'd' : 'r'}">{txt}</span> {/each}</span>
          </span>
        </button>
      {/each}
    </div>
    <div class="q-vrow"><div class="v-ctl"><span class="v-lab">Pyroelectric coefficient, 10⁻⁵ C/(m² K)</span><Seg kind="v" bind:value={p3c} options={[["spread", "All"], ["savage1966", "4.0"], ["schwesyg2011", "6.4"], ["cti1999", "8.3"], ["popescu2013", "9.5"]]} label="Pyroelectric coefficient" /></div></div>
    <div class="v-prov"><span>practitioner notes, cited by kind and date <Src id="blog-ofs79" code="reported" text="practitioner" cite={false} /></span><span>bake voltage <Badge code="derived" pop="f11-d" /></span><span>−c etch rule <Src id="volk2008" loc="p. 168" code="P-comp" cite={false} /></span><span>cooldown specifics <Badge code="U" pop="f11-u" /></span></div>
  </div>
</div>

<style>
  .q-f11 td { font-size: 12px; }
  .q-f11 td.q-v { white-space: pre; }
  .q-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 1000px) { .q-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .q-cards { grid-template-columns: minmax(0, 1fr); } }
  .q-card { position: relative; display: block; height: 330px; padding: 0; background: var(--v-ink0); border: 1px solid var(--v-line); color: var(--v-text); text-align: left; cursor: pointer; font: inherit; }
  .q-card:hover { border-color: var(--v-l532); }
  .q-card:focus-visible { outline: 3px solid var(--v-l532); outline-offset: 3px; }
  .q-face { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; padding: 18px; transition: opacity 240ms var(--v-ease); }
  .q-back { opacity: 0; pointer-events: none; }
  .q-card.flip .q-front { opacity: 0; }
  .q-card.flip .q-back { opacity: 1; }
  .q-ct { font: 400 22px/28px var(--v-serif); }
  .q-cc, .q-cm { font: 400 15px/22px var(--v-ui); color: var(--v-text2); }
  .q-cf { font: 400 15px/22px var(--v-ui); color: var(--v-text2); }
  .q-cf b { color: var(--v-text); font-weight: 600; }
  .q-cn { font: 300 34px/38px var(--v-serif); font-variant-numeric: tabular-nums lining-nums; white-space: pre; color: var(--v-l532); }
  .q-cs { margin-top: auto; display: flex; flex-wrap: wrap; gap: 6px; }
  .q-scene { height: 110px; }
  .s-hp { fill: var(--v-ink3); stroke: var(--v-line2); }
  .s-ln { fill: color-mix(in srgb, var(--v-ln) 25%, var(--v-ink1)); stroke: var(--v-ln); }
  .s-chip { fill: var(--v-si); }
  .s-q { font: 700 14px var(--v-ui) !important; fill: var(--nb) !important; }
  .s-au { fill: none; stroke: var(--v-au); stroke-width: 2.5; }
  .s-au0 { fill: var(--v-au); }
  .s-heat { fill: none; stroke: #ff7a3d; stroke-width: 1.5; }
  .s-wg { fill: none; stroke: var(--v-ir1550); stroke-width: 2; stroke-dasharray: 5 3; }
  .s-t { font: 500 12px var(--v-ui) !important; fill: var(--v-text3) !important; }
  .s-cry { fill: var(--v-ink2); stroke: var(--v-line2); }
  .s-beam { stroke: var(--v-text2); stroke-width: 1.5; stroke-dasharray: 2 3; }
  .s-al { fill: var(--v-text3); }
  .s-si { fill: var(--v-si); }
  .s-ox { fill: var(--v-sio2); }
  .s-crack { stroke: var(--v-au); stroke-width: 2; }
  .s-beak { fill: none; stroke: var(--v-text2); stroke-width: 2; }
  .s-hf { fill: color-mix(in srgb, var(--nb) 18%, transparent); }
  .q-vrow { display: flex; gap: 12px; }
</style>
