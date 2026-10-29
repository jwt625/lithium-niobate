// BABY mode book contract (DevLog-007 sec. 8): harness (src/lib/babies/runtime) <-> books (src/lib/babies/books/<slug>.ts).
// Book lanes use `import type` only.

export interface SceneHost {
  /** Square container owned by the scene. Logical coordinates 0..1000 on both axes (SVG viewBox or a dpr-scaled canvas). */
  el: HTMLElement;
  /** Seeded PRNG (mulberry32): same seed, same sequence. */
  rng: (seed: number) => () => number;
  /** prefers-reduced-motion: draw settled states, no idle motion; interactions jump to their end state. */
  reduced: boolean;
  /** Keep the runtime's frame loop running for `seconds` more (call on interaction). */
  wake: (seconds: number) => void;
  /** Index of the page shown immediately before in the same book, when this scene is mounted by an in-book page turn
   *  (prev / next / dot / hash / arrow / swipe); undefined for any other mount (fresh load, book change, home). */
  from?: number;
}
export interface Scene {
  /** Draw at t seconds since the page was shown; depends only on t and the scene's own interaction state. */
  frame(t: number): void;
  /** Seconds after which frame(t) stops changing without input (Infinity = idle loop). Reduced motion: frame(settle) once. */
  settle: number;
  destroy?(): void;
}
export interface BabyPage {
  /** Read-aloud text. The scene letters exactly this text, in the book's style. */
  text: string;
  /** Grown-up section href from site.ts, e.g. "/crystal/lattice/". */
  sec: string;
  /** Parent note (numbers with their repo source), shown on hover of the page's info marker. */
  note?: string;
  scene(host: SceneHost): Scene;
}
export interface BabyBook {
  slug: string; title: string; style: string; pages: BabyPage[];
  /** Optional CSS color of the screen around the stage; default: a theme-following neutral. */
  surround?: string;
}
