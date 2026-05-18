export interface PlannedTask {
  title: string;
  time?: string;            // HH:mm
  recurrence: 'daily' | 'weekly' | 'one-off';
  days?: string[];          // ["monday", ...]
  icon?: string;
  period?: 'morning' | 'midday' | 'evening';
}

export type PlanAction = 'add' | 'replace_today' | 'clear_today';
export type PlanScope = 'today' | 'ongoing';

export interface RoutinePlan {
  action: PlanAction;
  scope: PlanScope;
  tasks: PlannedTask[];
}

const OPTIONS_RE = /<options>([\s\S]*?)<\/options>/i;
const PLAN_RE = /<routine_plan>([\s\S]*?)<\/routine_plan>/i;

export function parseOptions(content: string): string[] | null {
  const m = content.match(OPTIONS_RE);
  if (!m) return null;
  const parts = m[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

function normalizeTask(t: any): PlannedTask | null {
  if (!t || typeof t.title !== 'string' || !t.title.trim()) return null;
  return {
    title: String(t.title).trim(),
    time: typeof t.time === 'string' ? t.time : undefined,
    recurrence:
      t.recurrence === 'weekly' || t.recurrence === 'one-off' ? t.recurrence : 'daily',
    days: Array.isArray(t.days) ? t.days.map((d: any) => String(d).toLowerCase()) : [],
    icon: typeof t.icon === 'string' ? t.icon : undefined,
    period: ['morning', 'midday', 'evening'].includes(t.period) ? t.period : undefined,
  };
}

export function parseRoutinePlan(content: string): RoutinePlan | null {
  const m = content.match(PLAN_RE);
  if (!m) return null;
  try {
    const raw = JSON.parse(m[1].trim());
    // Legacy: bare array of tasks => treat as "add"
    if (Array.isArray(raw)) {
      const tasks = raw.map(normalizeTask).filter((t): t is PlannedTask => !!t);
      return { action: 'add', scope: 'ongoing', tasks };
    }
    if (raw && typeof raw === 'object') {
      const action: PlanAction =
        raw.action === 'replace_today' || raw.action === 'clear_today' ? raw.action : 'add';
      const scope: PlanScope = raw.scope === 'today' ? 'today' : (action === 'add' ? 'ongoing' : 'today');
      const tasksArr = Array.isArray(raw.tasks) ? raw.tasks : [];
      const tasks = tasksArr.map(normalizeTask).filter((t): t is PlannedTask => !!t);
      return { action, scope, tasks };
    }
    return null;
  } catch {
    return null;
  }
}

export function stripPlanMarkers(content: string): string {
  return content.replace(OPTIONS_RE, '').replace(PLAN_RE, '').trim();
}