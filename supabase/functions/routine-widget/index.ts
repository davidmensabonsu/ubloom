import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const svgHeaders = {
  ...corsHeaders,
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'no-cache',
}

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string))

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

// Returns the wall-clock date string and day-of-week for `date` shifted by
// `tzOffsetMinutes` (minutes east of UTC, e.g. 60 for BST, 0 for GMT).
function getZonedParts(date: Date, tzOffsetMinutes: number): { dateStr: string; dow: number } {
  const local = new Date(date.getTime() + tzOffsetMinutes * 60000)
  const y = local.getUTCFullYear()
  const m = String(local.getUTCMonth() + 1).padStart(2, '0')
  const d = String(local.getUTCDate()).padStart(2, '0')
  return { dateStr: `${y}-${m}-${d}`, dow: local.getUTCDay() }
}

function isScheduledOn(habit: any, dow: number): boolean {
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly') return Array.isArray(habit.weeklyDays) && habit.weeklyDays.includes(dow)
  if (habit.frequency === 'custom') return Array.isArray(habit.customDays) && habit.customDays.includes(dow)
  return true
}

function calcStreak(habits: any[], completions: any[], tzOffsetMinutes: number): number {
  if (!habits.length) return 0
  let streak = 0
  const now = Date.now()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now - i * 86400000)
    const { dateStr, dow } = getZonedParts(d, tzOffsetMinutes)
    const scheduled = habits.filter((h) => isScheduledOn(h, dow))
    if (!scheduled.length) continue
    const doneIds = new Set(
      completions.filter((c: any) => c.date === dateStr && c.completed === true).map((c: any) => c.habitId),
    )
    const rate = scheduled.filter((h: any) => doneIds.has(h.id)).length / scheduled.length
    if (rate >= 0.5) { streak++ } else if (i > 0) { break }
  }
  return streak
}

function renderFallback(): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="345" height="157" viewBox="0 0 345 157"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDF2F4"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient></defs><rect width="345" height="157" rx="22" fill="url(#bg)"/><circle cx="24" cy="32" r="7" fill="#c084a0"/><text x="38" y="37" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="600" fill="#2d1b2e">uBloom Routine</text><text x="24" y="85" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="700" fill="#2d1b2e">Bloom today</text><text x="24" y="135" font-family="system-ui,-apple-system,sans-serif" font-size="11" fill="#9c7a8b">Open the app to see your routine</text></svg>'
}

function renderRoutine(tasks: { title: string; done: boolean }[], streak: number): string {
  const MAX = 5
  const shown = tasks.slice(0, MAX)
  const extra = tasks.length - MAX
  let rows = ''
  shown.forEach((t, i) => {
    const y = 52 + i * 20
    const prefix = t.done ? 'v' : '-'
    const color = t.done ? '#c084a0' : '#2d1b2e'
    const weight = t.done ? '600' : '400'
    rows += '<text x="24" y="' + y + '" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="' + weight + '" fill="' + color + '">' + escapeXml(prefix + ' ' + trunc(t.title, 28)) + '</text>'
  })
  if (extra > 0) {
    const y = 52 + MAX * 20
    rows += '<text x="24" y="' + y + '" font-family="system-ui,-apple-system,sans-serif" font-size="12" fill="#9c7a8b">+' + extra + ' more</text>'
  }
  const streakLabel = streak > 0 ? streak + ' day streak' : ''
  return '<svg xmlns="http://www.w3.org/2000/svg" width="345" height="157" viewBox="0 0 345 157"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDF2F4"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient></defs><rect width="345" height="157" rx="22" fill="url(#bg)"/><circle cx="24" cy="32" r="7" fill="#c084a0"/><text x="38" y="37" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="600" fill="#2d1b2e">uBloom Routine</text>' + rows + '<text x="329" y="145" text-anchor="end" font-family="system-ui,-apple-system,sans-serif" font-size="11" fill="#e07a8a">' + escapeXml(streakLabel) + '</text></svg>'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const rawOffset = parseInt(url.searchParams.get('tzOffset') ?? '', 10)
    const tzOffset = Number.isFinite(rawOffset) && Math.abs(rawOffset) <= 14 * 60 ? rawOffset : 0
    if (!token || token.length < 20 || token.length > 128) {
      return new Response(renderFallback(), { headers: svgHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: tokenRow, error: tokenErr } = await supabase
      .from('widget_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (tokenErr || !tokenRow) return new Response(renderFallback(), { headers: svgHeaders })
    if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return new Response(renderFallback(), { headers: svgHeaders })
    }

    // Best-effort last_used update; ignore failures.
    supabase.from('widget_tokens').update({ last_used_at: new Date().toISOString() }).eq('token', token).then(() => {})

    const { data: ud } = await supabase.from('user_data').select('data').eq('user_id', tokenRow.user_id).single()
    const data: any = ud?.data ?? {}
    const habits: any[] = data.coreHabits ?? []
    const completions: any[] = data.habitCompletions ?? []
    const { dateStr: todayStr, dow: todayDow } = getZonedParts(new Date(), tzOffset)
    const todayHabits = habits.filter((h) => isScheduledOn(h, todayDow))
    const doneIds = new Set(completions.filter((c: any) => c.date === todayStr && c.completed === true).map((c: any) => c.habitId))
    const tasks = todayHabits.map((h: any) => ({ title: h.title ?? 'Task', done: doneIds.has(h.id) }))
    const streak = calcStreak(habits, completions, tzOffset)
    const svg = tasks.length > 0 ? renderRoutine(tasks, streak) : renderFallback()
    return new Response(svg, { headers: svgHeaders })
  } catch (_e) {
    return new Response(renderFallback(), { headers: svgHeaders })
  }
})