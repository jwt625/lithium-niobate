// Chapter 07 History: popup entries built in the browser from page data (events, status codes, images).
import type { Pop } from "$lib/content/pops";
import { HSTATUS, type HStatus } from "./status";
import type { Ev } from "./events";
import type { Img } from "./data";

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escA = (s: string): string => esc(s).replace(/"/g, "&quot;");

export function statusPops(): Record<string, Pop> {
  const out: Record<string, Pop> = {};
  for (const k of Object.keys(HSTATUS) as HStatus[]) out[`hst:${k}`] = { h: `${HSTATUS[k].text}: ${HSTATUS[k].name}`, body: HSTATUS[k].def, badges: [[HSTATUS[k].cls, HSTATUS[k].text]] };
  return out;
}

export const evLink = (e: Ev): string =>
  e.doi ? `<a href="https://doi.org/${escA(e.doi)}">doi:${esc(e.doi)}</a>` : e.url ? `<a href="${escA(e.url)}">${esc(e.url.replace(/^https?:\/\//, "").slice(0, 60))}</a>` : "";

/** Row popup (figures.md F7.0): title, hook, people, institution, citation, DOI link, notes, status badge. */
export function eventPops(evs: readonly Ev[]): Record<string, Pop> {
  const out: Record<string, Pop> = {};
  for (const e of evs) {
    const body = [
      e.hook ? `<i>${esc(e.hook)}</i>` : "",
      e.people.length ? `<span class="dim">Who</span> ${esc(e.people.join(", "))}` : "",
      e.org ? `<span class="dim">Where</span> ${esc(e.org)}` : "",
      e.notes ? `<span class="dim">Notes</span> ${esc(e.notes)}` : "",
    ].filter(Boolean).join("<br>");
    const link = evLink(e);
    out[`e:${e.id}`] = {
      h: `<span class="v">${esc(e.date)}</span> ${esc(e.title)}`, body,
      badges: [[HSTATUS[e.st].cls, `${HSTATUS[e.st].text} ${HSTATUS[e.st].name}`]],
      src: [esc(e.cite), link].filter(Boolean).join(". ") || undefined,
    };
  }
  return out;
}

export function imagePops(imgs: readonly Img[]): Record<string, Pop> {
  const out: Record<string, Pop> = {};
  for (const i of imgs) out[`img:${i.key}`] = { h: esc(i.subject), body: `${esc(i.author)}. ${i.licenseUrl ? `<a href="${escA(i.licenseUrl)}">${esc(i.license)}</a>` : esc(i.license)}.`, src: `<a href="${escA(i.page)}">Wikimedia Commons file page</a>, checked 2026-10-25` };
  return out;
}

/** Server-built entries (sources) arrive as plain data; this adapts them to Pop. */
export const asPops = (d: Record<string, { h: string; body?: string; src?: string }>): Record<string, Pop> => d;
