import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import type { MoodEntry } from '@/stores/userStore';
import { feelingIcons } from '@/lib/moodIcons';

const feelingCategories: Record<string, { label: string; icon: string; color: string }> = {
  calm: { label: 'Calm', icon: feelingIcons.calm, color: 'hsl(var(--chart-3))' },
  energized: { label: 'Energized', icon: feelingIcons.energized, color: 'hsl(var(--chart-4))' },
  grateful: { label: 'Grateful', icon: feelingIcons.grateful, color: 'hsl(var(--chart-1))' },
  creative: { label: 'Creative', icon: feelingIcons.creative, color: 'hsl(var(--chart-5))' },
  peaceful: { label: 'Peaceful', icon: feelingIcons.peaceful, color: 'hsl(var(--chart-2))' },
  confident: { label: 'Confident', icon: feelingIcons.confident, color: 'hsl(var(--chart-4))' },
  grounded: { label: 'Grounded', icon: feelingIcons.grounded, color: 'hsl(var(--chart-3))' },
  joyful: { label: 'Joyful', icon: feelingIcons.joyful, color: 'hsl(var(--chart-1))' },
  anxious: { label: 'Anxious', icon: feelingIcons.anxious, color: 'hsl(var(--chart-5))' },
  sad: { label: 'Sad', icon: feelingIcons.sad, color: 'hsl(var(--chart-2))' },
  overwhelmed: { label: 'Overwhelmed', icon: feelingIcons.overwhelmed, color: 'hsl(var(--chart-4))' },
  frustrated: { label: 'Frustrated', icon: feelingIcons.frustrated, color: 'hsl(var(--chart-5))' },
  tired: { label: 'Tired', icon: feelingIcons.tired, color: 'hsl(var(--chart-2))' },
  lonely: { label: 'Lonely', icon: feelingIcons.lonely, color: 'hsl(var(--chart-3))' },
  numb: { label: 'Numb', icon: feelingIcons.numb, color: 'hsl(var(--chart-2))' },
  hopeful: { label: 'Hopeful', icon: feelingIcons.hopeful, color: 'hsl(var(--chart-1))' },
  // Daily check-in states
  disconnected: { label: 'Disconnected', icon: feelingIcons.disconnected, color: 'hsl(var(--chart-2))' },
  'off-track': { label: 'Off track', icon: feelingIcons['off-track'], color: 'hsl(var(--chart-5))' },
  grounded: { label: 'Grounded', icon: feelingIcons.grounded, color: 'hsl(var(--chart-3))' },
  aligned: { label: 'Aligned', icon: feelingIcons.aligned, color: 'hsl(var(--chart-1))' },
  elevated: { label: 'Elevated', icon: feelingIcons.elevated, color: 'hsl(var(--chart-4))' },
};

type Range = '7d' | '14d' | '30d';

interface Props {
  moodHistory: MoodEntry[];
}

export default function MoodTrendsChart({ moodHistory }: Props) {
  const [range, setRange] = useState<Range>('14d');

  const rangeDays = range === '7d' ? 7 : range === '14d' ? 14 : 30;

  // Find top moods across all history
  const topMoods = useMemo(() => {
    const counts: Record<string, number> = {};
    moodHistory.forEach((entry) => {
      entry.moods.forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([key]) => key);
  }, [moodHistory]);

  // Build chart data
  const chartData = useMemo(() => {
    const now = startOfDay(new Date());
    const days: { date: Date; label: string; [mood: string]: number | string | Date }[] = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const row: Record<string, number | string | Date> = {
        date: day,
        label: format(day, 'MMM d'),
      };

      topMoods.forEach((mood) => {
        row[mood] = 0;
      });

      moodHistory.forEach((entry) => {
        const entryDay = format(new Date(entry.date), 'yyyy-MM-dd');
        if (entryDay === dayStr) {
          entry.moods.forEach((m) => {
            if (topMoods.includes(m)) {
              (row[m] as number)++;
            }
          });
        }
      });

      days.push(row as typeof days[0]);
    }
    return days;
  }, [moodHistory, topMoods, rangeDays]);

  // Mood frequency summary
  const moodSummary = useMemo(() => {
    const cutoff = subDays(new Date(), rangeDays);
    const counts: Record<string, number> = {};
    moodHistory.forEach((entry) => {
      if (new Date(entry.date) >= cutoff) {
        entry.moods.forEach((m) => {
          counts[m] = (counts[m] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [moodHistory, rangeDays]);

  if (moodHistory.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-3xl p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="section-title">Mood Trends</h2>
        </div>
        <p className="text-sm text-muted-foreground italic">
          Log your feelings a few more times to see your mood trends appear here.
        </p>
      </motion.div>
    );
  }

  const ranges: { value: Range; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="section-title">Mood Trends</h2>
        </div>
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

      {/* Chart */}
      <div className="h-40 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                value,
                `${feelingCategories[name]?.label || name}`,
              ]}
            />
            {topMoods.map((mood, i) => (
              <Area
                key={mood}
                type="monotone"
                dataKey={mood}
                stackId="1"
                stroke={feelingCategories[mood]?.color || `hsl(var(--chart-${i + 1}))`}
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top moods summary */}
      {moodSummary.length > 0 && (
        <div className="mt-4 pt-3 border-t border-primary/10">
          <p className="text-xs text-muted-foreground mb-2">Most frequent feelings</p>
          <div className="flex flex-wrap gap-2">
            {moodSummary.map(([mood, count]) => (
              <div
                key={mood}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 text-xs"
              >
                <img src={feelingCategories[mood]?.icon} alt="" className="w-4 h-4 object-contain" style={{ filter: 'none' }} />
                <span className="text-foreground/80">{feelingCategories[mood]?.label}</span>
                <span className="text-muted-foreground">×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
