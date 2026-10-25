// Worker: F2-12 detuning scan of the normalized LLE (f25-lle.ts simAdvance, physics in src/lib/physics/lle.ts).
// Messages in: {type: "start", ctl}, {type: "stop"}, {type: "preview", ctl, id} (stationary state for the controls),
// {type: "set", ctl} (pump, dispersion, scan end and rate apply to the
// running scan; the seed applies at the next start). Out: one frame per compute chunk of at most BUDGET ms.
import { ansatzFrame, frameOf, simAdvance, simCreate, type LleCtl, type Sim } from "./f25-lle.ts";

const BUDGET = 8;
let sim: Sim | null = null, running = false, sent = 0, timer = 0;
const post = (m: unknown, tr: Transferable[] = []): void => (self as unknown as Worker).postMessage(m, tr);

function tick(): void {
  if (!running || !sim) return;
  const t0 = performance.now();
  simAdvance(sim, BUDGET, () => performance.now());
  const fr = frameOf(sim, sent, performance.now() - t0);
  sent = sim.tz.length;
  post({ type: "frame", fr }, [fr.db.buffer, fr.w.buffer, fr.tz.buffer, fr.tp.buffer, fr.tn.buffer]);
  if (sim.phase === "done") { running = false; post({ type: "done" }); return; }
  timer = setTimeout(tick, 0) as unknown as number;
}

self.onmessage = (e: MessageEvent<{ type: "start" | "stop" | "set" | "preview"; ctl?: LleCtl; id?: number }>) => {
  const m = e.data;
  if (m.type === "preview" && m.ctl) {
    const fr = ansatzFrame(m.ctl);
    post({ type: "preview", fr, id: m.id }, [fr.db.buffer, fr.w.buffer, fr.tz.buffer, fr.tp.buffer, fr.tn.buffer]);
    return;
  }
  if (m.type === "start" && m.ctl) {
    clearTimeout(timer);
    sim = simCreate(m.ctl); sent = 0; running = true;
    tick();
  } else if (m.type === "stop") {
    running = false; clearTimeout(timer);
  } else if (m.type === "set" && m.ctl && sim) {
    const { f, d2, z1, rate } = m.ctl;
    Object.assign(sim.ctl, { f, d2, z1, rate });
    if (sim.phase === "scan" && sim.zeta >= z1) sim.phase = "hold";
  }
};
