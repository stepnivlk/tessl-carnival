import { palette } from '../palette';
import { type Ctx, oval } from './draw';

/**
 * The sky: clouds and floating balloons.
 */

export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export function drawCloud(ctx: Ctx, x: number, y: number, size: number) {
  ctx.fillStyle = palette.cloud;
  ctx.beginPath();
  ctx.roundRect(x - 30 * size, y - 8 * size, 60 * size, 12 * size, 6 * size);
  ctx.arc(x - 14 * size, y - 8 * size, 11 * size, 0, Math.PI * 2);
  ctx.arc(x + 4 * size, y - 13 * size, 15 * size, 0, Math.PI * 2);
  ctx.arc(x + 20 * size, y - 6 * size, 9 * size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.cloudShade;
  ctx.beginPath();
  ctx.roundRect(x - 30 * size, y, 60 * size, 4 * size, 2 * size);
  ctx.fill();
}

export interface Floater {
  x: number;
  y: number;
  age: number;
  color: string;
}

/** Balloons someone let go of, drifting up into the sky. */
export function drawFloaters(ctx: Ctx, floaters: readonly Floater[]) {
  for (const f of floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, 6 - f.age));
    const sway = Math.sin(f.age * 2) * 3;
    ctx.strokeStyle = palette.metalShade;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(f.x + sway, f.y + 7);
    ctx.quadraticCurveTo(f.x + sway - 3, f.y + 13, f.x + sway, f.y + 18);
    ctx.stroke();
    oval(ctx, f.x + sway, f.y, 5, 6.5, f.color);
    oval(ctx, f.x + sway - 1.8, f.y - 2.5, 1.4, 2, 'rgba(255,255,255,0.6)');
  }
  ctx.globalAlpha = 1;
}
