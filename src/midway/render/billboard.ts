import { palette } from '../palette';
import bannerUrl from '../aidevcon-banner.png';
import { type Prop } from '../world';
import { at, type Box, box, type Ctx, onPlane, poly, rectPoints } from './draw';

/**
 * The AI DevCon billboard.
 */

/** How high a billboard's sign stands, to the bottom of its board. */
export const BILLBOARD_HEIGHT = 40;

/**
 * The billboard's sign, in plane-local pixels: the banner plus its gold frame.
 * The board keeps the banner image's shape, 4 by 1.
 */
const BILLBOARD_SIGN = { width: 144, height: 36, frame: 3 };

let banner: HTMLImageElement | undefined;

/** The AI DevCon banner, loaded the first time the billboard is drawn. */
function bannerImage(): HTMLImageElement {
  if (!banner) {
    banner = new Image();
    banner.src = bannerUrl;
  }
  return banner;
}

/** Where a billboard's posts stand, and the point its sign is centred on. */
function billboardFrame(prop: Prop) {
  const y = prop.y + 0.5;
  const left = prop.x + 0.35;
  const right = prop.x + prop.w - 0.35;
  return { y, left, right, centre: at((left + right) / 2, y, BILLBOARD_HEIGHT + 18) };
}

/**
 * The screen box a billboard covers, sign and posts, for clicks and fading.
 * The sign sits on a slanted plane (see onPlane), so its corners are mapped
 * with the same 0.894 and 0.447 factors.
 */
export function billboardBounds(prop: Prop): Box {
  const { y, left, right, centre } = billboardFrame(prop);
  const halfWidth = BILLBOARD_SIGN.width / 2 + BILLBOARD_SIGN.frame;
  const halfHeight = BILLBOARD_SIGN.height / 2 + BILLBOARD_SIGN.frame;
  const feet = [at(left, y), at(right, y)];
  return {
    left: Math.min(centre[0] - 0.894 * halfWidth, ...feet.map((p) => p[0])),
    right: Math.max(centre[0] + 0.894 * halfWidth, ...feet.map((p) => p[0])),
    top: centre[1] - 0.447 * halfWidth - halfHeight,
    bottom: Math.max(centre[1] + 0.447 * halfWidth + halfHeight, ...feet.map((p) => p[1])),
  };
}

/** The AI DevCon billboard: the event banner, lit, on two posts. Clicking it opens the event page. */
export function billboard(ctx: Ctx, prop: Prop, t: number) {
  const { y, left, right, centre } = billboardFrame(prop);
  poly(
    ctx,
    rectPoints({ x: prop.x + 0.3, y: prop.y + 0.4, w: prop.w - 0.4, h: 0.5 }),
    palette.shadow,
  );
  for (const px of [left, right]) {
    box(
      ctx,
      px - 0.07,
      y - 0.07,
      0.14,
      0.14,
      0,
      BILLBOARD_HEIGHT + 12,
      palette.woodLight,
      palette.wood,
      palette.woodDark,
    );
  }
  onPlane(ctx, centre, () => {
    const { width, height, frame } = BILLBOARD_SIGN;
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.roundRect(
      -width / 2 - frame,
      -height / 2 - frame,
      width + frame * 2,
      height + frame * 2,
      5,
    );
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 3);
    ctx.fill();
    // Until the banner loads, the board stays plain.
    const image = bannerImage();
    if (image.complete && image.naturalWidth > 0) {
      ctx.save();
      ctx.clip();
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
      ctx.restore();
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = Math.sin(t * 4 - i * 0.7) > 0 ? palette.cream : palette.goldShade;
      ctx.beginPath();
      ctx.arc(-width / 2 + 4 + i * ((width - 8) / 11), -height / 2 - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
