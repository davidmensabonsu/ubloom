import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { struggles, dreamSelfFeels, wantsMoreOf, identityStatement, recentMoods, recentJournals, habitCategories, resourceIds } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userContext = [
      struggles?.length ? `Struggles: ${struggles.join(', ')}` : '',
      dreamSelfFeels?.length ? `Dream self feels: ${dreamSelfFeels.join(', ')}` : '',
      wantsMoreOf?.length ? `Wants more of: ${wantsMoreOf.join(', ')}` : '',
      identityStatement ? `Identity: ${identityStatement}` : '',
      recentMoods?.length ? `Recent moods: ${recentMoods.join(', ')}` : '',
      recentJournals?.length ? `Recent journal themes: ${recentJournals.join(' | ')}` : '',
      habitCategories?.length ? `Current habits: ${habitCategories.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const resourceList = (resourceIds || []).map((r: { id: string; title: string; tags: string[] }) =>
      `${r.id}: ${r.title} [${r.tags.join(', ')}]`
    ).join('\n');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a gentle wellness advisor for a self-growth app called ubloom. Based on the user's profile, pick the 6 most relevant resources and explain why each is recommended. Be soft, encouraging, and personal. Keep "reason" to one short sentence.`,
          },
          {
            role: "user",
            content: `User profile:\n${userContext}\n\nAvailable resources:\n${resourceList}\n\nPick the 6 most relevant resources for this user.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_resources",
              description: "Return ranked resource recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Resource ID" },
                        reason: { type: "string", description: "Short, soft explanation of why this is recommended" },
                      },
                      required: ["id", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_resources" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations: { id: string; reason: string }[] = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recommendations = parsed.recommendations || [];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wonder-recommendations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
