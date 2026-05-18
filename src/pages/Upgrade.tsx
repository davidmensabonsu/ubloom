import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Crown, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/hooks/useSubscription';
import { track } from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const features = [
  'Unlimited Ubi conversations',
  'Personalised health & cycle insights',
  'Mood trends & analytics',
  'Voice & video journals',
  'All Wander resources unlocked',
  'Full personalisation experience',
  'Unlimited Ubi routine integration — Ubi adds items directly to your daily plan',
  'Priority access to new features',
];

export default function Upgrade() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(true);

  useEffect(() => {
    track('paywall_open', { source: 'upgrade_page', page: '/upgrade' });
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    track('upgrade_checkout_start', {
      plan: selectedPlan,
      source: 'upgrade_page',
      page: '/upgrade',
    });
    try {
      const plan = PLANS[selectedPlan];
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      toast.error('Could not start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      <div className="px-5 pt-10 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="px-5 pb-12 space-y-8 max-w-lg mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="relative">
              <img src={logo} alt="uBloom" className="w-16 h-16 object-contain" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Crown size={12} className="text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            uBloom Premium
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            Unlock the full power of your personal growth journey with unlimited access to everything uBloom offers
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-5 space-y-3"
        >
          <button
            onClick={() => setFeaturesOpen(!featuresOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="font-display font-semibold text-foreground">What's included</h2>
            </div>
            <motion.div
              animate={{ rotate: featuresOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} className="text-muted-foreground" />
            </motion.div>
          </button>
          <AnimatePresence>
            {featuresOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3"
              >
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground/90">{feature}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Plan Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`w-full glass-card rounded-2xl p-4 text-left transition-all border-2 relative ${
              selectedPlan === 'yearly'
                ? 'border-primary bg-primary/5'
                : 'border-transparent hover:border-primary/20'
            }`}
          >
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              Save 33%
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Yearly</p>
                <p className="text-xs text-muted-foreground">£3.33/month, billed annually</p>
              </div>
              <p className="text-lg font-bold text-foreground">£39.99<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
            </div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full glass-card rounded-2xl p-4 text-left transition-all border-2 ${
              selectedPlan === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'border-transparent hover:border-primary/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Monthly</p>
                <p className="text-xs text-muted-foreground">Cancel anytime</p>
              </div>
              <p className="text-lg font-bold text-foreground">£4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            </div>
          </button>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Subscribe now'}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Cancel anytime · Secure payment via Stripe
          </p>
        </motion.div>
      </div>
    </div>
  );
}
