<!-- Fig. 3.2 Constitutive forms and the convention of 2s (figures.md F3.2). All four piezoelectric forms and the stiff,
     compliant, clamped and free constants from kushibiki1999 c^E, e, eps^S (piezo.convertForms); a clicked Voigt cell
     shows the full-tensor components it stands for and the factor (piezo.voigtFactor, voigtCellComponents).
     TECH: boxed mono grid, fixed 6 x 6 geometry for every form. VISUAL: glyph grid (area = magnitude, tone = sign) with
     the full-tensor expansion and a measured vs computed bar for eps^T. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { convertForms, voigtFactor, voigtCellComponents, type VoigtKind } from "$lib/physics/piezo.ts";
  import { c3m, e3m, eps3m } from "$lib/physics/tensors.ts";
  import { CE_KUSHIBIKI1999, E_KUSHIBIKI1999, EPS_S_KUSHIBIKI1999, EPS_T_KUSHIBIKI1999 } from "$lib/physics/constants.ts";
  import { f32, type FormKey } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { ef, uf } from "./f.ts";
  import { r1 } from "./plot.ts";

  const F = convertForms({ cE_GPa: c3m(CE_KUSHIBIKI1999), e_Cm2: e3m(E_KUSHIBIKI1999), epsS_rel: eps3m(EPS_S_KUSHIBIKI1999) });
  interface Form { k: FormKey; t: string; sym: string; kind: VoigtKind | "eps"; M: number[][]; unit: string; rows: number; cols: number; rel: Record<string, string> }
  const relE = { "0,5": "e<sub>16</sub> = −e<sub>22</sub>", "1,0": "e<sub>21</sub> = −e<sub>22</sub>", "1,3": "e<sub>24</sub> = e<sub>15</sub>", "2,1": "e<sub>32</sub> = e<sub>31</sub>" };
  const relD = { "0,5": "d<sub>16</sub> = −2d<sub>22</sub>", "1,0": "d<sub>21</sub> = −d<sub>22</sub>", "1,3": "d<sub>24</sub> = d<sub>15</sub>", "2,1": "d<sub>32</sub> = d<sub>31</sub>" };
  const relC = { "1,1": "c<sub>22</sub> = c<sub>11</sub>", "1,2": "c<sub>23</sub> = c<sub>13</sub>", "1,3": "c<sub>24</sub> = −c<sub>14</sub>", "3,1": "c<sub>42</sub> = −c<sub>14</sub>", "4,4": "c<sub>55</sub> = c<sub>44</sub>", "4,5": "c<sub>56</sub> = c<sub>14</sub>", "5,4": "c<sub>65</sub> = c<sub>14</sub>", "5,5": "c<sub>66</sub> = (c<sub>11</sub> − c<sub>12</sub>)/2" };
  const relS = { "1,1": "s<sub>22</sub> = s<sub>11</sub>", "1,2": "s<sub>23</sub> = s<sub>13</sub>", "1,3": "s<sub>24</sub> = −s<sub>14</sub>", "3,1": "s<sub>42</sub> = −s<sub>14</sub>", "4,4": "s<sub>55</sub> = s<sub>44</sub>", "4,5": "s<sub>56</sub> = 2s<sub>14</sub>", "5,4": "s<sub>65</sub> = 2s<sub>14</sub>", "5,5": "s<sub>66</sub> = 2(s<sub>11</sub> − s<sub>12</sub>)" };
  const relEps = { "1,1": "ε<sub>22</sub> = ε<sub>11</sub>" };
  const FORMS: Form[] = [
    { k: "e", t: "e", sym: "e", kind: "e", M: F.e, unit: "C/m²", rows: 3, cols: 6, rel: relE },
    { k: "d", t: "d", sym: "d", kind: "d", M: F.d, unit: "C/N", rows: 3, cols: 6, rel: relD },
    { k: "g", t: "g", sym: "g", kind: "g", M: F.g, unit: "V·m/N", rows: 3, cols: 6, rel: relD },
    { k: "h", t: "h", sym: "h", kind: "h", M: F.h, unit: "V/m", rows: 3, cols: 6, rel: relE },
    { k: "cE", t: "c<sup>E</sup>", sym: "c", kind: "c", M: F.cE, unit: "Pa", rows: 6, cols: 6, rel: relC },
    { k: "cD", t: "c<sup>D</sup>", sym: "c", kind: "c", M: F.cD, unit: "Pa", rows: 6, cols: 6, rel: relC },
    { k: "sE", t: "s<sup>E</sup>", sym: "s", kind: "s", M: F.sE, unit: "1/Pa", rows: 6, cols: 6, rel: relS },
    { k: "sD", t: "s<sup>D</sup>", sym: "s", kind: "s", M: F.sD, unit: "1/Pa", rows: 6, cols: 6, rel: relS },
    { k: "epsS", t: "ε<sup>S</sup>", sym: "ε", kind: "eps", M: F.epsS, unit: "ε₀", rows: 3, cols: 3, rel: relEps },
    { k: "epsT", t: "ε<sup>T</sup>", sym: "ε", kind: "eps", M: F.epsT, unit: "ε₀", rows: 3, cols: 3, rel: relEps },
  ];
  const fm = $derived(FORMS.find((x) => x.k === f32.form) ?? FORMS[1]);
  const R6 = [0, 1, 2, 3, 4, 5];
  const PAIR = ["11", "22", "33", "23", "13", "12"];
  const XYZ = ["1", "2", "3"];
  const rowLab = (i: number): string => (fm.rows === 6 ? (f32.idx === "voigt" ? String(i + 1) : PAIR[i]) : f32.idx === "voigt" ? String(i + 1) : XYZ[i]);
  const colLab = (j: number): string => (fm.cols === 6 ? (f32.idx === "voigt" ? String(j + 1) : PAIR[j]) : f32.idx === "voigt" ? String(j + 1) : XYZ[j]);
  const tiny = (v: number, M: number[][]): boolean => Math.abs(v) <= 1e-9 * Math.max(...M.flat().map(Math.abs));
  const sel = $derived.by(() => {
    let [p, q] = f32.cell;
    if (p >= fm.rows || q >= fm.cols) { p = 0; q = 0; }
    return [p, q] as [number, number];
  });
  const detail = $derived.by(() => {
    const [p, q] = sel, v = fm.M[p][q];
    if (fm.kind === "eps") return { name: `${fm.sym}<sub>${p + 1}${q + 1}</sub>`, factor: 1, comps: [[p, q]], full: v, v };
    const f = voigtFactor(fm.kind, p, q), comps = voigtCellComponents(fm.kind, p, q);
    return { name: `${fm.sym}<sub>${p + 1}${q + 1}</sub>`, factor: f, comps, full: v / f, v };
  });
  const compName = (c: number[]): string => `${fm.sym}<sub>${c.map((x) => x + 1).join("")}</sub>`;
  const formOpts = FORMS.map((x) => ({ v: x.k, t: x.t }));

  // VISUAL glyph grid geometry
  const GS = 52, G0 = 34;
  const gmax = $derived(Math.max(...fm.M.flat().map(Math.abs)));
  // full tensor view: rows = ij (9) for rank 4, i (3) for rank 3, i (3) for rank 2; cols = kl (9) or j (3)
  const fullRows = $derived(fm.kind === "eps" ? 3 : fm.rows === 6 ? 9 : 3);
  const fullCols = $derived(fm.kind === "eps" ? 3 : 9);
  const isHit = (r: number, c: number): boolean => detail.comps.some((t) => (t.length === 4 ? t[0] * 3 + t[1] === r && t[2] * 3 + t[3] === c : t.length === 3 ? t[0] === r && t[1] * 3 + t[2] === c : t[0] === r && t[1] === c));
  const FS9 = 26;
  const epsBars = [
    { k: "ε₁₁ᵀ/ε₀", meas: EPS_T_KUSHIBIKI1999.eps11, u: 0.8, calc: F.epsT[0][0] },
    { k: "ε₃₃ᵀ/ε₀", meas: EPS_T_KUSHIBIKI1999.eps33, u: 0.3, calc: F.epsT[2][2] },
  ];
  const bx = (v: number): number => 150 + ((v - 0) / 100) * 330;
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f32" id="f32">
  <div class="ph"><span>Constitutive constants, Kushibiki et al. 1999 set, all four forms</span><Seg options={[{ v: "voigt", t: "Voigt pq" }, { v: "full", t: "tensor ij,kl" }]} bind:value={f32.idx} label="Index view" /></div>
  <div class="snd-ctl"><span class="lbl">Matrix</span><Seg options={formOpts} bind:value={f32.form} label="Coefficient matrix" /></div>
  <div class="snd-g2">
    <div class="snd-cell snd-x">
      <p class="snd-cap">{@html fm.t} in {fm.unit}; click a cell</p>
      <table class="snd-mx" aria-label="Coefficient matrix"><colgroup><col class="h" />{#each R6 as j (j)}<col class="c" />{/each}</colgroup>
        <thead><tr><th></th>{#each R6 as j (j)}<th>{j < fm.cols ? colLab(j) : ""}</th>{/each}</tr></thead>
        <tbody>
          {#each R6 as i (i)}
            <tr>
              <th>{i < fm.rows ? rowLab(i) : ""}</th>
              {#each R6 as j (j)}
                {#if i < fm.rows && j < fm.cols}
                  {@const v = fm.M[i][j]}
                  {@const rel = fm.rel[`${i},${j}`]}
                  <td class:z={tiny(v, fm.M)} class:on={sel[0] === i && sel[1] === j} class:rel={!!rel} title={rel ? rel.replace(/<[^>]+>/g, "") : undefined} onclick={() => (f32.cell = [i, j])}>{tiny(v, fm.M) ? "." : ef(v, 3)}</td>
                {:else}
                  <td class="blank"></td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="snd-cell">
      <p class="snd-cap">selected Voigt cell</p>
      <dl class="snd-kv" style="border-top:0">
        <dt>cell</dt><dd>{@html detail.name}</dd>
        <dt>Voigt value</dt><dd>{ef(detail.v, 4)} {fm.unit}</dd>
        <dt>factor</dt><dd>{detail.factor === 1 ? "none (×1)" : `×${detail.factor}`}</dd>
        <dt>each component</dt><dd>{ef(detail.full, 4)} {fm.unit}</dd>
        <dt>components</dt><dd>{@html detail.comps.map(compName).join(" = ")}</dd>
        <dt>symmetry</dt><dd>{@html fm.rel[`${sel[0]},${sel[1]}`] ?? "independent or zero"}</dd>
      </dl>
    </div>
  </div>
  <div class="snd-note">c<sup>E</sup>s<sup>E</sup> = 1 · d = e s<sup>E</sup> · ε<sup>T</sup> = ε<sup>S</sup> + d e<sup>t</sup> · g = β<sup>T</sup>d · h = β<sup>S</sup>e · c<sup>D</sup> = c<sup>E</sup> + e<sup>t</sup>h · s<sup>D</sup> = s<sup>E</sup> − d<sup>t</sup>g. Factors: s carries 1, 2, 4; d and g carry 2 on shear columns; c, e, h, ε none.</div>
  <div class="pf">Kushibiki et al. 1999 c<sup>E</sup>, e, ε<sup>S</sup> <Badge code="P" pop="r:kushibiki1999" /> converted with IEEE 176 Eq. 43 <Badge code="derived" pop="m-forms" /> frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v" data-variant="visual" data-pair="f32">
  <div class="snd-card">
    <h3>{@html fm.t}: square area ∝ |value|, tone = sign; tap a cell</h3>
    <svg class="snd-vsvg" style="max-width:440px" viewBox="0 0 {G0 + 6 * GS + 4} {G0 + 6 * GS + 4}" role="img" aria-label="Glyph grid of the coefficient matrix">
      {#each R6 as j (j)}<text x={G0 + j * GS + GS / 2} y="20" text-anchor="middle">{j < fm.cols ? colLab(j) : ""}</text>{/each}
      {#each R6 as i (i)}
        <text x="16" y={G0 + i * GS + GS / 2 + 5} text-anchor="middle">{i < fm.rows ? rowLab(i) : ""}</text>
        {#each R6 as j (j)}
          {#if i < fm.rows && j < fm.cols}
            {@const v = fm.M[i][j]}
            {@const s = Math.sqrt(Math.abs(v) / gmax) * (GS - 10)}
            <g role="button" tabindex="0" aria-label="cell {i + 1}{j + 1}" style="cursor:pointer" onclick={() => (f32.cell = [i, j])} onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f32.cell = [i, j]; } }}>
              <rect x={G0 + j * GS} y={G0 + i * GS} width={GS} height={GS} fill="transparent" stroke={sel[0] === i && sel[1] === j ? "var(--v-l532)" : "var(--v-line)"} stroke-width={sel[0] === i && sel[1] === j ? 2 : 1} />
              {#if tiny(v, fm.M)}<circle cx={G0 + j * GS + GS / 2} cy={G0 + i * GS + GS / 2} r="1.5" fill="var(--v-text3)" />
              {:else}<rect x={r1(G0 + j * GS + (GS - s) / 2)} y={r1(G0 + i * GS + (GS - s) / 2)} width={r1(s)} height={r1(s)} fill={v > 0 ? "var(--v-ln)" : "var(--nb)"} fill-opacity="0.85" />{/if}
            </g>
          {/if}
        {/each}
      {/each}
    </svg>
  </div>
  <div class="snd-side">
    <div class="snd-card">
      <h3>The Voigt cell as full-tensor components</h3>
      <div class="snd-big"><span class="snd-n" style="--nw:1.6em;text-align:left">{@html detail.name}</span><small>{detail.factor === 1 ? "= 1 × component" : `= ${detail.factor} × component`}</small></div>
      <svg class="snd-vsvg" style="max-width:360px" viewBox="0 0 {30 + 9 * FS9} {24 + 9 * FS9}" role="img" aria-label="Full tensor components represented by the selected Voigt cell">
        {#each Array.from({ length: fullCols }, (_, c) => c) as c (c)}<text x={30 + c * FS9 + FS9 / 2} y="16" text-anchor="middle" style="font-size:11px">{fullCols === 9 ? `${Math.floor(c / 3) + 1}${(c % 3) + 1}` : c + 1}</text>{/each}
        {#each Array.from({ length: fullRows }, (_, r) => r) as r (r)}
          <text x="14" y={24 + r * FS9 + FS9 / 2 + 4} text-anchor="middle" style="font-size:11px">{fullRows === 9 ? `${Math.floor(r / 3) + 1}${(r % 3) + 1}` : r + 1}</text>
          {#each Array.from({ length: fullCols }, (_, c) => c) as c (c)}
            <rect x={30 + c * FS9 + 2} y={24 + r * FS9 + 2} width={FS9 - 4} height={FS9 - 4} fill={isHit(r, c) ? "var(--v-l532)" : "transparent"} stroke="var(--v-line)" />
          {/each}
        {/each}
      </svg>
      <dl class="snd-vhud">
        <dt>Voigt value</dt><dd>{ef(detail.v, 3)} {fm.unit}</dd>
        <dt>each lit component</dt><dd>{ef(detail.full, 3)} {fm.unit}</dd>
        <dt>symmetry</dt><dd>{@html fm.rel[`${sel[0]},${sel[1]}`] ?? "independent or zero"}</dd>
      </dl>
    </div>
    <div class="v-ctl"><span class="v-lab">Matrix</span><Seg visual options={formOpts} bind:value={f32.form} label="Coefficient matrix" /></div>
    <div class="v-ctl"><span class="v-lab">Labels</span><Seg visual options={[{ v: "voigt", t: "Voigt pq" }, { v: "full", t: "Tensor ij, kl" }]} bind:value={f32.idx} label="Index view" /></div>
    <div class="snd-card">
      <h3>Free permittivity: measured vs ε<sup>S</sup> + d e<sup>t</sup></h3>
      <svg class="snd-vsvg" viewBox="0 0 500 120" role="img" aria-label="Measured and computed free permittivity">
        {#each [0, 20, 40, 60, 80, 100] as t (t)}<line class="gl" x1={bx(t)} y1="10" x2={bx(t)} y2="92" /><text x={bx(t)} y="110" text-anchor="middle">{t}</text>{/each}
        {#each epsBars as b, i (i)}
          <text x="0" y={34 + i * 40} class="lbv">{b.k}</text>
          <rect x={bx(0)} y={20 + i * 40} width={r1(bx(b.calc) - bx(0))} height="10" fill="var(--v-l532)" fill-opacity="0.7" />
          <line x1={r1(bx(b.meas - b.u))} x2={r1(bx(b.meas + b.u))} y1={36 + i * 40} y2={36 + i * 40} stroke="var(--v-text)" stroke-width="2" />
          <path d="M{r1(bx(b.meas))} {31 + i * 40}v10" stroke="var(--v-text)" stroke-width="2" />
          <text x={bx(0)} y={16 + i * 40} style="font-size:12px">{uf(b.calc, 2, 2)} computed, {uf(b.meas, 2, 1)} ± {b.u} measured</text>
        {/each}
      </svg>
    </div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>Kushibiki et al. 1999 c<sup>E</sup>, e, ε<sup>S</sup>, ε<sup>T</sup> measured <Badge code="P" pop="r:kushibiki1999" /></span><span>converted with IEEE 176 Eq. 43 <Badge code="derived" pop="m-forms" /></span><span>frame <Badge code="P" pop="m-frame" text="IEEE-176-1987" /></span></div>
