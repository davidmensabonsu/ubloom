import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserStore } from '@/stores/userStore';
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
  const { isTrial, isExpired, isLoading, isPremium } = useSubscription();
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
      {/* Trial status now lives on the Profile page (under the avatar), so the
          old fixed top-of-page banner — which sat under the status bar on
          every screen — has been removed. */}

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