<!-- Chapter 3.5 IDTs and SAW filters (manuscript sec. 3.5; figure F3.6). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F36 from "$lib/figures/sound/F36Idt.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  onMount(() => mountSound());
  const v128 = $derived(data.cuts[0].open);
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.5" }]} title="3.5 IDTs and SAW filters"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Transducer and filters" }, { id: "l3", label: "L3 Models" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2></div>
    <div class="body">
      <p class="tx">An <span class="term" data-pop="g:idt">interdigital transducer</span> (IDT) is a pair of interleaved metal combs on the crystal. A voltage across the combs strains the surface under every finger gap; the ripples add up only at the frequency whose wavelength equals the comb period, so the comb is both a launcher and a filter. Two combs facing each other make a delay line; resonators and ladders of them make many of the radio filters in phones, which carried more than 50 acoustic filters (SAW and <span class="term" data-pop="g:baw">BAW</span>) per mid- and high-tier 4G phone in 2018, with more than 70 expected with 5G (vendor contribution in trade press, 2018 <Badge code="V" pop="r:mwj-2018-filters" />).</p>
      <p class="tx">Doubling N halves the bandwidth: the ripples from many gaps add in phase only at f<sub>0</sub>. Detune the test tone by f<sub>0</sub>/N and watch them cancel.</p>
      <F36 cuts={data.cuts} />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Transducer and filters">
    <div class="sh"><h2 class="biref">L2 Synchronous frequency, bandwidth, substrates</h2><span class="meta">delta-function model; LN vs LT</span></div>
    <div class="body">
      <p class="tx"><b>Invention.</b> White and Voltmer launched surface elastic waves with an interdigital transducer in 1965 (White &amp; Voltmer 1965 <Badge code="S" pop="r:white1965" />); the device had aluminum electrodes on a quartz bar, not LN (same-title Berkeley memorandum <Badge code="P" pop="r:white1965-erl" />). Elastic wave propagation in LN was reported the same year (Spencer et al. 1965 <Badge code="S" pop="r:spencer1965" />).</p>
      <div class="eq"><math display="block"><mrow><msub><mi>f</mi><mn>0</mn></msub><mo>=</mo><mfrac><mi>v</mi><mi>p</mi></mfrac><mo>,</mo><mspace width="1.4em"/><mi>H</mi><mo>(</mo><mi>f</mi><mo>)</mo><mo>=</mo><mfrac><mrow><mi>sin</mi><mi>X</mi></mrow><mrow><mi>N</mi><mi>sin</mi><mo>(</mo><mi>X</mi><mo>/</mo><mi>N</mi><mo>)</mo></mrow></mfrac><mo>,</mo><mspace width="0.6em"/><mi>X</mi><mo>=</mo><mi>N</mi><mi>&pi;</mi><mfrac><mrow><mi>f</mi><mo>&minus;</mo><msub><mi>f</mi><mn>0</mn></msub></mrow><msub><mi>f</mi><mn>0</mn></msub></mfrac><mo>,</mo><mspace width="1.4em"/><mfrac><mrow><msub><mi>G</mi><mi>a</mi></msub><mo>(</mo><mi>f</mi><mo>)</mo></mrow><mrow><msub><mi>G</mi><mi>a</mi></msub><mo>(</mo><msub><mi>f</mi><mn>0</mn></msub><mo>)</mo></mrow></mfrac><mo>=</mo><msup><mrow><mo>(</mo><mfrac><mrow><mi>sin</mi><mi>X</mi></mrow><mi>X</mi></mfrac><mo>)</mo></mrow><mn>2</mn></msup></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">p is the electrode period (one finger pair). On 128&deg; Y-X (v<sub>free</sub> = {v128.toFixed(1)} m/s <Badge code="derived" pop="m-saw" />): p = 4 &micro;m gives f<sub>0</sub> = {(v128 / 4).toFixed(1)} MHz; a 2 GHz filter needs p = {(v128 / 2000).toFixed(3)} &micro;m, i.e. {(v128 / 8000).toFixed(2)} &micro;m fingers at <span class="term" data-pop="g:metallization-ratio">metallization ratio</span> 0.5 <Badge code="derived" pop="m-idt" />. In the delta-function model (Smith et al. 1969 equivalent-circuit lineage) an N-pair uniform IDT has a radiation conductance with a sinc&sup2; shape, so the fractional bandwidth between first nulls is 2/N. The shape is the textbook result; the absolute prefactor in terms of k&sup2;, the capacitance per pair and the aperture is not shown.</p>
      <p class="tx"><b>Measured TFLN example.</b> An IDT on suspended TFLN with 1.9 mS peak conductance and 3.36 MHz bandwidth, matched to 50 &Omega; at 1.85 GHz (Jiang et al. 2020, arXiv v1 <Badge code="reported" pop="r:p05" />).</p>

      <h3 class="h3">LN vs LT in phones</h3>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Item</th><th>Statement</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Substrates</td><td>SAW filters use rotated Y LT (36 to 50&deg;) or 128&deg; Y LN</td><td class="r"><Badge code="P" pop="r:smm-ln-lt" /></td></tr>
            <tr><td class="h">Suppliers</td><td>Sumitomo Metal Mining lists both LT and LN SAW wafers</td><td class="r"><Badge code="P" pop="r:smm-ln-lt" /></td></tr>
            <tr><td class="h">Market share in SAW</td><td>no public quantitative source found</td><td class="r">N/A</td></tr>
            <tr><td class="h">Coupling</td><td>LN leaky waves reach 10 to 16% (64 and 41&deg; in <a class="lk" href="/sound/surface-waves/">3.3</a>). LT coupling is not computed: of the LT constants only c<sub>14</sub> = &minus;10.75 GPa (Kushibiki et al. 1999) is available here</td><td class="r"><Badge code="derived" pop="m-saw" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx"><b><span class="term" data-pop="g:poi">POI</span> substrates.</b> Soitec Connect POI, a thin LT or LN layer by Smart Cut on buried oxide on silicon: LT6-MHB, LT6-LB, LN6 at 150 mm; LT8-MHB, LT8-LB at 200 mm; for 5G, GNSS, Wi-Fi coexistence (Soitec product page <Badge code="P" pop="r:soitec-poi" />). In 2020 Soitec announced volume POI supply (300 nm to 1 &micro;m LT on oxide on high-resistivity Si) for Qualcomm RF filters (trade press <Badge code="S" pop="r:eenews-2020-soitec-qualcomm" />).</p>
      <p class="tx"><b>XBAR on thin LN.</b> First report 2019 (Plessky et al. 2019 <Badge code="reported" pop="r:plessky2019" />); Murata completed its acquisition of Resonant Inc., the developer of XBAR, on 2022-03-28 (Murata release <Badge code="P" pop="r:murata-2022" />).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Models">
    <div class="sh"><h2 class="biref">L3 Design models and what is not modelled</h2><span class="meta">equivalent circuit, coupling of modes</span></div>
    <div class="body">
      <p class="tx">The equivalent-circuit and coupling-of-modes models (Smith et al. 1969 <Badge code="S" pop="r:smith1969" />; Hashimoto 2000 <Badge code="S" pop="r:hashimoto2000" />) are the standard design tools. The figure uses only the normalized array factor and f<sub>0</sub> = v/p; absolute admittance needs the prefactor, not computed here.</p>
      <p class="tx">Second-order effects not modelled: electrode mass loading and reflection (velocity shift with metal thickness), bulk-wave radiation, diffraction for small apertures, and triple-transit echoes. The array-factor form above has a grating lobe at 2f<sub>0</sub>; a finger-resolved form is needed beyond about 1.5 f<sub>0</sub> (the plot stays within 0.8 to 1.2 f<sub>0</sub>).</p>
      <p class="tx">Velocities in the figure are the partial-wave results for the free or the metallized surface (selectable in both views); a real IDT region is partly metallized (ratio &eta;), so the true synchronous frequency lies between the two values.</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.5</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
