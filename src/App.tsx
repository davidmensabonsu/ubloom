import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CloudSyncProvider, useCloudSyncStatus } from "@/hooks/useCloudSync";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import DailyMoodCheckin from "@/components/DailyMoodCheckin";
import AppWalkthrough from "@/components/AppWalkthrough";
import TrialWelcomeModal from "@/components/TrialWelcomeModal";
import PageViewTracker from "@/components/PageViewTracker";
import SubscriptionGate from "@/components/SubscriptionGate";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { getLocalDateStr } from "@/lib/dateUtils";

// Pages
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import DreamLife from "./pages/DreamLife";
import ChooseAesthetic from "./pages/ChooseAesthetic";
import Home from "./pages/Home";
import Alignment from "./pages/Alignment";
import Routine from "./pages/Routine";
import Wander from "./pages/Wander";
import Moodboard from "./pages/Moodboard";
import Ubi from "./pages/Ubi";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import WanderCategory from "./pages/WanderCategory";
import Health from "./pages/Health";
import Society from "./pages/Society";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LegalConsent from "./pages/LegalConsent";
import CookiePolicy from "./pages/CookiePolicy";

const queryClient = new QueryClient();

// Theme manager component
function ThemeManager() {
  const { profile } = useUserStore();
  
  useEffect(() => {
    // Clear all known theme classes (current + legacy)
    const themeClasses = [
      'theme-rose', 'theme-sage', 'theme-sand', 'theme-lavender', 'theme-arctic',
      'theme-beige', 'theme-lilac', 'theme-sky', 'theme-coral', 'theme-teal',
      'theme-mocha', 'theme-midnight', 'theme-peach', 'theme-mauve', 'theme-grey', 'theme-blush',
      'theme-yellow', 'theme-brown', 'theme-cream', 'theme-blue', 'theme-purple',
      'theme-green', 'theme-pink', 'theme-orange',
    ];
    themeClasses.forEach(cls => document.documentElement.classList.remove(cls));

    // Map legacy themes and all new themes to their CSS classes
    const aestheticMap: Record<string, string> = {
      // existing 5
      rose: '', sage: 'theme-sage', sand: 'theme-sand', lavender: 'theme-lavender', arctic: 'theme-arctic',
      // legacy → closest existing theme
      blush: '', mauve: '', peach: 'theme-sand', coral: 'theme-sand', mocha: 'theme-sand',
      lilac: 'theme-lavender', midnight: 'theme-lavender',
      sky: 'theme-arctic', teal: 'theme-arctic',
      // new 10
      grey: 'theme-grey', beige: 'theme-beige', yellow: 'theme-yellow',
      brown: 'theme-brown', cream: 'theme-cream', blue: 'theme-blue',
      purple: 'theme-purple', green: 'theme-green', pink: 'theme-pink',
      orange: 'theme-orange',
    };
    const cls = aestheticMap[profile.aesthetic ?? 'rose'];
    if (cls) document.documentElement.classList.add(cls);
  }, [profile.aesthetic]);
  
  return null;
}

// Daily mood check-in gate
function MoodCheckinGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const cloudSyncLoaded = useCloudSyncStatus();
  const { profile, updateProfile } = useUserStore();
  const location = useLocation();

  const mainRoutes = ['/home', '/alignment', '/routine', '/wander', '/ubi', '/moodboard', '/profile', '/health'];
  const isMainRoute = mainRoutes.includes(location.pathname);

  // Show walkthrough overlay on top of page content for first-time users
  const needsWalkthrough =
    user &&
    cloudSyncLoaded &&
    profile.onboardingComplete &&
    !profile.walkthroughComplete &&
    isMainRoute;

  const needsCheckin =
    user &&
    cloudSyncLoaded &&
    profile.onboardingComplete &&
    !needsWalkthrough &&
    isMainRoute &&
    profile.lastMoodCheckinDate !== getLocalDateStr();

  const showTrialModal =
    user &&
    cloudSyncLoaded &&
    profile.onboardingComplete &&
    profile.walkthroughComplete &&
    profile.showTrialWelcome &&
    !needsWalkthrough &&
    isMainRoute;

  if (needsCheckin) {
    return <DailyMoodCheckin />;
  }

  return (
    <>
      {children}
      {needsWalkthrough && <AppWalkthrough />}
      {showTrialModal && (
        <TrialWelcomeModal
          open={true}
          onDismiss={() => updateProfile({ showTrialWelcome: false })}
        />
      )}
    </>
  );
}

const routeOrder = ['/', '/auth', '/reset-password', '/onboarding', '/dream-life', '/choose-aesthetic', '/home', '/alignment', '/routine', '/wander', '/ubi', '/moodboard', '/profile'];

function AnimatedRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  
  const prevIndex = routeOrder.indexOf(prevPath.current);
  const currIndex = routeOrder.indexOf(location.pathname);
  const direction = currIndex >= prevIndex ? 1 : -1;
  
  useEffect(() => {
    prevPath.current = location.pathname;
  }, [location.pathname]);
  
  return (
    <>
      <PageViewTracker />
      <SubscriptionGate />
      <MoodCheckinGate>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition direction={direction}><Welcome /></PageTransition>} />
            <Route path="/auth" element={<PageTransition direction={direction}><Auth /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition direction={direction}><ResetPassword /></PageTransition>} />
            <Route path="/onboarding" element={<ProtectedRoute><PageTransition direction={direction}><Onboarding /></PageTransition></ProtectedRoute>} />
            <Route path="/dream-life" element={<ProtectedRoute><PageTransition direction={direction}><DreamLife /></PageTransition></ProtectedRoute>} />
            <Route path="/choose-aesthetic" element={<ProtectedRoute><PageTransition direction={direction}><ChooseAesthetic /></PageTransition></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><PageTransition direction={direction}><Home /></PageTransition></ProtectedRoute>} />
            <Route path="/alignment" element={<ProtectedRoute><PageTransition direction={direction}><Alignment /></PageTransition></ProtectedRoute>} />
            <Route path="/routine" element={<ProtectedRoute><PageTransition direction={direction}><Routine /></PageTransition></ProtectedRoute>} />
            <Route path="/wander" element={<ProtectedRoute><PageTransition direction={direction}><Wander /></PageTransition></ProtectedRoute>} />
            <Route path="/ubi" element={<ProtectedRoute><PageTransition direction={direction}><Ubi /></PageTransition></ProtectedRoute>} />
            <Route path="/moodboard" element={<ProtectedRoute><PageTransition direction={direction}><Moodboard /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition direction={direction}><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><PageTransition direction={direction}><AdminDashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/wander/:category" element={<ProtectedRoute><PageTransition direction={direction}><WanderCategory /></PageTransition></ProtectedRoute>} />
            <Route path="/health" element={<ProtectedRoute><PageTransition direction={direction}><Health /></PageTransition></ProtectedRoute>} />
            <Route path="/society" element={<ProtectedRoute><PageTransition direction={direction}><Society /></PageTransition></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><PageTransition direction={direction}><Upgrade /></PageTransition></ProtectedRoute>} />
            <Route path="/legal-consent" element={<ProtectedRoute><PageTransition direction={direction}><LegalConsent /></PageTransition></ProtectedRoute>} />
            <Route path="/terms" element={<PageTransition direction={direction}><Terms /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition direction={direction}><Privacy /></PageTransition>} />
            <Route path="/cookie-policy" element={<PageTransition direction={direction}><CookiePolicy /></PageTransition>} />
            <Route path="*" element={<PageTransition direction={direction}><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </MoodCheckinGate>
      <CookieConsentBanner />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CloudSyncProvider>
            <ThemeManager />
            <AnimatedRoutes />
          </CloudSyncProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
