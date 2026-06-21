import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
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
