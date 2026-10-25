<!-- Fig. 3.9 Follow one microwave photon (figures.md F3.9): p05 transduction model eta = eta_oc eta_o eta_m 4C/(1 +- C)^2,
     C = C0 n_c (optomech.transductionEfficiency, P05_PARAMS; reported parameters), red (beam splitter) and blue (two-mode
     squeezing) detuning, "what if" multipliers on C0 and eta_m within one decade. TECH: log-log eta vs n_c and a stage
     table. VISUAL: illustrated chip with a packet that shrinks stage by stage while Play is held. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { transductionEfficiency, internalGain, P05_PARAMS } from "$lib/physics/optomech.ts";
  import { f39 } from "$lib/stores/sound.svelte";
  import Seg from "./Seg.svelte";
  import { logS, path, r1, decades, dec } from "./plot.ts";
  import { uf, ef, sf, sp } from "./f.ts";

  const P = P05_PARAMS;
  const C0 = $derived(P.C0 * 10 ** f39.kC0);
  const etaM = $derived(P.etaM * 10 ** f39.kEtaM);
  const nc = $derived(10 ** f39.lognc);
  const res = $derived(transductionEfficiency({ etaOc: P.etaOc, etaO: P.etaO, etaM, C0, nc, detuning: f39.det }));
  const etaE = $derived(P.etaOc * P.etaO * etaM);
  // plot
  let mw = $state(0);
  const W = $derived(mw > 120 ? mw : 640);
  const H = 240, L = 52, R = 120, T = 10, B = 26;
  const sx = $derived(logS(1e2, 1e5, L, W - R));
  const sy = logS(1e-7, 1, H - B, T);
  const ns = Array.from({ length: 301 }, (_, i) => 10 ** (2 + (3 * i) / 300));
  const curve = (det: "red" | "blue"): (number | null)[] => ns.map((n) => { const r = transductionEfficiency({ etaOc: P.etaOc, etaO: P.etaO, etaM, C0, nc: n, detuning: det }); return r.unstable || !Number.isFinite(r.eta) || r.eta > 1 ? null : Math.max(1e-7, r.eta); });
  const red = $derived(path(ns, curve("red"), sx, sy));
  const blue = $derived(path(ns, curve("blue"), sx, sy));
  const nUnst = $derived(1 / C0);
  const yNow = $derived(res.unstable ? null : Math.min(1, Math.max(1e-7, res.eta)));
  const fe = (v: number): string => (Number.isFinite(v) ? ef(v, 2, false) : "  unstable");
  const ro = $derived({
    nc: ef(nc, 2, false), C: res.C >= 10 ? uf(res.C, 2, 2) : uf(res.C, 1, 3), eta: res.unstable ? "  unstable" : fe(res.eta),
    gain: res.unstable ? "     ∞ dB" : sf(10 * Math.log10(res.gain), 2, 1) + " dB", kC0: ef(C0, 2, false), kM: ef(etaM, 2, false),
    pct: res.unstable ? "phonon lasing" : uf(res.eta * 100, 2, 4) + " %",
  });
  // stages: factor and running product from one microwave photon
  const stages = $derived([
    { k: "microwave → phonon (IDT, horn, waveguide), η_m", f: etaM },
    { k: "phonon → photon in the cavity, 4C/(1 ∓ C)²", f: res.unstable ? NaN : internalGain(res.C, f39.det) },
    { k: "cavity → waveguide, η_o = κ_e/κ", f: P.etaO },
    { k: "chip → fiber, η_oc", f: P.etaOc },
  ]);
  const prods = $derived(stages.reduce<number[]>((a, s) => [...a, (a.length ? a[a.length - 1] : 1) * s.f], []));
  const dB = (v: number): string => (Number.isFinite(v) ? sp(10 * Math.log10(v), 2, 1) + " dB" : "     — dB");
  // VISUAL packet
  let play = $state(false), pos = $state(0), raf = 0;
  function startPlay(e: PointerEvent): void {
    play = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    let t0 = performance.now(); const p0 = pos;
    const step = (t: number): void => { if (!play) return; pos = (p0 + (t - t0) / 2500) % 1; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  function stopPlay(): void { play = false; cancelAnimationFrame(raf); }
  onMount(() => () => cancelAnimationFrame(raf));
  const XS = [70, 230, 370, 520, 660]; // stage boundaries along the chip
  const stageAt = $derived(Math.min(3, Math.floor(pos * 4)));
  const packetX = $derived(XS[0] + pos * (XS[4] - XS[0]));
  const packetR = $derived.by(() => { const p = stageAt === 0 ? 1 : prods[stageAt - 1]; return Math.max(2, 22 * Math.pow(Math.min(1, Number.isFinite(p) ? p : 1), 0.12)); });
  const barW = (v: number): number => (Number.isFinite(v) ? Math.max(2, Math.min(220, ((10 * Math.log10(v) + 40) / 60) * 220)) : 220);
</script>

<!-- ================= TECH ================= -->
<figure class="panel snd-fig" data-variant="tech" data-pair="f39" id="f39">
  <div class="ph"><span>Microwave-to-optical efficiency of the Jiang et al. 2020 transducer vs intracavity photon number</span><Seg options={[{ v: "red", t: "red-detuned" }, { v: "blue", t: "blue-detuned" }]} bind:value={f39.det} label="Pump detuning" /></div>
  <div class="snd-g2">
    <div class="snd-cell"><div bind:clientWidth={mw}>
      <p class="snd-cap">η vs n<sub>c</sub>; solid: red; dashed: blue (ends at C = 1)</p>
      <svg class="snd-svg snd-fixh" style="height:{H}px" viewBox="0 0 {W} {H}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Efficiency versus intracavity photon number">
        {#each decades(1e-7, 1) as y (y)}<line class="gl" x1={L} x2={W - R} y1={r1(sy(y))} y2={r1(sy(y))} /><text class="tk" x={L - 5} y={r1(sy(y) + 3)} text-anchor="end">{dec(y)}</text>{/each}
        {#each decades(1e2, 1e5) as x (x)}<text class="tk" x={r1(sx(x))} y={H - 9} text-anchor="middle">{dec(x)}</text>{/each}
        <rect class="fr" x={L} y={T} width={W - R - L} height={H - B - T} />
        <path class="c1" d={red} /><path class="c2" d={blue} />
        {#if nUnst <= 1e5 && nUnst >= 1e2}<line class="c5" x1={r1(sx(nUnst))} x2={r1(sx(nUnst))} y1={T} y2={H - B} /><text class="tk" x={r1(sx(nUnst) - 3)} y={T + 10} text-anchor="end">C = 1</text>{/if}
        <line class="cur" x1={r1(sx(nc))} x2={r1(sx(nc))} y1={T} y2={H - B} />
        {#if yNow !== null}<circle class="mko" r="3.5" cx={r1(sx(nc))} cy={r1(sy(yNow))} />{/if}
        <path class="c1" d="M{W - R + 4} {r1(sy(0.055))}h10" /><text class="tk" x={W - R + 18} y={r1(sy(0.055) + 3)}>5.5% reported</text>
        <text class="tk" x={W - R + 18} y={r1(sy(0.055) + 15)}>blue, G ≈ 21 dB</text>
        <path class="c1" d="M{W - R + 4} {r1(sy(1e-5))}h10" /><text class="tk" x={W - R + 18} y={r1(sy(1e-5) + 3)}>1e-5 reported</text>
        <text class="tk" x={W - R + 18} y={r1(sy(1e-5) + 15)}>red, 3.3 µW</text>
      </svg>
    </div></div>
    <div class="snd-cell">
      <table class="idx snd-tab snd-stg">
        <thead><tr><th>Stage</th><th class="r">factor</th><th class="r">running</th></tr></thead>
        <tbody>{#each stages as s, i (i)}<tr><td>{s.k}</td><td class="num">{dB(s.f)}</td><td class="num">{dB(prods[i])}</td></tr>{/each}</tbody>
      </table>
      <dl class="snd-kv" style="border-top:0;padding:4px 0">
        <dt>n<sub>c</sub></dt><dd>{ro.nc}</dd>
        <dt>C = C₀n<sub>c</sub></dt><dd>{ro.C}</dd>
        <dt>internal gain</dt><dd>{ro.gain}</dd>
        <dt>η total</dt><dd>{ro.eta}</dd>
        <dt>C₀ (what if)</dt><dd>{ro.kC0}</dd>
        <dt>η_m (what if)</dt><dd>{ro.kM}</dd>
      </dl>
    </div>
  </div>
  <div class="ctl"><label for="f39-n">Intracavity photons n<sub>c</sub></label><input id="f39-n" type="range" min="2" max="5" step="0.01" bind:value={f39.lognc} /><output for="f39-n">{ro.nc}</output></div>
  <div class="ctl"><label for="f39-c">What if: C₀ × 10^k</label><input id="f39-c" type="range" min="-1" max="1" step="0.05" bind:value={f39.kC0} /><output for="f39-c">{ro.kC0}</output></div>
  <div class="ctl"><label for="f39-m">What if: η_m × 10^k</label><input id="f39-m" type="range" min="-1" max="1" step="0.05" bind:value={f39.kEtaM} /><output for="f39-m">{ro.kM}</output></div>
  <div class="snd-note">The reported 5.5% is the highest stable efficiency in the linear regime, reached by reducing the detuning with the pump near 300 µW; it is marked at its value, not as a point on the n<sub>c</sub> axis. η_oc η_o η_m = 4.26×10⁻⁴ vs fitted η_e = 4.24×10⁻⁴.</div>
  <div class="pf">Jiang et al. 2020, Nat. Commun. 11, 1166 (2020), CC BY 4.0 <Badge code="reported" pop="r:p05" /> model <Badge code="derived" pop="m-om" /></div>
</figure>

<!-- ================= VISUAL ================= -->
<div class="snd-v wide" data-variant="visual" data-pair="f39">
  <div class="snd-card">
    <h3>Suspended LN chip: IDT, horn, waveguide, optomechanical cavity, fiber</h3>
    <svg class="snd-vsvg" viewBox="0 0 760 210" role="img" aria-label="Signal chain from microwave to optical fiber with a packet that shrinks at each stage">
      <rect x="20" y="40" width="720" height="130" class="lnf" />
      <!-- IDT -->
      {#each Array.from({ length: 7 }, (_, i) => i) as i (i)}<rect x={40 + i * 8} y={i % 2 ? 70 : 80} width="4" height="60" class="auf" />{/each}
      <rect x="36" y="64" width="60" height="6" class="auf" /><rect x="36" y="140" width="60" height="6" class="auf" />
      <path d="M100 75 L230 98 L230 112 L100 135 Z" fill="var(--v-ln)" fill-opacity="0.25" stroke="var(--v-ln)" stroke-opacity="0.6" />
      <rect x="230" y="98" width="140" height="14" fill="var(--v-ln)" fill-opacity="0.35" />
      <rect x="370" y="96" width="150" height="18" fill="var(--v-ln)" fill-opacity="0.45" />
      {#each Array.from({ length: 12 }, (_, i) => i) as i (i)}<circle cx={378 + i * 12} cy="105" r={i > 3 && i < 8 ? 3 : 4} fill="var(--v-ink0)" />{/each}
      <path class="ir" d="M520 105H700" /><path class="ir" d="M700 105 L740 105" />
      <text x="40" y="190">IDT</text><text x="140" y="190">horn</text><text x="250" y="190">waveguide 1.3 µm</text><text x="390" y="190">optomechanical cavity</text><text x="600" y="190">to fiber, 1550 nm</text>
      <circle cx={r1(packetX)} cy="105" r={r1(packetR)} fill={stageAt >= 2 ? "var(--v-ir1550)" : "var(--v-l532)"} fill-opacity="0.55" stroke={stageAt >= 2 ? "var(--v-ir1550)" : "var(--v-l532)"} stroke-dasharray={stageAt >= 2 ? "4 3" : "none"} />
    </svg>
    <div class="snd-legend"><span><i style="background:var(--v-au)"></i>electrodes</span><span><i style="background:var(--v-l532)"></i>phonon packet</span><span><i style="background:var(--v-ir1550)"></i>1550 nm light, false color, dashed</span><span>packet radius ∝ (surviving fraction)<sup>0.12</sup></span></div>
  </div>
  <div class="snd-row3">
    <div class="snd-card">
      <h3>Stage factors, dB (bars from −40 to +20 dB)</h3>
      <svg class="snd-vsvg" viewBox="0 0 520 170" role="img" aria-label="Stage factors in dB">
        {#each stages as s, i (i)}
          <text x="0" y={22 + i * 40}>{["microwave → phonon", "cavity, 4C/(1 ∓ C)²", "cavity → waveguide", "chip → fiber"][i]}</text>
          <rect x="200" y={10 + i * 40} width={r1(barW(s.f))} height="16" fill={i === 1 ? "var(--v-l532)" : "var(--v-au)"} fill-opacity="0.75" />
          <text x="430" y={23 + i * 40} class="lbv">{dB(s.f)}</text>
        {/each}
      </svg>
      <dl class="snd-vhud"><dt>end-to-end efficiency</dt><dd>{ro.pct}</dd><dt>cooperativity C</dt><dd>{ro.C}</dd></dl>
    </div>
    <div class="snd-vctl">
      <div class="v-ctl" style="--w:10ch"><label for="f39v-n">Pump: intracavity photons</label><output for="f39v-n">{ro.nc}</output><input id="f39v-n" type="range" min="2" max="5" step="0.01" bind:value={f39.lognc} /></div>
      <div class="v-ctl"><span class="v-lab">Pump detuning</span><Seg visual options={[{ v: "red", t: "Red" }, { v: "blue", t: "Blue" }]} bind:value={f39.det} label="Pump detuning" /></div>
      <div class="v-ctl" style="--w:10ch"><label for="f39v-c">What if: C₀</label><output for="f39v-c">{ro.kC0}</output><input id="f39v-c" type="range" min="-1" max="1" step="0.05" bind:value={f39.kC0} /></div>
      <div class="v-ctl" style="--w:10ch"><label for="f39v-m">What if: η_m</label><output for="f39v-m">{ro.kM}</output><input id="f39v-m" type="range" min="-1" max="1" step="0.05" bind:value={f39.kEtaM} /></div>
      <div><button type="button" class="snd-hold" class:on={play} onpointerdown={startPlay} onpointerup={stopPlay} onpointercancel={stopPlay} onpointerleave={stopPlay} aria-pressed={play}>Hold to send a packet</button></div>
    </div>
  </div>
</div>
<div class="v-prov" data-variant="visual"><span>Jiang et al. 2020, CC BY 4.0 <Badge code="reported" pop="r:p05" /></span><span>model <Badge code="derived" pop="m-om" /></span><span>drawing schematic, not to scale</span><span>reported 5.5%: highest stable efficiency in the linear regime (blue, detuning reduced, pump near 300 µW, internal gain ≈ 21 dB), not a point of this curve</span><span>η_oc η_o η_m = 4.26×10⁻⁴ vs fitted η_e = 4.24×10⁻⁴</span></div>
