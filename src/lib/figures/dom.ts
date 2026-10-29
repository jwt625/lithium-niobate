// DOM helpers shared by the imperative figure modules (ports of the mockup scripts). Browser only.

/** First match inside root; throws when the markup lacks the element (a port bug, not a runtime condition). */
export function need<T extends Element = HTMLElement>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`figure markup is missing ${sel}`);
  return el;
}
export const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string): T | null => root.querySelector<T>(sel);
export const qa = <T extends Element = HTMLElement>(root: ParentNode, sel: string): T[] => [...root.querySelectorAll<T>(sel)];

const html = (): HTMLElement => document.documentElement;
export const isVisual = (): boolean => html().dataset.mode === "visual";
/** VISUAL styling of the chrome (masthead, footer, popups): VISUAL and BABY. Figures keep isVisual (they are hidden in BABY). */
export const visualChrome = (): boolean => { const m = html().dataset.mode; return m === "visual" || m === "baby"; };
export const fxOn = (): boolean => html().dataset.fx === "on";
export const isLight = (): boolean => html().dataset.theme === "light";
export const isDark = (): boolean => html().dataset.theme !== "light";
export const cssVar = (name: string): string => getComputedStyle(html()).getPropertyValue(name).trim();
export const dpr = (): number => Math.min(2, window.devicePixelRatio || 1);

export interface UiDetail { mode: "tech" | "visual" | "baby"; theme: "dark" | "light"; fx: boolean }
/** Subscribe to mode, theme, and effects changes (window event "ln-mode", emitted by the ui store). Returns the unsubscribe. */
export function onUi(cb: (d: UiDetail) => void): () => void {
  const h = (e: Event): void => cb((e as CustomEvent<UiDetail>).detail);
  window.addEventListener("ln-mode", h);
  return () => window.removeEventListener("ln-mode", h);
}

/** Collects teardown callbacks of a mounted figure (listeners, observers, animation frames). */
export class Disposer {
  private fns: (() => void)[] = [];
  add(fn: () => void): void { this.fns.push(fn); }
  on<K extends keyof HTMLElementEventMap>(el: EventTarget, type: K | string, fn: (e: never) => void, opt?: AddEventListenerOptions | boolean): void {
    el.addEventListener(type, fn as EventListener, opt);
    this.fns.push(() => el.removeEventListener(type, fn as EventListener, opt));
  }
  observe(target: Element, cb: ResizeObserverCallback): ResizeObserver {
    const ro = new ResizeObserver(cb);
    ro.observe(target);
    this.fns.push(() => ro.disconnect());
    return ro;
  }
  run = (): void => { this.fns.splice(0).reverse().forEach((f) => f()); };
}

/** One rAF-coalesced call of fn per frame. */
export function rafQueue(fn: () => void): () => void {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(); });
  };
}
