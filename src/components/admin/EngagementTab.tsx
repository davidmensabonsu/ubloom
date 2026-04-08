import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';
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

export default function EngagementTab({ events }: { events: AnalyticsEvent[] }) {
  const stats = useMemo(() => {
    const uniqueUsers = new Set(events.map(e => e.user_id));
    const now = new Date();
    const day1 = new Date(now); day1.setHours(0, 0, 0, 0);
    const week1 = new Date(now); week1.setDate(week1.getDate() - 7);
    const month1 = new Date(now); month1.setDate(month1.getDate() - 30);

    const dau = new Set(events.filter(e => new Date(e.created_at) >= day1).map(e => e.user_id)).size;
    const wau = new Set(events.filter(e => new Date(e.created_at) >= week1).map(e => e.user_id)).size;
    const mau = new Set(events.filter(e => new Date(e.created_at) >= month1).map(e => e.user_id)).size;

    // Page views by page
    const pageViews = events.filter(e => e.event_name === 'page_view');
    const pageCounts: Record<string, number> = {};
    pageViews.forEach(e => {
      const page = e.event_data?.page || 'unknown';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const pageData = Object.entries(pageCounts)
      .map(([page, count]) => ({ page: page.replace('/', '') || 'home', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Feature usage
    const featureEvents = events.filter(e => !['page_view', 'session_start'].includes(e.event_name));
    const featureCounts: Record<string, number> = {};
    featureEvents.forEach(e => {
      featureCounts[e.event_name] = (featureCounts[e.event_name] || 0) + 1;
    });
    const featureData = Object.entries(featureCounts)
      .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))
      .sort((a, b) => b.count - a.count);

    // Sessions per day
    const sessionEvents = events.filter(e => e.event_name === 'session_start');
    const dailySessions: Record<string, number> = {};
    sessionEvents.forEach(e => {
      const day = e.created_at.slice(0, 10);
      dailySessions[day] = (dailySessions[day] || 0) + 1;
    });
    const sessionData = Object.entries(dailySessions)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalUsers: uniqueUsers.size, dau, wau, mau, pageData, featureData, sessionData };
  }, [events]);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{stats.totalUsers}</span>
            <span className="text-xs text-muted-foreground">Total Users</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{stats.dau}</span>
            <span className="text-xs text-muted-foreground">DAU</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{stats.wau}</span>
            <span className="text-xs text-muted-foreground">WAU</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{stats.mau}</span>
            <span className="text-xs text-muted-foreground">MAU</span>
          </CardContent>
        </Card>
      </div>

      {/* Page views chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Most Visited Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.pageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.pageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="page" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" name="Views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No page views yet</p>
          )}
        </CardContent>
      </Card>

      {/* Feature usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.featureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.featureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No events yet</p>
          )}
        </CardContent>
      </Card>

      {/* Daily sessions */}
      {stats.sessionData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
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
