// Shared runtime for the 3D scenes: renderer in a fixed-size container, render on demand, visibility gating,
// reduced motion, pointer/keyboard rotation, TECH line-drawing look, statistics, disposal. three.js r169 (WebGL 2).
import * as THREE from "three";
import type { Mode, SceneStats } from "./types.ts";
import type { Palette } from "./palette.ts";

export interface StageOptions {
  dprCap?: number;
  reducedMotion?: boolean;
  label?: string;
}

type Loop = (now: number) => boolean; // return true to keep running

/** One WebGL canvas absolutely positioned inside a page-reserved box. Renders only when invalidated or animating. */
export class Stage {
  readonly container: HTMLElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  readonly scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  /** Custom frame (multi-viewport scenes); default renders scene with camera. */
  draw: (() => void) | null = null;
  /** Called after a resize with the new CSS size. */
  onResize: ((w: number, h: number) => void) | null = null;
  width = 0;
  height = 0;
  frames = 0;
  lastMs = 0;
  private loops = new Set<Loop>();
  private raf = 0;
  private dirty = true;
  private visible = true;
  private disposed = false;
  private forcedRM: boolean | undefined;
  private ro: ResizeObserver;
  private io: IntersectionObserver | null = null;
  private mq: MediaQueryList | null = null;
  private envs = new Map<string, THREE.Texture>();
  private cubeTargets: THREE.WebGLCubeRenderTarget[] = [];
  private dprCap: number;
  private acc = { calls: 0, triangles: 0, lines: 0, points: 0 };

  constructor(container: HTMLElement, opts: StageOptions = {}) {
    this.container = container;
    this.dprCap = opts.dprCap ?? 2;
    this.forcedRM = opts.reducedMotion;
    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.info.autoReset = false;
    this.canvas = this.renderer.domElement;
    Object.assign(this.canvas.style, { position: "absolute", left: "0", top: "0", width: "100%", height: "100%", display: "block", touchAction: "pan-y", outline: "none" });
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute("role", "img");
    if (opts.label) this.canvas.setAttribute("aria-label", opts.label);
    container.appendChild(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    this.ro = new ResizeObserver(() => this.size());
    this.ro.observe(container);
    if (typeof IntersectionObserver !== "undefined") {
      this.io = new IntersectionObserver((es) => {
        const v = es.some((e) => e.isIntersecting);
        if (v !== this.visible) { this.visible = v; if (v) this.kick(); }
      }, { rootMargin: "300px" });
      this.io.observe(container);
    }
    if (typeof matchMedia !== "undefined") {
      this.mq = matchMedia("(prefers-reduced-motion: reduce)");
    }
    document.addEventListener("visibilitychange", this.onVis);
    this.size();
  }

  /** Hidden tab: drop the pending frame (loops are kept and resume, time-based, when the tab shows again). */
  private onVis = (): void => {
    if (document.hidden) { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }
    else this.kick();
  };

  /** True when motion must be suppressed (option, OS preference, or <html data-fx="off">). */
  reducedMotion(): boolean {
    if (this.forcedRM !== undefined) return this.forcedRM;
    if (typeof document !== "undefined" && document.documentElement.dataset.fx === "off") return true;
    return !!this.mq?.matches;
  }

  size(): void {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h || (w === this.width && h === this.height)) return;
    this.width = w; this.height = h;
    this.renderer.setPixelRatio(Math.min(this.dprCap, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h, false);
    const cam = this.camera;
    if (cam instanceof THREE.PerspectiveCamera) { cam.aspect = w / h; cam.updateProjectionMatrix(); }
    this.onResize?.(w, h);
    this.invalidate();
  }

  /** Studio environment for reflections (PMREM of a procedural light room), one per theme, cached.
   *  Dark: near-black walls with a few emissive softboxes, so a high-index crystal shows crisp highlights (sparkle)
   *  instead of mirroring a grey room; light: pale walls. */
  environment(theme: "dark" | "light" = "dark"): THREE.Texture {
    const key = "env-" + theme;
    const hit = this.envs.get(key);
    if (hit) return hit;
    const pm = new THREE.PMREMGenerator(this.renderer);
    const room = studioScene(theme, "room");
    const tex = pm.fromScene(room, 0.03).texture;
    room.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
    pm.dispose();
    this.envs.set(key, tex);
    return tex;
  }

  /** HDR cube map of the same studio room (for refraction in the LN crystal shader), one per theme, cached. */
  envCube(theme: "dark" | "light" = "dark"): THREE.CubeTexture {
    const key = "cube-" + theme;
    const hit = this.envs.get(key);
    if (hit) return hit as THREE.CubeTexture;
    const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    const room = studioScene(theme, "tent");
    const cc = new THREE.CubeCamera(0.1, 100, rt);
    room.add(cc);
    cc.update(this.renderer, room);
    room.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); const mm = m.material as THREE.MeshBasicMaterial; mm.map?.dispose(); mm.dispose(); } });
    const tex = rt.texture;
    this.envs.set(key, tex);
    this.cubeTargets.push(rt);
    return tex;
  }

  invalidate(): void { this.dirty = true; this.kick(); }

  /** Run fn every frame until it returns false (ignored while reduced motion is on: fn is called once). */
  animate(fn: Loop): void {
    if (this.reducedMotion()) { fn(performance.now()); this.invalidate(); return; }
    this.loops.add(fn); this.kick();
  }
  stopAnimations(): void { this.loops.clear(); }
  get animating(): boolean { return this.loops.size > 0; }

  private kick(): void {
    if (this.raf || this.disposed || !this.visible || document.hidden) return;
    if (!this.dirty && !this.loops.size) return;
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  private frame(now: number): void {
    this.raf = 0;
    if (this.disposed) return;
    for (const fn of [...this.loops]) if (!fn(now)) this.loops.delete(fn);
    this.renderNow();
    if (this.loops.size) this.kick();
  }

  /** Render one frame synchronously. */
  renderNow(): void {
    if (this.disposed || !this.width) return;
    this.dirty = false;
    const t0 = performance.now();
    this.renderer.info.reset();
    if (this.draw) this.draw(); else this.renderer.render(this.scene, this.camera);
    const r = this.renderer.info.render;
    this.acc = { calls: r.calls, triangles: r.triangles, lines: r.lines, points: r.points };
    this.lastMs = performance.now() - t0;
    this.frames++;
  }

  stats(): SceneStats {
    const m = this.renderer.info.memory, pr = this.renderer.info.programs;
    let transmissive = 0;
    this.scene.traverseVisible((o) => { const mm = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined; if ((o as THREE.Mesh).isMesh && mm && (mm as THREE.MeshPhysicalMaterial).transmission > 0) transmissive++; });
    return {
      triangles: this.acc.triangles, calls: this.acc.calls, lines: this.acc.lines, points: this.acc.points, frameMs: this.lastMs, frames: this.frames,
      geometries: m.geometries, textures: m.textures, programs: pr ? pr.length : 0, width: this.width, height: this.height,
      dpr: this.renderer.getPixelRatio(), transmissive,
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.loops.clear();
    this.ro.disconnect(); this.io?.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    disposeTree(this.scene);
    this.envs.forEach((t) => t.dispose());
    this.cubeTargets.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}

/** Procedural light room (units arbitrary, room 20 wide).
 *  "room": reflections for opaque parts (dark walls in the dark theme, so metals do not turn near-white, R13 lesson).
 *  "tent": refraction environment for the LN crystal: a bright-field light tent with two black flags (glass-photography
 *  practice: the flags draw the edges) and small bright sources (sparkle and dispersion fire). The tent lights the
 *  crystal only; the page field stays the visible background. */
function studioScene(theme: "dark" | "light", kind: "room" | "tent"): THREE.Scene {
  const s = new THREE.Scene();
  const tent = kind === "tent", dk = theme === "dark";
  const wall = tent ? 0.42 : dk ? 0.11 : 0.62;
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(wall, wall, wall * 1.04), side: THREE.BackSide }));
  room.position.y = 3; s.add(room);
  const panel = (w: number, h: number, I: number, x: number, y: number, z: number, rx: number, ry: number, warm = 1): void => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(I, I * (0.97 + 0.03 * warm), I * (0.92 + 0.08 * warm)), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
  };
  panel(8, 5, dk ? 4 : 3, 0, 8.9, 0, Math.PI / 2, 0); // top softbox
  panel(15, 8, tent ? 1.4 : dk ? 1.6 : 2.2, 0, 3.5, -9.9, 0, 0); // large back light
  panel(1.2, 7, 7, -9.9, 3, -2, 0, Math.PI / 2, 0.6); // left strip (cool)
  panel(1.2, 7, 4, 9.9, 3, 3, 0, -Math.PI / 2); // right strip
  if (tent) { panel(2.2, 11, 0, -6, 3, -9.85, 0, 0); panel(2.2, 11, 0, 6.5, 3, 9.85, 0, Math.PI); panel(20, 2.5, 0.02, 0, -1.6, -9.85, 0, 0); } // black flags
  for (const [x, y, z, ry] of [[4.5, 6.5, -9.8, 0], [-6, 1.5, -9.8, 0], [9.8, 6, -5, -Math.PI / 2], [-9.8, 6.5, 5, Math.PI / 2], [-3, 6, 9.9, Math.PI], [5, 2, 9.9, Math.PI]] as const)
    panel(0.9, 0.9, 18, x, y, z, 0, ry); // small bright sources
  const fl = tent ? 0.75 : dk ? 0.09 : 0.5;
  const fm = new THREE.MeshBasicMaterial({ color: new THREE.Color(fl, fl * 1.0, fl * 1.03) });
  if (tent && typeof document !== "undefined") { fm.map = latticeTexture(); fm.map.repeat.set(6, 6); }
  const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), fm);
  f.rotation.x = -Math.PI / 2; f.position.y = -2.9; s.add(f);
  if (tent) for (let i = 0; i < 7; i++) panel(0.35, 12, i % 2 ? 0 : 2.5, -9.85, 3, -8 + i * 2.6, 0, Math.PI / 2); // blinds: bright / dark bands
  return s;
}

/** Triangular dot lattice on white (3m ornament rule, R12): the light-table floor of the refraction tent. */
function latticeTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas"), N = 256;
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, N, N);
  g.fillStyle = "#101010";
  const a = N / 4, h = (a * Math.sqrt(3)) / 2;
  for (let j = -1; j * h < N + h; j++) for (let i = -1; i * a < N + a; i++) { g.beginPath(); g.arc(i * a + (j % 2 ? a / 2 : 0), j * h, 7, 0, 2 * Math.PI); g.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Dispose geometries, materials and their textures under root. */
export function disposeTree(root: THREE.Object3D): void {
  const mats = new Set<THREE.Material>(), geos = new Set<THREE.BufferGeometry>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) geos.add(m.geometry);
    const mm = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mm)) mm.forEach((x) => mats.add(x)); else if (mm) mats.add(mm);
    const tm = o.userData.visMat as THREE.Material | undefined;
    if (tm) mats.add(tm);
  });
  geos.forEach((g) => g.dispose());
  mats.forEach((m) => {
    for (const v of Object.values(m)) if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
    const u = (m as THREE.ShaderMaterial).uniforms;
    if (u) for (const k in u) { const v = u[k].value; if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose(); }
    m.dispose();
  });
}

export interface RotateHandlers {
  rotate: (dx: number, dy: number) => void; // radians
  zoom?: (factor: number) => void;
  end?: () => void;
}

/** Drag to rotate (mouse: both axes; touch: horizontal only, vertical scrolls the page), arrow keys, +/- zoom,
 *  wheel zoom only while the canvas has focus (no scroll hijack). Returns the detach function. */
export function attachRotate(stage: Stage, h: RotateHandlers): () => void {
  const el = stage.canvas;
  let id = -1, x = 0, y = 0, touch = false;
  const down = (e: PointerEvent): void => {
    id = e.pointerId; x = e.clientX; y = e.clientY; touch = e.pointerType === "touch";
    el.setPointerCapture(id);
  };
  const move = (e: PointerEvent): void => {
    if (e.pointerId !== id) return;
    const s = Math.PI / Math.max(240, Math.min(stage.width, stage.height));
    const dx = (e.clientX - x) * s, dy = touch ? 0 : (e.clientY - y) * s;
    x = e.clientX; y = e.clientY;
    if (dx || dy) h.rotate(dx, dy);
  };
  const up = (e: PointerEvent): void => { if (e.pointerId === id) { id = -1; h.end?.(); } };
  const key = (e: KeyboardEvent): void => {
    const st = Math.PI / 18;
    const m: Record<string, [number, number] | number> = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st], "+": 0.85, "=": 0.85, "-": 1 / 0.85 };
    const v = m[e.key];
    if (v === undefined) return;
    e.preventDefault();
    if (typeof v === "number") h.zoom?.(v); else h.rotate(v[0], v[1]);
    h.end?.();
  };
  const wheel = (e: WheelEvent): void => {
    if (document.activeElement !== el || !h.zoom) return;
    e.preventDefault();
    h.zoom(Math.exp(e.deltaY * 0.0015));
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("keydown", key);
  el.addEventListener("wheel", wheel, { passive: false });
  return () => {
    el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    el.removeEventListener("keydown", key); el.removeEventListener("wheel", wheel);
  };
}

/** Apply or remove the TECH look under root: every mesh flat in the card colour with crease edges in the text colour;
 *  objects with userData.techHide are hidden; lines and points take the secondary text colour. */
export function applyModeLook(root: THREE.Object3D, mode: Mode, pal: Palette): void {
  const flat = (root.userData.techFlat as THREE.MeshBasicMaterial | undefined) ?? new THREE.MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const edgeM = (root.userData.techEdge as THREE.LineBasicMaterial | undefined) ?? new THREE.LineBasicMaterial();
  root.userData.techFlat = flat; root.userData.techEdge = edgeM;
  flat.color.set(pal.ink1); edgeM.color.set(pal.text2);
  const tech = mode === "tech";
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh && !o.userData.isTechEdge) meshes.push(o as THREE.Mesh); });
  for (const m of meshes) {
    if (m.userData.techHide) { if (tech) { m.userData.visBefore ??= m.visible; m.visible = false; } else if (m.userData.visBefore !== undefined) { m.visible = m.userData.visBefore; delete m.userData.visBefore; } continue; }
    if (tech) {
      if (!m.userData.visMat) { m.userData.visMat = m.material; m.material = flat; }
      if (!m.userData.edges && !(m as THREE.InstancedMesh).isInstancedMesh) {
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 25), edgeM);
        e.userData.isTechEdge = true; e.raycast = () => {};
        m.add(e); m.userData.edges = e;
      }
      if (m.userData.edges) (m.userData.edges as THREE.Object3D).visible = true;
    } else {
      if (m.userData.visMat) { m.material = m.userData.visMat as THREE.Material; delete m.userData.visMat; }
      if (m.userData.edges) (m.userData.edges as THREE.Object3D).visible = false;
    }
  }
}

/** Ease used for transitions (DevLog-003b sec. 6: cubic-bezier(0.2, 0.7, 0.2, 1) approximated). */
export function ease(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

/** Text sprite for an axis label (labels with units are the only text allowed in scenes, DevLog-003b sec. 5). */
export function labelSprite(text: string, color: string, px = 40): THREE.Sprite {
  const c = document.createElement("canvas"), g = c.getContext("2d")!;
  const font = `500 ${px}px Inter, "Helvetica Neue", Arial, sans-serif`;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 8, h = Math.ceil(px * 1.25);
  c.width = w; c.height = h;
  g.font = font; g.fillStyle = color; g.textBaseline = "middle"; g.fillText(text, 4, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false }));
  s.userData.aspect = w / h;
  s.renderOrder = 10;
  return s;
}

/** Crystal-axis gizmo: three arrows (Z = polar c axis in the accent colour) with X, Y, Z labels. setBasis takes the
 *  crystal axes as world directions (columns of m). Rendered with depthTest off so it is never hidden. */
export class AxisGizmo {
  readonly group = new THREE.Group();
  private parts: { arrow: THREE.ArrowHelper; label: THREE.Sprite }[] = [];
  private len: number;
  constructor(pal: Palette, len: number) {
    this.len = len;
    this.build(pal);
  }
  build(pal: Palette): void {
    this.clear();
    (["X", "Y", "Z"] as const).forEach((name) => {
      const col = name === "Z" ? pal.acc : pal.text2;
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), this.len, new THREE.Color(col).getHex(), this.len * 0.24, this.len * 0.13);
      for (const m of [arrow.line.material as THREE.Material, arrow.cone.material as THREE.Material]) { m.toneMapped = false; m.depthTest = false; }
      arrow.renderOrder = 9;
      const label = labelSprite(name, col, 44);
      const h = this.len * 0.3;
      label.scale.set(h * (label.userData.aspect as number), h, 1);
      arrow.userData.techHide = false;
      this.group.add(arrow, label);
      this.parts.push({ arrow, label });
    });
  }
  setBasis(m: THREE.Matrix4): void {
    this.parts.forEach((p, k) => {
      const d = new THREE.Vector3().setFromMatrixColumn(m, k).normalize();
      p.arrow.setDirection(d);
      p.label.position.copy(d).multiplyScalar(this.len * 1.3);
    });
  }
  clear(): void {
    for (const p of this.parts) {
      this.group.remove(p.arrow, p.label);
      p.arrow.dispose();
      (p.label.material as THREE.SpriteMaterial).map?.dispose();
      p.label.material.dispose();
    }
    this.parts = [];
  }
}
