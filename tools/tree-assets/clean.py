"""Load, clean and locate anchors in the generated tree layers."""
import numpy as np
from PIL import Image
from scipy import ndimage

FAINT_ALPHA = 16    # alpha at or below this is generation noise
MIN_SPECK = 50      # opaque islands smaller than this (px) are strays


def load(path):
    return np.array(Image.open(path).convert("RGBA"))


def clean(a):
    """Drop faint alpha, small stray islands and the near-white edge fringe."""
    a = a.copy()
    al = a[..., 3]
    al[al <= FAINT_ALPHA] = 0
    lab, n = ndimage.label(al > 0)
    if n:
        sizes = ndimage.sum(al > 0, lab, range(1, n + 1))
        small = np.isin(lab, np.nonzero(sizes < MIN_SPECK)[0] + 1)
        al[small] = 0
    rgb = a[..., :3].astype(int)
    fringe = (al > 0) & (al < 200) & (rgb.min(axis=2) > 220)
    al[fringe] = 0
    a[al == 0, :3] = 0
    return a


def main_component(a):
    lab, n = ndimage.label(a[..., 3] > 40)
    sizes = ndimage.sum(lab > 0, lab, range(1, n + 1))
    return lab == (np.argmax(sizes) + 1)


def trunk_base(a):
    """Centre of the lowest rows of the trunk: (x, y)."""
    ys, xs = np.nonzero(main_component(a))
    low = ys.max()
    return float(xs[ys >= low - 6].mean()), float(low)


def root_origin(a):
    """Centre of the top band of the root flare, where it meets the trunk: (x, y)."""
    ys, xs = np.nonzero(main_component(a))
    top = ys.min()
    return float(xs[ys <= top + 40].mean()), float(top)


def shift(a, dx, dy):
    """Move a layer by whole pixels, filling with transparency."""
    out = np.zeros_like(a)
    dx, dy = int(round(dx)), int(round(dy))
    h, w = a.shape[:2]
    sx0, sx1 = max(0, -dx), min(w, w - dx)
    sy0, sy1 = max(0, -dy), min(h, h - dy)
    out[sy0 + dy:sy1 + dy, sx0 + dx:sx1 + dx] = a[sy0:sy1, sx0:sx1]
    return out
