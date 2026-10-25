// Minimal LN physics for the mockup. Every constant carries its provenance.
// Status keys: P-db = CC0 transcription of a primary source; S = secondary; derived = computed here.

const LN = (() => {
  // Zelmon, Small, Jundt, JOSA B 14, 3319 (1997), doi:10.1364/JOSAB.14.003319; congruent LN, 21 C, 0.4-5.0 um.
  // n^2 - 1 = sum B_i L^2 / (L^2 - C_i), L in um. Coefficients via refractiveindex.info (CC0), status P-db (research/R06).
  const ZELMON_CLN = {
    o: [2.6734, 0.01764, 1.229, 0.05914, 12.614, 474.6],
    e: [2.9804, 0.02047, 0.5981, 0.0666, 8.9543, 416.08],
  };

  // Unclamped (low-frequency) r22 of congruent LN: 6.8 pm/V. Rauber 1978 via Veit et al., arXiv cond-mat/0311240, Table 1.
  // Status S (secondary) until checked against the primary (research/R06, R14).
  const R22_T = 6.8e-12;

  function n(axis, lamUm) {
    const [B1, C1, B2, C2, B3, C3] = ZELMON_CLN[axis];
    const L2 = lamUm * lamUm;
    return Math.sqrt(1 + (B1 * L2) / (L2 - C1) + (B2 * L2) / (L2 - C2) + (B3 * L2) / (L2 - C3));
  }

  // First-order QPM period for e-e-e SHG, lambda (um) -> lambda/2: Lambda = lambda / (2 (n_e(lambda/2) - n_e(lambda)))
  function qpmPeriodSHG(lamUm) {
    return lamUm / (2 * (n("e", lamUm / 2) - n("e", lamUm)));
  }

  // Approximate CIE-like RGB weights for spectral samples (smooth Gaussians, display only).
  const SPECTRUM = [];
  for (let lam = 0.42; lam <= 0.681; lam += 0.026) {
    const g = (mu, s) => Math.exp(-0.5 * ((lam - mu) / s) ** 2);
    SPECTRUM.push({ lam, w: [g(0.6, 0.042) + 0.3 * g(0.445, 0.02), g(0.55, 0.04), g(0.455, 0.028)] });
  }
  const WSUM = [0, 1, 2].map((c) => SPECTRUM.reduce((a, s) => a + s.w[c], 0));

  // Conoscopic figure of a z-cut plate between crossed polarizers (polarizer along x, analyzer along y).
  // Weak-birefringence model: the natural uniaxial term (n_o - n_e) sin^2(theta), slow axis tangential,
  // adds as a doubled-angle vector to the Pockels term n_o^3 r22 E for an in-plane field.
  // E along x (a-axis) -> induced slow axis at +45 deg; E along y -> slow axis along x.
  // Retardance Gamma = 2 pi d |B| / (lambda cos theta); I = sin^2(2 psi) sin^2(Gamma / 2).
  function renderConoscope(ctx, size, opt) {
    const { thicknessMm, fieldKVmm, fieldDir, white, NA } = opt;
    const img = ctx.createImageData(size, size);
    const d = thicknessMm * 1e3; // um
    const E = fieldKVmm * 1e6; // V/m
    const samples = white ? SPECTRUM : [{ lam: 0.6328, w: [1, 0.12, 0.08] }];
    const sw = white ? WSUM : [1, 0.12, 0.08];
    const per = samples.map((s) => {
      const no = n("o", s.lam), ne = n("e", s.lam);
      return { lam: s.lam, w: s.w, dn: no - ne, dE: no ** 3 * R22_T * E, no };
    });
    const no550 = n("o", 0.55);
    const data = img.data;
    const half = size / 2;
    for (let y = 0; y < size; y++) {
      const v = (half - y - 0.5) / half;
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5 - half) / half;
        const r2 = u * u + v * v;
        const i = (y * size + x) * 4;
        if (r2 > 1) { data[i] = data[i + 1] = data[i + 2] = 0; data[i + 3] = 255; continue; }
        const sAir2 = NA * NA * r2;
        const s2 = sAir2 / (no550 * no550);
        const cosT = Math.sqrt(1 - s2);
        const c2 = r2 > 0 ? (u * u - v * v) / r2 : 1;
        const s2p = r2 > 0 ? (2 * u * v) / r2 : 0;
        let R = 0, G = 0, Bc = 0;
        for (let k = 0; k < per.length; k++) {
          const p = per[k];
          const du = p.dn * s2;
          let bx = -du * c2, by = -du * s2p;
          if (fieldDir === "x") by += p.dE; else bx += p.dE;
          const mag = Math.hypot(bx, by);
          const s2psi = mag > 0 ? by / mag : 0; // sin(2 psi)
          const gam = (2 * Math.PI * d * mag) / (p.lam * cosT);
          const I = s2psi * s2psi * Math.sin(gam / 2) ** 2;
          R += I * p.w[0]; G += I * p.w[1]; Bc += I * p.w[2];
        }
        const edge = r2 > 0.985 ? 0.55 : 1;
        data[i] = Math.min(255, 255 * Math.pow(R / sw[0], 0.8) * edge * 1.6);
        data[i + 1] = Math.min(255, 255 * Math.pow(G / sw[1], 0.8) * edge * 1.6);
        data[i + 2] = Math.min(255, 255 * Math.pow(Bc / sw[2], 0.8) * edge * 1.6);
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  return { n, qpmPeriodSHG, renderConoscope, R22_T };
})();
