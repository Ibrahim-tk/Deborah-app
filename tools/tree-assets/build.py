"""Phase 1 asset pipeline: align, clean, cut sprites, build growth maps, export.

Usage (from the repo root, with Pillow, NumPy and SciPy installed):
    python tools/tree-assets/build.py [source_dir] [out_dir]
Defaults: tools/tree-assets/source → tools/tree-assets/out
"""
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clean import clean, load, root_origin, shift, trunk_base  # noqa: E402
from growth import encode, travel_time  # noqa: E402
from sprites import cut, find_clusters, pack  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "source")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "out")
MAX_SIDE = 1024
WEBP_Q = 82

STAGES = ["seedling", "young", "mature"]
TRUNKS = {"seedling": "trunk_01_seedling", "young": "trunk_02_young", "mature": "trunk_05_mature"}
ROOTS = {"seedling": "roots_01_seedling", "young": "roots_02_young", "mature": "roots_03_mature"}
CANOPIES = {"seedling": "canopy_01_seedling", "young": "canopy_02_young", "mature": "canopy_03_mature_v2"}
GOLD = "reference_gold_finale_v2"

# Default progress windows [start, end]. OPEN: timing is a first guess, to be tuned in the sandbox.
TIMING = {
    "roots": [0.0, 0.25], "trunk.seedling": [0.05, 0.2], "trunk.young": [0.2, 0.5],
    "trunk.mature": [0.4, 0.75], "canopy.seedling": [0.12, 0.3], "canopy.young": [0.45, 0.75],
    "canopy.mature": [0.65, 0.95], "sprites": [0.6, 0.95], "gold": [0.95, 1.0],
}


def rel(name):
    return os.path.join(SRC, name + ".png")


def main():
    os.makedirs(os.path.join(OUT, "layers"), exist_ok=True)
    report = {}
    raw = {n: load(rel(n)) for n in [*TRUNKS.values(), *ROOTS.values(), *CANOPIES.values(), GOLD]}

    # 1. Align: every trunk base onto the mature trunk base; canopies ride with their trunk;
    #    every root origin onto the mature root origin.
    anchor = trunk_base(raw[TRUNKS["mature"]])
    root_anchor = root_origin(raw[ROOTS["mature"]])
    layers = {}
    for st in STAGES:
        bx, by = trunk_base(raw[TRUNKS[st]])
        dx, dy = anchor[0] - bx, anchor[1] - by
        layers[f"trunk.{st}"] = shift(clean(raw[TRUNKS[st]]), dx, dy)
        layers[f"canopy.{st}"] = shift(clean(raw[CANOPIES[st]]), dx, dy)
        rx, ry = root_origin(raw[ROOTS[st]])
        rdx, rdy = root_anchor[0] - rx, root_anchor[1] - ry
        layers[f"roots.{st}"] = shift(clean(raw[ROOTS[st]]), rdx, rdy)
        report[st] = {"trunkShift": [round(dx), round(dy)], "rootShift": [round(rdx), round(rdy)]}
    gold = clean(raw[GOLD])

    # 2. Crop to the union of all layers and scale so the longest side is MAX_SIDE.
    union = np.zeros(gold.shape[:2], bool)
    for a in layers.values():
        union |= a[..., 3] > 0
    ys, xs = np.nonzero(union)
    x0, y0 = max(0, xs.min() - 8), max(0, ys.min() - 8)
    x1, y1 = min(union.shape[1], xs.max() + 9), min(union.shape[0], ys.max() + 9)
    scale = MAX_SIDE / max(x1 - x0, y1 - y0)
    size = (round((x1 - x0) * scale), round((y1 - y0) * scale))

    def fit(a):
        return np.array(Image.fromarray(a[y0:y1, x0:x1]).resize(size, Image.LANCZOS))

    def pt(p):
        return [round((p[0] - x0) * scale, 1), round((p[1] - y0) * scale, 1)]

    layers = {k: fit(a) for k, a in layers.items()}
    gold = fit(gold)
    A, R = pt(anchor), pt(root_anchor)

    # 3. Export layers.
    files = {}
    for k, a in layers.items():
        fn = f"layers/{k.replace('.', '_')}.webp"
        Image.fromarray(a).save(os.path.join(OUT, fn), "WEBP", quality=WEBP_Q, method=6)
        files[k] = fn
    Image.fromarray(gold).save(os.path.join(OUT, "layers/gold_reference.webp"), "WEBP", quality=WEBP_Q, method=6)

    # 4. Growth maps (lossless): trunk from its base, roots from their origin.
    maps = {}
    for key, start in [("trunk.mature", A), ("roots.mature", R)]:
        t, reached = travel_time(layers[key][..., 3] > 40, start)
        fn = f"layers/{key.replace('.', '_')}_growth.webp"
        Image.fromarray(encode(t)).save(os.path.join(OUT, fn), "WEBP", lossless=True)
        maps[key] = fn
        report[f"{key}.reached"] = round(reached, 3)

    # 5. Sprites: blossom clusters from the young canopy (well separated), petals from small fragments.
    young = layers["canopy.young"]
    blossoms = find_clusters(young, 18, 600, 12000)
    petals = find_clusters(young, 6, 40, 250)
    cuts = [cut(young, b, m) for b, m in blossoms + petals]
    atlas, frames = pack([c[0] for c in cuts])
    Image.fromarray(atlas).save(os.path.join(OUT, "sprites.webp"), "WEBP", quality=WEBP_Q, method=6)
    span = max(np.hypot(*(np.array(c[1][:2]) - A)) for c in cuts) or 1
    sprites = []
    for i, (s, (bx0, by0, bx1, by1)) in enumerate(cuts):
        cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2
        reach = float(np.hypot(cx - A[0], cy - A[1]) / span)
        kind = "blossom" if i < len(blossoms) else "petal"
        sprites.append({
            "id": f"{kind}_{i + 1:02d}", "kind": kind, "frame": list(frames[i]),
            "x": bx0, "y": by0, "region": ("outer" if reach > 0.7 else "inner") + ("-left" if cx < A[0] else "-right"),
            "sway": round(min(1.0, reach), 3), "order": round(reach, 3),
        })

    # 6. Gold colour target: median of the warm, bright pixels in the finale reference.
    g = gold[..., :3].astype(int)
    warm = (gold[..., 3] > 200) & (g[..., 0] > 200) & (g[..., 1] > 150) & (g[..., 2] < 140)
    gold_rgb = [int(v) for v in np.median(g[warm], axis=0)] if warm.any() else None

    rig = {
        "version": 1, "size": list(size), "anchor": {"trunkBase": A, "rootOrigin": R},
        "order": ["roots", "trunk", "canopy", "sprites"],
        "layers": files, "growthMaps": maps, "atlas": "sprites.webp", "sprites": sprites,
        "timing": TIMING, "gold": {"reference": "layers/gold_reference.webp", "rgb": gold_rgb},
        "_open": "OPEN: timing windows and sprite regions are first-pass defaults; tune in the sandbox.",
    }
    with open(os.path.join(OUT, "tree-rig.json"), "w") as f:
        json.dump(rig, f, indent=1)

    total = sum(os.path.getsize(os.path.join(d, n)) for d, _, ns in os.walk(OUT) for n in ns)
    report.update(size=size, sprites=len(blossoms), petals=len(petals), totalKB=round(total / 1024), gold=gold_rgb)
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
