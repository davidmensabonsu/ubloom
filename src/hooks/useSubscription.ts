import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useAdminCheck } from '@/hooks/useAdminCheck';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'loading';

const TRIAL_DAYS = 3;
const DAILY_UBI_LIMIT = 5;

const PLANS = {
  monthly: {
    priceId: 'price_1TKMZaAni5cThJuscqeltmFP',
    label: '£4.99/month',
    amount: '£4.99',
    interval: 'month' as const,
  },
  yearly: {
    priceId: 'price_1TKMaJAni5cThJus9hNowIo0',
    label: '£45/year',
    amount: '£45',
    interval: 'year' as const,
  },
};

export { PLANS };

export function useSubscription() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserStore();
  const { isAdmin } = useAdminCheck();
  const [stripeSubscribed, setStripeSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure trial_started_at is set on first load
  useEffect(() => {
    if (user && !profile.trialStartedAt) {
      updateProfile({ trialStartedAt: new Date().toISOString() });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check Stripe subscription status
  const checkSubscription = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data) {
        setStripeSubscribed(data.subscribed === true);
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch (e) {
      console.error('Failed to check subscription:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    // Poll every 60 seconds
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const status: SubscriptionStatus = useMemo(() => {
    if (isLoading) return 'loading';
    if (isAdmin || stripeSubscribed) return 'active';
    if (profile.trialStartedAt) {
      const trialEnd = new Date(profile.trialStartedAt);
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
      if (new Date() < trialEnd) return 'trial';
    }
    return 'expired';
  }, [isLoading, isAdmin, stripeSubscribed, profile.trialStartedAt]);

  const trialDaysLeft = useMemo(() => {
    if (!profile.trialStartedAt) return 0;
    const trialEnd = new Date(profile.trialStartedAt);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    const diff = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [profile.trialStartedAt]);

  const isActive = status === 'active' || status === 'trial';
  const isTrial = status === 'trial';
  const isExpired = status === 'expired';

  // Daily Ubi message tracking
  const getUbiMessageCount = useCallback(() => {
    const key = `ubi-msg-count-${getLocalDateStr()}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  }, []);

  const incrementUbiMessageCount = useCallback(() => {
    const key = `ubi-msg-count-${getLocalDateStr()}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, String(count));
    return count;
  }, []);

  const canUse = useCallback((feature: string): boolean => {
    if (isLoading || isActive) return true;
    switch (feature) {
      case 'ubi_chat':
        return getUbiMessageCount() < DAILY_UBI_LIMIT;
      case 'ubi_insights':
      case 'mood_trends':
        return false;
      case 'wonder_resources':
        return true; // handled per-component with limit
      default:
        return true;
    }
  }, [isLoading, isActive, getUbiMessageCount]);

  const ubiMessagesRemaining = useMemo(() => {
    if (isActive) return Infinity;
    return Math.max(0, DAILY_UBI_LIMIT - getUbiMessageCount());
  }, [isActive, getUbiMessageCount]);

  return {
    status,
    isActive,
    isTrial,
    isExpired,
    isLoading,
    trialDaysLeft,
    subscriptionEnd,
    canUse,
    ubiMessagesRemaining,
    incrementUbiMessageCount,
    getUbiMessageCount,
    checkSubscription,
    DAILY_UBI_LIMIT,
  };
}
