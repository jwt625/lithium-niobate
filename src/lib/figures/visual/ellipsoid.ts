// VISUAL index ellipsoid, chapter 2.2 L2 (port of mockup/visual.js initEllipsoid): three.js, render on demand.
// Drawing: Delta(1/n^2) scaled x500 before the eigen-decomposition; each semi-axis drawn as 1 + 10 (n_i / n_mean - 1);
// wireframe at E = 0. Numbers: exact eigen-decomposition of the unscaled impermeability (rtensor.ts).
import { imperm, jacobi, onRt, rtChanged, st, SETS } from "../rtensor.ts";
import { MINUS, pad } from "../fmt.ts";
import { Disposer, cssVar, dpr, need, qa } from "../dom.ts";
import type { Part } from "./lifecycle.ts";
import type { RtState } from "$lib/stores/figstate";

const K_DB = 500, G_N = 10;
const AXL = ["x", "y", "z"];
const sciS = (v: number): string => (Math.abs(v) < 1e-15 ? pad("0", 10) : (v < 0 ? MINUS : "+") + Math.abs(v).toExponential(3).replace("e-", `e${MINUS}`));

/** Readout strings for the current state (also rendered at build time for the default state). */
export function ellReadout(): { n: string; dn: string; st: string; tilt: string; rs: string } {
  const P = imperm(), k = st.p, dnk = -0.5 * P.n[k] ** 3 * P.dB[k];
  const eg = jacobi(P.B), nS = eg.val.map((v) => 1 / Math.sqrt(v)).sort((a, b) => a - b);
  const biax = Math.abs(nS[0] - nS[1]) > 1e-12 && Math.abs(nS[1] - nS[2]) > 1e-12;
  const tilt = Math.max(...eg.vec.map((v) => (Math.acos(Math.min(1, Math.max(...v.map(Math.abs)))) * 180) / Math.PI));
  return { n: `${P.n[k].toFixed(4)} (${AXL[k] === "z" ? "nₑ" : "nₒ"})`, dn: sciS(dnk), st: biax ? "biaxial, 3 distinct" : "uniaxial, 2 equal", tilt: `${pad(tilt < 1 ? tilt.toFixed(4) : tilt.toFixed(2), 7)}°`, rs: (() => { const S = SETS[st.s]; return `${pad(S.r13.toFixed(1), 4)} / ${pad(S.r22.toFixed(2), 4)} / ${pad(S.r33.toFixed(1), 4)} / ${pad(S.r51.toFixed(1), 4)} pm/V`; })() };
}

export function initEllipsoid(root: HTMLElement): Part {
  const dis = new Disposer();
  const stage = need(root, "#v-ell-stage"), lab = need(stage, ".v-ell-lab");
  const out = { n: need(root, "#v-ell-n"), dn: need(root, "#v-ell-dn"), st: need(root, "#v-ell-st"), tilt: need(root, "#v-ell-tilt"), rs: need(root, "#v-ell-rs") };
  const cam = { yaw: 0.9, pitch: 0.38 };
  let R: { size: () => void; render: () => void; dispose: () => void } | null = null, queued = false, alive = true;
  const groups: [string, keyof RtState][] = [["#v-rt-e", "e"], ["#v-rt-p", "p"], ["#v-rt-s", "s"]];
  function numbers(): void {
    const r = ellReadout();
    out.n.textContent = r.n; out.dn.textContent = r.dn; out.st.textContent = r.st; out.tilt.textContent = r.tilt; out.rs.textContent = r.rs;
    groups.forEach(([id, key]) => qa<HTMLButtonElement>(root, `${id} button`).forEach((b) => { const on = String(st[key]) === b.dataset.v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); }));
  }
  async function make(): Promise<NonNullable<typeof R>> {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr()); stage.insertBefore(renderer.domElement, lab);
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
    camera.up.set(0, 0, 1); scene.add(camera);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-2, 3, 5); camera.add(key);
    const sph = new THREE.SphereGeometry(1, 64, 32);
    const solidM = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.55, roughness: 0.6, depthWrite: false });
    const solid = new THREE.Mesh(sph, solidM); scene.add(solid);
    const wireM = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 24, 12)), wireM); scene.add(wire);
    const axM = new THREE.LineBasicMaterial();
    const axG = new THREE.BufferGeometry(); axG.setAttribute("position", new THREE.Float32BufferAttribute([-1.7, 0, 0, 1.7, 0, 0, 0, -1.7, 0, 0, 1.7, 0, 0, 0, -1.7, 0, 0, 1.7], 3));
    scene.add(new THREE.LineSegments(axG, axM));
    const eArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.55, 0xffffff, 0.16, 0.09); scene.add(eArrow);
    const polM = new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.05, linewidth: 1 });
    const polG = new THREE.BufferGeometry(); polG.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -1.35, 0, 0, 1.35], 3));
    const pol = new THREE.Line(polG, polM); scene.add(pol);
    const mat4 = new THREE.Matrix4();
    return {
      size() { renderer.setSize(stage.clientWidth, stage.clientHeight, false); },
      dispose() { renderer.dispose(); renderer.domElement.remove(); },
      render() {
        const P = imperm(), nbar = (2 * P.no + P.ne) / 3, sa = (n: number): number => 1 + G_N * (n / nbar - 1);
        const Bx = P.B.map((r, i) => r.map((v, j) => (i === j ? P.B0[i] : 0) + K_DB * (v - (i === j ? P.B0[i] : 0)))) as typeof P.B; // B0 + K dB
        const eg = jacobi(Bx), s3 = eg.val.map((v) => sa(1 / Math.sqrt(v))), V = eg.vec;
        mat4.set(V[0][0] * s3[0], V[1][0] * s3[1], V[2][0] * s3[2], 0, V[0][1] * s3[0], V[1][1] * s3[1], V[2][1] * s3[2], 0, V[0][2] * s3[0], V[1][2] * s3[1], V[2][2] * s3[2], 0, 0, 0, 0, 1);
        solid.matrixAutoUpdate = false; solid.matrix.copy(mat4);
        wire.scale.set(sa(P.no), sa(P.no), sa(P.ne));
        solidM.color.set(cssVar("--v-ln")); wireM.color.set(cssVar("--v-text3")); axM.color.set(cssVar("--v-text3"));
        const dir: [number, number, number] = [0, 0, 0]; dir[st.e] = 1; eArrow.setDirection(new THREE.Vector3(...dir)); eArrow.setColor(cssVar("--v-au"));
        const pd: [number, number, number] = [0, 0, 0]; pd[st.p] = 1.35;
        (polG.attributes.position.array as Float32Array).set([-pd[0], -pd[1], -pd[2], pd[0], pd[1], pd[2]]); polG.attributes.position.needsUpdate = true; pol.computeLineDistances(); polM.color.set(cssVar("--v-ir1550"));
        const W = stage.clientWidth, H = stage.clientHeight, a = W / H, h = 2.05;
        camera.left = -h * a; camera.right = h * a; camera.top = h; camera.bottom = -h; camera.updateProjectionMatrix();
        const cp = Math.cos(cam.pitch), e = [Math.cos(cam.yaw) * cp, Math.sin(cam.yaw) * cp, Math.sin(cam.pitch)];
        camera.position.set(e[0] * 10, e[1] * 10, e[2] * 10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
        renderer.render(scene, camera);
        const proj = (x: number, y: number, z: number): [number, number] => { const v = new THREE.Vector3(x, y, z).project(camera); return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H]; };
        const L = ([[1.85, 0, 0, "x"], [0, 1.85, 0, "y"], [0, 0, 1.85, "z (c)"]] as [number, number, number, string][]).map(([x, y, z, t]) => { const [px, py] = proj(x, y, z); return `<span style="left:${px.toFixed(1)}px;top:${py.toFixed(1)}px">${t}</span>`; });
        const ep = proj(dir[0] * 1.75, dir[1] * 1.75, dir[2] * 1.75), pp = proj(-pd[0] * 1.12, -pd[1] * 1.12, -pd[2] * 1.12); // polarization label at the negative end, clear of E
        lab.innerHTML = L.join("") + `<span class="e" style="left:${ep[0].toFixed(1)}px;top:${ep[1].toFixed(1)}px">E</span><span class="p" style="left:${pp[0].toFixed(1)}px;top:${pp[1].toFixed(1)}px">polarization</span>`;
      },
    };
  }
  const req = (): void => { if (!queued && R) { queued = true; requestAnimationFrame(() => { queued = false; if (alive) R?.render(); }); } };
  groups.forEach(([id, key]) => qa<HTMLButtonElement>(root, `${id} button`).forEach((b) => dis.on(b, "click", () => {
    const v = b.dataset.v ?? "";
    if (key === "s") st.s = v as RtState["s"]; else st[key] = (+v as 0 | 1 | 2);
    rtChanged();
  })));
  dis.add(onRt(() => { numbers(); req(); }));
  let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
  dis.on(stage, "pointerdown", (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch }; try { stage.setPointerCapture(e.pointerId); } catch { /* inactive pointer */ } });
  dis.on(stage, "pointermove", (e: PointerEvent) => { if (!drag) return; cam.yaw = drag.yaw - (e.clientX - drag.x) * 0.008; cam.pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008)); req(); });
  const up = (): void => { drag = null; };
  dis.on(stage, "pointerup", up); dis.on(stage, "pointercancel", up);
  dis.on(stage, "keydown", (e: KeyboardEvent) => { const d = ({ ArrowLeft: [0.1, 0], ArrowRight: [-0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] } as Record<string, number[]>)[e.key]; if (d) { e.preventDefault(); cam.yaw += d[0]; cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + d[1])); req(); } });
  numbers();
  make().then((r) => {
    if (!alive) { r.dispose(); return; }
    R = r; R.size(); req();
    dis.observe(stage, () => { R?.size(); req(); });
  }).catch((err: unknown) => { console.warn("WebGL unavailable for the ellipsoid", err); lab.innerHTML = '<span class="err" style="left:50%;top:50%">WebGL unavailable; numbers at right are exact</span>'; });
  dis.add(() => { alive = false; R?.dispose(); });
  return { repaint: () => { numbers(); req(); }, dispose: dis.run };
}
