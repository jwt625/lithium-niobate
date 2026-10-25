<!-- Fig. 3.11 Nanobender scaling (figures.md F3.11; p07 Eq. 1, arXiv v1, reported): displacement per volt of a plain plate
     ~ (0.01 nm/V), transverse extension ~ (0.01 nm/V) R, bending beam ~ (0.01 nm/V) R^2, R = L/w; order-of-magnitude
     scaling law, no FEM. Reported tuning markers: 5 nm/V small-signal slope (|U| < 0.5 V), 40 nm span within 4 V (not a
     slope). TECH: log-log plot with slopes 0, 1, 2. VISUAL: bending beam (curvature exaggerated) and three bars. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { f311 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { logS, r1, decades, dec } from "./plot.ts";
  import { uf, ef } from "./f.ts";

  let { d22, d15 }: { d22: number; d15: number } = $props(); // pm/V, derived from kushibiki1999
  const K = 0.01; // nm/V prefactor, p07 Eq. 1
  const R = $derived(10 ** f311.logR);
  const per = $derived({ plate: K, extension: K * R, bender: K * R * R });
  const disp = $derived(per[f311.act] * f311.U);
  const ro = $derived({ R: uf(R, 3, 1), U: uf(f311.U, 1, 2) + " V", plate: ef(per.plate, 1, false), ext: ef(per.extension, 1, false), bend: ef(per.bender, 1, false), disp: ef(disp, 1, false) + " nm" });
  let mw = $state(0);
  const W = $derived(mw > 120 ? mw : 640);
  const H = 240, L = 54, Rm = 14, T = 10, B = 26;
  const sx = $derived(logS(1, 100, L, W - Rm));
  const sy = logS(1e-3, 1e3, H - B, T);
  const line = (k: number): string => `M${r1(sx(1))} ${r1(sy(K))}L${r1(sx(100))} ${r1(sy(K * 100 ** k))}`;
  const actOpts = [{ v: "plate" as const, t: "plate" }, { v: "extension" as const, t: "extension" }, { v: "bender" as const, t: "bender" }];
  // VISUAL: beam of length 60 + 3.4 R px (capped), curvature exaggerated
  const beamL = $derived(Math.min(420, 80 + 3.4 * R));
  const EXAG = 40;
  const bend = $derived(Math.min(70, (per.bender * f311.U * EXAG) / 10));
  const barH = (v: number): number => Math.max(2, ((Math.log10(v) + 3) / 6) * 150);
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f311" id="f311">
  <div class="ph"><span>Displacement per volt vs aspect ratio R = L/w (scaling law, prefactor 0.01 nm/V)</span><Seg options={actOpts} bind:value={f311.act} label="Actuator type" /></div>
  <div class="snd-g2">
    <div class="snd-cell"><div bind:clientWidth={mw}>
      <svg class="snd-svg snd-fixh" style="height:{H}px" viewBox="0 0 {W} {H}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Displacement per volt versus aspect ratio">
        {#each decades(1e-3, 1e3) as y (y)}<line class="gl" x1={L} x2={W - Rm} y1={r1(sy(y))} y2={r1(sy(y))} /><text class="tk" x={L - 5} y={r1(sy(y) + 3)} text-anchor="end">{dec(y)}</text>{/each}
        {#each [1, 10, 100] as x (x)}<text class="tk" x={r1(sx(x))} y={H - 9} text-anchor="middle">{x}</text>{/each}
        <rect class="fr" x={L} y={T} width={W - Rm - L} height={H - B - T} />
        <path class={f311.act === "plate" ? "c1" : "c3"} d={line(0)} /><path class={f311.act === "extension" ? "c1" : "c3"} d={line(1)} /><path class={f311.act === "bender" ? "c1" : "c3"} d={line(2)} />
        <text class="tk" x={W - Rm - 4} y={r1(sy(K) - 4)} text-anchor="end">plate, R⁰</text><text class="tk" x={W - Rm - 4} y={r1(sy(K * 100) - 4)} text-anchor="end">extension, R¹</text><text class="tk" x={r1(sx(30))} y={r1(sy(K * 900) - 6)} text-anchor="end">bender, R²</text>
        <line class="c5" x1={L} x2={W - Rm} y1={r1(sy(d22 / 1000))} y2={r1(sy(d22 / 1000))} /><text class="tk" x={L + 4} y={r1(sy(d22 / 1000) + 11)}>d₂₂ {d22.toFixed(1)} pm/V</text>
        <line class="c5" x1={L} x2={W - Rm} y1={r1(sy(d15 / 1000))} y2={r1(sy(d15 / 1000))} /><text class="tk" x={L + 4} y={r1(sy(d15 / 1000) - 4)}>d₁₅ {d15.toFixed(1)} pm/V</text>
        <line class="cur" x1={r1(sx(R))} x2={r1(sx(R))} y1={T} y2={H - B} />
      </svg>
    </div></div>
    <div class="snd-cell">
      <dl class="snd-kv" style="border-top:0">
        <dt>R</dt><dd>{ro.R}</dd>
        <dt>plate, nm/V</dt><dd>{ro.plate}</dd>
        <dt>transverse extension, nm/V</dt><dd>{ro.ext}</dd>
        <dt>bender, nm/V</dt><dd>{ro.bend}</dd>
        <dt>displacement at U, selected type</dt><dd>{ro.disp}</dd>
      </dl>
      <table class="idx snd-tab snd-wrap"><thead><tr><th>Reported optical tuning (Jiang et al. 2020)</th><th class="r">value</th></tr></thead><tbody>
        <tr><td>small-signal slope, linear fit at |U| &lt; 0.5 V</td><td>≈ 5 nm/V (0.6 THz/V)</td></tr>
        <tr><td>span within 4 V (nonlinear curve; not a slope)</td><td>1520 to 1560 nm, ≈ 400 linewidths</td></tr>
      </tbody></table>
    </div>
  </div>
  <div class="ctl"><label for="f311-r">Aspect ratio R</label><input id="f311-r" type="range" min="0" max="2" step="0.01" bind:value={f311.logR} /><output for="f311-r">{ro.R}</output></div>
  <div class="ctl"><label for="f311-u">Voltage U</label><input id="f311-u" type="range" min="0" max="4" step="0.05" bind:value={f311.U} /><output for="f311-u">{ro.U}</output></div>
  <div class="pf">Jiang et al., Commun. Phys. 3, 156 (2020), CC BY 4.0, Eq. 1 <Badge code="reported" pop="r:p07" /> d₂₂, d₁₅ from Kushibiki et al. 1999 <Badge code="derived" pop="m-forms" /> lines are order-of-magnitude scaling, not FEM</div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f311">
  <div class="snd-card">
    <h3>Bending beam with a field reversing across its width; curvature drawn ×{EXAG}</h3>
    <svg class="snd-vsvg" viewBox="0 0 520 260" role="img" aria-label="Nanobender beam bending under voltage, curvature exaggerated">
      <rect x="20" y="70" width="40" height="120" fill="var(--v-si)" fill-opacity="0.5" />
      <path d="M60 {r1(118)} Q{r1(60 + beamL / 2)} {r1(118)} {r1(60 + beamL)} {r1(118 - bend)} L{r1(60 + beamL)} {r1(142 - bend)} Q{r1(60 + beamL / 2)} {r1(142)} 60 142 Z" class="lnf" />
      <path d="M60 {r1(121)} Q{r1(60 + beamL / 2)} {r1(121)} {r1(60 + beamL)} {r1(121 - bend)}" class="au" />
      <path d="M60 {r1(139)} Q{r1(60 + beamL / 2)} {r1(139)} {r1(60 + beamL)} {r1(139 - bend)}" class="au" />
      <path d="M60 130 Q{r1(60 + beamL / 2)} 130 {r1(60 + beamL)} {r1(130 - bend)}" class="au2" />
      <text x="70" y="62">L = R · w</text>
      <text x={r1(64 + beamL)} y={r1(110 - bend)}>tip</text>
    </svg>
    <div class="snd-legend"><span><i style="background:var(--v-au)"></i>electrodes on and along the beam</span><span><i style="background:var(--v-ln)"></i>LN beam; drawn length grows with R</span></div>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>Displacement per volt at R = {ro.R.trim()}</h3>
      <svg class="snd-vsvg" viewBox="0 0 420 200" role="img" aria-label="Displacement per volt for three actuator types">
        {#each [["plate", per.plate, "R⁰"], ["extension", per.extension, "R¹"], ["bender", per.bender, "R²"]] as [k, v, s], i (k)}
          <rect x={40 + i * 130} y={r1(170 - barH(v as number))} width="70" height={r1(barH(v as number))} fill={k === "bender" ? "var(--v-l532)" : "var(--v-au)"} fill-opacity="0.75" />
          <text x={75 + i * 130} y="190" text-anchor="middle">{k}, {s}</text>
          <text x={75 + i * 130} y={r1(164 - barH(v as number))} text-anchor="middle" class="lbv">{ef(v as number, 1, false)}</text>
        {/each}
        {#each [["d₂₂", d22], ["d₁₅", d15]] as [k, d] (k)}<line x1="20" x2="410" y1={r1(170 - barH((d as number) / 1000))} y2={r1(170 - barH((d as number) / 1000))} class="tx3" /><text x="412" y={r1(174 - barH((d as number) / 1000))}>{k}</text>{/each}
      </svg>
      <p class="v-cap">nm/V on a log scale from 10⁻³ to 10³; prefactor 0.01 nm/V (Jiang et al. 2020 Eq. 1)</p>
    </div>
    <div class="v-ctl" style="--w:6ch"><label for="f311v-r">Aspect ratio R</label><output for="f311v-r">{ro.R}</output><input id="f311v-r" type="range" min="0" max="2" step="0.01" bind:value={f311.logR} /></div>
    <div class="v-ctl" style="--w:7ch"><label for="f311v-u">Voltage U</label><output for="f311v-u">{ro.U}</output><input id="f311v-u" type="range" min="0" max="4" step="0.05" bind:value={f311.U} /></div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>Jiang et al. 2020, CC BY 4.0 <Badge code="reported" pop="r:p07" /></span><span>reported tuning: ≈ 5 nm/V small-signal, 1520 to 1560 nm within 4 V</span><span>bars are order-of-magnitude scaling, not FEM</span><span>reference: d₂₂ = {d22.toFixed(1)} pm/V, d₁₅ = {d15.toFixed(1)} pm/V <Badge code="derived" pop="m-forms" /></span></div>
