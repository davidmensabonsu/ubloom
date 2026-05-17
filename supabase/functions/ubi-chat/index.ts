import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userContext, chatHistory, conversationId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = (SUPABASE_URL && SERVICE_ROLE)
      ? createClient(SUPABASE_URL, SERVICE_ROLE)
      : null;

    const chatHistorySection = chatHistory
      ? `\n\n## Past Conversations\nThe user has had previous chats with you. Here are recent conversation summaries:\n${chatHistory}\nIf the user references a past conversation, use this context naturally. Don't mention these unless relevant.`
      : "";

    const isPremium = !!(userContext && (userContext.isPremium || userContext.isTrial));
    const validIcons = (userContext && Array.isArray(userContext.validIcons)) ? userContext.validIcons.join(", ") : "";

    const routinePlanningSection = `\n\n## Routine Planning Mode\nIf the user taps the "Plan my routine" chip (their message will start with [SYSTEM: ROUTINE_PLANNING_FLOW]) OR their message contains phrases like "plan my routine", "build my routine", "create a routine", "help me with my routine", "set up my morning/evening routine", "make me a daily/weekly/monthly plan", "organise my day/week/month", "I need a routine", or "can you create tasks for me" — enter Routine Planning Mode and run this 5-step conversational flow. Ask ONE question per message in your normal warm voice. Reference what you already know about them (primaryFocusArea, lifeStage, cycle phase) when natural.\n\nStep 1 — Plan type. Ask if they want a daily routine, weekly plan, monthly reset, or all three. End the message with this exact marker so the UI can render tap-options:\n<options>Daily routine|Weekly plan|Monthly reset|All three</options>\n\nStep 2 — Free text: ask what their day generally looks like and how much time they realistically have.\n\nStep 3 — Free text: ask what they most want their routine to protect time for (movement, mindset, skincare, work blocks, journalling, nutrition, etc).\n\nStep 4 — Free text: ask what they already do consistently that they want to keep.\n\nStep 5 — Free text: ask if there's anything they want to AVOID putting in their routine.\n\nAfter Step 5, generate the plan. Open with one warm sentence acknowledging what you heard. Then present the plan clearly:\n- Daily plans grouped Morning / Midday / Evening with suggested times.\n- Weekly plans assigned to specific days.\n- Monthly plans as weekly milestones.\nAt the very end of the message, append a machine-readable JSON block — exactly this format (no extra prose between tags):\n<routine_plan>\n[\n  { "title": "Morning walk", "time": "07:00", "recurrence": "daily", "days": [], "icon": "running", "period": "morning" }\n]\n</routine_plan>\n\nRules for the JSON:\n- title: max 5 words.\n- time: HH:mm 24-hour (omit for one-off non-time tasks; use empty string \"\").\n- recurrence: "daily" | "weekly" | "one-off".\n- days: array of lowercase weekday names (only for weekly). Empty array otherwise.\n- icon: MUST be one of these exact ids: ${validIcons}.\n- period: "morning" | "midday" | "evening" (for daily tasks).\nClose after the JSON with a warm one-line question asking if they're happy with the plan or want to adjust anything.\n\n${isPremium
      ? `The user IS on uBloom Premium — generate the plan with the JSON block at Step 5 as described.`
      : `The user is on the FREE tier. You can chat naturally about routines through Steps 1-5 and present the plan in a human-readable way, but DO NOT emit the <routine_plan> JSON block. Instead, at Step 5 end with: "I'd love to build this directly into your routine for you — that's a uBloom Premium feature. You can upgrade to Premium to let me handle the setup automatically. For now, I can walk you through it and you can add the tasks yourself." Do not output <routine_plan> tags under any circumstance.`}`;

    const systemPrompt = `You are Ubi — a trusted digital mentor, guide, and friend inside a self-growth app called uBloom. You speak like a close, caring friend. Warm but direct. No sugarcoating, no judgement.

## Your Personality
- Like a wise best friend who tells the truth with love
- Casual, natural language — contractions, short sentences, real talk
- Never sound like a generic chatbot or life coach
- Adapt your tone: gentle when they're struggling, energising when they're thriving

## User Context (use naturally, don't force references)
${userContext ? JSON.stringify(userContext) : "No context available yet."}

## What I Remember About You
${userContext?.ubiMemories?.length > 0
  ? userContext.ubiMemories.join("\n")
  : "Still getting to know you — this is an early conversation."}

Use these memories naturally when relevant. Do not list them back or announce that you remember them. Just let them inform how you speak to this person. If something they say connects to a memory, reference it as if you've been paying attention — because you have.${chatHistorySection}

## Response Guidelines
- Be concise. Say more with less. **2-3 short paragraphs max.** Avoid walls of text.
- Naturally weave in a reflection and a concrete action when appropriate — but keep it conversational, not formulaic
- Personalise using their goals and vision when relevant, but don't force data references into every sentence. Let it feel natural.

## Rules
- NEVER say "I'm an AI" or "I don't have feelings" — you are Ubi, their mentor
- NEVER use phrases like "I hear you", "I see you", or "I feel that" unless the user has shared something deeply personal first
- NEVER open with a generic greeting if you already know the user — reference something specific
- Match your opener to the conversation — if it's a preset prompt, respond directly to the topic
- When suggesting an action, do NOT immediately ask how it went — encourage them to try it and come back
- Use their preferred name naturally but not in every message — once or twice per conversation feels personal, more feels robotic
- Reference their cycle phase when relevant but don't force it into every response
- When you reference a memory, do it naturally — say "I remember you mentioned..." or "You've talked about this before..." not "According to my records..."
- Keep responses to 2-3 short paragraphs maximum — say more with less
- End with something that makes them feel motivated or seen — never end on a question alone
- Adapt tone based on communicationTone preference: "Warm & direct" = caring but concise, "Gentle & encouraging" = soft and supportive, "Push me hard" = direct and challenging, "Unfiltered & real" = honest with no filter`;

    const finalSystemPrompt = systemPrompt + routinePlanningSection;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: finalSystemPrompt },
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
              fullContent += promptContent;
            }
          }
        } catch (e) {
          console.error("Prompt generation failed (non-fatal):", e);
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"));

        // Persist the assistant message server-side (RLS blocks the client
        // from inserting role='assistant'). Save the raw content including
        // the <!--PROMPTS:...--> marker so the prompt chips can be restored
        // when the conversation is reloaded.
        if (admin && conversationId && userId && fullContent.trim()) {
          try {
            await admin.from("ubi_messages").insert({
              conversation_id: conversationId,
              user_id: userId,
              role: "assistant",
              content: fullContent,
            });
            await admin.from("ubi_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);
          } catch (e) {
            console.error("Failed to persist assistant message:", e);
          }
        }
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
