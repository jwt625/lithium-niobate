<!-- 1.6 Dopants (content/chapters/01-crystal/manuscript.md Sec. 6; FIG-01-05 Threshold explorer). The figure module
     src/lib/figures/crystal/th.ts renders both variants from th-data.ts; state in src/lib/stores/crystal.ts `thresh`. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountThresh } from "$lib/figures/crystal/th";
  import { DOPS, HOSTS, DOP_HTML, HOST_NAME, THRESH, NOTES, SITES_POP, OH_POP, OH_UM_POP } from "$lib/figures/crystal/th-data";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { usePops } from "$lib/content/pops";
  import "$lib/figures/crystal/th.css";

  let { data }: { data: PageData } = $props();
  const I = $derived(data.init);
  const groups = DOPS.flatMap((d) => HOSTS.map((h) => ({ d, h, rows: THRESH[d][h].rows }))).filter((g) => g.rows.length);
  const DEF_G = "MgO|cln";

  usePops({
    "d:th-tile": { h: "Site texture: counts from the scheme", body: "400 Li sites (composition.ts seededLattice, 20 &times; 20, seed 1605). Counts are the Iyi et al. 1995 fractions times 400: 0 %: 380 Li, 16 V<sub>Li</sub>, 4 Nb<sub>Li</sub>; 3 %: 376 Li, 12 Mg, 12 V<sub>Li</sub>; 8 %: 336 Li, 32 Mg, 32 V<sub>Li</sub>. Placement is a seeded display choice: from 0 to 3 % the antisites and 8 vacancies take Mg and 4 Li sites empty; from 3 to 8 % 20 more Li sites take Mg and 20 empty.", badges: [["d", "derived"]] },
    "d:th-ratio": { h: "[Li]/[Nb] of the 0 % formula", body: "[Li<sub>0.95</sub>Nb<sub>0.01</sub>V<sub>0.04</sub>]NbO<sub>3</sub>: [Li]/[Nb] = 0.95 / (1 + 0.01) = <span class='v'>0.941</span>, the congruent ratio.", badges: [["d", "derived"]] },
    "d:th-axis": { h: "Axis scale", body: "Linear, 0 to 9 % as printed by each source (mol%, at.%, or %). No conversion between bases or between melt and crystal content is applied. TECH: 0.1 mol% per character (wide) or 0.2 mol% (narrow); markers at the nearest character.", badges: [["t", "template"]] },
    "d:th-oh": { h: "OH line position only", body: "The strip marks the printed band position; line width and strength are not drawn (none are given in the source table). Infrared, so the line is drawn dashed in a declared false colour.", badges: [["t", "template"]] },
  });

  let figT: HTMLElement, figV: HTMLElement;
  onMount(() => {
    const offs = [mountThresh(figT, figV), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

{#snippet rows(prefix: string)}
  {#each groups as g (g.d + g.h)}
    <div class="th-g" class:on={`${g.d}|${g.h}` === DEF_G} data-g="{g.d}|{g.h}">
      {#each g.rows as r, i (i)}
        <div class="th-row"><span class="k">{r.keys}</span><span class="v">{@html r.val}</span><span class="s">{r.src} <Badge code={r.code} text={r.abs ? "P(abs)" : undefined} pop={r.pop} /></span><span class="n">{@html r.note}</span></div>
      {/each}
    </div>
  {/each}
  <div class="th-g th-none" data-gnone={prefix}><span class="th-none-t">no sourced threshold</span></div>
{/snippet}

{#snippet notes()}
  {#each DOPS as d (d)}<span class="th-nt" class:on={d === "MgO"} data-note={d}>{@html NOTES[d].html} <Badge code="P-comp" pop={NOTES[d].pop} /></span>{/each}
{/snippet}

<CrystalSection slug="dopants" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Damage-resistant dopants" }, { id: "l2", label: "L2 Thresholds and sites" }, { id: "l3", label: "L3 Mechanism and units" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Damage-resistant dopants">
    <div class="sh"><h2 class="biref">L1 Damage-resistant dopants</h2><span class="meta">Volk & Wöhlecke 2008; Bryan et al. 1984; Furukawa et al. 2000</span></div>
    <div class="body">
      <p class="tx">Most foreign ions in LiNbO<sub>3</sub> take a lithium site, whatever their charge, because the lithium octahedron is the larger one <Badge code="P-comp" pop="r:volk2008|p. 28" />. Iron is the famous troublemaker: it switches between Fe<sup>2+</sup> and Fe<sup>3+</sup>, donates electrons under visible light and holds them in the dark, which writes light patterns into the refractive index (<span class="term" data-pop="g:fe-doping">Fe doping</span>, <a class="lk" href="/quirks/">Chapter 04</a>).</p>
      <p class="tx">Magnesium does the opposite. Above about 5 mol% MgO in <span class="term" data-pop="g:congruent-melting-composition">congruent</span> crystal, optical damage drops by more than a hundredfold <Badge code="P-comp" pop="r:volk2008|p. 34" />. The magnesium displaces the <span class="term" data-pop="g:nb-antisite-nb-li">niobium antisites</span> that trap charge <Badge code="P-comp" pop="r:volk2008|p. 38" /> and raises the <span class="term" data-pop="g:photoconductivity">photoconductivity</span> a hundredfold, so light-induced fields leak away before they can grow <Badge code="P" text="P(abs)" pop="r:bryan1984|abstract" />. Zinc, indium, scandium, hafnium and zirconium act the same way, each above its own <span class="term" data-pop="g:threshold-concentration">threshold</span> <Badge code="P-comp" pop="r:volk2008|p. 35" />.</p>

      <!-- ================= TECH ================= -->
      <figure class="panel th-fig" data-variant="tech" data-pair="thresh" bind:this={figT}>
        <div class="ph"><span>Damage-resistance thresholds of <span class="term" data-pop="g:optical-damage-resistant-ion">Mg, Zn, In, Sc, Hf, Zr</span></span><span><Badge code="P-comp" pop="r:volk2008|pp. 34-43" /> <Badge code="P" text="P(abs)" pop="r:bryan1984|abstract;furukawa2000|abstract" /> <Badge code="template" pop="d:th-axis" /></span></div>
        <div class="th-bar">
          <span class="lbl">dopant</span>
          <div class="seg" role="group" aria-label="Dopant">{#each DOPS as d (d)}<button type="button" data-dop={d} class:on={d === "MgO"}>{@html DOP_HTML[d]}</button>{/each}</div>
          <span class="lbl">host</span>
          <div class="seg" role="group" aria-label="Host crystal">{#each HOSTS as h (h)}<button type="button" data-host={h} class:on={h === "cln"} title={HOST_NAME[h].html}>{HOST_NAME[h].short}</button>{/each}</div>
        </div>
        <div class="ctl"><label for="th-ct">content</label><input id="th-ct" class="th-c" type="range" min="0" max="9" step="0.1" value="2.5" aria-label="Dopant content, mol% as printed"><output class="th-cout" for="th-ct">{I.cOut}</output></div>
        <div class="th-ro"><output class="th-main">{I.main}</output><output class="th-vs">{I.vs}</output></div>
        <div class="th-grid">
          <div class="th-left">
            <div class="th-axw" role="img" aria-label="Concentration axes for the three host crystals with the printed thresholds"><pre class="cx-ascii th-ax w">{@html I.axW}</pre><pre class="cx-ascii th-ax n">{@html I.axN}</pre></div>
            <div class="th-key"><span><b>^</b>printed value</span><span><b>=</b>spread between sources</span><span><b>&lt;--^</b>upper bound</span><span><b class="inv">&nbsp;</b>slider</span></div>
            <div class="th-box" aria-live="polite">{@render rows("t")}</div>
          </div>
          <div class="th-right">
            <div class="th-sub">Li sites, 400 <Badge code="derived" pop="d:th-tile" /></div>
            <pre class="cx-ascii th-tile" role="img" aria-label="Li-site field: dots Li, blanks vacancies, hash Nb antisites, m magnesium">{@html I.tileT}</pre>
            <div class="th-key"><span><b>.</b>Li<sub>Li</sub></span><span><b>&nbsp;</b>V<sub>Li</sub> (blank)</span><span><b>#</b>Nb<sub>Li</sub></span><span><b>m</b>Mg<sub>Li</sub></span></div>
            <div class="th-sitero"><span class="th-siteform">{@html I.siteHtml}</span> <Badge code="P-comp" pop={SITES_POP} /><output class="th-sitelab">{I.siteLabel}</output></div>
            <table class="th-oh">
              <caption><span class="term" data-pop="g:oh-stretch-band">OH band</span>, congruent ([Li]/[Nb] 0.945) <Badge code="P-comp" pop={OH_POP} /> <Badge code="P" text="P(abs)" pop={OH_UM_POP} /></caption>
              <colgroup><col><col></colgroup>
              <tbody>
                <tr><td class="cb hb">{@html I.oc.hb}</td><td class="ca ha">{@html I.oc.ha}</td></tr>
                <tr><td class="cb wb" class:on={I.oc.side === "below"}>{@html I.oc.wb}</td><td class="ca wa" class:on={I.oc.side === "above"}>{@html I.oc.wa}</td></tr>
                <tr><td class="cb ub" class:on={I.oc.side === "below"}>{@html I.oc.ub}</td><td class="ca ua" class:on={I.oc.side === "above"}>{@html I.oc.ua}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="pf th-note">{@render notes()}</div>
      </figure>

      <!-- ================= VISUAL ================= -->
      <figure class="th-v" data-variant="visual" data-pair="thresh" bind:this={figV}>
        <div class="th-vhead"><span class="v-cap"><b>Damage-resistance thresholds</b>printed values only, no interpolation</span><span><Badge code="P-comp" pop="r:volk2008|pp. 34-43" /> <Badge code="P" text="P(abs)" pop="r:bryan1984|abstract;furukawa2000|abstract" /></span></div>
        <div class="th-vctl">
          <div class="v-ctl"><span class="v-lab">Dopant</span><div class="v-seg" role="group" aria-label="Dopant">{#each DOPS as d (d)}<button type="button" data-dop={d} class:on={d === "MgO"}>{@html DOP_HTML[d]}</button>{/each}</div></div>
          <div class="v-ctl"><span class="v-lab">Host crystal</span><div class="v-seg" role="group" aria-label="Host crystal">{#each HOSTS as h (h)}<button type="button" data-host={h} class:on={h === "cln"} title={HOST_NAME[h].html}>{HOST_NAME[h].short}</button>{/each}</div></div>
          <div class="v-ctl th-vslider" style="--w:9ch"><label for="th-vc">Dopant content</label><output class="th-cout" for="th-vc">{I.cOut}</output><input id="th-vc" class="th-c" type="range" min="0" max="9" step="0.1" value="2.5"></div>
        </div>
        <div class="th-vgrid">
          <div class="th-vleft">
            <div class="th-vaxis">{@html I.axis}</div>
            <div class="th-voh">{@html I.ohSvg}</div>
          </div>
          <div class="th-vright">
            <div class="th-vtile v-frame">{@html I.tile}<span class="th-vnod">no sourced site occupancy in this host</span></div>
            <div class="th-vlegend"><span><i class="sw li"></i>Li</span><span><i class="sw v"></i>V<sub>Li</sub></span><span><i class="sw nb"></i>Nb<sub>Li</sub></span><span><i class="sw mg"></i>Mg<sub>Li</sub></span><Badge code="derived" pop="d:th-tile" /></div>
          </div>
        </div>
        <dl class="th-vhud">
          <dt>Setting</dt><dd class="th-main">{I.main}</dd>
          <dt>Against printed thresholds</dt><dd class="th-vs">{I.vs}</dd>
          <dt>OH band <Badge code="P-comp" pop={OH_POP} /></dt><dd class="th-ohro">{I.oh}</dd>
          <dt>Li sites <Badge code="P-comp" pop={SITES_POP} /></dt><dd><span class="th-siteform">{@html I.siteHtml}</span></dd>
          <dt>Shown</dt><dd class="th-sitelab">{I.siteLabel}</dd>
        </dl>
        <div class="th-vbox" aria-live="polite">{@render rows("v")}</div>
        <p class="th-vnote">{@render notes()}</p>
        <div class="v-prov"><span><i class="th-irkey"></i>OH stretch line, 2.8&ndash;2.9 &micro;m: infrared, <span class="term" data-pop="d:th-oh">false colour, dashed</span></span><span>diamonds: solid = read in the paper (abstract), half = via Volk & Wöhlecke 2008</span></div>
      </figure>
      <p class="cx-cap">Pick a dopant and a host, then move the content slider; markers are printed values on the basis each source printed. Cross 4.5 % MgO in congruent crystal and the OH band steps from 3484 to 3534 cm<sup>&minus;1</sup>. In the one proposed site scheme the Nb antisites are already gone at 3 % MgO, below the damage threshold. Switch to near-stoichiometric and the markers fall to 0.2&ndash;2 %, with no measurable damage above 0.78 mol%.</p>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Thresholds and sites">
    <div class="sh"><h2 class="biref">L2 Thresholds and sites</h2><span class="meta">congruent crystal unless stated</span></div>
    <div class="body">
      <h3 class="h3">Damage-resistant dopants</h3>
      <div class="cx-tw">
        <table class="idx cx-t th-t">
          <thead><tr><th>Dopant</th><th>Threshold</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">MgO, first report</td><td>damage reduced at 4.6 % Mg</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 34, orig. Zhong et al. 1980;zhong1980|original abstract, cited via Volk & Wöhlecke 2008" /></td></tr>
            <tr><td class="h">MgO</td><td>&ge; 4.5 at.% MgO; photoconductivity up 100&times;, Glass current unchanged; activation energy 0.1 eV vs 0.5 eV</td><td class="s"><Badge code="P" text="P(abs)" pop="r:bryan1984|abstract" /></td></tr>
            <tr><td class="h">MgO</td><td>about 5 mol% MgO in the congruent melt; 5.5 % &ldquo;close to the Nb<sub>Li</sub> content&rdquo;</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 34, 38" /></td></tr>
            <tr><td class="h">MgO, melt [Li]/[Nb] = 1.2</td><td>lowered to 3 %</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 35" /></td></tr>
            <tr><td class="h">MgO, <span class="term" data-pop="g:sln-nsln">near-stoichiometric</span> ([Li]/[Nb] = 0.993)</td><td>&gt; 0.78 mol%: no measurable photorefractive damage at 532 nm up to 2 MW/cm<sup>2</sup></td><td class="s"><Badge code="P" text="P(abs)" pop="r:furukawa2000|abstract" /></td></tr>
            <tr><td class="h">MgO, near-stoichiometric (other reports)</td><td>1&ndash;2 %; about 1 %; 0.67 mol% (<span class="term" data-pop="g:top-seeded-solution-growth-tssg">TSSG</span>); 0.2 mol%</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 43" /></td></tr>
            <tr><td class="h">ZnO</td><td>about 7 mol% (6 mol% in one report); 7.5 % &ldquo;the largest threshold&rdquo;</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 35, 40" /></td></tr>
            <tr><td class="h">In<sub>2</sub>O<sub>3</sub>, Sc<sub>2</sub>O<sub>3</sub></td><td>below 2 mol% oxide (4 at.%) in the melt</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 35" /></td></tr>
            <tr><td class="h">HfO<sub>2</sub>, ZrO<sub>2</sub></td><td>below 2 mol%</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 35" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Site occupancy with Mg</h3>
      <p class="tx"><span class="term" data-pop="g:li-site-vacancy-model">Li-site vacancy</span> compensation, one proposed scheme <Badge code="P-comp" pop={SITES_POP} />. The 0 % formula has [Li]/[Nb] = 0.941 <Badge code="derived" pop="d:th-ratio" />.</p>
      <div class="cx-tw">
        <table class="idx cx-t th-t th-occ">
          <thead><tr><th class="r">MgO (%)</th><th>Formula</th></tr></thead>
          <tbody>
            <tr><td class="num">0</td><td class="th-f">[Li<sub>0.95</sub> Nb<sub>0.01</sub> V<sub>0.04</sub>] Nb O<sub>3</sub></td></tr>
            <tr><td class="num">3.0</td><td class="th-f">[Li<sub>0.94</sub> Mg<sub>0.03</sub> V<sub>0.03</sub>] Nb O<sub>3</sub></td></tr>
            <tr><td class="num">8.0</td><td class="th-f">[Li<sub>0.84</sub> Mg<sub>0.08</sub> V<sub>0.08</sub>] Nb O<sub>3</sub></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Threshold signatures</h3>
      <div class="cx-tw">
        <table class="idx cx-t th-t">
          <thead><tr><th>Signature</th><th>Below</th><th>Above</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:oh-stretch-band">OH band</span>, Mg ([Li]/[Nb] = 0.945)</td><td class="nw">3484 cm<sup>&minus;1</sup> (&lt; 4.5 % MgO)</td><td class="nw">3534 cm<sup>&minus;1</sup> (&gt; 4.5 % MgO)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 2.4 p. 49" /></td></tr>
            <tr><td class="h">OH band, Zn</td><td class="nw">3484 cm<sup>&minus;1</sup> (&lt; 7 % Zn)</td><td class="nw">3506, 3535 cm<sup>&minus;1</sup></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 2.4 p. 49" /></td></tr>
            <tr><td class="h">OH line, Mg</td><td class="nw">2.87 &micro;m</td><td class="nw">2.83 &micro;m</td><td class="s"><Badge code="P" text="P(abs)" pop="r:bryan1984|abstract" /></td></tr>
            <tr><td class="h">Fe<sup>3+</sup> EPR with Mg or Zn</td><td>Li-site axial spectrum</td><td>new isotropic line above 5.5 % MgO or 7 % ZnO; Fe<sup>3+</sup> on Nb sites deduced</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 45" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Other effects of damage-resistant dopants</h3>
      <p class="tx"><span class="term" data-pop="g:curie-temperature">T<sub>c</sub></span> and density increase, the <span class="term" data-pop="g:uv-absorption-edge">UV edge</span> shifts to shorter wavelength, and the noncritical phase-matching temperature rises; no new absorption appears within 0.35&ndash;4 &micro;m <Badge code="P-comp" pop="r:volk2008|pp. 36-37" />. Distribution coefficient: 1.2&ndash;1.3 at low concentration, about 1 for MgO and ZnO at 5&ndash;6 mol% <Badge code="P-comp" pop="r:volk2008|p. 42" />. Zn in the crystal vs the melt: <i>c</i><sub>crys</sub> = 1.649 <i>c</i><sub>melt</sub> &minus; 0.082 <i>c</i><sub>melt</sub><sup>2</sup> <Badge code="P-comp" pop="r:volk2008|p. 43, orig. Schlarb et al." />.</p>

      <h3 class="h3">Photorefractive and spectroscopic dopants</h3>
      <div class="cx-tw">
        <table class="idx cx-t th-t">
          <thead><tr><th>Ion</th><th>Site and states</th><th>Spectroscopy</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:fe-doping">Fe</span></td><td>Fe<sup>2+</sup> and Fe<sup>3+</sup> on Li sites (congruent); [Fe<sup>2+</sup>]/[Fe<sup>3+</sup>] = 0.1&ndash;0.2 as grown, set by oxidation-reduction anneals</td><td>Fe<sup>2+</sup> to Nb<sup>5+</sup> intervalence band at 2.6 eV (oscillator strength 10<sup>&minus;2</sup>); Fe<sup>2+</sup> d-d at 1.1 eV (4 &times; 10<sup>&minus;4</sup>); O to Fe<sup>3+</sup> charge transfer at 3.1 eV</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 28-29" /></td></tr>
            <tr><td class="h">Fe, near-stoichiometric</td><td>partial Fe<sup>3+</sup> on Nb sites proposed from EPR; disputed</td><td></td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 30" /></td></tr>
            <tr><td class="h">Fe, Cu</td><td><span class="term" data-pop="g:bulk-photovoltaic-effect">photovoltaic (Glass) constants</span> 2.8 &times; 10<sup>&minus;9</sup> and 5.5 &times; 10<sup>&minus;10</sup> cm/V</td><td>saturated photovoltaic fields 10<sup>4</sup>&ndash;10<sup>5</sup> V/cm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 59" /></td></tr>
            <tr><td class="h">Ti</td><td>Ti<sup>4+</sup> substitutes for Li (congruent); Ti<sup>3+</sup> EPR at Li sites independent of [Li]/[Nb]; with 6 % Mg, Ti<sup>3+</sup> mainly on Nb sites</td><td></td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 47" /></td></tr>
            <tr><td class="h">Er</td><td>Er<sup>3+</sup> on Li sites; site-selective spectroscopy resolves at least 11 centres in SLN:Er and 13 in CLN:Er, narrower lines in SLN</td><td>lanthanides sit 30&ndash;50 pm off-centre in the Li octahedron</td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 32-34" /></td></tr>
            <tr><td class="h">Cr</td><td>Cr<sup>3+</sup> on Li sites in low-doped congruent crystal; not photovoltaic-active</td><td></td><td class="s"><Badge code="P-comp" pop="r:volk2008|pp. 27, 31, 59" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Mechanism and units">
    <div class="sh"><h2 class="biref">L3 Mechanism and units</h2><span class="meta">two mechanisms; concentration basis; Ti in-diffusion</span></div>
    <div class="body">
      <p class="tx"><b>Two mechanisms, both partly right.</b> (1) Mg fills Li vacancies and replaces Nb<sub>Li</sub> until the antisites are gone; the threshold scales with the antisite content and falls with Li enrichment <Badge code="P-comp" pop="r:volk2008|p. 38" />. (2) Diffraction on Zn- and In-doped crystal shows that near and above threshold the dopant begins to occupy Nb sites; Volk & Wöhlecke 2008 calls this association of the threshold with partial Nb-site incorporation &ldquo;unambiguous&rdquo; <Badge code="P-comp" pop="r:volk2008|p. 40" />. Whether antisites vanish at the threshold or at a lower &ldquo;first threshold&rdquo; is open; one energetic analysis finds the two-step scheme unfavourable and simultaneous substitution more likely <Badge code="P-comp" pop="r:volk2008|p. 39, orig. Donnerberg 1996" />.</p>
      <p class="tx"><b>Units trap.</b> MgO content is written either as MgO/(Li<sub>2</sub>O + MgO + Nb<sub>2</sub>O<sub>5</sub>) or as MgO/(LiNbO<sub>3</sub> + MgO); for usual concentrations the second is about twice the first <Badge code="P-comp" pop="r:volk2008|pp. 36-37" />. Melt and crystal concentrations also differ through the distribution coefficient (L2). No exact conversion between the two bases is given, so the threshold axes place each value on the basis its source printed.</p>
      <p class="tx"><b><span class="term" data-pop="g:ti-indiffusion">Ti in-diffusion</span></b> at 950&ndash;1020 &deg;C inverts the polarization of a surface layer on the +c face only <Badge code="P" text="P(abs)" pop="r:miyazawa1979|abstract" /> <Badge code="P-comp" pop="r:volk2008|p. 177" />; domains and their inversion: <a class="lk" href="/crystal/domains/">1.8</a>. Waveguide fabrication belongs to <a class="lk" href="/making/">Chapter 05</a>.</p>
    </div>
  </section>
</CrystalSection>
