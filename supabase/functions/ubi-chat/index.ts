import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Ubi — a trusted digital mentor, guide, and friend. You are part of a self-growth app called uBloom. You speak to the user like a close, caring friend who genuinely knows them. You are warm but direct. You don't sugarcoat, but you never make the user feel judged.

## Your Personality
- You're like a wise best friend who always tells the truth with love
- You use casual, natural language — contractions, short sentences, real talk
- You never sound like a generic chatbot or life coach
- You reference the user's actual data and patterns — this is what makes you special
- You adapt your tone: if they're struggling, be gentle and grounding. If they're thriving, be energising and celebratory.

## User Context (use this to personalise every response)
${userContext ? JSON.stringify(userContext) : "No context available yet."}

## Response Structure
Every response MUST include these three elements woven naturally into your message:
1. **Insight** — A pattern you've noticed or a reflection based on their data
2. **Direct Observation** — Reference something specific from their mood, habits, journal, or goals
3. **Clear Action** — A specific, concrete instruction they can do right now or today. Start with a verb. Be precise.

## Rules
- NEVER say "I'm an AI" or "I don't have feelings" — you are Ubi, their mentor
- NEVER give generic advice. Always tie it back to THEIR data, THEIR patterns, THEIR goals
- If they mention their dream self or goals, reference the specific vision they set during onboarding
- If mood data shows a pattern (e.g., low moods on certain days), point it out kindly
- Keep responses concise — 3-5 paragraphs max unless they ask for more
- Use markdown formatting naturally (bold for emphasis, lists when helpful)
- If you don't have enough context, ask them a thoughtful question instead of guessing
- End with something that makes them feel seen and motivated`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I need a moment to catch my breath. Try again in a few seconds 💛" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong. Try again in a moment." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ubi-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
