import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_data: Record<string, any>;
}

const BATCH_INTERVAL = 5000; // flush every 5s
const MAX_BATCH = 20;

let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushEvents() {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_BATCH);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const rows = batch.map(e => ({
    user_id: user.id,
    event_name: e.event_name,
    event_data: e.event_data,
  }));

  (supabase as any)
    .from('analytics_events')
    .insert(rows)
    .then(() => {})
    .catch((err: any) => console.warn('[analytics] flush error', err));
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, BATCH_INTERVAL);
}

/* ----------------------------------------------------------------------
 * Event schema / validator
 *
 * Every track() call MUST satisfy three rules:
 *   1. `eventName` is non-empty snake_case (lowercase letters, digits, _).
 *   2. `page` is present in eventData. If omitted, we auto-inject the
 *      current window.location.pathname.
 *   3. `source` is present in eventData (a short identifier of where the
 *      event was triggered, e.g. "home_future_self_letter", "trial_banner",
 *      "page_view_tracker"). Cannot be auto-derived.
 *
 * In development the validator THROWS on any violation so misuse surfaces
 * immediately. In production it console.warns and drops the event so
 * malformed data never pollutes analytics.
 * -------------------------------------------------------------------- */

const EVENT_NAME_RE = /^[a-z][a-z0-9_]*$/;
const isDev =
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env?.DEV === true;

function currentPage(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location.pathname;
}

function fail(message: string, payload: unknown) {
  const full = `[analytics] ${message}`;
  if (isDev) {
    // Loud failure in dev so the bad call site is fixed.
    console.error(full, payload);
    throw new Error(full);
  }
  console.warn(full, payload);
}

function validateEvent(
  eventName: string,
  eventData: Record<string, any>,
): { valid: boolean; data: Record<string, any> } {
  // 1. Event name shape
  if (typeof eventName !== 'string' || !EVENT_NAME_RE.test(eventName)) {
    fail(
      `Invalid event name "${eventName}". Use snake_case: lowercase letters, digits and underscores, starting with a letter.`,
      { eventName, eventData },
    );
    return { valid: false, data: eventData };
  }

  // 2. page — auto-inject if missing
  const page = eventData.page ?? currentPage();
  if (!page || typeof page !== 'string') {
    fail(
      `Event "${eventName}" is missing required property "page" and none could be derived.`,
      { eventName, eventData },
    );
    return { valid: false, data: eventData };
  }

  // 3. source — must be supplied by the caller
  const source = eventData.source;
  if (!source || typeof source !== 'string') {
    fail(
      `Event "${eventName}" is missing required property "source" (a short identifier of where the event was triggered).`,
      { eventName, eventData },
    );
    return { valid: false, data: eventData };
  }

  return { valid: true, data: { ...eventData, page, source } };
}

export function track(
  eventName: string,
  eventData: Record<string, any> = {},
) {
  const { valid, data } = validateEvent(eventName, eventData);
  if (!valid) return; // dropped (or already threw in dev)

  eventQueue.push({ event_name: eventName, event_data: data });
  if (eventQueue.length >= MAX_BATCH) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}

export function useAnalytics() {
  return { track };
}
