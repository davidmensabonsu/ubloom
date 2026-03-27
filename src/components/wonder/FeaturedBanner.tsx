import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface FeaturedBannerProps {
  title: string;
  thumbnail: string;
  onTap: () => void;
}

export default function FeaturedBanner({ title, thumbnail, onTap }: FeaturedBannerProps) {
  return (
    <motion.button
      onClick={onTap}
      className="w-full rounded-2xl bg-card/80 border border-border/40 overflow-hidden flex items-center gap-3 p-4 text-left hover:bg-card transition-colors"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <h3 className="font-display text-xl font-semibold text-foreground leading-snug">
          {title}
        </h3>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/60 rounded-full px-3 py-1.5">
          See all <ChevronRight size={12} />
        </span>
      </div>
      <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0">
        <img src={thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    </motion.button>
  );
}
