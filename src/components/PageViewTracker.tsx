import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '@/hooks/useAnalytics';

export default function PageViewTracker() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      track('page_view', { page: location.pathname });
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  // Track session start once
  useEffect(() => {
    track('session_start', { timestamp: Date.now() });
  }, []);

  return null;
}
