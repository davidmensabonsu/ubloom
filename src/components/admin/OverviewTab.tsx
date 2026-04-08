import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, TrendingUp, Heart, CheckCircle2, MessageSquare, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line,
} from 'recharts';

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

interface RatingRow {
  id: string;
  rating: string;
  created_at: string;
}

interface Props {
  events: AnalyticsEvent[];
  allEvents: AnalyticsEvent[];
  ratings: RatingRow[];
  allRatings: RatingRow[];
  totalOnboardingUsers: number;
}

function periodSplit(items: { created_at: string }[]) {
  if (items.length === 0) return { current: [], previous: [] };
  const dates = items.map(i => new Date(i.created_at).getTime());
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  const mid = min + (max - min) / 2;
  return {
    current: items.filter(i => new Date(i.created_at).getTime() >= mid),
    previous: items.filter(i => new Date(i.created_at).getTime() < mid),
  };
}

function pctChange(current: number, previous: number): { value: number; direction: 'up' | 'down' | 'flat' } {
  if (previous === 0 && current === 0) return { value: 0, direction: 'flat' };
  if (previous === 0) return { value: 100, direction: 'up' };
  const change = Math.round(((current - previous) / previous) * 100);
  return { value: Math.abs(change), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat' };
}

function ChangeBadge({ change }: { change: { value: number; direction: 'up' | 'down' | 'flat' } }) {
  if (change.direction === 'flat') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
        <Minus className="h-2.5 w-2.5" /> 0%
      </span>
    );
  }
  const isUp = change.direction === 'up';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${isUp ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950'}`}>
      {isUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {change.value}%
    </span>
  );
}

export default function OverviewTab({ events, allEvents, ratings, allRatings, totalOnboardingUsers }: Props) {
  const stats = useMemo(() => {
    const uniqueUsers = new Set(events.map(e => e.user_id)).size;
    const now = new Date();
    const day1 = new Date(now); day1.setHours(0, 0, 0, 0);
    const week1 = new Date(now); week1.setDate(week1.getDate() - 7);
    const month1 = new Date(now); month1.setDate(month1.getDate() - 30);

    const dau = new Set(events.filter(e => new Date(e.created_at) >= day1).map(e => e.user_id)).size;
    const wau = new Set(events.filter(e => new Date(e.created_at) >= week1).map(e => e.user_id)).size;
    const mau = new Set(events.filter(e => new Date(e.created_at) >= month1).map(e => e.user_id)).size;

    // Comparison splits
    const eventSplit = periodSplit(events);
    const currentUniqueUsers = new Set(eventSplit.current.map(e => e.user_id)).size;
    const prevUniqueUsers = new Set(eventSplit.previous.map(e => e.user_id)).size;
    const usersChange = pctChange(currentUniqueUsers, prevUniqueUsers);

    const currentHabits = eventSplit.current.filter(e => e.event_name === 'habit_completed').length;
    const prevHabits = eventSplit.previous.filter(e => e.event_name === 'habit_completed').length;
    const habitsChange = pctChange(currentHabits, prevHabits);

    const currentMoods = eventSplit.current.filter(e => e.event_name === 'mood_checkin').length;
    const prevMoods = eventSplit.previous.filter(e => e.event_name === 'mood_checkin').length;
    const moodsChange = pctChange(currentMoods, prevMoods);

    const ratingSplit = periodSplit(ratings);
    const currentApproval = ratingSplit.current.length > 0
      ? Math.round((ratingSplit.current.filter(r => r.rating === 'up').length / ratingSplit.current.length) * 100) : 0;
    const prevApproval = ratingSplit.previous.length > 0
      ? Math.round((ratingSplit.previous.filter(r => r.rating === 'up').length / ratingSplit.previous.length) * 100) : 0;
    const approvalChange = pctChange(currentApproval, prevApproval);

    const totalApproval = ratings.length > 0
      ? Math.round((ratings.filter(r => r.rating === 'up').length / ratings.length) * 100) : 0;

    const totalHabits = events.filter(e => e.event_name === 'habit_completed').length;
    const totalMoods = events.filter(e => e.event_name === 'mood_checkin').length;

    // Daily sessions for sparkline
    const sessionEvents = events.filter(e => e.event_name === 'session_start');
    const dailySessions: Record<string, number> = {};
    sessionEvents.forEach(e => {
      const day = e.created_at.slice(0, 10);
      dailySessions[day] = (dailySessions[day] || 0) + 1;
    });
    const sessionData = Object.entries(dailySessions)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily active users trend
    const dailyActive: Record<string, Set<string>> = {};
    events.forEach(e => {
      const day = e.created_at.slice(0, 10);
      if (!dailyActive[day]) dailyActive[day] = new Set();
      dailyActive[day].add(e.user_id);
    });
    const dauTrend = Object.entries(dailyActive)
      .map(([date, users]) => ({ date, users: users.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      uniqueUsers, dau, wau, mau,
      usersChange, habitsChange, moodsChange, approvalChange,
      totalApproval, totalHabits, totalMoods,
      sessionData, dauTrend,
    };
  }, [events, ratings]);

  const kpis = [
    { label: 'Active Users', value: stats.uniqueUsers, change: stats.usersChange, icon: Users, color: 'text-muted-foreground' },
    { label: 'DAU / WAU / MAU', value: `${stats.dau} / ${stats.wau} / ${stats.mau}`, change: null, icon: Eye, color: 'text-primary' },
    { label: 'Habits Completed', value: stats.totalHabits, change: stats.habitsChange, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Mood Check-ins', value: stats.totalMoods, change: stats.moodsChange, icon: Heart, color: 'text-pink-500' },
    { label: 'Ubi Approval', value: `${stats.totalApproval}%`, change: stats.approvalChange, icon: MessageSquare, color: 'text-primary' },
    { label: 'Onboarded Users', value: totalOnboardingUsers, change: null, icon: TrendingUp, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        A snapshot of your app's health. Comparison badges show change between the first and second half of your selected date range.
      </p>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                {kpi.change && <ChangeBadge change={kpi.change} />}
              </div>
              <span className="text-xl font-bold text-foreground">{kpi.value}</span>
              <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DAU Trend */}
      {stats.dauTrend.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.dauTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" name="Active Users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Daily Sessions */}
      {stats.sessionData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
