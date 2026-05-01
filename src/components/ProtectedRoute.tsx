import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useCloudSyncStatus } from '@/hooks/useCloudSync';

const ONBOARDING_ROUTES = ['/onboarding', '/dream-life', '/choose-aesthetic'];
const LEGAL_ROUTE = '/legal-consent';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const onboardingComplete = useUserStore((s) => s.profile.onboardingComplete);
  const legalConsentDate = useUserStore((s) => s.profile.legalConsentDate);
  const cloudSyncLoaded = useCloudSyncStatus();

  if (loading || (user && !cloudSyncLoaded)) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Legal consent gate — must accept before anything else
  if (!legalConsentDate && pathname !== LEGAL_ROUTE) {
    return <Navigate to="/legal-consent" replace />;
  }

  if (!onboardingComplete && !ONBOARDING_ROUTES.includes(pathname) && pathname !== LEGAL_ROUTE) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
