import { useState, useEffect } from 'react';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getISOWeekYear } from 'date-fns';

const DEFAULT_FUTURE_SELF = "Okay, you don't need to have everything figured out right now. You're getting there.";
const DEFAULT_MINDSET = "You're not behind. You're on your own timeline.";
const DEFAULT_FOCUS = "Do one small thing today that your future self would thank you for.";

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
  const [focusToday, setFocusToday] = useState(
    profile.cachedFocusToday?.message || DEFAULT_FOCUS
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const weekKey = getWeekKey();
    const todayKey = getTodayKey();

    const weekFresh = profile.cachedFutureSelfMessage?.weekKey === weekKey;
    const dayFresh = profile.cachedMindsetMessage?.dateKey === todayKey;
    const focusFresh = profile.cachedFocusToday?.dateKey === todayKey;

    // If all are fresh, use cached values
    if (weekFresh && dayFresh && focusFresh) {
      setFutureSelfMessage(profile.cachedFutureSelfMessage!.message);
      setMindsetMessage(profile.cachedMindsetMessage!.message);
      setFocusToday(profile.cachedFocusToday!.message);
      return;
    }

    // Check if user has any profile data at all
    const hasProfileData =
      profile.identityStatement ||
      profile.currentFeeling ||
      profile.struggles.length > 0 ||
      Object.values(profile.dreamSelf).some((v) => v.length > 0) ||
      profile.journalEntries.length > 0;

    if (!hasProfileData) {
      // Use date-seeded static fallbacks
      setFutureSelfMessage(getStaticFutureSelf(weekKey));
      setMindsetMessage(getStaticMindset(todayKey));
      setFocusToday(getStaticFocus(todayKey));
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
            currentFeeling: profile.currentFeeling,
            struggles: profile.struggles,
            reactionStyle: profile.reactionStyle,
            wantsMoreOf: profile.wantsMoreOf,
            dreamSelfFeels: profile.dreamSelfFeels,
            futureNote: profile.futureNote,
          },
        });

        if (cancelled) return;

        if (error || data?.error) {
          console.error('AI message error:', error || data?.error);
          // Fall back to static
          if (!weekFresh) setFutureSelfMessage(getStaticFutureSelf(weekKey));
          if (!dayFresh) setMindsetMessage(getStaticMindset(todayKey));
          if (!focusFresh) setFocusToday(getStaticFocus(todayKey));
          return;
        }

        const newFuture = data.futureSelfMessage || DEFAULT_FUTURE_SELF;
        const newMindset = data.mindsetMessage || DEFAULT_MINDSET;
        const newFocus = data.focusToday || DEFAULT_FOCUS;

        setFutureSelfMessage(newFuture);
        setMindsetMessage(newMindset);
        setFocusToday(newFocus);

        // Cache in store
        updateProfile({
          cachedFutureSelfMessage: { message: newFuture, weekKey },
          cachedMindsetMessage: { message: newMindset, dateKey: todayKey },
          cachedFocusToday: { message: newFocus, dateKey: todayKey },
        });
      } catch (err) {
        console.error('Failed to fetch AI messages:', err);
        if (!weekFresh) setFutureSelfMessage(getStaticFutureSelf(weekKey));
        if (!dayFresh) setMindsetMessage(getStaticMindset(todayKey));
        if (!focusFresh) setFocusToday(getStaticFocus(todayKey));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { futureSelfMessage, mindsetMessage, focusToday, loading };
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

const staticFocusMessages = [
  "Open your notes app right now and write down 3 things you want this week — not someday, this week.",
  "Pick one task you've been avoiding and spend just 10 minutes on it before lunch. Set a timer.",
  "Before you go to bed tonight, lay out everything you need for tomorrow morning. Remove the friction.",
  "Send that message you've been drafting in your head. Don't overthink it — just hit send.",
  "Take a 15-minute walk after your next meal — no phone, no music. Just walk and breathe.",
  "Write down one thing you're proud of from this week and stick it where you'll see it tomorrow.",
  "Say no to one thing today that you'd normally say yes to out of guilt. Practice the boundary.",
  "Set a 20-minute timer and clean or organize one small space in your home. Start with your desk or nightstand.",
];

function getStaticFocus(todayKey: string): string {
  return staticFocusMessages[hashSeed(todayKey + '-focus') % staticFocusMessages.length];
}
