<!-- BABY mode book screen (DevLog-007 sec. 8). Always in the DOM (prerendered fixed geometry); baby.css shows it and hides
     main, masthead, spine, and footer from html[data-mode="baby"] before first paint. In BABY the book for the route loads
     (registry.ts) and the page's scene mounts into a fresh div in the square stage. Controls (one bare row): home (cover
     doors), prev, dots, next, Play, Exit (Escape: back to the stored adult mode on the same route); arrow keys, touch swipe,
     #pN hash. Next on a book's last page opens the next book's p1 (cover, then the chapters in site.ts order, then the
     cover again); Prev on p1 opens the previous book's last page. Book changes (those, home, a door click on the cover's
     door page) fly a camera through the cover's door page (travel()): out through the current chapter's door, in
     through the target's (crossfades where the cover has no door). Reduced motion: instant switch. Play (Space) turns
     the pages by step(1) after each page's dwell (counted only while visible, idle, and mounted; reset on every mount or
     stage tap) and stops on the last book's last page; Play there restarts at cover p1. A quiet row below:
     parent-note marker and grown-up section link; then the cover-only non-affiliation line and the credit line.
     Frame loop: rAF only while the tab is visible, the stage is on screen, and t < settle or woken (host.wake). t is the
     loop's own clock: it advances only while frames run (max 0.1 s per frame), so after a pause it resumes where it stopped.
     Reduced motion: frame(settle) once, and once per wake. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { ui, setMode, adultMode } from "$lib/stores/ui.svelte";
  import { registerPops } from "$lib/content/pops";
  import type { BabyBook, Scene, SceneHost } from "../types";
  import { CHAPTERS } from "$lib/content/site";
  import { loadBook, hasBook, targetFor, pageFor, secLabel } from "./registry";
  import { mulberry32 } from "./rng";

  let book = $state<BabyBook | null>(null);
  let idx = $state(0);
  const pg = $derived(book?.pages[idx] ?? null);
  const lab = $derived(pg ? secLabel(pg.sec) : null);
  const n = $derived(book?.pages.length ?? 0);

  let stage: HTMLDivElement;
  // imperative scene state (not reactive)
  let scene: Scene | null = null, sceneEl: HTMLDivElement | null = null, gen = 0;
  let raf = 0, last = 0, clock = 0, wakeUntil = 0, onscreen = true, reduced = false;

  const settleT = (): number => (scene && Number.isFinite(scene.settle) ? Math.max(0, scene.settle) : 0);
  const want = (): boolean => !!scene && !reduced && onscreen && !document.hidden && (clock < scene.settle || clock < wakeUntil);

  function fail(e: unknown): void { console.error("baby scene failed", e); unmount(); }
  function draw(t: number): void { if (scene) try { scene.frame(t); } catch (e) { fail(e); } }
  function kick(): void { if (!raf && want()) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function tick(now: number): void {
    raf = 0;
    if (!want()) return;
    clock += Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    draw(clock);
    if (want()) raf = requestAnimationFrame(tick);
  }

  // t of the cover's door page when it was last shown: the transition menu is frozen at that step (frame(t) once)
  let doorsT: number | null = null, onDoors = false;
  /** Stop the current scene and hand it back (element still in the stage); `drop` destroys and removes it. */
  function detach(): { s: Scene | null; el: HTMLDivElement | null } {
    gen++;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (scene && onDoors) doorsT = clock;
    const out = { s: scene, el: sceneEl };
    scene = null;
    sceneEl = null;
    return out;
  }
  function drop(o: { s: Scene | null; el: HTMLDivElement | null }): void {
    try { o.s?.destroy?.(); } catch (e) { console.error("baby scene destroy failed", e); }
    o.el?.remove();
  }
  function unmount(): void { drop(detach()); }
  /** Mount the current page; `at` starts its clock there instead of 0 (landing on the door page the menu showed);
   *  `from` = the page shown just before in the same book (in-book turns only): the old scene stays in place until the
   *  new one has drawn its first frame, so there is no blank frame between them. */
  function mount(at?: number, from?: number): void {
    const old = from === undefined ? (unmount(), null) : detach();
    try { mountNew(at, from); } finally { if (old) drop(old); }
  }
  function mountNew(at?: number, from?: number): void {
    pAcc = 0;
    const p = book?.pages[idx];
    onDoors = !!book && book.slug === "cover" && idx === book.pages.length - 1;
    if (!p || !stage) return;
    const g = gen;
    reduced = ui.reducedMotion; clock = 0; wakeUntil = 0;
    const el = document.createElement("div");
    el.className = "bb-scene";
    stage.appendChild(el);
    sceneEl = el;
    const host: SceneHost = {
      el, rng: mulberry32, reduced, from,
      wake: (s: number) => {
        if (g !== gen) return; // a destroyed scene's late timer
        wakeUntil = Math.max(wakeUntil, clock + s);
        if (reduced) draw(clock); else kick();
      },
    };
    try { scene = p.scene(host); } catch (e) { fail(e); return; }
    if (reduced) clock = settleT(); else if (at !== undefined) clock = at;
    draw(clock);
    kick();
  }

  /** Optional per-book surround (BabyBook.surround) on <html>; cleared outside BABY. */
  function surround(c: string | undefined): void {
    const r = document.documentElement.style;
    if (c) r.setProperty("--bb-surround", c); else r.removeProperty("--bb-surround");
  }

  // Route / mode / hash -> book and page. `applied` holds the path + hash last resolved; page turns set it before
  // rewriting the hash (and travel() before its client-side navigation), so those URL updates do not re-open the page.
  let applied = "", tok = 0;
  async function open(path: string, hash: string, search: string): Promise<void> {
    const my = ++tok, t = targetFor(path, search);
    if (t.slug !== "cover") void loadBook("cover", search); // preload: the door page is the stage of every book change
    const b = await loadBook(t.slug, search);
    if (my !== tok || ui.mode !== "baby") return;
    const prev = book && b && book.slug === b.slug && scene ? idx : undefined; // a typed #pN in the same book is a page turn
    book = b;
    idx = b ? pageFor(b, t, hash) : 0;
    surround(b?.surround);
    mount(undefined, prev !== idx ? prev : undefined);
    for (const d of [1, -1] as const) { const nb = neighbor(d); if (nb) void loadBook(nb, search); } // book changes start at once
  }
  $effect(() => {
    const mode = ui.mode, path = page.url.pathname, hash = page.url.hash, search = page.url.search;
    if (mode !== "baby") { playing = false; if (applied) { applied = ""; tok++; unmount(); book = null; surround(undefined); } return; }
    if (path + hash === applied) return;
    applied = path + hash;
    void open(path, hash, search);
  });

  function go(i: number): void {
    if (busy || !book || i < 0 || i >= book.pages.length || i === idx) return;
    const from = idx;
    idx = i;
    applied = `${page.url.pathname}#p${i + 1}`;
    try { replaceState(`#p${i + 1}`, page.state); } catch { /* router not ready */ }
    mount(undefined, from);
  }
  /** Book order: cover, then the chapters with a book (site.ts order); wraps around. */
  const routeOf = (slug: string): string => (slug === "cover" ? "/" : `/${slug}/`);
  function neighbor(d: 1 | -1): string | null {
    if (!book) return null;
    const order = ["cover", ...CHAPTERS.map((c) => c.slug).filter((s) => hasBook(s, page.url.search))], k = order.indexOf(book.slug);
    return k < 0 || order.length < 2 ? null : order[(k + d + order.length) % order.length];
  }
  /** Next / Prev: a page turn, or across a book boundary the neighbouring book (p1 forward, last page backward). */
  function step(d: 1 | -1): void {
    if (busy || !book) return;
    if (idx + d >= 0 && idx + d < book.pages.length) { go(idx + d); return; }
    const nb = neighbor(d);
    if (nb) void travel(nb, d < 0);
  }
  const edgeLabel = (d: 1 | -1): string | null => {
    const nb = book && (d > 0 ? idx >= n - 1 : idx <= 0) ? neighbor(d) : null;
    if (!nb) return null;
    const l = secLabel(routeOf(nb));
    return `${d > 0 ? "Next" : "Previous"}: ${`${l.no} ${l.title}`.trim()}`;
  };
  const nextLabel = $derived(edgeLabel(1) ?? "Next page");
  const prevLabel = $derived(edgeLabel(-1) ?? "Previous page");
  /** Home: the cover's door page (book picker). */
  function home(): void {
    if (busy || !book) return;
    if (book.slug === "cover") go(book.pages.length - 1); else void travel("cover", true);
  }

  // ---------- book change through the door page (camera model) ----------
  // The cover's door page (menu, settled, inert) and a chapter slide share one camera. The slide sits behind its door,
  // cover-fit to the visible part of the opening; the menu layer has the uncovered part of the opening cut out
  // (clip-path, evenodd), so the gold doorway fill acts as a paper blind that rolls up (enter) or down (exit). Enter: the leaf swings open, the camera zooms about a fixed point until a square
  // inside the opening fills the stage (arch edges out of frame); the slide then sits exactly at full stage. Exit: the
  // reverse with the leaf open, then the leaf closes. Where the cover has no door (its own pages), menu and page
  // crossfade. Leaf: the door page's own hover swing via its `data-open` hook when present (the zoom starts as the leaf
  // passes about half open), else the same pose by WAAPI. Opening: `[data-aperture]` when present, else the door's
  // first path (the drawn arch); the cut-out is an arch (rect with a semicircular top) on that box.
  const T_LEAF = 120, T_LEAD = 120, T_CLOSE = 200, T_ZOOM = 400, T_ROLL = 280, T_HOLD = 60, T_FADE = 400; // ms; door to door about 1.2 s
  const LEAF_OPEN = "scaleX(.58) skewY(-8deg)"; // the door page's hover pose (fallback without the hook)
  let busy = false;
  // dev only: window.__bbSlow = k stretches the transition k times (mid-transition screenshots); production: 1
  const slow = (): number => (import.meta.env.DEV ? Number((window as unknown as { __bbSlow?: number }).__bbSlow) || 1 : 1);
  const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms * slow()));
  const easeIO = (u: number): number => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
  /** rAF tween: fn(u) for u in [0, 1] over ms. */
  const tween = (ms: number, fn: (u: number) => void): Promise<void> => new Promise((done) => {
    const t0 = performance.now();
    ms *= slow();
    const f = (now: number): void => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1) requestAnimationFrame(f); else done(); };
    fn(0);
    requestAnimationFrame(f);
  });
  const layer = (cls: string): HTMLDivElement => {
    const d = document.createElement("div");
    d.className = `bb-scene ${cls}`;
    d.setAttribute("aria-hidden", "true");
    d.inert = true;
    d.style.transformOrigin = "0 0";
    return d;
  };

  type Pt = [number, number];
  interface Door { a: Element; leaf: Element | null; hook: boolean; poly: Pt[]; x: number; y: number; w: number; h: number }
  /** The door of `slug` on the menu layer (all geometry from the live DOM): the opening outline sampled along the
   *  `[data-aperture]` path (else the door's first path) and mapped to px relative to the stage, with its bounding box. */
  function doorOf(menuEl: HTMLElement, slug: string): Door | null {
    const a = menuEl.querySelector(`a[href="/${slug}/"]`), ap = a?.querySelector("[data-aperture]");
    const g = (ap ?? a?.querySelector("path")) as SVGGeometryElement | null | undefined;
    const m = g?.getScreenCTM?.();
    if (!a || !g || !m || typeof g.getTotalLength !== "function") return null;
    const s = stage.getBoundingClientRect(), len = g.getTotalLength(), N = 160, poly: Pt[] = [];
    for (let i = 0; i < N; i++) { const q = g.getPointAtLength((len * i) / N); poly.push([m.a * q.x + m.c * q.y + m.e - s.x, m.b * q.x + m.d * q.y + m.f - s.y]); }
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    return w > 0 && h > 0 ? { a, leaf: a.querySelector('[class$="leaf"]'), hook: !!ap, poly, x, y, w, h } : null;
  }
  const inPoly = (poly: Pt[], x: number, y: number): boolean => {
    let k = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) k = !k;
    }
    return k;
  };
  /** Largest square inside the opening, centered on it horizontally and standing on its threshold (3x3 border probes). */
  function innerSquare(dr: Door): { L: number; qx: number; qy: number } {
    const cx = dr.x + dr.w / 2, bot = dr.y + dr.h * 0.98;
    for (let k = 1; k >= 0.2; k -= 0.02) {
      const sd = k * Math.min(dr.w, dr.h), x0 = cx - sd / 2, y0 = bot - sd;
      if ([0, 0.5, 1].every((u) => [0, 0.5, 1].every((v) => inPoly(dr.poly, x0 + u * sd, y0 + v * sd)))) return { L: 0.92 * sd, qx: cx, qy: bot - sd / 2 };
    }
    return { L: 0.5 * Math.min(dr.w, dr.h), qx: cx, qy: dr.y + dr.h / 2 };
  }
  /** Opening outline below y = ey (Sutherland-Hodgman against one half-plane). */
  function below(poly: Pt[], ey: number): Pt[] {
    const out: Pt[] = [];
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i], Q = poly[(i + 1) % poly.length], pin = P[1] >= ey, qin = Q[1] >= ey;
      if (pin) out.push(P);
      if (pin !== qin) out.push([P[0] + ((ey - P[1]) / (Q[1] - P[1])) * (Q[0] - P[0]), ey]);
    }
    return out;
  }
  const dPoly = (poly: Pt[], ox = 0, oy = 0): string => (poly.length > 2 ? `M${poly.map(([x, y]) => `${(x - ox).toFixed(2)} ${(y - oy).toFixed(2)}`).join("L")}Z` : "");
  /** Leaf open / closed: the hover swing (hook) or the same pose by WAAPI; `instant` skips the swing. Resolves when the
   *  zoom may start (opening: about half open) or the close has mostly run. */
  function leaf(dr: Door, open: boolean, instant = false): Promise<void> {
    if (dr.hook) {
      const l = dr.leaf as SVGElement | null;
      if (slow() !== 1) (dr.a as SVGElement).style.setProperty("--door-leaf-dur", `${0.4 * slow()}s`);
      if (instant && l) l.style.transition = "none";
      if (open) dr.a.setAttribute("data-open", "1"); else dr.a.removeAttribute("data-open");
      if (instant && l) { void l.getBoundingClientRect(); l.style.transition = ""; return Promise.resolve(); }
      return wait(open ? T_LEAD : T_CLOSE);
    }
    if (!dr.leaf) return Promise.resolve();
    const kf = [{ transform: "none" }, { transform: LEAF_OPEN }];
    return dr.leaf.animate(open ? kf : kf.reverse(), { duration: instant ? 0 : T_LEAF, easing: "ease-out", fill: "forwards" }).finished.then(() => undefined);
  }
  /** Camera through a door: scale c in [1, cEnd] about the fixed point P; slide transform cover-fits the visible opening. */
  function camera(dr: Door): { cEnd: number; at: (c: number) => { menu: string; slide: string } } {
    const W = stage.clientWidth, { L, qx, qy } = innerSquare(dr), cEnd = W / L; // that square fills the stage at the end
    const px = (cEnd * qx - W / 2) / (cEnd - 1), py = (cEnd * qy - W / 2) / (cEnd - 1);
    return {
      cEnd,
      at: (c) => {
        const hx = px + c * (dr.x - px), hy = py + c * (dr.y - py);
        const x0 = Math.max(0, hx), y0 = Math.max(0, hy), x1 = Math.min(W, hx + c * dr.w), y1 = Math.min(W, hy + c * dr.h);
        const side = Math.max(x1 - x0, y1 - y0, 1e-3), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        return {
          menu: `translate(${(px * (1 - c)).toFixed(2)}px, ${(py * (1 - c)).toFixed(2)}px) scale(${c.toFixed(5)})`,
          slide: `translate(${(cx - side / 2).toFixed(2)}px, ${(cy - side / 2).toFixed(2)}px) scale(${(side / W).toFixed(5)})`,
        };
      },
    };
  }
  /** The menu with the uncovered part of the door opening cut out (local px; transforms with the layer): the opening
   *  below the blind's edge, f = 0 (blind down, no hole) .. 1 (blind up, whole opening). */
  const hole = (dr: Door, f: number): string => {
    const W = stage.clientWidth, outer = `M0 0H${W}V${W}H0Z`;
    return `path(evenodd, "${outer}${f > 0 ? dPoly(f >= 1 ? dr.poly : below(dr.poly, dr.y + dr.h * (1 - f))) : ""}")`;
  };
  /** The rolled-paper edge of the blind: a hard darker band just above the edge, clipped to the opening. */
  function blindBand(menu: HTMLElement, dr: Door): (f: number) => void {
    const box = document.createElement("div"), band = document.createElement("div");
    box.style.cssText = `position:absolute;left:${dr.x}px;top:${dr.y}px;width:${dr.w}px;height:${dr.h}px;pointer-events:none;` +
      `clip-path:path("${dPoly(dr.poly, dr.x, dr.y)}")`;
    const bh = Math.max(2, dr.h * 0.045);
    band.style.cssText = `position:absolute;left:0;width:100%;height:${bh}px;background:rgba(80,40,0,.38);border-bottom:1px solid rgba(255,240,200,.5)`;
    box.appendChild(band);
    menu.appendChild(box);
    return (f) => { band.style.display = f > 0 && f < 1 ? "" : "none"; band.style.top = `${(1 - f) * dr.h - bh}px`; };
  }
  /** Zoom phase: c log-linear in [1, cEnd] (ease-in-out); the blind rolls up during the first T_ROLL (enter) or down
   *  during the last T_ROLL (exit), a hard-edged wipe; the slide is never faded, only uncovered. */
  async function fly(menu: HTMLElement, slide: HTMLElement, dr: Door, inward: boolean): Promise<void> {
    const cam = camera(dr), lnE = Math.log(cam.cEnd), band = blindBand(menu, dr), k = T_ZOOM / T_ROLL;
    await tween(T_ZOOM, (u) => {
      const e = easeIO(u), c = Math.exp(lnE * (inward ? e : 1 - e)), m = cam.at(c);
      const f = easeIO(Math.min(1, (inward ? u : 1 - u) * k));
      menu.style.transform = m.menu;
      menu.style.clipPath = hole(dr, f);
      slide.style.transform = m.slide;
      band(f);
    });
    band(1);
  }

  /** Change book: to `slug` at p1 (or its last page) through the door page; the route updates client-side mid-way. */
  /** `open`: the target door's leaf is already open (a hovered or focused door was clicked): no second swing. */
  async function travel(slug: string, last: boolean, open = false): Promise<void> {
    if (busy || !book) return;
    busy = true;
    const my = ++tok, search = page.url.search, from = book.slug, fromDoors = from === "cover" && idx === book.pages.length - 1;
    const liveT = clock;
    const parts: HTMLElement[] = [];
    let menuScene: Scene | null = null;
    try {
      const [cover, target] = await Promise.all([loadBook("cover", search), loadBook(slug, search)]);
      if (my !== tok) return;
      const ti = target?.pages.length ? (last ? target.pages.length - 1 : 0) : 0, route = slug === "cover" ? "/" : `/${slug}/`, hash = `#p${ti + 1}`;
      const doors = cover?.pages[cover.pages.length - 1];
      if (!target || ui.reducedMotion || !doors) { void goto(`${route}${search}${hash}`); return; } // instant: the route effect opens it
      const menu = layer("bb-menu");
      parts.push(menu);
      let tm = 0;
      stage.appendChild(menu);
      try {
        menuScene = doors.scene({ el: menu, rng: mulberry32, reduced: false, wake: () => {} }); // reduced: false keeps the leaf swing; drawn once, settled
        tm = fromDoors ? liveT : doorsT ?? (Number.isFinite(menuScene.settle) ? menuScene.settle : 3); // 3 s: past any intro
        menuScene.frame(tm);
      } catch (e) { console.error("baby door page failed", e); }
      if (open) { const d = doorOf(menu, slug); if (d) await leaf(d, true, true); } // the copy's door starts open
      // ---- out ----
      const old = sceneEl, dOut = from !== "cover" ? doorOf(menu, from) : null;
      if (old && dOut) {
        // exit through the current door: the live slide recedes into the opening, the blind rolls down, the leaf closes
        old.style.transformOrigin = "0 0";
        stage.appendChild(menu);
        await leaf(dOut, true, true);
        await fly(menu, old, dOut, false);
        menu.style.clipPath = "";
        await leaf(dOut, false);
      } else if (old && !fromDoors) {
        stage.insertBefore(menu, old); // crossfade the cover page out over the menu
        await old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T_FADE, easing: "ease-in", fill: "forwards" }).finished;
      }
      if (my !== tok) return;
      unmount();
      menu.style.transform = "";
      // ---- route (client-side; marked as applied so the route effect does not re-open it) ----
      applied = route + hash;
      const nav = goto(`${route}${search}${hash}`, { keepFocus: true, noScroll: true });
      await Promise.all([wait(T_HOLD), nav]);
      if (my !== tok) return;
      book = target; idx = ti; surround(target.surround);
      // ---- in ----
      const dIn = slug !== "cover" ? doorOf(menu, slug) : null;
      if (dIn) {
        // enter the target door: the leaf swings open, then the camera flies in; the fresh slide (t from 0) shows through
        await leaf(dIn, true, open); // swing only when the door was closed
        if (my !== tok) return;
        mount();
        const el = sceneEl as HTMLDivElement | null;
        if (el && my === tok) {
          el.style.transformOrigin = "0 0";
          stage.appendChild(menu);
          await fly(menu, el, dIn, true);
          el.style.transform = el.style.transformOrigin = "";
        }
      } else if (slug === "cover" && last) {
        mount(tm); // the doors themselves, at the step the menu showed
      } else {
        mount(); // a cover page without a door: crossfade it in over the menu
        const el = sceneEl as HTMLDivElement | null;
        if (el) { stage.appendChild(el); await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T_FADE, easing: "ease-out" }).finished; }
      }
    } catch (e) {
      console.error("baby travel failed", e);
    } finally {
      try { menuScene?.destroy?.(); } catch (e) { console.error(e); }
      parts.forEach((p) => p.remove());
      if (sceneEl) { sceneEl.getAnimations().forEach((a) => a.cancel()); sceneEl.style.transform = sceneEl.style.opacity = sceneEl.style.transformOrigin = ""; }
      busy = false;
    }
  }
  /** Door links on the cover's door page: zoom into the door, then navigate (modified clicks keep the plain link). */
  function doorClick(e: MouseEvent): void {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || book?.slug !== "cover") return;
    const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    const slug = a && stage.contains(a) ? /^\/([^/]+)\/$/.exec(a.getAttribute("href") ?? "")?.[1] : undefined;
    if (!slug || !hasBook(slug, page.url.search)) return;
    e.preventDefault();
    const lf = a?.querySelector('[class$="leaf"]');
    const open = !!a?.matches(':hover, :focus-visible, [data-open="1"]') || (!!lf && !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(getComputedStyle(lf).transform));
    void travel(slug, false, open);
  }
  /** Exit: back to the mode BABY was entered from, same route, top of the page. */
  function exit(): void {
    setMode(adultMode());
    scrollTo(0, 0);
  }

  // ---------- autoplay ----------
  // dwell (s) = clamp(settle, 0, P_CAP) + P_HOLD for a settling page, P_IDLE for an idle loop (settle = Infinity); >= P_MIN
  const P_CAP = 12, P_HOLD = 2.5, P_IDLE = 8, P_MIN = 5;
  let playing = $state(false), pAcc = 0; // pAcc: seconds the current page has been shown while playing (reset on mount)
  // dev only: window.__bbDwell = s replaces the dwell (fast e2e runs); production: the formula
  function dwell(): number {
    const o = import.meta.env.DEV ? Number((window as unknown as { __bbDwell?: number }).__bbDwell) : NaN, s = scene?.settle ?? Infinity;
    return o > 0 ? o : Math.max(P_MIN, Number.isFinite(s) ? Math.min(Math.max(s, 0), P_CAP) + P_HOLD : P_IDLE);
  }
  /** The last page of the last book in the order (autoplay stops here instead of wrapping to the cover). */
  const atEnd = (): boolean => !!book && idx >= book.pages.length - 1 && (neighbor(1) ?? "cover") === "cover";
  function play(): void {
    if (playing) { playing = false; return; }
    pAcc = 0;
    playing = true;
    if (atEnd() && book) { if (book.slug === "cover") go(0); else void travel("cover", false); }
  }
  $effect(() => {
    if (!playing) return;
    let t0 = performance.now();
    const id = setInterval(() => {
      const now = performance.now(), dt = Math.min(0.2, (now - t0) / 1000); // no wall time across a hidden or throttled gap
      t0 = now;
      if (busy || !scene || document.hidden || ui.mode !== "baby") return;
      if ((pAcc += dt) < dwell()) return;
      pAcc = 0;
      if (atEnd()) playing = false; else step(1);
    }, 100);
    return () => clearInterval(id);
  });

  // Info marker: the page note in the shared popup engine (Popups.svelte), headed by the grown-up section.
  const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  $effect(() => {
    const note = pg?.note, l = lab;
    if (!note || !l) return;
    return registerPops({ "baby-note": { h: esc(`${l.no} ${l.title}`.trim()), body: esc(note) } }, "shell");
  });

  // Leaving for the grown-up section switches back to the mode BABY was entered from (plain clicks only).
  function adult(e: MouseEvent): void {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    setMode(adultMode());
  }

  // Touch swipe on the stage (capture phase: observed, never stopped; other pointer input belongs to the scene).
  let sw = { id: -1, x: 0, y: 0, t: 0 };
  function swDown(e: PointerEvent): void { pAcc = 0; if (e.pointerType === "touch" && e.isPrimary) sw = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }; }
  function swUp(e: PointerEvent): void {
    if (e.pointerId !== sw.id) return;
    sw.id = -1;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > 2 * Math.abs(dy) && performance.now() - sw.t < 800) step(dx < 0 ? 1 : -1);
  }

  onMount(() => {
    const skip = (e: KeyboardEvent): boolean => ui.mode !== "baby" || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
      || (e.target instanceof Element && !!e.target.closest("input, textarea, select, [contenteditable]"));
    const key = (e: KeyboardEvent): void => {
      if (skip(e) || !book) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); step(e.key === "ArrowRight" ? 1 : -1); }
      else if (e.key === " " && !(e.target instanceof Element && e.target.closest("button, [role='button']"))) { e.preventDefault(); play(); }
    };
    // Escape exits; capture phase, so an open note popup (closed by Popups on the same key) is seen and only closes
    const esc = (e: KeyboardEvent): void => {
      if (e.key !== "Escape" || skip(e)) return;
      if (!document.querySelector("#ln-pop.show")) exit();
    };
    const vis = (): void => kick();
    const io = new IntersectionObserver(([en]) => { onscreen = en.isIntersecting; kick(); });
    const ro = new ResizeObserver(() => { if (scene && !raf) draw(clock); }); // canvas scenes redraw at the new size
    io.observe(stage);
    ro.observe(stage);
    addEventListener("keydown", key);
    addEventListener("keydown", esc, true);
    document.addEventListener("visibilitychange", vis);
    return () => { removeEventListener("keydown", key); removeEventListener("keydown", esc, true); document.removeEventListener("visibilitychange", vis); io.disconnect(); ro.disconnect(); unmount(); surround(undefined); };
  });
</script>

<section class="baby" aria-label="Picture book">
  <div class="bb-col">
    <div class="bb-stage" bind:this={stage} onclickcapture={doorClick} onpointerdowncapture={swDown} onpointerupcapture={swUp} onpointercancelcapture={() => { sw.id = -1; }}></div>
    <div class="bb-ctl">
      <button type="button" class="bb-btn" aria-label="All books" title="All books" onclick={home}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.5L8 2.5l5.5 5M4 6.5v7h8v-7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <button type="button" class="bb-btn" aria-label={prevLabel} title={prevLabel} disabled={!book} onclick={() => step(-1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>
      <div class="bb-dots" role="group" aria-label="Pages">
        {#each { length: n } as _, i (i)}<button type="button" class="bb-dot" aria-label="Page {i + 1}" aria-current={i === idx ? "true" : undefined} onclick={() => go(i)}><span></span></button>{/each}
      </div>
      <button type="button" class="bb-btn" aria-label={nextLabel} title={nextLabel} disabled={!book} onclick={() => step(1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>
      <button type="button" class="bb-btn bb-play" aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause" : "Play"} aria-pressed={playing} disabled={!book} onclick={play}><svg viewBox="0 0 16 16" aria-hidden="true">{#if playing}<path d="M4.5 3h2.6v10H4.5zM8.9 3h2.6v10H8.9z" fill="currentColor"/>{:else}<path d="M5 3l8 5-8 5z" fill="currentColor"/>{/if}</svg></button>
      <button type="button" class="bb-exit" aria-label="Exit baby mode" title="Exit baby mode (Esc)" onclick={exit}>Exit</button>
    </div>
    <div class="bb-meta">
      <button type="button" class="bb-note" data-pop="baby-note" aria-label="Parent note" style:visibility={pg?.note ? "visible" : "hidden"}>i</button>
      {#if pg && lab}<a class="bb-sec" href={pg.sec} onclick={adult}>{#if lab.no}<span class="n">{lab.no}</span>{/if}{lab.title}</a>{/if}
    </div>
    <p class="bb-fine">{#if book?.slug === "cover"}Not affiliated with any published "for Babies" book series.{/if}</p>
    <p class="bb-fine bb-credit">Created by Wentao Jiang<span class="sep">|</span><a href="https://outside5sigma.com" target="_blank" rel="noopener">homepage</a><span class="sep">|</span><a href="https://github.com/jwt625/lithium-niobate" target="_blank" rel="noopener">GitHub</a></p>
    <p class="bb-sr" aria-live="polite">{pg?.text ?? ""}</p>
  </div>
</section>
