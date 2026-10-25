<!-- Chapter 07 History, chapter page 7.N: L1 narrative with the chapter interactive, the chapter's hero story (with its
     interactive), L2 numbers and mechanisms, L3 sources and status with the reference list, and the chapter's events.
     Text: content/chapters/07-history/manuscript.md (parsed in +page.server.ts); figures: figures.md F7.1-F7.10. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { registerPops } from "$lib/content/pops";
  import "$lib/figures/history/history.css";
  import Blocks from "$lib/figures/history/Blocks.svelte";
  import Fig from "$lib/figures/history/Fig.svelte";
  import { CHAPTERS7, HEROES, IMAGES, CHAPTER_IMAGE, chapterHref7 } from "$lib/figures/history/data";
  import { HSTATUS, fm, esc } from "$lib/figures/history/status";
  import { statusPops, eventPops, imagePops } from "$lib/figures/history/hpops";
  import { artSVG } from "$lib/figures/history/art";
  import type { Block } from "$lib/figures/history/content";
  import { setLabels } from "$lib/figures/history/labels";

  let { data }: { data: PageData } = $props();
  $effect.pre(() => setLabels(data.labels));
  setLabels(data.labels);
  // re-register when client-side navigation swaps the chapter data under the same component
  $effect(() => registerPops({ ...statusPops(), ...eventPops([...data.evs, ...data.tick]), ...imagePops(Object.values(IMAGES)), ...data.srcPops }));

  const doc = $derived(data.doc);
  const c = $derived(CHAPTERS7[data.no - 1]);
  const hero = $derived(doc.hero);
  const heroMeta = $derived(HEROES.find((h) => h.chapter === data.no));
  const prev = $derived(CHAPTERS7[data.no - 2]);
  const next = $derived(CHAPTERS7[data.no]);
  const img = $derived(CHAPTER_IMAGE[data.no] ? IMAGES[CHAPTER_IMAGE[data.no]] : null);
  const LBL: Record<string, string> = { l1: "L1 Narrative", l2: "L2 Numbers and mechanisms", l3: "L3 Sources and status" };
  const layer = (id: string) => doc.layers.find((l) => l.id === id);
  const depth = $derived([
    { id: "l1", label: "L1 Narrative" },
    ...(hero ? [{ id: hero.id, label: "Story" }] : []),
    { id: "l2", label: "L2 Numbers" }, { id: "l3", label: "L3 Sources" }, { id: "events", label: "Events" },
  ]);
  const who = (p: string[]): string => (p.length > 2 ? `${p.slice(0, 2).join(", ")} +${p.length - 2}` : p.join(", "));
</script>

{#snippet figure(b: Extract<Block, { kind: "fig" }>, inHero: boolean)}
  {#if !inHero && heroMeta && b.fig === heroMeta.fig}
    <p class="tx hx-tohero"><a class="lk" href="#{heroMeta.id}">{heroMeta.title}: {heroMeta.figTitle}</a></p>
  {:else}
    <Fig fig={b.fig} title={b.title} cap={b.cap} tick={data.tick} atlas={data.atlas} />
  {/if}
{/snippet}
{#snippet chFig(b: Extract<Block, { kind: "fig" }>)}{@render figure(b, false)}{/snippet}
{#snippet heroFig(b: Extract<Block, { kind: "fig" }>)}{@render figure(b, true)}{/snippet}

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "07 History", href: "/history/" }, { label: `7.${doc.no}` }]} title="7.{doc.no} {doc.title}" {depth}>
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Narrative">
    <div data-variant="visual" class="hx-chart a-{c.accent}">{@html artSVG(doc.no)}<span class="hx-chart-s">{doc.span.replace("-", "–")}</span></div>
    <div class="sh"><h2 class="biref">{LBL.l1}</h2><span class="meta">{doc.span} &middot; {data.evs.length} events</span></div>
    <div class="body">
      <Blocks blocks={layer("l1")?.blocks ?? []} fig={chFig} />
      {#if img}
        <figure class="hx-photo" class:port={img.h > img.w}>
          <img src={img.src} width={img.w} height={img.h} alt={img.caption} loading="lazy" decoding="async">
          <figcaption>{img.caption} <span class="hx-ref" data-pop="img:{img.key}">{img.author}</span>, {#if img.licenseUrl}<a href={img.licenseUrl}>{img.license}</a>{:else}{img.license}{/if}, <a href={img.page}>file page</a></figcaption>
        </figure>
      {/if}
    </div>
  </section>

  {#if hero}
    <section class="lay hx-hero" id={hero.id} data-pair={hero.id} data-spine={hero.title}>
      <div class="sh"><h2 class="biref">{hero.title}</h2><span class="meta">{heroMeta?.figTitle}</span></div>
      <div class="body">
        {#each hero.layers as L (L.id)}
          <h3 class="h3 hx-hl">{L.label}</h3>
          <Blocks blocks={L.blocks} fig={heroFig} />
        {/each}
      </div>
    </section>
  {/if}

  {#each ["l2", "l3"] as id (id)}
    <section class="lay" {id} data-pair={id} data-spine={LBL[id]}>
      <div class="sh"><h2 class="biref">{LBL[id]}</h2><span class="meta">{id === "l3" ? `${doc.cites.length} sources cited on this page` : doc.title}</span></div>
      <div class="body">
        <Blocks blocks={layer(id)?.blocks ?? []} fig={chFig} />
        {#if id === "l3"}
          <h3 class="h3">References</h3>
          <ol class="hx-refs">
            {#each doc.cites as s (s)}{@const p = data.srcPops[`src:${s}`]}
              {#if p}<li>{@html p.h}{#if p.body}. <i>{@html p.body}</i>{/if}{#if p.src}. {@html p.src}{/if}</li>{/if}
            {/each}
          </ol>
        {/if}
      </div>
    </section>
  {/each}

  <section class="lay" id="events" data-pair="events" data-spine="Events">
    <div class="sh"><h2 class="biref">Events of 7.{doc.no}</h2><span class="meta">{data.evs.length} events; status per event</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="log hx-logt hx-chlog">
          <colgroup><col class="c-d"><col class="c-e"><col class="c-w"><col class="c-r"><col class="c-s2"></colgroup>
          <thead><tr><th>Date</th><th>Event</th><th>Who</th><th>Ref</th><th>St</th></tr></thead>
          <tbody>
            {#each data.evs as e (e.id)}
              <tr data-pop="e:{e.id}" tabindex="0"><td>{e.date}</td><td class="e">{@html fm(esc(e.title))}</td><td>{who(e.people)}</td>
                <td>{#if e.doi}<a href="https://doi.org/{e.doi}">DOI</a>{:else if e.url}<a href={e.url}>URL</a>{:else}-{/if}</td>
                <td><span class="b {HSTATUS[e.st].cls}">{HSTATUS[e.st].text}</span></td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <nav class="hx-pn" aria-label="Chapters">
        {#if prev}<a class="lk" href={chapterHref7(prev)}>7.{prev.no} {prev.title}</a>{:else}<a class="lk" href="/history/">07 History</a>{/if}
        {#if next}<a class="lk" href={chapterHref7(next)}>7.{next.no} {next.title}</a>{:else}<a class="lk" href="/history/">07 History</a>{/if}
      </nav>
    </div>
  </section>
</ChapterPage>
