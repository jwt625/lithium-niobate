<!-- /data/<property>/: spread of every record on a local axis per group (alternatives as separate marks), full records,
     endpoints, schema.org Dataset JSON-LD. TECH: boxed tables and a monochrome strip plot. VISUAL: specimen sheet with
     one card per record and the strip plot in grade glyphs. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { registerPops } from "$lib/content/pops";
  import { rowPop } from "$lib/figures/p09/explorer";
  import { statusCls } from "$lib/figures/p09/status";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const p = $derived(data.prop);
  onMount(() => registerPops(Object.fromEntries(data.rows.map((r) => [`r:${r.id}`, rowPop(r)]))));
</script>

<svelte:head>{@html `<script type="application/ld+json">${data.jsonld}</` + `script>`}</svelte:head>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Data", href: "/data/" }, { label: p.id }]} title={p.name.replace(/_/g, "")}
  depth={[{ id: "spread", label: "Spread" }, { id: "records", label: `${data.rows.length} record${data.rows.length === 1 ? "" : "s"}` }, { id: "endpoints", label: "Endpoints" }]}>

  <section class="lay" id="spread" data-pair="spread" data-spine="Spread">
    <div class="sh"><h2 class="biref">Spread</h2><span class="meta">{@html [p.sym, p.unit].filter(Boolean).join(" ")}{#if p.sym || p.unit};&nbsp;{/if}{p.kind === "tensor" ? "one row per independent component" : "one row per variant and wavelength"}</span></div>
    {#if data.spread}
      <div class="p9-spreadbox">{@html data.spread}</div>
      <p class="fine">Each mark is one record; bars are stated ranges, whiskers stated uncertainties. Filled marks: P, P-comp, P-db; hollow: S, V, C, P(abs). Hover a mark for its source. Each row has its own axis; no mean or fit is drawn.{#if p.kind === "tensor"}{" "}Rotate any record into a cut: <a class="u" href="/lab/tensors/">tensors and frame conventions</a>.{/if}</p>
    {:else}
      <p class="nodata">No numeric record for this property; values are given as text below.</p>
    {/if}
  </section>

  <section class="lay" id="records" data-pair="records" data-spine="Records">
    <div class="sh"><h2 class="biref">Records</h2><span class="meta">{p.variants.length} variant{p.variants.length > 1 ? "s" : ""}</span></div>
    <div class="scrollx" data-variant="tech">
      <table class="idx p9-rec">
        <thead><tr><th>Value</th><th>Unit</th><th>Variant</th><th>Conditions</th><th>Frame</th><th>Source</th><th>Locator</th><th>Status</th></tr></thead>
        <tbody>
          {#each data.rows as r (r.id)}
            <tr>
              <td class="num">{@html r.val}{#if r.def}<div class="dim">default record</div>{/if}</td>
              <td>{@html r.unit || "–"}</td>
              <td>{r.vname}{#if r.vnote}<div class="dim">{r.vnote}</div>{/if}</td>
              <td>{r.cond || "–"}</td>
              <td>{r.frame || "–"}</td>
              <td>{#if r.doi}<a href="https://doi.org/{r.doi}">{r.src}</a>{:else if r.url}<a href={r.url}>{r.src}</a>{:else}{r.src}{/if}{#if r.orig}<div class="dim">{r.olab}: {r.orig}</div>{/if}</td>
              <td>{r.loc || "–"}</td>
              <td><span class="b {statusCls(r.st)}" data-pop="r:{r.id}">{r.st}</span></td>
            </tr>
            {#if r.notes}<tr class="p9-note"><td colspan="8">{r.notes}</td></tr>{/if}
          {/each}
        </tbody>
      </table>
    </div>
    <div class="p9-sheet" data-variant="visual">
      {#each data.rows as r (r.id)}
        <article class="v-card p9-pcard">
          <header><h3>{r.vname}{#if r.vnote}<span class="p9-pcard-vn">{r.vnote}</span>{/if}</h3><span class="b {statusCls(r.st)}" data-pop="r:{r.id}">{r.st}</span></header>
          <div class="{p.kind === 'tensor' ? 'p9-pcard-t' : 'v-val'}">{@html r.val}{#if r.unit}<small>{@html r.unit}</small>{/if}</div>
          <div class="v-cond">{r.cond || "conditions not stated"}{#if r.def}; default record{/if}</div>
          {#if r.frame}<p class="p9-pcard-f"><b>Frame</b> {r.frame}</p>{/if}
          {#if r.notes}<p class="p9-pcard-n">{r.notes}</p>{/if}
          <div class="p9-pcard-s">{#if r.doi}<a class="v-link" href="https://doi.org/{r.doi}">{r.src}</a>{:else if r.url}<a class="v-link" href={r.url}>{r.src}</a>{:else}{r.src}{/if}{#if r.loc}, {r.loc}{/if}{#if r.orig}<span class="p9-pcard-o">{r.olab}: {r.orig}</span>{/if}</div>
        </article>
      {/each}
    </div>
  </section>

  <section class="lay" id="endpoints" data-pair="endpoints" data-spine="Endpoints">
    <div class="sh"><h2 class="biref">Endpoints</h2><span class="meta">CC BY 4.0; cite the original source of each value</span></div>
    <div class="p9-links p9-ep">{#each data.endpoints as e (e.href)}<a href={e.href}><span class="dim">{e.label}</span> {e.href}</a>{/each}</div>
    <pre class="p9-pre p9-curl">curl -s https://lithium-niobate.com{data.endpoints[0].href}</pre>
    <p class="fine">This page carries the same records as schema.org Dataset JSON-LD. All endpoints: <a class="u" href="/data/api/">API</a>.</p>
  </section>
</ChapterPage>
