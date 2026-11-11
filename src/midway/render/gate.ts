import { palette } from '../palette';
import { type MidwayMap, toScreen } from '../world';
import { at, type Box, box, type Ctx, flag, onPlane, signBoard } from './draw';

/**
 * The gate: the arch over the way in.
 */

const ARCH_HEIGHT = 58;
const ARCH_LEFT = -0.45;
const ARCH_RIGHT = 2.2;

export function archBounds(map: MidwayMap): Box {
  const y = map.height - 1;
  const left = toScreen(map.avenueX + ARCH_LEFT - 0.6, y + 0.3);
  const right = toScreen(map.avenueX + ARCH_RIGHT + 0.8, y - 0.3);
  return { left: left.x, right: right.x, top: right.y - ARCH_HEIGHT - 26, bottom: left.y };
}

export function drawArch(ctx: Ctx, map: MidwayMap, t: number) {
  const y = map.height - 0.75;
  const left = map.avenueX + ARCH_LEFT;
  const right = map.avenueX + ARCH_RIGHT;
  for (const px of [left, right])
    box(
      ctx,
      px,
      y - 0.15,
      0.26,
      0.26,
      0,
      ARCH_HEIGHT,
      palette.woodLight,
      palette.wood,
      palette.woodDark,
    );
  const centre = at((left + right + 0.26) / 2, y, ARCH_HEIGHT + 2);
  onPlane(ctx, centre, () => {
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 14, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.red;
    ctx.beginPath();
    ctx.ellipse(0, -10, 12, 9, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    signBoard(ctx, 'TESSL CARNIVAL', 92, 20, {
      board: palette.wood,
      edge: palette.woodDark,
      text: palette.gold,
    });
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = Math.sin(t * 5 - i * 0.8) > 0 ? palette.cream : palette.goldShade;
      ctx.beginPath();
      ctx.arc(-44 + i * (88 / 13), 13.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  for (const px of [left, right]) {
    const top = at(px + 0.13, y - 0.02, ARCH_HEIGHT);
    flag(ctx, top[0], top[1], t + px, palette.red);
  }
}
