import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserStore } from '@/stores/userStore';
import { track } from '@/hooks/useAnalytics';
import UpgradeModal from './UpgradeModal';
import { Capacitor } from '@capacitor/core';
import { usePurchases } from '@/hooks/usePurchases';
import NativePaywall from './NativePaywall';

/**
 * Global subscription overlay layer:
 * - Slim trial banner at the very top of every main page (above hero) for users
 *   currently in their 3-day in-app trial.
 * - Full-screen non-dismissible UpgradeModal once the trial has expired and the
 *   user hasn't subscribed (with a small "Continue with free tier" link to
 *   acknowledge and dismiss).
 */
export default function SubscriptionGate() {
  const location = useLocation();
  const { isTrial, isExpired, isLoading, trialDaysLeft, isPremium } = useSubscription();
  const isNative = Capacitor.isNativePlatform();
  const { status: nativeStatus, checkEntitlement } = usePurchases();
  const acknowledgedFreeTier = useUserStore((s) => s.profile.acknowledgedFreeTier);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  // Only run on logged-in main routes
  const mainRoutes = [
    '/home', '/alignment', '/routine', '/wander', '/ubi',
    '/moodboard', '/profile', '/health', '/society',
  ];
  const onMainRoute =
    mainRoutes.includes(location.pathname) || location.pathname.startsWith('/wander/');

  const hasAccess = isNative ? nativeStatus === 'entitled' : isPremium;
  if (!onMainRoute || isLoading || hasAccess) return null;

  const showLockout = isExpired && !acknowledgedFreeTier;

  return (
    <>
      {/* Slim trial banner — pinned above everything */}
      <AnimatePresence>
        {isTrial && (
          <motion.button
            key="trial-banner"
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            onClick={() => {
              track('trial_banner_click', {
                page: location.pathname,
                trial_days_left: trialDaysLeft,
              });
              setBannerModalOpen(true);
            }}
            className="fixed top-0 inset-x-0 z-[60] w-full px-4 py-2 text-center bg-primary/10 backdrop-blur-sm border-b border-primary/15 hover:bg-primary/15 transition-colors"
            style={{ fontFamily: 'Jost, sans-serif' }}
          >
            <span className="text-[12px] text-primary font-medium">
              {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your free trial — Upgrade to keep full access →
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {isNative ? (
        bannerModalOpen && (
          <NativePaywall
            onClose={() => setBannerModalOpen(false)}
            onSuccess={checkEntitlement}
          />
        )
      ) : (
        <UpgradeModal
          open={bannerModalOpen}
          onClose={() => setBannerModalOpen(false)}
          source="trial_banner"
        />
      )}

      {/* Post-trial lockout — non-dismissible upgrade modal */}
      {isNative ? (
        showLockout && (
          <NativePaywall
            onClose={() => {}}
            onSuccess={checkEntitlement}
          />
        )
      ) : (
        <UpgradeModal
          open={showLockout}
          lockout
          title="Your free trial has ended"
          source="trial_expired_lockout"
        />
      )}
    </>
  );
}