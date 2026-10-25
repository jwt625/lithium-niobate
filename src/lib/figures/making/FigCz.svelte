<!-- F05-02 Czochralski puller and composition. L(t) = v t capped at the reported 110 mm body (153 mm diameter, 1-2 mm/h,
     5-10 rpm; review table, S). Tc(c) from the Bordui and Iyi fits (P-comp) with the reported Tc points; Tm 1255 C
     (compilation). Crucible, afterheater, seed orientation and cone angles are template drawing values. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { czBodyLength, cylinderMass, DENSITY_CLN_VOLK2008 } from "$lib/physics/fab.ts";
  import { tcBordui, tcIyi } from "$lib/physics/composition.ts";
  import { padL } from "./flow";

  const D = 153, LMAX = 110;
  const RATES = [1, 1.5, 2];
  let th = $state(55);
  let vi = $state(1);
  let rpm = $state(7.5);
  let c = $state(48.45);
  const v = $derived(RATES[vi]);
  const L = $derived(Math.min(LMAX, czBodyLength(v, th)));
  const mass = $derived(cylinderMass(D, L, DENSITY_CLN_VOLK2008.value));
  const tB = $derived(tcBordui(c)), tI = $derived(tcIyi(c));
  const turns = $derived(rpm * 60 * th);
  const meltY = 330, Rpx = (D / 2) * 1.3;
  const Lpx = $derived(L * 1.3);
  const TX = (T: number): number => 40 + ((T - 1100) / 200) * 480;
  const f1 = (x: number, w: number, d = 1): string => padL(x.toFixed(d), w);

  // ---- TECH ASCII silhouette: 1 col = 5 mm, 1 row = 10 mm (2:1 character cell), 44 x 22
  const COLS = 44, ROWS = 22;
  const silhouette = $derived.by(() => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
    const cx = COLS / 2, R = D / 2 / 5;
    const melt = ROWS - 3;
    for (let x = 0; x < COLS; x++) { grid[ROWS - 1][x] = "U"; if (x < 1 || x > COLS - 2) { grid[ROWS - 2][x] = "U"; grid[ROWS - 3][x] = "U"; grid[ROWS - 4][x] = "U"; } else { grid[ROWS - 2][x] = "m"; grid[melt][x] = "~"; } }
    const lenRows = L / 10, shRows = D / 2 / 10; // 45 deg shoulder (template)
    const yBodyBottom = melt - 0.0, yBodyTop = melt - lenRows, yTop = yBodyTop - shRows;
    for (let r = 0; r < melt; r++) {
      const yc = r + 0.5;
      for (let x = 0; x < COLS; x++) {
        const dx = Math.abs(x + 0.5 - cx);
        let inside = false;
        if (yc >= yBodyTop && yc <= yBodyBottom) inside = dx <= R;
        else if (yc >= yTop && yc < yBodyTop) inside = dx <= R * ((yc - yTop) / shRows);
        if (inside) grid[r][x] = "L";
        else if (yc < yTop + 0.5 && dx < 0.6) grid[r][x] = "|";
      }
    }
    return grid.map((row) => row.join("")).join("\n");
  });

  // ---- Tc plot geometry (TECH and VISUAL share it)
  const PX0 = 46, PX1 = 500, PY0 = 16, PY1 = 196, C0 = 48, C1 = 50.2, T0 = 1110, T1 = 1290;
  const X = (x: number): number => PX0 + ((x - C0) / (C1 - C0)) * (PX1 - PX0);
  const Y = (y: number): number => PY1 - ((y - T0) / (T1 - T0)) * (PY1 - PY0);
  const PTS = [
    { c: 48.45, T: 1140, k: "CLN, Volk", code: "P-comp" as const, pop: "src:volk-tc" },
    { c: 48.38, T: 1142.3, k: "vendor, 48.38 mol%", code: "V" as const, pop: "src:cti" },
    { c: 50, T: 1206, k: "near-SLN, Volk (conflict)", code: "P-comp" as const, pop: "src:sln-conflict" },
    { c: 50, T: 1213, k: "near-SLN, secondary (conflict)", code: "S" as const, pop: "src:sln-conflict" },
  ];
  const line = (f: (x: number) => number): string => `M${X(48).toFixed(1)} ${Y(f(48)).toFixed(1)}L${X(50.2).toFixed(1)} ${Y(f(50.2)).toFixed(1)}`;
  const tickC = [48, 48.5, 49, 49.5, 50], tickT = [1150, 1200, 1250];
  const congruentNote = $derived(c > 48.65 ? "Off-congruent: a melt of this composition does not freeze to the same composition, so the crystal drifts along the boule. Near-stoichiometric crystals are made by double-crucible Czochralski with powder feed or by vapour transport equilibration." : "Congruent range: the melt freezes to a solid of the same composition, uniform from seed to tail.");
</script>

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Czochralski growth and composition</span><span>body: cylinder 153 mm × L</span></div>
  <div class="mk-duo2">
    <div>
      <div class="mk-sub">(a) side profile, 1 col = 5 mm, 1 row = 10 mm</div>
      <pre class="mk-art" aria-label="ASCII profile of the growing boule" style="height:calc(22 * 13px + 12px)">{silhouette}</pre>
      <div class="ctl"><label for="cz-t">Time t</label><input id="cz-t" type="range" min="0" max="110" step="0.5" bind:value={th}><output>{f1(th, 5)} h</output></div>
      <div class="ctl"><span class="k">Pull rate</span><div class="seg" role="group" aria-label="Pull rate">{#each RATES as r, i (r)}<button type="button" class:on={vi === i} onclick={() => (vi = i)}>{r.toFixed(1)} MM/H</button>{/each}</div><output>{v.toFixed(1)} mm/h</output></div>
      <div class="ctl"><label for="cz-r">Rotation</label><input id="cz-r" type="range" min="5" max="10" step="0.5" bind:value={rpm}><output>{f1(rpm, 4)} rpm</output></div>
      <div class="mk-ro"><span>L {f1(L, 5)} mm</span><span>t {f1(th, 5)} h</span><span>m {f1(mass, 4, 2)} kg</span><span>turns {String(Math.round(turns)).padStart(6, "\u2007")}</span><Badge code="derived" pop="src:cz-L" /></div>
    </div>
    <div>
      <div class="mk-sub">(b) Curie temperature vs crystal composition</div>
      <svg class="mk-plot" viewBox="0 0 520 226" role="img" aria-label="Tc versus composition">
        {#each tickT as tt (tt)}<line class="gl" x1={PX0} x2={PX1} y1={Y(tt)} y2={Y(tt)} /><text class="tk e" x={PX0 - 4} y={Y(tt) + 3}>{tt}</text>{/each}
        {#each tickC as tc (tc)}<line class="gl" y1={PY0} y2={PY1} x1={X(tc)} x2={X(tc)} /><text class="tk m" x={X(tc)} y={PY1 + 14}>{tc.toFixed(1)}</text>{/each}
        <line class="dsh" x1={PX0} x2={PX1} y1={Y(1255)} y2={Y(1255)} /><text class="tl" x={PX0 + 4} y={Y(1255) - 5}>T<tspan class="sb" dy="3">m</tspan><tspan dy="-3"></tspan> 1255 °C (compilation; vendor about 1250 °C)</text>
        <path class="ln" d={line(tcBordui)} /><path class="ln2" d={line(tcIyi)} />
        <text class="tl" x={X(49.15)} y={Y(tcBordui(49.15)) - 8}>Bordui</text><text class="tl" x={X(49.35)} y={Y(tcIyi(49.35)) + 16}>Iyi</text>
        {#each PTS as p (p.k)}<circle class={p.code === "S" ? "pto" : "pt"} cx={X(p.c)} cy={Y(p.T)} r="3.2"><title>{p.k}: {p.T} °C</title></circle>{/each}
        <line class="cur" x1={X(c)} x2={X(c)} y1={PY0} y2={PY1} />
        <text class="tk m" x={(PX0 + PX1) / 2} y="224">mol% Li₂O</text><text class="tk" x="4" y="12">°C</text>
      </svg>
      <div class="ctl"><label for="cz-c">Composition c</label><input id="cz-c" type="range" min="48" max="50" step="0.01" bind:value={c}><output>{c.toFixed(2)} mol%</output></div>
      <div class="mk-ro"><span>T<sub>c</sub> Bordui {f1(tB, 6)} °C</span><span>T<sub>c</sub> Iyi {f1(tI, 6)} °C</span><Badge code="P-comp" pop="src:tc-fits" /></div>
      <div class="mk-note" style="height:54px">{congruentNote}</div>
    </div>
  </div>
  <div class="pf">Points: <Badge code="P-comp" pop="src:volk-tc" /> CLN 1140 °C (Volk); <Badge code="V" pop="src:cti" /> 1142.3 °C at 48.38 mol%; near-SLN 1206 °C <Badge code="P-comp" pop="src:sln-conflict" /> vs 1213 °C <Badge code="S" pop="src:sln-conflict" text="S" />, a conflict. Growth inputs <Badge code="S" pop="src:cz" />. Crucible, afterheater, 45° shoulder and seed along Z: <Badge code="template" pop="src:cz-template" /></div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 400 420" style="max-width:520px" role="img" aria-label="Cutaway Czochralski puller with the crystal rising from the melt">
      <!-- crucible (template size, 1.5x the crystal radius), RF coil, afterheater -->
      <path class="ax" d="M{200 - Rpx * 1.5} 250 V{meltY + 50} H{200 + Rpx * 1.5} V250" />
      {#each [262, 284, 306, 328, 350, 372] as y (y)}<rect x={200 - Rpx * 1.5 - 22} y={y - 4} width="10" height="8" class="au-f" opacity="0.7" /><rect x={200 + Rpx * 1.5 + 12} y={y - 4} width="10" height="8" class="au-f" opacity="0.7" />{/each}
      <path class="tmpl" d="M{200 - Rpx * 1.5 - 4} 240 V60 M{200 + Rpx * 1.5 + 4} 240 V60" />
      <!-- melt: engraving hatch -->
      <clipPath id="cz-melt"><rect x={200 - Rpx * 1.5 + 2} y={meltY} width={Rpx * 3 - 4} height="48" /></clipPath>
      <g clip-path="url(#cz-melt)">{#each Array(40) as _, i (i)}<line class="hatch" x1={200 - Rpx * 1.5 + i * 10 - 60} y1={meltY + 50} x2={200 - Rpx * 1.5 + i * 10} y2={meltY} />{/each}</g>
      <line class="ax" x1={200 - Rpx * 1.5} x2={200 + Rpx * 1.5} y1={meltY} y2={meltY} />
      <!-- crystal: body L, 45 deg shoulder, seed rod; striations every rotation are decorative (template) -->
      <path class="ln-f" d="M{200 - Rpx} {meltY} V{meltY - Lpx} L200 {meltY - Lpx - Rpx} L{200 + Rpx} {meltY - Lpx} V{meltY} Z" opacity="0.92" />
      {#each Array(9) as _, i (i)}{@const y = meltY - ((i + ((turns / 40) % 1)) / 9) * Lpx}{#if Lpx > 2}<line class="hatch" x1={200 - Rpx} x2={200 + Rpx} y1={y} y2={y} opacity="0.35" />{/if}{/each}
      <rect x="197" y="20" width="6" height={Math.max(0, meltY - Lpx - Rpx - 20)} class="si-f" />
      <line class="dim" x1={200 + Rpx + 30} x2={200 + Rpx + 30} y1={meltY} y2={meltY - Lpx} /><text class="vl" x={200 + Rpx + 36} y={meltY - Lpx / 2}>{L.toFixed(1)} mm</text>
      <text class="lb" x="210" y="34">seed rod</text><text class="lb" x={200 - Rpx * 1.5} y={meltY + 66}>melt (hatched), crucible and afterheater: template</text>
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:8ch"><label for="czv-t">Growth time</label><output>{th.toFixed(1)} h</output><input id="czv-t" type="range" min="0" max="110" step="0.5" bind:value={th}></div>
      <div class="v-ctl"><span class="v-lab">Pull rate (reported 1 to 2 mm/h)</span><div class="v-seg" role="group" aria-label="Pull rate">{#each RATES as r, i (r)}<button type="button" class:on={vi === i} onclick={() => (vi = i)}>{r.toFixed(1)} mm/h</button>{/each}</div></div>
      <div class="v-ctl" style="--w:7ch"><label for="czv-r">Rotation (reported 5 to 10 rpm)</label><output>{rpm.toFixed(1)} rpm</output><input id="czv-r" type="range" min="5" max="10" step="0.5" bind:value={rpm}></div>
      <dl class="v-hud"><dt>Body length</dt><dd>{L.toFixed(1)} mm</dd><dt>Body mass</dt><dd>{mass.toFixed(2)} kg</dd><dt>Turns so far</dt><dd>{Math.round(turns)}</dd></dl>
      <p class="v-cap">Inputs <Badge code="S" pop="src:cz" />; L = v t and mass <Badge code="derived" pop="src:cz-L" />. Crucible, afterheater, 45° shoulder and a seed along Z are drawing values <Badge code="template" pop="src:cz-template" />.</p>
    </div>
  </div>
  <div class="mk-vf-grid" style="margin-top:28px">
    <svg viewBox="0 0 560 150" role="img" aria-label="Temperature axis with Tc for the chosen composition and the melting point">
      <line class="ax" x1="40" x2="520" y1="70" y2="70" />
      {#each [1100, 1150, 1200, 1250, 1300] as T (T)}<line class="ax" x1={TX(T)} x2={TX(T)} y1="66" y2="74" /><text class="lb m" x={TX(T)} y="102">{T} °C</text>{/each}
      <line class="acc" x1={TX(1255)} x2={TX(1255)} y1="40" y2="80" /><text class="lb m" x={TX(1255)} y="32">T<tspan class="sb" dy="3">m</tspan><tspan dy="-3"> 1255 °C</tspan></text>
      {#each [1140, 1142.3, 1206, 1213] as T (T)}<circle cx={TX(T)} cy="82" r="2.6" class={T > 1200 ? "wf" : "accf"} />{/each}<text class="lb m" x={TX(1141)} y="120">1140, 1142</text><text class="lb m" x={TX(1209.5)} y="120">1206 / 1213</text>
      <path class="accf" d="M{TX(tB)} 66 l-7 -14 h14 z" /><text class="vl m" x={TX(tB)} y="42">T<tspan class="sb" dy="3">c</tspan><tspan dy="-3"></tspan></text>
      <line class="tmpl" x1={TX(tI)} x2={TX(tI)} y1="56" y2="70" />
      <text class="lb" x="40" y="144">T<tspan class="sb" dy="3">c</tspan><tspan dy="-3">: Bordui fit (triangle), Iyi fit (dashed); dots: reported values</tspan></text>
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:10ch"><label for="czv-c">Crystal composition</label><output>{c.toFixed(2)} mol%</output><input id="czv-c" type="range" min="48" max="50" step="0.01" bind:value={c}></div>
      <dl class="v-hud"><dt>T<sub>c</sub>, Bordui 1992</dt><dd>{tB.toFixed(1)} °C</dd><dt>T<sub>c</sub>, Iyi 1992</dt><dd>{tI.toFixed(1)} °C</dd></dl>
      <p class="v-cap" style="height:110px;overflow:hidden">{congruentNote} <Badge code="P-comp" pop="src:tc-fits" /></p>
      <p class="v-cap">Dots under the axis: reported T<sub>c</sub>: CLN 1140 °C <Badge code="P-comp" pop="src:volk-tc" />, 1142.3 °C at 48.38 mol% <Badge code="V" pop="src:cti" />; near-SLN 1206 °C vs 1213 °C, a conflict <Badge code="P-comp" pop="src:sln-conflict" /> <Badge code="S" pop="src:sln-conflict" />.</p>
    </div>
  </div>
</figure>
