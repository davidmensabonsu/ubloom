import { Clock, Repeat, CalendarDays, Sunrise, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { taskIconOptions } from '@/lib/taskIcons';
import type { PlannedTask } from '@/lib/routinePlanParser';

const ICON_BY_ID = new Map(taskIconOptions.map((o) => [o.id, o]));

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', mon: 'Mon',
  tuesday: 'Tue', tue: 'Tue', tues: 'Tue',
  wednesday: 'Wed', wed: 'Wed',
  thursday: 'Thu', thu: 'Thu', thurs: 'Thu',
  friday: 'Fri', fri: 'Fri',
  saturday: 'Sat', sat: 'Sat',
  sunday: 'Sun', sun: 'Sun',
};

function periodFor(t: PlannedTask): 'morning' | 'midday' | 'evening' {
  if (t.period === 'morning' || t.period === 'midday' || t.period === 'evening') return t.period;
  if (t.time) {
    const h = parseInt(t.time.split(':')[0] || '0', 10);
    if (h < 11) return 'morning';
    if (h < 17) return 'midday';
    return 'evening';
  }
  return 'morning';
}

function formatTime(time?: string): string {
  if (!time) return '';
  const [hStr, mStr = '00'] = time.split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time;
  const suffix = h >= 12 ? 'pm' : 'am';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${mStr.padStart(2, '0')}${suffix}`;
}

function recurrenceLabel(t: PlannedTask): string {
  if (t.recurrence === 'daily') return 'Every day';
  if (t.recurrence === 'one-off') return 'One-off';
  if (t.recurrence === 'weekly') {
    const days = (t.days || []).map((d) => DAY_LABELS[d.toLowerCase()]).filter(Boolean);
    if (!days.length) return 'Weekly';
    return days.join(', ');
  }
  return '';
}

const PERIOD_META: Record<string, { label: string; Icon: typeof Sunrise }> = {
  morning: { label: 'Morning', Icon: Sunrise },
  midday: { label: 'Midday', Icon: Sun },
  evening: { label: 'Evening', Icon: Moon },
};

interface Props {
  tasks: PlannedTask[];
  onApprove: () => void;
  onRequestChanges: () => void;
}

export default function PlanPreviewCard({ tasks, onApprove, onRequestChanges }: Props) {
  const groups: Record<'morning' | 'midday' | 'evening', PlannedTask[]> = {
    morning: [], midday: [], evening: [],
  };
  tasks.forEach((t) => groups[periodFor(t)].push(t));
  // Within each group, sort by time if present
  (['morning', 'midday', 'evening'] as const).forEach((k) => {
    groups[k].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  });

  return (
    <div className="mt-2 ml-9 max-w-[88%] space-y-3">
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-rose-200/70 bg-white/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-rose-500" />
            <span className="text-xs font-medium text-rose-700" style={{ fontFamily: 'Jost, sans-serif' }}>
              Your routine plan
            </span>
          </div>
          <span className="text-[11px] text-rose-600/80" style={{ fontFamily: 'Jost, sans-serif' }}>
            {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="divide-y divide-rose-100">
          {(['morning', 'midday', 'evening'] as const).map((period) => {
            const items = groups[period];
            if (!items.length) return null;
            const { label, Icon } = PERIOD_META[period];
            return (
              <div key={period} className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[11px] uppercase tracking-wide text-rose-500/80" style={{ fontFamily: 'Jost, sans-serif' }}>
                  <Icon size={12} />
                  <span>{label}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((t, idx) => {
                    const iconOpt = t.icon ? ICON_BY_ID.get(t.icon) : undefined;
                    const LucideIcon = iconOpt?.icon;
                    return (
                      <div
                        key={`${t.title}-${idx}`}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white border border-rose-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {iconOpt?.imageSrc ? (
                            <img
                              src={iconOpt.imageSrc}
                              alt=""
                              className="w-6 h-6 object-contain clay-icon"
                            />
                          ) : LucideIcon ? (
                            <LucideIcon size={16} className="text-rose-500" />
                          ) : (
                            <span className="text-rose-400 text-xs">◆</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate" style={{ fontFamily: 'Jost, sans-serif' }}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {t.time && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: 'Jost, sans-serif' }}>
                                <Clock size={10} />
                                {formatTime(t.time)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: 'Jost, sans-serif' }}>
                              <Repeat size={10} />
                              {recurrenceLabel(t)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Button
        onClick={onApprove}
        className="w-full rounded-full bg-rose-400 hover:bg-rose-500 text-white"
        style={{ fontFamily: 'Jost, sans-serif' }}
      >
        Looks good, add to my routine
      </Button>
      <Button
        variant="outline"
        onClick={onRequestChanges}
        className="w-full rounded-full border-rose-300 text-rose-500 hover:bg-rose-50"
        style={{ fontFamily: 'Jost, sans-serif' }}
      >
        I'd like to change something
      </Button>
    </div>
  );
}