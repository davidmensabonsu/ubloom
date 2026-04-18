import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import type { MoodEntry, UserProfile } from '@/stores/userStore';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';

type Range = '7d' | '14d' | '30d';

interface Props {
  moodHistory: MoodEntry[];
  dailyCheckinHistory?: { date: string; state: string }[]; // optional future feed; falls back to lastMoodCheckinDate + dailyCheckinState
  profile: Pick<UserProfile, 'lastMoodCheckinDate' | 'dailyCheckinState'>;
}

// Map a mood string to a colour bucket
function colorClassFor(mood: string | null): string {
  if (!mood) return 'bg-muted/30';
  const m = mood.toLowerCase();
  if (m === 'elevated' || m === 'aligned' || m === 'joyful' || m === 'energized' || m === 'hopeful') return 'bg-primary/70';
  if (m === 'grounded' || m === 'calm' || m === 'peaceful' || m === 'grateful') return 'bg-green-300/70';
  if (m === 'confident' || m === 'creative') return 'bg-yellow-300/70';
  if (m === 'off-track' || m === 'anxious' || m === 'overwhelmed' || m === 'frustrated' || m === 'sad' || m === 'lonely') return 'bg-purple-300/70';
  if (m === 'disconnected' || m === 'numb' || m === 'tired') return 'bg-muted';
  return 'bg-muted/40';
}

const LEGEND: { label: string; classes: string }[] = [
  { label: 'Elevated', classes: 'bg-primary/70' },
  { label: 'Grounded', classes: 'bg-green-300/70' },
  { label: 'Confident', classes: 'bg-yellow-300/70' },
  { label: 'Off track', classes: 'bg-purple-300/70' },
  { label: 'Disconnected', classes: 'bg-muted' },
  { label: 'Not logged', classes: 'bg-muted/30 border border-border' },
];

export default function MoodCalendar({ moodHistory, profile }: Props) {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>('14d');
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;

  // Build mood-by-date map (yyyy-MM-dd → primary mood string)
  const moodByDate = useMemo(() => {
    const map = new Map<string, string>();
    (moodHistory || []).forEach((entry) => {
      const dateKey = getLocalDateStr(new Date(entry.date));
      // Don't overwrite an earlier (more recent) entry for the same day
      if (!map.has(dateKey) && entry.moods.length > 0) {
        map.set(dateKey, entry.moods[0]);
      }
    });
    // Daily check-in state takes priority for that specific day
    if (profile.lastMoodCheckinDate && profile.dailyCheckinState) {
      map.set(profile.lastMoodCheckinDate, profile.dailyCheckinState);
    }
    return map;
  }, [moodHistory, profile.lastMoodCheckinDate, profile.dailyCheckinState]);

  // Build the grid: chronological from oldest → today, top-left to bottom-right
  const grid = useMemo(() => {
    const today = startOfDay(new Date());
    const cells = [] as { dateKey: string; date: Date; mood: string | null }[];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const key = getLocalDateStr(d);
      cells.push({ dateKey: key, date: d, mood: moodByDate.get(key) || null });
    }
    return cells;
  }, [days, moodByDate]);

  // Skipped check-ins this week (Sun → today)
  const skippedThisWeek = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let skipped = 0;
    for (let i = 0; i <= dayOfWeek; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getLocalDateStr(d);
      if (!moodByDate.has(key)) skipped++;
    }
    return skipped;
  }, [moodByDate]);

  const ranges: { value: Range; label: string }[] = [
    { value: '7d', label: '7d' },
    { value: '14d', label: '14d' },
    { value: '30d', label: '30d' },
  ];

  const monthName = format(new Date(), 'MMMM');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl tracking-tight text-foreground">{monthName} mood map</h2>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                range === r.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/50 text-muted-foreground hover:bg-primary/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar squares */}
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((cell, i) => {
          const letter = cell.mood ? cell.mood.charAt(0).toUpperCase() : '';
          const todayKey = getLocalDateStr();
          const isToday = cell.dateKey === todayKey;
          return (
            <motion.div
              key={cell.dateKey}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.012 }}
              title={`${format(cell.date, 'EEE, MMM d')}${cell.mood ? ` · ${cell.mood}` : ' · not logged'}`}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold text-white ${colorClassFor(cell.mood)} ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}`}
            >
              {letter}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${l.classes}`} />
            <span className="text-[11px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Ubi nudge */}
      {skippedThisWeek >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl p-3 bg-primary/10 border border-primary/20"
        >
          <div className="flex items-start gap-2">
            <MessageCircle size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              You skipped {skippedThisWeek} check-in{skippedThisWeek === 1 ? '' : 's'} this week. Even one tap helps Ubi understand you better — how are you feeling right now?
            </p>
          </div>
          <button
            onClick={() => navigate('/checkin')}
            className="mt-2 ml-6 text-xs font-medium text-primary hover:underline"
          >
            Check in now →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
