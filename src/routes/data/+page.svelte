<!-- /data/: property records. TECH: filter row and one boxed table of every public record (fixed-height scroll box),
     property index table. VISUAL: specimen cards in a scroll drawer, property index as a cabinet of labelled drawers.
     Both filter through one state (src/lib/stores/p09.ts dataFilter). Rows: src/lib/generated (lane API). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { mountExplorer } from "$lib/figures/p09/explorer";
  import { STATUS_DEF, statusCls } from "$lib/figures/p09/status";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const short = (v: string): string => ({ cln: "CLN", sln: "SLN", "mgo5-cln": "MgO5", "mgo1-sln": "MgO1-SLN", "lt-saw": "LT SAW", "lt-unspecified": "LT", unspecified: "n/s" })[v] ?? v;
  const frameShort = (f: string): string => (!f ? "–" : /convention IRE|convention IEEE/.test(f) ? (/convention ([^;]+)/.exec(f)?.[1] ?? "stated") : "unstated");
  const cats = $derived([...new Set(data.props.map((p) => p.cat))]);
  const c = $derived(data.counts as { scalar_records_public: number; tensor_records_public: number; sources: number; unverified: number; dispersion_models: number });
  let root: HTMLElement;
  onMount(() => mountExplorer(root.closest("main") as HTMLElement, data.rows));
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Data" }]} title="Data"
  depth={[{ id: "records", label: "Records" }, { id: "properties", label: "Properties" }, { id: "more", label: "Dispersion, API" }]}>

  <section class="lay" id="records" data-pair="records" data-spine="Records" bind:this={root}>
    <div class="sh"><h2 class="biref">Records</h2><span class="meta">{c.scalar_records_public} scalar + {c.tensor_records_public} tensor records, {c.sources} sources; alternatives listed side by side, never averaged</span></div>
    <div class="p9-ctl p9-dctl">
      <label class="lbl" for="df-prop">Property</label>
      <select id="df-prop" class="p9-sel p9-dsel" data-df="prop">
        <option value="">all properties</option>
        {#each cats as cat (cat)}<optgroup label={cat}>{#each data.props.filter((p) => p.cat === cat) as p (p.id)}<option value={p.id}>{p.name} ({p.n})</option>{/each}</optgroup>{/each}
      </select>
      <span class="lbl">Kind</span>
      <div class="seg" role="group" aria-label="Kind">{#each [["all", "all"], ["scalar", "scalar"], ["tensor", "tensor"]] as [v, t] (v)}<button type="button" data-dfv="kind:{v}" class:on={v === "all"}>{t}</button>{/each}</div>
    </div>
    <div class="p9-ctl p9-dctl">
      <span class="lbl">Variant</span>
      <div class="seg p9-wrap" role="group" aria-label="Variant"><button type="button" data-dfv="variant:" class="on">all</button>{#each data.variants as v (v.id)}<button type="button" data-dfv="variant:{v.id}" title={v.name}>{short(v.id)}</button>{/each}</div>
      <span class="lbl">Status</span>
      <div class="seg p9-wrap" role="group" aria-label="Status"><button type="button" data-dfv="status:" class="on">all</button>{#each data.statuses as s (s)}<button type="button" data-dfv="status:{s}" title={STATUS_DEF[s]}>{s}</button>{/each}</div>
      <span class="p9-count" data-dfo="count">{String(data.rows.length).padStart(3, " ")} of {data.rows.length} records</span>
    </div>

    <!-- TECH table -->
    <div class="p9-box p9-dbox" data-variant="tech">
      <div data-free>
        <table class="idx p9-dt">
          <colgroup><col class="c-p"><col class="c-v"><col class="c-u"><col class="c-var"><col class="c-c"><col class="c-f"><col class="c-s"><col class="c-st"></colgroup>
          <thead><tr><th>Property</th><th>Value</th><th>Unit</th><th>Variant</th><th>Conditions</th><th>Frame</th><th>Source, locator</th><th>Status</th></tr></thead>
          <tbody>
            {#each data.rows as r (r.id)}
              <tr data-row={r.id} data-prop={r.prop} data-var={r.v} data-st={r.st} data-kind={r.kind}>
                <td class="h"><a href="/data/{r.prop}/">{@html r.nh}</a>{#if r.sym && !r.nh.replace(/<[^>]+>/g, "").includes(r.sym.replace(/<[^>]+>/g, ""))}&nbsp;<span class="dim">{@html r.sym}</span>{/if}</td>
                <td class="num"><div class="p9-clamp2">{@html r.val}</div></td>
                <td>{@html r.unit}</td>
                <td title={r.vname}>{short(r.v)}{#if r.def}&nbsp;<span class="dim">(default)</span>{/if}</td>
                <td><div class="p9-clamp2">{r.cond || "–"}</div></td>
                <td>{frameShort(r.frame)}</td>
                <td><div class="p9-clamp2">{#if r.doi}<a href="https://doi.org/{r.doi}">{r.src}</a>{:else}{r.src}{/if}{#if r.loc}<span class="dim">, {r.loc}</span>{/if}</div></td>
                <td><span class="b {statusCls(r.st)}" data-pop="r:{r.id}">{r.st}</span></td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="nodata p9-empty" data-dfo="empty" hidden>No record matches this filter.</p>
      </div>
    </div>

    <!-- VISUAL drawer -->
    <div class="p9-vdrawer" data-variant="visual">
      <div class="p9-vcards2" data-free>
        {#each data.rows as r (r.id)}
          <article class="p9-spec" data-row={r.id} data-prop={r.prop} data-var={r.v} data-st={r.st} data-kind={r.kind}>
            <header><a class="p9-spec-n" href="/data/{r.prop}/">{@html r.nh}</a><span class="b {statusCls(r.st)}" data-pop="r:{r.id}">{r.st}</span></header>
            <div class="p9-spec-v {r.kind === 'tensor' ? 'p9-spec-t' : ''}">{@html r.val}{#if r.unit}<small>{@html r.unit}</small>{/if}</div>
            <div class="p9-spec-c">{r.vname}{#if r.vnote} ({r.vnote}){/if}{#if r.cond}; {r.cond}{/if}{#if r.frame}; frame: {frameShort(r.frame)}{/if}</div>
            <div class="p9-spec-s">{#if r.doi}<a class="v-link" href="https://doi.org/{r.doi}">{r.src}</a>{:else}{r.src}{/if}{#if r.loc}, {r.loc}{/if}</div>
          </article>
        {/each}
        <p class="nodata p9-empty" data-dfo="empty" hidden>No record matches this filter.</p>
      </div>
    </div>
    <p class="fine">Status: {#each data.statuses as s, i (s)}{#if i}{"; "}{/if}<b>{s}</b> {STATUS_DEF[s]}{/each}. Unverified claims ({c.unverified}) are not in this table: <a class="u" href="/api/v1/unverified.json">/api/v1/unverified.json</a>.</p>
  </section>

  <section class="lay" id="properties" data-pair="properties" data-spine="Properties">
    <div class="sh"><h2 class="biref">Properties</h2><span class="meta">{data.props.length} pages, each with Dataset JSON-LD and its endpoints</span></div>
    <div class="scrollx" data-variant="tech">
      <table class="idx p9-pt">
        <thead><tr><th>Property</th><th>Symbol</th><th>Kind</th><th class="r">Records</th><th>Variants</th><th>JSON</th></tr></thead>
        <tbody>
          {#each data.props as p (p.id)}
            <tr><td class="h"><a href="/data/{p.id}/">{@html p.nh}</a></td><td>{@html p.sym}</td><td class="mono">{p.kind}</td><td class="r mono">{p.n}</td><td class="mono">{p.variants.map(short).join(", ")}</td><td class="mono"><a href={p.kind === "tensor" ? `/api/v1/tensors/${p.id}.json` : `/api/v1/properties/${p.id}.json`}>{p.kind === "tensor" ? "tensors" : "properties"}/{p.id}.json</a></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="p9-cabinet" data-variant="visual">
      {#each cats as cat (cat)}
        <div class="p9-cab-col"><h3>{cat}</h3>
          {#each data.props.filter((p) => p.cat === cat) as p (p.id)}<a class="p9-drawer" href="/data/{p.id}/"><span>{@html p.nh}</span><small>{p.n}</small></a>{/each}
        </div>
      {/each}
    </div>
  </section>

  <section class="lay" id="more" data-pair="more" data-spine="Dispersion, API">
    <div class="sh"><h2 class="biref">Dispersion models and API</h2><span class="meta">static JSON and CSV, no query strings</span></div>
    <div class="p9-more">
      <a class="p9-door" href="/data/dispersion/"><b>Dispersion models</b><span>{c.dispersion_models} Sellmeier models: n(&lambda;) plotted from the stored coefficients, validity windows, errata, check values.</span></a>
      <a class="p9-door" href="/data/api/"><b>API</b><span>Every endpoint from the OpenAPI 3.1 file with an example response and a curl line; llms.txt; citation; license CC BY 4.0.</span></a>
    </div>
  </section>
</ChapterPage>
