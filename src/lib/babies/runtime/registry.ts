// Book registry and route mapping for BABY mode (DevLog-007 sec. 8). Books load lazily (one chunk each, fetched only in
// BABY); files starting with "_" are not registered. Dev only: ?babyfixture=1 serves books/_fixture.ts (renamed) for
// the slugs that have no book yet, ?babyfixture=all for every slug (runtime e2e tests independent of the books' state);
// production builds drop that branch.
import type { BabyBook } from "../types";
import { CHAPTERS, EXTRAS } from "$lib/content/site";

type Loader = () => Promise<{ default: BabyBook }>;
const BOOKS = new Map<string, Loader>();
for (const [p, load] of Object.entries(import.meta.glob<{ default: BabyBook }>(["../books/*.ts", "!../books/_*.ts"]))) {
  const f = p.slice(p.lastIndexOf("/") + 1, -3);
  if (!f.startsWith("_")) BOOKS.set(f, load);
}

let fixture: Loader | null = null;
if (import.meta.env.DEV) fixture = import.meta.glob<{ default: BabyBook }>("../books/_fixture.ts")["../books/_fixture.ts"] ?? null;

const fix = (search: string): string | null => (fixture ? new URLSearchParams(search).get("babyfixture") : null);
const real = (slug: string, search: string): boolean => BOOKS.has(slug) && fix(search) !== "all";
export const hasBook = (slug: string, search = ""): boolean => BOOKS.has(slug) || fix(search) === "1" || fix(search) === "all";

/** The book `slug`, or null when it does not exist or fails to load. */
export async function loadBook(slug: string, search = ""): Promise<BabyBook | null> {
  const load = real(slug, search) ? BOOKS.get(slug) : hasBook(slug, search) ? fixture : null;
  if (!load) return null;
  try {
    const b = (await load()).default;
    return real(slug, search) ? b : { ...b, slug };
  } catch (e) {
    console.warn(`baby book ${slug} failed to load`, e);
    return null;
  }
}

const slash = (p: string): string => (p.endsWith("/") ? p : `${p}/`);

/** Route -> book: "/" = cover p1; chapter landing = its book p1; section = first page whose sec matches, else p1;
 *  chapters without a book, extras, unknown paths = cover last page (the doors). */
export interface Target { slug: string; sec: string | null; last: boolean }
export function targetFor(pathname: string, search = ""): Target {
  const segs = pathname.split("/").filter(Boolean);
  if (!segs.length) return { slug: "cover", sec: null, last: false };
  const ch = CHAPTERS.find((c) => c.slug === segs[0]);
  if (ch && hasBook(ch.slug, search)) return { slug: ch.slug, sec: segs.length > 1 ? slash(pathname) : null, last: false };
  return { slug: "cover", sec: null, last: true };
}

/** Page index for a target in a loaded book; a #pN hash (1-based) wins. */
export function pageFor(book: BabyBook, t: Target, hash: string): number {
  const n = book.pages.length, m = /^#p(\d+)$/.exec(hash);
  if (m) return Math.min(n - 1, Math.max(0, +m[1] - 1));
  if (t.last) return n - 1;
  if (t.sec) return Math.max(0, book.pages.findIndex((p) => slash(p.sec) === t.sec));
  return 0;
}

/** Number and title of a grown-up page from site.ts: section ("1.1"), chapter ("01"), extra ("L"), landing (""). */
export function secLabel(href: string): { no: string; title: string } {
  const h = slash(href);
  if (h === "/") return { no: "", title: "Lithium Niobate" };
  for (const c of CHAPTERS) {
    if (`/${c.slug}/` === h) return { no: c.no, title: c.title };
    const s = c.sections.find((x) => slash(x.href) === h);
    if (s) return { no: s.no, title: s.title };
  }
  const ex = EXTRAS.find((e) => `/${e.slug}/` === h);
  return ex ? { no: ex.code, title: ex.title } : { no: "", title: h };
}
