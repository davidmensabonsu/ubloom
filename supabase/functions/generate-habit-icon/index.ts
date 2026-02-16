import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateIcon(habitTitle: string, apiKey: string): Promise<string | null> {
  const prompt = `Generate a single bold, vibrant 3D rendered icon of "${habitTitle}". The icon must have a fully transparent background with NO background shape, NO circle, NO square behind it — just the object floating. Use rich, saturated colors with strong contrast and defined edges. The object should be chunky, solid, and eye-catching — not faint or pastel. No text whatsoever. Centered composition, high quality render, PNG style with transparency.`;

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    }
  );

  if (!response.ok) {
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    if (response.status === 429 || response.status === 402) {
      throw { status: response.status };
    }
    return null;
  }

  const data = await response.json();
  console.log("AI response structure:", JSON.stringify(Object.keys(data)));
  
  // Try the standard image location
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (imageUrl) return imageUrl;

  // Try alternative: inline_data in content parts
  const parts = data.choices?.[0]?.message?.content;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part?.type === "image_url" && part?.image_url?.url) {
        return part.image_url.url;
      }
      if (part?.inline_data?.data) {
        const mime = part.inline_data.mime_type || "image/png";
        return `data:${mime};base64,${part.inline_data.data}`;
      }
    }
  }

  // Log full response for debugging
  console.error("No image found in response. Full response:", JSON.stringify(data).slice(0, 2000));
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { habitTitle } = await req.json();
    if (!habitTitle) {
      return new Response(JSON.stringify({ error: "habitTitle is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Try up to 2 times
    let imageUrl: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        imageUrl = await generateIcon(habitTitle, LOVABLE_API_KEY);
        if (imageUrl) break;
        console.log(`Attempt ${attempt + 1} returned no image, retrying...`);
      } catch (err: any) {
        if (err?.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited, please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (err?.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      // Small delay before retry
      if (attempt < 1) await new Promise(r => setTimeout(r, 1000));
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Could not generate icon. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-habit-icon error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
