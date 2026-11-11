import { palette } from '../palette';
import { toScreen, type Walker } from '../world';
import { type Ctx, oval, poly, stroke } from './draw';

/**
 * People: visitors, vendors and the player.
 */

export function person(
  ctx: Ctx,
  x: number,
  y: number,
  look: Look,
  options: { swing?: number; back?: boolean; dir?: number; player?: boolean; t?: number } = {},
) {
  const swing = options.swing ?? 0;
  const dir = options.dir ?? 1;
  oval(ctx, x, y, 5, 2, palette.shadow);
  if (options.player) {
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  stroke(
    ctx,
    [
      [x - 1.6, y - 8],
      [x - 1.6 + swing * 1.6, y - 1],
    ],
    look.pants,
    2.6,
  );
  stroke(
    ctx,
    [
      [x + 1.6, y - 8],
      [x + 1.6 - swing * 1.6, y - 1],
    ],
    look.pants,
    2.6,
  );
  ctx.fillStyle = look.shirt;
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 16.5, 8, 9.5, 3);
  ctx.fill();
  stroke(
    ctx,
    [
      [x - 4, y - 15],
      [x - 5 - swing, y - 9],
    ],
    look.skin,
    2,
  );
  stroke(
    ctx,
    [
      [x + 4, y - 15],
      [x + 5 + swing, y - 9],
    ],
    look.skin,
    2,
  );
  oval(ctx, x, y - 20.5, 4, 4, look.skin);
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  if (options.back) ctx.arc(x, y - 20.8, 4.2, 0, Math.PI * 2);
  else ctx.arc(x, y - 21, 4.2, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  if (!options.back) {
    oval(ctx, x - 1.5 + dir, y - 20.3, 0.6, 0.7, palette.ink);
    oval(ctx, x + 1.5 + dir, y - 20.3, 0.6, 0.7, palette.ink);
  }
  if (look.cap) {
    ctx.fillStyle = look.cap;
    ctx.beginPath();
    ctx.arc(x, y - 22, 4.4, Math.PI, Math.PI * 2);
    ctx.fill();
    if (!options.back)
      poly(
        ctx,
        [
          [x, y - 22.5],
          [x + dir * 7, y - 22.5],
          [x + dir * 7, y - 21.3],
          [x, y - 21.3],
        ],
        look.cap,
      );
  }
  if (options.player) {
    const hop = Math.sin((options.t ?? 0) * 5) * 1.5;
    poly(
      ctx,
      [
        [x - 4, y - 34 + hop],
        [x + 4, y - 34 + hop],
        [x, y - 29 + hop],
      ],
      palette.gold,
    );
  }
}

export interface Look {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  cap?: string;
}

export function visitorLook(n: number): Look {
  return {
    skin: palette.skins[n % palette.skins.length],
    hair: palette.hairs[(n * 3 + 1) % palette.hairs.length],
    shirt: palette.shirts[(n * 2 + 1) % palette.shirts.length],
    pants: palette.pants[n % palette.pants.length],
  };
}

export const PLAYER_LOOK: Look = {
  skin: palette.skins[0],
  hair: palette.hairs[2],
  shirt: palette.red,
  pants: palette.pants[0],
  cap: palette.gold,
};

export function drawWalker(ctx: Ctx, walker: Walker, look: Look, player = false, t = 0) {
  const p = toScreen(walker.x, walker.y);
  const swing = walker.walking ? Math.sin(walker.stride * Math.PI * 2.2) : 0;
  person(ctx, p.x, p.y, look, {
    swing,
    back: walker.facing === 'back',
    dir: walker.flipped ? -1 : 1,
    player,
    t,
  });
}
