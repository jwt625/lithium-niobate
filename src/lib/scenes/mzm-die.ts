// TFLN Mach-Zehnder modulator die (x-cut, G-S-G travelling-wave electrodes) from the eo-modulator-atlas geometry of
// device li2026aa-d (assets3d/mzm-die.toml, DIMS.mzm), with a linked cross-section inset (true um, optional vertical
// exaggeration) showing the optical mode |E_x|^2 from static/data/eo-overlap-li2026aa.json (atlas engine, 1550 nm TE).
// Light (1550 nm) is drawn in the declared false colour, always dashed (DevLog-003b sec. 3.1). When driven, pulses
// travel in slow motion together with the RF wave on the signal line (velocity match n_RF = n_g = 2.13, the paper's
// simulated design values); the output brightness follows T(V) = cos^2(pi V / (2 V_pi) + phi_b / 2) (physics/modulator.ts)
// with V_pi = 2.90 V (reported, li2026aa). Die layout outside the 9 mm CPW is template (TOML [layout]).
// World frame: x = propagation (die length), z = lateral, y = up. Units: um.
import * as THREE from "three";
import { DIMS } from "./generated/scene-data.ts";
import { Stage, applyModeLook, attachRotate, ease, labelSprite } from "./core.ts";
import { gold, silicon } from "./materials.ts";
import { documentTheme, palette } from "./palette.ts";
import type { Palette } from "./palette.ts";
import { mzmTransmission } from "../physics/modulator.ts";
import { colorOf, spectrum } from "./optics/thinfilm.ts";
import type { Mode, MountOptions, PDim, SceneHandle, Theme } from "./types.ts";

export interface MzmState {
  V: number; // drive voltage (V), push-pull
  biasRad: number; // static bias phase phi_b (rad); 0 = maximum transmission at V = 0
  driven: boolean; // pulses and RF wave travel (slow motion); off or reduced motion = steady light
  section: number; // cross-section position along the 9 mm electrodes, 0-1
  scale: "illustrative" | "true";
  yaw: number; // camera azimuth (rad)
  pitch: number; // camera elevation (rad)
  zoom: number;
  inset: boolean; // cross-section inset on/off
  /** Optional: optical phase difference (rad) at the RF crest, phi_b + pi Vpp / (2 Vpi) (trough: 2 phi_b - rfPhaseRad).
   *  When set, the travelling RF wave is shaded by the local T = cos^2(dphi/2), dphi = phi_b + (rfPhaseRad - phi_b) cos(RF
   *  phase); absent = the default gold wave. Visible only while pulses travel (driven). */
  rfPhaseRad?: number;
}
export interface MzmInfo {
  state: MzmState;
  T: number;
  vpi: number;
  phaseRad: number; // push-pull phase difference pi V / V_pi
  sectionMm: number;
  transitPs: number; // real optical transit time through the electrodes, L n_g / c
  dims: Record<string, PDim>;
  mode: { loaded: boolean; source: string; mirroredToLeftArm: boolean };
  notes: string[];
}

const D = DIMS.mzm;
const num = (d: { value: unknown }): number => d.value as number;
const CS = D.cross_section, LN_ = D.line, LY = D.layout;
const L_EL = num(LN_.electrode_length) * 1000, BEND = num(LY.bend_length), IO = num(LY.io_length);
const LEN = IO + BEND + L_EL + BEND + IO;
const OFF = num(CS.waveguide_offset), SIG = num(CS.signal_width), GAP = num(CS.gap), GND = num(CS.ground_width);
const VPI = num(LN_.vpi), NG = num(LN_.ng_opt);
const DEF: MzmState = { V: 0, biasRad: 0, driven: false, section: 0.5, scale: "illustrative", yaw: -0.62, pitch: 0.5, zoom: 1, inset: true };

interface Zmap { lat: (u: number) => number; dlat: (u: number) => number; box: number; ln: number; au: number; si: number }
/** Display maps for the current scale mix (0 illustrative, 1 true): piecewise-linear lateral map and layer factors. */
function zmap(mix: number): Zmap {
  const ve = LY.vertical_exaggeration.value as unknown as { box: number; ln: number; au: number };
  const le = LY.lateral_exaggeration.value as unknown as { core: number; outer: number; core_half_width: number };
  const m = (a: number): number => a + (1 - a) * mix;
  const kc = m(le.core), ko = m(le.outer), c = le.core_half_width;
  const lat = (u: number): number => { const a = Math.abs(u); return Math.sign(u) * (a <= c ? a * kc : c * kc + (a - c) * ko); };
  const dlat = (u: number): number => (Math.abs(u) <= c ? kc : ko);
  return { lat, dlat, box: m(ve.box), ln: m(ve.ln), au: m(ve.au), si: 1 };
}

/** Waveguide centre lines (lateral um relative to the signal centre) as functions of x along the die (um). */
function armLat(x: number, sign: number): number {
  const x1 = IO, x2 = IO + BEND, x3 = IO + BEND + L_EL, x4 = x3 + BEND;
  const sc = (u: number): number => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
  if (x <= x1 || x >= x4) return 0;
  if (x < x2) return sign * OFF * sc((x - x1) / BEND);
  if (x <= x3) return sign * OFF;
  return sign * OFF * sc(1 - (x - x3) / BEND);
}

/** Rectangular-section ribbon along a polyline in the x-z plane (top and two sides). */
function ribbon(pts: THREE.Vector2[], width: number, y0: number, h: number): THREE.BufferGeometry {
  const P: number[] = [], idx: number[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const t = new THREE.Vector2(b.x - a.x, b.y - a.y).normalize(), nx = -t.y, nz = t.x, p = pts[i];
    const l = [p.x + (nx * width) / 2, p.y + (nz * width) / 2], r = [p.x - (nx * width) / 2, p.y - (nz * width) / 2];
    P.push(l[0], y0 + h, l[1], r[0], y0 + h, r[1], l[0], y0, l[1], r[0], y0, r[1]);
  }
  for (let i = 0; i < n - 1; i++) {
    const a = 4 * i, b = 4 * (i + 1);
    idx.push(a, b, a + 1, a + 1, b, b + 1); // top
    idx.push(a + 2, b + 2, a, a, b + 2, b); // side l
    idx.push(a + 1, b + 1, a + 3, a + 3, b + 1, b + 3); // side r
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function lightMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, phase: { value: 0 }, T: { value: 1 }, driven: { value: 0 }, spacing: { value: 0.18 }, width: { value: 0.022 }, dash: { value: 260 }, s1: { value: 0 }, s2: { value: 1 }, len: { value: LEN } },
    transparent: true, depthWrite: false, toneMapped: false,
    vertexShader: /* glsl */ `attribute float s; varying float vs; void main() { vs = s; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 col; uniform float phase; uniform float T; uniform float driven; uniform float spacing; uniform float width; uniform float dash; uniform float s1; uniform float s2; uniform float len;
      varying float vs;
      void main() {
        float I = vs < s1 ? 1.0 : (vs < s2 ? 0.5 : T);
        float b = 0.85;
        if (driven > 0.5) {
          float d = mod(phase - vs, spacing); d = min(d, spacing - d);
          b = 0.18 + 0.82 * exp(-(d * d) / (width * width));
        }
        float on = step(fract(vs * len / dash), 0.62); // dashed: infrared marks are never solid
        float a = clamp(I * b * mix(0.25, 1.0, on) * 1.15, 0.0, 1.0);
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  });
}

function rfMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, phase: { value: 0 }, spacing: { value: 0.18 }, amp: { value: 0 }, sA: { value: 0 }, sB: { value: 1 }, useT: { value: 0 }, phiB: { value: 0 }, phA: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 col; uniform float phase; uniform float spacing; uniform float amp; uniform float sA; uniform float sB;
      uniform float useT; uniform float phiB; uniform float phA; varying vec2 vUv;
      void main() {
        float s = mix(sA, sB, vUv.x);
        float wv = cos(6.2831853 * (s - phase) / spacing); // RF wave, crest on each optical pulse
        float w = 0.5 + 0.5 * wv;
        float a = amp * pow(w, 3.0) * 0.55;
        vec3 c = col;
        if (useT > 0.5) { // local transmission under the RF voltage at this point: T = cos^2(dphi / 2)
          float Tl = cos(0.5 * (phiB + phA * wv)); Tl *= Tl;
          a = amp * (0.3 + 0.7 * w) * 0.55;
          c = col * mix(0.15, 1.0, Tl);
        }
        gl_FragColor = vec4(c * a, a);
        #include <colorspace_fragment>
      }`,
  });
}

interface ModeField { nx: number; ny: number; dx: number; x0: number; y1: number; I: Float32Array; max: number }

export function mount(container: HTMLElement, opts: MountOptions<MzmState> = {}): SceneHandle<MzmState, MzmInfo> {
  const stage = new Stage(container, { dprCap: opts.dprCap, reducedMotion: opts.reducedMotion, label: opts.label ?? "Thin-film lithium niobate Mach-Zehnder modulator die with a linked cross-section; drag to orbit" });
  const state: MzmState = { ...DEF, ...opts.state };
  let mode: Mode = opts.mode ?? "visual", theme: Theme = opts.theme ?? documentTheme(), pal: Palette = palette(theme);
  const S = stage.scene, cam = stage.camera as THREE.PerspectiveCamera;
  cam.fov = 30; cam.near = 20; cam.far = 200000; cam.updateProjectionMatrix();
  S.environment = stage.environment(theme);
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-3000, 9000, 5000); S.add(key);
  S.add(new THREE.HemisphereLight(0xffffff, 0x303030, 0.55));

  // ---------------- main die
  const die = new THREE.Group(); S.add(die);
  const matSi = silicon(), matAu = gold();
  const matBox = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.55, 0.64, 0.78), roughness: 0.3 });
  // top colours: thin-film reflectance of slab (120 nm) and rib (300 nm) LN on the 4.7 um BOX on Si (derived; no cladding)
  const tf = (nm: number): THREE.Color => { const c = colorOf(spectrum({ cut: "x", film_nm: nm, box_nm: num(CS.box) * 1000 }, 0)); return new THREE.Color().setRGB(Math.max(0, c[0]), Math.max(0, c[1]), Math.max(0, c[2])); };
  const slabColor = tf(num(CS.slab) * 1000), ribColor = tf(num(CS.ln_film) * 1000);
  const matLN = new THREE.MeshBasicMaterial({ color: slabColor, toneMapped: false });
  const matRib = new THREE.MeshBasicMaterial({ color: ribColor, toneMapped: false });
  const box = (m: THREE.Material): THREE.Mesh => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
  const siM = box(matSi), boxM = box(matBox), slabM = box(matLN);
  die.add(siM, boxM, slabM);
  const electrodes = [box(matAu), box(matAu), box(matAu)]; // ground_l, signal, ground_r
  electrodes.forEach((e) => die.add(e));
  let ribs: THREE.Mesh[] = [];
  const lightM = lightMaterial(pal.ir1550);
  let lights: THREE.Mesh[] = [];
  const rfM = rfMaterial(pal.au);
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), rfM); rf.rotation.x = -Math.PI / 2; rf.userData.techHide = true; die.add(rf);
  const secPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: pal.acc, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  secPlane.rotation.y = Math.PI / 2; die.add(secPlane);
  const secEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: pal.acc, toneMapped: false }));
  secEdge.rotation.y = Math.PI / 2; die.add(secEdge);

  let zmix = state.scale === "true" ? 1 : 0;
  const s1 = (IO + BEND * 0.5) / LEN, s2 = (IO + BEND + L_EL + BEND * 0.5) / LEN;

  function buildDie(): void {
    const z = zmap(zmix);
    const hSi = num(CS.si_handle), hBox = num(CS.box) * z.box, hSlab = num(CS.slab) * z.ln, hRib = num(CS.etch_depth) * z.ln, hAu = num(CS.au_thickness) * z.au;
    const W = 2 * z.lat(num(LY.die_width) / 2), X0 = -LEN / 2;
    siM.scale.set(LEN, hSi, W); siM.position.set(0, -hSi / 2, 0);
    boxM.scale.set(LEN, hBox, W); boxM.position.set(0, hBox / 2, 0);
    slabM.scale.set(LEN, hSlab, W); slabM.position.set(0, hBox + hSlab / 2, 0);
    const yTop = hBox + hSlab;
    const xe0 = X0 + IO + BEND, xe = L_EL;
    const lat = z.lat;
    const half = W / 2;
    const gL = { a: Math.max(-half, lat(-(SIG / 2 + GAP + GND))), b: lat(-(SIG / 2 + GAP)) }, gR = { a: lat(SIG / 2 + GAP), b: Math.min(half, lat(SIG / 2 + GAP + GND)) };
    [[gL.a, gL.b], [lat(-SIG / 2), lat(SIG / 2)], [gR.a, gR.b]].forEach(([a, b], i) => {
      electrodes[i].scale.set(xe, hAu, b - a); electrodes[i].position.set(xe0 + xe / 2, yTop + hAu / 2, (a + b) / 2);
    });
    rf.scale.set(xe, 2 * lat(SIG / 2), 1); rf.position.set(xe0 + xe / 2, yTop + hAu + 0.5, 0);
    rfM.uniforms.sA.value = (IO + BEND) / LEN; rfM.uniforms.sB.value = (IO + BEND + L_EL) / LEN;
    // ribs and light paths
    ribs.forEach((r) => { die.remove(r); r.geometry.dispose(); }); ribs = [];
    lights.forEach((l) => { die.remove(l); l.geometry.dispose(); }); lights = [];
    const N = 400, wRib = num(CS.rib_top_width) * z.dlat(OFF);
    const tubeR = Math.max(num(CS.rib_top_width) * 0.5 * z.dlat(OFF), 8);
    const seg = (xa: number, xb: number, sign: number, n: number): THREE.Vector2[] => Array.from({ length: n + 1 }, (_, i) => { const x = xa + ((xb - xa) * i) / n; return new THREE.Vector2(X0 + x, lat(armLat(x, sign))); });
    const parts: [number, number, number, number][] = [[0, IO, 0, 8], [IO, LEN - IO, 1, N], [IO, LEN - IO, -1, N], [LEN - IO, LEN, 0, 8]];
    for (const [xa, xb, sign, n] of parts) {
      const pts = seg(xa, xb, sign, n);
      const r = new THREE.Mesh(ribbon(pts, wRib, yTop, hRib), matRib); die.add(r); ribs.push(r);
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, yTop + hRib + tubeR * 0.9, p.y)), false, "catmullrom", 0);
      const tg = new THREE.TubeGeometry(curve, n, tubeR, 6, false);
      const sAttr = new Float32Array(tg.attributes.position.count), ring = 7;
      for (let i = 0; i <= n; i++) for (let k = 0; k < ring; k++) sAttr[i * ring + k] = (xa + ((xb - xa) * i) / n) / LEN;
      tg.setAttribute("s", new THREE.BufferAttribute(sAttr, 1));
      const lm = new THREE.Mesh(tg, lightM); lm.userData.techHide = true; lm.renderOrder = 3; die.add(lm); lights.push(lm);
    }
    lightM.uniforms.s1.value = s1; lightM.uniforms.s2.value = s2;
    // section marker
    const xs = xe0 + state.section * xe, hTot = hSi + yTop + hAu;
    secPlane.scale.set(W * 1.04, hTot * 1.1, 1); secPlane.position.set(xs, (yTop + hAu - hSi) / 2, 0);
    secEdge.scale.copy(secPlane.scale); secEdge.position.copy(secPlane.position);
    if (mode === "tech") applyModeLook(S, mode, pal);
  }

  function frameCamera(): void {
    const z = zmap(zmix), W = 2 * z.lat(num(LY.die_width) / 2);
    const r = (0.5 * Math.hypot(LEN, W)) / state.zoom;
    const dist = (r / Math.tan(((cam.fov / 2) * Math.PI) / 180)) / Math.min(1, cam.aspect) * 0.9;
    const target = new THREE.Vector3(0, 0, state.inset ? W * 0.12 : 0);
    cam.position.set(target.x + Math.cos(state.pitch) * Math.sin(state.yaw) * dist, Math.sin(state.pitch) * dist, target.z + Math.cos(state.pitch) * Math.cos(state.yaw) * dist);
    cam.lookAt(target);
  }

  // ---------------- cross-section inset (own scene, orthographic, um)
  const sec = new THREE.Scene();
  const secCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const secGroup = new THREE.Group(); sec.add(secGroup);
  sec.add(new THREE.AmbientLight(0xffffff, 1.0));
  let modeField: ModeField | null = null, modeTex: THREE.DataTexture | null = null;
  const secMats: THREE.Material[] = [];
  const winX = LY.section_window_x.value as unknown as [number, number], winY = LY.section_window_y.value as unknown as [number, number];
  function buildSection(): void {
    secGroup.children.slice().forEach((c) => {
      secGroup.remove(c);
      if ((c as THREE.Sprite).isSprite) { const sm = (c as THREE.Sprite).material; sm.map?.dispose(); sm.dispose(); }
      else if (c instanceof THREE.ArrowHelper) c.dispose();
      else (c as THREE.Mesh).geometry?.dispose();
    });
    secMats.forEach((m) => m.dispose()); secMats.length = 0;
    const ve = state.scale === "true" ? 1 : num(LY.section_vertical_exaggeration);
    const Y = (y: number): number => y * ve;
    const flat = (c: string | THREE.Color, o = 1): THREE.MeshBasicMaterial => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false }); secMats.push(m); return m; };
    const rect = (x0: number, x1: number, y0: number, y1: number, m: THREE.Material, zz = 0): void => {
      const a = Math.max(x0, winX[0]), b = Math.min(x1, winX[1]); if (b <= a) return;
      const g = new THREE.PlaneGeometry(b - a, Y(y1) - Y(y0)); const me = new THREE.Mesh(g, m); me.position.set((a + b) / 2, (Y(y0) + Y(y1)) / 2, zz); secGroup.add(me);
    };
    const box = num(CS.box), slab = num(CS.slab), film = num(CS.ln_film), clad = num(CS.cladding), au0 = num(CS.au_base), au = num(CS.au_thickness);
    const cSi = new THREE.Color(pal.si), cBox = new THREE.Color().setRGB(0.42, 0.5, 0.64), cLN = new THREE.Color(pal.theme === "dark" ? "#efe4c2" : "#c9b06a"), cAu = new THREE.Color(pal.au);
    rect(winX[0], winX[1], winY[0] - 50, -box, flat(cSi));
    rect(winX[0], winX[1], -box, 0, flat(cBox, 0.85));
    rect(winX[0], winX[1], 0, slab, flat(cLN));
    rect(winX[0], winX[1], slab, film + clad, flat(new THREE.Color().setRGB(0.55, 0.64, 0.78), pal.theme === "dark" ? 0.18 : 0.3), -0.5);
    const topW = num(CS.rib_top_width), botW = num(CS.rib_bottom_width);
    for (const xc of [0, -2 * OFF]) {
      const sh = new THREE.Shape([new THREE.Vector2(xc - botW / 2, Y(slab)), new THREE.Vector2(xc + botW / 2, Y(slab)), new THREE.Vector2(xc + topW / 2, Y(film)), new THREE.Vector2(xc - topW / 2, Y(film))]);
      secGroup.add(new THREE.Mesh(new THREE.ShapeGeometry(sh), flat(cLN)));
    }
    // electrodes (atlas x: signal [-28, -3], grounds [3, 153] and [-184, -34])
    const sc = -OFF;
    rect(sc - SIG / 2, sc + SIG / 2, au0, au0 + au, flat(cAu), 0.2);
    rect(sc + SIG / 2 + GAP, sc + SIG / 2 + GAP + GND, au0, au0 + au, flat(cAu), 0.2);
    rect(sc - SIG / 2 - GAP - GND, sc - SIG / 2 - GAP, au0, au0 + au, flat(cAu), 0.2);
    // optical mode (|E_x|^2, hatched false colour), right arm solved, mirrored onto the left arm
    if (modeField && modeTex) {
      const f = modeField, w = f.nx * f.dx, h = f.ny * f.dx;
      const mm = new THREE.MeshBasicMaterial({ map: modeTex, transparent: true, depthWrite: false, toneMapped: false }); secMats.push(mm);
      for (const [xc, sx] of [[0, 1], [-2 * OFF, -1]]) {
        const me = new THREE.Mesh(new THREE.PlaneGeometry(w, Y(h) / 1), mm);
        me.scale.x = sx;
        me.position.set(xc + (f.x0 - f.dx / 2 + w / 2) * sx, Y(f.y1 + f.dx / 2) - Y(h) / 2, 0.6); me.userData.techHide = true; secGroup.add(me);
      }
    }
    // push-pull field arrows in the two gaps (length and direction follow V)
    const v = state.V / VPI;
    if (Math.abs(v) > 1e-3) for (const [xc, dir] of [[0, 1], [-2 * OFF, -1]]) {
      const L = Math.min(1, Math.abs(v)) * (GAP * 0.8), d = new THREE.Vector3(Math.sign(v) * dir, 0, 0);
      const ar = new THREE.ArrowHelper(d, new THREE.Vector3(xc - (d.x * L) / 2, Y(film + 0.45), 0.8), L, new THREE.Color(pal.text).getHex(), Math.min(1.2, L * 0.4), Math.min(0.9, L * 0.3));
      (ar.line.material as THREE.Material).toneMapped = false; (ar.cone.material as THREE.Material).toneMapped = false;
      secGroup.add(ar);
    }
    // scale bars: 10 um horizontal; with vertical exaggeration also a 1 um vertical bar (drawn ve times taller)
    const lm = new THREE.LineBasicMaterial({ color: pal.text, toneMapped: false }); secMats.push(lm);
    const hL = (winX[1] - winX[0]) * 0.035, bx = winX[0] + 2, by = Y(winY[0]) + Math.max(1.2, hL * 0.5);
    const segs = [new THREE.Vector3(bx, by, 1), new THREE.Vector3(bx + 10, by, 1)];
    if (ve > 1) segs.push(new THREE.Vector3(bx, by, 1), new THREE.Vector3(bx, by + Y(1), 1));
    secGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), lm));
    const l10 = labelSprite("10 um", pal.text, 40);
    l10.scale.set(hL * (l10.userData.aspect as number), hL, 1); l10.position.set(bx + 5, by + hL * 0.75, 1);
    secGroup.add(l10);
    if (ve > 1) {
      const l1 = labelSprite("1 um", pal.text, 40);
      l1.scale.set(hL * (l1.userData.aspect as number), hL, 1); l1.position.set(bx + hL * 1.9, by + Y(1) / 2 + hL * 0.9, 1);
      secGroup.add(l1);
    }
    secCam.left = winX[0]; secCam.right = winX[1]; secCam.bottom = Y(winY[0]); secCam.top = Y(winY[1]);
    secCam.updateProjectionMatrix();
    secAspect = (winX[1] - winX[0]) / (Y(winY[1]) - Y(winY[0]));
    if (mode === "tech") applyModeLook(secGroup, mode, pal);
  }
  let secAspect = 4;

  async function loadMode(): Promise<void> {
    try {
      const j = await (await fetch((opts.dataBase ?? "/data/") + "eo-overlap-li2026aa.json")).json();
      const g = j.meta.grid, b64: string = j.fields.optEx.f32;
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const E = new Float32Array(u8.buffer), I = new Float32Array(E.length);
      let max = 0;
      for (let i = 0; i < E.length; i++) { const v = Number.isFinite(E[i]) ? E[i] * E[i] : 0; I[i] = v; if (v > max) max = v; }
      modeField = { nx: g.nx, ny: g.ny, dx: g.dx, x0: g.x0, y1: g.y1, I, max };
      const px = new Uint8Array(g.nx * g.ny * 4), c = new THREE.Color(pal.ir1550);
      for (let jj = 0; jj < g.ny; jj++) for (let i = 0; i < g.nx; i++) {
        const k = jj * g.nx + i, row = g.ny - 1 - jj, o = 4 * (row * g.nx + i), a = I[k] / max;
        const hatch = ((i + row) % 6) < 3 ? 1 : 0.35; // hatched: declared false colour
        px[o] = Math.round(c.r * 255); px[o + 1] = Math.round(c.g * 255); px[o + 2] = Math.round(c.b * 255); px[o + 3] = Math.round(255 * Math.min(1, a * 1.15) * hatch * 0.95);
      }
      modeTex?.dispose();
      modeTex = new THREE.DataTexture(px, g.nx, g.ny, THREE.RGBAFormat); modeTex.colorSpace = THREE.SRGBColorSpace; modeTex.magFilter = THREE.LinearFilter; modeTex.needsUpdate = true;
      buildSection(); stage.invalidate(); emit();
    } catch { /* inset keeps the geometry without the mode */ }
  }

  stage.draw = () => {
    const r = stage.renderer, w = stage.width, h = stage.height;
    r.setScissorTest(false); r.setViewport(0, 0, w, h);
    r.render(S, cam);
    if (!state.inset) return;
    // inset: lower right, width 46% (60% under 560 px), height from the section aspect
    const iw = Math.round(w * (w < 560 ? 0.6 : 0.46)), ih = Math.min(Math.round(iw / secAspect), Math.round(h * 0.45)), m = 10;
    const x = w - iw - m, y = m;
    r.setScissorTest(true); r.setScissor(x - 1, y - 1, iw + 2, ih + 2); r.setViewport(x - 1, y - 1, iw + 2, ih + 2);
    r.setClearColor(new THREE.Color(pal.line2), 1); r.clear();
    r.setScissor(x, y, iw, ih); r.setViewport(x, y, iw, ih);
    r.setClearColor(new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink2), 1); r.clear();
    r.render(sec, secCam);
    r.setScissorTest(false); r.setViewport(0, 0, w, h);
    r.setClearColor(new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink0), 1);
  };

  // ---------------- animation
  // FIX-S G07: pulses travel only for a bounded train after input: each setState({ driven: true }) (or a mount with
  // driven: true) arms PULSE_MS; then the light settles to steady and rendering stops (idle = 0 frames) even if the caller
  // leaves driven = true. Off screen or in a hidden tab the Stage holds the loop; reduced motion / TECH: steady light.
  const PULSE_MS = 1500;
  let phase = 0, last = 0, driveUntil = state.driven ? performance.now() + PULSE_MS : 0;
  const driving = (now: number): boolean => state.driven && now < driveUntil && !stage.reducedMotion() && mode === "visual";
  function update(): void {
    const T = mzmTransmission(state.V, VPI, state.biasRad);
    lightM.uniforms.T.value = T;
    const drive = driving(performance.now());
    lightM.uniforms.driven.value = drive ? 1 : 0;
    rfM.uniforms.amp.value = drive ? 1 : 0;
    const rfp = state.rfPhaseRad;
    rfM.uniforms.useT.value = typeof rfp === "number" && Number.isFinite(rfp) ? 1 : 0;
    rfM.uniforms.phiB.value = state.biasRad; rfM.uniforms.phA.value = rfM.uniforms.useT.value ? (rfp as number) - state.biasRad : 0;
    lightM.uniforms.phase.value = phase; rfM.uniforms.phase.value = phase;
    if (drive && !stage.animating) {
      last = performance.now();
      stage.animate((now) => {
        if (!driving(now)) { lightM.uniforms.driven.value = 0; rfM.uniforms.amp.value = 0; return false; } // final steady frame
        phase = (phase + ((now - last) / 1000) * 0.22) % 1000; last = now; // display speed 0.22 die lengths per second (slow motion)
        lightM.uniforms.phase.value = phase; rfM.uniforms.phase.value = phase;
        return true;
      });
    }
  }

  function animateScale(): void {
    const to = state.scale === "true" ? 1 : 0;
    const done = (): void => { buildDie(); buildSection(); frameCamera(); stage.invalidate(); };
    if (stage.reducedMotion() || mode === "tech") { zmix = to; done(); return; }
    const from = zmix, t0 = performance.now();
    stage.animate((now) => { const u = ease((now - t0) / 240); zmix = from + (to - from) * u; buildDie(); frameCamera(); if (u >= 1) buildSection(); return u < 1; });
  }

  function applyTheme(): void {
    pal = palette(theme);
    S.environment = stage.environment(theme);
    lightM.uniforms.col.value.set(pal.ir1550); rfM.uniforms.col.value.set(pal.au);
    (secPlane.material as THREE.MeshBasicMaterial).color.set(pal.acc); (secEdge.material as THREE.LineBasicMaterial).color.set(pal.acc);
    if (modeField) void loadMode(); else buildSection();
    applyMode();
  }
  function applyMode(): void {
    applyModeLook(S, mode, pal); buildSection();
    S.background = new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink0);
    stage.renderer.setClearColor(S.background as THREE.Color, 1);
    update(); stage.invalidate();
  }

  const detach = attachRotate(stage, {
    rotate: (dx, dy) => { state.yaw -= dx; state.pitch = Math.max(0.08, Math.min(1.5, state.pitch + dy)); frameCamera(); stage.invalidate(); },
    zoom: (f) => { state.zoom = Math.max(0.7, Math.min(8, state.zoom / f)); frameCamera(); stage.invalidate(); },
    end: () => emit(),
  });
  stage.onResize = () => frameCamera();

  function info(): MzmInfo {
    const dims: Record<string, PDim> = {};
    for (const [sec2, rows] of Object.entries(D)) if (sec2 !== "meta") for (const [k, v] of Object.entries(rows as Record<string, PDim>)) dims[`${sec2}.${k}`] = v;
    return {
      state: { ...state }, T: mzmTransmission(state.V, VPI, state.biasRad), vpi: VPI, phaseRad: (Math.PI * state.V) / VPI,
      sectionMm: state.section * num(LN_.electrode_length), transitPs: ((L_EL * 1e-6 * NG) / 299792458) * 1e12,
      dims, mode: { loaded: !!modeField, source: "static/data/eo-overlap-li2026aa.json optEx (atlas engine, vector solver)", mirroredToLeftArm: true },
      notes: [
        "1550 nm light in declared false colour, dashed; drawn above the rib",
        "pulse motion is slow motion; RF crest and optical pulse move together (n_RF = n_g = 2.13, simulated design values in li2026aa)",
        "die outline, splitters and bends are template; the 9 mm CPW and cross-section are from the atlas config",
      ],
    };
  }
  function emit(): void { opts.onInfo?.(info()); }

  buildDie(); buildSection(); applyTheme(); frameCamera(); update();
  void loadMode();

  return {
    setState(p) {
      const prev = { ...state };
      Object.assign(state, p);
      if (p.driven) driveUntil = performance.now() + PULSE_MS;
      state.section = Math.max(0, Math.min(1, state.section));
      state.pitch = Math.max(0.08, Math.min(1.5, state.pitch));
      if (state.scale !== prev.scale) animateScale();
      else if (state.section !== prev.section) buildDie();
      if (state.V !== prev.V || state.scale !== prev.scale) buildSection();
      frameCamera(); update(); stage.invalidate(); emit();
    },
    getState: () => ({ ...state }),
    setMode(m) { mode = m; applyMode(); },
    setTheme(t) { theme = t ?? documentTheme(); applyTheme(); },
    getInfo: info,
    getStats: () => stage.stats(),
    renderNow: () => stage.renderNow(),
    dispose() { detach(); modeTex?.dispose(); secMats.forEach((m) => m.dispose()); sec.traverse((o) => (o as THREE.Mesh).geometry?.dispose()); stage.dispose(); },
  };
}
