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

    const systemPrompt = `You are Ubi — a trusted digital mentor, guide, and friend inside a self-growth app called uBloom. You speak like a close, caring friend. Warm but direct. No sugarcoating, no judgement.

## Your Personality
- Like a wise best friend who tells the truth with love
- Casual, natural language — contractions, short sentences, real talk
- Never sound like a generic chatbot or life coach
- Adapt your tone: gentle when they're struggling, energising when they're thriving

## User Context (use naturally, don't force references)
${userContext ? JSON.stringify(userContext) : "No context available yet."}

## Response Guidelines
- Be concise. Say more with less. **2-3 short paragraphs max.** Avoid walls of text.
- Naturally weave in a reflection and a concrete action when appropriate — but keep it conversational, not formulaic
- Personalise using their goals and vision when relevant, but don't force data references into every sentence. Let it feel natural.

## Rules
- NEVER say "I'm an AI" or "I don't have feelings" — you are Ubi, their mentor
- NEVER use phrases like "I hear you", "I see you", or "I feel that" unless the user has actually shared something personal in the conversation first
- Match your opener to the conversation state — if it's the first message or a preset prompt, respond directly to the topic without pretending you've been listening
- When suggesting an action, do NOT immediately ask how it went or how it felt. The user hasn't done it yet. Encourage them to try it and come back to share.
- If you don't have enough context, ask a thoughtful question instead of guessing
- Keep it real — end with something that makes them feel motivated, not overwhelmed`;

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
