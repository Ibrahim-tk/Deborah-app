"""Inline out/tree/* (and the gold layer) into one self-contained sandbox/index.html.

Run after build_stages.py and grow_tree.py:  python tools/tree-assets/sandbox/make_sandbox.py
"""
import base64
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
STAGES = os.path.join(HERE, "..", "out", "stages")


def main():
    tree = os.path.join(HERE, "..", "out", "tree")
    assets = {"skeleton": json.load(open(os.path.join(tree, "skeleton.json")))}
    files = {"bark": tree, "blossoms": tree, "bloom-time": tree, "gold": STAGES, "gold-map": STAGES}
    for name, folder in files.items():
        data = base64.b64encode(open(os.path.join(folder, name + ".webp"), "rb").read()).decode()
        assets[name] = "data:image/webp;base64," + data
    for name in sorted(f[:-5] for f in os.listdir(tree) if f.startswith("leaf_")):
        assets[name] = "data:image/webp;base64," + base64.b64encode(open(os.path.join(tree, name + ".webp"), "rb").read()).decode()
    html = open(os.path.join(HERE, "template.html")).read().replace("/*ASSETS*/", json.dumps(assets))
    path = os.path.join(HERE, "index.html")
    open(path, "w").write(html)
    print(f"→ {path} ({len(html) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
