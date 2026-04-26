import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useAdminCheck } from '@/hooks/useAdminCheck';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'loading';

const TRIAL_DAYS = 3;
const DAILY_UBI_LIMIT = 5;

export type SubscriptionPlan = 'free' | 'premium';
export type SubscriberStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';

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
  // Use individual selectors so each subscription returns a stable reference.
  // Destructuring the whole store returns a new object every render, which
  // would recreate `checkSubscription` and trigger an update loop (surfaced
  // by React as "Should have a queue" / "getSnapshot" errors during HMR).
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const { isAdmin } = useAdminCheck();
  // Seed from the cached snapshot in the Zustand store so premium gating
  // renders instantly on cold start (no flash of "free" UI).
  const cached = profile.subscription;
  const [plan, setPlan] = useState<SubscriptionPlan>(cached?.plan ?? 'free');
  const [subscriberStatus, setSubscriberStatus] = useState<SubscriberStatus>(
    cached?.status ?? 'inactive',
  );
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(
    cached?.currentPeriodEnd ?? null,
  );
  // Only show "loading" if we have no cached snapshot to render from.
  const [isLoading, setIsLoading] = useState(!cached);

  const stripeSubscribed =
    plan === 'premium' && (subscriberStatus === 'active' || subscriberStatus === 'trialing');

  // Ensure trial_started_at is set on first load
  useEffect(() => {
    if (user && !profile.trialStartedAt) {
      updateProfile({ trialStartedAt: new Date().toISOString() });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read subscription from the subscribers table; fall back to live Stripe check
  // only if no row exists yet (first-time check or pre-webhook state).
  const checkSubscription = useCallback(async (opts?: { forceLive?: boolean }) => {
    if (!user) { setIsLoading(false); return; }

    const applyFromDb = (row: { plan: string; status: string; current_period_end: string | null }) => {
      const nextPlan: SubscriptionPlan = row.plan === 'premium' ? 'premium' : 'free';
      const nextStatus = (row.status as SubscriberStatus) ?? 'inactive';
      setPlan(nextPlan);
      setSubscriberStatus(nextStatus);
      setSubscriptionEnd(row.current_period_end);
      // Persist snapshot for instant render on next cold start.
      updateProfile({
        subscription: {
          plan: nextPlan,
          status: nextStatus,
          currentPeriodEnd: row.current_period_end,
          updatedAt: new Date().toISOString(),
        },
      });
    };

    try {
      if (!opts?.forceLive) {
        const { data: row, error: dbError } = await supabase
          .from('subscribers')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!dbError && row) {
          applyFromDb(row);
          setIsLoading(false);
          return;
        }
      }

      // No row yet (or forced) — call live Stripe check.
      // The edge function will persist the result to subscribers for next time.
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data) {
        const nextPlan: SubscriptionPlan = data.subscribed ? 'premium' : 'free';
        const nextStatus: SubscriberStatus = data.subscribed ? 'active' : 'inactive';
        setPlan(nextPlan);
        setSubscriberStatus(nextStatus);
        setSubscriptionEnd(data.subscription_end || null);
        updateProfile({
          subscription: {
            plan: nextPlan,
            status: nextStatus,
            currentPeriodEnd: data.subscription_end || null,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch (e) {
      console.error('Failed to check subscription:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, updateProfile]);

  // Initial load: read from DB (cheap), fall back to Stripe if absent.
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Realtime: react instantly to webhook-driven row changes.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subscribers:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as { plan?: string; status?: string; current_period_end?: string | null } | null;
          if (!row) return;
          const nextPlan: SubscriptionPlan = row.plan === 'premium' ? 'premium' : 'free';
          const nextStatus = (row.status as SubscriberStatus) ?? 'inactive';
          setPlan(nextPlan);
          setSubscriberStatus(nextStatus);
          setSubscriptionEnd(row.current_period_end ?? null);
          updateProfile({
            subscription: {
              plan: nextPlan,
              status: nextStatus,
              currentPeriodEnd: row.current_period_end ?? null,
              updatedAt: new Date().toISOString(),
            },
          });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, updateProfile]);

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
    plan,
    subscriberStatus,
    canUse,
    ubiMessagesRemaining,
    incrementUbiMessageCount,
    getUbiMessageCount,
    checkSubscription,
    DAILY_UBI_LIMIT,
  };
}
