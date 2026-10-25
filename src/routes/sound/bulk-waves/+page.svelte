<!-- Chapter 3.2 Elastic constants and bulk waves (manuscript sec. 3.2; figure F3.3). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F33 from "$lib/figures/sound/F33Slowness.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  onMount(() => mountSound());
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.2" }]} title="3.2 Elastic constants and bulk waves"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Christoffel model" }, { id: "l3", label: "L3 Computation" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">bulk sound speeds; Kushibiki et al. 1999 constants</span></div>
    <div class="body">
      <p class="tx">Sound in LN travels at 3.5 to 7.4 km/s depending on direction and polarization (3474 to 7357 m/s over all directions <Badge code="derived" pop="m-christoffel" />): 7.33 km/s for a compression wave along the polar axis, 3.59 km/s for a shear wave along the same axis (Kushibiki et al. 1999 Table II <Badge code="P" pop="r:kushibiki1999" />). Because the crystal is piezoelectric, an acoustic wave carries an electric field with it, and that field makes the crystal <span class="term" data-pop="g:piezoelectric-stiffening">stiffer for that wave</span>: the compression wave along Z is 3.2% faster than it would be in a non-piezoelectric crystal with the same elastic constants (7328.6 vs 7102.1 m/s <Badge code="derived" pop="m-christoffel" />).</p>
      <p class="tx">Switch the stiffening off and on: the Z-longitudinal velocity moves between 7102 and 7329 m/s and lands on the measured value, while the Y-propagating shear wave polarized along X does not move at all.</p>
      <F33 />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Christoffel model">
    <div class="sh"><h2 class="biref">L2 Elastic constants and the Christoffel equation</h2><span class="meta">3m: six independent c<sup>E</sup></span></div>
    <div class="body">
      <p class="tx"><span class="term" data-pop="g:elastic-stiffness">Elastic stiffness</span> at constant E, 3m form: c<sub>22</sub> = c<sub>11</sub>, c<sub>23</sub> = c<sub>13</sub>, c<sub>24</sub> = &minus;c<sub>14</sub>, c<sub>55</sub> = c<sub>44</sub>, c<sub>56</sub> = c<sub>14</sub>, c<sub>66</sub> = (c<sub>11</sub> &minus; c<sub>12</sub>)/2; six independent constants (Weis & Gaylord 1985 Eq. 17 <Badge code="P" pop="r:weis1985" />).</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Source (GPa)</th><th class="r">c<sub>11</sub></th><th class="r">c<sub>12</sub></th><th class="r">c<sub>13</sub></th><th class="r">c<sub>14</sub></th><th class="r">c<sub>33</sub></th><th class="r">c<sub>44</sub></th><th class="r">c<sub>66</sub></th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Kushibiki et al. 1999</td><td class="num">198.86 &plusmn; 0.03</td><td class="num">54.67 &plusmn; 0.04</td><td class="num">67.99 &plusmn; 0.55</td><td class="num">7.83 &plusmn; 0.02</td><td class="num">234.18 &plusmn; 0.75</td><td class="num">59.85 &plusmn; 0.01</td><td class="num">72.09 &plusmn; 0.02</td><td class="r"><Badge code="P" pop="r:kushibiki1999" /></td></tr>
            <tr><td class="h">Ogi et al. 2002, 30 &deg;C</td><td class="num">199.5 &plusmn; 0.2</td><td class="num">55.27 &plusmn; 0.13</td><td class="num">67.67 &plusmn; 0.26</td><td class="num">8.7 &plusmn; 0.2</td><td class="num">235.2 &plusmn; 0.4</td><td class="num">59.48 &plusmn; 0.04</td><td class="num">72.10 &plusmn; 0.01</td><td class="r"><Badge code="P" pop="r:ogi2002" /></td></tr>
            <tr><td class="h">Smith and Welsh 1971</td><td class="num">203.0</td><td class="num">57.3</td><td class="num">75.2</td><td class="num">8.5</td><td class="num">242.4</td><td class="num">59.5</td><td class="num dim">&ndash;</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">Warner et al. 1967</td><td class="num">203</td><td class="num">53</td><td class="num">75</td><td class="num">9</td><td class="num">245</td><td class="num">60</td><td class="num dim">&ndash;</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Density: 4642.8 &plusmn; 0.2 kg/m&sup3; (Kushibiki et al. 1999 Table IV <Badge code="P" pop="r:kushibiki1999" />); 4636 (Ogi et al. 2002 <Badge code="P" pop="r:ogi2002" />); 4647 CLN, 4635 near-SLN (Volk & Wöhlecke 2008 Table 1.1 <Badge code="P-comp" pop="r:volk2008" />). Temperature coefficients of c<sup>E</sup> (Smith and Welsh): c<sub>11</sub> &minus;1.74, c<sub>12</sub> &minus;2.52, c<sub>13</sub> &minus;1.59, c<sub>14</sub> &minus;2.14, c<sub>33</sub> &minus;1.53, c<sub>44</sub> &minus;2.04 &times; 10<sup>&minus;4</sup>/K (Weis & Gaylord 1985 Table 6 <Badge code="P-comp" pop="r:weis1985" />). LiTaO<sub>3</sub> for comparison: c<sub>14</sub> = &minus;10.75 GPa, opposite in sign to LN in the same convention (Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" />); the other LiTaO<sub>3</sub> constants are not available here.</p>

      <p class="tx"><span class="term" data-pop="g:christoffel-equation">Christoffel equation</span> with piezoelectric stiffening, for a plane wave with unit wave normal <b>n</b> (IEEE 176 Eqs. 46-50 <Badge code="P" pop="r:ieee176" />):</p>
      <div class="eq"><math display="block"><mrow><msub><mi>&Gamma;</mi><mrow><mi>j</mi><mi>k</mi></mrow></msub><mo>=</mo><msubsup><mi>c</mi><mrow><mi>i</mi><mi>j</mi><mi>k</mi><mi>l</mi></mrow><mi>E</mi></msubsup><msub><mi>n</mi><mi>i</mi></msub><msub><mi>n</mi><mi>l</mi></msub><mo>+</mo><mfrac><mrow><mo>(</mo><msub><mi>e</mi><mrow><mi>m</mi><mi>i</mi><mi>j</mi></mrow></msub><msub><mi>n</mi><mi>m</mi></msub><msub><mi>n</mi><mi>i</mi></msub><mo>)</mo><mo>(</mo><msub><mi>e</mi><mrow><mi>n</mi><mi>k</mi><mi>l</mi></mrow></msub><msub><mi>n</mi><mi>n</mi></msub><msub><mi>n</mi><mi>l</mi></msub><mo>)</mo></mrow><mrow><msubsup><mi>&epsilon;</mi><mrow><mi>r</mi><mi>s</mi></mrow><mi>S</mi></msubsup><msub><mi>n</mi><mi>r</mi></msub><msub><mi>n</mi><mi>s</mi></msub></mrow></mfrac><mo>,</mo><mspace width="1.4em"/><mi>det</mi><mo>(</mo><msub><mi>&Gamma;</mi><mrow><mi>j</mi><mi>k</mi></mrow></msub><mo>&minus;</mo><mi>&rho;</mi><msup><mi>v</mi><mn>2</mn></msup><msub><mi>&delta;</mi><mrow><mi>j</mi><mi>k</mi></mrow></msub><mo>)</mo><mo>=</mo><mn>0</mn></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">Three velocities with orthogonal polarizations per direction; their inverses over all directions form the <span class="term" data-pop="g:slowness-surface">slowness surface</span>. The second term is the stiffening: the wave's longitudinal electric field (quasistatic, curl-free) adds stiffness proportional to the square of the effective piezoelectric constant. The velocity table in L1 compares the computed velocities with the measured ones; the agreement (&lt; 0.6 m/s) is a consistency check, not an independent test, since Kushibiki et al. 1999 fitted its constants to these velocities. Along X the remaining shear branch is 4028.96 m/s <Badge code="derived" pop="m-christoffel" />. Along Y the X-polarized shear is purely elastic (unstiffened) and the other two waves are stiffened and couple longitudinal and transverse motion, as IEEE 176 Eq. 53 states for class 3m <Badge code="P" pop="r:ieee176" />.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Computation">
    <div class="sh"><h2 class="biref">L3 Computation and error sources</h2><span class="meta">solver, rotation, consistency</span></div>
    <div class="body">
      <p class="tx"><b>Solver.</b> &Gamma; is real symmetric; a 3&times;3 Jacobi eigen-decomposition per direction gives velocities and polarizations. Group velocity and power-flow angle follow from the gradient of &rho;v<sup>2</sup> = u&middot;&Gamma;(n)&middot;u with respect to n (Hellmann-Feynman; &Gamma; is homogeneous of degree 2 in n, so v<sub>g</sub> = &nabla;<sub>n</sub>(u&Gamma;u)/(2&rho;v)); Jaeken &amp; Cottenier 2016 is the algorithm reference <Badge code="S" pop="r:jaeken2016" />. At degenerate directions (shear along Z) the group velocity depends on the eigenvector picked and is not unique.</p>
      <p class="tx"><b>Rotation.</b> Rotate full-rank tensors (c<sub>ijkl</sub>, e<sub>ijk</sub>, &epsilon;<sub>ij</sub>) with a<sub>ip</sub>; the Bond 6&times;6 matrices (Bond 1943) are equivalent and convenient for Voigt storage. IEEE 176 warns that compressed notation hides transformation properties (p. 8, after Table 2 <Badge code="P" pop="r:ieee176" />).</p>
      <p class="tx"><b>Unstiffened vs stiffened.</b> Setting e = 0 gives the unstiffened velocities; stiffening vanishes for directions where e<sub>mij</sub>n<sub>m</sub>n<sub>i</sub> = 0.</p>
      <p class="tx"><b>c<sub>66</sub> consistency.</b> Kushibiki et al. 1999 lists c<sub>66</sub> = 72.09 while (c<sub>11</sub> &minus; c<sub>12</sub>)/2 = 72.095; computations enforce the symmetry relation.</p>
      <p class="tx"><b>Composition.</b> Elastic and photoelastic properties change little with MgO doping (Andrushchak et al. 2009, abstract <Badge code="S" pop="r:andrushchak2009" />). The dependence of SAW velocity on Li<sub>2</sub>O content is not quantified in the sources held.</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.2</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
