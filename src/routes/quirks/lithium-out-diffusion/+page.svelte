<!-- Chapter 4.9 Lithium out-diffusion. Source: content/chapters/04-quirks/manuscript.md sec. 4.9, figures.md fig-04-10. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F10Outdiff from "$lib/figures/quirks/F10Outdiff.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f10-t": { h: "Out-diffusion model parameters", body: "No diffusion coefficient for Li<sub>2</sub>O out-diffusion under LNOI anneal conditions was found, so the depth axis is in units of &radic;(Dt) and the micrometre scale is a choice. The surface deficit is also a choice. erfc profile for a constant surface deficit.", badges: [["t", "template"]] },
    "d49": { h: "Composition derivatives", body: "Analytic derivative of the generalized Sellmeier (Volk &amp; W&ouml;hlecke Eqs. 6.9-6.10, Table 6.1; status S) at 48.38 mol% Li<sub>2</sub>O and 24.5 &deg;C.", badges: [["d", "derived"], ["s", "S"]] },
    "u49": { h: "Why +c inverts during Ti indiffusion", body: "Miyazawa 1979 discusses an explanation not stated in its abstract; the common attribution to Li<sub>2</sub>O out-diffusion is not verified here.", badges: [["u", "U"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Events and index model" l3="L3 Gaps and history">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">Li2O leaves the hot surface</span></div>
    <div class="body">
      <p class="tx">At the temperatures used for diffusion and annealing, lithium oxide leaves the surface (<span class="term" data-pop="g:li-out-diffusion">Li out-diffusion</span>; <Src id="carruthers1974" code="reported" text="reported (title)" />; <Src id="ranganath1977" code="reported" />). The lithium-poor skin has a higher extraordinary index than the crystal below, so it guides light: the 1973 "thin-film LiNbO<sub>3</sub>" modulator was such a skin, not a film (<Src id="kaminow1973" code="reported" />). The same loss became a problem when titanium was diffused in to make waveguides; <span class="term" data-pop="g:ti-indiffusion">Ti indiffusion</span> can also flip the ferroelectric domain at the +c surface (<Src id="miyazawa1979" code="reported" />); and lithium loss remains a question for every high-temperature anneal of thin films.</p>
      <F10Outdiff />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Events and index model">
    <div class="sh"><h2 class="biref">L2 Events and index model</h2><span class="meta">generalized Sellmeier</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Event or quantity</th><th>Value</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Out-diffused planar guide modulator</td><td class="q-w">broadband EO phase modulator; modulation index per volt 0.13 V<sup>&minus;1</sup>; base bandwidth 3.2 GHz (50 &Omega;); 0.2 mW/MHz for 1 rad</td><td class="q-s"><Src id="kaminow1973" code="reported" /></td></tr>
            <tr><td>Diffusion kinetics and waveguiding of out-diffused layers</td><td class="q-w">title-level</td><td class="q-s"><Src id="carruthers1974" code="reported" text="reported (title)" /></td></tr>
            <tr><td>Ti-indiffused waveguides</td><td class="q-w">Ti, V, Ni diffused into LN; single-mode guides within about 1 &micro;m of the surface</td><td class="q-s"><Src id="schmidt1974" code="reported" /></td></tr>
            <tr><td>Side effect of Ti indiffusion</td><td class="q-w">accompanying Li<sub>2</sub>O out-diffusion gives unwanted guided modes in y-cut; suppressed with Li<sub>2</sub>O</td><td class="q-s"><Src id="ranganath1977" code="reported" /></td></tr>
            <tr><td>Suppression by pre-anneal</td><td class="q-w">y-cut substrate annealed in Li<sub>2</sub>CO<sub>3</sub> powder, 600 &deg;C, 72 h, before Ti diffusion: single TE and TM modes, no out-diffusion modes at 632.8 nm</td><td class="q-s"><Src id="miyazawa1977" code="reported" /></td></tr>
            <tr><td>Li<sub>2</sub>O compensation in planar and channel guides</td><td class="q-w">title-level</td><td class="q-s"><Src id="burns1978" code="reported" text="reported (title)" /></td></tr>
            <tr><td>Domain inversion</td><td class="q-w">Ti diffusion on the +c face forms a surface layer with reversed polarization; none on the &minus;c face</td><td class="q-s"><Src id="miyazawa1979" code="reported" /></td></tr>
            <tr><td>Reversal undone by Li-rich vapor</td><td class="q-w">erasure of domain inversion in Ti:LN by Li-rich vapor transport (title)</td><td class="q-s"><Src id="hua2015" code="reported" text="reported (title)" /></td></tr>
            <tr><td>Annealed TFLN material Q</td><td class="q-w">about 1.6&times;10<sup>8</sup> (0.2 dB/m) after a post-fabrication anneal</td><td class="q-s"><Src id="shams2022" code="reported" /></td></tr>
            <tr><td>Hypothesis</td><td class="q-w">Li out-diffusion during anneals as one cause of higher coercive fields in thin films</td><td class="q-s"><Src id="zhu2021" code="S" text="S (hypothesis)" /></td></tr>
          </tbody>
        </table>
      </div>
      <h3 class="h3">Derived numbers <Badge code="derived" pop="d49" /></h3>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>dn<sub>e</sub>/d(mol% Li<sub>2</sub>O), 632.8 nm</td><td class="q-v">&minus;9.7&times;10<sup>&minus;3</sup> per mol%</td><td class="q-s"><Badge code="derived" pop="d49" /></td></tr>
            <tr><td>dn<sub>o</sub>/d(mol% Li<sub>2</sub>O), 632.8 nm</td><td class="q-v">+6.0&times;10<sup>&minus;4</sup> per mol%</td><td class="q-s"><Badge code="derived" pop="d49" /></td></tr>
            <tr><td>dn<sub>e</sub>/d(mol% Li<sub>2</sub>O), 1064 nm</td><td class="q-v">&minus;9.1&times;10<sup>&minus;3</sup> per mol%</td><td class="q-s"><Badge code="derived" pop="d49" /></td></tr>
            <tr><td>Curie temperature slope</td><td class="q-v">39.06-39.26 &deg;C per mol% Li<sub>2</sub>O</td><td class="q-s"><Src id="volk2008" loc="Eqs. 6.2-6.3 (Iyi 1992, Bordui 1992)" code="P-comp" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Loss of Li<sub>2</sub>O raises n<sub>e</sub> (about +10<sup>&minus;2</sup> per mol% lost) and slightly lowers n<sub>o</sub>, so a Li-depleted surface layer guides extraordinary light and not ordinary light, and has a locally lower <span class="term" data-pop="g:curie-temperature">Curie temperature</span>. These are predictions of the generalized Sellmeier, valid 400-1200 nm with about 2&times;10<sup>&minus;3</sup> accuracy.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Gaps and history">
    <div class="sh"><h2 class="biref">L3 Gaps and history</h2></div>
    <div class="body">
      <ul class="q-list">
        <li>Diffusion coefficient for Li<sub>2</sub>O out-diffusion under LNOI anneal conditions: none found. The figure's D is a template; the depth axis is in units of &radic;(Dt).</li>
        <li>Why the domain inverts on +c during Ti indiffusion: the common attribution to Li<sub>2</sub>O out-diffusion is unverified <Badge code="U" pop="u49" />.</li>
        <li>Bulk dark conduction is protonic, not Li<sup>+</sup> (Volk &amp; W&ouml;hlecke pp. 59-60; <a class="lk" href="/quirks/photorefraction/#l3">4.1 L3</a>). Out-diffusion is a high-temperature surface process, separate from room-temperature charge transport; no cited source links it to DC drift (<a class="lk" href="/quirks/dc-bias-drift/#l3">4.7 L3</a>).</li>
        <li>Out-diffused guides (1973-1974) preceded Ti indiffusion (1974) and proton exchange (1982); the Li<sub>2</sub>O compensation work of 1977-1978 is the earliest Li<sub>2</sub>O-compensation work found for LN integrated optics. The near-stoichiometric route (Li-rich vapor transport equilibration) runs the same chemistry in reverse.</li>
      </ul>
    </div>
  </section>
</QSection>
