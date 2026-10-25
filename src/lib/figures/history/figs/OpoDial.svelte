<!-- F7.2b OPO dial (hero story H2; figures.md F7.2b). 1965: pump 0.529 um, crystal angle (see opo.ts for why not
     temperature). 1995: pump 1.064 um, PPLN; temperature at the experimental 31 um period, plus a period knob 26-32 um
     (model extension: the 1995 experiment was temperature-tuned). Computed curve (derived) against the reported bands. -->
<script lang="ts">
  import { lab } from "../labels";
  import { DEFAULT, solve, curve, REF, fmtL, LP65, LP95, type State, type Mode } from "../opo";
  import { HSTATUS } from "../status";

  let st = $state<State>({ ...DEFAULT });
  const r = $derived(solve(st));
  const cv = $derived(curve(st));
  const lp = $derived(st.mode === "1995" ? LP95 : LP65);
  const knob = $derived(st.mode === "1995" ? st.T : st.theta);
  const knobTxt = $derived(st.mode === "1995" ? `${st.T.toFixed(0).padStart(3, " ")} °C` : `${st.theta.toFixed(1).padStart(4, " ")} deg`);

  // plot geometry (viewBox 560 x 300): x = knob, y = wavelength 0.5-5 um
  const PX0 = 52, PX1 = 440, PY0 = 16, PY1 = 262, L0 = 0.5, L1 = 5;
  const X = (v: number): number => PX0 + ((v - cv.x0) / (cv.x1 - cv.x0)) * (PX1 - PX0);
  const Y = (l: number): number => PY1 - ((l - L0) / (L1 - L0)) * (PY1 - PY0);
  function path(xs: number[], ys: number[]): string {
    let d = "", pen = false;
    xs.forEach((x, k) => { const y = ys[k]; if (Number.isFinite(y)) { d += `${pen ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`; pen = true; } else pen = false; });
    return d;
  }
  const ticksX = $derived(st.mode === "1995" ? [20, 50, 100, 150, 200, 250] : [50, 60, 70, 80, 90]);
  const ticksY = [0.5, 1, 2, 3, 4, 5];
  const setMode = (m: Mode): void => { st.mode = m; };
  const cites = (m: Mode): string => REF[m].map((b) => `<span class="hx-ref" data-pop="src:${b.src}">${lab(b.src)}</span>&nbsp;<span class="b ${HSTATUS[b.st].cls}" data-pop="hst:${b.st}">${b.st}</span>`).join("; ");

  // VISUAL spectrum bar: log axis 0.4-5 um
  const SX = (l: number): number => 20 + (Math.log(l / 0.4) / Math.log(5 / 0.4)) * 640;
</script>

{#snippet plot(cls: string)}
  <svg class="hx-opo-plot {cls}" viewBox="0 0 560 300" role="img" aria-label="Signal and idler wavelength versus the tuning knob">
    {#each ticksY as l (l)}<line class="gl" x1={PX0} x2={PX1} y1={Y(l)} y2={Y(l)}/><text class="tk" x={PX0 - 6} y={Y(l) + 4} text-anchor="end">{l}</text>{/each}
    {#each ticksX as v (v)}<line class="gl" x1={X(v)} x2={X(v)} y1={PY0} y2={PY1}/><text class="tk" x={X(v)} y={PY1 + 16} text-anchor="middle">{v}</text>{/each}
    <text class="tk" x={PX0 - 40} y={PY0 + 4}>&micro;m</text>
    <text class="tk" x={PX1} y={PY1 + 32} text-anchor="end">{st.mode === "1995" ? "temperature (°C)" : "angle from c (deg)"}</text>
    <rect class="fr" x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0}/>
    <path class="cs" d={path(cv.x, cv.s)}/><path class="ci" d={path(cv.x, cv.i)}/>
    <line class="kn" x1={X(knob)} x2={X(knob)} y1={PY0} y2={PY1}/>
    {#if Number.isFinite(r.s)}<circle class="pt" cx={X(knob)} cy={Y(r.s)} r="3.5"/><circle class="pt" cx={X(knob)} cy={Y(r.i)} r="3.5"/>{/if}
    {#each REF[st.mode] as b, k (b.src)}
      <rect class="rb" x={460 + k * 34} y={Y(b.hi)} width="14" height={Y(b.lo) - Y(b.hi)}/>
      <text class="tk" x={467 + k * 34} y={Y(b.lo) + 14} text-anchor="middle">{b.st}</text>
    {/each}
    <text class="tk" x="460" y={PY0 + 4}>as reported</text>
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-opo">
  <div class="ph"><span>OPO: pump {lp.toFixed(3)} &micro;m, {st.mode === "1995" ? "PPLN e+e→e, Λ = " + st.period.toFixed(1) + " µm" : "type I o+o→e, 21 °C"}</span><span class="seg" role="group" aria-label="Experiment"><button type="button" class:on={st.mode === "1965"} onclick={() => setMode("1965")}>1965</button><button type="button" class:on={st.mode === "1995"} onclick={() => setMode("1995")}>1995</button></span></div>
  <div class="hx-opo-g">
    <div>{@render plot("t")}</div>
    <div class="hx-opo-side">
      <div class="hx-stack">
        <div class:hid={st.mode !== "1995"}>
          <div class="ctl"><label for="opo-t">Temperature</label><input id="opo-t" type="range" min="20" max="250" step="1" bind:value={st.T}><output>{st.T.toFixed(0).padStart(3, "\u2007")} &deg;C</output></div>
          <div class="ctl"><label for="opo-p">Period &Lambda;</label><input id="opo-p" type="range" min="26" max="32" step="0.1" bind:value={st.period}><output>{st.period.toFixed(1)} &micro;m</output></div>
        </div>
        <div class:hid={st.mode !== "1965"}>
          <div class="ctl"><label for="opo-a">Angle &theta;</label><input id="opo-a" type="range" min="50" max="90" step="0.1" bind:value={st.theta}><output>{st.theta.toFixed(1).padStart(4, "\u2007")} deg</output></div>
        </div>
      </div>
      <table class="kv"><colgroup><col><col class="cv"></colgroup><tbody>
        <tr><td>Signal <span class="b hd" data-pop="hst:derived">derived</span></td><td class="v">{fmtL(r.s)}</td></tr>
        <tr><td>Idler <span class="b hd" data-pop="hst:derived">derived</span></td><td class="v">{fmtL(r.i)}</td></tr>
      </tbody></table>
      <div class="hx-opo-ref hx-stack"><div class:hid={st.mode !== "1995"}>Bars: {@html cites("1995")}</div><div class:hid={st.mode !== "1965"}>Bar: {@html cites("1965")}</div></div>
    </div>
  </div>
  <div class="pf hx-stack"><div class:hid={st.mode !== "1995"}>Jundt 1997 n<sub>e</sub>(&lambda;, T) for congruent LN <span class="hx-ref" data-pop="src:jundt1997">{lab("jundt1997")}</span> (coefficients via a secondary transcription), first-order QPM, thermal expansion of &Lambda; neglected. &Lambda; other than 31 &micro;m: model extension; the 1995 experiment was temperature-tuned.</div><div class:hid={st.mode !== "1965"}>Zelmon 1997 congruent LN at 21 &deg;C <span class="hx-ref" data-pop="src:zelmon1997">{lab("zelmon1997")}</span>. No temperature-dependent n<sub>o</sub> model is held, so the knob is the angle; near degeneracy congruent LN at 21 &deg;C has no solution even at 90&deg;. The phase-matching temperature depends strongly on Li content (4 to 238 &deg;C for 1064 nm SHG in fibers <span class="hx-ref" data-pop="src:luh1987">{lab("luh1987")}</span>); the 1965 crystal composition is not documented here.</div></div>
</div>

<div data-variant="visual" class="hx-vopo">
  <div class="hx-vopo-top">
    <div class="v-seg" role="group" aria-label="Experiment"><button type="button" class:on={st.mode === "1965"} onclick={() => setMode("1965")}>1965 Bell Labs</button><button type="button" class:on={st.mode === "1995"} onclick={() => setMode("1995")}>1995 Stanford PPLN</button></div>
  </div>
  <svg class="hx-vopo-bench" viewBox="0 0 680 190" role="img" aria-label="Resonator: pump in, signal and idler out">
    <path class="mir" d="M70 40 Q 58 95 70 150 M590 40 Q 602 95 590 150"/>
    <line class={st.mode === "1995" ? "beam ir" : "beam vis"} x1="0" y1="95" x2="330" y2="95"/>
    <g transform="rotate({st.mode === '1965' ? (90 - st.theta) * 0.8 : 0} 330 95)">
      <rect class="xtal" x="270" y="72" width="120" height="46"/>
      {#if st.mode === "1995"}{#each Array.from({ length: 12 }, (_, k) => k) as k (k)}<rect class="dom" x={270 + k * 10} y="72" width="5" height="46"/>{/each}{/if}
    </g>
    {#if st.mode === "1995"}<rect class="oven" x="262" y="122" width="136" height="10"/><text class="lab" x="330" y="150" text-anchor="middle">oven {knobTxt.trim()}</text>{:else}<text class="lab" x="330" y="150" text-anchor="middle">&theta; = {knobTxt.trim()}</text>{/if}
    <line class="beam ir" x1="390" y1="88" x2="680" y2="58"/><line class="beam ir" x1="390" y1="102" x2="680" y2="132"/>
    <text class="lab" x="676" y="48" text-anchor="end">signal {fmtL(r.s).trim()}</text><text class="lab" x="676" y="152" text-anchor="end">idler {fmtL(r.i).trim()}</text>
    <text class="lab" x="8" y="84">pump {lp.toFixed(3)} &micro;m</text>
  </svg>
  <svg class="hx-vopo-spec" viewBox="0 0 680 64" role="img" aria-label="Wavelength axis 0.4 to 5 micrometres, log scale">
    <defs><linearGradient id="hx-vis-grad" x1={SX(0.4)} x2={SX(0.7)} gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7a3cff"/><stop offset="0.2" stop-color="#2a6cff"/><stop offset="0.4" stop-color="#18c4b0"/><stop offset="0.55" stop-color="#45ff9c"/><stop offset="0.72" stop-color="#ffe14a"/><stop offset="0.86" stop-color="#ff8a2a"/><stop offset="1" stop-color="#ff385d"/></linearGradient></defs>
    <rect x={SX(0.4)} y="20" width={SX(0.7) - SX(0.4)} height="10" fill="url(#hx-vis-grad)"/>
    <rect class="irband" x={SX(0.7)} y="20" width={SX(5) - SX(0.7)} height="10"/>
    {#each REF[st.mode] as b, k (b.src)}<rect class="ref" x={SX(b.lo)} y={k ? 36 : 6} width={SX(b.hi) - SX(b.lo)} height="5"/>{/each}
    {#each [0.4, 0.5, 0.7, 1, 1.5, 2, 3, 4, 5] as l (l)}<text class="tk" x={SX(l)} y="58" text-anchor="middle">{l}</text>{/each}
    <path class="mk p" d="M{SX(lp)} 16 l-5 -8 h10 z"/>
    {#if Number.isFinite(r.s)}<path class="mk" d="M{SX(r.s)} 16 l-5 -8 h10 z"/><path class="mk" d="M{SX(r.i)} 16 l-5 -8 h10 z"/>{/if}
  </svg>
  <div class="hx-vopo-g">
    <div class="hx-vopo-ctl">
      <div class="hx-stack">
        <div class:hid={st.mode !== "1995"}>
          <div class="v-ctl" style="--w:7ch"><label for="vopo-t">Crystal temperature</label><output>{st.T.toFixed(0).padStart(3, "\u2007")} &deg;C</output><input id="vopo-t" class="v-range" type="range" min="20" max="250" step="1" bind:value={st.T}></div>
          <div class="v-ctl" style="--w:8ch"><label for="vopo-p">Poling period (model extension)</label><output>{st.period.toFixed(1)} &micro;m</output><input id="vopo-p" class="v-range" type="range" min="26" max="32" step="0.1" bind:value={st.period}></div>
        </div>
        <div class:hid={st.mode !== "1965"}>
          <div class="v-ctl" style="--w:8ch"><label for="vopo-a">Crystal angle from c</label><output>{st.theta.toFixed(1).padStart(4, "\u2007")} deg</output><input id="vopo-a" class="v-range" type="range" min="50" max="90" step="0.1" bind:value={st.theta}></div>
        </div>
      </div>
      <dl class="v-hud"><dt>Signal (derived)</dt><dd>{fmtL(r.s)}</dd><dt>Idler (derived)</dt><dd>{fmtL(r.i)}</dd></dl>
      <div class="hx-stack v-cap">
        <p class:hid={st.mode !== "1995"}>Bands as reported: {@html cites("1995")}. Phase matching e+e&rarr;e, first-order QPM; Jundt 1997 n<sub>e</sub>(&lambda;, T) for congruent LN <span class="hx-ref" data-pop="src:jundt1997">{lab("jundt1997")}</span> (coefficients via a secondary transcription); thermal expansion of &Lambda; neglected. Periods other than 31 &micro;m: model extension.</p>
        <p class:hid={st.mode !== "1965"}>Band as reported: {@html cites("1965")}. Type I o+o&rarr;e; Zelmon 1997 congruent LN at 21 &deg;C <span class="hx-ref" data-pop="src:zelmon1997">{lab("zelmon1997")}</span>. No temperature-dependent n<sub>o</sub> model is held, so the knob is the angle; near degeneracy there is no solution even at 90&deg;. The phase-matching temperature depends strongly on Li content (4 to 238 &deg;C for 1064 nm SHG in fibers <span class="hx-ref" data-pop="src:luh1987">{lab("luh1987")}</span>); the 1965 crystal composition is not documented here.</p>
      </div>
    </div>
    <div>{@render plot("v")}</div>
  </div>
</div>
