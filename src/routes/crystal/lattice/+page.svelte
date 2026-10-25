<!-- 1.1 The lattice (content/chapters/01-crystal/manuscript.md Sec. 1; FIG-01-01 Cell explorer). The cell figure is the shared
     unit-cell module (src/lib/figures/lattice.ts, also on the landing page) with chapter overlays (cellx.ts). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountLattice } from "$lib/figures/lattice";
  import { mountCellx } from "$lib/figures/crystal/cellx";
  import { mountOc } from "$lib/figures/crystal/oc";
  import "$lib/figures/crystal/oc.css";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { usePops } from "$lib/content/pops";
  import "$lib/figures/crystal/cellx.css";

  let { data }: { data: PageData } = $props();
  const N = $derived(data.num);

  usePops({
    "d:cell": { h: "Derived from the Hsu et al. 1997 cell", body: "c/a, V = (&radic;3/2) a<sup>2</sup>c, formula units per volume 6/V, X-ray density 6M/(N<sub>A</sub>V) with M = 147.842 g/mol (Weis & Gaylord 1985 p. 193), and the rhombohedral cell from Weis & Gaylord 1985 Eq. (1), evaluated at a = 5.148 &Aring;, c = 13.863 &Aring;. Distances from all periodic images of the expanded cell.", badges: [["d", "derived"]] },
    "d:cleave": { h: "Cleavage angle from the lattice", body: "Plane normal of (01&#773;12) from the reciprocal lattice: tan &phi; = c / (&radic;3 a); angle between plane and c = 90&deg; &minus; &phi;, evaluated with the Hsu et al. 1997 a and c.", badges: [["d", "derived"]] },
    "d:col": { h: "Column sequence", body: "Sites of the octahedral column at fractional (0, 0) in the cell expanded with the 18 operators of R3c :H; empty sites are O<sub>6</sub> centroids with no cation within 1 &Aring;. O<sub>6</sub> centroids repeat every c/6.", badges: [["d", "derived"]] },
    "d:plane": { h: "Empty sites on one plane", body: "In hexagonal fractions the (01&#773;12) planes are y + 2z = const. All six empty octahedral sites of the cell have y + 2z = 0.2917 (mod 1); Li sites 0.5612, Nb sites 0.998. The drawn plane is the member nearest the centre of the cell block.", badges: [["d", "derived"]] },
  });

  let figT: HTMLElement, figV: HTMLElement, figO: HTMLElement;
  const O = $derived(data.ocInit);
  onMount(() => {
    const offs = [mountLattice(figT, figV), mountCellx(figT, figV, data.cellx), mountOc(figO, data.oc), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

<CrystalSection slug="lattice" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Octahedra and symmetry" }, { id: "l2", label: "L2 Cell data" }, { id: "l3", label: "L3 How it is known" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Octahedra and symmetry">
    <div class="sh"><h2 class="biref">L1 Octahedra and symmetry</h2><span class="meta">Hsu et al. 1997, 293 K; Weis & Gaylord 1985</span></div>
    <div class="body">
      <p class="tx">Lithium niobate, LiNbO<sub>3</sub>, is a crystal that does not occur in nature <Badge code="P" pop="r:weis1985|p. 191" />. Its oxygen atoms form flat sheets stacked almost like close-packed spheres. Between the sheets sit <span class="term" data-pop="g:oxygen-octahedron">octahedral holes</span>, each caged by six oxygens. One third of the holes hold lithium, one third hold niobium, and one third are <span class="term" data-pop="g:empty-octahedral-site">empty</span>, and along the crystal's unique axis <i>c</i> they repeat in the order niobium, empty, lithium <Badge code="P" pop="r:weis1985|pp. 191-192" />.</p>
      <p class="tx">The crystal has a threefold rotation axis along <i>c</i> and three <span class="term" data-pop="g:mirror-plane">mirror planes</span> that contain it, 60&deg; apart <Badge code="P" pop="r:weis1985|p. 192, Fig. 3" />. Nothing else: no inversion centre, no fourfold axis. That short list, <span class="term" data-pop="g:point-group-3m">point group 3m</span>, fixes which electrical, optical and mechanical responses can exist at all (<a class="lk" href="/crystal/symmetry/">1.7</a>).</p>

      <ModeVariant>
        {#snippet tech()}
        <div class="cx-cellgrid" data-pair="cellx" bind:this={figT}>
          <figure class="panel cx-cell" style="margin:0">
            <div class="ph"><span>Unit cell: R3c, hexagonal axes, Z = 6</span><span><Badge code="P-db" pop="s-cell" /> <Badge code="derived" pop="s-cell-d" /></span></div>
            <div class="cstage" tabindex="0" role="img" aria-label="ASCII rendering of the hexagonal unit cell of lithium niobate; drag to orbit, arrow keys rotate, plus and minus zoom"><canvas aria-hidden="true"></canvas><canvas class="cx-ov" aria-hidden="true"></canvas><canvas class="cx-inv" aria-hidden="true"></canvas></div>
            <div class="cx-bar">
              <div class="seg" role="group" aria-label="Lattice parts"><button type="button" data-t="nb" title="NbO6 octahedron edges">NbO<sub>6</sub></button><button type="button" data-t="li" title="LiO6 octahedron edges (dashed)">LiO<sub>6</sub></button><button type="button" data-t="vac" title="Empty octahedral sites">empty</button><button type="button" data-t="bonds" title="Nb-O and Li-O bonds">bonds</button><button type="button" data-t="ax" title="a1, a2, c axes; Ps along +c">axes</button><button type="button" data-t="sup" title="2 x 2 x 1 block of cells">2&times;2&times;1</button></div>
              <div class="seg" role="group" aria-label="Overlays"><button type="button" data-cx="rh" title="Rhombohedral primitive cell, edges drawn with :">rhomb. cell</button><button type="button" data-cx="cl" title="Cleavage plane (01-12): hatch /, edge ~, empty sites on it @">(01&#773;12)</button><button type="button" data-cx="col" title="Octahedral column at (0, 0); move the pointer along it">column</button></div>
              <button type="button" class="reset" title="Reset view (key 0)">reset</button>
            </div>
            <div class="cx-legend"><span><b>.:-=+*#%@</b>Nb</span><span><b>.',;il</b>Li</span><span><b>.coO0</b>O</span><span><b>. .</b>empty site</span><span><b>:</b>rhombohedral cell</span><span><b>/ ~ @</b>(01&#773;12), empty site on it</span><span class="rampnote">ramps: shadow to highlight</span></div>
            <div class="readout" aria-live="polite"></div>
          </figure>
          <div class="cx-side">
            <table class="kv">
              <colgroup><col><col class="cv"><col class="cs"></colgroup>
              <tbody>
                <tr><td>Hexagonal cell, 293 K</td><td class="v">a 5.148 &Aring;&nbsp; c 13.863 &Aring;</td><td class="s"><Badge code="P-db" pop="s-cell" /></td></tr>
                <tr><td>Atoms per cell</td><td class="v">Li {N.counts.Li}, Nb {N.counts.Nb}, O {N.counts.O}; empty {N.counts.empty}</td><td class="s"><Badge code="derived" pop="s-cell-d" /></td></tr>
                <tr><td>Rhombohedral cell, Z = 2</td><td class="v">a<sub>R</sub> {N.aR} &Aring;&nbsp; &alpha; {N.alpha}&deg;</td><td class="s"><Badge code="derived" pop="d:cell" /></td></tr>
                <tr><td>(01&#773;12) to c</td><td class="v">{N.cleave}&deg; (meas. 32.75&deg;)</td><td class="s"><Badge code="derived" pop="d:cleave" /></td></tr>
                <tr><td>Nb&ndash;O</td><td class="v">{@html N.nbO} &Aring;</td><td class="s"><Badge code="derived" pop="s-cell-d" /></td></tr>
                <tr><td>Li&ndash;O</td><td class="v">{@html N.liO} &Aring;</td><td class="s"><Badge code="derived" pop="s-cell-d" /></td></tr>
              </tbody>
            </table>
            <div class="cx-ovro">
              <div><span>column</span><output class="cx-colro">off</output></div>
              <div><span>plane</span><output class="cx-clro">off</output></div>
            </div>
            <p class="cx-cap">Every position comes from the CIF of the 293 K synchrotron refinement; sphere sizes are display radii. The rhombohedral cell starts at the cell origin and shares its long diagonal with <i>c</i>; it sticks out of a single hexagonal cell and fits inside the 2&times;2&times;1 block. <i>column</i>: move the pointer along the column at the cell edge, sites light in order along +c.</p>
          </div>
        </div>
        {/snippet}
        {#snippet visual()}
        <figure class="oc-v" data-pair="cellx" bind:this={figO}>
          <div class="oc-panels">
            <div class="oc-pn"><svg class="oc-side" viewBox="0 0 420 640" role="img" aria-label="Side view of the three octahedral columns over one c, six levels each, cations at their heights">{@html O.side}</svg><p class="oc-pc">Side view along the cell edge, heights to scale</p></div>
            <div class="oc-pn"><svg class="oc-top" viewBox="0 0 420 300" role="img" aria-label="Top view of the selected octahedral level: oxygen layer below and above, Nb, Li and empty sites">{@html O.top}</svg><p class="oc-pc">Looking down c on the selected level, 2 &times; 2 cells</p></div>
          </div>
          <div class="oc-side-ctl">
            <div class="v-ctl" style="--w:8ch"><label for="oc-k">Octahedral level along +c</label><output class="oc-ko" for="oc-k">{O.ro.lvl}</output><input class="oc-k" id="oc-k" type="range" min="0" max="5" step="1" value="0"></div>
            <div class="v-seg" role="group" aria-label="Step level"><button type="button" data-oc-step="-1">Down c</button><button type="button" data-oc-step="1">Up c</button></div>
            <dl class="v-hud oc-hud">
              <dt>Centroid height</dt><dd data-oc="z">{O.ro.z}</dd>
              <dt>Sites</dt><dd data-oc="occ" class="oc-occ">{O.ro.occ}</dd>
              <dt>O layers</dt><dd data-oc="o">{O.ro.o}</dd>
            </dl>
            <div class="oc-key"><span><i class="Nb"></i>Nb</span><span><i class="Li"></i>Li</span><span><i class="empty"></i>empty site</span><span><i class="ob"></i>O below</span><span><i class="oa"></i>O above</span></div>
            <p class="v-cap">Step up <i>c</i>: at every level one column holds Nb, one Li, one nothing, and the empty site moves to the next column, so each column reads Nb, empty, Li going up. Positions from the CIF <Badge code="P-db" pop="r:hsu1997|COD 2101845" />; levels and occupants from the expanded cell <Badge code="derived" pop="d:col" />; octahedron outlines schematic.</p>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Cell data">
    <div class="sh"><h2 class="biref">L2 Cell data</h2><span class="meta">trigonal, 3m, R3c</span></div>
    <div class="body">
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Crystal system, point group</td><td>trigonal, <span class="term" data-pop="g:point-group-3m">3m</span> (Schoenflies C<sub>3v</sub>); Weis & Gaylord 1985 prints &ldquo;C<sub>6v</sub>&rdquo;, a typo</td><td class="s"><Badge code="P" pop="r:weis1985|p. 192 Sec. 2.1" /></td></tr>
            <tr><td class="h">Space group, ferroelectric phase</td><td><span class="term" data-pop="g:r3c">R3c</span>, No. 161</td><td class="s"><Badge code="P" pop="r:weis1985|p. 192;hsu1997|abstract" /></td></tr>
            <tr><td class="h">Hexagonal cell, 293 K</td><td class="num">a = 5.148 &Aring;, c = 13.863 &Aring;, Z = 6</td><td class="s"><Badge code="P-db" pop="r:hsu1997|COD 2101845" /></td></tr>
            <tr><td class="h">Hexagonal cell, 24 &deg;C</td><td class="num">a = 5.14829 &Aring;, c = 13.8631 &Aring;</td><td class="s"><Badge code="P-db" pop="r:abrahams1966b|COD 1541936" /></td></tr>
            <tr><td class="h">Congruent / near-stoichiometric</td><td class="num">a = 515.0 / 514.7 pm; c = 1386.4 / 1385.6 pm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3, orig. Furukawa et al. 1999" /></td></tr>
            <tr><td class="h">c/a</td><td class="num">{N.ca}</td><td class="s"><Badge code="derived" pop="d:cell" /></td></tr>
            <tr><td class="h">Cell volume</td><td class="num">{N.V} &Aring;<sup>3</sup> (hexagonal), {N.Vr} &Aring;<sup>3</sup> (rhombohedral)</td><td class="s"><Badge code="derived" pop="d:cell" /></td></tr>
            <tr><td class="h">Formula units per volume</td><td class="num">{N.n} &times; 10<sup>22</sup> cm<sup>&minus;3</sup></td><td class="s"><Badge code="derived" pop="d:cell" /></td></tr>
            <tr><td class="h">X-ray density</td><td class="num">{N.rho} kg/m<sup>3</sup> (M = 147.842 g/mol)</td><td class="s"><Badge code="derived" pop="d:cell" /> <Badge code="P" pop="r:weis1985|p. 193 (M)" /></td></tr>
            <tr><td class="h">Measured density, congruent</td><td class="num">4642.8 &plusmn; 0.2 kg/m<sup>3</sup></td><td class="s"><Badge code="P" pop="r:kushibiki1999|Table IV" /></td></tr>
            <tr><td class="h">Measured density, congruent / near-stoichiometric</td><td class="num">4647 / 4635 kg/m<sup>3</sup></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3 (unit misprinted g cm^-1), orig. Takanaga et al. 1999" /></td></tr>
            <tr><td class="h">Rhombohedral cell</td><td class="num">a<sub>R</sub> = {N.aR} &Aring;, &alpha; = {N.alpha}&deg;, Z = 2</td><td class="s"><Badge code="derived" pop="d:cell" /></td></tr>
            <tr><td class="h">Rhombohedral cell, printed</td><td class="num">5.494 &Aring;, 55.867&deg; (Weis & Gaylord 1985); 5.493(2) &Aring;, 55.89(3)&deg; (Hsu et al. 1997)</td><td class="s"><Badge code="P" pop="r:weis1985|p. 194;hsu1997|abstract" /></td></tr>
            <tr><td class="h">Nb&ndash;O distances</td><td class="num">1.876 &Aring; &times;3, 2.130 &Aring; &times;3</td><td class="s"><Badge code="P-db" pop="r:hsu1997|CIF bond table, COD 2101845" /> <Badge code="derived" pop="s-cell-d" /></td></tr>
            <tr><td class="h">Li&ndash;O distances</td><td class="num">2.063 &Aring; &times;3, 2.245 &Aring; &times;3</td><td class="s"><Badge code="P-db" pop="r:hsu1997|CIF bond table, COD 2101845" /> <Badge code="derived" pop="s-cell-d" /></td></tr>
            <tr><td class="h">Six-coordinate ionic radii</td><td class="num">Li<sup>+</sup> 76 pm, Nb<sup>5+</sup> 64 pm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 2.1 p. 10, after Shannon and Prewitt" /></td></tr>
            <tr><td class="h">Natural cleavage</td><td class="num">{"{"}01&#773;12{"}"}; plane to +c 32.75&deg; meas., 32.7502&deg; calc.; {N.cleave}&deg; from Hsu et al. 1997</td><td class="s"><Badge code="P" pop="r:weis1985|p. 194" /> <Badge code="derived" pop="d:cleave" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Hexagonal to rhombohedral setting</h3>
      <div class="eq"><math display="block"><mrow><msub><mi>a</mi><mi>R</mi></msub><mo>=</mo><mfrac><msqrt><mrow><mn>3</mn><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>c</mi><mn>2</mn></msup></mrow></msqrt><mn>3</mn></mfrac><mo>,</mo><mspace width="1.4em"/><mi>&alpha;</mi><mo>=</mo><mn>2</mn><mspace width="0.15em"/><mi>arcsin</mi><mfrac><mn>3</mn><mrow><mn>2</mn><msqrt><mrow><mn>3</mn><mo>+</mo><msup><mrow><mo>(</mo><mi>c</mi><mo>/</mo><mi>a</mi><mo>)</mo></mrow><mn>2</mn></msup></mrow></msqrt></mrow></mfrac></mrow></math><span class="eqn"><Badge code="P" pop="r:weis1985|Eq. (1)" /></span></div>

      <h3 class="h3">Asymmetric unit, hexagonal axes, R3c :H</h3>
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Atom</th><th>Wyckoff</th><th class="r">x</th><th class="r">y</th><th class="r">z</th></tr></thead>
          <tbody>
            <tr><td>Li</td><td>6a</td><td class="num">0</td><td class="num">0</td><td class="num">0.2806</td></tr>
            <tr><td>Nb</td><td>6a</td><td class="num">0</td><td class="num">0</td><td class="num">&minus;0.0010</td></tr>
            <tr><td>O</td><td>18b</td><td class="num">0.04751</td><td class="num">0.34301</td><td class="num">0.0625</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Coordinates: <Badge code="P-db" pop="r:hsu1997|COD 2101845" />. Expanded with the 18 operators of R3c :H, duplicates removed (counts and distances above).</p>

      <h3 class="h3">Octahedral levels</h3>
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Level</th><th class="r">Centroid z (c)</th><th>Column (0, 0)</th><th>Column (&#8532;, &#8531;)</th><th>Column (&#8531;, &#8532;)</th></tr></thead>
          <tbody>
            {#each data.levels as L, k (k)}<tr><td>{k + 1}</td><td class="num">{L.z}</td>{#each L.occ as o, j (j)}<td>{o}</td>{/each}</tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">O<sub>6</sub> centroids every c/6 in the cell expanded from the CIF <Badge code="derived" pop="d:col" />: every level holds one Nb, one Li and one empty site, and along each column the order is Nb, empty, Li.</p>
      <h3 class="h3">The octahedral column</h3>
      <p class="tx">Along +<i>c</i> in the column at (0, 0), the cations of the expanded cell and the empty sites run <span class="cx-mono">{@html N.column}</span> <Badge code="derived" pop="d:col" />: Nb, empty, Li, Nb, &hellip; going up <i>c</i> <Badge code="P" pop="r:weis1985|p. 192" />, drawn as Li&ndash;Nb&ndash;(empty) chains of face-sharing octahedra <Badge code="P-comp" pop="r:volk2008|p. 10, Fig. 2.1" />. The O<sub>6</sub> centroids sit every <i>c</i>/6 (z = 0.146, 0.313, 0.479, &hellip;). Both cations sit off-centre toward +<i>c</i>: Nb 0.275 &Aring; above its O<sub>6</sub> centroid, Li 0.713 &Aring; above its O<sub>3</sub> face <Badge code="derived" pop="s-cell-d" />, the displacement that carries the polarization (<a class="lk" href="/crystal/polarization/">1.2</a>).</p>
      <p class="tx">The <i>c</i> length equals two Nb&ndash;Li plus two Li&ndash;Nb spacings along the column: 2 &times; 3.922 &Aring; + 2 &times; 3.010 &Aring; = 13.864 &Aring; <Badge code="P" pop="r:weis1985|p. 193, Figs. 5-6" />.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 How it is known">
    <div class="sh"><h2 class="biref">L3 How it is known</h2><span class="meta">diffraction 1966, 1997; settings; glides; cleavage</span></div>
    <div class="body">
      <p class="tx"><b>Structure determination.</b> The full structure was solved at Bell Labs in 1966 by single-crystal X-ray diffraction (part 3) and neutron diffraction (part 4) at 24 &deg;C, with polycrystal X-ray data from 24 to 1200 &deg;C (part 5) <Badge code="P" pop="r:abrahams1966a|title;abrahams1966b|title;abrahams1966c|title" />. The coordinates used here come from a later synchrotron refinement: 20 keV, 0.7 &Aring;, 293 K, R = 0.015 <Badge code="P-db" pop="r:hsu1997|COD 2101845 header" />. The cell file expands the asymmetric unit with all 18 operators of R3c :H, removes duplicates, and locates the empty octahedra as O<sub>6</sub> centroids with no cation within 1.0 &Aring; <Badge code="derived" pop="s-cell-d" />.</p>
      <p class="tx"><b>Three settings.</b> <span class="term" data-pop="g:hexagonal-setting">Hexagonal</span> (Z = 6, 30 atoms), <span class="term" data-pop="g:rhombohedral-setting">rhombohedral</span> (Z = 2, 10 atoms), and the <span class="term" data-pop="g:orthohexagonal-crystal-physics-frame">orthohexagonal Cartesian frame</span> used for tensors <Badge code="P-comp" pop="r:volk2008|p. 2" />. A value of c near 13.86 &Aring; is hexagonal; a value near 5.49 &Aring; is the rhombohedral edge.</p>
      <p class="tx"><b>Mirrors are glides.</b> The mirror operations of the space group carry a translation c/2 (operators such as &minus;y, &minus;x, &frac12; + z in the CIF), so in R3c they are c-<span class="term" data-pop="g:glide-plane">glide planes</span>; the point group 3m keeps only their rotational part, a mirror <Badge code="derived" pop="r:hsu1997|CIF operators" />. The 3.054 &Aring; Nb&ndash;Li distance is not perpendicular to c, correcting the 1966 description <Badge code="P" pop="r:weis1985|p. 193" />.</p>
      <p class="tx"><b>Cleavage.</b> The empty octahedra lie in the {"{"}01&#773;12{"}"} planes, midway between Li and Nb planes; weak bonding across that vacancy plane is the qualitative explanation <Badge code="P" pop="r:weis1985|p. 194" />. In hexagonal fractions those planes are y + 2z = const; every empty site of the cell has y + 2z = 0.2917 (mod 1), the Li sites 0.5612 and the Nb sites 0.998 <Badge code="derived" pop="d:plane" />. The angle follows from the lattice alone: tan &phi; = c / (&radic;3 a) for the plane normal, plane-to-c angle = 90&deg; &minus; &phi; = {N.cleave}&deg; <Badge code="derived" pop="d:cleave" />.</p>
        <figure class="v-cell cx-vcell" id="fig1" data-variant="visual" data-pair="cellx3" bind:this={figV}>
          <div class="cx-vstage-wrap">
            <div class="stage v-frame" role="img" aria-label="Hexagonal unit cell of lithium niobate: 6 Li, 6 Nb, 18 O; drag to orbit, wheel or pinch to zoom">
              <div class="labels" aria-hidden="true"></div>
              <svg class="cx-ov" aria-hidden="true"></svg>
              <button type="button" class="reset" title="Reset view">Reset view</button>
            </div>
            <div class="v-cell-meta"><span class="v-cap"><b>Unit cell</b>R3c, hexagonal axes, Z = 6</span><span><Badge code="P-db" pop="s-cell" /> <Badge code="derived" pop="s-cell-d" /></span></div>
            <div class="hudrow readout1" aria-live="polite"></div>
            <div class="legend1" aria-label="Legend"><span><i class="sw" style="background:var(--nb)"></i>Nb 6a</span><span><i class="sw" style="background:var(--gold)"></i>Li 6a</span><span><i class="sw o"></i>O 18b</span><span><i class="sw e"></i>empty 6a (dashed O<sub>6</sub>)</span></div>
          </div>
          <div class="cx-vside">
            <div><h3>Show</h3><div class="v-seg" role="group" aria-label="Lattice parts"><button type="button" data-t="nb">NbO<sub>6</sub></button><button type="button" data-t="li">LiO<sub>6</sub></button><button type="button" data-t="vac">Empty sites</button><button type="button" data-t="ax">c, P<sub>s</sub></button></div></div>
            <div><h3>Overlay</h3><div class="v-seg" role="group" aria-label="Overlays"><button type="button" data-cx="rh">Rhombohedral cell</button><button type="button" data-cx="cl">Cleavage plane</button><button type="button" data-cx="col">Column</button></div></div>
            <dl class="v-hud">
              <dt>Hexagonal, 293 K</dt><dd>a 5.148 &Aring; &middot; c 13.863 &Aring;</dd>
              <dt>Rhombohedral, Z = 2</dt><dd>a<sub>R</sub> {N.aR} &Aring; &middot; &alpha; {N.alpha}&deg;</dd>
              <dt>(01&#773;12) to c</dt><dd>{N.cleave}&deg; <Badge code="derived" pop="d:cleave" /></dd>
            </dl>
            <dl class="cx-ovro">
              <dt>Column</dt><dd class="cx-colro">off</dd>
              <dt>Plane</dt><dd class="cx-clro">off</dd>
            </dl>
            <p class="v-cap">Turn on the rhombohedral cell: the 10-atom primitive cell grows from the corner and shares its long diagonal with <i>c</i>. The cleavage plane passes through empty octahedra only. With the column on, sweep the pointer along the cell edge: Nb, empty, Li light in order up <i>c</i>.</p>
          </div>
        </figure>
    </div>
  </section>
</CrystalSection>
