<!-- Popup engine (port of mockup app.js "popups"): any element with data-pop="key" opens an anchored, bordered box on hover
     (desktop, 200 ms), keyboard focus, or tap (touch); Esc closes. data-pop-visual="key" replaces the key in VISUAL;
     data-pop-note="key" appends a page entry as a context line (resolvePop in pops.ts).
     Content: src/lib/content/pops.ts (page-local entries, generated glossary). Positioned absolutely in the page (body is
     the containing block), anchored to the element, flipped above when there is no room below. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { resolvePop, loadGlossary, glossaryLoaded } from "$lib/content/pops";

  let pop: HTMLDivElement;
  let current: HTMLElement | null = null;

  const isVisual = (): boolean => document.documentElement.dataset.mode === "visual";
  const keyOf = (el: HTMLElement): string => (isVisual() && el.dataset.popVisual) || el.dataset.pop || "";
  const touch = (): boolean => window.matchMedia("(hover: none)").matches;

  function fill(el: HTMLElement): boolean {
    const p = resolvePop(keyOf(el), el.dataset.popNote);
    if (!p) return false;
    const body = typeof p.body === "function" ? p.body() : p.body;
    const b = (p.badges ?? []).map(([c, t]) => `<span class="b ${c}">${t}</span>`).join("");
    pop.innerHTML = `<div class="h">${p.h}</div>${body ? `<div>${body}</div>` : ""}${b ? `<div class="bdg">${b}</div>` : ""}${p.src ? `<div class="src">${p.src}</div>` : ""}${p.more ? `<a class="more" href="${p.more[1]}">${p.more[0]} &rarr;</a>` : ""}`;
    return true;
  }
  function place(el: HTMLElement): void {
    const r = el.getBoundingClientRect(), b = document.body.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    const x = Math.max(12, Math.min(r.left, vw - w - 12));
    let y = r.bottom + 6;
    if (r.bottom + h + 12 > innerHeight && r.top - h - 6 > 0) y = r.top - h - 6;
    pop.style.left = `${x - b.left - document.body.clientLeft}px`;
    pop.style.top = `${y - b.top - document.body.clientTop}px`;
  }
  function show(el: HTMLElement): void {
    if (!fill(el)) {
      // glossary entries load lazily: retry once loaded, if the pointer or focus is still on the element
      if (!glossaryLoaded()) void loadGlossary().then(() => { if (el.matches(":hover, :focus") && current !== el) show(el); });
      return;
    }
    current = el;
    el.setAttribute("aria-describedby", "ln-pop");
    pop.classList.add("show");
    place(el);
  }
  function hide(): void {
    pop.classList.remove("show");
    current?.removeAttribute("aria-describedby");
    current = null;
  }
  /** Elements that open a popup must be focusable for keyboard users. */
  function focusables(): void {
    document.querySelectorAll<HTMLElement>("[data-pop]").forEach((el) => { if (!el.matches("a, button, input, [tabindex]")) el.tabIndex = 0; });
  }

  afterNavigate(() => { hide(); focusables(); });

  onMount(() => {
    let hideT = 0, showT = 0;
    const closestPop = (t: EventTarget | null): HTMLElement | null => (t instanceof Element ? t.closest<HTMLElement>("[data-pop]") : null);
    const inPop = (t: EventTarget | null): boolean => t instanceof Element && !!t.closest(".pop");
    // Touch and pen (G02): a tap fires pointerdown, compat mouseover, focusin, then click. Only the click toggles,
    // so focusin and the compat mouse events are ignored for 1 s after a touch or pen pointerdown.
    let ptr = "", ptrT = -1e9;
    const down = (e: PointerEvent): void => { ptr = e.pointerType; ptrT = performance.now(); };
    const tapping = (): boolean => touch() || ((ptr === "touch" || ptr === "pen") && performance.now() - ptrT < 1000);
    const over = (e: MouseEvent): void => {
      if (tapping()) return;
      const el = closestPop(e.target);
      if (el) { clearTimeout(hideT); clearTimeout(showT); if (el !== current) showT = window.setTimeout(() => show(el), current ? 0 : 200); }
      else if (inPop(e.target)) clearTimeout(hideT);
    };
    const out = (e: MouseEvent): void => {
      if (tapping()) return;
      if (closestPop(e.target) || inPop(e.target)) { clearTimeout(showT); hideT = window.setTimeout(hide, 200); }
    };
    const click = (e: MouseEvent): void => {
      const el = closestPop(e.target);
      const tap = tapping();
      if (el && tap && !el.matches("a[href]")) { e.preventDefault(); if (current === el) hide(); else show(el); }
      else if (!el && !inPop(e.target)) hide();
      // a tap on the popup body (not a link in it) dismisses it, so a target it covers can be tapped next
      else if (!el && tap && e.target instanceof Element && !e.target.closest("a[href]")) hide();
    };
    const key = (e: KeyboardEvent): void => { if (e.key === "Escape") hide(); };
    const focusin = (e: FocusEvent): void => {
      const el = closestPop(e.target);
      if (el && e.target === el) { if (!tapping()) show(el); }
      else if (!inPop(e.target)) hide();
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("click", click);
    document.addEventListener("keydown", key);
    document.addEventListener("focusin", focusin);
    // content added later (figure modules, VISUAL init) gets tabindex too
    let queued = false;
    const mo = new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; focusables(); }); } });
    mo.observe(document.body, { childList: true, subtree: true });
    focusables();
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1500));
    ric(() => { void loadGlossary(); });
    const refresh = (): void => { if (current) { fill(current); place(current); } };
    window.addEventListener("ln-mode", refresh);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", key);
      document.removeEventListener("focusin", focusin);
      window.removeEventListener("ln-mode", refresh);
      mo.disconnect();
      clearTimeout(hideT); clearTimeout(showT);
    };
  });
</script>

<div class="pop" role="tooltip" id="ln-pop" bind:this={pop}></div>
