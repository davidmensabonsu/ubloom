import { Clock, Repeat, CalendarDays, Sunrise, Sun, Moon, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { taskIconOptions } from '@/lib/taskIcons';
import type { PlannedTask, PlanAction } from '@/lib/routinePlanParser';
import type { CoreHabit } from '@/stores/userStore';

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

function periodForHabit(h: CoreHabit): 'morning' | 'midday' | 'evening' {
  if (h.scheduledTime) {
    const hr = parseInt(h.scheduledTime.split(':')[0] || '0', 10);
    if (hr < 11) return 'morning';
    if (hr < 17) return 'midday';
    return 'evening';
  }
  return h.timeOfDay || 'morning';
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

type PreviewItem = {
  key: string;
  title: string;
  time?: string;
  iconId?: string;
  recurrenceLabel: string;
  source: 'existing' | 'new';
  period: 'morning' | 'midday' | 'evening';
};

interface Props {
  tasks: PlannedTask[];
  action?: PlanAction;
  existingTodayTasks?: CoreHabit[];
  /** yyyy-MM-dd; when set & in the future, preview is framed as "Starting {date}". */
  startsOn?: string;
  onApprove: () => void;
  onRequestChanges: () => void;
}

export default function PlanPreviewCard({
  tasks,
  action = 'add',
  existingTodayTasks = [],
  startsOn,
  onApprove,
  onRequestChanges,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isFutureStart = !!startsOn && startsOn > today && action === 'add';
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const isTomorrow = isFutureStart && startsOn === tomorrowStr;
  // Build the resulting day depending on action.
  const items: PreviewItem[] = [];

  if (action !== 'clear_today') {
    if (action === 'add' && !isFutureStart) {
      existingTodayTasks.forEach((h, i) => {
        items.push({
          key: `ex-${h.id}-${i}`,
          title: h.title,
          time: h.scheduledTime,
          iconId: h.icon,
          recurrenceLabel: 'Already in your day',
          source: 'existing',
          period: periodForHabit(h),
        });
      });
    }
    tasks.forEach((t, i) => {
      items.push({
        key: `new-${t.title}-${i}`,
        title: t.title,
        time: t.time,
        iconId: t.icon,
        recurrenceLabel: recurrenceLabel(t),
        source: 'new',
        period: periodFor(t),
      });
    });
  }

  const groups: Record<'morning' | 'midday' | 'evening', PreviewItem[]> = {
    morning: [], midday: [], evening: [],
  };
  items.forEach((it) => groups[it.period].push(it));
  (['morning', 'midday', 'evening'] as const).forEach((k) => {
    groups[k].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  });

  const totalCount = items.length;

  const headerLabel =
    isTomorrow
      ? "Tomorrow's plan — today stays the same"
      : isFutureStart
      ? `Starting ${startsOn} — today stays the same`
      : action === 'replace_today'
      ? "Today's new plan (replacing your usual)"
      : action === 'clear_today'
        ? "Today will be cleared"
        : "Today's plan with these additions";

  const HeaderIcon = action === 'clear_today' ? Trash2 : CalendarDays;

  const pausedCount =
    action === 'replace_today' || action === 'clear_today'
      ? existingTodayTasks.length
      : 0;

  const approveLabel =
    action === 'replace_today'
      ? 'Apply to today only'
      : action === 'clear_today'
        ? 'Clear today'
        : 'Looks good, add to my routine';

  return (
    <div className="mt-2 ml-9 max-w-[88%] space-y-3">
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-rose-200/70 bg-white/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeaderIcon size={14} className="text-rose-500" />
            <span className="text-xs font-medium text-rose-700" style={{ fontFamily: 'Jost, sans-serif' }}>
              {headerLabel}
            </span>
          </div>
          <span className="text-[11px] text-rose-600/80" style={{ fontFamily: 'Jost, sans-serif' }}>
            {totalCount} task{totalCount === 1 ? '' : 's'}
          </span>
        </div>
        {action === 'clear_today' && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground" style={{ fontFamily: 'Jost, sans-serif' }}>
            Today's list will be empty.
            <br />
            Your recurring tasks come back tomorrow.
          </div>
        )}
        <div className="divide-y divide-rose-100">
          {(['morning', 'midday', 'evening'] as const).map((period) => {
            const list = groups[period];
            if (!list.length) return null;
            const { label, Icon } = PERIOD_META[period];
            return (
              <div key={period} className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[11px] uppercase tracking-wide text-rose-500/80" style={{ fontFamily: 'Jost, sans-serif' }}>
                  <Icon size={12} />
                  <span>{label}</span>
                </div>
                <div className="space-y-1.5">
                  {list.map((t) => {
                    const iconOpt = t.iconId ? ICON_BY_ID.get(t.iconId) : undefined;
                    const LucideIcon = iconOpt?.icon;
                    const isNew = t.source === 'new';
                    return (
                      <div
                        key={t.key}
                        className={`flex items-center gap-3 px-2.5 py-2 rounded-xl border ${
                          isNew
                            ? 'bg-white border-rose-200'
                            : 'bg-white/60 border-rose-100/70'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${isNew ? 'bg-rose-50' : 'bg-muted/40'}`}>
                          {iconOpt?.imageSrc ? (
                            <img
                              src={iconOpt.imageSrc}
                              alt=""
                              className={`w-6 h-6 object-contain clay-icon ${isNew ? '' : 'opacity-70'}`}
                            />
                          ) : LucideIcon ? (
                            <LucideIcon size={16} className={isNew ? 'text-rose-500' : 'text-muted-foreground'} />
                          ) : (
                            <span className="text-rose-400 text-xs">◆</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isNew ? 'text-foreground' : 'text-muted-foreground'}`} style={{ fontFamily: 'Jost, sans-serif' }}>
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
                              {isNew ? <Sparkles size={10} /> : <Repeat size={10} />}
                              {t.recurrenceLabel}
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
        {pausedCount > 0 && (
          <div className="px-4 py-2 border-t border-rose-200/70 bg-white/40 text-[11px] text-muted-foreground" style={{ fontFamily: 'Jost, sans-serif' }}>
            {pausedCount} recurring {pausedCount === 1 ? 'task is' : 'tasks are'} paused for today only — back tomorrow.
          </div>
        )}
      </div>
      <Button
        onClick={onApprove}
        className="w-full rounded-full bg-rose-400 hover:bg-rose-500 text-white"
        style={{ fontFamily: 'Jost, sans-serif' }}
      >
        {approveLabel}
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