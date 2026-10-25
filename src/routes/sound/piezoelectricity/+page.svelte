<!-- Chapter 3.1 Piezoelectricity (content/chapters/03-sound/manuscript.md sec. 3.1; figures F3.1, F3.2). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F31 from "$lib/figures/sound/F31Piezo.svelte";
  import F32 from "$lib/figures/sound/F32Forms.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  const C = $derived(data.calc);
  onMount(() => mountSound());
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.1" }]} title="3.1 Piezoelectricity"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Constitutive model" }, { id: "l3", label: "L3 Conventions" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">longitudinal response; Kushibiki et al. 1999 constants</span></div>
    <div class="body">
      <p class="tx">Squeeze a lithium niobate crystal along certain directions and charge appears on its faces; apply a voltage and it changes shape. The effect needs a crystal without a center of symmetry; LN (<span class="term" data-pop="g:point-group-3m">point group 3m</span>) qualifies. The response depends strongly on direction: pressing along the crystal Y axis gives a charge about 2.3 times larger than pressing along the polar Z axis (d<sub>22</sub> = {C.d22} vs d<sub>33</sub> = {C.d33} pC/N <Badge code="derived" pop="m-forms" />). One volt across a free crystal moves its faces by about 20 pm along Y.</p>
      <p class="tx">Drag the press direction around the equator: the charge changes sign every 60&deg;, the threefold axis seen directly. The largest response lies off every crystal axis, 29&deg; below the basal plane.</p>
      <F31 sets={data.sets} />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Constitutive model">
    <div class="sh"><h2 class="biref">L2 Constitutive model</h2><span class="meta">IEEE Std 176-1987; Kushibiki et al. 1999</span></div>
    <div class="body">
      <p class="tx"><span class="term" data-pop="g:constitutive-equations">Constitutive equations</span>, stress-charge form, full tensor and compressed (Voigt) notation <Badge code="P" pop="r:ieee176" />:</p>
      <div class="eq"><math display="block"><mrow><msub><mi>T</mi><mi>p</mi></msub><mo>=</mo><msubsup><mi>c</mi><mrow><mi>p</mi><mi>q</mi></mrow><mi>E</mi></msubsup><msub><mi>S</mi><mi>q</mi></msub><mo>&minus;</mo><msub><mi>e</mi><mrow><mi>k</mi><mi>p</mi></mrow></msub><msub><mi>E</mi><mi>k</mi></msub><mo>,</mo><mspace width="1.4em"/><msub><mi>D</mi><mi>i</mi></msub><mo>=</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>q</mi></mrow></msub><msub><mi>S</mi><mi>q</mi></msub><mo>+</mo><msubsup><mi>&epsilon;</mi><mrow><mi>i</mi><mi>k</mi></mrow><mi>S</mi></msubsup><msub><mi>E</mi><mi>k</mi></msub></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">IEEE 176 states that this pair (independent variables S, E) is the only form that yields the field equations of the unbounded continuum; the other three forms are exact but used where boundaries make some variables approximately zero.</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Form</th><th>Independent</th><th>Equations</th><th>Coefficient</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:e-coefficient">stress-charge (e)</span></td><td>S, E</td><td>T = c<sup>E</sup>S &minus; e<sup>t</sup>E; D = eS + &epsilon;<sup>S</sup>E</td><td>e (C/m&sup2;)</td></tr>
            <tr><td class="h"><span class="term" data-pop="g:d-coefficient">strain-charge (d)</span></td><td>T, E</td><td>S = s<sup>E</sup>T + d<sup>t</sup>E; D = dT + &epsilon;<sup>T</sup>E</td><td>d (C/N = m/V)</td></tr>
            <tr><td class="h"><span class="term" data-pop="g:g-coefficient">strain-voltage (g)</span></td><td>T, D</td><td>S = s<sup>D</sup>T + g<sup>t</sup>D; E = &minus;gT + &beta;<sup>T</sup>D</td><td>g (V m/N = m&sup2;/C)</td></tr>
            <tr><td class="h"><span class="term" data-pop="g:h-coefficient">stress-voltage (h)</span></td><td>S, D</td><td>T = c<sup>D</sup>S &minus; h<sup>t</sup>D; E = &minus;hS + &beta;<sup>S</sup>D</td><td>h (V/m = N/C)</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">IEEE 176 Eqs. 37-42 <Badge code="P" pop="r:ieee176" />. Relations (Eq. 43): c<sup>E</sup>s<sup>E</sup> = 1, &beta;<sup>S</sup>&epsilon;<sup>S</sup> = 1, c<sup>D</sup> = c<sup>E</sup> + e<sup>t</sup>h, &epsilon;<sup>T</sup> = &epsilon;<sup>S</sup> + d e<sup>t</sup>, e = d c<sup>E</sup>, g = &beta;<sup>T</sup>d, s<sup>D</sup> = s<sup>E</sup> &minus; d<sup>t</sup>g, &beta;<sup>T</sup> = &beta;<sup>S</sup> &minus; g h<sup>t</sup>, d = &epsilon;<sup>T</sup>g, h = g c<sup>D</sup>.</p>

      <h3 class="h3">3m form in the IEEE frame</h3>
      <div class="snd-x">
        <table class="idx snd-tab" style="width:auto">
          <thead><tr><th>e</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr></thead>
          <tbody>
            <tr><td class="h">1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>e<sub>15</sub></td><td>&minus;e<sub>22</sub></td></tr>
            <tr><td class="h">2</td><td>&minus;e<sub>22</sub></td><td>e<sub>22</sub></td><td>0</td><td>e<sub>15</sub></td><td>0</td><td>0</td></tr>
            <tr><td class="h">3</td><td>e<sub>31</sub></td><td>e<sub>31</sub></td><td>e<sub>33</sub></td><td>0</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">IEEE 176 Table 8, class 3m; Weis & Gaylord 1985 Eq. 8 <Badge code="P" pop="r:ieee176" />. d has the same pattern except d<sub>16</sub> = &minus;2d<sub>22</sub> (factor 2 from the strain convention).</p>

      <h3 class="h3">LN values (congruent, SAW grade)</h3>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Quantity</th><th class="r">Value</th><th>Unit</th><th>Source</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">e<sub>15</sub>, e<sub>22</sub>, e<sub>31</sub>, e<sub>33</sub></td><td class="num">3.655 &plusmn; 0.022, 2.407 &plusmn; 0.015, 0.328 &plusmn; 0.032, 1.894 &plusmn; 0.054</td><td>C/m&sup2;</td><td>Kushibiki et al. 1999 Table V</td><td class="r"><Badge code="P" pop="r:kushibiki1999" /></td></tr>
            <tr><td class="h">e<sub>15</sub>, e<sub>22</sub>, e<sub>31</sub>, e<sub>33</sub>, RUS at 30 &deg;C</td><td class="num">3.65 &plusmn; 0.03, 2.39 &plusmn; 0.03, 0.31 &plusmn; 0.04, 1.72 &plusmn; 0.18</td><td>C/m&sup2;</td><td>Ogi et al. 2002</td><td class="r"><Badge code="P" pop="r:ogi2002" /></td></tr>
            <tr><td class="h">&epsilon;<sub>11</sub><sup>T</sup>/&epsilon;<sub>0</sub>, &epsilon;<sub>33</sub><sup>T</sup>/&epsilon;<sub>0</sub></td><td class="num">83.3 &plusmn; 0.8, 28.5 &plusmn; 0.3</td><td>1</td><td>Kushibiki et al. 1999 Table IV</td><td class="r"><Badge code="P" pop="r:kushibiki1999" /></td></tr>
            <tr><td class="h">&epsilon;<sub>11</sub><sup>S</sup>/&epsilon;<sub>0</sub>, &epsilon;<sub>33</sub><sup>S</sup>/&epsilon;<sub>0</sub></td><td class="num">44.9 &plusmn; 0.4, 26.7 &plusmn; 0.3</td><td>1</td><td>Kushibiki et al. 1999 Table V</td><td class="r"><Badge code="P" pop="r:kushibiki1999" /></td></tr>
            <tr><td class="h">&epsilon;<sup>T</sup> recomputed from &epsilon;<sup>S</sup> + d e<sup>t</sup></td><td class="num">{C.epsT11}, {C.epsT33}</td><td>1</td><td>Kushibiki et al. 1999 set; within 0.1% of the measured &epsilon;<sup>T</sup></td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">d<sub>15</sub>, d<sub>22</sub>, d<sub>31</sub>, d<sub>33</sub></td><td class="num">{C.d15}, {C.d22}, {C.d31}, {C.d33} (d<sub>16</sub> = {C.d16})</td><td>pC/N</td><td>d = e s<sup>E</sup>, Kushibiki et al. 1999 constants</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">d<sub>15</sub>, d<sub>22</sub>, d<sub>31</sub>, d<sub>33</sub> (Smith and Welsh 1971)</td><td class="num">69.2, 20.8, &minus;0.85, 6.0</td><td>pC/N</td><td>Weis & Gaylord 1985 Table 3</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">d<sub>15</sub>, d<sub>22</sub>, d<sub>31</sub>, d<sub>33</sub> (Warner et al. 1967)</td><td class="num">68, 21, &minus;1.0, 6</td><td>pC/N</td><td>Weis & Gaylord 1985 Table 3</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">d<sub>33</sub> (Yamada et al. 1967)</td><td class="num">16</td><td>pC/N</td><td>Weis & Gaylord 1985 Table 3</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">hydrostatic d<sub>h</sub> = 2d<sub>31</sub> + d<sub>33</sub>, measured</td><td class="num">6.31 &plusmn; 0.014</td><td>pC/N</td><td>Graham 1976 via Weis & Gaylord 1985 p. 198</td><td class="r"><Badge code="P-comp" pop="r:weis1985" /></td></tr>
            <tr><td class="h">d<sub>h</sub> from the Kushibiki et al. 1999 set</td><td class="num">{C.dh}</td><td>pC/N</td><td>+4.9% vs measured</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">g<sub>15</sub>, g<sub>22</sub>, g<sub>33</sub></td><td class="num">{C.g15}, {C.g22}, {C.g33}</td><td>V m/N</td><td>g = &beta;<sup>T</sup>d</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">h<sub>15</sub>, h<sub>22</sub>, h<sub>33</sub></td><td class="num">{C.h15}, {C.h22}, {C.h33}</td><td>10<sup>9</sup> V/m</td><td>h = &beta;<sup>S</sup>e</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">c<sub>33</sub><sup>D</sup>, c<sub>44</sub><sup>D</sup></td><td class="num">{C.cD33}, {C.cD44}</td><td>GPa</td><td>c<sup>D</sup> = c<sup>E</sup> + e<sup>t</sup>h</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">d<sub>33</sub> is the least certain coefficient: tabulated values span 6 to 16 pC/N, and the measured hydrostatic coefficient d<sub>h</sub> = 6.31 pC/N implies d<sub>33</sub> of about 8.0 to 8.4 pC/N given d<sub>31</sub> of &minus;0.85 to &minus;1.04 pC/N, which rules out 12.5 to 16 (derived from the Graham 1976 and compiled d<sub>31</sub> values <Badge code="derived" pop="r:weis1985" />).</p>

      <p class="tx">Longitudinal response along a unit vector <b>n</b> (polar angle &theta; from +Z, azimuth &phi; from +X), from the 3m d tensor:</p>
      <div class="eq"><math display="block"><mrow><msub><mi>d</mi><mi>L</mi></msub><mo>(</mo><mi mathvariant="bold">n</mi><mo>)</mo><mo>=</mo><msub><mi>d</mi><mrow><mi>i</mi><mi>j</mi><mi>k</mi></mrow></msub><msub><mi>n</mi><mi>i</mi></msub><msub><mi>n</mi><mi>j</mi></msub><msub><mi>n</mi><mi>k</mi></msub><mo>=</mo><msub><mi>d</mi><mn>33</mn></msub><msup><mi>cos</mi><mn>3</mn></msup><mi>&theta;</mi><mo>+</mo><mo>(</mo><msub><mi>d</mi><mn>31</mn></msub><mo>+</mo><msub><mi>d</mi><mn>15</mn></msub><mo>)</mo><mi>cos</mi><mi>&theta;</mi><msup><mi>sin</mi><mn>2</mn></msup><mi>&theta;</mi><mo>&minus;</mo><msub><mi>d</mi><mn>22</mn></msub><msup><mi>sin</mi><mn>3</mn></msup><mi>&theta;</mi><mi>sin</mi><mn>3</mn><mi>&phi;</mi></mrow></math><span class="eqn">(2)</span></div>
      <p class="tx">d<sub>L</sub>(+Y) = +d<sub>22</sub> and d<sub>L</sub>(+Z) = +d<sub>33</sub>. The sin 3&phi; term is the threefold axis made visible: in the XY plane the response alternates sign every 60&deg;.</p>

      <h3 class="h3"><span class="term" data-pop="g:electromechanical-coupling">Coupling factors</span></h3>
      <p class="tx">IEEE 176 defines quasistatic material coupling factors from energy ratios, e.g. k<sub>33</sub><sup>2</sup> = d<sub>33</sub><sup>2</sup>/(s<sub>33</sub><sup>E</sup>&epsilon;<sub>33</sub><sup>T</sup>) = (s<sub>33</sub><sup>E</sup> &minus; s<sub>33</sub><sup>D</sup>)/s<sub>33</sub><sup>E</sup>, and thickness-mode factors k<sub>t</sub> = e<sub>33</sub>/(c<sub>33</sub><sup>D</sup>&epsilon;<sub>33</sub><sup>S</sup>)<sup>1/2</sup>, k<sub>15</sub> = e<sub>15</sub>/(c<sub>55</sub><sup>D</sup>&epsilon;<sub>11</sub><sup>S</sup>)<sup>1/2</sup> (Eqs. 124-125, Table 10 <Badge code="P" pop="r:ieee176" />). For the Kushibiki et al. 1999 set:</p>
      <div class="scrollx">
        <table class="idx snd-tab" style="width:auto">
          <thead><tr><th>Factor</th><th class="r">Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">k<sub>t</sub>, thickness extensional, Z-cut plate</td><td class="num">{C.kt} (k<sub>t</sub><sup>2</sup> = {C.kt2})</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">k<sub>15</sub>, thickness shear</td><td class="num">{C.k15} (k<sub>15</sub><sup>2</sup> = {C.k152})</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">k<sub>33</sub>, rod along Z</td><td class="num">{C.k33}</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">k<sub>31</sub></td><td class="num">{C.k31}</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">longitudinal along Y, d<sub>22</sub>/(s<sub>22</sub><sup>E</sup>&epsilon;<sub>22</sub><sup>T</sup>)<sup>1/2</sup></td><td class="num">{C.kY}</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">For a Y-cut plate no single thickness coupling factor exists for class 3m, because two stiffened waves couple at the electrodes (IEEE 176 Sec. 4.3, Eqs. 64-65 <Badge code="P" pop="r:ieee176" />).</p>
      <p class="tx">Pick a matrix below; click a cell to see which full-tensor components it stands for. s<sub>66</sub> stands for four components, each one quarter of the Voigt value; c<sub>66</sub> for the same four with no factor.</p>
      <F32 />
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Conventions">
    <div class="sh"><h2 class="biref">L3 Conventions, frames, error sources</h2><span class="meta">IEEE 176 Eqs. 22, 25, 44-45; Weis & Gaylord 1985</span></div>
    <div class="body">
      <h3 class="h3" style="margin-top:0"><span class="term" data-pop="g:convention-of-2s">Convention of 2s</span></h3>
      <p class="tx">Compressing symmetric index pairs into <span class="term" data-pop="g:voigt-notation">Voigt indices</span> (1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy) puts factors on some quantities and not others <Badge code="P" pop="r:ieee176" />:</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Quantity</th><th>Voigt rule</th><th>Factor</th></tr></thead>
          <tbody>
            <tr><td class="h">stress T<sub>p</sub>, stiffness c<sub>pq</sub>, piezo e<sub>ip</sub>, photoelastic p<sub>pq</sub> (strain-optic), EO r<sub>pk</sub></td><td>T<sub>p</sub> = T<sub>ij</sub>; c<sub>pq</sub> = c<sub>ijkl</sub>; e<sub>ip</sub> = e<sub>ikl</sub></td><td>none</td></tr>
            <tr><td class="h">strain S<sub>p</sub></td><td>S<sub>p</sub> = S<sub>ij</sub> for p = 1..3; S<sub>p</sub> = 2S<sub>ij</sub> for p = 4..6</td><td>2 on shear</td></tr>
            <tr><td class="h">compliance s<sub>pq</sub></td><td>s<sub>ijkl</sub>; 2s<sub>ijkl</sub> if one of p, q in 4..6; 4s<sub>ijkl</sub> if both</td><td>1, 2, 4</td></tr>
            <tr><td class="h">piezo d<sub>iq</sub> (and g<sub>iq</sub>)</td><td>d<sub>ikl</sub> for q = 1..3; 2d<sub>ikl</sub> for q = 4..6</td><td>2 on shear</td></tr>
            <tr><td class="h">piezo-optic &pi;<sub>pq</sub> (stress-optic)</td><td>as s</td><td>1, 2, 4 (hence &pi;<sub>66</sub> = 2(&pi;<sub>11</sub> &minus; &pi;<sub>12</sub>) in Nye's convention)</td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Numerical checks: c<sub>66</sub> = (c<sub>11</sub> &minus; c<sub>12</sub>)/2 but s<sub>66</sub> = 2(s<sub>11</sub> &minus; s<sub>12</sub>); e<sub>16</sub> = &minus;e<sub>22</sub> but d<sub>16</sub> = &minus;2d<sub>22</sub>; c<sub>56</sub> = c<sub>14</sub> but s<sub>56</sub> = 2s<sub>14</sub>; p<sub>66</sub> = (p<sub>11</sub> &minus; p<sub>12</sub>)/2 (Weis & Gaylord 1985 Eqs. 16-17, 19 <Badge code="P" pop="r:weis1985" />). Software that stores tensors in Voigt form must state the convention. Full-rank tensors: <a class="lk" href="/api/v1/tensors.json">/api/v1/tensors.json</a>.</p>

      <h3 class="h3"><span class="term" data-pop="g:sign-frame">Sign frame</span></h3>
      <p class="tx">+Z is the end that becomes negative on compression (equivalently, positive on cooling); IEEE 1987, IRE 1949 (via Weis &amp; Gaylord 1985 pp. 192-193) and IRE 1958 (via Volk &amp; Wöhlecke 2008 p. 2) give the same +Z and +Y for LN (<Badge code="P" pop="r:ieee176" /> <Badge code="P-comp" pop="r:weis1985" /> <Badge code="P-comp" pop="r:volk2008" />). IEEE 176 states a 180&deg; rotation about Z between its 1987 and 1949 axes for quartz (class 32) only. A 180&deg; rotation about Z flips c<sub>14</sub>, s<sub>14</sub>, e<sub>22</sub>, d<sub>22</sub>, p<sub>14</sub>, p<sub>41</sub> and r<sub>22</sub> together; once d<sub>22</sub> &gt; 0 is imposed, no sign freedom remains, and c<sub>14</sub> &gt; 0 follows <Badge code="derived" pop="m-frame" />. Flipping +Z (180&deg; about X) flips every odd-rank tensor (e, d, r, &chi;<sup>(2)</sup>, pyroelectric p<sub>3</sub>) but not c or p.</p>

      <h3 class="h3"><span class="term" data-pop="g:clamped-and-free-s-and-t">Clamped vs free</span></h3>
      <p class="tx">&epsilon;<sup>T</sup> (free, below mechanical resonances) and &epsilon;<sup>S</sup> (clamped, above them) differ by almost a factor 2 for &epsilon;<sub>11</sub> (83.3 vs 44.9 <Badge code="P" pop="r:kushibiki1999" />), because d<sub>15</sub> and e<sub>15</sub> are large. The same mechanism makes r<sup>T</sup> &minus; r<sup>S</sup> = p d large for r<sub>22</sub> and r<sub>51</sub> (Weis & Gaylord 1985 Eq. 13 <Badge code="P" pop="r:weis1985" />); see <a class="lk" href="/light/pockels-effect/">2.2</a>.</p>
      <h3 class="h3">Isothermal vs adiabatic</h3>
      <p class="tx">IEEE 176 makes no notational distinction; adiabatic constants apply under rapidly varying conditions (IEEE 176 p. 7, text after Eq. 21 <Badge code="P" pop="r:ieee176" />).</p>
      <h3 class="h3">Data spread</h3>
      <p class="tx">&epsilon;<sub>33</sub><sup>S</sup> spans 23.7 (Yamada et al. 1967) to 29 (Savage 1966), both via Weis &amp; Gaylord 1985 Table 1 <Badge code="P-comp" pop="r:weis1985" />, and &epsilon;<sub>11</sub><sup>T</sup> 83.3 (Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" />) to 85.2 (Warner et al. 1967, via Weis &amp; Gaylord 1985 <Badge code="P-comp" pop="r:weis1985" />). Values from different sets are shown as a spread, not blended.</p>
      <h3 class="h3">Measurement</h3>
      <p class="tx">Kushibiki et al. 1999 obtained c<sup>E</sup>, e and &epsilon;<sup>S</sup> by fitting bulk-wave velocities measured on X-, Y- and Z-cut plates together with &epsilon;<sup>T</sup> and density (Table II velocities, Tables IV-V constants <Badge code="P" pop="r:kushibiki1999" />). Ogi et al. 2002 used resonant ultrasound spectroscopy at 30 &deg;C <Badge code="P" pop="r:ogi2002" />. Rotating these constants to other axes: rotate full-rank tensors (c<sub>ijkl</sub>, e<sub>ijk</sub>, &epsilon;<sub>ij</sub>); the Bond 6&times;6 matrices (Bond 1943) are equivalent for Voigt storage, and IEEE 176 warns that compressed notation hides transformation properties.</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.1</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
