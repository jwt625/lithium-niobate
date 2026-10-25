<!-- Chapter 3.3 Surface and guided waves (manuscript sec. 3.3; figure F3.5; tables computed at prerender). -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import F35 from "$lib/figures/sound/F35Anatomy.svelte";
  import Refs from "$lib/figures/sound/Refs.svelte";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  usePops({ ...SOUND_POPS, ...data.pops });
  onMount(() => mountSound());
  const T = $derived(data.tables);
  const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const lossTxt = (x: number): string => { if (!Number.isFinite(x) || x === 0) return "–"; if (x >= 0.001) return x.toFixed(4); const [m, e] = x.toExponential(1).split("e"); return `${m}×10${String(+e).split("").map((c) => SUP[c]).join("")}`; };
  const SETN = ["Kushibiki et al. 1999", "Ogi et al. 2002 (ε^S Kushibiki)", "Warner et al. 1967 (ρ 4700 assumed)"];
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound", href: "/sound/" }, { label: "3.3" }]} title="3.3 Surface and guided waves"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 SAW model and cuts" }, { id: "l3", label: "L3 Solver and spread" }, { id: "refs", label: "References" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2></div>
    <div class="body">
      <p class="tx">A sound wave can also cling to a surface, like a ripple on water, with its energy within about one wavelength of the top. On LN such a <span class="term" data-pop="g:saw">surface acoustic wave</span> (SAW) travels at about 3.4 to 4.0 km/s, 75,000 to 88,000 times slower than light, so a 1 GHz signal becomes a ripple only 4 &micro;m long that a pair of comb-shaped electrodes can launch and catch. Some crystal cuts carry a faster surface wave that leaks a little energy into the bulk as it travels; on the right cut that leak is tiny.</p>
      <p class="tx">On 128&deg; Y-X the surface atoms trace ellipses and the motion dies within about a wavelength; switch to 64&deg; Y-X and the motion turns mostly horizontal shear, with a partial wave that carries energy down into the crystal.</p>
      <F35 presets={data.presets} />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 SAW model and cuts">
    <div class="sh"><h2 class="biref">L2 Partial waves, coupling, standard cuts</h2><span class="meta">Kushibiki et al. 1999; partial-wave solver</span></div>
    <div class="body">
      <p class="tx"><span class="term" data-pop="g:saw">Rayleigh wave</span>: traction-free surface wave on an elastic half-space, displacement in the <span class="term" data-pop="g:sagittal-plane">sagittal plane</span>, decaying with depth (Rayleigh 1885 <Badge code="S" pop="r:rayleigh1885" />). On a piezoelectric substrate the partial waves also carry an electric potential that extends into the vacuum; the wave is slower when the surface is shorted by a thin metal film.</p>
      <p class="tx"><span class="term" data-pop="g:partial-wave-method">Partial-wave method</span> (Campbell &amp; Jones 1968 <Badge code="S" pop="r:campbell1968" />): fields &prop; exp[ik(x<sub>1</sub> + &alpha;x<sub>3</sub> &minus; vt)]; for each trial v the extended 4&times;4 Christoffel system in (u<sub>1</sub>, u<sub>2</sub>, u<sub>3</sub>, &phi;) gives an 8th-order polynomial in &alpha;; keep the 4 roots that decay into the substrate (or radiate away from the surface, for leaky waves); the SAW velocity is the root of the 4&times;4 boundary determinant (three traction components plus D<sub>3</sub> continuity with the vacuum, or &phi; = 0 for a shorted surface) <Badge code="derived" pop="m-saw" />.</p>
      <div class="eq"><math display="block"><mrow><msup><mi>k</mi><mn>2</mn></msup><mo>&asymp;</mo><mn>2</mn><mfrac><mrow><msub><mi>v</mi><mtext>free</mtext></msub><mo>&minus;</mo><msub><mi>v</mi><mtext>met</mtext></msub></mrow><msub><mi>v</mi><mtext>free</mtext></msub></mfrac></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">Coupling as defined by Ingebrigtsen (Ingebrigtsen 1969 <Badge code="S" pop="r:ingebrigtsen1969" />). <span class="term" data-pop="g:leaky-saw">Leaky SAW</span> (pseudo-SAW): a predominantly shear-horizontal surface wave faster than the slow shear bulk wave; it radiates into the bulk and its velocity is complex (Yamanouchi &amp; Shibayama 1972 treat leaky surface waves in LN <Badge code="S" pop="r:yamanouchi1972" />).</p>

      <h3 class="h3">Standard cuts, Kushibiki et al. 1999 constants</h3>
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Cut (IEEE notation)</th><th>Wave</th><th class="r">v<sub>free</sub> (m/s)</th><th class="r">v<sub>met</sub> (m/s)</th><th class="r">k&sup2; = 2&Delta;v/v</th><th class="r">loss free / met (dB/&lambda;)</th><th class="r">Vendor v (m/s)</th></tr></thead>
          <tbody>
            {#each T.cuts as r (r.cut)}<tr><td class="h">{r.cut}</td><td>{r.wave}</td><td class="num">{r.vf.toFixed(1)}</td><td class="num">{r.vm.toFixed(1)}</td><td class="num">{(r.k2 * 100).toFixed(2)}%{r.k2Status === "root" ? "" : " (indicative)"}</td><td class="num">{lossTxt(r.lossF)} / {lossTxt(r.lossM)}</td><td class="num">{r.vendor}</td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Computed with the partial-wave solver from the Kushibiki et al. 1999 constants <Badge code="P" pop="r:kushibiki1999" /> <Badge code="derived" pop="m-saw" />. Vendor column: Fomos-Materials knowledge base <Badge code="V" pop="m-vendor" />; its coupling percentages (5.04, 5.7, 10, 17%) refer to an undefined quantity and are not compared. Losses of the leaky waves from the imaginary part of the complex root (first order).</p>
      <p class="tx">The 36 to 41&deg; free-surface leaky roots sit 0.7 to 0.8 m/s below the fast-shear bulk velocity along X (4750.1 m/s); they are isolated complex roots with very small radiation loss (41&deg;: about 2&times;10<sup>&minus;4</sup> dB per wavelength free, 0.016 shorted), so the leaky wave on these cuts is almost a true surface wave until the surface is metallized.</p>

      <h3 class="h3">Guided waves in thin films</h3>
      <p class="tx"><b><span class="term" data-pop="g:love-wave">Love-type</span> and index-guided waves.</b> A film whose shear velocity is lower than the substrate's guides acoustic waves without suspension; LN on sapphire uses this &ldquo;phononic analogue of index guiding&rdquo; (Mayor et al. 2021, abstract <Badge code="reported" pop="r:p09" />).</p>
      <p class="tx"><b>Plate modes in suspended films</b> (<span class="term" data-pop="g:lamb-wave">Lamb</span> and shear-horizontal): SH0, S0, A0 and thickness-shear overtones such as A1. A 400 nm ZY-LN platelet excited by lateral fields (<span class="term" data-pop="g:xbar">XBAR</span>) resonates near 4.8 GHz with coupling about 25% and Q about 300 (Plessky et al. 2019 <Badge code="reported" pop="r:plessky2019" />). The bulk shear velocity along Z, 3590 m/s, over twice the thickness gives 3590/(2 &times; 400 nm) = 4.5 GHz (<Badge code="derived" pop="m-calc" />; ignores stiffening and electrode loading). Thin-film numbers are reported values plus this estimate; no plate-mode dispersion is computed.</p>
      <p class="tx"><b>Wavelength-scale mechanical waveguides</b> (1 &micro;m wide) on suspended TFLN and on LN on sapphire: <a class="lk" href="/sound/phononics/">3.7</a>.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Solver and spread">
    <div class="sh"><h2 class="biref">L3 Constant-set sensitivity, root selection, definitions</h2><span class="meta">three constant sets</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>Cut: v<sub>free</sub> (m/s), k&sup2;</th>{#each SETN as s (s)}<th class="r">{s}</th>{/each}</tr></thead>
          <tbody>
            {#each T.sens as r (r.cut)}<tr><td class="h">{r.cut}</td>{#each r.vals as [v, k], i (i)}<td class="num">{v.toFixed(1)}, {(k * 100).toFixed(2)}%</td>{/each}</tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Kushibiki et al. 1999 <Badge code="P" pop="r:kushibiki1999" />; Ogi et al. 2002 c, e, &rho; 4636 <Badge code="P" pop="r:ogi2002" /> with the Kushibiki et al. &epsilon;<sup>S</sup> (blended sensitivity case; Ogi et al. report no &epsilon;<sup>S</sup>); Warner et al. 1967 c (Weis &amp; Gaylord 1985 Table 6 <Badge code="P-comp" pop="r:weis1985" />), e (Ogi et al. 2002 Table III <Badge code="S" pop="r:ogi2002" />), &epsilon;<sup>S</sup> 44.3/27.9 (Weis &amp; Gaylord 1985 Table 1), &rho; 4700 kg/m&sup3; assumed (the value Weis &amp; Gaylord use in their AO figures). All computed <Badge code="derived" pop="m-saw" />.</p>
      <p class="tx">The older Warner set gives about 17% and 11% for 41 and 64&deg;; the Kushibiki et al. 1999 and Ogi et al. 2002 sets give 15.6 to 15.7% and 10.3 to 10.4%. A k&sup2; quoted for a cut is meaningful only with its constant set named.</p>
      <p class="tx"><b>Root selection.</b> Below the limiting velocity (1/max s<sub>1</sub> on the sagittal-plane slowness curves, which can lie below the slowest bulk velocity along x<sub>1</sub> for rotated cuts) all 8 roots are complex; keep Im &alpha; &lt; 0 (substrate at x<sub>3</sub> &lt; 0). For leaky waves keep the real roots whose time-averaged Poynting component points into the substrate, then continue the selection to complex velocity. Nondimensionalize (c by 10<sup>11</sup> Pa, potential by &radic;(c<sub>0</sub>/&epsilon;<sub>ref</sub>)) or the problem is ill-conditioned and the Y-Z root is lost in numerical noise.</p>
      <p class="tx"><b>Spurious minima.</b> The determinant has false minima at bulk thresholds (e.g. 3590.4 m/s on Y-Z, 4750.1 m/s on X-propagating cuts); a 1 m/s window around each bulk velocity along x<sub>1</sub> is excluded; a minimum that ends at a window edge is searched again inside a 0.05 m/s window, which resolves the 36 to 41&deg; leaky roots 0.7 to 0.8 m/s below the fast-shear velocity.</p>
      <p class="tx"><b>k&sup2; definitions differ.</b> 2&Delta;v/v (Ingebrigtsen) vs electrode-admittance or effective-permittivity definitions; vendor sheets often do not state theirs.</p>
      <p class="tx"><b><span class="term" data-pop="g:temperature-coefficient-of-frequency">Temperature coefficient of frequency</span>.</b> Vendor values &minus;95 (Y-Z), &minus;72 (128&deg; Y-X), &minus;70 (64 and 41&deg; Y-X) ppm/K <Badge code="V" pop="m-vendor" />. A computed TCF needs temperature coefficients of c, e, &epsilon; and thermal expansion as one consistent set; Smith and Welsh 1971 has c and s coefficients (Weis & Gaylord 1985 Tables 5-6 <Badge code="P-comp" pop="r:weis1985" />); the thermal expansion along c is 4.1 ppm/K in the Volk &amp; Wöhlecke 2008 compilation (Table 1.1 <Badge code="P-comp" pop="r:volk2008" />). No computed TCF is shown.</p>
    </div>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References">
    <div class="sh"><h2 class="biref">References</h2><span class="meta">3.3</span></div>
    <div class="body"><Refs rows={data.refs} /></div>
  </section>
</ChapterPage>
