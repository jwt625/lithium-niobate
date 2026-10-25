<!-- Fig. 3.8 Photoelastic tensor and the sign pairing (figures.md F3.8; author question 5 open): p'_bbbb(phi) for an
     in-plane unit vector b on X-, Y- and Z-cut films (photoelastic.longitudinal, inPlaneMaxima), for each set both as
     listed and with p14, p41 negated (photoelastic.flipP14P41 = 180 deg about Z). Neither pairing is marked correct.
     TECH: polar plots X-cut and Y-cut, both pairings; table. VISUAL: two wafers, one per pairing, with a nanobeam at phi. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { fullFrom3m, flipP14P41, longitudinal, inPlaneDir, inPlaneMaxima, type FilmCut } from "$lib/physics/photoelastic.ts";
  import { f38, type PSet } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { r1 } from "./plot.ts";
  import { sf, zf } from "./f.ts";
  import type { PSetIn } from "./types";

  let { sets }: { sets: PSetIn[] } = $props();
  const cur = $derived(sets.find((s) => s.id === f38.set) ?? sets[0]);
  const A = $derived(fullFrom3m(cur.p));
  const B = $derived(fullFrom3m(flipP14P41(cur.p)));
  const D2R = Math.PI / 180;
  const pv = (T: Float64Array, cut: FilmCut, phiDeg: number): number => longitudinal(T, inPlaneDir(cut, phiDeg * D2R));
  const NP = 360;
  const polarPath = (T: Float64Array, cut: FilmCut, cx: number, cy: number, k: number): string => {
    let d = "";
    for (let i = 0; i <= NP; i++) { const ph = (360 * i) / NP, r = Math.abs(pv(T, cut, ph)) * k; d += `${i ? "L" : "M"}${r1(cx + r * Math.cos(ph * D2R))} ${r1(cy - r * Math.sin(ph * D2R))}`; }
    return d;
  };
  const PC = 120, PK = 270; // 0.4 at radius 108
  const curves = $derived({ XA: polarPath(A, "X", PC, PC, PK), XB: polarPath(B, "X", PC, PC, PK), YA: polarPath(A, "Y", PC, PC, PK), YB: polarPath(B, "Y", PC, PC, PK) });
  const mx = $derived({ A: inPlaneMaxima(A, f38.cut), B: inPlaneMaxima(B, f38.cut) });
  const fmtMax = (m: { value: number; phi_deg: number[] }): string => (f38.cut === "Z" ? `${sf(m.value, 1, 4)} at every φ` : `${sf(m.value, 1, 4)} at φ = ${m.phi_deg.map((d) => zf(d, 3, 1) + "°").join(", ")}`);
  const now = $derived({ A: pv(A, f38.cut, f38.phi), B: pv(B, f38.cut, f38.phi) });
  const AX: Record<FilmCut, [string, string]> = { X: ["+Y", "+Z"], Y: ["+X", "+Z"], Z: ["+X", "+Y"] };
  const setOpts = $derived(sets.map((s) => ({ v: s.id as PSet, t: s.label })));
  const cutOpts = [{ v: "X" as const, t: "X-cut" }, { v: "Y" as const, t: "Y-cut" }, { v: "Z" as const, t: "Z-cut" }];
  const sgnTxt = (v: number): string => (v < 0 ? "< 0" : "> 0");
  // VISUAL wafers
  const WC = 150, WR = 120, WK = 300;
  const rose = (T: Float64Array): string => {
    let d = "";
    for (let i = 0; i <= NP; i++) { const ph = (360 * i) / NP, r = Math.max(0, pv(T, f38.cut, ph)) * WK; d += `${i ? "L" : "M"}${r1(WC + r * Math.cos(ph * D2R))} ${r1(WC - r * Math.sin(ph * D2R))}`; }
    return d + "Z";
  };
  const roses = $derived({ A: rose(A), B: rose(B) });
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f38" id="f38">
  <div class="ph"><span>Longitudinal photoelastic coefficient p′<sub>bbbb</sub>(φ) in the film plane, 633 nm</span><Seg options={setOpts} bind:value={f38.set} label="Photoelastic set" /></div>
  <div class="snd-g3">
    <div class="snd-cell">
      <p class="snd-cap">X-cut, φ from +Y toward +Z; radius |p′|</p>
      <svg class="snd-svg snd-sq" viewBox="0 0 240 240" role="img" aria-label="X-cut polar plot of p prime">
        {#each [0.1, 0.2, 0.3, 0.4] as r (r)}<circle class="gl" cx={PC} cy={PC} r={r1(r * PK)} /><text class="tk" x={PC + 3} y={r1(PC - r * PK - 2)}>{r.toFixed(1)}</text>{/each}
        <line class="ax" x1="6" y1={PC} x2="234" y2={PC} /><line class="ax" x1={PC} y1="6" x2={PC} y2="234" />
        <text class="lb" x="218" y={PC - 4}>+Y</text><text class="lb" x={PC + 4} y="14">+Z</text>
        <path class="c1" d={curves.XA} /><path class="c2" d={curves.XB} />
        {#if f38.cut === "X"}<line class="cur" x1={PC} y1={PC} x2={r1(PC + 115 * Math.cos(f38.phi * D2R))} y2={r1(PC - 115 * Math.sin(f38.phi * D2R))} />{/if}
      </svg>
    </div>
    <div class="snd-cell">
      <p class="snd-cap">Y-cut, φ from +X toward +Z; radius |p′|</p>
      <svg class="snd-svg snd-sq" viewBox="0 0 240 240" role="img" aria-label="Y-cut polar plot of p prime">
        {#each [0.1, 0.2, 0.3, 0.4] as r (r)}<circle class="gl" cx={PC} cy={PC} r={r1(r * PK)} /><text class="tk" x={PC + 3} y={r1(PC - r * PK - 2)}>{r.toFixed(1)}</text>{/each}
        <line class="ax" x1="6" y1={PC} x2="234" y2={PC} /><line class="ax" x1={PC} y1="6" x2={PC} y2="234" />
        <text class="lb" x="218" y={PC - 4}>+X</text><text class="lb" x={PC + 4} y="14">+Z</text>
        <path class="c1" d={curves.YA} /><path class="c2" d={curves.YB} />
        {#if f38.cut === "Y"}<line class="cur" x1={PC} y1={PC} x2={r1(PC + 115 * Math.cos(f38.phi * D2R))} y2={r1(PC - 115 * Math.sin(f38.phi * D2R))} />{/if}
      </svg>
    </div>
    <div class="snd-cell">
      <p class="snd-cap">solid A: p₁₄, p₄₁ as listed ({sgnTxt(cur.p.p14)}); dashed B: negated</p>
      <table class="idx snd-tab snd-pe">
        <thead><tr><th>{f38.cut}-cut φ</th><th class="r">A</th><th class="r">B</th></tr></thead>
        <tbody>{#each [0, 45, 90, 135] as a (a)}<tr><td>{a}°</td><td class="num">{sf(pv(A, f38.cut, a), 1, 3)}</td><td class="num">{sf(pv(B, f38.cut, a), 1, 3)}</td></tr>{/each}</tbody>
      </table>
      <div class="snd-ctl" style="padding-left:0;border-top:0"><span class="lbl">Film</span><Seg options={cutOpts} bind:value={f38.cut} label="Film cut" /></div>
    </div>
  </div>
  <div class="ctl"><label for="f38-p">In-plane angle φ</label><input id="f38-p" type="range" min="0" max="180" step="0.5" bind:value={f38.phi} /><output for="f38-p">{zf(f38.phi, 3, 1)}°</output></div>
  <dl class="snd-kv">
    <dt>p′ at φ, A / B</dt><dd>{sf(now.A, 1, 4)} / {sf(now.B, 1, 4)}</dd>
    <dt>maximum, A</dt><dd>{fmtMax(mx.A)}</dd>
    <dt>maximum, B</dt><dd>{fmtMax(mx.B)}</dd>
  </dl>
  <div class="snd-flag"><b>Sign pairing not resolved.</b> Whether p₁₄, p₄₁ as listed belong to the same frame as c₁₄ &gt; 0 (IEEE 176-1987) is not confirmed at the primary level for any set; A and B are equally possible. On X-cut the choice moves the optimum between about 45° and about 135°; on Y-cut and Z-cut it changes nothing. Frame of this set: <span class="snd-stack">{#each sets as st (st.id)}<span class:off={st.id !== cur.id}>{st.frame}</span>{/each}</span></div>
  <div class="pf"><span class="snd-stack">{#each sets as st (st.id)}<span class:off={st.id !== cur.id}>{@html st.label} <Badge code={st.code} pop={st.pop} /></span>{/each}</span> rotated coefficient <Badge code="derived" pop="m-pe" /> frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v wide" data-variant="visual" data-pair="f38">
  <div class="snd-wafers">
    {#each [["A", "p₁₄, p₄₁ as listed", A, roses.A, now.A], ["B", "p₁₄, p₄₁ negated", B, roses.B, now.B]] as [k, t, , rp, v] (k)}
      <div class="snd-card">
        <h3>Pairing {k}: {t}</h3>
        <svg class="snd-vsvg" viewBox="0 0 300 300" style="max-width:420px" role="img" aria-label="Wafer top view with the photoelastic response rose, pairing {k}">
          <path d="M{WC - WR * 0.5} {r1(WC + WR * 0.866)}A{WR} {WR} 0 1 1 {WC + WR * 0.5} {r1(WC + WR * 0.866)}Z" class="lnf" />
          <path d={rp as string} fill="var(--v-l532)" fill-opacity="0.22" stroke="var(--v-l532)" stroke-width="1.5" />
          <line class="ax" x1={WC - WR} y1={WC} x2={WC + WR} y2={WC} /><line class="ax" x1={WC} y1={WC - WR} x2={WC} y2={WC + WR} />
          <text x={WC + WR - 22} y={WC - 6} class="lbv">{AX[f38.cut][0]}</text><text x={WC + 6} y={WC - WR + 16} class="lbv">{AX[f38.cut][1]}</text>
          <g transform="rotate({r1(-f38.phi)} {WC} {WC})">
            <rect x={WC - 70} y={WC - 5} width="140" height="10" fill="var(--v-au)" fill-opacity={r1(0.15 + 0.85 * Math.min(1, Math.abs(v as number) / 0.36))} stroke="var(--v-au)" />
          </g>
        </svg>
        <div class="snd-big"><span class="snd-n" style="--nw:3.6em">{sf(v as number, 1, 3)}</span><small>p′ along the beam</small></div>
      </div>
    {/each}
  </div>
  <div class="snd-row3">
    <div class="snd-flagv"><b>The sign pairing is open.</b> p₁₄ and p₄₁ flip with c₁₄, e₂₂ and d₂₂ under a 180° rotation about Z. Which of A and B matches c₁₄ &gt; 0 is not confirmed for any set; the size of the effect is the same, only the best direction on an X-cut chip moves, from about 45° to about 135°. Switch to Y-cut: both wafers agree. Frame of this set: <span class="snd-stack">{#each sets as st (st.id)}<span class:off={st.id !== cur.id}>{st.frame}</span>{/each}</span></div>
    <div class="snd-vctl">
      <div class="v-ctl" style="--w:7ch"><label for="f38v-p">Beam angle φ</label><output for="f38v-p">{zf(f38.phi, 3, 1)}°</output><input id="f38v-p" type="range" min="0" max="180" step="0.5" bind:value={f38.phi} /></div>
      <div class="v-ctl"><span class="v-lab">Film</span><Seg visual options={cutOpts} bind:value={f38.cut} label="Film cut" /></div>
      <div class="v-ctl"><span class="v-lab">Coefficient set</span><Seg visual options={setOpts} bind:value={f38.set} label="Photoelastic set" /></div>
    </div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span class="snd-stack">{#each sets as st (st.id)}<span class:off={st.id !== cur.id}>{@html st.label} <Badge code={st.code} pop={st.pop} /></span>{/each}</span><span>rose: p′<sub>bbbb</sub>(φ) &gt; 0, radius 0.1 per 30 px <Badge code="derived" pop="m-pe" /></span><span>wafer flat drawn for orientation only</span></div>
