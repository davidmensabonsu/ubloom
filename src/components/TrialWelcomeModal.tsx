import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import ubloomFlower from '@/assets/ubloom-flower.png';

interface TrialWelcomeModalProps {
  open: boolean;
  onDismiss: () => void;
}

export default function TrialWelcomeModal({ open, onDismiss }: TrialWelcomeModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onDismiss} />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="glass-card rounded-3xl p-8 shadow-2xl border border-primary/20 text-center">
              {/* Logo */}
              <motion.div
                className="flex justify-center mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={ubloomFlower} alt="ubloom" className="w-14 h-14 clay-icon" />
              </motion.div>

              {/* Headline */}
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Welcome to ubloom
              </h2>

              {/* Sparkle accent */}
              <div className="flex justify-center mb-4">
                <Sparkles size={18} className="text-primary/60" />
              </div>

              {/* Message */}
              <p className="text-sm text-foreground/70 leading-relaxed mb-6">
                You have <span className="font-semibold text-primary">3 days of full access</span> — explore everything, no card needed.
              </p>

              {/* Primary CTA */}
              <motion.button
                onClick={onDismiss}
                className="soft-button w-full flex items-center justify-center gap-2 mb-3"
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles size={16} />
                <span>Start my free trial</span>
              </motion.button>

              {/* Secondary link */}
              <button
                onClick={() => {
                  onDismiss();
                  navigate('/upgrade');
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                View plans
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
