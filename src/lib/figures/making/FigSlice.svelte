<!-- F05-05 Ion slicing: implant depth vs energy and the thermal steps from implant to split. Range data: only the reported
     He+ point (195 keV -> 0.68 um density peak, guarino2007); fab.implantRange returns "no verified data" elsewhere, and
     no range curve is drawn (a SRIM table with stored inputs is needed). Thermal steps: reported values with sources.
     VISUAL: donor cross-section, ions, flip, bond, warming, peel (geometry illustrative, not to scale). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { implantRange, type ImplantIon } from "$lib/physics/fab.ts";

  let ion = $state<ImplantIon>("He");
  let E = $state(195);
  let stage = $state(0.6);
  const rp = $derived(implantRange(ion, E));
  const known = $derived(rp.status === "reported");
  const STAGES = [
    { k: "Implant", T: 100, txt: "He<sup>+</sup> 195 keV, 4 × 10<sup>16</sup> cm<sup>−2</sup>, holder 100 °C", pop: "src:guarino", code: "reported" as const },
    { k: "Bond", T: 25, txt: "RCA clean, N<sub>2</sub> plasma, room-temperature bond", pop: "src:you", code: "P" as const },
    { k: "Strengthen", T: 200, txt: "below 200 °C (drawn at the bound)", pop: "src:er", code: "P" as const },
    { k: "Split", T: 230, txt: "about 230 °C", pop: "src:er", code: "P" as const },
    { k: "CMP", T: 25, txt: "edge removal and CMP of the split face", pop: "src:er", code: "P" as const },
    { k: "Anneal", T: 520, txt: "O<sub>2</sub>, 520 °C, 2 h: loss about 1.5 → 0.2 dB/m", pop: "src:shams", code: "P" as const },
  ];
  const si = $derived(Math.min(5, Math.floor(stage)));
  const u = $derived(stage - si);
  const X0 = 50, X1 = 500, Y0 = 14, Y1 = 176, EMAX = 400, DMAX = 2;
  const PX = (e: number): number => X0 + (e / EMAX) * (X1 - X0), PY = (d: number): number => Y0 + (d / DMAX) * (Y1 - Y0);
  const TX = (i: number): number => 50 + i * 75, TY = (T: number): number => 176 - (T / 560) * 160;
  // VISUAL geometry (illustrative): donor 120 px thick, plane 34 px below the implanted face for the reported point
  const flip = $derived(stage < 1 ? 0 : stage < 2 ? Math.min(1, (stage - 1) / 0.6) : 1);
  const lift = $derived(stage < 3 ? 0 : stage < 4 ? (stage - 3) * 70 : 70);
  const tilt = $derived(stage < 3 ? 0 : stage < 4 ? (stage - 3) * 9 : 9);
  const bloom = $derived(stage < 2 ? 0 : stage < 3 ? stage - 2 : 1);
  const filmPx = $derived(stage >= 4 ? 34 - 4 * Math.min(1, (stage - 4) / 0.8) : 34);
  const dots = Array.from({ length: 26 }, (_, i) => 30 + i * 14.6);
</script>

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Ion slicing: implant depth and thermal steps</span><span>R<sub>p</sub> {known ? "0.68 µm" : "no verified data"}</span></div>
  <div class="mk-duo2">
    <div>
      <div class="mk-sub">(a) projected range vs energy, LiNbO<sub>3</sub></div>
      <svg class="mk-plot" viewBox="0 0 520 206" role="img" aria-label="Projected range versus implant energy">
        <rect class="band" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
        <text class="tl" x={X0 + 8} y={Y1 - 10}>no verified range data for He⁺ or H⁺ in LiNbO₃</text>
        <rect x={PX(200)} y={Y0} width={X1 - PX(200)} height="14" class="gl" style="fill: var(--acc-dim)" /><text class="tl" x={PX(205)} y={Y0 + 11}>LNOI practice: He⁺ above 200 keV</text>
        {#each [0, 0.5, 1, 1.5, 2] as d (d)}<line class="gl" x1={X0} x2={X1} y1={PY(d)} y2={PY(d)} /><text class="tk e" x={X0 - 4} y={PY(d) + 3}>{d}</text>{/each}
        {#each [0, 100, 200, 300, 400] as e (e)}<text class="tk m" x={PX(e)} y={Y1 + 14}>{e}</text>{/each}
        <circle class="pt" cx={PX(195)} cy={PY(0.68)} r="4" /><text class="tl" x={PX(195) + 7} y={PY(0.68) + 4}>He⁺ 195 keV: 0.68 µm</text>
        <line class="cur" x1={PX(E)} x2={PX(E)} y1={Y0} y2={Y1} />
        <text class="tk m" x={(X0 + X1) / 2} y="204">E (keV)</text><text class="tk" x="4" y="10">R_p (µm, down)</text>
      </svg>
      <div class="ctl"><span class="k">Ion</span><div class="seg" role="group" aria-label="Ion"><button type="button" class:on={ion === "He"} onclick={() => (ion = "He")}>HE+</button><button type="button" class:on={ion === "H"} onclick={() => (ion = "H")}>H+</button></div><output>{ion}<sup>+</sup></output></div>
      <div class="ctl"><label for="sl-E">Energy E</label><input id="sl-E" type="range" min="50" max="400" step="5" bind:value={E}><output>{String(E).padStart(3, " ")} keV</output></div>
      <div class="mk-ro"><span>E {String(E).padStart(3, " ")} keV</span><span>R_p {known ? "0.68 µm" : "  n/a  "}</span>{#if known}<Badge code="reported" pop="src:guarino" />{:else}<span class="b u" data-pop="src:range-gap">no verified data</span>{/if}</div>
    </div>
    <div>
      <div class="mk-sub">(b) temperature at each step</div>
      <svg class="mk-plot" viewBox="0 0 520 206" role="img" aria-label="Temperature of each step from implant to anneal">
        {#each [0, 100, 200, 300, 400, 500] as T (T)}<line class="gl" x1="40" x2="510" y1={TY(T)} y2={TY(T)} /><text class="tk e" x="36" y={TY(T) + 3}>{T}</text>{/each}
        <path class="ln" d={STAGES.map((s, i) => `${i ? "L" : "M"}${TX(i) - 30} ${TY(s.T)}H${TX(i) + 30}`).join("")} />
        {#each STAGES as s, i (s.k)}<rect class="hit" x={TX(i) - 34} y="10" width="68" height="170" onclick={() => (stage = i + 0.5)} role="presentation" /><text class="tk m" x={TX(i)} y="194" style={si === i ? "fill: var(--fg)" : ""}>{s.k}</text>{/each}
        <circle class="pto" cx={TX(3) + 18} cy={TY(150)} r="3.5"><title>150 °C, 2 h, H-implanted LN (You et al. 2019)</title></circle>
        <circle class="pto" cx={TX(3) - 18} cy={TY(190)} r="3.5"><title>190 °C, 10 h, LiTaO3 analog</title></circle>
        <rect x={TX(si) - 32} y="10" width="64" height="172" class="gl" style="fill: none; stroke: var(--fg2); stroke-dasharray: 2 2" />
      </svg>
      <div class="ctl"><label for="sl-s">Step</label><input id="sl-s" type="range" min="0" max="5.99" step="0.01" bind:value={stage}><output>{STAGES[si].k}</output></div>
      <div class="mk-note" style="height:74px">True depth of the sourced point: He<sup>+</sup> density peak 0.68 µm below the implanted face at 195 keV <Badge code="reported" pop="src:guarino" />, 0.14% of a 500 µm donor; no straggle is sourced, so no width is drawn. {@html STAGES[si].txt} <Badge code={STAGES[si].code} pop={STAGES[si].pop} />. Open circles at split: 150 °C, 2 h (H in LN) <Badge code="P" pop="src:you" />; 190 °C, 10 h (LiTaO<sub>3</sub>) <Badge code="P" pop="src:lt" />.</div>
    </div>
  </div>
  <div class="pf">680 nm films were reported by ion slicing in 2004 without the energy in the abstract <Badge code="P" text="P(abs)" pop="src:rabiei" />; H<sup>+</sup> 100 keV, 7 × 10<sup>16</sup> cm<sup>−2</sup> is reported for LiTaO<sub>3</sub> only <Badge code="P" pop="src:lt" />. Tilt 7° against channelling <Badge code="P" pop="src:you" />.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 580 340" style="max-width:760px" role="img" aria-label="Ion slicing: implant, flip and bond, warming, peel, polish; true-depth inset of the implant">
      <!-- handle: Si + oxide (appears at bond) -->
      {#if stage >= 1}<rect x="40" y="250" width="360" height="70" class="si-f" /><rect x="40" y="236" width="360" height="14" class="ox-f" />{/if}
      <!-- film that stays on the handle after the split -->
      {#if stage >= 3}<rect x="40" y={236 - filmPx} width="360" height={filmPx} class="ln-f" />{#if stage < 4.8}<path class="hatch" d={Array.from({ length: 36 }, (_, i) => `M${40 + i * 10} ${236 - filmPx}l5 -3l5 3`).join("")} fill="none" />{/if}{/if}
      <!-- donor -->
      <g transform={stage < 1 ? "translate(0,0)" : `translate(0,${-lift}) rotate(${-tilt} 40 ${236 - 34})`}>
        {#if stage < 1}
          <rect x="40" y="110" width="360" height="120" class="ln-f" opacity="0.92" />
          {#each dots as x, i (i)}{@const d = Math.min(1, stage * 1.2) * 34}<line class="acc" x1={x} x2={x} y1={70 + (i % 3) * 6} y2={110 + d} opacity="0.5" style="stroke-width:1.2" />{/each}
          <line class={known ? "acc" : "tmpl"} x1="40" x2="400" y1="144" y2="144" opacity={Math.min(1, stage * 1.5)} />
          <text class="lb" x="40" y="58">implanted face (+X up)</text>
        {:else}
          {@const sq = stage < 1.6 ? Math.abs(Math.cos(Math.PI * flip)) : 1}
          <g transform="translate(0,{(236 - 34 - 120) + (1 - sq) * 60}) scale(1,{Math.max(0.05, sq)})">
            <rect x="40" y={stage >= 3 ? 0 : 0} width="360" height={stage >= 3 ? 120 : 154} class="ln-f" opacity="0.9" />
            {#if stage < 3}<line class={known ? "acc" : "tmpl"} x1="40" x2="400" y1="120" y2="120" />{#each Array(24) as _, i (i)}<ellipse cx={50 + i * 15} cy="120" rx={1 + bloom * 5} ry={0.6 + bloom * 2} class="accf" opacity="0.6" />{/each}{/if}
          </g>
        {/if}
      </g>
      <!-- true-depth inset: only the sourced point (He+ 195 keV, density peak 0.68 um, Guarino 2007); no straggle drawn -->
      <g transform="translate(452 0)">
        <text class="lb" x="0" y="72">true depth</text>
        <rect x="0" y="86" width="34" height="200" class="ln-f" opacity="0.9" />
        <line class="ax" x1="0" x2="34" y1="86" y2="86" />
        {#each [0, 0.5, 1] as d (d)}<line class="ax" x1="34" x2="40" y1={86 + d * 200} y2={86 + d * 200} /><text class="lb" x="44" y={90 + d * 200}>{d.toFixed(1)} µm</text>{/each}
        {#if known}
          <line class="acc" x1="-6" x2="40" y1={86 + 0.68 * 200} y2={86 + 0.68 * 200} style="stroke-width:2.5" />
          <text class="vl" x="44" y={86 + 0.68 * 200 - 6}>0.68 µm</text>
          <text class="lb" x="44" y={86 + 0.68 * 200 + 14}>He⁺ peak</text>
        {:else}
          <text class="lb" x="-2" y="306">no verified</text><text class="lb" x="-2" y="322">range data</text>
        {/if}
      </g>
      <text class="lb" x="40" y="336">{stage < 1 ? "ions stop in a buried plane" : stage < 2 ? "flip: implanted face down, bonded at room temperature" : stage < 3 ? "warming: implanted gas collects in the plane (drawing template)" : stage < 4 ? "split: the residual donor peels away" : "CMP removes the rough damaged top; anneal repairs the lattice"}</text>
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl"><span class="v-lab">Ion</span><div class="v-seg" role="group" aria-label="Ion"><button type="button" class:on={ion === "He"} onclick={() => (ion = "He")}>He⁺</button><button type="button" class:on={ion === "H"} onclick={() => (ion = "H")}>H⁺</button></div></div>
      <div class="v-ctl" style="--w:8ch"><label for="slv-E">Implant energy</label><output>{E} keV</output><input id="slv-E" type="range" min="50" max="400" step="5" bind:value={E}></div>
      <div class="v-ctl" style="--w:9ch"><label for="slv-s">Process step</label><output>{STAGES[si].k}</output><input id="slv-s" type="range" min="0" max="5.99" step="0.01" bind:value={stage}></div>
      <dl class="v-hud"><dt>Stopping depth</dt><dd>{known ? "0.68 µm" : "not known"}</dd><dt>Step temperature</dt><dd>{si === 1 || si === 4 ? "room temp." : `${STAGES[si].T} °C`}</dd></dl>
      <p class="v-cap" style="height:132px;overflow:hidden">{#if known}He⁺ at 195 keV stops at a 0.68 µm density peak <Badge code="reported" pop="src:guarino" />.{:else}No verified range data at {E} keV for {ion}⁺ in LiNbO₃: the plane is drawn dashed at an unknown depth <span class="b u" data-pop="src:range-gap">no verified data</span>.{/if} Range data exist only for the reported 195 keV He⁺ point; there is no verified range table for He⁺ or H⁺ in LiNbO₃. Not to scale.</p>
    </div>
  </div>
</figure>
