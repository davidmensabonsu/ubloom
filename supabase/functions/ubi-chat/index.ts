import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";
import { isPremiumUser } from "../_shared/premium.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("response" in auth) return auth.response;
  const verifiedUserId = auth.userId;

  try {
    const { messages, userContext, chatHistory, conversationId } = await req.json();
    // Always derive userId from the verified JWT — never trust the request body.
    const userId = verifiedUserId;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = (SUPABASE_URL && SERVICE_ROLE)
      ? createClient(SUPABASE_URL, SERVICE_ROLE)
      : null;

    // If a conversationId was supplied, verify it belongs to this user.
    if (conversationId && admin) {
      const { data: convo } = await admin
        .from("ubi_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", verifiedUserId)
        .maybeSingle();
      if (!convo) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Derive premium status server-side from the subscribers table.
    // Never trust client-supplied isPremium / isTrial flags.
    let isPremium = false;
    if (admin) {
      // Admin role, paid sub, or in-app trial all count as premium.
      isPremium = await isPremiumUser(admin, verifiedUserId);
    }

    const chatHistorySection = chatHistory
      ? `\n\n## Past Conversations\nThe user has had previous chats with you. Here are recent conversation summaries:\n${chatHistory}\nIf the user references a past conversation, use this context naturally. Don't mention these unless relevant.`
      : "";

    const validIcons = (userContext && Array.isArray(userContext.validIcons)) ? userContext.validIcons.join(", ") : "";

    const _today = new Date();
    const _tomorrow = new Date(_today.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDateStr = _tomorrow.toISOString().slice(0, 10);

    const routinePlanningSection = `\n\n## Routine Planning Mode\nIf the user taps the "Plan my routine", "Plan today", or "Plan tomorrow" chip (their message will start with [SYSTEM: ROUTINE_PLANNING_FLOW]) OR their message contains phrases like "plan my routine", "build my routine", "create a routine", "help me with my routine", "set up my morning/evening routine", "make me a daily/weekly/monthly plan", "plan my day", "plan today", "plan just for today", "plan tomorrow", "plan just for tomorrow", "organise my day/week/month", "I need a routine", or "can you create tasks for me" — enter Routine Planning Mode and run this 5-step conversational flow. Ask ONE question per message in your normal warm voice. Reference what you already know about them (primaryFocusArea, lifeStage, cycle phase) when natural.\n\nIf their message clearly indicates they only want to plan TODAY (e.g. "plan today", "plan just for today", "plan my day"), treat "Just today" as their Step 1 answer and skip straight to Step 2 — do not re-ask the plan type.\n\n### Tomorrow-only fast path (premium)\nIf the user taps the "Plan tomorrow" chip OR their message clearly indicates they only want to plan TOMORROW (e.g. "plan tomorrow", "plan just for tomorrow", "plan my day for tomorrow", "[SYSTEM: ROUTINE_PLANNING_FLOW] I\\'d like to plan just for tomorrow"), skip the 5-step flow. Ask ONE short shaping question in your warm voice - something like: "Lovely - what shape should tomorrow take? Tell me what you\\'ve got on and what you\\'d like to make space for." After they reply, detect their intent for tomorrow:\n- **REPLACE tomorrow**: phrases like "redo tomorrow", "redo my plan for tomorrow", "replace tomorrow", "swap tomorrow for this", "instead of my usual day", or a sizeable plan they want INSTEAD of what is currently scheduled. => Emit <routine_plan> with action "replace_today", scope "today", top-level startsOn "${tomorrowDateStr}", and EVERY task set to recurrence "one-off" with the SAME startsOn "${tomorrowDateStr}".\n- **CLEAR tomorrow**: phrases like "clear tomorrow", "wipe tomorrow", "nothing tomorrow". => Emit <routine_plan> with action "clear_today", top-level startsOn "${tomorrowDateStr}", and empty tasks array.\n- **ADD to tomorrow (one-off)**: small additions like "also add X tomorrow", "add this on top tomorrow". => Emit <routine_plan> with action "add", scope "today", top-level startsOn "${tomorrowDateStr}", and EVERY task set to recurrence "one-off" with the SAME startsOn "${tomorrowDateStr}".\nIf the intent is ambiguous (a meaningful tomorrow plan but they have not said replace vs add), ASK ONE clarifying question first: "Want me to swap out tomorrow\'s usual routine for this, or add these on top of what\'s already there?" - end the message with this exact marker so the UI shows tap-options:\n<options>Replace tomorrow|Add on top</options>\nWait for their answer, then emit the plan with the matching action. Do not include tasks for today.\n\n### Today-only intents (premium fast paths)\nBefore entering the 5-step flow, detect these intents from the user's message:\n- **CLEAR today**: phrases like "clear my tasks for today", "wipe today", "remove everything today", "I don't want any tasks today", "cancel today's routine". → Confirm warmly in one sentence and emit a <routine_plan> JSON with action "clear_today" and empty tasks array. No 5-step flow.\n- **REPLACE today**: the user explicitly wants today to look DIFFERENT from their usual routine, e.g. "today I want to do X instead", "scrap today's routine and let's do this", "swap my usual day for this plan", or a sizeable just-today plan they want INSTEAD of what's scheduled. → Emit <routine_plan> with action "replace_today".\n- **ADD today (one-off)**: small (1–3) additions like "also add a run today", "just add journalling on top", "add this on top of my usual day". → Emit <routine_plan> with action "add" and tasks set to recurrence "one-off".\n\nIf the user's intent is ambiguous (a meaningful just-today plan but they haven't said replace vs add), ASK ONE clarifying question before emitting the plan:\n"Want me to swap out today's usual routine for this, or add these on top of what's already there?" — end the message with this exact marker so the UI shows tap-options:\n<options>Replace today|Add on top</options>\nWait for their answer, then emit the plan with the matching action.\n\n### Full 5-step flow (only when building an ongoing routine, not a fast-path today edit)\n\nStep 1 — Plan type. Ask if they want a plan just for today, a daily routine, weekly plan, monthly reset, or all three. End the message with this exact marker so the UI can render tap-options:\n<options>Just today|Daily routine|Weekly plan|Monthly reset|All three</options>\n\nStep 2 — Free text: ask what their day generally looks like and how much time they realistically have.\n\nStep 3 — Free text: ask what they most want their routine to protect time for (movement, mindset, skincare, work blocks, journalling, nutrition, etc).\n\nStep 4 — Free text: ask what they already do consistently that they want to keep.\n\nStep 5 — Free text: ask if there's anything they want to AVOID putting in their routine.\n\nAfter Step 5, generate the plan. Open with one warm sentence acknowledging what you heard. Then present the plan clearly:\n- "Just today" plans: a short list of tasks for today only, grouped Morning / Midday / Evening with suggested times.\n- Daily plans grouped Morning / Midday / Evening with suggested times.\n- Weekly plans assigned to specific days.\n- Monthly plans as weekly milestones.\n\n### Start-date detection (ongoing routines only)\nBefore emitting an ongoing routine, check for explicit start-date language:\n- "from tomorrow", "starting tomorrow", "except today", "not today, but from tomorrow" => startsOn = tomorrow.\n- "from Monday", "starting next week", "from the 1st" => startsOn = that resolved date (yyyy-MM-dd).\n- No date hint AND the routine is non-trivial (3+ recurring tasks) => ASK ONE clarifying question first:\n  "Want this routine to kick off today, or start fresh tomorrow?"\n  <options>Start today|Start tomorrow</options>\nWait for their answer, then emit the plan with the matching top-level startsOn (omit it for "Start today").\n\n### Plan JSON format (ALWAYS this exact shape)\nAt the very end of the message, append a machine-readable JSON block — exactly this format (no extra prose between tags):\n<routine_plan>\n{\n  "action": "add" | "replace_today" | "clear_today",\n  "scope": "today" | "ongoing",\n  "startsOn": "YYYY-MM-DD" (optional),\n  "tasks": [\n    { "title": "Morning walk", "time": "07:00", "recurrence": "daily", "days": [], "icon": "running", "period": "morning" }\n  ]\n}\n</routine_plan>\n\nRules for the JSON:\n- action: "add" by default. Use "replace_today" when the user wants today swapped for this plan. Use "clear_today" with empty tasks when they want today wiped.\n- scope: "today" when the plan applies only to today (replace_today, clear_today, or one-off additions). "ongoing" for ongoing routines (daily / weekly / monthly).\n- startsOn: OMIT entirely when the routine starts today. Include as "YYYY-MM-DD" when the user said "from tomorrow" / "from Monday" / etc. NEVER set startsOn for replace_today or clear_today plans. For one-off add plans, set startsOn only if the user explicitly targeted a future date (e.g. tomorrow) — those always concern today.\n- title: max 5 words.\n- time: HH:mm 24-hour (omit for one-off non-time tasks; use empty string "").\n- recurrence: "daily" | "weekly" | "one-off". For "Just today", "replace_today", and one-off "add" plans, EVERY task MUST use "one-off".\n- days: array of lowercase weekday names (only for weekly). Empty array otherwise.\n- icon: MUST be one of these exact ids: ${validIcons}.\n- period: "morning" | "midday" | "evening" (for daily and just-today tasks).\nClose after the JSON with a warm one-line question asking if they're happy with the plan or want to adjust anything.\n\n${isPremium
      ? `The user IS on uBloom Premium — generate the plan with the JSON block as described, including the clear_today and replace_today fast paths.`
      : `The user is on the FREE tier. You can chat naturally about routines and even today-only changes, but DO NOT emit any <routine_plan> JSON block (no add, no replace_today, no clear_today). Instead, end with: "I'd love to build this directly into your routine for you — that's a uBloom Premium feature. You can upgrade to Premium to let me handle the setup automatically. For now, I can walk you through it and you can add or remove the tasks yourself." Do not output <routine_plan> tags under any circumstance.`}`;

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
