<!-- F05-04 Bulk waveguides: proton-exchange depth d(T, t). d^2 = r(T) t (or d = 2 sqrt(D t) reading the rate as D);
     r(T) by Arrhenius through jackel1982's two x-cut points (1.37 um^2/h at 249 C, 0.37 um^2/h at 217 C, P(abs)); valid
     only between 217 and 249 C, dashed (template extrapolation) outside. Ti indiffusion: reported recipes as points; no
     diffusion coefficient is sourced, so no Ti curve. Index step +0.12 on n_e only (jackel1982). -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { peDepth, peRate } from "$lib/physics/fab.ts";

  let T = $state(249);
  let th = $state(4);
  let conv = $state<"d2t" | "D">("d2t");
  let log = $state(false);
  let pol = $state<"TE" | "TM">("TE");
  const r = $derived(peRate(T));
  const d = $derived(peDepth(T, th, conv));
  const X0 = 50, X1 = 500, Y0 = 14, Y1 = 186, TMIN = 0.1, TMAX = 10, DMAX = 8;
  const X = (t: number): number => (log ? X0 + (Math.log10(t / TMIN) / Math.log10(TMAX / TMIN)) * (X1 - X0) : X0 + (t / TMAX) * (X1 - X0));
  const Y = (v: number): number => Y1 - (Math.min(v, DMAX) / DMAX) * (Y1 - Y0);
  const curve = (Tc: number): string => Array.from({ length: 81 }, (_, i) => { const t = log ? TMIN * (TMAX / TMIN) ** (i / 80) : Math.max(1e-3, (i / 80) * TMAX); return `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(peDepth(Tc, t, conv).d_um).toFixed(1)}`; }).join("");
  const ticksT = $derived(log ? [0.1, 0.3, 1, 3, 10] : [0, 2, 4, 6, 8, 10]);
  const f = (v: number, w: number, dd: number): string => v.toFixed(dd).padStart(w, " ");
  // VISUAL cross-section: 1 um = 26 px depth, mask opening 4 um (template)
  const PXU = 26;
</script>

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Proton exchange in benzoic acid, x-cut</span><span>E<sub>a</sub> {r.Ea_eV.toFixed(2)} eV <Badge code="derived" pop="src:pe-ea" /></span></div>
  <div class="mk-duo2">
    <div>
      <div class="mk-sub">(a) exchange depth vs time at T; dashed outside 217–249 °C</div>
      <svg class="mk-plot" viewBox="0 0 520 216" role="img" aria-label="Exchange depth versus time">
        {#each [0, 2, 4, 6, 8] as v (v)}<line class="gl" x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} /><text class="tk e" x={X0 - 4} y={Y(v) + 3}>{v}</text>{/each}
        {#each ticksT as t (t)}<line class="gl" y1={Y0} y2={Y1} x1={X(Math.max(t, log ? 0.1 : 0))} x2={X(Math.max(t, log ? 0.1 : 0))} /><text class="tk m" x={X(Math.max(t, log ? 0.1 : 0))} y={Y1 + 14}>{t}</text>{/each}
        <path class="dsh" d={curve(217)} /><path class="dsh" d={curve(249)} />
        <path class={r.valid ? "ln" : "ln2"} d={curve(T)} />
        <circle class="pt" cx={X(th)} cy={Y(d.d_um)} r="3.5" />
        <text class="tk m" x={(X0 + X1) / 2} y="214">t (h)</text><text class="tk" x="4" y="12">d (µm)</text>
      </svg>
      <div class="ctl"><label for="pe-T">Temperature T</label><input id="pe-T" type="range" min="200" max="250" step="1" bind:value={T}><output>{T} °C</output></div>
      <div class="ctl"><label for="pe-t">Time t</label><input id="pe-t" type="range" min="0.1" max="10" step="0.1" bind:value={th}><output>{f(th, 4, 1)} h</output></div>
      <div class="ctl"><span class="k">Rate read as</span><div class="seg" role="group" aria-label="Rate convention"><button type="button" class:on={conv === "d2t"} onclick={() => (conv = "d2t")}>d² = r t</button><button type="button" class:on={conv === "D"} onclick={() => (conv = "D")}>d = 2√(Dt)</button></div><output>{conv === "d2t" ? "d²/t" : "D"}</output></div>
      <div class="ctl"><span class="k">Time axis</span><div class="seg" role="group" aria-label="Time axis"><button type="button" class:on={!log} onclick={() => (log = false)}>LIN</button><button type="button" class:on={log} onclick={() => (log = true)}>LOG</button></div><output>{log ? "log" : "linear"}</output></div>
      <div class="mk-ro"><span>T {f(T, 3, 0)} °C</span><span>t {f(th, 4, 1)} h</span><span>d {f(d.d_um, 5, 2)} µm</span><span>r {f(r.r_um2_per_h, 5, 2)} µm²/h</span>{#if r.valid}<Badge code="derived" pop="src:pe" />{:else}<Badge code="template" pop="src:pe-extrap" />{/if}</div>
    </div>
    <div>
      <div class="mk-sub">(b) Ti indiffusion: reported recipes</div>
      <table class="kv"><colgroup><col class="cn"><col><col class="cs"></colgroup><tbody>
        <tr><td>Ti 80 nm, 7 µm stripes, z-cut</td><td class="v">1060 °C, 9 h</td><td class="s"><Badge code="P" pop="src:luo" /></td></tr>
        <tr><td>Ti on −z face, O<sub>2</sub> flow, z-cut</td><td class="v">1035 °C, 12 h</td><td class="s"><Badge code="P" pop="src:chung" /></td></tr>
        <tr><td>First report: Ti, V, Ni films</td><td class="v">confined within about 1 µm</td><td class="s"><Badge code="P" text="P(abs)" pop="src:schmidt" /></td></tr>
      </tbody></table>
      <p class="nodata" style="margin:8px">No sourced Ti diffusion coefficient: recipes are shown as points, and no Ti depth curve is drawn.</p>
      <div class="mk-note">PE index step +0.12 on n<sub>e</sub> only, step profile at 633 nm; loss &lt; 0.5 dB/cm <Badge code="P" text="P(abs)" pop="src:jackel" /></div>
    </div>
  </div>
  <div class="pf">r(T) = r(249 °C) exp[−(E<sub>a</sub>/k<sub>B</sub>)(1/T − 1/522.15 K)] through the two reported points; whether the reported rate means d²/t or D is not confirmed from the full text, so both readings are offered.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg viewBox="0 0 440 300" style="max-width:600px" role="img" aria-label="Cross-section of an x-cut wafer with the proton-exchanged region under a mask opening">
      <rect x="20" y="70" width="400" height="220" class="ln-f" opacity="0.25" />
      <rect x="20" y="58" width={220 - 2 * PXU - 20} height="12" class="au-f" opacity="0.6" /><rect x={220 + 2 * PXU} y="58" width={420 - 220 - 2 * PXU} height="12" class="au-f" opacity="0.6" />
      <path class={r.valid ? "ln-f" : "ln-f"} opacity={r.valid ? 0.95 : 0.55} d="M{220 - 2 * PXU} 70 V{70 + d.d_um * PXU} H{220 + 2 * PXU} V70 Z" />
      {#if pol === "TE"}<ellipse cx="220" cy={70 + Math.min(d.d_um, 7) * PXU * 0.5} rx={2 * PXU * 0.9} ry={Math.max(4, Math.min(d.d_um, 7) * PXU * 0.45)} class="tmpl" style="stroke: var(--v-ir1550)" />{/if}
      <line class="dim" x1="430" x2="430" y1="70" y2={70 + d.d_um * PXU} /><text class="vl e" x="426" y={78 + d.d_um * PXU}>{d.d_um.toFixed(2)} µm</text>
      <text class="lb" x="22" y="50">mask (template, 4 µm opening)</text>
      <text class="lb" x="22" y="296">x-cut LiNbO₃; exchanged region: n<tspan class="sb" dy="3">e</tspan><tspan dy="-3"> + 0.12, n</tspan><tspan class="sb" dy="3">o</tspan><tspan dy="-3"> unchanged</tspan></text>
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:7ch"><label for="pev-T">Melt temperature</label><output>{T} °C</output><input id="pev-T" type="range" min="200" max="250" step="1" bind:value={T}></div>
      <div class="v-ctl" style="--w:7ch"><label for="pev-t">Exchange time</label><output>{th.toFixed(1)} h</output><input id="pev-t" type="range" min="0.1" max="10" step="0.1" bind:value={th}></div>
      <div class="v-ctl"><span class="v-lab">Light at 1550 nm (false color), polarization</span><div class="v-seg" role="group" aria-label="Polarization"><button type="button" class:on={pol === "TE"} onclick={() => (pol = "TE")}>TE (along Z)</button><button type="button" class:on={pol === "TM"} onclick={() => (pol = "TM")}>TM (along X)</button></div></div>
      <p class="v-cap">Ti indiffusion: no sourced diffusion coefficient, so no Ti depth curve; reported recipes 80 nm Ti at 1060 °C for 9 h <Badge code="P" pop="src:luo" /> and 1035 °C for 12 h <Badge code="P" pop="src:chung" />. PE index step +0.12 on n<sub>e</sub> only <Badge code="P" text="P(abs)" pop="src:jackel" />.</p>
      <dl class="v-hud"><dt>Depth</dt><dd>{d.d_um.toFixed(2)} µm</dd><dt>Guided mode</dt><dd>{pol === "TE" ? "yes: n_e + 0.12" : "none: n_o unchanged"}</dd></dl>
      <p class="v-cap" style="height:66px;overflow:hidden">{r.valid ? "Inside the reported 217–249 °C window." : "Outside 217–249 °C: extrapolated, template."} Mode outline is a sketch, not a solved mode. {#if r.valid}<Badge code="derived" pop="src:pe" />{:else}<Badge code="template" pop="src:pe-extrap" />{/if}</p>
    </div>
  </div>
</figure>
