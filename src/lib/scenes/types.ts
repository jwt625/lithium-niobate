// Scene contract shared by every VISUAL 3D scene in this folder (framework-agnostic; three.js r169 WebGL).
//
//   const scene = mount(container, opts)     // container: a fixed-size box the page reserves (CSS aspect-ratio or height)
//   scene.setState({ ... })                  // partial update; renders on demand (one frame), never resizes the container
//   scene.setMode("visual" | "tech")         // tech = static monochrome line drawing, no motion, no transmission
//   scene.setTheme("dark" | "light")         // omit the argument to re-read <html data-theme>
//   scene.getState(), scene.getInfo()        // current state; sourced numbers and readout data for the page lane
//   scene.getStats()                         // triangles, draw calls, last frame CPU time, frames rendered
//   scene.dispose()                          // removes the canvas, frees GPU resources, disconnects observers
//
// Rules (DevLog-004, R05 B9/B10): render on demand (0 idle frames); IntersectionObserver gating; DPR cap 2;
// prefers-reduced-motion or <html data-fx="off"> disables transitions and travelling-light motion (state still applies);
// the canvas is absolutely positioned inside the container, so nothing in the page moves or resizes.

export type Mode = "visual" | "tech";
export type Theme = "dark" | "light";
export type Status = "reported" | "derived" | "template" | "na";

/** A provenance-tagged value (process-flow.yaml PDim vocabulary). */
export interface PDim {
  value: unknown;
  unit: string;
  status: Status | string;
  source?: string;
  locator?: string;
  analog?: boolean;
  note?: string;
  formula?: string;
}

export interface SceneStats {
  triangles: number;
  calls: number;
  lines: number;
  points: number;
  frameMs: number; // CPU time of the last render call (ms); GPU time is not observable without a timer query
  frames: number; // frames rendered since mount (render-on-demand check: stays constant while idle)
  geometries: number;
  textures: number;
  programs: number;
  width: number;
  height: number;
  dpr: number;
  transmissive: number; // meshes with transmission > 0 currently visible
}

export interface MountOptions<S> {
  mode?: Mode;
  theme?: Theme;
  state?: Partial<S>;
  /** Force reduced motion on or off; default follows prefers-reduced-motion and <html data-fx>. */
  reducedMotion?: boolean;
  /** Device-pixel-ratio cap (default 2, R05 B9). */
  dprCap?: number;
  /** Called after state or derived info changes (not per animation frame). */
  onInfo?: (info: unknown) => void;
  /** Base URL for runtime data files (default "/data/"), e.g. linbo3-cell.json, eo-overlap-li2026aa.json. */
  dataBase?: string;
  /** Label for the canvas (aria-label); the page supplies the caption and fallback text. */
  label?: string;
}

export interface SceneHandle<S, I> {
  setState(partial: Partial<S>): void;
  getState(): Readonly<S>;
  setMode(mode: Mode): void;
  setTheme(theme?: Theme): void;
  getInfo(): I;
  getStats(): SceneStats;
  /** Render one frame now (synchronously), e.g. before a screenshot. */
  renderNow(): void;
  dispose(): void;
}
