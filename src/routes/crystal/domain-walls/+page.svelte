<!-- 1.10 Domain walls up close (content/chapters/01-crystal/manuscript.md Sec. 10; FIG-01-10 Powers of ten along a wall).
     Figure: src/lib/figures/crystal/pw.ts (client), pw-data.ts (features, renderers, also run at prerender), pwbuild.ts
     (atom strip from the cell file, server). State `wall` in src/lib/stores/crystal.ts. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { mountWall } from "$lib/figures/crystal/pw";
  import { featureAt } from "$lib/figures/crystal/pw-data";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { wall } from "$lib/stores/crystal";
  import "$lib/figures/crystal/pw.css";

  let { data }: { data: PageData } = $props();
  const N = $derived(data.num);
  const I = $derived(data.init);
  const R = $derived(data.init.R);
  const act = featureAt(wall.L).id;
  const z0 = (4 - wall.L).toFixed(2);
  const t0 = wall.th.toFixed(2);

  // svelte-ignore state_referenced_locally
  const n = data.num;
  usePops({
    "d:sig": { h: "Bound charge on an inclined wall", body: `&sigma;<sub>b</sub> = (P<sub>1</sub> &minus; P<sub>2</sub>) &middot; n&#770; = 2 P<sub>s</sub> sin &theta; for antiparallel domains &plusmn;P<sub>s</sub> c&#770; and a wall inclined by &theta; to c. Electron sheet density that screens it: &sigma;<sub>b</sub> / e, e = 1.602176634 &times; 10<sup>&minus;19</sup> C. At &theta; = 1&deg;: P<sub>s</sub> = 0.71 C/m<sup>2</sup> gives <span class='v'>${n.s71} C/m<sup>2</sup> = ${n.n71} cm<sup>&minus;2</sup></span>; 0.80 C/m<sup>2</sup> gives <span class='v'>${n.s80} C/m<sup>2</sup> = ${n.n80} cm<sup>&minus;2</sup></span>. At 5&deg;: ${n.s5} and ${n.s5b} C/m<sup>2</sup>. The drawn lean puts both polarizations pointing into the wall (head-to-head), so &sigma;<sub>b</sub> &gt; 0.`, badges: [["d", "derived"]] },
    "d:sp": { h: "Mean spacing of the bound charges", body: `One elementary charge per square of side (&sigma;<sub>b</sub>/e)<sup>&minus;1/2</sup>: ${n.d71} nm at &theta; = 1&deg;, P<sub>s</sub> = 0.71 C/m<sup>2</sup> (${n.d80} nm for 0.80). Grows as (sin &theta;)<sup>&minus;1/2</sup>.`, badges: [["d", "derived"]] },
    "d:ideal": { h: "1&ndash;2 lattice units in nanometres", body: `Gopalan et al. 2007 (abstract) gives the ideal 180&deg; wall width as one to two lattice units without naming the lattice length. Drawn here as 1&ndash;2 a with the in-plane parameter a = ${n.a} nm (Hsu et al. 1997 cell): ${n.a}&ndash;${n.a2} nm, approximate. With c = ${n.c} nm the same words would mean 1.4&ndash;2.8 nm.`, badges: [["d", "derived"]], src: "static/data/linbo3-cell.json (Hsu et al. 1997 via COD 2101845)" },
    "d:strip": { h: "Atom strip", body: `One octahedral column (Li and Nb on the threefold axis, the O<sub>3</sub> triangles around it) from the Hsu et al. 1997 cell, repeated along a<sub>1</sub> at spacing a = ${n.a} nm and viewed along y; atoms of the neighbouring rows of columns are omitted. Left of the wall the refined structure (s = +1), right of it its inversion (s = &minus;1), from the flip model in the O-sublattice frame: the Li shown at the centre sits ${n.li} pm above its O<sub>3</sub> face on the left and the same distance below it on the right. Each atom is taken from the side of the wall it lies on at its height, so a tilted wall appears stepped. The wall interior is not computed: the step is abrupt.`, badges: [["d", "derived"]] },
    "d:dots": { h: "Bound-charge marks: drawn spacing", body: "Marks sit along the wall at the true mean spacing (&sigma;<sub>b</sub>/e)<sup>&minus;1/2</sup> where that exceeds a display minimum of 12 px &times; &sigma;<sub>b</sub>(5&deg;, 0.71) / &sigma;<sub>b</sub>; otherwise at the display minimum, so mark density grows with &sigma;<sub>b</sub> but is not to scale. TECH: the same rule in character rows (1 row at 5&deg;). Sign: + (head-to-head).", badges: [["t", "template"]] },
    "d:halo": { h: "Microscope view: display rendering", body: "Dark field between crossed polarizers (dark theme) or bright field between parallel polarizers (light theme). Brightness across the wall drawn as exp(&minus;2x<sup>2</sup>/w<sup>2</sup>) with w = 1 &micro;m, so it stays inside the sourced 2 &micro;m birefringent region; the profile itself is not measured. The X-ray strain region (hatched) is not visible optically.", badges: [["t", "template"]] },
    "d:pfm": { h: "PFM-like profile: display shape", body: "Amplitude |tanh(x/x<sub>0</sub>)| with a dip of full width at half depth 65 nm and 150 nm (x<sub>0</sub> = w / (2 artanh 0.5)), the sourced range of probe-limited PFM widths. The shape is a display choice.", badges: [["t", "template"]] },
    "d:view": { h: "Zoom", body: "The view is 8 scale bars wide and centred on the wall. The feature named at a scale is the sourced feature whose representative length (the geometric mean of a range) lies nearest the scale bar on a log axis. Display radii of atoms: O 0.032, Nb 0.030, Li 0.026 nm; the O<sub>3</sub> face the central Li threads is drawn heavier.", badges: [["t", "template"]] },
  });

  let figRoot: HTMLElement;
  onMount(() => {
    const offs = [mountWall(figRoot, data.col), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

{#snippet boxes()}
  <div class="pw-fbi" data-pw-f="strain" class:on={act === "strain"}><p><b>A</b> X-ray shear-strain region: up to 10 &micro;m across the wall <Badge code="P-comp" pop="r:volk2008|pp. 195-196" /></p><p>X-ray topography; attributed to defect clusters pinning the wall</p></div>
  <div class="pw-fbi" data-pw-f="biref" class:on={act === "biref"}><p><b>B</b> Birefringent region: within 2 &micro;m; &Delta;n 10<sup>&minus;5</sup>&ndash;10<sup>&minus;4</sup>, congruent <Badge code="P-comp" pop="r:volk2008|pp. 181, 195-196" /> <Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" /></p><p>polarizing microscopy; about 10&times; less after annealing, much less near stoichiometry</p></div>
  <div class="pw-fbi" data-pw-f="pfm" class:on={act === "pfm"}><p><b>C</b> Wall width by PFM: 65&ndash;150 nm <Badge code="P-comp" pop="r:volk2008|p. 196" /></p><p>probe-limited: the tip, not the wall, sets this width</p></div>
  <div class="pw-fbi" data-pw-f="assumed" class:on={act === "assumed"}><p><b>D</b> 10 nm: wall width assumed by Werner et al. 2017 <Badge code="P" pop="r:werner2017|Results" /></p><p>no measured wall feature here; the assumption converts current to conductivity (1 nm gives about 10&times; more)</p></div>
  <div class="pw-fbi" data-pw-f="ideal" class:on={act === "ideal"}><p><b>E</b> Ideal wall: 1&ndash;2 lattice units, about 0.5&ndash;1.0 nm <Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" /> <Badge code="derived" pop="d:ideal" /></p><p>approximate: drawn with a = {N.a} nm; the source does not name the lattice length</p></div>
  <div class="pw-fbi" data-pw-f="tem" class:on={act === "tem"}><p><b>F</b> Wall width by TEM: not exceeding 0.28 nm, LiTaO<sub>3</sub> <Badge code="P-comp" pop="r:volk2008|p. 196" /></p><p>measured on LiTaO<sub>3</sub>, not LiNbO<sub>3</sub></p></div>
{/snippet}

<CrystalSection slug="domain-walls" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Thin wall, wide halo" }, { id: "l2", label: "L2 Widths and bound charge" }, { id: "l3", label: "L3 Probes and assumptions" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Thin wall, wide halo">
    <div class="sh"><h2 class="biref">L1 Thin wall, wide halo</h2><span class="meta">Gopalan et al. 2007; Volk & Wöhlecke 2008; Werner et al. 2017</span></div>
    <div class="body" bind:this={figRoot}>
      <p class="tx">An ideal <span class="term" data-pop="g:180-deg-domain-wall">180&deg; wall</span> in LiNbO<sub>3</sub> is only one or two unit cells wide <Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" />, yet around a freshly written wall the crystal stays strained and slightly <span class="term" data-pop="g:birefringence">birefringent</span> over micrometres, enough to see walls in a polarizing microscope <Badge code="P-comp" pop="r:volk2008|p. 195" />.</p>
      <p class="tx">If a wall is tilted away from <i>c</i>, the <span class="term" data-pop="g:spontaneous-polarization">polarization</span> on its two sides no longer meets it edge-on and leaves a sheet of bound charge; mobile electrons gather to screen it, and the wall conducts (<span class="term" data-pop="g:charged-domain-wall">charged wall</span>). In <span class="term" data-pop="g:mgo-doping">MgO-doped</span> LN such tilted walls conduct more than 10<sup>13</sup> times better than the surrounding crystal <Badge code="P" pop="r:werner2017|abstract and Results" />.</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel pw-t" data-pair="pw">
          <div class="ph"><span>Powers of ten across a 180&deg; wall; view 8 scale bars wide, wall at the centre</span><span><Badge code="template" pop="d:view" /> <Badge code="derived" pop="d:strip" /></span></div>
          <div class="pw-tg">
            <div class="pw-tl">
              <pre class="cx-ascii pw-rul" role="img" aria-label="Log ruler from 10 micrometres to 0.1 nanometre with feature letters A to F and the current scale bar">{@html I.rul}</pre>
              <div class="pw-fb" aria-live="polite">{@render boxes()}</div>
              <pre class="cx-ascii pw-view" role="img" data-pw-aria aria-label={I.aria}>{@html I.view}</pre>
            </div>
            <div class="pw-tr">
              <div class="cx-tw">
                <table class="kv pw-ft">
                  <colgroup><col class="cl"><col><col class="cs"></colgroup>
                  <tbody>
                    <tr data-pw-li="strain" class:on={act === "strain"}><td class="l">A</td><td>X-ray shear strain, up to 10 &micro;m</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 195-196" /></td></tr>
                    <tr data-pw-li="biref" class:on={act === "biref"}><td class="l">B</td><td>birefringent region, within 2 &micro;m</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 181, 195-196" /></td></tr>
                    <tr data-pw-li="pfm" class:on={act === "pfm"}><td class="l">C</td><td>PFM width 65&ndash;150 nm, probe-limited</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 196" /></td></tr>
                    <tr data-pw-li="assumed" class:on={act === "assumed"}><td class="l">D</td><td>10 nm, assumed (Werner et al. 2017)</td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
                    <tr data-pw-li="ideal" class:on={act === "ideal"}><td class="l">E</td><td>ideal, 1&ndash;2 a &asymp; 0.5&ndash;1.0 nm</td><td class="s"><Badge code="derived" pop="d:ideal" /></td></tr>
                    <tr data-pw-li="tem" class:on={act === "tem"}><td class="l">F</td><td>TEM &le; 0.28 nm, LiTaO<sub>3</sub></td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 196" /></td></tr>
                  </tbody>
                </table>
              </div>
              <table class="kv pw-kv">
                <colgroup><col><col class="cv"><col class="cs"></colgroup>
                <tbody>
                  <tr><td>Scale bar / view</td><td class="v"><span class="cx-ro" data-ro="s">{R.s}</span> <span class="cx-ro" data-ro="w">{R.w}</span></td><td class="s"><Badge code="template" pop="d:view" /></td></tr>
                  <tr><td>Wall tilt from c</td><td class="v"><span class="cx-ro" data-ro="th">{R.th}</span></td><td class="s"></td></tr>
                  <tr><td>&sigma;<sub>b</sub> = 2P<sub>s</sub> sin &theta;</td><td class="v"><span class="cx-ro" data-ro="sig">{R.sig}</span></td><td class="s"><Badge code="derived" pop="d:sig" /></td></tr>
                  <tr><td>&sigma;<sub>b</sub> / e</td><td class="v"><span class="cx-ro" data-ro="n">{R.n}</span></td><td class="s"><Badge code="derived" pop="d:sig" /></td></tr>
                  <tr><td>Mean charge spacing</td><td class="v"><span class="cx-ro" data-ro="sp">{R.sp}</span></td><td class="s"><Badge code="derived" pop="d:sp" /></td></tr>
                  <tr><td>Wall, &theta; &asymp; 1&deg;, MgO:CLN</td><td class="v">0.02 (&Omega; cm)<sup>&minus;1</sup></td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
                  <tr><td>Bulk dark conductivity</td><td class="v">&lt;&lt; 10<sup>&minus;15</sup> (&Omega; cm)<sup>&minus;1</sup></td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
                </tbody>
              </table>
              <pre class="cx-ascii pw-sig" role="img" aria-label="Bound charge versus wall tilt 0 to 5 degrees for the chosen Ps, with the current point and the Werner et al. 2017 wall inclination">{@html I.sig}</pre>
            </div>
          </div>
          <div class="ctl"><label for="pw-z">Scale bar</label><input id="pw-z" data-pw="z" type="range" min="0" max="5" step="0.01" value={z0}><output for="pw-z" data-ro="s">{R.s}</output></div>
          <div class="ctl"><span class="k">Go to</span><div class="seg" role="group" aria-label="Jump to the scale of a feature">
            <button type="button" data-pw-go="strain" class:on={act === "strain"} title="X-ray strain region">A</button><button type="button" data-pw-go="biref" class:on={act === "biref"} title="birefringent region">B</button><button type="button" data-pw-go="pfm" class:on={act === "pfm"} title="PFM width">C</button><button type="button" data-pw-go="assumed" class:on={act === "assumed"} title="assumed width">D</button><button type="button" data-pw-go="ideal" class:on={act === "ideal"} title="ideal wall">E</button><button type="button" data-pw-go="tem" class:on={act === "tem"} title="TEM bound, LiTaO3">F</button></div></div>
          <div class="ctl"><label for="pw-th">Tilt &theta; from c</label><input id="pw-th" data-pw="th" type="range" min="0" max="5" step="0.01" value={t0}><output for="pw-th" data-ro="th">{R.th}</output></div>
          <div class="ctl"><span class="k">Presets</span><div class="pw-pre"><div class="seg" role="group" aria-label="Tilt presets"><button type="button" data-pw-th="0" class:on={wall.th === 0}>0&deg;</button><button type="button" data-pw-th="1" class:on={wall.th === 1}>1&deg;</button><button type="button" data-pw-th="5" class:on={wall.th === 5}>5&deg;</button></div>
            <div class="seg" role="group" aria-label="Spontaneous polarization used"><button type="button" data-pw-ps="0.71" class:on={wall.ps === 0.71}>P<sub>s</sub> 0.71</button><button type="button" data-pw-ps="0.8" class:on={wall.ps === 0.8}>0.80 C/m<sup>2</sup></button></div><span class="cx-flag" data-pop="c:ps">conflict</span></div></div>
          <div class="pw-line"><output data-ro="line">{R.line}</output></div>
          <div class="pf"><span><b>= # ~</b> sourced extent, inner end of a range, assumed width</span><span><b>&lt; &gt;</b> beyond the view</span><span><b>.</b> narrower than one column</span><span><b>L N o</b> Li Nb O, s = &plusmn;1 <Badge code="derived" pop="d:strip" /></span><span><b>+</b> bound charge <Badge code="template" pop="d:dots" /></span><span>P<sub>s</sub> 0.71 or 0.80 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span></span></div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="pw-v" data-pair="pw">
          <div class="pw-vstage v-frame" role="img" data-pw-aria aria-label={I.aria}><svg class="pw-vsvg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">{@html I.vview}</svg></div>
          <div class="pw-vkey"><span><i class="sw nb"></i>Nb</span><span><i class="sw li"></i>Li</span><span><i class="sw o"></i>O</span><span><i class="sw q"></i>bound charge, +</span><span><i class="sw ht"></i>X-ray strain region; assumed width</span><span><i class="sw wl"></i>wall plane</span><span>display radii</span></div>
          <div class="pw-vzoom">
            <div class="pw-vzh">
              <label for="pwv-z">Scale bar</label><output for="pwv-z" data-ro="s">{R.s}</output>
              <span class="pw-vw">view <output data-ro="w">{R.w}</output></span>
              <button type="button" class="pw-dive" data-drive data-pw-dive>Zoom to the seam</button>
            </div>
            <div class="pw-vrul"><svg class="pw-rsvg" viewBox="0 0 1000 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">{@html I.vrul}</svg></div>
            <input id="pwv-z" data-pw="z" type="range" min="0" max="5" step="0.01" value={z0}>
          </div>
          <div class="pw-vrow">
            <div class="pw-vfeat">
              <div class="pw-vfb" aria-live="polite">{@render boxes()}</div>
              <ol class="pw-vleg">
                <li data-pw-li="strain" class:on={act === "strain"}><button type="button" data-drive data-pw-go="strain"><i>A</i><span>X-ray shear strain, up to 10 &micro;m</span></button><Badge code="P-comp" pop="r:volk2008|pp. 195-196" /></li>
                <li data-pw-li="biref" class:on={act === "biref"}><button type="button" data-drive data-pw-go="biref"><i>B</i><span>Birefringent region, within 2 &micro;m</span></button><Badge code="P-comp" pop="r:volk2008|pp. 181, 195-196" /></li>
                <li data-pw-li="pfm" class:on={act === "pfm"}><button type="button" data-drive data-pw-go="pfm"><i>C</i><span>PFM width 65&ndash;150 nm, probe-limited</span></button><Badge code="P-comp" pop="r:volk2008|p. 196" /></li>
                <li data-pw-li="assumed" class:on={act === "assumed"}><button type="button" data-drive data-pw-go="assumed"><i>D</i><span>10 nm, assumed in Werner et al. 2017</span></button><Badge code="P" pop="r:werner2017|Results" /></li>
                <li data-pw-li="ideal" class:on={act === "ideal"}><button type="button" data-drive data-pw-go="ideal"><i>E</i><span>Ideal wall, 1&ndash;2 a &asymp; 0.5&ndash;1.0 nm</span></button><Badge code="derived" pop="d:ideal" /></li>
                <li data-pw-li="tem" class:on={act === "tem"}><button type="button" data-drive data-pw-go="tem"><i>F</i><span>TEM &le; 0.28 nm, LiTaO<sub>3</sub></span></button><Badge code="P-comp" pop="r:volk2008|p. 196" /></li>
              </ol>
            </div>
            <div class="pw-vtilt">
              <div class="v-ctl" style="--w:6ch"><label for="pwv-th">Tilt the wall from c</label><output for="pwv-th" data-ro="thv">{R.thv}</output><input id="pwv-th" data-pw="th" type="range" min="0" max="5" step="0.01" value={t0}></div>
              <div class="pw-vps"><span class="v-lab">P<sub>s</sub></span><div class="v-seg" role="group" aria-label="Spontaneous polarization used"><button type="button" data-pw-ps="0.71" class:on={wall.ps === 0.71}>0.71 C/m<sup>2</sup></button><button type="button" data-pw-ps="0.8" class:on={wall.ps === 0.8}>0.80 C/m<sup>2</sup></button></div><span class="cx-flag" data-pop="c:ps">conflict</span></div>
              <dl class="v-hud pw-hud">
                <dt>&sigma;<sub>b</sub> = 2P<sub>s</sub> sin &theta; <Badge code="derived" pop="d:sig" /></dt><dd><span data-ro="sigv">{R.sigv}</span> C/m<sup>2</sup></dd>
                <dt>Screening electrons <Badge code="derived" pop="d:sig" /></dt><dd><span data-ro="nv">{R.nv}</span> cm<sup>&minus;2</sup></dd>
                <dt>One charge every <Badge code="derived" pop="d:sp" /></dt><dd><span data-ro="sp">{R.sp}</span></dd>
              </dl>
              <div class="pw-vchg"><svg class="pw-csvg" viewBox="0 0 560 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Bound charge versus wall tilt for Ps 0.71 and 0.80 C per square metre with the current point; below, the Werner et al. 2017 wall conductivity, 0.02 per ohm centimetre at about 1 degree for a 10 nm assumed width, and the bulk bound below 1e-15">{@html I.vchg}</svg></div>
            </div>
          </div>
          <div class="v-prov">
            <span>Drag the scale bar or press the zoom button; tilt the wall to grow the bound-charge sheet</span>
            <span>microscope view <Badge code="template" pop="d:halo" /></span>
            <span>PFM profile <Badge code="template" pop="d:pfm" /></span>
            <span>atoms <Badge code="P-db" pop="r:hsu1997|COD 2101845" /> <Badge code="derived" pop="d:strip" /></span>
            <span>charge marks <Badge code="template" pop="d:dots" /></span>
            <span>wall conductivity: one point, no curve <Badge code="P" pop="r:werner2017|Results" /></span>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
      <p class="cx-cap pw-cap">Zoom from 10 &micro;m to 0.1 nm: the micrometre halo that a polarizing microscope sees narrows to the probe-limited PFM width, then to the seam one to two lattice units wide where lithium sits above its oxygen plane on one side and below it on the other. Tilt the wall by 1&deg; and a bound-charge sheet of {N.s71} C/m<sup>2</sup>, {@html N.n71} electrons per cm<sup>2</sup> to screen it (P<sub>s</sub> = 0.71 C/m<sup>2</sup>; {@html N.n80} for 0.80), appears along the wall: one charge per {N.d71} nm square. Conductivity enters only as the single Werner et al. 2017 point.</p>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Widths and bound charge">
    <div class="sh"><h2 class="biref">L2 Widths and bound charge</h2><span class="meta">wall quantities; one charged-wall example</span></div>
    <div class="body">
      <div class="cx-tw">
        <table class="idx cx-t pw-qt">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Ideal wall width</td><td>1&ndash;2 lattice units (about 0.5&ndash;1.0 nm with a = {N.a} nm; approximate)</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" /> <Badge code="derived" pop="d:ideal" /></td></tr>
            <tr><td class="h">Wall width by piezoresponse force microscopy (PFM)</td><td>65&ndash;150 nm (probe-limited)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 196" /></td></tr>
            <tr><td class="h">Wall width by TEM, LiTaO<sub>3</sub></td><td>not exceeding 0.28 nm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 196" /></td></tr>
            <tr><td class="h">Switching-induced birefringence near walls, congruent</td><td>10<sup>&minus;5</sup> to 10<sup>&minus;4</sup>; reduced about 10&times; by annealing; much smaller near stoichiometry</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 181, 195" /></td></tr>
            <tr><td class="h">Width of the birefringent region</td><td>within 2 &micro;m; shear-strain region by X-ray topography up to 10 &micro;m</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 195-196" /></td></tr>
            <tr><td class="h">Wall energy, from wall bowing between pinning centres</td><td>0.2&ndash;0.4 J/m<sup>2</sup> (calculated)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 191, orig. Yang et al. 1999" /></td></tr>
            <tr><td class="h">Bound charge on a wall inclined by &theta; to c</td><td>&sigma;<sub>b</sub> = 2P<sub>s</sub> sin &theta;; at &theta; = 1&deg;: {N.s71} C/m<sup>2</sup> = {@html N.n71} e/cm<sup>2</sup> (P<sub>s</sub> = 0.71 C/m<sup>2</sup>), {N.s80} C/m<sup>2</sup> = {@html N.n80} e/cm<sup>2</sup> (0.80 C/m<sup>2</sup>) <span class="cx-flag" data-pop="c:ps">conflict</span></td><td class="s"><Badge code="derived" pop="d:sig" /></td></tr>
          </tbody>
        </table>
      </div>
      <div class="eq"><math display="block"><mrow><msub><mi>&sigma;</mi><mi>b</mi></msub><mo>=</mo><mrow><mo>(</mo><msub><mi mathvariant="bold">P</mi><mn>1</mn></msub><mo>&minus;</mo><msub><mi mathvariant="bold">P</mi><mn>2</mn></msub><mo>)</mo></mrow><mo>&middot;</mo><mover><mi mathvariant="bold">n</mi><mo>^</mo></mover><mo>=</mo><mn>2</mn><msub><mi>P</mi><mi>s</mi></msub><mi>sin</mi><mi>&theta;</mi><mo>,</mo><mspace width="1.2em"/><msub><mi>n</mi><mi>e</mi></msub><mo>=</mo><mfrac><msub><mi>&sigma;</mi><mi>b</mi></msub><mi>e</mi></mfrac></mrow></math><span class="eqn"><Badge code="derived" pop="d:sig" /></span></div>
      <h3 class="h3">Charged-wall conduction: one sourced example</h3>
      <p class="tx">The numbers below describe one crystal and one writing method; they are a data point, not a material constant (<span class="term" data-pop="g:domain-wall-conduction">domain-wall conduction</span>).</p>
      <div class="cx-tw">
        <table class="idx cx-t pw-qt">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Crystal</td><td><span class="term" data-pop="g:z-cut">z-cut</span> <span class="term" data-pop="g:congruent-melting-composition">congruent</span> LN + 5 mol% MgO, 300 &micro;m</td><td class="s"><Badge code="P" pop="r:werner2017|Methods" /></td></tr>
            <tr><td class="h">Wall writing</td><td>room-temperature tip (&ldquo;calligraphic&rdquo;) poling with current feedback at about 30 nA; lines about 10 &micro;m wide, mm long</td><td class="s"><Badge code="P" pop="r:werner2017|Methods" /></td></tr>
            <tr><td class="h">Wall inclination</td><td>about 1&deg;</td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
            <tr><td class="h">Wall conductivity (wall width 10 nm assumed)</td><td>about 0.02 (&Omega; cm)<sup>&minus;1</sup>; bulk <span class="term" data-pop="g:dark-conductivity">dark conductivity</span> well below 10<sup>&minus;15</sup> (&Omega; cm)<sup>&minus;1</sup></td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
            <tr><td class="h">Current</td><td>single wall about 0.55 &micro;A at 50 V; 732 parallel 1 mm walls approach 10 mA</td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
            <tr><td class="h">Stability</td><td>stable at &le; 70 &deg;C (about 1% fluctuation over 35 h at 30 &deg;C); activation energy 0.10 &plusmn; 0.01 eV below 70 &deg;C</td><td class="s"><Badge code="P" pop="r:werner2017|Results" /></td></tr>
            <tr><td class="h">Earlier demonstration</td><td>mm-thick LN single crystals; wall conduction switched by super-<span class="term" data-pop="g:bandgap">bandgap</span> light and tuned by wall tilt</td><td class="s"><Badge code="P" text="P(abs)" pop="r:schroder2012|abstract" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Probes and assumptions">
    <div class="sh"><h2 class="biref">L3 Probes and assumptions</h2><span class="meta">defect pinning; wall-imaging methods; assumed width</span></div>
    <div class="body">
      <p class="tx"><b>Why walls are &ldquo;thick&rdquo; in congruent crystal.</b> The extended strain and space-charge fields are attributed to defect clusters pinning the wall <Badge code="P-comp" pop="r:volk2008|pp. 195-197" /> <Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" />: extrinsic point defects and their clustering control the local wall structure and change macroscopic properties by orders of magnitude. PFM profiles are symmetric across walls in <span class="term" data-pop="g:sln-nsln">stoichiometric</span> crystal and asymmetric in congruent crystal, read indirectly as a trace of the <span class="term" data-pop="g:internal-field">internal field</span> <Badge code="P-comp" pop="r:volk2008|p. 197" />. The mechanism remains qualitative.</p>
      <p class="tx"><b>Measuring walls.</b> Selective etching (the <span class="term" data-pop="g:miller-savage-method">Miller-Savage</span> wall-velocity method), polarizing microscopy of wall birefringence, electro-optic imaging, near-field optics, PFM, SHG microscopy, X-ray topography <Badge code="P-comp" pop="r:volk2008|pp. 168-171, 181" />. The measured width depends on the probe; the 0.28 nm TEM value is for LiTaO<sub>3</sub>, not LiNbO<sub>3</sub> <Badge code="P-comp" pop="r:volk2008|p. 196" />.</p>
      <p class="tx"><b>Conduction numbers depend on the assumed wall width.</b> 10 nm gives 0.02 (&Omega; cm)<sup>&minus;1</sup>; 1 nm gives about ten times more <Badge code="P" pop="r:werner2017|Results" />. In Schröder et al. 2012, wall transport in undoped crystal was switched by super-bandgap illumination <Badge code="P" text="P(abs)" pop="r:schroder2012|abstract" />.</p>
      <p class="tx"><b>How the figure is computed.</b> Each scale feature is drawn at its sourced full width around the wall; the feature named at a scale is the one whose representative length is nearest the scale bar on a log axis <Badge code="template" pop="d:view" />. The atom strip repeats one octahedral column of the Hsu et al. 1997 cell along a<sub>1</sub>, with the refined structure (s = +1) left of the wall and its inversion (s = &minus;1) right of it; Li sits {N.li} pm above or below its O<sub>3</sub> face <Badge code="derived" pop="d:strip" />. The bound charge is &sigma;<sub>b</sub> = 2P<sub>s</sub> sin &theta; with P<sub>s</sub> = 0.71 or 0.80 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span> <Badge code="derived" pop="d:sig" />; the microscope halo and the PFM profile shape are display renderings <Badge code="template" pop="d:halo" /> <Badge code="template" pop="d:pfm" />.</p>
    </div>
  </section>
</CrystalSection>
