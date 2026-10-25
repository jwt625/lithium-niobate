<!-- F7.0 TECH: chronology log table (figures.md F7.0). Filters: chapter, status, region (manuscript regional index), sort.
     Count line and ASCII year strip recomputed from the filtered set; the table scrolls inside a fixed-height box, so
     filtering never changes the page height. Row popups: e:<id> (hpops.ts). -->
<script lang="ts">
  import { asciiStrip, asciiLabels, countLine, REGIONS, REGION_NAME, type Ev, type Region } from "./events";
  import { fm, esc, HSTATUS, type HStatus } from "./status";

  let { evs }: { evs: Ev[] } = $props();

  let chap = $state(0);
  let st = $state<Record<HStatus, boolean>>({ V: true, P: true, S: true, derived: true });
  let reg = $state<Record<Region, boolean>>({ USSR: false, JP: false, EU: false, CN: false, "TI:LN": false });
  let desc = $state(false);

  const sel = $derived.by(() => {
    const anyReg = REGIONS.some((r) => reg[r]);
    const out = evs.filter((e) => (!chap || e.ch === chap) && st[e.st] && (!anyReg || e.regions.some((r) => reg[r as Region])));
    return desc ? out.reverse() : out;
  });
  const filtered = $derived(chap !== 0 || !st.V || !st.P || !st.S || !st.derived || REGIONS.some((r) => reg[r]));
  const strip = $derived(asciiStrip(evs, filtered ? sel : null));
  const labels = asciiLabels();
  const who = (p: string[]): string => (p.length > 2 ? `${p.slice(0, 2).join(", ")} +${p.length - 2}` : p.join(", "));
  const STS: HStatus[] = ["V", "P", "S", "derived"];
</script>

<div class="hx-log" id="hx-log">
  <div class="hx-fl">
    <span class="lbl">Chapter</span>
    <div class="seg hx-seg" role="group" aria-label="Chapter filter">
      {#each Array.from({ length: 11 }, (_, i) => i) as n (n)}<button type="button" class:on={chap === n} aria-pressed={chap === n} onclick={() => (chap = n)}>{n ? `7.${n}` : "ALL"}</button>{/each}
    </div>
    <span class="lbl">Status</span>
    <div class="seg hx-seg" role="group" aria-label="Status filter">
      {#each STS as s (s)}<button type="button" class:on={st[s]} aria-pressed={st[s]} onclick={() => (st[s] = !st[s])}>{s === "derived" ? "D" : s}</button>{/each}
    </div>
    <span class="lbl">Region</span>
    <div class="seg hx-seg" role="group" aria-label="Region filter">
      {#each REGIONS as r (r)}<button type="button" class:on={reg[r]} aria-pressed={reg[r]} title={REGION_NAME[r]} onclick={() => (reg[r] = !reg[r])}>{r}</button>{/each}
    </div>
    <span class="lbl">Sort</span>
    <div class="seg hx-seg" role="group" aria-label="Sort by date">
      <button type="button" class:on={!desc} aria-pressed={!desc} onclick={() => (desc = false)}>DATE &uarr;</button><button type="button" class:on={desc} aria-pressed={desc} onclick={() => (desc = true)}>DATE &darr;</button>
    </div>
  </div>
  <pre class="hx-count" aria-live="polite">{countLine(sel)}</pre>
  <div class="hx-strip" role="img" aria-label="Years 1801 to 2026, one character per year: | an event, # an event in the current filter, . none; // marks the axis break at 1949"><pre>{strip}
{labels}</pre></div>
  <div class="hx-logbox" tabindex="-1">
    <table class="log hx-logt">
      <colgroup><col class="c-d"><col class="c-p"><col class="c-e"><col class="c-w"><col class="c-w"><col class="c-r"><col class="c-s2"></colgroup>
      <thead><tr><th>Date</th><th title="Date precision: D day, M month, Y year">P</th><th>Event</th><th>Who</th><th>Where</th><th>Ref</th><th>St</th></tr></thead>
      <tbody>
        {#each sel as e (e.id)}
          <tr data-pop="e:{e.id}" tabindex="0">
            <td>{e.date}</td><td>{e.prec}</td><td class="e">{@html fm(esc(e.title))}</td><td>{who(e.people)}</td><td>{e.org}</td>
            <td>{#if e.doi}<a href="https://doi.org/{e.doi}">DOI</a>{:else if e.url}<a href={e.url}>URL</a>{:else}-{/if}</td>
            <td><span class="b {HSTATUS[e.st].cls}">{HSTATUS[e.st].text}</span></td>
          </tr>
        {:else}
          <tr><td colspan="7" class="hx-none">NO EVENTS MATCH THIS FILTER</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
