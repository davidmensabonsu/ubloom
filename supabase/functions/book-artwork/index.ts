const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { searchTerms } = await req.json();

    if (!Array.isArray(searchTerms) || searchTerms.length === 0 || searchTerms.length > 30) {
      return new Response(
        JSON.stringify({ error: 'searchTerms must be an array of 1-30 strings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, string | null> = {};

    await Promise.all(
      searchTerms.map(async (term: string) => {
        try {
          const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=1&fields=items(volumeInfo/imageLinks)`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.items && data.items.length > 0) {
            const imageLinks = data.items[0].volumeInfo?.imageLinks;
            const rawUrl = imageLinks?.extraLarge || imageLinks?.large || imageLinks?.medium || imageLinks?.small || imageLinks?.thumbnail;
            if (rawUrl) {
              // Upgrade to https, remove edge-curl param, and request high-res via zoom=3
              let hq = rawUrl.replace('http://', 'https://');
              hq = hq.replace(/&edge=curl/gi, '');
              hq = hq.replace(/zoom=\d/, 'zoom=3');
              if (!hq.includes('zoom=')) hq += '&zoom=3';
              results[term] = hq;
            } else {
              results[term] = null;
            }
          } else {
            results[term] = null;
          }
        } catch {
          results[term] = null;
        }
      })
    );

    return new Response(JSON.stringify({ artworks: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
