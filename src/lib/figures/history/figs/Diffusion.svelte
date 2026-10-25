<!-- F7.5 Diffusion profile (figures.md F7.5). Proton exchange (1982): step index Delta n_e = 0.12 of depth d^2 = r t with
     the jackel1982 rates (Arrhenius through 217 and 249 C), and the fundamental slab mode at 633 nm. Li2O out-diffusion
     (1973) and Ti in-diffusion (1974): no diffusion constants in the sources held; their sourced anchors are drawn. -->
<script lang="ts">
  import { lab } from "../labels";
  import { slabMode, pe, NS, DN_PE } from "../diffusion";
  let proc = $state<"li" | "ti" | "pe">("pe"), T = $state(249), t = $state(4), logY = $state(false);
  const Z = Array.from({ length: 201 }, (_, k) => -1 + (k / 200) * 21);
  const r = $derived(pe(T, t));
  const mode = $derived(proc === "pe" ? slabMode(r.d, DN_PE, Z) : null);
  const X = (z: number): number => 50 + ((z + 1) / 21) * 520;
  const Y = $derived((dn: number): number => (logY ? 200 - ((Math.log10(Math.max(1e-4, dn)) + 4) / Math.log10(0.15 / 1e-4)) * 180 : 200 - (dn / 0.15) * 180));
  const prof = $derived(proc === "pe" ? `M${X(-1)} ${Y(1e-4)} H${X(0)} V${Y(DN_PE)} H${X(r.d)} V${Y(1e-4)} H${X(20)}` : "");
  const mpath = $derived(mode ? Z.map((z, k) => `${k ? "L" : "M"}${X(z).toFixed(1)} ${(200 - mode.I[k] * 180).toFixed(1)}`).join("") : "");
  const yt = $derived(logY ? [1e-4, 1e-3, 1e-2, 0.1] : [0, 0.05, 0.1, 0.15]);
  const dTxt = $derived(proc === "pe" ? `${r.d.toFixed(2)} µm` : "N/A");
  const nTxt = $derived(mode ? mode.N.toFixed(4) : proc === "pe" ? "cut off" : "N/A");
</script>

{#snippet plot(cls: string)}
  <svg class="hx-df {cls}" viewBox="0 0 600 240" role="img" aria-label="Index increase and mode intensity versus depth">
    {#each yt as v (v)}<line class="gl" x1="50" x2="570" y1={Y(v)} y2={Y(v)}/><text class="tk" x="44" y={Y(v) + 4} text-anchor="end">{logY ? v.toExponential(0).replace("e-", "e−") : v}</text>{/each}
    {#each [0, 5, 10, 15, 20] as z (z)}<line class="gl" x1={X(z)} x2={X(z)} y1="20" y2="200"/><text class="tk" x={X(z)} y="216" text-anchor="middle">{z}</text>{/each}
    <text class="tk" x="570" y="234" text-anchor="end">depth (&micro;m)</text><text class="tk" x="6" y="14">&Delta;n<tspan font-size="70%" dy="2">e</tspan></text>
    <line class="surf" x1={X(0)} x2={X(0)} y1="20" y2="200"/>
    {#if proc === "pe"}<path class="pr" d={prof}/>{#if mode}<path class="md" d={mpath}/>{/if}{/if}
    {#if proc === "li"}<rect class="anc" x={X(0)} y="24" width={X(12) - X(0)} height="176"/><text class="tk" x={X(6)} y="40" text-anchor="middle">12 &micro;m effective thickness, single mode</text>{/if}
    {#if proc === "ti"}<rect class="anc" x={X(0)} y="24" width={X(1) - X(0)} height="176"/><text class="tk" x={X(1) + 8} y="40">light confined within about 1 &micro;m</text>{/if}
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-dfp">
  <div class="ph"><span>Index increase vs depth, 633 nm</span><span class="seg" role="group" aria-label="Process"><button type="button" class:on={proc === "li"} onclick={() => (proc = "li")}>LI2O 1973</button><button type="button" class:on={proc === "ti"} onclick={() => (proc = "ti")}>TI 1974</button><button type="button" class:on={proc === "pe"} onclick={() => (proc = "pe")}>PE 1982</button></span></div>
  {@render plot("t")}
  <div class="ctl"><label for="df-T">Temperature</label><input id="df-T" type="range" min="200" max="250" step="1" bind:value={T} disabled={proc !== "pe"}><output>{T} &deg;C</output></div>
  <div class="ctl"><label for="df-t">Time</label><input id="df-t" type="range" min="0.5" max="24" step="0.5" bind:value={t} disabled={proc !== "pe"}><output>{t.toFixed(1).padStart(4, " ")} h</output></div>
  <div class="ctl"><span class="k">Axis</span><span class="seg" role="group" aria-label="Index axis"><button type="button" class:on={!logY} onclick={() => (logY = false)}>LIN</button><button type="button" class:on={logY} onclick={() => (logY = true)}>LOG</button></span><span></span></div>
  <table class="kv"><colgroup><col><col class="cv"></colgroup><tbody>
    <tr><td>Exchanged depth d (d<sup>2</sup> = r t) <span class="b hd" data-pop="hst:derived">derived</span></td><td class="v">{dTxt}</td></tr>
    <tr><td>Mode effective index (n<sub>e</sub> = {NS.toFixed(4)})</td><td class="v">{nTxt}</td></tr>
    <tr><td>Rate data range</td><td class="v">{proc === "pe" ? (r.valid ? "inside" : "extrapolated") : "N/A"}</td></tr>
  </tbody></table>
  <div class="pf">Proton exchange: &Delta;n<sub>e</sub> = 0.12 step, 1.37 &micro;m<sup>2</sup>/h at 249 &deg;C, 0.37 &micro;m<sup>2</sup>/h at 217 &deg;C <span class="hx-ref" data-pop="src:jackel1982">{lab("jackel1982")}</span>; whether the rate is d<sup>2</sup>/t or D is not confirmed from the full text. Anchors: <span class="hx-ref" data-pop="src:carruthers1974">{lab("carruthers1974")}</span>, <span class="hx-ref" data-pop="src:schmidt1974">{lab("schmidt1974")}</span>; no diffusion constants held for Li<sub>2</sub>O or Ti. n<sub>e</sub>: <span class="hx-ref" data-pop="src:zelmon1997">{lab("zelmon1997")}</span>.</div>
</div>

<div data-variant="visual" class="hx-vdf">
  <div class="v-seg" role="group" aria-label="Process"><button type="button" class:on={proc === "li"} onclick={() => (proc = "li")}>1973 Li&#8322;O out-diffusion</button><button type="button" class:on={proc === "ti"} onclick={() => (proc = "ti")}>1974 Ti in-diffusion</button><button type="button" class:on={proc === "pe"} onclick={() => (proc = "pe")}>1982 proton exchange</button></div>
  {@render plot("v")}
  <div class="hx-vdf-g">
    <div class="v-ctl" style="--w:7ch"><label for="vdf-T">Acid bath temperature</label><output>{T} &deg;C</output><input id="vdf-T" class="v-range" type="range" min="200" max="250" step="1" bind:value={T} disabled={proc !== "pe"}></div>
    <div class="v-ctl" style="--w:6ch"><label for="vdf-t">Exchange time</label><output>{t.toFixed(1).padStart(4, " ")} h</output><input id="vdf-t" class="v-range" type="range" min="0.5" max="24" step="0.5" bind:value={t} disabled={proc !== "pe"}></div>
    <div class="v-seg" role="group" aria-label="Index axis"><button type="button" class:on={!logY} onclick={() => (logY = false)}>Linear</button><button type="button" class:on={logY} onclick={() => (logY = true)}>Log</button></div>
    <dl class="v-hud"><dt>Exchanged depth</dt><dd>{dTxt}</dd><dt>Mode effective index</dt><dd>{nTxt}</dd></dl>
  </div>
  <p class="v-cap">Mode intensity at 633 nm, normalized (red curve). Proton-exchange rates <span class="hx-ref" data-pop="src:jackel1982">{lab("jackel1982")}</span>; no diffusion constants are held for Li&#8322;O or Ti, so those show their sourced depths only (<span class="hx-ref" data-pop="src:carruthers1974">{lab("carruthers1974")}</span>, <span class="hx-ref" data-pop="src:schmidt1974">{lab("schmidt1974")}</span>). Whether the reported rate is d<sup>2</sup>/t or D is not confirmed from the full text; depth here uses d<sup>2</sup> = r t. Substrate n<sub>e</sub> = {NS.toFixed(4)} at 633 nm <span class="hx-ref" data-pop="src:zelmon1997">{lab("zelmon1997")}</span>.</p>
</div>
