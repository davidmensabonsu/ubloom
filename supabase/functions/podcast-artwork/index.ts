import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchTerms } = await req.json()

    if (!Array.isArray(searchTerms) || searchTerms.length === 0 || searchTerms.length > 20) {
      return new Response(
        JSON.stringify({ error: 'searchTerms must be an array of 1-20 strings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all podcast artworks in parallel
    const results: Record<string, string | null> = {}

    await Promise.all(
      searchTerms.map(async (term: string) => {
        try {
          const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&limit=1`
          const res = await fetch(url)
          const data = await res.json()

          if (data.results && data.results.length > 0) {
            // Get the highest quality artwork (600x600)
            const artwork = data.results[0].artworkUrl600 || data.results[0].artworkUrl100
            results[term] = artwork || null
          } else {
            results[term] = null
          }
        } catch {
          results[term] = null
        }
      })
    )

    return new Response(JSON.stringify({ artworks: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
