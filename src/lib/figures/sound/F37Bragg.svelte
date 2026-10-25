<!-- Fig. 3.7 Bragg acousto-optic cell (figures.md F3.7): Lambda = v/f, sin(theta_B) = lambda0/(2 n Lambda) inside,
     lambda0/(2 Lambda) in air, frequency shift +f (ao.bragg); n from the Zelmon 1997 CLN Sellmeier model.
     TECH: wavevector triangle to scale and readouts. VISUAL: crystal block with sound stripes that move only while the
     RF slider is dragged, input and diffracted beams at the computed angles (IR in declared false color, dashed). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { bragg } from "$lib/physics/ao.ts";
  import { nCLN } from "../optics.ts";
  import { spectral } from "../spectral.ts";
  import { f37 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { r1 } from "./plot.ts";
  import { uf, zf } from "./f.ts";

  let { modes }: { modes: { id: "XL" | "ZS" | "SAW"; label: string; v: number }[] } = $props();
  const md = $derived(modes.find((m) => m.id === f37.mode) ?? modes[0]);
  const lam = $derived(f37.lam_nm * 1e-9);
  const n = $derived(nCLN(f37.pol, f37.lam_nm / 1000));
  const f = $derived(10 ** f37.logf);
  const b = $derived(bragg(lam, n, md.v, f));
  const fmtF = (x: number): string => (x >= 1e9 ? uf(x / 1e9, 1, 3) + " GHz" : uf(x / 1e6, 4, 1) + " MHz");
  const fmtL = (m: number): string => (m >= 1e-3 ? uf(m * 1e3, 1, 3) + " mm" : uf(m * 1e6, 3, 2) + " µm");
  const dg = (r: number): string => (Number.isFinite(r) ? uf((r * 180) / Math.PI, 2, 3) + "°" : "  ---.---");
  const ro = $derived({ lam: uf(f37.lam_nm, 4, 0) + " nm", f: fmtF(f), L: fmtL(b.Lambda_m), ti: dg(b.thetaInt_rad), te: dg(b.thetaExt_rad), df: "+" + fmtF(b.shift_Hz).trim(), n: n.toFixed(4), Kk: (b.K / b.kOpt).toExponential(2).replace("e-", "e−") });
  // triangle to scale: |k| = 120 px
  const TR = $derived.by(() => {
    const k = 120, K = (b.K / b.kOpt) * k;
    if (K > 2 * k) return null;
    const h = Math.sqrt(k * k - (K * K) / 4);
    return { K, h, Ax: 160 - K / 2, Bx: 160 + K / 2, y: 20 + h };
  });
  const modeOpts = $derived(modes.map((m) => ({ v: m.id, t: m.label })));
  // VISUAL: block of 200 um width; stripes at Lambda; beams at the external angle
  let phase = $state(0);
  let lastF = 0;
  function onRf(): void { const df = Math.abs(f37.logf - lastF); lastF = f37.logf; phase = (phase + 0.6 + df * 10) % 1; }
  const BW = 360, BX = 120, BY = 60, BH = 170, SPAN_UM = 200;
  const stripes = $derived.by(() => {
    const Lpx = (b.Lambda_m * 1e6 / SPAN_UM) * BW;
    if (Lpx < 1.6) return { dense: true, xs: [] as number[], Lpx };
    const xs: number[] = [];
    for (let x = BX + ((phase * Lpx) % Lpx) - Lpx; x < BX + BW; x += Lpx) if (x >= BX) xs.push(x);
    return { dense: false, xs, Lpx };
  });
  const ir = $derived(f37.lam_nm > 760);
  const col = $derived(ir ? "var(--v-ir1550)" : spectral(f37.lam_nm));
  // beam geometry: sound along +x, beams cross the block; incident at -theta_ext from the vertical (normal to x), diffracted at +theta_ext
  const ang = $derived(Number.isFinite(b.thetaExt_rad) ? b.thetaExt_rad : 0);
  const cx = BX + BW / 2, cy = BY + BH / 2;
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f37" id="f37">
  <div class="ph"><span>Bragg diffraction by a sound wave in LN</span><Seg options={[{ v: "o", t: "o-pol" }, { v: "e", t: "e-pol" }]} bind:value={f37.pol} label="Optical polarization" /></div>
  <div class="snd-ctl" style="border-top:0"><span class="lbl">Sound</span><Seg options={modeOpts} bind:value={f37.mode} label="Acoustic mode" /></div>
  <div class="snd-g2">
    <div class="snd-cell">
      <p class="snd-cap">wavevectors to scale: k<sub>in</sub> + K = k<sub>out</sub>, |k| = 2πn/λ₀, K = 2π/Λ</p>
      <svg class="snd-svg snd-sq" viewBox="0 0 320 170" role="img" aria-label="Wavevector triangle">
        {#if TR}
          <path class="c1" d="M160 20L{r1(TR.Ax)} {r1(TR.y)}" /><path class="c1" d="M160 20L{r1(TR.Bx)} {r1(TR.y)}" /><path class="c2" d="M{r1(TR.Ax)} {r1(TR.y)}L{r1(TR.Bx)} {r1(TR.y)}" />
          <circle class="mk" cx="160" cy="20" r="2.5" />
          <text class="lb" x={r1((160 + TR.Ax) / 2 - 8)} y={r1((20 + TR.y) / 2)} text-anchor="end">k_in</text><text class="lb" x={r1((160 + TR.Bx) / 2 + 8)} y={r1((20 + TR.y) / 2)}>k_out</text><text class="lb" x="160" y={r1(TR.y + 14)} text-anchor="middle">K</text>
        {:else}<text class="lb" x="160" y="90" text-anchor="middle">K &gt; 2k: no Bragg solution</text>{/if}
      </svg>
      <p class="snd-cap">K/k = {ro.Kk}</p>
    </div>
    <div class="snd-cell">
      <dl class="snd-kv" style="border-top:0">
        <dt>n ({f37.pol}), Zelmon 1997</dt><dd>{ro.n}</dd>
        <dt>v sound</dt><dd>{uf(md.v, 4, 1)} m/s</dd>
        <dt>Λ = v/f</dt><dd>{ro.L}</dd>
        <dt>θ<sub>B</sub> inside</dt><dd>{ro.ti}</dd>
        <dt>θ<sub>B</sub> in air</dt><dd>{ro.te}</dd>
        <dt>deflection 2θ<sub>B</sub>, air</dt><dd>{dg(2 * b.thetaExt_rad)}</dd>
        <dt>shift of the +1 order</dt><dd>{ro.df}</dd>
      </dl>
    </div>
  </div>
  <div class="ctl"><label for="f37-l">Wavelength λ₀</label><input id="f37-l" type="range" min="400" max="1700" step="1" bind:value={f37.lam_nm} /><output for="f37-l">{ro.lam}</output></div>
  <div class="ctl"><label for="f37-f">RF frequency f</label><input id="f37-f" type="range" min="7" max="9.69897" step="any" bind:value={f37.logf} /><output for="f37-f">{ro.f}</output></div>
  <div class="snd-note">Diffraction efficiency: not computed.</div>
  <div class="pf">geometry <Badge code="derived" pop="m-bragg" /> velocities: Kushibiki et al. 1999 constants <Badge code="derived" pop="m-christoffel" /> 128° Y-X SAW <Badge code="derived" pop="m-saw" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f37">
  <div class="snd-card">
    <h3>Crystal block, 200 µm wide</h3>
    <svg class="snd-vsvg" viewBox="0 0 600 300" role="img" aria-label="Acousto-optic cell with incident and diffracted beams">
      <rect x={BX} y={BY} width={BW} height={BH} class="lnf" />
      {#if stripes.dense}<rect x={BX} y={BY} width={BW} height={BH} fill="var(--v-text2)" fill-opacity="0.12" />
      {:else}{#each stripes.xs as x, i (i)}<rect x={r1(x)} y={BY} width={r1(Math.min(stripes.Lpx / 2, BX + BW - x))} height={BH} fill="var(--v-text2)" fill-opacity="0.16" />{/each}{/if}
      <path class="au" d="M{BX + 10} {BY + BH + 46}h50M{BX + 50} {BY + BH + 40}l10 6-10 6" /><text x={BX + 66} y={BY + BH + 50}>sound</text>
      <rect x={BX - 24} y={BY + 25} width="20" height="120" class="auf" />
      <text x={BX - 4} y={BY + BH + 50} text-anchor="end">transducer</text>
      <!-- incident beam from the lower left, at -theta from the vertical; diffracted at +theta; undiffracted continues -->
      <path d="M{r1(cx + 135 * Math.sin(ang))} {r1(cy + 135 * Math.cos(ang))}L{cx} {cy}" stroke={col} stroke-width="3" fill="none" stroke-dasharray={ir ? "7 5" : "none"} />
      <path d="M{cx} {cy}L{r1(cx - 135 * Math.sin(ang))} {r1(cy - 135 * Math.cos(ang))}" stroke={col} stroke-width="2" stroke-opacity="0.45" fill="none" stroke-dasharray={ir ? "7 5" : "none"} />
      <path d="M{cx} {cy}L{r1(cx + 135 * Math.sin(ang))} {r1(cy - 135 * Math.cos(ang))}" stroke={col} stroke-width="3" fill="none" stroke-dasharray={ir ? "7 5" : "none"} />
      <text x={r1(cx + 138 * Math.sin(ang) + 6)} y={r1(cy - 138 * Math.cos(ang) + 8)}>+1 order, optical frequency + f</text>
      <text x={r1(cx - 138 * Math.sin(ang) - 14)} y={r1(cy - 138 * Math.cos(ang) + 8)} text-anchor="end">0 order</text>
    </svg>
    <div class="snd-legend"><span><i style="background:{col}"></i>light: spectral color below 760 nm, false color and dashed above</span><span><i style="background:var(--v-text2);opacity:0.5"></i>compressed bands, spacing Λ to scale</span><span>beam angles: air values, not exaggerated</span></div>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>Bragg angle in air</h3>
      <div class="snd-big"><span class="snd-n" style="--nw:3.6em">{ro.te.replace("°", "")}</span><small>°</small></div>
      <dl class="snd-vhud"><dt>acoustic wavelength Λ</dt><dd>{ro.L}</dd><dt>light frequency shift</dt><dd>{ro.df}</dd><dt>inside the crystal</dt><dd>{ro.ti}</dd></dl>
    </div>
    <div class="v-ctl" style="--w:10ch"><label for="f37v-f">RF frequency</label><output for="f37v-f">{ro.f}</output><input id="f37v-f" type="range" min="7" max="9.69897" step="any" bind:value={f37.logf} oninput={onRf} /></div>
    <div class="v-ctl" style="--w:8ch"><label for="f37v-l">Light wavelength</label><output for="f37v-l">{ro.lam}</output><input id="f37v-l" type="range" min="400" max="1700" step="1" bind:value={f37.lam_nm} /></div>
    <div class="v-ctl"><span class="v-lab">Sound</span><Seg visual options={modeOpts} bind:value={f37.mode} label="Acoustic mode" /></div>
    <div class="v-ctl"><span class="v-lab">Polarization</span><Seg visual options={[{ v: "o", t: "Ordinary" }, { v: "e", t: "Extraordinary" }]} bind:value={f37.pol} label="Optical polarization" /></div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>geometry <Badge code="derived" pop="m-bragg" /></span><span>n = <span class="snd-n" style="width:4.2em">{ro.n} ({f37.pol})</span>, Zelmon et al. 1997 <Badge code="P-db" pop="r:zelmon1997" /></span><span>velocities: Kushibiki et al. 1999 constants <Badge code="derived" pop="m-christoffel" /> <Badge code="derived" pop="m-saw" /></span><span>diffraction efficiency not computed</span></div>
