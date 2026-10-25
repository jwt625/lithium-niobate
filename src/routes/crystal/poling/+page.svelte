<!-- 1.9 Poling and periodic poling (content/chapters/01-crystal/manuscript.md Sec. 9; FIG-01-09 Poling bench).
     Figure modules: src/lib/figures/crystal/pb.ts (browser), pbsim.ts and pbrender.ts (pure, also run by the server load for
     the prerendered final frame), pbcanvas.ts (VISUAL stage). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountPoling } from "$lib/figures/crystal/pb";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { usePops } from "$lib/content/pops";
  import "$lib/figures/crystal/pb.css";

  let { data }: { data: PageData } = $props();
  const R = $derived(data.init.ro);
  const I = $derived(data.init);
  const N = $derived(data.num);

  // svelte-ignore state_referenced_locally
  const n = data.num;
  usePops({
    "pb-tpl": { h: "Automaton kinetics: template", body: `Every rate of the bench is a display choice: nucleation ${n.p.nuNuc} s<sup>&minus;1</sup> per finger-edge site at E = E<sub>c</sub> (interior sites &times; ${n.p.interiorNuc}, exponent &alpha; = ${n.p.alphaNuc}); wall steps ${n.p.nuStep1} and ${n.p.nuStep2} s<sup>&minus;1</sup> for sites touching 1 or 2 reversed neighbours, kinks ${n.p.nuKink} s<sup>&minus;1</sup> for 3 or more (&alpha; = ${n.p.alphaWall}); field between fingers ${n.p.fringe} of the applied field; backswitching ${n.p.nuBack} s<sup>&minus;1</sup> at domain boundaries for domains younger than ${n.p.tauStab} ms while E &lt; ${n.p.hold} E<sub>c</sub>. Field dependence: rate = &nu; exp(&minus;&alpha; ((E<sub>c</sub> &minus; E<sub>int</sub>) / (E &minus; E<sub>int</sub>) &minus; 1)), the activation form of Volk & Wöhlecke 2008 Eq. (7.32). No LN rate constants are used.`, badges: [["t", "template"]] },
    "pb-geo": { h: "Patch, comb and pulse: template", body: `Triangular lattice, spacing ${n.p.spacing} &micro;m, 96 &times; 64 sites (${n.W} &times; ${n.H} &micro;m, periodic edges), wafer thickness ${n.p.d} mm. Comb presets ${n.el.a}; ${n.el.b}; ${n.el.c} (finger columns ${n.elCols}). Pulse: ${n.p.tr} ms edges, plateau to the set duration, then the hold level (E<sub>c</sub>/2) for ${n.p.holdLen} ms or 0; window ${n.p.tail} ms past the pulse; time step ${n.p.dt} ms. Positive voltage on the +z comb, field antiparallel to P<sub>s</sub>.`, badges: [["t", "template"]] },
    "pb-fx": { h: "Image contrast: display rendering", body: "SHG view: both domain signs at one grey, walls drawn dark with a soft halo, as walls appear in SHG microscopy; the line width is a display choice, no optics are computed. Etched view: reversed domains (&minus;z face up) darker, since the &minus;c end etches much faster than the +c end (Volk & Wöhlecke 2008 p. 168); no etch rate is modelled. Character map: one character per lattice column and two lattice rows, so &lsquo;+&rsquo; marks a cell with one of its two sites reversed.", badges: [["t", "template"]] },
    "d:pb-2ps": { h: "Switched charge per area", body: `Q/A = 2 P<sub>s</sub>: reversing P<sub>s</sub> changes the surface charge density by 2 P<sub>s</sub>. P<sub>s</sub> = 0.71 C/m<sup>2</sup>: 1.42 C/m<sup>2</sup> = ${n.q2ps} &micro;C/cm<sup>2</sup>; P<sub>s</sub> = 0.80 C/m<sup>2</sup>: ${n.q2psAlt} &micro;C/cm<sup>2</sup> (1 C/m<sup>2</sup> = 100 &micro;C/cm<sup>2</sup>).`, badges: [["d", "derived"]] },
    "d:pb-wafer": { h: "Charge for a 3 inch wafer", body: `Q = 2 P<sub>s</sub> &pi; (38.1 mm)<sup>2</sup>: ${n.wafer} mC (0.71 C/m<sup>2</sup>), ${n.waferAlt} mC (0.80 C/m<sup>2</sup>). Whole-wafer area; flats and edge exclusion ignored.`, badges: [["d", "derived"]] },
    "d:pb-c": { h: "Electrode capacitance in the bench", body: `Parallel plate over the comb area of the simulated patch: C = &epsilon;<sub>0</sub> &epsilon;<sub>33</sub> (w/&Lambda;) A / d with &epsilon;<sub>33</sub> = 28 (Weis & Gaylord 1985 Table 1), A = ${n.patch} &micro;m<sup>2</sup>, d = ${n.p.d} mm: ${n.C} fF for the default comb. Fringe capacitance ignored. It sets only the displacement term C dV/dt, which the charge integral removes.`, badges: [["d", "derived"]] },
    "d:pb-i": { h: "Switching current", body: "I(t) = 2 P<sub>s</sub> dA/dt + C dV/dt, with A(t) the reversed area of the map (site count &times; site area) and V(t) the applied waveform; derivatives by central differences on the 0.05 ms grid. Backswitching gives a negative switching term.", badges: [["d", "derived"]] },
    "d:pb-q": { h: "Charge check", body: () => `Q = &int; (I &minus; C dV/dt) dt by the trapezoid rule, compared with 2 P<sub>s</sub> A of the map at the same step. Default pulse, final frame: Q = ${data.num.Qd} pC, 2 P<sub>s</sub> A = ${data.num.QAd} pC (A = ${data.num.Ad} &micro;m<sup>2</sup>), relative difference ${data.num.rel}. The central-difference current integrates exactly to the change of 2 P<sub>s</sub> A, so the two agree to rounding at every step.`, badges: [["d", "derived"]] },
    "d:pb-kai": { h: "KAI fit", body: "Least-squares line through ln(&minus;ln(1 &minus; X/X<sub>max</sub>)) against ln t for 0.02 &lt; X/X<sub>max</sub> &lt; 0.98 over the pulse (t from the start of the ramp), X<sub>max</sub> the largest switched fraction during the pulse. A fit to the template automaton, not a material parameter.", badges: [["t", "template"]] },
    "d:pb-x": { h: "Switched fraction and duty", body: "X = reversed sites / all sites of the patch. The patch spans whole comb periods, so the final X is the domain duty cycle, to compare with the finger fraction w/&Lambda;. Backswitched: (largest X so far &minus; X) / largest X.", badges: [["d", "derived"]] },
    "d:pb-area": { h: "Area from charge", body: `A = Q / (2 P<sub>s</sub>): with 0.80 instead of 0.71 C/m<sup>2</sup> every inferred area is ${n.ratio} times as large (11% smaller); with 0.71 instead of 0.80, ${n.ratioInv} times.`, badges: [["d", "derived"]] },
    "d:pb-loop": { h: "Measured P&ndash;E trace", body: "E(t) = V(t)/d and P(t) = &minus;P<sub>s</sub> + Q<sub>switched</sub>(t)/A = &minus;P<sub>s</sub> + 2P<sub>s</sub>X(t), A the patch area, both along the applied field, which points against the virgin P<sub>s</sub>; the 1.8 loops, drawn along +z, are this picture mirrored through the origin. Anchors in this frame: forward switching at +E<sub>c</sub> = 21 kV/mm, reverse field &minus;(E<sub>c</sub> &minus; 2E<sub>int</sub>) = &minus;16 kV/mm, loop centre +E<sub>int</sub> = 2.5 kV/mm (congruent E<sub>int</sub> 2.2&ndash;3.4 kV/mm in volk2008 Table 7.1 as read, about 2.5 kV/mm in gopalan1998). P follows the P<sub>s</sub> choice: 0.71 or 0.80 C/m<sup>2</sup> (71 or 80 &micro;C/cm<sup>2</sup>).", badges: [["d", "derived"]], src: "src/lib/physics/ferro.ts (loopFields); automaton X(t) template" },
    "pb-loop": { h: "Reference branch: template shape", body: "P(E) = P<sub>s</sub> tanh((E &minus; E<sub>c</sub>)/w), w = 0.05 E<sub>c</sub>, the forward branch of the 1.8 loop (loopBranch) mirrored into the applied-field frame. Only P<sub>s</sub>, E<sub>c</sub> and E<sub>int</sub> are sourced; the tanh shape and its width are display choices. The return branch is omitted because the waveform never reverses the field.", badges: [["t", "template"]], src: "src/lib/physics/ferro.ts (loopFields, loopBranch, HYSTERESIS_TEMPLATE)" },
    "d:pb-back": { h: "Backswitching in the bench", body: () => `Default pulse (22 kV/mm, 10 ms) without the hold: X reaches ${data.num.nbMax} and ends at ${data.num.nbEnd}; with the hold at E<sub>c</sub>/2 it ends at ${data.num.Xd}. Template kinetics.`, badges: [["t", "template"]] },
  });

  let body: HTMLElement;
  onMount(() => {
    const offs = [mountPoling(body, { s: data.init.s }), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

<CrystalSection slug="poling" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Writing domains" }, { id: "l2", label: "L2 Charge, history, practice" }, { id: "l3", label: "L3 Kinetics and current" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Writing domains" bind:this={body}>
    <div class="sh"><h2 class="biref">L1 Writing domains</h2><span class="meta">2P<sub>s</sub> per area; PPLN; Volk & Wöhlecke 2008</span></div>
    <div class="body">
      <p class="tx">To <span class="term" data-pop="g:poling">pole</span> is to set the polarization with a field. A uniform field across a whole wafer makes one domain; a field applied through a comb of electrodes flips only the stripes under the teeth. The result, periodically poled lithium niobate (<span class="term" data-pop="g:ppln">PPLN</span>), alternates the sign of the crystal&rsquo;s nonlinear and electro-optic coefficients every few micrometres. That alternation lets light waves of different colours stay in step over centimetres of crystal (<span class="term" data-pop="g:qpm">quasi-phase-matching</span>, <a class="lk" href="/light/">Chapter 02</a>).</p>
      <p class="tx">Every flipped domain moves a fixed charge: twice the <span class="term" data-pop="g:spontaneous-polarization">spontaneous polarization</span> times its area. Flipping one square centimetre takes {N.q2ps} microcoulombs with P<sub>s</sub> = 0.71 C/m<sup>2</sup> ({N.q2psAlt} with 0.80 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span>) <Badge code="derived" pop="d:pb-2ps" />, so the current trace of a poling pulse is a direct record of how much crystal has switched.</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel pb-t" data-pair="pbench">
          <div class="ph"><span>Poling bench: z-cut patch {N.W} &times; {N.H} &micro;m, top view of the +z face, comb on +z</span><span><Badge code="template" pop="pb-tpl" /> <Badge code="template" pop="pb-geo" /></span></div>
          <div class="pb-tg">
            <div class="pb-tl">
              <pre class="cx-ascii pb-map" role="img" aria-label="Domain map of the patch, one character per lattice column and two lattice rows: hash reversed, dot original; comb fingers marked above">{@html I.map}</pre>
              <pre class="cx-ascii pb-scope" role="img" aria-label="Traces against time: applied voltage, switching current, integrated charge, switched fraction with KAI fit; cursor at the current step">{@html I.scope}</pre>
            </div>
            <div class="pb-tr">
              <table class="kv pb-kv">
                <colgroup><col><col class="cv"><col class="cs"></colgroup>
                <tbody>
                  <tr><td>State</td><td class="v"><span class="cx-ro" data-ro="phase">{R.phase}</span></td><td class="s"></td></tr>
                  <tr><td>Time, voltage</td><td class="v"><span class="cx-ro" data-ro="tv">{R.tv}</span></td><td class="s"><Badge code="template" pop="pb-geo" /></td></tr>
                  <tr><td>I = 2P<sub>s</sub> dA/dt + C dV/dt</td><td class="v"><span class="cx-ro" data-ro="I">{R.I}</span></td><td class="s"><Badge code="derived" pop="d:pb-i" /></td></tr>
                  <tr><td>Q = &int;(I &minus; C dV/dt) dt</td><td class="v"><span class="cx-ro" data-ro="Q">{R.Q}</span></td><td class="s"><Badge code="derived" pop="d:pb-q" /></td></tr>
                  <tr><td>2P<sub>s</sub>A of the map</td><td class="v"><span class="cx-ro" data-ro="QA">{R.QA}</span></td><td class="s"><Badge code="derived" pop="d:pb-2ps" /></td></tr>
                  <tr><td>Reversed area A</td><td class="v"><span class="cx-ro" data-ro="A">{R.A}</span></td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
                  <tr><td>Q / A</td><td class="v"><span class="cx-ro" data-ro="qa">{R.qa}</span></td><td class="s"><Badge code="derived" pop="d:pb-q" /></td></tr>
                  <tr><td>Switched fraction X</td><td class="v"><span class="cx-ro" data-ro="X">{R.X}</span></td><td class="s"><Badge code="derived" pop="d:pb-x" /></td></tr>
                  <tr><td>Domain duty / comb w/&Lambda;</td><td class="v"><span class="cx-ro" data-ro="duty">{R.duty}</span> / <span class="cx-ro" data-ro="eld">{R.eld}</span></td><td class="s"><Badge code="derived" pop="d:pb-x" /></td></tr>
                  <tr><td>Backswitched</td><td class="v"><span class="cx-ro" data-ro="back">{R.back}</span></td><td class="s"><Badge code="template" pop="d:pb-back" /></td></tr>
                  <tr><td>KAI fit</td><td class="v"><span class="cx-ro" data-ro="kai">{R.kai}</span></td><td class="s"><Badge code="template" pop="d:pb-kai" /></td></tr>
                  <tr><td></td><td class="v"><span class="cx-ro" data-ro="kai2">{R.kai2}</span></td><td class="s"></td></tr>
                </tbody>
              </table>
              <div class="ctl"><label for="pb-e">Field</label><input id="pb-e" class="pb-num" type="number" data-pb="E" min="18" max="26" step="0.5" value="22"><output for="pb-e" data-ro="E">{R.E}</output></div>
              <div class="ctl"><label for="pb-tt">Pulse</label><input id="pb-tt" class="pb-num" type="number" data-pb="T" min="1" max="80" step="1" value="10"><output for="pb-tt"><span class="cx-ro">ms, window</span> <span class="cx-ro" data-ro="tw">{R.tw}</span></output></div>
              <div class="ctl"><span class="k">After pulse</span><div class="seg" role="group" aria-label="Field after the pulse"><button type="button" data-pb-hold="0">0 V</button><button type="button" data-pb-hold="1" class="on">hold E<sub>c</sub>/2</button></div><span></span></div>
              <div class="ctl pb-wide"><span class="k">Comb &Lambda;, w/&Lambda;</span><div class="seg" role="group" aria-label="Comb electrode preset"><button type="button" data-pb-el="a" class="on">6.93/0.41</button><button type="button" data-pb-el="b">6.93/0.31</button><button type="button" data-pb-el="c">10.39/0.40</button></div></div>
              <div class="ctl"><span class="k">P<sub>s</sub>, C/m<sup>2</sup></span><div class="seg" role="group" aria-label="Spontaneous polarization used for current and charge"><button type="button" data-pb-ps="0.71" class="on">0.71</button><button type="button" data-pb-ps="0.8">0.80</button></div><span class="cx-flag" data-pop="c:ps">conflict</span></div>
              <div class="ctl"><span class="k">Time axis</span><div class="seg" role="group" aria-label="Time axis of the traces"><button type="button" data-pb-tlog="0">lin</button><button type="button" data-pb-tlog="1" class="on">log</button></div><span></span></div>
              <div class="ctl"><label for="pb-sd">Seed</label><input id="pb-sd" class="pb-num" type="number" data-pb="seed" min="1" max="99" step="1" value="7"><span></span></div>
              <div class="ctl pb-go"><span class="k">Run</span><button type="button" class="pb-run" data-drive data-pb-run>PULSE</button><span></span></div>
              <div class="pb-lw">
                <div class="pb-lh"><span>Measured P&ndash;E, along the applied field</span><span><Badge code="derived" pop="d:pb-loop" /> <Badge code="template" pop="pb-loop" /></span></div>
                <pre class="cx-ascii pb-loop" role="img" aria-label="Polarization against applied field: live trace from the switching charge (stars, current point at), template reference forward branch (o), forward and reverse switching fields marked">{@html I.loop}</pre>
                <div class="pb-lf"><b>*</b> live, P = &minus;P<sub>s</sub> + 2P<sub>s</sub>X &nbsp;<b>o</b> reference &nbsp;<b>:</b> E<sub>c</sub> 21 kV/mm <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" />, E<sub>c</sub> &minus; 2E<sub>int</sub>, E<sub>int</sub> 2.5 kV/mm <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /> <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span></div>
              </div>
            </div>
          </div>
          <div class="pf"><span><b>#</b> reversed, &minus;z up</span><span><b>+</b> one of two rows reversed</span><span><b>.</b> original, +z up</span><span><b>=</b> comb finger</span><span><b>o</b> KAI fit</span><span><b>- -</b> comb w/&Lambda;</span><span>P<sub>s</sub> <Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" />, E<sub>c</sub> <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" />, E<sub>int</sub> <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" />, facets <Badge code="P-comp" pop="r:volk2008|p. 186" />, rates <Badge code="template" pop="pb-tpl" />, map <Badge code="template" pop="pb-fx" /></span></div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="pb-v" data-pair="pbench">
          <div class="pb-vstage v-frame" role="img" aria-label="Top view of the +z face under a comb electrode: grey microscope-style image of the domains, walls dark, fingers outlined in gold, polarization glyph per stripe below, 5 micrometre scale bar">
            <canvas class="pb-cv" aria-hidden="true"></canvas>
            <div class="pb-hud"><span class="cx-ro" data-ro="tv">{R.tv}</span></div>
          </div>
          <div class="pb-vside">
            <button type="button" class="pb-go-v" data-drive data-pb-run>Pulse</button>
            <div class="v-ctl" style="--w:21ch"><label for="pbv-e">Field</label><output for="pbv-e" data-ro="E">{R.E}</output><input id="pbv-e" data-pb="E" type="range" min="18" max="26" step="0.5" value="22"></div>
            <div class="v-ctl" style="--w:6ch"><label for="pbv-t">Pulse duration</label><output for="pbv-t" data-ro="Tp">{R.Tp}</output><input id="pbv-t" data-pb="T" type="range" min="1" max="80" step="1" value="10"></div>
            <div class="v-ctl"><span class="v-lab">After the pulse</span><div class="v-seg" role="group" aria-label="Field after the pulse"><button type="button" data-pb-hold="0">Field off</button><button type="button" data-pb-hold="1" class="on">Hold at E<sub>c</sub>/2</button></div></div>
            <div class="v-ctl"><span class="v-lab">Comb period, finger fraction <Badge code="template" pop="pb-geo" /></span><div class="v-seg" role="group" aria-label="Comb electrode preset"><button type="button" data-pb-el="a" class="on">6.93 &micro;m, 0.41</button><button type="button" data-pb-el="b">6.93 &micro;m, 0.31</button><button type="button" data-pb-el="c">10.39 &micro;m, 0.40</button></div></div>
            <div class="v-ctl"><span class="v-lab">P<sub>s</sub> for current and charge <span class="cx-flag" data-pop="c:ps">conflict</span></span><div class="v-seg" role="group" aria-label="Spontaneous polarization used for current and charge"><button type="button" data-pb-ps="0.71" class="on">0.71 C/m<sup>2</sup></button><button type="button" data-pb-ps="0.8">0.80 C/m<sup>2</sup></button></div></div>
            <div class="v-ctl"><span class="v-lab">Image <Badge code="template" pop="pb-fx" /></span><div class="v-seg" role="group" aria-label="Image contrast"><button type="button" data-pb-view="shg" class="on">SHG microscope</button><button type="button" data-pb-view="etch">Etched surface</button></div></div>
            <div class="v-ctl" style="--w:3ch"><label for="pbv-s">Random seed</label><output for="pbv-s" data-ro="seed">{" "}7</output><input id="pbv-s" data-pb="seed" type="range" min="1" max="99" step="1" value="7"></div>
          </div>
          <div class="pb-vscope">
            <div class="pb-svgw"><svg class="pb-svg" viewBox="0 0 760 362" role="img" aria-label="Traces against time: applied voltage, switching current, integrated charge with 2 Ps A dashed, switched fraction with KAI fit dashed; cursor at the current step">{@html I.svg}</svg></div>
            <div class="pb-vhudw">
            <figure class="pb-vloop">
              <div class="pb-vlh"><span>Measured P&ndash;E loop, along the applied field</span><span><Badge code="derived" pop="d:pb-loop" /> <Badge code="template" pop="pb-loop" /></span></div>
              <svg class="pb-lsv" viewBox="0 0 360 250" role="img" aria-label="Polarization against applied field: live trace from the switching charge with the current point, template reference forward branch, forward and reverse switching fields marked, triangle at the loop centre">{@html I.loopSvg}</svg>
              <div class="pb-vlf"><span><i class="ln"></i>live, &minus;P<sub>s</sub> + 2P<sub>s</sub>X</span><span><i class="ln ref"></i>reference branch</span><span><i class="ln an"></i>E<sub>c</sub> 21 kV/mm <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /> and E<sub>c</sub> &minus; 2E<sub>int</sub></span><span>&#9650; centre E<sub>int</sub> 2.5 kV/mm <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /> <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span></span></div>
            </figure>
            <div class="v-ctl"><span class="v-lab">Time axis</span><div class="v-seg" role="group" aria-label="Time axis of the traces"><button type="button" data-pb-tlog="0">Linear</button><button type="button" data-pb-tlog="1" class="on">Log</button></div></div>
            <dl class="v-hud pb-hudv">
              <dt>State</dt><dd data-ro="phase">{R.phase}</dd>
              <dt class="pb-tvrow">Time, voltage</dt><dd class="pb-tvrow" data-ro="tv">{R.tv}</dd>
              <dt>Current I <Badge code="derived" pop="d:pb-i" /></dt><dd data-ro="I">{R.I}</dd>
              <dt>Charge Q <Badge code="derived" pop="d:pb-q" /></dt><dd data-ro="Q">{R.Q}</dd>
              <dt>2P<sub>s</sub>A of the map</dt><dd data-ro="QA">{R.QA}</dd>
              <dt>Q / A</dt><dd data-ro="qa">{R.qa}</dd>
              <dt>Switched fraction X <Badge code="derived" pop="d:pb-x" /></dt><dd data-ro="X">{R.X}</dd>
              <dt>Comb w/&Lambda;</dt><dd data-ro="eld">{R.eld}</dd>
              <dt>Backswitched <Badge code="template" pop="d:pb-back" /></dt><dd data-ro="back">{R.back}</dd>
              <dt>KAI fit <Badge code="template" pop="d:pb-kai" /></dt><dd data-ro="kai">{R.kai}</dd>
              <dt></dt><dd data-ro="kai2">{R.kai2}</dd>
            </dl>
            </div>
          </div>
          <div class="pb-vleg">
            <span><svg class="g" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><circle class="f" cx="8" cy="8" r="1.8"/></svg>P<sub>s</sub> out of the page, original</span><span><svg class="g" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>P<sub>s</sub> into the page, reversed</span><span><i class="sw au"></i>comb finger on +z</span>
            <span><i class="ln"></i>trace</span><span><i class="ln qa"></i>2P<sub>s</sub>A from the map</span><span><i class="ln fit"></i>KAI fit</span><span><i class="ln ed"></i>comb w/&Lambda;</span><span><i class="ln fut"></i>planned V</span>
            <span>P<sub>s</sub> <Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /> E<sub>c</sub> <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /> E<sub>int</sub> <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /> facets <Badge code="P-comp" pop="r:volk2008|p. 186" /> rates <Badge code="template" pop="pb-tpl" /></span>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
      <p class="cx-cap pb-cap">Press Pulse: domains nucleate on the +z face, mostly at the finger edges, grow as hexagons, touch and merge into stripes while the current trace draws itself; the integrated charge Q equals 2P<sub>s</sub> times the reversed area at every step. Set the field to 0 after the pulse and press again: the fresh domains shrink back (<span class="term" data-pop="g:backswitching">backswitching</span>, a negative current) <Badge code="template" pop="d:pb-back" />; hold E<sub>c</sub>/2 and they stay. A longer pulse spreads domains past the fingers (<span class="term" data-pop="g:domain-merging">domain merging</span>) and lifts the <span class="term" data-pop="g:duty-cycle">duty cycle</span> above w/&Lambda;. The P&ndash;E panel plots P = &minus;P<sub>s</sub> + Q/A against the applied field as the pulse plays: a unipolar pulse drives only the forward branch, so the return branch, at &minus;(E<sub>c</sub> &minus; 2E<sub>int</sub>) = &minus;16 kV/mm, is never reached and is not drawn. Any parameter change loads a fresh single-domain patch; the same seed replays the same run. Rates are template values; P<sub>s</sub>, E<sub>c</sub>, E<sub>int</sub>, the hexagon facets and nucleation at +z are sourced.</p>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Charge, history, practice">
    <div class="sh"><h2 class="biref">L2 Charge, history, practice</h2><span class="meta">2P<sub>s</sub>; 1962&ndash;1995; Volk & Wöhlecke 2008 pp. 177&ndash;180</span></div>
    <div class="body">
      <div class="eq"><math display="block"><mrow><mfrac><mi>Q</mi><mi>A</mi></mfrac><mo>=</mo><mn>2</mn><msub><mi>P</mi><mi>s</mi></msub><mo>=</mo><mn>{N.q2ps}</mn><mspace width="0.2em"/><mi mathvariant="normal">&micro;C/cm</mi><msup><mi></mi><mn>2</mn></msup></mrow></math><span class="eqn"><Badge code="derived" pop="d:pb-2ps" /></span></div>
      <div class="cx-tw">
        <table class="idx cx-t pb-qt">
          <thead><tr><th>Quantity</th><th>Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Switched charge per area, Q/A = 2P<sub>s</sub></td><td>1.42 C/m<sup>2</sup> = {N.q2ps} &micro;C/cm<sup>2</sup> (P<sub>s</sub> = 0.71 C/m<sup>2</sup>); {N.q2psAlt} &micro;C/cm<sup>2</sup> (P<sub>s</sub> = 0.80 C/m<sup>2</sup>) <span class="cx-flag" data-pop="c:ps">conflict</span></td><td class="s"><Badge code="derived" pop="d:pb-2ps" /></td></tr>
            <tr><td class="h">Charge to invert a whole 76.2 mm (3 inch) wafer</td><td>{N.wafer} mC (P<sub>s</sub> = 0.71 C/m<sup>2</sup>); {N.waferAlt} mC (0.80 C/m<sup>2</sup>); area &pi; (38.1 mm)<sup>2</sup></td><td class="s"><Badge code="derived" pop="d:pb-wafer" /></td></tr>
            <tr><td class="h">Optimum duty cycle for first-order QPM</td><td>0.5</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 179" /></td></tr>
          </tbody>
        </table>
      </div>

      <p class="tx">Milestones of domain engineering, dates as published (Chapter 07 holds the full chronology):</p>
      <div class="cx-tw">
        <table class="idx cx-t pb-mt">
          <thead><tr><th>Year</th><th>Step</th><th class="r">Source</th></tr></thead>
          <tbody>
            <tr><td class="num">1962</td><td>Periodic reversal of the nonlinear coefficient proposed for phase matching</td><td class="s"><Badge code="P" pop="r:armstrong1962|Crossref title" /></td></tr>
            <tr><td class="num">1965</td><td>Domains revealed by etching</td><td class="s"><Badge code="P" pop="r:nassau1965|Crossref title" /></td></tr>
            <tr><td class="num">1966</td><td>Preparation of single-domain crystals</td><td class="s"><Badge code="P" pop="r:nassau1966b|Crossref title" /></td></tr>
            <tr><td class="num">1979</td><td><span class="term" data-pop="g:ti-indiffusion">Ti in-diffusion</span> inverts a surface layer on the +c face</td><td class="s"><Badge code="P" text="P(abs)" pop="r:miyazawa1979|abstract" /></td></tr>
            <tr><td class="num">1980</td><td>Periodic laminar domains grown in by <span class="term" data-pop="g:czochralski-growth">Czochralski</span> growth striations; SHG enhanced by QPM on d<sub>33</sub>; Y-doped, period 7 &micro;m</td><td class="s"><Badge code="P" text="P(abs)" pop="r:feng1980|abstract" /> <Badge code="P-comp" pop="r:volk2008|p. 177" /></td></tr>
            <tr><td class="num">1993</td><td>First-order QPM waveguide poled by an external field at room temperature; 20.7 mW blue, 600 %/(W cm<sup>2</sup>); pulse 24 kV/mm, 100 &micro;s, period 2.8 &micro;m</td><td class="s"><Badge code="P" text="P(abs)" pop="r:yamada1993|abstract" /> <Badge code="P-comp" pop="r:volk2008|p. 178" /></td></tr>
            <tr><td class="num">1994&ndash;1995</td><td>Liquid-electrode poling, period from 9 &micro;m to 4.5 &micro;m; d<sub>eff</sub> from 2 to 19 pm/V against a 22 pm/V limit</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 179, orig. Webjorn et al., Pruneri et al." /></td></tr>
            <tr><td class="num">1995</td><td>Bulk PPLN optical parametric oscillators; backswitching found and controlled</td><td class="s"><Badge code="P" pop="r:myers1995|Crossref title" /> <Badge code="P-comp" pop="r:volk2008|pp. 179-180" /></td></tr>
          </tbody>
        </table>
      </div>

      <p class="tx">Poling practice reported for bulk <span class="term" data-pop="g:congruent-melting-composition">congruent</span> crystal <Badge code="P-comp" pop="r:volk2008|pp. 179-180" />:</p>
      <ul class="pb-list">
        <li><b><span class="term" data-pop="g:backswitching">Backswitching.</span></b> If the pulse is too short the new domains flip back; at 25 kV/mm the critical time was at least 50 ms. Remedies: hold at about E<sub>c</sub>/2 after the pulse, or use ramped fields.</li>
        <li><b><span class="term" data-pop="g:domain-merging">Domain merging.</span></b> Domains spread beyond the electrode, so the electrode duty cycle is set below the target.</li>
        <li><b>Electrodes.</b> Al stripes on +z under photoresist (or resist openings under a conductor), contacted through LiCl electrolyte; electrolyte on &minus;z.</li>
        <li><b>Stability.</b> PPLN survived heating to 800 &deg;C.</li>
      </ul>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Kinetics and current">
    <div class="sh"><h2 class="biref">L3 Kinetics and current</h2><span class="meta">nucleation and growth; KAI; switching current; thin films</span></div>
    <div class="body">
      <p class="tx"><b>Kinetics.</b> Switching proceeds by nucleation (at the +z surface in undoped crystal), forward growth along <i>c</i>, and sideways wall motion; wall motion itself proceeds by nucleation of steps on the existing wall, which accounts for the activation-type field dependence <Badge code="P-comp" pop="r:volk2008|pp. 164, 186-190" /> <Badge code="P" pop="r:shur2006|Crossref title" />. In congruent crystal the walls run parallel to the yz glide planes <Badge code="P-comp" pop="r:volk2008|p. 186" />; DFT finds <span class="term" data-pop="g:y-wall">Y-walls</span> lower in energy than X-walls, so domains are hexagons bounded by Y-walls, and antisite&ndash;wall interactions in congruent LiNbO<sub>3</sub> are too weak to change that <Badge code="P" text="P(abs)" pop="r:lee2011|abstract" />. A <span class="term" data-pop="g:kolmogorov-avrami-ishibashi-kai-model">Kolmogorov&ndash;Avrami&ndash;Ishibashi</span> switched fraction is the fit form used below:</p>
      <div class="eq"><math display="block"><mrow><mi>X</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mn>1</mn><mo>&minus;</mo><mi>exp</mi><mrow><mo>[</mo><mo>&minus;</mo><msup><mrow><mo>(</mo><mi>t</mi><mo>/</mo><msub><mi>t</mi><mn>0</mn></msub><mo>)</mo></mrow><mi>n</mi></msup><mo>]</mo></mrow></mrow></math><span class="eqn"></span></div>
      <p class="tx">In the bench above all rates are template values; only P<sub>s</sub>, the E<sub>c</sub> anchor, E<sub>int</sub> and the domain shape are sourced. Fitted to the default pulse, the automaton gives n = {N.kai}, t<sub>0</sub> = {N.kaiT0} ms (r<sup>2</sup> = {N.kaiR2}) <Badge code="template" pop="d:pb-kai" />: a property of the template, not of LiNbO<sub>3</sub>.</p>

      <p class="tx"><b>What the switching current measures.</b> The current through the electrodes is the switching term plus the charging of the electrode capacitance:</p>
      <div class="eq"><math display="block"><mrow><mi>I</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mn>2</mn><msub><mi>P</mi><mi>s</mi></msub><mfrac><mrow><mi>d</mi><mi>A</mi></mrow><mrow><mi>d</mi><mi>t</mi></mrow></mfrac><mo>+</mo><mi>C</mi><mfrac><mrow><mi>d</mi><mi>V</mi></mrow><mrow><mi>d</mi><mi>t</mi></mrow></mfrac></mrow></math><span class="eqn"><Badge code="derived" pop="d:pb-i" /></span></div>
      <div class="eq"><math display="block"><mrow><mo>&int;</mo><mrow><mo>(</mo><mi>I</mi><mo>&minus;</mo><mi>C</mi><mfrac><mrow><mi>d</mi><mi>V</mi></mrow><mrow><mi>d</mi><mi>t</mi></mrow></mfrac><mo>)</mo></mrow><mi>d</mi><mi>t</mi><mo>=</mo><mn>2</mn><msub><mi>P</mi><mi>s</mi></msub><mi>A</mi></mrow></math><span class="eqn"><Badge code="derived" pop="d:pb-q" /></span></div>
      <p class="tx">Integrated current minus the capacitive part equals 2P<sub>s</sub>A of the switched area. In the bench, Q = {N.Qd} pC against 2P<sub>s</sub>A = {N.QAd} pC for the default pulse <Badge code="derived" pop="d:pb-q" />; the displacement term uses C = {N.C} fF <Badge code="derived" pop="d:pb-c" />. The P<sub>s</sub> disagreement (0.71 vs 0.80 C/m<sup>2</sup> <span class="cx-flag" data-pop="c:ps">conflict</span>) is therefore an 11% uncertainty in any area inferred from charge <Badge code="derived" pop="d:pb-area" />.</p>

      <p class="tx"><b>Thin films.</b> Poling of <span class="term" data-pop="g:x-cut">x-cut</span> and <span class="term" data-pop="g:z-cut">z-cut</span> thin-film LN (<span class="term" data-pop="g:tfln">TFLN</span>; coplanar electrodes, sub-micrometre periods, incomplete depth) is treated with process detail in Chapter 05.</p>

      <p class="tx"><b>How the bench is computed.</b> Stochastic cellular automaton on a triangular lattice in the z-cut top view, seeded generator, synchronous update. Nearest neighbours lie at 30&deg; + k &middot; 60&deg; from x, so facets run along y and &plusmn;60&deg; from y, the traces of the three mirror planes. Untouched sites under a finger nucleate (edge sites 50 times more often than interior ones); sites next to reversed ones switch at step rates (1 or 2 reversed neighbours) or kink rates (3 or more), each with the activation form of Volk & Wöhlecke 2008 Eq. (7.32) referenced to E<sub>c</sub> &minus; E<sub>int</sub>. Domains younger than the stabilization age revert from their boundary while E &lt; E<sub>c</sub>/2. The map has no depth: domains are assumed through the thickness.</p>
      <div class="cx-tw">
        <table class="idx cx-t pb-pt">
          <thead><tr><th>Parameter</th><th class="r">Value</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Spontaneous polarization P<sub>s</sub></td><td class="num">0.71 C/m<sup>2</sup> (0.80 offered)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 1.1 p. 3" /> <span class="cx-flag" data-pop="c:ps">conflict</span></td></tr>
            <tr><td class="h">Coercive field E<sub>c</sub>, congruent</td><td class="num">{N.p.Ec} kV/mm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td></tr>
            <tr><td class="h">Internal field E<sub>int</sub>, congruent</td><td class="num">{N.p.Eint} kV/mm</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td></tr>
            <tr><td class="h">Hold level that suppresses backswitching</td><td class="num">{N.p.hold} E<sub>c</sub></td><td class="s"><Badge code="reported" pop="r:volk2008|pp. 179-180" /></td></tr>
            <tr><td class="h">Stabilization age</td><td class="num">{N.p.tauStab} ms</td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
            <tr><td class="h">Nucleation rate at E<sub>c</sub>, finger-edge site; interior factor; &alpha;</td><td class="num">{N.p.nuNuc} s<sup>&minus;1</sup>; {N.p.interiorNuc}; {N.p.alphaNuc}</td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
            <tr><td class="h">Step rates, 1 / 2 reversed neighbours</td><td class="num">{N.p.nuStep1} / {N.p.nuStep2} s<sup>&minus;1</sup></td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
            <tr><td class="h">Kink rate, 3 or more reversed neighbours; wall &alpha;</td><td class="num">{@html N.p.nuKink} s<sup>&minus;1</sup>; {N.p.alphaWall}</td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
            <tr><td class="h">Backswitching rate at domain boundaries</td><td class="num">{N.p.nuBack} s<sup>&minus;1</sup></td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
            <tr><td class="h">Field between fingers / applied</td><td class="num">{N.p.fringe}</td><td class="s"><Badge code="template" pop="pb-tpl" /></td></tr>
            <tr><td class="h">Lattice spacing; patch; time step</td><td class="num">{N.p.spacing} &micro;m; {N.W} &times; {N.H} &micro;m; {N.p.dt} ms</td><td class="s"><Badge code="template" pop="pb-geo" /></td></tr>
            <tr><td class="h">Electrode capacitance (displacement term)</td><td class="num">{N.C} fF</td><td class="s"><Badge code="derived" pop="d:pb-c" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</CrystalSection>
