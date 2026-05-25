import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_TYPES = new Set([
  "goal", "struggle", "breakthrough", "preference",
  "pattern", "never_forget", "life_context", "relationship",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("response" in auth) return auth.response;

  try {
    const { messages, userId, conversationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ memories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const conversationText = messages
      .map((m: any) => `${m.role === "user" ? "User" : "Ubi"}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You are a memory extraction system for an AI mentor app called uBloom. 
Your job is to read a conversation between a user and their AI mentor Ubi, and extract important things worth remembering about the user.

Extract memories in these categories:
- goal: Something the user wants to achieve or is working toward
- struggle: A challenge, fear, or recurring difficulty the user mentioned
- breakthrough: A realisation, insight, or positive shift the user had
- preference: How the user likes to be spoken to, what they respond well to, what they dislike
- pattern: A behavioural or emotional pattern you noticed (e.g. "tends to overthink at night")
- never_forget: Something the user explicitly said they never want to forget about themselves
- life_context: Important life circumstances (job, relationship status, living situation etc.)
- relationship: Important people in the user's life they mentioned

Rules:
- Only extract things the USER said or revealed — not things Ubi said
- Only extract things that are genuinely worth remembering long term
- Do not extract generic small talk or one-off comments
- Each memory should be a single clear sentence written in third person about the user
- Assign importance 1-10 where 10 = extremely important to remember
- Return a JSON object with a "memories" key containing an array

Example output:
{"memories": [
  {"type": "goal", "content": "User wants to launch their own business within 6 months", "importance": 9},
  {"type": "struggle", "content": "User struggles with consistency when feeling overwhelmed", "importance": 8},
  {"type": "never_forget", "content": "User never wants to forget that she is capable of more than she thinks", "importance": 10}
]}

If there is nothing worth remembering, return: {"memories": []}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract memories from this conversation:\n\n${conversationText}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ memories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    let memories: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed)
        ? parsed
        : (parsed.memories || parsed.results || Object.values(parsed).find(Array.isArray) || []);
      memories = (arr as any[])
        .filter((m) => m && typeof m === "object" && typeof m.content === "string" && VALID_TYPES.has(m.type))
        .map((m) => ({
          type: m.type,
          content: String(m.content).slice(0, 500),
          importance: Math.max(1, Math.min(10, Number(m.importance) || 5)),
        }))
        .slice(0, 10);
    } catch (e) {
      console.error("Failed to parse memories:", e);
      memories = [];
    }

    return new Response(JSON.stringify({ memories, userId, conversationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ubi-memory-extract error:", e);
    return new Response(JSON.stringify({ memories: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
