<!-- Chapter 07 History, landing: name definition, chronology (TECH log table / VISUAL illustrated timeline), chapters and
     hero stories, "Who did it first?", people and institutions. Content: content/chapters/07-history/ (manuscript.md,
     figures.md F7.0, F7.D, F7.P; images.yaml); events: src/lib/generated/events-history.json (public set). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import { registerPops } from "$lib/content/pops";
  import { isVisual } from "$lib/figures/dom";
  import "$lib/figures/history/history.css";
  import LogTable from "$lib/figures/history/LogTable.svelte";
  import Timeline from "$lib/figures/history/Timeline.svelte";
  import Disputes from "$lib/figures/history/Disputes.svelte";
  import People from "$lib/figures/history/People.svelte";
  import RecordsStrip from "$lib/figures/history/RecordsStrip.svelte";
  import { CHAPTERS7, HEROES, FIGS, IMAGES, chapterHref7 } from "$lib/figures/history/data";
  import { HSTATUS, type HStatus } from "$lib/figures/history/status";
  import { statusPops, eventPops, imagePops } from "$lib/figures/history/hpops";
  import { artSVG } from "$lib/figures/history/art";
  import { setLabels } from "$lib/figures/history/labels";

  let { data }: { data: PageData } = $props();
  $effect.pre(() => setLabels(data.labels));
  setLabels(data.labels);
  $effect(() => registerPops({
    ...statusPops(), ...eventPops(data.evs), ...imagePops(Object.values(IMAGES)), ...data.srcPops,
    "joy:1966": { h: "1966: optical damage", body: "From this card on, with effects on, the cursor writes a faint 532 nm trace over this band: laser light leaves lasting index changes (Ashkin et al. 1966). Reduced motion: off." },
    "joy:1968": { h: "1968: holographic storage", body: "When this card enters view, the band shows the far field of the reader's own trace for 1 s (log |FFT|<sup>2</sup> of the trace bitmap): the stored pattern read out as a diffracted image (Chen, LaMacchia &amp; Fraser 1968). Reduced motion: off." },
    "joy:1971": { h: "1971: thermal fixing", body: "After this card the trace stops decaying for the rest of the visit: fixed holograms survive reading (Amodei &amp; Staebler 1971). Reduced motion: off." },
    "joy:1980": { h: "1980: MgO doping", body: "After this card the trace is fainter and fades faster: MgO raises photoconductivity about a hundredfold (conference abstract 1980; Bryan et al. 1984). Reduced motion: off." },
  }));
  const STS: HStatus[] = ["V", "P", "S", "derived"];

  // VISUAL: anchors #d1..#d13 point at the TECH rows; in VISUAL scroll to the matching card instead
  onMount(() => {
    const go = (): void => {
      const m = /^#(d\d+)$/.exec(location.hash);
      if (m && isVisual()) document.getElementById(`v${m[1]}`)?.scrollIntoView({ block: "start" });
    };
    go();
    addEventListener("hashchange", go);
    return () => removeEventListener("hashchange", go);
  });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "07 History" }]} title="07 History"
  depth={[{ id: "chron", label: "Chronology" }, { id: "chapters", label: "Chapters" }, { id: "disputes", label: "Who did it first?" }, { id: "people", label: "People" }]}>

  <section class="lay" id="chron" data-pair="chron" data-spine="Chronology">
    <div class="def hx-def"><b>lithium niobate</b>, LiNbO<sub>3</sub> &mdash; {@html data.def}</div>
    <div class="sh"><h2 class="biref">Chronology</h2><span class="meta">{data.evs.length} events, 1801 to 2026</span></div>
    <div class="body">
      <p class="hx-key fine">Status of each event: {#each STS as s (s)}<span class="hx-keyi"><span class="b {HSTATUS[s].cls}" data-pop="hst:{s}">{HSTATUS[s].text}</span> {HSTATUS[s].name}</span>{/each}</p>
      <ModeVariant>
        {#snippet tech()}<LogTable evs={data.evs} />{/snippet}
        {#snippet visual()}<Timeline evs={data.evs} />{/snippet}
      </ModeVariant>
      <h3 class="h3 hx-rs-h">Modulator bandwidth and V<sub>&pi;</sub>L on the same time axis</h3>
      <RecordsStrip pts={data.records.pts} atlas={data.records.atlas} />
    </div>
  </section>

  <section class="lay" id="chapters" data-pair="chapters" data-spine="Chapters">
    <div class="sh"><h2 class="biref">Chapters</h2><span class="meta">ten chapters; four with extended stories</span></div>
    <div class="body">
      <div data-variant="tech" class="scrollx">
        <table class="idx hx-chx">
          <thead><tr><th>No</th><th>Span</th><th>Chapter</th><th class="r">Events</th><th>Interactive</th><th>Story</th></tr></thead>
          <tbody>
            {#each CHAPTERS7 as c, i (c.no)}
              {@const h = HEROES.find((x) => x.chapter === c.no)}
              <tr><td>7.{c.no}</td><td class="mono">{c.span}</td><td class="h"><a href={chapterHref7(c)}>{c.title}</a></td><td class="r num">{data.counts[i]}</td>
                <td>{c.figs.filter((f) => FIGS[f].built).map((f) => FIGS[f].title).join("; ") || "-"}</td>
                <td>{#if h}<a href="{chapterHref7(c)}#{h.id}">{h.title}</a>{:else}-{/if}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div data-variant="visual" class="hx-doors">
        {#each HEROES as h (h.id)}
          {@const c = CHAPTERS7[h.chapter - 1]}
          <a class="hx-door a-{c.accent}" href="{chapterHref7(c)}#{h.id}">
            <span class="hx-door-art">{@html artSVG(c.no)}</span>
            <span class="hx-door-n">7.{c.no} story</span>
            <span class="hx-door-t">{h.title}</span>
            <span class="hx-door-f">{h.figTitle} &middot; {c.title}</span>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <section class="lay" id="disputes" data-pair="disputes" data-spine="Who did it first?">
    <div class="sh"><h2 class="biref">Who did it first?</h2><span class="meta">13 disputed priorities, claims with dates and status</span></div>
    <div class="body"><Disputes /></div>
  </section>

  <section class="lay" id="people" data-pair="people" data-spine="People">
    <div class="sh"><h2 class="biref">People and institutions</h2><span class="meta">{data.people.length} rows; institutions are standard attributions unless marked byline</span></div>
    <div class="body"><People rows={data.people} head={data.peopleHead} /></div>
  </section>
</ChapterPage>
