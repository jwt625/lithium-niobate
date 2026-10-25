<!-- F7.0 VISUAL: illustrated proportional timeline (figures.md F7.0). Tier 1: overview axis with one break (1801-1948 in
     the first 15%, 1949-2026 linear), one tick per event, height by status, color by chapter accent, stacked in up to four
     lanes. Tier 2: ten chapter cards (period-art vignettes, three anchor events). Below: a fixed-height event box (anchor
     events of every chapter, or all events of the selected chapter). Moment of joy ("the timeline remembers", figures.md):
     with effects on, the band gains a photorefractive trace story tied to the 1966, 1968, 1971 and 1980 cards. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { CHAPTERS7, chapterHref7 } from "./data";
  import { layoutTicks, axisX, dateParts, Y0, YB, Y1, type Ev } from "./events";
  import { fm, esc, HSTATUS } from "./status";
  import { artSVG } from "./art";
  import { evLink } from "./hpops";
  import { fxOn, isLight, isVisual } from "$lib/figures/dom";
  import { fft } from "$lib/physics/fft.ts";

  let { evs }: { evs: Ev[] } = $props();

  const byId = $derived(new Map(evs.map((e) => [e.id, e])));
  let selCh = $state(0);
  let hlCh = $state(0);
  let hlEv = $state("");
  let width = $state(1320);
  const H = 150, BASE = 118;
  const ticks = $derived(layoutTicks(evs, width - 16));
  const boxEvs = $derived(selCh ? evs.filter((e) => e.ch === selCh) : evs);
  const accent = (ch: number): string => CHAPTERS7[ch - 1]?.accent ?? "neutral";
  const tickH = (st: string): number => (st === "V" ? 20 : st === "P" ? 14 : st === "S" ? 9 : 20);
  const decades = [1801, 1850, 1900, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const xOf = (y: number): number => 8 + axisX(y) * (width - 16);
  const JOY: Record<string, string> = { "h-1966-ashkin-optical-damage": "1966", "h-1968-chen-holography": "1968", "h-1971-staebler-amodei-fixing": "1971", "h-1980-zhong-mgo": "1980" };

  let axis: HTMLDivElement, band: HTMLDivElement, box: HTMLDivElement, row: HTMLOListElement, trace: HTMLCanvasElement, recon: HTMLCanvasElement;

  function pick(ch: number): void { selCh = selCh === ch ? 0 : ch; box?.scrollTo({ top: 0 }); }
  function goTick(id: string): void {
    const e = byId.get(id); if (!e) return;
    selCh = e.ch; hlEv = id;
    const card = row?.querySelector<HTMLElement>(`[data-ch="${e.ch}"]`);
    if (card && row) row.scrollTo({ left: card.offsetLeft - row.offsetLeft, behavior: fxOn() ? "smooth" : "auto" });
    requestAnimationFrame(() => { const c = box?.querySelector<HTMLElement>(`[data-ev="${id}"]`); if (c && box) box.scrollTo({ top: c.offsetTop - box.offsetTop - 8, behavior: fxOn() ? "smooth" : "auto" }); });
  }

  onMount(() => {
    const ro = new ResizeObserver(() => { const w = Math.round(axis.clientWidth); if (w > 0) width = w; });
    ro.observe(axis);

    // ---------- moment of joy: the timeline remembers (VISUAL, effects on) ----------
    const step = { s1966: false, fixed: false, mgo: false };
    const g = trace.getContext("2d"), r = recon.getContext("2d");
    const d = Math.min(2, devicePixelRatio || 1);
    let last: { x: number; y: number } | null = null, running = false, idle = 0, reconT = 0;
    const size = (): void => { const b = band.getBoundingClientRect(); for (const c of [trace, recon]) { c.width = Math.round(b.width * d); c.height = Math.round(b.height * d); } };
    size();
    const ro2 = new ResizeObserver(size); ro2.observe(band);
    const tick = (): void => {
      if (!g) return;
      const k = step.mgo ? 0.035 : step.fixed ? 0 : 0.012; // display decay per frame
      if (k) { g.globalCompositeOperation = "destination-out"; g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(0, 0, trace.width, trace.height); g.globalCompositeOperation = "source-over"; }
      if (++idle < 900 && fxOn() && k) requestAnimationFrame(tick); else running = false;
    };
    const inBand = (on: boolean): void => { document.documentElement.classList.toggle("hx-notrace", on && fxOn()); };
    const move = (e: PointerEvent): void => {
      if (!fxOn() || e.pointerType !== "mouse" || !g || !step.s1966) { last = null; return; }
      const b = band.getBoundingClientRect();
      const p = { x: (e.clientX - b.left) * d, y: (e.clientY - b.top) * d };
      if (last) {
        g.strokeStyle = isLight() ? `rgba(15,138,69,${step.mgo ? 0.05 : 0.11})` : `rgba(94,227,140,${step.mgo ? 0.045 : 0.1})`;
        g.lineWidth = 6 * d; g.lineCap = "round"; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke();
      }
      last = p; idle = 0;
      if (!running) { running = true; requestAnimationFrame(tick); }
    };
    // 1968: reconstruct the reader's trace as its far-field (|FFT|^2 of the trace bitmap, log scale) for 1 s
    const reconstruct = (): void => {
      if (!g || !r || !fxOn()) return;
      const N = 128, img = g.getImageData(0, 0, trace.width, trace.height).data;
      const re = new Float64Array(N * N), im = new Float64Array(N * N);
      let sum = 0;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = Math.floor(((i + 0.5) / N) * trace.width), y = Math.floor(((j + 0.5) / N) * trace.height);
        const a = img[(y * trace.width + x) * 4 + 3] / 255; re[j * N + i] = a; sum += a;
      }
      if (sum < 0.5) return;
      const rr = new Float64Array(N), ri = new Float64Array(N);
      for (let j = 0; j < N; j++) { rr.set(re.subarray(j * N, j * N + N)); ri.set(im.subarray(j * N, j * N + N)); fft(rr, ri); re.set(rr, j * N); im.set(ri, j * N); }
      for (let i = 0; i < N; i++) { for (let j = 0; j < N; j++) { rr[j] = re[j * N + i]; ri[j] = im[j * N + i]; } fft(rr, ri); for (let j = 0; j < N; j++) { re[j * N + i] = rr[j]; im[j * N + i] = ri[j]; } }
      let mx = 0; const P = new Float64Array(N * N);
      for (let k = 1; k < N * N; k++) { P[k] = Math.log10(1 + re[k] ** 2 + im[k] ** 2); if (P[k] > mx) mx = P[k]; }
      const o = new ImageData(N, N), light = isLight();
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const v = P[((j + N / 2) % N) * N + ((i + N / 2) % N)] / (mx || 1), q = (j * N + i) * 4;
        o.data[q] = light ? 15 : 94; o.data[q + 1] = light ? 138 : 227; o.data[q + 2] = light ? 69 : 140; o.data[q + 3] = Math.round(255 * v ** 2 * 0.8);
      }
      const tmp = document.createElement("canvas"); tmp.width = N; tmp.height = N; tmp.getContext("2d")?.putImageData(o, 0, 0);
      const s = Math.min(recon.width, recon.height) * 0.9;
      r.clearRect(0, 0, recon.width, recon.height); r.imageSmoothingEnabled = true;
      r.drawImage(tmp, (recon.width - s) / 2, (recon.height - s) / 2, s, s);
      recon.classList.add("on"); clearTimeout(reconT); reconT = window.setTimeout(() => recon.classList.remove("on"), 1000);
    };
    const io = new IntersectionObserver((ents) => {
      for (const en of ents) {
        if (!en.isIntersecting || !isVisual()) continue;
        const y = JOY[(en.target as HTMLElement).dataset.ev ?? ""];
        if (y === "1966") step.s1966 = true;
        else if (y === "1968" && step.s1966) reconstruct();
        else if (y === "1971") step.fixed = true;
        else if (y === "1980") step.mgo = true;
        if (y && (y === "1980" || y === "1966") && !running) { running = true; requestAnimationFrame(tick); }
      }
    }, { threshold: 0.6 }); // viewport, clipped by the scrolling event box
    const watch = (): void => { io.disconnect(); box.querySelectorAll<HTMLElement>("[data-ev]").forEach((c) => { if (JOY[c.dataset.ev ?? ""]) io.observe(c); }); };
    watch();
    const mo = new MutationObserver(watch); mo.observe(box, { childList: true, subtree: true });
    const enter = (): void => inBand(true), leave = (): void => { inBand(false); last = null; };
    band.addEventListener("pointerenter", enter); band.addEventListener("pointerleave", leave); band.addEventListener("pointermove", move);
    return () => {
      ro.disconnect(); ro2.disconnect(); io.disconnect(); mo.disconnect(); clearTimeout(reconT); inBand(false);
      band.removeEventListener("pointerenter", enter); band.removeEventListener("pointerleave", leave); band.removeEventListener("pointermove", move);
    };
  });
</script>

<div class="hx-tl" id="hx-tl" bind:this={band}>
  <canvas class="hx-joy" aria-hidden="true" bind:this={trace}></canvas><canvas class="hx-joy hx-recon" aria-hidden="true" bind:this={recon}></canvas>
  <div class="hx-tl-axis" bind:this={axis}>
    <svg viewBox="0 0 {width} {H}" role="group" aria-label="Timeline 1801 to 2026, one mark per event; the axis is compressed before 1949">
      <rect class="hx-tl-brk" x={xOf(YB) - 7} y="8" width="6" height={BASE - 4}/>
      <line class="hx-tl-base" x1={xOf(Y0)} y1={BASE} x2={xOf(YB) - 8} y2={BASE}/><line class="hx-tl-base" x1={xOf(YB)} y1={BASE} x2={xOf(Y1 + 1)} y2={BASE}/>
      <text class="hx-tl-brkl" x={xOf(YB) - 4} y={BASE + 4} text-anchor="middle">//</text>
      {#each decades as y (y)}
        {#if width > 640 || y === 1801 || (y >= 1960 && y % 20 === 0)}
          <line class="hx-tl-dec" x1={xOf(y)} y1={BASE} x2={xOf(y)} y2={BASE + 6}/><text class="hx-tl-lab" x={xOf(y)} y={BASE + 22} text-anchor={y === 1801 ? "start" : "middle"}>{y}</text>
        {/if}
      {/each}
      {#each ticks as t (t.id)}
        {@const y1 = BASE - 2 - t.lane * 24}
        <g class="hx-tk a-{accent(t.ch)} st-{t.st}" class:hl={hlCh === t.ch || hlEv === t.id} data-pop="e:{t.id}" tabindex="0" role="button" aria-label={byId.get(t.id)?.date + " " + (byId.get(t.id)?.title ?? "")}
          onpointerenter={() => (hlCh = t.ch)} onpointerleave={() => (hlCh = 0)} onfocus={() => (hlCh = t.ch)} onblur={() => (hlCh = 0)}
          onclick={() => goTick(t.id)} onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTick(t.id); } }}>
          <line x1={t.x + 8} y1={y1} x2={t.x + 8} y2={y1 - tickH(t.st)}/>
          <rect x={t.x + 4} y={y1 - 22} width="8" height="23" fill="transparent"/>
        </g>
      {/each}
    </svg>
  </div>

  <div class="hx-tl-key" aria-label="Timeline key">
    <span><i class="sw a-l532"></i>7.3, 7.6 (532 nm accent)</span><span><i class="sw a-ir1550"></i>7.5, 7.7 (1550 nm, false color)</span><span><i class="sw a-au"></i>7.4 (Au electrodes)</span><span><i class="sw"></i>other chapters</span>
    <span class="hx-tl-keyh">tick height: rec tall, P medium, S short; derived dotted</span>
  </div>
  <ol class="hx-tl-chs" bind:this={row} aria-label="Chapters">
    {#each CHAPTERS7 as c (c.no)}
      <li class="hx-chc a-{c.accent}" class:hl={hlCh === c.no} class:sel={selCh === c.no} data-ch={c.no} onpointerenter={() => (hlCh = c.no)} onpointerleave={() => (hlCh = 0)}>
        <button type="button" class="hx-chc-b" aria-pressed={selCh === c.no} onclick={() => pick(c.no)}>
          <span class="hx-chc-n">7.{c.no}</span><span class="hx-chc-s">{c.span.replace("-", "–")}</span>
          <span class="hx-chc-art">{@html artSVG(c.no)}</span>
          <span class="hx-chc-t">{c.title}</span>
        </button>
        <ul class="hx-chc-a">
          {#each c.anchors as id (id)}{@const e = byId.get(id)}{#if e}<li data-pop="e:{e.id}"><b>{e.date.slice(0, 4)}</b> {@html fm(esc(e.title))}</li>{/if}{/each}
        </ul>
        <a class="v-link hx-chc-go" href={chapterHref7(c)}>Read 7.{c.no}</a>
      </li>
    {/each}
  </ol>

  <div class="hx-tl-boxh">
    <span>{#if selCh}7.{selCh} {CHAPTERS7[selCh - 1].title}: {boxEvs.length} events{:else}All {evs.length} events, by date{/if}</span>
    <button type="button" class="hx-clear" disabled={!selCh} onclick={() => (selCh = 0)}>All chapters</button>
  </div>
  <div class="hx-tl-box" bind:this={box} tabindex="-1">
    {#each boxEvs as e (e.id)}
      {@const [yy, rest] = dateParts(e.date)}
      <article class="hx-evc a-{accent(e.ch)}" class:hl={hlEv === e.id} data-ev={e.id}>
        <div class="hx-evc-d">{yy}<small>{rest}</small>{#if JOY[e.id]}<span class="hx-joyic" data-pop="joy:{JOY[e.id]}" aria-label="Timeline step">&#9671;</span>{/if}</div>
        <h4 class="hx-evc-t" data-pop="e:{e.id}">{@html fm(esc(e.title))}</h4>
        <p class="hx-evc-h">{e.hook}</p>
        <p class="hx-evc-p">{e.people.slice(0, 3).join(", ")}{e.people.length > 3 ? ` +${e.people.length - 3}` : ""}</p>
        <div class="hx-evc-f"><span class="b {HSTATUS[e.st].cls}" data-pop="hst:{e.st}">{HSTATUS[e.st].name}</span>{@html evLink(e).replace(/>doi:[^<]+</, ">DOI<").replace(/>[^<]{24,}</, ">source<")}</div>
      </article>
    {/each}
  </div>
</div>
