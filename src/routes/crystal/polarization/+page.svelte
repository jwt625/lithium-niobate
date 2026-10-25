<!-- 1.2 Where the polarization comes from (content/chapters/01-crystal/manuscript.md Sec. 2; FIG-01-02 One cell, flipped).
     Figure: src/lib/figures/crystal/fl.ts (client), flrender.ts (renderers, also run at prerender), flbuild.ts (server data). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFlip } from "$lib/figures/crystal/fl";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { usePops } from "$lib/content/pops";
  import "$lib/figures/crystal/fl.css";

  let { data }: { data: PageData } = $props();
  const N = $derived(data.num);
  const I = $derived(data.init);
  const R = $derived(data.init.R);

  // svelte-ignore state_referenced_locally
  const n = data.num;
  usePops({
    "d:frames": { h: "Displacements in three frames", body: `Flip model on the Hsu et al. 1997 cell: the down structure is the up structure inverted through the centroid of the Nb O<sub>6</sub> octahedron; each atom is paired with the nearest atom of the same element in the inverted structure; the centrosymmetric reference (s = 0) is the midpoint of each pair. Mean displacement along +c from s = 0 to s = 1, then a rigid shift along c so that the mean O displacement (O frame), the Nb displacement (Nb frame) or the mass-weighted mean displacement (centre of mass; Li 6.94, Nb 92.906, O 15.999 g/mol, IUPAC CIAAW abridged) is zero. Positions at s: r(s) = r<sub>0</sub> + s (r<sub>up</sub> &minus; r<sub>0</sub>).`, badges: [["d", "derived"]] },
    "d:travel": { h: "Travel on reversal", body: `Twice the O-frame displacement: Nb 2 &times; ${n.frames.O[0]} &Aring; = ${n.travelNb} &Aring;, Li 2 &times; ${n.frames.O[1]} &Aring; = ${n.travelLi} &Aring;. The down position of Li lies in the octahedron below its O<sub>3</sub> face, empty in the up structure.`, badges: [["d", "derived"]] },
    "d:volk": { h: "Which frame a quoted number uses", body: "Volk & Wöhlecke 2008 p. 10: Li 44 pm from the oxygen plane, Nb 26&ndash;27 pm from the octahedron centre. Nb 27.5 pm is the O-frame value of this table; Li 43.8 pm is the Nb-frame value (Li height above the O plane in the O frame is 71.3 pm).", badges: [["d", "derived"]] },
    "d:dep": { h: "Unscreened depolarizing field", body: `E = P<sub>s</sub> / (&epsilon;<sub>0</sub> &epsilon;<sub>33</sub>), &epsilon;<sub>33</sub> = 28, &epsilon;<sub>0</sub> = 8.8541878 &times; 10<sup>&minus;12</sup> F/m. P<sub>s</sub> = 0.71 C/m<sup>2</sup>: <span class='v'>${n.Ed} V/m</span>; P<sub>s</sub> = 0.80 C/m<sup>2</sup>: <span class='v'>${n.EdAlt} V/m</span>. Ratio to the congruent coercive field 21 kV/mm: ${n.ratio} (0.71) and ${n.ratioAlt} (0.80).`, badges: [["d", "derived"]] },
    "d:mry": { h: "Well depth: mRy and K", body: `Inbar & Cohen 1996 prints &ldquo;18.3 mRy (2858 K)&rdquo; for LiNbO<sub>3</sub> and &ldquo;17.3 mRy (2739 K)&rdquo; for LiTaO<sub>3</sub>. With 1 Ry / k<sub>B</sub> = 157 887.5 K (CODATA), 18.3 mRy is ${n.mRyK} K. This page prints the paper's pair and computes with 2858 K.`, badges: [["d", "derived"]] },
    "fl-well": { h: "Double well: template shape", body: "U(s) = U<sub>0</sub> (s<sup>2</sup> &minus; 1)<sup>2</sup>: minima at s = &plusmn;1, barrier U<sub>0</sub> at s = 0. Only the depth is sourced: U<sub>0</sub> = 18.3 mRy (2858 K as printed) per 10-atom cell, LAPW frozen-phonon calculation along the coupled Li + O soft-mode coordinate (Inbar & Cohen 1996). Inbar & Cohen 1996 fit its energies with a fourth-order polynomial in the normal-mode amplitude; its coefficients are not used here, and the abscissa here is s, not that amplitude.", badges: [["t", "template"]] },
    "fl-k": { h: "Field coupling: template", body: `Tilt term &minus;t s with t = P<sub>s</sub> V<sub>cell</sub> E / k<sub>B</sub>: the dipole of one 10-atom cell taken as s P<sub>s</sub> V<sub>cell</sub>. P<sub>s</sub> = 0.71 C/m<sup>2</sup> (0.80 would give 12.7% more), V<sub>cell</sub> = ${n.Vcell} &Aring;<sup>3</sup> (hexagonal cell / 3, Hsu et al. 1997): t = ${n.k} K per kV/mm. At 21 kV/mm t = ${n.tEc} K, minima split by ${n.split} K, barrier against switching ${n.barEc} K (${n.barEcPct}%). The barrier vanishes at t = 8U<sub>0</sub>/(3&radic;3), i.e. ${n.Ecrit} kV/mm. A display model of a homogeneous, single-cell reversal; not a computed field response.`, badges: [["t", "template"]] },
    "d:tri": { h: "O<sub>3</sub> triangles along the column", body: `Circumradius of each O<sub>3</sub> face of the column in the refined (s = +1) structure, bottom to top: ${n.tri}. The second is the face between the Li octahedron and the empty octahedron below it.`, badges: [["d", "derived"]] },
    "d:ref0": { h: "s = 0 is R&#773;3c", body: `In the s = 0 positions Li lies in its O<sub>3</sub> face (offset ${n.liFace} &Aring;) and Nb at the centroid of its O<sub>6</sub> octahedron (offset ${n.nbOff} &Aring; along c, ${n.nbLat} &Aring; laterally). O moves only within its plane, by at most ${n.twist} &Aring; between s = 0 and s = 1.`, badges: [["d", "derived"]] },
  });

  let figRoot: HTMLElement;
  onMount(() => {
    const offs = [mountFlip(figRoot, data.fl), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

<CrystalSection slug="polarization" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Off-centre cations" }, { id: "l2", label: "L2 Displacements and energies" }, { id: "l3", label: "L3 Mechanism and limits" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Off-centre cations">
    <div class="sh"><h2 class="biref">L1 Off-centre cations</h2><span class="meta">Hsu et al. 1997, 293 K; Weis & Gaylord 1985; Volk & Wöhlecke 2008</span></div>
    <div class="body" bind:this={figRoot}>
      <p class="tx">Above about 1140 &deg;C (<span class="term" data-pop="g:congruent-melting-composition">congruent</span> crystal) the lithium ions sit in the oxygen sheets and the niobium ions sit at the centres of their <span class="term" data-pop="g:oxygen-octahedron">octahedra</span>; the arrangement looks the same upside down, so it carries no net electric dipole <Badge code="P" pop="r:weis1985|p. 192" />. On cooling through the <span class="term" data-pop="g:curie-temperature">Curie temperature</span> both cations shift the same way along <i>c</i> relative to the oxygen frame. Every unit cell now holds a dipole pointing the same way: a built-in <span class="term" data-pop="g:spontaneous-polarization">polarization</span>, about 0.7 C per square metre of crystal face (0.71 or 0.80 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span>), that no applied field created <Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" />.</p>
      <p class="tx">The two possible directions, up and down <i>c</i>, are mirror images. A strong enough field pushes lithium back through its oxygen triangle and niobium through the middle of its octahedron, and the crystal's <span class="term" data-pop="g:polar-axis">polar axis</span> flips. That reversibility is what makes LiNbO<sub>3</sub> a <span class="term" data-pop="g:ferroelectric">ferroelectric</span>, and what lets engineers write patterns of up and down regions into it (<a class="lk" href="/crystal/domains/">1.8</a>, <a class="lk" href="/crystal/poling/">1.9</a>).</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel fl-t" data-pair="flip">
          <div class="ph"><span>One cell, flipped: octahedral column at (0, 0), projected along <i>a</i></span><span><Badge code="P-db" pop="r:hsu1997|COD 2101845" /> <Badge code="derived" pop="d:frames" /></span></div>
          <div class="fl-tg">
            <div class="fl-artw"><pre class="cx-ascii fl-art" role="img" aria-label="Side projection of three face-sharing octahedra along c: empty, Li and Nb octahedra; O atoms at the corners; ruler in angstrom; displacement bars below">{@html I.art}</pre></div>
            <div class="fl-tside">
              <div class="fl-wh"><span>U(s), depth 18.3 mRy (2858 K) per 10-atom cell</span><span><Badge code="P" pop="r:inbar1996|Sec. III, Fig. 2b" /> <Badge code="template" pop="fl-well" /></span></div>
              <pre class="cx-ascii fl-well" role="img" aria-label="Double-well energy versus s with the current state marked">{@html I.well}</pre>
              <table class="kv fl-kv">
                <colgroup><col><col class="cv"><col class="cs"></colgroup>
                <tbody>
                  <tr><td>Nb along c</td><td class="v"><span class="cx-ro" data-ro="nb">{R.nb}</span></td><td class="s"><Badge code="derived" pop="d:frames" /></td></tr>
                  <tr><td>Li along c</td><td class="v"><span class="cx-ro" data-ro="li">{R.li}</span></td><td class="s"><Badge code="derived" pop="d:frames" /></td></tr>
                  <tr><td>O along c</td><td class="v"><span class="cx-ro" data-ro="o">{R.o}</span></td><td class="s"><Badge code="derived" pop="d:frames" /></td></tr>
                  <tr><td>Li above its O<sub>3</sub> face</td><td class="v"><span class="cx-ro" data-ro="lif">{R.lif}</span></td><td class="s"><Badge code="derived" pop="d:ref0" /></td></tr>
                  <tr><td>Li&ndash;O, face oxygens</td><td class="v"><span class="cx-ro" data-ro="lio">{R.lio}</span></td><td class="s"><Badge code="derived" pop="d:ref0" /></td></tr>
                  <tr><td>U(s)</td><td class="v"><span class="cx-ro" data-ro="u">{R.u}</span></td><td class="s"><Badge code="template" pop="fl-well" /></td></tr>
                  <tr><td>E / E<sub>c</sub>, E<sub>c</sub> 21 kV/mm</td><td class="v"><span class="cx-ro" data-ro="eec">{R.eec}</span></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td></tr>
                  <tr><td>Minima split 2t</td><td class="v"><span class="cx-ro" data-ro="tilt">{R.tilt}</span></td><td class="s"><Badge code="template" pop="fl-k" /></td></tr>
                  <tr><td>Barrier against switching</td><td class="v"><span class="cx-ro" data-ro="bar">{R.bar}</span></td><td class="s"><Badge code="template" pop="fl-k" /></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="ctl"><label for="fl-s">Flip parameter s</label><input id="fl-s" data-fl="s" type="range" min="-1" max="1" step="0.01" value="1"><output for="fl-s" data-ro="s">{R.s}</output></div>
          <div class="ctl"><span class="k">Set s</span><div class="seg" role="group" aria-label="Flip parameter presets"><button type="button" data-fl-s="-1">s &minus;1</button><button type="button" data-fl-s="0">s 0</button><button type="button" data-fl-s="1" class="on">s +1</button></div></div>
          <div class="ctl"><span class="k">Frame</span><div class="seg" role="group" aria-label="Displacement frame"><button type="button" data-fl-frame="O" class="on">O fixed</button><button type="button" data-fl-frame="Nb">Nb fixed</button><button type="button" data-fl-frame="com">c.o.m.</button></div></div>
          <div class="ctl"><label for="fl-e">Field along +c</label><input id="fl-e" data-fl="E" type="range" min="-40" max="40" step="0.5" value="0"><output for="fl-e" data-ro="e">{R.e}</output></div>
          <div class="pf"><span><b>O</b> oxygen</span><span><b>Nb Li</b> cations</span><span><b>&middot;</b> centre of an empty octahedron</span><span>inverted: Li and the O<sub>3</sub> face within 0.3 &Aring;</span><span>s = +1 the refined structure, s = &minus;1 its inversion, linear between <Badge code="derived" pop="d:ref0" /></span><span>field term: P<sub>s</sub> = 0.71 C/m<sup>2</sup> <Badge code="template" pop="fl-k" /></span></div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="fl-v" data-pair="flip">
          <div class="fl-vstage v-frame">
            <svg class="fl-col" viewBox="0 0 520 620" role="img" aria-label="Three face-sharing oxygen octahedra along c, with niobium, lithium and the empty site; the oxygen triangle lithium passes lights up when lithium crosses it; the polarization arrow scales with s">{@html I.col}</svg>
          </div>
          <div class="fl-vside">
            <div class="v-ctl" style="--w:6ch"><label for="flv-s">Flip parameter s</label><output for="flv-s" data-ro="s">{R.s}</output><input id="flv-s" data-fl="s" type="range" min="-1" max="1" step="0.01" value="1"></div>
            <button type="button" class="fl-flipb" data-drive data-fl-flip>Flip</button>
            <div class="v-ctl"><span class="v-lab">Frame held still</span><div class="v-seg" role="group" aria-label="Displacement frame"><button type="button" data-fl-frame="O" class="on">O</button><button type="button" data-fl-frame="Nb">Nb</button><button type="button" data-fl-frame="com">Centre of mass</button></div></div>
            <div class="fl-vwell">
              <div class="fl-vwh"><span>Double well, 18.3 mRy (2858 K) per 10-atom cell</span><span><Badge code="P" pop="r:inbar1996|Sec. III, Fig. 2b" /> <Badge code="template" pop="fl-well" /></span></div>
              <svg class="fl-wsv" viewBox="0 0 420 206" role="img" aria-label="Double-well energy U(s) with a ball at the current s; dashed: zero field">{@html I.wsv}</svg>
            </div>
            <div class="v-ctl" style="--w:11ch"><label for="flv-e">Field along +c <Badge code="template" pop="fl-k" /></label><output for="flv-e" data-ro="e">{R.e}</output><input id="flv-e" data-fl="E" type="range" min="-40" max="40" step="0.5" value="0"></div>
            <dl class="v-hud fl-hud">
              <dt>Nb along c</dt><dd data-ro="nb">{R.nb}</dd>
              <dt>Li along c</dt><dd data-ro="li">{R.li}</dd>
              <dt>O along c</dt><dd data-ro="o">{R.o}</dd>
              <dt>Li above its O<sub>3</sub> face</dt><dd data-ro="lif">{R.lif}</dd>
              <dt>Li&ndash;O, face oxygens</dt><dd data-ro="lio">{R.lio}</dd>
              <dt>E / E<sub>c</sub> (21 kV/mm)</dt><dd data-ro="eec">{R.eec}</dd>
              <dt>Barrier against switching</dt><dd data-ro="bar">{R.bar}</dd>
            </dl>
          </div>
          <div class="fl-vfoot">
            <div class="fl-leg"><span><i class="sw nb"></i>Nb</span><span><i class="sw li"></i>Li</span><span><i class="sw o"></i>O</span><span><i class="sw gh"></i>position at s = 0</span><span><i class="sw rg"></i>O<sub>3</sub> face, lit while Li crosses</span><span>display radii; positions <Badge code="P-db" pop="r:hsu1997|COD 2101845" /> <Badge code="derived" pop="d:frames" /></span></div>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
      <p class="cx-cap fl-cap">Drag s from +1 to &minus;1: niobium slides {N.travelNb} &Aring; through the middle of its cage, lithium threads its O<sub>3</sub> face and drops into the empty octahedron below, and the polarization reverses. Switch the frame: the same relative motion is shared differently among Li, Nb and O. At the congruent coercive field, 21 kV/mm, the field term splits the two minima by {N.split} K against a 2858 K barrier and removes the barrier only near {N.Ecrit} kV/mm (template coupling <Badge code="template" pop="fl-k" />). Real crystals do not switch cell by cell: reversal starts at nuclei on the surface and spreads by sideways motion of <span class="term" data-pop="g:180-deg-domain-wall">domain walls</span> <Badge code="P-comp" pop="r:volk2008|pp. 164, 186-190, 199" /> (<a class="lk" href="/crystal/domains/">1.8</a>, <a class="lk" href="/crystal/poling/">1.9</a>).</p>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Displacements and energies">
    <div class="sh"><h2 class="biref">L2 Displacements and energies</h2><span class="meta">R3c vs R&#773;3c; frames; well; depolarizing field</span></div>
    <div class="body">
      <p class="tx">Displacements from the centrosymmetric reference, computed from the Hsu et al. 1997 coordinates; relative to Nb at z = 0 the reference has Li at z = 1/4 and O layers at z = 1/12 + n/6 (<span class="term" data-pop="g:r-3c">R&#773;3c</span>) <Badge code="derived" pop="d:ref0" />. Values along +<i>c</i> in three frames <Badge code="derived" pop="d:frames" />:</p>
      <ModeVariant>
        {#snippet tech()}
        <div class="cx-tw">
        <table class="idx cx-t fl-ft">
          <thead><tr><th>Frame held still</th><th class="r">Nb, &Aring;</th><th class="r">Li, &Aring;</th><th class="r">O, &Aring;</th></tr></thead>
          <tbody>
            <tr><td class="h">O sublattice</td><td class="num">{@html N.frames.O[0]}<span class="fl-sub">from its O<sub>6</sub> centroid</span></td><td class="num">{@html N.frames.O[1]}<span class="fl-sub">above its O<sub>3</sub> plane</span></td><td class="num">{@html N.frames.O[2]}</td></tr>
            <tr><td class="h">Nb</td><td class="num">{@html N.frames.Nb[0]}</td><td class="num">{@html N.frames.Nb[1]}</td><td class="num">{@html N.frames.Nb[2]}</td></tr>
            <tr><td class="h">Centre of mass</td><td class="num">{@html N.frames.com[0]}</td><td class="num">{@html N.frames.com[1]}</td><td class="num">{@html N.frames.com[2]}</td></tr>
          </tbody>
        </table>
      </div>
        {/snippet}
        {#snippet visual()}
        <figure class="fl-vfr"><svg viewBox="0 0 760 244" role="img" aria-label="Nb, Li and O displacement along c in the three frames; the pattern shifts rigidly from row to row">{@html I.frames}</svg></figure>
        {/snippet}
      </ModeVariant>
      <p class="tx">Only the relative displacements are physical; the three frames show why quoted numbers differ. Volk & Wöhlecke 2008 quotes Li 44 pm from the oxygen plane and Nb 26&ndash;27 pm from the octahedron centre <Badge code="P-comp" pop="r:volk2008|p. 10" />: the Nb value matches the O-fixed frame and the Li value matches the Nb-fixed frame <Badge code="derived" pop="d:volk" />. Total travel on reversal in the O-fixed frame: Nb {N.travelNb} &Aring;, Li {N.travelLi} &Aring;, through the O<sub>3</sub> triangle into the adjacent, previously <span class="term" data-pop="g:empty-octahedral-site">empty octahedron</span> <Badge code="derived" pop="d:travel" />.</p>

      <div class="cx-tw">
        <table class="idx cx-t fl-qt">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Paraelectric space group</td><td>R&#773;3c, No. 167; average structure R&#773;3c with a 10-atom cell</td><td class="s"><Badge code="P-db" pop="r:boysen1994|COD 2101175-2101185 high-T entries" /> <Badge code="P" pop="r:inbar1996|Sec. I" /></td></tr>
            <tr><td class="h">Paraelectric Li position</td><td>equally probable 0.37 &Aring; above or below the O layer (average in the layer)</td><td class="s"><Badge code="P" pop="r:weis1985|p. 192, Fig. 1 caption, after Abrahams et al." /></td></tr>
            <tr><td class="h">Li off its regular site at 600 K</td><td>about 9% (distributed over Li and empty octahedra); increases with T</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 13, orig. Boysen & Altorfer 1994 and Lehnert et al. 1997" /></td></tr>
            <tr><td class="h">Double-well depth, coupled Li + O displacement along the soft-mode coordinate</td><td>18.3 mRy (2858 K) per 10-atom cell (LiTaO<sub>3</sub>: 17.3 mRy); LAPW frozen-phonon, LDA; 18.3 mRy = {N.mRyK} K <Badge code="derived" pop="d:mry" /></td><td class="s"><Badge code="P" pop="r:inbar1996|Sec. III, Fig. 2b" /></td></tr>
            <tr><td class="h">Li displacement alone</td><td>single anharmonic well; &ldquo;hardly changes the energy&rdquo;</td><td class="s"><Badge code="P" pop="r:inbar1996|abstract and Sec. III" /></td></tr>
            <tr><td class="h">Soft-mode frequency, calculated vs measured</td><td>250 cm<sup>&minus;1</sup> vs 250&ndash;275 cm<sup>&minus;1</sup></td><td class="s"><Badge code="P" pop="r:inbar1996|Sec. III" /></td></tr>
            <tr><td class="h">Unscreened depolarizing field of a uniformly polarized plate, E = P<sub>s</sub> / (&epsilon;<sub>0</sub>&epsilon;<sub>33</sub>)</td><td>{@html N.Ed} V/m for P<sub>s</sub> = 0.71 C/m<sup>2</sup>, &epsilon;<sub>33</sub> = 28; {@html N.EdAlt} V/m for 0.80 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span></td><td class="s"><Badge code="derived" pop="d:dep" /> <Badge code="P-comp" pop="r:volk2008|Table 1.1 (Ps)" /> <Badge code="P-comp" pop="r:weis1985|Table 1 (eps33)" /></td></tr>
          </tbody>
        </table>
      </div>
      <div class="eq"><math display="block"><mrow><msub><mi>E</mi><mi>dep</mi></msub><mo>=</mo><mfrac><msub><mi>P</mi><mi>s</mi></msub><mrow><msub><mi>&epsilon;</mi><mn>0</mn></msub><msub><mi>&epsilon;</mi><mn>33</mn></msub></mrow></mfrac><mo>=</mo><mn>{N.EdG}</mn><mspace width="0.2em"/><mi mathvariant="normal">GV/m</mi></mrow></math><span class="eqn"><Badge code="derived" pop="d:dep" /></span></div>
      <p class="tx">Evaluated with P<sub>s</sub> = 0.71 C/m<sup>2</sup>. Bare polar faces never show this field: it is about {N.ratio} times the <span class="term" data-pop="g:coercive-field">coercive field</span> of congruent material (21 kV/mm <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" />, <a class="lk" href="/crystal/domains/">1.8</a>; {N.ratioAlt} times with 0.80 C/m<sup>2</sup>), so surface charge from the surroundings or from internal conduction screens P<sub>s</sub> almost completely; only changes of P<sub>s</sub> (<span class="term" data-pop="g:pyroelectric-effect">pyroelectric</span>, <span class="term" data-pop="g:piezoelectric-effect">piezoelectric</span>) appear as charge <Badge code="derived" pop="d:dep" />.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Mechanism and limits">
    <div class="sh"><h2 class="biref">L3 Mechanism and limits</h2><span class="meta">displacive vs order-disorder; charge density; flip model</span></div>
    <div class="body">
      <p class="tx"><b>Displacive or order-disorder.</b> Weis and Gaylord class LiNbO<sub>3</sub> with displacive ferroelectrics such as BaTiO<sub>3</sub> <Badge code="P" pop="r:weis1985|p. 192" />. Inbar and Cohen review conflicting experimental claims for both pictures and find, from first principles, a double well 2858 K deep, far deeper than kT<sub>c</sub>, which they read as <span class="term" data-pop="g:displacive-vs-order-disorder-transition">order-disorder</span> character, driven by oxygen&ndash;lithium coupling and strong Nb d &ndash; O p hybridization, the same family of mechanism as in the perovskites <Badge code="P" pop="r:inbar1996|abstract, Secs. I and III" />. Neutron diffraction at high temperature sees lithium distributed over split positions <Badge code="P-comp" pop="r:volk2008|p. 13" />. The debate is open.</p>
      <p class="tx"><b>Charge density.</b> A synchrotron deformation-density analysis computes P<sub>s</sub> = 0.43 C/m<sup>2</sup> from Hirshfeld charges against 0.71 C/m<sup>2</sup> measured (0.80 C/m<sup>2</sup> elsewhere <span class="cx-flag" data-pop="c:ps">conflict</span>), and reports electron density transferred from Nb toward the large O<sub>3</sub> triangle near Li <Badge code="P" pop="r:hsu1997|abstract" />. In the refined structure that triangle is the face Li crosses on reversal, the largest O<sub>3</sub> triangle of the column <Badge code="derived" pop="d:tri" />. Point-charge estimates of P<sub>s</sub> depend on the charge partition.</p>
      <p class="tx"><b>Why the switching animation is a cartoon at the atomic scale.</b> The coercive field (about 21 kV/mm) does not remove a 2858 K per-cell barrier: with the template coupling of the figure it lowers the barrier to {N.barEc} K ({N.barEcPct}%), and a homogeneous reversal would need about {N.Ecrit} kV/mm, {N.critRatio} times E<sub>c</sub> <Badge code="template" pop="fl-k" />. Real reversal proceeds by nucleation at surfaces and sideways motion of domain walls <Badge code="P-comp" pop="r:volk2008|pp. 164, 186-190" /> (<a class="lk" href="/crystal/domains/">1.8</a>, <a class="lk" href="/crystal/poling/">1.9</a>).</p>
      <p class="tx"><b>How the figure is computed.</b> The down structure is the refined up structure inverted through the centroid of the Nb O<sub>6</sub> octahedron; each atom is paired with the nearest same-element atom of the inverted structure, and positions move linearly, r(s) = r<sub>0</sub> + s (r<sub>up</sub> &minus; r<sub>0</sub>), with s = 0 the centrosymmetric midpoint <Badge code="derived" pop="d:frames" />. At s = 0 Li lies in its O<sub>3</sub> face and Nb at its O<sub>6</sub> centroid (offsets below 0.001 &Aring;); O moves only sideways, by at most {N.twist} &Aring; <Badge code="derived" pop="d:ref0" />. Frames differ by a rigid shift along <i>c</i>. The energy is a template curve through the computed depth:</p>
      <div class="eq"><math display="block"><mrow><mi>U</mi><mo stretchy="false">(</mo><mi>s</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>U</mi><mn>0</mn></msub><msup><mrow><mo>(</mo><msup><mi>s</mi><mn>2</mn></msup><mo>&minus;</mo><mn>1</mn><mo>)</mo></mrow><mn>2</mn></msup><mo>&minus;</mo><mfrac><mrow><msub><mi>P</mi><mi>s</mi></msub><msub><mi>V</mi><mi>cell</mi></msub><mi>E</mi></mrow><msub><mi>k</mi><mi>B</mi></msub></mfrac><mi>s</mi><mo>,</mo><mspace width="1.2em"/><msub><mi>U</mi><mn>0</mn></msub><mo>=</mo><mn>2858</mn><mspace width="0.2em"/><mi mathvariant="normal">K</mi><mo>,</mo><mspace width="0.8em"/><msub><mi>V</mi><mi>cell</mi></msub><mo>=</mo><mn>{N.Vcell}</mn><mspace width="0.2em"/><msup><mi mathvariant="normal">&Aring;</mi><mn>3</mn></msup></mrow></math><span class="eqn"><Badge code="template" pop="fl-well" /> <Badge code="template" pop="fl-k" /></span></div>
    </div>
  </section>
</CrystalSection>
