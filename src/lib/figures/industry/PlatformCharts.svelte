<!-- F8.05 Platform comparison: tabbed charts B1-B6 (chart-specs sec. 2) in one reserved box. Rendered twice (TECH, VISUAL)
     from shared state (stores/industry.svelte.ts); geometry follows the measured box, so the box never resizes. TECH:
     monochrome, shape per platform, mono tab strip. VISUAL: same shapes plus platform color, 44 px controls, B4 as an Isotype
     row of wafer glyphs, B6 with a to-scale 10 mm electrode ruler, B1 replay 2017-2026. -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { plat8 as S } from "$lib/stores/industry.svelte";
  import { scale, logTicks, linTicks, fmtTick } from "./plot";
  import { registerPops, getPop, type Pop } from "$lib/content/pops";
  import Stamp from "./Stamp.svelte";

  interface B1P { id: string; p: string; x: number; y: number; gt: boolean; pp: boolean; tel: boolean; des: boolean; yr: number }
  interface B2P { id: string; p: string; yr: number; baud: number | null; line: number | null; net: number | null; coh: boolean }
  interface B4 { total: number; stated: number; nanoln: number; other: { paper_id: string; supplier: string; plat: string }[]; tfln: [number, number]; tflt: [number, number]; papers: { paper_id: string; nanoln: boolean; plat: string }[] }
  let { v, b1, b2, b3, b4, b5, b6, pa }: {
    v: boolean; b1: B1P[]; b2: B2P[]; b3: Record<string, Record<string, [number, number]>>; b4: B4;
    b5: Record<string, Record<string, number>>; b6: Record<string, { pts: { id: string; L: number }[]; med: number | null }>; pa: { n: number; orgs: string[] };
  } = $props();

  const PL = ["TFLN", "TFLT", "SiPh", "InP", "BTO", "Polymer", "Other"];
  const TABS: [typeof S.tab, string][] = [["B1", "VπL vs bandwidth"], ["B2", "Symbol and line rate"], ["B3", "Papers per year"], ["B4", "Wafer suppliers"], ["B5", "Integration"], ["B6", "Footprint"]];
  let rw = $state(0), rh = $state(0);
  const w = $derived(rw > 200 ? rw : v ? 1260 : 1120), h = $derived(rh > 150 ? rh : v ? 400 : 330);
  const narrow = $derived(w < 600);
  const r = $derived(v ? (narrow ? 4.5 : 6) : narrow ? 3.5 : 4.5);
  const M = $derived({ l: v ? (narrow ? 44 : 64) : narrow ? 36 : 48, r: 14, t: 12, b: v ? 40 : 30 });

  function mk(p: string, x: number, y: number, s: number): string {
    const f = (n: number): string => n.toFixed(1);
    switch (p) {
      case "TFLN": case "TFLT": return `M${f(x)} ${f(y - s)}l${f(s)} ${f(s)}l${f(-s)} ${f(s)}l${f(-s)} ${f(-s)}Z`;
      case "SiPh": return `M${f(x - 0.8 * s)} ${f(y - 0.8 * s)}h${f(1.6 * s)}v${f(1.6 * s)}h${f(-1.6 * s)}Z`;
      case "InP": return `M${f(x)} ${f(y - s)}L${f(x + s)} ${f(y + 0.8 * s)}L${f(x - s)} ${f(y + 0.8 * s)}Z`;
      case "BTO": return `M${f(x - s)} ${f(y)}a${f(s)} ${f(s)} 0 1 0 ${f(2 * s)} 0a${f(s)} ${f(s)} 0 1 0 ${f(-2 * s)} 0`;
      case "Polymer": return `M${f(x - s)} ${f(y - s)}L${f(x + s)} ${f(y + s)}M${f(x + s)} ${f(y - s)}L${f(x - s)} ${f(y + s)}`;
      default: return `M${f(x - s)} ${f(y)}H${f(x + s)}M${f(x)} ${f(y - s)}V${f(y + s)}`;
    }
  }
  const toggle = (p: string): void => { S.hidden = S.hidden.includes(p) ? S.hidden.filter((x) => x !== p) : [...S.hidden, p]; };

  // ---- B1 ----
  const b1v = $derived(b1.filter((q) => (S.allBands || q.tel) && (S.allConv || q.pp) && (S.design || !q.des)));
  const offAxis = $derived(b1v.filter((q) => q.x < 1 || q.x > 400 || q.y < 0.01 || q.y > 100).length);
  // overlapping B1 markers (centres within one marker size) share one popup on the top marker, listing every device
  const b1key = $derived.by(() => {
    const groups: { x: number; y: number; ids: string[] }[] = [];
    for (const q of b1v) {
      if (q.yr > S.year || S.hidden.includes(q.p)) continue;
      const x = X1(q.x), y = Y1(q.y);
      const g = groups.find((o) => Math.abs(o.x - x) < r * 1.6 && Math.abs(o.y - y) < r * 1.6);
      if (g) g.ids.push(q.id); else groups.push({ x, y, ids: [q.id] });
    }
    const key: Record<string, string> = {};
    for (const g of groups) if (g.ids.length > 1) key[g.ids[g.ids.length - 1]] = `a:${g.ids.join("|")}`;
    return key;
  });
  $effect(() => {
    const entries: Record<string, Pop> = {};
    for (const k of Object.values(b1key)) {
      const ids = k.slice(2).split("|");
      // body evaluated when the popup opens (the single-device entries are registered by the page)
      entries[k] = { h: `${ids.length} devices at this position`, body: () => ids.map((id) => getPop(`a:${id}`)).filter((x): x is Pop => !!x)
        .map((p) => `<div class='i8-ps'><b>${p.h}</b><br>${typeof p.body === "function" ? p.body() : p.body ?? ""}<br>${p.src ?? ""}</div>`).join("") };
    }
    return registerPops(entries);
  });
  const b1c = $derived(Object.fromEntries(PL.map((p) => [p, b1v.filter((q) => q.p === p).length])));
  const X1 = $derived(scale([1, 400], [M.l, w - M.r], true)), Y1 = $derived(scale([0.01, 100], [h - M.b, M.t], true));
  // ---- B2 ----
  const b2v = $derived(b2.filter((q) => q[mkey()] !== null && (S.scheme === "all" || (S.scheme === "coh") === q.coh)));
  function mkey(): "baud" | "line" | "net" { return S.metric === "max_baud_gbd" ? "baud" : S.metric === "max_line_rate_gbps" ? "line" : "net"; }
  const ymax2 = $derived(S.metric === "max_baud_gbd" ? 300 : 2200);
  const X2 = $derived(scale([2015.5, 2026.6], [M.l, w - M.r])), Y2 = $derived(S.log ? scale([S.metric === "max_baud_gbd" ? 1 : 1, ymax2 * 1.2], [h - M.b, M.t], true) : scale([0, ymax2], [h - M.b, M.t]));
  const max2 = $derived(PL.map((p) => {
    const by = new Map<number, number>();
    for (const q of b2v) if (q.p === p) { const val = q[mkey()] as number; if (val > (by.get(q.yr) ?? -1)) by.set(q.yr, val); }
    return [p, [...by].sort((a, b) => a[0] - b[0])] as [string, [number, number][]];
  }));
  const stepD = (s: [number, number][]): string => s.map(([yr, val], i) => (i && s[i - 1][0] === yr - 1 ? `V${Y2(val).toFixed(1)}H${X2(yr + 0.5).toFixed(1)}` : `M${X2(yr - 0.5).toFixed(1)} ${Y2(val).toFixed(1)}H${X2(yr + 0.5).toFixed(1)}`)).join("");
  const ANN: Record<string, [string, "baud" | "line" | "net"]> = { "xu2026b-a": ["TFLT 768 Gb/s line", "line"], "starnault2026-a": ["TFLN 225 GBd PAM4", "baud"], "xu2022-a": ["TFLN 1,960 Gb/s net, coherent", "net"] };
  const jit = (id: string): number => { let k = 0; for (const c of id) k = (k * 31 + c.charCodeAt(0)) % 997; return (k / 997 - 0.5) * 0.55; };
  // ---- B3 ----
  const ymax3 = $derived(Math.max(...PL.flatMap((p) => Object.values(b3[p] ?? {}).map((x) => x[0]))));
  const cols3 = $derived(narrow ? 2 : 4);
  const b4bars = $derived<[string, number, [number, string][]][]>([
    ["All papers", b4.total, [[b4.nanoln, "NanoLN"], [b4.other.length, "other stated"], [b4.total - b4.stated, "not stated"]]],
    ["Supplier stated", b4.stated, [[b4.nanoln, "NanoLN"], [b4.other.length, "other"]]],
  ]);
  // ---- B5 ----
  const S5: [string, string][] = [["monolithic", "monolithic"], ["bonded_heterogeneous", "bonded"], ["micro_transfer_printed", "transfer printed"], ["foundry_native", "foundry native"], ["loaded", "loaded waveguide"], ["o_band", "O band"]];
  const yrs5 = $derived(Object.keys(b5).map(Number).sort());
  const lab5y = $derived.by(() => {
    const last = yrs5[yrs5.length - 1];
    const ys = S5.map(([k], i) => ({ i, y: Y5(b5[last]?.[k] ?? 0) + 3 })).sort((a, b) => a.y - b.y);
    for (let j = 1; j < ys.length; j++) if (ys[j].y - ys[j - 1].y < 12) ys[j].y = ys[j - 1].y + 12;
    return Object.fromEntries(ys.map((o) => [o.i, o.y])) as Record<number, number>;
  });
  const X5 = $derived(scale([2016.5, 2026.5], [M.l, w - M.r - (narrow ? 4 : 110)])), Y5 = $derived(scale([0, 40], [h - M.b, M.t]));
  // ---- B6 ----
  const X6 = $derived(scale([0.05, 50], [M.l + (narrow ? 30 : 40), w - M.r], true));

  let timer = 0;
  function play(): void {
    if (S.playing) { clearInterval(timer); S.playing = false; return; }
    S.playing = true; S.year = 2017;
    timer = window.setInterval(() => { if (S.year >= 2026) { clearInterval(timer); S.playing = false; } else S.year += 1; }, 600);
  }
  onDestroy(() => { clearInterval(timer); S.playing = false; });
  const seg = $derived(v ? "v-seg" : "seg");
</script>

<div class="i8-pc" class:v>
  <div class={v ? "v-seg i8-tabs" : "seg i8-tabs"} role="tablist" aria-label="Chart">
    {#each TABS as [k, lv] (k)}<button type="button" role="tab" aria-selected={S.tab === k} class:on={S.tab === k} onclick={() => (S.tab = k)}>{lv}</button>{/each}
  </div>
  <div class="i8-box">
    <div class="i8-ctl">
      {#if S.tab === "B1"}
        <label class="i8-yr"><span class="lbl">Year &le;</span><input type="range" min="2017" max="2026" step="1" bind:value={S.year} aria-valuetext="through {S.year}"><output class="i8-num">{S.year}</output></label>
        {#if v}<button type="button" class="i8-play" onclick={play} aria-pressed={S.playing}>{S.playing ? "Stop" : "Replay 2017-2026"}</button>{/if}
        <div class={seg} role="group" aria-label="Rows"><button type="button" class:on={S.allBands} onclick={() => (S.allBands = !S.allBands)}>all bands</button><button type="button" class:on={S.allConv} onclick={() => (S.allConv = !S.allConv)}>all conventions</button><button type="button" class:on={S.design} onclick={() => (S.design = !S.design)}>design rows</button></div>
      {:else if S.tab === "B2"}
        <div class={seg} role="group" aria-label="Metric"><button type="button" class:on={S.metric === "max_baud_gbd"} onclick={() => (S.metric = "max_baud_gbd")}>symbol rate</button><button type="button" class:on={S.metric === "max_line_rate_gbps"} onclick={() => (S.metric = "max_line_rate_gbps")}>line rate</button><button type="button" class:on={S.metric === "max_net_rate_gbps"} onclick={() => (S.metric = "max_net_rate_gbps")}>net rate</button></div>
        <div class={seg} role="group" aria-label="Scheme"><button type="button" class:on={S.scheme === "all"} onclick={() => (S.scheme = "all")}>all</button><button type="button" class:on={S.scheme === "imdd"} onclick={() => (S.scheme = "imdd")}>IM/DD</button><button type="button" class:on={S.scheme === "coh"} onclick={() => (S.scheme = "coh")}>coherent</button></div>
        <div class={seg} role="group" aria-label="Y axis"><button type="button" class:on={!S.log} onclick={() => (S.log = false)}>linear</button><button type="button" class:on={S.log} onclick={() => (S.log = true)}>log</button></div>
      {:else if S.tab === "B3"}
        <div class={seg} role="group" aria-label="OFC 2026 papers"><button type="button" class:on={!S.exclOFC} onclick={() => (S.exclOFC = false)}>with OFC 2026 ingestion</button><button type="button" class:on={S.exclOFC} onclick={() => (S.exclOFC = true)}>without</button></div>
      {:else}
        <span class="i8-ctl-note">{S.tab === "B4" ? `Papers with at least one TFLN or TFLT row: ${b4.total}` : S.tab === "B5" ? "TFLN and TFLT papers per year; a paper can count in several series" : "Telecom MZM and IQ device rows; electrode length per arm"}</span>
      {/if}
    </div>
    <div class="i8-plot" bind:clientWidth={rw} bind:clientHeight={rh}>
      <svg width={w} height={h} viewBox="0 0 {w} {h}" role="img" aria-label={TABS.find((t) => t[0] === S.tab)?.[1]}>
        <defs><clipPath id="i8clip-{v ? 'v' : 't'}"><rect x={M.l - 8} y={M.t - 8} width={w - M.l - M.r + 16} height={h - M.t - M.b + 16} /></clipPath></defs>
        {#if S.tab === "B1"}
          {#each logTicks(1, 400, !narrow) as t (t)}<line class="gl" x1={X1(t)} x2={X1(t)} y1={M.t} y2={h - M.b} /><text class="tk" x={X1(t)} y={h - M.b + 14} text-anchor="middle">{fmtTick(t)}</text>{/each}
          {#each logTicks(0.01, 100) as t (t)}<line class="gl" x1={M.l} x2={w - M.r} y1={Y1(t)} y2={Y1(t)} /><text class="tk" x={M.l - 5} y={Y1(t) + 3.5} text-anchor="end">{fmtTick(t)}</text>{/each}
          <text class="al" x={w - M.r} y={h - 4} text-anchor="end">3 dB bandwidth (GHz)</text><text class="al" x={M.l} y={M.t - 2}>V&pi;L (V cm)</text>
          <g clip-path="url(#i8clip-{v ? 'v' : 't'})">
          {#each b1v.filter((q) => q.x >= 1 && q.x <= 400 && q.y >= 0.01 && q.y <= 100) as q (q.id)}
            {@const cx = X1(q.x)}
            {@const cy = Y1(q.y)}
            <g class="m {q.p}" class:hollow={!q.pp || q.des} class:off={q.yr > S.year || S.hidden.includes(q.p)} data-pop={b1key[q.id] ?? `a:${q.id}`}>
              {#if q.gt}<path class="arr" d="M{cx.toFixed(1)} {cy.toFixed(1)}h{v ? 16 : 12}m-4 -3l4 3l-4 3" />{/if}
              <path d={q.des ? mk("Polymer", cx, cy, r * 0.8) : mk(q.p, cx, cy, r)} />
            </g>
          {/each}
          </g>
        {:else if S.tab === "B2"}
          {#each linTicks(2016, 2026, narrow ? 2 : 1) as t (t)}<text class="tk" x={X2(t)} y={h - M.b + 14} text-anchor="middle">{t}</text>{/each}
          {#each S.log ? logTicks(1, ymax2 * 1.2) : linTicks(0, ymax2, S.metric === "max_baud_gbd" ? 50 : 500) as t (t)}<line class="gl" x1={M.l} x2={w - M.r} y1={Y2(t)} y2={Y2(t)} /><text class="tk" x={M.l - 5} y={Y2(t) + 3.5} text-anchor="end">{fmtTick(t)}</text>{/each}
          <text class="al" x={M.l} y={M.t - 2}>{S.metric === "max_baud_gbd" ? "GBd" : "Gb/s"}</text>
          {#each max2 as [p, s] (p)}{#if s.length}<path class="st {p}" class:fg={p === "TFLN" || p === "TFLT"} class:off={S.hidden.includes(p)} d={stepD(s)} />{/if}{/each}
          {#each b2v as q (q.id)}
            {@const cx = X2(q.yr + jit(q.id))}
            {@const cy = Y2(q[mkey()] as number)}
            <g class="m {q.p}" class:dimp={q.p !== "TFLN" && q.p !== "TFLT"} class:off={S.hidden.includes(q.p)} data-pop="a:{q.id}"><path d={mk(q.p, cx, cy, r * 0.8)} /></g>
            {#if ANN[q.id] && ANN[q.id][1] === mkey() && !narrow}<text class="ann" x={cx - 8} y={cy - 8} text-anchor="end">{ANN[q.id][0]}</text>{/if}
          {/each}
        {:else if S.tab === "B3"}
          {@const pw = (w - 8) / cols3}
          {@const rows = Math.ceil(PL.length / cols3)}
          {@const ph = h / rows}
          {#each PL as p, i (p)}
            {@const ox = (i % cols3) * pw}
            {@const oy = Math.floor(i / cols3) * ph}
            {@const bw = (pw - 30) / 10}
            <g transform="translate({ox.toFixed(1)} {oy.toFixed(1)})">
              <text class="pt3" x="24" y="13">{p}</text>
              <line class="gl" x1="24" x2={pw - 6} y1={ph - 16} y2={ph - 16} />
              {#each Array.from({ length: 10 }, (_, k) => 2017 + k) as yr (yr)}
                {@const c = b3[p]?.[yr] ?? [0, 0]}
                {@const n = S.exclOFC ? c[1] : c[0]}
                {@const bh = (n / ymax3) * (ph - 36)}
                {@const x0 = 24 + (yr - 2017) * bw}
                <rect class="b3r {p}" x={(x0 + 1).toFixed(1)} y={(ph - 16 - bh).toFixed(1)} width={(bw - 2).toFixed(1)} height={bh.toFixed(1)} />
                {#if !S.exclOFC && c[0] > c[1]}<rect class="ofc" x={(x0 + 1).toFixed(1)} y={(ph - 16 - bh).toFixed(1)} width={(bw - 2).toFixed(1)} height={(((c[0] - c[1]) / ymax3) * (ph - 36)).toFixed(1)} />{/if}
                {#if n}<text class="n3" x={(x0 + bw / 2).toFixed(1)} y={(ph - 19 - bh).toFixed(1)} text-anchor="middle">{n}</text>{/if}
              {/each}
              <text class="tk" x="24" y={ph - 4}>2017</text><text class="tk" x={pw - 6} y={ph - 4} text-anchor="end">2026</text>
            </g>
          {/each}
        {:else if S.tab === "B4"}
          {#if v}
            {@const per = narrow ? 8 : 14}
            {@const gs = Math.min((w - 40) / per, narrow ? 34 : 54)}
            {#each b4.papers as q, i (q.paper_id)}
              {@const cx = 20 + (i % per) * gs + gs / 2}
              {@const cy = 24 + Math.floor(i / per) * gs + gs / 2}
              <g class="wg" class:nano={q.nanoln} class:tflt={q.plat === "TFLT"}><circle cx={cx} cy={cy} r={gs * 0.38} /><line x1={cx - gs * 0.24} x2={cx + gs * 0.24} y1={cy + gs * 0.3} y2={cy + gs * 0.3} /></g>
            {/each}
            <text class="al" x="20" y="14">One glyph per paper that names its wafer supplier ({b4.stated}); filled = NanoLN ({b4.nanoln}); ring color = TFLT</text>
          {:else}
            {@const bx = narrow ? 110 : 160}
            {@const bwid = w - bx - 20}
            {#each b4bars as [lab, tot, parts], k (lab)}
              {@const y0 = 20 + k * 70}
              <text class="tk" x="0" y={y0 + 14}>{lab} ({tot})</text>
              {#each parts as [n, pl], j (pl)}
                {@const x0 = bx + (parts.slice(0, j).reduce((a, b) => a + b[0], 0) / tot) * bwid}
                <rect class="seg4 s{j}" x={x0} y={y0} width={(n / tot) * bwid} height="20" />
              {/each}
              <text class="tk" x={bx} y={y0 + 34}>{parts.map(([n, pl]) => `${pl} ${n}`).join("  |  ")}</text>
            {/each}
            {#each b4.other as o, i (o.paper_id)}<text class="tk" x="0" y={170 + i * 14}>{o.paper_id} ({o.plat}): {o.supplier.length > (narrow ? 44 : 120) ? o.supplier.slice(0, narrow ? 43 : 119) + "…" : o.supplier}</text>{/each}
          {/if}
        {:else if S.tab === "B5"}
          {#each linTicks(0, 40, 10) as t (t)}<line class="gl" x1={M.l} x2={X5(2026.5)} y1={Y5(t)} y2={Y5(t)} /><text class="tk" x={M.l - 5} y={Y5(t) + 3.5} text-anchor="end">{t}</text>{/each}
          {#each yrs5 as yr (yr)}<rect class="tot" x={X5(yr - 0.35)} y={Y5(b5[yr].total)} width={X5(yr + 0.35) - X5(yr - 0.35)} height={Y5(0) - Y5(b5[yr].total)} /><text class="tk" x={X5(yr)} y={h - M.b + 14} text-anchor="middle">{narrow ? String(yr).slice(2) : yr}</text>{/each}
          {#each S5 as [k, lab], i (k)}
            <path class="ln5 l{i}" d={yrs5.map((yr, j) => `${j ? "L" : "M"}${X5(yr).toFixed(1)} ${Y5(b5[yr][k] ?? 0).toFixed(1)}`).join("")} />
            {#each yrs5 as yr (yr)}<path class="pt5 l{i}" d={mk("BTO", X5(yr), Y5(b5[yr][k] ?? 0), 2.5)} />{/each}
            {#if !narrow}<text class="lab5 l{i}" x={X5(2026.5) + 8} y={lab5y[i]}>{lab} {b5[2026][k]}</text>{/if}
          {/each}
          <text class="al" x={M.l} y={M.t - 2}>papers</text>
        {:else}
          {@const rowH = (h - M.b - (v ? 104 : 10)) / 6}
          {#each logTicks(0.05, 50, !narrow) as t (t)}<line class="gl" x1={X6(t)} x2={X6(t)} y1={M.t} y2={M.t + rowH * 6} /><text class="tk" x={X6(t)} y={M.t + rowH * 6 + 13} text-anchor="middle">{fmtTick(t)}</text>{/each}
          <text class="al" x={w - M.r} y={M.t + rowH * 6 + 26} text-anchor="end">electrode length per arm (mm)</text>
          {#each ["TFLN", "TFLT", "SiPh", "InP", "BTO", "Polymer"] as p, i (p)}
            {@const cy = M.t + rowH * (i + 0.5)}
            <text class="tk" x="0" y={cy + 3.5}>{p}</text>
            {#each b6[p]?.pts ?? [] as q (q.id)}<g class="m {p}" data-pop="a:{q.id}"><path d={mk(p, X6(q.L), cy + jit(q.id) * rowH * 0.9, r * 0.7)} /></g>{/each}
            {#if b6[p]?.med}<line class="med" x1={X6(b6[p].med as number)} x2={X6(b6[p].med as number)} y1={cy - rowH * 0.45} y2={cy + rowH * 0.45} /><text class="medt" x={X6(b6[p].med as number) + 4} y={cy - rowH * 0.3}>{+(b6[p].med as number).toFixed(2)}</text>{/if}
          {/each}
          {#if v}
            {@const ry = M.t + rowH * 6 + 44}
            {@const k = (w - M.l - 90) / 10}
            <line class="ruler" x1={M.l} x2={M.l + 10 * k} y1={ry} y2={ry} />
            {#each Array.from({ length: 11 }, (_, i) => i) as i (i)}<line class="ruler" x1={M.l + i * k} x2={M.l + i * k} y1={ry - (i % 5 ? 3 : 6)} y2={ry} />{/each}
            <text class="tk" x={M.l + 10 * k + 6} y={ry + 4}>10 mm</text>
            {#each ["TFLN", "TFLT", "InP", "BTO", "SiPh", "Polymer"] as p, i (p)}<rect class="el {p}" x={M.l} y={ry + 4 + i * 8} width={(b6[p]?.med ?? 0) * k} height="5" /><text class="tk" x={M.l + (b6[p]?.med ?? 0) * k + 5} y={ry + 9.5 + i * 8} style="font-size:10px">{p}</text>{/each}
          {/if}
        {/if}
      </svg>
    </div>
    <div class="i8-foot">
      <div class="i8-leg" role="group" aria-label="Platforms">
      {#if S.tab === "B1" || S.tab === "B2"}
          {#each PL as p (p)}
            {@const n = S.tab === "B1" ? b1c[p] : b2v.filter((q) => q.p === p).length}
            <button type="button" class="i8-lg" class:off={S.hidden.includes(p)} onclick={() => toggle(p)} aria-pressed={!S.hidden.includes(p)}><svg width="12" height="12" viewBox="-6 -6 12 12"><g class="m {p}"><path d={mk(p, 0, 0, 4.5)} /></g></svg>{p} <span class="i8-num">{String(n).padStart(3, "\u2007")}</span></button>
          {/each}
          {#if S.tab === "B1" && b1c.SiPh === 0}<span class="i8-ctl-note">SiPh: 0 rows with push-pull V&pi;L</span>{/if}
      {/if}
      </div>
      <div class="i8-cav">
        {#if S.tab === "B1"}{offAxis ? `${offAxis} row${offAxis > 1 ? "s" : ""} outside the axes (counted, not drawn). ` : ""}Hollow: convention other than push-pull; arrows: bandwidth lower bound; points enter at their year. Defaults: telecom bands, MZM and IQ device rows, push-pull V&pi;L.
        {:else if S.tab === "B2"}Maximum per year in the atlas sample; line rates mix IM/DD and coherent; single demonstrations. Steps: yearly maximum per platform.
        {:else if S.tab === "B3"}Atlas coverage, not field output: curated sample of 233 papers. Hatched: papers ingested from the OFC 2026 corpus.
        {:else if S.tab === "B4"}Match: supplier text contains "nanoln" or "jingzheng". TFLN {b4.tfln[0]} of {b4.tfln[1]}, TFLT {b4.tflt[0]} of {b4.tflt[1]}. Cross-check: photonics-atlas, category A2.1 LNOI, {pa.n} usage records, all {pa.orgs.length === 1 ? "Jinan Jingzheng" : pa.orgs.join(", ")}; same upstream papers, not an independent sample.
        {:else if S.tab === "B5"}Distinct papers per year with at least one TFLN/TFLT row of each kind; outline bars: all such papers.
        {:else}Median tick and value per platform; log length axis.{/if}
      </div>
    </div>
  </div>
  <Stamp pa={true} />
</div>

<style>
  .i8-pc { --bh: 470px; }
  .i8-tabs { margin-bottom: 6px; flex-wrap: wrap; }
  .i8-tabs button { padding: 4px 9px; }
  .i8-box { height: var(--bh); display: grid; grid-template-rows: 34px minmax(0, 1fr) 64px; border: 1px solid var(--rule2); background: var(--bg); box-shadow: 3px 3px 0 var(--shadow); }
  .i8-ctl { display: flex; align-items: center; gap: 10px; padding: 0 8px; border-bottom: 1px solid var(--rule); overflow: hidden; }
  .i8-ctl .seg button { padding: 3px 7px; }
  .i8-yr { display: flex; align-items: center; gap: 6px; min-width: 210px; white-space: nowrap; }
  .i8-yr input { width: 120px; }
  .i8-yr output { display: inline-block; width: 4ch; text-align: right; font-variant-numeric: tabular-nums; }
  .i8-ctl-note { font: 400 11px/16px var(--mono); color: var(--fg3); }
  .i8-plot { position: relative; min-height: 0; overflow: hidden; }
  .i8-plot svg { position: absolute; inset: 0; display: block; }
  .i8-foot { display: grid; grid-template-rows: auto minmax(0, 1fr); border-top: 1px solid var(--rule); padding: 3px 8px; overflow: hidden; }
  .i8-leg { display: flex; flex-wrap: wrap; gap: 2px 6px; align-items: center; align-content: flex-start; height: 20px; overflow: hidden; }
  .i8-lg { display: inline-flex; align-items: center; gap: 4px; padding: 0 4px; background: none; border: 1px solid transparent; color: var(--fg2); font: 400 10.5px/18px var(--mono); cursor: pointer; }
  .i8-lg:hover { border-color: var(--rule2); }
  .i8-lg.off { opacity: 0.35; }
  .i8-lg:focus-visible { outline: 1px solid var(--fg); }
  .i8-cav { min-height: 0; overflow: hidden; font: 400 10.5px/15px var(--mono); color: var(--fg3); }
  .gl { stroke: var(--rule); }
  .tk { font: 400 10px var(--mono); fill: var(--fg3); }
  .al { font: 400 10px var(--mono); fill: var(--fg2); }
  .m path { stroke: var(--fg2); stroke-width: 1; fill: none; }
  .m.TFLN path { fill: var(--fg); stroke: var(--fg); }
  .m.TFLT path { stroke: var(--fg); }
  .m.hollow path { fill: none; }
  .m .arr { stroke: var(--fg3); fill: none; }
  .m { cursor: help; transition: opacity 240ms; }
  .m path { pointer-events: all; } /* hollow markers: hover the whole shape, not only the stroke */
  .m.off path { pointer-events: none; }
  .m.off { opacity: 0; pointer-events: none; }
  .m.dimp { opacity: 0.5; }
  .m.dimp.off { opacity: 0; }
  .st { fill: none; stroke: var(--fg3); stroke-width: 0.8; }
  .st.fg { stroke: var(--fg); stroke-width: 1.4; }
  .st.TFLT { stroke-dasharray: 4 3; }
  .st.off { opacity: 0; }
  .ann { font: 400 10px var(--mono); fill: var(--fg); }
  .pt3 { font: 500 11px var(--mono); fill: var(--fg); }
  .b3r { fill: var(--fg3); } .b3r.TFLN, .b3r.TFLT { fill: var(--fg2); }
  .ofc { fill: var(--bg); fill-opacity: 0.55; stroke: var(--fg); stroke-width: 0.5; stroke-dasharray: 2 2; }
  .n3 { font: 400 9px var(--mono); fill: var(--fg3); }
  .seg4 { stroke: var(--bg); } .seg4.s0 { fill: var(--fg); } .seg4.s1 { fill: var(--fg3); } .seg4.s2 { fill: none; stroke: var(--fg3); stroke-dasharray: 2 2; }
  .tot { fill: none; stroke: var(--rule2); }
  .ln5 { fill: none; stroke: var(--fg2); stroke-width: 1; }
  .ln5.l0 { stroke: var(--fg); stroke-width: 1.4; } .ln5.l1 { stroke-dasharray: 4 2; } .ln5.l2 { stroke-dasharray: 1 2; } .ln5.l3 { stroke-dasharray: 6 2 1 2; } .ln5.l4 { stroke-dasharray: 2 4; }
  .pt5 { fill: var(--bg); stroke: var(--fg2); }
  .lab5 { font: 400 10px var(--mono); fill: var(--fg2); }
  .med { stroke: var(--fg); stroke-width: 2; }
  .medt { font: 500 10px var(--mono); fill: var(--fg); }
  @media (max-width: 600px) { .i8-pc { --bh: 500px; } .i8-box { grid-template-rows: 64px minmax(0, 1fr) 126px; } .i8-leg { height: 58px; } .i8-ctl { flex-wrap: wrap; align-content: center; gap: 4px 8px; padding: 4px 6px; } .i8-tabs button { padding: 3px 6px; } }

  /* VISUAL */
  .i8-pc.v { --bh: 640px; }
  .v .i8-tabs { margin-bottom: 16px; }
  .v .i8-tabs button { padding: 0 14px; }
  .v .i8-box { grid-template-rows: 60px minmax(0, 1fr) 84px; border: 1px solid var(--v-line); background: var(--v-ink1); box-shadow: none; }
  .v .i8-ctl { gap: 16px; padding: 0 16px; border-color: var(--v-line); }
  .v .i8-ctl :is(.v-seg) button { min-height: 40px; padding: 0 12px; font-size: 14px; }
  .v .i8-yr { min-width: 300px; } .v .i8-yr input { width: 170px; } .v .i8-yr output { width: 3.2em; font: 500 22px/28px var(--v-ui); font-variant-numeric: tabular-nums; }
  .v .i8-ctl-note, .v .i8-cav { font: 400 14px/21px var(--v-ui); color: var(--v-text3); }
  .i8-play { min-height: 40px; padding: 0 14px; background: none; border: 2px solid var(--v-l532); color: var(--v-l532); font: 500 14px/1 var(--v-ui); cursor: pointer; }
  .i8-play[aria-pressed="true"] { background: var(--v-l532); color: var(--v-l532-ink); }
  .v .i8-foot { padding: 8px 16px; border-color: var(--v-line); }
  .v .i8-lg { font: 500 14px/24px var(--v-ui); color: var(--v-text2); min-height: 32px; }
  .v .i8-leg { height: 34px; }
  .v .gl { stroke: var(--v-line); }
  .v .tk { font: 500 12px var(--v-ui); fill: var(--v-text3); }
  .v .al, .v .lab5 { font: 500 13px var(--v-ui); fill: var(--v-text2); }
  .v .ann, .v .pt3, .v .medt { font: 500 13px var(--v-ui); fill: var(--v-text); }
  .v .n3 { font: 500 11px var(--v-ui); }
  .v .m path { stroke-width: 1.4; }
  .v .m.TFLN path { fill: var(--v-l532); stroke: var(--v-l532); } .v .m.TFLT path { stroke: var(--v-au); }
  .v .m.SiPh path { stroke: #7fa3d9; } .v .m.InP path { stroke: var(--v-l633); } .v .m.BTO path { stroke: var(--nb); } .v .m.Polymer path { stroke: #c08ad8; } .v .m.Other path { stroke: var(--v-text3); }
  .v .m.hollow path { fill: none; }
  .v .st.fg.TFLN { stroke: var(--v-l532); } .v .st.fg.TFLT { stroke: var(--v-au); }
  .v .b3r { fill: var(--v-line2); } .v .b3r.TFLN { fill: var(--v-l532); } .v .b3r.TFLT { fill: var(--v-au); }
  .v .wg circle { fill: none; stroke: var(--v-text3); stroke-width: 1.4; } .v .wg line { stroke: var(--v-text3); stroke-width: 1.4; }
  .v .wg.nano circle { fill: color-mix(in srgb, var(--v-l532) 70%, transparent); stroke: var(--v-l532); }
  .v .wg.tflt circle { stroke: var(--v-au); stroke-width: 2.4; }
  .v .ln5.l0 { stroke: var(--v-l532); } .v .ln5.l3 { stroke: var(--v-au); } .v .ln5.l5 { stroke: var(--nb); }
  .v .med { stroke: var(--v-text); }
  .v .ruler { stroke: var(--v-text2); }
  .v .el { fill: var(--v-text3); } .v .el.TFLN { fill: var(--v-l532); } .v .el.TFLT { fill: var(--v-au); } .v .el.InP { fill: var(--v-l633); } .v .el.BTO { fill: var(--nb); } .v .el.SiPh { fill: #7fa3d9; } .v .el.Polymer { fill: #c08ad8; }
  :global(:root[data-theme="light"]) .v .m.SiPh path { stroke: #3d65a3; }
  :global(:root[data-theme="light"]) .v .m.Polymer path { stroke: #7d3f99; }
  @media (max-width: 600px) { .i8-pc.v { --bh: 780px; } .v .i8-box { grid-template-rows: 176px minmax(0, 1fr) 196px; } .v .i8-leg { height: 104px; } .v .i8-ctl { flex-wrap: wrap; align-content: center; gap: 6px 10px; padding: 6px 10px; } .v .i8-yr { min-width: 0; } .v .i8-tabs button { padding: 0 8px; font-size: 13px; } }
</style>
