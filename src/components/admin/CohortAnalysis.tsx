import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

interface Props {
  events: AnalyticsEvent[];
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function weekLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function CohortAnalysis({ events }: Props) {
  const cohorts = useMemo(() => {
    // Find each user's first event (proxy for signup week)
    const firstSeen: Record<string, Date> = {};
    const activeWeeks: Record<string, Set<string>> = {};

    events.forEach(e => {
      const d = new Date(e.created_at);
      if (!firstSeen[e.user_id] || d < firstSeen[e.user_id]) {
        firstSeen[e.user_id] = d;
      }
      const week = getWeekStart(d);
      if (!activeWeeks[e.user_id]) activeWeeks[e.user_id] = new Set();
      activeWeeks[e.user_id].add(week);
    });

    // Group users by signup week
    const cohortUsers: Record<string, string[]> = {};
    Object.entries(firstSeen).forEach(([uid, date]) => {
      const week = getWeekStart(date);
      if (!cohortUsers[week]) cohortUsers[week] = [];
      cohortUsers[week].push(uid);
    });

    // Get all weeks sorted
    const allWeeks = [...new Set(events.map(e => getWeekStart(new Date(e.created_at))))].sort();

    // Build cohort retention table
    const rows = Object.entries(cohortUsers)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8) // last 8 cohorts
      .map(([cohortWeek, users]) => {
        const cohortWeekIdx = allWeeks.indexOf(cohortWeek);
        const retention: (number | null)[] = [];
        for (let i = 0; i < Math.min(6, allWeeks.length - cohortWeekIdx); i++) {
          const targetWeek = allWeeks[cohortWeekIdx + i];
          if (!targetWeek) { retention.push(null); continue; }
          const retained = users.filter(uid => activeWeeks[uid]?.has(targetWeek)).length;
          retention.push(Math.round((retained / users.length) * 100));
        }
        return { cohortWeek, size: users.length, retention };
      });

    return rows;
  }, [events]);

  if (cohorts.length === 0) {
    return null;
  }

  const maxWeeks = Math.max(...cohorts.map(c => c.retention.length));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Cohort Retention</CardTitle>
        <p className="text-xs text-muted-foreground">
          % of users active in each week after signup (by first-seen week)
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs whitespace-nowrap">Cohort</TableHead>
              <TableHead className="text-xs text-center">Users</TableHead>
              {Array.from({ length: maxWeeks }, (_, i) => (
                <TableHead key={i} className="text-xs text-center whitespace-nowrap">
                  W{i}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map(row => (
              <TableRow key={row.cohortWeek}>
                <TableCell className="text-xs font-medium whitespace-nowrap">
                  {weekLabel(row.cohortWeek)}
                </TableCell>
                <TableCell className="text-xs text-center">{row.size}</TableCell>
                {Array.from({ length: maxWeeks }, (_, i) => {
                  const val = row.retention[i];
                  if (val == null) return <TableCell key={i} className="text-xs text-center text-muted-foreground">—</TableCell>;
                  const bg = val >= 60 ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : val >= 30 ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
                    : val > 0 ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                    : 'text-muted-foreground';
                  return (
                    <TableCell key={i} className={`text-xs text-center font-medium ${bg}`}>
                      {val}%
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
