"""Leaf sprites: in/leaf_*.{png,webp} → out/tree/leaf_N.webp.

Each leaf is cropped so its stem base sits at the bottom centre, then scaled
to 384px tall. The renderer anchors that point on a twig and turns it.

Run:  python tools/tree-assets/leaves.py
"""
import glob
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out", "tree")
SIZE = 384


def sprite(path):
    a = np.array(Image.open(path).convert("RGBA"))
    ys, xs = np.nonzero(a[..., 3] > 24)
    bottom = ys.max()
    stem = int(np.median(xs[ys >= bottom - 4]))       # stem base x
    half = max(stem - xs.min(), xs.max() - stem) + 4
    top = ys.min() - 4
    out = np.zeros((bottom + 2 - top, 2 * half, 4), np.uint8)
    x0 = stem - half
    src = a[top:bottom + 2, max(x0, 0):stem + half]
    out[:, max(-x0, 0):max(-x0, 0) + src.shape[1]] = src
    h = SIZE
    w = round(out.shape[1] * h / out.shape[0] / 2) * 2
    return Image.fromarray(out).resize((w, h), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    files = sorted(glob.glob(os.path.join(HERE, "in", "leaf_*.*")))
    for i, f in enumerate(files, 1):
        im = sprite(f)
        im.save(os.path.join(OUT, f"leaf_{i}.webp"), "WEBP", quality=90, method=6)
        print(f"{os.path.basename(f)} → leaf_{i}.webp {im.size}")


if __name__ == "__main__":
    main()
