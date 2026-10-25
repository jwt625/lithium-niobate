// Chapter 2.2 interactives: L1 bulk calculator and MZM transfer, L2 3m r-tensor explorer, L3 FEM overlap figures.
// Plain JS, no dependencies. Requires ln.js (LN.n) and app.js (popups, modes; dispatches "ln-mode").
// Constants carry their sources; every L3 number is read from data/eo-overlap-li2026aa.json or computed from it here.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;
  const css = (v) => getComputedStyle(root).getPropertyValue(v).trim();
  const visual = () => root.dataset.mode === "visual";
  const dark = () => root.dataset.theme !== "light";
  const M = "−";

  // ---------- formatting ----------
  const fix = (v, d) => (v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? M : "") + Math.abs(v).toFixed(d);
  function sci(v, d = 3) {
    if (!Number.isFinite(v)) return "n/a";
    if (v === 0) return "0";
    let e = Math.floor(Math.log10(Math.abs(v)));
    if (e >= -2 && e <= 3) return fix(v, Math.max(0, d - e));
    let m = v / 10 ** e;
    if (Math.abs(m).toFixed(d) === (10).toFixed(d)) { m /= 10; e += 1; }
    return `${fix(m, d)}&times;10<sup>${e < 0 ? M : ""}${Math.abs(e)}</sup>`;
  }
  const pct = (v, d = 2) => `${fix(v * 100, d)}%`;
  const sgnPct = (v, d = 2) => `${v >= 0 ? "+" : M}${Math.abs(v * 100).toFixed(d)}%`;
  const badge = (cls, txt, pop) => `<span class="b ${cls}"${pop ? ` data-pop="${pop}" tabindex="0"` : ""}>${txt}</span>`;
  // Fixed-layout key/value tables: column widths come from <colgroup>, never from the values, so live updates cannot move anything.
  const kv = (rows) => '<colgroup><col><col class="cv"><col class="cu"><col class="cs"></colgroup>' + rows.map(([k, v, u, s]) => `<tr><td>${k}</td><td class="v num">${v}</td><td class="u">${u || ""}</td><td class="s">${s || ""}</td></tr>`).join("");
  const kv3 = (head, rows) => `<colgroup><col><col class="cv"><col class="cn"></colgroup><tr><th colspan="3" class="kh">${head}</th></tr>` + rows.map(([k, v, n]) => `<tr><td>${k}</td><td class="v num">${v}</td><td class="n">${n || ""}</td></tr>`).join("");
  const fv = (html, cls = "") => `<span class="fv${cls ? ` ${cls}` : ""}">${html}</span>`; // fixed-width value slot
  const sgn3 = (c) => `${c < 0 ? M : "+"}${Math.abs(c).toFixed(3)}`; // constant-length signed component

  // ---------- constants (sources in comments) ----------
  // r33 clamped, Turner 1966, 633 nm, via Weis & Gaylord 1985 (P-comp). Also the engine library value (json geometry.r_pm_per_v).
  const R33 = 30.8e-12;
  // li2026aa-d measured, 1550 nm (reported): Vpi 2.90 V, L = 9 mm (eo-modulator-atlas devices.csv; paper p.5 Fig. 3(b)).
  const VPI_MEAS = 2.90, L_MZM = 9e-3, LAM_MZM = 1.55e-6;
  const Z0 = 376.730313668; // vacuum impedance, ohm (CODATA 2018)
  let EO = null; // L3 data once loaded

  // =====================================================================================
  // L1: bulk calculator
  // =====================================================================================
  const cLam = $("#c-lam"), cE = $("#c-e");
  function calc() {
    const lam = +cLam.value, Evum = +cE.value, E = Evum * 1e6;
    const ne = LN.n("e", lam), dn = -0.5 * ne ** 3 * R33 * E;
    const EL = (lam * 1e-6) / (ne ** 3 * R33);
    const dphi = ((2 * Math.PI) / (lam * 1e-6)) * dn * 1e-3;
    $("#c-lam-o").textContent = `${lam.toFixed(2)} µm`;
    $("#c-e-o").innerHTML = `${fix(Evum, 1)} V/µm`;
    $("#calc-lam-h").textContent = "";
    $("#calc-out").innerHTML = kv([
      [`n<sub>e</sub>(${lam.toFixed(2)} µm)`, ne.toFixed(4), "", badge("pc", "P-db", "zelmon")],
      ["r<sub>33</sub>", "30.8", "pm/V", badge("pc", "P-comp", "wg85")],
      ["&Delta;n<sub>e</sub>", sci(dn, 3), "", badge("d", "derived")],
      ["&Delta;&phi; / L", sci(dphi, 3), "rad/mm", badge("d", "derived")],
      ["E&middot;L for &Delta;&phi; = &pi;", (EL / 1e3).toFixed(3), "kV", badge("d", "derived")],
    ]);
  }
  cLam.addEventListener("input", calc); cE.addEventListener("input", calc); calc();

  // =====================================================================================
  // L1: MZM transfer (measured Vpi; engine curve added when the FEM data loads)
  // =====================================================================================
  const mzmV = $("#mzm-v"), svg = $("#mzm-svg");
  const MZ = { W: 520, H: 210, l: 40, r: 12, t: 10, b: 30, v0: -6, v1: 6 };
  const mx = (v) => MZ.l + ((v - MZ.v0) / (MZ.v1 - MZ.v0)) * (MZ.W - MZ.l - MZ.r);
  const my = (T) => MZ.t + (1 - T) * (MZ.H - MZ.t - MZ.b);
  const curve = (vpi) => { let d = ""; for (let k = 0; k <= 480; k++) { const v = MZ.v0 + ((MZ.v1 - MZ.v0) * k) / 480; d += `${k ? "L" : "M"}${mx(v).toFixed(1)} ${my(Math.cos((Math.PI * v) / (2 * vpi)) ** 2).toFixed(1)}`; } return d; };
  function mzmFrame() {
    let g = "";
    for (let v = -6; v <= 6; v += 2) g += `<line x1="${mx(v)}" x2="${mx(v)}" y1="${MZ.t}" y2="${MZ.H - MZ.b}" class="gl"/><text x="${mx(v)}" y="${MZ.H - MZ.b + 14}" text-anchor="middle" class="tk">${v < 0 ? M : ""}${Math.abs(v)}</text>`;
    for (const T of [0, 0.5, 1]) g += `<line x1="${MZ.l}" x2="${MZ.W - MZ.r}" y1="${my(T)}" y2="${my(T)}" class="gl"/><text x="${MZ.l - 6}" y="${my(T) + 3.5}" text-anchor="end" class="tk">${T}</text>`;
    for (const s of [-2, -1, 1, 2]) { const v = s * VPI_MEAS; g += `<line x1="${mx(v)}" x2="${mx(v)}" y1="${MZ.t}" y2="${MZ.H - MZ.b}" class="vpi"/>`; }
    g += `<text x="${MZ.W - MZ.r}" y="${MZ.H - 4}" text-anchor="end" class="tk">V (V)</text><text x="${MZ.l - 6}" y="${MZ.t + 2}" text-anchor="end" class="tk" dy="-2"></text>`;
    g += `<text x="6" y="${MZ.t + 8}" class="tk">T</text>`;
    g += `<path id="mzm-eng" class="eng" d=""/><path class="meas" d="${curve(VPI_MEAS)}"/>`;
    g += `<line id="mzm-cur" class="cur" y1="${MZ.t}" y2="${MZ.H - MZ.b}"/><path id="mzm-pt" class="pt" d=""/>`;
    g += `<rect x="${MZ.l}" y="${MZ.t}" width="${MZ.W - MZ.l - MZ.r}" height="${MZ.H - MZ.t - MZ.b}" class="hit"/>`;
    svg.innerHTML = g;
  }
  const MS = ((window.LNSTATE ||= {}).mzm ||= { V: 0 }); // drive voltage shared with the VISUAL MZM figure (visual.js)
  function mzm() {
    const V = +mzmV.value; MS.V = V;
    const dphi = (Math.PI * V) / VPI_MEAS, T = Math.cos(dphi / 2) ** 2;
    const dnArm = (LAM_MZM * Math.abs(dphi)) / (4 * Math.PI * L_MZM);
    $("#mzm-v-o").textContent = `${fix(V, 2)} V`;
    $("#mzm-cur").setAttribute("x1", mx(V)); $("#mzm-cur").setAttribute("x2", mx(V));
    const px = mx(V), py = my(T);
    $("#mzm-pt").setAttribute("d", `M${px} ${py - 5}L${px + 5} ${py}L${px} ${py + 5}L${px - 5} ${py}Z`);
    const rows = [
      ["T", T.toFixed(4), "", ""],
      ["T (dB)", T > 1e-6 ? fix(10 * Math.log10(T), 2) : `&lt; ${M}60`, "dB", ""],
      ["&Delta;&phi; = &pi;V / V<sub>&pi;</sub>", fix(dphi / Math.PI, 3), "&pi; rad", badge("d", "derived")],
      ["|&Delta;n<sub>eff</sub>| per arm = &lambda;|&Delta;&phi;| / 4&pi;L", sci(dnArm, 3), "", badge("d", "derived")],
    ];
    rows.push(["|&Delta;n<sub>eff</sub>| per arm, engine |dn<sub>A</sub>/dV|&middot;|V|", EO ? sci(Math.abs(EO.glob.dneffA.value * V), 3) : "n/a", "", badge("d", "engine", "engine")]);
    $("#mzm-out").innerHTML = kv(rows);
    mzmV.setAttribute("aria-valuetext", `${V.toFixed(2)} volts, transmission ${T.toFixed(3)}`);
  }
  mzmFrame();
  mzmV.addEventListener("input", mzm);
  const svgV = (e) => { const r = svg.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * MZ.W; return Math.max(-6, Math.min(6, MZ.v0 + ((x - MZ.l) / (MZ.W - MZ.l - MZ.r)) * (MZ.v1 - MZ.v0))); };
  let drag = false;
  svg.addEventListener("pointerdown", (e) => { drag = true; svg.setPointerCapture(e.pointerId); mzmV.value = svgV(e).toFixed(2); mzm(); });
  svg.addEventListener("pointermove", (e) => { if (drag) { mzmV.value = svgV(e).toFixed(2); mzm(); } });
  svg.addEventListener("pointerup", () => { drag = false; });
  if (MS.V) mzmV.value = MS.V;
  mzm();
  window.addEventListener("ln-mode", () => { if (+mzmV.value !== MS.V) mzmV.value = MS.V; mzm(); });

  // =====================================================================================
  // L2: 3m r tensor explorer
  // =====================================================================================
  // Coefficient sets, pm/V, all via Weis & Gaylord 1985 (P-comp). "free" mixes Zook et al. 1967 (r13, r22, r33) with Bernal 1966 (r51).
  const SETS = {
    turner: { lbl: "Turner 1966, clamped", r13: 8.6, r22: 3.4, r33: 30.8, r51: 28 },
    kaminow: { lbl: "Kaminow et al. 1980, clamped", r13: 7.7, r22: 3.4, r33: 28.8, r51: 18.2 },
    free: { lbl: "Zook et al. 1967 + Bernal 1966 (r51), free", r13: 10.0, r22: 6.81, r33: 32.2, r51: 32 },
  };
  // 3m form (x perpendicular to a mirror plane, z along c); rows I = 1..6 (xx, yy, zz, yz, xz, xy), columns E_x, E_y, E_z.
  const FORM = [
    [null, ["r22", -1], ["r13", 1]],
    [null, ["r22", 1], ["r13", 1]],
    [null, null, ["r33", 1]],
    [null, ["r51", 1], null],
    [["r51", 1], null, null],
    [["r22", -1], null, null],
  ];
  const IL = ["xx", "yy", "zz", "yz", "xz", "xy"], AX = ["x", "y", "z"];
  const OFF = { 3: [1, 2], 4: [0, 2], 5: [0, 1] }; // contracted I (0-based) -> tensor pair
  const st = { e: 2, p: 2, s: "turner" };

  function jacobi(A) { // symmetric 3x3 -> {val, vec (columns)}
    const a = A.map((r) => r.slice()), v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0; for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) off += a[p][q] ** 2;
      if (off < 1e-34) break;
      for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < 3; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
        for (let k = 0; k < 3; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < 3; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
      }
    }
    return { val: [a[0][0], a[1][1], a[2][2]], vec: [0, 1, 2].map((k) => [v[0][k], v[1][k], v[2][k]]) };
  }

  // impermeability at E = 1 V/um along st.e, lambda = 1.55 um; shared by the TECH tables and the VISUAL ellipsoid (window.LNEO)
  function imperm() {
    const S = SETS[st.s], E = 1e6, no = LN.n("o", 1.55), ne = LN.n("e", 1.55);
    const coef = (c) => (c ? S[c[0]] * c[1] : 0);
    const dB = FORM.map((row) => coef(row[st.e]) * 1e-12 * E);
    const B0 = [1 / no ** 2, 1 / no ** 2, 1 / ne ** 2];
    const B = [[B0[0] + dB[0], dB[5], dB[4]], [dB[5], B0[1] + dB[1], dB[3]], [dB[4], dB[3], B0[2] + dB[2]]];
    return { no, ne, n: [no, no, ne], dB, B0, B };
  }

  function rtensor() {
    const S = SETS[st.s], lam = 1.55, E = 1e6; // V/m (= 1 V/um)
    const no = LN.n("o", lam), ne = LN.n("e", lam), n = [no, no, ne];
    const coef = (c) => (c ? S[c[0]] * c[1] : 0);
    // matrix
    let h = `<thead><tr><th></th>${AX.map((a, j) => `<th class="${j === st.e ? "col" : ""}">E<sub>${a}</sub></th>`).join("")}</tr></thead><tbody>`;
    FORM.forEach((row, I) => {
      h += `<tr><th class="ri">${I + 1} <span class="dim">${IL[I]}</span></th>`;
      row.forEach((c, j) => {
        let cls = c ? "nz" : "z";
        if (j === st.e) cls += " col";
        if (j === st.e && c) cls += I === st.p ? " on" : I >= 3 ? " rot" : " oth";
        const txt = c ? `${c[1] < 0 ? M : ""}r<sub>${c[0].slice(1)}</sub>` : "0";
        h += `<td class="${cls}" title="${c ? `${c[1] < 0 ? M : ""}${c[0]} = ${fix(coef(c), 2)} pm/V` : "0"}">${txt}</td>`;
      });
      h += "</tr>";
    });
    $("#rt-mx").innerHTML = h + "</tbody>";
    // Delta(1/n^2)_I for E along st.e
    const dB = FORM.map((row) => coef(row[st.e]) * 1e-12 * E);
    $("#rt-vec").innerHTML = kv3(`&Delta;(1/n<sup>2</sup>)<sub>I</sub> = r<sub>I${"xyz"[st.e]}</sub>E`,
      dB.map((v, I) => [`${I + 1} ${IL[I]}`, v ? sci(v, 2) : "0", I === st.p ? '<span class="etag">diag k</span>' : I >= 3 && v ? '<span class="etag">rotates</span>' : ""]));
    // first-order index change for polarization along st.p
    const k = st.p, dnk = -0.5 * n[k] ** 3 * dB[k];
    // exact principal axes of the perturbed impermeability
    const B = [[1 / no ** 2 + dB[0], dB[5], dB[4]], [dB[5], 1 / no ** 2 + dB[1], dB[3]], [dB[4], dB[3], 1 / ne ** 2 + dB[2]]];
    const B0 = [1 / no ** 2, 1 / no ** 2, 1 / ne ** 2];
    const eg = jacobi(B);
    const prin = eg.vec.map((v, i) => {
      const n0 = 1 / Math.sqrt(v[0] ** 2 * B0[0] + v[1] ** 2 * B0[1] + v[2] ** 2 * B0[2]);
      const np = 1 / Math.sqrt(eg.val[i]);
      const a = v.map(Math.abs), m = a.indexOf(Math.max(...a));
      return { v, d: np - n0, ax: m, tilt: (Math.acos(Math.min(1, a[m])) * 180) / Math.PI };
    }).sort((p, q) => p.ax - q.ax || q.d - p.d);
    const rows = [
      [`n<sub>${AX[k]}</sub> (${AX[k] === "z" ? "n<sub>e</sub>" : "n<sub>o</sub>"}, 1.55 µm)`, n[k].toFixed(4), badge("pc", "P-db", "zelmon")],
      [`&delta;n<sub>${AX[k]}</sub> first order`, dnk ? sci(dnk, 3) : "0", badge("d", "derived")],
    ];
    prin.forEach((p, i) => rows.push([`&delta;n along <span class="vec">(${p.v.map((c) => sgn3(c * Math.sign(p.v[p.ax]))).join(", ")})</span>`, Math.abs(p.d) < 1e-12 ? "0" : sci(p.d, 3), p.tilt > 1e-6 ? `<span class="etag">${p.tilt < 1 ? p.tilt.toFixed(3) : p.tilt.toFixed(2)}&deg; from ${AX[p.ax]}</span>` : `<span class="etag">along ${AX[p.ax]}</span>`]));
    $("#rt-dn").innerHTML = kv3(`polarization ${AX[k]}; exact principal axes, crystal frame`, rows);
    // axis rotation by the off-diagonal terms (fixed 4-row table)
    const rrows = [3, 4, 5].map((I) => {
      const [p, q] = OFF[I];
      if (!dB[I]) return [`${I + 1} ${IL[I]}`, "0", "no rotation"];
      const diff = B[p][p] - B[q][q], deg = Math.abs(diff) < 1e-15;
      const th = deg ? 45 : (0.5 * Math.atan((2 * dB[I]) / diff) * 180) / Math.PI;
      return [`${I + 1} ${IL[I]}`, sci(dB[I], 2), `<span class="etag">${AX[p]}${AX[q]} axes ${deg ? "45&deg;, degenerate n<sub>o</sub>" : `${fix(th, 4)}&deg;`}</span>`];
    });
    const nS = eg.val.map((v) => 1 / Math.sqrt(v)).sort();
    const biax = Math.abs(nS[0] - nS[1]) > 1e-12 && Math.abs(nS[1] - nS[2]) > 1e-12;
    rrows.push(["principal indices", biax ? "3 distinct" : "2 equal", `<span class="etag">${biax ? "biaxial" : "uniaxial"}</span>`]);
    $("#rt-rot").innerHTML = kv3("off-diagonal terms rotate the principal axes", rrows);
    $("#rt-set-h").textContent = S.lbl;
    document.querySelectorAll("#coef tbody tr").forEach((tr) => tr.classList.toggle("sel", tr.dataset.set === st.s));
    for (const [id, key] of [["#rt-e", "e"], ["#rt-p", "p"], ["#rt-s", "s"]]) document.querySelectorAll(`${id} button`).forEach((b) => b.classList.toggle("on", String(st[key]) === b.dataset.v));
    window.dispatchEvent(new CustomEvent("ln-rt"));
  }
  window.LNEO = { st, SETS, jacobi, imperm, update: () => rtensor() };
  for (const [id, key] of [["#rt-e", "e"], ["#rt-p", "p"], ["#rt-s", "s"]]) {
    document.querySelectorAll(`${id} button`).forEach((b) => b.addEventListener("click", () => { st[key] = key === "s" ? b.dataset.v : +b.dataset.v; rtensor(); }));
  }
  document.querySelectorAll("#coef tbody tr[data-set]").forEach((tr) => {
    tr.classList.add("go"); tr.tabIndex = 0;
    const pick = () => { st.s = tr.dataset.set; rtensor(); };
    tr.addEventListener("click", (e) => { if (!e.target.closest("[data-pop]")) pick(); });
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  rtensor();

  // depth switch: mark the layer in view
  const depthLinks = [...document.querySelectorAll("#depth a")];
  const inBand = new Set(); // layers crossing the band; tracked as a set so the highlight does not depend on which transitions were reported
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) inBand.add(en.target.id); else inBand.delete(en.target.id); });
    const cur = ["l3", "l2", "l1"].find((id) => inBand.has(id));
    if (cur) depthLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${cur}`));
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["l1", "l2", "l3"].forEach((id) => io.observe(document.getElementById(id)));

  // =====================================================================================
  // L3: FEM overlap (data/eo-overlap-li2026aa.json)
  // =====================================================================================
  const INFERNO = ["#000004", "#160b39", "#420a68", "#6a176e", "#932667", "#bc3754", "#dd513a", "#f37819", "#fca50a", "#f6d746", "#fcffa4"];
  const RDBU_LIGHT = ["#053061", "#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#f7f7f7", "#fddbc7", "#f4a582", "#d6604d", "#b2182b", "#67001f"];
  const RDBU_DARK = ["#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#163a63", "#141416", "#5c1a1f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7"];
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const ramp = (stops) => { const c = stops.map(hex); return (t) => { t = Math.max(0, Math.min(1, t)) * (c.length - 1); const i = Math.min(c.length - 2, Math.floor(t)), f = t - i; return [0, 1, 2].map((k) => c[i][k] + (c[i + 1][k] - c[i][k]) * f); }; };
  function cmap(kind) { // t in [0,1] -> rgb
    if (visual()) return kind === "seq" ? ramp(INFERNO) : ramp(dark() ? RDBU_DARK : RDBU_LIGHT);
    if (kind === "seq") return dark() ? (t) => [t * 240, t * 240, t * 238] : (t) => [255 - t * 245, 255 - t * 245, 253 - t * 243];
    return (t) => [t * 245, t * 245, t * 242]; // gray diverging: negative dark, zero mid gray, positive light
  }

  function decode(b64) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Float32Array(u.buffer); }
  const pip = (p, x, y) => { let c = false; for (let a = 0, b = p.length - 1; a < p.length; b = a++) { const [xa, ya] = p[a], [xb, yb] = p[b]; if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) c = !c; } return c; };

  function region(x, y) { // nodes on an interface take the side above (y + 1e-6 um), as the bottom row y = 0 is LN in the export
    const G = EO.geo, yy = y + 1e-6;
    if (pip(G.signal, x, yy)) return "Au signal";
    if (pip(G.ground, x, yy)) return "Au ground";
    if (pip(G.ln_rib, x, yy)) return "LN rib";
    if (pip(G.ln_slab, x, yy)) return "LN slab";
    return y >= 0 ? "SiO₂ cladding" : "SiO₂ BOX";
  }

  function analyze(j) {
    const g = j.meta.grid, { nx, ny, dx, x0, y1 } = g, G = j.geometry;
    const F = {}; for (const k in j.fields) F[k] = decode(j.fields[k].f32);
    const X = (i) => x0 + i * dx, Y = (jj) => y1 - jj * dx, K = (i, jj) => jj * nx + i;
    const dA = (dx * 1e-6) ** 2; // m^2
    // nodal sums
    const nodal = (f) => { let s = 0; for (const v of f) if (Number.isFinite(v)) s += v * dA; return s; };
    let eMax = 0, kMax = 0; F.optEx.forEach((v, k) => { if (v * v > eMax) { eMax = v * v; kMax = k; } });
    let den = 0, inLN = 0, num = 0;
    for (let jj = 0; jj < ny; jj++) for (let i = 0; i < nx; i++) {
      const k = K(i, jj), o = F.optEx[k]; if (!Number.isFinite(o)) continue;
      const x = X(i), y = Y(jj) + 1e-6, ln = pip(G.ln_rib, x, y) || pip(G.ln_slab, x, y);
      den += o * o * dA; if (ln) { inLN += o * o * dA; num += F.esEx[k] * o * o * dA; }
    }
    // column trapezoid inside the LN polygons; interface values extrapolated from the two nearest interior nodes
    const yS = G.ln_slab[2][1], yB = G.ln_slab[0][1], yR = G.ln_rib[2][1], wb = G.ln_rib[1][0], wt = G.ln_rib[2][0];
    const ytop = (x) => { const a = Math.abs(x); return a <= wt ? yR : a >= wb ? yS : yS + ((yR - yS) * (wb - a)) / (wb - wt); };
    function colInt(f, i, ya, yb) {
      const P = [];
      for (let jj = ny - 1; jj >= 0; jj--) { const y = Y(jj); if (y > ya + 1e-9 && y < yb - 1e-9) P.push([y, f[K(i, jj)]]); }
      if (P.length === 0) return 0;
      if (P.length === 1) return P[0][1] * (yb - ya);
      const ext = (p0, p1, y) => p0[1] + ((p1[1] - p0[1]) * (y - p0[0])) / (p1[0] - p0[0]);
      const pts = [[ya, ext(P[0], P[1], ya)], ...P, [yb, ext(P[P.length - 1], P[P.length - 2], yb)]];
      let s = 0; for (let k = 1; k < pts.length; k++) s += 0.5 * (pts[k][1] + pts[k - 1][1]) * (pts[k][0] - pts[k - 1][0]);
      return s;
    }
    const jMid = Math.round((y1 - 0.5 * (yB + yS)) / dx);
    const cols = []; for (let i = 0; i < nx; i++) if (Number.isFinite(F.integrand[K(i, jMid)])) cols.push(i);
    function trapSplit(f) {
      const out = { rib: 0, slabIn: 0, slabOut: 0 };
      cols.forEach((i, c) => {
        const w = (c === 0 || c === cols.length - 1 ? 0.5 : 1) * dx * 1e-12; // um^2 -> m^2 with f in 1/(V m^2)
        const x = X(i), s = colInt(f, i, yB, yS) * w, yt = ytop(x);
        if (Math.abs(x) < wb) out.slabIn += s; else out.slabOut += s;
        if (yt > yS + 1e-9) out.rib += colInt(f, i, yS, yt) * w;
      });
      out.total = out.rib + out.slabIn + out.slabOut; return out;
    }
    // interface row y = yR inside the rib top: how many nodes return LN values
    const jTop = Math.round((y1 - yR) / dx); let topN = 0, topLN = 0;
    for (let i = 0; i < nx; i++) { const x = X(i); if (Math.abs(x) < wt && Number.isFinite(F.integrand[K(i, jTop)])) { topN++; if (F.integrand[K(i, jTop)] !== 0) topLN++; } }
    // depth profile: integral over x (trapezoid over finite nodes) per row, 1/(V um)
    const prof = [];
    for (let jj = 0; jj < ny; jj++) {
      let s = 0, s33 = 0; const fin = cols;
      fin.forEach((i, c) => { const w = (c === 0 || c === fin.length - 1 ? 0.5 : 1) * dx; const k = K(i, jj); if (Number.isFinite(F.integrand[k])) { s += F.integrand[k] * w; s33 += F.integrand_r33[k] * w; } });
      prof.push({ y: Y(jj), t: s * 1e-12, r: s33 * 1e-12 });
    }
    const glob = j.globals, si = j.surfaceIntegrals;
    return {
      j, g, F, X, Y, K, geo: G, glob, si, eMax, kMax, den, inLN, num, topN, topLN, prof, gTop: yR,
      nodal: { t: nodal(F.integrand), r: nodal(F.integrand_r33) },
      trap: { t: trapSplit(F.integrand), r: trapSplit(F.integrand_r33) },
      gx: { Ebar: num / den, Gamma: (num / den) * glob.gapA.value },
    };
  }

  // ---------- heatmaps ----------
  const FIG = {};
  const FIG_M = { ml: 36, mr: 10, mt: 24, mb: 30 }; // canvas margins, px
  const FC_RANGE = { xr: [-3.0, 3.0], yr: [-0.15, 0.45] }; // panel (c) window, um
  function setupFig(id, opt) {
    const el = document.getElementById(id), cv = el.querySelector(":scope > canvas"), cb = el.querySelector(".cb");
    FIG[id] = { el, cv, cb, opt, base: document.createElement("canvas") };
    const fromEvt = (e) => { const f = FIG[id], r = cv.getBoundingClientRect(); return f.inv ? f.inv(e.clientX - r.left, e.clientY - r.top) : null; };
    cv.addEventListener("pointermove", (e) => { const p = fromEvt(e); if (p) probeAt(p[0], p[1]); });
    cv.addEventListener("pointerdown", (e) => { const p = fromEvt(e); if (p) probeAt(p[0], p[1]); });
    cv.addEventListener("keydown", (e) => {
      const d = e.shiftKey ? 5 : 1, m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
      if (!m) return; e.preventDefault(); probe.i = Math.max(0, Math.min(EO.g.nx - 1, probe.i + m[0])); probe.j = Math.max(0, Math.min(EO.g.ny - 1, probe.j + m[1])); drawProbe();
    });
  }
  const probe = { i: 0, j: 0 };
  function probeAt(x, y) { const g = EO.g; probe.i = Math.max(0, Math.min(g.nx - 1, Math.round((x - g.x0) / g.dx))); probe.j = Math.max(0, Math.min(g.ny - 1, Math.round((g.y1 - y) / g.dx))); drawProbe(); }

  const niceStep = (span, n) => { const r = span / n, p = 10 ** Math.floor(Math.log10(r)), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };
  function renderFig(id) {
    const f = FIG[id], o = f.opt(), g = EO.g, dpr = Math.min(2, devicePixelRatio || 1);
    const W = f.cv.clientWidth || f.el.clientWidth, { ml, mr, mt, mb } = FIG_M;
    const pw = W - ml - mr, ph = Math.round((pw * (o.yr[1] - o.yr[0])) / (o.xr[1] - o.xr[0])), H = ph + mt + mb;
    const c = f.base; c.width = W * dpr; c.height = H * dpr;
    f.cv.width = W * dpr; f.cv.height = H * dpr; f.cv.style.height = `${H}px`;
    const ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const px = (x) => ml + ((x - o.xr[0]) / (o.xr[1] - o.xr[0])) * pw, py = (y) => mt + ((o.yr[1] - y) / (o.yr[1] - o.yr[0])) * ph;
    f.px = px; f.py = py; f.W = W; f.H = H; f.dpr = dpr; f.o = o;
    f.inv = (cx, cy) => (cx < ml || cx > ml + pw || cy < mt || cy > mt + ph ? null : [o.xr[0] + ((cx - ml) / pw) * (o.xr[1] - o.xr[0]), o.yr[1] - ((cy - mt) / ph) * (o.yr[1] - o.yr[0])]);
    ctx.fillStyle = css("--bg"); ctx.fillRect(0, 0, W, H);
    // image of the cropped node range (node-centred cells)
    const ia = Math.max(0, Math.floor((o.xr[0] - g.x0) / g.dx)), ib = Math.min(g.nx - 1, Math.ceil((o.xr[1] - g.x0) / g.dx));
    const ja = Math.max(0, Math.floor((g.y1 - o.yr[1]) / g.dx)), jb = Math.min(g.ny - 1, Math.ceil((g.y1 - o.yr[0]) / g.dx));
    const ni = ib - ia + 1, nj = jb - ja + 1, off = document.createElement("canvas"); off.width = ni; off.height = nj;
    const octx = off.getContext("2d"), img = octx.createImageData(ni, nj), cm = cmap(o.kind), nan = hex(css("--bg3").length === 7 ? css("--bg3") : "#18191b");
    for (let jj = 0; jj < nj; jj++) for (let i = 0; i < ni; i++) {
      const v = o.val(EO.K(ia + i, ja + jj)), q = 4 * (jj * ni + i);
      const rgb = Number.isFinite(v) ? cm(o.kind === "seq" ? (v - o.lo) / (o.hi - o.lo) : 0.5 + (0.5 * v) / o.hi) : nan;
      img.data[q] = rgb[0]; img.data[q + 1] = rgb[1]; img.data[q + 2] = rgb[2]; img.data[q + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(ml, mt, pw, ph); ctx.clip();
    ctx.imageSmoothingEnabled = false;
    const x0p = px(EO.X(ia) - g.dx / 2), x1p = px(EO.X(ib) + g.dx / 2), y0p = py(EO.Y(ja) + g.dx / 2), y1p = py(EO.Y(jb) - g.dx / 2);
    ctx.drawImage(off, x0p, y0p, x1p - x0p, y1p - y0p);
    // geometry outlines
    const G = EO.geo, line = visual() ? css("--fg") : css("--fg");
    const poly = (p) => { ctx.beginPath(); p.forEach(([x, y], k) => (k ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y)))); ctx.closePath(); };
    for (const e of [G.signal, G.ground]) { poly(e); ctx.fillStyle = visual() ? css("--gold") : css("--bg3"); ctx.globalAlpha = visual() ? 0.55 : 1; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.globalAlpha = 0.85; ctx.strokeStyle = line; ctx.lineWidth = 1;
    poly(G.ln_rib); ctx.stroke(); poly(G.ln_slab); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
    ctx.font = "10px 'IBM Plex Mono', ui-monospace, monospace"; ctx.fillStyle = css("--fg3");
    // electrode labels
    ctx.textAlign = "center";
    for (const [e, t] of [[G.signal, "S"], [G.ground, "G"]]) { const cx = px((e[0][0] + e[1][0]) / 2), cy = py((e[0][1] + e[2][1]) / 2) + 3; if (cx > ml && cx < ml + pw && cy > mt + 8 && cy < mt + ph) { ctx.fillStyle = visual() ? "#1a1306" : css("--fg2"); ctx.fillText(t, cx, cy); } }
    // axes
    ctx.strokeStyle = css("--rule2"); ctx.strokeRect(ml + 0.5, mt + 0.5, pw - 1, ph - 1);
    ctx.fillStyle = css("--fg3"); ctx.textAlign = "center"; ctx.textBaseline = "top";
    const sx = pw < 640 ? Math.max(o.xt, 1) : o.xt; for (let x = Math.ceil(o.xr[0] / sx - 1e-9) * sx; x <= o.xr[1] + 1e-9; x += sx) { const X = px(x); ctx.fillRect(X, mt + ph, 1, 3); ctx.fillText(fix(+x.toFixed(3), sx < 1 ? 1 : 0), X, mt + ph + 5); }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const sy = ph < 90 ? Math.max(o.yt, 0.2) : o.yt; for (let y = Math.ceil(o.yr[0] / sy - 1e-9) * sy; y <= o.yr[1] + 1e-9; y += sy) { const Yp = py(y); ctx.fillRect(ml - 3, Yp, 3, 1); ctx.fillText(fix(+y.toFixed(3), sy < 0.5 ? 1 : 1), ml - 5, Yp); }
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText("x (µm)", ml + pw / 2, mt + ph + 17); ctx.textAlign = "left"; ctx.fillText("y (µm)", 2, 3);
    // colorbar
    const bc = f.cb.querySelector("canvas"), bw = Math.max(60, bc.clientWidth || 120);
    bc.width = bw; bc.height = 8; const bctx = bc.getContext("2d"), bimg = bctx.createImageData(bw, 8);
    for (let x = 0; x < bw; x++) { const rgb = cm(x / (bw - 1)); for (let y = 0; y < 8; y++) { const q = 4 * (y * bw + x); bimg.data[q] = rgb[0]; bimg.data[q + 1] = rgb[1]; bimg.data[q + 2] = rgb[2]; bimg.data[q + 3] = 255; } }
    bctx.putImageData(bimg, 0, 0);
    f.cb.querySelector(".lo").innerHTML = o.kind === "seq" ? sci(o.lo, 2) : sci(-o.hi, 2);
    f.cb.querySelector(".hi").innerHTML = sci(o.hi, 2);
    f.cb.querySelector(".u").innerHTML = o.unit;
    blit(id);
  }
  function blit(id) {
    const f = FIG[id], ctx = f.cv.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(f.base, 0, 0);
    ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
    const x = EO.X(probe.i), y = EO.Y(probe.j), o = f.o;
    if (x < o.xr[0] || x > o.xr[1] || y < o.yr[0] || y > o.yr[1]) return;
    const X = Math.round(f.px(x)) + 0.5, Y = Math.round(f.py(y)) + 0.5;
    ctx.strokeStyle = visual() ? css("--acc") : css("--fg"); ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(X, f.py(o.yr[1])); ctx.lineTo(X, f.py(o.yr[0])); ctx.moveTo(f.px(o.xr[0]), Y); ctx.lineTo(f.px(o.xr[1]), Y); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeRect(X - 3, Y - 3, 6, 6);
  }
  const DASH = "\u2013";
  // Hover readout: the same nine fixed slots before and after the data loads (placeholders until then).
  function roHTML(r) {
    const v = (x) => (r ? x() : DASH);
    const parts = [
      `x ${fv(v(() => fix(r.x, 2)), "w6")} \u00b5m`, `y ${fv(v(() => fix(r.y, 2)), "w6")} \u00b5m`, fv(v(() => region(r.x, r.y)), "w14 l"),
      `|E<sub>x</sub>|<sup>2</sup>/max ${fv(v(() => (r.fin ? (r.o * r.o / EO.eMax).toFixed(4) : "n/a")), "w7")}`,
      `|E<sub>x</sub>| ${fv(v(() => (r.fin ? sci(Math.abs(r.o), 3) : "n/a")))} V/m`,
      `e<sub>x</sub> ${fv(v(() => sci(r.ex * 1e-6, 3)))}`, `e<sub>y</sub> ${fv(v(() => sci(r.ey * 1e-6, 3)))} (V/\u00b5m)/V`,
      `integrand ${fv(v(() => (r.fin ? sci(r.it * 1e-12, 3) : "n/a")))}`, `r<sub>33</sub> ${fv(v(() => (r.fin ? sci(r.i33 * 1e-12, 3) : "n/a")))} 1/(V \u00b5m<sup>2</sup>)`,
    ];
    return parts.map((p) => `<span>${p}</span>`).join("");
  }
  function drawProbe() {
    Object.keys(FIG).forEach(blit);
    const k = EO.K(probe.i, probe.j), F = EO.F, o = F.optEx[k];
    $("#ro").innerHTML = roHTML({ x: EO.X(probe.i), y: EO.Y(probe.j), o, fin: Number.isFinite(o), ex: F.esEx[k], ey: F.esEy[k], it: F.integrand[k], i33: F.integrand_r33[k] });
  }

  let fcField = "integrand";
  function figs() {
    const g = EO.g, F = EO.F, full = { xr: [g.x0 - g.dx / 2, g.x0 + (g.nx - 1) * g.dx + g.dx / 2], yr: [g.y1 - (g.ny - 1) * g.dx - g.dx / 2, g.y1 + g.dx / 2] };
    let esMax = 0, esMin = 0; for (const v of F.esEx) { esMax = Math.max(esMax, v); esMin = Math.min(esMin, v); }
    const esSigned = esMin < -1e-6 * esMax;
    setupFig("fa", () => ({ ...full, xt: 1, yt: 0.5, kind: "seq", lo: 0, hi: 1, val: (k) => (F.optEx[k] ** 2) / EO.eMax, unit: "|E<sub>x</sub>|<sup>2</sup> / |E<sub>x</sub>|<sup>2</sup><sub>max</sub>" }));
    setupFig("fb", () => (esSigned
      ? { ...full, xt: 1, yt: 0.5, kind: "div", hi: Math.max(esMax, -esMin) * 1e-6, val: (k) => F.esEx[k] * 1e-6, unit: "(V/µm)/V" }
      : { ...full, xt: 1, yt: 0.5, kind: "seq", lo: 0, hi: esMax * 1e-6, val: (k) => F.esEx[k] * 1e-6, unit: "(V/µm)/V" }));
    setupFig("fc", () => {
      const f = F[fcField]; let a = 0; for (const v of f) if (Number.isFinite(v)) a = Math.max(a, Math.abs(v));
      return { ...FC_RANGE, xt: 0.5, yt: 0.1, kind: "div", hi: a * 1e-12, val: (k) => f[k] * 1e-12, unit: "1/(V µm<sup>2</sup>)" };
    });
    $("#fa-pk").innerHTML = `peak |E<sub>x</sub>| ${fv(sci(Math.sqrt(EO.eMax), 3))} V/m`;
    $("#fb-pk").innerHTML = `${esSigned ? "min &lt; 0" : "min 0"}, max ${fv(sci(esMax * 1e-6, 3))} (V/µm)/V`;
    document.querySelectorAll("#fc-t button").forEach((b) => b.addEventListener("click", () => { fcField = b.dataset.v; paintFcSeg(); renderFig("fc"); }));
    paintFcSeg();
  }
  const paintFcSeg = () => document.querySelectorAll("#fc-t button").forEach((b) => b.classList.toggle("on", b.dataset.v === fcField));

  // ---------- (d) depth profile ----------
  const fdRowHTML = (p, itf) => `y ${fv(p ? fix(p.y, 2) : DASH, "w6")} µm total ${fv(p ? sci(p.t, 3) : DASH)} r<sub>33</sub> ${fv(p ? sci(p.r, 3) : DASH)} 1/(V µm) ${fv(itf ? "interface" : "", "w9 l")}`;
  const fdSumHTML = (v) => `&sum; rows &times; &Delta;y = ${fv(v === null ? DASH : sci(v, 4))} 1/V (nodal grid sum). Hover or tap a bar.`;
  function depth() {
    const s = $("#fd-svg"), W = Math.max(260, s.clientWidth || 360), H = 260, l = 44, r = 64, t = 20, b = 30;
    s.setAttribute("viewBox", `0 0 ${W} ${H}`); s.style.height = `${H}px`;
    const y0 = -0.075, y1 = 0.375, rows = EO.prof.filter((p) => p.y > y0 && p.y < y1);
    let mn = 0; rows.forEach((p) => { mn = Math.min(mn, p.t, p.r); });
    const step = niceStep(-mn, 4), xmin = -Math.ceil(-mn / step) * step;
    const X = (v) => l + ((v - xmin) / (0 - xmin)) * (W - l - r), Y = (y) => t + ((y1 - y) / (y1 - y0)) * (H - t - b), dy = EO.g.dx;
    const G = EO.geo, yS = G.ln_slab[2][1], yR = G.ln_rib[2][1];
    let o = `<rect x="${l}" y="${Y(yS)}" width="${W - l - r}" height="${Y(0) - Y(yS)}" class="dpb"/><rect x="${l}" y="${Y(yR)}" width="${W - l - r}" height="${Y(yS) - Y(yR)}" class="dpb b2"/>`;
    o += `<text x="${W - r + 6}" y="${(Y(yS) + Y(0)) / 2 + 3}" class="tk">slab</text><text x="${W - r + 6}" y="${(Y(yR) + Y(yS)) / 2 + 3}" class="tk">rib</text>`;
    for (let v = xmin; v <= 1e-12; v += step) o += `<line x1="${X(v)}" x2="${X(v)}" y1="${t}" y2="${H - b}" class="gl"/><text x="${X(v)}" y="${H - b + 13}" text-anchor="middle" class="tk">${Math.abs(v) < 1e-12 ? "0" : fix(v * 1e5, 0)}</text>`;
    o += `<text x="${l}" y="${H - 3}" class="tk">&#215;10&#8315;&#8309; 1/(V µm)</text>`;
    for (let y = -0.05; y <= 0.35 + 1e-9; y += 0.05) o += `<text x="${l - 5}" y="${Y(y) + 3}" text-anchor="end" class="tk">${fix(+y.toFixed(2), 2)}</text>`;
    o += `<text x="2" y="11" class="tk">y (µm)</text>`;
    rows.forEach((p) => { const k = EO.prof.indexOf(p); o += `<rect class="dpbar${p.t ? "" : " zero"}" data-k="${k}" x="${X(p.t)}" y="${Y(p.y + dy / 2) + 0.5}" width="${Math.max(0.5, X(0) - X(p.t))}" height="${Math.max(1, Y(p.y - dy / 2) - Y(p.y + dy / 2) - 1)}"/>`; });
    let d = ""; rows.forEach((p, i) => { d += `${i ? "L" : "M"}${X(p.r).toFixed(1)} ${Y(p.y + dy / 2).toFixed(1)}L${X(p.r).toFixed(1)} ${Y(p.y - dy / 2).toFixed(1)}`; });
    o += `<path d="${d}" class="r33"/><line x1="${X(0)}" x2="${X(0)}" y1="${t}" y2="${H - b}" class="ax"/>`;
    o += `<rect x="${l}" y="${t}" width="${W - l - r}" height="${H - t - b}" class="frame"/>`;
    s.innerHTML = o;
    const ro = $("#fd-ro");
    const showRow = (k) => { const p = EO.prof[k], itf = Math.abs(p.y) < 1e-9 || Math.abs(p.y - yS) < 1e-9 || Math.abs(p.y - yR) < 1e-9; ro.innerHTML = fdRowHTML(p, itf); };
    s.querySelectorAll(".dpbar").forEach((bEl) => bEl.addEventListener("pointerenter", () => showRow(+bEl.dataset.k)));
    s.onpointerdown = (e) => { const bEl = e.target.closest(".dpbar"); if (bEl) showRow(+bEl.dataset.k); };
    const sumRows = EO.prof.reduce((a, p) => a + p.t * dy, 0);
    $("#fd-sum").innerHTML = fdSumHTML(sumRows);
    showRow(EO.prof.reduce((b, p, i) => (p.t < EO.prof[b].t ? i : b), 0));
  }

  // ---------- numbers ----------
  // Called once with E = null before the data arrives: same rows, same fixed slots, placeholders in place of values.
  const ps = (str, w) => `<span class="ps" style="min-width:${w}ch">${str}</span>`; // fixed-width mono slot inside text
  function numbers(E) {
    const ok = !!E, D = DASH;
    const gl = ok ? E.glob : null, si = ok ? E.si : null, G = ok ? E.geo : null;
    const c = ok ? (() => {
      const eng = gl.dneffA.value, eng33 = si["eoA.integrand_r33"].value, ne = G.n_e, r33 = G.r_pm_per_v.r33 * 1e-12, neff = gl["armA.neff"].value, lam = G.lambda_um * 1e-6;
      return { eng, eng33, ne, neff, tot: si["eoA.integrand"].value, T: E.trap.t,
        scalarTE: -((ne ** 4 * r33) / (2 * neff)) * E.gx.Ebar, conv: -0.5 * ne ** 3 * r33 * gl.EbarA.value,
        vpilEng: gl.VpiL.value * 100, vpilTb: gl.VpiLtextbook.value * 100, vpilMeas: G.measured.vpi_l_dc_vcm,
        vpilChk: (lam / (2 * Math.abs(gl.dneffA.value - gl.dneffB.value))) * 100 };
    })() : null;
    const v = (f) => (ok ? f() : D);           // value cell
    const l = (f, w) => ps(ok ? f() : D, w);   // computed part inside a label or a sentence
    const ENG = badge("d", "engine", "engine"), DER = badge("d", "derived"), REP = badge("r", "reported", "li2026aa");
    const grp = (t) => `<tr class="grp"><th colspan="4">${t}</th></tr>`;
    const row = (q, val, u, src) => `<tr><td>${q}</td><td class="r num">${val}</td><td>${u}</td><td class="r">${src}</td></tr>`;
    let h = "";
    h += grp("d n<sub>eff</sub>/dV, arm A");
    h += row("engine, FEM quadrature", v(() => sci(c.eng, 4)), "1/V", ENG);
    h += row(`grid, nodal sum &sum; f &Delta;x<sup>2</sup> <span class="dim">${l(() => sgnPct(E.nodal.t / c.eng - 1), 6)}</span>`, v(() => sci(E.nodal.t, 4)), "1/V", DER);
    h += row(`grid, column trapezoid in LN <span class="dim">${l(() => sgnPct(c.T.total / c.eng - 1), 6)}</span>`, v(() => sci(c.T.total, 4)), "1/V", DER);
    h += row("r<sub>33</sub> only: engine", v(() => sci(c.eng33, 4)), "1/V", ENG);
    h += row(`r<sub>33</sub> only: grid nodal <span class="dim">${l(() => sgnPct(E.nodal.r / c.eng33 - 1), 6)}</span>`, v(() => sci(E.nodal.r, 4)), "1/V", DER);
    h += grp("by region (grid, column trapezoid)");
    h += row(`rib, y ${l(() => String(G.ln_slab[2][1]), 4)} to ${l(() => String(G.ln_rib[2][1]), 3)} µm <span class="dim">${l(() => pct(c.T.rib / c.T.total, 1), 5)}</span>`, v(() => sci(c.T.rib, 3)), "1/V", DER);
    h += row(`slab under the rib, |x| &lt; ${l(() => G.ln_rib[1][0].toFixed(3), 5)} µm <span class="dim">${l(() => pct(c.T.slabIn / c.T.total, 1), 5)}</span>`, v(() => sci(c.T.slabIn, 3)), "1/V", DER);
    h += row(`slab outside the rib <span class="dim">${l(() => pct(c.T.slabOut / c.T.total, 1), 5)}</span>`, v(() => sci(c.T.slabOut, 3)), "1/V", DER);
    h += grp("by tensor entry (engine surface integrals)");
    for (const k of ["r33", "r13", "r51", "r22"]) { const val = () => si[`eoA.integrand_${k}`].value; h += row(`r<sub>${k.slice(1)}</sub> <span class="dim">${l(() => pct(val() / c.tot, 2), 6)}</span>`, v(() => (val() ? sci(val(), 3) : "0")), "1/V", ENG); }
    h += grp("push-pull");
    h += row("d n<sub>eff</sub>/dV, arm B", v(() => sci(gl.dneffB.value, 4)), "1/V", ENG);
    h += row("balance d n<sub>B</sub> / d n<sub>A</sub>", v(() => gl.balance.value.toFixed(4)), "", ENG);
    h += grp("overlap");
    h += row("&Gamma;<sub>A</sub>, vector |<b>E</b>|<sup>2</sup>", v(() => gl.GammaA.value.toFixed(4)), "", ENG);
    h += row("&Gamma;<sub>x</sub>, grid |E<sub>x</sub>|<sup>2</sup>, grid window", v(() => E.gx.Gamma.toFixed(4)), "", DER);
    h += row("&#274;<sub>A</sub> = &Gamma;V/g", v(() => sci(gl.EbarA.value * 1e-6, 4)), "(V/µm)/V", ENG);
    h += row("gap g", v(() => (gl.gapA.value * 1e6).toFixed(1)), "µm", ENG);
    h += grp("indices and power");
    h += row("n<sub>e</sub>, engine material", v(() => c.ne.toFixed(3)), "", ENG);
    h += row("n<sub>eff</sub>, TE<sub>0</sub>", v(() => c.neff.toFixed(4)), "", ENG);
    h += row("n<sub>g</sub>", v(() => gl["armA.ng"].value.toFixed(3)), "", ENG);
    h += row("n<sub>e</sub> / n<sub>eff</sub>", v(() => (c.ne / c.neff).toFixed(4)), "", DER);
    h += row("&int;<sub>LN</sub>|E<sub>x</sub>|<sup>2</sup> / &int;|E<sub>x</sub>|<sup>2</sup>, grid", v(() => pct(E.inLN / E.den, 1)), "", DER);
    h += row(`&int;|E<sub>x</sub>|<sup>2</sup>dA, grid <span class="dim">vs 2Z<sub>0</sub>P/n<sub>eff</sub> = ${l(() => (2 * Z0 / c.neff).toFixed(1), 5)}</span>`, v(() => E.den.toFixed(1)), "V<sup>2</sup>", DER);
    h += grp("d n/dV and V<sub>&pi;</sub>L");
    h += row("eq. (4) scalar TE, grid fields", v(() => sci(c.scalarTE, 4)), "1/V", DER);
    h += row(`eq. (5) ${M}&frac12;n<sub>e</sub><sup>3</sup>r<sub>33</sub>&#274;<sub>A</sub>`, v(() => sci(c.conv, 4)), "1/V", DER);
    h += row(`V<sub>&pi;</sub>L engine <span class="dim">check &lambda;/2|dn<sub>A</sub>${M}dn<sub>B</sub>| = ${l(() => c.vpilChk.toFixed(3), 5)}</span>`, v(() => c.vpilEng.toFixed(3)), "V cm", ENG);
    h += row("V<sub>&pi;</sub>L conventional, eq. (5)", v(() => c.vpilTb.toFixed(3)), "V cm", ENG);
    h += row("V<sub>&pi;</sub>L measured", v(() => c.vpilMeas.toFixed(2)), "V cm", REP);
    h += row("ratio conventional / engine", v(() => (c.vpilTb / c.vpilEng).toFixed(4)), "", DER);
    h += row(`V<sub>&pi;</sub> at ${l(() => String(G.length_mm), 1)} mm: engine / measured`, v(() => `${E.j.metrics.vpi_dc_v.toFixed(3)} / ${G.measured.vpi_dc_v.toFixed(2)}`), "V", `${ENG} ${REP}`);
    $("#ntab tbody").innerHTML = h;
    const r = l;
    $("#l3-why").innerHTML = `Eq. (4) carries n<sub>e</sub><sup>4</sup>/n<sub>eff</sub> where eq. (5) carries n<sub>e</sub><sup>3</sup>; the two agree only for n<sub>eff</sub> = n<sub>e</sub>. Here n<sub>eff</sub> = ${r(() => c.neff.toFixed(3), 5)} against n<sub>e</sub> = ${r(() => c.ne.toFixed(3), 5)} because only ${r(() => pct(E.inLN / E.den, 0), 3)} of &int;|E<sub>x</sub>|<sup>2</sup>dA (the TE power density) lies in LN and the rest in SiO<sub>2</sub>, so eq. (5) underestimates d n<sub>eff</sub>/dV by n<sub>e</sub>/n<sub>eff</sub> = ${r(() => (c.ne / c.neff).toFixed(3), 5)} and overestimates V<sub>&pi;</sub>L: ${r(() => c.vpilTb.toFixed(2), 4)} vs ${r(() => c.vpilEng.toFixed(2), 4)} V cm, measured ${r(() => c.vpilMeas.toFixed(2), 4)} V cm. The engine ratio ${r(() => (c.vpilTb / c.vpilEng).toFixed(3), 5)} differs from ${r(() => (c.ne / c.neff).toFixed(3), 5)} through the E<sub>y</sub> and E<sub>z</sub> terms the vector solver keeps.`;
    $("#l3-grid-note").innerHTML = `Grid ${r(() => String(E.g.nx), 3)} &times; ${r(() => String(E.g.ny), 2)} nodes, &Delta;x = ${r(() => String(E.g.dx), 4)} µm; optical field and integrand are undefined outside the engine's arm window |x| &le; 2.9 µm (blank). Interface nodes take whichever side the engine's point locator returns: ${r(() => String(E.topLN), 3)} of ${r(() => String(E.topN), 3)} nodes on the rib top y = ${r(() => String(E.gTop), 3)} µm return LN values. The column trapezoid replaces interface values by linear extrapolation from the two nearest interior nodes and changes the sum by ${r(() => sgnPct(c.T.total / E.nodal.t - 1), 6)}; both grid estimates exceed the engine quadrature by about ${r(() => Math.abs((E.nodal.t / c.eng - 1) * 100).toFixed(1), 3)}%, a residual not isolated here (the engine integrates on its own triangles; its accuracy note quotes 1.4e-3 to 3.5e-3 relative against independent references on its test cases). &Gamma;<sub>x</sub> and eq. (4) use |E<sub>x</sub>|<sup>2</sup> integrated over the grid window y ${r(() => fix(E.Y(E.g.ny - 1), 2), 5)} to ${r(() => String(E.g.y1), 3)} µm; the engine window extends to y ${M}1.5 to 2.0 µm.`;
    $("#map-r33").innerHTML = `(${r(() => pct(si["eoA.integrand_r33"].value / c.tot, 2), 6)} of d n<sub>eff</sub>/dV)`;
    $("#l3-date").innerHTML = r(() => E.j.meta.exported, 10);
  }
  // ---------- reserved layout before the data arrives ----------
  // The export grid (json.meta.grid, asserted on load) fixes the figure aspect ratios, so the canvases get their final height up front.
  const GRID0 = { x0: -3.6, y1: 1.5, dx: 0.03, nx: 241, ny: 81 };
  const FULL0 = { xr: [GRID0.x0 - GRID0.dx / 2, GRID0.x0 + (GRID0.nx - 1) * GRID0.dx + GRID0.dx / 2], yr: [GRID0.y1 - (GRID0.ny - 1) * GRID0.dx - GRID0.dx / 2, GRID0.y1 + GRID0.dx / 2] };
  function reserve() {
    for (const [id, o] of [["fa", FULL0], ["fb", FULL0], ["fc", FC_RANGE]]) {
      const cv = document.querySelector(`#${id} > canvas`), W = cv.clientWidth;
      cv.style.height = `${Math.round(((W - FIG_M.ml - FIG_M.mr) * (o.yr[1] - o.yr[0])) / (o.xr[1] - o.xr[0])) + FIG_M.mt + FIG_M.mb}px`;
    }
    $("#fd-svg").style.height = "260px";
  }
  reserve();
  $("#ro").innerHTML = roHTML(null);
  $("#fd-ro").innerHTML = fdRowHTML(null, false);
  $("#fd-sum").innerHTML = fdSumHTML(null);
  $("#fa-pk").innerHTML = `peak |E<sub>x</sub>| ${fv(DASH)} V/m`;
  $("#fb-pk").innerHTML = `min 0, max ${fv(DASH)} (V/\u00b5m)/V`;
  numbers(null);

  function renderAll() { if (!EO) { reserve(); return; } Object.keys(FIG).forEach(renderFig); drawProbe(); depth(); }

  fetch("data/eo-overlap-li2026aa.json").then((r) => r.json()).then((j) => {
    EO = analyze(j);
    if (Math.abs(j.geometry.measured.vpi_dc_v - VPI_MEAS) > 1e-9) console.warn("eo.js: measured Vpi differs from json");
    // MZM: engine curve
    $("#mzm-eng").setAttribute("d", curve(j.metrics.vpi_dc_v));
    mzm();
    if (["x0", "y1", "dx", "nx", "ny"].some((k) => Math.abs(j.meta.grid[k] - GRID0[k]) > 1e-9)) console.warn("eo.js: json grid differs from the reserved layout grid");
    figs(); numbers(EO);
    probe.i = EO.kMax % EO.g.nx; probe.j = Math.floor(EO.kMax / EO.g.nx);
    renderAll();
  }).catch((e) => { $("#ntab tbody").innerHTML = `<tr><td colspan="4">FEM data not loaded (${String(e.message || e)}); serve mockup/ over http.</td></tr>`; });

  window.addEventListener("ln-mode", () => { renderAll(); });
  window.addEventListener("ln-pop", (e) => { if (e.detail === "qpm") { const c = document.getElementById("p-qpm"); if (c) c.textContent = `${LN.qpmPeriodSHG(1.064).toFixed(2)} \u00b5m`; } });
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(renderAll, 120); });
})();
