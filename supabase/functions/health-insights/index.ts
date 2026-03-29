import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are Ubi, a warm and supportive wellness companion inside the uBloom app. The user has a Health page showing their mood patterns, energy, and wellbeing data. Based on the context provided, generate exactly 4 personalized wellness insights.

Your tone should be:
- Warm, gentle, and encouraging — like a caring friend, not a doctor
- Personal and specific to their patterns, not generic
- Actionable with small, doable suggestions
- Never clinical, diagnostic, or prescriptive

Cover these areas across your 4 insights:
1. Energy-based guidance (based on their recent moods and check-in state)
2. Behavioral patterns you notice (from journal entries and mood trends)
3. A gentle daily adjustment suggestion
4. An encouraging observation about their self-awareness

Return a JSON object with an "insights" array of exactly 4 strings. Each insight should be 1-2 sentences.`;

    const userPrompt = `Here is the user's recent wellness context:

Daily check-in state: ${context.dailyCheckinState || "not checked in today"}

Health data logged: ${JSON.stringify(context.healthData || {})}

Recent mood entries (last 14 days): ${JSON.stringify(context.moodHistory || [])}

Recent journal excerpts: ${JSON.stringify(context.recentJournals || [])}

Generate 4 personalized wellness insights based on this data.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return personalized health insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 4,
                    maxItems: 4,
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = JSON.parse(toolCall?.function?.arguments || "{}");

    return new Response(JSON.stringify({ insights: parsed.insights || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("health-insights error:", e);
    return new Response(
      JSON.stringify({ insights: ["Take a moment to breathe deeply and check in with how your body feels right now."] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
