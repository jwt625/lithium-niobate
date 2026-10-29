<!-- Masthead: conoscope logo, wordmark, mode (TECH / VISUAL / BABY) and theme toggles, site search (Pagefind), poled-domain band, chapter nav (unbuilt chapters as plain
     text). One DOM for both systems (visual.css restyles it). Port of mockup header.mast + app.js (logo, toggles, anchor). -->
<script lang="ts">
  import { onMount } from "svelte";
  import { CHAPTERS, chapterHref } from "$lib/content/site";
  import { ui, setMode, setTheme, type Mode } from "$lib/stores/ui.svelte";
  import { qpmPeriodSHG } from "$lib/figures/optics";
  import { renderConoscope } from "$lib/figures/conoscope";
  import { onUi } from "$lib/figures/dom";
  import Search from "./Search.svelte";

  let { qpm = 1.064, chapter = undefined }: { qpm?: number; chapter?: string } = $props();

  // Poled band: first-order QPM period drawn at 2 px per um (VISUAL); label shown in VISUAL (and TECH effects, never on).
  const PX_UM = 2;
  const L = $derived(qpmPeriodSHG(qpm));
  const p = $derived(L * PX_UM);
  const qq = $derived(p / 2);
  const tag = $derived(({ 1.064: "1064 → 532 nm", 1.55: "1550 → 775 nm" } as Record<number, string>)[qpm] ?? `${(qpm * 1000).toFixed(0)} nm SHG`);
  const arrow = (x: number, up: boolean): string =>
    `M${x.toFixed(2)} ${up ? 9.5 : 2.5}V${up ? 2.5 : 9.5}M${(x - 1.8).toFixed(2)} ${up ? 4.5 : 7.5}L${x.toFixed(2)} ${up ? 2.5 : 9.5}L${(x + 1.8).toFixed(2)} ${up ? 4.5 : 7.5}`;

  let logo: HTMLCanvasElement;
  const paintLogo = (): void => {
    logo.width = 40; logo.height = 40;
    const ctx = logo.getContext("2d");
    if (ctx) renderConoscope(ctx, 40, { thicknessMm: 0.6, fieldKVmm: 0, fieldDir: "x", white: ui.mode !== "tech", mono: ui.mode === "tech", NA: 0.55 });
  };
  onMount(() => {
    paintLogo();
    let link = document.querySelector<HTMLLinkElement>("link[rel=icon]");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = logo.toDataURL();
    return onUi(paintLogo);
  });

  // Scroll anchor across a mode switch (variants differ in height): the last visible [data-pair] block starting above
  // 120 px keeps its offset, or the same fraction scrolled past (DevLog-003b sec. 9.6).
  interface Anchor { pair: string; top: number; frac: number }
  const visible = (sel: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(sel)].filter((e) => e.offsetParent !== null);
  function anchor(): Anchor | null {
    const vis = visible("[data-pair]");
    const el = vis.filter((e) => e.getBoundingClientRect().top <= 120 && e.getBoundingClientRect().bottom > 1).pop() || vis.find((e) => e.getBoundingClientRect().bottom > 1);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { pair: el.dataset.pair ?? "", top: r.top, frac: Math.min(1, Math.max(0, -r.top / Math.max(1, el.offsetHeight))) };
  }
  function restore(a: Anchor | null): void {
    if (!a) return;
    const el = visible(`[data-pair="${a.pair}"]`)[0];
    if (!el) return;
    const r = el.getBoundingClientRect(), want = a.top < 0 ? -a.frac * el.offsetHeight : a.top;
    window.scrollBy(0, r.top - want);
  }
  function pick(m: Mode): void {
    if (m === ui.mode) return;
    const a = anchor();
    setMode(m);
    restore(a);
    requestAnimationFrame(() => restore(a));
  }
</script>

<header class="mast" data-pagefind-ignore>
  <div class="row">
    <a class="brand" href="/" aria-label="lithium niobate, landing page"><canvas id="logo" bind:this={logo} aria-hidden="true"></canvas><b>lithium niobate</b><span>LiNbO<sub>3</sub></span></a>
    <div class="tools">
      <div class="seg mode" role="group" aria-label="Display mode">
        <button type="button" data-m="tech" title="Monochrome, static" aria-pressed={ui.mode === "tech"} onclick={() => pick("tech")}>TECH</button><button type="button" data-m="visual" title="Color and effects" aria-pressed={ui.mode === "visual"} onclick={() => pick("visual")}>VISUAL</button><button type="button" data-m="baby" title="Picture books" aria-pressed={ui.mode === "baby"} onclick={() => pick("baby")}>BABY</button>
      </div>
      <button type="button" class="iconbtn" id="theme-btn" aria-label="Toggle light or dark theme" title={ui.theme === "dark" ? "Light theme" : "Dark theme"} aria-pressed={ui.theme === "light"} onclick={() => setTheme(ui.theme === "dark" ? "light" : "dark")}>
        <svg class="i-sun" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4"/></svg>
        <svg class="i-moon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z"/></svg>
      </button>
      <Search />
    </div>
  </div>
  <div class="band" data-pop="qpm" data-pop-visual="v-qpm" data-qpm={qpm} aria-label="Poled-domain band">
    <svg aria-hidden="true"><defs><pattern id="v-dom-pat" width={p.toFixed(3)} height="12" patternUnits="userSpaceOnUse"><rect width={qq.toFixed(3)} height="12" fill="var(--v-line2)"/><g stroke="var(--v-ink0)"><path d={arrow(qq / 2, true)} fill="none" stroke-width="0.9"/></g><g stroke="var(--v-text3)"><path d={arrow(qq + qq / 2, false)} fill="none" stroke-width="0.9"/></g></pattern></defs><rect width="100%" height="12" fill="url(#v-dom-pat)"/></svg>
    <span class="qpm-lab">PPLN &Lambda; = {L.toFixed(2)} &micro;m &middot; {tag} &middot; 2 px/&micro;m</span>
  </div>
  <nav class="nav" aria-label="Chapters">
    {#each CHAPTERS as c (c.slug)}
      {#if c.built}
        <a href={chapterHref(c)} class:on={chapter === c.slug} aria-current={chapter === c.slug ? "page" : undefined}><span class="n">{c.no}</span>{c.title}</a>
      {:else}
        <span aria-disabled="true" title="Not built"><span class="n">{c.no}</span>{c.title}</span>
      {/if}
    {/each}
  </nav>
</header>
