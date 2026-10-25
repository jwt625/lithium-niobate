// F2-03 client: TECH ASCII ellipsoid + rho(theta) plot, VISUAL three.js ellipsoid (render on demand, orbit by drag or
// arrow keys), one shared state (f21-ell.ts e21).
import { e21, ell21Ascii, ell21PlotSVG, ell21Readout, drawnAxes, drawnRho, lamOf, sOfLam } from "./f21-ell.ts";
import { extraordinaryIndex } from "$lib/physics/crystaloptics.ts";
import { spectral } from "../spectral.ts";
import { Disposer, cssVar, dpr, isLight, isVisual, onUi, q, rafQueue } from "../dom.ts";
import { whenVisual, type Part } from "../visual/lifecycle.ts";
import { bindRange } from "./ctl.ts";
import { FS } from "../fmt.ts";

const DEG = Math.PI / 180;

function ro(scope: Element, pre: string): void {
  const r = ell21Readout(e21);
  for (const [k, v] of Object.entries(r)) { const el = q(scope, `#${pre}-${k}`); if (el) el.textContent = v; }
}

function binds(dis: Disposer, scope: Element, pre: string, req: () => void): () => void {
  const a = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-th-in`), q(scope, `#${pre}-th-o`), { read: (s) => s, write: (v) => v, get: () => e21.th, set: (v) => { e21.th = v; }, fmt: (v) => `${v.toFixed(1).padStart(4, FS)}°`, aria: (v) => `${v.toFixed(1)} degrees` }, req);
  const b = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-ph-in`), q(scope, `#${pre}-ph-o`), { read: (s) => s, write: (v) => v, get: () => e21.ph, set: (v) => { e21.ph = v; }, fmt: (v) => `${String(Math.round(v)).padStart(3, FS)}°`, aria: (v) => `${Math.round(v)} degrees` }, req);
  const c = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-lam-in`), q(scope, `#${pre}-lam-o`), { read: lamOf, write: sOfLam, get: () => e21.lam, set: (v) => { e21.lam = v; }, fmt: (v) => `${String(Math.round(v * 1000)).padStart(4, FS)} nm`, aria: (v) => `${Math.round(v * 1000)} nanometers` }, req);
  return () => { a(); b(); c(); };
}

function initThree(V: HTMLElement): Part {
  const dis = new Disposer();
  const stage = q(V, "#v-e21-stage") as HTMLElement, lab = q(stage, ".v-ell-lab") as HTMLElement;
  const cam = { yaw: 0.75, pitch: 0.32 };
  let R: { size: () => void; render: () => void; dispose: () => void } | null = null, alive = true, queued = false;
  async function make(): Promise<NonNullable<typeof R>> {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr()); stage.insertBefore(renderer.domElement, lab);
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
    camera.up.set(0, 0, 1); scene.add(camera);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-2, 3, 5); camera.add(key);
    const solidM = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.4, roughness: 0.6, depthWrite: false });
    const solid = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), solidM); scene.add(solid);
    const wireM = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.25 });
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 24, 12)), wireM); scene.add(wire);
    const axM = new THREE.LineBasicMaterial();
    const axG = new THREE.BufferGeometry(); axG.setAttribute("position", new THREE.Float32BufferAttribute([-1.6, 0, 0, 1.6, 0, 0, 0, -1.6, 0, 0, 1.6, 0, 0, 0, -1.6, 0, 0, 1.6], 3));
    scene.add(new THREE.LineSegments(axG, axM));
    // section ellipse (closed loop) and the section disc
    const NS = 128;
    const secG = new THREE.BufferGeometry(); secG.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(NS * 3), 3));
    const secM = new THREE.LineBasicMaterial(); const sec = new THREE.LineLoop(secG, secM); scene.add(sec);
    const discG = new THREE.BufferGeometry(); discG.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((NS + 2) * 3), 3));
    const idx: number[] = []; for (let i = 1; i <= NS; i++) idx.push(0, i, i + 1); discG.setIndex(idx);
    const discM = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
    scene.add(new THREE.Mesh(discG, discM));
    // k and S as lines (dashed in infrared false color) with cone heads
    const mkArrow = () => {
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1.6], 3));
      const solidMat = new THREE.LineBasicMaterial(), dashMat = new THREE.LineDashedMaterial({ dashSize: 0.07, gapSize: 0.05 });
      const ln = new THREE.Line(g, solidMat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 16), new THREE.MeshBasicMaterial());
      scene.add(ln); scene.add(head);
      return { g, ln, head, solidMat, dashMat };
    };
    const kA = mkArrow(), sA = mkArrow();
    const setArrow = (A: ReturnType<typeof mkArrow>, dir: number[], len: number, color: string, dashed: boolean): void => {
      (A.g.attributes.position.array as Float32Array).set([0, 0, 0, dir[0] * len, dir[1] * len, dir[2] * len]); A.g.attributes.position.needsUpdate = true;
      A.ln.material = dashed ? A.dashMat : A.solidMat; A.ln.computeLineDistances();
      A.solidMat.color.set(color); A.dashMat.color.set(color); (A.head.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.set(color);
      A.head.position.set(dir[0] * len, dir[1] * len, dir[2] * len);
      A.head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dir[0], dir[1], dir[2]));
    };
    return {
      size() { renderer.setSize(stage.clientWidth, stage.clientHeight, false); },
      dispose() { renderer.dispose(); renderer.domElement.remove(); },
      render() {
        const { a, cz } = drawnAxes(e21.lam);
        solid.scale.set(a, a, cz); wire.scale.set(a, a, cz);
        solidM.color.set(cssVar("--v-ln")); wireM.color.set(cssVar("--v-text3")); axM.color.set(cssVar("--v-text3"));
        const th = e21.th * DEG, ph = e21.ph * DEG;
        const uo = [-Math.sin(ph), Math.cos(ph), 0], ue = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), -Math.sin(th)];
        const ned = extraordinaryIndex(th, a, cz);
        const sp = secG.attributes.position.array as Float32Array, dp = discG.attributes.position.array as Float32Array;
        dp.set([0, 0, 0], 0);
        for (let i = 0; i <= NS; i++) {
          const t = (2 * Math.PI * i) / NS, p = [0, 1, 2].map((j) => Math.cos(t) * a * uo[j] + Math.sin(t) * ned * ue[j]);
          if (i < NS) sp.set(p, i * 3);
          dp.set(p, (i + 1) * 3);
        }
        secG.attributes.position.needsUpdate = true; discG.attributes.position.needsUpdate = true;
        const vis = e21.lam <= 0.75;
        const col = vis ? spectral(e21.lam * 1000, isLight() ? 0.55 : 1, 0.05) : cssVar(e21.lam < 1.3 ? "--v-ir1064" : "--v-ir1550");
        secM.color.set(cssVar("--v-text")); discM.color.set(col);
        const k = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
        const ts = th + drawnRho(e21) * DEG, S = [Math.sin(ts) * Math.cos(ph), Math.sin(ts) * Math.sin(ph), Math.cos(ts)];
        setArrow(kA, k, 1.55, col, !vis);
        setArrow(sA, S, 1.55, cssVar("--v-au"), false);
        const W = stage.clientWidth, H = stage.clientHeight, as = W / H, h = 2.0;
        camera.left = -h * as; camera.right = h * as; camera.top = h; camera.bottom = -h; camera.updateProjectionMatrix();
        const cp = Math.cos(cam.pitch), e = [Math.cos(cam.yaw) * cp, Math.sin(cam.yaw) * cp, Math.sin(cam.pitch)];
        camera.position.set(e[0] * 10, e[1] * 10, e[2] * 10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
        renderer.render(scene, camera);
        const proj = (p: number[]): [number, number] => { const v = new THREE.Vector3(p[0], p[1], p[2]).project(camera); return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H]; };
        const L: [number[], string, string][] = [[[1.78, 0, 0], "x", ""], [[0, 1.78, 0], "y", ""], [[0, 0, 1.78], "c (z)", ""], [k.map((x) => x * 1.82), "k", "k"], [S.map((x) => x * 1.82), "S", "s"]];
        lab.innerHTML = L.map(([p, t, cl]) => { const [x, y] = proj(p); return `<span class="${cl}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px">${t}</span>`; }).join("");
      },
    };
  }
  const req = (): void => { if (!queued && R) { queued = true; requestAnimationFrame(() => { queued = false; if (alive) R?.render(); }); } };
  let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
  dis.on(stage, "pointerdown", (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch }; try { stage.setPointerCapture(e.pointerId); } catch { /* inactive pointer */ } });
  dis.on(stage, "pointermove", (e: PointerEvent) => { if (!drag) return; cam.yaw = drag.yaw - (e.clientX - drag.x) * 0.008; cam.pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008)); req(); });
  const up = (): void => { drag = null; };
  dis.on(stage, "pointerup", up); dis.on(stage, "pointercancel", up);
  dis.on(stage, "keydown", (e: KeyboardEvent) => { const d = ({ ArrowLeft: [0.1, 0], ArrowRight: [-0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] } as Record<string, number[]>)[e.key]; if (d) { e.preventDefault(); cam.yaw += d[0]; cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + d[1])); req(); } });
  make().then((r) => { if (!alive) { r.dispose(); return; } R = r; R.size(); req(); dis.observe(stage, () => { R?.size(); req(); }); })
    .catch(() => { lab.innerHTML = '<span class="err" style="left:50%;top:50%">WebGL unavailable; the readouts are exact</span>'; });
  dis.add(() => { alive = false; R?.dispose(); });
  return { repaint: req, dispose: dis.run };
}

export function mountEll21(root: HTMLElement): () => void {
  const dis = new Disposer();
  const T = q(root, "#e21"), V = q(root, "#v-e21");
  let three: Part | null = null;
  const syncs: (() => void)[] = [];
  function draw(): void {
    if (T && !isVisual()) {
      const pre = q(T, "#e21-ascii"); if (pre) pre.textContent = ell21Ascii(e21);
      const pl = q(T, "#e21-plot"); if (pl) pl.innerHTML = ell21PlotSVG(e21);
      ro(T, "e21");
    }
    if (V && isVisual()) { ro(V, "v-e21"); three?.repaint(); }
    syncs.forEach((f) => f());
  }
  const req = rafQueue(draw);
  if (T) syncs.push(binds(dis, T, "e21", req));
  if (V) syncs.push(binds(dis, V, "v-e21", req));
  if (V) dis.add(whenVisual(() => { three = initThree(V); return three; }));
  dis.add(onUi(req));
  draw();
  return dis.run;
}
