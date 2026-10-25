<!-- F7.10 Dated news ticker (figures.md F7.10): every 7.10 event and the 7.9 events from 2021-10 on, newest first, in a
     fixed-height list (no auto-scroll). Kind and claim tags assigned from each event's title and notes (data.ts);
     region from the manuscript's regional index. -->
<script lang="ts">
  import type { Ev } from "../events";
  import { TICK_KIND, TICK_CLAIM, type TickKind } from "../data";
  import { HSTATUS, fm, esc } from "../status";
  import { evLink } from "../hpops";

  let { evs }: { evs: Ev[] } = $props();
  const KINDS: TickKind[] = ["paper", "foundry", "funding", "product", "standard", "institution", "corpus"];
  const REG = ["CN", "EU", "JP", "other"] as const;
  let kind = $state<TickKind | "all">("all");
  let reg = $state<(typeof REG)[number] | "all">("all");
  const regOf = (e: Ev): string => e.regions.find((r) => r === "CN" || r === "EU" || r === "JP") ?? "other";
  const rows = $derived(evs.filter((e) => (kind === "all" || TICK_KIND[e.id] === kind) && (reg === "all" || regOf(e) === reg)));
  const CL: Record<string, string> = { vendor: "VENDOR CLAIM", reporter: "REPORTER CLAIM", institution: "INSTITUTION CLAIM" };
</script>

{#snippet filters(v: boolean)}
  <div class={v ? "hx-vtk-f" : "hx-fl"}>
    {#if !v}<span class="lbl">Kind</span>{/if}
    <div class={v ? "v-seg hx-wrap" : "seg hx-seg"} role="group" aria-label="Kind">
      <button type="button" class:on={kind === "all"} onclick={() => (kind = "all")}>{v ? "All kinds" : "ALL"}</button>
      {#each KINDS as k (k)}<button type="button" class:on={kind === k} onclick={() => (kind = k)}>{v ? k : k.toUpperCase()}</button>{/each}
    </div>
    {#if !v}<span class="lbl">Region</span>{/if}
    <div class={v ? "v-seg hx-wrap" : "seg hx-seg"} role="group" aria-label="Region">
      <button type="button" class:on={reg === "all"} onclick={() => (reg = "all")}>{v ? "All regions" : "ALL"}</button>
      {#each REG as r (r)}<button type="button" class:on={reg === r} onclick={() => (reg = r)}>{v ? (r === "other" ? "Other" : r) : r.toUpperCase()}</button>{/each}
    </div>
  </div>
{/snippet}

<div data-variant="tech" class="hx-tk">
  {@render filters(false)}
  <div class="hx-tk-box">
    <table class="log hx-logt hx-tkt">
      <colgroup><col class="c-d"><col class="c-e"><col class="c-k"><col class="c-s"><col class="c-r"></colgroup>
      <thead><tr><th>Date</th><th>Item</th><th>Kind</th><th>St</th><th>Ref</th></tr></thead>
      <tbody>
        {#each rows as e (e.id)}
          <tr data-pop="e:{e.id}" tabindex="0"><td>{e.date}</td><td class="e">{@html fm(esc(e.title))}{#if TICK_CLAIM[e.id]} <span class="tag">{CL[TICK_CLAIM[e.id]]}</span>{/if}</td><td>{TICK_KIND[e.id]?.toUpperCase() ?? "-"}</td><td><span class="b {HSTATUS[e.st].cls}">{HSTATUS[e.st].text}</span></td><td>{#if e.doi}<a href="https://doi.org/{e.doi}">DOI</a>{:else if e.url}<a href={e.url}>URL</a>{:else}-{/if}</td></tr>
        {:else}<tr><td colspan="5" class="hx-none">NO ITEMS MATCH THIS FILTER</td></tr>{/each}
      </tbody>
    </table>
  </div>
</div>

<div data-variant="visual" class="hx-vtk">
  {@render filters(true)}
  <ol class="hx-vtk-box">
    {#each rows as e (e.id)}
      <li class="hx-vtk-r">
        <span class="hx-vtk-d">{e.date}</span>
        <span class="hx-vtk-t" data-pop="e:{e.id}">{@html fm(esc(e.title))}</span>
        <span class="hx-vtk-m"><span class="hx-vtk-k">{TICK_KIND[e.id] ?? ""}</span>{#if TICK_CLAIM[e.id]}<span class="b hx-claim">{TICK_CLAIM[e.id]} claim</span>{/if}<span class="b {HSTATUS[e.st].cls}" data-pop="hst:{e.st}">{HSTATUS[e.st].name}</span>{@html evLink(e).replace(/>[^<]+</, ">source<")}</span>
      </li>
    {:else}<li class="hx-vtk-r hx-vtk-none">No items match this filter.</li>{/each}
  </ol>
</div>
