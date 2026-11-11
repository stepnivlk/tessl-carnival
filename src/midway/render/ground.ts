import { palette } from '../palette';
import { type MidwayMap, type Rect } from '../world';
import { at, type Box, box, type Ctx, oval, poly, rectPoints } from './draw';

/**
 * The ground: the field, the grass, the paths, the trees and the hedge.
 */

/** The world-pixel height of the horizon; the field runs off to it. */
export const HORIZON = -24;

function hash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The world-pixel box the pre-drawn ground layer covers. */
export function groundBounds(map: MidwayMap): Box {
  return {
    left: -map.height * 16 - 64,
    right: map.width * 16 + 64,
    top: -64,
    bottom: (map.width + map.height) * 8 + 4,
  };
}

/** The open field round the midway, filling the view from the horizon down. */
export function drawField(ctx: Ctx, view: Box) {
  ctx.fillStyle = palette.haze;
  ctx.fillRect(view.left, HORIZON, view.right - view.left, 6);
  ctx.fillStyle = palette.grass;
  ctx.fillRect(view.left, HORIZON + 6, view.right - view.left, Math.max(0, view.bottom - HORIZON));
}

/**
 * The most pixels the ground layer may use. Safari refuses canvases over
 * 16,777,216 pixels, and a long midway on a sharp screen would pass that.
 */
const MAX_GROUND_PIXELS = 16_000_000;

export interface GroundLayer {
  canvas: HTMLCanvasElement;
  /** Device pixels per world pixel the layer was drawn at. */
  scale: number;
}

/**
 * Draws the parts of the ground that never change (the grass, paths, trees
 * and the hedge's back two sides) once, onto an off-screen canvas covering
 * groundBounds(map). It uses `scale` device pixels per world pixel, or less
 * when that would make the canvas too big, so its size stays bounded however
 * long the midway grows.
 */
export function drawGroundLayer(map: MidwayMap, wanted: number): GroundLayer {
  const bounds = groundBounds(map);
  const area = (bounds.right - bounds.left) * (bounds.bottom - bounds.top);
  const scale = Math.min(wanted, Math.sqrt(MAX_GROUND_PIXELS / area));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((bounds.right - bounds.left) * scale);
  canvas.height = Math.ceil((bounds.bottom - bounds.top) * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, -bounds.left * scale, -bounds.top * scale);

  // Lighter plots of grass inside the hedge, raised a little above the paths.
  poly(ctx, rectPoints({ x: 0, y: 0, w: map.width, h: map.height }), palette.grassLight);
  for (const path of map.paths) poly(ctx, rectPoints(path, 3), palette.grassEdge);
  for (const path of map.paths) poly(ctx, rectPoints(path), palette.path);

  // Tufts of grass.
  ctx.strokeStyle = palette.grassDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 1; y < map.height - 1; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      if (map.ground[y * map.width + x] !== 'grass' || hash(x, y) > 0.5) continue;
      const [px, py] = at(x + hash(x, y, 1), y + hash(x, y, 2));
      ctx.moveTo(px - 2, py - 2);
      ctx.lineTo(px, py);
      ctx.lineTo(px + 2, py - 3);
    }
  }
  ctx.stroke();

  // Trees out in the field behind the midway.
  for (let i = 0; i < map.width; i += 2) tree(ctx, i + 0.5 + hash(i, 1) * 0.6, -1.4 - hash(i, 2));
  for (let i = 2; i < map.height; i += 2) tree(ctx, -1.4 - hash(1, i), i + 0.5 + hash(2, i) * 0.6);

  hedge(ctx, { x: 0, y: 0, w: map.width, h: 1 });
  hedge(ctx, { x: 0, y: 0, w: 1, h: map.height });
  return { canvas, scale };
}

function tree(ctx: Ctx, x: number, y: number) {
  const [px, py] = at(x, y);
  oval(ctx, px + 4, py + 1, 12, 5, palette.shadow);
  poly(
    ctx,
    [
      [px - 1.5, py],
      [px + 1.5, py],
      [px + 1.5, py - 12],
      [px - 1.5, py - 12],
    ],
    palette.woodDark,
  );
  oval(ctx, px, py - 20, 11, 11, palette.hedgeDark);
  oval(ctx, px - 2, py - 22, 9, 9, palette.hedge);
  oval(ctx, px - 4, py - 25, 4, 4, palette.hedgeLight);
}

function hedge(ctx: Ctx, area: Rect) {
  box(
    ctx,
    area.x + 0.15,
    area.y + 0.15,
    area.w - 0.3,
    area.h - 0.3,
    0,
    9,
    palette.hedgeLight,
    palette.hedge,
    palette.hedgeDark,
  );
}

/** The hedge's front two sides, which can stand in front of anything. */
export function drawFrontHedge(ctx: Ctx, map: MidwayMap) {
  const h = map.height - 1;
  hedge(ctx, { x: map.width - 1, y: 1, w: 1, h: map.height - 1 });
  hedge(ctx, { x: 1, y: h, w: map.avenueX - 1, h: 1 });
  hedge(ctx, { x: map.avenueX + 2, y: h, w: map.width - map.avenueX - 3, h: 1 });
}
