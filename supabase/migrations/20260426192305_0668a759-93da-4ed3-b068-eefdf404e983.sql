-- Audit log for every Stripe webhook event so subscription/plan changes are debuggable.
CREATE TABLE public.subscriber_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriber_events_user_id ON public.subscriber_events(user_id);
CREATE INDEX idx_subscriber_events_created_at ON public.subscriber_events(created_at DESC);
CREATE INDEX idx_subscriber_events_event_type ON public.subscriber_events(event_type);

ALTER TABLE public.subscriber_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription event history
CREATE POLICY "Users can view own subscriber events"
ON public.subscriber_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view everything for debugging
CREATE POLICY "Admins can view all subscriber events"
ON public.subscriber_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- No INSERT/UPDATE/DELETE policies: only the service role (webhook) writes to this table.