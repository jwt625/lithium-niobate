// Shared mockup behavior. Plain JS, no dependencies.
(() => {
  const root = document.documentElement;
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const reducedOS = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qp = new URLSearchParams(location.search);
  root.dataset.theme = qp.get("theme") || store.get("ln-theme", "dark");
  root.dataset.motion = store.get("ln-motion", reducedOS ? "off" : "on");
  const motionOn = () => root.dataset.motion === "on";

  // ---------- icons ----------
  const ICON = {
    sun: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/></svg>',
    moon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/></svg>',
    motion: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 8c2-4 4-4 6 0s4 4 6 0"/><path d="M14 4v8" opacity=".5"/></svg>',
    still: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 8h12"/><path d="M14 4v8"/></svg>',
  };
  const themeBtn = document.getElementById("theme-btn");
  const motionBtn = document.getElementById("motion-btn");
  function paintButtons() {
    if (themeBtn) themeBtn.innerHTML = root.dataset.theme === "dark" ? ICON.sun : ICON.moon;
    if (motionBtn) motionBtn.innerHTML = motionOn() ? ICON.motion : ICON.still;
    if (themeBtn) themeBtn.title = root.dataset.theme === "dark" ? "Light theme" : "Dark theme";
    if (motionBtn) motionBtn.title = motionOn() ? "Motion on (click to reduce)" : "Motion reduced (click to enable)";
  }
  themeBtn?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("ln-theme", root.dataset.theme);
    paintButtons(); paintVacancyTexture();
  });
  motionBtn?.addEventListener("click", () => {
    root.dataset.motion = motionOn() ? "off" : "on";
    store.set("ln-motion", root.dataset.motion);
    paintButtons();
  });
  paintButtons();

  // ---------- seeded PRNG ----------
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // ---------- Li-vacancy lattice texture (3m triangular lattice, a few missing sites) ----------
  function paintVacancyTexture() {
    const color = getComputedStyle(root).getPropertyValue("--dot").trim();
    const a = 14, cols = 12, rows = 12, h = a * Math.sqrt(3) / 2;
    const W = a * cols, H = h * rows;
    const r = rng(1949);
    let dots = "";
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (r() < 0.06) continue; // vacancy (decorative fraction; explained in the colophon)
      const x = i * a + (j % 2 ? a / 2 : 0) + a / 4, y = j * h + h / 2;
      dots += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.95"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H.toFixed(2)}"><g fill="${color}">${dots}</g></svg>`;
    root.style.setProperty("--vacancy-tex", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }
  paintVacancyTexture();

  // ---------- units (wavelength display) ----------
  const UNITS = {
    nm: (um) => `${(um * 1000).toFixed(um < 1 ? 1 : 0)} nm`,
    THz: (um) => `${(299792.458 / um / 1000).toFixed(1)} THz`,
    eV: (um) => `${(1.23984 / um).toFixed(3)} eV`,
  };
  let unit = store.get("ln-unit", "nm");
  function paintUnits() {
    document.querySelectorAll("[data-lam]").forEach((el) => { el.textContent = UNITS[unit](parseFloat(el.dataset.lam)); });
    document.querySelectorAll(".seg[data-units] button").forEach((b) => b.classList.toggle("on", b.dataset.u === unit));
  }
  document.querySelectorAll(".seg[data-units] button").forEach((b) => b.addEventListener("click", () => { unit = b.dataset.u; store.set("ln-unit", unit); paintUnits(); }));
  window.LNUI = { paintUnits };
  paintUnits();

  // ---------- popups (gwern-style previews) ----------
  const pop = document.createElement("div");
  pop.className = "pop";
  document.body.appendChild(pop);
  let hideT, showT, current;
  function fill(key) {
    const p = (window.POPS || {})[key];
    if (!p) return false;
    const b = (p.badges || []).map(([c, t]) => `<span class="badge ${c}">${t}</span>`).join("");
    pop.innerHTML = `<div class="h">${p.h}</div><div>${p.body}</div>${b ? `<div class="bdg">${b}</div>` : ""}${p.src ? `<div class="src">${p.src}</div>` : ""}${p.more ? `<a class="more" href="${p.more[1]}">${p.more[0]} &rarr;</a>` : ""}`;
    return true;
  }
  function place(el) {
    const r = el.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight;
    let x = r.left + window.scrollX;
    x = Math.max(16 + window.scrollX, Math.min(x, window.scrollX + document.documentElement.clientWidth - w - 16));
    let y = r.bottom + window.scrollY + 8;
    if (r.bottom + h + 16 > window.innerHeight && r.top - h - 8 > 0) y = r.top + window.scrollY - h - 8;
    pop.style.left = `${x}px`; pop.style.top = `${y}px`;
  }
  function show(el) {
    if (!fill(el.dataset.pop)) return;
    current = el; pop.classList.add("show"); place(el);
  }
  function hide() { pop.classList.remove("show"); current = null; }
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-pop]");
    if (el) { clearTimeout(hideT); clearTimeout(showT); showT = setTimeout(() => show(el), current ? 0 : 280); }
    else if (e.target.closest(".pop")) clearTimeout(hideT);
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("[data-pop]") || e.target.closest(".pop")) { clearTimeout(showT); hideT = setTimeout(hide, 240); }
  });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-pop]");
    if (el && window.matchMedia("(hover: none)").matches) { e.preventDefault(); current === el ? hide() : show(el); }
    else if (!e.target.closest(".pop") && !el) hide();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  document.querySelectorAll("[data-pop]").forEach((el) => {
    if (!el.hasAttribute("tabindex") && el.tagName !== "A" && el.tagName !== "BUTTON") el.tabIndex = 0;
    el.addEventListener("focus", () => show(el));
    el.addEventListener("blur", () => { hideT = setTimeout(hide, 200); });
  });

  // ---------- optic-axis spine ----------
  const spine = document.querySelector(".spine");
  if (spine) {
    const OCT = {
      Li: '<svg viewBox="0 0 15 15"><path d="M7.5 0.8 L14.2 7.5 L7.5 14.2 L0.8 7.5Z" fill="var(--li)" stroke="var(--ink)" stroke-width="1"/><path d="M0.8 7.5 H14.2" stroke="var(--ink)" stroke-width="0.8"/></svg>',
      Nb: '<svg viewBox="0 0 15 15"><path d="M7.5 0.8 L14.2 7.5 L7.5 14.2 L0.8 7.5Z" fill="var(--nb)" stroke="var(--ink)" stroke-width="1"/><path d="M0.8 7.5 H14.2" stroke="var(--ink)" stroke-width="0.8"/></svg>',
      vac: '<svg viewBox="0 0 15 15"><path d="M7.5 0.8 L14.2 7.5 L7.5 14.2 L0.8 7.5Z" fill="var(--ink)" stroke="var(--muted)" stroke-width="1" stroke-dasharray="1.6 1.4"/></svg>',
    };
    const seq = ["Nb", "vac", "Li"];
    const secs = [...document.querySelectorAll("[data-spine]")];
    const cur = document.createElement("div"); cur.className = "cursor"; spine.appendChild(cur);
    const marks = secs.map((s, k) => {
      const m = document.createElement("a");
      const kind = seq[k % 3];
      m.className = "mark"; m.href = `#${s.id}`;
      m.innerHTML = OCT[kind] + `<span class="tip">${s.dataset.spine} <span class="mono" style="color:var(--muted)">[${kind === "vac" ? "vacancy" : kind} octahedron]</span></span>`;
      spine.appendChild(m);
      return m;
    });
    function layout() {
      const H = spine.clientHeight, docH = document.documentElement.scrollHeight - window.innerHeight;
      secs.forEach((s, k) => {
        const top = s.getBoundingClientRect().top + window.scrollY;
        marks[k].style.top = `${Math.min(H - 20, 36 + (top / (docH + window.innerHeight)) * (H - 50))}px`;
      });
      const f = docH > 0 ? window.scrollY / docH : 0;
      cur.style.top = `${36 + f * (H - 56)}px`;
    }
    window.addEventListener("scroll", layout, { passive: true });
    window.addEventListener("resize", layout);
    setTimeout(layout, 50);
  }

  // ---------- photorefractive cursor trace (with GRIIRA-style dimming of IR-colored elements) ----------
  const tr = document.getElementById("pr-trace");
  if (tr) {
    const g = tr.getContext("2d");
    let dpr = Math.min(2, window.devicePixelRatio || 1), last = null, running = false, idle = 0;
    const size = () => { tr.width = innerWidth * dpr; tr.height = innerHeight * dpr; };
    size(); addEventListener("resize", size);
    function tick() {
      // erase: dark-conductivity-like exponential decay (stylized time constant ~6 s)
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = "rgba(0,0,0,0.012)";
      g.fillRect(0, 0, tr.width, tr.height);
      g.globalCompositeOperation = "source-over";
      idle++;
      if (idle < 900) requestAnimationFrame(tick); else { running = false; g.clearRect(0, 0, tr.width, tr.height); }
    }
    addEventListener("pointermove", (e) => {
      if (!motionOn() || e.pointerType !== "mouse") return;
      const p = { x: e.clientX * dpr, y: e.clientY * dpr };
      if (last) {
        const light = root.dataset.theme === "light";
        g.strokeStyle = light ? "rgba(17,146,74,0.10)" : "rgba(94,227,140,0.085)";
        g.lineWidth = 7 * dpr; g.lineCap = "round";
        g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke();
      }
      last = p; idle = 0;
      if (!running) { running = true; requestAnimationFrame(tick); }
      // GRIIRA: green light induces infrared absorption -> IR-colored elements near the beam dim briefly
      document.querySelectorAll(".ir-el").forEach((el) => {
        const r = el.getBoundingClientRect();
        const near = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
        el.style.transition = near ? "opacity 0.3s" : "opacity 2.5s";
        el.style.opacity = near ? "0.45" : "1";
      });
    });
    addEventListener("pointerleave", () => { last = null; });
  }

  // ---------- bias-drift indicator ----------
  const meter = document.querySelector(".bias .meter");
  if (meter) {
    const pt = meter.querySelector(".pt"), st = document.querySelector(".bias .state");
    let t0 = performance.now();
    const dir = 1;
    function draw() {
      const t = (performance.now() - t0) / 1000;
      // stylized screening of the applied field: exponential relaxation away from quadrature (tau 40 s)
      const x = motionOn() ? 50 + dir * 38 * (1 - Math.exp(-t / 40)) : 50;
      pt.style.left = `${x}%`;
      if (st) st.textContent = !motionOn() ? "locked (motion reduced)" : t < 2 ? "locked at quadrature" : `drifting (${(x - 50).toFixed(1)}% of range)`;
      requestAnimationFrame(draw);
    }
    meter.addEventListener("click", () => { t0 = performance.now(); });
    draw();
  }

  // ---------- wafer-map site map ----------
  const wafer = document.querySelector(".wafer svg");
  if (wafer) {
    const pages = ["The crystal", "Light", "Sound", "Quirks", "Making it", "Devices", "History", "Industry", "Lab", "Data", "Library", "Colophon"];
    const here = wafer.dataset.here || "";
    const R = 108, cx = 120, cy = 120, s = 26;
    let out = `<circle class="edge" cx="${cx}" cy="${cy}" r="${R}"/>`;
    // primary flat at the bottom (crystal-axis key)
    out += `<rect x="${cx - 44}" y="${cy + R - 7}" width="88" height="14" fill="var(--ink)"/><line class="edge" x1="${cx - 44}" y1="${cy + R - 6.5}" x2="${cx + 44}" y2="${cy + R - 6.5}"/>`;
    let k = 0;
    for (let j = -4; j <= 3; j++) for (let i = -4; i <= 3; i++) {
      const x = cx + i * s, y = cy + j * s;
      const corners = [[x, y], [x + s, y], [x, y + s], [x + s, y + s]];
      if (corners.some(([a, b]) => (a - cx) ** 2 + (b - cy) ** 2 > (R - 4) ** 2) || y + s > cy + R - 8) continue;
      const name = pages[k] || "";
      const isHere = name && name === here;
      out += `<rect class="die${isHere ? " here" : ""}" x="${x + 1}" y="${y + 1}" width="${s - 2}" height="${s - 2}">${name ? `<title>${name}</title>` : "<title>(reserved die)</title>"}</rect>`;
      k++;
    }
    out += `<text x="${cx}" y="${cy + R + 16}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--muted)">primary flat</text>`;
    wafer.innerHTML = out;
  }

  // ---------- logo + favicon (conoscopic figure, E = 0) ----------
  const logo = document.getElementById("logo");
  if (logo && window.LN) {
    const S = 56; logo.width = S; logo.height = S;
    LN.renderConoscope(logo.getContext("2d"), S, { thicknessMm: 0.6, fieldKVmm: 0, fieldDir: "x", white: true, NA: 0.55 });
    const link = document.createElement("link"); link.rel = "icon"; link.href = logo.toDataURL(); document.head.appendChild(link);
  }

  // ---------- poled divider: draw stripes, period label from Sellmeier ----------
  document.querySelectorAll(".poled").forEach((el) => {
    const svg = el.querySelector("svg");
    let s = "";
    for (let i = 0; i < 240; i++) {
      const up = i % 2 === 0;
      s += `<rect x="${i * 10}" y="${up ? 0 : 13}" width="5" height="13" fill="${up ? "var(--line-2)" : "var(--line)"}"/>`;
    }
    svg.setAttribute("viewBox", "0 0 2400 26");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = s;
  });
})();
