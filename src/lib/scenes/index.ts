// VISUAL 3D scenes: lazy entry points (each scene is its own chunk with three.js) and shared types.
// Contract and rules: ./types.ts. Dimensions with provenance: assets3d/*.toml -> ./generated/scene-data.ts
// (rebuild: uv run assets3d/build_scene_data.py). Tests: node --test src/lib/scenes/optics/thinfilm.test.ts
// src/lib/scenes/process/model.test.ts.
//
// Usage from a page (container must have a reserved size):
//   const { mount } = await scenes["lnoi-stack"]();
//   const s = mount(el, { theme: "dark", state: { filmNm: 600 }, onInfo: (i) => render readouts from i });
//   ... s.setState({ viewDeg: 50 }); s.setMode("tech"); s.setTheme(); s.dispose();
export type { Mode, Theme, PDim, SceneStats, MountOptions, SceneHandle } from "./types.ts";
export type { CrystalState, CrystalInfo, CrystalView } from "./crystal-in-hand.ts";
export type { LnoiState, LnoiInfo } from "./lnoi-stack.ts";
export type { MzmState, MzmInfo } from "./mzm-die.ts";
export type { ProcessState, ProcessInfo } from "./process/process-viewer.ts";
export type { Hud, HudParam, ProcState, Route } from "./process/model.ts";
// pure, three-free helpers (safe to import eagerly, e.g. for TECH readouts or build-time HUD text)
export { routeSteps, hud, evaluate, fieldLayout, stateHash } from "./process/model.ts";
export { spectrum, colorOf, hexOf, luminousR } from "./optics/thinfilm.ts";

export const scenes = {
  "crystal-in-hand": () => import("./crystal-in-hand.ts"),
  "lnoi-stack": () => import("./lnoi-stack.ts"),
  "mzm-die": () => import("./mzm-die.ts"),
  "process-viewer": () => import("./process/process-viewer.ts"),
} as const;
export type SceneId = keyof typeof scenes;
