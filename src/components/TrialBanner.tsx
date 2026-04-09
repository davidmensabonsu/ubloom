import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface TrialBannerProps {
  status: 'trial' | 'expired';
  trialDaysLeft: number;
}

export default function TrialBanner({ status, trialDaysLeft }: TrialBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && status === 'trial') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-2xl p-3 flex items-center gap-3 ${
          status === 'expired'
            ? 'bg-destructive/10 border border-destructive/20'
            : 'bg-amber-500/10 border border-amber-500/20'
        }`}
      >
        <Sparkles size={16} className={status === 'expired' ? 'text-destructive shrink-0' : 'text-amber-600 shrink-0'} />
        <p className="text-xs text-foreground/80 flex-1">
          {status === 'expired'
            ? 'Your free trial has ended — upgrade to unlock full access'
            : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in your free trial`}
        </p>
        {status === 'expired' ? (
          <button
            onClick={() => navigate('/upgrade')}
            className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0"
          >
            Upgrade
          </button>
        ) : (
          <button onClick={() => setDismissed(true)} className="text-muted-foreground shrink-0">
            <X size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
