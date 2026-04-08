import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(330 70% 60%)',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(40 80% 55%)',
];

export default function ProgressTab({ events }: { events: AnalyticsEvent[] }) {
  const stats = useMemo(() => {
    // Habit completions per day
    const habitEvents = events.filter(e => e.event_name === 'habit_completed');
    const dailyHabits: Record<string, number> = {};
    habitEvents.forEach(e => {
      const day = e.created_at.slice(0, 10);
      dailyHabits[day] = (dailyHabits[day] || 0) + 1;
    });
    const habitTrend = Object.entries(dailyHabits)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Journal entries per day
    const journalEvents = events.filter(e => e.event_name === 'journal_created');
    const dailyJournals: Record<string, number> = {};
    journalEvents.forEach(e => {
      const day = e.created_at.slice(0, 10);
      dailyJournals[day] = (dailyJournals[day] || 0) + 1;
    });
    const journalTrend = Object.entries(dailyJournals)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Mood distribution
    const moodEvents = events.filter(e => e.event_name === 'mood_checkin');
    const moodCounts: Record<string, number> = {};
    moodEvents.forEach(e => {
      const mood = e.event_data?.mood || 'unknown';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    const moodData = Object.entries(moodCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalHabits: habitEvents.length,
      totalJournals: journalEvents.length,
      totalMoods: moodEvents.length,
      habitTrend,
      journalTrend,
      moodData,
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.totalHabits}</span>
            <span className="text-xs text-muted-foreground">Habits Done</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.totalJournals}</span>
            <span className="text-xs text-muted-foreground">Journal Entries</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.totalMoods}</span>
            <span className="text-xs text-muted-foreground">Mood Check-ins</span>
          </CardContent>
        </Card>
      </div>

      {/* Habit completions trend */}
      {stats.habitTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Habit Completions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.habitTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Completions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Mood distribution */}
      {stats.moodData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mood Distribution (All Users)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.moodData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Journal trend */}
      {stats.journalTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.journalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Entries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
