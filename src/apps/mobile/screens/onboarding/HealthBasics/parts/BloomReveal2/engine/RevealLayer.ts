/**
 * A raster layer revealed pixel by pixel as a threshold rises over an 8-bit timing map
 * (0 = first to appear). Pixels are bucketed by map value once, so each update only touches
 * the pixels whose visibility changed: growing or shrinking costs the delta, not the whole image.
 */
export class RevealLayer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly src: Uint8ClampedArray;
  private readonly out: ImageData;
  private readonly order: Uint32Array;
  private readonly start: Uint32Array;
  private level = -1;

  constructor(src: ImageData, map: Uint8Array) {
    this.src = src.data;
    this.canvas = document.createElement('canvas');
    this.canvas.width = src.width;
    this.canvas.height = src.height;
    this.ctx = this.canvas.getContext('2d')!;
    this.out = this.ctx.createImageData(src.width, src.height);
    // Counting sort of opaque pixels by map value.
    const counts = new Uint32Array(257);
    for (let i = 0; i < map.length; i++) if (this.src[i * 4 + 3]) counts[map[i] + 1]++;
    for (let v = 1; v < 257; v++) counts[v] += counts[v - 1];
    this.start = counts.slice();
    this.order = new Uint32Array(counts[256]);
    const fill = counts.slice();
    for (let i = 0; i < map.length; i++) if (this.src[i * 4 + 3]) this.order[fill[map[i]]++] = i;
  }

  /** Show every pixel whose map value is ≤ t·255. Returns true if anything changed. */
  reveal(t: number): boolean {
    const next = t <= 0 ? -1 : Math.min(255, Math.floor(t * 255));
    if (next === this.level) return false;
    const d = this.out.data;
    const lo = Math.min(next, this.level) + 1;
    const hi = Math.max(next, this.level);
    const show = next > this.level;
    for (let k = this.start[lo]; k < this.start[hi + 1]; k++) {
      const p = this.order[k] * 4;
      if (show) {
        d[p] = this.src[p];
        d[p + 1] = this.src[p + 1];
        d[p + 2] = this.src[p + 2];
        d[p + 3] = this.src[p + 3];
      } else d[p + 3] = 0;
    }
    this.level = next;
    this.ctx.putImageData(this.out, 0, 0);
    return true;
  }
}
