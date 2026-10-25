<!-- /data/api/: endpoint reference generated from static/api/openapi.json; example responses read from the static files at
     build time. TECH: dense endpoint blocks. VISUAL: endpoint cards in a two-column grid. Same facts in both. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { mountCopy } from "$lib/figures/p09/copy";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const C = $derived(data.citation);
  const cite = $derived(`Wentao Jiang, ${C.title}, version ${C.version} (${C.date}), ${C.url}. Data CC BY 4.0.`);
  const kb = (b: number): string => (b < 1024 ? `${b} B` : `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} kB`);
  let root: HTMLElement;
  onMount(() => mountCopy(root.closest("main") as HTMLElement));
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Data", href: "/data/" }, { label: "api" }]} title="Data API"
  depth={[{ id: "use", label: "Use and cite" }, { id: "endpoints", label: `${data.eps.length} endpoints` }]}>

  <section class="lay" id="use" data-pair="use" data-spine="Use and cite" bind:this={root}>
    <div class="sh"><h2 class="biref">Use and cite</h2><span class="meta">OpenAPI {data.openapi}, API version {data.version}</span></div>
    <div class="p9-api-top">
      <dl class="p9-kv">
        <dt>Base</dt><dd class="mono">https://lithium-niobate.com</dd>
        <dt>Method</dt><dd>GET only; parameters are path segments; query strings are ignored by the host</dd>
        <dt>Spec</dt><dd><a class="u" href="/api/openapi.json">/api/openapi.json</a> (OpenAPI {data.openapi}); payload schemas under <a class="u" href="/api/v1/schema/scalar.schema.json">/api/v1/schema/</a> (JSON Schema 2020-12)</dd>
        <dt>Catalog</dt><dd><a class="u" href="/api/v1/index.json">/api/v1/index.json</a>: properties, tensors, dispersion models, variants, counts, endpoint templates</dd>
        <dt>Agents</dt><dd><a class="u" href="/llms.txt">/llms.txt</a> (llmstxt.org index) and <a class="u" href="/llms-full.txt">/llms-full.txt</a> (records, tensors, models and glossary as markdown)</dd>
        <dt>License</dt><dd>Data <a class="u" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; code GPL-3.0. Cite the original source given with each value as well.</dd>
        <dt>Citation</dt><dd>CITATION.cff (cff-version 1.2.0) at the root of <a class="u" href="https://github.com/jwt625/lithium-niobate">github.com/jwt625/lithium-niobate</a>: {C.title}, version {C.version}, released {C.date}, licenses {C.licenses.join(", ")}</dd>
        <dt>Unverified</dt><dd><a class="u" href="/api/v1/unverified.json">/api/v1/unverified.json</a> holds {data.unverified} claims ({data.unvParts.join(", ")}) whose value or source has not been checked; no default endpoint serves them.</dd>
      </dl>
      <div class="p9-cite"><div class="p9-cite-h"><span class="lbl">Cite as</span><button type="button" class="p9-copy" data-copytext={cite}>copy</button></div><pre class="p9-pre p9-cite-t">{cite}</pre></div>
    </div>
  </section>

  <section class="lay" id="endpoints" data-pair="endpoints" data-spine="Endpoints">
    <div class="sh"><h2 class="biref">Endpoints</h2><span class="meta">example responses trimmed: arrays to 2 items, long strings cut</span></div>
    {#each data.groups as g (g)}
      <h3 class="h3 p9-api-g">{g}</h3>
      <div class="p9-api-grid">
        {#each data.eps.filter((e) => e.group === g) as e (e.path)}
          <article class="p9-api">
            <header><span class="tag solid">GET</span><code class="p9-api-p">{e.path}</code><span class="p9-api-ty">{e.type}</span></header>
            <p class="p9-api-s">{e.summary}</p>
            {#if e.params.length}<p class="p9-api-pa">{#each e.params as p, i (p.name)}{#if i}{"; "}{/if}<code>{p.name}</code>{p.n ? `: ${p.n} values (${p.sample.join(", ")}${p.n > p.sample.length ? ", ..." : ""})` : ": see the catalog"}{/each}</p>{/if}
            <div class="p9-api-curl"><pre class="p9-pre">{e.curl}</pre><button type="button" class="p9-copy" data-copytext={e.curl}>copy</button></div>
            {#if e.ex}
              <div class="p9-api-exh"><a class="u" href={e.url}>{e.url}</a><span class="dim">{kb(e.ex.bytes)}, {e.ex.lines} lines</span></div>
              <pre class="p9-pre p9-api-ex">{e.ex.text}</pre>
            {:else}
              <p class="nodata">No example file at {e.url}.</p>
            {/if}
          </article>
        {/each}
      </div>
    {/each}
  </section>
</ChapterPage>
