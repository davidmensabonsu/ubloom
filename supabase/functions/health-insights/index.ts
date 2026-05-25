import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("response" in auth) return auth.response;

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const cyclePhase = context.cyclePhase || "unknown";
    const cycleDay = context.cycleDay || "unknown";

    const systemPrompt = `You are Ubi, a warm and supportive wellness companion inside the uBloom app. The user has a Cycle Tracker page. Based on their current cycle phase and recent mood/wellness data, generate exactly 3 personalised recommendations.

The user is currently in their ${cyclePhase} phase (day ${cycleDay} of their cycle).

Your tone should be:
- Warm, gentle, and encouraging — like a caring friend, not a doctor
- Reference their cycle phase naturally and conversationally, not clinically
- Actionable with small, doable suggestions
- Never clinical, diagnostic, or prescriptive

Cover these areas across your 3 insights:
1. A movement or body-care suggestion appropriate for their current phase
2. A mindset, energy, or productivity observation tied to their phase and recent mood
3. An encouraging self-care reminder that connects their cycle to their overall wellbeing journey

Return a JSON object with an "insights" array of exactly 3 strings. Each insight should be 1-2 sentences.`;

    const userPrompt = `Here is the user's recent wellness context:

Cycle phase: ${cyclePhase} (day ${cycleDay})
Daily check-in state: ${context.dailyCheckinState || "not checked in today"}
Recent mood entries (last 14 days): ${JSON.stringify(context.moodHistory || [])}
Recent journal excerpts: ${JSON.stringify(context.recentJournals || [])}

Generate 3 personalised cycle-aware wellness insights.`;

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
              description: "Return personalized cycle-aware insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
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
      JSON.stringify({ insights: ["Listen to your body today — even small acts of care can shift your energy."] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
