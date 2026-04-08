import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import CohortAnalysis from './CohortAnalysis';

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

interface UserDataRow {
  user_id: string;
  data: any;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(330 70% 60%)',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(40 80% 55%)',
  'hsl(270 60% 55%)',
  'hsl(10 70% 55%)',
  'hsl(180 50% 45%)',
];

interface Props {
  events: AnalyticsEvent[];
  userData: UserDataRow[];
}

export default function UsersGrowthTab({ events, userData }: Props) {
  const stats = useMemo(() => {
    const uniqueUsers = new Set(events.map(e => e.user_id));
    const totalUsers = uniqueUsers.size;

    // --- Onboarding Funnel ---
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

    // --- Feature Adoption ---
    const featureNames = ['mood_checkin', 'journal_created', 'habit_completed', 'resource_viewed', 'ubi_message_sent'];
    const adoptionData = featureNames.map(name => {
      const usersWhoUsed = new Set(events.filter(e => e.event_name === name).map(e => e.user_id)).size;
      return {
        feature: name.replace(/_/g, ' '),
        percent: totalUsers > 0 ? Math.round((usersWhoUsed / totalUsers) * 100) : 0,
        users: usersWhoUsed,
      };
    }).sort((a, b) => b.percent - a.percent);

    // --- Retention ---
    const now = new Date();
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    const active7 = new Set(events.filter(e => new Date(e.created_at) >= d7).map(e => e.user_id)).size;
    const active30 = new Set(events.filter(e => new Date(e.created_at) >= d30).map(e => e.user_id)).size;

    // --- Demographics ---
    const struggleCounts: Record<string, number> = {};
    const aestheticCounts: Record<string, number> = {};
    const feelingCounts: Record<string, number> = {};
    userData.forEach(row => {
      const d = row.data;
      (Array.isArray(d?.struggles) ? d.struggles : []).forEach((s: string) => {
        struggleCounts[s] = (struggleCounts[s] || 0) + 1;
      });
      if (d?.aesthetic) aestheticCounts[d.aesthetic] = (aestheticCounts[d.aesthetic] || 0) + 1;
      if (d?.currentFeeling) feelingCounts[d.currentFeeling] = (feelingCounts[d.currentFeeling] || 0) + 1;
    });
    const struggleData = Object.entries(struggleCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const aestheticData = Object.entries(aestheticCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const feelingData = Object.entries(feelingCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { totalUsers, funnelData, adoptionData, active7, active30, struggleData, aestheticData, feelingData, totalOnboarding: userData.length };
  }, [events, userData]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Understand who your users are, how they onboard, and whether they stick around.
      </p>

      {/* Retention KPIs */}
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

      {/* Onboarding Funnel */}
      {stats.funnelData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Funnel</CardTitle>
            <p className="text-xs text-muted-foreground">How many users complete each onboarding step</p>
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

      {/* Feature Adoption */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
          <p className="text-xs text-muted-foreground">% of users who have used each feature at least once</p>
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

      {/* Demographics Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Demographics ({stats.totalOnboarding} users with onboarding data)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Struggles */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Struggles</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.struggleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.struggleData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
            </CardContent>
          </Card>

          {/* Aesthetics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Aesthetic Choices</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.aestheticData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.aestheticData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {stats.aestheticData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
            </CardContent>
          </Card>

          {/* Feelings */}
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Initial Feeling Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.feelingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.feelingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {stats.feelingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
