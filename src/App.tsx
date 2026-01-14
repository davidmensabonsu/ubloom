import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

// Pages
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import DreamLife from "./pages/DreamLife";
import ChooseAesthetic from "./pages/ChooseAesthetic";
import Home from "./pages/Home";
import Alignment from "./pages/Alignment";
import Routine from "./pages/Routine";
import Goals from "./pages/Goals";
import Moodboard from "./pages/Moodboard";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeManager />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dream-life" element={<DreamLife />} />
          <Route path="/choose-aesthetic" element={<ChooseAesthetic />} />
          <Route path="/home" element={<Home />} />
          <Route path="/alignment" element={<Alignment />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/moodboard" element={<Moodboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
