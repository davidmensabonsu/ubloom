import { useCallback, useRef } from 'react';
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

export function track(eventName: string, eventData: Record<string, any> = {}) {
  eventQueue.push({ event_name: eventName, event_data: eventData });
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
