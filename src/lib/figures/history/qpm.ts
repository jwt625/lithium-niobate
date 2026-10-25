// Second-harmonic field built up along a crystal, undepleted pump: A(z) = integral_0^z d(z') exp(i dk z') dz' with
// dk = pi / l_c. Without QPM d = 1; with first-order QPM (50% duty) d flips sign every coherence length l_c.
// Units: z in l_c, A in l_c / pi (one coherence length of unflipped material traces a half circle of radius 1).
// Closed forms used as checks: |A(N l_c)| = 2N with QPM, |A| <= 2 without (|A(z)| = 2 |sin(pi z / 2 l_c)|).

export interface Phasor { re: Float64Array; im: Float64Array }

/** Cumulative phasor sampled `per` times per coherence length over N coherence lengths. */
export function phasorPath(N: number, qpm: boolean, per = 24): Phasor {
  const n = Math.max(1, Math.round(N * per));
  const re = new Float64Array(n + 1), im = new Float64Array(n + 1);
  for (let k = 1; k <= n; k++) {
    const z0 = (k - 1) / per, z1 = k / per;
    const sign = qpm && Math.floor(z0 + 1e-9) % 2 === 1 ? -1 : 1;
    // exact segment integral of exp(i pi z) dz from z0 to z1, times pi (A in l_c / pi units): (e^{i pi z1} - e^{i pi z0}) / i
    const dRe = Math.sin(Math.PI * z1) - Math.sin(Math.PI * z0);
    const dIm = -(Math.cos(Math.PI * z1) - Math.cos(Math.PI * z0));
    re[k] = re[k - 1] + sign * dRe;
    im[k] = im[k - 1] + sign * dIm;
  }
  return { re, im };
}

/** SH power after N coherence lengths (integer N), normalized to the power after one coherence length (|A(l_c)| = 2):
 *  N^2 with QPM; sin^2(pi N / 2) without (0 or 1). */
export function shPower(N: number, qpm: boolean): number {
  return qpm ? N * N : Math.sin((Math.PI * N) / 2) ** 2;
}
