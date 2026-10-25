<!-- Chapter 3.7 GHz phononics and piezo-optomechanics on thin-film LN (manuscript sec. 3.7; figures F3.9-F3.11). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F39 from "$lib/figures/sound/F39Chain.svelte";
  import F310 from "$lib/figures/sound/F310Herald.svelte";
  import F311 from "$lib/figures/sound/F311Bender.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import { exS } from "$lib/figures/sound/f";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  onMount(() => mountSound());
  const S = $derived(data.scales);
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.7" }]} title="3.7 GHz phononics and piezo-optomechanics"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Platforms and results" }, { id: "l3", label: "L3 Bookkeeping and limits" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">microwave → phonon → photon</span></div>
    <div class="body">
      <p class="tx">In <span class="term" data-pop="g:tfln">thin-film LN</span>, sound and light can be confined in the same wavelength-scale structure. At 2 GHz the acoustic wavelength in LN is about 2 &micro;m ({S.v128.toFixed(0)} m/s / 2 GHz = {S.lamA.toFixed(2)} &micro;m <Badge code="derived" pop="m-saw" />), comparable to the {S.lamO.toFixed(2)} &micro;m wavelength of 1550 nm light inside the crystal (1550 nm / n<sub>o</sub>, n<sub>o</sub> = {S.no.toFixed(3)} <Badge code="P-db" pop="r:zelmon1997" />): a nanostructured beam can trap both and let a single phonon modulate the light. Because LN is also piezoelectric, electrodes on the same chip couple that phonon to a microwave circuit. The result is a chain microwave &rarr; phonon &rarr; photon (<span class="term" data-pop="g:piezo-optomechanics">piezo-optomechanics</span>), which is how superconducting quantum processors operating at GHz can be connected to optical fibers (<span class="term" data-pop="g:microwave-to-optical-transduction">microwave-to-optical transduction</span>).</p>
      <p class="tx">Raise the pump on the blue side: the efficiency climbs past 5% and diverges at C = 1 (phonon lasing); on the red side it peaks at the external efficiency at C = 1 and then falls. The microwave-to-phonon stage (&eta;<sub>m</sub> about 0.1%) is the smallest factor.</p>
      <F39 />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Platforms and results">
    <div class="sh"><h2 class="biref">L2 Scales, platforms, the transduction model</h2></div>
    <div class="body">
      <p class="tx"><b>Scales.</b> A 2 GHz phonon carries hf = {S.Eph.toFixed(1)} &micro;eV; a 1550 nm photon carries {S.Eopt.toFixed(2)} eV, about 10<sup>5</sup> times more. Thermal occupation n = 1/(exp(hf/k<sub>B</sub>T) &minus; 1) of a 2 GHz mode is about {exS(S.n300, 1)} at 300 K and {exS(S.n10, 1)} at 10 mK <Badge code="derived" pop="m-calc" />.</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Device</th><th>Platform</th><th>Key numbers (reported)</th></tr></thead>
          <tbody>
            <tr><td class="h">Piezo-optomechanical crystal (Jiang et al. 2019, Optica) <Badge code="reported" pop="r:p03" /></td><td>suspended TFLN photonic-crystal nanobeam with electrodes</td><td>g<sub>0</sub>/2&pi; &asymp; 120 kHz; <span class="term" data-pop="g:cooperativity">cooperativity</span> C &gt; 1 with phonon lasing; microwave-to-mechanics quantum efficiency &asymp; 10<sup>&minus;8</sup>; phononic bandgap observed by piezoelectric drive and optical readout</td></tr>
            <tr><td class="h">Bidirectional piezo-optomechanical transducer (Jiang et al. 2020, Nat. Commun.) <Badge code="reported" pop="r:p05" /></td><td>all-LN suspended film: IDT, horn taper (SH2 to L1), 1.3 &micro;m waveguide, <span class="term" data-pop="g:piezo-optomechanics">optomechanical crystal</span>; room temperature</td><td>f<sub>m</sub> = 1.85 GHz; g<sub>0</sub>/2&pi; = 70 kHz (backaction), 84 kHz (from C<sub>0</sub>); loaded optical Q 1.6&times;10<sup>5</sup>; IDT 1.9 mS, 3.36 MHz; acousto-optic V<sub>&pi;</sub> = 0.02 V; efficiency 10<sup>&minus;5</sup> at 3.3 &micro;W red-detuned, 5.5% at 323 &micro;W blue-detuned (internal gain &asymp; 21 dB); C<sub>0</sub> = 1.2&times;10<sup>&minus;5</sup>, &eta;<sub>e</sub> = 4.24&times;10<sup>&minus;4</sup>, &eta;<sub>m</sub> = 9.9&times;10<sup>&minus;4</sup></td></tr>
            <tr><td class="h">Wavelength-scale waveguide transducer (Dahmani et al. 2020, PR Applied) <Badge code="reported" pop="r:p06" /></td><td>suspended TFLN, 1 &micro;m waveguide</td><td>1.7 GHz; &minus;12 dB conversion, limited by material loss</td></tr>
            <tr><td class="h"><span class="term" data-pop="g:nanobender">Nanobenders</span> (Jiang et al. 2020, Commun. Phys.) <Badge code="reported" pop="r:p07" /></td><td>piezoelectric bending beams driving a sliced photonic-crystal cavity</td><td>0.01 nm/V standard vs tens of nm/V for nanobenders; (0.01 nm/V) R&sup2;U scaling (Eq. 1); &asymp; 5 nm/V (0.6 THz/V) small-signal at |U| &lt; 0.5 V; 1520 to 1560 nm (&asymp; 400 linewidths) within 4 V</td></tr>
            <tr><td class="h">GHz phononic integrated circuits (Mayor et al. 2021, PR Applied) <Badge code="reported" pop="r:p09" /></td><td>TFLN on sapphire, no suspension (<span class="term" data-pop="g:phononic-index-guiding">index guiding</span>)</td><td>50 &Omega; matched transducer; 1 &micro;m waveguides; delay lines, racetrack resonators, meanders; Q &asymp; 50,000 at 4 K; phononic four-wave mixing</td></tr>
            <tr><td class="h">Optically heralded microwave photon addition (Jiang et al. 2023, Nat. Phys.) <Badge code="reported" pop="r:p17" /></td><td>290 nm X-cut MgO:LN transfer-printed on 220 nm SOI (Si optomechanical crystal + LN piezo), NbTiN microwave chip, &lt; 10 mK</td><td>5% continuous conversion (4.9 &plusmn; 0.5%); 15 Hz heralding; thermal noise &lt; 2 microwave photons; f<sub>m</sub> &asymp; 3.6 GHz; g<sub>0</sub>/2&pi; &asymp; 410 kHz</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Numbers from arXiv versions (abstract or v1 text); journal versions may differ in the last digit.</p>
      <div class="eq"><math display="block"><mrow><msub><mi>&eta;</mi><mtext>total</mtext></msub><mo>=</mo><msub><mi>&eta;</mi><mtext>oc</mtext></msub><msub><mi>&eta;</mi><mtext>o</mtext></msub><msub><mi>&eta;</mi><mtext>m</mtext></msub><mfrac><mrow><mn>4</mn><mi>C</mi></mrow><msup><mrow><mo>(</mo><mn>1</mn><mo>&plusmn;</mo><mi>C</mi><mo>)</mo></mrow><mn>2</mn></msup></mfrac><mo>,</mo><mspace width="1em"/><mi>C</mi><mo>=</mo><msub><mi>C</mi><mn>0</mn></msub><msub><mi>n</mi><mi>c</mi></msub><mo>,</mo><mspace width="1em"/><msub><mi>C</mi><mn>0</mn></msub><mo>=</mo><mfrac><mrow><mn>4</mn><msubsup><mi>g</mi><mn>0</mn><mn>2</mn></msubsup></mrow><mrow><mi>&kappa;</mi><mi>&gamma;</mi></mrow></mfrac></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">Model of the transduction figure (Jiang et al. 2020, Eq. 4 and App. A <Badge code="reported" pop="r:p05" />) at pump detuning &Delta; = &plusmn;&omega;<sub>m</sub>: + for a red-detuned pump (beam-splitter interaction; ideal conversion at C = 1), &minus; for a blue-detuned pump (two-mode squeezing; gain diverges at C = 1, phonon lasing). &eta;<sub>oc</sub> = 65.2 &plusmn; 0.4% (fiber-to-chip), &eta;<sub>o</sub> = &kappa;<sub>e</sub>/&kappa; = 66 &plusmn; 1%.</p>
      <p class="tx"><b><span class="term" data-pop="g:heralded-microwave-photon">Heralding</span>.</b> Step through the published protocol: detecting one optical photon adds exactly one photon to the microwave resonator.</p>
      <F310 />
      <p class="tx"><b>Nanobenders.</b> Stretch the beam tenfold and the bender's displacement grows a hundredfold while the plain plate does not move more: geometry, not material, supplies the gain.</p>
      <F311 d22={data.d22} d15={data.d15} />
      <p class="tx"><b>Other groups.</b> Microwave-to-optical conversion with thin-film LN acoustic resonators (Shao et al. 2019 <Badge code="reported" pop="r:shao2019" />; room temperature, up to 4.5 GHz); an integrated LN-on-Si microwave-to-optics interface reaching 0.9% at 1 &micro;W (Weaver et al. 2024 <Badge code="reported" pop="r:weaver2024" />). Same lab, quantum acoustics: phonon-number resolution with a qubit coupled to LN phononic-crystal resonators (Arrangoiz-Arriola et al. 2018, 2019 <Badge code="S" pop="r:arrangoiz2018" /> <Badge code="S" pop="r:p04" />), entangled mechanical resonators (Wollack et al. 2022 <Badge code="S" pop="r:wollack2022" />), loss channels of LN phononic-crystal resonators at mK (Wollack et al. 2021 <Badge code="S" pop="r:p11" />); a perspective on integrated phononics (Safavi-Naeini et al. 2019 <Badge code="S" pop="r:safavinaeini2019" />).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Bookkeeping and limits">
    <div class="sh"><h2 class="biref">L3 Coupling, bookkeeping, material limits</h2></div>
    <div class="body">
      <p class="tx"><b>Optomechanical coupling.</b> <span class="term" data-pop="g:vacuum-optomechanical-coupling-rate">g<sub>0</sub></span> in LN combines photoelastic and moving-boundary terms; the photoelastic term depends on in-plane orientation through the rotated p tensor (<a class="lk" href="/sound/acousto-optics/#l3">3.6 L3</a>), with the optimum stated for X-cut by Jiang et al. 2019 in that paper's own in-plane angle convention, which is not mapped to the convention used here; the X-cut optimum also inherits the unresolved p<sub>14</sub>/p<sub>41</sub> sign pairing.</p>
      <p class="tx"><b>Efficiency bookkeeping.</b> Total = optical coupling &times; optical external ratio &times; microwave-to-mechanics &times; internal optomechanical term; in the Jiang et al. 2020 transducer the microwave-to-mechanics factor (&eta;<sub>m</sub> &asymp; 0.1%) dominates the loss. The &ldquo;what if&rdquo; sliders of the transduction figure move C<sub>0</sub> and &eta;<sub>m</sub> by up to a decade.</p>
      <p class="tx"><b>Material limits named by the papers.</b> Optical absorption heating the mechanics at mK (Jiang et al. 2023: added thermal noise), two-level-system and other loss channels in LN phononic crystals at cryogenic temperature (Wollack et al. 2021), material loss limiting waveguide transduction (Dahmani et al. 2020).</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.7</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
