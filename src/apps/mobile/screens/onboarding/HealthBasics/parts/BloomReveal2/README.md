# BloomReveal2 — layered jacaranda (sandbox)

Replacement candidate for `BloomReveal`. It's off in the real flow (`useTreeDev().useNewTree`, default `false`) and on only in the sandbox at `/internal/tree`.

- `assets/` holds the files built by `tools/tree-assets/build.py`. Copy them again from `tools/tree-assets/out/` after a rebuild. The gold reference image isn't shipped.
- `engine/loadRig.ts` loads the rig and layers. `RevealLayer.ts` handles the pixel reveal over a timing map, touching only pixels that changed. `motion.ts` runs the gust springs, petals and sap rise. `compose.ts` draws each frame.
- `BloomTree2.tsx` takes the same props as `BloomTree`. It pauses when hidden or off-screen, jumps when motion is reduced, and shows a static image if loading fails.
- `devControls.ts` holds the feature flag and the sandbox panel state.

Timing windows live in `tree-rig.json` (`timing`), so tune them there.

OPEN: the gust front, sap rise and gold sweep each run once and never loop. Confirm against the DESIGN.md ban on wave and pulse animations before the swap-in.
