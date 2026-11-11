import { palette } from '../palette';
import { type BoothSlot, toScreen } from '../world';
import {
  at,
  type Box,
  box,
  type Ctx,
  lerp,
  onPlane,
  oval,
  poly,
  rectPoints,
  scallops,
  signBoard,
} from './draw';

/**
 * The game booths.
 */

const BOOTH_SCHEMES = [
  {
    wall: palette.gold,
    wallShade: palette.goldShade,
    awning: [palette.blue, palette.cream],
    awningShade: [palette.blueShade, palette.creamShade],
  },
  {
    wall: palette.cream,
    wallShade: palette.creamShade,
    awning: [palette.red, palette.cream],
    awningShade: [palette.redShade, palette.creamShade],
  },
  {
    wall: palette.sky2,
    wallShade: palette.blue,
    awning: [palette.gold, palette.cream],
    awningShade: [palette.goldShade, palette.creamShade],
  },
  {
    wall: palette.pink,
    wallShade: palette.pinkShade,
    awning: [palette.red, palette.gold],
    awningShade: [palette.redShade, palette.goldShade],
  },
] as const;
const CLOSED_SCHEME = {
  wall: palette.closed,
  wallShade: palette.closedShade,
  awning: [palette.closed, palette.metal],
  awningShade: [palette.closedShade, palette.metalShade],
} as const;

const BOOTH_WALL = 34;
/** How far above a booth's footprint its sign hangs. */
export const BOOTH_SIGN_HEIGHT = BOOTH_WALL + 22;

function target(ctx: Ctx, r: number) {
  const rings = [palette.red, palette.cream, palette.red, palette.cream];
  rings.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 - i / rings.length), 0, Math.PI * 2);
    ctx.fill();
  });
}

function booth(ctx: Ctx, slot: BoothSlot, name: string, t: number, glow: boolean) {
  const open = slot.gameId !== undefined;
  const scheme = open ? BOOTH_SCHEMES[slot.index % BOOTH_SCHEMES.length] : CLOSED_SCHEME;
  const x0 = slot.x + 0.15;
  const y0 = slot.y + 0.15;
  const s = 1.7;
  const x1 = x0 + s;
  const y1 = y0 + s;
  const wall = BOOTH_WALL;

  poly(ctx, rectPoints({ x: x0 + 0.35, y: y0 + 0.35, w: s, h: s }), palette.shadow);
  box(ctx, x0, y0, s, s, 0, wall, scheme.wall, scheme.wall, scheme.wallShade);

  // A window and counter on both faces we can see.
  const windows = [
    { a: { x: x0 + 0.15, y: y1 }, b: { x: x1 - 0.15, y: y1 }, out: { x: 0, y: 1 } },
    { a: { x: x1, y: y1 - 0.15 }, b: { x: x1, y: y0 + 0.15 }, out: { x: 1, y: 0 } },
  ];
  windows.forEach(({ a, b, out }, side) => {
    poly(
      ctx,
      [at(a.x, a.y, 9), at(b.x, b.y, 9), at(b.x, b.y, wall - 7), at(a.x, a.y, wall - 7)],
      palette.opening,
    );
    if (open) {
      for (let i = 0; i < 4; i++) {
        const p = at(lerp(a.x, b.x, (i + 0.5) / 4), lerp(a.y, b.y, (i + 0.5) / 4), 13);
        const hop = Math.sin(t * 2 + i + slot.index + side) > 0.9 ? 1.5 : 0;
        const color = palette.balloons[(i + side + slot.index) % palette.balloons.length];
        oval(ctx, p[0], p[1] - hop, 2.6, 2.6, color);
        oval(ctx, p[0] - 1.6, p[1] - 2.4 - hop, 1, 1, color);
        oval(ctx, p[0] + 1.6, p[1] - 2.4 - hop, 1, 1, color);
      }
    } else {
      // Shutters down.
      for (let i = 0; i < 4; i++) {
        const z = 9 + i * 3;
        poly(
          ctx,
          [at(a.x, a.y, z), at(b.x, b.y, z), at(b.x, b.y, z + 2.2), at(a.x, a.y, z + 2.2)],
          palette.metalShade,
        );
      }
    }
    const lip = 0.14;
    const aOut = { x: a.x + out.x * lip, y: a.y + out.y * lip };
    const bOut = { x: b.x + out.x * lip, y: b.y + out.y * lip };
    poly(
      ctx,
      [at(a.x, a.y, 9), at(b.x, b.y, 9), at(bOut.x, bOut.y, 9), at(aOut.x, aOut.y, 9)],
      palette.woodLight,
    );
    poly(
      ctx,
      [at(aOut.x, aOut.y, 9), at(bOut.x, bOut.y, 9), at(bOut.x, bOut.y, 7), at(aOut.x, aOut.y, 7)],
      palette.woodDark,
    );
  });

  box(
    ctx,
    x0 - 0.06,
    y0 - 0.06,
    s + 0.12,
    s + 0.12,
    wall,
    3,
    scheme.wall,
    scheme.wallShade,
    scheme.wallShade,
  );

  // Striped awnings over each window.
  const reach = open ? 0.42 : 0.12;
  const strips = 8;
  for (let i = 0; i < strips; i++) {
    const ya = lerp(y1 + 0.06, y0 - 0.06, i / strips);
    const yb = lerp(y1 + 0.06, y0 - 0.06, (i + 1) / strips);
    poly(
      ctx,
      [
        at(x1 + 0.06, ya, wall),
        at(x1 + 0.06, yb, wall),
        at(x1 + 0.06 + reach, yb, wall - 8),
        at(x1 + 0.06 + reach, ya, wall - 8),
      ],
      scheme.awningShade[i % 2],
    );
  }
  scallops(
    ctx,
    { x: x1 + 0.06 + reach, y: y1 + 0.06 },
    { x: x1 + 0.06 + reach, y: y0 - 0.06 },
    wall - 8,
    strips,
    2.5,
    scheme.awningShade,
  );
  for (let i = 0; i < strips; i++) {
    const xa = lerp(x0 - 0.06, x1 + 0.06, i / strips);
    const xb = lerp(x0 - 0.06, x1 + 0.06, (i + 1) / strips);
    poly(
      ctx,
      [
        at(xa, y1 + 0.06, wall),
        at(xb, y1 + 0.06, wall),
        at(xb, y1 + 0.06 + reach, wall - 8),
        at(xa, y1 + 0.06 + reach, wall - 8),
      ],
      scheme.awning[i % 2],
    );
  }
  scallops(
    ctx,
    { x: x0 - 0.06, y: y1 + 0.06 + reach },
    { x: x1 + 0.06, y: y1 + 0.06 + reach },
    wall - 8,
    strips,
    2.5,
    scheme.awning,
  );

  // The sign on the roof, with the game's name on it.
  const signAt = at(x0 + s / 2, y0 + s / 2, BOOTH_SIGN_HEIGHT - 6);
  onPlane(ctx, signAt, () => {
    ctx.fillStyle = palette.woodDark;
    ctx.fillRect(-20, 2, 2, 12);
    ctx.fillRect(18, 2, 2, 12);
    if (open) {
      ctx.save();
      ctx.translate(0, -18);
      target(ctx, 9);
      ctx.restore();
    }
    signBoard(
      ctx,
      name,
      60,
      16,
      open
        ? { board: palette.cream, edge: palette.red, text: palette.red }
        : { board: palette.metal, edge: palette.closedShade, text: palette.closedShade },
      glow,
    );
    if (open) {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = Math.sin(t * 5 + i * 1.3) > -0.2 ? palette.gold : palette.goldShade;
        ctx.beginPath();
        ctx.arc(-28 + i * (56 / 7), -10, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/** The screen box a booth and its sign are drawn in. */
export function boothBounds(slot: BoothSlot): Box {
  const c = toScreen(slot.x + 1, slot.y + 1);
  return { left: c.x - 32, right: c.x + 32, top: c.y - BOOTH_SIGN_HEIGHT - 30, bottom: c.y + 18 };
}

export function drawBooth(ctx: Ctx, slot: BoothSlot, name: string, t: number, glow: boolean) {
  booth(ctx, slot, name, t, glow);
}
