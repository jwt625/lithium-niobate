<!-- 8.5 OFC 2026 snapshot (manuscript 8.5), dated 2026-03: L1 board, L2 theme counts over the board, L3 claim caveats. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import OfcBoard from "$lib/figures/industry/OfcBoard.svelte";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { OFC, THEMES } from "$lib/figures/industry/facts";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  useChapterPops();
</script>

<ChapterPage crumbs={crumbs8("8.5")} title="8.5 OFC 2026 snapshot"
  depth={[{ id: "l1", label: "L1 The board" }, { id: "l2", label: "L2 Counts and themes" }, { id: "l3", label: "L3 Claims" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 The board">
    <div class="sh"><h2 class="biref">L1 OFC 2026, March 2026</h2><span class="meta">snapshot dated 2026-03; DOIs checked on Crossref 2026-10-25</span></div>
    <div class="body">
      <p class="tx">At the 2026 Optical Fiber Communication Conference (<span class="term" data-pop="g:ofc-ecoc">OFC</span>, 2026-03), thin-film LN or LT was the modulator platform in four <span class="term" data-pop="g:postdeadline-paper">postdeadline papers</span> (Th4A.2, Th4A.5, Th4A.6, Th4B.2) and in six papers of session W1A <Badge code="reported" pop="r:ofc2026-th4a2+ofc2026-th4a5+ofc2026-th4a6+ofc2026-th4b2" />.</p>
      <div class="i8-fig"><OfcBoard /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Counts and themes">
    <div class="sh"><h2 class="biref">L2 Counts and themes</h2><span class="meta">over the {OFC.length} papers of the board</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx i8-oc2">
          <thead><tr><th>Theme</th><th class="r">Papers</th><th>Codes</th></tr></thead>
          <tbody>
            {#each THEMES as t (t)}
              {@const rows = OFC.filter((o) => o.themes.includes(t))}
              <tr><td>{t}</td><td class="r num">{rows.length}</td><td>{rows.map((o) => o.code).join(", ")}</td></tr>
            {/each}
            <tr><td>postdeadline</td><td class="r num">{OFC.filter((o) => o.pd).length}</td><td>{OFC.filter((o) => o.pd).map((o) => o.code).join(", ")}</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Counts over the board rows <Badge code="derived" pop="i8-ofccount" />; each row links its DOI (Crossref record checked 2026-10-25).</p>
      <h3 class="h3">Themes</h3>
      <ul class="tx i8-ul">
        <li>400G/lane <span class="term" data-pop="g:im-dd">IM/DD</span> is the commercial target (W4J.4, Th1C.3, Th4B.2, Th4A.2, W1A.5, W1A.7) <G g="E" r="i8-ofcthemes" />.</li>
        <li>TFLT appears as LN's sibling for telecom, including the postdeadline line-rate maximum (Th4A.2).</li>
        <li>Manufacturing moves to 200 mm and wafer-scale bonding (W1A.3, Th1D.1, W1A.5, W1A.6).</li>
        <li>Modulators are co-designed with drivers and <span class="term" data-pop="g:eic">EICs</span> (M4D.4, Th4B.2, W4J.4, Th4A.6, Th1C.3).</li>
        <li>Work extends beyond the C band: O band (W4J.4, W1A.4), and 1064 nm (Th4A.5).</li>
      </ul>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Claims">
    <div class="sh"><h2 class="biref">L3 Claims and atlas values</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>Claims are the authors' abstract claims <Badge code="reported" pop="r:ofc2026-m4d4" />; atlas values can differ. Example: Aimone et al. (M4D.4) quote 1.1 V cm differential; the atlas view derives 2.45 V cm from 3.26 V &times; 7.5 mm.</li>
        <li>OFC full texts are not redistributed; only program metadata and facts with locators are used.</li>
        <li>A paper can carry several theme tags, or none (W1A.1, Th1H.4).</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
  .i8-oc2 td:first-child { white-space: nowrap; font-family: inherit; color: var(--fg2); width: auto; }
</style>
