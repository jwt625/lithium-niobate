<!-- Chapter 4.10 Fabrication pitfalls. Source: content/chapters/04-quirks/manuscript.md sec. 4.10, figures.md fig-04-11.
     Practitioner notes are cited neutrally (kind and date, no author or title in running text); no author images
     (DevLog-004a Q6-Q7 open). -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F11Pitfalls from "$lib/figures/quirks/F11Pitfalls.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f11-d": { h: "Bake voltage", body: "Unscreened z-cut plate of 4.6: V = |p3| &Delta;T d / (&epsilon;<sub>33</sub>&epsilon;<sub>0</sub>) with &Delta;T = 95 K, d = 0.5 mm, &epsilon;<sub>33</sub> = 28.7; the range spans the p3 spread 4.0 to 9.5&times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K): <span class='v'>7.5 to 17.8 kV</span>. Real wafers discharge before reaching it.", badges: [["d", "derived"]] },
    "f11-u": { h: "Unverified specifics", body: "The inter-chip discharge at 4 K and the released-structure collapse are single practitioner observations; the post cites social-media posts for related examples. Mechanisms there are hypotheses.", badges: [["u", "U"]] },
    "u-zep": { h: "Resist exposure on heated z-cut", body: "Claim in a practitioner note: heating z-cut LN to 120 &deg;C could expose ZEP resist, attributed there to &quot;Mostafa et al. 2006&quot; (very likely Bourim et al. 2006, pyroelectric electron emission). Whether that paper mentions resist exposure was not checked.", badges: [["u", "U"]] },
    "u-hal": { h: "Li and halogen volatiles", body: "Claim in a practitioner note: Li does not form volatile compounds with Br or Cl. No chemistry source was checked.", badges: [["u", "U"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Notes and mechanisms" l3="L3 Limits of the notes">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">habits that work on silicon</span></div>
    <div class="body">
      <p class="tx">Fabrication habits that work on silicon fail on lithium niobate. It is an insulator that charges under electron beams, a pyroelectric that charges on a hotplate, and a crystal whose two polar faces etch at different rates. Source: public practitioner notes (2018-2025); mechanism and primary source added where one exists.</p>
      <F11Pitfalls />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Notes and mechanisms">
    <div class="sh"><h2 class="biref">L2 Notes and mechanisms</h2></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>#</th><th>Pitfall (note date)</th><th>Mechanism and number</th><th>Fix in the note</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>1</td><td class="q-w">Hotplate bakes fry devices or crack the whole substrate; worse on z-cut (2025-12-29)</td><td class="q-w">pyroelectric charge; a 95 K step gives 7.5-17.8 kV across a 0.5 mm z-cut wafer, unscreened (<a class="lk" href="/quirks/pyroelectricity/#l2">4.6</a>)</td><td class="q-w">conductive coating or aluminum-foil wrap as a discharge path</td><td class="q-s"><Src id="blog-ofs79" code="reported" text="practitioner" cite={false} /> <Badge code="derived" pop="f11-d" /></td></tr>
            <tr><td>2</td><td class="q-w">1980s z-cut channel-waveguide interferometers drift more than x-cut (2025-12-29)</td><td class="q-w">z-cut pyroelectric instability</td><td class="q-w">x-cut layout</td><td class="q-s"><Src id="bulmer1986" code="reported" /></td></tr>
            <tr><td>3</td><td class="q-w">During a 4 K cooldown an LN chip's field damaged a device on another chip; shielding electrodes protected the neighbor; interdigital transducers on the LN chip still failed (2025-12-29)</td><td class="q-w">pyroelectric charge on cooling</td><td class="q-w">shielding electrodes</td><td class="q-s"><Src id="blog-ofs79" code="reported" text="practitioner" cite={false} /> <Badge code="U" pop="f11-u" text="U (specifics)" /></td></tr>
            <tr><td>4</td><td class="q-w">Released x-cut TFLN structures on Si collapsed during 4 K cooldowns after a change of wafer (2025-12-29)</td><td class="q-w">hypothesis in the note: pyroelectric charge plus electrostatic pull-in; CTE mismatch ruled out because the onset was sudden</td><td class="q-w">Al electrodes shorting LN parts to the Si substrate; collapse stopped</td><td class="q-s"><Src id="blog-ofs79" code="reported" text="practitioner" cite={false} /> <Badge code="U" pop="f11-u" text="hypothesis" /></td></tr>
            <tr><td>5</td><td class="q-w">Heating z-cut LN to 120 &deg;C could expose resist (2018)</td><td class="q-w">pyroelectric electron emission from the polar face (<Src id="bourim2006" code="reported" text="reported (title)" />)</td><td></td><td class="q-s"><Badge code="U" pop="u-zep" /></td></tr>
            <tr><td>6</td><td class="q-w">Electron-beam lithography on LN needs a discharge layer; 5-10 nm Al preferred; a 5 nm Ti layer once cross-linked the top of the resist because it ran too hot; the clamp must contact the discharge layer (2024-10-13)</td><td class="q-w">charging of an insulating substrate</td><td class="q-w">thin low-melting-point metal (Al), removed in an alkaline resist developer</td><td class="q-s"><Src id="blog-ebl-2024" code="reported" text="practitioner" cite={false} /></td></tr>
            <tr><td>7</td><td class="q-w">a-Si hard mask on oxide over y-cut TFLN cracked and etched non-uniformly under Ar<sup>+</sup> milling; cracks transferred to LN edges; the mask ran out before LN was etched through (2018-08-20)</td><td class="q-w">film stress and fragile mask edges; films grown on LN may differ from the same films on Si (the note's hypothesis)</td><td class="q-w">lower mill angle tried; conclusion: mask poor and fragile near edges</td><td class="q-s"><Src id="blog-hardmask-2018" code="reported" text="practitioner" cite={false} /></td></tr>
            <tr><td>8</td><td class="q-w">HF clean: post-HF SEM of a y-cut nanobeam shows asymmetric hole sidewalls (2018)</td><td class="q-w">the &minus;c end of domains etches much faster than +c (<Src id="volk2008" loc="p. 168" code="P-comp" />; <Src id="nassau1966" code="reported" text="reported (title)" />, <Src id="barry1998" code="reported" text="reported (title)" />, <Src id="sones2002" code="reported" text="reported (title)" />); in x- and y-cut devices sidewalls facing &minus;c and +c recede differently</td><td class="q-w">none stated; the chip was annealed before fabrication</td><td class="q-s"><Src id="blog-ln-properties" code="reported" text="practitioner" cite={false} /></td></tr>
            <tr><td>9</td><td class="q-w">Ion milling depends strongly on residual gas partial pressure; O<sub>2</sub> oxidizes metal masks or ashes resist (2018)</td><td></td><td></td><td class="q-s"><Src id="blog-ln-properties" code="reported" text="practitioner" cite={false} /></td></tr>
            <tr><td>10</td><td class="q-w">Li does not form volatiles with Br or Cl (2018)</td><td></td><td></td><td class="q-s"><Badge code="U" pop="u-hal" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Limits of the notes">
    <div class="sh"><h2 class="biref">L3 Limits of the notes</h2><span class="meta">what is and is not recorded</span></div>
    <div class="body">
      <ul class="q-list">
        <li>The orientation of c in the post-HF SEM is not recorded in the note; the asymmetry and the &minus;c rule are stated, not which side is which.</li>
        <li>Bake voltages are ranges spanning the pyroelectric coefficient spread (<a class="lk" href="/quirks/pyroelectricity/">4.6</a>); cooldowns carry no number: no p3 value below room temperature was found.</li>
        <li>Charging under electron beams and on hotplates, face-dependent etching and mask stress connect to chapter 05 (milling, lithography, poling).</li>
      </ul>
    </div>
  </section>
</QSection>
