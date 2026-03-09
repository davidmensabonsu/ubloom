

## Plan: Collapsible Feelings Section

Show the first 8 feelings (the positive ones) by default, with a "Show more" button that expands to reveal the remaining 8. Any selected feeling from the hidden set keeps the section expanded.

### Changes

**`src/pages/Alignment.tsx`**:
- Add `const [feelingsExpanded, setFeelingsExpanded] = useState(false)` state
- Split rendering: show first 8 options always, wrap remaining 8 in an `AnimatePresence` block that shows when `feelingsExpanded` is true OR when any hidden feeling is already selected
- Add a small "Show more" / "Show less" toggle button below the visible pills, styled subtly with a `ChevronDown` icon that rotates when expanded

