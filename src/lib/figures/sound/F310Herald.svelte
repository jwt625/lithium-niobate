<!-- Fig. 3.10 Optically heralded microwave photon addition (figures.md F3.10; p17, Nat. Phys. 19, 1423 (2023)).
     Step-through of the published protocol and the reported headline numbers. The data panel is reserved for the CC BY
     source data (Zenodo 10.5281/zenodo.7903643) and holds no data. TECH: numbered steps. VISUAL: exploded stack drawn
     in 2D with the active element lit per step. Thermal occupation from optomech.thermalOccupation. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { thermalOccupation } from "$lib/physics/optomech.ts";
  import { f310 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { exS } from "./f.ts";

  const STEPS = [
    "Setup below 10 mK: LN piezo block on a Si optomechanical crystal, NbTiN microwave resonator chip",
    "A blue-detuned optical pulse drives the optomechanical cavity (two-mode squeezing)",
    "The interaction creates a correlated optical photon and a mechanical phonon near 3.6 GHz",
    "A click on the optical single-photon detector heralds that one phonon was added",
    "Piezoelectric coupling turns the phonon into a microwave photon in the resonator",
  ];
  const LIT = [["all"], ["opt"], ["opt", "mech"], ["det"], ["mech", "piezo", "mw"]];
  const lit = (k: string): boolean => LIT[f310.step].includes("all") || LIT[f310.step].includes(k);
  const label = $derived(`Step ${f310.step}/4: ` + STEPS[f310.step]);
  const n300 = thermalOccupation(3.6e9, 300), n10 = thermalOccupation(3.6e9, 0.01);
  const stepOpts = [0, 1, 2, 3, 4].map((i) => ({ v: i, t: String(i) }));
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f310" id="f310">
  <div class="ph"><span>Optically heralded microwave photon addition (Jiang et al. 2023)</span><Seg options={stepOpts} bind:value={f310.step} label="Protocol step" /></div>
  <div class="snd-g2">
    <div class="snd-cell">
      <ol class="snd-steps">{#each STEPS as s, i (i)}<li class:on={i === f310.step}>{s}</li>{/each}</ol>
      <dl class="snd-kv" style="border-top:0;padding:4px 0">
        <dt>continuous conversion efficiency</dt><dd>4.9 ± 0.5 %</dd>
        <dt>heralding rate</dt><dd>15 Hz</dd>
        <dt>added thermal noise</dt><dd>&lt; 2 microwave photons</dd>
        <dt>f_m, g₀/2π</dt><dd>≈ 3.6 GHz, ≈ 410 kHz</dd>
        <dt>n_th at 3.6 GHz: 300 K / 10 mK</dt><dd>{exS(n300, 1)} / {exS(n10, 1)}</dd>
      </dl>
    </div>
    <div class="snd-cell">
      <div class="snd-dbox"><p class="nodata">Plot area for the published curves (Fig. 2, Fig. 3, Extended Data Figs. 1, 2, 3, 5; Zenodo 10.5281/zenodo.7903643, CC BY 4.0). It holds no data.</p></div>
    </div>
  </div>
  <div class="pf">Jiang et al. 2023, arXiv abstract and text <Badge code="reported" pop="r:p17" /> thermal occupation <Badge code="derived" pop="m-calc" /> data record <Badge code="reported" pop="r:zenodo7903643" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f310">
  <div class="snd-card">
    <h3>Exploded stack, drawn schematically</h3>
    <svg class="snd-vsvg" viewBox="0 0 640 360" role="img" aria-label="Exploded stack of the heralding device with the active element lit">
      <!-- NbTiN microwave chip (bottom) -->
      <path d="M60 280 L260 330 L420 280 L220 230 Z" fill={lit("mw") ? "var(--v-l532)" : "var(--v-si)"} fill-opacity={lit("mw") ? 0.45 : 0.3} stroke="var(--v-line2)" />
      <text x="430" y="290">NbTiN microwave chip</text>
      <!-- Si optomechanical crystal on SOI (middle) -->
      <path d="M80 190 L260 235 L400 190 L220 145 Z" fill={lit("mech") ? "var(--v-l532)" : "var(--v-si)"} fill-opacity={lit("mech") ? 0.45 : 0.3} stroke="var(--v-line2)" />
      {#each Array.from({ length: 9 }, (_, i) => i) as i (i)}<circle cx={170 + i * 14} cy={192 - i * 3} r="3" fill="var(--v-ink0)" />{/each}
      <text x="410" y="196">Si optomechanical crystal</text><text x="410" y="214">on 220 nm SOI</text>
      <!-- LN piezo block (top) -->
      <path d="M150 110 L230 130 L290 112 L210 92 Z" fill={lit("piezo") ? "var(--v-l532)" : "var(--v-ln)"} fill-opacity={lit("piezo") ? 0.55 : 0.4} stroke="var(--v-ln)" />
      <text x="300" y="100">290 nm X-cut MgO:LN</text><text x="300" y="118">piezo block</text>
      <!-- optics -->
      <path d="M20 160 L170 192" class="ir" stroke-opacity={lit("opt") ? 1 : 0.35} />
      <rect x="10" y="40" width="70" height="40" fill="none" stroke={lit("det") ? "var(--v-l532)" : "var(--v-line2)"} stroke-width={lit("det") ? 3 : 1.5} />
      <text x="16" y="64">detector</text>
      <path d="M45 80 L45 155" class="ir" stroke-opacity={lit("det") ? 1 : 0.35} />
      <path d="M230 135 L230 230" class="tx3" />
    </svg>
    <div class="snd-legend"><span><i style="background:var(--v-l532)"></i>active in this step</span><span><i style="background:var(--v-ir1550)"></i>optical path, false color, dashed</span></div>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>Protocol</h3>
      <p class="snd-steptxt">{label}</p>
    </div>
    <div class="v-ctl"><span class="v-lab">Step</span><Seg visual options={stepOpts} bind:value={f310.step} label="Protocol step" /></div>
    <div class="snd-card">
      <h3>Reported</h3>
      <dl class="snd-vhud"><dt>conversion efficiency, continuous</dt><dd>4.9 ± 0.5 %</dd><dt>heralding rate</dt><dd>15 Hz</dd><dt>added thermal noise</dt><dd>&lt; 2 photons</dd><dt>thermal phonons at 3.6 GHz, 300 K / 10 mK</dt><dd>{exS(n300, 1)} / {exS(n10, 1)}</dd><dt>f_m, g₀/2π</dt><dd>≈ 3.6 GHz, ≈ 410 kHz</dd></dl>
    </div>
    <div class="snd-dbox v"><p class="nodata">Plot area for the published curves (Zenodo 10.5281/zenodo.7903643, CC BY 4.0). It holds no data.</p></div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>Jiang et al., Nat. Phys. 19, 1423 (2023) <Badge code="reported" pop="r:p17" /></span><span>data record CC BY 4.0 <Badge code="reported" pop="r:zenodo7903643" /></span></div>
