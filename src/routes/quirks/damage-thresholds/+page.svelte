<!-- Chapter 4.5 Optical damage thresholds. Source: content/chapters/04-quirks/manuscript.md sec. 4.5, figures.md fig-04-06. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F06Ladder from "$lib/figures/quirks/F06Ladder.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f6-vend": { h: "Vendor laser damage thresholds", body: "100 to 300 MW/cm<sup>2</sup> at 10 ns and 1064 nm for CLN and MgO:PPLN, as printed by crystal vendors. No traceable measurement conditions; not a material constant.", badges: [["v", "V"]] },
  };
</script>

<QSection {data} {pops} l2="L2 The ladder" l3="L3 Scatter and units">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">three meanings of damage</span></div>
    <div class="body">
      <p class="tx">Damage in lithium niobate means three different things at three intensity scales. <a class="lk" href="/quirks/photorefraction/">Photorefraction</a> distorts a beam, in Fe-doped crystals already at 10 mW/cm<sup>2</sup>, and can be erased. Light-induced coloring appears under strong pulses: <a class="lk" href="/quirks/griira/">GRIIRA</a> vanishes when the green light stops; the gray track is stable in congruent crystals until erased by light or heat. Laser-induced breakdown, in the GW/cm<sup>2</sup> range for nanosecond pulses, is permanent physical destruction.</p>
      <F06Ladder />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 The ladder">
    <div class="sh"><h2 class="biref">L2 The ladder</h2></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Regime</th><th>Value</th><th>Conditions</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Photorefraction onset</td><td class="q-v">10 mW/cm<sup>2</sup>, no threshold</td><td class="q-w">cw blue-green, LiNbO<sub>3</sub>:Fe</td><td class="q-s"><Src id="volk2008" loc="p. 52" code="P-comp" /></td></tr>
            <tr><td>Photorefractive damage threshold, CLN</td><td class="q-v">1 kW/cm<sup>2</sup></td><td class="q-w">cw green, 10 min</td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>Photorefractive damage threshold, CLN:6% MgO and NSLN:1.8% MgO</td><td class="q-v">&gt; 8 MW/cm<sup>2</sup></td><td class="q-w">cw green, 10 min</td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>GRIIRA, measurement condition</td><td class="q-v">2.5 kW/cm<sup>2</sup></td><td class="q-w">cw 532 nm pump; IR absorption vanishes when the pump stops</td><td class="q-s"><Src id="volk2008" loc="Fig. 4.14, p. 96" code="P-comp" /></td></tr>
            <tr><td>Coloration (gray or dark trace)</td><td class="q-v">about 100 MW/cm<sup>2</sup></td><td class="q-w">pulsed, after repeated pulses</td><td class="q-s"><Src id="volk2008" loc="p. 51" code="P-comp" /></td></tr>
            <tr><td>Laser-induced breakdown</td><td class="q-v">GW/cm<sup>2</sup> range</td><td class="q-w">pulsed, 1064 nm, pulse-length dependent</td><td class="q-s"><Src id="volk2008" loc="p. 51" code="P-comp" /></td></tr>
            <tr><td>Bulk laser damage fluence, 1 mol% MgO:LN</td><td class="q-v">14 J/cm<sup>2</sup></td><td class="q-w">1.053 &micro;m, 1 ns</td><td class="q-s"><Src id="furukawa1991" code="reported" /></td></tr>
            <tr><td>Vendor laser damage thresholds</td><td class="q-v">100-300 MW/cm<sup>2</sup></td><td class="q-w">10 ns, 1064 nm; not a material constant</td><td class="q-s"><span class="q-src">vendor data sheets</span> <Badge code="V" pop="f6-vend" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="q-flag"><b>Conflict.</b> The laser damage fluence is 14 J/cm<sup>2</sup> in the Furukawa 1991 abstract and 14.6 J/cm<sup>2</sup> in Volk &amp; W&ouml;hlecke p. 51; the abstract value is used.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Scatter and units">
    <div class="sh"><h2 class="biref">L3 Scatter and units</h2><span class="meta">surface, bulk, pulse shape</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Breakdown thresholds scatter because surface and bulk damage differ and depend on polishing and defects; measured values are often far below literature values (p. 51 <Src id="volk2008" code="P-comp" cite={false} />).</li>
        <li>Intensity (W/cm<sup>2</sup>) and fluence (J/cm<sup>2</sup>) are not interchangeable without the pulse shape; the ladder keeps them on separate axes.</li>
        <li>Vendor thresholds lack traceable measurement conditions.</li>
        <li>Photorefractive thresholds are operational (beam distortion after a stated time) and depend on beam size and observation time (<a class="lk" href="/quirks/mgo-doping/#l3">4.2 L3</a>).</li>
      </ul>
    </div>
  </section>
</QSection>
