import { useState, useEffect } from 'react';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getISOWeekYear } from 'date-fns';

const DEFAULT_FUTURE_SELF = "Okay, you don't need to have everything figured out right now. You're getting there.";
const DEFAULT_MINDSET = "You're not behind. You're on your own timeline.";

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
  "Okay, you don't need to have everything figured out right now. You're getting there.",
  "Some days are just harder. That doesn't erase all the progress you've made.",
  "Stop rushing. You're allowed to take your time with this.",
  "You've been through worse and came out the other side. You can handle today.",
  "You keep forgetting — you're actually doing really well. Like, genuinely.",
  "Not everything needs to be perfect for you to feel good about where you are.",
  "You're choosing yourself today, even if it feels uncomfortable.",
  "The version of you you're working toward? She'd be proud of you right now.",
];

const staticMindsetMessages = [
  "You're not behind. You're on your own timeline.",
  "Done is better than perfect today.",
  "You don't have to earn rest.",
  "You're allowed to change your mind about who you want to be.",
  "Not everything that feels urgent actually is.",
  "You can do hard things, but you can also choose easy today.",
  "Your feelings are information, not instructions.",
  "You don't owe anyone an explanation for taking care of yourself.",
];

function getStaticFutureSelf(weekKey: string): string {
  return staticFutureSelfMessages[hashSeed(weekKey) % staticFutureSelfMessages.length];
}

function getStaticMindset(todayKey: string): string {
  return staticMindsetMessages[hashSeed(todayKey) % staticMindsetMessages.length];
}
