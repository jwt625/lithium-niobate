<!-- /library/: review papers; every chapter reference merged by DOI with chapter / section / decade / text filters; the LN
     publication set on thin-film phononics and transduction. TECH: boxed tables and a log-style reference list in a fixed
     scroll box. VISUAL: review cards, a year histogram of the references that follows the filter, index cards. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { CHAPTERS } from "$lib/content/site";
  import { mountLib, ERAS } from "$lib/figures/p09/libview";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const chName = (no: string): string => CHAPTERS.find((c) => c.no === no)?.title ?? no;
  const q = (r: (typeof data.refs)[number]): string => `${r.a} ${r.t} ${r.v} ${r.d ?? ""} ${r.y}`.toLowerCase();
  // year histogram: 1940-2026 per year, earlier years in one bin
  const Y0 = 1940, Y1 = 2026, HW = 1000, HH = 90, BASE = 100;
  const hist = $derived.by(() => {
    const m = new Map<number, number>();
    for (const [y, n] of data.years) { const k = +y < Y0 ? Y0 - 1 : +y; m.set(k, (m.get(k) ?? 0) + n); }
    const max = Math.max(...m.values());
    const bw = HW / (Y1 - Y0 + 2);
    return [...m.entries()].map(([y, n]) => ({ y, n, x: (y - (Y0 - 1)) * bw, w: bw - 1.5, h: (n / max) * HH, ys: y < Y0 ? data.years.filter(([yy]) => +yy < Y0).map(([yy]) => yy) : [String(y)] }));
  });
  const topicTitle = $derived(data.topTopics.slice(0, 3).map(([t]) => t).join(", "));
  let root: HTMLElement;
  onMount(() => mountLib(root.closest("main") as HTMLElement));
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Library" }]} title="Library"
  depth={[{ id: "reviews", label: "Reviews" }, { id: "refs", label: "References" }, { id: "pubs", label: "TFLN phononics" }]}>

  <section class="lay" id="reviews" data-pair="reviews" data-spine="Reviews">
    <div class="sh"><h2 class="biref">Review papers</h2><span class="meta">{data.reviews.length} reviews, 2012 to 2026; open-access status as recorded 2026-10-24</span></div>
    <div class="scrollx" data-variant="tech">
      <table class="idx p9-rev">
        <colgroup><col class="c-y"><col class="c-t"><col class="c-sc"><col class="c-oa"><col class="c-l"><col class="c-c"></colgroup>
        <thead><tr><th>Year</th><th>Review</th><th>Scope</th><th>Access</th><th>Coverage gap</th><th>Cited in</th></tr></thead>
        <tbody>
          {#each data.reviews as r (r.id)}
            <tr><td>{r.year}</td>
              <td class="h">{r.cite}{#if r.title}, <i>{r.title}</i>{/if}, {r.venue}{#if r.adjacent}&nbsp;<span class="dim">(not LN-specific)</span>{/if}<div class="mono dim">{#if r.id.startsWith("10.")}<a href="https://doi.org/{r.id}">doi:{r.id}</a>{:else}<a href="https://arxiv.org/abs/{r.id.replace('arXiv:', '')}">{r.id}</a>{/if}</div></td>
              <td>{@html r.scope}</td><td>{r.oa}</td><td>{@html r.lacks || "–"}</td><td class="mono">{r.ch.join(" ") || "–"}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="p9-vrev" data-variant="visual">
      {#each data.reviews as r (r.id)}
        <article class="p9-vrc">
          <div class="p9-vrc-y">{r.year}{#if r.adjacent}<small>not LN-specific</small>{/if}</div>
          <h3>{r.title || r.venue}</h3>
          <p class="p9-vrc-a">{r.cite}{#if r.title}, {r.venue}{/if}</p>
          <p class="p9-vrc-s">{@html r.scope}</p>
          {#if r.lacks}<p class="p9-vrc-l"><b>Coverage gap</b> {@html r.lacks}</p>{/if}
          <p class="p9-vrc-f">{r.oa}{#if r.ch.length}&nbsp;&middot; cited in chapter {r.ch.join(", ")}{/if}&nbsp;&middot;&nbsp;{#if r.id.startsWith("10.")}<a class="v-link" href="https://doi.org/{r.id}">doi</a>{:else}<a class="v-link" href="https://arxiv.org/abs/{r.id.replace('arXiv:', '')}">arXiv</a>{/if}</p>
        </article>
      {/each}
    </div>
    <p class="fine">{data.gaps}</p>
  </section>

  <section class="lay" id="refs" data-pair="refs" data-spine="References" bind:this={root}>
    <div class="sh"><h2 class="biref">References</h2><span class="meta">{data.total} chapter entries merged by DOI to {data.refs.length}</span></div>
    <div class="p9-ctl">
      <span class="lbl">Chapter</span>
      <div class="seg p9-wrap" role="group" aria-label="Chapter"><button type="button" data-lfv="ch:" class="on">all</button>{#each CHAPTERS as c (c.no)}<button type="button" data-lfv="ch:{c.no}" title="{c.title}: {data.perCh[c.no] ?? 0} entries">{c.no}</button>{/each}</div>
      <label class="lbl" for="lf-sec">Section</label>
      <select id="lf-sec" class="p9-sel p9-lsel" data-lf="sec"><option value="">all sections</option>{#each CHAPTERS as c (c.no)}<optgroup label="{c.no} {c.title}">{#each data.secs.filter((s) => s.ch === c.no) as s (s.no)}<option value={s.no}>{s.no} {s.title} ({s.n})</option>{/each}</optgroup>{/each}</select>
    </div>
    <div class="p9-ctl">
      <span class="lbl">Years</span>
      <div class="seg p9-wrap" role="group" aria-label="Years">{#each ERAS as [t], i (t)}<button type="button" data-lfv="era:{i}" class:on={i === 0}>{t}</button>{/each}</div>
      <label class="lbl" for="lf-q">Find</label><input id="lf-q" class="p9-sel p9-lq" type="search" data-lf="q" placeholder="author, title, DOI" autocomplete="off">
      <span class="p9-count" data-lfo="count">{String(data.refs.length).padStart(3, " ")} of {data.refs.length} references</span>
    </div>

    <div class="p9-vhist" data-variant="visual" aria-hidden="true">
      <svg viewBox="0 0 {HW} 120" data-lfo="hist">
        {#each hist as b (b.y)}<rect x={b.x.toFixed(2)} y={(BASE - b.h).toFixed(2)} width={b.w.toFixed(2)} height={b.h.toFixed(2)} class="lh-all"/><rect x={b.x.toFixed(2)} y={(BASE - b.h).toFixed(2)} width={b.w.toFixed(2)} height={b.h.toFixed(2)} class="lh-on" data-y={b.y < Y0 ? "pre" : String(b.y)} data-n={b.n} data-h={b.h.toFixed(3)} data-base={BASE}/>{/each}
        {#each [1960, 1980, 2000, 2017] as y (y)}<text x={((y - (Y0 - 1)) * HW / (Y1 - Y0 + 2)).toFixed(1)} y="116" text-anchor="middle" class="lh-t">{y}</text>{/each}
        <text x="0" y="116" class="lh-t">&lt;1940</text>
      </svg>
    </div>

    <div class="p9-box p9-lbox" data-variant="tech">
      <div data-free>
        <table class="log p9-lt">
          <thead><tr><th>Year</th><th>Authors</th><th>Title</th><th>Venue</th><th>Link</th><th>Ch.</th><th>Sections</th></tr></thead>
          <tbody>
            {#each data.refs as r (r.k)}
              <tr data-lr data-ch={r.ch.join(" ")} data-s={r.s.join(" ")} data-y={r.y} data-q={q(r)}>
                <td>{r.y || "–"}</td><td>{r.a}</td><td class="e">{r.t}</td><td class="p9-lv">{r.v}</td>
                <td>{#if r.d}<a href="https://doi.org/{r.d}">DOI</a>{:else if r.u}<a href={r.u}>URL</a>{:else}–{/if}</td>
                <td>{r.ch.join(" ")}</td><td>{r.s.join(" ") || "–"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="nodata p9-empty" data-lfo="empty" hidden>No reference matches this filter.</p>
      </div>
    </div>
    <div class="p9-vlib" data-variant="visual">
      <div class="p9-vlib-cards" data-free>
        {#each data.refs as r (r.k)}
          <article class="p9-lc" data-lr data-ch={r.ch.join(" ")} data-s={r.s.join(" ")} data-y={r.y} data-q={q(r)}>
            <div class="p9-lc-y">{r.y || "n.d."}</div>
            <p class="p9-lc-t">{r.t}</p>
            <p class="p9-lc-a">{[r.a, r.v].filter(Boolean).join(", ")}</p>
            <p class="p9-lc-f">{r.ch.map((c) => `${c} ${chName(c)}`).join(" · ")}{#if r.s.length}&nbsp;·&nbsp;sec. {r.s.join(", ")}{/if}{#if r.d}&nbsp;·&nbsp;<a class="v-link" href="https://doi.org/{r.d}">doi</a>{:else if r.u}&nbsp;·&nbsp;<a class="v-link" href={r.u}>link</a>{/if}</p>
          </article>
        {/each}
        <p class="nodata p9-empty" data-lfo="empty" hidden>No reference matches this filter.</p>
      </div>
    </div>
    <p class="fine">Sections list where the chapter text cites the reference; entries without a DOI are kept per chapter.</p>
  </section>

  <section class="lay" id="pubs" data-pair="pubs" data-spine="TFLN phononics">
    <div class="sh"><h2 class="biref">Thin-film LN phononics, piezo-optomechanics and microwave-optical transduction</h2><span class="meta">{data.pubs.length} publications, 2019 to {data.pubs[0]?.year}; most frequent topics: {topicTitle}</span></div>
    <div class="scrollx" data-variant="tech">
      <table class="idx p9-pub">
        <colgroup><col class="c-y"><col><col class="c-v"><col class="c-tp"><col class="c-l"></colgroup>
        <thead><tr><th>Date</th><th>Title, authors</th><th>Venue</th><th>Topics</th><th>Link</th></tr></thead>
        <tbody>
          {#each data.pubs as p (p.id)}
            <tr><td>{p.date}</td><td class="h">{p.title}<div class="dim">{p.authors}</div></td><td>{p.venue}{#if p.cls}<div class="dim">{p.cls}</div>{/if}</td><td>{p.topics.join(", ")}</td><td class="mono">{#if p.doi}<a href="https://doi.org/{p.doi}">DOI</a>{:else if p.url}<a href={p.url}>URL</a>{:else}–{/if}<div class="dim">{p.oa === "unknown" ? "N/A" : p.oa}</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <ol class="p9-vpub" data-variant="visual">
      {#each data.pubs as p (p.id)}
        <li><span class="p9-vpub-y">{p.year}</span><div><p class="p9-vpub-t">{p.title}</p><p class="p9-vpub-a">{p.authors}</p><p class="p9-vpub-v">{p.venue}{#if p.doi}&nbsp;&middot;&nbsp;<a class="v-link" href="https://doi.org/{p.doi}">doi:{p.doi}</a>{:else if p.url}&nbsp;&middot;&nbsp;<a class="v-link" href={p.url}>{p.url.replace(/^https?:\/\//, "")}</a>{/if}</p><p class="p9-vpub-tp">{#each p.topics as t (t)}<span>{t}</span>{/each}</p><p class="p9-vpub-a">{p.cls}{#if p.cls}&nbsp;·&nbsp;{/if}access: {p.oa === "unknown" ? "N/A" : p.oa}</p></div></li>
      {/each}
    </ol>
    <p class="fine">Data: <a class="u" href="/api/v1/publications.json">/api/v1/publications.json</a>; LN class from title or abstract.</p>
  </section>
</ChapterPage>
