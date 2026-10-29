// The four page scenes of the Crystal book (hexagon patchwork).

import type { Scene, SceneHost } from "../../types";
import { threadText } from "./letters";
import {
  PAL,
  SQ3,
  ballSprite,
  blanket,
  blit,
  circlePts,
  clamp,
  drawArrow,
  ease,
  easeBack,
  easeIO,
  fabric,
  hexPts,
  layer,
  lerp,
  makeScene,
  patchSprite,
  poly,
  type Ctx,
  type Kit,
  type Pt,
  type Rng,
  type Sprite,
} from "./kit";

export const TEXT = [
  "These are oxygen balls. They pack into flat sheets.",
  "Stack the sheets. In the gaps: niobium, empty, lithium. Again and again.",
  "Cool it down. Lithium and niobium both scoot one way. Now it has an arrow.",
  "Push with a big voltage. The arrow flips! Up, down, up, down. Now you know the crystal!",
];

/** Cream oxygen patches: four prints, quilted circle = the ball. */
function oxygenSprites(k: Kit, R: number): Sprite[] {
  const { s, rng } = k;
  const pats = [
    fabric(s, rng, "floral", PAL.ecru, PAL.rose, 40, PAL.nb),
    fabric(s, rng, "pin", PAL.ivory, PAL.tan, 40),
    fabric(s, rng, "gingham", PAL.cream, PAL.tan, 36),
    fabric(s, rng, "dots", PAL.ecru, "#E3B49C", 36),
  ];
  return pats.map((pat) => patchSprite(s, { R, pat, stitch: PAL.tan, quilt: true }));
}

const liBall = (k: Kit, r: number) => ({
  pat: fabric(k.s, k.rng, "dots", PAL.li, PAL.liInk, 30),
  r,
  stitch: PAL.liInk,
  label: "Li",
  labelColor: PAL.liInk,
  labelXh: r * 0.56,
});
const nbBall = (k: Kit, r: number) => ({
  pat: fabric(k.s, k.rng, "gingham", PAL.nb, PAL.nbInk, 26),
  r,
  stitch: PAL.threadDark,
  label: "Nb",
  labelColor: PAL.letters,
  labelXh: r * 0.56,
});

type Room = "Nb" | "empty" | "Li";
const SEQ: Room[] = ["Nb", "empty", "Li"]; // order along +c (ch01:L28, L68)

function threadLine(g: Ctx, a: Pt, b: Pt, color: string, w = 2, dash: number[] = [7, 5]): void {
  g.save();
  g.setLineDash(dash);
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
  g.restore();
}

// ---------- p1: patches stitch together into a close-packed sheet ----------

function page1(host: SceneHost): Scene {
  return makeScene(host, TEXT[0], 101, (k) => {
    const R = 60;
    const w = SQ3 * R;
    const cx = 500;
    const cy = 385;
    const sprites = oxygenSprites(k, R);
    const rng: Rng = k.rng;
    interface Cell {
      x: number;
      y: number;
      sp: Sprite;
      d: number;
      fx: number;
      fy: number;
      spin: number;
    }
    const cells: Cell[] = [];
    for (let q = -3; q <= 3; q++)
      for (let r = -3; r <= 3; r++) {
        const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
        if (ring > 3) continue;
        const x = cx + w * (q + r / 2);
        const y = cy + 1.5 * R * r;
        const a = ring ? Math.atan2(y - cy, x - cx) : rng() * 6.28;
        const dist = 320 + rng() * 140;
        cells.push({
          x,
          y,
          sp: sprites[Math.floor(rng() * sprites.length)],
          d: ring * 0.17 + rng() * 0.12,
          fx: x + Math.cos(a) * dist,
          fy: y + Math.sin(a) * dist,
          spin: (rng() - 0.5) * 1.6,
        });
      }
    cells.sort((a, b) => a.d - b.d);
    // whip stitches across every shared edge
    interface Seam {
      m: Pt;
      u: Pt;
      n: Pt;
      d: number;
    }
    const seams: Seam[] = [];
    for (let i = 0; i < cells.length; i++)
      for (let j = i + 1; j < cells.length; j++) {
        const dx = cells[j].x - cells[i].x;
        const dy = cells[j].y - cells[i].y;
        const L = Math.hypot(dx, dy);
        if (L > w * 1.05) continue;
        const m: Pt = [(cells[i].x + cells[j].x) / 2, (cells[i].y + cells[j].y) / 2];
        seams.push({ m, n: [dx / L, dy / L], u: [-dy / L, dx / L], d: 1.0 + (Math.hypot(m[0] - cx, m[1] - cy) / 340) * 0.8 });
      }
    let tapI = -1;
    let tapT = -9;
    return {
      settle: 2.4,
      draw(g, t) {
        for (let i = 0; i < cells.length; i++) {
          const c = cells[i];
          const p = ease((t - c.d) / 0.6);
          if (p <= 0) continue;
          const pf = i === tapI ? 1 + 0.14 * Math.sin(Math.PI * clamp((t - tapT) / 0.6)) : 1;
          blit(g, c.sp, lerp(c.fx, c.x, p), lerp(c.fy, c.y, p), lerp(0.7, 1, p) * pf, (1 - p) * c.spin, clamp(p * 4));
        }
        g.save();
        g.strokeStyle = PAL.threadDark;
        g.lineWidth = 1.7;
        g.lineCap = "round";
        g.beginPath();
        for (const sm of seams) {
          const n = Math.floor(clamp((t - sm.d) / 0.3) * 4 + 1e-6);
          for (let q = 0; q < n; q++) {
            const o = (q - 1.5) * R * 0.2;
            const x = sm.m[0] + sm.u[0] * o;
            const y = sm.m[1] + sm.u[1] * o;
            g.moveTo(x - sm.n[0] * 6 - sm.u[0] * 2, y - sm.n[1] * 6 - sm.u[1] * 2);
            g.lineTo(x + sm.n[0] * 6 + sm.u[0] * 2, y + sm.n[1] * 6 + sm.u[1] * 2);
          }
        }
        g.stroke();
        g.restore();
      },
      tap(x, y, t) {
        let best = -1;
        let bd = R;
        cells.forEach((c, i) => {
          const d = Math.hypot(c.x - x, c.y - y);
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        if (best < 0 || host.reduced) return 0;
        tapI = best;
        tapT = t;
        return 0.8;
      },
    };
  });
}

// ---------- shared side-view lattice for p2 / p3 ----------

interface Lattice {
  R: number;
  w: number;
  rowY: (r: number) => number;
  oCells: { x: number; y: number; r: number; sp: Sprite }[];
  rooms: { x: number; y: number; k: number; j: number; type: Room }[];
}

function lattice(k: Kit, R: number, cx: number, cy: number, nO: number, axisJ: number): Lattice {
  const w = SQ3 * R;
  const sprites = oxygenSprites(k, R);
  const x0 = cx - ((nO - 1) / 2) * w;
  const rowY = (r: number): number => cy + (3 - r) * 1.5 * R;
  const oCells: Lattice["oCells"] = [];
  const rooms: Lattice["rooms"] = [];
  for (let r = 0; r <= 6; r += 2)
    for (let j = 0; j < nO; j++) oCells.push({ x: x0 + j * w, y: rowY(r), r, sp: sprites[Math.floor(k.rng() * sprites.length)] });
  for (let kk = 0; kk < 3; kk++)
    for (let j = 0; j < nO - 1; j++)
      rooms.push({ x: x0 + (j + 0.5) * w, y: rowY(2 * kk + 1), k: kk, j, type: SEQ[(((j - axisJ + kk) % 3) + 3) % 3] });
  return { R, w, rowY, oCells, rooms };
}

// ---------- p2: sheets stack, gaps fill Nb, empty, Li along the axis ----------

function page2(host: SceneHost): Scene {
  return makeScene(host, TEXT[1], 202, (k) => {
    const R = 60;
    const axisJ = 3;
    const L = lattice(k, R, 500, 385, 8, axisJ);
    const roomPat = fabric(k.s, k.rng, "pin", PAL.room, PAL.roomInk, 36);
    const sp: Record<Room, Sprite> = {
      Nb: patchSprite(k.s, { R, pat: roomPat, stitch: PAL.roomInk, ball: nbBall(k, 31) }, threadText),
      Li: patchSprite(k.s, { R, pat: roomPat, stitch: PAL.roomInk, ball: liBall(k, 31) }, threadText),
      empty: patchSprite(k.s, { R, stitch: PAL.thread, open: true }),
    };
    const open = sp.empty;
    const fillT = L.rooms.map((rm) => (rm.j === axisJ ? 1.25 + rm.k * 0.32 : 2.15 + k.rng() * 0.35));
    const axisX = L.rooms.find((rm) => rm.j === axisJ)?.x ?? 500;
    let t0 = 0;
    const settle = 2.8;
    return {
      settle,
      draw(g, tAbs) {
        const t = tAbs - t0;
        for (const c of L.oCells) {
          const p = ease((t - 0.1 - (c.r / 2) * 0.22) / 0.45);
          if (p > 0) blit(g, c.sp, c.x, c.y - 240 * (1 - p), 1, 0, clamp(p * 3));
        }
        const ao = clamp((t - 0.9) / 0.3);
        L.rooms.forEach((rm) => blit(g, open, rm.x, rm.y, 1, 0, ao));
        const ax = clamp((t - 1.0) / 0.3);
        if (ax > 0) {
          const yb = L.rowY(0) + R;
          threadLine(g, [axisX, yb], [axisX, lerp(yb, L.rowY(6) - R, ax)], PAL.thread, 2.4, [8, 6]);
        }
        L.rooms.forEach((rm, i) => {
          const p = (t - fillT[i]) / 0.32;
          if (p <= 0) return;
          if (rm.type === "empty") {
            const q = p * 0.55;
            if (rm.j === axisJ && q < 1) {
              g.save();
              poly(g, hexPts(rm.x, rm.y, R * (1 + 0.15 * q)));
              g.fillStyle = `rgba(247,237,214,${0.35 * (1 - q)})`;
              g.fill();
              g.strokeStyle = `rgba(247,237,214,${1 - q})`;
              g.lineWidth = 7;
              g.stroke();
              g.restore();
            }
            return;
          }
          blit(g, sp[rm.type], rm.x, rm.y, easeBack(p), 0, clamp(p * 3));
        });
      },
      tap(_x, _y, t) {
        if (host.reduced) return 0;
        t0 = t;
        return settle;
      },
    };
  });
}

// ---------- p3: cool down, Li and Nb shift the same way, the arrow appears ----------

function page3(host: SceneHost): Scene {
  return makeScene(host, TEXT[2], 303, (k, bg) => {
    const R = 56;
    const L = lattice(k, R, 520, 385, 5, 1);
    const roomPat = fabric(k.s, k.rng, "pin", PAL.room, PAL.roomInk, 36);
    const roomSp = patchSprite(k.s, { R, pat: roomPat, stitch: PAL.roomInk });
    const openSp = patchSprite(k.s, { R, stitch: PAL.thread, open: true });
    const liSp = ballSprite(k.s, liBall(k, 27), threadText);
    const nbSp = ballSprite(k.s, nbBall(k, 27), threadText);
    // ions: hot = Li in the O sheet below its room, Nb at the room centre (ch01:L90); cold = both shifted along +c
    const ions = L.rooms
      .filter((rm) => rm.type !== "empty")
      .map((rm) =>
        rm.type === "Li"
          ? { sp: liSp, x: rm.x, hot: L.rowY(2 * rm.k), cold: L.rowY(2 * rm.k) - 0.85 * R }
          : { sp: nbSp, x: rm.x, hot: rm.y, cold: rm.y - 0.42 * R },
      );
    // thermometer (static parts)
    const tube: Pt[] = [
      [95, 150],
      [135, 150],
      [135, 585],
      [95, 585],
    ];
    const whiteFelt = fabric(k.s, k.rng, "felt", PAL.ivory, PAL.ivory, 40);
    const redFelt = fabric(k.s, k.rng, "felt", PAL.li, PAL.li, 40);
    bg.save();
    bg.shadowColor = "rgba(0,0,0,0.4)";
    bg.shadowBlur = 5 * k.s;
    bg.shadowOffsetY = 3 * k.s;
    poly(bg, tube);
    bg.fillStyle = whiteFelt;
    bg.fill();
    bg.beginPath();
    bg.arc(115, 618, 42, 0, Math.PI * 2);
    bg.fillStyle = redFelt;
    bg.fill();
    bg.restore();
    blanket(bg, tube, PAL.threadDark, 5, 8, 1.4);
    blanket(bg, circlePts(115, 618, 42), PAL.liInk, 6, 8, 1.4);
    bg.strokeStyle = PAL.threadDark;
    bg.lineWidth = 2;
    bg.beginPath();
    for (let i = 0; i < 6; i++) {
      bg.moveTo(135, 190 + i * 66);
      bg.lineTo(122, 190 + i * 66);
    }
    bg.stroke();
    // sun (hot) and snowflake (cold) appliqué
    bg.fillStyle = PAL.nb;
    bg.beginPath();
    bg.arc(190, 160, 17, 0, Math.PI * 2);
    bg.fill();
    blanket(bg, circlePts(190, 160, 17, 12), PAL.nbInk, 4, 6, 1.2);
    bg.strokeStyle = PAL.nb;
    bg.lineWidth = 4;
    bg.lineCap = "round";
    bg.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      bg.moveTo(190 + Math.cos(a) * 24, 160 + Math.sin(a) * 24);
      bg.lineTo(190 + Math.cos(a) * 33, 160 + Math.sin(a) * 33);
    }
    bg.stroke();
    bg.strokeStyle = PAL.thread;
    bg.lineWidth = 3.5;
    bg.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 2;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      bg.moveTo(190 - ux * 26, 540 - uy * 26);
      bg.lineTo(190 + ux * 26, 540 + uy * 26);
      for (const sgn of [-1, 1]) {
        const ex = 190 + sgn * ux * 16;
        const ey = 540 + sgn * uy * 16;
        bg.moveTo(ex - uy * 7 + sgn * ux * 7, ey + ux * 7 + sgn * uy * 7);
        bg.lineTo(ex, ey);
        bg.lineTo(ex + uy * 7 + sgn * ux * 7, ey - ux * 7 + sgn * uy * 7);
      }
    }
    bg.stroke();
    let t0 = 0;
    const settle = 2.4;
    const AX = 868;
    const AL = 420;
    return {
      settle,
      draw(g, tAbs) {
        const t = tAbs - t0;
        const cool = easeIO((t - 0.15) / 1.0);
        const sh = easeIO((t - 0.6) / 0.9);
        const ap = ease((t - 1.5) / 0.6);
        // mercury
        const lvl = lerp(170, 540, cool);
        g.fillStyle = redFelt;
        g.fillRect(104, lvl, 22, 600 - lvl);
        threadLine(g, [115, lvl + 6], [115, 590], PAL.liInk, 1.3, [4, 4]);
        for (const c of L.oCells) blit(g, c.sp, c.x, c.y);
        for (const rm of L.rooms) blit(g, rm.type === "empty" ? openSp : roomSp, rm.x, rm.y);
        if (sh > 0)
          for (const ion of ions) {
            g.save();
            g.globalAlpha = 0.75 * sh;
            g.setLineDash([4, 4]);
            g.strokeStyle = PAL.thread;
            g.lineWidth = 2;
            g.beginPath();
            g.arc(ion.x, ion.hot, 26, 0, Math.PI * 2);
            g.stroke();
            g.restore();
          }
        for (const ion of ions) blit(g, ion.sp, ion.x, lerp(ion.hot, ion.cold, sh));
        if (cool < 1) {
          const gr = g.createRadialGradient(520, 385, 40, 520, 385, 420);
          gr.addColorStop(0, `rgba(255,150,50,${0.55 * (1 - cool)})`);
          gr.addColorStop(1, "rgba(255,150,50,0)");
          g.save();
          g.globalCompositeOperation = "screen";
          g.fillStyle = gr;
          g.fillRect(200, 40, 640, 690);
          g.restore();
        }
        if (ap > 0) {
          g.save();
          g.beginPath();
          g.rect(AX - 150, 385 + AL / 2 + 10 - (AL + 20) * ap, 300, (AL + 20) * ap);
          g.clip();
          drawArrow(g, k.felt, AX, 385, AL, 0, 1);
          g.restore();
        }
      },
      tap(_x, _y, t) {
        if (host.reduced) return 0;
        t0 = t;
        return settle;
      },
    };
  });
}

// ---------- p4: comb electrode flips stripes of arrows ----------

function page4(host: SceneHost): Scene {
  return makeScene(host, TEXT[3], 404, (k, bg) => {
    const X0 = 180;
    const X1 = 900;
    const Y0 = 250;
    const Y1 = 630;
    const SW = (X1 - X0) / 6;
    const w = SW / 2;
    const R = w / SQ3;
    const cream = [fabric(k.s, k.rng, "pin", PAL.ivory, PAL.tan, 40), fabric(k.s, k.rng, "floral", PAL.ecru, PAL.rose, 40, PAL.nb)];
    const apri = [fabric(k.s, k.rng, "dots", PAL.apricot, "#FFE7D6", 30), fabric(k.s, k.rng, "pin", "#EF9C7C", "#FFF0E4", 40)];
    const upSp = cream.map((pat) => patchSprite(k.s, { R, pat, stitch: PAL.tan }));
    const dnSp = apri.map((pat) => patchSprite(k.s, { R, pat, stitch: "#FFF0E4" }));
    const cells: { x: number; y: number; st: number; v: number }[] = [];
    for (let r = 0; r < 10; r++)
      for (let j = -1; j < 13; j++) {
        const x = X0 + (r % 2 ? 0.75 : 0.25) * w + j * w;
        const y = Y0 - 10 + r * 1.5 * R;
        if (x < X0 - R || x > X1 + R || y > Y1 + R) continue;
        cells.push({ x, y, st: clamp(Math.floor((x - X0) / SW), 0, 5), v: k.rng() < 0.5 ? 0 : 1 });
      }
    const gold = fabric(k.s, k.rng, "lame", PAL.gold, "#FFE9A8", 24);
    const cord = (g: Ctx, pts: Pt[]): void => {
      g.save();
      g.strokeStyle = "#2A2A30";
      g.lineWidth = 6;
      g.lineJoin = "round";
      g.lineCap = "round";
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.strokeStyle = PAL.thread;
      g.lineWidth = 1.4;
      g.beginPath();
      for (let i = 0; i + 1 < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[i + 1];
        const len = Math.hypot(bx - ax, by - ay);
        const n = Math.floor(len / 22);
        for (let q = 1; q < n; q++) {
          const x = ax + ((bx - ax) * q) / n;
          const y = ay + ((by - ay) * q) / n;
          const nx = -(by - ay) / len;
          const ny = (bx - ax) / len;
          g.moveTo(x - nx * 6, y - ny * 6);
          g.lineTo(x + nx * 6, y + ny * 6);
        }
      }
      g.stroke();
      g.restore();
    };
    // static: battery, bottom electrode and its cord
    const batt: Pt[] = [
      [62, 360],
      [138, 360],
      [138, 540],
      [62, 540],
    ];
    cord(bg, [
      [100, 540],
      [100, 648],
      [X0, 648],
    ]);
    bg.save();
    bg.shadowColor = "rgba(0,0,0,0.45)";
    bg.shadowBlur = 5 * k.s;
    bg.shadowOffsetY = 3 * k.s;
    poly(bg, batt);
    bg.fillStyle = fabric(k.s, k.rng, "felt", "#33333C", "#33333C", 40);
    bg.fill();
    bg.fillStyle = gold;
    bg.fillRect(84, 340, 32, 20);
    bg.fillRect(X0, 636, X1 - X0, 24);
    bg.restore();
    blanket(bg, batt, PAL.thread, 6, 8, 1.4);
    blanket(
      bg,
      [
        [X0, 636],
        [X1, 636],
        [X1, 660],
        [X0, 660],
      ],
      PAL.threadDark,
      5,
      8,
      1.3,
    );
    bg.strokeStyle = PAL.nb;
    bg.lineWidth = 6;
    bg.lineCap = "round";
    bg.beginPath();
    bg.moveTo(100, 390);
    bg.lineTo(100, 426);
    bg.moveTo(82, 408);
    bg.lineTo(118, 408);
    bg.moveTo(82, 500);
    bg.lineTo(118, 500);
    bg.stroke();
    // lightning bolt on the battery
    poly(bg, [
      [108, 438],
      [86, 466],
      [100, 466],
      [92, 488],
      [114, 458],
      [100, 458],
    ]);
    bg.fillStyle = PAL.nb;
    bg.fill();

    const teeth = [1, 3, 5];
    // bake the two slab states (all-up fabrics; down fabrics under the teeth only)
    const slabUp = layer(X1 - X0, Y1 - Y0, k.s);
    const slabDn = layer(X1 - X0, Y1 - Y0, k.s);
    slabUp.g.translate(-X0, -Y0);
    slabDn.g.translate(-X0, -Y0);
    for (const c of cells) {
      blit(slabUp.g, upSp[c.v], c.x, c.y);
      if (teeth.includes(c.st)) blit(slabDn.g, dnSp[c.v], c.x, c.y);
    }
    const events: number[] = [host.reduced ? -1e9 : 0.85];
    const settle = 1.9;
    return {
      settle,
      draw(g, t) {
        let ang = 0;
        events.forEach((e, i) => (ang += (i % 2 ? -1 : 1) * Math.PI * easeIO((t - e) / 0.7)));
        const fade = clamp(ang / Math.PI);
        g.drawImage(slabUp.c, X0, Y0, X1 - X0, Y1 - Y0);
        if (fade > 0) {
          g.save();
          g.globalAlpha = fade;
          g.drawImage(slabDn.c, X0, Y0, X1 - X0, Y1 - Y0);
          g.restore();
        }
        g.save();
        g.strokeStyle = "rgba(0,0,0,0.45)";
        g.lineWidth = 2;
        g.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
        g.restore();
        for (let st = 0; st < 6; st++) drawArrow(g, k.felt, X0 + (st + 0.5) * SW, 440, 196, teeth.includes(st) ? ang : 0);
        // comb electrode
        const drop = host.reduced ? 0 : -80 * (1 - ease((t - 0.1) / 0.5));
        cord(g, [
          [100, 360],
          [100, 166 + drop],
          [X0, 166 + drop],
        ]);
        const comb: Pt[] = [[X0, 148 + drop]];
        comb.push([X1, 148 + drop], [X1, 184 + drop]);
        for (let i = teeth.length - 1; i >= 0; i--) {
          const xc = X0 + (teeth[i] + 0.5) * SW;
          comb.push([xc + 36, 184 + drop], [xc + 36, Y0 + 6 + drop], [xc - 36, Y0 + 6 + drop], [xc - 36, 184 + drop]);
        }
        comb.push([X0, 184 + drop]);
        g.save();
        g.shadowColor = "rgba(0,0,0,0.45)";
        g.shadowBlur = 5 * k.s;
        g.shadowOffsetY = 3 * k.s;
        poly(g, comb);
        g.fillStyle = gold;
        g.fill();
        g.restore();
        blanket(g, comb, PAL.threadDark, 5, 8, 1.3);
        // zap glow before each flip
        let z = 0;
        for (const e of events) z = Math.max(z, Math.sin(Math.PI * clamp((t - e + 0.3) / 0.6)));
        if (z > 0.01)
          for (const st of teeth) {
            const xc = X0 + (st + 0.5) * SW;
            const gr = g.createRadialGradient(xc, Y0, 4, xc, Y0, 90);
            gr.addColorStop(0, `rgba(255,248,200,${0.85 * z})`);
            gr.addColorStop(1, "rgba(255,230,120,0)");
            g.fillStyle = gr;
            g.fillRect(xc - 90, Y0 - 90, 180, 180);
            g.save();
            g.strokeStyle = `rgba(255,214,60,${z})`;
            g.lineWidth = 4;
            g.lineJoin = "round";
            g.beginPath();
            for (const sx of [-22, 22]) {
              g.moveTo(xc + sx, Y0 + 6);
              g.lineTo(xc + sx * 1.5, Y0 + 26);
              g.lineTo(xc + sx * 1.1, Y0 + 32);
              g.lineTo(xc + sx * 1.7, Y0 + 56);
            }
            g.stroke();
            g.restore();
          }
      },
      tap(_x, _y, t) {
        if (host.reduced) {
          events.push(-1e9);
          return 0;
        }
        const e = Math.max(t, (events[events.length - 1] ?? 0) + 0.7) + 0.3;
        events.push(e);
        return e - t + 0.8;
      },
    };
  });
}

export const pages = [page1, page2, page3, page4];
