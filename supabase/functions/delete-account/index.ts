import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[DELETE-ACCOUNT] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id || !user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const userId = user.id;

    // 1. Cancel Stripe subscription if exists
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          logStep("Found Stripe customer", { customerId });
          const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 });
          for (const sub of subs.data) {
            await stripe.subscriptions.cancel(sub.id);
            logStep("Cancelled subscription", { subId: sub.id });
          }
          // Also cancel trialing subs
          const trialSubs = await stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 10 });
          for (const sub of trialSubs.data) {
            await stripe.subscriptions.cancel(sub.id);
            logStep("Cancelled trial subscription", { subId: sub.id });
          }
        }
      } catch (stripeErr) {
        logStep("Stripe cancellation error (non-fatal)", { error: String(stripeErr) });
      }
    }

    // 2. Delete all user data from tables
    const tables = [
      "ubi_messages",
      "ubi_ratings",
      "ubi_memory",
      "ubi_conversations",
      "analytics_events",
      "subscriber_events",
      "subscribers",
      "user_data",
      "profiles",
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (error) logStep(`Error deleting from ${table}`, { error: error.message });
      else logStep(`Deleted from ${table}`);
    }

    // Also delete from user_roles
    const { error: rolesErr } = await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    if (rolesErr) logStep("Error deleting user_roles", { error: rolesErr.message });

    // 3. Delete storage files
    const buckets = ["vision-images", "voice-journals"];
    for (const bucket of buckets) {
      try {
        const { data: files } = await supabaseAdmin.storage.from(bucket).list(userId);
        if (files && files.length > 0) {
          const paths = files.map((f) => `${userId}/${f.name}`);
          await supabaseAdmin.storage.from(bucket).remove(paths);
          logStep(`Deleted ${paths.length} files from ${bucket}`);
        }
      } catch (storageErr) {
        logStep(`Storage cleanup error for ${bucket}`, { error: String(storageErr) });
      }
    }

    // 4. Delete auth user
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteErr) throw new Error(`Failed to delete auth user: ${deleteErr.message}`);
    logStep("Auth user deleted");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});