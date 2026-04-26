import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnlockLibraryCardProps {
  category?: string;
  hiddenCount?: number;
}

export default function UnlockLibraryCard({ category, hiddenCount }: UnlockLibraryCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/upgrade')}
      className="w-full mt-4 rounded-2xl p-5 text-left bg-gradient-to-br from-primary/15 via-primary/8 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
            Premium
          </p>
          <h4 className="font-display text-base font-semibold text-foreground leading-snug">
            Unlock the full {category ? `${category.toLowerCase()} ` : ''}library
          </h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {hiddenCount && hiddenCount > 0
              ? `Get instant access to ${hiddenCount}+ more resources, plus every category.`
              : 'Get instant access to every resource, across every category.'}
          </p>
          <div className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary">
            Upgrade <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}