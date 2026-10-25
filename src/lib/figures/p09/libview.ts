// /library/ filter binding (both variants): state src/lib/stores/p09.ts libFilter. Rows [data-lr] carry data-ch
// ("02 04"), data-s ("2.3 4.1"), data-y, data-q (lower-case search text). Controls: select[data-lf], button[data-lfv],
// input[data-lf=q]. The year histogram [data-lfo=hist] marks the filtered share per year.
import { libFilter } from "$lib/stores/p09";
import { Disposer } from "../dom.ts";

export const ERAS: readonly [string, number, number][] = [["all", 0, 9999], ["before 1970", 0, 1969], ["1970s", 1970, 1979], ["1980s", 1980, 1989], ["1990s", 1990, 1999], ["2000s", 2000, 2009], ["2010s", 2010, 2019], ["2020s", 2020, 2029]];

export function mountLib(root: HTMLElement): () => void {
  const dis = new Disposer();
  const tech = [...root.querySelectorAll<HTMLElement>("[data-variant=tech] [data-lr]")];
  const els = [...root.querySelectorAll<HTMLElement>("[data-lr]")];
  const bars = [...root.querySelectorAll<SVGRectElement>("[data-lfo=hist] rect[data-y]")];
  const apply = (): void => {
    const f = libFilter, q = f.q.trim().toLowerCase();
    const cnt = new Map<string, number>();
    let n = 0;
    for (const el of els) {
      const d = el.dataset, y = +(d.y || 0);
      const ok = (!f.ch || (d.ch ?? "").split(" ").includes(f.ch)) && (!f.sec || (d.s ?? "").split(" ").includes(f.sec)) && y >= f.from && y <= f.to && (!q || (d.q ?? "").includes(q));
      el.hidden = !ok;
      if (ok && tech.includes(el)) { n++; if (d.y) { const key = y < 1940 ? "pre" : d.y; cnt.set(key, (cnt.get(key) ?? 0) + 1); } }
    }
    for (const o of root.querySelectorAll<HTMLElement>("[data-lfo=count]")) o.textContent = `${String(n).padStart(3, " ")} of ${tech.length} references`;
    for (const o of root.querySelectorAll<HTMLElement>("[data-lfo=empty]")) o.hidden = n > 0;
    for (const b of bars) { const all = +(b.dataset.n ?? 0), k = cnt.get(b.dataset.y ?? "") ?? 0, h = +(b.dataset.h ?? 0); const hh = all ? (h * k) / all : 0; b.setAttribute("height", hh.toFixed(2)); b.setAttribute("y", (+(b.dataset.base ?? 0) - hh).toFixed(2)); }
    for (const s of root.querySelectorAll<HTMLSelectElement>("select[data-lf]")) s.value = s.dataset.lf === "ch" ? f.ch : f.sec;
    for (const i of root.querySelectorAll<HTMLInputElement>("input[data-lf=q]")) if (i.value !== f.q) i.value = f.q;
    for (const b of root.querySelectorAll<HTMLButtonElement>("button[data-lfv]")) { const [k, v] = (b.dataset.lfv ?? "").split(":"); b.classList.toggle("on", k === "era" ? ERAS[+v][1] === f.from && ERAS[+v][2] === f.to : (k === "ch" ? f.ch : f.sec) === v); }
  };
  dis.on(root, "input", (e: Event) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement, k = t.dataset?.lf;
    if (k === "ch") { libFilter.ch = t.value; libFilter.sec = ""; } else if (k === "sec") libFilter.sec = t.value; else if (k === "q") libFilter.q = t.value; else return;
    apply();
  });
  dis.on(root, "click", (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-lfv]");
    if (!b || !root.contains(b)) return;
    const [k, v] = (b.dataset.lfv ?? "").split(":");
    if (k === "era") { libFilter.from = ERAS[+v][1]; libFilter.to = ERAS[+v][2]; } else if (k === "ch") { libFilter.ch = v; libFilter.sec = ""; }
    apply();
  });
  apply();
  return dis.run;
}
