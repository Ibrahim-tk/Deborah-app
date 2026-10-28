# Tree assets (Phase 1)

Offline, run-once pipeline that turns the generated jacaranda images into aligned, app-ready layers for `BloomTree2`.

## Run

```bash
python tools/tree-assets/build.py            # source/ → out/
```

Needs Pillow, NumPy and SciPy (plus scikit-image for `build_stages.py`). Takes about a minute.

`source/` is gitignored (the originals are ~100 MB). It holds the chosen images:
`trunk_01_seedling`, `trunk_02_young`, `trunk_05_mature`, `roots_01–03`, `canopy_01_seedling`,
`canopy_02_young`, `canopy_03_mature_v2`, `reference_gold_finale_v2`.

## What it does

1. **Clean** (`clean.py`): drops alpha ≤ 16, islands under 50 px and the near-white edge fringe.
2. **Align**: every trunk base moves onto the mature trunk base; each canopy moves with its trunk; every root origin moves onto the mature root origin. Shifts were at most 17 px.
3. **Crop and scale** to the shared bounds, longest side 1024 px.
4. **Growth maps** (`growth.py`): geodesic travel time from the trunk base (and root origin), 0 = first. This bridges the missing trunk stages 03–04.
5. **Sprites** (`sprites.py`): 18 blossom clusters and 6 petals cut from the young canopy, packed into `sprites.webp`.
6. **Export**: WebP layers, the atlas and `tree-rig.json` (anchor, layer files, sprite frames and positions, sway, open order, timing windows, gold target colour).

Timing windows in `build.py` (`TIMING`) are first-pass defaults; tune them in the sandbox.
