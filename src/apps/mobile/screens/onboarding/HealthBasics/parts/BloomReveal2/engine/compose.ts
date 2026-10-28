/**
 * Draws one frame bottom-up: roots → trunk (seedling → young → mature girth) → canopy → blossom sprites
 * → falling petals, then the sap rise and the gold finale as single passes over the wood / whole tree.
 */
import type { Tree } from './loadRig';
import { petalLife, sapFront, type Motion } from './motion';

const win = (p: number, [a, b]: number[]) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const smooth = (t: number) => t * t * (3 - 2 * t);

const scratch: Record<string, HTMLCanvasElement> = {};

function canvasFor(key: string, w: number, h: number) {
  const c = (scratch[key] ??= document.createElement('canvas'));
  if (c.width !== w || c.height !== h) Object.assign(c, { width: w, height: h });
  return c;
}
const woodCanvas = (w: number, h: number) => canvasFor('wood', w, h);
const goldCanvas = (w: number, h: number) => canvasFor('gold', w, h);

export function compose(ctx: CanvasRenderingContext2D, tree: Tree, p: number, m: Motion) {
  const { rig } = tree;
  const T = rig.timing as Record<string, number[]>;
  const [w, h] = rig.size;
  ctx.clearRect(0, 0, w, h);

  // Wood on its own canvas so the sap light can be clipped to it.
  const wc = woodCanvas(w, h);
  const wx = wc.getContext('2d')!;
  wx.clearRect(0, 0, w, h);
  // Thin seedling roots first; the mature roots (with the trunk's base flare) grow out as the trunk does.
  const rootsGrow = win(p, T.roots);
  wx.globalAlpha = win(p, [0, 0.08]) * (1 - smooth(win(p, [T.roots[0], T.roots[0] + 0.15])));
  wx.drawImage(tree.rootsSeed, 0, 0);
  wx.globalAlpha = 1;
  tree.roots.reveal(rootsGrow);
  wx.drawImage(tree.roots.canvas, 0, 0);
  const seed = win(p, T['trunk.seedling']);
  const young = win(p, T['trunk.young']);
  const mature = win(p, T['trunk.mature']);
  // The shoot rises, then hands over to the young trunk as that grows along the same skeleton.
  wx.globalAlpha = seed * (1 - smooth(young));
  wx.drawImage(tree.trunkSeed, 0, 0);
  wx.globalAlpha = 1;
  tree.trunkYoung.reveal(young);
  wx.drawImage(tree.trunkYoung.canvas, 0, 0);
  tree.trunkMature.reveal(mature);
  wx.drawImage(tree.trunkMature.canvas, 0, 0);
  const s = sapFront(m);
  if (s >= 0) {
    // One rise of light from the roots to the crown, clipped to the wood.
    const y = h - s * h * 1.1;
    const g = wx.createLinearGradient(0, y - 90, 0, y + 90);
    g.addColorStop(0, 'rgba(255,214,150,0)');
    g.addColorStop(0.5, `rgba(255,214,150,${0.55 * (1 - s)})`);
    g.addColorStop(1, 'rgba(255,214,150,0)');
    wx.globalCompositeOperation = 'source-atop';
    wx.fillStyle = g;
    wx.fillRect(0, 0, w, h);
    wx.globalCompositeOperation = 'source-over';
  }
  ctx.drawImage(wc, 0, 0);

  // Canopy: seedling leaves, then the young and mature crowns opening outward from the trunk.
  const leaves = win(p, T['canopy.seedling']);
  ctx.globalAlpha = leaves * (1 - win(p, T['canopy.young']));
  ctx.drawImage(tree.canopySeed, 0, 0);
  ctx.globalAlpha = 1;
  // Inner canopy follows the wind a little, as a whole.
  const lean = m.springs.reduce((a, sp) => a + sp.x, 0) / Math.max(1, m.springs.length);
  ctx.save();
  ctx.translate(lean * 6, 0);
  tree.canopyYoung.reveal(win(p, T['canopy.young']));
  ctx.drawImage(tree.canopyYoung.canvas, 0, 0);
  tree.canopyMature.reveal(win(p, T['canopy.mature']));
  ctx.drawImage(tree.canopyMature.canvas, 0, 0);
  ctx.restore();

  // Blossom sprites: open in order from inner to outer, each on its own spring.
  const open = T.sprites;
  rig.sprites.forEach((sp, i) => {
    if (sp.kind !== 'blossom') return;
    const t = smooth(win(p, [open[0] + sp.order * 0.6 * (open[1] - open[0]), open[1]]));
    if (t <= 0) return;
    const [fx, fy, fw, fh] = sp.frame;
    const sway = m.springs[i].x;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(sp.x + fw / 2 + sway * 14, sp.y + fh);
    ctx.rotate(sway * 0.08);
    ctx.scale(0.7 + 0.3 * t, 0.7 + 0.3 * t);
    ctx.drawImage(tree.atlas, fx, fy, fw, fh, -fw / 2, -fh, fw, fh);
    ctx.restore();
  });

  for (const pt of m.petals) {
    if (pt.age < 0) continue;
    const life = petalLife(pt);
    const [fx, fy, fw, fh] = pt.sprite.frame;
    ctx.save();
    ctx.globalAlpha = life < 0.7 ? 1 : 1 - (life - 0.7) / 0.3;
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.spin * life * 3);
    ctx.drawImage(tree.atlas, fx, fy, fw, fh, -fw, -fh, fw * 2, fh * 2);
    ctx.restore();
  }

  // Gold finale: one sweep from the roots up. Soft-light keeps the purple and warms it, like reference v2.
  const gold = win(p, T.gold);
  if (gold > 0 && rig.gold.rgb) {
    const [r, g, b] = rig.gold.rgb;
    const gc = goldCanvas(w, h);
    const gx = gc.getContext('2d')!;
    gx.clearRect(0, 0, w, h);
    gx.drawImage(ctx.canvas, 0, 0);
    const top = h - smooth(gold) * h * 1.15;
    const grad = gx.createLinearGradient(0, top, 0, top + 200);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.9)`);
    gx.globalCompositeOperation = 'source-atop';
    gx.fillStyle = grad;
    gx.fillRect(0, 0, w, h);
    gx.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(gc, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
}
