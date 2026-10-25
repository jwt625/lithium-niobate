// Process viewer core (VISUAL): renders the pure model f(route, step, t) of process/model.ts at wafer scale with the
// tool's most involved part, and a cross-section inset. The page lane drives playback (setState({ step, t })) and
// renders the HUD from getInfo().hud; nothing here autoplays. Camera: the reader's orbit persists; the framing changes
// only at retarget steps (eased 600 ms, instant under reduced motion). Film colour after the split is the thin-film
// reflectance colour of the current film thickness on 4.7 um SiO2 on Si (optics/thinfilm.ts), so it shifts during CMP.
import * as THREE from "three";
import { DIMS } from "../generated/scene-data.ts";
import { AxisGizmo, Stage, applyModeLook, attachRotate, ease } from "../core.ts";
import { gold, silicon } from "../materials.ts";
import { documentTheme, palette } from "../palette.ts";
import type { Palette } from "../palette.ts";
import { colorOf, spectrum } from "../optics/thinfilm.ts";
import { evaluate, fieldLayout, hud, routeSteps, stateHash, TH, WAFER_D } from "./model.ts";
import type { Hud, ProcState, Route } from "./model.ts";
import type { Mode, MountOptions, PDim, SceneHandle, Theme } from "../types.ts";

export interface ProcessState {
  route: Route;
  step: number; // index into routeSteps(route)
  t: number; // 0-1 within the step
  scale: "illustrative" | "true";
  yaw: number;
  pitch: number;
  zoom: number;
  inset: boolean;
}
export interface ProcessInfo {
  state: ProcessState;
  steps: { id: string; name: string; retarget: boolean }[];
  hud: Hud;
  model: ProcState;
  hash: string;
  zmap: Record<string, number>; // display heights in mm for the current scale
  dims: Record<string, PDim>;
}

const P = DIMS.process;
const num = (d: { value: unknown }): number => d.value as number;
const R = WAFER_D / 2;
const DEF: ProcessState = { route: "ridge_duv", step: 0, t: 0, scale: "illustrative", yaw: -0.5, pitch: 0.55, zoom: 1, inset: true };
const FRAMES: Record<string, { target: [number, number, number]; r: number }> = {
  s07_handle: { target: [0, 4, 0], r: 128 },
  s09_bond: { target: [0, 12, 0], r: 82 },
  s10_split: { target: [0, 22, 0], r: 92 },
};

export function mount(container: HTMLElement, opts: MountOptions<ProcessState> = {}): SceneHandle<ProcessState, ProcessInfo> {
  const stage = new Stage(container, { dprCap: opts.dprCap, reducedMotion: opts.reducedMotion, label: opts.label ?? "Fabrication process viewer: LNOI formation and lithography; drag to orbit" });
  const state: ProcessState = { ...DEF, ...opts.state };
  let mode: Mode = opts.mode ?? "visual", theme: Theme = opts.theme ?? documentTheme(), pal: Palette = palette(theme);
  const S = stage.scene, cam = stage.camera as THREE.PerspectiveCamera;
  cam.fov = 30; cam.near = 1; cam.far = 5000; cam.updateProjectionMatrix();
  S.environment = stage.environment(theme);
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-120, 260, 160); S.add(key);
  S.add(new THREE.HemisphereLight(0xffffff, 0x303030, 0.6));

  // ---------------- bodies (unit-height cylinders scaled by the z-map)
  const cyl = (m: THREE.Material | THREE.Material[], r = R, seg = 96): THREE.Mesh => { const g = new THREE.CylinderGeometry(r, r, 1, seg, 1); g.translate(0, 0.5, 0); return new THREE.Mesh(g, m); };
  const matSi = silicon();
  const matOx = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.55, 0.64, 0.78), roughness: 0.3, transparent: true, opacity: 0.8 });
  const matLNside = new THREE.MeshStandardMaterial({ color: new THREE.Color("#efe4c2"), roughness: 0.3, emissive: new THREE.Color("#2e2818") });
  const matLNtop = new THREE.MeshStandardMaterial({ color: new THREE.Color("#d8ccaa"), roughness: 0.12, metalness: 0.05, emissive: new THREE.Color("#1c180f") });
  const matFilmTop = new THREE.MeshBasicMaterial({ color: 0x999999, toneMapped: false });
  const matHmSio2 = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.6, 0.7, 0.85), roughness: 0.3, transparent: true, opacity: 0.55 });
  const matHmDlc = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.09, 0.09, 0.1), roughness: 0.8 });
  const matResist = new THREE.MeshStandardMaterial({ color: new THREE.Color("#c98a2e"), roughness: 0.4, transparent: true, opacity: 0.85 }); // template colour
  const handleG = new THREE.Group(); S.add(handleG);
  const siM = cyl(matSi), oxM = cyl(matOx);
  const filmM = cyl([matLNside, matFilmTop, matLNside]); // cylinder groups: 0 side, 1 top, 2 bottom
  const roughM = new THREE.Mesh(new THREE.CircleGeometry(R * 0.999, 96), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false })); roughM.rotation.x = -Math.PI / 2;
  const rimM = new THREE.Mesh(new THREE.RingGeometry(R - num(P.bodies.edge_exclusion), R, 96, 1), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })); rimM.rotation.x = -Math.PI / 2;
  const hmM = cyl(matHmSio2), resM = cyl(matResist);
  handleG.add(siM, oxM, filmM, roughM, rimM, hmM, resM);
  // donor: implanted face at the group origin; film part and remainder; implant plane
  const donorG = new THREE.Group(); S.add(donorG);
  const donorFilm = cyl([matLNside, matLNtop, matLNtop]), donorRest = cyl([matLNside, matLNtop, matLNtop]);
  const implantM = new THREE.Mesh(new THREE.CircleGeometry(R * 0.985, 96), new THREE.MeshBasicMaterial({ color: pal.acc, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  implantM.rotation.x = -Math.PI / 2; implantM.userData.techHide = true;
  const restPivot = new THREE.Group(); restPivot.add(donorRest);
  donorG.add(donorFilm, restPivot, implantM);
  const donorGizmo = new AxisGizmo(pal, 16); S.add(donorGizmo.group);
  // exposed fields (latent image)
  const { fields } = fieldLayout();
  const fieldMat = new THREE.MeshBasicMaterial({ color: pal.acc, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false });
  const fieldMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), fieldMat, fields.length); fieldMesh.userData.techHide = true;
  handleG.add(fieldMesh);
  const fieldEdges = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: pal.text3, transparent: true, opacity: 0.7 }));
  handleG.add(fieldEdges);

  // ---------------- tools (template geometry, process.toml [tools])
  const toolG = new THREE.Group(); S.add(toolG);
  const ghost = (c: string, o: number): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.4, metalness: 0.2, transparent: true, opacity: o, depthWrite: false });
  const metal = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.55, 0.56, 0.6), metalness: 0.8, roughness: 0.35 });
  const tools: Record<string, THREE.Group> = {};
  {
    // furnace: quartz tube with coils
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(num(P.tools.oven_tube_diameter) / 2, num(P.tools.oven_tube_diameter) / 2, 60, 64, 1, true), ghost("#cfd8e6", 0.18)); tube.position.y = 22; g.add(tube);
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(num(P.tools.oven_tube_diameter) / 2 + 2, 1.2, 8, 64), metal); c.rotation.x = Math.PI / 2; c.position.y = 2 + i * 13; g.add(c); }
    tools.furnace = g;
    // implanter: beam cone onto a spot
    const ib = new THREE.Group();
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(num(P.tools.implant_beam_diameter) / 2, num(P.tools.implant_beam_diameter) / 2 * 0.7, 70, 24, 1, true), new THREE.MeshBasicMaterial({ color: pal.text2, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }));
    beam.position.y = 35; beam.userData.techHide = true; ib.add(beam);
    const spot = new THREE.Mesh(new THREE.CircleGeometry(num(P.tools.implant_beam_diameter) / 2, 32), new THREE.MeshBasicMaterial({ color: pal.text, transparent: true, opacity: 0.6, toneMapped: false })); spot.rotation.x = -Math.PI / 2; spot.position.y = 0.2; spot.userData.techHide = true; ib.add(spot);
    tools.implanter = ib;
    // bonder: upper and lower chucks, centre pin, contact ring
    const bd = new THREE.Group();
    const ct = num(P.tools.chuck_thickness);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(R + 5, R + 5, ct, 64), ghost("#8f97a6", 0.55)); up.name = "upper"; bd.add(up);
    const lo = new THREE.Mesh(new THREE.CylinderGeometry(R + 5, R + 5, ct, 64), metal); lo.name = "lower"; bd.add(lo);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 20, 12), metal); pin.name = "pin"; bd.add(pin);
    tools.bonder = bd;
    // oven: wire frame enclosure
    const ov = new THREE.Group();
    ov.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(150, 90, 150)), new THREE.LineBasicMaterial({ color: pal.text3 })));
    ov.children[0].position.y = 40;
    tools.oven = ov;
    // CMP: platen with grooves, polishing head (ghost), slurry arm
    const cm = new THREE.Group();
    const platen = new THREE.Mesh(new THREE.CylinderGeometry(num(P.tools.cmp_pad_diameter) / 2, num(P.tools.cmp_pad_diameter) / 2, 3, 96), new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.16, 0.17, 0.2), roughness: 0.9 })); platen.position.y = -1.6; platen.name = "platen"; cm.add(platen);
    const rings: number[] = [];
    for (let rr = 20; rr < num(P.tools.cmp_pad_diameter) / 2; rr += 9) for (let i = 0; i < 96; i++) { const a = (i / 96) * 2 * Math.PI, b = ((i + 1) / 96) * 2 * Math.PI; rings.push(rr * Math.cos(a), 0.05, rr * Math.sin(a), rr * Math.cos(b), 0.05, rr * Math.sin(b)); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(rings, 3));
    const grooves = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: pal.line2 })); grooves.name = "grooves"; cm.add(grooves);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(num(P.tools.cmp_head_diameter) / 4, num(P.tools.cmp_head_diameter) / 4, 10, 48), ghost("#b9c0cc", 0.35)); head.name = "head"; cm.add(head);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(90, 3, 4), metal); arm.position.set(-95, 14, 30); arm.rotation.y = 0.35; arm.name = "arm"; cm.add(arm);
    tools.cmp = cm;
    // PECVD: showerhead and plasma glow
    const pe = new THREE.Group();
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(R + 8, R + 8, 6, 64), ghost("#9aa1ad", 0.3)); sh.position.y = 34; pe.add(sh);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(R + 4, R + 4, 22, 64, 1, true), new THREE.MeshBasicMaterial({ color: pal.text2, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    glow.position.y = 20; glow.name = "glow"; glow.userData.techHide = true; pe.add(glow);
    tools.pecvd = pe;
    // spin coater: chuck and nozzle
    const sp = new THREE.Group();
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 48), metal); chuck.position.y = -3.5; sp.add(chuck);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 30, 12), metal); noz.position.y = 35; sp.add(noz);
    tools.spin = sp;
    // stepper: projection lens bottom element and exposure column
    const stp = new THREE.Group();
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(num(P.tools.lens_diameter) / 2, num(P.tools.lens_diameter) / 2 + 6, 30, 64), metal); lens.position.y = 45; lens.name = "lens"; stp.add(lens);
    const col = new THREE.Mesh(new THREE.BoxGeometry(22, 30, 22), new THREE.MeshBasicMaterial({ color: pal.acc, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    col.position.y = 15; col.name = "column"; col.userData.techHide = true; stp.add(col);
    tools.stepper = stp;
    for (const g2 of Object.values(tools)) { g2.visible = false; toolG.add(g2); }
  }
  const contact = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96, 1), new THREE.MeshBasicMaterial({ color: pal.acc, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  contact.rotation.x = -Math.PI / 2; contact.userData.techHide = true; S.add(contact);

  // ---------------- cross-section inset (orthographic, display heights)
  const sec = new THREE.Scene(), secCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10), secG = new THREE.Group(); sec.add(secG);
  const secMats: THREE.Material[] = [];

  // ---------------- z-map
  let zmix = state.scale === "true" ? 1 : 0;
  function zm(m: ProcState): Record<string, number> {
    const Z = P.zmap;
    const ill = { si: num(Z.si), ox: num(Z.oxide), donor: num(Z.donor), film: num(Z.film) * (m.film.present ? m.film.nm / (TH.split_um * 1000) : 1), hm: num(Z.hardmask), res: num(Z.resist) };
    const tru = { si: m.handle.siUm / 1000, ox: TH.oxide_um / 1000, donor: TH.donor_um / 1000, film: (m.film.present ? m.film.nm : TH.split_um * 1000) / 1e6, hm: m.hardmask.nm / 1e6 || TH.hm_sio2_nm / 1e6, res: (TH.arc_nm + TH.resist_nm) / 1e6 };
    const out: Record<string, number> = {};
    for (const k of Object.keys(ill) as (keyof typeof ill)[]) out[k] = ill[k] + (tru[k] - ill[k]) * zmix;
    out.filmSplit = num(Z.film) + (TH.split_um / 1000 - num(Z.film)) * zmix; // donor film part (before split)
    return out;
  }

  // ---------------- apply model state
  const filmColorCache = new Map<number, THREE.Color>();
  function filmColor(nm: number): THREE.Color {
    const k = Math.round(nm * 2) / 2;
    let c = filmColorCache.get(k);
    if (!c) { const v = colorOf(spectrum({ cut: "x", film_nm: k, box_nm: TH.oxide_um * 1000 }, 0)); c = new THREE.Color().setRGB(Math.max(0, v[0]), Math.max(0, v[1]), Math.max(0, v[2])); filmColorCache.set(k, c); }
    return c;
  }
  let roughTex: THREE.DataTexture | null = null;
  function roughTexture(): THREE.DataTexture {
    if (roughTex) return roughTex;
    // split-surface speckle (template): deterministic hash noise, no Math.random
    const N = 128, px = new Uint8Array(N * N * 4);
    for (let i = 0; i < N * N; i++) { let h = (i * 2654435761) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; const v = (h & 255) / 255; px[4 * i] = px[4 * i + 1] = px[4 * i + 2] = 40; px[4 * i + 3] = Math.round(255 * v * v); }
    roughTex = new THREE.DataTexture(px, N, N); roughTex.wrapS = roughTex.wrapT = THREE.RepeatWrapping; roughTex.repeat.set(10, 10); roughTex.needsUpdate = true;
    return roughTex;
  }
  (roughM.material as THREE.MeshBasicMaterial).map = roughTexture();

  let cur: ProcState = evaluate(state.route, state.step, state.t);
  function apply(): void {
    const m = evaluate(state.route, state.step, state.t);
    cur = m;
    const z = zm(m);
    // handle stack
    handleG.position.set(m.handle.x, 0, 0);
    handleG.rotation.set(0, m.tool.kind === "spin" && m.phase === "ops" ? m.tool.spin : 0, 0);
    siM.scale.set(1, z.si, 1); siM.position.y = -z.si;
    const ox = z.ox * m.handle.oxideFrac;
    oxM.visible = ox > 1e-7; oxM.scale.set(1, Math.max(ox, 1e-7), 1); oxM.position.y = 0;
    let top = ox;
    filmM.visible = m.film.present; roughM.visible = m.film.present && m.film.rough > 0.01; rimM.visible = m.film.present && m.film.rough > 0.01;
    if (m.film.present) {
      filmM.scale.set(1, z.film, 1); filmM.position.y = top; top += z.film;
      matFilmTop.color.copy(filmColor(m.film.nm));
      roughM.position.y = top + 0.01; (roughM.material as THREE.MeshBasicMaterial).opacity = 0.75 * m.film.rough;
      rimM.position.y = top + 0.02; (rimM.material as THREE.MeshBasicMaterial).opacity = 0.4 * m.film.rough;
    }
    hmM.visible = m.hardmask.frac > 0;
    if (hmM.visible) { const h = z.hm * m.hardmask.frac; hmM.material = m.hardmask.kind === "dlc" ? matHmDlc : matHmSio2; hmM.scale.set(1, Math.max(h, 1e-7), 1); hmM.position.y = top; top += h; }
    resM.visible = m.resist.frac > 0;
    if (resM.visible) { const rr = Math.max(0.02, m.resist.radius); resM.scale.set(rr, z.res, rr); resM.position.y = top; top += z.res; }
    // exposed fields
    const nShow = Math.ceil(m.exposed - 1e-9), mt = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    fieldMesh.count = nShow; fieldMesh.visible = nShow > 0;
    for (let i = 0; i < nShow; i++) { const f = fields[i]; mt.compose(new THREE.Vector3(f.cx, top + 0.03, -f.cy), q, new THREE.Vector3(21.2, 21.2, 1)); fieldMesh.setMatrixAt(i, mt); }
    fieldMesh.instanceMatrix.needsUpdate = true;
    const showGrid = m.stepId === "s15r_expose" || m.stepId === "s14s_expose";
    fieldEdges.visible = showGrid;
    if (showGrid) {
      const e: number[] = [];
      for (const f of fields) { const a = f.cx - 11, b = f.cx + 11, c = -f.cy - 11, d = -f.cy + 11, y = top + 0.04; e.push(a, y, c, b, y, c, b, y, c, b, y, d, b, y, d, a, y, d, a, y, d, a, y, c); }
      fieldEdges.geometry.dispose(); fieldEdges.geometry = new THREE.BufferGeometry(); fieldEdges.geometry.setAttribute("position", new THREE.Float32BufferAttribute(e, 3));
    }
    // donor: origin at the implanted face; unflipped body extends downward
    donorG.visible = m.donor.present;
    if (m.donor.present) {
      const hf = z.filmSplit, hr = Math.max(z.donor - hf, 1e-6);
      donorFilm.scale.set(1, hf, 1); donorFilm.position.y = -hf;
      donorRest.scale.set(1, hr, 1); donorRest.position.set(-R, -hr, 0); restPivot.position.set(R, -hf, 0);
      restPivot.rotation.set(0, 0, 0.6 * m.donor.peel); // the remainder lifts away hinged at one edge (peel motif, R12)
      donorFilm.visible = !m.donor.split;
      implantM.position.y = -hf; (implantM.material as THREE.MeshBasicMaterial).opacity = 0.65 * m.donor.implant * (m.donor.split ? 0 : 1);
      // flip about the donor's in-plane Y (world z): the implanted +X face goes down
      donorG.rotation.set(0, 0, Math.PI * m.donor.flip);
      const baseY = m.donor.flip > 0.5 ? ox : z.donor - z.si; // flipped: on the oxide; unflipped: back face level with the handle's
      donorG.position.set(m.donor.x, baseY + m.donor.y, 0);
    }
    // gizmo on the donor (or on the film after the split): crystal axes of the x-cut donor
    const B = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
    const flipM = new THREE.Matrix4().makeRotationZ(Math.PI * (m.film.present ? 1 : m.donor.flip));
    donorGizmo.setBasis(flipM.multiply(B));
    donorGizmo.group.visible = m.donor.present || m.film.present;
    donorGizmo.group.position.set(m.donor.present ? m.donor.x - R - 14 : -R - 14, (m.donor.present ? donorG.position.y : top) + 2, R * 0.6);
    // contact wave
    contact.visible = m.stepId === "s09_bond" && m.bondWave > 0 && m.bondWave < 1;
    contact.scale.setScalar(Math.max(0.01, R * m.bondWave)); contact.position.set(0, ox + 0.05, 0);
    // tools
    for (const [k, g] of Object.entries(tools)) g.visible = k === m.tool.kind && mode === "visual";
    const tg = tools[m.tool.kind], lift = m.tool.lift * 120;
    tg.position.set(0, 0, 0);
    if (m.tool.kind === "furnace") { tg.position.set(m.tool.x, lift, 0); }
    if (m.tool.kind === "implanter") { tg.position.set(m.tool.x, z.donor + lift, m.tool.z); tg.children.forEach((c) => (c.visible = m.phase === "ops")); }
    if (m.tool.kind === "bonder") {
      const ct = num(P.tools.chuck_thickness);
      const up = tg.getObjectByName("upper")!, lo = tg.getObjectByName("lower")!, pin = tg.getObjectByName("pin")!;
      const donorTop = donorG.position.y + (m.donor.flip > 0.5 ? z.donor : 0);
      up.position.set(donorG.position.x, donorTop + ct / 2 + 0.2 + lift, 0); lo.position.set(0, -z.si - ct / 2 - 0.2 - lift, 0);
      pin.position.set(donorG.position.x, donorTop + 10 + lift, 0);
    }
    if (m.tool.kind === "oven") tg.position.set(0, lift, 0);
    if (m.tool.kind === "cmp") {
      tg.getObjectByName("platen")!.position.y = -z.si - 1.6; tg.getObjectByName("grooves")!.position.y = -z.si + 0.02;
      const head = tg.getObjectByName("head")!; head.position.set(m.tool.x, top + 5 + lift, m.tool.z); head.rotation.y = m.tool.spin;
      tg.getObjectByName("platen")!.rotation.y = -m.tool.spin * 0.5; tg.getObjectByName("grooves")!.rotation.y = -m.tool.spin * 0.5;
      tg.getObjectByName("arm")!.position.y = top + 14 + lift;
    }
    if (m.tool.kind === "pecvd") { tg.position.set(0, top + lift, 0); tg.getObjectByName("glow")!.visible = m.phase === "ops"; }
    if (m.tool.kind === "spin") tg.position.set(0, top + lift * 0.3, 0);
    if (m.tool.kind === "stepper") { tg.position.set(m.tool.x, top + lift, m.tool.z); tg.getObjectByName("column")!.visible = m.phase === "ops"; }
    buildInset(m, z);
    if (mode === "tech") applyModeLook(S, mode, pal);
  }

  function buildInset(m: ProcState, z: Record<string, number>): void {
    secG.children.slice().forEach((c) => { secG.remove(c); (c as THREE.Mesh).geometry?.dispose(); });
    secMats.forEach((x) => x.dispose()); secMats.length = 0;
    const layers: [number, string, number][] = []; // height, colour, opacity
    layers.push([z.si, pal.si, 1]);
    if (m.handle.oxideFrac > 0) layers.push([z.ox * m.handle.oxideFrac, "#8ca3c7", 0.9]);
    if (m.film.present) layers.push([z.film, "#" + filmColor(m.film.nm).getHexString(), 1]);
    else if (m.donor.present && m.donor.flip > 0.5 && m.donor.peel === 0) layers.push([z.donor, "#efe4c2", 1]);
    if (m.hardmask.frac > 0) layers.push([z.hm * m.hardmask.frac, m.hardmask.kind === "dlc" ? "#222326" : "#a8bbd8", 1]);
    if (m.resist.frac > 0) layers.push([z.res, "#c98a2e", 1]);
    const total = layers.reduce((s2, l) => s2 + l[0], 0) || 1;
    let y = 0;
    for (const [h, c, o] of layers) {
      const mat = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false }); secMats.push(mat);
      const me = new THREE.Mesh(new THREE.PlaneGeometry(1, Math.max(h / total, 1e-6)), mat); me.position.set(0.5, y + h / total / 2, 0); secG.add(me);
      y += h / total;
    }
    // implant plane in the donor (before the split), as a dashed line at its depth
    if (m.donor.present && m.donor.implant > 0 && !m.donor.split && m.donor.flip > 0.5) {
      const yi = (z.si + z.ox * m.handle.oxideFrac + z.filmSplit) / total;
      const lm = new THREE.LineDashedMaterial({ color: pal.acc, dashSize: 0.04, gapSize: 0.025, toneMapped: false }); secMats.push(lm);
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, yi, 0.1), new THREE.Vector3(1, yi, 0.1)]), lm); l.computeLineDistances(); secG.add(l);
    }
    secCam.left = 0; secCam.right = 1; secCam.bottom = 0; secCam.top = 1; secCam.updateProjectionMatrix();
    if (mode === "tech") applyModeLook(secG, mode, pal);
  }

  // ---------------- camera
  let camFrom: { t: THREE.Vector3; r: number } | null = null, camNow = { t: new THREE.Vector3(...FRAMES.s07_handle.target), r: FRAMES.s07_handle.r };
  function frameTarget(): { t: THREE.Vector3; r: number } { const f = FRAMES[cur.frame] ?? FRAMES.s07_handle; return { t: new THREE.Vector3(...f.target), r: f.r }; }
  function placeCamera(): void {
    const dist = (camNow.r / state.zoom) / Math.sin(((cam.fov / 2) * Math.PI) / 180) / Math.min(1, cam.aspect);
    cam.position.set(camNow.t.x + Math.cos(state.pitch) * Math.sin(state.yaw) * dist, camNow.t.y + Math.sin(state.pitch) * dist, camNow.t.z + Math.cos(state.pitch) * Math.cos(state.yaw) * dist);
    cam.lookAt(camNow.t);
  }
  let lastFrame = cur.frame;
  function retarget(animate: boolean): void {
    const goal = frameTarget();
    if (!animate || stage.reducedMotion() || mode === "tech") { camNow = goal; placeCamera(); return; }
    camFrom = { t: camNow.t.clone(), r: camNow.r };
    const t0 = performance.now(), from = camFrom;
    stage.animate((now) => { const u = ease((now - t0) / 600); camNow = { t: from.t.clone().lerp(goal.t, u), r: from.r + (goal.r - from.r) * u }; placeCamera(); return u < 1; });
  }

  stage.draw = () => {
    const r = stage.renderer, w = stage.width, h = stage.height;
    r.setScissorTest(false); r.setViewport(0, 0, w, h); r.render(S, cam);
    if (!state.inset) return;
    const iw = Math.round(Math.min(w * 0.16, 120)), ih = Math.round(Math.min(h * 0.5, 220)), mg = 12, x = w - iw - mg, y = mg;
    r.setScissorTest(true);
    r.setScissor(x - 1, y - 1, iw + 2, ih + 2); r.setViewport(x - 1, y - 1, iw + 2, ih + 2); r.setClearColor(new THREE.Color(pal.line2), 1); r.clear();
    r.setScissor(x, y, iw, ih); r.setViewport(x, y, iw, ih); r.setClearColor(new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink2), 1); r.clear();
    r.render(sec, secCam);
    r.setScissorTest(false); r.setViewport(0, 0, w, h); r.setClearColor(new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink0), 1);
  };

  function animateScale(): void {
    const to = state.scale === "true" ? 1 : 0;
    if (stage.reducedMotion() || mode === "tech") { zmix = to; apply(); stage.invalidate(); return; }
    const from = zmix, t0 = performance.now();
    stage.animate((now) => { const u = ease((now - t0) / 240); zmix = from + (to - from) * u; apply(); return u < 1; });
  }
  function applyTheme(): void {
    pal = palette(theme);
    S.environment = stage.environment(theme);
    donorGizmo.build(pal);
    for (const mm of [fieldMat, (implantM.material as THREE.MeshBasicMaterial), (contact.material as THREE.MeshBasicMaterial)]) mm.color.set(pal.acc);
    applyMode();
  }
  function applyMode(): void {
    S.background = new THREE.Color(mode === "tech" ? pal.ink1 : pal.ink0);
    stage.renderer.setClearColor(S.background as THREE.Color, 1);
    apply(); applyModeLook(S, mode, pal); stage.invalidate();
  }

  const detach = attachRotate(stage, {
    rotate: (dx, dy) => { state.yaw -= dx; state.pitch = Math.max(0.05, Math.min(1.5, state.pitch + dy)); placeCamera(); stage.invalidate(); },
    zoom: (f) => { state.zoom = Math.max(0.6, Math.min(6, state.zoom / f)); placeCamera(); stage.invalidate(); },
    end: () => emit(),
  });
  stage.onResize = () => placeCamera();

  function info(): ProcessInfo {
    const dims: Record<string, PDim> = {};
    for (const [sec2, rows] of Object.entries(P)) if (sec2 !== "meta") for (const [k, v] of Object.entries(rows as Record<string, PDim>)) dims[`${sec2}.${k}`] = v;
    return {
      state: { ...state }, steps: routeSteps(state.route).map((s) => ({ id: s.id, name: s.name, retarget: s.camera.retarget })),
      hud: hud(state.route, state.step, state.t), model: cur, hash: stateHash(cur), zmap: zm(cur), dims,
    };
  }
  function emit(): void { opts.onInfo?.(info()); }

  applyTheme(); retarget(false); placeCamera(); stage.invalidate();

  return {
    setState(p) {
      const prev = { ...state };
      Object.assign(state, p);
      const n = routeSteps(state.route).length;
      state.step = Math.max(0, Math.min(n - 1, Math.floor(state.step))); state.t = Math.min(1, Math.max(0, state.t));
      state.pitch = Math.max(0.05, Math.min(1.5, state.pitch));
      if (state.scale !== prev.scale) animateScale(); else apply();
      if (cur.frame !== lastFrame) { retarget(Math.abs(state.step - prev.step) === 1 && state.route === prev.route); lastFrame = cur.frame; } else placeCamera();
      stage.invalidate();
      if (state.step !== prev.step || state.route !== prev.route || state.scale !== prev.scale) emit();
    },
    getState: () => ({ ...state }),
    setMode(m) { mode = m; applyMode(); },
    setTheme(t) { theme = t ?? documentTheme(); applyTheme(); },
    getInfo: info,
    getStats: () => stage.stats(),
    renderNow: () => stage.renderNow(),
    dispose() { detach(); donorGizmo.clear(); roughTex?.dispose(); secMats.forEach((x) => x.dispose()); sec.traverse((o) => (o as THREE.Mesh).geometry?.dispose()); stage.dispose(); },
  };
}
