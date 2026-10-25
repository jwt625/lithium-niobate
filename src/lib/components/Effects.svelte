<!-- VISUAL theme motifs and computed tokens (ports of mockup app.js effects + visual.js palette/paintVacancy):
     - spectral tokens --v-l532, --v-l633, --v-l775 computed from wavelength (CIE fit), per theme;
     - Li-vacancy texture: congruent LN [Li]/[Nb] = 0.94 (Volk & Woehlecke 2009, p. 9; source id volk2008), Li-site vacancy model assumed:
       (1 - 5x)/(1 + x) = 0.94 gives x = 0.0101: 4.04% of Li sites vacant, 1.01% Nb antisites;
     - photorefractive cursor trace (display decay) and GRIIRA dimming of .ir-el marks near the cursor (effects only);
       a page hides the trace with `html.hx-notrace` while its own trace runs (chapter 07 timeline; rule in history.css);
     - idle preload of the VISUAL faces while in TECH (no reflow on the first switch). -->
<script lang="ts">
  import { onMount } from "svelte";
  import { onUi, fxOn, isVisual, isLight, cssVar } from "$lib/figures/dom";
  import { spectral } from "$lib/figures/spectral";

  let tr: HTMLCanvasElement;
  const root = (): HTMLElement => document.documentElement;

  function palette(): void {
    const L = isLight(), set = (n: string, v: string): void => root().style.setProperty(n, v);
    set("--v-l532", spectral(532, L ? 0.2 : 1, 0.06));
    set("--v-l633", spectral(632.8, L ? 0.55 : 1, 0.04));
    set("--v-l775", spectral(775, L ? 0.3 : 0.55, 0));
  }
  const X_AS = 0.06 / 5.94;
  function paintVacancy(): void {
    const col = cssVar("--dot"), a = 16, cols = 25, rows = 28, h = (a * Math.sqrt(3)) / 2;
    let s = 1949;
    const rnd = (): number => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const N = cols * rows, idx = [...Array(N).keys()];
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const nV = Math.round(4 * X_AS * N), nA = Math.round(X_AS * N), kind = new Uint8Array(N);
    idx.slice(0, nV).forEach((k) => { kind[k] = 1; });
    idx.slice(nV, nV + nA).forEach((k) => { kind[k] = 2; });
    let dots = "", rings = "";
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      if (kind[k] === 1) continue;
      const x = ((i + (j % 2 ? 0.5 : 0) + 0.25) * a).toFixed(2), y = ((j + 0.5) * h).toFixed(2);
      if (kind[k] === 2) rings += `<circle cx="${x}" cy="${y}" r="2.4"/>`; else dots += `<circle cx="${x}" cy="${y}" r="1"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * a}" height="${(rows * h).toFixed(2)}"><g fill="${col}">${dots}</g><g fill="none" stroke="${col}" stroke-width="1">${rings}</g></svg>`;
    root().style.setProperty("--vacancy-tex", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }
  function onMode(): void {
    if (!isVisual()) { document.querySelectorAll<HTMLElement>(".ir-el").forEach((el) => { el.style.opacity = ""; }); return; }
    palette();
    paintVacancy();
  }

  onMount(() => {
    // photorefractive trace + GRIIRA
    const g = tr.getContext("2d");
    const d = Math.min(2, devicePixelRatio || 1);
    let last: { x: number; y: number } | null = null, running = false, idle = 0;
    const size = (): void => { tr.width = innerWidth * d; tr.height = innerHeight * d; };
    size();
    const tick = (): void => {
      if (!g) return;
      g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,0.012)"; g.fillRect(0, 0, tr.width, tr.height);
      g.globalCompositeOperation = "source-over";
      if (++idle < 900 && fxOn()) requestAnimationFrame(tick); else { running = false; g.clearRect(0, 0, tr.width, tr.height); }
    };
    const move = (e: PointerEvent): void => {
      if (!fxOn() || e.pointerType !== "mouse" || !g) { last = null; return; }
      const p = { x: e.clientX * d, y: e.clientY * d };
      if (last) { g.strokeStyle = isLight() ? "rgba(15,138,69,0.09)" : "rgba(94,227,140,0.08)"; g.lineWidth = 6 * d; g.lineCap = "round"; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); }
      last = p; idle = 0;
      if (!running) { running = true; requestAnimationFrame(tick); }
      document.querySelectorAll<HTMLElement>(".ir-el").forEach((el) => {
        const r = el.getBoundingClientRect();
        const near = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
        el.style.transition = near ? "opacity .3s" : "opacity 2.5s"; el.style.opacity = near ? "0.35" : "1";
      });
    };
    addEventListener("resize", size);
    addEventListener("pointermove", move);
    const off = onUi(onMode);
    onMode();
    if (!isVisual() && document.fonts?.load) {
      const ric = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1));
      ric(() => ["300 88px Newsreader", "400 18px Newsreader", "500 15px Inter", "italic 400 18px Newsreader"].forEach((f) => { document.fonts.load(f).catch(() => {}); }));
    }
    return () => { removeEventListener("resize", size); removeEventListener("pointermove", move); off(); };
  });
</script>

<canvas id="pr-trace" aria-hidden="true" bind:this={tr}></canvas>
