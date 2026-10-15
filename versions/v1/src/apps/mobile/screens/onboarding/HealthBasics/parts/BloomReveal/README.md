# Photographic jacaranda growth animation

Updated 2026-10-14 for the Genesis Health mobile HealthBasics screen (M-1.8).

## Artwork and masking

The supplied jacaranda street photograph replaces the earlier illustrated tree. Built-in image editing was used for a photographic background extraction, not SVG tracing. The cutout retains the source's asymmetric silhouette and cropped right canopy; it is an image-tool extraction, not guaranteed pixel-identical segmentation. Sky, street, buildings, and neighboring trees are excluded. The source cutout is saved in the project mirror at `output/photo-tree/tree-cutout.png`.

Image edit prompt: isolate only the foreground purple jacaranda from the supplied photograph, preserve photographic texture, violet flowers, branching, perspective and asymmetry; remove background including branch gaps; use transparency; no illustration, vectorization, halo or replacement tree.

- `assets/photo-jacaranda-art.png`: 640 × 960 transparent raster, with breathing room for motion.
- `assets/photo-jacaranda-map.png`: same-size lossless map. R = branch travel time; G = blossom timing; B = connected bark (255); A = art alpha.
- `prepare_photo_bloom.py`: Pillow + NumPy preprocessing, root located at the photographed trunk base rather than canvas center. Connected bark distance propagates along branches. Canopy timing inherits nearby branch arrival plus local distance and seeded noise. Disconnected dark fragments emerge with the flowers, avoiding floating brown speckles.
- Regenerate with `python prepare_photo_bloom.py tree-cutout.png assets`, then inspect the generated `growth-preview.jpg`. About 80% of color-classified bark connects to the main trunk; remaining fragments are treated as canopy.

## Motion

**Rapunzel look (2026-10-14).** The full bloomed tree is always present as a faint grayscale ghost (`LOOK.ghost`). The living tree grows over it: bark is mauve-purple accented (`woodBase` everywhere, more on highlights) with fairy veins: a luminous purple-pink line down each branch centre (`vein`, `veinStrength`) and a faint vein-only glow (`veinGlow`); blossoms open with a blurred additive violet glow on their front and a faint aura once settled. On the last step (progress ≥ `LOOK.goldStart`) only a few scattered florets (`goldShare`, ≈10% of the blossom area, chosen by an independent floret noise with a random seed per load) turn golden and glow, from the trunk outward. Layers: ghost → living tree → glow (5px halo + tight 2px sheen, `lighter` compositing), composed once per progress change. Tunables are the `LOOK` constants in `BloomTree.tsx`. The blurred glow needs canvas `filter` (Safari 18+); older browsers ignore the blur, so the glow is drawn sharp (stronger, less soft).

`BloomTree.tsx` uses the raster art with a pixel growth mask, cached in an offscreen canvas. No SVG or vector reconstruction is involved.

Growth, not a reveal (2026-10-14): the picture never scales. Wood grows like a shoot from a short sprout to the branch tips over progress 0–0.5: at the front only each branch's centre line shows (from a chamfer distance field), thickening to full width behind it, so tips are slim and tapered with a crisp edge; blossoms then open over 0.42–1.00 as small scattered florets, near the trunk first and moving outward. Their timing is computed at load: each flower inherits the branch-travel time (R) of its nearest bark pixel, plus its distance from that branch, plus fine floret-sized value noise (the map's own blossom channel is no longer used). Each floret opens over a short window with a hint of pale-to-colour. Tunables are the `GROW` constants in `BloomTree.tsx`. Existing form progress stops and Back behavior are retained. After each progress change, a finite 1.8-second breeze gently displaces upper raster bands. The bottom 24% is anchored. The movement returns to zero rather than looping. Pixel masks update only when progress changes; breeze frames reuse the cached bitmap.

Reduced motion disables breeze and jumps to the requested progress. Hidden/offscreen/unmounted components stop scheduling frames. Settled frames are idle. Existing form answers, layout and submission behavior remain unchanged.

## Validation

Production build and targeted ESLint pass. Chrome checks cover the final form question, backward navigation, desktop and 390px viewports, React StrictMode, reduced motion, clamped 0/1 endpoints, and interrupted updates. A pixel comparison during the breeze found changes in the canopy and zero changes in the anchored lower trunk; subsequent frames were identical after settling. No browser page errors. Hardware iPhone performance has not been measured.

Local preview: http://127.0.0.1:5175/mobile — proceed to Health basics.
