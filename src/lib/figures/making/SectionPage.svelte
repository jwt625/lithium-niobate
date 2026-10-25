<!-- Chapter-05 section page: manuscript text per depth layer (built at prerender, sources as badges with popups), the
     section's figures in L1 (and optional L2/L3 slots), the Process-viewer link-in, previous/next section links. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import "./making.css";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { usePops } from "$lib/content/pops";
  import type { SectionLoad } from "./load";
  import StepCard from "./StepCard.svelte";

  let { data, fig = undefined, l2fig = undefined, l3fig = undefined, l2label = "L2 Model and data", l3label = "L3 Details and open points" }: {
    data: SectionLoad; fig?: Snippet; l2fig?: Snippet; l3fig?: Snippet; l2label?: string; l3label?: string;
  } = $props();
  // svelte-ignore state_referenced_locally
  usePops(data.pops);
  const S = $derived(data.sec);
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "05 Making", href: "/making/" }, { label: S.no }]} title="{S.no} {S.title}"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: l2label }, { id: "l3", label: l3label }]}>
  <section class="lay mk-body" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2></div>
    <div class="body">
      {@html S.l1}
      {#if fig}<div class="mk-figs">{@render fig()}</div>{/if}
      {#if data.flow && S.steps.length}<div class="mk-figs"><StepCard flow={data.flow} ids={S.steps} start={S.start} /></div>{/if}
    </div>
  </section>
  <section class="lay mk-body" id="l2" data-pair="l2" data-spine={l2label}>
    <div class="sh"><h2 class="biref">{l2label}</h2></div>
    <div class="body">
      {@html S.l2}
      {#if l2fig}<div class="mk-figs">{@render l2fig()}</div>{/if}
    </div>
  </section>
  <section class="lay mk-body" id="l3" data-pair="l3" data-spine={l3label}>
    <div class="sh"><h2 class="biref">{l3label}</h2></div>
    <div class="body">
      {@html S.l3}
      {#if l3fig}<div class="mk-figs">{@render l3fig()}</div>{/if}
      <div class="mk-navrow">
        <span>{#if S.prev}<a href="/making/{S.prev.slug}/">&larr; {S.prev.no} {S.prev.short}</a>{:else}<a href="/making/">&larr; 05 Making</a>{/if}</span>
        <span>{#if S.next}<a href="/making/{S.next.slug}/">{S.next.no} {S.next.short} &rarr;</a>{/if}</span>
      </div>
    </div>
  </section>
</ChapterPage>
