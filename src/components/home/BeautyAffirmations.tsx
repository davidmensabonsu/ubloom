import { motion } from 'framer-motion';
import { Flower2 } from 'lucide-react';
import blossomIcon from '@/assets/icons/blossom.png';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const affirmations = [
  "nourish yourself with water, fruits and other nutritious food",
  "look up when walking, not down at the ground",
  "be extra kind to everyone, they might remember it forever",
  "take care or help something, get a potted plant if you're lonely",
  "smile at people more, if you send out good vibes you will get them back",
  "ignore negativity",
  "don't punish yourself by hurting your body or being apathetic towards it",
  "use perfume or sweet smelling creams, spoil yourself with bath bombs",
  "look at the mirror and notice your cute features",
  "aim to be healthy, that's the most important thing",
  "have a relaxing morning and evening routine for your skin and mind",
  "treat yourself with care and love, because you deserve it",
];

export default function BeautyAffirmations() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="glass-card rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flower2 size={18} className="text-primary" />
              <span className="section-title text-sm">Small ways to feel beautiful</span>
            </div>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} className="text-muted-foreground" />
            </motion.div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-3xl p-5 mt-3 space-y-3"
          >
            {affirmations.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <img src={blossomIcon} alt="" className="w-4 h-4 object-contain mt-0.5 shrink-0" style={{ filter: 'none' }} />
                <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
