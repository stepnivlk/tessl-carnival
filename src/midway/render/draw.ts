import { canvasFont, theme } from '../../carnival';
import { palette } from '../palette';
import { type Point, type Rect, toScreen } from '../world';

/**
 * Shared drawing helpers for the midway: points, shapes, flags, signs and
 * striped round things, in world pixels.
 */

export type Ctx = CanvasRenderingContext2D;
export type Pt = readonly [number, number];

/** A tile position, `z` pixels above the ground, in world pixels. */
export function at(x: number, y: number, z = 0): Pt {
  const s = toScreen(x, y);
  return [s.x, s.y - z];
}

/** Screen size of a one-tile radius circle lying on the ground. */
export const ISO_RX = 16 * Math.SQRT2;
export const ISO_RY = 8 * Math.SQRT2;

export function poly(ctx: Ctx, points: readonly Pt[], color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

export function oval(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function stroke(ctx: Ctx, points: readonly Pt[], color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
}

export const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

/** A tile-aligned box, `z` pixels off the ground and `h` pixels tall. */
export function box(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  d: number,
  z: number,
  h: number,
  top: string,
  left: string,
  right: string,
) {
  if (h > 0) {
    poly(
      ctx,
      [at(x, y + d, z), at(x + w, y + d, z), at(x + w, y + d, z + h), at(x, y + d, z + h)],
      left,
    );
    poly(
      ctx,
      [at(x + w, y + d, z), at(x + w, y, z), at(x + w, y, z + h), at(x + w, y + d, z + h)],
      right,
    );
  }
  poly(
    ctx,
    [at(x, y, z + h), at(x + w, y, z + h), at(x + w, y + d, z + h), at(x, y + d, z + h)],
    top,
  );
}

/** A vertical wall from one ground point to another, in alternating colour strips. */
export function stripedWall(
  ctx: Ctx,
  a: Point,
  b: Point,
  z: number,
  h: number,
  strips: number,
  colors: readonly string[],
) {
  for (let i = 0; i < strips; i++) {
    const s0 = i / strips;
    const s1 = (i + 1) / strips;
    const x0 = lerp(a.x, b.x, s0);
    const y0 = lerp(a.y, b.y, s0);
    const x1 = lerp(a.x, b.x, s1);
    const y1 = lerp(a.y, b.y, s1);
    poly(
      ctx,
      [at(x0, y0, z), at(x1, y1, z), at(x1, y1, z + h), at(x0, y0, z + h)],
      colors[i % colors.length],
    );
  }
}

/** A scalloped trim hanging from an edge. */
export function scallops(
  ctx: Ctx,
  a: Point,
  b: Point,
  z: number,
  count: number,
  depth: number,
  colors: readonly string[],
) {
  for (let i = 0; i < count; i++) {
    const p0 = at(lerp(a.x, b.x, i / count), lerp(a.y, b.y, i / count), z);
    const p1 = at(lerp(a.x, b.x, (i + 1) / count), lerp(a.y, b.y, (i + 1) / count), z);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + depth * 2, p1[0], p1[1]);
    ctx.closePath();
    ctx.fill();
  }
}

/** Little triangular flags hanging along a line of screen points. */
export function flags(ctx: Ctx, points: readonly Pt[], t: number, size = 5, phase = 0) {
  let n = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const flutter = Math.sin(t * 4 + i * 0.9 + phase) * 1.2;
    ctx.fillStyle = palette.bunting[n++ % palette.bunting.length];
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo((x0 + x1) / 2 + flutter, (y0 + y1) / 2 + size * 1.4);
    ctx.closePath();
    ctx.fill();
  }
}

export function flag(ctx: Ctx, x: number, y: number, t: number, color: string, size = 1) {
  stroke(
    ctx,
    [
      [x, y],
      [x, y - 14 * size],
    ],
    palette.metalShade,
    1.2,
  );
  const wave = Math.sin(t * 5 + x * 0.1) * 1.5 * size;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 14 * size);
  ctx.quadraticCurveTo(x + 6 * size, y - 16 * size + wave, x + 12 * size, y - 14 * size);
  ctx.lineTo(x + 9 * size, y - 11 * size + wave * 0.5);
  ctx.lineTo(x + 12 * size, y - 8 * size);
  ctx.quadraticCurveTo(x + 6 * size, y - 10 * size + wave, x, y - 8 * size);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws on a vertical plane facing down-left (parallel to the x axis), so
 * signs and wheels sit in the scene. Local x runs along the plane, local y down.
 */
export function onPlane(ctx: Ctx, origin: Pt, paint: () => void) {
  ctx.save();
  ctx.transform(0.894, 0.447, 0, 1, origin[0], origin[1]);
  paint();
  ctx.restore();
}

/** A wooden sign with text, in plane-local coordinates centred on (0, 0). */
export function signBoard(
  ctx: Ctx,
  text: string,
  width: number,
  height: number,
  colors: { board: string; edge: string; text: string },
  glow = false,
) {
  ctx.fillStyle = colors.edge;
  ctx.beginPath();
  ctx.roundRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4, 4);
  ctx.fill();
  ctx.fillStyle = colors.board;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, 3);
  ctx.fill();
  if (glow) {
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.font = canvasFont('small', 'bold');
  const fit = Math.min(
    (height * 0.62) / theme.font.small,
    (width - 8) / ctx.measureText(text).width,
  );
  ctx.save();
  ctx.scale(fit, fit);
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 1);
  ctx.restore();
}

export function rectPoints(r: Rect, lift = 0): Pt[] {
  return [
    at(r.x, r.y, lift),
    at(r.x + r.w, r.y, lift),
    at(r.x + r.w, r.y + r.h, lift),
    at(r.x, r.y + r.h, lift),
  ];
}

export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Stripes {
  a: string;
  aShade: string;
  b: string;
  bShade: string;
}

export const RED: Stripes = {
  a: palette.red,
  aShade: palette.redShade,
  b: palette.cream,
  bShade: palette.creamShade,
};
export const GOLD: Stripes = {
  a: palette.gold,
  aShade: palette.goldShade,
  b: palette.cream,
  bShade: palette.creamShade,
};
export const BLUE: Stripes = {
  a: palette.blue,
  aShade: palette.blueShade,
  b: palette.cream,
  bShade: palette.creamShade,
};

export function rimPoint(c: Pt, r: number, angle: number, z: number): Pt {
  return [c[0] + Math.cos(angle) * r * ISO_RX, c[1] + Math.sin(angle) * r * ISO_RY - z];
}

/** The front half of a striped cylinder. */
export function cylinder(
  ctx: Ctx,
  c: Pt,
  r: number,
  z: number,
  h: number,
  colors: Stripes,
  count = 16,
) {
  for (let k = 0; k < count; k++) {
    const a0 = Math.max(0, (k / count) * Math.PI * 2);
    const a1 = Math.min(Math.PI, ((k + 1) / count) * Math.PI * 2);
    if (a1 <= a0) continue;
    const points: Pt[] = [];
    for (let i = 0; i <= 4; i++) points.push(rimPoint(c, r, lerp(a0, a1, i / 4), z));
    for (let i = 4; i >= 0; i--) points.push(rimPoint(c, r, lerp(a0, a1, i / 4), z + h));
    const shade = (a0 + a1) / 2 < Math.PI * 0.35;
    poly(
      ctx,
      points,
      k % 2 === 0 ? (shade ? colors.aShade : colors.a) : shade ? colors.bShade : colors.b,
    );
  }
}

/** A striped, slightly domed cone roof. `turn` spins the stripes. */
export function dome(
  ctx: Ctx,
  c: Pt,
  r: number,
  z: number,
  h: number,
  colors: Stripes,
  turn = 0,
  count = 16,
) {
  const apex: Pt = [c[0], c[1] - z - h];
  const wedges = Array.from({ length: count }, (_, k) => {
    const a0 = turn + (k / count) * Math.PI * 2;
    const a1 = turn + ((k + 1) / count) * Math.PI * 2;
    return { k, a0, a1, mid: (a0 + a1) / 2 };
  }).sort((p, q) => Math.sin(p.mid) - Math.sin(q.mid));
  for (const { k, a0, a1, mid } of wedges) {
    const control = (angle: number) => rimPoint(c, r * 0.92, angle, z + h * 0.6);
    const start = rimPoint(c, r, a0, z);
    const end = rimPoint(c, r, a1, z);
    const c0 = control(a0);
    const c1 = control(a1);
    ctx.beginPath();
    ctx.moveTo(apex[0], apex[1]);
    ctx.quadraticCurveTo(c0[0], c0[1], start[0], start[1]);
    for (let i = 1; i <= 3; i++) {
      const p = rimPoint(c, r, lerp(a0, a1, i / 3), z);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.lineTo(end[0], end[1]);
    ctx.quadraticCurveTo(c1[0], c1[1], apex[0], apex[1]);
    const shade = Math.cos(mid) > 0.45;
    ctx.fillStyle =
      k % 2 === 0 ? (shade ? colors.aShade : colors.a) : shade ? colors.bShade : colors.b;
    ctx.fill();
  }
}

/** Scallops round the front of a circle. */
export function scallopRing(
  ctx: Ctx,
  c: Pt,
  r: number,
  z: number,
  count: number,
  depth: number,
  colors: readonly string[],
) {
  for (let k = 0; k < count; k++) {
    const a0 = (k / count) * Math.PI;
    const a1 = ((k + 1) / count) * Math.PI;
    const p0 = rimPoint(c, r, a0, z);
    const p1 = rimPoint(c, r, a1, z);
    const m = rimPoint(c, r * 1.02, (a0 + a1) / 2, z - depth * 2);
    ctx.fillStyle = colors[k % colors.length];
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(m[0], m[1], p1[0], p1[1]);
    ctx.closePath();
    ctx.fill();
  }
}

export function ringFlags(ctx: Ctx, c: Pt, r: number, z: number, t: number, count = 14) {
  const points: Pt[] = [];
  for (let i = 0; i <= count; i++) {
    const angle = 0.08 + (i / count) * (Math.PI - 0.16);
    points.push(rimPoint(c, r, angle, z));
  }
  flags(ctx, points, t, 3.5);
}

export function knob(ctx: Ctx, x: number, y: number) {
  oval(ctx, x, y, 3, 3, palette.gold);
  oval(ctx, x - 1, y - 1, 1.2, 1.2, palette.cream);
}

/** A rounded callout with a line of text, pointing down at a screen point. */
export function label(ctx: Ctx, text: string, x: number, y: number) {
  const { colors, radius } = theme;
  ctx.font = canvasFont('small', 'bold');
  const width = ctx.measureText(text).width + 22;
  const height = theme.font.small + 14;
  ctx.fillStyle = colors.background;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, Math.min(radius, height / 2));
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6, y + height / 2);
  ctx.lineTo(x + 6, y + height / 2);
  ctx.lineTo(x, y + height / 2 + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
}
