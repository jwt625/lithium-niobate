<!-- /lab/: every instrument on the site. TECH: dense boxed tables (flagship F1-F6, then every chapter figure with inputs,
     outputs, model, section). VISUAL: illustrated instrument cards; chapter groups open with the chapter's door art. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { registerPops, type Pop } from "$lib/content/pops";
  import { whenVisual } from "$lib/figures/visual/lifecycle";
  import { initDoors } from "$lib/figures/visual/doors";
  import { flagGlyph } from "$lib/figures/p09/glyphs";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const dash = "&ndash;";

  let root: HTMLElement, vIndex: HTMLElement;
  onMount(() => {
    const pops: Record<string, Pop> = {};
    for (const c of data.chapters) for (const r of c.rows) {
      pops[`i:${r.key}`] = {
        h: esc(r.title),
        body: [r.q && `<i>${esc(r.q)}</i>`, r.inputs && `<b>Inputs</b> ${esc(r.inputs)}`, r.outputs && `<b>Outputs</b> ${esc(r.outputs)}`, r.model && `<b>Model</b> ${esc(r.model)}`].filter(Boolean).join("<br>"),
        src: [r.src && esc(r.src), r.sec ? `Section ${r.sec}${r.secTitle ? ` ${esc(r.secTitle)}` : ""}${r.level ? `, ${r.level}` : ""}` : `Chapter ${r.ch}`].filter(Boolean).join(". "),
      };
    }
    const offPops = registerPops(pops);
    const main = root.closest("main") as HTMLElement;
    const offDoors = whenVisual(() => {
      const part = initDoors(main);
      const ro = new ResizeObserver(() => part.repaint());
      ro.observe(vIndex);
      return { repaint: part.repaint, dispose: () => { ro.disconnect(); part.dispose?.(); } };
    });
    return () => { offPops(); offDoors(); };
  });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Lab" }]} title="Lab"
  depth={[{ id: "flagship", label: "Flagship" }, { id: "index", label: `All ${data.total} instruments` }]}>

  <!-- ================= flagship ================= -->
  <section class="lay" id="flagship" data-pair="flagship" data-spine="Flagship" data-variant="tech" bind:this={root}>
    <div class="sh"><h2 class="biref">Flagship instruments</h2><span class="meta">six instruments that compute from the stored data</span></div>
    <div class="scrollx">
      <table class="idx p9-lab">
        <colgroup><col class="c-t"><col><col><col><col class="c-w"></colgroup>
        <thead><tr><th>Instrument</th><th>Inputs</th><th>Outputs</th><th>Model</th><th>Where</th></tr></thead>
        <tbody>
          {#each data.flagship as f (f.id)}
            <tr>
              <td class="h">{#if f.href}<a href={f.href}>{f.title}</a>{:else}{f.title}{/if}</td>
              <td>{@html f.inputs}</td><td>{@html f.outputs}</td><td>{@html f.model}</td>
              <td class="p9-where">{#if f.href}<a href={f.href}>{f.where}</a>{:else}<span class="dim">&ndash;</span>{/if}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
  <section class="v-sec v-w" id="v-flagship" data-pair="flagship" data-spine="Flagship" data-variant="visual">
    <header class="v-sh"><h2 class="biref">Flagship instruments</h2><p class="v-sub">F2 and F4 open full screen.</p></header>
    <div class="v-instr p9-vflag">
      {#each data.flagship as f (f.id)}
        {@const body = `<span class="p9-glyph" aria-hidden="true">${flagGlyph(f.id)}</span><span class="v-icard-t">${f.title}</span><span class="v-io"><span>${f.inputs}</span><span class="v-io-arrow" aria-hidden="true"></span><span>${f.outputs}</span></span><span class="v-icard-m">${f.model}</span><span class="v-icard-st">${f.href ? `Open: ${f.where}` : ""}</span>`}
        {#if f.href}<a class="v-icard v-facet" href={f.vhref ?? f.href}>{@html body}</a>{:else}<div class="v-icard v-facet" aria-disabled="true">{@html body}</div>{/if}
      {/each}
    </div>
  </section>

  <!-- ================= index ================= -->
  <section class="lay" id="index" data-pair="index" data-spine="All instruments" data-variant="tech">
    <div class="sh"><h2 class="biref">All instruments</h2><span class="meta">{data.total} instruments in eight chapters</span></div>
    <div class="scrollx">
      <table class="idx p9-lab p9-labx">
        <colgroup><col class="c-t"><col class="c-s"><col class="c-q"><col><col><col></colgroup>
        <thead><tr><th>Instrument</th><th>Sec.</th><th>Question</th><th>Inputs</th><th>Outputs</th><th>Model, sources</th></tr></thead>
        {#each data.chapters as c (c.no)}
          <tbody>
            <tr class="p9-chrow"><td colspan="6"><span class="mono">{c.no}</span> {c.title}</td></tr>
            {#each c.rows as r (r.key)}
              <tr>
                <td class="h"><a href={r.href} data-pop="i:{r.key}">{r.title}</a></td>
                <td class="mono">{r.sec || "–"}{#if r.level}&nbsp;<span class="dim">{r.level}</span>{/if}</td>
                <td><div class="p9-clamp">{r.q}</div></td>
                <td><div class="p9-clamp">{r.inputs || "–"}</div></td>
                <td><div class="p9-clamp">{r.outputs || "–"}</div></td>
                <td><div class="p9-clamp">{r.model}{#if r.src}<span class="dim"> ({r.src})</span>{/if}</div></td>
              </tr>
            {/each}
          </tbody>
        {/each}
      </table>
    </div>
    <p class="fine">A title opens the section that shows the instrument (the chapter page when the section has none); hover or focus it for the full text.</p>
  </section>
  <section class="v-sec v-w" id="v-index" data-pair="index" data-spine="All instruments" data-variant="visual" bind:this={vIndex}>
    <header class="v-sh"><h2 class="biref">All instruments</h2><p class="v-sub">Each card opens the section that shows the instrument; hover for the full text.</p></header>
    {#each data.chapters as c (c.no)}
      <div class="p9-vch">
        <div class="v-door p9-vdoor" data-art={c.slug} aria-hidden="true"><div class="v-door-art"><canvas></canvas><span class="v-door-no">{c.no}</span></div></div>
        <h3 class="p9-vch-t">{c.title}<small>{c.rows.length} instruments</small></h3>
      </div>
      <div class="p9-vcards">
        {#each c.rows as r (r.key)}
          {@const inner = `<span class="p9-vc-top"><span class="p9-vc-sec">${r.sec ? `${r.sec}${r.level ? ` ${r.level}` : ""}` : `chapter ${r.ch}`}</span></span><span class="p9-vc-t">${esc(r.title)}</span><span class="p9-vc-q">${esc(r.q)}</span><span class="v-io p9-vc-io"><span>${esc(r.inputs || "–")}</span><span class="v-io-arrow" aria-hidden="true"></span><span>${esc(r.outputs || "–")}</span></span><span class="p9-vc-m">${esc(r.model)}${r.src ? `<small>${esc(r.src)}</small>` : ""}</span><span class="v-icard-st">${r.onSection ? `Open section ${r.sec}` : `Open chapter ${r.ch}`}</span>`}
          <a class="v-icard p9-vc" href={r.href} data-pop="i:{r.key}">{@html inner}</a>
        {/each}
      </div>
    {/each}
  </section>
</ChapterPage>
