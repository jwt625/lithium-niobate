<!-- 1.5 Intrinsic defects (content/chapters/01-crystal/manuscript.md Sec. 5; FIG-01-04 Defect and polaron gallery).
     Catalogue data and renderers: src/lib/figures/crystal/dg-data.ts; controller dg.ts; state `defects` in stores/crystal.ts. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { CENTRES } from "$lib/figures/crystal/dg-data";
  import { mountDg } from "$lib/figures/crystal/dg";
  import "$lib/figures/crystal/dg.css";

  let { data }: { data: PageData } = $props();
  const N = $derived(data.num);
  const D = $derived(data.dg);
  const card = (id: string) => data.dg.cards.find((k) => k.id === id)!;

  usePops({
    "d:frac": { h: "Defect fractions from composition", body: "R<sub>2</sub> = c/100 with c in mol% Li<sub>2</sub>O. Both compensation models give R<sub>2</sub> = (1 &minus; 5x)/(2 &minus; 4x), so x = (1 &minus; 2R<sub>2</sub>)/(5 &minus; 4R<sub>2</sub>). Li-site model: Nb<sub>Li</sub> = x, V<sub>Li</sub> = 4x of Li sites. Nb-site model: Nb<sub>Li</sub> = 5x of Li sites, V<sub>Nb</sub> = 4x of Nb sites.", badges: [["d", "derived"]] },
    "d:n": { h: "Antisite density", body: () => `Formula units per volume 6/V = ${data.num.n} &times; 10<sup>22</sup> cm<sup>&minus;3</sup> from the Hsu et al. 1997 hexagonal cell (a = 5.148 &Aring;, c = 13.863 &Aring;, Z = 6), times x = ${data.num.x4845} at 48.45 mol% (Li-site model).`, badges: [["d", "derived"]] },
    "d:hc": { h: "Photon energy and wavelength", body: "&lambda; = hc/E and k = 1/&lambda;, with CODATA h, c, e. 1.6 eV = 774.9 nm, 0.95 eV = 1305.1 nm, 2.5 eV = 495.9 nm, 500 nm = 2.480 eV, 740 nm = 1.675 eV, 3482 cm<sup>&minus;1</sup> = 2.872 &micro;m = 0.4317 eV, 532 nm = 2.331 eV.", badges: [["d", "derived"]] },
    "d:kv": { h: "Kroeger-Vink forms of the centres", body: "Charge of the occupant relative to the host site: prime = one negative, bullet = one positive, &times; = neutral (Volk & Wöhlecke 2008 p. 12). Host valences Li<sup>+</sup>, Nb<sup>5+</sup>, O<sup>2&minus;</sup>. An Nb<sub>Li</sub><sup>4+</sup> written in valence notation (Nb<sup>4+</sup> on a Li site) is Nb<sub>Li</sub><sup>&bull;&bull;&bull;</sup>; the antisite Nb<sup>5+</sup> on a Li site is Nb<sub>Li</sub><sup>&bull;&bull;&bull;&bull;</sup>, which the compensation formulas write as Nb<sub>Li</sub><sup>4+</sup> in the &plusmn; convention.", badges: [["d", "derived"]] },
    "d:pump": { h: "Pump marker: peak proximity only", body: "A centre is marked when its listed band peak lies within 0.3 eV of the 532 nm pump (2.33 eV): the bipolaron (2.50 eV) and the O<sup>&minus;</sup> hole polaron (about 2.48 eV). The 0.3 eV window is a display choice; band widths are not sourced, so the mark says nothing about absorption strength.", badges: [["t", "template"]] },
    "d:vig": { h: "Vignettes", body: "Regular O<sub>6</sub> octahedra drawn with the threefold axis along c (triangular faces top and bottom), occupant at the centre; sizes and the electron cloud are illustrative, not computed densities. Bipolaron: the pair on neighbouring Nb<sub>Li</sub> and Nb<sub>Nb</sub> drawn as face-sharing octahedra along c; the pair axis is not stated in the sources read.", badges: [["t", "template"]] },
  });

  let figT: HTMLElement, figV: HTMLElement;
  onMount(() => mountDg(figT, figV));
</script>

<CrystalSection slug="defects" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Missing lithium" }, { id: "l2", label: "L2 Compensation and centres" }, { id: "l3", label: "L3 How it is decided" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Missing lithium">
    <div class="sh"><h2 class="biref">L1 Missing lithium</h2><span class="meta">congruent crystal; Volk & Wöhlecke 2008</span></div>
    <div class="body">
      <p class="tx">Where does the missing lithium go? Not into missing oxygen: as-grown LiNbO<sub>3</sub> has essentially no oxygen vacancies, unusual for an oxide <Badge code="P-comp" pop="r:volk2008|p. 10" />. Instead some niobium ions sit on lithium sites (<span class="term" data-pop="g:nb-antisite-nb-li">antisites</span>), and charge balance is restored by empty lithium sites (<span class="term" data-pop="g:li-vacancy">Li vacancies</span>). In <span class="term" data-pop="g:congruent-melting-composition">congruent</span> crystal about 1 in 100 lithium sites holds a niobium and about 4 in 100 are empty <Badge code="P-comp" pop="r:volk2008|p. 12, orig. Iyi et al. 1992;iyi1992|original, values via Volk & Wöhlecke 2008" />.</p>
      <p class="tx">These few percent of misplaced ions matter far beyond their number. An electron captured by a niobium antisite stays put, dressed by the lattice distortion it causes: a <span class="term" data-pop="g:polaron">small polaron</span> with its own near-infrared absorption band. Antisites trap the charge behind <span class="term" data-pop="g:photorefraction">optical damage</span>, set the built-in bias field, and raise the coercive field (<a class="lk" href="/crystal/dopants/">1.6</a>, <a class="lk" href="/crystal/domains/">1.8</a>).</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel dg-t" data-pair="dg" bind:this={figT}>
          <div class="ph"><span>Defect and polaron gallery: band peaks on one photon-energy axis</span><span><Badge code="P-comp" pop="r:volk2008|pp. 10-26" /> <Badge code="derived" pop="d:hc" /></span></div>
          <div class="dg-tg">
            <div class="cx-tw dg-tw" data-sweep>
              <table class="idx cx-t dg-tab">
                <thead><tr><th>#</th><th>Centre, location</th><th class="r">Band peak</th><th title="listed peak within 0.3 eV of 532 nm (qualitative)">532</th><th class="r">Status</th></tr></thead>
                <tbody>
                  {#each CENTRES as c (c.id)}
                    <tr data-row={c.id}>
                      <td class="no">{c.no}</td>
                      <td class="h"><button type="button" class="dg-pick" data-drive data-id={c.id} aria-pressed={c.id === "nbli4" ? "true" : "false"}>{@html c.sym}</button><span class="nm">{@html c.name}</span><span class="lo">{@html c.site}</span></td>
                      <td class="num">{@html card(c.id).band}</td>
                      <td class="pm">{card(c.id).np ? "*" : ""}</td>
                      <td class="s"><Badge code="P-comp" pop={c.pop} />{#if c.E !== null} <Badge code="derived" pop="d:hc" />{/if}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <div class="dg-ts">
              <pre class="cx-ascii dg-ax" aria-label="ASCII photon-energy axis 0.3 to 4 eV with one row per centre and a marker at its band peak; OH stretch wavenumber inset below">{@html D.ascii}</pre>
              <div class="dg-rohead"><span>selected centre</span><span><Badge code="derived" pop="d:kv" /></span></div>
              <pre class="dg-ro" aria-live="polite">{@html D.ro}</pre>
            </div>
          </div>
          <div class="dg-bar">
            <div class="seg" role="group" aria-label="Conditions"><button type="button" data-dg="pump" aria-pressed="false" title="Mark centres whose listed peak lies within 0.3 eV of 2.33 eV">pump 532 nm</button><button type="button" data-dg="cold" aria-pressed="false" title="Bipolaron photodissociation into a bound polaron">illuminate &lt; 80 K</button></div>
            <span class="dg-key"><Badge code="template" pop="d:pump" /> pump mark: peak proximity only, qualitative</span>
            <span class="dg-key"><Badge code="P-comp" pop="r:volk2008|p. 17" /> hop 2.5 &rarr; 1.6 eV</span>
          </div>
          <div class="pf">Click a row to select it; hover previews. <b>|</b> listed band peak (no band shapes: polaron widths are not in the sources read); <b>*</b> near the 532 nm pump; <b>|&lt;---o</b> bipolaron band moved to the bound-polaron band under illumination below 80 K. OH inset: the only sourced width, FWHM about 32 cm<sup>&minus;1</sup> (congruent), drawn centred on the strong peak.</div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="dg-v" data-pair="dg" bind:this={figV}>
          <div class="dg-vhead">
            <div class="v-seg" role="group" aria-label="Conditions"><button type="button" data-dg="pump" aria-pressed="false">Pump 532 nm</button><button type="button" data-dg="cold" aria-pressed="false">Illuminate below 80 K</button></div>
            <div class="dg-legend"><span><i class="k vis" style="background:{D.legend}"></i>visible: spectral colour</span><span><i class="k ir"></i>IR: false colour, dashed</span><span><i class="k mk"></i>band peak, no shape drawn</span></div>
          </div>
          <div class="dg-strip v-frame" data-sweep role="img" aria-label="Photon-energy axis 0.3 to 4 eV with the band peaks of the centres"><svg viewBox="0 0 1000 214" preserveAspectRatio="xMinYMid meet" aria-hidden="true">{@html D.strip}</svg></div>
          <div class="dg-joy" aria-live="polite"><span class="dg-j1"></span><span class="dg-j2"></span></div>
          <div class="dg-hud" aria-live="polite">{@html D.hud}</div>
          <div class="dg-cards" data-sweep>
            {#each CENTRES as c (c.id)}
              <article class="dg-card v-facet" data-row={c.id} class:np={card(c.id).np}>
                <header><span class="no">{c.no}</span><span class="dg-pt">{card(c.id).np ? "near 532 nm, qualitative" : ""}</span></header>
                <button type="button" class="dg-pick" data-drive data-id={c.id} aria-pressed={c.id === "nbli4" ? "true" : "false"}><span class="sym">{@html c.sym}</span><span class="nm">{@html c.name}</span></button>
                <div class="vig"><svg viewBox="0 0 240 150" aria-hidden="true">{@html card(c.id).vig}</svg></div>
                <div class="val">{#if c.E === null}<span class="none">no optical band listed</span>{:else}{@html card(c.id).band}{/if}</div>
                <p class="sig">{@html c.sig}</p>
                {#if c.life}<p class="life">Lifetime, {@html c.life}</p>{/if}
                <p class="kv">Kroeger-Vink {@html c.kv} <span>({@html c.kvNote})</span></p>
                <footer><Badge code="P-comp" pop={c.pop} />{#if c.E !== null} <Badge code="derived" pop="d:hc" />{/if}<span>{c.src}</span></footer>
              </article>
            {/each}
          </div>
          <div class="v-prov">
            <span>Select a card or hover the strip. Peaks to scale on one energy axis; no band shapes (polaron widths not in the sources read) <Badge code="P-comp" pop="r:volk2008|pp. 14-26" /></span>
            <span>pump mark <Badge code="template" pop="d:pump" /></span>
            <span>hop on illumination <Badge code="P-comp" pop="r:volk2008|p. 17" /></span>
            <span>drawings <Badge code="template" pop="d:vig" /></span>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Compensation and centres">
    <div class="sh"><h2 class="biref">L2 Compensation and centres</h2><span class="meta">x = antisite fraction per formula unit</span></div>
    <div class="body">
      <h3 class="h3">Compensation models</h3>
      <p class="tx">Written per formula unit, x = antisite fraction <Badge code="P-comp" pop="r:volk2008|Eqs. (2.5)-(2.6) pp. 12-13" />:</p>
      <pre class="cx-code">Li-site vacancy model:  [Li(1-5x) Nb_Li(x) V_Li(4x)] Nb O3            (1 Nb_Li^4+ compensated by 4 V_Li^-)
Nb-site vacancy model:  [Li(1-5x) Nb_Li(5x)] [Nb(1-4x) V_Nb(4x)] O3   (5 Nb_Li^4+ compensated by 4 V_Nb^5-)</pre>
      <p class="tx">Both the <span class="term" data-pop="g:li-site-vacancy-model">Li-site</span> and the <span class="term" data-pop="g:nb-site-vacancy-model">Nb-site vacancy model</span> give R<sub>2</sub> = (1 &minus; 5x)/(2 &minus; 4x), so x = (1 &minus; 2R<sub>2</sub>)/(5 &minus; 4R<sub>2</sub>) <Badge code="derived" pop="d:frac" />. Here the charges are relative to the host site (&plusmn; convention, L3).</p>
      <div class="cx-tw">
        <table class="idx cx-t dg-ft">
          <thead><tr><th>c (mol% Li<sub>2</sub>O)</th><th class="r">x</th><th class="r">Li-site model: Nb<sub>Li</sub> / V<sub>Li</sub> (of Li sites)</th><th class="r">Nb-site model: Nb<sub>Li</sub> (of Li sites) / V<sub>Nb</sub> (of Nb sites)</th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each N.frac as r (r.c)}<tr><td class="num">{r.c}</td><td class="num">{r.x}</td><td class="num">{r.li}</td><td class="num">{r.nb}</td><td class="s"><Badge code="derived" pop="d:frac" /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="tx">At 48.45 mol% the Li-site model gives {N.nbli} &times; 10<sup>20</sup> Nb<sub>Li</sub> per cm<sup>3</sup>, with {N.n} &times; 10<sup>22</sup> formula units per cm<sup>3</sup> <Badge code="derived" pop="d:n" />.</p>

      <h3 class="h3">Where the Nb sits: observations</h3>
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Observation</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Nb on Li sites, X-ray (Abrahams and Marsh)</td><td>4.9% of Li sites (supports Nb-site model)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 12, orig. Abrahams & Marsh 1986;abrahams1986|original, values via Volk & Wöhlecke 2008" /></td></tr>
            <tr><td class="h">Nb on Li sites, X-ray + neutron (Iyi et al.)</td><td>about 1% Nb<sub>Li</sub>, about 4% empty Li sites (supports Li-site model)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 12, orig. Iyi et al. 1992;iyi1992|original, values via Volk & Wöhlecke 2008" /></td></tr>
            <tr><td class="h">Formation energies, atomistic simulation</td><td>Li<sub>2</sub>O out-diffusion compensated by V<sub>Li</sub> + Nb<sub>Li</sub> / by V<sub>Nb</sub> + Nb<sub>Li</sub> / by (Nb<sub>Li</sub>&ndash;V<sub>Nb</sub>) clusters: <span class="cx-mono">4.56 / 15.17 / 10.67 eV</span> per reaction</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 12, orig. Donnerberg et al. 1989;donnerberg1989|original, values via Volk & Wöhlecke 2008" /></td></tr>
            <tr><td class="h">Density rises as Li content falls</td><td>consistent only with Nb entering Li sites</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 11, orig. Lerner et al. 1968;lerner1968|original, via Volk & Wöhlecke 2008" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Electron and hole centres (polaron model)</h3>
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Centre</th><th>Notation</th><th>Optical band</th><th>Other signature</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:polaron">Bound small polaron</span></td><td>Nb<sub>Li</sub><sup>4+</sup> (electron on an antisite)</td><td class="nw">about 1.6 eV ({N.nm16} nm)</td><td>10-line <sup>93</sup>Nb hyperfine EPR, g<sub>&perp;</sub> = 1.72, g<sub>&par;</sub> = 1.9</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 14-23" /> <Badge code="derived" pop="d:hc" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:polaron">Free small polaron</span></td><td>Nb<sub>Nb</sub><sup>4+</sup> (electron on a regular Nb)</td><td class="nw">about 0.95 eV ({N.nm095} nm)</td><td>seen in reduced crystals with Mg above threshold; no EPR under low-temperature illumination</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 14-23" /> <Badge code="derived" pop="d:hc" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:polaron">Bipolaron</span></td><td>(Nb<sub>Li</sub>&ndash;Nb<sub>Nb</sub>)<sup>2&minus;</sup> electron pair</td><td class="nw">about 2.5 eV ({N.nm25} nm)</td><td>the colour of chemically reduced crystal; diamagnetic; dissociation energy about 0.3 eV</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 14-23" /> <Badge code="derived" pop="d:hc" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:hole-polaron-o">Bound hole polaron</span></td><td>O<sup>&minus;</sup> next to a Li vacancy</td><td class="nw">broad, peak about 500 nm ({N.ev500} eV)</td><td>EPR, trapped-hole g between 2.002 and 2.047</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 14-23" /> <Badge code="derived" pop="d:hc" /></td></tr>
            <tr><td class="h">Laser-pulse-induced IR band</td><td>assigned to Nb<sub>Li</sub><sup>4+</sup></td><td class="nw">740 nm ({N.ev740} eV)</td><td>composition independent</td><td class="s"><Badge code="P-comp" pop="r:herth2005|via Volk & Wöhlecke 2008 p. 22;volk2008|p. 22" /> <Badge code="derived" pop="d:hc" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Values in parentheses are hc/E or E = hc/&lambda; of the sourced number <Badge code="derived" pop="d:hc" />.</p>
      <p class="tx">Polaron stabilization energy about 0.3 eV and phonon energy about 0.1 eV are used in band-shape fits <Badge code="P-comp" pop="r:volk2008|p. 18" />. Nb<sub>Li</sub><sup>4+</sup> lifetime at room temperature: microseconds in congruent crystal, 10&ndash;100 ms near stoichiometry, up to seconds in Li-enriched Mg-doped crystal <Badge code="P-comp" pop="r:volk2008|p. 21" />; it forms within 400 fs <Badge code="P-comp" pop="r:volk2008|p. 22, orig. Beyer et al." />. <span class="term" data-pop="g:griira">GRIIRA</span> (green-induced infrared absorption) shares the MgO threshold of photorefraction and is assigned to the Nb<sub>Li</sub> polaron <Badge code="P" text="P(abs)" pop="r:furukawa2001|abstract" />.</p>

      <h3 class="h3">Hydrogen</h3>
      <p class="tx">Hydrogen enters from the atmosphere during or after growth and sits as OH<sup>&minus;</sup> on oxygen sites <Badge code="P-comp" pop="r:volk2008|p. 24" />.</p>
      <div class="cx-tw">
        <table class="idx cx-t">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:oh-stretch-band">OH stretch band</span>, congruent</td><td>strong peak 3482 cm<sup>&minus;1</sup> ({N.um3482} &micro;m), weaker 3467 cm<sup>&minus;1</sup> ({N.um3467} &micro;m); FWHM about 32 cm<sup>&minus;1</sup></td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 24" /> <Badge code="derived" pop="d:hc" /></td></tr>
            <tr><td class="h">Polarization</td><td>absorption for ordinary light much larger than for extraordinary: the O&ndash;H bond vibrates in the plane perpendicular to c</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 24" /></td></tr>
            <tr><td class="h">Near-stoichiometric</td><td>band narrows; 3466 cm<sup>&minus;1</sup> ({N.um3466} &micro;m)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 25 and Table 2.4 p. 49" /></td></tr>
            <tr><td class="h">Concentration</td><td>c<sub>H</sub> = 2 &times; 10<sup>18</sup> cm<sup>&minus;2</sup> &times; &alpha;(2.87 &micro;m); as-grown &alpha; = 1&ndash;2 cm<sup>&minus;1</sup>, i.e. about 10<sup>18</sup> cm<sup>&minus;3</sup> (other estimates 3&ndash;6 &times; 10<sup>19</sup> cm<sup>&minus;3</sup>)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 26" /></td></tr>
            <tr><td class="h"><span class="term" data-pop="g:dark-conductivity">Dark conductivity</span> carrier</td><td>protons, single activation energy about 1.1 eV from 200 to 1000 &deg;C</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 59" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 How it is decided">
    <div class="sh"><h2 class="biref">L3 How it is decided</h2><span class="meta">diffraction, NMR, EPR, reduction</span></div>
    <div class="body">
      <p class="tx"><b>The model debate.</b> Two diffraction studies of congruent crystal disagree on where the excess Nb compensation sits: Abrahams and Marsh (1986) and Iyi et al. (1992). Volk & Wöhlecke 2008 calls the Li-site vacancy model &ldquo;commonly accepted&rdquo; and notes a third reading, that the degree of filling depends on growth conditions so all three faults (Nb<sub>Li</sub>, V<sub>Li</sub>, V<sub>Nb</sub>) coexist <Badge code="P-comp" pop="r:volk2008|p. 13, orig. Wilkinson et al. 1993" />. The two models predict identical composition and differ in density and site occupancies, which is why the decision came from occupancy refinement plus NMR, not from chemistry <Badge code="P-comp" pop="r:volk2008|pp. 12-13" />.</p>
      <p class="tx"><b><span class="term" data-pop="g:kroeger-vink-notation">Kroeger-Vink notation</span>.</b> A prime is negative and a bullet positive charge relative to the host site; many authors write &minus; and + instead <Badge code="P-comp" pop="r:volk2008|p. 12" />. Nb<sub>Li</sub><sup>&bull;&bull;&bull;&bull;</sup> denotes Nb<sup>5+</sup> on an Li<sup>+</sup> site (four excess positive charges). The polaron names use valence instead: Nb<sub>Li</sub><sup>4+</sup> is Nb<sup>4+</sup> on a Li site, three excess positive charges.</p>
      <div class="cx-tw">
        <table class="idx cx-t dg-kvt">
          <thead><tr><th>Centre</th><th>As written</th><th>Kroeger-Vink</th><th>Occupant on host</th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each CENTRES as c (c.id)}<tr><td class="no">{c.no}</td><td>{@html c.sym}</td><td class="kvc">{@html c.kv}</td><td>{@html c.kvNote}</td><td class="s"><Badge code="derived" pop="d:kv" /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="tx"><b>Reduction and the test for antisites.</b> Annealing in vacuum or hydrogen at 400&ndash;600 &deg;C creates bipolarons; low-temperature illumination converts them into Nb<sub>Li</sub><sup>4+</sup> with the 1.6 eV band and the 10-line EPR, which serves as a spectroscopic test for antisites; above 600 &deg;C oxygen vacancies do form and complicate the picture <Badge code="P-comp" pop="r:volk2008|pp. 16-20" />. An alternative reading of the visible band in terms of oxygen vacancies &ldquo;has not been completely ruled out&rdquo; <Badge code="P-comp" pop="r:volk2008|p. 17" />. The polaron review of Schirmer et al. is the primary reference for band shapes <Badge code="P" pop="r:schirmer2009|Crossref title" />; the gallery shows peak positions only.</p>
      <p class="tx"><b>High temperature.</b> The room-temperature defect picture does not hold at high temperature; Li disorder grows (<a class="lk" href="/crystal/polarization/">1.2</a>). A synchrotron study finds a small fraction of Li on the vacant octahedra even in <span class="term" data-pop="g:sln-nsln">stoichiometric</span> crystal at room temperature <Badge code="P-comp" pop="r:volk2008|p. 13, orig. Etschmann et al. 2001" />.</p>
    </div>
  </section>
</CrystalSection>
