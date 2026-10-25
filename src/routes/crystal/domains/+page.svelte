<!-- 1.8 Domains, internal field, coercive field (content/chapters/01-crystal/manuscript.md Sec. 8; FIG-01-08 Hysteresis
     comparator). Figure: src/lib/figures/crystal/hy.ts (client), hyrender.ts (renderers, also run at prerender),
     hy-data.ts (sourced anchors). -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import CrystalSection from "$lib/figures/crystal/CrystalSection.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountHyst } from "$lib/figures/crystal/hy";
  import { HY } from "$lib/figures/crystal/hy-data";
  import { LOOP_VB, WAFER_VB } from "$lib/figures/crystal/hyrender";
  import { hyst } from "$lib/stores/crystal";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { usePops } from "$lib/content/pops";
  import "$lib/figures/crystal/hy.css";

  let { data }: { data: PageData } = $props();
  const I = $derived(data.init);
  const R = $derived(data.init.R);
  const N = $derived(data.num);
  const sel = hyst.sel;

  // svelte-ignore state_referenced_locally
  const n = data.num;
  usePops({
    "d:hy-sw": { h: "Switching fields from E<sub>c</sub> and E<sub>int</sub>", body: "Virgin P<sub>s</sub> along +z. Forward switching (away from the growth direction) at E<sub>down</sub> = &minus;E<sub>c</sub>, reverse switching at E<sub>up</sub> = E<sub>c</sub> &minus; 2E<sub>int</sub>; loop centre (E<sub>down</sub> + E<sub>up</sub>)/2 = &minus;E<sub>int</sub>, width E<sub>up</sub> &minus; E<sub>down</sub> = 2E<sub>c</sub> &minus; 2E<sub>int</sub>. A loop shifted by E<sub>int</sub> along the original P<sub>s</sub> gives exactly these two fields. Ranges by interval arithmetic over the bounds of E<sub>c</sub> and E<sub>int</sub>. E<sub>int</sub> &ldquo;tends to 0&rdquo; (near-stoichiometric, near-SLN + 1% MgO) and &ldquo;not reported&rdquo; (near-SLN + 2% MgO) are drawn as 0.", badges: [["d", "derived"]] },
    "d:hy-v": { h: "Wafer voltage", body: "V = E<sub>c</sub> t: the voltage that puts the forward coercive field across a plate of thickness t between full-face electrodes, no fringing. A range of E<sub>c</sub> gives a range of V; 1.8 &plusmn; 0.2 kV/mm gives V &plusmn; 0.2 t.", badges: [["d", "derived"]] },
    "hy-shape": { h: "Loop shape: template", body: "Each branch is P = P<sub>s</sub> tanh((E &minus; E<sub>sw</sub>)/w), w = 0.05 E<sub>c</sub>, a display choice; no LN source gives the loop shape. Sourced: the switching fields and P<sub>s</sub>. The band of each loop spans P<sub>s</sub> = 0.71&ndash;0.80 C/m<sup>2</sup> and the E<sub>c</sub>, E<sub>int</sub> ranges. Both P<sub>s</sub> values were measured on undoped crystal; for the MgO- and ZnO-doped crystals the sources hold no P<sub>s</sub>, and the same band is drawn.", badges: [["t", "template"]] },
    "d:hy-joy": { h: "Congruent to near-stoichiometric", body: `Forward E<sub>c</sub> 21 &rarr; 6.0&ndash;6.5 kV/mm (ratio ${n.ecRatio}). Loop width 2E<sub>c</sub> &minus; 2E<sub>int</sub>: ${n.wC} &rarr; ${n.wS} kV/mm (ratio ${n.wRatio}). Congruent loop centre ${n.ctrC} kV/mm, reverse switching at ${n.eupC} kV/mm.`, badges: [["d", "derived"]] },
  });

  let figRoot: HTMLElement;
  onMount(() => {
    const offs = [mountHyst(figRoot), installRangeFill()];
    return () => offs.forEach((f) => f());
  });
</script>

<CrystalSection slug="domains" pops={data.pops} refs={data.refs}
  depth={[{ id: "l1", label: "L1 Domains and the field to flip them" }, { id: "l2", label: "L2 Field anchors and switching" }, { id: "l3", label: "L3 Unipolarity, conflicts, temperature" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Domains and the field to flip them">
    <div class="sh"><h2 class="biref">L1 Domains and the field to flip them</h2><span class="meta">Volk & Wöhlecke 2008 Table 7.1; Gopalan et al. 1998; Chen et al. 2003</span></div>
    <div class="body" bind:this={figRoot}>
      <p class="tx">A region of crystal with one polarization direction is a <span class="term" data-pop="g:ferroelectric-domain">domain</span>. In LiNbO<sub>3</sub> the polarization can point only up or down <i>c</i>, so neighbouring domains always differ by 180&deg; and are separated by thin <span class="term" data-pop="g:180-deg-domain-wall">walls</span> <Badge code="P" text="P(abs)" pop="r:gopalan2007|abstract" />. Wafers are sold single-domain.</p>
      <p class="tx">Flipping a domain takes a field of about 21 kV per millimetre in <span class="term" data-pop="g:congruent-melting-composition">congruent</span> crystal (10.5 kV across a standard 0.5 mm wafer), but only 6.0&ndash;6.5 kV/mm (or 2.1&ndash;2.5 kV/mm on another page of the same compilation) in near-stoichiometric crystal <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span> and under 2 kV/mm in near-stoichiometric crystal with a little MgO <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /> <Badge code="P" text="P(abs)" pop="r:chen2003|abstract" />. Congruent crystal also remembers which way it grew: it flips more easily back to its original direction than away from it, as if a built-in bias field of about 2.5 kV/mm pointed along the original polarization <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" />. That bias is attributed to the same <span class="term" data-pop="g:nb-antisite-nb-li">antisite defects</span> as optical damage and vanishes in <span class="term" data-pop="g:sln-nsln">stoichiometric</span> crystal (L3) <Badge code="P-comp" pop="r:volk2008|pp. 195-197" />.</p>
      <p class="tx">Seen from above, domains in LiNbO<sub>3</sub> grow as hexagons whose walls are parallel to the crystal's <span class="term" data-pop="g:mirror-plane">mirror planes</span>, an image of the threefold symmetry <Badge code="P-comp" pop="r:volk2008|p. 186" /> <Badge code="P" text="P(abs)" pop="r:gopalan1999|abstract" />.</p>

      <ModeVariant>
        {#snippet tech()}
        <figure class="panel hy-t" data-pair="hyst">
          <div class="ph"><span>Hysteresis comparator: P&ndash;E loops on sourced anchors, room temperature, virgin P<sub>s</sub> along +z</span><span><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /> <Badge code="derived" pop="d:hy-sw" /> <Badge code="template" pop="hy-shape" /></span></div>
          <div class="ctl hy-row"><span class="k">Emphasize</span><div class="seg hy-seg" role="group" aria-label="Emphasized crystal">{#each HY as c (c.id)}<button type="button" data-hy-sel={c.id} class:on={c.id === sel} aria-pressed={c.id === sel}>{c.short}</button>{/each}</div></div>
          <div class="hy-tg">
            <div class="hy-artw">
              <pre class="cx-ascii hy-art" role="img" aria-label="ASCII P-E loops: polarization 1 to -1 C/m2 in 20 rows, field -25 to 25 kV/mm in 80 columns; one glyph per crystal, emphasized crystal in bold; internal-field arrow below the axis">{@html I.art}</pre>
              <div class="hy-key">{#each HY as c (c.id)}<span><b>{c.glyph}</b>{c.short}</span>{/each}<span><b>!</b>near-SLN E<sub>c</sub> 2.1&ndash;2.5, p. 118 <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span></span><span><b>&lt;==|</b>E<sub>int</sub>, E = 0 to loop centre</span><span>row 0.1 C/m<sup>2</sup>, column 0.625 kV/mm; _ P = 0, : E = 0</span></div>
            </div>
            <div class="hy-tside">
              <div class="hy-hud"><output class="cx-ro" data-ro="line">{R.line}</output><output class="cx-ro" data-ro="vline">{R.vline}</output></div>
              <table class="kv hy-kv">
                <colgroup><col><col class="cv"><col class="cs"></colgroup>
                <tbody>
                  <tr><td>Crystal</td><td class="v" colspan="2"><span class="cx-ro" data-ro="name">{R.name}</span></td></tr>
                  <tr><td>P<sub>s</sub></td><td class="v">0.71&ndash;0.80 C/m<sup>2</sup></td><td class="s"><span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span></td></tr>
                  <tr><td>E<sub>c</sub>, forward</td><td class="v"><span class="cx-ro" data-ro="ec">{R.ec}</span></td><td class="s">{#each HY as c (c.id)}<span class="hy-g" class:on={c.id === sel} data-hy-g={c.id}><Badge code={c.ecCode} text={c.ecBadge} pop={c.ecPop} />{#if c.id === "sln"} <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span>{/if}</span>{/each}</td></tr>
                  <tr><td>E<sub>int</sub></td><td class="v"><span class="cx-ro" data-ro="eint">{R.eint}</span></td><td class="s">{#each HY as c (c.id)}<span class="hy-g" class:on={c.id === sel} data-hy-g={c.id}>{#if c.id === "cln"}<span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span> <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" />{:else}<Badge code={c.eintCode} text={c.eintBadge} pop={c.eintPop} />{/if}</span>{/each}</td></tr>
                  <tr><td>E<sub>int</sub> as drawn</td><td class="v" colspan="2"><span class="cx-ro" data-ro="eintNote">{R.eintNote}</span></td></tr>
                  <tr><td>Forward switching, &minus;E<sub>c</sub>, kV/mm</td><td class="v"><span class="cx-ro" data-ro="edownN">{R.edownN}</span></td><td class="s"><Badge code="derived" pop="d:hy-sw" /></td></tr>
                  <tr><td>Reverse switching, E<sub>c</sub> &minus; 2E<sub>int</sub>, kV/mm</td><td class="v"><span class="cx-ro" data-ro="eupN">{R.eupN}</span></td><td class="s"><Badge code="derived" pop="d:hy-sw" /></td></tr>
                  <tr><td>Loop centre, &minus;E<sub>int</sub>, kV/mm</td><td class="v"><span class="cx-ro" data-ro="ctrN">{R.ctrN}</span></td><td class="s"><Badge code="derived" pop="d:hy-sw" /></td></tr>
                  <tr><td>Loop width, kV/mm</td><td class="v"><span class="cx-ro" data-ro="widthN">{R.widthN}</span></td><td class="s"><Badge code="derived" pop="d:hy-sw" /></td></tr>
                  <tr><td>V = E<sub>c</sub> t, kV</td><td class="v"><span class="cx-ro" data-ro="v">{R.v}</span></td><td class="s"><Badge code="derived" pop="d:hy-v" /></td></tr>
                  <tr><td>V, near-SLN E<sub>c</sub> of p. 118, kV</td><td class="v"><span class="cx-ro" data-ro="valtN">{R.valtN}</span></td><td class="s"><span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="cx-tw">
            <table class="idx cx-t hy-at">
              <thead><tr><th>Plot</th><th>Crystal</th><th class="r">E<sub>c</sub> fwd, kV/mm</th><th class="r">E<sub>int</sub>, kV/mm</th><th class="r">V at t, kV</th><th>Source</th></tr></thead>
              <tbody>
                {#each HY as c (c.id)}
                <tr data-hy-row={c.id} class:on={c.id === sel}>
                  <td><button type="button" class="hy-tog" class:on={hyst.show[c.id]} data-t data-hy-show={c.id} aria-pressed={hyst.show[c.id]} aria-label="Overlay {c.name}">{c.glyph}</button></td>
                  <td class="h">{c.name}</td>
                  <td class="num">{c.ecTxt}{#if c.alt}<span class="hy-alt">&nbsp;/ 2.1&ndash;2.5</span>{/if}</td>
                  <td class="num">{c.eintTxt}</td>
                  <td class="num"><span class="cx-ro" data-ro="v-{c.id}">{R[`v-${c.id}`]}</span></td>
                  <td class="s"><Badge code={c.ecCode} text={c.ecBadge} pop={c.ecPop} />{#if c.id === "sln"} <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span>{/if}{#if c.id === "cln"} <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span>{/if}</td>
                </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="ctl hy-trow"><label for="hy-t">Wafer thickness t</label><input id="hy-t" data-hy="t" type="range" min="0.1" max="1" step="0.01" value={hyst.t}><output for="hy-t" class="cx-ro" data-ro="t">{R.t}</output></div>
          <div class="pf"><span>switching fields <Badge code="derived" pop="d:hy-sw" /></span><span>tanh shape, w = 0.05 E<sub>c</sub> <Badge code="template" pop="hy-shape" /></span><span>P<sub>s</sub> band 0.71&ndash;0.80 C/m<sup>2</sup> <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span></span><span>V = E<sub>c</sub> t <Badge code="derived" pop="d:hy-v" /></span></div>
        </figure>
        {/snippet}
        {#snippet visual()}
        <figure class="hy-v" data-pair="hyst">
          <div class="hy-vctl">
            <div class="v-ctl"><span class="v-lab">Crystal</span><div class="v-seg hy-vseg" role="group" aria-label="Emphasized crystal">{#each HY as c (c.id)}<button type="button" data-hy-sel={c.id} class:on={c.id === sel} aria-pressed={c.id === sel}>{c.short}</button>{/each}</div></div>
            <div class="v-ctl"><span class="v-lab">Other crystals</span><div class="v-seg" role="group" aria-label="Other crystals in the plot"><button type="button" data-hy-oth="1" class="on" aria-pressed="true">Shown</button><button type="button" data-hy-oth="0" aria-pressed="false">Hidden</button></div></div>
          </div>
          <div class="hy-vgrid">
            <div class="hy-vplot">
              <div class="hy-vname"><output class="hy-nm" data-ro="name">{R.name}</output><span class="hy-vsrc">{#each HY as c (c.id)}<span class="hy-g" class:on={c.id === sel} data-hy-g={c.id}><Badge code={c.ecCode} text={c.ecBadge} pop={c.ecPop} />{#if c.id === "sln"} <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span>{/if}{#if c.id === "cln"} <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span> <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" />{/if}</span>{/each}</span></div>
              <div class="hy-vstage"><svg class="hy-loop" viewBox={LOOP_VB} role="img" aria-label="P-E loop bands of the selected crystal, emphasized, over thin bands of the other crystals; arrow along P = 0 from E = 0 to the loop centre">{@html I.loop}</svg></div>
              <div class="hy-leg">
                <span><i class="sw s"></i>selected: band over P<sub>s</sub> 0.71&ndash;0.80 C/m<sup>2</sup> <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span> and the E<sub>c</sub>, E<sub>int</sub> ranges</span>
                <span><i class="sw o"></i>other crystals</span>
                <span><i class="sw alt"></i>near-SLN E<sub>c</sub> 2.1&ndash;2.5 kV/mm, p. 118 <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span></span>
                <span><i class="sw ar"></i>E<sub>int</sub>: E = 0 to loop centre <Badge code="derived" pop="d:hy-sw" /></span>
                <span><i class="sw mk"></i>congruent E<sub>int</sub> about 2.5 kV/mm <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></span>
                <span>tanh shape <Badge code="template" pop="hy-shape" /></span>
              </div>
            </div>
            <div class="hy-vside">
              <div class="hy-vv"><span class="hy-vk">Voltage across the wafer <Badge code="derived" pop="d:hy-v" /></span><output class="hy-big" data-ro="vk">{R.vk}</output><output class="hy-valt" data-ro="valt">{R.valt}</output></div>
              <div class="hy-wstage"><svg class="hy-waf" viewBox={WAFER_VB} role="img" aria-label="Wafer cross-section to scale with thickness: LN plate between gold electrodes, virgin polarization arrows up, voltage source, thickness dimension">{@html I.waf}</svg></div>
              <div class="v-ctl" style="--w:8ch"><label for="hyv-t">Wafer thickness</label><output for="hyv-t" data-ro="t">{R.t}</output><input id="hyv-t" data-hy="t" type="range" min="0.1" max="1" step="0.01" value={hyst.t}></div>
              <dl class="v-hud hy-hud">
                <dt>E<sub>c</sub>, forward</dt><dd data-ro="ec">{R.ec}</dd>
                <dt>E<sub>int</sub></dt><dd data-ro="eint">{R.eint}</dd>
                <dt>Forward switching</dt><dd data-ro="edown">{R.edown}</dd>
                <dt>Reverse switching</dt><dd data-ro="eup">{R.eup}</dd>
                <dt>Loop centre</dt><dd data-ro="ctr">{R.ctr}</dd>
                <dt>Loop width</dt><dd data-ro="width">{R.width}</dd>
              </dl>
            </div>
          </div>
        </figure>
        {/snippet}
      </ModeVariant>
      <p class="cx-cap hy-cap">Select congruent, then near-stoichiometric: the forward switching field drops from 21 to 6.0&ndash;6.5 kV/mm, the loop narrows from {N.wC} to {N.wS} kV/mm, and its centre slides from {N.ctrC} kV/mm back to zero as E<sub>int</sub> vanishes <Badge code="derived" pop="d:hy-joy" />. Drag the thickness: at 0.50 mm the voltage is 10.5 kV for congruent and 0.90 &plusmn; 0.10 kV for near-SLN + 2% MgO <Badge code="derived" pop="d:hy-v" />. Ranges are drawn as bands; the loop shape is a template <Badge code="template" pop="hy-shape" />.</p>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Field anchors and switching">
    <div class="sh"><h2 class="biref">L2 Field anchors and switching</h2><span class="meta">E<sub>c</sub>, E<sub>int</sub>; V = E<sub>c</sub> t; switching time; domain shapes; etching</span></div>
    <div class="body">
      <p class="tx"><span class="term" data-pop="g:coercive-field">Coercive</span> and <span class="term" data-pop="g:internal-field">internal fields</span> at room temperature (literature averages compiled by Volk & Wöhlecke 2008, plus individual reports):</p>
      <div class="cx-tw">
        <table class="idx cx-t hy-ft">
          <thead><tr><th>Crystal</th><th>E<sub>c</sub> (forward, from virgin state)</th><th>E<sub>int</sub></th><th class="r">Source</th></tr></thead>
          <tbody>
            <tr><td class="h">Congruent</td><td>21 kV/mm (210&ndash;220 kV/cm)</td><td>2.2&ndash;3.4 kV/mm (22.2 kV/cm refined; 33.5 kV/cm first report) <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span></td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185 and p. 181" /></td></tr>
            <tr><td class="h">Congruent</td><td></td><td>about 2.5 kV/mm</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td></tr>
            <tr><td class="h">Near-stoichiometric</td><td>6.0&ndash;6.5 kV/mm (Table 7.1) | 2.1&ndash;2.5 kV/mm (p. 118) <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span></td><td>tends to 0</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td></tr>
            <tr><td class="h">Ratio congruent / near-stoichiometric (C = 0.484 vs 0.498)</td><td>4&ndash;5</td><td></td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" /></td></tr>
            <tr><td class="h">Ratio, another near-stoichiometric crystal</td><td>about 3</td><td></td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 184;chen2001|via Volk & Wöhlecke 2008 p. 184" /></td></tr>
            <tr><td class="h">Congruent + 5% MgO</td><td>6.0&ndash;6.8 kV/mm (table average); switching at 4.45 kV/mm (0.5 mm wafer); poling with 2.5 kV/mm pulses (4.8% MgO, 0.3 mm)</td><td>0.5 kV/mm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185, p. 184" /></td></tr>
            <tr><td class="h">Congruent + 8% ZnO</td><td>2.5&ndash;3.5 kV/mm</td><td>0.5 kV/mm</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td></tr>
            <tr><td class="h">Near-stoichiometric + 1% MgO</td><td>2.5 kV/mm</td><td>tends to 0</td><td class="s"><Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185" /></td></tr>
            <tr><td class="h">Near-stoichiometric + 2.0 mol% MgO (<span class="term" data-pop="g:vte">VTE</span>)</td><td>1.8 &plusmn; 0.2 kV/mm</td><td>not reported</td><td class="s"><Badge code="P" text="P(abs)" pop="r:chen2003|abstract" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Wafer voltage</h3>
      <p class="tx">Voltage that puts the forward coercive field across a wafer of thickness t, V = E<sub>c</sub> t <Badge code="derived" pop="d:hy-v" />:</p>
      <div class="cx-tw">
        <table class="idx cx-t hy-wt">
          <thead><tr><th>Crystal</th><th class="r">t = 0.5 mm</th><th class="r">t = 1 mm</th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each N.wafer as w (w.k)}<tr><td class="h">{@html w.k}{#if w.flag} <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span>{/if}</td><td class="num">{@html w.a} kV</td><td class="num">{@html w.b} kV</td><td class="s"><Badge code="derived" pop="d:hy-v" /></td></tr>{/each}
          </tbody>
        </table>
      </div>

      <h3 class="h3">Switching time</h3>
      <p class="tx">Empirical activation law with internal field <Badge code="P-comp" pop="r:volk2008|Eq. (7.32) p. 186, orig. Gopalan et al." />:</p>
      <div class="eq"><math display="block"><mrow><msub><mi>t</mi><mi>s</mi></msub><mo>&sim;</mo><mi>exp</mi><mrow><mo>(</mo><mfrac><mi>&delta;</mi><mrow><mi>E</mi><mo>&plusmn;</mo><msub><mi>E</mi><mi>int</mi></msub></mrow></mfrac><mo>)</mo></mrow></mrow></math><span class="eqn"><Badge code="P-comp" pop="r:volk2008|Eq. (7.32) p. 186" /></span></div>
      <p class="tx">+ for reverse switching, &minus; for forward switching: the internal field aids the return to the original direction and opposes the first reversal.</p>

      <h3 class="h3">Domain shapes</h3>
      <div class="cx-tw">
        <table class="idx cx-t hy-dt">
          <thead><tr><th>Domain-shape observation</th><th class="r">Source</th></tr></thead>
          <tbody>
            <tr><td class="h">Congruent LiNbO<sub>3</sub>: almost equilateral hexagons, walls parallel to the yz (<span class="term" data-pop="g:glide-plane">glide</span>) planes</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 186" /></td></tr>
            <tr><td class="h">Congruent LiNbO<sub>3</sub>: nucleate and grow as six-sided polygons; spike-like wall velocity, pinning-depinning</td><td class="s"><Badge code="P" text="P(abs)" pop="r:gopalan1999|abstract" /></td></tr>
            <tr><td class="h">Stoichiometric LiNbO<sub>3</sub> and LiTaO<sub>3</sub>: <span class="term" data-pop="g:y-wall">Y-walls</span>, parallel to (112&#773;0), lower in energy than X-walls, parallel to (101&#773;0), so domains are hexagons bounded by Y-walls (DFT)</td><td class="s"><Badge code="P" text="P(abs)" pop="r:lee2011|abstract" /></td></tr>
            <tr><td class="h">Congruent LiNbO<sub>3</sub>: antisite&ndash;wall interactions too weak to reverse that order, domains remain hexagonal; congruent LiTaO<sub>3</sub>: triangles bounded by one type of X-wall</td><td class="s"><Badge code="P" text="P(abs)" pop="r:lee2011|abstract" /></td></tr>
            <tr><td class="h">Antiparallel domains nucleate near the <span class="term" data-pop="g:plus-z-face">+z surface</span> (without illumination)</td><td class="s"><Badge code="P-comp" pop="r:volk2008|p. 199" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Etching reveals domains: the &minus;c end of a domain etches much faster than the +c end <Badge code="P-comp" pop="r:volk2008|p. 168" />, first used on LN by Nassau, Levinstein and Loiacono <Badge code="P" pop="r:nassau1965|Crossref title" />.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Unipolarity, conflicts, temperature">
    <div class="sh"><h2 class="biref">L3 Unipolarity, conflicts, temperature</h2><span class="meta">Volk & Wöhlecke 2008 pp. 176-199; Gopalan & Gupta 1996; Gopalan et al. 1998</span></div>
    <div class="body">
      <p class="tx"><b><span class="term" data-pop="g:unipolarity">Unipolarity</span> and its origin.</b> The asymmetric P&ndash;E loop (forward field larger than reverse) was measured with liquid electrodes on z-cut plates; E<sub>int</sub> did not depend on thickness (0.5 and 0.25 mm), so it is a bulk property <Badge code="P-comp" pop="r:volk2008|p. 181" />. Hydrogen content has no effect on switching or internal field <Badge code="P" text="P(abs)" pop="r:gopalan1998|abstract" />. After reversal, E<sub>int</sub> keeps its original direction at room temperature and realigns with the new P<sub>s</sub> after heating above a threshold of about 100 &deg;C in LN (150 &deg;C in LiTaO<sub>3</sub>) <Badge code="P-comp" pop="r:volk2008|p. 182" />. The proposed mechanism is a frozen defect dipole, an <span class="term" data-pop="g:nb-antisite-nb-li">Nb<sub>Li</sub> antisite</span> with its four <span class="term" data-pop="g:li-vacancy">Li vacancies</span>, that cannot reorient with P<sub>s</sub> at room temperature; Volk & Wöhlecke 2008 notes that no spectroscopic proof of dipole realignment exists and that the model does not explain the very low E<sub>c</sub> of highly doped crystals, which contain other defects <Badge code="P-comp" pop="r:volk2008|pp. 195-197" />. In LiTaO<sub>3</sub> the internal field correlates with changes in the <span class="term" data-pop="g:oh-stretch-band">OH<sup>&minus;</sup> band</span> after reversal <Badge code="P" text="P(abs)" pop="r:gopalan1996|abstract" />.</p>
      <p class="tx"><b>Conflicts in the numbers.</b> (1) Near-stoichiometric E<sub>c</sub>: Volk & Wöhlecke 2008 Table 7.1 gives 60&ndash;65 kV/cm, while its p. 118 gives 21&ndash;25 kV/cm citing Gopalan et al. 1998, whose abstract gives only a ratio <Badge code="P-comp" pop="r:volk2008|Table 7.1 p. 185 and p. 118" /> <span class="cx-flag" tabindex="0" data-pop="c:ec-sln">conflict</span>. A factor of 10 between two pages of one book suggests a unit slip (speculation); the figure draws the table value and marks the other. (2) The congruent E<sub>int</sub> is printed &ldquo;2&ndash;33 kV/cm&rdquo; in Table 7.1; the text on p. 181 gives 33.5 and later 22.2 kV/cm, so the table entry is read as 22&ndash;33 kV/cm <span class="cx-flag" tabindex="0" data-pop="c:eint-cln">misprint</span>. (3) E<sub>c</sub> depends on how it is defined (threshold of first domains, half-switched charge, loop midpoint), ramp rate, temperature and Li content within &ldquo;near-stoichiometric&rdquo; <Badge code="P-comp" pop="r:volk2008|pp. 181-186" />.</p>
      <p class="tx"><b>Temperature.</b> E<sub>c</sub> falls with temperature; in laser-heated crystal at 800&ndash;900 &deg;C antiparallel domains appeared at 200 V/cm <Badge code="P-comp" pop="r:volk2008|p. 176" />. Ultraviolet light lowers the coercive field of Mg-doped crystal near threshold by more than 30% at 305 nm and 10&ndash;12 mW/cm<sup>2</sup> <Badge code="P-comp" pop="r:volk2008|p. 198" />.</p>
      <p class="tx"><b>How the figure is computed.</b> Each loop is built from the forward coercive field and the internal field only: E<sub>down</sub> = &minus;E<sub>c</sub>, E<sub>up</sub> = E<sub>c</sub> &minus; 2E<sub>int</sub>, centre &minus;E<sub>int</sub> <Badge code="derived" pop="d:hy-sw" />. The branches are tanh curves of template steepness <Badge code="template" pop="hy-shape" />; the drawn band is the pointwise minimum to maximum over the bounds of E<sub>c</sub>, E<sub>int</sub> and P<sub>s</sub> (0.71 and 0.80 C/m<sup>2</sup> <span class="cx-flag" tabindex="0" data-pop="c:ps">conflict</span>), so a range never collapses to one invented value.</p>
      <div class="eq"><math display="block"><mrow><msub><mi>E</mi><mi>down</mi></msub><mo>=</mo><mo>&minus;</mo><msub><mi>E</mi><mi>c</mi></msub><mo>,</mo><mspace width="1.2em"/><msub><mi>E</mi><mi>up</mi></msub><mo>=</mo><msub><mi>E</mi><mi>c</mi></msub><mo>&minus;</mo><mn>2</mn><msub><mi>E</mi><mi>int</mi></msub><mo>,</mo><mspace width="1.2em"/><mi>P</mi><mo>=</mo><msub><mi>P</mi><mi>s</mi></msub><mi>tanh</mi><mfrac><mrow><mi>E</mi><mo>&minus;</mo><msub><mi>E</mi><mi>sw</mi></msub></mrow><mi>w</mi></mfrac></mrow></math><span class="eqn"><Badge code="derived" pop="d:hy-sw" /> <Badge code="template" pop="hy-shape" /></span></div>
    </div>
  </section>
</CrystalSection>
