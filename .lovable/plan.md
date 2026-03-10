

## Replace Sparkle Icon with Ubloom Logo in Onboarding

**What**: In `src/pages/Onboarding.tsx`, when an option is selected, a `<Sparkles>` icon appears on the right. Replace it with the uploaded ubloom logo flower image.

### Changes

1. **Copy the uploaded logo** into `src/assets/ubloom-flower.png`

2. **`src/pages/Onboarding.tsx`**:
   - Remove the `Sparkles` import from lucide-react
   - Add `import ubloomFlower from '@/assets/ubloom-flower.png'`
   - Replace the `<Sparkles size={18} className="text-primary" />` element (~line 175) with `<img src={ubloomFlower} alt="" className="w-5 h-5" />`

Single-file change plus one asset copy.

