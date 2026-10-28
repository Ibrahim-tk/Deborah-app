"""Travel-time maps: how far each pixel is from the base along the wood."""
import numpy as np
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra


def travel_time(mask, start):
    """Geodesic distance from `start` (x, y) through `mask`, normalised 0..1.

    Pixels the walk can't reach (detached twig tips) get 1.0 so they appear last.
    """
    # Close small gaps so thin twigs stay connected to their branch.
    walk = ndimage.binary_closing(mask, iterations=3) | mask
    h, w = walk.shape
    idx = -np.ones((h, w), dtype=np.int64)
    ys, xs = np.nonzero(walk)
    idx[ys, xs] = np.arange(len(ys))
    rows, cols, wts = [], [], []
    for dy, dx, cost in [(0, 1, 1.0), (1, 0, 1.0), (1, 1, 1.414), (1, -1, 1.414)]:
        y2, x2 = ys + dy, xs + dx
        ok = (y2 < h) & (x2 >= 0) & (x2 < w)
        ok[ok] &= idx[y2[ok], x2[ok]] >= 0
        rows.append(idx[ys[ok], xs[ok]])
        cols.append(idx[y2[ok], x2[ok]])
        wts.append(np.full(ok.sum(), cost))
    n = len(ys)
    g = coo_matrix((np.concatenate(wts), (np.concatenate(rows), np.concatenate(cols))), shape=(n, n))
    sx, sy = int(round(start[0])), int(round(start[1]))
    # Snap the start onto the nearest walkable pixel.
    d0 = (xs - sx) ** 2 + (ys - sy) ** 2
    src = int(np.argmin(d0))
    dist = dijkstra(g, directed=False, indices=src)
    out = np.ones((h, w), dtype=np.float32)
    finite = np.isfinite(dist)
    if finite.any():
        out[ys[finite], xs[finite]] = dist[finite] / dist[finite].max()
    out[~mask] = 1.0
    return out, float(finite.mean())


def encode(t):
    """0..1 float map → 8-bit greyscale (0 = first to appear)."""
    return np.clip(t * 255 + 0.5, 0, 255).astype(np.uint8)
