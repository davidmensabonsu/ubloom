The source of truth in `useSubscription.ts` already says £4.99/mo and £39.99/yr, but several places still hardcode the old £12.99 / £79.99 / £45 prices. I'll update them all.

### Files to update

**`src/components/UpgradeModal.tsx`**
- Monthly card: `£12.99` → `£4.99`
- Annual card: `£79.99` → `£39.99`, `£6.67/month` → `£3.33/month`
- "Save 49%" badge → `Save 33%` (39.99 vs 4.99×12 = 59.88 → 33%)

**`src/pages/Upgrade.tsx`**
- Yearly card: `£45/yr` → `£39.99/yr`, `£3.75/month` → `£3.33/month`, "Save 25%" → "Save 33%"
- Monthly card already `£4.99` — leave

**`src/pages/Terms.tsx`**
- Update the two pricing lines to the new amounts (£4.99/mo and £39.99/yr, equivalent ~£3.33/mo)

**`supabase/functions/stripe-webhook/index.ts`**
- Update the `// yearly £45` comment to `// yearly £39.99` (comment only — price ID itself untouched)

### Out of scope
- Stripe price IDs in `useSubscription.ts` — assumed already pointed at the new £4.99/£39.99 prices in Stripe. If not, you'll need to create new prices in Stripe and swap the IDs.
- Unrelated `$12.99` strings in `bookLinks.ts` (Amazon product prices).
