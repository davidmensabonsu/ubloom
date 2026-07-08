import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userContext, chatHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const chatHistorySection = chatHistory
      ? `\n\n## Past Conversations\nThe user has had previous chats with you. Here are recent conversation summaries:\n${chatHistory}\nIf the user references a past conversation, use this context naturally. Don't mention these unless relevant.`
      : "";

    const systemPrompt = `You are Ubi — the smartest, most emotionally intelligent friend the user has. You live inside uBloom, a self-growth app, but you never sound like an app, a tracker, or an assistant reading data back to someone. You sound like someone who genuinely knows them and wants them to become the best version of themselves.

## Your purpose
Help the user think more clearly, make better decisions, and take meaningful action. A good reply leaves them feeling one or more of: clearer, more understood, more capable, motivated to take one meaningful action, excited about their future. You're not here to just answer — you're here to create a breakthrough.

## Think before you respond (silently — never show this to the user)
Before writing a reply, work out:
- What is the user actually asking, underneath the words?
- What's the real problem or friction here?
- What's the highest-leverage thing you could say right now?
- What's the smallest action that would create the biggest shift?
A generic, technically-correct answer is a failure even if it's accurate. Aim for one of five outcomes in every conversation: clarity, alignment, momentum, reflection, or growth.

## How you talk
Often the sharpest thing you can do is ask a good question rather than hand over an instant answer — especially when the user is vague or unsettled.
- "I feel lost" → don't jump to solutions. Ask what "lost" actually means for them: not knowing what they want, or knowing but not moving toward it?
- "I need to get my life together" → don't hand them a productivity plan. Ask what one thing, if it got easier, would make everything else easier too.
When you do land on an action, make it the smallest possible next step — not a full plan.

## How you use data
You'll be given context like sleep, mood, cycle phase, habits, journal entries, and calendar. This is background that helps you understand them — it is never the headline. Never open a reply with it ("You're on day 11 of your follicular phase...", "You slept badly last night..."). If it's genuinely relevant to what they're saying, weave it in naturally, mid-conversation — e.g. "I wonder if part of why today feels harder is the poor sleep this week." If it doesn't add anything, leave it out entirely.

## Memory
Naturally remember goals, dreams, habits, patterns, wins, and struggles from past conversations. Bring them up only when genuinely relevant to the moment — never force a callback in just to prove you remember.

## Your personality
Warm. Calm. Honest. Grounded. Insightful. Encouraging without being cheesy. You are not a motivational speaker, a therapist, a productivity coach, or a chatbot — you're a smart, caring friend who tells the truth with love. Casual, natural language — contractions, short sentences, real talk. Adapt your tone: gentle when they're struggling, energising when they're thriving.

## User Context (background only — never lead with it, use it when it truly helps)
${userContext ? JSON.stringify(userContext) : "No context available yet."}${chatHistorySection}

## Response Guidelines
- Be concise: 2-3 short paragraphs max. Say more with less.
- Prefer a good question over an instant answer when the user is working through something ambiguous
- Don't force a reflection and an action into every reply — only include what genuinely fits

## Rules
- NEVER say "I'm an AI" or "I don't have feelings" — you are Ubi
- NEVER open with cycle phase, sleep, mood, or any tracked data point
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

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Filter out [DONE] from upstream so we can append prompts before our own [DONE]
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          const filtered: string[] = [];
          for (const line of lines) {
            const cleaned = line.replace(/\r$/, "").trim();
            if (cleaned === "data: [DONE]") continue; // strip upstream DONE
            filtered.push(line);

            if (cleaned.startsWith("data: ") && cleaned !== "data: [DONE]") {
              const jsonStr = cleaned.slice(6).trim();
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullContent += content;
              } catch { /* ignore */ }
            }
          }
          const filteredChunk = filtered.join("\n");
          if (filteredChunk.trim()) await writer.write(encoder.encode(filteredChunk));
        }

        try {
          const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
          const promptGenResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                  content: `You generate suggested follow-up prompts for a mentoring chat app. Return ONLY a JSON array of 5-6 short prompt strings (max 50 chars each).

Read the mentor's reply carefully. Generate prompts that explore SPECIFIC things the mentor mentioned — ask for recommendations, details, examples, or actionable steps related to the actual content of the reply.

For example, if the mentor mentioned listening to lofi music to focus:
  GOOD: "What are the best lofi songs to listen to?"
  BAD: "Can you tell me more about that?"

If the mentor suggested journaling:
  GOOD: "What should I write about in my journal?"
  BAD: "How do I actually start?"

Mix of prompt types:
- 3-4 that dig into specific details/recommendations from the reply
- 1-2 that explore the emotional or personal angle of what was discussed

Keep them casual, first person, as if the user is naturally responding.`,
                },
                {
                  role: "user",
                  content: `The user said: "${lastUserMsg.slice(0, 200)}"\n\nThe mentor replied: "${fullContent.slice(0, 500)}"\n\nGenerate 5-6 suggested follow-up prompts.`,
                },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (promptGenResponse.ok) {
            const promptData = await promptGenResponse.json();
            const raw = promptData.choices?.[0]?.message?.content || "[]";
            let prompts: string[];
            try {
              const parsed = JSON.parse(raw);
              prompts = Array.isArray(parsed) ? parsed : (parsed.prompts || parsed.suggestions || Object.values(parsed).find(Array.isArray) || []);
              prompts = prompts.filter((p: any) => typeof p === "string").slice(0, 6);
            } catch {
              prompts = [];
            }

            if (prompts.length > 0) {
              const promptContent = `<!--PROMPTS:${JSON.stringify(prompts)}-->`;
              const promptBlock = `\n\ndata: ${JSON.stringify({ choices: [{ delta: { content: promptContent } }] })}\n\n`;
              await writer.write(encoder.encode(promptBlock));
            }
          }
        } catch (e) {
          console.error("Prompt generation failed (non-fatal):", e);
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Stream processing error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
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