import { palette } from '../palette';
import { CART_KINDS, type MidwayMap, type Prop, toScreen } from '../world';
import {
  at,
  BLUE,
  type Box,
  box,
  type Ctx,
  dome,
  flags,
  knob,
  lerp,
  onPlane,
  oval,
  poly,
  type Pt,
  rectPoints,
  signBoard,
  stripedWall,
  stroke,
} from './draw';
import { bigTop, carousel, peakedTent, roundTent, TENT_COLORS } from './tents';
import { billboard, BILLBOARD_HEIGHT, billboardBounds } from './billboard';
import { person, visitorLook } from './people';

/**
 * The midway's props, from carts and benches to the ferris wheel, and drawProp
 * which draws any of them.
 */

function wheel(ctx: Ctx, x: number, y: number, r: number) {
  oval(ctx, x, y, r, r, palette.woodDark);
  oval(ctx, x, y, r * 0.65, r * 0.65, palette.gold);
  oval(ctx, x, y, r * 0.25, r * 0.25, palette.woodDark);
}

function wagon(ctx: Ctx, prop: Prop) {
  const body =
    prop.variant % 2 === 0
      ? { top: palette.red, left: palette.red, right: palette.redShade }
      : { top: palette.blue, left: palette.blue, right: palette.blueShade };
  const x = prop.x + 0.1;
  const y = prop.y + 0.1;
  const w = prop.w - 0.2;
  const d = prop.h - 0.25;
  poly(ctx, rectPoints({ x: x + 0.3, y: y + 0.3, w, h: d }), palette.shadow);
  box(ctx, x, y, w, d, 7, 24, body.top, body.left, body.right);
  // Cage bars along the side.
  for (let i = 1; i < 14; i++) {
    const bx = lerp(x + 0.3, x + w - 0.3, i / 14);
    stroke(ctx, [at(bx, y + d, 11), at(bx, y + d, 27)], palette.cream, 1.4);
  }
  poly(
    ctx,
    [
      at(x + 0.25, y + d, 11),
      at(x + w - 0.25, y + d, 11),
      at(x + w - 0.25, y + d, 12.5),
      at(x + 0.25, y + d, 12.5),
    ],
    palette.gold,
  );
  box(
    ctx,
    x - 0.05,
    y - 0.05,
    w + 0.1,
    d + 0.1,
    31,
    3,
    palette.gold,
    palette.goldShade,
    palette.goldShade,
  );
  // A gold crest on the side, and the wheels.
  const crest = at(x + w / 2, y + d, 33);
  oval(ctx, crest[0], crest[1] - 2, 7, 4, palette.gold);
  for (const wx of [x + 0.45, x + w - 0.45]) {
    const p = at(wx, y + d + 0.02, 6);
    wheel(ctx, p[0], p[1], 6);
  }
}

function cart(ctx: Ctx, prop: Prop, t: number) {
  const kind = prop.variant % CART_KINDS.length;
  const x = prop.x + 0.18;
  const y = prop.y + 0.3;
  const w = 0.64;
  const d = 0.45;
  const look = visitorLook(prop.x + prop.y);
  // The vendor stands behind the cart.
  const vendor = at(prop.x + 0.5, prop.y + 0.12);
  person(ctx, vendor[0], vendor[1], { ...look, shirt: palette.cream, cap: palette.red });
  poly(ctx, rectPoints({ x: x + 0.15, y: y + 0.15, w, h: d }), palette.shadow);

  const body =
    kind === 0
      ? { top: palette.cream, left: palette.red, right: palette.redShade }
      : kind === 1
        ? { top: palette.cream, left: palette.pink, right: palette.pinkShade }
        : { top: palette.cream, left: palette.blue, right: palette.blueShade };
  box(ctx, x, y, w, d, 5, 14, body.top, body.left, body.right);
  stripedWall(ctx, { x, y: y + d }, { x: x + w, y: y + d }, 9, 3, 6, [palette.cream, body.left]);
  const wheelAt = at(x + w * 0.3, y + d + 0.02, 5);
  wheel(ctx, wheelAt[0], wheelAt[1], 5);
  const top = at(x + w / 2, y + d / 2, 19);

  if (kind === 0) {
    box(
      ctx,
      x + 0.06,
      y + 0.06,
      w - 0.12,
      d - 0.12,
      19,
      10,
      'rgba(255,255,255,0.35)',
      'rgba(255,255,255,0.45)',
      'rgba(255,255,255,0.3)',
    );
    for (let i = 0; i < 9; i++)
      oval(
        ctx,
        top[0] - 8 + (i % 5) * 4,
        top[1] - 3 - Math.floor(i / 5) * 3 - (i % 2),
        2,
        2,
        palette.cream,
      );
    box(ctx, x, y, w, d, 29, 2, palette.red, palette.red, palette.redShade);
  } else if (kind === 1) {
    for (let i = 0; i < 3; i++) {
      const sx = top[0] - 7 + i * 7;
      const bob = Math.sin(t * 2 + i) * 0.5;
      stroke(
        ctx,
        [
          [sx, top[1]],
          [sx, top[1] - 9],
        ],
        palette.cream,
        1,
      );
      oval(ctx, sx, top[1] - 13 + bob, 4.5, 4.5, palette.pink);
      oval(ctx, sx - 1.5, top[1] - 14.5 + bob, 1.8, 1.8, palette.cream);
    }
  } else if (kind === 2) {
    stroke(ctx, [top, [top[0], top[1] - 22]], palette.metalShade, 1.2);
    dome(ctx, [top[0], top[1] - 18], 0.75, 0, 9, BLUE, 0, 10);
    for (let i = 0; i < 3; i++)
      oval(
        ctx,
        top[0] - 6 + i * 6,
        top[1] - 2,
        2.5,
        2.5,
        [palette.pink, palette.cream, palette.woodLight][i],
      );
  } else {
    // A giant drink on the roof.
    const [cx, cy] = top;
    poly(
      ctx,
      [
        [cx - 5, cy],
        [cx + 5, cy],
        [cx + 7, cy - 16],
        [cx - 7, cy - 16],
      ],
      palette.red,
    );
    poly(
      ctx,
      [
        [cx - 5.5, cy - 6],
        [cx + 5.5, cy - 6],
        [cx + 6, cy - 10],
        [cx - 6, cy - 10],
      ],
      palette.cream,
    );
    oval(ctx, cx, cy - 16, 7, 2, palette.cream);
    stroke(
      ctx,
      [
        [cx + 1, cy - 16],
        [cx + 4, cy - 24],
      ],
      palette.cream,
      1.5,
    );
  }

  // A little sign above it all.
  const sign = at(prop.x + 0.5, prop.y + 0.5, kind === 2 ? 50 : 42);
  onPlane(ctx, sign, () =>
    signBoard(ctx, CART_KINDS[kind].toUpperCase(), 30, 9, {
      board: palette.board,
      edge: palette.woodDark,
      text: palette.ink,
    }),
  );
}

function ticketBooth(ctx: Ctx, prop: Prop) {
  const x = prop.x + 0.15;
  const y = prop.y + 0.15;
  poly(ctx, rectPoints({ x: x + 0.2, y: y + 0.2, w: 0.7, h: 0.7 }), palette.shadow);
  box(ctx, x, y, 0.7, 0.7, 0, 26, palette.cream, palette.red, palette.redShade);
  poly(
    ctx,
    [
      at(x + 0.15, y + 0.7, 10),
      at(x + 0.55, y + 0.7, 10),
      at(x + 0.55, y + 0.7, 20),
      at(x + 0.15, y + 0.7, 20),
    ],
    palette.opening,
  );
  for (let i = 0; i < 6; i++) {
    const xa = lerp(x - 0.05, x + 0.75, i / 6);
    const xb = lerp(x - 0.05, x + 0.75, (i + 1) / 6);
    poly(
      ctx,
      [at(xa, y + 0.7, 23), at(xb, y + 0.7, 23), at(xb, y + 0.95, 17), at(xa, y + 0.95, 17)],
      i % 2 ? palette.cream : palette.blue,
    );
  }
  box(ctx, x - 0.05, y - 0.05, 0.8, 0.8, 26, 3, palette.blue, palette.blueShade, palette.blueShade);
  onPlane(ctx, at(x + 0.35, y + 0.35, 38), () =>
    signBoard(ctx, 'TICKETS', 28, 9, { board: palette.gold, edge: palette.red, text: palette.red }),
  );
}

function bench(ctx: Ctx, prop: Prop) {
  const x = prop.x + 0.12;
  const y = prop.y + 0.4;
  for (const lx of [x + 0.08, x + 0.68])
    box(ctx, lx, y + 0.05, 0.05, 0.2, 0, 6, palette.woodDark, palette.woodDark, palette.woodDark);
  box(ctx, x, y, 0.76, 0.26, 6, 2, palette.woodLight, palette.wood, palette.woodDark);
  box(ctx, x, y - 0.02, 0.76, 0.06, 8, 7, palette.woodLight, palette.wood, palette.woodDark);
}

function planter(ctx: Ctx, prop: Prop) {
  const c = at(prop.x + 0.5, prop.y + 0.5);
  oval(ctx, c[0] + 3, c[1] + 1, 10, 4, palette.shadow);
  box(
    ctx,
    prop.x + 0.28,
    prop.y + 0.28,
    0.44,
    0.44,
    0,
    8,
    palette.creamShade,
    palette.cream,
    palette.creamShade,
  );
  oval(ctx, c[0] - 3, c[1] - 13, 5, 5, palette.hedge);
  oval(ctx, c[0] + 3, c[1] - 13, 5, 5, palette.hedgeDark);
  oval(ctx, c[0], c[1] - 17, 5, 5, palette.hedgeLight);
}

function balloons(ctx: Ctx, prop: Prop, t: number) {
  const c = at(prop.x + 0.5, prop.y + 0.5);
  oval(ctx, c[0] + 2, c[1] + 1, 5, 2, palette.shadow);
  box(
    ctx,
    prop.x + 0.42,
    prop.y + 0.42,
    0.16,
    0.16,
    0,
    4,
    palette.blue,
    palette.blueShade,
    palette.blueShade,
  );
  for (let i = 0; i < 3; i++) {
    const bob = Math.sin(t * 1.8 + i + prop.x) * 1.5;
    const bx = c[0] - 6 + i * 6;
    const by = c[1] - 40 - (i === 1 ? 7 : 0) + bob;
    const color = palette.balloons[(i + prop.x) % palette.balloons.length];
    ctx.strokeStyle = palette.metalShade;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1] - 4);
    ctx.quadraticCurveTo(bx, by + 18, bx, by + 7);
    ctx.stroke();
    oval(ctx, bx, by, 5, 6.5, color);
    oval(ctx, bx - 1.8, by - 2.5, 1.4, 2, 'rgba(255,255,255,0.6)');
    poly(
      ctx,
      [
        [bx - 1, by + 7],
        [bx + 1, by + 7],
        [bx, by + 6],
      ],
      color,
    );
  }
}

/** How high the top of a bunting pole is. */
const POLE_HEIGHT = 44;

function buntingPole(ctx: Ctx, prop: Prop) {
  const [x, y] = at(prop.x + 0.5, prop.y + 0.5);
  oval(ctx, x + 2, y + 1, 4, 1.6, palette.shadow);
  poly(
    ctx,
    [
      [x - 1.3, y],
      [x + 1.3, y],
      [x + 1.3, y - POLE_HEIGHT],
      [x - 1.3, y - POLE_HEIGHT],
    ],
    palette.cream,
  );
  for (let z = 4; z < POLE_HEIGHT; z += 8)
    poly(
      ctx,
      [
        [x - 1.3, y - z],
        [x + 1.3, y - z - 2],
        [x + 1.3, y - z - 5],
        [x - 1.3, y - z - 3],
      ],
      palette.red,
    );
  knob(ctx, x, y - POLE_HEIGHT - 1);
}

/** Bunting between the poles, skipping any strung outside the view. */
export function drawBunting(ctx: Ctx, map: MidwayMap, t: number, view: Box) {
  map.bunting.forEach(([a, b], n) => {
    const p = at(a.x + 0.5, a.y + 0.5, POLE_HEIGHT - 2);
    const q = at(b.x + 0.5, b.y + 0.5, POLE_HEIGHT - 2);
    if (Math.max(p[0], q[0]) < view.left || Math.min(p[0], q[0]) > view.right) return;
    if (Math.max(p[1], q[1]) + 20 < view.top || Math.min(p[1], q[1]) > view.bottom) return;
    const sag = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.12;
    const points: Pt[] = [];
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const s = i / count;
      points.push([lerp(p[0], q[0], s), lerp(p[1], q[1], s) + 4 * sag * s * (1 - s)]);
    }
    stroke(ctx, points, palette.woodDark, 0.6);
    flags(ctx, points, t, 4, n);
  });
}

function ferrisWheel(ctx: Ctx, prop: Prop, t: number) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;
  const radius = 60;
  const hubZ = 76;
  const spread = 0.28;
  const turn = t * 0.2;
  const cars = 10;
  const hubAt = (offset: number) => at(cx, cy + offset, hubZ);
  const onWheel = (offset: number, angle: number, r = radius): Pt => {
    const [hx, hy] = hubAt(offset);
    return [
      hx + Math.cos(angle) * r * 0.894,
      hy + Math.cos(angle) * r * 0.447 - Math.sin(angle) * r,
    ];
  };
  const ring = (offset: number, r: number, color: string, width: number) => {
    const points: Pt[] = [];
    for (let i = 0; i <= 48; i++) points.push(onWheel(offset, (i / 48) * Math.PI * 2, r));
    stroke(ctx, points, color, width);
  };
  const legs = (offset: number, color: string) => {
    stroke(ctx, [at(cx - 1.4, cy + offset), hubAt(offset), at(cx + 1.4, cy + offset)], color, 4.5);
  };

  const base = at(cx, cy);
  oval(ctx, base[0] + 10, base[1] + 4, 44, 14, palette.shadow);
  legs(-spread - 0.15, palette.creamShade);
  for (const side of [-spread, spread]) {
    if (side > 0) {
      // The cars hang between the two rims.
      for (let i = 0; i < cars; i++) {
        const angle = turn + (i / cars) * Math.PI * 2;
        const [gx, gy] = onWheel(0, angle);
        stroke(
          ctx,
          [
            [gx, gy],
            [gx, gy + 4],
          ],
          palette.metalShade,
          1,
        );
        ctx.fillStyle = palette.red;
        ctx.beginPath();
        ctx.roundRect(gx - 5, gy + 4, 10, 8, 2);
        ctx.fill();
        poly(
          ctx,
          [
            [gx - 6, gy + 4],
            [gx + 6, gy + 4],
            [gx + 4, gy + 1.5],
            [gx - 4, gy + 1.5],
          ],
          palette.gold,
        );
        poly(
          ctx,
          [
            [gx - 3.5, gy + 6],
            [gx + 3.5, gy + 6],
            [gx + 3.5, gy + 8.5],
            [gx - 3.5, gy + 8.5],
          ],
          palette.cream,
        );
      }
    }
    for (let i = 0; i < cars; i++) {
      const angle = turn + (i / cars) * Math.PI * 2;
      stroke(ctx, [hubAt(side), onWheel(side, angle)], palette.cream, 1.4);
    }
    ring(side, radius * 0.6, palette.gold, 4);
    ring(side, radius, side > 0 ? palette.blue : palette.blueShade, 4.5);
  }
  stroke(ctx, [hubAt(-spread), hubAt(spread)], palette.woodDark, 4);
  const hub = hubAt(spread);
  oval(ctx, hub[0], hub[1], 7, 7, palette.wood);
  oval(ctx, hub[0], hub[1], 3.5, 3.5, palette.woodDark);
  legs(spread + 0.15, palette.cream);
  box(ctx, cx - 0.6, cy - 0.5, 1.2, 1, 0, 4, palette.creamShade, palette.cream, palette.creamShade);
}

const PROP_HEIGHTS: Record<Prop['kind'], number> = {
  'big-top': 100,
  'round-tent': 80,
  'peaked-tent': 56,
  'ferris-wheel': 150,
  carousel: 86,
  wagon: 38,
  cart: 50,
  'ticket-booth': 46,
  bench: 16,
  planter: 22,
  balloons: 52,
  'bunting-pole': 0,
  billboard: BILLBOARD_HEIGHT + 40,
};

/** Roughly the screen box a prop is drawn in. */
export function propBounds(prop: Prop): Box {
  if (prop.kind === 'billboard') return billboardBounds(prop);
  const c = toScreen(prop.x + prop.w / 2, prop.y + prop.h / 2);
  const half = ((prop.w + prop.h) * 16) / 2;
  const footprint = ((prop.w + prop.h) * 8) / 2;
  return {
    left: c.x - half,
    right: c.x + half,
    top: c.y - footprint - PROP_HEIGHTS[prop.kind],
    bottom: c.y + footprint,
  };
}

export function drawProp(ctx: Ctx, prop: Prop, t: number) {
  switch (prop.kind) {
    case 'big-top':
      return bigTop(ctx, prop, t);
    case 'round-tent': {
      const colors = TENT_COLORS[prop.variant % TENT_COLORS.length];
      return roundTent(
        ctx,
        prop.x + prop.w / 2,
        prop.y + prop.h / 2,
        1.55,
        30,
        34,
        colors,
        t,
        prop.variant % 2 ? palette.blue : palette.gold,
      );
    }
    case 'peaked-tent':
      return peakedTent(ctx, prop, t);
    case 'ferris-wheel':
      return ferrisWheel(ctx, prop, t);
    case 'carousel':
      return carousel(ctx, prop, t);
    case 'wagon':
      return wagon(ctx, prop);
    case 'cart':
      return cart(ctx, prop, t);
    case 'ticket-booth':
      return ticketBooth(ctx, prop);
    case 'bench':
      return bench(ctx, prop);
    case 'planter':
      return planter(ctx, prop);
    case 'balloons':
      return balloons(ctx, prop, t);
    case 'bunting-pole':
      return buntingPole(ctx, prop);
    case 'billboard':
      return billboard(ctx, prop, t);
  }
}
