import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";
import { parseJsonBody, clampString, clampArray } from "../_shared/payload.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireUser(req, corsHeaders);
  if ("response" in auth) return auth.response;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const parsed = await parseJsonBody<Record<string, unknown>>(req, corsHeaders, 50_000);
    if ("response" in parsed) return parsed.response;
    const b = parsed.data;
    const journalEntries = clampArray<{ content: string; mood?: string }>(b.journalEntries, 10)
      .map((e) => ({ content: clampString(e?.content, 2000), mood: typeof e?.mood === "string" ? e.mood : undefined }));
    const identityStatement = clampString(b.identityStatement, 1000);
    const dreamSelf = b.dreamSelf;
    const moodHistory = clampArray<{ moods: string[] }>(b.moodHistory, 30);
    const currentFeeling = clampString(b.currentFeeling, 500);
    const struggles = clampArray<string>(b.struggles, 20).map((s) => clampString(s, 200));
    const reactionStyle = clampString(b.reactionStyle, 500);
    const wantsMoreOf = clampArray<string>(b.wantsMoreOf, 20).map((s) => clampString(s, 200));
    const dreamSelfFeels = clampArray<string>(b.dreamSelfFeels, 20).map((s) => clampString(s, 200));
    const futureNote = clampString(b.futureNote, 2000);

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

    // Build onboarding context
    const onboardingParts: string[] = [];
    if (currentFeeling) onboardingParts.push(`She described her current life feeling as: "${currentFeeling}"`);
    if (struggles && struggles.length > 0) onboardingParts.push(`She struggles with: ${struggles.join(", ")}`);
    if (reactionStyle) onboardingParts.push(`When things don't go to plan, she tends to: ${reactionStyle}`);
    if (wantsMoreOf && wantsMoreOf.length > 0) onboardingParts.push(`She wants more of: ${wantsMoreOf.join(", ")}`);
    if (dreamSelfFeels && dreamSelfFeels.length > 0) onboardingParts.push(`Her dream self feels: ${dreamSelfFeels.join(", ")}`);
    if (futureNote) onboardingParts.push(`A note she wrote to her future self: "${futureNote}"`);
    const onboardingContext = onboardingParts.join("\n");

    const systemPrompt = `You are the user's inner voice — the version of herself who's a little further along and looking back with honesty and warmth. You sound like a real person talking to her, not a motivational poster.

You will generate TWO messages:

1. **WEEKLY FUTURE SELF MESSAGE**: 2-3 sentences that sound like something a close friend or future self would say to her — honest, casual, grounded. Use what you know about her struggles, emotional patterns, and what she wants for herself to make the message feel deeply personal. If journal themes are provided, let them subtly inform the emotional direction WITHOUT quoting or summarizing entries. Use contractions, incomplete thoughts, real talk. Think "note a friend would text her at 2am" not "inspirational quote."

2. **DAILY MINDSET MESSAGE**: A single short sentence — today's anchor. Should sound like an honest reminder tailored to what she's going through and what she needs to hear, not a generic affirmation.

3. **FOCUS TODAY**: A direct, specific INSTRUCTION — tell her exactly what to do today. This is NOT a suggestion or something to "think about." It's a clear action step she can complete. Start with a verb. Be specific about what, when, and how. Examples: "Open your notes app right now and write down 3 things you want this week — not someday, THIS week.", "Before lunch, send that message you've been drafting in your head. Just send it.", "Tonight before bed, lay out your clothes for tomorrow and set your alarm 15 minutes earlier. You're building momentum." The action should directly move her closer to her dream self based on what she's struggling with. If she wants more confidence, give her a confidence-building action. If she's overwhelmed, give her one thing to simplify. Always be specific — never say "do something nice for yourself" when you could say "take a 10-minute walk without your phone after dinner tonight."

Rules:
- Sound like a real person, not a life coach or poet
- Use casual, honest language — contractions, pauses (dashes, ellipses), real talk
- Never use generic phrases like "You've got this!" or "Keep going!" or "You are worthy"
- Avoid flowery metaphors, affirmation-speak, or anything that sounds like a poster quote
- Never quote or directly reference journal entries
- Speak in second person ("you") — this is her future self talking to her
- The messages MUST feel tailored to this specific person — reference her emotional patterns, struggles, or aspirations indirectly
- If she struggles with overthinking, speak to that. If she wants confidence, speak to that. Make it personal.
- Output ONLY valid JSON with keys "futureSelfMessage", "mindsetMessage", and "focusToday"`;

    const userPrompt = `Here is context about the user:

${onboardingContext ? `Personal Profile:\n${onboardingContext}` : ""}

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
        futureSelfMessage: "Okay, you don't need to have everything figured out right now. You're getting there.",
        mindsetMessage: "You're not behind. You're on your own timeline.",
        focusToday: "Do one small thing today that your future self would thank you for.",
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
