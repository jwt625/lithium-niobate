<!-- Tensors and frame conventions (flagship F4), full screen. TECH: input panel, rotated Voigt matrix with frame-sign marks, rotation
     matrix, export boxes. VISUAL: oblique drawing of the crystal axes in the wafer frame, glyph grid of the rotated tensor,
     44 px controls, the same export. One state (src/lib/stores/p09.ts tx); physics: src/lib/physics/tensors.ts. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { TX_KINDS, CUTS } from "$lib/figures/p09/tensorx";
  import { mountTx, recLabel } from "$lib/figures/p09/txview";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { TX_DEFAULT } from "$lib/stores/p09";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const I = $derived(data.init);
  const kinds = TX_KINDS.filter((k) => data.records.some((r) => r.tensor === k.tensor));
  const recs0 = $derived(data.records.filter((r) => r.tensor === "piezo-stress-e"));
  const rec0 = $derived(data.records.find((r) => r.id === data.pick["piezo-stress-e"]));
  const plain = (s: string): string => s.replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<sub>(.*?)<\/sub>/g, "_$1").replace(/&epsilon;/g, "ε").replace(/<[^>]+>/g, "");
  usePops({
    ieee176: { h: "IEEE Std 176-1987 axes for 3m", body: "x perpendicular to a mirror plane, y in it, z along the polar c axis, right-handed. +Z: the face that turns negative on compression (positive d<sub>33</sub>); +Y: positive d<sub>22</sub>. In this frame c<sub>14</sub> &gt; 0 and e<sub>22</sub> &gt; 0 for the kushibiki1999 set.", badges: [["p", "P"]], src: "IEEE Std 176-1987, <a href='https://doi.org/10.1109/IEEESTD.1988.79638'>doi:10.1109/IEEESTD.1988.79638</a>, Table 5 and Sec. 3.2.5." },
    euler: { h: "Euler angles (ZXZ)", body: "R = R<sub>z</sub>(&alpha;) R<sub>x</sub>(&beta;) R<sub>z</sub>(&gamma;) maps crystal components to wafer components; its columns are the crystal axes in the wafer frame. Named cuts: wafer normal = global z, propagation = global x. (YXl)&theta; turns +Y toward +Z by &theta; about X; 128&deg; Y-X is the SAW filter cut." },
  });
  let root: HTMLElement;
  onMount(() => { const off = [mountTx(root.closest("main") as HTMLElement, data.records, data.pick), installRangeFill()]; return () => off.forEach((f) => f()); });
</script>

{#snippet sliders(prefix: string)}
  {#each [["alpha", "&alpha;", -180, 180, I.euler[0]], ["beta", "&beta;", 0, 180, I.euler[1]], ["gamma", "&gamma;", -180, 180, I.euler[2]]] as [k, lab, lo, hi, v] (k)}
    {#if prefix === "t"}
      <div class="ctl"><label for="tx-{k}">Euler {@html lab}</label><input id="tx-{k}" type="range" min={lo} max={hi} step="0.5" value={v} data-tx={k}><output for="tx-{k}" data-txf={k}>{(+v).toFixed(1)}°</output></div>
    {:else}
      <div class="v-ctl" style="--w:7ch"><label for="v-tx-{k}">Euler {@html lab}</label><output for="v-tx-{k}" data-txf={k}>{(+v).toFixed(1)}°</output><input id="v-tx-{k}" type="range" min={lo} max={hi} step="0.5" value={v} data-tx={k}></div>
    {/if}
  {/each}
{/snippet}

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Lab", href: "/lab/" }, { label: "Tensors" }]} title="Tensors and frame conventions"
  depth={[{ id: "explore", label: "Rotated tensor" }, { id: "conv", label: "Conventions" }]}>

  <section class="lay" id="explore" data-pair="explore" data-spine="Rotated tensor" bind:this={root}>
    <div class="sh"><h2 class="biref">Rotated tensor</h2><span class="meta"><span class="term" data-pop="ieee176">IEEE Std 176-1987</span> crystal axes; wafer frame z = normal, x = propagation</span></div>

    <!-- ---------- TECH ---------- -->
    <div class="p9-tx" data-variant="tech">
      <div class="panel p9-tx-in">
        <div class="ph"><span>Inputs</span><button type="button" class="p9-copy" data-txreset>reset</button></div>
        <div class="ctl"><label for="tx-t">Tensor</label><select id="tx-t" class="p9-sel" data-tx="tensor">{#each kinds as k (k.tensor)}<option value={k.tensor} selected={k.tensor === "piezo-stress-e"}>{plain(k.label)}</option>{/each}</select><span></span></div>
        <div class="ctl"><label for="tx-r">Record</label><select id="tx-r" class="p9-sel" data-tx="record" data-t="piezo-stress-e">{#each recs0 as r (r.id)}<option value={r.id} selected={r.id === rec0?.id}>{@html recLabel(r)}</option>{/each}</select><span></span></div>
        <div class="ctl"><label for="tx-c">Cut</label><select id="tx-c" class="p9-sel" data-tx="cut">{#each CUTS as c (c)}<option value={c} selected={c === TX_DEFAULT.cut}>{c === "Euler" ? "Euler angles (custom)" : c}</option>{/each}</select><span></span></div>
        {@render sliders("t")}
        <div class="ctl"><span class="k">Frame</span><div class="seg" role="group" aria-label="Frame sign"><button type="button" data-txt="rot180" aria-pressed="false">180° about z</button><button type="button" data-txt="flipZ" aria-pressed="false">+z reversed</button></div><span></span></div>
        <div class="pf"><span>Record <span class="b p" data-txo="status" data-pop="tx-rec">{rec0?.status}</span></span><span class="p9-tx-src" data-txo="src">{rec0?.source}</span></div>
        <div class="pf p9-tx-cond" data-txo="cond">{[rec0?.conditions, rec0?.notes].filter(Boolean).join(". ")}</div>
      </div>
      <div class="panel p9-tx-out">
        <div class="ph"><span>Rotated Voigt matrix, <span data-txo="unit" data-free>{rec0?.unit}</span></span><span><Badge code="derived" pop="euler" /></span></div>
        <div class="p9-mxbox"><table class="mx p9-mx" data-txo="mx" data-free>{@html I.mx}</table></div>
        <div class="pf"><span class="key fr">180° z</span><span class="key fz">+z</span><span class="p9-count" data-txo="nfl"></span></div>
        <div class="pf p9-tx-rule">180° about z flips c<sub>14</sub>, s<sub>14</sub>, p<sub>14</sub>, p<sub>41</sub>, e<sub>22</sub>, d<sub>22</sub>, r<sub>22</sub>. Reversing +z flips every odd-rank component and keeps c, s, p, &epsilon;.</div>
        <div class="p9-tx-r"><span class="lbl">R, wafer axes (rows) in crystal coordinates</span><table class="kv p9-rkv"><colgroup><col class="ck"><col><col><col></colgroup><tbody data-txo="R"></tbody></table></div>
      </div>
      <div class="panel p9-tx-exp">
        <div class="ph"><span>COMSOL order: <span data-txo="comsol-name" data-free></span></span><button type="button" class="p9-copy" data-copy="comsol">copy</button></div>
        <pre class="p9-pre p9-exp" data-txo="comsol">{I.comsol}</pre>
      </div>
      <div class="panel p9-tx-exp">
        <div class="ph"><span>JSON, with frame and rotation</span><button type="button" class="p9-copy" data-copy="json">copy</button></div>
        <pre class="p9-pre p9-exp" data-txo="json">{I.json}</pre>
      </div>
    </div>

    <!-- ---------- VISUAL ---------- -->
    <div class="p9-vtx" data-variant="visual">
      <div class="p9-vtx-stage">
        <figure class="p9-vfig p9-vtx-orient"><figcaption>Crystal axes in the wafer frame; Z (polar axis) in green</figcaption><div class="p9-vtx-svg" data-txo="orient">{@html I.orient}</div></figure>
        <figure class="p9-vfig p9-vtx-grid"><figcaption>Rotated tensor: square area &prop; |value|, filled positive, hollow negative; green ring: sign flips under 180&deg; about z, dashed ring: under +z reversal</figcaption><div class="p9-vtx-svg" data-txo="grid">{@html I.grid}</div></figure>
      </div>
      <div class="p9-vpm-ctl p9-vtx-ctl">
        <div class="v-group"><h3>Tensor and source</h3>
          <select class="p9-vsel" data-tx="tensor" aria-label="Tensor">{#each kinds as k (k.tensor)}<option value={k.tensor} selected={k.tensor === "piezo-stress-e"}>{plain(k.label)}</option>{/each}</select>
          <select class="p9-vsel" data-tx="record" data-t="piezo-stress-e" aria-label="Record">{#each recs0 as r (r.id)}<option value={r.id} selected={r.id === rec0?.id}>{@html recLabel(r)}</option>{/each}</select>
          <p class="v-cap">Status <span class="b p" data-txo="status" data-pop="tx-rec">{rec0?.status}</span> <span class="p9-count" data-txo="nfl"></span></p>
        </div>
        <div class="v-group"><h3>Cut</h3>
          <select class="p9-vsel" data-tx="cut" aria-label="Cut">{#each CUTS as c (c)}<option value={c} selected={c === TX_DEFAULT.cut}>{c === "Euler" ? "Euler angles (custom)" : c}</option>{/each}</select>
          {@render sliders("v")}
        </div>
        <div class="v-group"><h3>Frame sign</h3>
          <div class="v-seg p9-vtx-seg" role="group" aria-label="Frame sign"><button type="button" data-txt="rot180" aria-pressed="false">180° about z</button><button type="button" data-txt="flipZ" aria-pressed="false">+z reversed</button></div>
          <p class="v-cap">180° about z flips c<sub>14</sub>, s<sub>14</sub>, p<sub>14</sub>, p<sub>41</sub>, e<sub>22</sub>, d<sub>22</sub>, r<sub>22</sub>. Reversing +z flips every odd-rank component and keeps c, s, p, &epsilon;.</p>
        </div>
      </div>
      <div class="p9-vtx-exp">
        <div class="p9-vfig"><div class="p9-vexp-h"><span>COMSOL order: <span data-txo="comsol-name" data-free></span></span><button type="button" class="p9-copy" data-copy="comsol">copy</button></div><pre class="p9-pre p9-exp" data-txo="comsol">{I.comsol}</pre></div>
        <div class="p9-vfig"><div class="p9-vexp-h"><span>JSON with frame and rotation</span><button type="button" class="p9-copy" data-copy="json">copy</button></div><pre class="p9-pre p9-exp" data-txo="json">{I.json}</pre></div>
      </div>
    </div>
  </section>

  <section class="lay" id="conv" data-pair="conv" data-spine="Conventions">
    <div class="sh"><h2 class="biref">Conventions</h2><span class="meta">Voigt 1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy</span></div>
    <div class="body">
      <p class="tx">Each stored record is a 3m Voigt matrix in its crystal-physics frame. This page converts it to the full Cartesian tensor, applies T'<sub>ij&hellip;</sub> = R<sub>ia</sub> R<sub>jb</sub> &hellip; T<sub>ab&hellip;</sub>, and converts back. Shear strain is engineering strain, so s carries factors 2 and 4 and strain-charge d a factor 2 on shear columns; c, e, r, SHG d and p carry none.</p>
      <p class="tx">Sources give the sign of the odd-rank and the 14-type components only together with a frame. A record whose frame is unstated can pair with another record in a different frame and give the wrong sign of c<sub>14</sub>, e<sub>22</sub> or p<sub>41</sub>; the frame-sign toggles show which entries are at stake.</p>
      <div class="scrollx">
        <table class="idx">
          <thead><tr><th>Tensor</th><th>Voigt shape</th><th>COMSOL export</th><th>SI factor</th></tr></thead>
          <tbody>{#each kinds as k (k.tensor)}<tr><td class="h">{@html k.label}</td><td class="mono">{k.rank === 2 ? "3 x 3" : k.rank === 4 ? "6 x 6" : k.kind === "r" ? "6 x 3" : "3 x 6"}</td><td>{k.comsolName}</td><td class="mono">{k.si === 1 ? "1" : k.si.toExponential(0)} &rarr; {k.siUnit}</td></tr>{/each}</tbody>
        </table>
      </div>
      <p class="fine">All records with sources and status: <a class="u" href="/data/">property tables</a>; JSON at <a class="u" href="/api/v1/tensors.json">/api/v1/tensors.json</a>.</p>
    </div>
  </section>
</ChapterPage>
