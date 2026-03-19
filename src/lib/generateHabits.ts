import { CoreHabit, TimeOfDay, UserProfile } from '@/stores/userStore';

interface HabitTemplate {
  title: string;
  icon: string;
  timeOfDay: TimeOfDay;
  tags: string[]; // matched against onboarding/dream life answers
}

const habitPool: HabitTemplate[] = [
  // Morning habits
  { title: 'Drink a glass of water', icon: 'glass-water', timeOfDay: 'morning', tags: ['health', 'wellness', 'energy', 'consistency'] },
  { title: 'Morning skincare routine', icon: 'sparkles', timeOfDay: 'morning', tags: ['confidence', 'selfWorth', 'consistency'] },
  { title: 'Set 3 intentions for the day', icon: 'sun', timeOfDay: 'morning', tags: ['clarity', 'direction', 'peace', 'grounded'] },
  { title: '5-minute morning stretch', icon: 'yoga', timeOfDay: 'morning', tags: ['health', 'wellness', 'energy', 'movement'] },
  { title: 'Gratitude journaling', icon: 'pencil', timeOfDay: 'morning', tags: ['peace', 'joy', 'grounded', 'peaceful', 'joyful'] },
  { title: 'Positive affirmations', icon: 'sparkles', timeOfDay: 'morning', tags: ['confidence', 'selfWorth', 'magnetic', 'confident'] },
  { title: 'Nourishing breakfast', icon: 'fruit', timeOfDay: 'morning', tags: ['health', 'wellness', 'energy'] },
  { title: 'Morning meditation', icon: 'prayer', timeOfDay: 'morning', tags: ['peace', 'anxiety', 'grounded', 'peaceful', 'calm'] },

  // Midday habits
  { title: 'Take a mindful walk', icon: 'hiking', timeOfDay: 'midday', tags: ['health', 'peace', 'energy', 'wellness', 'movement'] },
  { title: 'Drink water', icon: 'glass-water', timeOfDay: 'midday', tags: ['health', 'wellness', 'energy', 'consistency'] },
  { title: 'Screen break & stretch', icon: 'phone', timeOfDay: 'midday', tags: ['balance', 'wellness', 'energy', 'boundaries'] },
  { title: 'Check in with your mood', icon: 'heart', timeOfDay: 'midday', tags: ['peace', 'anxiety', 'overthink', 'peaceful'] },
  { title: 'Healthy lunch', icon: 'salad', timeOfDay: 'midday', tags: ['health', 'wellness', 'energy'] },
  { title: 'Connect with a loved one', icon: 'two-hearts', timeOfDay: 'midday', tags: ['love', 'connection', 'loved', 'relationships'] },
  { title: 'Work on a personal goal', icon: 'trophy', timeOfDay: 'midday', tags: ['career', 'success', 'direction', 'clarity', 'dreamer'] },
  { title: 'Read or learn something new', icon: 'book', timeOfDay: 'midday', tags: ['career', 'clarity', 'direction', 'seeker'] },

  // Evening habits
  { title: 'Evening skincare', icon: 'sparkles', timeOfDay: 'evening', tags: ['confidence', 'selfWorth', 'consistency'] },
  { title: 'Journal or reflect', icon: 'pencil', timeOfDay: 'evening', tags: ['peace', 'clarity', 'healer', 'transformer', 'grounded'] },
  { title: 'Unplug from screens', icon: 'phone', timeOfDay: 'evening', tags: ['peace', 'balance', 'anxiety', 'rest'] },
  { title: 'Plan tomorrow', icon: 'star', timeOfDay: 'evening', tags: ['clarity', 'direction', 'career', 'success', 'consistency'] },
  { title: 'Wind-down routine', icon: 'moon', timeOfDay: 'evening', tags: ['peace', 'rest', 'wellness', 'peaceful', 'calm'] },
  { title: 'Celebrate a win from today', icon: 'trophy', timeOfDay: 'evening', tags: ['confidence', 'joy', 'joyful', 'selfWorth'] },
  { title: 'Creative time', icon: 'palette', timeOfDay: 'evening', tags: ['joy', 'freedom', 'lifestyle', 'dreamer'] },
  { title: 'Gentle movement or yoga', icon: 'yoga', timeOfDay: 'evening', tags: ['health', 'wellness', 'peaceful', 'rest'] },
];

/**
 * Generate personalized habits based on onboarding & dream life answers.
 * Picks ~2 habits per time slot (6 total) that best match user preferences.
 */
export function generateHabitsFromProfile(profile: UserProfile): CoreHabit[] {
  // Collect all tags from user answers
  const userTags = new Set<string>();

  // From onboarding
  if (profile.struggles) profile.struggles.forEach((s) => userTags.add(s));
  if (profile.wantsMoreOf) profile.wantsMoreOf.forEach((w) => userTags.add(w));
  if (profile.dreamSelfFeels) profile.dreamSelfFeels.forEach((f) => userTags.add(f));
  if (profile.reactionStyle) userTags.add(profile.reactionStyle);
  if (profile.identityStatement) userTags.add(profile.identityStatement);

  // From dream life categories (use category IDs as tags)
  if (profile.dreamSelf) {
    Object.entries(profile.dreamSelf).forEach(([category, selections]) => {
      if (selections && selections.length > 0) {
        userTags.add(category);
      }
    });
  }

  // Score each habit by tag overlap
  const scored = habitPool.map((habit) => {
    const score = habit.tags.filter((tag) => userTags.has(tag)).length;
    return { ...habit, score };
  });

  // Pick top 2 per time slot
  const selected: CoreHabit[] = [];
  const timeslots: TimeOfDay[] = ['morning', 'midday', 'evening'];

  for (const time of timeslots) {
    const candidates = scored
      .filter((h) => h.timeOfDay === time)
      .sort((a, b) => b.score - a.score || Math.random() - 0.5);

    const picked = candidates.slice(0, 2);
    for (const h of picked) {
      selected.push({
        id: `habit-${time}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: h.title,
        timeOfDay: h.timeOfDay,
        icon: h.icon,
      });
    }
  }

  return selected;
}
