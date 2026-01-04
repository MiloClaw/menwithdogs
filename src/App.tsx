import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CoupleProvider } from "@/contexts/CoupleContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Places from "./pages/Places";
import ExploreCities from "./pages/ExploreCities";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Saved from "./pages/Saved";
import Preferences from "./pages/Preferences";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import PostManagement from "./pages/admin/PostManagement";
import PlaceManagement from "./pages/admin/PlaceManagement";
import EventManagement from "./pages/admin/EventManagement";
import EventDiscovery from "./pages/admin/EventDiscovery";
import InterestManagement from "./pages/admin/InterestManagement";
import CityManagement from "./pages/admin/CityManagement";
import { RequireRole } from "./components/auth/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CoupleProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/places" element={<Places />} />
              <Route path="/places/explore" element={<ExploreCities />} />
              <Route path="/directory" element={<Navigate to="/places" replace />} />
              
              {/* Legacy blog routes - redirect to places */}
              <Route path="/blog" element={<Navigate to="/places" replace />} />
              <Route path="/blog/:slug" element={<Navigate to="/places" replace />} />
              
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Auth & Onboarding */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/invite/:token" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/saved" element={<Saved />} />
              
              {/* Preferences (optional profile editing - not a gate) */}
              <Route path="/preferences" element={<Preferences />} />
              
              {/* Legacy routes - all redirect to /places */}
              <Route path="/onboarding" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/my-profile" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/path-selection" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/create-couple" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/invite-partner" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/couple-profile" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/confirm" element={<Navigate to="/places" replace />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
              <Route path="/admin/users" element={<RequireRole role="admin"><UserManagement /></RequireRole>} />
              <Route path="/admin/interests" element={<RequireRole role="admin"><InterestManagement /></RequireRole>} />
              <Route path="/admin/directory/cities" element={<RequireRole role="admin"><CityManagement /></RequireRole>} />
              <Route path="/admin/directory/places" element={<RequireRole role="admin"><PlaceManagement /></RequireRole>} />
              <Route path="/admin/directory/events" element={<RequireRole role="admin"><EventManagement /></RequireRole>} />
              <Route path="/admin/directory/events/discover" element={<RequireRole role="admin"><EventDiscovery /></RequireRole>} />
              <Route path="/admin/posts" element={<RequireRole role="admin"><PostManagement /></RequireRole>} />
              
              {/* Legacy admin blog route */}
              <Route path="/admin/blog" element={<Navigate to="/admin/posts" replace />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CoupleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
