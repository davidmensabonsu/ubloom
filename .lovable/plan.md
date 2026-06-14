## Plan: Update Podcasts Cover Image

Apply the same 4-step treatment used for the Calm cover to the newly uploaded podcasts illustration.

### Steps

1. **Trim white edge** — Inspect the uploaded podcasts.png and, if present, crop any white line at the edge using Python/PIL (same approach as Calm).

2. **Upload as CDN asset** — Run `lovable-assets create` on the cleaned image and write the resulting `.asset.json` pointer to `src/assets/wonder/icons/podcasts.png.asset.json`.

3. **Sample background colour** — Extract the dominant light pink/lavender background from the illustration and update the `tint` value for the `podcasts` card in `src/pages/Wander.tsx`.

4. **Enlarge illustration & wire asset** — In `src/pages/Wander.tsx`:
   - Replace the direct `podcasts.png` import with an import of the new `podcasts.png.asset.json`.
   - Change the podcasts card’s illustration class from the default `w-1/2 h-1/2` to `w-2/3 h-2/3` (matching Calm).

### Files changed
- `src/assets/wonder/icons/podcasts.png.asset.json` (new)
- `src/pages/Wander.tsx`