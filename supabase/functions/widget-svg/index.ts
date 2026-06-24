import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const sizeMap = {
  small: { width: 169, height: 169, fontSize: 14, titleSize: 12, radius: 22 },
  medium: { width: 345, height: 157, fontSize: 18, titleSize: 13, radius: 22 },
  large: { width: 345, height: 345, fontSize: 22, titleSize: 14, radius: 28 },
} as const

type WidgetSize = keyof typeof sizeMap

const escapeXml = (unsafe: string) =>
  unsafe.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!))

const renderWidget = (params: {
  size: WidgetSize
  theme: 'light' | 'dark'
  title: string
  message: string
  accent: string
  bloom?: string
  sublabel?: string
}) => {
  const { size, theme, title, message, accent, bloom, sublabel } = params
  const isDark = theme === 'dark'
  const bg = isDark ? '#0F172A' : '#FAFAFA'
  const bgEnd = isDark ? '#1E293B' : '#FFFFFF'
  const text = isDark ? '#F8FAFC' : '#1E293B'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const dims = sizeMap[size]

  const bloomPill = bloom
    ? `<rect x="${dims.width - 24}" y="24" width="${Math.max(44, bloom.length * 8 + 24)}" height="26" rx="13" fill="${accent}" opacity="0.15"/>
      <text x="${dims.width - 24 + Math.max(44, bloom.length * 8 + 24) / 2}" y="42" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="${accent}">Bloom ${bloom}</text>`
    : ''

  const sublabelText = sublabel
    ? `<text x="24" y="${dims.height - 22}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${muted}">${escapeXml(sublabel)}</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.width}" height="${dims.height}" viewBox="0 0 ${dims.width} ${dims.height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
  </defs>
  <rect width="${dims.width}" height="${dims.height}" rx="${dims.radius}" fill="url(#bg)"/>
  ${bloomPill}
  <circle cx="24" cy="34" r="8" fill="${accent}"/>
  <text x="38" y="38" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${dims.titleSize}" font-weight="600" fill="${text}">${escapeXml(title)}</text>
  <text x="24" y="${dims.height / 2 + 4}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${dims.fontSize}" font-weight="700" fill="${text}">${escapeXml(message)}</text>
  ${sublabelText}
</svg>`
}

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1) + '…' : s

const renderRoutineWidget = (
  tasks: { title: string; completed: boolean }[],
  streak: number,
) => {
  const width = 345
  const height = 157
  const visible = tasks.slice(0, 5)
  const overflow = tasks.length - visible.length

  const rows = visible
    .map((t, i) => {
      const y = 50 + i * 20
      const prefix = t.completed ? '✓' : '•'
      const color = t.completed ? '#c084a0' : '#2d1b2e'
      const weight = t.completed ? 600 : 400
      return `<text x="24" y="${y}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="${weight}" fill="${color}">${escapeXml(prefix + ' ' + truncate(t.title, 28))}</text>`
    })
    .join('\n  ')

  const overflowRow = overflow > 0
    ? `<text x="24" y="${50 + visible.length * 20}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#9c7a8b">+${overflow} more</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDF2F4"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="22" fill="url(#bg)"/>
  <circle cx="20" cy="24" r="6" fill="#e07a8a"/>
  <text x="32" y="28" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#9c7a8b">uBloom Routine</text>
  ${rows}
  ${overflowRow}
  <text x="${width - 16}" y="${height - 14}" text-anchor="end" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="#e07a8a">🔥 ${streak} day streak</text>
</svg>`
}

const todayUtcStr = () => {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const isScheduled = (habit: any, dow: number) => {
  if (!habit?.frequency || habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly')
    return Array.isArray(habit.weeklyDays) && habit.weeklyDays.includes(dow)
  if (habit.frequency === 'custom')
    return Array.isArray(habit.customDays) && habit.customDays.includes(dow)
  return false
}

const computeStreak = (coreHabits: any[], completions: any[]) => {
  if (!coreHabits?.length) return 0
  let streak = 0
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${day}`
    const dow = d.getUTCDay()
    const scheduled = coreHabits.filter((h) => isScheduled(h, dow))
    if (scheduled.length === 0) continue
    const scheduledIds = new Set(scheduled.map((h) => h.id))
    const done = completions.filter(
      (c) => c.date === dateStr && c.completed && scheduledIds.has(c.habitId),
    ).length
    const rate = done / scheduled.length
    if (rate >= 0.5) streak++
    else if (i > 0) break
  }
  return streak
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // Try authenticated routine widget first
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const headerToken = authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : ''
    const queryToken = url.searchParams.get('token') || ''
    const token = headerToken || queryToken

    if (token) {
      const supaUrl = Deno.env.get('SUPABASE_URL')!
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const authClient = createClient(supaUrl, serviceKey)
      const { data: userData, error: userErr } = await authClient.auth.getUser(token)
      if (!userErr && userData?.user) {
        const uid = userData.user.id
        const { data: row } = await authClient
          .from('user_data')
          .select('data')
          .eq('user_id', uid)
          .maybeSingle()
        const data = (row?.data as any) || {}
        const coreHabits: any[] = Array.isArray(data.coreHabits) ? data.coreHabits : []
        const completions: any[] = Array.isArray(data.habitCompletions) ? data.habitCompletions : []
        const todayStr = todayUtcStr()
        const dow = new Date().getUTCDay()
        const scheduled = coreHabits.filter((h) => isScheduled(h, dow))
        const tasks = scheduled.map((h) => ({
          title: String(h.title ?? h.name ?? 'Habit'),
          completed: completions.some(
            (c) => c.habitId === h.id && c.date === todayStr && c.completed === true,
          ),
        }))
        const streak = computeStreak(coreHabits, completions)
        const svg = renderRoutineWidget(tasks, streak)
        return new Response(svg, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
          status: 200,
        })
      }
    }
  } catch (_e) {
    // fall through to generic fallback
  }

  const size = (url.searchParams.get('size') as WidgetSize) ?? 'medium'
  const theme = url.searchParams.get('theme') === 'light' ? 'light' : 'dark'
  const title = url.searchParams.get('title') || 'uBloom'
  const message = url.searchParams.get('message') || 'Bloom today'
  const accent = url.searchParams.get('accent') || '#3B82F6'
  const bloom = url.searchParams.get('bloom') || ''
  const sublabel = url.searchParams.get('sublabel') || ''

  const validSize = sizeMap[size] ? size : 'medium'
  const svg = renderWidget({ size: validSize, theme, title, message, accent, bloom, sublabel })

  return new Response(svg, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
    status: 200,
  })
})
