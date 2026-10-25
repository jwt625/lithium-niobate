<!-- Chapter 03 Sound landing: door line and door art (TECH: ASCII comb with the ripple row at the same pitch; VISUAL:
     ripple lines launched from IDT fingers, drawn to scale for 128 deg Y-X at 1 GHz), sections index, cross-links. -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { SOUND_POPS } from "$lib/figures/sound/pops";
  import { mountSound } from "$lib/figures/sound/page";
  import { r1 } from "$lib/figures/sound/plot";
  import "$lib/figures/sound/sound.css";

  let { data } = $props();
  const lam = $derived(data.v128 / 1e9 * 1e6); // um at 1 GHz
  const KV = $derived(data.key);
  usePops({
    ...SOUND_POPS, ...data.pops,
    "snd-door": { h: "Ripple pitch", body: () => `Ripples and finger pairs drawn at the wavelength of a 1 GHz surface wave on 128&deg; Y-X LN: &lambda; = v/f = ${lam.toFixed(2)} &micro;m with v = ${data.v128.toFixed(1)} m/s (free surface, Kushibiki et al. 1999 constants, partial-wave solver). Scale bar: 10 &micro;m.`, badges: [["d", "derived"]], src: "Kushibiki et al., IEEE Trans. UFFC 46, 1315 (1999), <a href='https://doi.org/10.1109/58.796136'>doi:10.1109/58.796136</a>" },
  });
  onMount(() => mountSound());
  const SECTIONS = [
    { no: "3.1", l1: "charge from pressure; 20 pm per volt along Y", l2: "four IEEE 176 forms; 3m tensors; coupling factors", l3: "convention of 2s; sign frame; clamped vs free", t: "Piezoelectricity", href: "/sound/piezoelectricity/", figs: "longitudinal response surface; constitutive forms and the convention of 2s", kw: "e, d, g, h; ε<sup>S</sup> vs ε<sup>T</sup>; coupling factors; IEEE 176 frame" },
    { no: "3.2", l1: "3.5 to 7.4 km/s; stiffening along Z", l2: "c<sup>E</sup> sets; Christoffel with e and &epsilon;<sup>S</sup>", l3: "eigen-solver; group velocity; fitted-data caveat", t: "Elastic constants and bulk waves", href: "/sound/bulk-waves/", figs: "slowness surfaces with piezoelectric stiffening", kw: "c<sup>E</sup> from four sources; Christoffel equation; measured vs computed velocities" },
    { no: "3.3", l1: "a ripple 4 &micro;m long at 1 GHz", l2: "partial waves; k<sup>2</sup> = 2&Delta;v/v; standard cuts", l3: "root selection; threshold windows; constant-set spread", t: "Surface and guided waves", href: "/sound/surface-waves/", figs: "SAW fields vs depth", kw: "Rayleigh and leaky SAW; partial waves; standard cuts; constant-set spread; thin-film plate modes" },
    { no: "3.4", l1: "cut angle sets speed and coupling", l2: "(YXl) &theta; sweep; Rayleigh vs leaky", l3: "threshold-pinned roots; set dependence", t: "Cuts and coupling", href: "/sound/cuts/", figs: "rotated Y-X cut sweep", kw: "(YXl) θ sweep; k<sup>2</sup> = 2Δv/v; 128, 64, 41° cuts" },
    { no: "3.5", l1: "a comb that launches and filters", l2: "f<sub>0</sub> = v/p; bandwidth 2/N; LN vs LT; POI, XBAR", l3: "models not included: loading, reflection, diffraction", t: "IDTs and SAW filters", href: "/sound/idt-filters/", figs: "IDT synchronous frequency and array factor", kw: "f<sub>0</sub> = v/p; bandwidth 2/N; LN vs LT; POI; XBAR" },
    { no: "3.6", l1: "light diffracted and shifted by sound", l2: "p tensor sets; figures of merit; Bragg angle", l3: "p<sub>14</sub>/p<sub>41</sub> sign pairing; 633 nm data only", t: "Acousto-optics", href: "/sound/acousto-optics/", figs: "Bragg cell; photoelastic tensor and the sign pairing", kw: "p tensor sets; figures of merit; p<sub>14</sub>/p<sub>41</sub> frame pitfall" },
    { no: "3.7", l1: "microwave &rarr; phonon &rarr; photon", l2: "transduction model; heralding; nanobenders", l3: "efficiency bookkeeping; material limits", t: "GHz phononics and piezo-optomechanics", href: "/sound/phononics/", figs: "microwave photon chain; heralded photon addition; nanobender scaling", kw: "transduction efficiency; quantum acoustics; thin-film LN platforms" },
  ];
  // VISUAL door art geometry: 1 um = K px
  const K = 12, N = 8, X0 = 40, Y0 = 40, H = 200;
  const pitch = $derived(lam * K);
  const crests = $derived(Array.from({ length: 22 }, (_, i) => X0 + N * pitch + 10 + i * pitch));
  const wave = (x: number, i: number): string => {
    let d = "";
    for (let y = Y0 - 10; y <= Y0 + H + 10; y += 6) { const dx = Math.sin(y / 23 + i * 0.7) * 2.5 + Math.sin(y / 9 + i) * 1.2; d += `${y === Y0 - 10 ? "M" : "L"}${r1(x + dx)} ${y}`; }
    return d;
  };
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "03 Sound" }]} title="03 Sound"
  depth={[{ id: "door", label: "Chapter" }, { id: "sections", label: "Sections" }, { id: "links", label: "Cross-links" }]}>

  <section class="lay" id="door" data-pair="door" data-spine="Chapter">
    <div class="sh"><h2 class="biref">A crystal that rings</h2><span class="meta">piezoelectricity, sound, surface waves, acousto-optics, phononics</span></div>
    <div class="body">
      <p class="tx">A crystal that turns a voltage into a ripple and a ripple into a voltage; most SAW filters in phones ride on it or on its sibling LiTaO<sub>3</sub>.</p>
<div class="snd-ov" data-variant="tech">
        <div class="snd-x"><table class="idx snd-tab snd-keyv"><colgroup><col style="width:46%" /><col style="width:32%" /><col style="width:22%" /></colgroup>
          <thead><tr><th>Key value, congruent LN</th><th class="r">value</th><th class="r">status</th></tr></thead>
          <tbody>
            <tr><td class="h">d<sub>22</sub>, d<sub>33</sub>, d<sub>15</sub> (pC/N)</td><td class="num">{KV.d22}, {KV.d33}, {KV.d15}</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">k<sub>15</sub>, k<sub>t</sub> (thickness shear, extensional)</td><td class="num">{KV.k15}, {KV.kt}</td><td class="r"><Badge code="derived" pop="m-forms" /></td></tr>
            <tr><td class="h">&epsilon;<sub>11</sub><sup>T</sup>, &epsilon;<sub>33</sub><sup>T</sup> (&epsilon;<sub>0</sub>)</td><td class="num">83.3, 28.5</td><td class="r"><Badge code="P" pop="r:kushibiki1999" /></td></tr>
            <tr><td class="h">Z longitudinal, measured (m/s)</td><td class="num">7328.20</td><td class="r"><Badge code="P" pop="r:kushibiki1999" /></td></tr>
            <tr><td class="h">Z longitudinal, stiffened / e = 0 (m/s)</td><td class="num">{KV.zl} / {KV.zl0}</td><td class="r"><Badge code="derived" pop="m-christoffel" /></td></tr>
            <tr><td class="h">128&deg; Y-X Rayleigh v, k&sup2;</td><td class="num">{KV.r128[0]} m/s, {KV.r128[1]}%</td><td class="r"><Badge code="derived" pop="m-saw" /></td></tr>
            <tr><td class="h">Y-Z Rayleigh v, k&sup2;</td><td class="num">{KV.yz[0]} m/s, {KV.yz[1]}%</td><td class="r"><Badge code="derived" pop="m-saw" /></td></tr>
            <tr><td class="h">64&deg; / 41&deg; Y-X leaky v, k&sup2;</td><td class="num">{KV.l64[0]}, {KV.l64[1]}% / {KV.l41[0]}, {KV.l41[1]}%</td><td class="r"><Badge code="derived" pop="m-saw" /></td></tr>
            <tr><td class="h">SAW wavelength at 1 GHz, 128&deg; Y-X (&micro;m)</td><td class="num">{KV.lam1g}</td><td class="r"><Badge code="derived" pop="snd-door" /></td></tr>
            <tr><td class="h">microwave-to-optical, TFLN, 300 K, blue pump</td><td class="num">5.5%</td><td class="r"><Badge code="reported" pop="r:p05" /></td></tr>
            <tr><td class="h">microwave-to-optical, LN on Si, &lt; 10 mK, continuous</td><td class="num">4.9%</td><td class="r"><Badge code="reported" pop="r:p17" /></td></tr>
            <tr><td class="h">nanobender tuning, small signal</td><td class="num">&asymp; 5 nm/V</td><td class="r"><Badge code="reported" pop="r:p07" /></td></tr>
          </tbody>
        </table></div>
        <div class="snd-ovfig">
          <p class="snd-cap">SAW coupling k&sup2; vs rotated Y-X cut, Kushibiki et al. 1999 constants <Badge code="derived" pop="m-saw" /></p>
<pre class="snd-asc" aria-label="Text plot of SAW coupling versus cut angle">{data.k2ascii}</pre>
          <p class="snd-cap" style="margin-top:8px">8 finger pairs and the launched ripple at the same pitch</p>
<pre class="snd-asc snd-doorasc" data-pop="snd-door" tabindex="0" aria-label="Interdigital transducer of 8 finger pairs with the launched ripple at the same pitch">=================================
 |   |   |   |   |   |   |   |
 |   |   |   |   |   |   |   |
   |   |   |   |   |   |   |   |
   |   |   |   |   |   |   |   |
=================================
 ~~  ~~  ~~  ~~  ~~  ~~  ~~  ~~  ~~  ~~  ~~  ~~
128° Y-X, 1 GHz: λ = {lam.toFixed(2)} µm (one period = 4 characters)</pre>
        </div>
      </div>
      <div class="snd-doorart" data-variant="visual" data-pop="snd-door" tabindex="0" role="img" aria-label="Ripple lines launched from interdigital fingers, drawn to scale for a 1 GHz wave on 128 degree Y-X lithium niobate">
        <svg class="snd-vsvg" viewBox="0 0 1200 290" preserveAspectRatio="xMinYMid slice">
          <rect x="0" y="0" width="1200" height="290" fill="var(--v-ln)" fill-opacity="0.05" />
          <g class="snd-ripples" style="--snd-pitch:{r1(pitch)}px">
            {#each crests as x, i (i)}<path d={wave(x, i)} fill="none" stroke="var(--v-l532)" stroke-width={r1(2.6 - i * 0.09)} stroke-opacity={r1(Math.max(0.12, 0.95 - i * 0.04))} />{/each}
          </g>
          <rect x={X0 - 12} y={Y0 - 14} width={r1(N * pitch + 14)} height="10" class="auf" />
          <rect x={X0 - 12} y={Y0 + H + 4} width={r1(N * pitch + 14)} height="10" class="auf" />
          {#each Array.from({ length: N }, (_, i) => i) as i (i)}
            <rect x={r1(X0 + i * pitch + pitch / 4 - pitch / 8)} y={Y0 - 4} width={r1(pitch / 4)} height={H - 16} class="auf" />
            <rect x={r1(X0 + i * pitch + (3 * pitch) / 4 - pitch / 8)} y={Y0 + 20} width={r1(pitch / 4)} height={H - 16} class="auf" />
          {/each}
          <path d="M{X0} 262h{10 * K}" stroke="var(--v-text2)" stroke-width="2" /><text x={X0 + 10 * K + 8} y="267">10 µm</text>
        </svg>
      </div>
      <p class="fine" data-variant="visual">Drawn to scale: 1 GHz on 128&deg; Y-X, &lambda; = {lam.toFixed(2)} &micro;m <Badge code="derived" pop="snd-door" /></p>
    </div>
  </section>

  <section class="lay" id="sections" data-pair="sections" data-spine="Sections">
    <div class="sh"><h2 class="biref">Sections</h2></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx snd-tab">
          <thead><tr><th>No.</th><th>Section</th><th>L1 phenomenon</th><th>L2 model</th><th>L3 computation</th><th>Figures</th></tr></thead>
          <tbody>{#each SECTIONS as s (s.no)}<tr><td>{s.no}</td><td class="h"><a href={s.href}>{s.t}</a></td><td>{@html s.l1}</td><td>{@html s.l2}</td><td>{@html s.l3}</td><td>{s.figs}</td></tr>{/each}</tbody>
        </table>
      </div>
      <div class="snd-doors" data-variant="visual">
        {#each SECTIONS as s (s.no)}<a class="snd-door" href={s.href}><span class="snd-door-no">{s.no}</span><span class="snd-door-t">{s.t}</span><span class="snd-door-kw">{@html s.kw}</span></a>{/each}
      </div>
    </div>
  </section>

  <section class="lay" id="links" data-pair="links" data-spine="Cross-links">
    <div class="sh"><h2 class="biref">Cross-links</h2></div>
    <div class="body">
      <p class="tx">Chapter 01 (crystal): point group 3m, the +Z sense, congruent composition (SAW-grade CLN). Chapter 02 (light): clamped vs free electro-optic coefficients, r<sup>T</sup> &minus; r<sup>S</sup> = p d, the index ellipsoid (<a class="lk" href="/light/pockels-effect/">2.2</a>). Chapter 04 (quirks): pyroelectric charging of SAW wafers. Chapter 05 (making): thin-film transfer, LN on sapphire, POI by Smart Cut. Chapters 06 and 08 (devices, industry): RF filter market, Murata XBAR, Soitec POI. Chapter 07 (history): White and Voltmer 1965; Shibayama et al. 1976; Spencer, Lenzo and Nassau 1965.</p>
    </div>
  </section>
</ChapterPage>
