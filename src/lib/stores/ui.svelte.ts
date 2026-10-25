// Display state: mode (tech | visual), theme (dark | light), effects (VISUAL and no reduced motion).
// The pre-paint script in src/app.html sets html[data-mode|data-theme|data-fx] from ?mode= / ?theme= / localStorage before
// first paint; this store adopts those values on hydration, persists changes (localStorage, try/catch), mirrors them on
// <html>, and emits the window event "ln-mode" that the imperative figure modules listen to (src/lib/figures/dom.ts onUi).
import { browser } from "$app/environment";

export type Mode = "tech" | "visual";
export type Theme = "dark" | "light";

const store = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string): void { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

class UiState {
  mode = $state<Mode>("tech");
  theme = $state<Theme>("dark");
  fx = $state(false);
  reducedMotion = false;
}
export const ui = new UiState();

let inited = false;
/** Adopt the pre-paint state; call once on the client (root layout). */
export function initUi(): void {
  if (!browser || inited) return;
  inited = true;
  const r = document.documentElement;
  ui.mode = r.dataset.mode === "visual" ? "visual" : "tech";
  ui.theme = r.dataset.theme === "light" ? "light" : "dark";
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  ui.reducedMotion = mq.matches;
  apply();
  mq.addEventListener?.("change", () => { ui.reducedMotion = mq.matches; apply(); emit(); });
}

function apply(): void {
  const r = document.documentElement;
  ui.fx = ui.mode === "visual" && !ui.reducedMotion;
  r.dataset.mode = ui.mode;
  r.dataset.theme = ui.theme;
  r.dataset.fx = ui.fx ? "on" : "off";
}

export function emit(): void {
  window.dispatchEvent(new CustomEvent("ln-mode", { detail: { mode: ui.mode, theme: ui.theme, fx: ui.fx } }));
}

export function setMode(m: Mode): void {
  if (m === ui.mode) return;
  ui.mode = m;
  store.set("ln-mode", m);
  apply();
  emit();
}

export function setTheme(t: Theme): void {
  if (t === ui.theme) return;
  ui.theme = t;
  store.set("ln-theme", t);
  apply();
  emit();
}
