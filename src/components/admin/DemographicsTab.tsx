import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface UserDataRow {
  user_id: string;
  data: any;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent-foreground))',
  'hsl(330 70% 60%)',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(40 80% 55%)',
  'hsl(270 60% 55%)',
  'hsl(10 70% 55%)',
];

export default function DemographicsTab({ userData }: { userData: UserDataRow[] }) {
  const stats = useMemo(() => {
    // Aggregate struggles
    const struggleCounts: Record<string, number> = {};
    const aestheticCounts: Record<string, number> = {};
    const feelingCounts: Record<string, number> = {};

    userData.forEach(row => {
      const d = row.data;
      // Struggles
      const struggles = d?.struggles || [];
      (Array.isArray(struggles) ? struggles : []).forEach((s: string) => {
        struggleCounts[s] = (struggleCounts[s] || 0) + 1;
      });
      // Aesthetic
      const aesthetic = d?.aesthetic;
      if (aesthetic) {
        aestheticCounts[aesthetic] = (aestheticCounts[aesthetic] || 0) + 1;
      }
      // Feeling
      const feeling = d?.currentFeeling;
      if (feeling) {
        feelingCounts[feeling] = (feelingCounts[feeling] || 0) + 1;
      }
    });

    const struggleData = Object.entries(struggleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const aestheticData = Object.entries(aestheticCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const feelingData = Object.entries(feelingCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { struggleData, aestheticData, feelingData, totalUsers: userData.length };
  }, [userData]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{stats.totalUsers} users with onboarding data</p>
        </CardContent>
      </Card>

      {/* Top struggles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Struggles</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.struggleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.struggleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" name="Users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Aesthetic distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Aesthetic Choices</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.aestheticData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.aestheticData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.aestheticData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
          )}
        </CardContent>
      </Card>

      {/* How users feel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Initial Feeling Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.feelingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.feelingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.feelingData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
