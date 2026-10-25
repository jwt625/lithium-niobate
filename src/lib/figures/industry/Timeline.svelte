<!-- F8.09 Events timeline from the generated industry events (public set; same file as /api/v1/events/industry.json).
     Filters by grade, region, and stage change visibility only (fixed axis, fixed-height regions). TECH: tick strip plus log
     table. VISUAL: proportional axis with grade glyphs and a snap-scroll row of event cards; mark and card highlight each
     other. Filter "foundry" shows the 2023-2026 cluster of line announcements across four regions. -->
<script lang="ts">
  import G from "./G.svelte";
  import { gradeCls } from "./refs";

  interface Ev { id: string; date: string; title: string; grade: string; region: string[]; stage: string; url: string; src: string; accessed: string; orgs: string; note: string }
  let { evs }: { evs: Ev[] } = $props();
  const REG = ["CN", "US", "EU", "JP", "TW"], STG = ["wafer", "foundry", "product", "funding", "other"], GR = ["F", "V", "T"];
  let reg = $state("all"), stg = $state("all"), gr = $state("all");
  let hl = $state("");
  let scroller: HTMLElement | undefined = $state(), tbox: HTMLElement | undefined = $state();
  const on = (e: Ev): boolean => (reg === "all" || e.region.includes(reg)) && (stg === "all" || e.stage === stg) && (gr === "all" || e.grade.includes(gr));
  const n = $derived(evs.filter(on).length);
  const yr = (d: string): number => { const [y, m, dd] = d.split("-").map(Number); return y + (m ? (m - 1 + (dd ? (dd - 0.5) / 31 : 0.5)) / 12 : 0.5); };
  const X0 = 2020, X1 = 2027;
  const px = (d: string): number => ((yr(d) - X0) / (X1 - X0)) * 100;
  // stack index: events closer than 0.12 yr pile up
  const stack = (() => { const s: Record<string, number> = {}; const last: number[] = []; for (const e of [...evs].sort((a, b) => yr(a.date) - yr(b.date))) { const x = yr(e.date); let k = 0; while (last[k] !== undefined && x - last[k] < 0.12) k++; last[k] = x; s[e.id] = k; } return s; })();
  function focus(id: string): void {
    hl = id;
    const card = scroller?.querySelector<HTMLElement>(`[data-ev="${id}"]`);
    const row = tbox?.querySelector<HTMLElement>(`[data-ev-row="${id}"]`);
    if (row && tbox && tbox.offsetParent !== null) tbox.scrollTo({ top: row.offsetTop - 24 });
    if (card && scroller) scroller.scrollTo({ left: card.offsetLeft - scroller.offsetLeft - 8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
</script>

{#snippet filters(v: boolean)}
  <div class={v ? "i8-tl-f v" : "i8-ctlrow"}>
    <span class="lbl">Grade</span><div class={v ? "v-seg" : "seg"} role="group" aria-label="Grade">{#each ["all", ...GR] as k (k)}<button type="button" class:on={gr === k} onclick={() => (gr = k)}>{k}</button>{/each}</div>
    <span class="lbl">Region</span><div class={v ? "v-seg" : "seg"} role="group" aria-label="Region">{#each ["all", ...REG] as k (k)}<button type="button" class:on={reg === k} onclick={() => (reg = k)}>{k}</button>{/each}</div>
    <span class="lbl">Stage</span><div class={v ? "v-seg" : "seg"} role="group" aria-label="Stage">{#each ["all", ...STG] as k (k)}<button type="button" class:on={stg === k} onclick={() => (stg = k)}>{k}</button>{/each}</div>
    <span class="i8-tl-n"><span class="i8-num">{String(n).padStart(2, "\u2007")}</span> of {evs.length}</span>
  </div>
{/snippet}

{#snippet axis(v: boolean)}
  <div class="i8-ax" class:v>
    {#each Array.from({ length: X1 - X0 + 1 }, (_, i) => X0 + i) as y (y)}<span class="yt" style="left:{((y - X0) / (X1 - X0)) * 100}%">{y}</span>{/each}
    {#each evs as e (e.id)}
      <button type="button" class="mk {gradeCls(e.grade)}" class:off={!on(e)} class:hl={hl === e.id} style="left:{px(e.date)}%;--k:{stack[e.id]}" aria-label="{e.date} {e.title}" onmouseenter={() => (hl = e.id)} onfocus={() => (hl = e.id)} onclick={() => focus(e.id)}></button>
    {/each}
  </div>
{/snippet}

<div class="panel i8-tl" data-variant="tech">
  <div class="ph"><span>Industry events, 2020-2027</span></div>
  {@render filters(false)}
  <div class="i8-tl-a">{@render axis(false)}</div>
  <div class="i8-scroll i8-tl-t" bind:this={tbox}>
    <table class="log">
      <thead><tr><th>Date</th><th>Event</th><th>Region</th><th>Stage</th><th>Source, accessed</th><th>Grade</th></tr></thead>
      <tbody>
        {#each evs as e (e.id)}
          <tr class:off={!on(e)} class:hl={hl === e.id} data-ev-row={e.id} onmouseenter={() => (hl = e.id)}><td>{e.date}</td><td class="e">{e.title}<br><span class="i8-org">{e.orgs}</span></td><td>{e.region.join(" ")}</td><td>{e.stage}</td><td class="e i8-src"><a href={e.url}>{e.src}</a>, {e.accessed}</td><td><G g={e.grade} r="ev:{e.id}" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div class="i8-tlv" data-variant="visual">
  {@render filters(true)}
  {@render axis(true)}
  <ol class="i8-cards" bind:this={scroller}>
    {#each evs as e (e.id)}
      <li class="i8-ec" class:off={!on(e)} class:hl={hl === e.id} data-ev={e.id} onmouseenter={() => (hl = e.id)}>
        <div class="d">{e.date}</div>
        <p class="t">{e.title}</p>
        <p class="o">{e.orgs}</p>
        <div class="ft"><G g={e.grade} r="ev:{e.id}" /><span>{e.region.join(" ")} &middot; {e.stage}</span></div>
        <p class="s"><a class="v-link" href={e.url}>{e.src}</a>, accessed {e.accessed}</p>
      </li>
    {/each}
  </ol>
</div>

<style>
  .i8-tl .seg button { padding: 3px 7px; }
  .i8-tl-n { margin-left: auto; font: 400 11px/16px var(--mono); color: var(--fg3); white-space: nowrap; }
  .i8-tl-a { padding: 4px 12px 0; border-bottom: 1px solid var(--rule); }
  .i8-ax { position: relative; height: 54px; }
  .i8-ax .yt { position: absolute; bottom: 0; transform: translateX(-50%); font: 400 10px/14px var(--mono); color: var(--fg3); }
  .i8-ax .yt::before { content: ""; position: absolute; left: 50%; bottom: 14px; height: 6px; border-left: 1px solid var(--fg3); }
  .i8-ax::after { content: ""; position: absolute; left: 0; right: 0; bottom: 20px; border-top: 1px solid var(--fg3); }
  .mk { position: absolute; bottom: calc(24px + var(--k) * 7px); width: 7px; height: 7px; margin-left: -3.5px; padding: 0; border: 1px solid var(--fg); background: var(--bg); transform: rotate(45deg); cursor: pointer; }
  .mk.gF { background: var(--fg); } .mk.gV { background: linear-gradient(90deg, var(--fg) 50%, var(--bg) 50%); }
  .mk.off { opacity: 0.12; }
  .mk.hl { outline: 2px solid var(--fg); outline-offset: 1px; }
  .mk:focus-visible { outline: 2px solid var(--fg); }
  .i8-tl-t { position: relative; height: 420px; padding: 0 8px 6px; }
  .i8-tl-t tr.off { display: none; }
  .i8-tl-t tr.hl td { background: var(--acc-dim); }
  .i8-tl-t td.e { min-width: 180px; }
  .i8-org { font-size: 11px; color: var(--fg3); }

  .i8-tl-f.v { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; margin-bottom: 16px; }
  .i8-tl-f.v .lbl { font: 500 14px/20px var(--v-ui); letter-spacing: 0; text-transform: none; color: var(--v-text3); }
  .i8-tl-f.v .v-seg { flex-wrap: wrap; }
  .i8-tl-f.v .v-seg button { padding: 0 12px; }
  .i8-tl-f.v .i8-tl-n { margin-left: 0; font: 500 15px/22px var(--v-ui); color: var(--v-text2); }
  .i8-ax.v { height: 120px; }
  .i8-ax.v .yt { font: 500 13px/18px var(--v-ui); color: var(--v-text3); }
  .i8-ax.v .yt::before { bottom: 18px; height: 8px; border-color: var(--v-line2); }
  .i8-ax.v::after { bottom: 26px; border-color: var(--v-line2); border-width: 2px; }
  .i8-ax.v .mk { bottom: calc(32px + var(--k) * 12px); width: 11px; height: 11px; margin-left: -5.5px; border: 1.5px solid var(--v-text2); background: var(--v-ink0); }
  .i8-ax.v .mk.gF { background: var(--v-text2); } .i8-ax.v .mk.gV { background: linear-gradient(90deg, var(--v-text2) 50%, var(--v-ink0) 50%); }
  .i8-ax.v .mk.hl { background: var(--v-l532); border-color: var(--v-l532); outline: none; box-shadow: 0 0 10px var(--v-l532); }
  .i8-cards { list-style: none; margin: 16px 0 0; padding: 0 0 14px; height: 340px; display: grid; grid-auto-flow: column; grid-auto-columns: 300px; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-color: var(--v-line2) transparent; }
  .i8-ec { scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; background: var(--v-ink1); border: 1px solid var(--v-line); transition: border-color 240ms var(--v-ease); overflow: hidden; }
  .i8-ec.off { display: none; }
  .i8-ec.hl { border-color: var(--v-l532); box-shadow: inset 0 0 0 1px var(--v-l532); }
  .i8-ec .d { font: 300 34px/38px var(--v-serif); font-variant-numeric: lining-nums tabular-nums; }
  .i8-ec .t { font: 400 17px/25px var(--v-serif); color: var(--v-text); }
  .i8-ec .o { font: 400 13px/19px var(--v-ui); color: var(--v-text3); }
  .i8-ec .ft { margin-top: auto; display: flex; gap: 8px; align-items: center; font: 500 12px/18px var(--v-ui); color: var(--v-text3); }
  .i8-ec .s { font: 400 12px/17px var(--v-ui); color: var(--v-text3); overflow-wrap: anywhere; }
  @media (max-width: 640px) { .i8-cards { grid-auto-columns: 260px; } }
</style>
