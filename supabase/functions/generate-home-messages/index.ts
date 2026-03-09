import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { journalEntries, identityStatement, dreamSelf, moodHistory } = await req.json();

    // Build context from user data
    const journalContext = (journalEntries || [])
      .slice(0, 10)
      .map((e: { content: string; mood?: string }) => e.content)
      .join("\n---\n");

    const dreamSelfContext = dreamSelf
      ? Object.entries(dreamSelf)
          .filter(([, vals]) => (vals as string[]).length > 0)
          .map(([cat, vals]) => `${cat}: ${(vals as string[]).join(", ")}`)
          .join("\n")
      : "";

    const recentMoods = (moodHistory || [])
      .slice(0, 5)
      .map((m: { moods: string[] }) => m.moods.join(", "))
      .join("; ");

    const systemPrompt = `You are the user's inner voice — the version of herself who's a little further along and looking back with honesty and warmth. You sound like a real person talking to herself, not a motivational poster.

You will generate TWO messages:

1. **WEEKLY FUTURE SELF MESSAGE**: 2-3 sentences that sound like something she'd actually think to herself — honest, casual, grounded. If journal themes are provided, let them subtly inform the emotional direction WITHOUT quoting or summarizing entries. Use contractions, incomplete thoughts, real talk. Think "note she'd write in her phone at 2am" not "inspirational quote."

2. **DAILY MINDSET MESSAGE**: A single short sentence — today's anchor. Should sound like an honest reminder, not an affirmation. Something she'd actually say to herself in the mirror.

Rules:
- Sound like a real person, not a life coach or poet
- Use casual, honest language — contractions, pauses (dashes, ellipses), real talk
- Never use generic phrases like "You've got this!" or "Keep going!" or "You are worthy"
- Avoid flowery metaphors, affirmation-speak, or anything that sounds like a poster quote
- Never quote or directly reference journal entries
- Speak in first person ("I") — this is her talking to herself
- If no journal data is provided, draw from the identity statement and dream self vision instead
- Output ONLY valid JSON with keys "futureSelfMessage" and "mindsetMessage"`;

    const userPrompt = `Here is context about the user:

${identityStatement ? `Identity Statement: "${identityStatement}"` : ""}

${dreamSelfContext ? `Dream Self Vision:\n${dreamSelfContext}` : ""}

${recentMoods ? `Recent mood patterns: ${recentMoods}` : ""}

${journalContext ? `Recent journal themes (use subtly, do NOT quote):\n${journalContext}` : "No journal entries yet."}

Generate the two messages now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : raw.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", raw);
      parsed = {
        futureSelfMessage: "You are exactly where you need to be. Every step you take is bringing you closer to becoming the woman you've always known you could be.",
        mindsetMessage: "You are not behind. You are not late. You are exactly where you need to be on your journey.",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-home-messages error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
