<!-- F05-07 Writing the pattern: e-beam raster vs DUV stepper. EBL time t = D A n / I (fab.eblWriteTime) for reported dose
     and current presets (kaufmann2023, jiang2016); exposed-area fraction is a template input. DUV: under 1 min per wafer
     and the authors' EBL estimate above 8 days at 10 nA, 125 kV (luke2020). 22 mm x 22 mm fields inside the wafer
     minus 8 mm edge exclusion (fab.stepperFieldCount, best of the half-field grid offsets; derived). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { eblWriteTime, stepperFieldCount } from "$lib/physics/fab.ts";

  const PRE = [
    { k: "bulk", l: "HSQ bulk, 7600 µC/cm², 100 nA", D: 7600, I: 100, n: 1, pop: "src:kauf" },
    { k: "sleeve", l: "HSQ sleeve, 1900 µC/cm² × 4, 8 nA", D: 1900, I: 8, n: 4, pop: "src:kauf" },
    { k: "zep", l: "ZEP, 300 µC/cm², 2 nA", D: 300, I: 2, n: 1, pop: "src:jiang" },
  ];
  let pi = $state(0);
  let frac = $state(10);
  let wd = $state(100);
  let log = $state(true);
  let el = $state(1.78); // log10 elapsed seconds (VISUAL race)
  const p = $derived(PRE[pi]);
  const perCm2 = $derived(eblWriteTime(p.D, 1, p.I, p.n));
  const usable = $derived(Math.PI * ((wd / 2 - 8) / 10) ** 2); // cm^2
  const tWafer = $derived(eblWriteTime(p.D, usable * (frac / 100), p.I, p.n));
  const F = $derived(stepperFieldCount(wd, 22, 8));
  const bars = $derived([
    ...PRE.map((q) => ({ l: q.l, s: eblWriteTime(q.D, usable * (frac / 100), q.I, q.n), code: "derived" as const, pop: "src:ebl", lim: "" })),
    { l: "EBL estimate, 10 nA, 125 kV (authors)", s: 8 * 86400, code: "reported" as const, pop: "src:luke", lim: ">" },
    { l: "DUV stepper, whole wafer", s: 60, code: "reported" as const, pop: "src:luke", lim: "<" },
  ]);
  const S0 = 1, S1 = 1e8, X0 = 250, X1 = 500;
  const X = (s: number): number => (log ? X0 + (Math.log10(Math.max(s, S0)) / 8) * (X1 - X0) : X0 + (Math.min(s, 3e6) / 3e6) * (X1 - X0));
  const dur = (s: number): string => (s < 120 ? `${s.toFixed(0)} s` : s < 7200 ? `${(s / 60).toFixed(1)} min` : s < 172800 ? `${(s / 3600).toFixed(1)} h` : `${(s / 86400).toFixed(1)} d`);
  const pad = (s: string, n: number): string => s.padStart(n, " ");
  const siteMap = $derived.by(() => {
    const W = 40, H = 20, out: string[] = [];
    const R = wd / 2, Ru = R - 8;
    const half = 11;
    for (let r = 0; r < H; r++) {
      let s = "";
      for (let c = 0; c < W; c++) {
        const x = -R + ((c + 0.5) * 2 * R) / W, y = R - ((r + 0.5) * 2 * R) / H, d = Math.hypot(x, y);
        const inF = F.centres.some(([cx, cy]) => Math.abs(x - cx) <= half && Math.abs(y - cy) <= half);
        const edgeF = F.centres.some(([cx, cy]) => Math.abs(x - cx) <= half && Math.abs(y - cy) <= half && (Math.abs(Math.abs(x - cx) - half) < (R / W) * 1.1 || Math.abs(Math.abs(y - cy) - half) < (R / H) * 1.1));
        s += d > R ? " " : edgeF ? "+" : inF ? "#" : d > Ru ? "x" : ".";
      }
      out.push(s);
    }
    return out.join("\n");
  });
  // VISUAL race
  const elapsed = $derived(10 ** el);
  const duvDone = $derived(Math.min(F.count, Math.floor((elapsed / 60) * F.count)));
  const eblFrac = $derived(Math.min(1, elapsed / tWafer));
  const sc = $derived(130 / (wd / 2));
  const serp = $derived.by(() => {
    // raster rows across the usable disc, 4 mm pitch (drawing only)
    const R = wd / 2 - 8, pts: string[] = [];
    let k = 0;
    for (let y = R - 2; y > -R; y -= 4, k++) { const w = Math.sqrt(Math.max(0, R * R - y * y)); pts.push(...(k % 2 ? [`${w},${y}`, `${-w},${y}`] : [`${-w},${y}`, `${w},${y}`])); }
    return pts.map((q) => q.split(",").map(Number) as [number, number]);
  });
  const serpLen = $derived(serp.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - serp[i - 1][0], q[1] - serp[i - 1][1]) : 0), 0));
</script>

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Pattern writing time per wafer: EBL raster vs DUV stepper</span><span>{wd} mm, 8 mm edge exclusion</span></div>
  <div class="mk-duo2">
    <div>
      <svg class="mk-plot" viewBox="0 0 520 190" role="img" aria-label="Write time per wafer, bar chart">
        {#each (log ? [1, 1e2, 1e4, 1e6, 1e8] : [0, 1e6, 2e6, 3e6]) as s (s)}<line class="gl" x1={X(s)} x2={X(s)} y1="8" y2="160" /><text class="tk m" x={X(s)} y="174">{log ? `1e${Math.round(Math.log10(Math.max(s, 1)))}` : `${(s / 1e6).toFixed(0)}e6`}</text>{/each}
        {#each bars as b, i (b.l)}
          <text class="tk e" x={X0 - 6} y={24 + i * 30}>{b.l.length > 38 ? b.l.slice(0, 37) + "…" : b.l}</text>
          <rect x={X0} y={13 + i * 30} width={Math.max(1, X(b.s) - X0)} height="14" class={b.code === "derived" ? "band" : "gl"} style={b.code === "reported" ? "fill: var(--fg3)" : ""} />
          <text class="tk" x={Math.min(X1 - 4, X(b.s) + 4)} y={24 + i * 30} style="text-anchor:{X(b.s) > X1 - 60 ? 'end' : 'start'}">{b.lim}{dur(b.s)}</text>
        {/each}
        <text class="tk m" x={(X0 + X1) / 2} y="188">seconds per wafer</text>
      </svg>
      <div class="ctl"><span class="k">EBL preset</span><div class="seg" role="group" aria-label="EBL preset">{#each PRE as q, i (q.k)}<button type="button" class:on={pi === i} onclick={() => (pi = i)}>{q.k.toUpperCase()}</button>{/each}</div><output>{p.I} nA</output></div>
      <div class="ctl"><label for="li-f">Exposed area (template)</label><input id="li-f" type="range" min="1" max="100" step="1" bind:value={frac}><output>{pad(String(frac), 3)} %</output></div>
      <div class="ctl"><span class="k">Wafer, axis</span><div class="seg" role="group" aria-label="Wafer"><button type="button" class:on={wd === 100} onclick={() => (wd = 100)}>100 MM</button><button type="button" class:on={wd === 150} onclick={() => (wd = 150)}>150 MM</button></div><div class="seg" role="group" aria-label="Axis"><button type="button" class:on={log} onclick={() => (log = true)}>LOG</button><button type="button" class:on={!log} onclick={() => (log = false)}>LIN</button></div></div>
      <div class="mk-ro"><span>t_EBL {pad((perCm2 / 3600).toFixed(1), 6)} h/cm²</span><span>wafer {pad(dur(tWafer), 9)}</span><Badge code="derived" pop="src:ebl" /><span>t_DUV &lt; 1 min/wafer</span><Badge code="reported" pop="src:luke" /></div>
    </div>
    <div>
      <div class="mk-sub">site map: # field, + field edge, x edge exclusion</div>
      <pre class="mk-art" aria-label="ASCII stepper site map" style="height:calc(20 * 13px + 12px)">{siteMap}</pre>
      <div class="mk-ro"><span>fields {String(F.count).padStart(3, "\u2007")}</span><span>22 × 22 mm</span><Badge code="derived" pop="src:fields" /></div>
    </div>
  </div>
  <div class="pf">t = D A n / I. Usable area π(D/2 − 8 mm)<sup>2</sup> times the exposed fraction; step size, settling and stage moves are not included, so EBL times are lower bounds.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 600 300" role="img" aria-label="E-beam raster and stepper fields on two wafers at the same elapsed time">
      <g transform="translate(150 150)">
        <circle r={(wd / 2) * sc} class="wf" />
        <polyline class="acc" points={serp.map((q) => `${(q[0] * sc).toFixed(1)},${(-q[1] * sc).toFixed(1)}`).join(" ")} style="stroke-width:1.4; stroke-dasharray: {(eblFrac * serpLen * sc).toFixed(2)} 100000" />
        <text class="lb m" y="148">e-beam: {(eblFrac * 100).toPrecision(2)}% written</text>
      </g>
      <g transform="translate(450 150)">
        <circle r={(wd / 2) * sc} class="wf" />
        {#each F.centres as [cx, cy], i (i)}<rect x={(cx - 11) * sc} y={(-cy - 11) * sc} width={22 * sc} height={22 * sc} class={i < duvDone ? "ox-f" : "tmpl"} style={i < duvDone ? "fill: color-mix(in srgb, var(--v-l532) 35%, transparent); stroke: var(--v-ink1); stroke-width: 1.5" : ""} />{/each}
        <text class="lb m" y="148">stepper: {duvDone} of {F.count} fields</text>
      </g>
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:9ch"><label for="liv-t">Elapsed time (both machines)</label><output>{dur(elapsed)}</output><input id="liv-t" type="range" min="0" max="7" step="0.01" bind:value={el}></div>
      <div class="v-ctl"><span class="v-lab">E-beam preset</span><div class="v-seg" role="group" aria-label="EBL preset">{#each PRE as q, i (q.k)}<button type="button" class:on={pi === i} onclick={() => (pi = i)}>{q.k}</button>{/each}</div></div>
      <div class="v-ctl"><span class="v-lab">Wafer</span><div class="v-seg" role="group" aria-label="Wafer"><button type="button" class:on={wd === 100} onclick={() => (wd = 100)}>100 mm</button><button type="button" class:on={wd === 150} onclick={() => (wd = 150)}>150 mm</button></div></div>
      <dl class="v-hud"><dt>E-beam, whole wafer</dt><dd>{dur(tWafer)}</dd><dt>Stepper, whole wafer</dt><dd>under 1 min</dd></dl>
      <p class="v-cap">Usable area: wafer minus 8 mm edge exclusion; exposed area {frac}% of it (template). Step size, settling and stage moves are not included, so e-beam times are lower bounds. 22 × 22 mm fields: {F.count} per wafer <Badge code="derived" pop="src:fields" />. Stepper fields fill uniformly over 60 s, the reported upper bound (order template). E-beam path drawn at 4 mm pitch; its length fraction equals the written fraction <Badge code="derived" pop="src:ebl" />.</p>
    </div>
  </div>
</figure>
