# One bucket, one picker

Make `routine-icons` the single source of truth for every habit icon. The picker reads from the bucket; you manage icons from Cloud → Storage with no code changes.

## Steps

**1. Generate the 30 new clay icons**
Create them in the same 3D pastel clay style as your existing set (`src/assets/icons/`), transparent background, square.

Filenames use `category-name.png` so the picker auto-groups them:
- Health (4): `health-stethoscope.png`, `health-tooth.png`, `health-scissors.png`, `health-nailfile.png`
- Content (6): `content-filmcamera.png`, `content-clapperboard.png`, `content-phonepost.png`, `content-analytics.png`, `content-visionboard.png`, `content-monthlyreset.png`
- Finance (3): `finance-creditcard.png`, `finance-piggybank.png`, `finance-receipt.png`
- Soft Life (5): `softlife-croissant.png`, `softlife-wine.png`, `softlife-flowers.png`, `softlife-suitcase.png`, `softlife-rest.png`
- + 12 more spread across these categories to reach 30 (I'll round out the gaps based on what's missing in your current set)

**2. Upload everything to `routine-icons`**
- Upload the 30 new PNGs to the bucket.
- Upload the existing 114 bundled icons from `src/assets/icons/` to the same bucket (prefixed with their existing category from `iconCategories` in `src/lib/taskIcons.tsx` so grouping is preserved, e.g. `wellness-dumbbell.png`, `nature-leaf.png`).

**3. Rewire the icon picker (`src/lib/taskIcons.tsx` + `EditHabitDialog.tsx`)**
- Replace the hardcoded `taskIconOptions` array with a runtime list fetched from `supabase.storage.from('routine-icons').list()`.
- Parse `category-name.png` filenames into `{ id, category, label, url }`.
- Cache the list in Zustand for 24h so the picker opens instantly; refresh in background.
- Render with the existing `clay-icon` CSS class (hue-rotate filter still works on bucket URLs).
- Keep current search + category-tab UI exactly the same.

**4. Backward compatibility**
Existing habits store an icon `id` string. The new loader maps old IDs → new bucket URLs by filename match. Nothing in saved routines breaks.

## Technical details

- Bucket is already public, so URLs render directly via `getPublicUrl()`.
- No DB migration needed — icons aren't a table, just storage objects.
- The 30 generations use `imagegen--generate_image` (transparent PNG, 512x512, premium model for clay fidelity).
- Existing `src/assets/icons/*.png` files stay in the repo as a fallback during the transition, then can be deleted in a follow-up once you confirm the bucket version looks right.

## Result

- One bucket holds all icons. Add a PNG named `health-newthing.png` from Cloud → Storage and it appears in the Health tab of the picker on next open. No code edits, no redeploy.
