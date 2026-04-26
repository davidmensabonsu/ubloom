-- Subscribers table — single source of truth for subscription state
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscribers_stripe_customer_id
  ON public.subscribers(stripe_customer_id);

CREATE INDEX idx_subscribers_stripe_subscription_id
  ON public.subscribers(stripe_subscription_id);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can view own subscription"
  ON public.subscribers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscribers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies → only service role (webhook + check-subscription) can write.
-- This prevents users from self-upgrading to premium.

-- Auto-update updated_at
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();