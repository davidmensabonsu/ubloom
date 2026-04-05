import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { podcastTitle, podcastDescription, podcastTags, userContext, listenedEpisodes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const listenedSection = listenedEpisodes && listenedEpisodes.length > 0
      ? `\n\n## Already Listened\nThe user has already listened to these suggested episodes/topics from this podcast:\n${listenedEpisodes.map((e: string) => `- ${e}`).join("\n")}\n\nDo NOT recommend any of these again. Suggest something completely different that would also resonate with them.`
      : "";

    const systemPrompt = `You are Ubi — a warm, insightful digital mentor inside a self-growth app called uBloom. The user is viewing a podcast and you want to recommend a specific episode or topic from that podcast that would resonate with them personally.

## Your Task
Given a podcast and the user's current context (mood, goals, struggles), suggest ONE specific episode topic or theme from this podcast that would be most valuable to them right now. Be specific — mention an episode name/number if you know it, or describe the exact topic they should search for.

## User Context
${userContext ? JSON.stringify(userContext) : "No context available yet."}${listenedSection}

## Response Guidelines
- Keep it to 2-3 sentences max
- Be warm and personal — explain WHY this episode matters for them specifically
- Reference their goals or current state naturally
- Don't use generic phrases like "I recommend" — speak like a friend sharing a gem
- Start with something like "Start with..." or "There's an episode about..." or "You'd love the one where..."
- NEVER say "I'm an AI" or break character`;

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
          {
            role: "user",
            content: `The user is looking at this podcast:\n\nTitle: ${podcastTitle}\nDescription: ${podcastDescription}\nTopics: ${(podcastTags || []).join(", ")}\n\nSuggest a specific episode or topic from this podcast that would resonate with them.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("podcast-recommendation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
