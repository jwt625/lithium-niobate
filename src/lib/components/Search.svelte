<!-- Site search (Pagefind). Button in the masthead tools; the panel is absolutely positioned under it, so opening it moves
     nothing. The Pagefind UI (/pagefind/pagefind-ui.js + .css, written by `pagefind --site build` after `vite build`)
     loads on the first open. TECH: monospace, small field; VISUAL: larger field (CSS variables of the Pagefind UI in
     tech.css / visual.css). Esc or a click outside closes the panel. -->
<script lang="ts">
  let open = $state(false);
  let phase = $state<"idle" | "loading" | "ready" | "error">("idle");
  let root: HTMLDivElement;
  let box: HTMLDivElement;

  type PagefindUICtor = new (opts: Record<string, unknown>) => unknown;
  function load(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!document.querySelector("link[data-pagefind-css]")) {
        const css = document.createElement("link");
        css.rel = "stylesheet"; css.href = "/pagefind/pagefind-ui.css"; css.dataset.pagefindCss = "";
        document.head.appendChild(css);
      }
      const s = document.createElement("script");
      s.src = "/pagefind/pagefind-ui.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("pagefind-ui.js not found"));
      document.head.appendChild(s);
    });
  }
  const focusInput = (): void => { box?.querySelector<HTMLInputElement>("input")?.focus(); };
  async function toggle(): Promise<void> {
    open = !open;
    if (!open) return;
    if (phase === "ready") { requestAnimationFrame(focusInput); return; }
    if (phase !== "idle") return;
    phase = "loading";
    try {
      await load();
      const UI = (window as unknown as { PagefindUI?: PagefindUICtor }).PagefindUI;
      if (!UI) throw new Error("PagefindUI missing");
      new UI({ element: box, showImages: false, showSubResults: true, resetStyles: false, translations: { placeholder: "Search lithium-niobate.com" } });
      phase = "ready";
      requestAnimationFrame(focusInput);
    } catch {
      phase = "error";
    }
  }
  $effect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent): void => { if (e.key === "Escape") open = false; };
    const down = (e: PointerEvent): void => { if (root && !root.contains(e.target as Node)) open = false; };
    addEventListener("keydown", key);
    addEventListener("pointerdown", down);
    return () => { removeEventListener("keydown", key); removeEventListener("pointerdown", down); };
  });
</script>

<div class="search" bind:this={root}>
  <button type="button" class="iconbtn" id="search-btn" aria-label="Search the site" title="Search" aria-expanded={open} aria-controls="site-search" onclick={toggle}>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.3"/><path d="M10 10l4.2 4.2"/></svg>
  </button>
  <div class="search-pop" id="site-search" role="search" hidden={!open}>
    <div bind:this={box}></div>
    {#if phase === "error"}<p class="search-msg">Search index not found at /pagefind/.</p>{/if}
  </div>
</div>
