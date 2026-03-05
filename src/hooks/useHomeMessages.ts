import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getISOWeekYear } from 'date-fns';

const DEFAULT_FUTURE_SELF = "You're exactly where you need to be. Every step you take is bringing you closer to becoming the woman you've always known you could be.";
const DEFAULT_MINDSET = "You are not behind. You are not late. You are exactly where you need to be on your journey.";

function getWeekKey(): string {
  const now = new Date();
  return `${getISOWeekYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
}

function getTodayKey(): string {
  return getLocalDateStr();
}

export function useHomeMessages() {
  const { profile, updateProfile } = useUserStore();
  const [futureSelfMessage, setFutureSelfMessage] = useState(
    profile.cachedFutureSelfMessage?.message || DEFAULT_FUTURE_SELF
  );
  const [mindsetMessage, setMindsetMessage] = useState(
    profile.cachedMindsetMessage?.message || DEFAULT_MINDSET
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const weekKey = getWeekKey();
    const todayKey = getTodayKey();

    const weekFresh = profile.cachedFutureSelfMessage?.weekKey === weekKey;
    const dayFresh = profile.cachedMindsetMessage?.dateKey === todayKey;

    // If both are fresh, use cached values
    if (weekFresh && dayFresh) {
      setFutureSelfMessage(profile.cachedFutureSelfMessage!.message);
      setMindsetMessage(profile.cachedMindsetMessage!.message);
      return;
    }

    // Check if user has any profile data at all
    const hasProfileData =
      profile.identityStatement ||
      Object.values(profile.dreamSelf).some((v) => v.length > 0) ||
      profile.journalEntries.length > 0;

    if (!hasProfileData) {
      // Use date-seeded static fallbacks
      setFutureSelfMessage(getStaticFutureSelf(weekKey));
      setMindsetMessage(getStaticMindset(todayKey));
      return;
    }

    // Fetch new messages from AI
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-home-messages', {
          body: {
            journalEntries: profile.journalEntries.slice(0, 10),
            identityStatement: profile.identityStatement,
            dreamSelf: profile.dreamSelf,
            moodHistory: profile.moodHistory.slice(0, 5),
          },
        });

        if (cancelled) return;

        if (error || data?.error) {
          console.error('AI message error:', error || data?.error);
          // Fall back to static
          if (!weekFresh) setFutureSelfMessage(getStaticFutureSelf(weekKey));
          if (!dayFresh) setMindsetMessage(getStaticMindset(todayKey));
          return;
        }

        const newFuture = data.futureSelfMessage || DEFAULT_FUTURE_SELF;
        const newMindset = data.mindsetMessage || DEFAULT_MINDSET;

        setFutureSelfMessage(newFuture);
        setMindsetMessage(newMindset);

        // Cache in store
        updateProfile({
          cachedFutureSelfMessage: { message: newFuture, weekKey },
          cachedMindsetMessage: { message: newMindset, dateKey: todayKey },
        });
      } catch (err) {
        console.error('Failed to fetch AI messages:', err);
        if (!weekFresh) setFutureSelfMessage(getStaticFutureSelf(weekKey));
        if (!dayFresh) setMindsetMessage(getStaticMindset(todayKey));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { futureSelfMessage, mindsetMessage, loading };
}

// Date-seeded static fallbacks for users with no profile data
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const staticFutureSelfMessages = [
  "You're exactly where you need to be. Every step you take is bringing you closer to becoming the woman you've always known you could be.",
  "Remember, healing isn't linear. Some days will feel harder than others, but you're doing the work, and that's what matters.",
  "The peace you're seeking is already within you. Today, let yourself rest in that truth.",
  "You are worthy of all the beautiful things you desire. Keep believing in yourself, love.",
  "The woman you're becoming would be so proud of the courage you're showing right now.",
  "Trust the timing of your life. What's meant for you is making its way to you.",
  "You don't have to have it all figured out. You just have to keep showing up for yourself.",
  "Every boundary you set, every truth you speak, is you choosing yourself. And that is everything.",
];

const staticMindsetMessages = [
  "You are not behind. You are not late. You are exactly where you need to be on your journey.",
  "Today, you choose peace over perfection.",
  "Your worth is not measured by your productivity.",
  "Softness is not weakness — it is your superpower.",
  "You are allowed to take up space and shine brightly.",
  "Today, you release what no longer serves your highest self.",
  "You are the author of your story, and this chapter is beautiful.",
  "Let today be a gentle unfolding, not a race to the finish.",
];

function getStaticFutureSelf(weekKey: string): string {
  return staticFutureSelfMessages[hashSeed(weekKey) % staticFutureSelfMessages.length];
}

function getStaticMindset(todayKey: string): string {
  return staticMindsetMessages[hashSeed(todayKey) % staticMindsetMessages.length];
}
