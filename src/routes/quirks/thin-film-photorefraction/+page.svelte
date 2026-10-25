<!-- Chapter 4.3 Photorefraction in thin films. Source: content/chapters/04-quirks/manuscript.md sec. 4.3, figures.md fig-04-04. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import F04Ring from "$lib/figures/quirks/F04Ring.svelte";
  import { RING_POPS } from "$lib/figures/quirks/pops-ring";

  let { data }: { data: PageData } = $props();
</script>

<QSection {data} pops={RING_POPS} l2="L2 Observations and ring model" l3="L3 Time scales and measurement">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">TFLN microrings</span></div>
    <div class="body">
      <p class="tx">In a thin-film ring the light is confined to a sub-micron film and builds up by circulating, and photorefraction responds fast (Jiang et al. 2017 <Src id="jiang2017" code="reported" text="reported (title)" cite={false} />). It shifts a ring's resonance to shorter wavelength as power rises, opposite to the heating shift. It can hold a written shift for hours, which is a nuisance for a frequency reference and a tool for trimming.</p>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Observations and ring model">
    <div class="sh"><h2 class="biref">L2 Observations and ring model</h2><span class="meta">reported results; template model</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Observation</th><th>Value</th><th>Platform</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Fast photorefractive response</td><td class="q-w">title-level claim</td><td class="q-w">LN microresonators</td><td class="q-s"><Src id="jiang2017" code="reported" text="reported (title)" /></td></tr>
            <tr><td>Photorefractive tuning rate</td><td class="q-w">0.64 GHz/aJ (84 MHz per photon); Q up to 10<sup>5</sup>; quenching of photorefraction observed</td><td class="q-w">LN photonic-crystal nanobeam</td><td class="q-s"><Src id="liang2017" code="reported" text="reported (arXiv abstract)" /></td></tr>
            <tr><td>Cladding dependence</td><td class="q-w">removing the dielectric cladding mitigates photorefraction</td><td class="q-w">TFLN microrings</td><td class="q-s"><Src id="xu2021oe" code="reported" /></td></tr>
            <tr><td>Cryogenic Bragg scattering</td><td class="q-w">a strongly excited mode imprints a long-lived periodic space-charge field; reconfigurable mode splitting</td><td class="q-w">TFLN rings, cryogenic</td><td class="q-s"><Src id="xu2021ol" code="reported" /></td></tr>
            <tr><td>Memory</td><td class="q-w">recovery time &gt; 10 h after light excitation and temperature change; strong dependence on film orientation; used for optical trimming</td><td class="q-w">z-cut TFLN microresonators</td><td class="q-s"><Src id="ren2025" code="reported" text="reported (arXiv abstract)" /></td></tr>
            <tr><td>Subwavelength grating</td><td class="q-w">standing-wave pump writes a photorefractive grating; mode splitting; first-order QPM for backward SHG</td><td class="q-w">TFLN microcavity</td><td class="q-s"><Src id="hou2024" code="reported" /></td></tr>
            <tr><td>Sign</td><td class="q-w">photorefractive index change opposite to Kerr and thermal; enables turnkey soliton generation (numerical, ordinary polarization)</td><td class="q-w">TFLN rings</td><td class="q-s"><Src id="lin2021" code="reported" /></td></tr>
            <tr><td>Self-starting soliton</td><td class="q-w">photorefraction lets soliton mode locking self-start and switch bi-directionally</td><td class="q-w">LN microresonator</td><td class="q-s"><Src id="he2019" code="reported" text="reported (arXiv abstract)" /></td></tr>
            <tr><td>Doped thin films</td><td class="q-w">in-diffused Zn (4.0 mol% surface) and Zr (1.1 mol%) raise photorefractive damage resistance up to 100&times; vs undoped TFLN; 600 nm z-cut planar guides</td><td class="q-w">TFLN</td><td class="q-s"><Src id="suntsov2026" code="reported" /></td></tr>
            <tr><td>Waveguide management</td><td class="q-w">high-temperature operation raises the damage threshold; at cryogenic temperature an auxiliary co-propagating light restores phase-matching spectra and reduces pyroelectric effects</td><td class="q-w">LN waveguides (SFG)</td><td class="q-s"><Src id="lange2026" code="reported" /></td></tr>
            <tr><td>Power ceiling for SHG</td><td class="q-w">LN damage threshold, even MgO-doped, keeps TFLN SH output well below 1 W; PPLT reaches &gt; 1 W SH at 775 nm (4.5 W pump, 7 mm)</td><td class="q-w">TFLN vs thin-film LiTaO<sub>3</sub></td><td class="q-s"><Src id="kuznetsov2025" code="reported" text="reported (preprint)" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Ring model: intracavity energy U from coupled-mode theory; detuning &Delta;(t) = &Delta;<sub>0</sub> + g<sub>th</sub>T<sub>c</sub>(t) + g<sub>pr</sub>E<sub>sc</sub>(t). T<sub>c</sub> relaxes with &tau;<sub>th</sub> toward a value proportional to absorbed power; E<sub>sc</sub> relaxes with &tau;<sub>pr</sub> = &epsilon;&epsilon;<sub>0</sub>/(&sigma;<sub>d</sub> + &kappa;I), I the intracavity intensity, toward a value of opposite sign. g<sub>th</sub> uses dn/dT (<a class="lk" href="/quirks/thermal-effects/">4.8</a>); g<sub>pr</sub>, &tau;<sub>th</sub>, &kappa; and absorption are templates. The figure shows the qualitative competition, not a fit to any device.</p>
      <F04Ring preset="pr" />
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Time scales and measurement">
    <div class="sh"><h2 class="biref">L3 Time scales and measurement</h2><span class="meta">thin-film conductivities: no measurement found</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Time scale: the photoconductive relaxation time scales as 1/(&kappa;I), so resonant build-up of intensity shortens it; cladding changes the effect (Xu et al. 2021 <Src id="xu2021oe" code="reported" cite={false} />). No measured thin-film dark or photoconductivity was found; the model treats both as templates.</li>
        <li>Measurement: power-dependent resonance position at slow and fast sweep, pump-probe on two modes, or time-resolved transmission after a power step. Thermal and photorefractive shifts separate by sign and time constant.</li>
        <li>Error sources: films from ion slicing differ in hydrogen and defect content from bulk; anneal history matters (anneals change material loss, Shams-Ansari et al. 2022 <Src id="shams2022" code="reported" cite={false} />); results do not transfer between foundries without measurement.</li>
      </ul>
    </div>
  </section>
</QSection>
