<!-- F05-03 Wafer and cut explorer. R (crystal -> wafer frame, IEEE 176-1987 crystal axes) from tensors.namedCut /
     rotatedYCut; wafer frame: x = propagation, z = wafer normal. Engaged EO coefficient r_eff = p_i p_j r_ijk f_k with the
     Turner 1966 clamped set (633 nm, P-comp), p = optical polarization (TE: in-plane transverse y; TM: normal z), f = field
     (lateral y or vertical z). Euler angles: R = Rz(alpha) Rx(beta) Rz(gamma). Flat position: template (vendor-specific). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { namedCut, rotatedYCut, eulerZXZFromMatrix, r3m, voigtToTensor3 } from "$lib/physics/tensors.ts";
  import { EO_TURNER1966_S } from "$lib/physics/constants.ts";

  type Cut = "X-cut, Y-prop" | "Z-cut, X-prop" | "Y-cut, X-prop" | "rot";
  const CUTS: [Cut, string, string][] = [["X-cut, Y-prop", "x-cut, Y-prop", "x-cut"], ["Z-cut, X-prop", "z-cut, X-prop", "z-cut"], ["Y-cut, X-prop", "y-cut, X-prop", "y-cut"], ["rot", "rotated Y, X-prop", "rotated Y"]];
  let cut = $state<Cut>("X-cut, Y-prop");
  let theta = $state(128);
  const R = $derived(cut === "rot" ? rotatedYCut(theta) : namedCut(cut));
  const n = $derived(R[2]), xg = $derived(R[0]), yg = $derived(R[1]);
  const eul = $derived(eulerZXZFromMatrix(R).map((a) => (a * 180) / Math.PI));
  const RT = voigtToTensor3(r3m(EO_TURNER1966_S), "r");
  const reff = (p: readonly number[], f: readonly number[]): number => { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) s += p[i] * p[j] * RT[i * 9 + j * 3 + k] * f[k]; return s; };
  const E = $derived({ teL: reff(yg, yg), teV: reff(yg, n), tmL: reff(n, yg), tmV: reff(n, n) });
  const sg = (v: number, d = 3): string => (Math.abs(v) < 0.5 * 10 ** -d ? "+" : v < 0 ? "−" : "+") + Math.abs(v).toFixed(d);
  const vec = (v: readonly number[]): string => `(${v.map((x) => sg(x)).join(", ")})`;
  const axName = (v: readonly number[]): string => {
    const k = v.findIndex((x) => Math.abs(Math.abs(x) - 1) < 1e-9);
    return k >= 0 ? `${v[k] > 0 ? "+" : "−"}${"XYZ"[k]}` : "oblique";
  };
  const pm = (v: number): string => `${sg(v, 2).padStart(6, " ")} pm/V`;
  const label = $derived(cut === "rot" ? `(YXl)${theta.toFixed(1)}°` : cut);
  const isSaw = $derived(cut === "rot" && Math.abs(theta - 128) < 0.05);

  // ---- TECH ASCII wafer: circle, flat at the bottom (template), in-plane axes
  const ascii = $derived.by(() => {
    const W = 33, H = 15, lines: string[] = [];
    for (let r = 0; r < H; r++) {
      let s = "";
      for (let c = 0; c < W; c++) {
        const x = (c - (W - 1) / 2) / ((W - 1) / 2), y = (r - (H - 1) / 2) / ((H - 1) / 2);
        const d = Math.hypot(x, y);
        s += y > 0.86 ? (d < 1 ? "_" : " ") : Math.abs(d - 1) < 0.075 ? "." : " ";
      }
      lines.push(s);
    }
    const mid = Math.floor(H / 2);
    const put = (r: number, c: number, t: string): void => { lines[r] = lines[r].slice(0, c) + t + lines[r].slice(c + t.length); };
    put(mid, 16, "+---->");
    put(mid - 1, 16, "|"); put(mid - 2, 16, "|"); put(mid - 3, 16, "^");
    return { lines: lines.join("\n"), x: `x (prop.) = ${axName(xg)}`, y: `y (in plane) = ${axName(yg)}`, z: `normal = ${axName(n)}` };
  });

  // ---- VISUAL projection of crystal axes: azimuth 38 deg, elevation 20 deg
  const az = (38 * Math.PI) / 180, el = (20 * Math.PI) / 180, S = 120, O = [210, 170];
  const P = (v: readonly number[]): [number, number] => {
    const x1 = v[0] * Math.cos(az) - v[1] * Math.sin(az), y1 = v[0] * Math.sin(az) + v[1] * Math.cos(az);
    return [O[0] + S * x1, O[1] - S * (v[2] * Math.cos(el) + y1 * Math.sin(el))];
  };
  const pts = (arr: (readonly number[])[]): string => arr.map((v) => P(v).map((q) => q.toFixed(1)).join(",")).join(" ");
  const hex = (z: number): number[][] => Array.from({ length: 6 }, (_, i) => [0.62 * Math.cos((i * Math.PI) / 3), 0.62 * Math.sin((i * Math.PI) / 3), z]);
  const disc = $derived(Array.from({ length: 64 }, (_, i) => { const f = (i / 64) * 2 * Math.PI, cf = Math.cos(f), sf = Math.max(-0.93, Math.sin(f)); return [0, 1, 2].map((k) => 0.78 * (cf * xg[k] + sf * yg[k])); }));
  const axisEnd = (k: number, L = 1.15): number[] => [0, 1, 2].map((i) => (i === k ? L : 0));
</script>

{#snippet cutSel(big: boolean)}
  <div class={big ? "v-seg" : "seg"} role="group" aria-label="Wafer cut">{#each CUTS as [k, l, sh] (k)}<button type="button" class:on={cut === k} onclick={() => (cut = k)}>{big ? sh : l.toUpperCase()}</button>{/each}</div>
{/snippet}

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Wafer cut and crystal axes</span><span>{label}</span></div>
  <div class="mk-duo2">
    <div>
      <pre class="mk-art" aria-label="ASCII wafer with in-plane axes" style="height:calc(15 * 13px + 12px)">{ascii.lines}</pre>
      <div class="mk-note" style="height:60px">{ascii.x}<br>{ascii.y}<br>{ascii.z}; flat drawn at the bottom <Badge code="template" pop="src:flat" /></div>
    </div>
    <div>
      <table class="kv">
        <colgroup><col class="cn"><col><col class="cs"></colgroup>
        <tbody>
          <tr><td>Normal n (crystal X, Y, Z)</td><td class="v">{vec(n)}</td><td class="s"><Badge code="derived" pop="src:rot" /></td></tr>
          <tr><td>Propagation x</td><td class="v">{vec(xg)}</td><td class="s"><Badge code="derived" pop="src:rot" /></td></tr>
          <tr><td>In-plane y</td><td class="v">{vec(yg)}</td><td class="s"><Badge code="derived" pop="src:rot" /></td></tr>
          <tr><td>Euler α, β, γ</td><td class="v">{eul.map((a) => sg(a, 1).padStart(7, " ") + "°").join(" ")}</td><td class="s"><Badge code="derived" pop="src:rot" /></td></tr>
          <tr><td>r_eff TE, lateral field</td><td class="v">{pm(E.teL)}</td><td class="s"><Badge code="derived" pop="src:reff" /></td></tr>
          <tr><td>r_eff TE, vertical field</td><td class="v">{pm(E.teV)}</td><td class="s"><Badge code="derived" pop="src:reff" /></td></tr>
          <tr><td>r_eff TM, lateral field</td><td class="v">{pm(E.tmL)}</td><td class="s"><Badge code="derived" pop="src:reff" /></td></tr>
          <tr><td>r_eff TM, vertical field</td><td class="v">{pm(E.tmV)}</td><td class="s"><Badge code="derived" pop="src:reff" /></td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="ctl"><span class="k">Cut</span>{@render cutSel(false)}<output>{cut === "rot" ? "rotated" : "named"}</output></div>
  <div class="ctl"><label for="cut-th">Rotation θ (rotated Y)</label><input id="cut-th" type="range" min="0" max="180" step="0.5" bind:value={theta} onfocus={() => (cut = "rot")} oninput={() => (cut = "rot")}><output>{theta.toFixed(1).padStart(5, " ")}°</output></div>
  <div class="pf">θ = 0°: Y-cut; 90°: Z-cut; 128°: the SAW cut <Badge code="P" text="P(title)" pop="src:shibayama" />. Diameters 76.2, 100, 150, 200 mm; 128° Y LN 350 µm (4 inch) and 500 µm (6 inch) <Badge code="P" text="F" pop="src:smm" />. r: Turner 1966, clamped, 633 nm <Badge code="P-comp" pop="src:turner" /></div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 420 330" style="max-width:600px" role="img" aria-label="Crystal axes, hexagonal prism, and the wafer plane of the chosen cut">
      <polygon class="tmpl" points={pts(hex(-0.9))} /><polygon class="tmpl" points={pts(hex(0.9))} />
      {#each hex(0) as h, i (i)}<line class="tmpl" x1={P([h[0], h[1], -0.9])[0]} y1={P([h[0], h[1], -0.9])[1]} x2={P([h[0], h[1], 0.9])[0]} y2={P([h[0], h[1], 0.9])[1]} />{/each}
      <polygon class="wf" points={pts(disc)} />
      {#each [0, 1, 2] as k (k)}{@const e = P(axisEnd(k))}<line class="ax" x1={O[0]} y1={O[1]} x2={e[0]} y2={e[1]} /><text class="vl" x={e[0] + 4} y={e[1] - 4}>{"XYZ"[k]}</text>{/each}
      <line class="acc" x1={O[0]} y1={O[1]} x2={P(n.map((x) => x * 1.05))[0]} y2={P(n.map((x) => x * 1.05))[1]} />
      <circle class="accf" cx={P(n.map((x) => x * 1.05))[0]} cy={P(n.map((x) => x * 1.05))[1]} r="4" />
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl"><span class="v-lab">Cut</span>{@render cutSel(true)}</div>
      <div class="v-ctl" style="--w:7ch"><label for="cutv-th">Rotated Y-cut angle θ</label><output>{theta.toFixed(1)}°</output><input id="cutv-th" type="range" min="0" max="180" step="0.5" bind:value={theta} oninput={() => (cut = "rot")}></div>
      <dl class="v-hud">
        <dt>Wafer normal</dt><dd>{vec(n)}</dd>
        <dt>TE, lateral field</dt><dd>{pm(E.teL)}</dd>
        <dt>TE, vertical field</dt><dd>{pm(E.teV)}</dd>
        <dt>TM, lateral field</dt><dd>{pm(E.tmL)}</dd>
        <dt>TM, vertical field</dt><dd>{pm(E.tmV)}</dd>
        <dt>Propagation x</dt><dd>{vec(xg)}</dd>
        <dt>In-plane y</dt><dd>{vec(yg)}</dd>
        <dt>Euler α, β, γ</dt><dd>{eul.map((a) => sg(a, 1) + "°").join(" ")}</dd>
      </dl>
      <p class="v-cap">Disc: wafer plane (flat edge: template); green: wafer normal; dashed: hexagonal prism with c along Z. Propagation along X for the rotated cuts; θ = 0° is the Y-cut and 90° the Z-cut. r: Turner 1966, clamped, 633 nm <Badge code="P-comp" pop="src:turner" />; r_eff <Badge code="derived" pop="src:reff" />.</p>
      <p class="v-cap" style="height:66px;overflow:hidden">{isSaw ? "128° Y-X: the rotated Y-cut reported in 1976 as the optimum surface-acoustic-wave substrate, used in phone filters." : "Drag θ from 0° (Y-cut) toward 128° to land on the SAW cut."} <Badge code="derived" pop="src:reff" /></p>
    </div>
  </div>
</figure>
