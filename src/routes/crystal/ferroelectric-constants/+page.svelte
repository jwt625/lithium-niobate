<!-- 1.3 Ferroelectric constants: Ps, Tc, melting (content/chapters/01-crystal/manuscript.md Sec. 3; temperature axis shared
     with FIG-01-03). Figure modules: src/lib/figures/crystal/cp.ts (browser), cpaxis.ts and cpmodel.ts (pure, also run by the
     server load for the prerendered state). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountCp } from "$lib/figures/crystal/cp";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { usePops } from "$lib/content/pops";
  import "$lib/figures/crystal/cp.css";

  let { data }: { data: PageData } = $props();
  const I = $derived(data.init);
  const R = $derived(data.init.ro);

  usePops({
    "d:ct-fit": { h: "T<sub>c</sub> from the two fits", body: "T<sub>c</sub> = 39.26 c &minus; 760.67 (Iyi, DTA, 4 crystals, chemical analysis) and T<sub>c</sub> = 39.064 c &minus; 746.73 (Bordui, dielectric, 5 VTE crystals); &deg;C, c in mol% Li<sub>2</sub>O, evaluated at the chosen c. The band spans the two values.", badges: [["pc", "P-comp"], ["d", "derived"]], src: "Volk & Wöhlecke 2008 Eqs. (6.2)-(6.3) p. 140" },
    "d:ct-inv": { h: "Composition from a measured T<sub>c</sub>", body: "Each fit inverted: c = (T<sub>c</sub> + 760.67)/39.26 (Iyi) and c = (T<sub>c</sub> + 746.73)/39.064 (Bordui). The two inversions differ by about 0.1 mol% at any T<sub>c</sub>, the 4 &deg;C offset between the fits. Above 50 mol% no crystal exists; the readout says so.", badges: [["d", "derived"]] },
    "d:ct-gap": { h: "Margin to the melting point", body: "1255 &deg;C (congruent melting point, Volk & Wöhlecke 2008 Table 1.1) minus the T<sub>c</sub> band at the chosen c. The melting point is that of congruent crystal; for other compositions no melting point is held, so the margin is exact only near the congruent composition.", badges: [["d", "derived"]] },
    "d:ct-b7": { h: "Near-stoichiometric melting point: not shown", body: "Volk & Wöhlecke 2008 Table 1.1 prints a near-stoichiometric melting point that lies below the near-stoichiometric T<sub>c</sub> of 1206 &deg;C in the same table. A Curie point above the melting point is impossible, so the entry is not shown; a primary near-stoichiometric melting point is not among the sources held (Volk & Wöhlecke 2008 cites Nikogosyan 2005).", badges: [["pc", "P-comp"]], src: "Volk & Wöhlecke 2008 Table 1.1 p. 3" },
  });

  let body: HTMLElement;
  onMount(() => {
    const offs = [mountCp(body, "axis"), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

<CrystalSection slug="ferroelectric-constants" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Polarization to 1140 °C" }, { id: "l2", label: "L2 Ps, Tc, melting" }, { id: "l3", label: "L3 How Tc is measured" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Polarization to 1140 °C" bind:this={body}>
    <div class="sh"><h2 class="biref">L1 Polarization to 1140 &deg;C</h2><span class="meta">Volk & Wöhlecke 2008 Table 1.1</span></div>
    <div class="body">
      <p class="tx">LiNbO<sub>3</sub> keeps its <span class="term" data-pop="g:spontaneous-polarization">polarization</span> up to about 1140 &deg;C in the usual <span class="term" data-pop="g:congruent">congruent</span> crystal and about 1206 &deg;C in <span class="term" data-pop="g:sln-nsln">near-stoichiometric</span> crystal; congruent crystal melts at 1255 &deg;C, only {data.gap} degrees higher <Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" />. That high <span class="term" data-pop="g:curie-temperature">Curie temperature</span> makes the polarization of a commercial wafer permanent for practical purposes: no device processing step comes close.</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel cp-tax" data-pair="cptax">
          <div class="ph"><span>Temperature axis: T<sub>c</sub>(c) from two fits, T<sub>c</sub> and T<sub>m</sub> markers</span><span><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3, Eqs. (6.2)-(6.3) p. 140" /> <Badge code="derived" pop="d:ct-fit" /></span></div>
          <div class="ctl"><label for="ct-c">c, Li<sub>2</sub>O</label><input id="ct-c" data-cp="c" type="range" min="48" max="50" step="0.01" value={I.cv}><output for="ct-c" data-o="c">{R.c}</output></div>
          <div class="ctl"><label for="ct-t">T<sub>c</sub> input</label><input id="ct-t" data-cp="tc" type="range" min="1120" max="1210" step="0.1" value={I.tv}><output for="ct-t" data-o="tin">{R.tin}</output></div>
          <div class="cp-grid">
            <div class="cp-blk"><div class="cp-bh"><span>1100&ndash;1300 &deg;C, 5 &deg;C per character</span><span>= ferroelectric&nbsp; # between fits&nbsp; ^ marker&nbsp; | input</span></div><pre class="cx-ascii" data-a="ax">{@html I.ascii}</pre></div>
            <table class="kv cp-tkv">
              <colgroup><col><col class="cv"><col class="cs"></colgroup>
              <tbody>
                <tr><td>T<sub>c</sub>(c), Iyi fit</td><td class="v" data-o="tci">{R.tci}</td><td class="s"><Badge code="derived" pop="d:ct-fit" /></td></tr>
                <tr><td>T<sub>c</sub>(c), Bordui fit</td><td class="v" data-o="tcb">{R.tcb}</td><td class="s"><Badge code="derived" pop="d:ct-fit" /></td></tr>
                <tr><td>1255 &deg;C &minus; T<sub>c</sub>(c)</td><td class="v" data-o="gap">{R.gap}</td><td class="s"><Badge code="derived" pop="d:ct-gap" /></td></tr>
                <tr><td>c(T<sub>c</sub> input), Iyi</td><td class="v" data-o="ci">{R.ci}</td><td class="s"><Badge code="derived" pop="d:ct-inv" /></td></tr>
                <tr><td>c(T<sub>c</sub> input), Bordui</td><td class="v" data-o="cb">{R.cb}</td><td class="s"><Badge code="derived" pop="d:ct-inv" /></td></tr>
                <tr><td>Difference</td><td class="v" data-o="dc">{R.dc}</td><td class="s"><Badge code="derived" pop="d:ct-inv" /></td></tr>
              </tbody>
            </table>
          </div>
          <div class="pf">Composition &rarr; temperature: move c; the T<sub>c</sub> band shifts 39 &deg;C per mol%. Temperature &rarr; composition: set a measured T<sub>c</sub> (default 1142.3 &deg;C, vendor value for 48.38 mol% <Badge code="V" pop="r:cti1999|data sheet" />); each fit returns a composition. Markers: <Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" />; near-stoichiometric melting point not drawn <Badge code="P-comp" pop="d:ct-b7" />.</div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="cp-tv" data-pair="cptax">
          <div class="cp-svg-host cp-axhost cp-in" data-s="ax">{@html I.svg}</div>
          <div class="cp-vctl">
            <div class="v-ctl" style="--w:11ch"><label for="ctv-c">Crystal composition c, Li<sub>2</sub>O</label><output for="ctv-c" data-o="c">{R.c}</output><input id="ctv-c" data-cp="c" type="range" min="48" max="50" step="0.01" value={I.cv}></div>
            <div class="v-ctl" style="--w:10ch"><label for="ctv-t">Measured T<sub>c</sub></label><output for="ctv-t" data-o="tin">{R.tin}</output><input id="ctv-t" data-cp="tc" type="range" min="1120" max="1210" step="0.1" value={I.tv}></div>
          </div>
          <div class="cp-vgrid2">
            <dl class="v-hud">
              <dt>T<sub>c</sub>(c), Iyi fit <Badge code="derived" pop="d:ct-fit" /></dt><dd data-o="tci">{R.tci}</dd>
              <dt>T<sub>c</sub>(c), Bordui fit</dt><dd data-o="tcb">{R.tcb}</dd>
              <dt>Margin to 1255 &deg;C <Badge code="derived" pop="d:ct-gap" /></dt><dd data-o="gap">{R.gap}</dd>
            </dl>
            <dl class="v-hud">
              <dt>c from T<sub>c</sub>, Iyi fit <Badge code="derived" pop="d:ct-inv" /></dt><dd data-o="ci">{R.ci}</dd>
              <dt>c from T<sub>c</sub>, Bordui fit</dt><dd data-o="cb">{R.cb}</dd>
              <dt>Fits disagree by</dt><dd data-o="dc">{R.dc}</dd>
            </dl>
          </div>
          <p class="v-cap">Stripes: ferroelectric phase, &plusmn;<i>z</i> domains possible; green band: T<sub>c</sub> between the two fits at the chosen c. Waves: congruent crystal molten above 1255 &deg;C. The solid line is the measured T<sub>c</sub>; default 1142.3 &deg;C, the vendor value for 48.38 mol% <Badge code="V" pop="r:cti1999|data sheet" />. Markers <Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" />; near-stoichiometric melting point not drawn <Badge code="P-comp" pop="d:ct-b7" />.</p>
        </figure>
        {/snippet}
      </ModeVariant>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Ps, Tc, melting">
    <div class="sh"><h2 class="biref">L2 P<sub>s</sub>, T<sub>c</sub>, melting</h2><span class="meta">room temperature unless stated</span></div>
    <div class="body">
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Quantity</th><th>Congruent</th><th>Near-stoichiometric</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:spontaneous-polarization">P<sub>s</sub></span>, room temperature <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span></td><td class="num">71 &micro;C/cm<sup>2</sup> = 0.71 C/m<sup>2</sup></td><td>printed 62 &micro;C/cm<sup>2</sup>; the cited source is on LiTaO<sub>3</sub> (L3), not an LN value</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></td></tr>
            <tr><td class="h">P<sub>s</sub>, P&ndash;E loop <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span></td><td class="num">71 &micro;C/cm<sup>2</sup>; &ldquo;experimental 0.71 C/m<sup>2</sup>&rdquo;</td><td>&ndash;</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 181, Gopalan group" /> <Badge code="P" text="P(abs)" pop="r:hsu1997|abstract" /></td></tr>
            <tr><td class="h">P<sub>s</sub>, P&ndash;E loop <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span></td><td class="num">80 &plusmn; 5 &micro;C/cm<sup>2</sup> = 0.80 C/m<sup>2</sup></td><td>same; &ldquo;relatively insensitive&rdquo; to stoichiometry and hydrogen</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:curie-temperature">Curie temperature T<sub>c</sub></span></td><td class="num">1140 &deg;C</td><td class="num">1206 &deg;C</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></td></tr>
            <tr><td class="h">T<sub>c</sub>, 48.38 mol% Li<sub>2</sub>O</td><td class="num">1142.3 &plusmn; 0.7 &deg;C</td><td>&ndash;</td><td class="s"><Badge code="V" pop="r:cti1999|data sheet" /></td></tr>
            <tr><td class="h">T<sub>c</sub> in Weis & Gaylord 1985</td><td>&ldquo;approximately 1210 &deg;C&rdquo; in the text; 1165 &deg;C for one listed sample; internally inconsistent</td><td>&ndash;</td><td class="s"><Badge code="P" pop="r:weis1985|p. 191 and Table 1" /></td></tr>
            <tr><td class="h">Melting point T<sub>m</sub></td><td class="num">1255 &deg;C</td><td>not shown: the printed value lies below the 1206 &deg;C T<sub>c</sub> of the same table <span class="cx-flag" tabindex="0" data-pop="d:ct-b7">impossible</span></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:pyroelectric-effect">Pyroelectric sign</span></td><td>p<sub>3</sub> &lt; 0: on cooling the +c face becomes more positive</td><td>&ndash;</td><td class="s"><Badge code="P" pop="r:weis1985|p. 196 Eq. (2)" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">P<sub>s</sub>: two measured values, 0.71 and 0.80 C/m<sup>2</sup>; where one number is needed this chapter computes with 0.71 C/m<sup>2</sup> <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span>.</p>

      <h3 class="h3">T<sub>c</sub> as a composition gauge</h3>
      <p class="tx">c = Li<sub>2</sub>O content of the crystal, mol%; T<sub>c</sub> in &deg;C:</p>
      <pre class="cx-code">T<sub>c</sub> = 39.26 c &minus; 760.67     (DTA, 4 crystals, chemical analysis)   <Badge code="P-comp" pop="r:volk2008|Eq. (6.2) p. 140;iyi1992|via Volk & Wöhlecke 2008" />
T<sub>c</sub> = 39.064 c &minus; 746.73    (dielectric, 5 VTE crystals)           <Badge code="P-comp" pop="r:volk2008|Eq. (6.3) p. 140;bordui1992|via Volk & Wöhlecke 2008" /></pre>
      <div class="cx-tw">
        <table class="idx cx-t cp-fitt">
          <thead><tr><th>c (mol% Li<sub>2</sub>O)</th><th class="r">T<sub>c</sub>, Iyi fit</th><th class="r">T<sub>c</sub>, Bordui fit</th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each data.fits as r (r.c)}<tr><td>{r.c}</td><td class="num">{r.iyi} &deg;C</td><td class="num">{r.bordui} &deg;C</td><td class="s"><Badge code="derived" pop="d:ct-fit" /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="tx">Slope: 39 &deg;C per mol% Li<sub>2</sub>O; across the room-temperature solid-solution range T<sub>c</sub> changes by about 150 &deg;C <Badge code="P-comp" pop="r:volk2008|p. 140" />.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 How Tc is measured">
    <div class="sh"><h2 class="biref">L3 How T<sub>c</sub> is measured</h2><span class="meta">DTA, dielectric peak; P<sub>s</sub> disagreement</span></div>
    <div class="body">
      <p class="tx"><b>Methods.</b> T<sub>c</sub> is measured by differential thermal analysis or by the dielectric peak; its closeness to the melting point is the method's drawback <Badge code="P-comp" pop="r:volk2008|p. 140" />. Weis and Gaylord call T<sub>c</sub> &ldquo;a very reliable and accurate indicator&rdquo; of composition <Badge code="P" pop="r:weis1985|p. 194" />. The two fits differ by 4 &deg;C, i.e. 0.1 mol% <Badge code="P-comp" pop="r:volk2008|p. 141" />. A neutron study puts T<sub>c</sub> near 1430 K for an unstated composition <Badge code="P" text="P(abs)" pop="r:boysen1994|abstract" />. Above T<sub>c</sub> the crystal is in its <span class="term" data-pop="g:paraelectric-phase">paraelectric phase</span>.</p>
      <p class="tx"><b>Disagreement on P<sub>s</sub>.</b> Reported values span 62 to 85 &micro;C/cm<sup>2</sup>. For the P<sub>s</sub> column of its Table 1.1, Volk & Wöhlecke 2008 cites a 1998 APL paper whose Crossref title concerns stoichiometric LiTaO<sub>3</sub> <Badge code="P" pop="r:kitamura1998|Crossref title" />, so the 62 &micro;C/cm<sup>2</sup> near-stoichiometric entry has no LN source on record. Gopalan et al. 1998, measured on both compositions, reports 80 &plusmn; 5 &micro;C/cm<sup>2</sup> and no composition dependence <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" />. P<sub>s</sub> is therefore given as 0.71&ndash;0.80 C/m<sup>2</sup> with both sources <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span>.</p>
      <p class="tx"><b>T<sub>c</sub> in Weis & Gaylord 1985.</b> The review gives &ldquo;approximately 1210 &deg;C&rdquo; in its text and 1165 &deg;C for one sample in its Table 1, for crystals of unstated composition <Badge code="P" pop="r:weis1985|p. 191 and Table 1" />; neither is used as a headline value. Through the fits, 1165 &deg;C corresponds to about 49.0 mol%, 1210 &deg;C lies above 50 mol% <Badge code="derived" pop="d:ct-inv" />.</p>
      <p class="tx"><b>Melting point of near-stoichiometric crystal.</b> The value printed in Volk & Wöhlecke 2008 Table 1.1 lies below the near-stoichiometric T<sub>c</sub> of the same table, which is physically impossible; it is not shown, and no other source for it is held <Badge code="P-comp" pop="d:ct-b7" />.</p>
    </div>
  </section>
</CrystalSection>
