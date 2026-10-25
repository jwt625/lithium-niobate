<!-- F05-06 CMP thinning and thickness maps. Removal 680 -> 600 nm (derived from the analog split depth and the reported
     target). Preston dz/dt = Kp P v: no LN Kp is sourced, so Kp, P and v are template inputs and the removal time is
     template. Thickness map: a template field scaled so its standard deviation over the 8 mm edge-excluded 100 mm
     wafer equals the reported 5.9 nm (luke2020); the paper's map is not re-keyed. Film colour: thinfilm.lnoiColor
     (air / x-cut LN / 4.7 um SiO2 / Si, D65, CIE 1931, sRGB; derived). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { prestonRate } from "$lib/physics/fab.ts";
  import { lnoiColor } from "$lib/physics/thinfilm.ts";

  let h = $state(640);
  let lkp = $state(-13); // log10 Kp (1/Pa), template
  let P = $state(20); // kPa, template
  let v = $state(1); // m/s, template
  const H0 = 680, HT = 600;
  const rate = $derived(prestonRate(10 ** lkp, P * 1e3, v) * 1e9 * 60); // nm/min
  const tmin = $derived((H0 - h) / rate);
  const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const kpTxt = $derived(`${(10 ** (lkp - Math.floor(lkp))).toFixed(1)}×10${String(Math.floor(lkp)).split("").map((c) => SUP[c] ?? c).join("")}`);
  // colour LUT 560-720 nm (1 nm)
  const LUT = new Map<number, string>();
  const col = (nm: number): string => { const k = Math.round(nm); let c = LUT.get(k); if (!c) { c = lnoiColor({ h_nm: k, oxide_nm: 4700, cut: "x" }).hex; LUT.set(k, c); } return c; };
  // template thickness field on a 31 x 31 grid over the 100 mm wafer; normalized to sigma 5.9 nm inside r <= 42 mm
  const N = 31, R = 50, RU = 42;
  const raw: { x: number; y: number; f: number }[] = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = -R + ((i + 0.5) * 2 * R) / N, y = -R + ((j + 0.5) * 2 * R) / N, r = Math.hypot(x, y);
    if (r <= R) raw.push({ x, y, f: 0.7 * ((r / R) ** 2 - 0.5) + 0.3 * (x / R) + 0.15 * Math.cos((3 * Math.atan2(y, x)) + 0.4) * (r / R) });
  }
  const inU = raw.filter((p) => Math.hypot(p.x, p.y) <= RU);
  const mu = inU.reduce((a, p) => a + p.f, 0) / inU.length;
  const sd = Math.sqrt(inU.reduce((a, p) => a + (p.f - mu) ** 2, 0) / inU.length);
  const FIELD = raw.map((p) => ({ ...p, dz: ((p.f - mu) / sd) * 5.9, rim: Math.hypot(p.x, p.y) > RU }));
  const cell = (2 * R) / N;
  const mean = $derived(h);
  const SH = " .:-=+*#%@";
  const ascii = $derived.by(() => {
    const W = 31, Hh = 16, out: string[] = [];
    for (let r = 0; r < Hh; r++) {
      let s = "";
      for (let c = 0; c < W; c++) {
        const x = -R + ((c + 0.5) * 2 * R) / W, y = R - ((r + 0.5) * 2 * R) / Hh, rr = Math.hypot(x, y);
        if (rr > R) { s += " "; continue; }
        if (rr > RU) { s += "x"; continue; }
        const p = FIELD.reduce((b, q) => (Math.hypot(q.x - x, q.y - y) < Math.hypot(b.x - x, b.y - y) ? q : b));
        s += SH[Math.max(1, Math.min(9, Math.round(5 + p.dz / 3)))];
      }
      out.push(s);
    }
    return out.join("\n");
  });
  const f = (x: number, w: number, d: number): string => x.toFixed(d).padStart(w, " ");
</script>

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>CMP after the split: thickness and uniformity</span><span>100 mm, 8 mm edge exclusion</span></div>
  <div class="mk-duo2">
    <div>
      <div class="mk-sub">thickness deviation map (template field, σ = 5.9 nm); x: excluded rim</div>
      <pre class="mk-art" aria-label="ASCII thickness map" style="height:calc(16 * 13px + 12px)">{ascii}</pre>
      <div class="mk-note" style="height:40px">Shading " .:-=+*#%@" from −12 to +12 nm about the mean. The paper's map is not reproduced; this field carries only its reported standard deviation. <Badge code="template" pop="src:map" /></div>
    </div>
    <div>
      <table class="kv"><colgroup><col class="cn"><col><col class="cs"></colgroup><tbody>
        <tr><td>Split depth (He<sup>+</sup> 195 keV)</td><td class="v">680 nm</td><td class="s"><Badge code="reported" pop="src:guarino" /></td></tr>
        <tr><td>Target film</td><td class="v">600 nm</td><td class="s"><Badge code="reported" pop="src:target" /></td></tr>
        <tr><td>Removed</td><td class="v">{f(H0 - h, 3, 0)} of 80 nm</td><td class="s"><Badge code="derived" pop="src:removed" /></td></tr>
        <tr><td>σ, 8 mm excluded</td><td class="v">5.9 nm</td><td class="s"><Badge code="P" pop="src:sigma" /></td></tr>
        <tr><td>σ, further 6 mm excluded</td><td class="v">3.2 nm</td><td class="s"><Badge code="P" pop="src:sigma" /></td></tr>
        <tr><td>Preston rate K<sub>p</sub> P v</td><td class="v">{f(rate, 6, 1)} nm/min</td><td class="s"><Badge code="template" pop="src:preston" /></td></tr>
        <tr><td>Time to here</td><td class="v">{f(tmin, 6, 1)} min</td><td class="s"><Badge code="template" pop="src:preston" /></td></tr>
        <tr><td>Film colour (D65)</td><td class="v"><span class="mk-sw" style="background:{col(h)}"></span> {col(h)}</td><td class="s"><Badge code="derived" pop="src:colour" /></td></tr>
      </tbody></table>
    </div>
  </div>
  <div class="ctl"><label for="cmp-h">Film thickness h</label><input id="cmp-h" type="range" min="600" max="680" step="1" bind:value={h}><output>{f(h, 4, 0)} nm</output></div>
  <div class="ctl"><label for="cmp-k">K<sub>p</sub> (template), Pa⁻¹</label><input id="cmp-k" type="range" min="-14" max="-12" step="0.05" bind:value={lkp}><output>{kpTxt}</output></div>
  <div class="ctl"><label for="cmp-p">Pressure P (template)</label><input id="cmp-p" type="range" min="5" max="50" step="1" bind:value={P}><output>{f(P, 3, 0)} kPa</output></div>
  <div class="ctl"><label for="cmp-v">Velocity v (template)</label><input id="cmp-v" type="range" min="0.2" max="2" step="0.05" bind:value={v}><output>{f(v, 4, 2)} m/s</output></div>
  <div class="pf">dz/dt = K<sub>p</sub> P v (Preston 1927). No Preston coefficient for LN is sourced: K<sub>p</sub>, P and v are display parameters, so the rate and time are template. Film colour: normal-incidence reflectance of air / LN / 4.7 µm SiO<sub>2</sub> / Si under D65 with the Zelmon 1997 indices, CIE 1931 colour matching, sRGB.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 440 330" style="max-width:600px" role="img" aria-label="CMP head over the wafer; film colour from its thickness">
      <!-- platen, head, slurry arm: template geometry -->
      <circle cx="170" cy="170" r="150" class="tmpl" />
      <g transform="translate(170 170) scale({140 / R})">
        {#each FIELD as p (p.x + ":" + p.y)}<rect shape-rendering="crispEdges" x={p.x - cell / 2} y={-p.y - cell / 2} width={cell + 0.05} height={cell + 0.05} fill={col(mean + p.dz)} opacity={p.rim ? 0.55 : 1} />{/each}
        <circle r={R} fill="none" class="dim" style="stroke-width:{R / 140}" />
      </g>
      <circle cx="290" cy="110" r="58" class="tmpl" /><text class="lb m" x="290" y="114">head</text>
      <path class="tmpl" d="M430 20 L330 200" /><circle cx="330" cy="200" r="4" class="accf" /><text class="lb" x="340" y="30">slurry arm</text>
      <text class="lb" x="20" y="326">wafer colour: computed from the local thickness (template field)</text>
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:7ch"><label for="cmpv-h">Film thickness</label><output>{h} nm</output><input id="cmpv-h" type="range" min="600" max="680" step="1" bind:value={h}></div>
      <div class="mk-bigsw" style="background:{col(h)}"></div>
      <dl class="v-hud"><dt>Colour at the mean</dt><dd>{col(h)}</dd><dt>Removed so far</dt><dd>{H0 - h} nm</dd><dt>Spread (reported σ)</dt><dd>5.9 nm</dd><dt>σ, further 6 mm excluded</dt><dd>3.2 nm</dd></dl>
      <p class="v-cap">K<sub>p</sub>, pressure and velocity are not sourced for LN, so no removal time is given here <Badge code="template" pop="src:preston" />.</p>
      <p class="v-cap">Colour of air / LN / 4.7 µm SiO<sub>2</sub> / Si under D65 at normal incidence, from the Zelmon 1997 indices; the 4.7 µm oxide adds dense fringes that pull the colour toward grey, so the shift from 680 to 600 nm is subtle <Badge code="derived" pop="src:colour" />. Thickness field <Badge code="template" pop="src:map" />.</p>
    </div>
  </div>
</figure>

<style>
  .mk-sw { display: inline-block; width: 12px; height: 10px; vertical-align: -1px; border: 1px solid var(--rule2); }
  .mk-bigsw { height: 56px; border: 1px solid var(--v-line2, #444); }
</style>
