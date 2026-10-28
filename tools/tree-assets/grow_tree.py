"""One growing tree: skeleton + skins for the sandbox growth renderer.

Reads the registered layers from out/stages/ (run build_stages.py first) and
writes out/tree/:
  skeleton.json   fork-to-fork segments, parent first, each with a Strahler
                  order, a growth window [t0, t1] and points [x, y, r, s]
                  (r = final radius px, s = distance along the segment)
  bark.webp       painted bark (the bare mature tree) used as the branch skin
  blossoms.webp   blossom pixels cut from the full-bloom painting
  bloom-time.webp R = when the ignition wave lights each cluster (clock / TIME_SCALE),
                  G = depth inside its cluster (255 = heart, where the bud is)

Run:  python tools/tree-assets/grow_tree.py
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from skimage.morphology import medial_axis

HERE = os.path.dirname(os.path.abspath(__file__))
STAGES = os.path.join(HERE, "out", "stages")
OUT = os.path.join(HERE, "out", "tree")

STEP = 4            # keep every Nth skeleton pixel along a segment
MIN_SPUR = 24       # leaf segments shorter than this (px) are medial-axis noise
LATERAL_DELAY = 260 # side shoots wait this long (in trunk-px of growth) after the leader passes
TIME_SCALE = 1.25   # bloom times are stored as clock / TIME_SCALE (the clock runs past 1)
IGNITE_LAG = 0.02   # a cluster bursts just after the ignition wave passes its twig
PIPE_SLACK = 1.1    # a limb's end may be this much thicker than its forks combined (r² = Σ r²)
TAPER_GAIN = 0.004  # towards the base, a limb may thicken by this fraction per px, no faster


def load(name):
    return np.array(Image.open(os.path.join(STAGES, name)).convert("RGBA"))


def skeleton_graph(body, base):
    skel, radius = medial_axis(body, return_distance=True)
    # Where the painting is cut off by the image edge, the medial axis runs
    # along the cut with huge radii. Keep it (the trunk itself leaves the frame)
    # but give those pixels the radius of the nearest skeleton point inside.
    edge = np.zeros_like(skel)
    edge[:6, :] = edge[-6:, :] = edge[:, :6] = edge[:, -6:] = True
    inner = skel & ~edge
    _, (iy, ix) = ndimage.distance_transform_edt(~inner, return_indices=True)
    on_edge = skel & edge
    radius[on_edge] = np.minimum(radius[on_edge], radius[iy[on_edge], ix[on_edge]])
    ys, xs = np.nonzero(skel)
    idx = -np.ones(skel.shape, dtype=np.int64)
    idx[ys, xs] = np.arange(len(ys))
    r = radius[ys, xs]
    rows, cols, wts = [], [], []
    for dy, dx, step in [(0, 1, 1.0), (1, 0, 1.0), (1, 1, 1.414), (1, -1, 1.414)]:
        y2, x2 = ys + dy, xs + dx
        ok = (y2 < skel.shape[0]) & (x2 >= 0) & (x2 < skel.shape[1])
        ok[ok] &= idx[y2[ok], x2[ok]] >= 0
        a, b = idx[ys[ok], xs[ok]], idx[y2[ok], x2[ok]]
        # Thick wood is "fast": the trunk rises quickly, fine twigs take their time.
        cost = step / np.sqrt(np.maximum((r[a] + r[b]) / 2, 1))
        rows.append(a); cols.append(b); wts.append(cost)
    n = len(ys)
    g = coo_matrix((np.concatenate(wts), (np.concatenate(rows), np.concatenate(cols))), shape=(n, n))
    root = int(np.argmin((xs - base[0]) ** 2 + (ys - base[1]) ** 2))
    dist, pred = dijkstra(g, directed=False, indices=root, return_predecessors=True)
    return xs, ys, r, dist, pred, root


def segments(xs, ys, r, dist, pred, root):
    """Split the skeleton at every fork into segments, ordered parent-first.

    Each segment gets a Strahler order (twigs = 1; where two equal orders meet
    the parent is one higher) and a growth window [t0, t1] on a 0..1 clock:
    the highest order (trunk) grows first, then each lower order in turn, so the
    tree goes one stem → a fork → nested forks. Within an order, a chain of
    same-order segments grows end to end at a steady speed.
    """
    reach = np.isfinite(dist)
    children = {}
    for v in np.nonzero(reach)[0]:
        if pred[v] >= 0:
            children.setdefault(int(pred[v]), []).append(int(v))

    segs, stack = [], [(root, -1)]
    while stack:
        v, parent = stack.pop()
        nodes = [v] if parent < 0 else [int(pred[v]), v]
        while len(children.get(v, [])) == 1:
            v = children[v][0]
            nodes.append(v)
        me = len(segs)
        segs.append({"parent": parent, "nodes": nodes, "kids": []})
        if parent >= 0:
            segs[parent]["kids"].append(me)
        for k in children.get(v, []):
            stack.append((k, me))

    def length(nodes):
        x, y = xs[nodes].astype(float), ys[nodes].astype(float)
        return float(np.hypot(np.diff(x), np.diff(y)).sum())

    for sg in segs:
        sg["len"] = length(sg["nodes"])
    # Drop short leaf spurs (medial-axis noise), repeatedly.
    alive = [True] * len(segs)
    for _ in range(3):
        for i, sg in enumerate(segs):
            kids = [k for k in sg["kids"] if alive[k]]
            if alive[i] and sg["parent"] >= 0 and not kids and sg["len"] < MIN_SPUR:
                alive[i] = False

    # Strahler order, children before parents (parents always have lower ids).
    for i in range(len(segs) - 1, -1, -1):
        kids = [segs[k]["order"] for k in segs[i]["kids"] if alive[k]]
        if not kids:
            segs[i]["order"] = 1
        else:
            top = max(kids)
            segs[i]["order"] = top + 1 if kids.count(top) > 1 else top
    K = segs[0]["order"]

    # Growth timing, as a tree does it:
    #  - height is added only at shoot tips (each segment extends from its fork);
    #  - the leading shoot is dominant: it keeps going, while a side shoot only
    #    breaks bud a while after the leader has passed its fork (apical
    #    dominance), so a young tree is a spear first and lower limbs are oldest;
    #  - vigour falls with order: the trunk shoots fastest, twigs slowest.
    for i, sg in enumerate(segs):
        if not alive[i]:
            continue
        p = sg["parent"]
        speed = (sg["order"] / K) ** 0.7
        if p < 0:
            start = 0.0
        else:
            start = segs[p]["end"]
            if segs[p]["order"] != sg["order"]:
                start += LATERAL_DELAY * (K - sg["order"]) / K
        sg["begin"], sg["end"] = start, start + sg["len"] / speed
    last = max(sg["end"] for i, sg in enumerate(segs) if alive[i])

    trunk_r = float(np.median(r[segs[0]["nodes"]])) if len(segs[0]["nodes"]) > 2 else float(r.max())
    trunk_r = max(trunk_r, float(np.percentile(r, 99.5)))
    out, remap = [], {}
    for i, sg in enumerate(segs):
        if not alive[i]:
            continue
        t0, t1 = sg["begin"] / last, sg["end"] / last
        nodes = sg["nodes"]
        x, y, rr = (smooth(a[nodes].astype(float)) for a in (xs, ys, r))
        if sg["parent"] >= 0:      # keep the joint exactly on the parent
            x[0], y[0] = xs[nodes[0]], ys[nodes[0]]
            # A shoot is never thicker than the limb it grows from.
            rr = np.minimum(rr, segs[sg["parent"]]["end_r"] * (1.0 if segs[sg["parent"]]["order"] == sg["order"] else 0.85))
        # Each branch order has a ceiling on thickness (twigs stay twig-thin),
        # whatever the medial axis measured in a crotch or at the image edge.
        rr = np.minimum(rr, trunk_r * (sg["order"] / K) ** 2.2)
        sg["end_r"] = float(rr[-1])
        keep = list(range(0, len(nodes), STEP))
        if keep[-1] != len(nodes) - 1:
            keep.append(len(nodes) - 1)
        s = np.concatenate([[0], np.cumsum(np.hypot(np.diff(x), np.diff(y)))])
        flat = []
        for k in keep:
            flat += [round(x[k], 1), round(y[k], 1), round(rr[k], 1), round(s[k], 1)]
        remap[i] = len(out)
        out.append({"parent": remap.get(sg["parent"], -1), "order": sg["order"],
                    "t0": round(t0, 4), "t1": round(t1, 4), "len": round(s[-1], 1), "pts": flat})
    pipe_radii(out)
    return out, K


def pipe_radii(tree):
    """Remove knots: settle radii from the twigs back to the trunk.

    In a crotch the medial axis measures the merged wood of both limbs, so a
    limb inherits a fat stub that runs flat until the next fork. Instead, a
    limb's end is at most as thick as the limbs it feeds (Leonardo's rule,
    r² = Σ r²), and towards the base it may only thicken gradually.
    Children always come after their parent, so one reverse sweep suffices.
    """
    kids = [[] for _ in tree]
    for i, sg in enumerate(tree):
        if sg["parent"] >= 0:
            kids[sg["parent"]].append(i)
    for i in range(len(tree) - 1, -1, -1):
        pts = tree[i]["pts"]
        r, s = pts[2::4], pts[3::4]
        if kids[i]:
            fed = PIPE_SLACK * float(np.sqrt(sum(tree[k]["pts"][2] ** 2 for k in kids[i])))
            r[-1] = min(r[-1], fed)
        for k in range(len(r) - 2, -1, -1):
            r[k] = min(r[k], r[k + 1] * (1 + TAPER_GAIN * (s[k + 1] - s[k])))
        pts[2::4] = [round(v, 1) for v in r]


def smooth(a, k=7):
    """Moving average along a polyline (ends kept) so limbs curve, not zig-zag."""
    if len(a) < 3:
        return a
    pad = np.pad(a, k // 2, mode="edge")
    return np.convolve(pad, np.ones(k) / k, mode="valid")


def arrival(tree, shape):
    """Per-pixel arrival time of the skeleton, for timing the blossoms."""
    t = np.full(shape, np.inf)
    for sg in tree:
        P = np.array(sg["pts"]).reshape(-1, 4)
        for x, y, _, s in P:
            u = s / max(sg["len"], 1)
            t[min(int(y), shape[0] - 1), min(int(x), shape[1] - 1)] = sg["t0"] + u * (sg["t1"] - sg["t0"])
    return t


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = json.load(open(os.path.join(STAGES, "stages.json")))
    base = meta["base"]
    bark = load("mature_wood.webp")
    bloom = load("mature_bloom.webp")

    wood = bark[..., 3] > 40
    # Close only hairline gaps: wider gaps are the sky between limbs, and filling
    # them fuses neighbouring limbs into one flat blade.
    body = ndimage.binary_closing(wood, iterations=1) | wood
    small_holes = ndimage.binary_fill_holes(body) & ~body
    lab, n = ndimage.label(small_holes)
    if n:
        sizes = ndimage.sum(small_holes, lab, range(1, n + 1))
        body |= np.isin(lab, np.nonzero(sizes < 400)[0] + 1)
    xs, ys, r, dist, pred, root = skeleton_graph(body, base)
    tree, K = segments(xs, ys, r, dist, pred, root)

    # Blossoms: everything in the full-bloom painting that is not bark (flowers,
    # their soft glow, buds), except along the trunk, where the two paintings'
    # trunks don't line up. Each opens after the skeleton has grown near it.
    rr, gg, bb = (bloom[..., i].astype(int) for i in range(3))
    barky = (rr > bb + 8) & (rr >= gg) & (bb < 150)          # brown / mauve bark tones
    violet = (bloom[..., 3] > 12) & ~barky
    trunk = np.zeros(body.shape, dtype=bool)
    for sg in tree:
        if sg["order"] == K:
            P = np.array(sg["pts"]).reshape(-1, 4)
            for x, y, r, _ in P:
                y0, y1 = int(max(0, y - r * 1.4)), int(min(body.shape[0], y + r * 1.4 + 1))
                x0, x1 = int(max(0, x - r * 1.4)), int(min(body.shape[1], x + r * 1.4 + 1))
                yy, xx = np.mgrid[y0:y1, x0:x1]
                trunk[y0:y1, x0:x1] |= (xx - x) ** 2 + (yy - y) ** 2 <= (r * 1.4) ** 2
    violet &= ~trunk
    petals = bloom.copy()
    petals[~violet] = 0
    skel_t = arrival(tree, body.shape)
    near, (iy, ix) = ndimage.distance_transform_edt(~np.isfinite(skel_t), return_indices=True)
    # The tree is grown before it flowers; then an ignition wave runs out
    # through the wood in growth order, lighting the oldest (inner) clusters
    # first and the newest twigs last.
    rank = np.clip(skel_t[iy, ix] + near * 0.0004, 0, 1)
    when = rank + IGNITE_LAG
    # Within each cluster: depth from its edge (1 = heart). Buds are the hearts;
    # petals unfold outward from them.
    inside = ndimage.distance_transform_edt(violet)
    depth = np.clip(inside / np.maximum(ndimage.maximum_filter(inside, size=21), 1), 0, 1)
    tm = np.zeros(bloom.shape, dtype=np.uint8)
    tm[..., 0] = (np.clip(when / TIME_SCALE, 0, 1) * 255).astype(np.uint8)
    tm[..., 1] = (depth * 255).astype(np.uint8)
    tm[..., 3] = 255

    save = lambda a, n, ll=False: Image.fromarray(a).save(
        os.path.join(OUT, n), "WEBP", quality=88, lossless=ll, method=6, exact=ll)
    # Seamless skin: every pixel takes the colour of the nearest painted bark,
    # so a limb drawn across a gap in the painting never looks broken.
    # Gaps get a soft blend of the surrounding bark (normalised blur), not the
    # single nearest colour, which would leave flat paint-like patches.
    w = (bark[..., 3] > 200).astype(float)
    skin = np.zeros_like(bark, dtype=float)
    for sigma in (3, 8, 20):
        den = ndimage.gaussian_filter(w, sigma)
        for c in range(3):
            est = ndimage.gaussian_filter(bark[..., c] * w, sigma) / np.maximum(den, 1e-6)
            skin[..., c] = np.where((skin[..., 3] == 0) & (den > 0.02), est, skin[..., c])
        skin[..., 3] = np.where(den > 0.02, 1, skin[..., 3])
    _, (iy, ix) = ndimage.distance_transform_edt(skin[..., 3] == 0, return_indices=True)
    skin = skin[iy, ix]
    # Feather painted bark into the fill (no hard boundary to read as a seam).
    w = ndimage.gaussian_filter(np.clip((bark[..., 3].astype(float) - 120) / 120, 0, 1), 2.0)[..., None]
    skin[..., :3] = w * bark[..., :3] + (1 - w) * skin[..., :3]
    skin = np.clip(skin, 0, 255).astype(np.uint8)
    skin[..., 3] = 255
    save(skin, "bark.webp")
    save(petals, "blossoms.webp")
    save(tm, "bloom-time.webp", True)
    with open(os.path.join(OUT, "skeleton.json"), "w") as f:
        json.dump({"size": meta["size"], "base": base, "orders": K, "segments": tree}, f, separators=(",", ":"))
    pts = sum(len(b["pts"]) // 4 for b in tree)
    per = [sum(1 for b in tree if b["order"] == o) for o in range(K, 0, -1)]
    print(f"{len(tree)} segments, {pts} points, generations (trunk→twigs): {per} → {OUT}")


if __name__ == "__main__":
    main()
