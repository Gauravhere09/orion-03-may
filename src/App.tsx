
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUiStore } from "./stores/uiStore";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExplorePage from './pages/explore';
import Dashboard from "./pages/Dashboard";
import ImageGenerator from "./pages/ImageGenerator";
import AuthModal from "./components/AuthModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Wrap the store access in a state to ensure it's only accessed after component mount
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Use the store only after the component is mounted
  useEffect(() => {
    const { isDarkMode: darkMode, logoUrl: logo } = useUiStore.getState();
    setIsDarkMode(darkMode);
    setLogoUrl(logo);
    
    // Subscribe to store changes
    const unsubscribe = useUiStore.subscribe(
      state => {
        setIsDarkMode(state.isDarkMode);
        setLogoUrl(state.logoUrl);
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Add CSS for smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }, [isDarkMode]);
  
  // Set favicon based on theme
  useEffect(() => {
    if (!logoUrl) return;
    
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = logoUrl;
    }
  }, [logoUrl]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />} />
              <Route path="/explore" element={<ExplorePage authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />} />
              <Route path="/dashboard" element={<Dashboard authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />} />
              <Route path="/image-generator" element={<ImageGenerator authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />} />
              {/* Redirect auth pages to home with modal open */}
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/signup" element={<Navigate to="/" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
