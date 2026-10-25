// Independent cross-checks: eigen reconstruction A v = lambda v, naive DFT for the FFT, residuals for the solver.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bisect, eigSym2, eigSym3, invert, solveLinear } from "./linalg.ts";
import type { Mat3 } from "./linalg.ts";
import { fft } from "./fft.ts";
import { createRng } from "./prng.ts";

test("eigSym3: A v = lambda v and orthonormal vectors (random symmetric)", () => {
  const r = createRng(5);
  for (let t = 0; t < 50; t++) {
    const a = r.uniform(-1, 1), b = r.uniform(-1, 1), c = r.uniform(-1, 1), d = r.uniform(-1, 1), e = r.uniform(-1, 1), f = r.uniform(-1, 1);
    const A: Mat3 = [[a, b, c], [b, d, e], [c, e, f]];
    const { values, vectors } = eigSym3(A);
    assert.ok(values[0] <= values[1] && values[1] <= values[2]);
    for (let i = 0; i < 3; i++) {
      const v = vectors[i];
      for (let k = 0; k < 3; k++) {
        const Av = A[k][0] * v[0] + A[k][1] * v[1] + A[k][2] * v[2];
        assert.ok(Math.abs(Av - values[i] * v[k]) < 1e-13);
      }
      for (let j = 0; j < 3; j++) {
        const dp = v[0] * vectors[j][0] + v[1] * vectors[j][1] + v[2] * vectors[j][2];
        assert.ok(Math.abs(dp - (i === j ? 1 : 0)) < 1e-13);
      }
    }
  }
});

test("eigSym3 resolves 1e-6 relative splittings (Pockels scale) to full precision", () => {
  const b0 = 1 / 2.2111 ** 2;
  const db = 3.4e-12 * 1e6; // r22 E at 1 V/um
  const { values } = eigSym3([[b0, -db, 0], [-db, b0, 0], [0, 0, 1 / 2.1376 ** 2]]);
  assert.ok(Math.abs(values[0] - (b0 - db)) < 1e-16);
  assert.ok(Math.abs(values[1] - (b0 + db)) < 1e-16);
});

test("eigSym2 matches the quadratic formula", () => {
  const { lo, hi, thetaHi } = eigSym2(2, 0.5, 1);
  const m = 1.5, d = Math.hypot(0.5, 0.5);
  assert.ok(Math.abs(lo - (m - d)) < 1e-15 && Math.abs(hi - (m + d)) < 1e-15);
  // eigenvector of hi
  const v = [Math.cos(thetaHi), Math.sin(thetaHi)];
  assert.ok(Math.abs(2 * v[0] + 0.5 * v[1] - hi * v[0]) < 1e-14);
});

test("fft equals naive DFT; inverse restores input", () => {
  const r = createRng(9);
  const N = 64;
  const re = Float64Array.from({ length: N }, () => r.normal());
  const im = Float64Array.from({ length: N }, () => r.normal());
  const r0 = Float64Array.from(re), i0 = Float64Array.from(im);
  fft(re, im);
  for (let k = 0; k < N; k++) {
    let sr = 0, si = 0;
    for (let n = 0; n < N; n++) {
      const a = (-2 * Math.PI * k * n) / N;
      sr += r0[n] * Math.cos(a) - i0[n] * Math.sin(a);
      si += r0[n] * Math.sin(a) + i0[n] * Math.cos(a);
    }
    assert.ok(Math.abs(re[k] - sr) < 1e-11 && Math.abs(im[k] - si) < 1e-11);
  }
  fft(re, im, true);
  for (let n = 0; n < N; n++) assert.ok(Math.abs(re[n] - r0[n]) < 1e-13 && Math.abs(im[n] - i0[n]) < 1e-13);
  assert.throws(() => fft(new Float64Array(6), new Float64Array(6)));
});

test("solveLinear, invert, bisect", () => {
  const A = [[4, 1, 2], [1, 5, 3], [2, 3, 6]];
  const x = solveLinear(A, [1, 2, 3]);
  A.forEach((row, i) => assert.ok(Math.abs(row[0] * x[0] + row[1] * x[1] + row[2] * x[2] - [1, 2, 3][i]) < 1e-14));
  const Ai = invert(A);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const s = A[i][0] * Ai[0][j] + A[i][1] * Ai[1][j] + A[i][2] * Ai[2][j];
    assert.ok(Math.abs(s - (i === j ? 1 : 0)) < 1e-14);
  }
  assert.ok(Math.abs(bisect((t) => t * t - 2, 0, 2) - Math.SQRT2) < 1e-12);
  assert.ok(Number.isNaN(bisect((t) => t * t + 1, -1, 1)));
});
