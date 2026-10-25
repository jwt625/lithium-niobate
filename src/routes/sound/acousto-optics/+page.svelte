<!-- Chapter 3.6 Acousto-optics (manuscript sec. 3.6; figures F3.7, F3.8; author question 5 shown as open). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F37 from "$lib/figures/sound/F37Bragg.svelte";
  import F38 from "$lib/figures/sound/F38Photoelastic.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import { exS } from "$lib/figures/sound/f";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  onMount(() => mountSound());
  const s3 = (v: number): string => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(3);
  const ex = (v: number, d = 2): string => exS(v, d);
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.6" }]} title="3.6 Acousto-optics"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Photoelasticity" }, { id: "l3", label: "L3 Sign and frame" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">Bragg diffraction by sound</span></div>
    <div class="body">
      <p class="tx">A sound wave in a crystal is a moving grating of compressed and stretched regions, and the refractive index follows the strain (<span class="term" data-pop="g:photoelastic-effect">photoelastic effect</span>). Light crossing it is diffracted and shifted in frequency by exactly the sound frequency. In LN the same crystal can launch the sound piezoelectrically, so a modulator, frequency shifter or deflector needs no glued-on transducer (<span class="term" data-pop="g:acousto-optic-effect">acousto-optic effect</span>).</p>
      <p class="tx">Sweep the RF frequency: the diffracted beam swings like a scanner, the basis of an acousto-optic deflector, and the light frequency of the +1 order rises by exactly the RF frequency.</p>
      <F37 modes={data.modes} />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Photoelasticity">
    <div class="sh"><h2 class="biref">L2 Photoelastic tensor, figures of merit, devices</h2><span class="meta">Weis & Gaylord 1985 Eqs. 18-20; 633 nm sets</span></div>
    <div class="body">
      <div class="eq"><math display="block"><mrow><mi>&Delta;</mi><msub><mrow><mo>(</mo><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac><mo>)</mo></mrow><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><msub><mi>p</mi><mrow><mi>i</mi><mi>j</mi><mi>k</mi><mi>l</mi></mrow></msub><msub><mi>S</mi><mrow><mi>k</mi><mi>l</mi></mrow></msub></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">Photoelastic (strain-optic) relation (Weis &amp; Gaylord 1985 Eq. 18 <Badge code="P" pop="r:weis1985" />). Nelson and Lax showed the independent variable is the displacement gradient, not only strain: rotations of volume elements contribute in birefringent crystals, so p<sub>ijkl</sub> is not symmetric in kl for shear waves; in LN p<sub>44</sub> = p<sub>55</sub> has symmetric and antisymmetric parts, not resolved by the available data (Weis &amp; Gaylord 1985 p. 200 <Badge code="P-comp" pop="r:weis1985" />).</p>
      <p class="tx">3m form, eight independent coefficients p<sub>11</sub>, p<sub>12</sub>, p<sub>13</sub>, p<sub>14</sub>, p<sub>31</sub>, p<sub>33</sub>, p<sub>41</sub>, p<sub>44</sub>, with p<sub>22</sub> = p<sub>11</sub>, p<sub>23</sub> = p<sub>13</sub>, p<sub>24</sub> = &minus;p<sub>14</sub>, p<sub>32</sub> = p<sub>31</sub>, p<sub>42</sub> = &minus;p<sub>41</sub>, p<sub>55</sub> = p<sub>44</sub>, p<sub>56</sub> = p<sub>41</sub>, p<sub>65</sub> = p<sub>14</sub>, p<sub>66</sub> = (p<sub>11</sub> &minus; p<sub>12</sub>)/2 (Weis &amp; Gaylord 1985 Eq. 19 <Badge code="P" pop="r:weis1985" />). p<sub>IJ</sub> is not a symmetric matrix (p<sub>14</sub> &ne; p<sub>41</sub>).</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Set</th><th class="r">p<sub>11</sub></th><th class="r">p<sub>12</sub></th><th class="r">p<sub>13</sub></th><th class="r">p<sub>14</sub></th><th class="r">p<sub>31</sub></th><th class="r">p<sub>33</sub></th><th class="r">p<sub>41</sub></th><th class="r">p<sub>44</sub></th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each data.sets as s (s.id)}<tr><td class="h">{s.label}</td>{#each [s.p.p11, s.p.p12, s.p.p13, s.p.p14, s.p.p31, s.p.p33, s.p.p41, s.p.p44] as v, i (i)}<td class="num">{s3(v)}</td>{/each}<td class="r"><Badge code={s.code} pop={s.pop} /></td></tr>{/each}
            <tr><td class="h">TFLN fit, LN on sapphire (three components)</td><td class="num dim">&ndash;</td><td class="num dim">&ndash;</td><td class="num dim">&ndash;</td><td class="num dim">&ndash;</td><td class="num dim">&ndash;</td><td class="num">+0.038</td><td class="num">&minus;0.038</td><td class="num">+0.085</td><td class="r"><Badge code="S" pop="r:sarabalis2020" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Avakyants and Andrushchak at 633 nm; the wavelengths of the Coquin and Krupych sets are not recorded in the sources held. No set at 1550 nm is known; TFLN devices at 1550 nm reuse 633 nm values. Uncertainties of Andrushchak 2009: &plusmn;0.007 to &plusmn;0.029 (via Sarabalis et al. 2020 Table I).</p>
      <p class="tx"><b><span class="term" data-pop="g:indirect-photoelastic-effect">Indirect (piezo-electro-optic) contribution</span>.</b> Strain makes a field through e, the field changes the index through r. It depends on the acoustic propagation direction and matters for p<sub>13</sub> and p<sub>33</sub>: p<sub>13</sub>(primary) = p<sub>13</sub>(measured) &minus; 0.043, p<sub>33</sub>(primary) = p<sub>33</sub>(measured) &minus; 0.154 (Weis &amp; Gaylord 1985 p. 201 <Badge code="P-comp" pop="r:weis1985" />; propagation direction not stated). Applied to Set B this gives p<sub>33</sub>(primary) of about &minus;0.08 <Badge code="derived" pop="m-pe" />, so which p<sub>33</sub> a model uses matters. The offsets are shown, not applied.</p>

      <h3 class="h3"><span class="term" data-pop="g:acousto-optic-figure-of-merit">Figures of merit</span></h3>
      <div class="eq"><math display="block"><mrow><msub><mi>M</mi><mn>1</mn></msub><mo>=</mo><mfrac><mrow><msup><mi>n</mi><mn>7</mn></msup><msup><mi>p</mi><mn>2</mn></msup></mrow><mrow><mi>&rho;</mi><mi>v</mi></mrow></mfrac><mo>,</mo><mspace width="1em"/><msub><mi>M</mi><mn>2</mn></msub><mo>=</mo><mfrac><mrow><msup><mi>n</mi><mn>6</mn></msup><msup><mi>p</mi><mn>2</mn></msup></mrow><mrow><mi>&rho;</mi><msup><mi>v</mi><mn>3</mn></msup></mrow></mfrac><mo>,</mo><mspace width="1em"/><msub><mi>M</mi><mn>3</mn></msub><mo>=</mo><mfrac><mrow><msup><mi>n</mi><mn>7</mn></msup><msup><mi>p</mi><mn>2</mn></msup></mrow><mrow><mi>&rho;</mi><msup><mi>v</mi><mn>2</mn></msup></mrow></mfrac><mo>,</mo><mspace width="1em"/><msub><mi>M</mi><mn>4</mn></msub><mo>=</mo><mfrac><mrow><msup><mi>n</mi><mn>8</mn></msup><msup><mi>p</mi><mn>2</mn></msup><mi>v</mi></mrow><mi>&rho;</mi></mfrac></mrow></math><span class="eqn">(2)</span></div>
      <p class="tx">LN, longitudinal wave along X with extraordinary light at 35&deg; to y: n = 2.20, &rho; = 4.7&times;10&sup3; kg/m&sup3;, v = 6.57&times;10&sup3; m/s (Dixon 1967 and Chang 1976 via Weis &amp; Gaylord 1985 p. 201 <Badge code="P-comp" pop="r:weis1985" />).</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Quantity</th><th class="r">Printed</th><th class="r">From Eq. 2 with p implied by M<sub>2</sub></th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">M<sub>1</sub> (m&sup2; s/kg)</td><td class="num">6.65&times;10<sup>&minus;7</sup> (Dixon 1967)</td><td class="num">{ex(data.fom.M1)}</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">M<sub>2</sub> (s&sup3;/kg)</td><td class="num">6.99&times;10<sup>&minus;15</sup> (Dixon 1967)</td><td class="num">input; p = {data.fom.p.toFixed(3)}</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">M<sub>4</sub> (m<sup>4</sup>/(s kg))</td><td class="num">62.9 (Chang 1976)</td><td class="num">{data.fom.M4.toFixed(1)}</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">M<sub>3</sub></td><td class="num">printed &ldquo;1.01&times;10<sup>&minus;16</sup> m s&sup2; kg&rdquo;</td><td class="num">{ex(data.fom.M3)} m s&sup2;/kg</td><td class="r"><Badge code="U" pop="r:dixon1967" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">The four definitions with the stated n, &rho;, v reproduce M<sub>1</sub> and M<sub>4</sub>; the printed M<sub>3</sub> exponent and unit are inconsistent with them, so the printed M<sub>3</sub> is not used <Badge code="derived" pop="m-bragg" />.</p>
      <p class="tx"><b><span class="term" data-pop="g:bragg-diffraction">Bragg</span> example.</b> &lambda;<sub>0</sub> = 1550 nm, f = 1 GHz, X-longitudinal v = 6544.6 m/s: &Lambda; = 6.54 &micro;m and &theta;<sub>B</sub> = 6.8&deg; in air <Badge code="derived" pop="m-bragg" />.</p>
      <p class="tx"><b>Integrated acousto-optics on LN.</b> Collinear TE0-TE1 conversion by an SH0 wave at 440 MHz in a 1.25 &micro;m wide suspended X-cut waveguide, up to 18% conversion (Sarabalis et al. 2021 <Badge code="reported" pop="r:p10" />); acousto-optic modulators in X-cut LN on sapphire (Sarabalis et al. 2020 <Badge code="reported" pop="r:sarabalis2020" />); AO modulator V<sub>&pi;</sub>L of 0.03 V cm in TFLN with chalcogenide, unsuspended (Wan et al. 2022 <Badge code="reported" pop="r:wan2022" />); a bulk-wafer longitudinal piezoelectric resonant photoelastic modulator (Atalar et al. 2022 <Badge code="S" pop="r:atalar2022" />).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Sign and frame">
    <div class="sh"><h2 class="biref">L3 Sign and frame pitfalls</h2><span class="meta">p<sub>14</sub>, p<sub>41</sub> vs c<sub>14</sub></span></div>
    <div class="body">
      <p class="tx"><b>1. Pair signs only within one frame.</b> The p<sub>14</sub> and p<sub>41</sub> signs flip with c<sub>14</sub> (and e<sub>22</sub>, d<sub>22</sub>) under a 180&deg; rotation about Z. Never combine p<sub>14</sub>, p<sub>41</sub> from one paper with c<sub>14</sub>, e<sub>22</sub> from another without checking the frame.</p>
      <p class="tx"><b>2. What is known.</b> Weis &amp; Gaylord 1985 list Avakyants' p<sub>14</sub>, p<sub>41</sub> &lt; 0 next to Smith and Welsh's c<sub>14</sub> &gt; 0 in a paper that states the IRE frame, without saying it checked Avakyants' own frame; Krupych 2014 pairs c<sub>14</sub> &gt; 0 with p<sub>14</sub>, p<sub>41</sub> &gt; 0 (via Mys et al. 2015 <Badge code="S" pop="r:mys2015" />); Mytsyk et al. 2021 use S<sub>14</sub> &gt; 0 (c<sub>14</sub> &lt; 0) <Badge code="S" pop="r:mytsyk2021" />, a frame that is non-standard for LN if d<sub>22</sub> &gt; 0 is imposed (inference). The common TFLN pairing (Kushibiki et al. c<sub>14</sub> &gt; 0 with Set B) matches the Weis &amp; Gaylord compilation but is not confirmed at the primary level.</p>
      <p class="tx"><b>3. What a mismatch does.</b> For a film with in-plane unit vector b (light polarization and dominant strain both along b), the longitudinal coefficient is p&prime;<sub>bbbb</sub> = p<sub>ijkl</sub>b<sub>i</sub>b<sub>j</sub>b<sub>k</sub>b<sub>l</sub>. On an X-cut film with b = (0, cos &phi;, sin &phi;), &phi; from +Y toward +Z <Badge code="derived" pop="m-pe" />:</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Set, X-cut</th><th class="r">p&prime; at &phi; = 0, 45, 90, 135&deg;</th><th class="r">Maximum</th></tr></thead>
          <tbody>
            {#each data.pair as r (r.label)}
              <tr><td class="h">{r.label}, A: as listed</td><td class="num">{r.XA.map(s3).join(", ")}</td><td class="num">{s3(r.mXA.value)} at {r.mXA.phi_deg.map((d) => d.toFixed(1)).join(", ")}&deg;</td></tr>
              <tr><td class="h">{r.label}, B: p<sub>14</sub>, p<sub>41</sub> negated</td><td class="num">{r.XB.map(s3).join(", ")}</td><td class="num">{s3(r.mXB.value)} at {r.mXB.phi_deg.map((d) => d.toFixed(1)).join(", ")}&deg;</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="tx">On X-cut the flip mirrors the optimum orientation from about 45&deg; to about 135&deg;; the magnitude is unchanged. On Y-cut (b = (cos &phi;, 0, sin &phi;)) the flip changes nothing (Andrushchak: maximum {s3(data.pair[0].mYA.value)} at {data.pair[0].mYA.phi_deg.map((d) => d.toFixed(1)).join(" and ")}&deg;; Set B maximum {s3(data.pair[1].mYA.value)} at {data.pair[1].mYA.phi_deg.map((d) => d.toFixed(1)).join(" and ")}&deg;). On Z-cut p&prime;<sub>bbbb</sub> = p<sub>11</sub> for every in-plane direction. Which orientation is right on X-cut depends on the unresolved pairing in item 2.</p>
      <p class="tx">The Andrushchak values at 45 and 135&deg;, 0.304 (X-cut) and 0.223 (Y-cut), equal the &ldquo;p<sub>22</sub>&prime;&rdquo; values in the author's public 2018 note on photoelastic tensor rotation (outside5sigma.com, 2018 <Badge code="S" pop="r:jiang2018-blog-photoelastic" />), where the X-cut angle was relabelled from 45 to 135&deg;. A p<sub>14</sub>/p<sub>41</sub> sign or frame inconsistency produces such a relabelling; a change of the &theta; = 0 reference, also recorded in that note, is an alternative explanation (inference).</p>
      <p class="tx">Toggle the film cut: on X-cut the two wafers disagree about the bright direction; on Y-cut they agree.</p>
      <F38 sets={data.sets} />
      <p class="tx"><b>4. Optical wavelength.</b> The Avakyants and Andrushchak sets are at 633 nm (Weis &amp; Gaylord 1985 <Badge code="P-comp" pop="r:weis1985" />; Sarabalis et al. 2020 Table I <Badge code="S" pop="r:sarabalis2020" />); no 1550 nm set is known.</p>
      <p class="tx"><b>5. <span class="term" data-pop="g:rotational-photoelastic-contribution">Rotation (Nelson-Lax) term</span>.</b> For shear waves in a birefringent crystal it adds &Delta;&epsilon; terms proportional to (&epsilon;<sub>ii</sub> &minus; &epsilon;<sub>jj</sub>) times the rotation; an estimate for one LN nanobeam geometry put it below 4% of the photoelastic coupling (author's public 2018 note, outside5sigma.com <Badge code="S" pop="r:jiang2018-blog-photoelastic" />; unreviewed). Optomechanical coupling calculations on TFLN include moving-boundary and photoelastic terms; the rotation term is usually omitted.</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.6</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
