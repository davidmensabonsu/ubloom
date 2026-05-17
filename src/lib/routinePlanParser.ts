export interface PlannedTask {
  title: string;
  time?: string;            // HH:mm
  recurrence: 'daily' | 'weekly' | 'one-off';
  days?: string[];          // ["monday", ...]
  icon?: string;
  period?: 'morning' | 'midday' | 'evening';
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

export function parseRoutinePlan(content: string): PlannedTask[] | null {
  const m = content.match(PLAN_RE);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[1].trim());
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((t) => t && typeof t.title === 'string' && t.title.trim())
      .map((t) => ({
        title: String(t.title).trim(),
        time: typeof t.time === 'string' ? t.time : undefined,
        recurrence: t.recurrence === 'weekly' || t.recurrence === 'one-off' ? t.recurrence : 'daily',
        days: Array.isArray(t.days) ? t.days.map((d: any) => String(d).toLowerCase()) : [],
        icon: typeof t.icon === 'string' ? t.icon : undefined,
        period: ['morning', 'midday', 'evening'].includes(t.period) ? t.period : undefined,
      }));
  } catch {
    return null;
  }
}

export function stripPlanMarkers(content: string): string {
  return content.replace(OPTIONS_RE, '').replace(PLAN_RE, '').trim();
}