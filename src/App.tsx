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
import Wonder from "./pages/Wonder";
import Moodboard from "./pages/Moodboard";
import Ubi from "./pages/Ubi";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import WonderCategory from "./pages/WonderCategory";
import Health from "./pages/Health";
import Society from "./pages/Society";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Theme manager component
function ThemeManager() {
  const { profile } = useUserStore();
  
  useEffect(() => {
    const themeClasses = ['theme-beige', 'theme-sage', 'theme-lilac', 'theme-sky', 'theme-coral', 'theme-teal', 'theme-mocha', 'theme-midnight', 'theme-peach', 'theme-mauve', 'theme-grey'];
    themeClasses.forEach(cls => document.documentElement.classList.remove(cls));
    
    if (profile.aesthetic && profile.aesthetic !== 'blush') {
      document.documentElement.classList.add(`theme-${profile.aesthetic}`);
    }
  }, [profile.aesthetic]);
  
  return null;
}

// Daily mood check-in gate
function MoodCheckinGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const cloudSyncLoaded = useCloudSyncStatus();
  const { profile } = useUserStore();
  const location = useLocation();

  const mainRoutes = ['/home', '/alignment', '/routine', '/wonder', '/ubi', '/moodboard', '/profile'];
  const isMainRoute = mainRoutes.includes(location.pathname);

  const needsCheckin =
    user &&
    cloudSyncLoaded &&
    profile.onboardingComplete &&
    isMainRoute &&
    profile.lastMoodCheckinDate !== getLocalDateStr();

  if (needsCheckin) {
    return <DailyMoodCheckin />;
  }

  return <>{children}</>;
}

const routeOrder = ['/', '/auth', '/reset-password', '/onboarding', '/dream-life', '/choose-aesthetic', '/home', '/alignment', '/routine', '/wonder', '/ubi', '/moodboard', '/profile'];

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
            <Route path="/wonder" element={<ProtectedRoute><PageTransition direction={direction}><Wonder /></PageTransition></ProtectedRoute>} />
            <Route path="/ubi" element={<ProtectedRoute><PageTransition direction={direction}><Ubi /></PageTransition></ProtectedRoute>} />
            <Route path="/moodboard" element={<ProtectedRoute><PageTransition direction={direction}><Moodboard /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition direction={direction}><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><PageTransition direction={direction}><AdminDashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/wonder/:category" element={<ProtectedRoute><PageTransition direction={direction}><WonderCategory /></PageTransition></ProtectedRoute>} />
            <Route path="/health" element={<ProtectedRoute><PageTransition direction={direction}><Health /></PageTransition></ProtectedRoute>} />
            <Route path="/society" element={<ProtectedRoute><PageTransition direction={direction}><Society /></PageTransition></ProtectedRoute>} />
            <Route path="*" element={<PageTransition direction={direction}><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </MoodCheckinGate>
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
