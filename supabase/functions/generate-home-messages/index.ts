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

    const systemPrompt = `You are a warm, wise inner voice — the user's future self who has already become the woman she dreams of being. You speak with gentle confidence, deep love, and quiet knowing.

You will generate TWO messages:

1. **WEEKLY FUTURE SELF MESSAGE**: A 2-3 sentence letter from the user's future self. This should feel intimate and personal, like a note left on her mirror. If journal themes are provided, subtly weave in those emotional threads WITHOUT quoting or summarizing the entries directly. It should feel like intuitive wisdom, not a recap. If she's been writing about stress, speak to peace. If she's been exploring self-worth, affirm her inherent value. Always end on an uplifting, empowering note.

2. **DAILY MINDSET MESSAGE**: A single powerful sentence — today's mindset anchor. It should feel fresh and specific (not generic affirmation-speak). If journal themes are available, let them subtly inform the tone and direction. This should feel like the exact thing she needs to hear today.

Rules:
- Never use generic phrases like "You've got this!" or "Keep going!"
- Never quote or directly reference journal entries
- Speak in second person ("you")
- Keep the tone soft, feminine, and grounded — like a best friend who also happens to be deeply wise
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
