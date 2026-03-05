

## Plan: Make Home Logo Match Icon Size in Bottom Nav

The Home logo in the bottom nav currently uses `h-[35px] w-[35px]`, while the other nav icons use `size={22}` (22px). The logo appears oversized relative to the other icons.

**Change in `src/components/BottomNav.tsx`:**
- Reduce the logo image dimensions from `h-[35px] w-[35px]` to `h-[22px] w-[22px]` to match the other navigation icons' `size={22}`.

