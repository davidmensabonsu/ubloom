import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { ArrowLeft, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from '@/components/admin/OverviewTab';
import UsersGrowthTab from '@/components/admin/UsersGrowthTab';
import ActivityQualityTab from '@/components/admin/ActivityQualityTab';
import DateRangeFilter, { type DateRange } from '@/components/admin/DateRangeFilter';

interface RatingRow {
  id: string;
  rating: string;
  message_content: string;
  conversation_context: string | null;
  created_at: string;
}

function filterByDate<T extends { created_at: string }>(items: T[], range: DateRange): T[] {
  return items.filter(item => {
    const d = new Date(item.created_at);
    if (range.from && d < range.from) return false;
    if (range.to && d > range.to) return false;
    return true;
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

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

  const filteredEvents = useMemo(() => filterByDate(events, dateRange), [events, dateRange]);
  const filteredRatings = useMemo(() => filterByDate(ratings, dateRange), [ratings, dateRange]);

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

  const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEvents = () => {
    downloadCsv('analytics_events.csv',
      ['timestamp', 'user_id', 'event_name', 'event_data'],
      filteredEvents.map(e => [e.created_at, e.user_id, e.event_name, JSON.stringify(e.event_data)])
    );
  };

  const exportRatings = () => {
    downloadCsv('ubi_ratings.csv',
      ['timestamp', 'rating', 'message_content', 'conversation_context'],
      filteredRatings.map(r => [r.created_at, r.rating, r.message_content, r.conversation_context || ''])
    );
  };

  const exportUserData = () => {
    downloadCsv('user_data.csv',
      ['user_id', 'data'],
      userData.map((u: any) => [u.user_id, JSON.stringify(u.data)])
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Analytics & insights</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportEvents} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Events
            </Button>
            <Button variant="outline" size="sm" onClick={exportRatings} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Ratings
            </Button>
            <Button variant="outline" size="sm" onClick={exportUserData} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Users
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

        {/* 3-Tab Layout */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users & Growth</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity & Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              events={filteredEvents}
              allEvents={events}
              ratings={filteredRatings}
              allRatings={ratings}
              totalOnboardingUsers={userData.length}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersGrowthTab events={filteredEvents} userData={userData} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityQualityTab events={filteredEvents} ratings={filteredRatings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
