"""Cut blossom clusters and petals out of a canopy layer, and pack an atlas."""
import numpy as np
from scipy import ndimage

PAD = 6


def _purple(a):
    r, g, b = (a[..., i].astype(int) for i in range(3))
    return (a[..., 3] > 120) & (b > g + 30) & (r > g)


def find_clusters(a, count, min_area, max_area):
    """Separate blossom clusters; returns bounding boxes (x0, y0, x1, y1), largest first."""
    m = ndimage.binary_opening(_purple(a), iterations=2)
    lab, n = ndimage.label(m)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), start=1):
        area = int((lab[sl] == i).sum())
        if min_area <= area <= max_area:
            boxes.append((area, sl, i))
    boxes.sort(key=lambda b: -b[0])
    out = []
    for area, sl, i in boxes[:count]:
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        out.append(((x0, y0, x1, y1), lab == i))
    return out


def cut(a, box, own_mask):
    """Crop a sprite with padding, keeping only its own cluster (plus soft edge)."""
    h, w = a.shape[:2]
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0 - PAD), max(0, y0 - PAD)
    x1, y1 = min(w, x1 + PAD), min(h, y1 + PAD)
    keep = ndimage.binary_dilation(own_mask, iterations=PAD)[y0:y1, x0:x1]
    s = a[y0:y1, x0:x1].copy()
    s[~keep, 3] = 0
    return s, (x0, y0, x1, y1)


def pack(sprites, width=1024, gap=2):
    """Shelf-pack RGBA arrays into one atlas. Returns atlas and frames (x, y, w, h)."""
    order = sorted(range(len(sprites)), key=lambda i: -sprites[i].shape[0])
    frames = [None] * len(sprites)
    x = y = shelf = 0
    for i in order:
        h, w = sprites[i].shape[:2]
        if x + w > width:
            x, y, shelf = 0, y + shelf + gap, 0
        frames[i] = (x, y, w, h)
        x += w + gap
        shelf = max(shelf, h)
    atlas = np.zeros((y + shelf, width, 4), dtype=np.uint8)
    for s, (fx, fy, fw, fh) in zip(sprites, frames):
        atlas[fy:fy + fh, fx:fx + fw] = s
    return atlas, frames
