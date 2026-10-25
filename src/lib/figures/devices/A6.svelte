<!-- A6 Records strip: one row per metric on its own log-axis segment, date, platform tag, DOI. TECH: dense table with
     strips; VISUAL: record cards with the value at display size. -->
<script lang="ts">
  import { strip, type RecRow } from "./records";
  let { rows }: { rows: RecRow[] } = $props();
</script>

<div class="panel dvf" data-variant="tech">
  <div class="ph"><span>Records, provisional: highest found per metric</span><span class="dim">{rows.length} rows; each axis covers three decades around its own value</span></div>
  <div class="scrollx">
    <table class="idx dv-rec">
      <thead><tr><th>Metric</th><th>Log axis</th><th>Value</th><th>Platform</th><th>Date</th><th>First author, venue</th><th>DOI</th><th>Source checked</th><th>Dataset id</th></tr></thead>
      <tbody>
        {#each rows as r (r.doi)}
          <tr><td class="h" style="white-space:normal">{@html r.metric}</td><td class="ax">{@html strip(r, 220, 26, false)}</td><td class="v">{@html r.value}<div class="dim" style="font-size:11px;line-height:15px">{@html r.cond}</div></td><td><span class="tag{r.platform === 'TFLN' ? '' : ' solid'}">{r.platform}</span></td><td class="dt">{r.date}</td><td style="white-space:normal">{@html r.who}</td><td><a href="https://doi.org/{r.doi}" target="_blank" rel="noopener">{r.doi}</a></td><td>{r.ver}</td><td class="dt">{r.id ?? "–"}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="pf"><span style="white-space:normal">Values as reported; highest found in a literature search to 2026-10-24 or in eo-modulator-atlas commit eb97f96; not a census. Source checked: Y = number in the published abstract; Y(arXiv), Y(conf) = in that version; atlas = atlas row with evidence locator; "inferred limit" = estimate, not a device. Platform tag outlined solid where the platform is not plain TFLN. Conditions under each value. Dataset id: row of the records dataset in the data API (– = no dataset row).</span></div>
</div>

<div class="dvv" data-variant="visual">
  <div class="v-recs">
    {#each rows as r (r.doi)}
      <article class="v-rec">
        <header><span class="v-rec-m">{@html r.metric}</span><span class="v-rec-p">{r.platform}</span></header>
        <div class="v-rec-v">{@html r.value}</div>
        <div class="v-rec-s">{@html strip(r, 280, 34, true)}</div>
        <p class="v-rec-c">{@html r.cond}</p>
        <footer><span>{@html r.who}</span><span>{r.date}</span><a href="https://doi.org/{r.doi}" target="_blank" rel="noopener">doi:{r.doi}</a><span>source checked: {r.ver}</span></footer>
      </article>
    {/each}
  </div>
</div>
