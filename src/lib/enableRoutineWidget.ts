import { supabase } from '@/integrations/supabase/client';
import { isDespiaNative } from '@/hooks/useReminders';

declare global {
  interface Window {
    despia?: string;
  }
}

const WIDGET_PREF_KEY = 'ubloom_widget_enabled';

export function getStoredWidgetEnabled(): boolean {
  try {
    return localStorage.getItem(WIDGET_PREF_KEY) === '1';
  } catch {
    return false;
  }
}

function setStoredWidgetEnabled(enabled: boolean) {
  try {
    localStorage.setItem(WIDGET_PREF_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

async function mintToken(): Promise<string | null> {
  const { data, error } = await supabase.rpc('rotate_widget_token');
  if (error || !data) {
    console.warn('[widget] rotate_widget_token failed', error);
    return null;
  }
  return data as string;
}

function buildWidgetUrl(token: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/routine-widget?token=${encodeURIComponent(token)}`;
}

/** Toggle the home-screen widget on/off. Safe to call from non-native web (no-op). */
export async function enableRoutineWidget(enabled: boolean): Promise<void> {
  setStoredWidgetEnabled(enabled);
  if (!isDespiaNative()) return;

  if (!enabled) {
    window.despia = 'widget://remove';
    // Best-effort: revoke the active token so the widget URL stops working.
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (uid) {
      supabase.from('widget_tokens').delete().eq('user_id', uid).then(() => {});
    }
    return;
  }

  const token = await mintToken();
  if (!token) return;
  window.despia = `widget://?url=${encodeURIComponent(buildWidgetUrl(token))}&size=medium`;
}

/** Rotate the token and refresh the widget URL without flipping the user's preference. */
export async function refreshRoutineWidget(): Promise<void> {
  if (!isDespiaNative()) return;
  if (!getStoredWidgetEnabled()) return;
  const token = await mintToken();
  if (!token) return;
  window.despia = `widget://?url=${encodeURIComponent(buildWidgetUrl(token))}&size=medium`;
}