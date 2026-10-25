<!-- F05-08 Argon etching: sidewall angle and redeposition. Mask-edge recession geometry tan(a_LN) = S tan(a_mask),
     S = R_LN / R_mask (fab.sidewallAngle; derived, an upper bound since sputter yield depends on incidence angle and
     redeposition builds a second slope). Measured angles and the bias/pressure regime points are reported values drawn
     as points and bands; no fitted surface. Redeposition thickness in the drawing is template. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { sidewallAngle } from "$lib/physics/fab.ts";

  let S = $state(3);
  let am = $state(85);
  let prog = $state(1);
  let clean = $state(false);
  const aLN = $derived(sidewallAngle(S, am));
  const MEAS = [
    { a: 60, S: 1, l: "SiO₂ mask, ~60°", pop: "src:li-60" },
    { a: 75, S: null as number | null, l: "Cr mask, ~75°", pop: "src:kras" },
    { a: 80, S: 3, l: "DLC mask, 80°", pop: "src:li-80" },
  ];
  const near = $derived(MEAS.reduce((b, m) => (Math.abs(m.a - aLN) < Math.abs(b.a - aLN) ? m : b)));
  const f = (v: number, w: number, d: number): string => v.toFixed(d).padStart(w, " ");
  // ---- TECH ASCII profile: 44 cols (0.1 um each), 14 rows: 6 LN rows (100 nm), 4 mask rows, 4 air
  const art = $derived.by(() => {
    const C = 44, ln = 6, mk = 4, rows: string[] = [];
    const half = 7; // ridge top half-width, cols (template)
    const run = (r: number): number => r / Math.tan((aLN * Math.PI) / 180) * (1 / 1); // cols per LN row at 0.1 um/col, 0.1 um/row
    const mrun = (r: number): number => r / Math.tan((am * Math.PI) / 180);
    for (let r = 0; r < 4; r++) rows.push(" ".repeat(C));
    for (let r = 0; r < mk; r++) { let s = ""; for (let c = 0; c < C; c++) { const x = Math.abs(c + 0.5 - C / 2); s += x <= half - mrun(r + 0.5) ? "d" : " "; } rows.push(s); }
    for (let r = 0; r < ln; r++) { let s = ""; for (let c = 0; c < C; c++) { const x = Math.abs(c + 0.5 - C / 2); const e = half + run(r + 0.5); s += x <= e ? "L" : x <= e + 1 && r > 0 ? "~" : " "; } rows.push(s); }
    rows.push("o".repeat(C)); rows.push("o".repeat(C));
    return rows.join("\n");
  });
  // regime map: pressure 0-15 mTorr (x), bias 100-800 V (y)
  const RX = (p: number): number => 50 + (p / 15) * 440, RY = (v: number): number => 176 - ((v - 100) / 700) * 160;
  // VISUAL cross-section (illustrative units: 1 um = 160 px)
  const U = 160, LN = 0.6, MK = 0.4, W0 = 1.4;
  const d = $derived(LN * prog);
  const mtop = $derived(Math.max(0, MK - d / S));
  const mrec = $derived((d / S) / Math.tan((am * Math.PI) / 180));
  const xs = $derived(W0 / 2 - mrec); // LN top corner half-width (mask bottom edge)
  const xb = $derived(xs + d / Math.tan((aLN * Math.PI) / 180));
  const redep = $derived(clean ? 0 : 0.05 * prog); // template
  const cx = 300, y0 = 170; // y0 = LN top
  const P = (x: number, z: number): string => `${(cx + x * U).toFixed(1)},${(y0 + z * U).toFixed(1)}`;
  const SC = (s: number): number => 60 + ((s - 0.5) / 3.5) * 430, AY = (a: number): number => 150 - ((a - 55) / 37) * 130;
  const curve = $derived(Array.from({ length: 50 }, (_, i) => { const s = 0.5 + (3.5 * i) / 49; return `${i ? "L" : "M"}${SC(s).toFixed(1)} ${AY(sidewallAngle(s, am)).toFixed(1)}`; }).join(""));
</script>

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Argon etching: sidewall angle and redeposition</span><span>model = upper bound</span></div>
  <div class="mk-duo2">
    <div>
      <div class="mk-sub">profile: d mask, L LN, ~ redeposition, o SiO₂; 1 col = 1 row = 0.1 µm</div>
      <pre class="mk-art" aria-label="ASCII etch profile" style="height:calc(16 * 13px + 12px)">{art}</pre>
      <div class="ctl"><label for="et-S">Selectivity S</label><input id="et-S" type="range" min="0.5" max="4" step="0.05" bind:value={S}><output>{f(S, 4, 2)}</output></div>
      <div class="ctl"><label for="et-a">Mask angle</label><input id="et-a" type="range" min="60" max="89.5" step="0.5" bind:value={am}><output>{f(am, 4, 1)}°</output></div>
      <div class="mk-ro"><span>S {f(S, 4, 2)}</span><span>a_mask {f(am, 4, 1)}°</span><span>a_LN {f(aLN, 4, 1)}° (model)</span><Badge code="derived" pop="src:swmodel" /><span>nearest measured {near.a}°</span><Badge code="P" pop={near.pop} /></div>
    </div>
    <div>
      <div class="mk-sub">redeposition regime, ICP Ar (Kaufmann et al. 2023): points and bands only</div>
      <svg class="mk-plot" viewBox="0 0 520 206" role="img" aria-label="Bias and pressure regime map with reported points">
        {#each [100, 200, 400, 600, 800] as v (v)}<line class="gl" x1="50" x2="490" y1={RY(v)} y2={RY(v)} /><text class="tk e" x="46" y={RY(v) + 3}>{v}</text>{/each}
        {#each [0, 3, 6, 9, 12, 15] as p (p)}<text class="tk m" x={RX(p)} y="190">{p}</text>{/each}
        <line class="ln" x1={RX(1)} x2={RX(1)} y1={RY(100)} y2={RY(800)} /><text class="tl" x={RX(1) + 5} y={RY(760)}>1 mTorr sweep: redeposition falls, trenching rises with bias</text>
        <line class="ln" x1={RX(5)} x2={RX(7)} y1={RY(600)} y2={RY(600)} style="stroke-width:5" /><text class="tl" x={RX(5)} y={RY(600) - 8}>redeposition-free 5–7 mTorr</text>
        <circle class="pt" cx={RX(11)} cy={RY(400)} r="4" /><text class="tl" x={RX(11) - 4} y={RY(400) - 8} style="text-anchor:end">redeposition-free ~11 mTorr</text>
        <path class="ln2" d="M{RX(7) - 4} {RY(600) + 10}l8 8m0 -8l-8 8M{RX(9) - 4} {RY(400) + 10}l8 8m0 -8l-8 8" style="stroke-dasharray:none" />
        <text class="tl" x={RX(7) + 6} y={RY(600) + 22}>lateral etching dominates (×)</text>
        <text class="tk m" x="270" y="204">pressure (mTorr)</text><text class="tk" x="4" y="12">DC bias (V)</text>
      </svg>
      <div class="mk-note">Bias swept 100–800 V at 1 mTorr, 20 °C, 10 sccm Ar; pressure swept 1–15 mTorr (400 V) and 0.3–13 mTorr (600 V) <Badge code="P" pop="src:kauf" /></div>
    </div>
  </div>
  <div class="pf">tan(a<sub>LN</sub>) = S tan(a<sub>mask</sub>): S = 1 (SiO<sub>2</sub>) and up to 3 (DLC) <Badge code="P" pop="src:li-S" />; HSQ after development 85° <Badge code="P" pop="src:kauf" />. Measured angles sit below the model because sputter yield depends on incidence angle and redeposition builds a second slope.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 600 300" role="img" aria-label="Animated etch cross-section: mask erosion, sidewall, redeposition">
      <rect x="0" y={y0 + LN * U} width="600" height="40" class="ox-f" />
      <polygon class="ln-f" points="{P(-2, LN)} {P(-2, d)} {P(-xb, d)} {P(-xs, 0)} {P(xs, 0)} {P(xb, d)} {P(2, d)} {P(2, LN)}" />
      {#if mtop > 0}<polygon points="{P(-xs, 0)} {P(xs, 0)} {P(xs - mtop / Math.tan((am * Math.PI) / 180), -mtop)} {P(-xs + mtop / Math.tan((am * Math.PI) / 180), -mtop)}" style="fill:#1d1d20; stroke: var(--v-line2)" />{/if}
      {#if redep > 0.001}<path d="M{P(-xs, 0)} L{P(-xb, d)} M{P(xs, 0)} L{P(xb, d)}" style="stroke: var(--v-text2); stroke-width:{redep * U}; fill:none; opacity:0.8" />{/if}
      {#each Array(9) as _, i (i)}<line x1={60 + i * 60} x2={60 + i * 60} y1="10" y2="40" class="acc" style="stroke-width:1.2" opacity={prog > 0 && prog < 1 ? 0.8 : 0.25} /><path d="M{56 + i * 60} 36 l4 6 l4 -6" class="accf" opacity={prog > 0 && prog < 1 ? 0.8 : 0.25} />{/each}
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:6ch"><label for="etv-S">Selectivity LN : mask</label><output>{S.toFixed(2)}</output><input id="etv-S" type="range" min="0.5" max="4" step="0.05" bind:value={S}></div>
      <div class="v-ctl" style="--w:7ch"><label for="etv-p">Etch progress</label><output>{(prog * 100).toFixed(0)}%</output><input id="etv-p" type="range" min="0" max="1" step="0.01" bind:value={prog}></div>
      <div class="v-ctl"><span class="v-lab">Redeposition</span><div class="v-seg" role="group" aria-label="Clean"><button type="button" class:on={!clean} onclick={() => (clean = false)}>as etched</button><button type="button" class:on={clean} onclick={() => (clean = true)}>after SC-1 clean</button></div></div>
      <p class="v-cap">Ar<sup>+</sup> flux from the top; mask dark, LN straw, redeposition grey (template thickness); not to scale.</p>
      <dl class="v-hud"><dt>Model sidewall</dt><dd>{aLN.toFixed(1)}°</dd><dt>Nearest measured</dt><dd>{near.l}</dd></dl>
    </div>
  </div>
  <svg viewBox="0 0 560 180" style="margin-top:20px; max-width:760px" role="img" aria-label="Model sidewall angle versus selectivity with measured points">
    {#each [60, 70, 80, 90] as a (a)}<line class="gl" x1="60" x2="490" y1={AY(a)} y2={AY(a)} /><text class="lb e" x="54" y={AY(a) + 4}>{a}°</text>{/each}
    {#each [1, 2, 3, 4] as s (s)}<text class="lb m" x={SC(s)} y="172">S = {s}</text>{/each}
    <path class="acc" d={curve} />
    {#each MEAS as m (m.l)}{#if m.S}<circle cx={SC(m.S)} cy={AY(m.a)} r="6" class={Math.abs(m.S - S) < 0.2 ? "accf" : "wf"} /><text class="lb" x={SC(m.S) + 10} y={AY(m.a) + 4}>{m.l}</text>{:else}<line x1="490" x2="500" y1={AY(m.a)} y2={AY(m.a)} class="acc" /><text class="lb" x="504" y={AY(m.a) + 4}>Cr ~75°</text>{/if}{/each}
    <line x1={SC(S)} x2={SC(S)} y1="15" y2="155" class="dim" />
  </svg>
  <p class="v-cap">Green curve: model upper bound for the {am.toFixed(1)}° mask; dots: measured sidewalls <Badge code="P" pop="src:li-80" /> <Badge code="P" pop="src:kras" />.</p>
</figure>
