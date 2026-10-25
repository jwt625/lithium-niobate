<!-- Process-viewer link-in for a section: the section's steps, a scrubbable cross-section of the chosen step (TECH ASCII,
     VISUAL SVG), and a link that opens the full viewer at that step. Same model as the viewer (xsec.ts). -->
<script lang="ts">
  import type { FlowData } from "./flow";
  import { hashOf } from "./flow";
  import { crossSection, ascii, type Route } from "./xsec";
  import XsSvg from "./XsSvg.svelte";

  let { flow, ids, title = "Process viewer steps", start = null }: { flow: FlowData; ids: string[]; title?: string; start?: string | null } = $props();
  const items = $derived(ids.map((id) => {
    const s = flow.steps.find((x) => x.id === id);
    const route: Route = flow.order.ridge_duv.includes(id) ? "ridge_duv" : "strip_dlc";
    return { id, route, name: s?.name ?? id, tool: s?.tool ?? "", n: flow.order[route].indexOf(id) + 1, N: flow.order[route].length };
  }));
  // svelte-ignore state_referenced_locally
  let k = $state(Math.max(0, start ? ids.indexOf(start) : 0));
  // svelte-ignore state_referenced_locally
  let t = $state(start === "s10_split" ? 0.85 : start === "s03_pull" || start === "s17r_ln_etch" ? 0.7 : 1);
  const cur = $derived(items[Math.min(k, items.length - 1)]);
  const art = $derived(ascii(crossSection(flow.geom, cur.route, flow.order[cur.route], cur.id, t, "illustrative")).join("\n"));
  const href = $derived(`/making/process-viewer/${hashOf(cur.route, cur.id, t)}`);
  const rl = (r: Route): string => (r === "ridge_duv" ? "ridge" : "strip");
</script>

<figure class="panel mk-sc mk-fig">
  <div class="ph"><span>{title}</span><span><a class="u" {href}>open in the Process viewer</a></span></div>
  <div class="mk-sc-t">
    <div class="mk-sc-grid">
      <div>
        <table class="log">
          <thead><tr><th>#</th><th>STEP</th><th>ROUTE</th></tr></thead>
          <tbody>{#each items as it, i (it.id)}<tr class:on={i === k} onclick={() => (k = i)}><td>{String(it.n).padStart(2, "0")}</td><td class="e" title={it.name}>{it.name}</td><td>{rl(it.route)}</td></tr>{/each}</tbody>
        </table>
        <div class="seg" role="group" aria-label="Step" style="margin-top:8px">{#each items as it, i (it.id)}<button type="button" class:on={i === k} onclick={() => (k = i)}>{String(it.n).padStart(2, "0")}</button>{/each}</div>
      </div>
      <pre class="mk-ascii" aria-label="ASCII cross-section">{art}</pre>
    </div>
    <div class="ctl"><label for="sc-t-{ids[0]}">Step progress t</label><input id="sc-t-{ids[0]}" type="range" min="0" max="1" step="0.01" bind:value={t}><output>{t.toFixed(2)}</output></div>
  </div>
  <div class="mk-sc-v">
    <div class="mk-v-stage" style="aspect-ratio: 2 / 1"><div class="mk-v-b"><XsSvg rh={20} geom={flow.geom} route={cur.route} order={flow.order[cur.route]} id={cur.id} {t} label="Cross-section, {cur.name}" /></div></div>
    <div class="mk-sc-vc">
      <div class="v-ctl"><span class="v-lab">Step</span><div class="v-seg" role="group" aria-label="Step">{#each items as it, i (it.id)}<button type="button" class:on={i === k} onclick={() => (k = i)}>{it.n}</button>{/each}</div></div>
      <div class="v-ctl" style="--w:5ch"><label for="sc-vt-{ids[0]}">Step progress</label><output>{t.toFixed(2)}</output><input id="sc-vt-{ids[0]}" type="range" min="0" max="1" step="0.01" bind:value={t}></div>
      <p class="v-cap mk-sc-name"><b>{cur.n}/{cur.N}</b>{cur.name} ({rl(cur.route)} route)</p>
    </div>
  </div>
</figure>

<style>
  .mk-sc-vc { display: grid; gap: 12px; padding: 16px; }
  .mk-sc-name { height: 44px; overflow: hidden; }
  .mk-sc-v .mk-v-stage { position: relative; }
</style>
