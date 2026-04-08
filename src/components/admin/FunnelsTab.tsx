import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

export default function FunnelsTab({ events }: { events: AnalyticsEvent[] }) {
  const stats = useMemo(() => {
    const uniqueUsers = new Set(events.map(e => e.user_id));
    const totalUsers = uniqueUsers.size;

    // Onboarding funnel: count users who reached each step
    const onboardingSteps = events.filter(e => e.event_name === 'onboarding_step');
    const stepCounts: Record<string, Set<string>> = {};
    onboardingSteps.forEach(e => {
      const step = e.event_data?.step || `step_${e.event_data?.stepIndex}`;
      if (!stepCounts[step]) stepCounts[step] = new Set();
      stepCounts[step].add(e.user_id);
    });
    const completedUsers = new Set(events.filter(e => e.event_name === 'onboarding_complete').map(e => e.user_id)).size;

    const funnelData = Object.entries(stepCounts)
      .map(([step, users]) => ({ step, users: users.size }))
      .concat([{ step: 'completed', users: completedUsers }]);

    // Feature adoption: % of users who used each feature at least once
    const featureNames = ['mood_checkin', 'journal_created', 'habit_completed', 'resource_viewed', 'ubi_message_sent'];
    const adoptionData = featureNames.map(name => {
      const usersWhoUsed = new Set(events.filter(e => e.event_name === name).map(e => e.user_id)).size;
      return {
        feature: name.replace(/_/g, ' '),
        percent: totalUsers > 0 ? Math.round((usersWhoUsed / totalUsers) * 100) : 0,
        users: usersWhoUsed,
      };
    }).sort((a, b) => b.percent - a.percent);

    // Retention: users active in last 7 days vs 30 days
    const now = new Date();
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);

    const active7 = new Set(events.filter(e => new Date(e.created_at) >= d7).map(e => e.user_id)).size;
    const active30 = new Set(events.filter(e => new Date(e.created_at) >= d30).map(e => e.user_id)).size;

    return { funnelData, adoptionData, totalUsers, active7, active30 };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.totalUsers}</span>
            <span className="text-xs text-muted-foreground">Total Tracked</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.active7}</span>
            <span className="text-xs text-muted-foreground">7-day Active</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.active30}</span>
            <span className="text-xs text-muted-foreground">30-day Active</span>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding funnel */}
      {stats.funnelData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="step" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="users" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Feature adoption */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Feature Adoption (% of users)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.adoptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.adoptionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="percent" name="Adoption" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
