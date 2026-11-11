import { palette } from '../palette';
import { type Prop } from '../world';
import {
  at,
  BLUE,
  type Ctx,
  cylinder,
  dome,
  flag,
  flags,
  GOLD,
  ISO_RX,
  ISO_RY,
  knob,
  lerp,
  oval,
  poly,
  type Pt,
  rectPoints,
  RED,
  rimPoint,
  ringFlags,
  scallopRing,
  scallops,
  stripedWall,
  type Stripes,
  stroke,
} from './draw';

/**
 * Tents: the round tents, the big top, the carousel and the peaked tents.
 */

export const TENT_COLORS = [GOLD, BLUE, BLUE, RED] as const;

export function roundTent(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  wall: number,
  roof: number,
  colors: Stripes,
  t: number,
  flagColor: string = palette.gold,
) {
  const c = at(cx, cy);
  oval(ctx, c[0] + 8, c[1] + 4, r * ISO_RX * 1.15, r * ISO_RY * 1.15, palette.shadow);
  cylinder(ctx, c, r, 0, wall, colors);
  // The door, with its curtains tied back.
  const door: Pt[] = [];
  for (let i = 0; i <= 6; i++)
    door.push(rimPoint(c, r, lerp(Math.PI / 2 - 0.24, Math.PI / 2 + 0.24, i / 6), 0));
  const top = rimPoint(c, r, Math.PI / 2, wall * 0.85);
  poly(
    ctx,
    [...door, [door[6][0], top[1] + 6], [top[0], top[1]], [door[0][0], top[1] + 6]],
    palette.opening,
  );
  stroke(ctx, [door[0], [door[0][0] + 2, top[1] + 8], [top[0], top[1]]], palette.gold, 2);
  stroke(ctx, [door[6], [door[6][0] - 2, top[1] + 8], [top[0], top[1]]], palette.gold, 2);

  scallopRing(ctx, c, r * 1.02, wall, 10, 3, [colors.a, colors.b]);
  dome(ctx, c, r * 1.12, wall, roof, colors);
  scallopRing(ctx, c, r * 1.12, wall, 12, 4, [colors.a, colors.b]);
  ringFlags(ctx, c, r * 1.05, wall + 2, t);
  const apex = c[1] - wall - roof;
  knob(ctx, c[0], apex);
  flag(ctx, c[0], apex - 2, t, flagColor);
}

export function bigTop(ctx: Ctx, prop: Prop, t: number) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;
  roundTent(ctx, cx, cy, 1.9, 38, 46, RED, t, palette.red);
  const c = at(cx, cy);
  // A second ring of bunting, and gold lights round the wall.
  ringFlags(ctx, c, 1.5, 38 + 22, t, 12);
  for (let i = 0; i < 9; i++) {
    const angle = 0.2 + (i / 8) * (Math.PI - 0.4);
    const p = rimPoint(c, 1.92, angle, 10);
    oval(ctx, p[0], p[1], 1.4, 1.4, Math.sin(t * 4 + i) > 0 ? palette.gold : palette.cream);
  }
}

export function carousel(ctx: Ctx, prop: Prop, t: number) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;
  const c = at(cx, cy);
  const turn = t * 0.5;
  const r = 1.75;
  oval(ctx, c[0] + 8, c[1] + 4, r * ISO_RX * 1.1, r * ISO_RY * 1.1, palette.shadow);
  cylinder(ctx, c, r, 0, 6, RED, 24);
  oval(ctx, c[0], c[1] - 6, r * ISO_RX, r * ISO_RY, palette.pink);
  oval(ctx, c[0], c[1] - 6, r * ISO_RX * 0.82, r * ISO_RY * 0.82, palette.pinkShade);

  const roofZ = 46;
  const horses = Array.from({ length: 8 }, (_, i) => {
    const angle = turn + (i / 8) * Math.PI * 2;
    return { i, angle, base: rimPoint(c, r * 0.72, angle, 6) };
  });
  const drawHorse = ({ i, angle, base }: (typeof horses)[number]) => {
    const bob = Math.sin(t * 3 + i * 1.4) * 3;
    const [x, y] = base;
    stroke(
      ctx,
      [
        [x, y],
        [x, y - (roofZ - 6) + (Math.sin(angle) * r * ISO_RY) / 4],
      ],
      palette.gold,
      1.4,
    );
    const facing = Math.cos(angle + Math.PI / 2) < 0 ? -1 : 1;
    const color = i % 2 ? palette.cream : palette.woodLight;
    const hy = y - 16 + bob;
    oval(ctx, x, hy, 6, 3.2, color);
    poly(
      ctx,
      [
        [x + facing * 4, hy - 1],
        [x + facing * 7, hy - 7],
        [x + facing * 9, hy - 6],
        [x + facing * 6, hy + 1],
      ],
      color,
    );
    stroke(
      ctx,
      [
        [x - 4, hy + 2],
        [x - 5, hy + 7],
      ],
      color,
      1.4,
    );
    stroke(
      ctx,
      [
        [x + 4, hy + 2],
        [x + 5, hy + 7],
      ],
      color,
      1.4,
    );
    poly(
      ctx,
      [
        [x - 2, hy - 3],
        [x + 2, hy - 3],
        [x + 1, hy - 1],
        [x - 1, hy - 1],
      ],
      palette.red,
    );
  };
  horses.filter((h) => Math.sin(h.angle) < 0).forEach(drawHorse);
  const column = rimPoint(c, 0, 0, 6);
  poly(
    ctx,
    [
      [column[0] - 5, column[1]],
      [column[0] + 5, column[1]],
      [column[0] + 5, c[1] - roofZ],
      [column[0] - 5, c[1] - roofZ],
    ],
    palette.gold,
  );
  poly(
    ctx,
    [
      [column[0] - 2, column[1]],
      [column[0] + 2, column[1]],
      [column[0] + 2, c[1] - roofZ],
      [column[0] - 2, c[1] - roofZ],
    ],
    palette.red,
  );
  horses.filter((h) => Math.sin(h.angle) >= 0).forEach(drawHorse);

  dome(ctx, c, r * 1.15, roofZ, 26, RED, turn);
  scallopRing(ctx, c, r * 1.15, roofZ, 14, 4, [palette.red, palette.cream]);
  ringFlags(ctx, c, r * 1.05, roofZ - 6, t, 16);
  knob(ctx, c[0], c[1] - roofZ - 26);
  flag(ctx, c[0], c[1] - roofZ - 28, t, palette.gold);
}

/** A tent with a ridged roof running along the x axis. */
export function peakedTent(ctx: Ctx, prop: Prop, t: number) {
  const colors = prop.variant % 2 === 0 ? BLUE : RED;
  const x0 = prop.x + 0.2;
  const x1 = prop.x + prop.w - 0.2;
  const y0 = prop.y + 0.25;
  const y1 = prop.y + prop.h - 0.25;
  const ym = (y0 + y1) / 2;
  const wall = 24;
  const roof = 26;
  const eave = 0.18;

  poly(ctx, rectPoints({ x: x0 + 0.3, y: y0 + 0.3, w: x1 - x0, h: y1 - y0 }), palette.shadow);
  // The back of the roof, mostly hidden behind the front.
  poly(
    ctx,
    [
      at(x0 - 0.1, y0 - eave, wall - 3),
      at(x1 + 0.1, y0 - eave, wall - 3),
      at(x1 + 0.1, ym, wall + roof),
      at(x0 - 0.1, ym, wall + roof),
    ],
    colors.aShade,
  );

  // The gable end, striped up to the roof line.
  const strips = 10;
  const half = (y1 - y0) / 2;
  const height = (y: number) => wall + roof * (1 - Math.abs(y - ym) / half);
  for (let i = 0; i < strips; i++) {
    const ya = lerp(y1, y0, i / strips);
    const yb = lerp(y1, y0, (i + 1) / strips);
    const points: Pt[] = [at(x1, ya, 0), at(x1, yb, 0), at(x1, yb, height(yb))];
    if ((ya - ym) * (yb - ym) < 0) points.push(at(x1, ym, height(ym)));
    points.push(at(x1, ya, height(ya)));
    poly(ctx, points, i % 2 === 0 ? colors.aShade : colors.bShade);
  }
  stripedWall(ctx, { x: x0, y: y1 }, { x: x1, y: y1 }, 0, wall, 14, [colors.a, colors.b]);
  // The entrance, on the gable end.
  const door = [
    at(x1, ym + 0.35, 0),
    at(x1, ym - 0.35, 0),
    at(x1, ym - 0.2, wall * 0.8),
    at(x1, ym, wall * 0.95),
    at(x1, ym + 0.2, wall * 0.8),
  ];
  poly(ctx, door, palette.opening);
  stroke(ctx, [door[0], door[4], door[3]], palette.gold, 1.6);
  stroke(ctx, [door[1], door[2], door[3]], palette.gold, 1.6);

  // The front of the roof.
  const roofStrips = 12;
  for (let i = 0; i < roofStrips; i++) {
    const xa = lerp(x0 - 0.1, x1 + 0.1, i / roofStrips);
    const xb = lerp(x0 - 0.1, x1 + 0.1, (i + 1) / roofStrips);
    poly(
      ctx,
      [
        at(xa, y1 + eave, wall - 3),
        at(xb, y1 + eave, wall - 3),
        at(xb, ym, wall + roof),
        at(xa, ym, wall + roof),
      ],
      i % 2 === 0 ? colors.a : colors.b,
    );
  }
  poly(
    ctx,
    [
      at(x1 + 0.1, y1 + eave, wall - 3),
      at(x1 + 0.1, ym, wall + roof),
      at(x1 + 0.1, ym, wall + roof - 2),
      at(x1 + 0.1, y1 + eave, wall - 5),
    ],
    colors.aShade,
  );
  scallops(ctx, { x: x0 - 0.1, y: y1 + eave }, { x: x1 + 0.1, y: y1 + eave }, wall - 3, 12, 3, [
    colors.a,
    colors.b,
  ]);
  const eaveLine: Pt[] = [];
  for (let i = 0; i <= 16; i++) eaveLine.push(at(lerp(x0, x1, i / 16), y1 + eave, wall - 7));
  flags(ctx, eaveLine, t, 3.5, prop.x);
  const ridgeFront = at(x1 + 0.1, ym, wall + roof);
  const ridgeBack = at(x0 - 0.1, ym, wall + roof);
  flag(ctx, ridgeBack[0], ridgeBack[1], t, palette.gold);
  flag(ctx, ridgeFront[0], ridgeFront[1], t + 1, palette.red);
}
