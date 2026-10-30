// BABY mode (DevLog-007 sec. 8): via ?mode=baby the book screen replaces main, masthead, spine, and footer from first
// paint; the stage fits the viewport; route mapping; page turns (buttons, arrow keys, dots, #pN hash) keep every stage
// and control box fixed; home opens the cover's doors; Exit and Escape restore the adult mode with the page content;
// no console errors; no horizontal scroll on phones. ?babyfixture=1 lets the dev server serve books/_fixture.ts for
// books that do not exist yet, ?babyfixture=all for every book (the runtime checks then do not depend on the books'
// state). Production builds ignore both; missing books leave an empty stage there (still no errors).
import { test, expect, type Page } from "@playwright/test";

const URLS = ["/", "/crystal/", "/crystal/polarization/", "/lab/"];
const WIDTHS = [375, 390, 1280];
const SHOTS = process.env.BABY_SHOTS;
const BOXES = ".bb-col, .bb-stage, .bb-ctl, .bb-btn, .bb-play, .bb-exit, .bb-dots, .bb-dot, .bb-meta, .bb-note, .bb-fine";
const go = (url: string, hash = "", fx = "1"): string => `${url}?mode=baby&babyfixture=${fx}${hash}`;

function watch(page: Page): string[] {
  const errs: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(e.message));
  return errs;
}
const boxes = (page: Page): Promise<string[]> =>
  page.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); return `${e.className}:${[r.x, r.y + scrollY, r.width, r.height].map((v) => v.toFixed(1)).join(",")}`; }), BOXES);
const state = (page: Page): Promise<{ cur: number; n: number; hash: string; text: string; scene: boolean }> =>
  page.evaluate(() => {
    const dots = [...document.querySelectorAll(".bb-dot")];
    return { cur: dots.findIndex((d) => d.hasAttribute("aria-current")), n: dots.length, hash: location.hash, text: document.querySelector(".bb-sr")?.textContent ?? "", scene: !!document.querySelector(".bb-stage > .bb-scene") };
  });
const frame = (page: Page): Promise<void> => page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
const hscroll = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const mode = (page: Page): Promise<string | undefined> => page.evaluate(() => document.documentElement.dataset.mode);

async function open(page: Page, url: string, hash = "", fx = "1"): Promise<boolean> {
  await page.goto(go(url, hash, fx));
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".bb-stage")).toBeVisible();
  // a book loads lazily; without one (production before the book lanes land) the stage stays empty
  return page.locator(".bb-dot").first().waitFor({ timeout: 5000 }).then(() => true, () => false);
}

for (const fx of ["1", "all"]) for (const url of URLS) for (const w of WIDTHS) {
  test(`baby ${url} ${w}${fx === "all" ? " fixture" : ""}`, async ({ page }) => {
    const errs = watch(page);
    await page.setViewportSize({ width: w, height: 900 });
    const has = await open(page, url, "", fx);
    expect(await mode(page)).toBe("baby");
    for (const sel of ["main", "header.mast", "footer", ".spine"]) await expect(page.locator(sel).first()).toBeHidden();
    for (const sel of [".bb-ctl", ".bb-exit", ".bb-meta", ".bb-credit"]) await expect(page.locator(sel)).toBeVisible();
    const sq = await page.locator(".bb-stage").boundingBox();
    expect(sq && Math.abs(sq.width - sq.height)).toBeLessThan(1.01);
    expect(await hscroll(page)).toBeLessThanOrEqual(0);
    if (has) {
      const s0 = await state(page);
      expect(s0.scene).toBe(true);
      // route mapping: landing = p1, extras = last page (doors), a chapter section shows its own page when its book has one
      if (url === "/") expect(s0.cur).toBe(0);
      if (url === "/lab/") expect(s0.cur).toBe(s0.n - 1);
      if (url === "/crystal/polarization/" && (await page.locator(".bb-fine").first().textContent()) === "") await expect(page.locator(".bb-sec")).toHaveAttribute("href", "/crystal/polarization/");
      const base = await boxes(page);
      const turn = async (what: string, act: () => Promise<void>): Promise<void> => {
        await act(); await frame(page);
        expect(await boxes(page), what).toEqual(base);
        expect(await hscroll(page), what).toBeLessThanOrEqual(0);
      };
      await turn("first page", () => page.locator(".bb-dot").first().click());
      for (let i = 1; i < s0.n; i++) {
        await turn(`next ${i}`, () => page.getByRole("button", { name: "Next page" }).click());
        const s = await state(page);
        expect(s.cur).toBe(i);
        expect(s.hash).toBe(`#p${i + 1}`);
        expect(s.scene).toBe(true);
      }
      await expect(page.locator(".bb-btn").nth(2)).toHaveAttribute("aria-label", /^Next: /); // last page: next book
      if (s0.n >= 2) {
        await page.locator("body").focus();
        await turn("ArrowLeft", () => page.keyboard.press("ArrowLeft"));
        expect((await state(page)).cur).toBe(s0.n - 2);
        await turn("ArrowRight", () => page.keyboard.press("ArrowRight"));
        expect((await state(page)).cur).toBe(s0.n - 1);
      }
      expect(await page.locator(".bb-stage > .bb-scene").count()).toBe(1); // old scene removed on every turn
    }
    expect(errs, errs.join("\n")).toEqual([]);
  });
}

// the book screen fits the viewport: no vertical or horizontal scroll, every row on screen
for (const [w, h] of [[1280, 800], [390, 844], [375, 667]]) {
  test(`baby fits ${w}x${h}`, async ({ page }) => {
    const errs = watch(page);
    await page.setViewportSize({ width: w, height: h });
    await open(page, "/crystal/polarization/", "", "1");
    const r = await page.evaluate(() => ({ v: document.documentElement.scrollHeight - innerHeight, bottom: document.querySelector(".bb-credit")!.getBoundingClientRect().bottom, stage: document.querySelector(".bb-stage")!.getBoundingClientRect().width }));
    expect(r.v).toBeLessThanOrEqual(0);
    expect(r.bottom).toBeLessThanOrEqual(h);
    expect(r.stage).toBeGreaterThan(Math.min(w, h) - 160); // as large as fits
    expect(await hscroll(page)).toBeLessThanOrEqual(0);
    if (SHOTS && w !== 375) {
      await page.screenshot({ path: `${SHOTS}/baby-${w}x${h}-crystal.png` });
      await open(page, "/", "", "1");
      await page.screenshot({ path: `${SHOTS}/baby-${w}x${h}-cover.png` });
    }
    expect(errs, errs.join("\n")).toEqual([]);
  });
}

test("baby #pN hash opens that page", async ({ page }) => {
  const errs = watch(page);
  if (!(await open(page, "/", "#p3", "all"))) test.skip(true, "no cover book");
  const s = await state(page);
  expect(s.cur).toBe(Math.min(2, s.n - 1));
  expect(errs, errs.join("\n")).toEqual([]);
});

for (const fx of ["1", "all"]) test(`baby frame loop with motion${fx === "all" ? " fixture" : ""}`, async ({ page }) => {
  const errs = watch(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  if (!(await open(page, "/crystal/polarization/", "", fx))) test.skip(true, "no book");
  await page.locator(".bb-dot").first().click();
  const n = (await state(page)).n;
  for (let i = 1; i < n; i++) { await page.waitForTimeout(400); await page.getByRole("button", { name: "Next page" }).click(); }
  await page.keyboard.press("ArrowLeft");
  await page.locator(".bb-stage").click({ position: { x: 100, y: 100 } }); // scenes may wake on tap
  await page.waitForTimeout(1500);
  expect(errs, errs.join("\n")).toEqual([]);
});

for (const how of ["button", "Escape"]) test(`baby exit by ${how} restores the adult mode on the same route`, async ({ page }) => {
  const errs = watch(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "/crystal/polarization/");
  if (how === "button") await page.getByRole("button", { name: "Exit baby mode" }).click();
  else { await page.locator("body").focus(); await page.keyboard.press("Escape"); }
  await frame(page);
  expect(await mode(page)).toBe("tech"); // fresh context: no stored adult mode
  expect(new URL(page.url()).pathname).toBe("/crystal/polarization/");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("main h1, main h2").first()).toBeVisible();
  await expect(page.locator("header.mast")).toBeVisible();
  await expect(page.locator(".baby")).toBeHidden();
  expect(await page.locator(".bb-scene").count()).toBe(0); // scene destroyed outside BABY
  // the masthead button re-enters BABY; Exit then returns to the mode it was entered from
  await page.getByRole("button", { name: "VISUAL" }).click();
  await page.getByRole("button", { name: "BABY" }).click(); await frame(page);
  await expect(page.locator("main")).toBeHidden();
  await expect(page.locator("header.mast")).toBeHidden();
  await page.getByRole("button", { name: "Exit baby mode" }).click(); await frame(page);
  expect(await mode(page)).toBe("visual");
  expect(errs, errs.join("\n")).toEqual([]);
});

test("baby home opens the cover's doors via client-side navigation", async ({ page }) => {
  const errs = watch(page);
  if (!(await open(page, "/crystal/polarization/", "", "all"))) test.skip(true, "fixture is dev only");
  await page.getByRole("button", { name: "All books" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  await expect(page.locator(".bb-fine").first()).toContainText("Not affiliated");
  const s = await state(page);
  expect(s.cur).toBe(s.n - 1);
  expect(await mode(page)).toBe("baby");
  expect(errs, errs.join("\n")).toEqual([]);
});

test("baby note marker opens the popup; the section link leaves BABY for that section", async ({ page }) => {
  const errs = watch(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  if (!(await open(page, "/crystal/polarization/", "", "all"))) test.skip(true, "fixture is dev only");
  const note = await page.evaluate(() => getComputedStyle(document.querySelector(".bb-note")!).visibility);
  if (note === "visible") {
    await page.locator(".bb-note").hover();
    await expect(page.locator("#ln-pop.show")).toBeVisible();
    await expect(page.locator("#ln-pop .h")).toContainText("1.2");
    await page.keyboard.press("Escape"); // closes the popup only
    expect(await mode(page)).toBe("baby");
  }
  const href = await page.locator(".bb-sec").getAttribute("href");
  await page.locator(".bb-sec").click();
  await page.waitForURL((u) => u.pathname === href);
  expect(await mode(page)).toBe("tech");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator(".baby")).toBeHidden();
  expect(errs, errs.join("\n")).toEqual([]);
});

// book boundaries: Next on a last page opens the next book's p1 (cover, chapters in site.ts order, wrap to the cover);
// Prev on p1 opens the previous book's last page; the query is kept; every stage and control box stays put
const NEXT = ".bb-ctl > .bb-btn:nth-child(4)", PREV = ".bb-ctl > .bb-btn:nth-child(2)"; // home, prev, dots, next, play, exit
for (const [from, how, to, toLast] of [
  ["/crystal/", "next", "/light/", false], ["/crystal/", "ArrowRight", "/light/", false], ["/industry/", "next", "/", false],
  ["/crystal/", "prev", "/", true], ["/", "prev", "/industry/", true],
] as const) {
  test(`baby boundary ${from} ${how} -> ${to}`, async ({ page }) => {
    const errs = watch(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    if (!(await open(page, from, toLast ? "#p1" : "#p99"))) test.skip(true, "no book");
    const s0 = await state(page);
    expect(s0.cur).toBe(toLast ? 0 : s0.n - 1);
    await expect(page.locator(toLast ? PREV : NEXT)).toHaveAttribute("aria-label", toLast ? /^Previous: / : /^Next: /);
    const base = await boxes(page);
    if (how === "ArrowRight") { await page.locator("body").focus(); await page.keyboard.press("ArrowRight"); }
    else await page.locator(how === "next" ? NEXT : PREV).click();
    await page.waitForURL((u) => u.pathname === to && u.searchParams.get("mode") === "baby");
    // the new book loads lazily: wait until its page and hash are in place
    await expect.poll(async () => { const t = await state(page); return t.scene && t.hash === `#p${t.cur + 1}` && t.cur === (toLast ? t.n - 1 : 0) && t.text !== s0.text; }).toBe(true);
    const s = await state(page);
    expect(s.cur).toBe(toLast ? s.n - 1 : 0);
    expect(s.hash).toBe(`#p${s.cur + 1}`);
    expect(await boxes(page)).toEqual(base);
    expect(errs, errs.join("\n")).toEqual([]);
  });
}

// door transitions (motion on): Next / Prev across a book (exit through one door, enter the next: nominal 1.2 s) and a
// door click on the cover's door page or home (one half: nominal 0.6 s); bound 3 s, because the headless
// software renderer draws the filtered paper-cut menu slowly; each ends on the right route and page with exactly one
// layer left in the stage; reduced motion: no menu layer at all
const MENU_SEEN = (): void => {
  const w = window as unknown as { menuSeen: boolean };
  w.menuSeen = false;
  new MutationObserver(() => { if (document.querySelector(".bb-menu")) w.menuSeen = true; }).observe(document.body, { childList: true, subtree: true });
};
async function landed(page: Page, path: string, cur: "first" | "last", ms = 1500): Promise<void> {
  await expect.poll(async () => {
    const s = await state(page), u = new URL(await page.evaluate(() => location.href));
    const layers = await page.locator(".bb-stage > *").count();
    return `${u.pathname} ${u.searchParams.get("mode")} ${s.cur === (cur === "first" ? 0 : s.n - 1) ? "cur-ok" : `cur=${s.cur}`} ${s.hash === `#p${s.cur + 1}` ? "hash-ok" : s.hash} layers=${layers}`;
  }, { timeout: ms, intervals: [50] }).toBe(`${path} baby cur-ok hash-ok layers=1`);
}
for (const [what, from, hash, act, to, cur] of [
  ["Next on a last page", "/crystal/", "#p99", "next", "/light/", "first"],
  ["Prev on p1", "/light/", "#p1", "prev", "/crystal/", "last"],
  ["door click", "/", "#p4", "door", "/sound/", "first"],
  ["home", "/crystal/polarization/", "", "home", "/", "last"],
] as const) {
  test(`baby door transition: ${what}`, async ({ page }) => {
    const errs = watch(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1280, height: 800 });
    if (!(await open(page, from, hash))) test.skip(true, "no book");
    await page.waitForTimeout(1500); // intro animations (the door page pops its doors in)
    await page.evaluate(MENU_SEEN);
    const base = await boxes(page);
    if (act === "next") await page.locator(NEXT).click();
    else if (act === "prev") await page.locator(PREV).click();
    else if (act === "home") await page.getByRole("button", { name: "All books" }).click();
    else await page.locator('.bb-stage a[href="/sound/"]').first().click();
    await landed(page, to, cur, 3000);
    expect(await page.evaluate(() => (window as unknown as { menuSeen: boolean }).menuSeen)).toBe(true); // the zoom ran
    expect(await boxes(page)).toEqual(base);
    expect(errs, errs.join("\n")).toEqual([]);
  });
}

test("baby reduced motion: book change is a plain switch", async ({ page }) => {
  const errs = watch(page);
  if (!(await open(page, "/crystal/", "#p99"))) test.skip(true, "no book");
  await page.evaluate(MENU_SEEN);
  await page.locator(NEXT).click();
  await landed(page, "/light/", "first");
  expect(await page.evaluate(() => (window as unknown as { menuSeen: boolean }).menuSeen)).toBe(false);
  expect(errs, errs.join("\n")).toEqual([]);
});

test("baby door click on a hovered door: no second leaf swing", async ({ page }) => {
  const errs = watch(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 800 });
  if (!(await open(page, "/", "#p4"))) test.skip(true, "no cover book");
  await page.waitForTimeout(1500);
  const door = page.locator('.bb-stage > .bb-scene:not(.bb-menu) a[href="/sound/"]').first();
  await door.hover();
  // the hover swing has finished (scaleX(.58) skewY(-8deg); slow under the software renderer, so polled)
  const leafT = (): Promise<string> => door.evaluate((a) => getComputedStyle(a.querySelector('[class$="leaf"]')!).transform);
  await expect.poll(leafT, { timeout: 10_000 }).toMatch(/^matrix\(0\.58, /);
  const openT = await leafT();
  // first frame after the transition menu appears: its copy of the door is already open, with no transition running
  await page.evaluate(() => {
    const w = window as unknown as { leafAtStart?: { t: string; anims: number } };
    const mo = new MutationObserver(() => {
      const lf = document.querySelector('.bb-menu a[href="/sound/"] [class$="leaf"]');
      if (!lf) return;
      mo.disconnect();
      requestAnimationFrame(() => { w.leafAtStart = { t: getComputedStyle(lf).transform, anims: lf.getAnimations().length }; });
    });
    mo.observe(document.querySelector(".bb-stage")!, { childList: true, subtree: true });
  });
  await door.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { leafAtStart?: unknown }).leafAtStart ?? null)).toEqual({ t: openT, anims: 0 });
  await landed(page, "/sound/", "first", 3000);
  expect(errs, errs.join("\n")).toEqual([]);
});

// Play: pages turn by themselves (dev override window.__bbDwell = 0.4 s per page), across a book boundary, and stop on
// the last page of the last book (no wrap); Play there restarts at cover p1; Space toggles; manual Next keeps playing;
// Exit stops; the control row keeps every box in place in both states
test("baby play runs to the end of the last book and stops", async ({ page }) => {
  const errs = watch(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  if (!(await open(page, "/history/", "#p99", "all"))) test.skip(true, "fixture is dev only");
  await page.evaluate(() => { (window as unknown as { __bbDwell: number }).__bbDwell = 0.4; });
  const play = page.locator(".bb-play"), where = async (): Promise<string> => { const s = await state(page); return `${new URL(page.url()).pathname} ${s.cur}/${s.n}`; };
  const base = await boxes(page);
  await expect(play).toHaveAttribute("aria-pressed", "false");
  await expect(play).toHaveAttribute("aria-label", "Play");
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect(play).toHaveAttribute("aria-label", "Pause");
  await frame(page);
  expect(await boxes(page)).toEqual(base); // playing vs paused
  await expect.poll(where, { timeout: 5000, intervals: [50] }).toMatch(/^\/industry\/ 0\//); // crossed the book boundary
  await expect(play).toHaveAttribute("aria-pressed", "false", { timeout: 10_000 }); // stopped by itself
  const end = await state(page);
  expect(new URL(page.url()).pathname).toBe("/industry/");
  expect(end.cur).toBe(end.n - 1);
  await page.waitForTimeout(1200); // three dwells: still there, no wrap
  expect(await where()).toBe(`/industry/ ${end.n - 1}/${end.n}`);
  expect(await boxes(page)).toEqual(base);
  // Space (focus outside any button) toggles; Play on the final page restarts at cover p1
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press(" ");
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(where, { timeout: 5000, intervals: [50] }).toMatch(/^\/ 0\//);
  await page.locator(NEXT).click(); // manual Next: still playing
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press(" ");
  await expect(play).toHaveAttribute("aria-pressed", "false");
  const held = await where();
  await page.waitForTimeout(1200);
  expect(await where()).toBe(held); // paused: no turn
  // Exit stops play
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Exit baby mode" }).click(); await frame(page);
  expect(await mode(page)).toBe("tech");
  await expect(play).toHaveAttribute("aria-pressed", "false");
  expect(errs, errs.join("\n")).toEqual([]);
});
