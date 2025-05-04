
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { useUiStore } from "./stores/uiStore";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from './pages/Admin';
import ExplorePage from './pages/explore';
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

function App() {
  const { isDarkMode, logoUrl } = useUiStore();
  
  useEffect(() => {
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Set favicon based on theme
  useEffect(() => {
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
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
