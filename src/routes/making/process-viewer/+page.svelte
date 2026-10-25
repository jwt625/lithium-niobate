<!-- 5.12 The Process viewer (F05-01): the viewer, its routes and anchors, parameter status counts, engine rules, models. -->
<script lang="ts">
  import "$lib/figures/making/making.css";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import ProcessViewer from "$lib/figures/making/ProcessViewer.svelte";
  import { STEP_SECONDS } from "$lib/figures/making/flow";

  let { data } = $props();
  // svelte-ignore state_referenced_locally
  usePops(data.pops);
  const C = $derived(data.flow.counts);
  const RL: Record<string, string> = { ridge_duv: "Ridge, DUV + SiO2 mask", strip_dlc: "Strip, DUV + DLC mask" };
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "05 Making", href: "/making/" }, { label: "5.12" }]} title="5.12 The Process viewer"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Routes and provenance" }, { id: "l3", label: "L3 Engine and models" }]}>
  <section class="lay mk-body" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2></div>
    <div class="body">
      <p class="tx">Thirty steps take a powder charge to a fibered thin-film LN modulator: crystal, wafer, LNOI, then one of two device routes and the back end. Play it forward or backward, step, or scrub; the cross-section follows, and the HUD lists each step's parameters with reported, derived, or template status. Analog marks a value taken from a paper other than the route's anchor, or from LiTaO<sub>3</sub>.</p>
      <div class="mk-figs"><ProcessViewer flow={data.flow} uid="pv-main" /></div>
    </div>
  </section>
  <section class="lay mk-body" id="l2" data-pair="l2" data-spine="L2 Routes and provenance">
    <div class="sh"><h2 class="biref">L2 Routes and provenance</h2><span class="meta">30 steps, 2 routes</span></div>
    <div class="body">
      <h3 class="h3">Device routes and anchor papers</h3>
      <div class="scrollx"><table class="idx mk-t"><thead><tr><th>Route</th><th>Anchor</th><th>Why this anchor</th><th>Filled by analog or template</th></tr></thead><tbody>
        {#each data.routes as r (r.r)}<tr><td class="h">{r.r}</td><td>{@html r.anchor}</td><td>{@html r.why}</td><td>{@html r.gaps}</td></tr>{/each}
      </tbody></table></div>
      <h3 class="h3">Parameter status counts</h3>
      <div class="scrollx"><table class="idx mk-t"><thead><tr><th>Route</th><th class="r">Steps</th><th class="r">Reported</th><th class="r">of which analog</th><th class="r">Derived</th><th class="r">Template</th><th class="r">n/a</th><th class="r">Total</th></tr></thead><tbody>
        {#each data.flow.routes as r (r.id)}<tr><td class="h">{RL[r.id]}</td><td class="r">{data.flow.order[r.id].length}</td><td class="r">{C[r.id].reported}</td><td class="r">{C[r.id].analog}</td><td class="r">{C[r.id].derived}</td><td class="r">{C[r.id].template}</td><td class="r">{C[r.id].na}</td><td class="r">{C[r.id].total}</td></tr>{/each}
      </tbody></table></div>
      <p class="fine">Counts include each step's process time. n/a: not reported and not drawn. <Badge code="reported" /> <Badge code="derived" /> <Badge code="template" /></p>
      <h3 class="h3">Materials</h3>
      <div class="scrollx"><table class="idx mk-t"><thead><tr><th>Quantity</th><th>Value</th><th class="src">Source; status</th><th>Note</th></tr></thead><tbody>
        {#each data.materials as m (m[0])}<tr><td class="h">{@html m[0]}</td><td>{@html m[1]}</td><td class="src">{#if m[2] === "derived"}<Badge code="derived" />{:else if m[2] === "template"}<Badge code="template" />{:else}{@html m[2]}{/if}</td><td>{@html m[3]}</td></tr>{/each}
      </tbody></table></div>
    </div>
  </section>
  <section class="lay mk-body" id="l3" data-pair="l3" data-spine="L3 Engine and models">
    <div class="sh"><h2 class="biref">L3 Engine and models</h2><span class="meta">deterministic f(route, step, t)</span></div>
    <div class="body">
      <ul class="mk-ul">
        <li>Every view is a pure function of route, step and t in [0, 1]: reverse play, stepping and scrubbing are evaluations at other (step, t), so forward and backward runs give identical frames.</li>
        <li>Each step plays for {STEP_SECONDS} s at 1× (0.5× to 4×); the HUD shows the real process time where the flow reports or derives one, otherwise n/a.</li>
        <li>Illustrative z-map, frozen per step: Si handle 4 rows, oxide 3 rows, donor bulk 8 rows, films at 1 row = 0.15 µm, so untouched bodies keep their height while thinned bodies shrink. True scale: one linear scale; a 600 nm film on 4.7 µm SiO<sub>2</sub> on 500 µm Si is 0.12% of the stack and falls below one row.</li>
        <li>Crystal axes: x-cut film with X normal and Z lateral; after the bond the donor's +X points down into the bond and +Z reverses on screen.</li>
        <li>3D (VISUAL): the scene covers LNOI formation (steps 7 to 12) and the first lithography steps (hard mask, coat, exposure); the camera keeps the reader's orbit and re-targets only at flip, split and scale changes. CMP is drawn face-up so the film stays visible; production CMP holds the wafer face-down. Other steps show the 2D cross-section.</li>
        <li>Keys with the viewer focused: space play or pause, left/right move t, shift+left/right step, [ and ] speed. The address bar keeps route, step and t, so a link reopens the viewer at the same point.</li>
      </ul>
      <h3 class="h3">Physical models per step</h3>
      <div class="scrollx"><table class="idx mk-t"><thead><tr><th>Step</th><th>Model</th><th>Status of inputs</th></tr></thead><tbody>
        {#each data.models as m (m[0])}<tr><td class="h">{m[0]}</td><td>{@html m[1]}</td><td>{@html m[2]}</td></tr>{/each}
      </tbody></table></div>
      <div class="mk-navrow"><span><a href="/making/packaging/">&larr; 5.11 Dicing, facets, packaging</a></span><span><a href="/making/">05 Making &rarr;</a></span></div>
    </div>
  </section>
</ChapterPage>
