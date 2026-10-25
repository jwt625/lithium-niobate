// visual.js: VISUAL design-system components and behaviors (DevLog/DevLog-003b-visual-language.md). Plain JS, no dependencies.
// Needs ln.js (LN) and app.js (LNUI, popups, "ln-mode" event). Initializes on the first VISUAL display; idle in TECH.
(() => {
  const root = document.documentElement;
  const isV = () => root.dataset.mode === "visual";
  const fx = () => !!(window.LNUI && LNUI.fx());
  const light = () => root.dataset.theme === "light";
  const hasLN = typeof LN !== "undefined";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const dprOf = () => Math.min(2, window.devicePixelRatio || 1);
  const FS = " "; // figure space: same advance as a tabular digit
  const MINUS = "−";
  const sgn = (v, d) => (Math.abs(v) < 0.5 * 10 ** -d ? FS : v < 0 ? MINUS : "+") + Math.abs(v).toFixed(d);
  const pad = (s, n) => s.padStart(n, FS);
  const ease = (t) => 1 - (1 - t) ** 3;

  // ---------- color science ----------
  // CIE 1931 2-degree color-matching functions, multi-lobe Gaussian fit: C. Wyman, P.-P. Sloan, P. Shirley, JCGT 2(2), 1 (2013).
  const lobe = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const cmf = (nm) => [
    1.056 * lobe(nm, 599.8, 37.9, 31.0) + 0.362 * lobe(nm, 442.0, 16.0, 26.7) - 0.065 * lobe(nm, 501.1, 20.4, 26.2),
    0.821 * lobe(nm, 568.8, 46.9, 40.5) + 0.286 * lobe(nm, 530.9, 16.3, 31.1),
    1.217 * lobe(nm, 437.0, 11.8, 36.0) + 0.681 * lobe(nm, 459.0, 26.0, 13.8),
  ];
  const toLin = ([X, Y, Z]) => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  const enc = (c) => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
  const hex = (lin) => "#" + lin.map((c) => Math.round(enc(c) * 255).toString(16).padStart(2, "0")).join("");
  // Dominant wavelength kept: add white (equal linear sRGB = D65) until no channel is negative, then max channel = 1.
  function spectralLin(nm) { const c = toLin(cmf(nm)); const m = Math.min(0, ...c); const d = c.map((v) => v - m); const M = Math.max(...d) || 1; return d.map((v) => v / M); }
  const spectral = (nm, k = 1, w = 0) => hex(spectralLin(nm).map((v) => k * (v * (1 - w) + w)));
  window.LNVIS = { spectral };

  function palette() {
    const L = light(), set = (n, v) => root.style.setProperty(n, v);
    set("--v-l532", spectral(532, L ? 0.2 : 1, 0.06));
    set("--v-l633", spectral(632.8, L ? 0.55 : 1, 0.04));
    set("--v-l775", spectral(775, L ? 0.3 : 0.55, 0));
  }

  // ---------- Li-vacancy texture ----------
  // Congruent LN: [Li]/[Nb] = 0.94 (Volk & Woehlecke 2008, p. 9). Li-site vacancy model (Li[1-5x] Nb[x] V[4x]) Nb O3 (assumed):
  // (1 - 5x) / (1 + x) = 0.94 gives x = 0.0101, so 4.04% of Li sites vacant and 1.01% holding Nb antisites.
  const X_AS = 0.06 / 5.94;
  function paintVacancy() {
    const col = css("--dot"), a = 16, cols = 25, rows = 28, h = (a * Math.sqrt(3)) / 2;
    let s = 1949; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const N = cols * rows, idx = [...Array(N).keys()];
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const nV = Math.round(4 * X_AS * N), nA = Math.round(X_AS * N), kind = new Uint8Array(N);
    idx.slice(0, nV).forEach((k) => { kind[k] = 1; });
    idx.slice(nV, nV + nA).forEach((k) => { kind[k] = 2; });
    let dots = "", rings = "";
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i; if (kind[k] === 1) continue;
      const x = ((i + (j % 2 ? 0.5 : 0) + 0.25) * a).toFixed(2), y = ((j + 0.5) * h).toFixed(2);
      if (kind[k] === 2) rings += `<circle cx="${x}" cy="${y}" r="2.4"/>`; else dots += `<circle cx="${x}" cy="${y}" r="1"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * a}" height="${(rows * h).toFixed(2)}"><g fill="${col}">${dots}</g><g fill="none" stroke="${col}" stroke-width="1">${rings}</g></svg>`;
    root.style.setProperty("--vacancy-tex", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }

  // ---------- poled-domain band and section rules: first-order QPM period at 2 px per um ----------
  const PX_UM = 2;
  function poled() {
    if (!hasLN) return;
    $$(".band, .v-band").forEach((band) => {
      if (!band.querySelector("svg")) band.insertBefore(document.createElementNS("http://www.w3.org/2000/svg", "svg"), band.firstChild);
      const lam = parseFloat(band.dataset.qpm || "1.064"), L = LN.qpmPeriodSHG(lam), p = L * PX_UM, q = p / 2;
      root.style.setProperty("--v-dom", `${p.toFixed(3)}px`);
      const svg = band.querySelector("svg");
      if (svg) {
        const ar = (x, up) => `<path d="M${x.toFixed(2)} ${up ? 9.5 : 2.5}V${up ? 2.5 : 9.5}M${(x - 1.8).toFixed(2)} ${up ? 4.5 : 7.5}L${x.toFixed(2)} ${up ? 2.5 : 9.5}L${(x + 1.8).toFixed(2)} ${up ? 4.5 : 7.5}" fill="none" stroke-width="0.9"/>`;
        svg.innerHTML = `<defs><pattern id="v-dom-pat" width="${p.toFixed(3)}" height="12" patternUnits="userSpaceOnUse"><rect width="${q.toFixed(3)}" height="12" fill="var(--v-line2)"/><g stroke="var(--v-ink0)">${ar(q / 2, true)}</g><g stroke="var(--v-text3)">${ar(q + q / 2, false)}</g></pattern></defs><rect width="100%" height="12" fill="url(#v-dom-pat)"/>`;
      }
      const lab = band.querySelector(".qpm-lab");
      const tag = { 1.064: "1064 → 532 nm", 1.55: "1550 → 775 nm" }[lam] || `${(lam * 1000).toFixed(0)} nm SHG`;
      if (lab) lab.textContent = `PPLN Λ = ${L.toFixed(2)} µm · ${tag} · 2 px/µm`;
      window.LNVIS.qpm = { lam, L };
    });
  }

  // ---------- optic-axis spine: shaded octahedra (cycle Li, Nb, empty, as app.js) ----------
  const octa = (kind) => {
    const c = kind === "Li" ? "var(--v-au)" : kind === "Nb" ? "var(--nb)" : "none";
    const st = kind === "vac" ? 'stroke="var(--v-text3)" stroke-dasharray="2 1.5"' : 'stroke="var(--v-ink0)"';
    const F = (d, o) => `<path d="M${d}Z" fill="${c}" fill-opacity="${kind === "vac" ? 0 : o}" ${st} stroke-width="0.9"/>`;
    return `<svg viewBox="0 0 22 22" aria-hidden="true">${F("11 1L2 11L11 13.5", 1)}${F("11 1L20 11L11 13.5", 0.72)}${F("2 11L11 21L11 13.5", 0.5)}${F("20 11L11 21L11 13.5", 0.32)}</svg>`;
  };
  function spine() {
    $$(".spine .mark").forEach((m, k) => {
      const svg = m.querySelector("svg"); if (!svg) return;
      if (!m.dataset.tsvg) m.dataset.tsvg = svg.outerHTML;
      svg.outerHTML = isV() ? octa(m.dataset.kind || ["Li", "Nb", "vac"][k % 3]) : m.dataset.tsvg;
    });
  }

  // ---------- range inputs: fill from minimum (unipolar) or zero (bipolar) ----------
  const TH = 20; // thumb box, px (visual.css)
  function rangeFill(inp) {
    const lo = +inp.min, hi = +inp.max, f = (+inp.value - lo) / (hi - lo), z = lo < 0 && hi > 0 ? -lo / (hi - lo) : 0;
    const at = (u) => `calc(${TH / 2}px + ${u.toFixed(4)} * (100% - ${TH}px))`;
    inp.style.setProperty("--p", at(f)); inp.style.setProperty("--z", at(z));
  }

  // ---------- conoscope bench ----------
  const NA = 0.55, LAM_HUD = 0.6328;
  function initBench() {
    const cv = $("#v-cono"), svg = $("#v-bench-svg");
    if (!cv || !svg || !hasLN) return null;
    const no = (l) => LN.n("o", l), ne = (l) => LN.n("e", l);
    const st = ((window.LNSTATE ||= {}).cono ||= { E: 0, d: 0.6, dir: "x", src: null }); // shared with the TECH Fig. 0 script
    const src = () => st.src || "white"; // VISUAL default source until the reader picks one
    const eIn = $("#v-e"), dIn = $("#v-d"), eOut = $("#v-e-o"), dOut = $("#v-d-o");
    const hDn = $("#v-hud-dn"), hSt = $("#v-hud-st"), hG = $("#v-hud-g");
    const ret = $("#v-ret"), rctx = ret.getContext("2d"), off = document.createElement("canvas"), OS = 192;
    off.width = OS; off.height = OS;
    const octx = off.getContext("2d", { willReadFrequently: true });
    let S = 0, ctx = cv.getContext("2d"), queued = false, compact = null;

    function bench() {
      const C = src() === "white" ? "var(--v-text)" : "var(--v-l633)";
      const w = 8 + ((st.d - 0.2) / 1.8) * 30, px = 360;
      const eLen = (st.E / 5) * 15;
      const ex = st.dir === "x" ? [eLen, 0] : [0, -eLen];
      const beam = (pts, o) => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${C}" fill-opacity="${o}"/>`;
      const up = (x, y) => [x, 150 - y], dn = (x, y) => [x, 150 + y];
      const seg = (xs) => [...xs.map(([x, y]) => up(x, y)), ...xs.reverse().map(([x, y]) => dn(x, y))];
      const lens = (x, hh, k) => `<path d="M${x} ${150 - hh}Q${x + k} 150 ${x} ${150 + hh}Q${x - k} 150 ${x} ${150 - hh}Z" fill="var(--v-sio2)" stroke="var(--v-text2)" stroke-width="1.2"/>`;
      const inset = (x, lab, body) => `<g transform="translate(${x} 46)"><circle r="19" fill="var(--v-ink0)" stroke="var(--v-line2)" stroke-width="1.2"/>${body}<text x="25" y="-10" class="lb3">${lab}</text></g>`;
      const dbl = (dx, dy) => `<path d="M${-dx} ${-dy}L${dx} ${dy}" stroke="var(--v-text)" stroke-width="1.6"/><path d="M${dx} ${dy}l${dy ? 3 : -4} ${dy ? -4 : -3}M${dx} ${dy}l${dy ? -3 : -4} ${dy ? -4 : 3}M${-dx} ${-dy}l${dy ? 3 : 4} ${dy ? 4 : -3}M${-dx} ${-dy}l${dy ? -3 : 4} ${dy ? 4 : 3}" stroke="var(--v-text)" stroke-width="1.6" fill="none"/>`;
      const arrowE = st.E > 0 ? `<path d="M${-ex[0]} ${-ex[1]}L${ex[0]} ${ex[1]}" stroke="var(--v-au)" stroke-width="2"/><path d="M${ex[0]} ${ex[1]}l${st.dir === "x" ? "-5 -3.5" : "-3.5 5"}M${ex[0]} ${ex[1]}l${st.dir === "x" ? "-5 3.5" : "3.5 5"}" stroke="var(--v-au)" stroke-width="2" fill="none"/>` : `<circle r="2" fill="var(--v-text3)"/>`;
      const labels = [[50, "Lamp", src() === "white" ? "white" : "632.8 nm"], [150, "Polarizer", "P along x"], [250, "Condenser", `NA ${NA}`], [px, "LN plate", `z-cut, ${st.d.toFixed(2)} mm`], [470, "Objective", ""], [570, "Analyzer", "A along y"], [670, "Bertrand lens", ""]];
      const lab = labels.map(([x, a, b], k) => {
        const y = compact ? (k % 2 ? 282 : 252) : 252;
        return `<text x="${x}" y="${y}" text-anchor="middle" class="lb">${a}</text>${!compact && b ? `<text x="${x}" y="${y + 20}" text-anchor="middle" class="lb2">${b}</text>` : ""}`;
      }).join("");
      svg.innerHTML = `<style>.lb{font:500 ${compact ? 24 : 15}px var(--v-ui);fill:var(--v-text2)}.lb2{font:400 13px var(--v-ui);fill:var(--v-text3)}.lb3{font:500 ${compact ? 22 : 14}px var(--v-ui);fill:var(--v-text2)}</style>
        <line x1="20" y1="150" x2="860" y2="150" stroke="var(--v-line)" stroke-dasharray="4 4"/>
        ${beam(seg([[72, 20], [146, 34]]), 0.2)}${beam(seg([[154, 35], [250, 46], [px, 3], [470, 46], [566, 46]]), 0.13)}${beam(seg([[574, 46], [670, 46], [800, 6]]), 0.07)}
        <circle cx="50" cy="150" r="22" fill="${C}" fill-opacity="0.18" stroke="var(--v-text2)" stroke-width="1.2"/><path d="M38 150l4-6 4 12 4-12 4 12 4-6" fill="none" stroke="${C}" stroke-width="1.4"/>
        <rect x="146" y="92" width="8" height="116" fill="var(--v-ink2)" stroke="var(--v-text2)" stroke-width="1.2"/>
        ${lens(250, 52, 13)}
        <rect x="${px - w / 2 - 6}" y="84" width="${w + 12}" height="13" fill="var(--v-au)"/><rect x="${px - w / 2 - 6}" y="203" width="${w + 12}" height="13" fill="var(--v-au)"/>
        <rect x="${px - w / 2}" y="98" width="${w}" height="104" fill="var(--v-ln)" fill-opacity="0.28" stroke="var(--v-ln)" stroke-width="1.2"/>
        <path d="M${px - 30} 226H${px + 30}M${px + 30} 226l-6-3.5M${px + 30} 226l-6 3.5" stroke="var(--v-text3)" stroke-width="1.2" fill="none"/><text x="${px + 36}" y="230" class="lb2" style="font-style:italic">c</text>
        ${lens(470, 52, 13)}
        <rect x="566" y="92" width="8" height="116" fill="var(--v-ink2)" stroke="var(--v-text2)" stroke-width="1.2"/>
        ${lens(670, 40, 9)}
        <path d="M806 150H856M856 150l-8-5M856 150l-8 5" stroke="var(--v-text2)" stroke-width="1.6" fill="none"/>
        ${inset(150, "P", dbl(12, 0))}${inset(px, "E", arrowE)}${inset(570, "A", dbl(0, 12))}
        ${lab}`;
    }

    function size() {
      const want = Math.max(240, Math.min(640, Math.round(cv.clientWidth * dprOf())));
      if (want !== S) { S = want; cv.width = S; cv.height = S; }
      const c = svg.clientWidth < 560;
      if (c !== compact) { compact = c; svg.setAttribute("viewBox", `0 0 880 ${compact ? 300 : 290}`); bench(); }
      const rw = Math.max(120, Math.round(ret.clientWidth * dprOf()));
      if (ret.width !== rw) { ret.width = rw; ret.height = 14; }
    }

    function legend() { // E = 0 figure along the 45-degree diagonal, centre to NA edge: the isochromatic sequence for this d and source
      LN.renderConoscope(octx, OS, { thicknessMm: st.d, fieldKVmm: 0, fieldDir: "x", white: src() === "white", mono: false, NA });
      const px = octx.getImageData(0, 0, OS, OS).data, W = ret.width, img = rctx.createImageData(W, 1), h = OS / 2;
      for (let i = 0; i < W; i++) {
        const r = Math.min(0.99, i / (W - 1)), u = r / Math.SQRT2;
        const x = Math.min(OS - 1, Math.floor(h + u * h)), y = Math.max(0, Math.floor(h - u * h)), k = (y * OS + x) * 4;
        img.data.set([px[k], px[k + 1], px[k + 2], 255], i * 4);
      }
      for (let j = 0; j < ret.height; j++) rctx.putImageData(img, 0, j);
      const n5 = no(0.55), s = NA / n5, G = st.d * 1000 * (n5 - ne(0.55)) * (s * s) / Math.sqrt(1 - s * s);
      hG.textContent = `${pad(G.toFixed(2), 5)} µm at 550 nm`;
    }

    let lastD = null, lastSrc = null;
    function draw() {
      queued = false;
      size();
      LN.renderConoscope(ctx, S, { thicknessMm: st.d, fieldKVmm: st.E, fieldDir: st.dir, white: src() === "white", mono: false, NA });
      if (st.d !== lastD || src() !== lastSrc) { legend(); lastD = st.d; lastSrc = src(); }
      const dn = no(LAM_HUD) ** 3 * LN.R22_T * st.E * 1e6;
      hDn.textContent = `${pad((dn * 1e5).toFixed(2), 5)} × 10⁻⁵ at 632.8 nm`;
      if (st.E > 0) {
        const sInt = Math.sqrt(dn / (no(LAM_HUD) - ne(LAM_HUD))), sAir = no(LAM_HUD) * sInt;
        const ang = sAir < 1 ? (Math.asin(sAir) * 180) / Math.PI : NaN;
        hSt.textContent = `biaxial, optic axes ±${Number.isFinite(ang) ? pad(ang.toFixed(1), 4) : " n/a"}° in air`;
      } else hSt.textContent = "uniaxial";
      $$("#v-src button").forEach((b) => { const on = b.dataset.s === src(); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      $$("#v-fdir button").forEach((b) => { const on = b.dataset.f === st.dir; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      bench();
    }
    const req = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    const setE = () => { st.E = +eIn.value; const t = st.E.toFixed(2); eOut.textContent = `${t} kV/mm`; eIn.setAttribute("aria-valuetext", `${t} kilovolts per millimeter`); rangeFill(eIn); req(); };
    const setD = () => { st.d = +dIn.value; const t = st.d.toFixed(2); dOut.textContent = `${t} mm`; dIn.setAttribute("aria-valuetext", `${t} millimeters`); rangeFill(dIn); req(); };
    eIn.addEventListener("input", setE); dIn.addEventListener("input", setD);
    $$("#v-fdir button").forEach((b) => b.addEventListener("click", () => { st.dir = b.dataset.f; req(); }));
    $$("#v-src button").forEach((b) => b.addEventListener("click", () => { st.src = b.dataset.s; req(); }));
    const sync = () => { eIn.value = st.E; dIn.value = st.d; setE(); setD(); };
    sync();
    new ResizeObserver(req).observe(cv);
    new ResizeObserver(() => { compact = null; req(); }).observe(svg);

    // eyepiece frame: mirror-plane traces of 3m (x perpendicular to a mirror) as major ticks, threefold set
    const ring = $("#v-eye-ring");
    if (ring) {
      let t = "";
      for (let k = 0; k < 6; k++) {
        const a = ((90 + k * 60) * Math.PI) / 180, major = k % 2 === 0, r0 = 45.2, r1 = major ? 49 : 47.4;
        t += `<line x1="${(50 + r0 * Math.cos(a)).toFixed(2)}" y1="${(50 - r0 * Math.sin(a)).toFixed(2)}" x2="${(50 + r1 * Math.cos(a)).toFixed(2)}" y2="${(50 - r1 * Math.sin(a)).toFixed(2)}" stroke="var(--v-text${major ? 2 : 3})" stroke-width="${major ? 0.6 : 0.4}"/>`;
      }
      ring.innerHTML = `<circle cx="50" cy="50" r="43.7" fill="none" stroke="var(--v-line2)" stroke-width="0.5"/><circle cx="50" cy="50" r="45.2" fill="none" stroke="var(--v-line)" stroke-width="0.3"/>${t}
        <text x="99.4" y="51.2" font-size="3.4" fill="var(--v-text3)" style="font-family:var(--v-ui)">x</text><text x="51.6" y="2.4" font-size="3.4" fill="var(--v-text3)" style="font-family:var(--v-ui)">y</text>`;
    }
    return { repaint: () => { lastD = null; compact = null; sync(); } };
  }

  // ---------- specimen sheet glyphs ----------
  const TC = { 1: "--v-text", 2: "--v-text2", 3: "--v-text3" };
  const T = (x, y, s, cls = 3, extra = "") => `<text x="${x}" y="${y}" ${extra} fill="var(${TC[cls] || TC[3]})" font-size="13">${s}</text>`;
  function glyphs() {
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    // 3m stereogram, projection along c; x perpendicular to a mirror plane, so mirror traces lie along y and at +/-120 deg
    {
      const cx = 74, cy = 74, R = 62, P = (deg, r) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
      let m = "";
      [90, 210, 330].forEach((a) => { const [x1, y1] = P(a, R), [x2, y2] = P(a + 180, R); m += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--v-text2)" stroke-width="2"/>`; });
      const poles = [65, 185, 305, 115, 235, 355].map((a) => { const [x, y] = P(a, R * 0.62); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="var(--v-text)"/>`; }).join("");
      set("g-sym", `<svg viewBox="0 0 280 150" role="img" aria-label="Stereogram of point group 3m"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--v-text3)" stroke-width="1.2"/>${m}<path d="M${cx} ${cy - 8}L${cx + 7} ${cy + 4.5}H${cx - 7}Z" fill="var(--v-text)"/>${poles}
        <line x1="${cx + R + 4}" y1="${cy}" x2="${cx + R + 16}" y2="${cy}" stroke="var(--v-text3)"/>${T(cx + R + 18, cy + 4, "x")}${T(cx + 6, 10, "y")}
        <line x1="160" y1="30" x2="176" y2="30" stroke="var(--v-text2)" stroke-width="2"/>${T(184, 34, "mirror plane", 2)}
        <path d="M168 54l6 10h-12z" fill="var(--v-text)"/>${T(184, 64, "threefold axis", 2)}
        <circle cx="168" cy="90" r="4" fill="var(--v-text)"/>${T(184, 94, "6 equivalent", 2)}${T(184, 110, "directions;", 2)}${T(184, 126, "no inversion", 2)}</svg>`);
    }

    // hexagonal (conventional) cell to scale: a = 5.148, c = 13.863 Angstrom; rotated 28 deg about c, viewed 18 deg from the basal plane
    {
      const k = 8.4, a = 5.148 * k, c = 13.863 * k, ph = (-28 * Math.PI) / 180, tl = (18 * Math.PI) / 180, o = [70, 140];
      const pr = ([x, y, z]) => { const X = x * Math.cos(ph) - y * Math.sin(ph), D = x * Math.sin(ph) + y * Math.cos(ph); return [o[0] + X, o[1] - z * Math.cos(tl) - D * Math.sin(tl), D]; };
      const b = [[0, 0], [a, 0], [0, 0], [-a / 2, (a * Math.sqrt(3)) / 2]];
      b[2] = [b[1][0] + b[3][0], b[1][1] + b[3][1]];
      const P = (i, z) => pr([b[i][0], b[i][1], z]);
      const far = [0, 1, 2, 3].reduce((m, i) => (P(i, 0)[2] > P(m, 0)[2] ? i : m), 0); // vertex farthest from the viewer: its edges are hidden
      const L = (p, q, hid) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="var(--v-text${hid ? 3 : 2})" stroke-width="${hid ? 1 : 1.6}"${hid ? ' stroke-dasharray="3 3"' : ""}/>`;
      let e = "";
      for (let i = 0; i < 4; i++) { const n = (i + 1) % 4; e += L(P(i, 0), P(n, 0), i === far || n === far) + L(P(i, c), P(n, c), false) + L(P(i, 0), P(i, c), i === far); }
      const p0 = P(0, 0), p1 = P(1, 0), pt = P(0, c);
      set("g-lat", `<svg viewBox="0 0 280 150" role="img" aria-label="Conventional hexagonal cell drawn to scale">${e}
        ${T(((p0[0] + p1[0]) / 2).toFixed(1), (Math.max(p0[1], p1[1]) + 16).toFixed(1), "a", 3, 'text-anchor="middle"')}${T((p0[0] - 10).toFixed(1), ((p0[1] + pt[1]) / 2).toFixed(1), "c", 3, 'text-anchor="end"')}
        ${T(160, 40, "c / a = 2.693", 2)}${T(160, 60, "γ = 120°", 2)}${T(160, 80, "Z = 6", 2)}${T(160, 100, "drawn to scale", 3)}</svg>`);
    }

    // temperature axis 0..1300 C: Curie and melting points
    {
      const X = (t) => 16 + (t / 1300) * 510, y = 70;
      let tk = "";
      for (let t = 0; t <= 1200; t += 200) tk += `<line x1="${X(t)}" y1="${y + 4}" x2="${X(t)}" y2="${y + 10}" stroke="var(--v-text3)"/>${T(X(t), y + 26, t === 0 ? "0 °C" : t, 3, t === 0 ? 'dx="-4"' : 'text-anchor="middle"')}`;
      const mk = (t, lab, left) => `<path d="M${X(t)} ${y - 8}l6 8-6 8-6-8z" fill="var(--v-text)"/><line x1="${X(t)}" y1="30" x2="${X(t)}" y2="${y - 9}" stroke="var(--v-text3)"/>${T(X(t), 40, lab, 1, `text-anchor="${left ? "end" : "start"}" dx="${left ? -6 : 6}"`)}`;
      const sw = (x, fill, lab) => `<rect x="${x}" y="4" width="16" height="6" fill="${fill}"/>${T(x + 22, 11, lab, 3)}`;
      set("g-th", `<svg viewBox="0 0 560 104" role="img" aria-label="Temperature axis with Curie and melting points">
        <defs><pattern id="g-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="var(--v-text2)" stroke-width="1.2"/></pattern></defs>
        <rect x="${X(0)}" y="${y - 3}" width="${X(1140) - X(0)}" height="6" fill="var(--v-line2)"/><rect x="${X(1140)}" y="${y - 3}" width="${X(1255) - X(1140)}" height="6" fill="url(#g-hatch)"/><rect x="${X(1255)}" y="${y - 3}" width="${X(1300) - X(1255)}" height="6" fill="var(--v-text3)"/>
        ${tk}${mk(1140, "T<tspan baseline-shift=\"sub\" font-size=\"9\">c</tspan>", true)}${mk(1255, "T<tspan baseline-shift=\"sub\" font-size=\"9\">m</tspan>", false)}
        ${sw(16, "var(--v-line2)", "ferroelectric")}${sw(186, "url(#g-hatch)", "paraelectric")}${sw(356, "var(--v-text3)", "melt")}</svg>`);
    }

    // transparency window on a log wavelength axis, 0.2..10 um; visible part in spectral color, IR marks in declared false color
    {
      const X = (l) => 16 + (Math.log10(l / 0.2) / Math.log10(50)) * 520, y0 = 52, y1 = 70;
      let stops = "";
      for (let nm = 380; nm <= 780; nm += 10) stops += `<stop offset="${((X(nm / 1000) - X(0.38)) / (X(0.78) - X(0.38))).toFixed(4)}" stop-color="${spectral(nm, 1, 0.02)}"/>`;
      let tk = "";
      [0.2, 0.5, 1, 2, 5, 10].forEach((l) => { tk += `<line x1="${X(l).toFixed(1)}" y1="${y1}" x2="${X(l).toFixed(1)}" y2="${y1 + 6}" stroke="var(--v-text3)"/>${T(X(l).toFixed(1), y1 + 22, l === 10 ? "10 µm" : l, 3, `text-anchor="${l === 10 ? "end" : "middle"}"${l === 10 ? ' dx="8"' : ""}`)}`; });
      const mk = (l, lab, col, ir, row) => `<g${ir ? ' class="ir-el"' : ""}><line x1="${X(l).toFixed(1)}" y1="${row ? 10 : 34}" x2="${X(l).toFixed(1)}" y2="${y1}" stroke="${col}" stroke-width="2"${ir ? ' stroke-dasharray="4 3"' : ""}/>${T(X(l).toFixed(1), row ? 4 : 29, lab, 2, `text-anchor="${row ? "start" : "end"}" dx="${row ? 4 : -4}"`)}</g>`;
      set("g-tr", `<svg viewBox="0 0 560 104" role="img" aria-label="Transparency window 0.32 to 5 micrometers on a logarithmic wavelength axis">
        <defs><linearGradient id="g-vis" gradientUnits="userSpaceOnUse" x1="${X(0.38).toFixed(1)}" x2="${X(0.78).toFixed(1)}" y1="0" y2="0">${stops}</linearGradient></defs>
        <rect x="${X(0.2)}" y="${y0}" width="${X(10) - X(0.2)}" height="${y1 - y0}" fill="var(--v-ink2)"/>
        <rect x="${X(0.32).toFixed(1)}" y="${y0}" width="${(X(5) - X(0.32)).toFixed(1)}" height="${y1 - y0}" fill="var(--v-line2)"/>
        <rect x="${X(0.38).toFixed(1)}" y="${y0}" width="${(X(0.78) - X(0.38)).toFixed(1)}" height="${y1 - y0}" fill="url(#g-vis)"/>
        ${tk}
        ${mk(0.532, "532", "var(--v-l532)", false, 0)}${mk(0.6328, "633", "var(--v-l633)", false, 1)}${mk(1.064, "1064", "var(--v-ir1064)", true, 0)}${mk(1.55, "1550", "var(--v-ir1550)", true, 1)}
        ${T(X(0.32).toFixed(1), y0 - 4, "0.32", 2, 'text-anchor="end" dx="-3"')}${T(X(5).toFixed(1), y0 - 4, "5", 2, 'dx="3"')}</svg>`);
    }

    // r33 clamped vs free, 633 nm
    {
      const X = (v) => 16 + (v / 35) * 230;
      const bar = (y, v, lab) => `<rect x="${X(0)}" y="${y}" width="${(X(v) - X(0)).toFixed(1)}" height="14" fill="var(--v-text2)"/>${T(X(0), y - 5, lab, 2)}${T(X(v) + 6, y + 12, v.toFixed(1), 1)}`;
      let tk = ""; [0, 10, 20, 30].forEach((v) => { tk += `<line x1="${X(v)}" y1="84" x2="${X(v)}" y2="89" stroke="var(--v-text3)"/>${T(X(v), 104, v, 3, 'text-anchor="middle"')}`; });
      set("g-r33", `<svg viewBox="0 0 280 110" role="img" aria-label="r33 clamped and free">${bar(22, 30.8, "clamped (S), Turner 1966")}${bar(62, 32.2, "free (T), Zook et al. 1967")}<line x1="${X(0)}" y1="84" x2="${X(35)}" y2="84" stroke="var(--v-text3)"/>${tk}${T(X(35), 104, "pm/V", 3, 'dx="2"')}</svg>`);
    }

    // coercive field vs the conoscope field range
    {
      const X = (v) => 16 + (v / 25) * 240;
      let tk = ""; [0, 5, 10, 15, 20, 25].forEach((v) => { tk += `<line x1="${X(v)}" y1="60" x2="${X(v)}" y2="65" stroke="var(--v-text3)"/>${T(X(v), 80, v, 3, 'text-anchor="middle"')}`; });
      set("g-ec", `<svg viewBox="0 0 280 104" role="img" aria-label="Coercive field compared with the conoscope field range">
        <rect x="${X(0)}" y="40" width="${X(5) - X(0)}" height="14" fill="var(--v-l532)" fill-opacity="0.35"/><line x1="${X(0)}" y1="60" x2="${X(25)}" y2="60" stroke="var(--v-text3)"/>${tk}
        <path d="M${X(21)} 30l6 8-6 8-6-8z" fill="var(--v-text)"/>${T(X(21), 22, "E<tspan baseline-shift=\"sub\" font-size=\"9\">c</tspan>", 1, 'text-anchor="middle"')}
        ${T(X(0), 32, "conoscope range, 24% of E<tspan baseline-shift=\"sub\" font-size=\"9\">c</tspan>", 2)}${T(X(25), 98, "kV/mm", 3, 'text-anchor="end"')}</svg>`);
    }

    // density: 1 cm^3 cube
    {
      const s = 54, o = [40, 88], d = [22, -16];
      const q = (x, y) => `${(o[0] + x).toFixed(1)} ${(o[1] + y).toFixed(1)}`;
      set("g-rho", `<svg viewBox="0 0 280 104" role="img" aria-label="One cubic centimeter of LN">
        <path d="M${q(0, 0)}L${q(s, 0)}L${q(s, -s)}L${q(0, -s)}Z" fill="var(--v-ln)" fill-opacity="0.22" stroke="var(--v-text2)" stroke-width="1.4"/>
        <path d="M${q(0, -s)}L${q(d[0], -s + d[1])}L${q(s + d[0], -s + d[1])}L${q(s, -s)}M${q(s + d[0], -s + d[1])}L${q(s + d[0], d[1])}L${q(s, 0)}" fill="none" stroke="var(--v-text2)" stroke-width="1.4"/>
        ${T(o[0] + s / 2, o[1] + 16, "1 cm", 3, 'text-anchor="middle"')}${T(150, 50, "1 cm³ = 4.643 g", 1)}${T(150, 70, "derived", 3)}</svg>`);
    }

    // thermal conductivity: 1 K across 1 mm
    {
      set("g-k", `<svg viewBox="0 0 280 104" role="img" aria-label="Heat flux through a 1 mm LN slab with 1 K difference">
        <rect x="56" y="18" width="34" height="70" fill="var(--v-ln)" fill-opacity="0.22" stroke="var(--v-text2)" stroke-width="1.4"/>
        ${[30, 53, 76].map((y) => `<path d="M20 ${y}H120M120 ${y}l-6-3.5M120 ${y}l-6 3.5" stroke="var(--v-text3)" stroke-width="1.2" fill="none"/>`).join("")}
        ${T(73, 102, "1 mm", 3, 'text-anchor="middle"')}${T(150, 36, "1 K across 1 mm:", 2)}${T(150, 56, "q = 3.92 kW/m²", 1)}${T(150, 76, "q = k ΔT / L, derived", 3)}</svg>`);
    }
  }

  // refractive-index card: Zelmon 1997 curves, log wavelength axis 0.4..5 um, slider in log space
  function initDispersion() {
    const svg = $("#g-n"), inp = $("#v-lam"); if (!svg || !inp || !hasLN) return null;
    const L0 = 0.4, L1 = 5.0, X = (l) => 44 + (Math.log(l / L0) / Math.log(L1 / L0)) * 500, Y = (n) => 16 + ((2.46 - n) / 0.48) * 150;
    const pts = (ax) => { let d = ""; for (let i = 0; i <= 160; i++) { const l = L0 * (L1 / L0) ** (i / 160); d += `${i ? "L" : "M"}${X(l).toFixed(1)} ${Y(LN.n(ax, l)).toFixed(1)}`; } return d; };
    let stops = "";
    for (let nm = 400; nm <= 780; nm += 10) stops += `<stop offset="${((X(nm / 1000) - X(0.4)) / (X(0.78) - X(0.4))).toFixed(4)}" stop-color="${spectral(nm, 1, 0.02)}"/>`;
    let tk = "";
    [0.4, 0.6, 1, 2, 3, 5].forEach((l) => { tk += `<line x1="${X(l).toFixed(1)}" y1="166" x2="${X(l).toFixed(1)}" y2="172" stroke="var(--v-text3)"/>${T(X(l).toFixed(1), 188, l === 5 ? "5 µm" : l, 3, `text-anchor="${l === 5 ? "end" : "middle"}"${l === 5 ? ' dx="8"' : ""}`)}`; });
    [2.0, 2.1, 2.2, 2.3, 2.4].forEach((n) => { tk += `<line x1="38" y1="${Y(n).toFixed(1)}" x2="544" y2="${Y(n).toFixed(1)}" stroke="var(--v-line)"/>${T(32, (Y(n) + 4).toFixed(1), n.toFixed(1), 3, 'text-anchor="end"')}`; });
    svg.innerHTML = `<svg viewBox="0 0 560 196" role="img" aria-label="Ordinary and extraordinary index versus wavelength, Zelmon 1997">
      <defs><linearGradient id="g-vis2" gradientUnits="userSpaceOnUse" x1="${X(0.4).toFixed(1)}" x2="${X(0.78).toFixed(1)}" y1="0" y2="0">${stops}</linearGradient></defs>
      ${tk}<rect x="${X(0.4).toFixed(1)}" y="162" width="${(X(0.78) - X(0.4)).toFixed(1)}" height="4" fill="url(#g-vis2)"/>
      <path d="${pts("o")}" fill="none" stroke="var(--v-text)" stroke-width="2"/><path d="${pts("e")}" fill="none" stroke="var(--v-text2)" stroke-width="2" stroke-dasharray="7 4"/>
      ${T(X(0.45).toFixed(1), (Y(LN.n("o", 0.45)) - 8).toFixed(1), "n<tspan baseline-shift=\"sub\" font-size=\"9\">o</tspan>", 1, 'dx="6"')}${T(X(0.45).toFixed(1), (Y(LN.n("e", 0.45)) + 18).toFixed(1), "n<tspan baseline-shift=\"sub\" font-size=\"9\">e</tspan>", 2, 'dx="-6"')}
      <g id="g-n-cur"><line id="g-n-line" y1="12" y2="166" stroke-width="1.5"/><circle id="g-n-po" r="4.5" fill="var(--v-text)"/><circle id="g-n-pe" r="4.5" fill="var(--v-ink0)" stroke="var(--v-text2)" stroke-width="2"/></g></svg>`;
    const line = $("#g-n-line"), po = $("#g-n-po"), pe = $("#g-n-pe");
    const oL = $("#v-lam-o"), oNo = $("#v-no"), oNe = $("#v-ne"), oDn = $("#v-dn");
    const lamOf = (v) => L0 * (L1 / L0) ** (v / 1000);
    inp.value = String((Math.log(1.55 / L0) / Math.log(L1 / L0)) * 1000);
    const upd = () => {
      const l = lamOf(+inp.value), x = X(l).toFixed(1), n_o = LN.n("o", l), n_e = LN.n("e", l);
      line.setAttribute("x1", x); line.setAttribute("x2", x);
      const vis = l <= 0.78;
      line.setAttribute("stroke", vis ? spectral(l * 1000, light() ? 0.45 : 1, 0.04) : "var(--v-ir1550)");
      line.setAttribute("stroke-dasharray", vis ? "" : "4 3");
      line.classList.toggle("ir-el", !vis);
      po.setAttribute("cx", x); po.setAttribute("cy", Y(n_o).toFixed(1)); pe.setAttribute("cx", x); pe.setAttribute("cy", Y(n_e).toFixed(1));
      const nm = `${pad(Math.round(l * 1000).toString(), 4)} nm`;
      oL.textContent = nm; oNo.textContent = n_o.toFixed(4); oNe.textContent = n_e.toFixed(4); oDn.textContent = (n_o - n_e).toFixed(4);
      inp.setAttribute("aria-valuetext", `${Math.round(l * 1000)} nanometers`);
      rangeFill(inp);
    };
    inp.addEventListener("input", upd); upd();
    return { repaint: upd };
  }

  // data record: n_e at 1550 nm, JSON twin
  function record() {
    const v = $("#v-rec-ne"), pre = $("#v-json"); if (!v || !pre || !hasLN) return;
    const ne = LN.n("e", 1.55); v.textContent = ne.toFixed(4);
    const J = (k, val) => `  <span class="k">"${k}"</span>: ${val}`;
    pre.innerHTML = ["{", J("property", '"refractive_index_extraordinary"') + ",", J("variant", '"cln"') + ",", J("value", ne.toFixed(4)) + ",", J("unit", '{"ucum": "1"}') + ",", J("conditions", '{"wavelength_nm": 1550, "temperature_C": 21}') + ",", J("model", '"zelmon1997-cln-e"') + ",", J("doi", '"10.1364/JOSAB.14.003319"') + ",", J("status", '"P-db"') + ",", J("role", '"derived"'), "}"].join("\n");
    const k = $("#v-key-ne"); if (k) k.textContent = ne.toFixed(4);
  }

  // ---------- chapter doors: procedural art per chapter (R12 sec. 6), signature motion on hover (effects only) ----------
  const EV = [
    ["1949-12-15", "Ferroelectricity in LiNbO<sub>3</sub> reported", "Matthias & Remeika, Phys. Rev. 76, 1886", "10.1103/PhysRev.76.1886.2"],
    ["1965-06-14", "Tunable optical parametric oscillation in LiNbO<sub>3</sub>", "Giordmaine & Miller, PRL 14, 973", "10.1103/PhysRevLett.14.973"],
    ["1965-12-15", "Interdigital transducer couples directly to surface elastic waves", "White & Voltmer, APL 7, 314", "10.1063/1.1754276"],
    ["1966-07-01", "Optically induced index inhomogeneities (optical damage) in LiNbO<sub>3</sub> and LiTaO<sub>3</sub>", "Ashkin et al., APL 9, 72", "10.1063/1.1754607"],
    ["1968-10-01", "Holographic storage in LiNbO<sub>3</sub>", "Chen, LaMacchia & Fraser, APL 13, 223", "10.1063/1.1652580"],
    ["1974-10-15", "Ti-indiffused LiNbO<sub>3</sub> waveguides", "Schmidt & Kaminow, APL 25, 458", "10.1063/1.1655547"],
    ["1993-02-01", "Field-poled first-order QPM waveguide for blue SHG", "Yamada et al., APL 62, 435", "10.1063/1.108925"],
    ["1998-10-19", "Single-crystal LiNbO<sub>3</sub> films by crystal ion slicing", "Levy et al., APL 73, 2293", "10.1063/1.121801"],
    ["2017-12-20", "Monolithic ultra-high-Q thin-film LiNbO<sub>3</sub> microring", "Zhang et al., Optica 4, 1536", "10.1364/OPTICA.4.001536"],
    ["2018-10", "Thin-film LiNbO<sub>3</sub> modulators at CMOS-compatible voltages", "Wang et al., Nature 562, 101", "10.1038/s41586-018-0551-y"],
  ];
  const yearOf = (d) => { const [y, m = 7, dd = 1] = d.split("-").map(Number); return y + (m - 1 + (dd - 1) / 31) / 12; };
  let coloCache = null;
  const colors = () => (coloCache ||= {
    ink0: css("--v-ink0"), ink1: css("--v-ink1"), ink2: css("--v-ink2"), line: css("--v-line"), line2: css("--v-line2"),
    text: css("--v-text"), text2: css("--v-text2"), text3: css("--v-text3"), au: css("--v-au"), l532: css("--v-l532"),
    ir1550: css("--v-ir1550"), nb: css("--nb"), ln: css("--v-ln"),
  });
  const conoImg = {};
  function conoSprite(E) {
    const key = `${E}`; if (conoImg[key]) return conoImg[key];
    const c = document.createElement("canvas"); c.width = c.height = 220;
    LN.renderConoscope(c.getContext("2d"), 220, { thicknessMm: 0.6, fieldKVmm: E, fieldDir: "x", white: true, mono: false, NA });
    return (conoImg[key] = c);
  }
  const ART = {
    crystal(g, w, h, t, C) { // Gothic tracery from the 3m stereogram; octahedra column Nb, empty, Li along +c
      const cx = w * 0.38, cy = h * 0.5, R = h * 0.38, rot = (ease(t) * 2 * Math.PI) / 3;
      g.lineWidth = 1.2; g.strokeStyle = C.text3; g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.stroke();
      g.beginPath(); g.arc(cx, cy, R * 1.06, 0, 2 * Math.PI); g.strokeStyle = C.line2; g.stroke();
      for (let k = 0; k < 3; k++) {
        const a = Math.PI / 2 + (k * 2 * Math.PI) / 3 + rot;
        g.strokeStyle = C.au; g.lineWidth = 1.6; g.beginPath(); g.arc(cx + R * 0.45 * Math.cos(a), cy - R * 0.45 * Math.sin(a), R * 0.45, 0, 2 * Math.PI); g.stroke();
        g.strokeStyle = C.line2; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - R * Math.cos(a), cy + R * Math.sin(a)); g.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); g.stroke();
      }
      g.fillStyle = C.text; g.beginPath(); for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + (k * 2 * Math.PI) / 3 + rot, r = R * 0.1; g[k ? "lineTo" : "moveTo"](cx + r * Math.cos(a), cy - r * Math.sin(a)); } g.fill();
      const s = h * 0.085, x = w * 0.8;
      ["Nb", "empty", "Li", "Nb", "empty"].forEach((kd, k) => {
        const y = h * 0.86 - k * s * 2.05;
        g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath();
        if (kd === "empty") { g.setLineDash([3, 2.5]); g.strokeStyle = C.text3; g.lineWidth = 1.2; g.stroke(); g.setLineDash([]); }
        else { g.fillStyle = kd === "Nb" ? C.nb : C.au; g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; }
      });
      g.strokeStyle = C.text3; g.lineWidth = 1; g.beginPath(); g.moveTo(x + s * 1.8, h * 0.9); g.lineTo(x + s * 1.8, h * 0.1); g.lineTo(x + s * 1.8 - 4, h * 0.1 + 7); g.moveTo(x + s * 1.8, h * 0.1); g.lineTo(x + s * 1.8 + 4, h * 0.1 + 7); g.stroke();
    },
    light(g, w, h, t) { // live white-light conoscope; hover applies E = 3 kV/mm along x
      const d = h * 0.86, x = (w - d) / 2, y = (h - d) / 2;
      g.save(); g.beginPath(); g.arc(w / 2, h / 2, d / 2, 0, 2 * Math.PI); g.clip();
      g.drawImage(conoSprite(0), x, y, d, d);
      if (t > 0) { g.globalAlpha = ease(t); g.drawImage(conoSprite(3), x, y, d, d); g.globalAlpha = 1; }
      g.restore();
    },
    sound(g, w, h, t, C) { // ukiyo-e ripple lines launched from IDT fingers
      const p = h * 0.11, x0 = w * 0.07, top = h * 0.2, bot = h * 0.8;
      g.fillStyle = C.au; g.fillRect(x0, top - 6, p * 4.2, 5); g.fillRect(x0, bot + 1, p * 4.2, 5);
      for (let k = 0; k < 9; k++) { const x = x0 + 2 + k * p * 0.5; g.fillRect(x, k % 2 ? top + h * 0.12 : top, 2.5, bot - top - h * 0.12); }
      const lam = p, shift = ease(t) * lam;
      for (let k = 0; k < 14; k++) {
        const xc = x0 + p * 4.8 + k * lam + shift; if (xc > w - 6) break;
        g.strokeStyle = C.text2; g.globalAlpha = Math.max(0.12, 0.9 - k * 0.06); g.lineWidth = 1.5; g.beginPath();
        for (let y = top; y <= bot; y += 3) { const xx = xc + Math.sin((y / h) * 9 + k * 0.6) * 2.4; y === top ? g.moveTo(xx, y) : g.lineTo(xx, y); }
        g.stroke(); g.beginPath(); g.arc(xc + 4, top + 3, 4, Math.PI, 1.8 * Math.PI); g.stroke();
      }
      g.globalAlpha = 1;
    },
    quirks(g, w, h, t, C) { // kintsugi crack in Au over a photorefractive trace
      g.lineCap = "round";
      const tr = (lw, a) => { g.strokeStyle = C.l532; g.globalAlpha = a; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 60; i++) { const x = w * 0.08 + (i / 60) * w * 0.84, y = h * (0.62 + 0.18 * Math.sin(i / 9) - 0.1 * Math.sin(i / 3.7)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
      tr(14, 0.08); tr(5, 0.16); tr(1.5, 0.6); g.globalAlpha = 1;
      let s = 7; const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
      const path = [[w * 0.18, 0]]; let x = w * 0.18, y = 0;
      while (y < h) { x += (rnd() - 0.45) * w * 0.09; y += h * (0.06 + rnd() * 0.06); path.push([x, y]); }
      const draw = (pts, col, lw, frac) => { const n = Math.max(1, Math.floor((pts.length - 1) * frac)); g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.slice(0, n + 1).forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); };
      const branch = path.slice(4, 5).concat([[path[4][0] + w * 0.12, path[4][1] + h * 0.1], [path[4][0] + w * 0.22, path[4][1] + h * 0.08], [path[4][0] + w * 0.3, path[4][1] + h * 0.18]]);
      const f = t > 0 ? ease(t) : 1;
      draw(path, C.line2, 2.6, 1); draw(branch, C.line2, 2, 1);
      draw(path, C.au, 2.6, f); draw(branch, C.au, 2, f);
    },
    making(g, w, h, t, C) { // engraving of a Czochralski boule on its seed above the melt
      const cx = w * 0.5, lift = ease(t) * h * 0.06, top = h * 0.14 - lift, bw = w * 0.13;
      const sil = new Path2D();
      sil.moveTo(cx - 3, top); sil.lineTo(cx + 3, top); sil.lineTo(cx + 3, top + h * 0.08); sil.lineTo(cx + bw, top + h * 0.2); sil.lineTo(cx + bw, top + h * 0.56); sil.lineTo(cx + bw * 0.6, top + h * 0.64); sil.lineTo(cx - bw * 0.6, top + h * 0.64); sil.lineTo(cx - bw, top + h * 0.56); sil.lineTo(cx - bw, top + h * 0.2); sil.lineTo(cx - 3, top + h * 0.08); sil.closePath();
      g.save(); g.clip(sil); g.strokeStyle = C.text2; g.lineWidth = 1;
      for (let y = top; y < top + h * 0.66; y += 3) { g.beginPath(); g.moveTo(cx - bw, y); g.lineTo(cx + bw, y); g.stroke(); }
      g.strokeStyle = C.text3; for (let x = cx + bw * 0.2; x < cx + bw; x += 2.2 + (cx + bw - x) * 0.05) { g.beginPath(); g.moveTo(x, top); g.lineTo(x, top + h * 0.7); g.stroke(); }
      g.restore(); g.strokeStyle = C.text; g.lineWidth = 1.2; g.stroke(sil);
      g.strokeStyle = C.text2; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, top); g.stroke();
      const my = h * 0.84; g.strokeStyle = C.au; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - w * 0.3, my); g.lineTo(cx + w * 0.3, my); g.stroke();
      g.strokeStyle = C.text3; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - w * 0.32, my - h * 0.06); g.lineTo(cx - w * 0.32, h * 0.95); g.lineTo(cx + w * 0.32, h * 0.95); g.lineTo(cx + w * 0.32, my - h * 0.06); g.stroke();
      g.strokeStyle = C.au; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(cx - bw * 0.6, top + h * 0.64); g.quadraticCurveTo(cx, my + 2, cx + bw * 0.6, top + h * 0.64); g.stroke(); g.globalAlpha = 1;
    },
    devices(g, w, h, t, C) { // MZI with Au G-S-G electrodes; arm phases shift in opposite directions on hover
      const y0 = h * 0.5, ya = h * 0.36, yb = h * 0.64, x1 = w * 0.22, x2 = w * 0.78;
      g.fillStyle = C.au; g.globalAlpha = 0.8; g.fillRect(x1, h * 0.12, x2 - x1, ya - h * 0.05 - h * 0.12); g.fillRect(x1, ya + h * 0.05, x2 - x1, yb - ya - h * 0.1); g.fillRect(x1, yb + h * 0.05, x2 - x1, h * 0.88 - yb - h * 0.05); g.globalAlpha = 1;
      g.strokeStyle = C.ir1550; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath();
      g.moveTo(0, y0); g.lineTo(w * 0.1, y0); g.bezierCurveTo(w * 0.16, y0, w * 0.16, ya, x1, ya); g.lineTo(x2, ya); g.bezierCurveTo(w * 0.84, ya, w * 0.84, y0, w * 0.9, y0); g.lineTo(w, y0);
      g.moveTo(w * 0.1, y0); g.bezierCurveTo(w * 0.16, y0, w * 0.16, yb, x1, yb); g.lineTo(x2, yb); g.bezierCurveTo(w * 0.84, yb, w * 0.84, y0, w * 0.9, y0); g.stroke(); g.setLineDash([]);
      const sp = w * 0.04, off = ease(t) * sp * 0.5;
      g.strokeStyle = C.ir1550; g.lineWidth = 1.5;
      for (let x = x1 + sp / 2; x < x2; x += sp) { [[ya, off], [yb, -off]].forEach(([yy, o]) => { const xx = x + o; if (xx > x1 && xx < x2) { g.beginPath(); g.moveTo(xx, yy - 5); g.lineTo(xx, yy + 5); g.stroke(); } }); }
    },
    history(g, w, h, t, C) { // ruler 1945..2025 with the ten chronology events
      const X = (y) => w * 0.06 + ((y - 1945) / 80) * w * 0.88, ay = h * 0.48;
      g.strokeStyle = C.text3; g.lineWidth = 1; g.beginPath(); g.moveTo(X(1945), ay); g.lineTo(X(2025), ay); g.stroke();
      g.fillStyle = C.text3; g.font = `500 ${Math.round(h * 0.075)}px Inter, sans-serif`; g.textAlign = "center";
      for (let y = 1945; y <= 2025; y += 5) { const big = y % 20 === 10; g.beginPath(); g.moveTo(X(y), ay); g.lineTo(X(y), ay + (big ? 9 : 4)); g.stroke(); if (big) g.fillText(String(y), X(y), ay + 10 + h * 0.08); }
      EV.forEach(([d], k) => { const x = X(yearOf(d)), lane = k === 2 || k === 4 ? 1 : 0, y = ay - h * (0.14 + lane * 0.14), s = h * 0.04, on = ease(t) * EV.length > k;
        g.strokeStyle = C.line2; g.beginPath(); g.moveTo(x, ay); g.lineTo(x, y + s); g.stroke();
        g.fillStyle = on && t > 0 ? C.l532 : C.text; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.fill(); });
    },
    industry(g, w, h, t, C) { // wafer pictogram, no quantities
      const cx = w / 2, cy = h * 0.5, R = h * 0.4, p = R / 4.6, lit = Math.floor(ease(t) * 40);
      g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.rect(cx - R, cy + R * 0.86, 2 * R, R); g.clip("evenodd");
      g.fillStyle = C.ink2; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); let k = 0;
      for (let j = -5; j < 5; j++) for (let i = -5; i < 5; i++) { const x = cx + i * p, y = cy + j * p; if (Math.hypot(x + p / 2 - cx, y + p / 2 - cy) > R - p * 0.7) continue; g.fillStyle = t > 0 && k < lit ? C.l532 : C.line2; g.globalAlpha = t > 0 && k < lit ? 0.5 : 1; g.fillRect(x + 1.5, y + 1.5, p - 3, p - 3); g.globalAlpha = 1; k++; }
      g.restore(); g.strokeStyle = C.text2; g.lineWidth = 1.2; g.beginPath(); const a = Math.acos(0.86); g.arc(cx, cy, R, Math.PI / 2 + a, Math.PI / 2 - a + 2 * Math.PI); g.closePath(); g.stroke();
    },
  };
  const doors = [];
  function initDoors() {
    $$(".v-door").forEach((door) => {
      const cv = door.querySelector("canvas"), fn = ART[door.dataset.art]; if (!cv || !fn) return;
      const D = { door, cv, fn, t: 0, anim: 0, seen: true }; // eight small canvases: painted at init, no visibility gating
      D.paint = () => {
        if (!D.seen) return;
        const r = cv.getBoundingClientRect(), dpr = dprOf(), W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
        if (!W || !H) return;
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
        const g = cv.getContext("2d"), C = colors();
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.ink0; g.fillRect(0, 0, W, H); g.setTransform(dpr, 0, 0, dpr, 0, 0);
        fn(g, r.width, r.height, D.t, C);
      };
      const run = () => { // 600 ms signature motion, then stop
        if (!fx()) return;
        const t0 = performance.now();
        cancelAnimationFrame(D.anim);
        const step = (now) => { D.t = Math.min(1, (now - t0) / 600); D.paint(); if (D.t < 1) D.anim = requestAnimationFrame(step); else { D.t = 0; D.paint(); } };
        D.anim = requestAnimationFrame(step);
      };
      door.addEventListener("pointerenter", run); door.addEventListener("focus", run);
      doors.push(D);
    });
    doors.forEach((D) => D.paint());
    new ResizeObserver(() => doors.forEach((D) => D.paint())).observe($(".v-doors") || document.body);
  }

  // ---------- chronology: proportional axis + event cards ----------
  function initTimeline() {
    const box = $("#v-tl-axis"), list = $("#v-tl-cards"); if (!box || !list) return null;
    list.innerHTML = EV.map(([d, e, c, doi], k) => {
      const y = +d.slice(0, 4), era = y < 1960 ? "drawing" : y < 1970 ? "mid" : y < 2000 ? "sheet" : "sem";
      return `<li class="v-tl-card" data-k="${k}"><div class="v-tl-era era-${era}" aria-hidden="true"></div><div class="v-tl-date">${d.slice(0, 4)}<small>${d.slice(4)}</small></div><p class="v-tl-ev">${e}</p><p class="v-tl-ref"><a href="https://doi.org/${doi}">${c.replace(/&/g, "&amp;")}</a> &middot; doi:${doi}</p></li>`;
    }).join("");
    const cards = $$(".v-tl-card", list);
    let marks = [];
    const hl = (k, on) => { cards[k]?.classList.toggle("hl", on); marks[k]?.classList.toggle("hl", on); };
    const go = (k) => { const c = cards[k]; list.scrollTo({ left: c.offsetLeft - cards[0].offsetLeft, behavior: fx() ? "smooth" : "auto" }); cards.forEach((_, j) => hl(j, j === k)); };
    function render() {
      const W = box.clientWidth, H = 120, ay = 86, X = (y) => 8 + ((y - 1945) / 80) * (W - 16);
      let s = `<line x1="${X(1945)}" y1="${ay}" x2="${X(2025)}" y2="${ay}" stroke="var(--v-text3)" stroke-width="1.2"/>`;
      for (let y = 1945; y <= 2025; y += 5) { const big = y % 10 === 0; s += `<line x1="${X(y).toFixed(1)}" y1="${ay}" x2="${X(y).toFixed(1)}" y2="${ay + (big ? 9 : 4)}" stroke="var(--v-text3)"/>`; if (big && (W > 640 || y % 20 === 10)) s += `<text x="${X(y).toFixed(1)}" y="${ay + 26}" text-anchor="middle" font-size="13" fill="var(--v-text3)">${y}</text>`; }
      const lanes = [];
      const pos = EV.map(([d], k) => { const x = X(yearOf(d)); let l = 0; while (lanes[l] !== undefined && x - lanes[l] < 18) l++; lanes[l] = x; return { x, l, k }; });
      pos.forEach(({ x, l, k }) => {
        const y = ay - 26 - l * 24, d = EV[k][0];
        s += `<g class="mk" data-k="${k}" tabindex="0" role="button" aria-label="${d}: ${EV[k][1].replace(/<[^>]+>/g, "")}"><line x1="${x.toFixed(1)}" y1="${ay}" x2="${x.toFixed(1)}" y2="${y + 7}" stroke="var(--v-line2)"/><path d="M${x.toFixed(1)} ${y - 7}l7 7-7 7-7-7z" fill="var(--v-text)" stroke="var(--v-ink0)" stroke-width="1"/><rect x="${(x - 12).toFixed(1)}" y="${y - 12}" width="24" height="24" fill="transparent"/><title>${d}</title></g>`;
      });
      box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Chronology, 1945 to 2025">${s}</svg>`;
      marks = [];
      $$(".mk", box).forEach((m) => {
        const k = +m.dataset.k; marks[k] = m;
        m.addEventListener("click", () => go(k));
        m.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(k); } });
        m.addEventListener("pointerenter", () => hl(k, true)); m.addEventListener("pointerleave", () => hl(k, false));
      });
    }
    cards.forEach((c, k) => { c.addEventListener("pointerenter", () => hl(k, true)); c.addEventListener("pointerleave", () => hl(k, false)); c.addEventListener("focusin", () => hl(k, true)); c.addEventListener("focusout", () => hl(k, false)); });
    render();
    new ResizeObserver(render).observe(box);
    return { repaint: render };
  }

  // ---------- chapter figure: MZM li2026aa (reported V_pi = 2.90 V at 1550 nm; T = cos^2(pi V / 2 V_pi), push-pull) ----------
  const VPI = 2.9, VPI_ENG = 2.697 / 0.9; // engine V_pi L = 2.697 V cm over L = 0.9 cm (DevLog-003, L3)
  function initMZM() {
    const art = $("#v-mzm-art"), cur = $("#v-mzm-curve"), inp = $("#v-v"); if (!art || !cur || !inp) return null;
    const x1 = 250, x2 = 750, ya = 120, yb = 220, sp = 25;
    // static parts
    const wg = `M20 170H130C175 170 180 ${ya} 225 ${ya}H775C820 ${ya} 825 170 870 170H980M130 170C175 170 180 ${yb} 225 ${yb}H775C820 ${yb} 825 170 870 170`;
    art.innerHTML = `<svg viewBox="0 0 1000 350" role="img" aria-label="Top view of the push-pull Mach-Zehnder modulator: Y-splitter, two arms in the gaps of a ground-signal-ground line, Y-combiner">
      <rect x="${x1}" y="40" width="${x2 - x1}" height="65" fill="var(--v-au)" fill-opacity="0.85"/><rect x="${x1}" y="135" width="${x2 - x1}" height="70" fill="var(--v-au)" fill-opacity="0.85"/><rect x="${x1}" y="235" width="${x2 - x1}" height="65" fill="var(--v-au)" fill-opacity="0.85"/>
      <text x="${x1 + 12}" y="78" class="m1">G</text><text x="${x1 + 12}" y="176" class="m1">S</text><text x="${x1 + 12}" y="273" class="m1">G</text>
      <path class="ir-el" d="${wg}" fill="none" stroke="var(--v-ir1550)" stroke-width="3" stroke-dasharray="9 5"/>
      <g id="mzm-ticks" class="ir-el"></g><g id="mzm-field"></g>
      <circle id="mzm-out" cx="980" cy="170" r="14" fill="var(--v-ir1550)" class="ir-el"/>
      <path d="M${x1} 322V314M${x2} 322V314M${x1} 318H${x2}" stroke="var(--v-text3)" fill="none"/><text x="${(x1 + x2) / 2}" y="340" text-anchor="middle" class="m2">9 mm</text>
      <g transform="translate(40 300)"><path d="M0 0V-40M0 -40l-4 7M0 -40l4 7M0 0H40M40 0l-7-4M40 0l-7 4" stroke="var(--v-text2)" stroke-width="1.4" fill="none"/><text x="8" y="-34" class="m2">c (z)</text><text x="46" y="5" class="m2">y</text></g>
      <text x="20" y="160" class="m2">1550 nm in</text>
      <text x="990" y="340" text-anchor="end" class="m3">gaps drawn 90× wider than the length scale</text>
      <style>.m1{font:600 18px var(--v-ui);fill:var(--v-ink0)}.m2{font:500 14px var(--v-ui);fill:var(--v-text2)}.m3{font:400 12px var(--v-ui);fill:var(--v-text3)}</style></svg>`;
    const X = (v) => 44 + ((v + 6) / 12) * 360, Y = (t) => 16 + (1 - t) * 170;
    const curve = (vp) => { let d = ""; for (let i = 0; i <= 240; i++) { const v = -6 + (i / 240) * 12; d += `${i ? "L" : "M"}${X(v).toFixed(1)} ${Y(Math.cos((Math.PI * v) / (2 * vp)) ** 2).toFixed(1)}`; } return d; };
    let tk = "";
    [-6, -3, 0, 3, 6].forEach((v) => { tk += `<line x1="${X(v)}" y1="186" x2="${X(v)}" y2="192" stroke="var(--v-text3)"/><text x="${X(v)}" y="208" text-anchor="middle" font-size="13" fill="var(--v-text3)">${v < 0 ? MINUS + -v : v}</text>`; });
    [0, 0.5, 1].forEach((t) => { tk += `<line x1="40" y1="${Y(t)}" x2="404" y2="${Y(t)}" stroke="var(--v-line)"/><text x="34" y="${Y(t) + 4}" text-anchor="end" font-size="13" fill="var(--v-text3)">${t}</text>`; });
    cur.innerHTML = `<svg viewBox="0 0 436 222" role="img" aria-label="Transmission versus drive voltage">${tk}
      ${[-VPI, VPI].map((v) => `<line x1="${X(v)}" y1="16" x2="${X(v)}" y2="186" stroke="var(--v-line2)" stroke-dasharray="3 3"/>`).join("")}<text x="${X(VPI) + 4}" y="30" font-size="13" fill="var(--v-text3)">V<tspan baseline-shift="sub" font-size="9">π</tspan></text>
      <path d="${curve(VPI_ENG)}" fill="none" stroke="var(--v-text3)" stroke-width="1.4" stroke-dasharray="5 4"/><path d="${curve(VPI)}" fill="none" stroke="var(--v-text)" stroke-width="2"/>
      <text x="414" y="191" font-size="13" fill="var(--v-text3)">V</text><text x="44" y="10" font-size="13" fill="var(--v-text3)">T</text>
      <line id="mzm-vl" y1="16" y2="186" stroke="var(--v-l532)" stroke-width="1"/><path id="mzm-pt" d="M0 -7l7 7-7 7-7-7z" fill="var(--v-l532)"/></svg>`;
    const ticks = $("#mzm-ticks"), field = $("#mzm-field"), out = $("#mzm-out"), vl = $("#mzm-vl"), pt = $("#mzm-pt");
    const oV = $("#v-v-o"), oPh = $("#v-ph"), oT = $("#v-t"), oR = $("#v-vr");
    const MS = ((window.LNSTATE ||= {}).mzm ||= { V: 0 });
    const upd = () => {
      const V = +inp.value, phi = (Math.PI / 2) * (V / VPI), T = Math.cos(phi) ** 2; // per-arm phase +/- phi; T = cos^2(phi)
      let s = "";
      const off = (phi / (2 * Math.PI)) * sp;
      for (let x = x1 - sp; x < x2 + sp; x += sp) {
        const xa = x + off, xb = x - off;
        if (xa > x1 + 30 && xa < x2) s += `<line x1="${xa.toFixed(1)}" y1="${ya - 9}" x2="${xa.toFixed(1)}" y2="${ya + 9}" stroke="var(--v-ir1550)" stroke-width="2"/>`;
        if (xb > x1 + 30 && xb < x2) s += `<line x1="${xb.toFixed(1)}" y1="${yb - 9}" x2="${xb.toFixed(1)}" y2="${yb + 9}" stroke="var(--v-ir1550)" stroke-width="2"/>`;
      }
      ticks.innerHTML = s;
      const L = (Math.abs(V) / 6) * 13, dir = Math.sign(V); let f = "";
      if (L > 0.5) for (let x = x1 + 60; x < x2; x += 50) {
        [[ya, -dir], [yb, dir]].forEach(([y, dy]) => { const a = y - dy * L, b = y + dy * L; f += `<path d="M${x} ${a.toFixed(1)}L${x} ${b.toFixed(1)}M${x - 3.5} ${(b - dy * 5).toFixed(1)}L${x} ${b.toFixed(1)}L${x + 3.5} ${(b - dy * 5).toFixed(1)}" stroke="var(--v-text)" stroke-width="1.6" fill="none"/>`; });
      }
      field.innerHTML = f;
      out.setAttribute("fill-opacity", (0.08 + 0.92 * T).toFixed(3)); out.setAttribute("r", (6 + 10 * T).toFixed(1));
      vl.setAttribute("x1", X(V).toFixed(1)); vl.setAttribute("x2", X(V).toFixed(1));
      pt.setAttribute("transform", `translate(${X(V).toFixed(1)} ${Y(T).toFixed(1)})`);
      oV.textContent = `${sgn(V, 2)} V`; oPh.textContent = pad(`±${((Math.abs(phi) * 180) / Math.PI).toFixed(1)}°`, 7);
      oT.textContent = T.toFixed(3); oR.textContent = sgn(V / VPI, 3);
      inp.setAttribute("aria-valuetext", `${V.toFixed(2)} volts, transmission ${T.toFixed(3)}`);
      rangeFill(inp);
      MS.V = V;
    };
    inp.addEventListener("input", upd);
    const sync = () => { inp.value = MS.V; upd(); };
    sync();
    return { repaint: sync };
  }

  // ---------- chapter 2.2 L2: index ellipsoid in 3D (three.js, vendor/three); data and exact eigen-decomposition from eo.js (window.LNEO) ----------
  // Drawing: Delta(1/n^2) scaled x500 before the eigen-decomposition; each semi-axis drawn as 1 + 10 (n_i / n_mean - 1). Numbers: exact, unscaled.
  const K_DB = 500, G_N = 10;
  function initEllipsoid() {
    const box = $("#v-ell"); if (!box || !window.LNEO) return null;
    const stage = $("#v-ell-stage"), lab = stage.querySelector(".v-ell-lab"), E3 = window.LNEO;
    const out = { n: $("#v-ell-n"), dn: $("#v-ell-dn"), st: $("#v-ell-st"), tilt: $("#v-ell-tilt") };
    const cam = { yaw: 0.9, pitch: 0.38 };
    let T3 = null, R = null, queued = false;
    const AXL = ["x", "y", "z"];
    const sciS = (v) => (Math.abs(v) < 1e-15 ? pad("0", 10) : (v < 0 ? MINUS : "+") + Math.abs(v).toExponential(3).replace("e-", `e${MINUS}`));
    function numbers() {
      const P = E3.imperm(), st = E3.st, k = st.p, dnk = -0.5 * P.n[k] ** 3 * P.dB[k];
      const eg = E3.jacobi(P.B), nS = eg.val.map((v) => 1 / Math.sqrt(v)).sort((a, b) => a - b);
      const biax = Math.abs(nS[0] - nS[1]) > 1e-12 && Math.abs(nS[1] - nS[2]) > 1e-12;
      const tilt = Math.max(...eg.vec.map((v) => (Math.acos(Math.min(1, Math.max(...v.map(Math.abs)))) * 180) / Math.PI));
      out.n.textContent = `${P.n[k].toFixed(4)} (${AXL[k] === "z" ? "nₑ" : "nₒ"})`;
      out.dn.textContent = sciS(dnk);
      out.st.textContent = biax ? "biaxial, 3 distinct" : "uniaxial, 2 equal";
      out.tilt.textContent = `${pad(tilt < 1 ? tilt.toFixed(4) : tilt.toFixed(2), 7)}°`;
      [["#v-rt-e", "e"], ["#v-rt-p", "p"], ["#v-rt-s", "s"]].forEach(([id, key]) => $$(`${id} button`).forEach((b) => { const on = String(st[key]) === b.dataset.v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }));
    }
    async function make() {
      const THREE = await import("./vendor/three/three.module.min.js");
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(dprOf()); stage.insertBefore(renderer.domElement, lab);
      const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
      camera.up.set(0, 0, 1); scene.add(camera);
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-2, 3, 5); camera.add(key);
      const sph = new THREE.SphereGeometry(1, 64, 32);
      const solidM = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.55, roughness: 0.6, depthWrite: false });
      const solid = new THREE.Mesh(sph, solidM); scene.add(solid);
      const wireM = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
      const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 24, 12)), wireM); scene.add(wire);
      const axM = new THREE.LineBasicMaterial();
      const axG = new THREE.BufferGeometry(); axG.setAttribute("position", new THREE.Float32BufferAttribute([-1.7, 0, 0, 1.7, 0, 0, 0, -1.7, 0, 0, 1.7, 0, 0, 0, -1.7, 0, 0, 1.7], 3));
      scene.add(new THREE.LineSegments(axG, axM));
      const eArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.55, 0xffffff, 0.16, 0.09); scene.add(eArrow);
      const polM = new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.05, linewidth: 1 });
      const polG = new THREE.BufferGeometry(); polG.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -1.35, 0, 0, 1.35], 3));
      const pol = new THREE.Line(polG, polM); scene.add(pol);
      const mat4 = new THREE.Matrix4();
      return {
        size() { renderer.setSize(stage.clientWidth, stage.clientHeight, false); },
        render() {
          const P = E3.imperm(), st = E3.st, nbar = (2 * P.no + P.ne) / 3, sa = (n) => 1 + G_N * (n / nbar - 1);
          const Bx = P.B.map((r, i) => r.map((v, j) => P.B0[i] * (i === j) + K_DB * (v - P.B0[i] * (i === j)))); // B0 + K dB
          const eg = E3.jacobi(Bx), s3 = eg.val.map((v) => sa(1 / Math.sqrt(v))), V = eg.vec;
          mat4.set(V[0][0] * s3[0], V[1][0] * s3[1], V[2][0] * s3[2], 0, V[0][1] * s3[0], V[1][1] * s3[1], V[2][1] * s3[2], 0, V[0][2] * s3[0], V[1][2] * s3[1], V[2][2] * s3[2], 0, 0, 0, 0, 1);
          solid.matrixAutoUpdate = false; solid.matrix.copy(mat4);
          wire.scale.set(sa(P.no), sa(P.no), sa(P.ne));
          const C = colors();
          solidM.color.set(C.ln); wireM.color.set(C.text3); axM.color.set(C.text3);
          const dir = [0, 0, 0]; dir[st.e] = 1; eArrow.setDirection(new THREE.Vector3(...dir)); eArrow.setColor(C.au);
          const pd = [0, 0, 0]; pd[st.p] = 1.35; polG.attributes.position.array.set([-pd[0], -pd[1], -pd[2], pd[0], pd[1], pd[2]]); polG.attributes.position.needsUpdate = true; pol.computeLineDistances(); polM.color.set(C.ir1550);
          const W = stage.clientWidth, H = stage.clientHeight, a = W / H, h = 2.05;
          camera.left = -h * a; camera.right = h * a; camera.top = h; camera.bottom = -h; camera.updateProjectionMatrix();
          const cp = Math.cos(cam.pitch), e = [Math.cos(cam.yaw) * cp, Math.sin(cam.yaw) * cp, Math.sin(cam.pitch)];
          camera.position.set(e[0] * 10, e[1] * 10, e[2] * 10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
          renderer.render(scene, camera);
          const proj = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(camera); return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H]; };
          const L = [[1.85, 0, 0, "x"], [0, 1.85, 0, "y"], [0, 0, 1.85, "z (c)"]].map(([x, y, z, t]) => { const [px, py] = proj(x, y, z); return `<span style="left:${px.toFixed(1)}px;top:${py.toFixed(1)}px">${t}</span>`; });
          const ep = proj(...dir.map((v) => v * 1.75)), pp = proj(...pd.map((v) => -v * 1.12)); // polarization label at the negative end, clear of E
          lab.innerHTML = L.join("") + `<span class="e" style="left:${ep[0].toFixed(1)}px;top:${ep[1].toFixed(1)}px">E</span><span class="p" style="left:${pp[0].toFixed(1)}px;top:${pp[1].toFixed(1)}px">polarization</span>`;
        },
      };
    }
    const req = () => { if (!queued && R) { queued = true; requestAnimationFrame(() => { queued = false; R.render(); }); } };
    [["#v-rt-e", "e"], ["#v-rt-p", "p"], ["#v-rt-s", "s"]].forEach(([id, key]) => $$(`${id} button`).forEach((b) => b.addEventListener("click", () => { E3.st[key] = key === "s" ? b.dataset.v : +b.dataset.v; E3.update(); })));
    window.addEventListener("ln-rt", () => { numbers(); req(); });
    let drag = null;
    stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch }; try { stage.setPointerCapture(e.pointerId); } catch { /* inactive pointer */ } });
    stage.addEventListener("pointermove", (e) => { if (!drag) return; cam.yaw = drag.yaw - (e.clientX - drag.x) * 0.008; cam.pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008)); req(); });
    const up = () => { drag = null; }; stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
    stage.addEventListener("keydown", (e) => { const d = { ArrowLeft: [0.1, 0], ArrowRight: [-0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[e.key]; if (d) { e.preventDefault(); cam.yaw += d[0]; cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + d[1])); req(); } });
    numbers();
    make().then((r) => { R = r; R.size(); req(); new ResizeObserver(() => { R.size(); req(); }).observe(stage); }).catch((err) => { console.warn("WebGL unavailable for the ellipsoid", err); lab.innerHTML = '<span class="err" style="left:50%;top:50%">WebGL unavailable; numbers at right are exact</span>'; });
    return { repaint: () => { numbers(); req(); } };
  }

  // ---------- range inputs anywhere in VISUAL (TECH markup on the chapter page included) ----------
  document.addEventListener("input", (e) => { if (isV() && e.target.matches?.('input[type="range"]')) rangeFill(e.target); });
  const fillAll = () => $$('input[type="range"]').forEach(rangeFill);

  // ---------- lifecycle ----------
  let inited = false, parts = [];
  function init() {
    inited = true;
    glyphs(); record();
    parts = [initBench(), initDispersion(), initTimeline(), initMZM(), initEllipsoid()].filter(Boolean);
    initDoors();
    // elements added after app.js bound its focus handling need tabindex to open popups by keyboard
    $$("[data-pop]").forEach((el) => { if (!el.matches("a, button, input, [tabindex]")) el.tabIndex = 0; });
    if (document.fonts?.ready) document.fonts.ready.then(() => { coloCache = null; doors.forEach((D) => D.paint()); parts.forEach((p) => p.repaint()); });
  }
  function onMode() {
    spine();
    if (!isV()) return;
    palette(); paintVacancy(); poled();
    coloCache = null;
    if (!inited) init(); else { glyphs(); doors.forEach((D) => D.paint()); parts.forEach((p) => p.repaint()); }
    fillAll();
  }
  window.addEventListener("ln-mode", onMode);
  onMode();
  // fetch the VISUAL faces while idle, so the first switch from TECH does not reflow when they arrive
  if (!isV() && document.fonts?.load) (window.requestIdleCallback || setTimeout)(() => ["300 88px Newsreader", "400 18px Newsreader", "500 15px Inter", "italic 400 18px Newsreader"].forEach((f) => document.fonts.load(f).catch(() => {})));
})();
