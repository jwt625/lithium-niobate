// Statistical self-checks for the seeded generator (uniform moments, normal moments, determinism).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "./prng.ts";

test("deterministic for a seed, different across seeds", () => {
  const a = createRng(42);
  const b = createRng(42);
  const c = createRng(43);
  const sa = Array.from({ length: 8 }, () => a.nextU32());
  const sb = Array.from({ length: 8 }, () => b.nextU32());
  const sc = Array.from({ length: 8 }, () => c.nextU32());
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  assert.ok(sa.every((x) => Number.isInteger(x) && x >= 0 && x < 2 ** 32));
});

test("uniform moments: mean 1/2, variance 1/12 (n = 2e5)", () => {
  const r = createRng(7);
  const n = 200000;
  let s = 0;
  let s2 = 0;
  for (let i = 0; i < n; i++) {
    const x = r.next();
    assert.ok(x >= 0 && x < 1);
    s += x;
    s2 += x * x;
  }
  const m = s / n;
  const v = s2 / n - m * m;
  assert.ok(Math.abs(m - 0.5) < 0.005, `mean ${m}`);
  assert.ok(Math.abs(v - 1 / 12) < 0.002, `var ${v}`);
});

test("normal moments: mean 0, variance 1 (n = 2e5)", () => {
  const r = createRng(11);
  const n = 200000;
  let s = 0;
  let s2 = 0;
  for (let i = 0; i < n; i++) {
    const x = r.normal();
    s += x;
    s2 += x * x;
  }
  assert.ok(Math.abs(s / n) < 0.01);
  assert.ok(Math.abs(s2 / n - 1) < 0.02);
});

test("int(n) covers [0, n)", () => {
  const r = createRng(3);
  const seen = new Set<number>();
  for (let i = 0; i < 1000; i++) seen.add(r.int(6));
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3, 4, 5]);
});
