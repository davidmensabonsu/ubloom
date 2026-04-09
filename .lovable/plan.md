

## Fix: Remove large gap between Mindset/Focus and Quick Actions

The Quick Actions grid has `mt-auto` which forces it to the bottom of the flex container, creating a big empty space on shorter screens. Removing it lets the sections flow naturally with consistent spacing.

### Change

**File:** `src/pages/Home.tsx` (line 137)

Replace `className="grid grid-cols-2 gap-2 mt-auto"` with `className="grid grid-cols-2 gap-2"`.

That's the only change needed.

