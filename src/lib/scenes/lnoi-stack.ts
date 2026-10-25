// LNOI stack: a 100 mm wafer of LN film on thermal SiO2 on Si, with a quarter cut away to show the stack, coloured by
// thin-film interference computed per pixel from the true incidence angle (optics/thinfilm.ts: transfer matrix with
// Zelmon 1997 LN o/e, Malitson 1965 SiO2, Green 2008 Si). Dimensions: assets3d/lnoi.toml (DIMS.lnoi).
// Displayed colour = reflectance of a uniform white (equal-energy) surround at that angle; tone mapping is off for the
// film so the pixel equals the computed sRGB. Illustrative scale thickens the layers on a frozen z-map; true scale draws
// them at their real thickness (the film and BOX are then sub-pixel; getInfo().ruler carries the numbers).
import * as THREE from "three";
import { DIMS } from "./generated/scene-data.ts";
import { AxisGizmo, Stage, applyModeLook, attachRotate, ease } from "./core.ts";
import { documentTheme, palette } from "./palette.ts";
import type { Palette } from "./palette.ts";
import { buildLut, colorOf, hexOf, luminousR, spectrum, tables } from "./optics/thinfilm.ts";
import type { Cut, RGB } from "./optics/thinfilm.ts";
import type { LnMaterial } from "./optics/nk.ts";
import type { Mode, MountOptions, PDim, SceneHandle, Theme } from "./types.ts";

export interface LnoiState {
  filmNm: number;
  boxNm: number;
  cut: Cut;
  material: LnMaterial;
  viewDeg: number; // camera polar angle from the wafer normal at the wafer centre, 0-75
  azimuthDeg: number; // camera azimuth about the normal; 0 = looking along -X (plane of incidence contains X)
  scale: "illustrative" | "true";
  wedgeNm: number; // template linear film-thickness change from wafer centre to the +X edge (0 = uniform)
}
export interface LnoiInfo {
  state: LnoiState;
  /** colour at the wafer centre for the current camera angle, and at normal incidence */
  colorView: string;
  colorNormal: string;
  incidenceDeg: number;
  luminousR: number;
  spectrum: { lambda_nm: number[]; R: number[] }; // unpolarized, at the centre, current angle
  ruler: { film_nm: number; box_nm: number; si_um: number; wafer_mm: number; scale: string };
  dims: Record<string, PDim>;
  model: string[];
}

const D = DIMS.lnoi;
const num = (d: { value: unknown }): number => d.value as number;
const R_W = num(D.stack.wafer_diameter) / 2;
const DEF: LnoiState = { filmNm: num(D.stack.film_default), boxNm: num(D.stack.box), cut: "x", material: "CLN", viewDeg: 38, azimuthDeg: 28, scale: "illustrative", wedgeNm: 0 };
const N_ANG = 48, MAX_ANG = 82;

function waferShape(): THREE.Shape {
  // disc with the quadrant 0..90 deg (shape x > 0, y > 0) removed
  const s = new THREE.Shape(), n = 120;
  s.moveTo(0, 0);
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (1.5 * Math.PI * i) / n; s.lineTo(R_W * Math.cos(a), R_W * Math.sin(a)); }
  s.lineTo(0, 0);
  return s;
}

function filmShader(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      lut: { value: null as THREE.Texture | null },
      film0: { value: 600 }, wedge: { value: 0 }, fMin: { value: 0 }, fMax: { value: 1 }, nFilm: { value: 2 },
      maxAng: { value: (MAX_ANG * Math.PI) / 180 }, cdir: { value: new THREE.Vector3(1, 0, 0) }, radius: { value: R_W },
    },
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D lut; uniform float film0; uniform float wedge; uniform float fMin; uniform float fMax; uniform float nFilm;
      uniform float maxAng; uniform vec3 cdir; uniform float radius;
      varying vec3 vP;
      void main() {
        {
          vec3 N = vec3(0.0, 1.0, 0.0); vec3 V = normalize(cameraPosition - vP);
          float th = acos(clamp(dot(N, V), 0.0, 1.0));
          vec3 pr = V - N * dot(V, N); float lp = length(pr);
          float cp = lp > 1e-5 ? dot(pr / lp, cdir) : 1.0; float w = 1.0 - cp * cp; // sin^2 of the azimuth from c
          float t = film0 + wedge * (vP.x / radius);
          float v = clamp((t - fMin) / max(fMax - fMin, 1e-6), 0.0, 1.0);
          float u = clamp(th / maxAng, 0.0, 1.0);
          float rows = 2.0 * nFilm;
          float tu = (u * (${N_ANG}.0 - 1.0) + 0.5) / ${N_ANG}.0;
          float vPar = (v * (nFilm - 1.0) + 0.5) / rows, vPerp = (nFilm + v * (nFilm - 1.0) + 0.5) / rows;
          vec3 c = mix(texture2D(lut, vec2(tu, vPar)).rgb, texture2D(lut, vec2(tu, vPerp)).rgb, w);
          gl_FragColor = vec4(c, 1.0);
        }
        #include <colorspace_fragment>
      }`,
  });
}

export function mount(container: HTMLElement, opts: MountOptions<LnoiState> = {}): SceneHandle<LnoiState, LnoiInfo> {
  const stage = new Stage(container, { dprCap: opts.dprCap, reducedMotion: opts.reducedMotion, label: opts.label ?? "LNOI wafer coloured by thin-film interference; drag to change the viewing angle" });
  const state: LnoiState = { ...DEF, ...opts.state };
  let mode: Mode = opts.mode ?? "visual", theme: Theme = opts.theme ?? documentTheme(), pal: Palette = palette(theme);
  const S = stage.scene, cam = stage.camera as THREE.PerspectiveCamera;
  cam.fov = 26; cam.near = 1; cam.far = 3000; cam.updateProjectionMatrix();
  S.environment = stage.environment(theme);
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-80, 160, 120); S.add(key);
  S.add(new THREE.HemisphereLight(0xffffff, 0x303030, 0.7));

  const shape = waferShape();
  const wafer = new THREE.Group(); S.add(wafer);
  const film = filmShader();
  const lnEdge = new THREE.MeshStandardMaterial({ color: new THREE.Color("#efe4c2"), roughness: 0.25, metalness: 0, emissive: new THREE.Color("#3a3220") });
  const boxMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.55, 0.64, 0.78), roughness: 0.3, metalness: 0, transparent: true, opacity: 0.55 });
  const siMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.34, 0.35, 0.38), metalness: 0.85, roughness: 0.32 });
  // one extrusion per layer, unit depth, scaled in y by the current z-map; groups: 0 caps, 1 sides
  const ext = (): THREE.ExtrudeGeometry => { const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 1 }); g.rotateX(-Math.PI / 2); return g; };
  const lnMesh = new THREE.Mesh(ext(), [film, lnEdge]);
  // caps of the lower layers are always covered by the layer above; not drawing them avoids z-fighting at true scale
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const boxMesh = new THREE.Mesh(ext(), [hidden, boxMat]);
  const siMesh = new THREE.Mesh(ext(), [hidden, siMat]);
  wafer.add(siMesh, boxMesh, lnMesh);

  const gizmo = new AxisGizmo(pal, 9); S.add(gizmo.group);

  let zmix = state.scale === "true" ? 1 : 0; // 0 illustrative, 1 true
  function heights(): { si: number; box: number; ln: number } {
    const ill = D.display.illustrative_heights.value as unknown as { film: number; box: number; si: number };
    const tru = { ln: state.filmNm * 1e-6, box: state.boxNm * 1e-6, si: num(D.stack.handle_si) * 1e-3 };
    const il = { ln: ill.film * R_W, box: ill.box * R_W, si: ill.si * R_W };
    const m = (a: number, b: number): number => Math.max(1e-6, a + (b - a) * zmix);
    return { si: m(il.si, tru.si), box: m(il.box, tru.box), ln: m(il.ln, tru.ln) };
  }
  function layout(): void {
    const h = heights();
    siMesh.scale.set(1, h.si, 1); siMesh.position.y = 0;
    boxMesh.scale.set(1, h.box, 1); boxMesh.position.y = h.si;
    lnMesh.scale.set(1, h.ln, 1); lnMesh.position.y = h.si + h.box;
    wafer.position.y = -(h.si + h.box + h.ln) / 2;
    // camera: polar angle from the normal measured at the wafer centre
    const th = (state.viewDeg * Math.PI) / 180, az = (state.azimuthDeg * Math.PI) / 180;
    const dist = (R_W * 1.25) / Math.tan(((cam.fov / 2) * Math.PI) / 180) / Math.min(1, cam.aspect * 0.95);
    cam.position.set(Math.sin(th) * Math.cos(az) * dist, Math.cos(th) * dist, Math.sin(th) * Math.sin(az) * dist);
    cam.up.set(0, 1, 0);
    if (th < 1e-3) cam.up.set(-1, 0, 0);
    cam.lookAt(0, 0, 0);
    // crystal axes in world: wafer normal = +Y; x-cut: X normal, c (Z) along world +X; z-cut: Z normal, X along world +X
    const B = new THREE.Matrix4();
    if (state.cut === "x") B.makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
    else B.makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0));
    gizmo.setBasis(B);
    gizmo.group.position.set(-R_W * 0.95, 0, R_W * 0.95);
    film.uniforms.cdir.value.set(1, 0, 0); // in-plane c for x-cut; unused for z-cut (par = perp)
  }

  let lutKey = "", lutTex: THREE.DataTexture | null = null;
  function updateLut(): void {
    const k = [state.filmNm, state.boxNm, state.cut, state.material, state.wedgeNm].join("|");
    if (k === lutKey) return;
    lutKey = k;
    const span = Math.abs(state.wedgeNm), nFilm = span > 0 ? 40 : 2;
    const fMin = Math.max(0, state.filmNm - span), fMax = state.filmNm + span + (span > 0 ? 0 : 1e-3);
    const L = buildLut({ cut: state.cut, box_nm: state.boxNm, filmMin: fMin, filmMax: fMax, nFilm, nAngle: N_ANG, maxAngleDeg: MAX_ANG, material: state.material });
    const px = new Uint8Array(N_ANG * nFilm * 2 * 4);
    const enc = (c: number): number => Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055) * 255);
    for (let i = 0; i < N_ANG * nFilm * 2; i++) { px[4 * i] = enc(L.data[3 * i]); px[4 * i + 1] = enc(L.data[3 * i + 1]); px[4 * i + 2] = enc(L.data[3 * i + 2]); px[4 * i + 3] = 255; }
    lutTex?.dispose();
    lutTex = new THREE.DataTexture(px, N_ANG, nFilm * 2, THREE.RGBAFormat, THREE.UnsignedByteType);
    lutTex.colorSpace = THREE.SRGBColorSpace; lutTex.magFilter = THREE.LinearFilter; lutTex.minFilter = THREE.LinearFilter; lutTex.needsUpdate = true;
    const u = film.uniforms;
    u.lut.value = lutTex; u.film0.value = state.filmNm; u.wedge.value = state.wedgeNm; u.fMin.value = fMin; u.fMax.value = fMax; u.nFilm.value = nFilm;
  }

  function animateScale(): void {
    const to = state.scale === "true" ? 1 : 0;
    if (stage.reducedMotion() || mode === "tech") { zmix = to; layout(); stage.invalidate(); return; }
    const from = zmix, t0 = performance.now();
    stage.animate((now) => { const u = ease((now - t0) / 240); zmix = from + (to - from) * u; layout(); return u < 1; });
  }

  function applyTheme(): void {
    pal = palette(theme);
    S.environment = stage.environment(theme);
    gizmo.build(pal); layout(); applyMode();
  }
  function applyMode(): void {
    applyModeLook(S, mode, pal);
    S.background = new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink0);
    stage.invalidate();
  }

  const detach = attachRotate(stage, {
    rotate: (dx, dy) => { state.azimuthDeg = (state.azimuthDeg - (dx * 180) / Math.PI + 360) % 360; state.viewDeg = Math.max(0, Math.min(75, state.viewDeg + (dy * 180) / Math.PI)); layout(); stage.invalidate(); },
    end: () => emit(),
  });
  stage.onResize = () => layout();

  function info(): LnoiInfo {
    const T = tables(state.material);
    // incidence at the wafer centre for the current camera
    const V = cam.position.clone().normalize(), th = Math.acos(Math.min(1, Math.max(0, V.y)));
    const pr = new THREE.Vector3(V.x, 0, V.z), lp = pr.length(), cp = lp > 1e-6 ? pr.x / lp : 1, w = 1 - cp * cp;
    const st = { cut: state.cut, film_nm: state.filmNm, box_nm: state.boxNm };
    const R = spectrum(st, th, w, state.material), R0 = spectrum(st, 0, 0.5, state.material);
    const c: RGB = colorOf(R, state.material);
    const dims: Record<string, PDim> = {};
    for (const [sec, rows] of Object.entries(D)) if (sec !== "meta") for (const [k, v] of Object.entries(rows as Record<string, PDim>)) dims[`${sec}.${k}`] = v;
    return {
      state: { ...state }, colorView: hexOf(c), colorNormal: hexOf(colorOf(R0, state.material)), incidenceDeg: (th * 180) / Math.PI, luminousR: luminousR(R, state.material),
      spectrum: { lambda_nm: Array.from(T.lam), R: Array.from(R) },
      ruler: { film_nm: state.filmNm, box_nm: state.boxNm, si_um: num(D.stack.handle_si), wafer_mm: 2 * R_W, scale: state.scale },
      dims,
      model: [
        "transfer matrix, s and p, coherent layers, Si semi-infinite; unpolarized average",
        "x-cut film exact for planes of incidence parallel or perpendicular to c; other azimuths interpolated as cos^2 / sin^2",
        "colour: CIE 1931 2-degree (Wyman 2013 fit), equal-energy illuminant, white-normalized, 400-780 nm at 2 nm",
        "thermal SiO2 approximated by fused silica (Malitson 1965)",
      ],
    };
  }
  function emit(): void { opts.onInfo?.(info()); }

  updateLut(); applyTheme(); layout(); stage.invalidate();

  return {
    setState(p) {
      const prevScale = state.scale;
      Object.assign(state, p);
      state.viewDeg = Math.max(0, Math.min(75, state.viewDeg));
      state.filmNm = Math.max(0, state.filmNm); state.boxNm = Math.max(0, state.boxNm);
      updateLut();
      if (state.scale !== prevScale) animateScale(); else layout();
      stage.invalidate(); emit();
    },
    getState: () => ({ ...state }),
    setMode(m) { mode = m; applyMode(); },
    setTheme(t) { theme = t ?? documentTheme(); applyTheme(); },
    getInfo: info,
    getStats: () => stage.stats(),
    renderNow: () => stage.renderNow(),
    dispose() { detach(); gizmo.clear(); lutTex?.dispose(); stage.dispose(); },
  };
}
