<!-- 1.4 Composition: congruent and stoichiometric (content/chapters/01-crystal/manuscript.md Sec. 4; FIG-01-03 Composition
     dial). Figure modules: src/lib/figures/crystal/cp.ts (browser), cpmodel.ts and cpaxis.ts (pure, also run by the server
     load for the prerendered state). -->
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
  const R = $derived(data.init.ro);
  const A = $derived(data.init.ascii);
  const S = $derived(data.init.svg);
  const N = $derived(data.num);

  usePops({
    "d:cp-r": { h: "Composition ratios", body: "R1 = [Li]/[Nb] = c / (100 &minus; c); R2 = [Li]/([Li] + [Nb]) = c / 100, with c the Li<sub>2</sub>O content in mol% (one Li<sub>2</sub>O carries two Li, one Nb<sub>2</sub>O<sub>5</sub> two Nb). Evaluated at the dial position.", badges: [["d", "derived"]] },
    "d:cp-x": { h: "Antisite fraction x and site fractions", body: "Li-site vacancy model [Li<sub>1&minus;5x</sub>Nb<sub>Li,x</sub>V<sub>Li,4x</sub>]NbO<sub>3</sub>; Nb-site vacancy model [Li<sub>1&minus;5x</sub>Nb<sub>Li,5x</sub>][Nb<sub>1&minus;4x</sub>V<sub>Nb,4x</sub>]O<sub>3</sub>. Both give R2 = (1 &minus; 5x)/(2 &minus; 4x), so x = (1 &minus; 2R2)/(5 &minus; 4R2) and identical R1 for both models. Li-site model: Nb<sub>Li</sub> = x, V<sub>Li</sub> = 4x of Li sites; Nb-site model: Nb<sub>Li</sub> = 5x of Li sites, V<sub>Nb</sub> = 4x of Nb sites.", badges: [["pc", "P-comp"], ["d", "derived"]], src: "Models: Volk & Wöhlecke 2008 Eqs. (2.5)-(2.6) pp. 12-13. Inversion: derived." },
    "d:cp-tc": { h: "T<sub>c</sub> from the two fits", body: "T<sub>c</sub> = 39.26 c &minus; 760.67 (Iyi, DTA, 4 crystals) and T<sub>c</sub> = 39.064 c &minus; 746.73 (Bordui, dielectric, 5 VTE crystals), &deg;C, c in mol% Li<sub>2</sub>O. The band spans the two values at the dial position.", badges: [["pc", "P-comp"], ["d", "derived"]], src: "Volk & Wöhlecke 2008 Eqs. (6.2)-(6.3) p. 140" },
    "d:cp-uv": { h: "UV edge from the calibration formulas", body: "&lambda;<sub>20</sub> = 320.4 &minus; 1.829 x &minus; 5.485 x<sup>2</sup> nm and &lambda;<sub>15</sub> = 321.9 &minus; 1.597 x &minus; 5.745 x<sup>2</sup> nm, x = c &minus; 48.38 mol%, 22 &deg;C, E &parallel; c, k &perp; c: wavelength at which the absorption coefficient reaches 20 or 15 cm<sup>&minus;1</sup>. Applied only for 48.0&ndash;50.0 mol%; outside, the figure greys the bar. The calibration range of Kovacs et al. 1997 itself was not read; 48.0&ndash;50.0 is the display window.", badges: [["pc", "P-comp"], ["d", "derived"]], src: "Volk & Wöhlecke 2008 Eqs. (6.5)-(6.6) p. 142, calibration of Kovacs et al. 1997" },
    "d:cp-lat": { h: "Lattice texture", body: "One site per character (TECH, 32 &times; 12) or dot (VISUAL, 30 &times; 12, triangular lattice). Sites are taken in a fixed pseudo-random order (seededLattice, seed 1949); the first round(5x N) Li sites are defects in either model. Li-site model: every fifth of them is Nb<sub>Li</sub>, the rest V<sub>Li</sub>; Nb-site model: all are Nb<sub>Li</sub>, and round(4x N) Nb sites of a second order are V<sub>Nb</sub>. Raising c removes defects in place. Drawn counts are rounded; the exact fractions are in the readouts.", badges: [["d", "derived"]] },
    "d:cp-anch": { h: "Field anchors: no interpolation", body: "E<sub>c</sub> and E<sub>int</sub> are shown only while c lies inside an anchor span: congruent 48.38&ndash;48.6 mol% (the tabulated congruent compositions) and near-stoichiometric 49.8&ndash;50.0 mol% (from C = 0.498, the near-stoichiometric crystal of Gopalan et al. 1998; Volk & Wöhlecke 2008 Table 7.1 states no composition). Between the spans no value is drawn: no source gives E<sub>c</sub> or E<sub>int</sub> as a function of c.", badges: [["pc", "P-comp"]], src: "Volk & Wöhlecke 2008 Table 7.1 p. 185 and p. 181; Gopalan et al. 1998 abstract" },
    "d:cp-l1": { h: "One Li site in twenty", body: () => `At 48.45 mol% the Li-site model gives Nb<sub>Li</sub> + V<sub>Li</sub> = 5x = ${data.num.vac45}% of Li sites; the Nb-site model gives the same fraction as Nb<sub>Li</sub>. Either way about 1 in 20 Li sites holds no Li.`, badges: [["d", "derived"]] },
    "d:cp-shift": { h: "Congruent to stoichiometric", body: () => `T<sub>c</sub> rises by ${data.num.dTc} &deg;C (Iyi / Bordui fit) from 48.45 to 50.0 mol%; &lambda;<sub>20</sub> moves ${data.num.dUv} nm to shorter wavelength over the same step.`, badges: [["d", "derived"]] },
    "cp-b5": { h: "R1 misprint in Volk & Wöhlecke 2008", body: () => `Volk & Wöhlecke 2008 p. 5 prints R1 = 0.969 next to R2 = 0.4845. R2 = 0.4845 gives R1 = 0.4845/0.5155 = ${data.num.r1_4845}, matching its p. 10 value 0.94; R1 = 0.969 would mean R2 = ${data.num.r1_969}. This page uses 0.940.`, badges: [["d", "derived"]], src: "Volk & Wöhlecke 2008 pp. 5, 10" },
  });

  let body: HTMLElement;
  onMount(() => {
    const offs = [mountCp(body, "dial"), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

<CrystalSection slug="composition" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 A range, not a formula" }, { id: "l2", label: "L2 Composition data" }, { id: "l3", label: "L3 How it is measured" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 A range, not a formula" bind:this={body}>
    <div class="sh"><h2 class="biref">L1 A range, not a formula</h2><span class="meta">48.0&ndash;50.0 mol% Li<sub>2</sub>O; Volk & Wöhlecke 2008</span></div>
    <div class="body">
      <p class="tx">&ldquo;LiNbO<sub>3</sub>&rdquo; is a range, not a formula. The crystal is stable from roughly 47 to 50 mol% Li<sub>2</sub>O, always on the lithium-poor side of the ideal 50% <Badge code="P-comp" pop="r:volk2008|p. 10" />. When the melt and the growing crystal have the same composition, the crystal grows uniform from seed to tail. For LiNbO<sub>3</sub> that <span class="term" data-pop="g:congruent-melting-composition">congruent</span> point is about 48.4&ndash;48.5 mol% Li<sub>2</sub>O, a lithium-to-niobium ratio of 0.94 <Badge code="P-comp" pop="r:volk2008|pp. 4, 10" />, so in nearly every commercial crystal about one lithium site in twenty holds no lithium <Badge code="derived" pop="d:cp-l1" />.</p>
      <p class="tx">Removing that deficit changes the crystal: <span class="term" data-pop="g:curie-temperature">Curie temperature</span> up by about 60 &deg;C, <span class="term" data-pop="g:uv-absorption-edge">UV absorption edge</span> about 17 nm toward shorter wavelengths <Badge code="derived" pop="d:cp-shift" />, the field needed to flip the polarization several-fold lower, and the built-in bias field gone (<a class="lk" href="/crystal/ferroelectric-constants/">1.3</a>, <a class="lk" href="/crystal/domains/">1.8</a>). <span class="term" data-pop="g:sln-nsln">Stoichiometric</span> crystal cannot be pulled from a stoichiometric melt; it needs one of the growth routes in L2.</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel cp-dial" data-pair="cpdial">
          <div class="ph"><span>Composition dial: c = 48.00&ndash;50.00 mol% Li<sub>2</sub>O</span><span><Badge code="P-comp" pop="r:volk2008|Eqs. (2.5)-(2.6), (6.2)-(6.3), (6.5)-(6.6)" /> <Badge code="derived" pop="d:cp-x" /></span></div>
          <div class="ctl"><label for="cp-c">c, Li<sub>2</sub>O</label><input id="cp-c" data-cp="c" type="range" min="48" max="50" step="0.01" value={R.cv}><output for="cp-c" data-o="c">{R.c}</output></div>
          <div class="ctl cp-row"><span class="k">preset</span><div class="seg" role="group" aria-label="Composition presets"><button type="button" data-c="48.38" title="vendor congruent value, UV-edge reference">48.38</button><button type="button" data-c="48.45" class="on" title="congruent, Volk & Wöhlecke 2008">48.45</button><button type="button" data-c="48.6" title="congruent, Carruthers et al. 1971">48.60</button><button type="button" data-c="49.8" title="C = 0.498, Gopalan et al. 1998 near-stoichiometric crystal">49.80</button><button type="button" data-c="50" title="stoichiometric">50.00</button></div></div>
          <div class="ctl cp-row"><span class="k">defect model</span><div class="seg" role="group" aria-label="Defect compensation model"><button type="button" data-model="Li-site" class="on">Li-site vacancy</button><button type="button" data-model="Nb-site">Nb-site vacancy</button></div></div>
          <div class="cp-grid">
            <div class="cp-out">
              <table class="kv cp-kv">
                <colgroup><col><col class="cv"><col class="cs"></colgroup>
                <tbody>
                  <tr><td>[Li]/[Nb], R1</td><td class="v" data-o="r1">{R.r1}</td><td class="s"><Badge code="derived" pop="d:cp-r" /></td></tr>
                  <tr><td>[Li]/([Li]+[Nb]), R2</td><td class="v" data-o="r2">{R.r2}</td><td class="s"><Badge code="derived" pop="d:cp-r" /></td></tr>
                  <tr><td>x, per formula unit</td><td class="v" data-o="x">{R.x}</td><td class="s"><Badge code="derived" pop="d:cp-x" /></td></tr>
                  <tr><td>Nb<sub>Li</sub>, of Li sites</td><td class="v" data-o="nbli">{R.nbli}</td><td class="s"><Badge code="derived" pop="d:cp-x" /></td></tr>
                  <tr><td>V<sub>Li</sub>, of Li sites</td><td class="v" data-o="vli">{R.vli}</td><td class="s"><Badge code="derived" pop="d:cp-x" /></td></tr>
                  <tr><td>V<sub>Nb</sub>, of Nb sites</td><td class="v" data-o="vnb">{R.vnb}</td><td class="s"><Badge code="derived" pop="d:cp-x" /></td></tr>
                  <tr><td>T<sub>c</sub>, Iyi fit</td><td class="v" data-o="tci">{R.tci}</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Eq. (6.2) p. 140;iyi1992|via Volk & Wöhlecke 2008" /></td></tr>
                  <tr><td>T<sub>c</sub>, Bordui fit</td><td class="v" data-o="tcb">{R.tcb}</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Eq. (6.3) p. 140;bordui1992|via Volk & Wöhlecke 2008" /></td></tr>
                  <tr><td>T<sub>m</sub>, congruent</td><td class="v">1255 °C</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></td></tr>
                  <tr data-uvok><td>&lambda;<sub>20</sub> (&alpha; = 20 cm<sup>&minus;1</sup>)</td><td class="v" data-o="u20">{R.u20}</td><td class="s"><Badge code="derived" pop="d:cp-uv" /></td></tr>
                  <tr data-uvok><td>&lambda;<sub>15</sub> (&alpha; = 15 cm<sup>&minus;1</sup>)</td><td class="v" data-o="u15">{R.u15}</td><td class="s"><Badge code="derived" pop="d:cp-uv" /></td></tr>
                  <tr><td>E<sub>c</sub> at c</td><td class="v" data-o="ec">{R.ec}</td><td class="s"><Badge code="P-comp" pop="d:cp-anch" /></td></tr>
                  <tr><td>E<sub>int</sub> at c</td><td class="v" data-o="eint">{R.eint}</td><td class="s"><Badge code="P-comp" pop="d:cp-anch" /></td></tr>
                </tbody>
              </table>
              <div class="cx-tw">
                <table class="idx cx-t cp-anchors">
                  <thead><tr><th>Anchor</th><th>c span</th><th>E<sub>c</sub></th><th>E<sub>int</sub></th></tr></thead>
                  <tbody>
                    <tr data-anchor="cln" class="on"><td>congruent</td><td class="num cp-nw">48.38&ndash;48.6</td><td class="num">21 kV/mm <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td><td class="num">2.2&ndash;3.4 kV/mm <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span></td></tr>
                    <tr data-anchor="sln"><td>near-stoich.</td><td class="num cp-nw">49.8&ndash;50.0</td><td class="num">6.0&ndash;6.5 / 2.1&ndash;2.5 kV/mm <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span></td><td class="num">&rarr; 0 <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="cp-art">
              <div class="cp-blk"><div class="cp-bh"><span>T<sub>c</sub>(c) band, markers</span><span>= ferroelectric&nbsp; # between fits&nbsp; ^ marker</span></div><pre class="cx-ascii" data-a="ax">{@html A.ax}</pre></div>
              <div class="cp-blk" data-uvok><div class="cp-bh"><span>UV edge, 22 &deg;C, E &parallel; c</span><span># &alpha; above threshold&nbsp; . below</span></div><pre class="cx-ascii" data-a="uv">{@html A.uv}</pre></div>
              <div class="cp-blk"><div class="cp-bh"><span>Li sites | Nb sites, 32 &times; 12 each</span><Badge code="derived" pop="d:cp-lat" /></div>
                <div class="cp-fields"><pre class="cx-ascii" data-a="li">{@html A.li}</pre><pre class="cx-ascii" data-a="nb">{@html A.nb}</pre></div>
                <div class="cp-leg"><span><b>.</b> Li</span><span><b>' '</b> vacancy</span><span><b>#</b> Nb<sub>Li</sub></span><span><b>:</b> Nb</span><output class="cx-ro" data-o="count">{R.count}</output></div>
              </div>
            </div>
          </div>
          <div class="pf">Move c from 48.00 to 50.00 mol%: the T<sub>c</sub> band climbs about 60 &deg;C, the UV edge moves about 17 nm to shorter wavelength, and the defect sites empty out. At 48.45 switch the model: the same Li-site holes become Nb antisites and vacancies appear on the Nb sites instead. E<sub>c</sub>, E<sub>int</sub>: anchors only.</div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="cp-v" data-pair="cpdial">
          <div class="cp-vhead">
            <div class="cp-vval"><output class="cp-big" data-o="cv">{R.cv}</output><span class="cp-unit">mol% Li<sub>2</sub>O</span></div>
            <dl class="v-hud cp-vkeys">
              <dt>[Li]/[Nb]</dt><dd data-o="r1">{R.r1}</dd>
              <dt>Antisites x per formula unit</dt><dd data-o="x">{R.x}</dd>
            </dl>
          </div>
          <div class="cp-ruler">
            <div class="cp-ticks" aria-hidden="false">
              <span class="cp-tick r1 end" style="--f:0.19" tabindex="0" data-pop="r:cti1999|data sheet;volk2008|p. 142, UV-edge reference"><b>48.38</b><span class="w">vendor</span></span>
              <span class="cp-tick r2" style="--f:0.225" tabindex="0" data-pop="r:volk2008|pp. 4, 10"><b>48.45</b><span class="w">Volk & Wöhlecke 2008</span></span>
              <span class="cp-tick r1" style="--f:0.30" tabindex="0" data-pop="r:carruthers1971|abstract"><b>48.6</b><span class="w">Carruthers et al. 1971</span></span>
              <span class="cp-tick r1 end" style="--f:1" tabindex="0" data-pop="g:sln-nsln"><b>50.0</b><span class="w">stoichiometric</span></span>
            </div>
            <input class="v-range" data-cp="c" type="range" min="48" max="50" step="0.01" value={R.cv} aria-label="Li2O content of the crystal">
            <div class="cp-anchs">
              <span class="cp-az" data-anchor="cln" style="--a:0.19;--b:0.30" data-pop="d:cp-anch" tabindex="0"><span>E<sub>c</sub>, E<sub>int</sub> congruent</span></span>
              <span class="cp-az end" data-anchor="sln" style="--a:0.90;--b:1" data-pop="d:cp-anch" tabindex="0"><span>near-stoichiometric</span></span>
            </div>
          </div>
          <div class="cp-vgrid">
            <div class="cp-card cp-clat">
              <div class="cp-ch"><h3>Lattice sites</h3><Badge code="derived" pop="d:cp-lat" /></div>
              <div class="v-seg" role="group" aria-label="Defect compensation model"><button type="button" data-model="Li-site" class="on">Li-site vacancy model</button><button type="button" data-model="Nb-site">Nb-site vacancy model</button></div>
              <div class="cp-tiles">
                <div><div class="cp-tl2"><span>Li sites</span><span class="cp-num"><span data-o="nbli">{R.nbli}</span> Nb<sub>Li</sub> &middot; <span data-o="vli">{R.vli}</span> V<sub>Li</sub></span></div>
                <div class="cp-tile-host" data-s="li">{@html S.li}</div></div>
                <div><div class="cp-tl2"><span>Nb sites</span><span class="cp-num"><span data-o="vnb">{R.vnb}</span> V<sub>Nb</sub></span></div>
                <div class="cp-tile-host" data-s="nb">{@html S.nb}</div></div>
              </div>
              <div class="cp-vleg"><span><i class="sw li"></i>Li</span><span><i class="sw nb"></i>Nb</span><span><i class="sw an"></i>Nb<sub>Li</sub></span><span><i class="sw va"></i>vacancy</span><output class="cp-num" data-o="vcount">{R.vcount}</output></div>
            </div>
            <div class="cp-card cp-ctemp">
              <div class="cp-ch"><h3>Curie temperature</h3><Badge code="P-comp" pop="d:cp-tc" /></div>
              <div class="cp-svg-host cp-axhost" data-s="ax">{@html S.ax}</div>
              <dl class="v-hud">
                <dt>T<sub>c</sub>, Iyi / Bordui fit</dt><dd><span data-o="tci">{R.tci}</span> / <span data-o="tcb">{R.tcb}</span></dd>
                <dt>Markers</dt><dd><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /></dd>
              </dl>
              <p class="v-cap">Stripes: the ferroelectric phase, where &plusmn;<i>z</i> domains exist; it ends at T<sub>c</sub>. Waves: congruent crystal is molten above 1255 &deg;C.</p>
            </div>
            <div class="cp-card cp-cuv" data-uvok>
              <div class="cp-ch"><h3>UV absorption edge</h3><Badge code="derived" pop="d:cp-uv" /></div>
              <div class="cp-svg-host cp-uvhost" data-s="uv">{@html S.uv}</div>
              <dl class="v-hud">
                <dt>&lambda;<sub>20</sub> / &lambda;<sub>15</sub></dt><dd><span data-o="u20">{R.u20}</span> / <span data-o="u15">{R.u15}</span></dd>
              </dl>
              <p class="v-cap">22 &deg;C, E &parallel; c, k &perp; c. Hatched: ultraviolet (below 400 nm), invisible. Shaded: absorption above 20 cm<sup>&minus;1</sup>. Solid line &lambda;<sub>20</sub>, dashed &lambda;<sub>15</sub>.</p>
            </div>
            <div class="cp-card cp-canch">
              <div class="cp-ch"><h3>Switching fields</h3><output class="cp-num cp-at" data-o="anchor">{R.anchor}</output></div>
              <div class="cp-ans">
              <div class="cp-an" data-anchor="cln">
                <div class="cp-anh">Congruent, 48.38&ndash;48.6 mol%</div>
                <dl><dt>E<sub>c</sub></dt><dd>21 kV/mm <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></dd><dt>E<sub>int</sub></dt><dd>2.2&ndash;3.4 kV/mm <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span></dd></dl>
              </div>
              <div class="cp-an" data-anchor="sln">
                <div class="cp-anh">Near-stoichiometric, from 49.8 mol%</div>
                <dl><dt>E<sub>c</sub></dt><dd>6.0&ndash;6.5 or 2.1&ndash;2.5 kV/mm <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span></dd><dt>E<sub>int</sub></dt><dd>&rarr; 0 <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></dd></dl>
              </div>
              </div>
              <p class="v-cap">Values light only while c sits in an anchor span; between them no source gives a value. <Badge code="P-comp" pop="d:cp-anch" /></p>
            </div>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Composition data">
    <div class="sh"><h2 class="biref">L2 Composition data</h2><span class="meta">congruent point, ratios, UV edge, growth routes</span></div>
    <div class="body">
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Phase diagram Li<sub>2</sub>O&ndash;Nb<sub>2</sub>O<sub>5</sub></td><td>Reisman and Holtzberg 1958</td><td class="s"><Badge code="P" pop="r:reisman1958|Crossref title" /></td></tr>
            <tr><td class="h">Congruent composition</td><td class="num">48.45 mol% Li<sub>2</sub>O, [Li]/[Nb] = 0.94</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 4, 10" /></td></tr>
            <tr><td class="h">Congruent composition</td><td class="num">48.6 mol% Li<sub>2</sub>O; room-temperature solid solution 48&ndash;50 mol%</td><td class="s"><Badge code="P" text="P(abs)" pop="r:carruthers1971|abstract" /></td></tr>
            <tr><td class="h">Congruent composition</td><td class="num">Li/Nb mole ratio 0.946</td><td class="s"><Badge code="P" pop="r:weis1985|p. 197" /></td></tr>
            <tr><td class="h">Congruent composition</td><td class="num">C = Li<sub>2</sub>O/(Li<sub>2</sub>O + Nb<sub>2</sub>O<sub>5</sub>) = 0.484</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td></tr>
            <tr><td class="h">Congruent composition</td><td class="num">48.38 &plusmn; 0.01 mol%; reference point of the UV-edge formula</td><td class="s"><Badge code="V" pop="r:cti1999|data sheet" /> <Badge code="P-comp" pop="r:volk2008|p. 142" /></td></tr>
            <tr><td class="h">Solid-solution width</td><td>about 6 mol% above 1150 &deg;C; diffuse liquidus maximum at about 48.45 mol%</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 4" /></td></tr>
            <tr><td class="h">Required uniformity for optics</td><td class="num">[Li]/[Nb] fixed within 10<sup>&minus;3</sup></td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 5" /></td></tr>
            <tr><td class="h">Melt to crystal</td><td>c = 48.5 + 0.3436 (c<sub>melt</sub> &minus; 48.5) &minus; 0.02897 (c<sub>melt</sub> &minus; 48.5)<sup>2</sup>, valid 45 &lt; c<sub>melt</sub> &lt; 52 mol%, &plusmn;0.3 mol%</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Eq. (6.1) p. 140" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Ratios</h3>
      <p class="tx">Composition ratios in the literature: <span class="term" data-pop="g:r1-r2">R1 = [Li]/[Nb], R2 = [Li]/([Li] + [Nb]) = c/100</span> <Badge code="derived" pop="d:cp-r" />. At c = 48.45 mol%, R1 = {N.r1_4845} <Badge code="derived" pop="d:cp-r" />. Volk & Wöhlecke 2008 prints R1 = 0.969 next to R2 = 0.4845 on p. 5, inconsistent with its own 0.94 on p. 10 <span class="cx-flag" tabindex="0" data-pop="cp-b5">misprint</span>.</p>

      <h3 class="h3">UV absorption edge vs composition</h3>
      <p class="tx">22 &deg;C, E &parallel; c, k &perp; c, x = c &minus; 48.38 mol% <Badge code="P-comp" pop="r:volk2008|Eqs. (6.5)-(6.6) p. 142;kovacs1997|calibration, via Volk & Wöhlecke 2008" />:</p>
      <pre class="cx-code">&lambda;<sub>20</sub> = 320.4 &minus; 1.829 x &minus; 5.485 x<sup>2</sup>   nm   (absorption 20 cm<sup>&minus;1</sup>)
&lambda;<sub>15</sub> = 321.9 &minus; 1.597 x &minus; 5.745 x<sup>2</sup>   nm   (absorption 15 cm<sup>&minus;1</sup>)</pre>
      <div class="cx-tw">
        <table class="idx cx-t cp-uvt">
          <thead><tr><th>c (mol% Li<sub>2</sub>O)</th><th class="r">&lambda;<sub>20</sub></th><th class="r">&lambda;<sub>15</sub></th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each N.uv as u (u.c)}<tr><td>{u.c}</td><td class="num">{u.l20} nm</td><td class="num">{u.l15} nm</td><td class="s"><Badge code="derived" pop="d:cp-uv" /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Above 49.5 mol%, 0.1 mol% maps to about 2 nm <Badge code="P-comp" pop="r:volk2008|p. 142" />.</p>

      <h3 class="h3">Growth routes to near-stoichiometric LiNbO<sub>3</sub> (all reported 1992&ndash;1997)</h3>
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Method</th><th>Principle</th><th>Reported parameters</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:vte">Vapor transport equilibration (VTE)</span></td><td>crystal plate and Li-rich powder in one Pt crucible, no contact; Li diffuses in</td><td>&gt; 1000 &deg;C for days; plates &lt; 1 mm, up to 3 mm reported; &ldquo;extremely slow lithium diffusivity&rdquo; for Li-poor targets</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 6" /> <Badge code="P" text="P(abs)" pop="r:bordui1992|abstract" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:double-crucible-czochralski-dccz">Double-crucible Czochralski (DCCZ)</span></td><td>pull from an Li-rich inner melt (about 58&ndash;60 mol% Li<sub>2</sub>O) in equilibrium with near-stoichiometric solid; stoichiometric powder fed continuously to the outer crucible, weight-controlled</td><td>&ndash;</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 7, Fig. 1.3" /> <Badge code="P" pop="r:kitamura1992|Crossref title" /></td></tr>
            <tr><td class="h">Growth from K<sub>2</sub>O-containing melt</td><td>melt with up to 10% K<sub>2</sub>O; negligible K in the crystal</td><td>compositions 49.95 mol% or more</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 6" /> <Badge code="P" pop="r:malovichko1993|Crossref title" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:top-seeded-solution-growth-tssg">Top-seeded solution growth (TSSG)</span></td><td>same chemistry treated as a high-temperature solution</td><td>boules 20 mm diameter</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 6" /> <Badge code="P" pop="r:polgar1997|Crossref title" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 How it is measured">
    <div class="sh"><h2 class="biref">L3 How it is measured</h2><span class="meta">chemical, thermal, optical; why the congruent values differ</span></div>
    <div class="body">
      <p class="tx"><b>Methods.</b> Non-optical: chemical analysis, T<sub>c</sub>, density, NMR and EPR linewidths, diffraction. Optical: UV edge, OH-band shape, Raman linewidths, phase-matching temperature; optical methods reach 0.1 mol% absolute and about 0.01 mol% relative accuracy <Badge code="P-comp" pop="r:volk2008|p. 7" /> <Badge code="P" text="P(abs)" pop="r:kovacs1997|abstract" />. The UV-edge method needs a reflection correction of about 1 nm and fails when an impurity such as Fe absorbs near the edge <Badge code="P-comp" pop="r:volk2008|pp. 142-143" />. For near-stoichiometric crystal the intensity ratio of the OH components at 3480 and 3465 cm<sup>&minus;1</sup> decreases linearly with Li<sub>2</sub>O from 49.7 to 50 mol% <Badge code="P-comp" pop="r:volk2008|p. 143" />.</p>
      <p class="tx"><b>Why 48.38 vs 48.45 vs 48.6.</b> The congruent point depends on how the melt composition was determined, and on the oxygen content of the Nb<sub>2</sub>O<sub>5</sub> feedstock, which may be oxygen-deficient <Badge code="P-comp" pop="r:volk2008|p. 5" />. The L2 table gives each value with its source.</p>
      <p class="tx"><b>Defect models in the dial.</b> The <span class="term" data-pop="g:li-site-vacancy-model">Li-site vacancy model</span> compensates each <span class="term" data-pop="g:nb-antisite-nb-li">Nb<sub>Li</sub></span> with four <span class="term" data-pop="g:li-vacancy">Li vacancies</span>; the <span class="term" data-pop="g:nb-site-vacancy-model">Nb-site vacancy model</span> compensates five Nb<sub>Li</sub> with four Nb vacancies. Both predict the same R1 at every c, so composition alone cannot decide between them <Badge code="P-comp" pop="r:volk2008|pp. 12-13" />; the evidence is in <a class="lk" href="/crystal/defects/">1.5</a>. The dial's anchors for E<sub>c</sub> and E<sub>int</sub> come from <a class="lk" href="/crystal/domains/">1.8</a>.</p>
    </div>
  </section>
</CrystalSection>
