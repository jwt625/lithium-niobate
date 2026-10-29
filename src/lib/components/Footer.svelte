<!-- Footer (port of mockup footer + app.js wafer map and bias meter): wafer-map site map (one die per page, built pages
     link), status key (codes used on the page), license, VISUAL background-lattice note, either the MZM bias meter or
     the FEM data credit, and the imprint row (domain, creator credit, date tag). -->
<script lang="ts">
  import { STATUS, waferPages, type StatusCode, type FooterAside, type KeySet } from "$lib/content/site";
  import { untrack } from "svelte";
  import { onUi, fxOn } from "$lib/figures/dom";
  import { driftModel, layerVoltage, type DriftModel } from "$lib/physics/drift.ts";
  import { getBiasParams, onBiasParams, type BiasParams } from "$lib/stores/bias";

  let { here, keys, keyDefs = undefined, aside = "bias", lattice = true }: { here: string; keys: StatusCode[]; keyDefs?: KeySet; aside?: FooterAside; lattice?: boolean } = $props();

  // ---------- wafer map (static SVG, computed at build time) ----------
  const R = 84, cx = 90, cy = 88, s = 22;
  interface Die { x: number; y: number; code?: string; name?: string; href?: string }
  const dies = $derived.by(() => {
    const pages = waferPages(), out: Die[] = [];
    let k = 0;
    for (let j = -4; j <= 3; j++) for (let i = -4; i <= 3; i++) {
      const x = cx + i * s, y = cy + j * s;
      if ([[x, y], [x + s, y], [x, y + s], [x + s, y + s]].some(([a, b]) => (a - cx) ** 2 + (b - cy) ** 2 > (R - 2) ** 2) || y + s > cy + R - 8) continue;
      const pg = pages[k++];
      out.push(pg ? { x, y, code: pg.code, name: pg.name, href: pg.href } : { x, y });
    }
    return out;
  });

  // ---------- MZM bias point on T = cos^2(phi / 2) ----------
  // Layered relaxation (physics/drift.ts, exact partial fractions) of the stack the reader last chose on 4.7
  // (stores/bias.ts; defaults = the 4.7 start state). Bias step at page load, or at the last click (re-lock):
  // h(t) = LN-film voltage share, phi_b(t) = pi (V/Vpi) h(t)/h(0+), relative offset h(t)/h(0+) - 1.
  // TECH, effects off, reduced motion: fixed at the locked point (t = 0+). Updates only while effects are on, the meter is
  // on screen, the tab is visible, and the stack has not settled (t > 8 tau_max).
  const W = 220, H = 64, x0 = 4, x1 = W - 4, y0 = 6, y1 = H - 12;
  const X = (phi: number): number => x0 + (phi / (2 * Math.PI)) * (x1 - x0);
  const Y = (t: number): number => y1 - t * (y1 - y0);
  const curve = Array.from({ length: 121 }, (_, i) => { const ph = (i / 120) * 2 * Math.PI; return `${i ? "L" : "M"}${X(ph).toFixed(1)} ${Y(Math.cos(ph / 2) ** 2).toFixed(1)}`; }).join("");
  const wrap = (ph: number): number => ((ph % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  let params = $state<BiasParams>(getBiasParams());
  const model = $derived.by((): DriftModel | null => {
    try { return driftModel(params.layers.map((l, i) => ({ name: l.name || `layer ${i}`, thickness_m: l.thickness_m, eps_r: l.epsR, sigma_S_per_m: l.sigma }))); }
    catch { return null; }
  });
  const rel = (m: DriftModel | null, t: number): number => (m ? layerVoltage(m, 0, t) / m.v0[0] - 1 : 0);
  const tauMax = $derived(model && model.taus.length ? Math.max(...model.taus) : 0);
  let tNow = $state(0); // s since the step; 0 = locked point
  let live = $state(false);
  const rNow = $derived(rel(model, tNow));
  const phi = $derived(Math.PI * params.vOverVpi * (1 + rNow));
  const settled = $derived(tNow > 8 * tauMax);

  // relative offset vs time since the step, log time axis 1 ms to 1e6 s
  const TW = 220, TH = 30, tx0 = 4, tx1 = TW - 4, ty0 = 3, ty1 = TH - 9, LT0 = -3, LT1 = 6;
  const TX = (t: number): number => tx0 + ((Math.log10(Math.min(10 ** LT1, Math.max(t, 10 ** LT0))) - LT0) / (LT1 - LT0)) * (tx1 - tx0);
  const trace = $derived.by(() => {
    const ts = Array.from({ length: 121 }, (_, i) => 10 ** (LT0 + ((LT1 - LT0) * i) / 120));
    const r = ts.map((t) => rel(model, t));
    let lo = Math.min(0, ...r), hi = Math.max(0, ...r);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const TY = (v: number): number => ty1 - ((v - lo) / (hi - lo)) * (ty1 - ty0);
    return { d: ts.map((t, i) => `${i ? "L" : "M"}${TX(t).toFixed(1)} ${TY(r[i]).toFixed(1)}`).join(""), z: TY(0).toFixed(1) };
  });
  const relTxt = (v: number): string => {
    const a = Math.abs(v), sg = v < -5e-4 ? "−" : "+";
    return sg + (a < 10 ? a.toFixed(3) : a < 1000 ? a.toFixed(1) : a.toExponential(2));
  };
  const tTxt = (t: number): string => (t < 1 ? `${(t * 1e3).toFixed(0)} ms` : t < 60 ? `${t.toFixed(1)} s` : t < 3600 ? `${(t / 60).toFixed(1)} min` : `${(t / 3600).toFixed(1)} h`);
  const stateTxt = $derived(`Δφ/φ<sub>0</sub> = ${relTxt(rNow)}${live ? (settled ? ", settled" : ` at ${tTxt(tNow)}`) : ", locked"}`);

  let t0 = 0; // performance.now() of the step: 0 = page load
  let timer = 0, inView = false;
  function tick(): void {
    clearTimeout(timer);
    live = fxOn();
    if (!live) { tNow = 0; return; }
    tNow = (performance.now() - t0) / 1000;
    if (inView && document.visibilityState === "visible" && !(tNow > 8 * tauMax)) timer = window.setTimeout(tick, tNow < 10 ? 50 : 250);
  }
  const relock = (): void => { t0 = performance.now(); tick(); };
  let biasEl = $state<HTMLDivElement | undefined>();
  // the footer persists across client-side navigation; (re)wire the meter whenever this page shows it
  $effect(() => {
    if (aside !== "bias" || !biasEl) return;
    untrack(() => { params = getBiasParams(); });
    const offUi = onUi(tick);
    const offP = onBiasParams((p) => { params = p; tick(); });
    const io = new IntersectionObserver((es) => { inView = es.some((e) => e.isIntersecting); tick(); });
    io.observe(biasEl);
    const vis = (): void => tick();
    document.addEventListener("visibilitychange", vis);
    untrack(tick);
    return () => { offUi(); offP(); io.disconnect(); document.removeEventListener("visibilitychange", vis); clearTimeout(timer); };
  });
</script>

<footer data-pagefind-ignore>
  <div class="grid">
    <div class="wafer"><h3>Site map</h3>
      <svg data-here={here} role="img" aria-label="Site map as a wafer map; each die is a page" viewBox="0 0 180 190">
        <circle class="edge" cx={cx} cy={cy} r={R}/><rect x={cx - 34} y={cy + R - 7} width="68" height="12" fill="var(--bg)"/><line class="edge" x1={cx - 34} y1={cy + R - 6.5} x2={cx + 34} y2={cy + R - 6.5}/>
        {#each dies as d, i (i)}
          {#if !d.code}
            <rect class="die" x={d.x + 1} y={d.y + 1} width={s - 2} height={s - 2}/>
          {:else if d.href && d.name !== here}
            <a href={d.href} aria-label={d.name}><rect class="die" x={d.x + 1} y={d.y + 1} width={s - 2} height={s - 2}><title>{d.code} {d.name}</title></rect><text class="dl" x={d.x + 3} y={d.y + 10}>{d.code}</text></a>
          {:else}
            <rect class="die" class:here={d.name === here} x={d.x + 1} y={d.y + 1} width={s - 2} height={s - 2}><title>{d.code} {d.name}{d.href ? "" : " (not built)"}</title></rect><text class="dl" x={d.x + 3} y={d.y + 10} fill={d.name === here ? "var(--bg)" : undefined}>{d.code}</text>
          {/if}
        {/each}
        <text x={cx} y={cy + R + 1} text-anchor="middle" dominant-baseline="hanging">FLAT</text>
      </svg>
    </div>
    <div>
      {#if keys.length}<h3>Status key</h3>{/if}
      <div class="key">
        {#each keys as k (k)}<span><span class="b {STATUS[k].cls}">{k}</span></span><span>{STATUS[k].def}</span>{/each}
      </div>
      {#if keyDefs}
        <h3 class="key-set">{keyDefs.title}</h3>
        <div class="key">
          {#each keyDefs.defs as k (k.code)}<span><span class="b {k.cls}">{k.code}</span></span><span>{k.def}</span>{/each}
        </div>
      {/if}
    </div>
    <div>
      <h3>License</h3>
      <p class="fine">Code GPL-3.0. Data CC BY 4.0.<br>Source: <a class="u" href="https://github.com/jwt625/lithium-niobate">github.com/jwt625/lithium-niobate</a></p>
      {#if lattice}<div data-variant="visual"><h3 class="v-foot-h">Background lattice</h3><p class="fine">Li sites of congruent LN: 4.0% vacant, 1.0% Nb antisites <span class="b d" data-pop="v-vac">derived</span></p></div>{/if}
      <div data-variant="visual" class="v-motifs"><h3 class="v-foot-h">Pointer effects</h3><p class="fine"><a class="u" href="/quirks/photorefraction/">Cursor trace</a>: photorefractive index writing (4.1). <a class="u" href="/quirks/griira/">IR dimming</a> near the pointer: green-induced infrared absorption (4.4).</p></div>
    </div>
    {#if aside === "bias"}
      <div class="bias" bind:this={biasEl}>
        <h3>MZM bias</h3>
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <svg data-pop="drift" role="img" aria-label="Modulator transfer curve with bias point; click to re-lock" viewBox="0 0 {W} {H}" onclick={relock}>
          <line class="ax" x1={x0} y1={y1} x2={x1} y2={y1}/><line class="q" x1={X(Math.PI / 2)} y1={y0} x2={X(Math.PI / 2)} y2={y1}/><path class="curve" d={curve}/>
          <rect class="pt" width="7" height="7" x={(X(wrap(phi)) - 3.5).toFixed(1)} y={(Y(Math.cos(phi / 2) ** 2) - 3.5).toFixed(1)}/>
          {#each [[x0, "0"], [X(Math.PI / 2) - 6, "π/2"], [X(Math.PI) - 3, "π"], [x1 - 10, "2π"]] as [tx, tt] (tt)}<text x={tx} y={H - 1} font-size="8" fill="var(--fg3)" font-family="IBM Plex Mono, monospace">{tt}</text>{/each}
        </svg>
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
        <svg class="tr" data-pop="drift" role="img" aria-label="Relative bias offset versus time since the bias step, log time axis 1 ms to 1 Ms; click to re-lock" viewBox="0 0 {TW} {TH}" onclick={relock}>
          <line class="q" x1={tx0} y1={trace.z} x2={tx1} y2={trace.z}/><path class="curve" d={trace.d}/>
          {#if live}<line class="cur" x1={TX(tNow).toFixed(1)} y1={ty0} x2={TX(tNow).toFixed(1)} y2={ty1}/>{/if}
          {#each [[tx0, "1 ms"], [TX(1) - 6, "1 s"], [TX(1e3) - 8, "1 ks"], [tx1 - 16, "1 Ms"]] as [tx, tt] (tt)}<text x={tx} y={TH - 1} font-size="8" fill="var(--fg3)" font-family="IBM Plex Mono, monospace">{tt}</text>{/each}
        </svg>
        <div class="state" aria-live="off">{@html stateTxt}</div>
      </div>
    {:else}
      <div>
        <h3>FEM data</h3>
        <p class="fine">eo-modulator-atlas engine (GPL-3.0-or-later), <a class="u" href="https://github.com/jwt625/eo-modulator-atlas">github.com/jwt625/eo-modulator-atlas</a></p>
      </div>
    {/if}
  </div>
  <div class="imprint"><span>lithium-niobate.com</span><span class="credit">Created by Wentao Jiang<span class="sep">|</span><a class="u" href="https://outside5sigma.com" target="_blank" rel="noopener">homepage</a><span class="sep">|</span><a class="u" href="https://github.com/jwt625/lithium-niobate" target="_blank" rel="noopener">GitHub</a></span><span><span class="tag">2026-10-25</span></span></div>
</footer>
