import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, TrendingUp, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
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
  message_content: string;
  conversation_context: string | null;
  created_at: string;
}

const MOOD_COLORS = [
  'hsl(var(--primary))',
  'hsl(330 70% 60%)',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(40 80% 55%)',
];

interface Props {
  events: AnalyticsEvent[];
  ratings: RatingRow[];
}

export default function ActivityQualityTab({ events, ratings }: Props) {
  const stats = useMemo(() => {
    // --- Page Views ---
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

    // --- Feature Usage ---
    const featureEvents = events.filter(e => !['page_view', 'session_start'].includes(e.event_name));
    const featureCounts: Record<string, number> = {};
    featureEvents.forEach(e => {
      featureCounts[e.event_name] = (featureCounts[e.event_name] || 0) + 1;
    });
    const featureData = Object.entries(featureCounts)
      .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))
      .sort((a, b) => b.count - a.count);

    // --- Habit Trend ---
    const habitEvents = events.filter(e => e.event_name === 'habit_completed');
    const dailyHabits: Record<string, number> = {};
    habitEvents.forEach(e => {
      const day = e.created_at.slice(0, 10);
      dailyHabits[day] = (dailyHabits[day] || 0) + 1;
    });
    const habitTrend = Object.entries(dailyHabits)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Journal Trend ---
    const journalEvents = events.filter(e => e.event_name === 'journal_created');
    const dailyJournals: Record<string, number> = {};
    journalEvents.forEach(e => {
      const day = e.created_at.slice(0, 10);
      dailyJournals[day] = (dailyJournals[day] || 0) + 1;
    });
    const journalTrend = Object.entries(dailyJournals)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Mood Distribution ---
    const moodEvents = events.filter(e => e.event_name === 'mood_checkin');
    const moodCounts: Record<string, number> = {};
    moodEvents.forEach(e => {
      const mood = e.event_data?.mood || 'unknown';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    const moodData = Object.entries(moodCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // --- Ubi Ratings ---
    const totalUp = ratings.filter(r => r.rating === 'up').length;
    const totalDown = ratings.filter(r => r.rating === 'down').length;
    const total = ratings.length;
    const approvalRate = total > 0 ? Math.round((totalUp / total) * 100) : 0;

    const dailyMap = new Map<string, { date: string; up: number; down: number }>();
    ratings.forEach(r => {
      const day = r.created_at.slice(0, 10);
      const entry = dailyMap.get(day) || { date: day, up: 0, down: 0 };
      if (r.rating === 'up') entry.up++; else entry.down++;
      dailyMap.set(day, entry);
    });
    const ratingTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const recentRated = [...ratings].reverse().slice(0, 8);

    return {
      pageData, featureData,
      habitTrend, journalTrend, moodData,
      totalUp, totalDown, total, approvalRate,
      ratingTrend, recentRated,
      totalHabits: habitEvents.length,
      totalJournals: journalEvents.length,
      totalMoods: moodEvents.length,
    };
  }, [events, ratings]);

  const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive, 0 84% 60%))'];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        What users are doing in the app, how often, and how well your AI assistant is performing.
      </p>

      {/* --- Engagement Section --- */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Engagement</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Visited Pages</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.pageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.pageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="page" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" name="Views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Feature Usage (by event count)</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.featureData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.featureData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-30} textAnchor="end" height={55} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Progress Section --- */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">User Progress</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-foreground">{stats.totalHabits}</span>
              <span className="text-[10px] text-muted-foreground">Habits Done</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-foreground">{stats.totalJournals}</span>
              <span className="text-[10px] text-muted-foreground">Journal Entries</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-foreground">{stats.totalMoods}</span>
              <span className="text-[10px] text-muted-foreground">Mood Check-ins</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {stats.habitTrend.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Habit Completions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
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

          {stats.moodData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Mood Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={stats.moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label>
                      {stats.moodData.map((_, i) => <Cell key={i} fill={MOOD_COLORS[i % MOOD_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {stats.journalTrend.length > 0 && (
            <Card className="sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Journal Entries Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
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
      </div>

      {/* --- Ubi Quality Section --- */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Ubi AI Quality</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-bold text-foreground">{stats.total}</span>
              <span className="text-[10px] text-muted-foreground">Total Ratings</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">{stats.totalUp}</span>
              <span className="text-[10px] text-muted-foreground">Positive</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <ThumbsDown className="h-4 w-4 text-destructive" />
              <span className="text-xl font-bold text-foreground">{stats.totalDown}</span>
              <span className="text-[10px] text-muted-foreground">Negative</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">{stats.approvalRate}%</span>
              <span className="text-[10px] text-muted-foreground">Approval</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {stats.ratingTrend.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Daily Rating Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.ratingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="up" name="Positive" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="down" name="Negative" fill="hsl(var(--destructive, 0 84% 60%))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {stats.total > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={[{ name: 'Positive', value: stats.totalUp }, { name: 'Negative', value: stats.totalDown }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label>
                      <Cell fill={PIE_COLORS[0]} />
                      <Cell fill={PIE_COLORS[1]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {stats.ratingTrend.length > 1 && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stats.ratingTrend.map(d => ({
                  date: d.date,
                  rate: d.up + d.down > 0 ? Math.round((d.up / (d.up + d.down)) * 100) : 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" name="Approval %" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Rated */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Rated Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentRated.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No ratings yet</p>
            ) : (
              stats.recentRated.map(r => (
                <div key={r.id} className="flex gap-3 items-start border-b border-border pb-3 last:border-0">
                  {r.rating === 'up'
                    ? <ThumbsUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    : <ThumbsDown className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    {r.conversation_context && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">User: {r.conversation_context}</p>
                    )}
                    <p className="text-sm text-foreground line-clamp-2">{r.message_content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
