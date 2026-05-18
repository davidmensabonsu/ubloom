import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/hooks/useSubscription';
import { useUserStore } from '@/stores/userStore';
import { track } from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import logo from '@/assets/ubloom-flower.png';

const FEATURES = [
  'Unlimited Ubi conversations',
  'Full cycle intelligence',
  'Unlimited journal entries',
  'Full Wander library',
  'Weekly Ubi insights',
  'Future Self letters',
];

interface UpgradeModalProps {
  open: boolean;
  onClose?: () => void;
  /** When true, the X button is hidden and a "Continue with free tier" link is shown at the bottom. */
  lockout?: boolean;
  /** Optional headline override (e.g. for trial-expired screen). */
  title?: string;
  /** Where this paywall was triggered from (e.g. 'wander_unlock_card', 'journal_voice', 'trial_banner'). */
  source?: string;
}

export default function UpgradeModal({ open, onClose, lockout = false, title, source }: UpgradeModalProps) {
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);
  const updateProfile = useUserStore((s) => s.updateProfile);

  // Track paywall opens (one event per open transition)
  useEffect(() => {
    if (open) {
      track('paywall_open', {
        source: source || (lockout ? 'trial_expired_lockout' : 'unknown'),
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        lockout,
      });
    }
  }, [open, source, lockout]);

  const startCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    track('upgrade_checkout_start', {
      plan,
      source: source || (lockout ? 'trial_expired_lockout' : 'upgrade_modal'),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS[plan].priceId },
      });
      if (error) throw error;
      if (data?.url) {
        // Open Stripe Checkout in a new tab so the user keeps app state.
        window.open(data.url, '_blank');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      toast.error('Could not start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleAcknowledgeFree = () => {
    updateProfile({ acknowledgedFreeTier: true });
    onClose?.();
  };

  if (!open) return null;

  const node = (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 bg-foreground/40 backdrop-blur-sm"
        onClick={() => { if (!lockout) onClose?.(); }}
      >
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl p-6 max-h-[92vh] overflow-y-auto"
        >
          {!lockout && onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <X size={16} />
            </button>
          )}

          <div className="flex flex-col items-center text-center mb-5">
            <img src={logo} alt="uBloom" className="w-12 h-12 object-contain clay-icon mb-3" />
            <h2 className="font-display text-2xl text-foreground tracking-tight italic">
              {title || 'Unlock the full uBloom experience'}
            </h2>
            <p className="text-xs text-muted-foreground mt-2">
              Start with a 3-day free trial — cancel anytime
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly */}
            <button
              type="button"
              onClick={() => setSelected('monthly')}
              className={`text-left rounded-2xl p-4 border-2 transition-all ${
                selected === 'monthly'
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-background'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly</p>
              <p className="font-display text-2xl text-foreground mt-1">£4.99</p>
              <p className="text-[11px] text-muted-foreground">per month</p>
            </button>

            {/* Annual — emphasised */}
            <button
              type="button"
              onClick={() => setSelected('yearly')}
              className={`relative text-left rounded-2xl p-4 border-2 transition-all scale-[1.02] ${
                selected === 'yearly'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-primary/40 bg-primary/5'
              }`}
            >
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                Save 33%
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Annual</p>
              <p className="font-display text-2xl text-foreground mt-1">£39.99</p>
              <p className="text-[11px] text-muted-foreground">£3.33/month</p>
            </button>
          </div>

          {/* Feature list */}
          <div className="mt-5 space-y-2">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-primary" strokeWidth={3} />
                </span>
                <span className="text-sm text-foreground/85">{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => startCheckout(selected)}
              disabled={loading !== null}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
            >
              {loading === selected ? (
                'Opening checkout...'
              ) : (
                <>
                  <Sparkles size={14} />
                  Continue with {selected === 'yearly' ? 'Annual' : 'Monthly'}
                </>
              )}
            </button>
            <button
              onClick={() => setSelected(selected === 'yearly' ? 'monthly' : 'yearly')}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {selected === 'yearly' ? 'Choose Monthly instead' : 'Choose Annual instead'}
            </button>
          </div>

          {lockout && (
            <div className="mt-4 pt-3 border-t border-border text-center">
              <button
                onClick={handleAcknowledgeFree}
                className="text-[11px] text-muted-foreground/80 hover:text-foreground transition-colors underline underline-offset-2"
              >
                Continue with free tier →
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Render in a portal so the modal escapes any transformed/clipped parent.
  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}