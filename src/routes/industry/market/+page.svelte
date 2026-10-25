<!-- 8.6 Market size: ranges by evidence grade (manuscript 8.6). L1 range strips F8.07, L2 tables, L3 why there is no
     single number. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import MarketStrips from "$lib/figures/industry/MarketStrips.svelte";
  import { MARKET, RF_CONTEXT } from "$lib/figures/industry/facts";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  useChapterPops(null, { "i8-spread": { h: "Spread of published values", body: "TFLN modulator base-year values: highest US$476 M / lowest US$73 M = 6.5. Forecast values: US$3,829 M / US$317 M = 12. Ratios of the publishers' own numbers; no value is preferred.", badges: [["g8 gE", "E"]] } });
  const fmt = (x: number | number[] | null, cur: string): string => x === null ? "N/A" : `${cur === "CNY" ? "CNY" : "US$"}${Array.isArray(x) ? (x[0] === x[1] ? x[0].toLocaleString("en-US") : `${x[0]}-${x[1]}`) : x.toLocaleString("en-US")} M`;
  const groups: [string, (d: string) => boolean][] = [["TFLN modulator market", (d) => d.startsWith("TFLN")], ["Bulk LN crystal and wafer market", (d) => !d.startsWith("TFLN")]];
</script>

<ChapterPage crumbs={crumbs8("8.6")} title="8.6 Market size: ranges by evidence grade"
  depth={[{ id: "l1", label: "L1 Ranges" }, { id: "l2", label: "L2 Published numbers" }, { id: "l3", label: "L3 No single number" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Ranges">
    <div class="sh"><h2 class="biref">L1 What the forecasts say</h2><span class="meta">public teaser pages, accessed 2026-10-24; all LG</span></div>
    <div class="body">
      <p class="tx">Market-research firms publish forecasts for thin-film LN modulators that differ by a factor of 6.5 in the base-year value and 12 in the forecast value <G g="E" r="i8-spread" />. None of the public teaser pages shows data or method. No single headline figure exists.</p>
      <div class="i8-fig" data-variant="tech"><MarketStrips v={false} /></div>
      <div class="i8-fig" data-variant="visual"><MarketStrips v={true} /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Published numbers">
    <div class="sh"><h2 class="biref">L2 Published numbers</h2><span class="meta">values as the publishers state them; CAGR not recomputed</span></div>
    <div class="body">
      {#each groups as [title, f] (title)}
        <h3 class="h3">{title}</h3>
        <div class="scrollx"><table class="idx i8-mt2"><thead><tr><th>Publisher (release date)</th><th>Definition</th><th class="r">Base</th><th class="r">Forecast</th><th class="r">CAGR stated</th><th>Grade</th></tr></thead><tbody>
          {#each MARKET.filter((m) => f(m.def)) as m (m.pub)}
            <tr><td class="h">{m.pub} ({m.date})</td><td>{m.def}{m.note ? `; ${m.note}` : ""}</td><td class="r num">{fmt(m.base, m.cur)}{m.baseYear ? ` (${m.baseYear})` : ""}</td><td class="r num">{fmt(m.fc, m.cur)}{m.fcYear ? ` (${m.fcYear})` : ""}</td><td class="r">{m.cagr}</td><td class="i8-g"><G g={m.g} r={m.r} /></td></tr>
          {/each}
        </tbody></table></div>
      {/each}
      <p class="tx">Spread <G g="E" r="i8-spread" />: TFLN modulators, base year US$73-476 M (2024/2025), forecast US$0.3-3.8 B (2030-2034); no public TFLN figure from LightCounting or Yole was found. Bulk LN crystal and wafer, about US$130-200 M (2024), GII outlier excluded; whether these include SAW-grade LT is not stated by any source.</p>
      <h3 class="h3">Context</h3>
      <p class="tx">{RF_CONTEXT.t} <G g={RF_CONTEXT.g} r={RF_CONTEXT.r} /> (snippet only).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 No single number">
    <div class="sh"><h2 class="biref">L3 Why there is no single number</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>Definitions differ (chip vs module, bulk vs thin film, substrates in or out); base years differ; <span class="term" data-pop="g:market-teaser">teaser pages</span> are not reports.</li>
        <li>The strips plot each bar on a log axis from base to forecast; the axis spans US$10 M to US$10 B; the <span class="term" data-pop="g:cagr">CAGR</span> column is the publisher's, not recomputed. No sum, average, or consensus line is drawn, and no currency is converted.</li>
        <li>Unsourced numbers in Chinese finance articles (wafer price peak "CNY 28,000, about 7x", supply gap "about 40%", modulator share of module cost "10-15%") are LG and not plotted <G g="LG" r="r:r09-s9" />.</li>
        <li>Quality flags: the Intel Market Research player list names NeoPhotonics (acquired by Lumentum in 2022) and "II-VI Photonics Division"; 24marketreports lists AVANEX (defunct).</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
  .i8-mt2 td:first-child { white-space: normal; font-family: inherit; color: var(--fg); width: auto; min-width: 180px; }
</style>
