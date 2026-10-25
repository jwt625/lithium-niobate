// Crystal in hand: a Czochralski LN boule and a wafer cut from it, picked up and turned, with a zoom into the R3c
// lattice. Geometry from assets3d/crystal.toml (generated DIMS.crystal); lattice from static/data/linbo3-cell.json
// (Hsu et al. 1997, COD 2101845, scripts/gen_cell.py). Units: mm for the boule and wafer, Angstrom inside the lattice.
//
// Crystal frame (IEEE 176-1987, src/lib/physics README): x perpendicular to a mirror plane (= hexagonal a1 in the cell
// file), z polar (c). The boule axis is drawn along the wafer normal of the selected cut (template, see TOML).
import * as THREE from "three";
import { DIMS } from "./generated/scene-data.ts";
import { Stage, applyModeLook, attachRotate, ease, labelSprite } from "./core.ts";
import { lnCrystalMaterial, lnOptics } from "./materials.ts";
import type { LnOptics } from "./materials.ts";
import { documentTheme, palette } from "./palette.ts";
import type { Palette } from "./palette.ts";
import type { Mode, MountOptions, PDim, SceneHandle, Theme } from "./types.ts";

export type CrystalView = "boule" | "wafer" | "lattice";
export interface CrystalState {
  view: CrystalView;
  cut: "x" | "z";
  yaw: number; // rad, object rotation about the vertical
  pitch: number; // rad, object tilt toward the viewer
  zoom: number; // camera distance factor (1 = fit)
  axes: boolean; // crystal-axis gizmo
}
export interface CrystalInfo {
  state: CrystalState;
  dims: Record<string, PDim>;
  optics: LnOptics;
  lattice: { loaded: boolean; atoms: number; a_A: number | null; c_A: number | null };
}

const D = DIMS.crystal;
const num = (d: { value: unknown }): number => d.value as number;
const DEF: CrystalState = { view: "boule", cut: "x", yaw: -0.55, pitch: 0.18, zoom: 1, axes: true };

interface CellJson {
  cell: { a_A: number; c_A: number; matrix_columns_a1_a2_c: [number, number, number][] };
  atoms: { el: string; frac: [number, number, number]; octahedron_O_cart: [number, number, number][] }[];
}

/** Columns = crystal X, Y, Z expressed in the holder frame (boule axis = holder +Y = wafer normal). */
function crystalBasis(cut: "x" | "z"): THREE.Matrix4 {
  const m = new THREE.Matrix4();
  if (cut === "z") m.makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0));
  else m.makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
  return m;
}

function bouleGeometry(): { geo: THREE.LatheGeometry; height: number } {
  const R = num(D.boule.body_diameter) / 2, L = num(D.boule.body_length);
  const rs = num(D.boule.seed_diameter) / 2, ls = num(D.boule.seed_length), rt = num(D.boule.tail_end_diameter) / 2;
  const ts = Math.tan((num(D.boule.shoulder_angle) * Math.PI) / 180), tt = Math.tan((num(D.boule.tail_angle) * Math.PI) / 180);
  const hTail = (R - rt) / tt, hSh = (R - rs) / ts, f = 2.2; // f: display fillet (mm) at the cone-body junctions
  const y0 = 3, y1 = y0 + hTail, y2 = y1 + L, y3 = y2 + hSh, y4 = y3 + ls;
  const P = [
    [0, 0], [rt * 0.55, 0.35], [rt * 0.9, 1.4], [rt, y0],
    [R - f * tt, y1 - f], [R - 0.25 * f, y1 - 0.2 * f], [R, y1 + f * 0.6],
    [R, y2 - f * 0.6], [R - 0.25 * f, y2 + 0.2 * f], [R - f * ts, y2 + f],
    [rs + 0.8, y3 - 0.8], [rs, y3 + 1.2], [rs, y4 - 0.6], [rs - 0.6, y4], [0, y4],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(P, num(D.boule.lathe_segments));
  geo.translate(0, -(y1 + L / 2), 0); // body centre at the origin
  return { geo, height: y4 };
}

function waferGeometry(cut: "x" | "z"): THREE.BufferGeometry {
  const R = num(D.wafer.diameter) / 2, t = num(D.wafer.thickness), n = num(D.wafer.edge_segments);
  const flatDir = cut === "x" ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, -1); // holder-frame direction of the flat normal
  const a1 = Math.atan2(-flatDir.z, flatDir.x); // angle in the shape plane (shape x = holder x, shape y = -holder z)
  const a2 = a1 + (num(D.wafer.secondary_flat_angle) * Math.PI) / 180;
  const h1 = Math.asin(num(D.wafer.primary_flat_length) / (2 * R)), h2 = Math.asin(num(D.wafer.secondary_flat_length) / (2 * R));
  const inFlat = (a: number, c: number, h: number): boolean => { const d = Math.atan2(Math.sin(a - c), Math.cos(a - c)); return Math.abs(d) < h; };
  const shape = new THREE.Shape(), pts: THREE.Vector2[] = [];
  const push = (a: number): void => { pts.push(new THREE.Vector2(R * Math.cos(a), R * Math.sin(a))); };
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    if (inFlat(a, a1, h1) || inFlat(a, a2, h2)) continue;
    push(a);
  }
  [[a1, h1], [a2, h2]].forEach(([c, h]) => { push(c - h); push(c + h); });
  pts.sort((p, q) => Math.atan2(p.y, p.x) - Math.atan2(q.y, q.x));
  shape.setFromPoints(pts);
  const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2); // extrusion along holder +Y; shape y -> holder -z
  g.translate(0, -t / 2, 0);
  return g;
}

function backdropTexture(pal: Palette): THREE.CanvasTexture {
  // soft-lit cyclorama behind the specimen: a glow pool and one vertical softbox strip, fading into the stage colour at
  // the bottom. The crystal refracts and inverts it, which is what makes a transparent high-index body read as solid.
  const c = document.createElement("canvas"), W = 512, H = 320;
  c.width = W; c.height = H;
  const g = c.getContext("2d")!, dark = pal.theme === "dark";
  g.fillStyle = pal.ink0; g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W * 0.5, H * 0.62, 10, W * 0.5, H * 0.62, W * 0.55);
  r.addColorStop(0, dark ? "#4a5266" : "#ffffff"); r.addColorStop(1, dark ? pal.ink0 : pal.ink2);
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  const s = g.createLinearGradient(W * 0.62, 0, W * 0.74, 0);
  s.addColorStop(0, "rgba(255,250,236,0)"); s.addColorStop(0.5, dark ? "rgba(236,228,206,0.55)" : "rgba(255,255,255,0.9)"); s.addColorStop(1, "rgba(255,250,236,0)");
  g.fillStyle = s; g.fillRect(W * 0.62, H * 0.08, W * 0.12, H * 0.8);
  const b = g.createLinearGradient(0, H * 0.75, 0, H);
  b.addColorStop(0, "rgba(0,0,0,0)"); b.addColorStop(1, pal.ink1);
  g.fillStyle = b; g.fillRect(0, H * 0.75, W, H * 0.25);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stageTexture(pal: Palette): THREE.CanvasTexture {
  // triangular dot lattice (3m ornament rule, R12 sec. 3) on the card colour: what the crystal refracts
  const c = document.createElement("canvas"), N = 512;
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  g.fillStyle = pal.ink1; g.fillRect(0, 0, N, N);
  g.fillStyle = pal.line2;
  const s = N / 16, h = (s * Math.sqrt(3)) / 2;
  for (let j = 0; j * h < N + h; j++) for (let i = -1; i * s < N + s; i++) {
    const x = i * s + (j % 2 ? s / 2 : 0), y = j * h;
    g.beginPath(); g.arc(x, y, 2.2, 0, 2 * Math.PI); g.fill();
  }
  g.strokeStyle = pal.line; g.lineWidth = 1.5;
  for (let j = 0; j * h < N; j += 4) { g.beginPath(); g.moveTo(0, j * h); g.lineTo(N, j * h); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.anisotropy = 4;
  return t;
}

export function mount(container: HTMLElement, opts: MountOptions<CrystalState> = {}): SceneHandle<CrystalState, CrystalInfo> {
  const stage = new Stage(container, { dprCap: opts.dprCap, reducedMotion: opts.reducedMotion, label: opts.label ?? "Lithium niobate boule, wafer and lattice; drag to turn" });
  const state: CrystalState = { ...DEF, ...opts.state };
  let mode: Mode = opts.mode ?? "visual", theme: Theme = opts.theme ?? documentTheme(), pal = palette(theme);
  const S = stage.scene, cam = stage.camera as THREE.PerspectiveCamera;
  cam.fov = 28; cam.near = 5; cam.far = 4000; cam.updateProjectionMatrix();
  let env = stage.environment(theme);
  S.environment = env;

  // lights for the opaque parts (atoms, stage); the crystal itself is lit by the environment
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-300, 500, 400); S.add(key);
  S.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.6));

  // specimen stage under the crystal (opaque, so refraction has something to bend)
  const stageTexRef = { t: stageTexture(pal) };
  const floor = new THREE.Mesh(new THREE.CircleGeometry(520, 64), new THREE.MeshStandardMaterial({ map: stageTexRef.t, roughness: 0.9, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -175; S.add(floor);
  const backTexRef = { t: backdropTexture(pal) };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1125), new THREE.MeshBasicMaterial({ map: backTexRef.t, toneMapped: false }));
  back.position.set(0, -175 + 1125 / 2 - 20, -520); S.add(back);

  const holder = new THREE.Group(); S.add(holder); // rotated by the reader
  const oriented = new THREE.Group(); holder.add(oriented); // boule/wafer frame (boule axis = +Y)

  const op = lnOptics();
  const tint = D.look.tint.value as string, attD = num(D.look.attenuation_distance);
  const { geo: bouleGeo } = bouleGeometry();
  let cube = stage.envCube(theme);
  const bouleMat = lnCrystalMaterial({ env: cube, thickness: num(D.boule.body_diameter), tint, attenuationDistance: attD, cylinderRadius: num(D.boule.body_diameter) / 2 });
  const boule = new THREE.Mesh(bouleGeo, bouleMat); oriented.add(boule);
  const waferMat = lnCrystalMaterial({ env: cube, thickness: num(D.wafer.thickness), tint, attenuationDistance: attD, thin: true });
  let waferGeo = waferGeometry(state.cut);
  const wafer = new THREE.Mesh(waferGeo, waferMat); oriented.add(wafer);

  // crystal-axis gizmo (rotates with the crystal; sits beside it)
  const gizmo = new THREE.Group(); S.add(gizmo);
  const arrows: { dir: THREE.Vector3; mesh: THREE.ArrowHelper; label: THREE.Sprite; name: string }[] = [];
  function buildGizmo(): void {
    arrows.forEach((a) => { gizmo.remove(a.mesh); gizmo.remove(a.label); a.mesh.dispose(); (a.label.material as THREE.SpriteMaterial).map?.dispose(); a.label.material.dispose(); });
    arrows.length = 0;
    (["X", "Y", "Z"] as const).forEach((name, k) => {
      const col = name === "Z" ? pal.acc : pal.text2;
      const mesh = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 46, new THREE.Color(col).getHex(), 11, 6);
      (mesh.line.material as THREE.LineBasicMaterial).toneMapped = false; (mesh.cone.material as THREE.MeshBasicMaterial).toneMapped = false;
      const label = labelSprite(name, col, 44); label.scale.set(14 * label.userData.aspect, 14, 1);
      gizmo.add(mesh); gizmo.add(label);
      arrows.push({ dir: new THREE.Vector3().setFromMatrixColumn(new THREE.Matrix4(), k), mesh, label, name });
    });
  }
  buildGizmo();

  // lattice (loaded lazily)
  const lattice = new THREE.Group(); oriented.add(lattice); lattice.visible = false;
  let cellInfo: CrystalInfo["lattice"] = { loaded: false, atoms: 0, a_A: null, c_A: null };
  const LAT_SCALE = 11; // mm per Angstrom on screen (display)
  const latticeMats: THREE.Material[] = [];
  async function loadLattice(): Promise<void> {
    if (cellInfo.loaded) return;
    const url = (opts.dataBase ?? "/data/") + "linbo3-cell.json";
    const J = (await (await fetch(url)).json()) as CellJson;
    const [A1, A2, C] = J.cell.matrix_columns_a1_a2_c;
    const cart = (f: number[]): THREE.Vector3 => new THREE.Vector3(f[0] * A1[0] + f[1] * A2[0] + f[2] * C[0], f[0] * A1[1] + f[1] * A2[1] + f[2] * C[1], f[0] * A1[2] + f[1] * A2[2] + f[2] * C[2]);
    const [nx, ny, nz] = D.lattice.block.value as unknown as number[], tol = 0.005;
    const pos: Record<string, THREE.Vector3[]> = { Nb: [], Li: [], O: [] };
    const nbOcts: THREE.Vector3[][] = [];
    for (const a of J.atoms) for (let i = -1; i <= nx; i++) for (let j = -1; j <= ny; j++) for (let k = -1; k <= nz; k++) {
      const f = [a.frac[0] + i, a.frac[1] + j, a.frac[2] + k];
      if (f[0] < -tol || f[0] > nx + tol || f[1] < -tol || f[1] > ny + tol || f[2] < -tol || f[2] > nz + tol) continue;
      const p = cart(f); pos[a.el]?.push(p);
      if (a.el === "Nb" && f[0] < nx - tol && f[1] < ny - tol && f[2] < nz - tol) {
        const sh = cart([i, j, k]);
        nbOcts.push(a.octahedron_O_cart.map((q) => new THREE.Vector3(q[0] + sh.x, q[1] + sh.y, q[2] + sh.z)));
      }
    }
    const T = cart([nx / 2, ny / 2, nz / 2]);
    const inner = new THREE.Group(); inner.position.copy(T).multiplyScalar(-1); // centre the block
    const colors: Record<string, string> = { Nb: "#8fb4ff", Li: pal.au, O: theme === "light" ? "#c2402c" : "#e5664f" };
    const radius: Record<string, number> = { Nb: num(D.lattice.radius_Nb), Li: num(D.lattice.radius_Li), O: num(D.lattice.radius_O) };
    const sph = new THREE.IcosahedronGeometry(1, 2), m4 = new THREE.Matrix4();
    let count = 0;
    for (const el of ["Nb", "Li", "O"]) {
      const mat = new THREE.MeshStandardMaterial({ color: colors[el], roughness: 0.35, metalness: 0.05 });
      latticeMats.push(mat);
      const im = new THREE.InstancedMesh(sph, mat, pos[el].length);
      pos[el].forEach((p, i) => { m4.makeScale(radius[el], radius[el], radius[el]).setPosition(p); im.setMatrixAt(i, m4); });
      im.userData.el = el; inner.add(im); count += pos[el].length;
    }
    // Nb-O6 octahedra (convex hull of 6 O = 8 triangles: connect the two O3 triangles)
    const tri: number[] = [];
    for (const v of nbOcts) {
      const c0 = v.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / v.length);
      for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let d = b + 1; d < 6; d++) {
        const n = new THREE.Vector3().subVectors(v[b], v[a]).cross(new THREE.Vector3().subVectors(v[d], v[a]));
        let pos2 = 0, neg = 0;
        for (let k2 = 0; k2 < 6; k2++) { if (k2 === a || k2 === b || k2 === d) continue; const s = n.dot(new THREE.Vector3().subVectors(v[k2], v[a])); if (s > 1e-6) pos2++; else if (s < -1e-6) neg++; }
        if (pos2 && neg) continue;
        const out = n.dot(new THREE.Vector3().subVectors(c0, v[a])) < 0;
        const order = out ? [a, b, d] : [a, d, b];
        order.forEach((q) => tri.push(v[q].x, v[q].y, v[q].z));
      }
    }
    const og = new THREE.BufferGeometry(); og.setAttribute("position", new THREE.Float32BufferAttribute(tri, 3)); og.computeVertexNormals();
    const om = new THREE.MeshStandardMaterial({ color: "#8fb4ff", transparent: true, opacity: 0.22, roughness: 0.5, depthWrite: false, side: THREE.DoubleSide });
    latticeMats.push(om);
    const octMesh = new THREE.Mesh(og, om); octMesh.renderOrder = 2; inner.add(octMesh);
    // cell edges
    const e: number[] = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const sq = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      sq.forEach(([x, y], q) => { const [x2, y2] = sq[(q + 1) % 4]; for (const z of [0, nz]) { const p = cart([x, y, z]), r = cart([x2, y2, z]); e.push(p.x, p.y, p.z, r.x, r.y, r.z); } const p = cart([x, y, 0]), r = cart([x, y, nz]); e.push(p.x, p.y, p.z, r.x, r.y, r.z); });
    }
    const eg = new THREE.BufferGeometry(); eg.setAttribute("position", new THREE.Float32BufferAttribute(e, 3));
    const em = new THREE.LineBasicMaterial({ color: pal.text3, transparent: true, opacity: 0.8 }); latticeMats.push(em);
    inner.add(new THREE.LineSegments(eg, em));
    // lattice coordinates are the crystal frame: map crystal -> holder with the cut basis
    const fr = new THREE.Group(); fr.add(inner); fr.userData.isFrame = true;
    lattice.add(fr);
    lattice.scale.setScalar(LAT_SCALE);
    cellInfo = { loaded: true, atoms: count, a_A: J.cell.a_A, c_A: J.cell.c_A };
    applyCut(); layout(); applyMode(); stage.invalidate(); emit();
  }

  // ---- state application
  let viewMix = { boule: 1, wafer: 0, lattice: 0 }; // 0..1 presence per view (eased)
  let target = { ...viewMix };
  function applyCut(): void {
    const B = crystalBasis(state.cut);
    lattice.children.forEach((c) => { if (c.userData.isFrame) { c.matrixAutoUpdate = false; c.matrix.copy(B); } });
    wafer.geometry.dispose(); waferGeo = waferGeometry(state.cut); wafer.geometry = waferGeo;
    if (mode === "tech" && wafer.userData.edges) { wafer.remove(wafer.userData.edges); (wafer.userData.edges as THREE.LineSegments).geometry.dispose(); delete wafer.userData.edges; applyModeLook(S, mode, pal); }
  }
  function frameCamera(): void {
    const r = 175 / state.zoom, dist = r / Math.sin(((cam.fov / 2) * Math.PI) / 180) / Math.min(1, cam.aspect);
    const el = 0.32;
    cam.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
    cam.lookAt(0, -8, 0);
  }
  function layout(): void {
    holder.rotation.set(state.pitch, state.yaw, 0, "XYZ");
    const vb = viewMix.boule, vw = viewMix.wafer, vl = viewMix.lattice;
    // boule: visible in boule view, slides up and out toward the wafer view
    boule.visible = vb > 0.01 && vl < 0.99;
    boule.position.set(-150 * vw, 140 * vw, 0);
    boule.scale.setScalar(Math.max(0.001, (1 - 0.45 * vw) * (1 - 0.9 * vl)));
    // wafer: emerges from the body centre and turns face-up toward the viewer
    wafer.visible = vw > 0.01;
    wafer.position.set(0, 0, 0);
    wafer.rotation.set(0.95 * vw, 0, 0);
    wafer.scale.setScalar(Math.max(0.001, 0.75 + 0.35 * vw));
    // lattice grows from the crystal centre
    lattice.visible = vl > 0.01 && cellInfo.loaded;
    lattice.scale.setScalar(LAT_SCALE * Math.max(0.001, vl));
    // gizmo: beside the specimen, orientation = holder frame of the crystal axes
    gizmo.visible = state.axes;
    const q = new THREE.Quaternion().setFromEuler(holder.rotation), B = crystalBasis(state.cut);
    const qw = new THREE.Quaternion().setFromEuler(wafer.rotation);
    arrows.forEach((a, k) => {
      const d = new THREE.Vector3().setFromMatrixColumn(B, k);
      if (vw > 0.01 && vl < 0.5) d.applyQuaternion(qw);
      d.applyQuaternion(q).normalize();
      a.mesh.setDirection(d);
      a.label.position.copy(d).multiplyScalar(60);
    });
    gizmo.position.set(-150, -120, 60);
    frameCamera();
  }
  function goTo(view: CrystalView, animate: boolean): void {
    target = { boule: view === "boule" ? 1 : view === "lattice" ? 1 : 0, wafer: view === "wafer" ? 1 : 0, lattice: view === "lattice" ? 1 : 0 };
    if (view === "lattice") void loadLattice();
    if (!animate || stage.reducedMotion() || mode === "tech") { viewMix = { ...target }; layout(); stage.invalidate(); return; }
    const from = { ...viewMix }, t0 = performance.now(), dur = 600;
    stage.stopAnimations();
    stage.animate((now) => {
      const u = ease((now - t0) / dur);
      viewMix = { boule: from.boule + (target.boule - from.boule) * u, wafer: from.wafer + (target.wafer - from.wafer) * u, lattice: from.lattice + (target.lattice - from.lattice) * u };
      layout();
      return u < 1;
    });
  }

  function applyTheme(): void {
    pal = palette(theme);
    S.background = new THREE.Color(pal.ink0);
    env = stage.environment(theme); S.environment = env; cube = stage.envCube(theme);
    bouleMat.uniforms.envMap.value = cube; waferMat.uniforms.envMap.value = cube;
    backTexRef.t.dispose(); backTexRef.t = backdropTexture(pal);
    (back.material as THREE.MeshBasicMaterial).map = backTexRef.t; (back.material as THREE.MeshBasicMaterial).needsUpdate = true;
    stageTexRef.t.dispose();
    stageTexRef.t = stageTexture(pal);
    (floor.material as THREE.MeshStandardMaterial).map = stageTexRef.t; (floor.material as THREE.MeshStandardMaterial).needsUpdate = true;
    buildGizmo(); layout();
    applyMode();
  }
  function applyMode(): void {
    applyModeLook(S, mode, pal);
    floor.visible = mode === "visual"; back.visible = mode === "visual";
    S.background = new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink0);
    if (mode === "tech") stage.stopAnimations();
    stage.invalidate();
  }

  const detach = attachRotate(stage, {
    rotate: (dx, dy) => { state.yaw += dx; state.pitch = Math.max(-1.45, Math.min(1.45, state.pitch + dy)); layout(); stage.invalidate(); },
    zoom: (f) => { state.zoom = Math.max(0.6, Math.min(3, state.zoom / f)); layout(); stage.invalidate(); },
    end: () => emit(),
  });
  stage.onResize = () => layout();

  function info(): CrystalInfo {
    const dims: Record<string, PDim> = {};
    for (const [sec, rows] of Object.entries(D)) if (sec !== "meta") for (const [k, v] of Object.entries(rows as Record<string, PDim>)) dims[`${sec}.${k}`] = v;
    return { state: { ...state }, dims, optics: op, lattice: { ...cellInfo } };
  }
  function emit(): void { opts.onInfo?.(info()); }

  applyTheme();
  goTo(state.view, false);
  applyCut(); layout();
  stage.invalidate();

  return {
    setState(p) {
      const prevView = state.view, prevCut = state.cut;
      Object.assign(state, p);
      state.pitch = Math.max(-1.45, Math.min(1.45, state.pitch));
      state.zoom = Math.max(0.6, Math.min(3, state.zoom));
      if (state.cut !== prevCut) applyCut();
      if (state.view !== prevView) goTo(state.view, true); else layout();
      stage.invalidate(); emit();
    },
    getState: () => ({ ...state }),
    setMode(m) { mode = m; if (m === "tech") { viewMix = { ...target }; layout(); } applyMode(); },
    setTheme(t) { theme = t ?? documentTheme(); applyTheme(); if (cellInfo.loaded) { lattice.clear(); latticeMats.forEach((m) => m.dispose()); latticeMats.length = 0; cellInfo = { loaded: false, atoms: 0, a_A: null, c_A: null }; if (state.view === "lattice") void loadLattice(); } stage.invalidate(); },
    getInfo: info,
    getStats: () => stage.stats(),
    renderNow: () => stage.renderNow(),
    dispose() { detach(); stageTexRef.t.dispose(); backTexRef.t.dispose(); stage.dispose(); },
  };
}
