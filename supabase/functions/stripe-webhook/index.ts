import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${extra}`);
};

const PREMIUM_PRICE_IDS = new Set([
  "price_1TKMZaAni5cThJuscqeltmFP", // monthly £4.99
  "price_1TKMaJAni5cThJus9hNowIo0", // yearly £45
]);

function planFromPriceId(priceId: string | null | undefined): "free" | "premium" {
  if (!priceId) return "free";
  return PREMIUM_PRICE_IDS.has(priceId) ? "premium" : "premium"; // any active sub = premium
}

function mapStripeStatus(s: string): "active" | "inactive" | "cancelled" | "past_due" | "trialing" {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "inactive";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey) return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  if (!webhookSecret) return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature header", { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("Signature verification failed", { error: msg });
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  // Log every Stripe event to subscriber_events for debugging.
  // Best-effort: never throw out of here; uses stripe_event_id as a unique key
  // so retries from Stripe don't create duplicates.
  async function logEvent(args: {
    userId: string | null;
    customerId: string | null;
    subscriptionId: string | null;
    plan: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
  }) {
    try {
      const { error } = await supabase.from("subscriber_events").insert({
        user_id: args.userId,
        stripe_event_id: event.id,
        event_type: event.type,
        stripe_customer_id: args.customerId,
        stripe_subscription_id: args.subscriptionId,
        plan: args.plan,
        status: args.status,
        current_period_end: args.currentPeriodEnd,
        raw: event as unknown as Record<string, unknown>,
      });
      if (error && !/duplicate key/i.test(error.message)) {
        log("Event log insert failed (non-fatal)", { error: error.message });
      }
    } catch (e) {
      log("Event log insert threw (non-fatal)", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // Resolve a Supabase user_id from a Stripe customer (email lookup)
  async function userIdForCustomer(customerId: string): Promise<string | null> {
    try {
      // Try existing subscriber row first
      const { data: existing } = await supabase
        .from("subscribers")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (existing?.user_id) return existing.user_id;

      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      const email = (customer as Stripe.Customer).email;
      if (!email) return null;

      const { data: list } = await supabase.auth.admin.listUsers();
      const match = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      return match?.id ?? null;
    } catch (e) {
      log("userIdForCustomer error", { error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  }

  async function upsertFromSubscription(sub: Stripe.Subscription) {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const userId = await userIdForCustomer(customerId);
    const priceId = sub.items.data[0]?.price?.id ?? null;
    const status = mapStripeStatus(sub.status);
    const isPaid = status === "active" || status === "trialing";
    const plan = isPaid ? planFromPriceId(priceId) : "free";
    const currentPeriodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    // Always log the event, even if we can't resolve a user yet.
    await logEvent({
      userId,
      customerId,
      subscriptionId: sub.id,
      plan,
      status,
      currentPeriodEnd,
    });

    if (!userId) {
      log("No matching user for customer; skipping subscriber upsert", { customerId });
      return;
    }

    const payload = {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan,
      status,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("subscribers")
      .upsert(payload, { onConflict: "user_id" });
    if (error) {
      log("Upsert failed", { error: error.message, payload });
    } else {
      log("Subscriber upserted", { userId, plan, status });
    }
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = await userIdForCustomer(customerId);
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        await logEvent({
          userId,
          customerId,
          subscriptionId: sub.id,
          plan: "free",
          status: "cancelled",
          currentPeriodEnd,
        });
        if (userId) {
          const { error } = await supabase
            .from("subscribers")
            .upsert(
              {
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: sub.id,
                plan: "free",
                status: "cancelled",
                current_period_end: currentPeriodEnd,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" },
            );
          if (error) log("Cancellation upsert failed", { error: error.message });
          else log("Subscription cancelled", { userId });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as { subscription?: string | Stripe.Subscription }).subscription;
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof subId === "string" ? subId : subId.id,
          );
          await upsertFromSubscription(subscription);
        } else {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;
          const userId = customerId ? await userIdForCustomer(customerId) : null;
          await logEvent({
            userId,
            customerId,
            subscriptionId: null,
            plan: null,
            status: null,
            currentPeriodEnd: null,
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;
        const userId = customerId ? await userIdForCustomer(customerId) : null;
        await logEvent({
          userId,
          customerId: customerId ?? null,
          subscriptionId: null,
          plan: null,
          status: "past_due",
          currentPeriodEnd: null,
        });
        if (customerId) {
          if (userId) {
            const { error } = await supabase
              .from("subscribers")
              .update({ status: "past_due", updated_at: new Date().toISOString() })
              .eq("user_id", userId);
            if (error) log("past_due update failed", { error: error.message });
            else log("Marked past_due", { userId });
          }
        }
        break;
      }
      default: {
        log("Unhandled event type", { type: event.type });
        // Still log unknown event types so debugging is complete.
        await logEvent({
          userId: null,
          customerId: null,
          subscriptionId: null,
          plan: null,
          status: null,
          currentPeriodEnd: null,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("Handler error", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});