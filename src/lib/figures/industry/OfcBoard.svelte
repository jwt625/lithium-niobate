<!-- F8.06 OFC 2026 board: 15 LN/LT-platform papers, theme filter (visibility only, fixed-height region). TECH: log table with
     mono codes. VISUAL: poster-board cards, postdeadline papers marked with a solid corner facet. Filter "TFLT" leaves 5. -->
<script lang="ts">
  import { OFC, THEMES, type Theme } from "./facts";
  let th = $state<Theme | "all">("all");
  const on = (t: Theme[]): boolean => th === "all" || t.includes(th);
  const n = $derived(OFC.filter((o) => on(o.themes)).length);
</script>

{#snippet filt(v: boolean)}
  <div class={v ? "i8-of-ctl v" : "i8-ctlrow"}>
    <span class="lbl">Theme</span>
    <div class={v ? "v-seg" : "seg"} role="group" aria-label="Theme filter">
      <button type="button" class:on={th === "all"} onclick={() => (th = "all")}>all</button>
      {#each THEMES as t (t)}<button type="button" class:on={th === t} onclick={() => (th = t)}>{t}</button>{/each}
    </div>
    <span class="i8-of-n"><span class="i8-num">{String(n).padStart(2, "\u2007")}</span> of {OFC.length} papers</span>
  </div>
{/snippet}

<div class="panel i8-of" data-variant="tech">
  <div class="ph"><span>OFC 2026, LN/LT as the device platform (abstract claims)</span><span>PD = postdeadline</span></div>
  {@render filt(false)}
  <div class="i8-scroll i8-of-t">
    <table class="log">
      <thead><tr><th>Code</th><th>Title (short)</th><th>Affiliations</th><th>Claim</th><th>Themes</th><th>DOI</th></tr></thead>
      <tbody>
        {#each OFC as o (o.code)}
          <tr class:off={!on(o.themes)}><td>{o.code}{o.pd ? " PD" : ""}</td><td class="e">{o.title}</td><td class="e i8-aff">{o.aff}</td><td class="e">{o.claim}</td><td class="e i8-aff">{o.themes.join(", ") || "none"}</td><td><a href="https://doi.org/{o.doi}" data-pop={o.r}>{o.doi.replace("10.1364/", "")}</a></td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div class="i8-ofv" data-variant="visual">
  {@render filt(true)}
  <div class="i8-scroll i8-of-b">
    {#each OFC as o (o.code)}
      <article class="i8-oc" class:pd={o.pd} class:off={!on(o.themes)}>
        <header><b>{o.code}</b>{#if o.pd}<span>postdeadline</span>{/if}</header>
        <h4>{o.title}</h4>
        <p class="a">{o.aff}</p>
        <p class="c">{o.claim}</p>
        <div class="ft"><span>{o.themes.join(" · ") || "no theme tag"}</span><a class="v-link" href="https://doi.org/{o.doi}" data-pop={o.r}>{o.doi.replace("10.1364/", "")}</a></div>
      </article>
    {/each}
  </div>
</div>

<style>
  .i8-of .seg button { padding: 3px 7px; }
  .i8-of-n { margin-left: auto; font: 400 11px/16px var(--mono); color: var(--fg3); white-space: nowrap; }
  .i8-of-t { height: 480px; padding: 0 8px 6px; }
  .i8-of-t tr.off { display: none; }
  .i8-of-t td.e { min-width: 140px; } .i8-aff { color: var(--fg3) !important; }
  .i8-of-ctl.v { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-bottom: 20px; }
  .i8-of-ctl.v .lbl { font: 500 14px/20px var(--v-ui); letter-spacing: 0; text-transform: none; color: var(--v-text3); }
  .i8-of-ctl.v .v-seg { flex-wrap: wrap; }
  .i8-of-ctl.v .i8-of-n { margin-left: 0; font: 500 15px/22px var(--v-ui); color: var(--v-text2); }
  .i8-of-b { height: 640px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); grid-auto-rows: min-content; gap: 14px; padding-right: 6px; align-content: start; }
  .i8-oc { position: relative; display: grid; gap: 6px; align-content: start; padding: 16px 18px; background: var(--v-ink1); border: 1px solid var(--v-line); }
  .i8-oc.off { display: none; }
  .i8-oc.pd::before { content: ""; position: absolute; top: -1px; right: -1px; width: 0; height: 0; border-top: 26px solid var(--v-l532); border-left: 26px solid transparent; }
  .i8-oc header { display: flex; gap: 10px; align-items: baseline; }
  .i8-oc header b { font: 400 26px/30px var(--v-serif); font-weight: 400; }
  .i8-oc header span { font: 500 12px/16px var(--v-ui); color: var(--v-l532); }
  .i8-oc h4 { margin: 0; font: 400 18px/25px var(--v-serif); color: var(--v-text); }
  .i8-oc .a { font: 400 13px/19px var(--v-ui); color: var(--v-text3); }
  .i8-oc .c { font: 500 14px/20px var(--v-ui); color: var(--v-text2); }
  .i8-oc .ft { display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; font: 400 12px/18px var(--v-ui); color: var(--v-text3); }
</style>
