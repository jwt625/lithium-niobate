<!-- F7.3 Write, fix, erase (hero story H1; figures.md F7.3). The cursor (or a finger) writes with a 532 nm brush on an
     Fe:LN plate; the image is the index pattern. Read (1968) erases under uniform illumination; Fix (1971) copies the
     pattern into a layer that light does not erase; MgO (1980) raises photoconductivity about 100x: the trace is weaker
     and relaxes faster. Model and time constants: plate.ts (template values). TECH: gray phase image, mono controls.
     VISUAL: the plate as a specimen with a far-field eyepiece. -->
<script lang="ts">
  import { lab } from "../labels";
  import { onMount } from "svelte";
  import { Plate, G, level, farField } from "../plate";

  const pl = new Plate();
  let reading = $state(false), mgo = $state(false), fixedN = $state(0);
  let ro = $state({ tw: "0.50 s", tr: "10.0 s", peak: "0.000", fixed: "  0%" });
  let cT: HTMLCanvasElement, cV: HTMLCanvasElement, fT: HTMLCanvasElement, fV: HTMLCanvasElement;
  const pat = new Float32Array(G * G);
  const reduce = (): boolean => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmtT = (t: number): string => (t >= 10 ? `${t.toFixed(1)} s` : t >= 1 ? `${t.toFixed(2)} s` : t >= 0.1 ? `${t.toFixed(2)} s` : `${(t * 1000).toFixed(1)} ms`).padStart(7, " ");
  const upd = (): void => {
    const r = pl.pattern(pat);
    ro = { tw: fmtT(pl.tauWrite()), tr: fmtT(pl.tauRead()), peak: Math.min(9.999, r.peak).toFixed(3), fixed: `${Math.round(r.fixedShare * 100)}%`.padStart(4, " ") };
  };
  upd();

  let raf = 0, last = 0, lastFF = 0;
  function draw(c: HTMLCanvasElement | undefined, visual: boolean): void {
    if (!c || c.offsetParent === null) return;
    const g = c.getContext("2d"); if (!g) return;
    const img = g.createImageData(G, G), light = document.documentElement.dataset.theme === "light";
    for (let k = 0; k < G * G; k++) {
      const v = level(pat[k]), q = k * 4;
      if (!visual) { const L = light ? 245 - 225 * v : 12 + 228 * v; img.data[q] = img.data[q + 1] = img.data[q + 2] = L; }
      else if (light) { img.data[q] = 236 - 150 * v; img.data[q + 1] = 226 - 120 * v; img.data[q + 2] = 196 - 140 * v; }
      else { img.data[q] = 40 + 200 * v; img.data[q + 1] = 36 + 196 * v; img.data[q + 2] = 30 + 170 * v; }
      img.data[q + 3] = 255;
    }
    const t = document.createElement("canvas"); t.width = G; t.height = G; t.getContext("2d")?.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.drawImage(t, 0, 0, c.width, c.height);
    if (pl.brush) { g.strokeStyle = visual ? "rgba(69,255,156,0.85)" : light ? "#111" : "#e6e5e0"; g.lineWidth = 1.5; g.beginPath(); g.arc(((pl.brush.x + 0.5) / G) * c.width, ((pl.brush.y + 0.5) / G) * c.height, (4.2 / G) * c.width, 0, 2 * Math.PI); g.stroke(); }
  }
  function drawFF(c: HTMLCanvasElement | undefined, visual: boolean): void {
    if (!c || c.offsetParent === null) return;
    const g = c.getContext("2d"); if (!g) return;
    const N = 64, ff = farField(pat, N), img = g.createImageData(N, N), light = document.documentElement.dataset.theme === "light";
    for (let k = 0; k < N * N; k++) { const v = ff[k] ** 1.5, q = k * 4; if (!visual) { const L = light ? 250 - 230 * v : 230 * v; img.data[q] = img.data[q + 1] = img.data[q + 2] = L; } else if (light) { img.data[q] = 250 - 235 * v; img.data[q + 1] = 250 - 112 * v; img.data[q + 2] = 250 - 181 * v; } else { img.data[q] = 69 * v; img.data[q + 1] = 255 * v; img.data[q + 2] = 156 * v; } img.data[q + 3] = 255; }
    const t = document.createElement("canvas"); t.width = N; t.height = N; t.getContext("2d")?.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, c.width, c.height);
  }
  function render(ff = false): void { upd(); draw(cT, false); draw(cV, true); if (ff) { drawFF(fT, false); drawFF(fV, true); } }
  function loop(now: number): void {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const busy = pl.step(dt);
    const doFF = now - lastFF > 250; if (doFF) lastFF = now;
    render(doFF);
    raf = busy ? requestAnimationFrame(loop) : 0;
    if (!busy) render(true);
  }
  const kick = (): void => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  function at(e: PointerEvent): void {
    const c = e.currentTarget as HTMLCanvasElement, r = c.getBoundingClientRect();
    pl.brush = { x: ((e.clientX - r.left) / r.width) * G - 0.5, y: ((e.clientY - r.top) / r.height) * G - 0.5 };
    kick();
  }
  const off = (): void => { pl.brush = null; render(true); };
  function setRead(v: boolean): void { reading = pl.reading = v; if (v && reduce()) { pl.settleRead(); render(true); } else kick(); }
  function setMgo(v: boolean): void { mgo = pl.mgo = v; render(true); }
  function fix(): void { pl.fix(); fixedN++; render(true); }
  function reset(): void { pl.reset(); reading = false; mgo = false; fixedN = 0; render(true); }

  onMount(() => {
    for (const c of [cT, cV]) { c.width = 440; c.height = 440; }
    for (const c of [fT, fV]) { c.width = 128; c.height = 128; }
    // a deterministic first trace (one sine period, display) so the plate is not blank on load
    const path: [number, number][] = [];
    for (let s = 0; s <= 1; s += 0.01) path.push([22 + 66 * s, 55 + 18 * Math.sin(2 * Math.PI * s)]);
    for (const [x, y] of path) { pl.brush = { x, y }; pl.step(0.05); }
    pl.brush = null;
    render(true);
    const ui = (): void => render(true);
    addEventListener("ln-mode", ui);
    return () => { cancelAnimationFrame(raf); removeEventListener("ln-mode", ui); };
  });
</script>

<div data-variant="tech" class="panel hx-pl">
  <div class="ph"><span>Fe:LN plate, index pattern |&Delta;n| / &Delta;n<sub>sat</sub>, log 10<sup>&minus;3</sup> to 1</span><span>{mgo ? "MgO:LN" : "congruent LN"}</span></div>
  <div class="hx-pl-g">
    <canvas class="hx-pl-c" bind:this={cT} onpointermove={at} onpointerdown={at} onpointerleave={off} onpointercancel={off} aria-label="Plate: move the cursor over it to write with a 532 nm beam"></canvas>
    <div class="hx-pl-side">
      <div class="seg hx-pl-b" role="group" aria-label="Steps in date order">
        <button type="button" class:on={reading} aria-pressed={reading} title="Chen, LaMacchia and Fraser 1968: holograms read out, erased by uniform light" onclick={() => setRead(!reading)}>READ 1968</button>
        <button type="button" title="Amodei and Staebler 1971: about 30 min at 100 C fixes the pattern" onclick={fix}>FIX 1971</button>
        <button type="button" class:on={mgo} aria-pressed={mgo} title="1980 conference abstract (Zhong, Jin, Wu); Bryan et al. 1984: MgO above about 4.5 at.% raises photoconductivity about 100x" onclick={() => setMgo(!mgo)}>MGO 1980</button>
        <button type="button" onclick={reset}>RESET</button>
      </div>
      <table class="kv hx-pl-kv">
        <colgroup><col><col class="cv"></colgroup>
        <tbody>
          <tr><td>&tau; writing (2&times;10<sup>4</sup> W/m<sup>2</sup>)</td><td class="v">{ro.tw}</td></tr>
          <tr><td>&tau; reading (10<sup>3</sup> W/m<sup>2</sup>)</td><td class="v">{ro.tr}</td></tr>
          <tr><td>Peak contrast / &Delta;n<sub>sat</sub></td><td class="v">{ro.peak}</td></tr>
          <tr><td>Fixed share of the pattern</td><td class="v">{ro.fixed}</td></tr>
        </tbody>
      </table>
      <div class="hx-pl-ff"><canvas bind:this={fT} aria-label="Far-field preview of the pattern"></canvas><span>far field, log |FFT|<sup>2</sup> of e<sup>i&pi;&Delta;n/&Delta;n<sub>sat</sub></sup></span></div>
    </div>
  </div>
  <div class="pf">Order of magnitude measured: &Delta;n<sub>e</sub> up to 10<sup>&minus;3</sup> under 20 mW at 488 nm <span class="hx-ref" data-pop="src:chen1969">{lab("chen1969")}</span>. Time constants: display values from the reduced single-center model, not material data; the dark decay (dielectric relaxation) takes days in this model. Steps: <span class="hx-ref" data-pop="src:chen1968">{lab("chen1968")}</span>, <span class="hx-ref" data-pop="src:amodei1971b">{lab("amodei1971b")}</span>, <span class="hx-ref" data-pop="src:bryan1984">{lab("bryan1984")}</span>.</div>
</div>

<div data-variant="visual" class="hx-vpl">
  <div class="hx-vpl-plate">
    <canvas class="hx-pl-c" bind:this={cV} onpointermove={at} onpointerdown={at} onpointerleave={off} onpointercancel={off} aria-label="Fe:LN plate: move the cursor over it to write with a 532 nm beam"></canvas>
    <span class="hx-vpl-c">+c &rarr;</span>
  </div>
  <div class="hx-vpl-side">
    <div class="hx-vpl-steps">
      <button type="button" class="hx-vst" class:on={reading} aria-pressed={reading} onclick={() => setRead(!reading)}><b>1968</b><span>Read</span><small>uniform light erases the pattern</small></button>
      <button type="button" class="hx-vst" class:flash={fixedN > 0} onclick={fix}><b>1971</b><span>Fix</span><small>heat: the pattern survives reading</small></button>
      <button type="button" class="hx-vst" class:on={mgo} aria-pressed={mgo} onclick={() => setMgo(!mgo)}><b>1980</b><span>Add MgO</span><small>above 4.5 at.%: 100&times; photoconductivity</small></button>
      <button type="button" class="hx-vst hx-vst-r" onclick={reset}><b>&nbsp;</b><span>Reset</span><small>congruent plate, blank</small></button>
    </div>
    <dl class="v-hud hx-vpl-hud">
      <dt>Crystal</dt><dd>{mgo ? "MgO:LN" : "congruent Fe:LN"}</dd>
      <dt>&tau; writing (2&times;10<sup>4</sup> W/m<sup>2</sup>) / reading (10<sup>3</sup> W/m<sup>2</sup>)</dt><dd>{ro.tw} / {ro.tr}</dd>
      <dt>Peak contrast</dt><dd>{ro.peak}</dd>
      <dt>Fixed share</dt><dd>{ro.fixed}</dd>
    </dl>
    <div class="hx-vpl-eye"><canvas bind:this={fV} aria-label="Far field of the written pattern"></canvas><span>Far field of your trace</span></div>
  </div>
  <p class="v-cap hx-vpl-cap">Move over the plate to write. Brightness: |&Delta;n| on a log scale over three decades; measured order 10<sup>&minus;3</sup> <span class="hx-ref" data-pop="src:chen1969">{lab("chen1969")}</span>. Time constants are display values from the reduced single-center model, not material data; the dark decay takes days in this model. Steps: <span class="hx-ref" data-pop="src:chen1968">{lab("chen1968")}</span>, <span class="hx-ref" data-pop="src:amodei1971b">{lab("amodei1971b")}</span>; MgO: 1980 conference abstract, <span class="hx-ref" data-pop="src:bryan1984">{lab("bryan1984")}</span> (threshold about 4.5 at.%).</p>
</div>
