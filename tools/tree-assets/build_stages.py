"""Staged jacaranda growth: in/*.png → out/stages/ (art, maps, stages.json).

Each stage is registered onto the full_bloom canvas by its trunk base, then gets
one RGBA map:
  R  growth time along the tree from the trunk base (0 = first)
  G  wood: distance from the branch centre line (0 = centre, 250 = bark edge);
     255 marks a blossom/other pixel, which opens on B instead
  B  blossom time: growth time + a short lag
  A  always 255 (browsers drop RGB under zero alpha)

Run:  python tools/tree-assets/build_stages.py
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import medial_axis

from clean import clean, trunk_base
from growth import encode, travel_time

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "in")
OUT = os.path.join(HERE, "out", "stages")

# Order = growth order. `wood_only` stages have no blossoms to gate.
STAGES = [
    ("young_tree", "young_tree.png"),
    ("young_buds", "young_tree_2.png"),
    ("young_bloom", "young_blue.png"),
    ("mature_wood", "mature_bare_tree.png", True),
    ("mature_bloom", "full_bloom.png"),
]
REFERENCE = "full_bloom.png"
GOLD = "gold_bloom.png"
BLOOM_LAG = 0.06      # blossoms trail the wood front by this much (0..1 of growth)
BLOOM_SPREAD = 0.0004  # extra delay per px of distance from the nearest wood


def load_keyed(path):
    a = np.array(Image.open(path).convert("RGBA"))
    # Generated art sometimes ships on opaque white: key it out.
    white = (a[..., :3].min(axis=2) > 246) & (a[..., 3] > 0)
    a[white, 3] = 0
    return clean(a)


def register(a, size, base_ref):
    """Scale to the reference height, then move the trunk base onto the reference's."""
    w, h = size
    if a.shape[0] != h:
        s = h / a.shape[0]
        a = np.array(Image.fromarray(a).resize((round(a.shape[1] * s), h), Image.LANCZOS))
    bx, by = trunk_base(a)
    dx, dy = base_ref[0] - bx, base_ref[1] - by
    out = np.zeros((h, w, 4), dtype=np.uint8)
    dx, dy = int(round(dx)), int(round(dy))
    sh, sw = a.shape[:2]
    x0, y0 = max(0, dx), max(0, dy)
    x1, y1 = min(w, sw + dx), min(h, sh + dy)
    out[y0:y1, x0:x1] = a[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
    return out, (dx, dy)


def classify(a):
    """Wood = brown bark; everything else opaque is blossom, bud or leaf."""
    r, g, b = (a[..., i].astype(int) for i in range(3))
    solid = a[..., 3] > 40
    purple = (b > g + 18) & (b > 130) & (b > r - 30)  # bright violet, not mauve bark
    return solid & ~purple, solid


def maps(a, base, all_wood=False):
    wood, solid = classify(a)
    if all_wood:
        wood = solid
    # Keep only wood connected to the trunk; detached bits open with the blossoms.
    lab, n = ndimage.label(ndimage.binary_closing(wood, iterations=2) & wood)
    if n:
        keep = lab[int(min(base[1], a.shape[0] - 1)), :]
        ids = set(keep[keep > 0].tolist()) or {int(np.argmax(ndimage.sum(wood, lab, range(1, n + 1)))) + 1}
        wood = np.isin(lab, list(ids))
    # One clock for wood and blossoms: the path through the whole tree from
    # the base. A blossom opens a little after the path reaches it, and the
    # twig it hangs from is always on that path, so it is already visible.
    grow, reach = travel_time(solid, base)

    # Edge = how far out from the centre line, relative to that branch's own
    # radius (taken from the nearest point on the medial axis).
    # Bark grooves read as holes; fill and smooth so the trunk has one centre line.
    body = ndimage.binary_fill_holes(ndimage.binary_closing(wood, iterations=4)) | wood
    body = ndimage.binary_opening(body, iterations=2) | wood
    skel, radius = medial_axis(body, return_distance=True)
    inside = ndimage.distance_transform_edt(body)
    _, (iy, ix) = ndimage.distance_transform_edt(~skel, return_indices=True)
    local = np.maximum(radius[iy, ix], inside)
    edge = np.where(wood, 1 - inside / np.maximum(local, 1), 1)
    edge[wood & (local < 5)] = 0  # twigs are already slim: show at full width

    dist = ndimage.distance_transform_edt(~wood)
    bloom = np.clip(grow + BLOOM_LAG + dist * BLOOM_SPREAD, 0, 1)
    bloom[wood] = grow[wood]

    m = np.zeros(a.shape, dtype=np.uint8)
    m[..., 0] = encode(grow)
    m[..., 1] = np.where(wood, np.minimum(encode(edge), 250), 255)
    m[..., 2] = encode(bloom)
    m[..., 3] = 255
    return m, reach


def save(arr, name, lossless=False):
    Image.fromarray(arr).save(os.path.join(OUT, name), "WEBP", quality=88, lossless=lossless, method=6, exact=lossless)


def main():
    os.makedirs(OUT, exist_ok=True)
    ref = load_keyed(os.path.join(SRC, REFERENCE))
    h, w = ref.shape[:2]
    base = trunk_base(ref)
    meta = {"size": [w, h], "base": base, "stages": []}

    for name, file, *flag in STAGES:
        a, moved = register(load_keyed(os.path.join(SRC, file)), (w, h), base)
        m, reach = maps(a, base, bool(flag))
        save(a, f"{name}.webp")
        save(m, f"{name}-map.webp", lossless=True)
        meta["stages"].append({"name": name, "moved": moved, "reach": round(reach, 3)})
        print(f"{name:13s} moved {moved}  wood reached {reach:.0%}")

    # Gold = what the finale adds over the plain bloom, timed from the trunk base up.
    gold_src, _ = register(load_keyed(os.path.join(SRC, GOLD)), (w, h), base)
    lum = lambda x: x[..., :3].astype(float) @ [0.3, 0.5, 0.2]
    r, g, b = (gold_src[..., i].astype(float) for i in range(3))
    warm = np.clip((r - b - 30) / 60, 0, 1) * np.clip((g - 110) / 60, 0, 1)
    gain = np.clip((lum(gold_src) - lum(ref) - 8) / 40, 0, 1) * warm
    gold = gold_src.copy()
    gold[..., 3] = (gain * 255).astype(np.uint8)
    ys = np.arange(h, dtype=np.float32)[:, None].repeat(w, 1)
    gold_t = np.clip((base[1] - ys) / base[1], 0, 1)
    gm = np.zeros_like(gold)
    gm[..., 0] = encode(gold_t)
    gm[..., 3] = 255
    save(gold, "gold.webp")
    save(gm, "gold-map.webp", lossless=True)

    with open(os.path.join(OUT, "stages.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print("→", OUT)


if __name__ == "__main__":
    sys.exit(main())
