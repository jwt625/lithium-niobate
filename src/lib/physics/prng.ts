// Seeded PRNG for deterministic renders (no Math.random in physics; R11 sec. 4).
// Generator: xorshift128 (Marsaglia, J. Stat. Softw. 8(14), 2003, doi:10.18637/jss.v008.i14), 32-bit state x4.
// Seeding: the 32-bit seed is expanded into four nonzero words by a splitmix32-style integer hash (this file).

export interface Rng {
  /** Uniform in [0, 1), 32-bit resolution. */
  next(): number;
  /** Raw 32-bit unsigned integer. */
  nextU32(): number;
  /** Uniform in [a, b). */
  uniform(a: number, b: number): number;
  /** Standard normal (Box-Muller, cached second value). */
  normal(): number;
  /** Integer in [0, n). */
  int(n: number): number;
}

function mix32(z: number): number {
  z = (z + 0x9e3779b9) | 0;
  let t = z ^ (z >>> 16);
  t = Math.imul(t, 0x21f0aaad);
  t ^= t >>> 15;
  t = Math.imul(t, 0x735a2d97);
  t ^= t >>> 15;
  return t >>> 0;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const words: number[] = [];
  for (let i = 0; i < 4; i++) {
    s = mix32(s + i * 0x6d2b79f5);
    words.push(s === 0 ? 0x1234567 + i : s);
  }
  let [x, y, z, w] = words;
  let spare: number | null = null;
  const nextU32 = (): number => {
    const t = x ^ (x << 11);
    x = y;
    y = z;
    z = w;
    w = (w ^ (w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
    return w;
  };
  const next = (): number => nextU32() / 4294967296;
  return {
    next,
    nextU32,
    uniform: (a, b) => a + (b - a) * next(),
    int: (n) => Math.floor(next() * n),
    normal: () => {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return v;
      }
      let u1 = next();
      while (u1 <= 0) u1 = next();
      const u2 = next();
      const r = Math.sqrt(-2 * Math.log(u1));
      spare = r * Math.sin(2 * Math.PI * u2);
      return r * Math.cos(2 * Math.PI * u2);
    },
  };
}
