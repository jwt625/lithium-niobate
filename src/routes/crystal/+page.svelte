<!-- 01 Crystal: chapter landing. TECH: section index and key-number table. VISUAL: crystal-in-hand 3D specimen (src/lib/scenes,
     boule / wafer / lattice), section cards, the same key numbers as specimen rows. Sources as on the section pages. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { CR_SECTIONS, crHref } from "$lib/figures/crystal/sections";
  import { whenVisual } from "$lib/figures/visual/lifecycle";
  import { isLight } from "$lib/figures/dom";
  import { mountLattice } from "$lib/figures/lattice";
  import "$lib/figures/crystal/cellx.css";
  import "$lib/figures/crystal/crystal.css";
  import "$lib/figures/crystal/landing.css";

  let { data }: { data: PageData } = $props();
  // svelte-ignore state_referenced_locally
  usePops(data.pops);
  usePops({
    "d:boule": { h: "Boule and wafer", body: "Body diameter 153 mm and body length 110 mm: a six-inch congruent boule grown by Czochralski pulling, as reported. Shoulder and tail cones, seed, wafer flats and their orientation are drawn shapes with no source. The lattice view is the R3c cell of the 293 K synchrotron refinement.", badges: [["r", "reported"], ["t", "template"]], src: "Wang, Ji, Dai, Shen, Bao, CrystEngComm 22, 794 (2020), <a href='https://doi.org/10.1039/C9CE01761E'>doi:10.1039/C9CE01761E</a>, values via Chen, Zhu, Liu, Xue, Molecules 26, 7044 (2021), Table 1, <a href='https://doi.org/10.3390/molecules26227044'>doi:10.3390/molecules26227044</a>; lattice: Hsu et al., Acta Cryst. B 53, 420 (1997), COD 2101845." },
  });

  usePops({ "d:q2ps": { h: "Switched charge per area", body: "Reversing P<sub>s</sub> moves Q/A = 2P<sub>s</sub>: 2 &times; 0.71 C/m<sup>2</sup> = 1.42 C/m<sup>2</sup> = 142 &micro;C/cm<sup>2</sup>; with 0.80 C/m<sup>2</sup>, 160 &micro;C/cm<sup>2</sup>.", badges: [["d", "derived"]] } });

  type View = "boule" | "wafer" | "lattice";
  const spec = $state({ view: "boule" as View, cut: "z" as "x" | "z" });
  let stage: HTMLElement, cellT: HTMLElement;
  let scene: { setState: (p: Record<string, unknown>) => void; setTheme: (t?: "dark" | "light") => void; dispose: () => void } | null = null;
  const setView = (v: View): void => { spec.view = v; scene?.setState({ view: v }); };
  const setCut = (c: "x" | "z"): void => { spec.cut = c; scene?.setState({ cut: c }); };

  onMount(() => {
    let alive = true;
    const off = whenVisual(() => {
      void import("$lib/scenes/index").then(({ scenes }) => scenes["crystal-in-hand"]()).then(({ mount }) => {
        if (!alive) return;
        scene = mount(stage, { mode: "visual", theme: isLight() ? "light" : "dark", state: { view: spec.view, cut: spec.cut }, label: "Lithium niobate boule, wafer and lattice; drag to turn, wheel to zoom" }) as unknown as typeof scene;
      }).catch((e) => console.warn("crystal-in-hand unavailable", e));
      return { repaint: () => scene?.setTheme(), dispose: () => scene?.dispose() };
    });
    const offL = mountLattice(cellT, null);
    return () => { alive = false; off(); offL(); };
  });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "01 Crystal" }]} title="01 Crystal"
  depth={[{ id: "overview", label: "Overview" }, { id: "sections", label: "Sections" }, { id: "refs", label: "Sources" }]}>

  <section class="lay" id="overview" data-pair="overview" data-spine="Overview">
    <div class="sh"><h2 class="biref">Overview</h2><span class="meta">room temperature and congruent crystal unless stated</span></div>
    <div class="body">
      <div class="cl-hero" data-variant="visual">
        <div class="cl-stage v-frame" bind:this={stage}></div>
        <div class="cl-side">
          <p class="v-lede">A man-made trigonal ferroelectric: oxygen octahedra filled Nb, empty, Li along the polar axis <i>c</i>, point group 3m.</p>
          <div class="v-ctl"><span class="v-lab">Specimen</span><div class="v-seg" role="group" aria-label="Specimen view">
            <button type="button" class:on={spec.view === "boule"} onclick={() => setView("boule")}>Boule</button><button type="button" class:on={spec.view === "wafer"} onclick={() => setView("wafer")}>Wafer</button><button type="button" class:on={spec.view === "lattice"} onclick={() => setView("lattice")}>Lattice</button>
          </div></div>
          <div class="v-ctl"><span class="v-lab">Cut</span><div class="v-seg" role="group" aria-label="Wafer cut">
            <button type="button" class:on={spec.cut === "x"} onclick={() => setCut("x")}>x-cut</button><button type="button" class:on={spec.cut === "z"} onclick={() => setCut("z")}>z-cut</button>
          </div></div>
          <p class="v-cap">Drag to turn, wheel to zoom. Boule 153 mm across, 110 mm body <Badge code="reported" pop="d:boule" />; cones, seed and flats drawn <Badge code="template" pop="d:boule" />; lattice from the CIF <Badge code="P-db" pop="r:hsu1997|COD 2101845" />.</p>
        </div>
      </div>

      <div class="cl-ov">
        <figure class="panel cx-cell cl-cell" data-variant="tech" style="margin:0" bind:this={cellT}>
          <div class="ph"><span>R3c cell, hexagonal axes, Z = 6, 293 K</span><span><Badge code="P-db" pop="r:hsu1997|COD 2101845" /></span></div>
          <div class="cstage" tabindex="0" role="img" aria-label="ASCII rendering of the hexagonal unit cell of lithium niobate; drag to orbit, arrow keys rotate, plus and minus zoom"><canvas aria-hidden="true"></canvas></div>
          <div class="cx-bar">
            <div class="seg" role="group" aria-label="Lattice parts"><button type="button" data-t="nb" title="NbO6 octahedron edges">NbO<sub>6</sub></button><button type="button" data-t="li" title="LiO6 octahedron edges (dashed)">LiO<sub>6</sub></button><button type="button" data-t="vac" title="Empty octahedral sites">empty</button><button type="button" data-t="ax" title="a1, a2, c axes; Ps along +c">axes</button></div>
            <button type="button" class="reset" title="Reset view (key 0)">reset</button>
          </div>
          <div class="cx-legend"><span><b>.:-=+*#%@</b>Nb</span><span><b>.',;il</b>Li</span><span><b>.coO0</b>O</span><span><b>. .</b>empty site</span><span class="rampnote">ramps: shadow to highlight</span></div>
          <div class="readout" aria-live="polite"></div>
        </figure>
  <div class="cx-tw">
          <table class="idx cx-t cl-num">
            <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th><th>In</th></tr></thead>
            <tbody>
              <tr><td class="h">Space group, point group</td><td><span class="term" data-pop="g:r3c">R3c</span> (No. 161), <span class="term" data-pop="g:point-group-3m">3m</span></td><td class="s"><Badge code="P" pop="r:weis1985|p. 192" /></td><td><a href="/crystal/lattice/">1.1</a></td></tr>
              <tr><td class="h">Hexagonal cell, 293 K</td><td class="num">a = 5.148 &Aring;, c = 13.863 &Aring;, Z = 6</td><td class="s"><Badge code="P-db" pop="r:hsu1997|COD 2101845" /></td><td><a href="/crystal/lattice/">1.1</a></td></tr>
              <tr><td class="h"><span class="term" data-pop="g:spontaneous-polarization">Spontaneous polarization</span></td><td class="num">0.71 C/m<sup>2</sup> | 0.80 &plusmn; 0.05 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /> <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td><td><a href="/crystal/ferroelectric-constants/">1.3</a></td></tr>
              <tr><td class="h"><span class="term" data-pop="g:curie-temperature">Curie temperature</span></td><td class="num">1140 &deg;C; near-stoichiometric 1206 &deg;C</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></td><td><a href="/crystal/ferroelectric-constants/">1.3</a></td></tr>
              <tr><td class="h">Melting point</td><td class="num">1255 &deg;C</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></td><td><a href="/crystal/ferroelectric-constants/">1.3</a></td></tr>
              <tr><td class="h"><span class="term" data-pop="g:congruent-melting-composition">Congruent composition</span></td><td class="num">48.45 mol% Li<sub>2</sub>O, [Li]/[Nb] = 0.94</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 4, 10" /></td><td><a href="/crystal/composition/">1.4</a></td></tr>
              <tr><td class="h">Intrinsic defects, congruent</td><td class="num">about 1% of Li sites Nb<sub>Li</sub>, about 4% empty</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 12, orig. Iyi et al. 1992" /></td><td><a href="/crystal/defects/">1.5</a></td></tr>
              <tr><td class="h">MgO damage threshold, congruent melt</td><td class="num">about 5 mol% MgO</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 34, 38" /></td><td><a href="/crystal/dopants/">1.6</a></td></tr>
              <tr><td class="h">Independent tensor components</td><td class="num">p 1, &epsilon; 2, d 4, r 4, c 6, photoelastic p 8</td><td class="s"><Badge code="P" pop="r:weis1985|Eqs. (2), (4), (8), (12), (16)-(17), (19)" /></td><td><a href="/crystal/symmetry/">1.7</a></td></tr>
              <tr><td class="h"><span class="term" data-pop="g:coercive-field">Coercive field</span></td><td class="num">21 kV/mm; near-stoichiometric 6.0&ndash;6.5 | 2.1&ndash;2.5 kV/mm <span class="cx-flag" data-pop="c:ec-sln">conflict</span></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185 and p. 118" /></td><td><a href="/crystal/domains/">1.8</a></td></tr>
              <tr><td class="h"><span class="term" data-pop="g:internal-field">Internal field</span></td><td class="num">about 2.5 kV/mm</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td><td><a href="/crystal/domains/">1.8</a></td></tr>
              <tr><td class="h">Switched charge 2P<sub>s</sub></td><td class="num">142 &micro;C/cm<sup>2</sup> (0.71) | 160 &micro;C/cm<sup>2</sup> (0.80)</td><td class="s"><Badge code="derived" pop="d:q2ps" /></td><td><a href="/crystal/poling/">1.9</a></td></tr>
              <tr><td class="h">Ideal 180&deg; wall width</td><td class="num">1&ndash;2 lattice units</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" /></td><td><a href="/crystal/domain-walls/">1.10</a></td></tr>
            </tbody>
          </table>
        
      </div>
    </div>
  </section>

  <section class="lay" id="sections" data-pair="sections" data-spine="Sections">
    <div class="sh"><h2 class="biref">Sections</h2><span class="meta">L1 phenomenon, L2 model and data, L3 method and debate</span></div>
    <div class="body">
      <div class="cl-cards" data-variant="visual">
        {#each CR_SECTIONS as s (s.slug)}
          <a class="cl-card" href={crHref(s)}><span class="no">{s.no}</span><span class="t">{s.title}</span><span class="kw">{@html s.kw}</span><span class="fg">{s.figs.join(" · ")}</span></a>
        {/each}
      </div>

      <div class="cx-tw" data-variant="tech">
        <table class="idx cx-t cl-idx">
          <thead><tr><th>No.</th><th>Section</th><th>L1 phenomenon</th><th>L2 model, data</th><th>L3 method, debate</th><th>Figure</th></tr></thead>
          <tbody>
            {#each CR_SECTIONS as s (s.slug)}
              <tr><td>{s.no}</td><td class="h"><a href={crHref(s)}>{s.title}</a></td><td>{@html s.kw}</td><td>{@html s.kw2}</td><td>{@html s.kw3}</td><td>{s.figs.join("; ")}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>



  <section class="lay cx-refs" id="refs" data-pair="refs" data-spine="Sources">
    <div class="sh"><h2 class="biref">Sources</h2><span class="meta">{data.refs.length + 2} cited on this page; each section lists its own</span></div>
    <div class="body">
      <ol class="cx-reflist">
        {#each data.refs as r (r.id)}<li id="ref-{r.id}"><span class="cx-refid">{r.name}</span><span>{@html r.html}</span></li>{/each}
        <li id="ref-wang2020"><span class="cx-refid">Wang et al. 2020</span><span>Wang, Ji, Dai, Shen, Bao, &ldquo;The growth and characterization of six inch lithium niobate crystals with high homogeneity&rdquo;, CrystEngComm 22, 794-801 (2020). <a href="https://doi.org/10.1039/C9CE01761E">doi:10.1039/C9CE01761E</a></span></li>
        <li id="ref-chen2021"><span class="cx-refid">Chen et al. 2021</span><span>Chen, Zhu, Liu, Xue, &ldquo;State of the Art in Crystallization of LiNbO<sub>3</sub> and Their Applications&rdquo;, Molecules 26, 7044 (2021). <a href="https://doi.org/10.3390/molecules26227044">doi:10.3390/molecules26227044</a></span></li>
      </ol>
    </div>
  </section>
</ChapterPage>
