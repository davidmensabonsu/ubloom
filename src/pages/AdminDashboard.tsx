import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, TrendingUp, BarChart3, ArrowLeft, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import EngagementTab from '@/components/admin/EngagementTab';
import DemographicsTab from '@/components/admin/DemographicsTab';
import ProgressTab from '@/components/admin/ProgressTab';
import FunnelsTab from '@/components/admin/FunnelsTab';

interface RatingRow {
  id: string;
  rating: string;
  message_content: string;
  conversation_context: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) return;

    const fetchAll = async () => {
      const [ratingsRes, eventsRes, userDataRes] = await Promise.all([
        (supabase as any).from('ubi_ratings').select('*').order('created_at', { ascending: true }),
        (supabase as any).from('analytics_events').select('*').order('created_at', { ascending: true }).limit(10000),
        (supabase as any).from('user_data').select('user_id, data'),
      ]);

      if (!ratingsRes.error && ratingsRes.data) setRatings(ratingsRes.data);
      if (!eventsRes.error && eventsRes.data) setEvents(eventsRes.data);
      if (!userDataRes.error && userDataRes.data) setUserData(userDataRes.data);
      setLoading(false);
    };

    fetchAll();
  }, [isAdmin, adminLoading]);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Access denied. Admin role required.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  // Ubi ratings stats
  const totalUp = ratings.filter(r => r.rating === 'up').length;
  const totalDown = ratings.filter(r => r.rating === 'down').length;
  const total = ratings.length;
  const approvalRate = total > 0 ? Math.round((totalUp / total) * 100) : 0;

  const dailyMap = new Map<string, { date: string; up: number; down: number }>();
  ratings.forEach(r => {
    const day = r.created_at.slice(0, 10);
    const entry = dailyMap.get(day) || { date: day, up: 0, down: 0 };
    if (r.rating === 'up') entry.up++;
    else entry.down++;
    dailyMap.set(day, entry);
  });
  const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const pieData = [
    { name: 'Positive', value: totalUp },
    { name: 'Negative', value: totalDown },
  ];
  const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive, 0 84% 60%))'];

  const recentRated = [...ratings].reverse().slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Analytics & insights</p>
          </div>
        </div>

        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
            <TabsTrigger value="demographics" className="text-xs">Demographics</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
            <TabsTrigger value="funnels" className="text-xs">Funnels</TabsTrigger>
            <TabsTrigger value="ubi" className="text-xs">Ubi Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement">
            <EngagementTab events={events} />
          </TabsContent>

          <TabsContent value="demographics">
            <DemographicsTab userData={userData} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTab events={events} />
          </TabsContent>

          <TabsContent value="funnels">
            <FunnelsTab events={events} />
          </TabsContent>

          <TabsContent value="ubi">
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-1">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">{total}</span>
                    <span className="text-xs text-muted-foreground">Total Ratings</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-1">
                    <ThumbsUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{totalUp}</span>
                    <span className="text-xs text-muted-foreground">Positive</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-1">
                    <ThumbsDown className="h-5 w-5 text-destructive" />
                    <span className="text-2xl font-bold text-foreground">{totalDown}</span>
                    <span className="text-xs text-muted-foreground">Negative</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-1">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{approvalRate}%</span>
                    <span className="text-xs text-muted-foreground">Approval Rate</span>
                  </CardContent>
                </Card>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Daily Rating Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="up" name="Positive" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="down" name="Negative" fill="hsl(var(--destructive, 0 84% 60%))" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-10">No ratings yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {total > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-10">No ratings yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {dailyTrend.length > 1 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Approval Rate Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={dailyTrend.map(d => ({
                        date: d.date,
                        rate: d.up + d.down > 0 ? Math.round((d.up / (d.up + d.down)) * 100) : 0,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => `${v}%`} />
                        <Line type="monotone" dataKey="rate" name="Approval %" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent Rated Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentRated.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No ratings yet</p>
                  ) : (
                    recentRated.map(r => (
                      <div key={r.id} className="flex gap-3 items-start border-b border-border pb-3 last:border-0">
                        {r.rating === 'up' ? (
                          <ThumbsUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          {r.conversation_context && (
                            <p className="text-xs text-muted-foreground mb-1 truncate">
                              User: {r.conversation_context}
                            </p>
                          )}
                          <p className="text-sm text-foreground line-clamp-2">{r.message_content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
