<!-- Chapter 3.4 Cuts and coupling (manuscript sec. 3.4; figure F3.4). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F34 from "$lib/figures/sound/F34Cuts.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  onMount(() => mountSound());
  const v = (x: number | null): string => (x === null ? "–" : x.toFixed(1));
  const k = (x: number | null, ind = false): string => (x === null ? "–" : (x * 100).toFixed(2) + "%" + (ind ? " (indicative)" : ""));
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.4" }]} title="3.4 Cuts and coupling"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Rotated Y-X sweep" }, { id: "l3", label: "L3 Solver notes" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">rotated Y cuts; Kushibiki et al. 1999 constants</span></div>
    <div class="body">
      <p class="tx">Rotate the cutting plane of an LN boule and the surface wave changes speed and strength. At a cut rotated about 128&deg; from the Y axis, the ordinary surface wave is close to its strongest coupling (5.4%) and the competing fast wave has no isolated solution <Badge code="derived" pop="m-saw" />; 128&deg; rotated Y wafers are the LN SAW product of crystal suppliers (Sumitomo Metal Mining <Badge code="P" pop="r:smm-ln-lt" />). Near 41 and 64&deg; the fast, leaky wave dominates instead, with two to three times the coupling.</p>
      <p class="tx">Slide through 128&deg;: the Rayleigh coupling peaks (5.42% at 129&deg;) where the leaky branch has faded out; near 60 to 70&deg; the reverse happens, the Rayleigh coupling falls to about zero while the leaky wave carries 9 to 11%. The industrial cuts sit where one wave is strong and the other absent.</p>
      <F34 initial={data.sweep} theta={data.theta} />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Rotated Y-X sweep">
    <div class="sh"><h2 class="biref">L2 Cut notation and the rotated Y-X sweep</h2><span class="meta">IEEE 176 Sec. 3.6; Kushibiki et al. 1999 constants</span></div>
    <div class="body">
      <p class="tx">Cut notation (IEEE 176 Sec. 3.6 <Badge code="P" pop="r:ieee176" />): a singly <span class="term" data-pop="g:y-cut">rotated plate</span> (YXl) &theta; starts as a <span class="term" data-pop="g:y-cut">Y-cut</span> plate with length along X and is rotated by &theta; about its length (X). &ldquo;<span class="term" data-pop="g:128-y-x-cut">128&deg; Y-X</span>&rdquo; = (YXl) 128&deg;, wave propagating along X. Plate normal Y&prime; = Y cos &theta; + Z sin &theta;. The bulk thresholds along X do not depend on &theta;: slow shear 4028.96 m/s, fast shear 4750.09 m/s, quasi-longitudinal 6544.61 m/s <Badge code="derived" pop="m-christoffel" />.</p>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>&theta; (deg)</th><th class="r">Rayleigh v<sub>free</sub> (m/s)</th><th class="r">Rayleigh k&sup2;</th><th class="r">LSAW v<sub>free</sub> (m/s)</th><th class="r">LSAW k&sup2;</th></tr></thead>
          <tbody>
            {#each data.table as r (r.t)}<tr><td class="h">{r.t}</td><td class="num">{v(r.rv)}</td><td class="num">{k(r.rk)}</td><td class="num">{r.lv === null ? "no isolated root" : v(r.lv)}</td><td class="num">{k(r.lk, r.lki)}</td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Kushibiki et al. 1999 constants <Badge code="P" pop="r:kushibiki1999" />, partial-wave solver, 0.5&deg; sweep <Badge code="derived" pop="m-saw" />. Indicative: one of the two surfaces has no isolated leaky root (threshold-pinned), so k&sup2; uses a window-edge velocity.</p>
      <p class="tx">The Rayleigh coupling peaks at 128 to 129&deg;, where the leaky wave's coupling has fallen to 1.3% at 120&deg; and no leaky root is resolved at 128 to 130&deg;; the Rayleigh coupling falls to about zero near 60 to 70&deg;, where the leaky wave carries 9 to 11%. One cut gives a clean Rayleigh filter, the other a clean, strongly coupled leaky-wave filter. Shibayama et al. 1976 reported an optimum rotated Y cut near 128&deg; for SAW filters <Badge code="S" pop="r:shibayama1976" />.</p>
      <p class="tx">A k&sup2; quoted for a cut is meaningful only with its constant set named: the older Warner set gives about 17% and 11% for 41 and 64&deg;, the Kushibiki et al. 1999 and Ogi et al. 2002 sets 15.6 to 15.7% and 10.3 to 10.4% (switch the constant set in the figure). Cuts in use: LN 128&deg; rotated Y wafers (350 &micro;m at 4 in, 500 &micro;m at 6 in) and LT 36 to 50&deg; rotated Y wafers, mainly for smartphone SAW filters and duplexers (Sumitomo Metal Mining <Badge code="P" pop="r:smm-ln-lt" />). Thin-film LN uses X-cut and Z-cut films (and LN on sapphire) for phononic circuits; the in-plane propagation angle matters in addition to the cut (Sarabalis et al. 2020, abstract <Badge code="reported" pop="r:sarabalis2020" />).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Solver notes">
    <div class="sh"><h2 class="biref">L3 Solver notes</h2><span class="meta">thresholds, roots, conventions</span></div>
    <div class="body">
      <p class="tx"><b>Leaky branch.</b> The leaky column needs the complex-velocity solver. Points marked &ldquo;no isolated root&rdquo; are where the leaky mode merges with the slow-shear threshold (4029 m/s along X) and the 4&times;4 boundary determinant has no isolated minimum. Near 36 to 41&deg; the free-surface leaky root lies 0.7 to 0.8 m/s below the fast-shear threshold (4750.1 m/s for the Kushibiki et al. constants); after a minimum ends at the 1 m/s exclusion window, a search inside a 0.05 m/s window resolves it as an isolated complex root (41&deg;: 4749.31 &minus; 0.017i m/s, loss 2.0&times;10<sup>&minus;4</sup> dB per wavelength; metallized 4376.20 &minus; 1.28i m/s, 0.016 dB per wavelength) <Badge code="derived" pop="m-saw" />. The same near-threshold position occurs for the Ogi et al. constants (4721.3 vs 4722.1) and the Warner et al. constants (4784.7 vs 4785.5). The vendor 4750 m/s for 41&deg; equals this velocity to the stated digits <Badge code="V" pop="m-vendor" />.</p>
      <p class="tx"><b>Spurious minima.</b> The determinant has false minima at bulk thresholds; a 1 m/s window around each bulk velocity along x<sub>1</sub> is excluded, a minimum that ends at a window edge is searched again inside a 0.05 m/s window, and only if no isolated zero exists there is it reported as threshold-pinned, never as a root.</p>
      <p class="tx"><b>Axes.</b> Convention here: rotation matrix rows = new axes in crystal coordinates; cut = (YXl) &theta;; global x<sub>1</sub> = propagation, x<sub>3</sub> = outward plate normal.</p>
      <p class="tx"><b>Vendor values.</b> Fomos-Materials lists 3980 m/s (128&deg; Y-X), 4690 (64&deg;) and 4750 (41&deg;), within 3 m/s of the Kushibiki et al. 1999 results; its coupling percentages are for an undefined quantity and are not compared <Badge code="V" pop="m-vendor" />.</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.4</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
