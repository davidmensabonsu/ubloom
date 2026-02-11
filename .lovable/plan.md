

## Speed Up Page Transitions

The current spring animation feels sluggish because of the combination of low stiffness (200), low damping (18), high mass (1), and a large slide distance (60px). This makes pages take too long to settle into place.

### Changes

**File: `src/components/PageTransition.tsx`**

- Reduce the horizontal slide distance from `60px` to `30px` so there's less ground to cover
- Increase stiffness from `200` to `400` for a faster snap
- Increase damping from `18` to `28` so it settles quickly with just a hint of bounce
- Reduce mass from `1` to `0.8` for lighter, quicker motion

The result will be a transition that still feels directional and slightly playful, but arrives at the destination almost instantly -- more like a quick "pop into place" than a slow slide.

