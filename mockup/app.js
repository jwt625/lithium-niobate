// Shared mockup behavior (v2). Plain JS, no dependencies.
// html[data-mode]: tech | visual (color). html[data-fx]: on | off (effects: visual mode and no reduced-motion).
(() => {
  const root = document.documentElement;
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };
  const qp = new URLSearchParams(location.search);
  const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pick = (v, ok, d) => (ok.includes(v) ? v : d);
  root.dataset.theme = pick(qp.get("theme") || store.get("ln-theme", "dark"), ["dark", "light"], "dark");
  root.dataset.mode = pick(qp.get("mode") || store.get("ln-mode", "tech"), ["tech", "visual"], "tech");
  const mode = () => root.dataset.mode;
  const visual = () => root.dataset.mode === "visual";
  const fx = () => visual() && !rmq.matches;
  const setFx = () => { root.dataset.fx = fx() ? "on" : "off"; };
  setFx();
  const emit = () => window.dispatchEvent(new CustomEvent("ln-mode", { detail: { mode: mode(), theme: root.dataset.theme, fx: fx() } }));
  rmq.addEventListener?.("change", () => { setFx(); emit(); });

  // theme toggle (SVG sun / moon)
  const ICON = {
    sun: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z"/></svg>',
  };
  const themeBtn = document.getElementById("theme-btn");
  const paintTheme = () => {
    if (!themeBtn) return;
    const dark = root.dataset.theme === "dark";
    themeBtn.innerHTML = dark ? ICON.sun : ICON.moon;
    themeBtn.title = dark ? "Light theme" : "Dark theme";
    themeBtn.setAttribute("aria-pressed", dark ? "false" : "true");
  };
  themeBtn?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("ln-theme", root.dataset.theme); paintTheme(); paintVacancy(); emit();
  });
  paintTheme();

  // mode toggle
  const modeBtns = [...document.querySelectorAll(".seg.mode button")];
  const paintMode = () => modeBtns.forEach((b) => { const on = b.dataset.m === mode(); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
  const anchor = () => { // last visible data-pair block that starts above 120 px (deepest in reading order), else the first one in view
    const vis = [...document.querySelectorAll("[data-pair]")].filter((e) => e.offsetParent !== null);
    const el = vis.filter((e) => e.getBoundingClientRect().top <= 120 && e.getBoundingClientRect().bottom > 1).pop() || vis.find((e) => e.getBoundingClientRect().bottom > 1);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { pair: el.dataset.pair, top: r.top, frac: Math.min(1, Math.max(0, -r.top / Math.max(1, el.offsetHeight))) };
  };
  const restore = (a) => {
    if (!a) return;
    const el = [...document.querySelectorAll(`[data-pair="${a.pair}"]`)].find((e) => e.offsetParent !== null);
    if (!el) return;
    const r = el.getBoundingClientRect(), want = a.top < 0 ? -a.frac * el.offsetHeight : a.top; // keep the same fraction scrolled past, or the same offset
    window.scrollBy(0, r.top - want);
  };
  modeBtns.forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.m === root.dataset.mode) return;
    const a = anchor();
    root.dataset.mode = b.dataset.m; store.set("ln-mode", b.dataset.m); setFx(); paintMode(); emit();
    restore(a); requestAnimationFrame(() => restore(a));
  }));
  paintMode();

  // wavelength units for [data-lam] elements (values in um)
  const UNITS = { nm: (um) => `${(um * 1000).toFixed(um < 1 ? 1 : 0)} nm`, THz: (um) => `${(299792.458 / um / 1000).toFixed(2)} THz`, eV: (um) => `${(1.23984 / um).toFixed(4)} eV` };
  let unit = store.get("ln-unit", "nm");
  if (!UNITS[unit]) unit = "nm";
  const paintUnits = () => {
    document.querySelectorAll("[data-lam]").forEach((el) => { el.textContent = UNITS[unit](parseFloat(el.dataset.lam)); });
    document.querySelectorAll(".seg.units button").forEach((b) => b.classList.toggle("on", b.dataset.u === unit));
  };
  document.querySelectorAll(".seg.units button").forEach((b) => b.addEventListener("click", () => { unit = b.dataset.u; store.set("ln-unit", unit); paintUnits(); }));
  window.LNUI = { mode, visual, fx, paintUnits };
  paintUnits();

  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // Li-vacancy lattice texture (effects only; CSS gates display). Triangular lattice, 6% empty sites (display density).
  function paintVacancy() {
    const color = getComputedStyle(root).getPropertyValue("--dot").trim();
    const a = 14, cols = 12, rows = 12, h = (a * Math.sqrt(3)) / 2, r = rng(1949);
    let d = "";
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (r() < 0.06) continue;
      d += `<circle cx="${(i * a + (j % 2 ? a / 2 : 0) + a / 4).toFixed(2)}" cy="${(j * h + h / 2).toFixed(2)}" r="0.9"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${a * cols}" height="${(h * rows).toFixed(2)}"><g fill="${color}">${d}</g></svg>`;
    root.style.setProperty("--vacancy-tex", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }
  paintVacancy();

  // popups: hover (desktop), focus (keyboard), tap (touch); Esc closes
  const pop = document.createElement("div");
  pop.className = "pop"; pop.setAttribute("role", "tooltip"); pop.id = "ln-pop";
  document.body.appendChild(pop);
  let hideT, showT, current = null;
  document.querySelectorAll("[data-pop]").forEach((el) => {
    if (!el.matches("a, button, input, [tabindex]")) el.tabIndex = 0;
  });
  function fill(key) {
    const p = (window.POPS || {})[key]; if (!p) return false;
    const b = (p.badges || []).map(([c, t]) => `<span class="b ${c}">${t}</span>`).join("");
    pop.innerHTML = `<div class="h">${p.h}</div>${p.body ? `<div>${p.body}</div>` : ""}${b ? `<div class="bdg">${b}</div>` : ""}${p.src ? `<div class="src">${p.src}</div>` : ""}${p.more ? `<a class="more" href="${p.more[1]}">${p.more[0]} &rarr;</a>` : ""}`;
    window.dispatchEvent(new CustomEvent("ln-pop", { detail: key }));
    return true;
  }
  function place(el) {
    const r = el.getBoundingClientRect(), b = document.body.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    const x = Math.max(12, Math.min(r.left, vw - w - 12));
    let y = r.bottom + 6;
    if (r.bottom + h + 12 > innerHeight && r.top - h - 6 > 0) y = r.top - h - 6;
    pop.style.left = `${x - b.left - document.body.clientLeft}px`;
    pop.style.top = `${y - b.top - document.body.clientTop}px`;
  }
  const key = (el) => (visual() && el.dataset.popVisual) || el.dataset.pop;
  const show = (el) => { if (fill(key(el))) { current = el; el.setAttribute("aria-describedby", "ln-pop"); pop.classList.add("show"); place(el); } };
  const hide = () => { pop.classList.remove("show"); current?.removeAttribute("aria-describedby"); current = null; };
  const touch = () => window.matchMedia("(hover: none)").matches;
  document.addEventListener("mouseover", (e) => {
    if (touch()) return;
    const el = e.target.closest("[data-pop]");
    if (el) { clearTimeout(hideT); clearTimeout(showT); if (el !== current) showT = setTimeout(() => show(el), current ? 0 : 200); }
    else if (e.target.closest(".pop")) clearTimeout(hideT);
  });
  document.addEventListener("mouseout", (e) => {
    if (touch()) return;
    if (e.target.closest("[data-pop]") || e.target.closest(".pop")) { clearTimeout(showT); hideT = setTimeout(hide, 200); }
  });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-pop]");
    if (el && touch() && !el.matches("a[href]")) { e.preventDefault(); current === el ? hide() : show(el); }
    else if (!e.target.closest(".pop") && !el) hide();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  document.addEventListener("focusin", (e) => { const el = e.target.closest("[data-pop]"); if (el && e.target === el) show(el); else if (!e.target.closest(".pop")) hide(); });
  window.LNUI.refreshPop = () => { if (current) { fill(key(current)); place(current); } };

  // optic-axis spine: octahedra along c cycle Li, Nb, empty
  const spine = document.querySelector(".spine");
  if (spine) {
    const oct = (f, s, dash) => `<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M6.5 0.7L12.3 6.5 6.5 12.3 0.7 6.5Z" fill="${f}" stroke="${s}" stroke-width="1"${dash ? ' stroke-dasharray="1.4 1.2"' : ""}/></svg>`;
    const KIND = { Li: oct("var(--fg3)", "var(--bg0)"), Nb: oct("var(--fg2)", "var(--bg0)"), vac: oct("var(--bg0)", "var(--fg3)", true) };
    const NAME = { Li: "Li octahedron", Nb: "Nb octahedron", vac: "empty octahedron" };
    const seq = ["Li", "Nb", "vac"];
    let secs = [], marks = [];
    const cur = document.createElement("div"); cur.className = "cursor"; spine.appendChild(cur);
    const build = () => {
      marks.forEach((m) => m.remove());
      secs = [...document.querySelectorAll("[data-spine]")].filter((s) => s.offsetParent !== null);
      marks = secs.map((s, k) => {
        const m = document.createElement("a"); const kind = seq[k % 3];
        m.className = "mark"; m.href = `#${s.id}`; m.tabIndex = -1; m.dataset.kind = kind;
        m.innerHTML = KIND[kind] + `<span class="tip">${s.dataset.spine} <span class="dim">/ ${NAME[kind]}</span></span>`;
        spine.appendChild(m); return m;
      });
    };
    build();
    const layout = () => {
      const H = spine.clientHeight, docH = document.documentElement.scrollHeight;
      secs.forEach((s, k) => { marks[k].style.top = `${Math.min(H - 16, 24 + ((s.getBoundingClientRect().top + scrollY) / docH) * (H - 40))}px`; });
      cur.style.top = `${24 + (scrollY / Math.max(1, docH - innerHeight)) * (H - 44)}px`;
    };
    addEventListener("scroll", layout, { passive: true }); addEventListener("resize", layout); setTimeout(layout, 60);
    window.addEventListener("ln-mode", () => { build(); layout(); setTimeout(layout, 60); });
    if ("ResizeObserver" in window) new ResizeObserver(() => layout()).observe(document.body); // re-place marks when late content (data, fonts) changes the page height
  }

  // photorefractive trace + GRIIRA dimming of .ir-el (effects only)
  const tr = document.getElementById("pr-trace");
  if (tr) {
    const g = tr.getContext("2d"); const dpr = Math.min(2, devicePixelRatio || 1);
    let last = null, running = false, idle = 0;
    const size = () => { tr.width = innerWidth * dpr; tr.height = innerHeight * dpr; }; size(); addEventListener("resize", size);
    const tick = () => {
      g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,0.012)"; g.fillRect(0, 0, tr.width, tr.height);
      g.globalCompositeOperation = "source-over";
      if (++idle < 900 && fx()) requestAnimationFrame(tick); else { running = false; g.clearRect(0, 0, tr.width, tr.height); }
    };
    addEventListener("pointermove", (e) => {
      if (!fx() || e.pointerType !== "mouse") { last = null; return; }
      const p = { x: e.clientX * dpr, y: e.clientY * dpr };
      if (last) { g.strokeStyle = root.dataset.theme === "light" ? "rgba(15,138,69,0.09)" : "rgba(94,227,140,0.08)"; g.lineWidth = 6 * dpr; g.lineCap = "round"; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); }
      last = p; idle = 0; if (!running) { running = true; requestAnimationFrame(tick); }
      document.querySelectorAll(".ir-el").forEach((el) => {
        const r = el.getBoundingClientRect();
        const near = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
        el.style.transition = near ? "opacity .3s" : "opacity 2.5s"; el.style.opacity = near ? "0.35" : "1";
      });
    });
    window.addEventListener("ln-mode", () => { if (!fx()) document.querySelectorAll(".ir-el").forEach((el) => { el.style.opacity = ""; }); });
  }

  // MZM bias point on T = cos^2(phi / 2). TECH / no effects: fixed at quadrature. Effects: single-RC drift, click re-locks.
  const bias = document.querySelector(".bias svg");
  if (bias) {
    const W = 220, H = 64, x0 = 4, x1 = W - 4, y0 = 6, y1 = H - 12;
    const X = (phi) => x0 + (phi / (2 * Math.PI)) * (x1 - x0);
    const Y = (t) => y1 - t * (y1 - y0);
    let d = "";
    for (let i = 0; i <= 120; i++) { const p = (i / 120) * 2 * Math.PI; d += `${i ? "L" : "M"}${X(p).toFixed(1)} ${Y(Math.cos(p / 2) ** 2).toFixed(1)}`; }
    bias.setAttribute("viewBox", `0 0 ${W} ${H}`);
    bias.innerHTML = `<line class="ax" x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}"/><line class="q" x1="${X(Math.PI / 2)}" y1="${y0}" x2="${X(Math.PI / 2)}" y2="${y1}"/><path class="curve" d="${d}"/><rect class="pt" width="7" height="7"/><text x="${x0}" y="${H - 1}">0</text><text x="${X(Math.PI / 2) - 6}" y="${H - 1}">&#960;/2</text><text x="${X(Math.PI) - 3}" y="${H - 1}">&#960;</text><text x="${x1 - 10}" y="${H - 1}">2&#960;</text>`;
    bias.querySelectorAll("text").forEach((t) => { t.setAttribute("font-size", "8"); t.setAttribute("fill", "var(--fg3)"); t.setAttribute("font-family", "IBM Plex Mono, monospace"); });
    const pt = bias.querySelector(".pt"), st = document.querySelector(".bias .state");
    const TAU = 40, SPAN = 0.5 * Math.PI; // display values, not measured
    let t0 = performance.now(), lastTxt = "", looping = false;
    const frame = () => {
      const on = fx(), t = (performance.now() - t0) / 1000;
      const phi = Math.PI / 2 + (on ? SPAN * (1 - Math.exp(-t / TAU)) : 0);
      pt.setAttribute("x", (X(phi) - 3.5).toFixed(1)); pt.setAttribute("y", (Y(Math.cos(phi / 2) ** 2) - 3.5).toFixed(1));
      const txt = `\u03c6b = ${((phi * 180) / Math.PI).toFixed(1)} deg, T = ${(Math.cos(phi / 2) ** 2).toFixed(3)}`;
      if (st && txt !== lastTxt) { st.innerHTML = txt.replace("\u03c6b", "\u03c6<sub>b</sub>"); lastTxt = txt; }
      looping = on;
      if (on) requestAnimationFrame(frame);
    };
    const draw = () => { if (!looping) frame(); };
    bias.addEventListener("click", () => { t0 = performance.now(); draw(); });
    window.addEventListener("ln-mode", () => { t0 = performance.now(); draw(); });
    draw();
  }

  // wafer-map site map: one die per page; built pages are links
  const wafer = document.querySelector(".wafer svg");
  if (wafer) {
    const pages = [["01", "Crystal"], ["02", "Light", "chapter.html"], ["03", "Sound"], ["04", "Quirks"], ["05", "Making"], ["06", "Devices"], ["07", "History"], ["08", "Industry"], ["L", "Lab"], ["D", "Data"], ["R", "Library"], ["C", "Colophon"], ["/", "Landing", "index.html"]];
    const here = wafer.dataset.here || "", R = 84, cx = 90, cy = 88, s = 22;
    let o = `<circle class="edge" cx="${cx}" cy="${cy}" r="${R}"/><rect x="${cx - 34}" y="${cy + R - 7}" width="68" height="12" fill="var(--bg)"/><line class="edge" x1="${cx - 34}" y1="${cy + R - 6.5}" x2="${cx + 34}" y2="${cy + R - 6.5}"/>`;
    let k = 0;
    for (let j = -4; j <= 3; j++) for (let i = -4; i <= 3; i++) {
      const x = cx + i * s, y = cy + j * s;
      if ([[x, y], [x + s, y], [x, y + s], [x + s, y + s]].some(([a, b]) => (a - cx) ** 2 + (b - cy) ** 2 > (R - 2) ** 2) || y + s > cy + R - 8) continue;
      const pg = pages[k++];
      if (!pg) { o += `<rect class="die" x="${x + 1}" y="${y + 1}" width="${s - 2}" height="${s - 2}"><title>unassigned die</title></rect>`; continue; }
      const [code, name, href] = pg, isHere = name === here;
      const rect = `<rect class="die${isHere ? " here" : ""}" x="${x + 1}" y="${y + 1}" width="${s - 2}" height="${s - 2}"><title>${code} ${name}${href ? "" : " (not built)"}</title></rect><text class="dl" x="${x + 3}" y="${y + 10}"${isHere ? ' fill="var(--bg)"' : ""}>${code}</text>`;
      o += href && !isHere ? `<a href="${href}" aria-label="${name}">${rect}</a>` : rect;
    }
    o += `<text x="${cx}" y="${cy + R + 1}" text-anchor="middle" dominant-baseline="hanging">FLAT</text>`;
    wafer.setAttribute("viewBox", "0 0 180 190");
    wafer.innerHTML = o;
  }

  // logo: conoscopic figure at E = 0 (633 nm grayscale in TECH, white light in VISUAL)
  const logo = document.getElementById("logo");
  const paintLogo = () => {
    if (!logo || typeof LN === "undefined") return;
    logo.width = 40; logo.height = 40;
    LN.renderConoscope(logo.getContext("2d"), 40, { thicknessMm: 0.6, fieldKVmm: 0, fieldDir: "x", white: visual(), mono: !visual(), NA: 0.55 });
  };
  paintLogo();
  if (logo && (typeof LN !== "undefined")) { const link = document.createElement("link"); link.rel = "icon"; link.href = logo.toDataURL(); document.head.appendChild(link); }
  window.addEventListener("ln-mode", paintLogo);

  // QPM period label for poled-domain rules (computed, Zelmon CLN e-ray, 21 C)
  if (typeof LN !== "undefined") {
    const lab = `PPLN Λ = ${LN.qpmPeriodSHG(1.064).toFixed(2)} µm (1064 → 532 nm)`;
    document.querySelectorAll(".qpm-lab").forEach((el) => { el.textContent = lab; });
  }

  // poled dividers (chapter pages; effects only via CSS)
  document.querySelectorAll(".poled svg").forEach((svg) => {
    let s = ""; for (let i = 0; i < 240; i++) s += `<rect x="${i * 10}" y="${i % 2 ? 5 : 0}" width="5" height="5" fill="var(--rule2)"/>`;
    svg.setAttribute("viewBox", "0 0 2400 10"); svg.setAttribute("preserveAspectRatio", "none"); svg.innerHTML = s;
  });
})();
