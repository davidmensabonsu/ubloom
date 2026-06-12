// Single source of truth for server-side premium derivation.
// Returns true if the user is an admin, has an active paid subscription,
// or is inside the 3-day in-app free trial granted at signup.
// deno-lint-ignore no-explicit-any
export async function isPremiumUser(admin: any, userId: string): Promise<boolean> {
  // Admin override — mirrors client-side useSubscription behaviour.
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (roleRow) return true;

  const { data: sub } = await admin
    .from("subscribers")
    .select("plan, status, trial_started_at")
    .eq("user_id", userId)
    .maybeSingle();

  const paidActive = !!(sub?.plan && sub.plan !== "free" &&
    (sub.status === "active" || sub.status === "trialing"));
  const TRIAL_DAYS = 3;
  const trialActive = !!(sub?.trial_started_at &&
    Date.now() - new Date(sub.trial_started_at).getTime() < TRIAL_DAYS * 86_400_000);
  return paidActive || trialActive;
}