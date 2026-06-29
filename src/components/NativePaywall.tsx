import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown } from 'lucide-react';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { usePurchases } from '@/hooks/usePurchases';
import logo from '@/assets/ubloom-flower.png';
import { toast } from 'sonner';

interface NativePaywallProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FEATURES = [
  'Unlimited Ubi AI companion chats',
  'Full cycle & health tracking',
  'Daily reflections & journaling',
  'Personalised routines',
  'Wander mood experiences',
  'Priority support',
];

export default function NativePaywallpaper({ onClose, onSuccess }: NativePaywallProps) {
  const { packages, isLoading, error, purchasePackage, restorePurchases } = usePurchases();

  const monthly = packages.find(p => p.product.identifier === 'monthly_paywall.1');
  const yearly = packages.find(p => p.product.identifier === 'yearly_paywall');

  async function handlePurchase(pkg: PurchasesPackage) {
    const success = await purchasePackage(pkg);
    if (success) {
      toast.success('Welcome to uBloom Premium!');
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-2xl border border-[var(--color-border)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-[var(--color-primary)]" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              uBloom Premium
            </h2>

            <p className="text-[var(--color-text-muted)] text-base">
              Unlock everything
            </p>

            <p className="text-sm text-[var(--color-primary)] mt-2 font-medium">
              3-day free trial, cancel anytime
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3 text-[var(--color-text)]">
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-[var(--color-primary)]" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Packages */}
          <div className="space-y-3 mb-4">
            {yearly && (
              <button
                onClick={() => handlePurchase(yearly)}
                disabled={isLoading}
                className="w-full rounded-2xl bg-[var(--color-primary)] text-white py-4 px-5 flex items-center justify-between disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-base">Yearly</span>
                  <span className="text-white/80 text-sm">
                    {yearly.product.priceString} / year
                  </span>
                </div>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">
                  Best value
                </span>
              </button>
            )}
            {monthly && (
              <button
                onClick={() => handlePurchase(monthly)}
                disabled={isLoading}
                className="w-full rounded-2xl border border-[var(--color-border)] text-[var(--color-text)] py-4 px-5 flex items-center justify-between disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-base">Monthly</span>
                  <span className="text-[var(--color-text-muted)] text-sm">
                    {monthly.product.priceString} / month
                  </span>
                </div>
              </button>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-red-500 mb-4">{error}</p>
          )}

          <button
            onClick={handleRestore}
            className="w-full text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-2"
          >
            Restore purchases
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
