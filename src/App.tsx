import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCloudSync } from "@/hooks/useCloudSync";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

// Pages
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import DreamLife from "./pages/DreamLife";
import ChooseAesthetic from "./pages/ChooseAesthetic";
import Home from "./pages/Home";
import Alignment from "./pages/Alignment";
import Routine from "./pages/Routine";
import Goals from "./pages/Goals";
import Moodboard from "./pages/Moodboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Theme manager component
function ThemeManager() {
  const { profile } = useUserStore();
  
  useEffect(() => {
    const themeClasses = ['theme-beige', 'theme-cream', 'theme-sage', 'theme-lilac', 'theme-champagne', 'theme-mocha', 'theme-grey'];
    themeClasses.forEach(cls => document.documentElement.classList.remove(cls));
    
    if (profile.aesthetic && profile.aesthetic !== 'blush') {
      document.documentElement.classList.add(`theme-${profile.aesthetic}`);
    }
  }, [profile.aesthetic]);
  
  return null;
}

function CloudSync() {
  useCloudSync();
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
        <Route path="/dream-life" element={<ProtectedRoute><PageTransition><DreamLife /></PageTransition></ProtectedRoute>} />
        <Route path="/choose-aesthetic" element={<ProtectedRoute><PageTransition><ChooseAesthetic /></PageTransition></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><PageTransition><Home /></PageTransition></ProtectedRoute>} />
        <Route path="/alignment" element={<ProtectedRoute><PageTransition><Alignment /></PageTransition></ProtectedRoute>} />
        <Route path="/routine" element={<ProtectedRoute><PageTransition><Routine /></PageTransition></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><PageTransition><Goals /></PageTransition></ProtectedRoute>} />
        <Route path="/moodboard" element={<ProtectedRoute><PageTransition><Moodboard /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeManager />
          <CloudSync />
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
