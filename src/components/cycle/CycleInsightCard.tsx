import { motion } from 'framer-motion';
import { CyclePhase, getPhaseInsight, getPhaseIcon } from '@/lib/cycleUtils';

import moonIcon from '@/assets/icons/moon.png';
import blossomIcon from '@/assets/icons/blossom.png';
import sunIcon from '@/assets/icons/sun.png';
import leafIcon from '@/assets/icons/leaf.png';

const icons: Record<string, string> = { moon: moonIcon, blossom: blossomIcon, sun: sunIcon, leaf: leafIcon };

export default function CycleInsightCard({ phase }: { phase: CyclePhase }) {
  const iconKey = getPhaseIcon(phase);
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <img src={icons[iconKey]} alt={phase} className="w-6 h-6 clay-icon" />
        <h3 className="font-display font-semibold text-foreground text-base">Today's Cycle Insight</h3>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">{getPhaseInsight(phase)}</p>
    </motion.div>
  );
}
