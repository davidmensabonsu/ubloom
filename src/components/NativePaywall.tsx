import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Loader2 } from 'lucide-react';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { usePurchases } from '@/hooks/usePurchases';
import { PRODUCT_ID_MONTHLY, PRODUCT_ID_YEARLY } from '@/lib/revenueCat';
import { toast } from 'sonner';

interface NativePaywallProps {
  onClose: () => void;
  onSuccess: () => void;
  /** When true the modal cannot be dismissed (post-trial lockout). */
  lockout?: boolean;
}

const FEATURES = [
  'Unlimited Ubi AI companion chats',
  'Full cycle & health tracking',
  'Daily reflections & journaling',
  'Personalised routines',
  'Wander mood experiences',
  'Priority support',
];

export default function NativePaywall({ onClose, onSuccess, lockout }: NativePaywallProps) {
  const { packages, isLoading, error, purchasePackage, restorePurchases } = usePurchases();

  const yearly =
    packages.find((p) => p.product.identifier === PRODUCT_ID_YEARLY) ??
    packages.find((p) => p.packageType === 'ANNUAL');
  const monthly =
    packages.find((p) => p.product.identifier === PRODUCT_ID_MONTHLY) ??
    packages.find((p) => p.packageType === 'MONTHLY');

  async function handlePurchase(pkg: PurchasesPackage) {
    const success = await purchasePackage(pkg);
    if (success) {
      toast.success('Welcome to uBloom Premium 🌸');
      onSuccess();
    }
  }

  async function handleRestore() {
    const restored = await restorePurchases();
    if (restored) {
      toast.success('Your subscription has been restored.');
      onSuccess();
    } else {
      toast.error('No active subscription found to restore.');
    }
  }

  const loadingPackages = packages.length === 0 && !error;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md rounded-3xl glass-card p-6 shadow-2xl border border-primary/20"
        >
          {!lockout && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">uBloom Premium</h2>
            <p className="text-muted-foreground text-base">Unlock everything</p>
            <p className="text-sm text-primary mt-2 font-medium">3-day free trial, cancel anytime</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 text-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Packages */}
          {loadingPackages ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {yearly && (
                <button
                  onClick={() => handlePurchase(yearly)}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-primary text-primary-foreground py-4 px-5 flex items-center justify-between disabled:opacity-50 active:scale-[0.99] transition-transform"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-base">Yearly</span>
                    <span className="text-primary-foreground/80 text-sm">
                      {yearly.product.priceString} / year
                    </span>
                  </div>
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">Best value</span>
                </button>
              )}
              {monthly && (
                <button
                  onClick={() => handlePurchase(monthly)}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-border text-foreground py-4 px-5 flex items-center justify-between disabled:opacity-50 active:scale-[0.99] transition-transform"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-base">Monthly</span>
                    <span className="text-muted-foreground text-sm">
                      {monthly.product.priceString} / month
                    </span>
                  </div>
                </button>
              )}
              {!yearly && !monthly && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Plans are unavailable right now. Please try again later.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-center text-sm text-rose-500 mb-4">{error}</p>}

          <button
            onClick={handleRestore}
            disabled={isLoading}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 disabled:opacity-50"
          >
            Restore purchases
          </button>

          {lockout && (
            <p className="text-center text-[11px] text-muted-foreground mt-2 leading-snug">
              Your free trial has ended. Subscribe to continue, or reopen the app later.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
