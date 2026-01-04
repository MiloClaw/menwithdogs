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
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Saved from "./pages/Saved";
import OnboardingGuard from "./components/onboarding/OnboardingGuard";
import MyProfile from "./pages/onboarding/MyProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import BlogManagement from "./pages/admin/BlogManagement";
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
              <Route path="/directory" element={<Navigate to="/places" replace />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              
              {/* Auth & Onboarding */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/invite/:token" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/saved" element={<Saved />} />
              
              {/* Simplified Onboarding - single step */}
              <Route path="/onboarding/my-profile" element={<OnboardingGuard><MyProfile /></OnboardingGuard>} />
              
              {/* Legacy onboarding redirects */}
              <Route path="/onboarding" element={<Navigate to="/onboarding/my-profile" replace />} />
              <Route path="/onboarding/path-selection" element={<Navigate to="/onboarding/my-profile" replace />} />
              <Route path="/onboarding/create-couple" element={<Navigate to="/onboarding/my-profile" replace />} />
              <Route path="/onboarding/invite-partner" element={<Navigate to="/dashboard" replace />} />
              <Route path="/onboarding/couple-profile" element={<Navigate to="/dashboard" replace />} />
              <Route path="/onboarding/confirm" element={<Navigate to="/dashboard" replace />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
              <Route path="/admin/users" element={<RequireRole role="admin"><UserManagement /></RequireRole>} />
              <Route path="/admin/interests" element={<RequireRole role="admin"><InterestManagement /></RequireRole>} />
              <Route path="/admin/directory/cities" element={<RequireRole role="admin"><CityManagement /></RequireRole>} />
              <Route path="/admin/directory/places" element={<RequireRole role="admin"><PlaceManagement /></RequireRole>} />
              <Route path="/admin/directory/events" element={<RequireRole role="admin"><EventManagement /></RequireRole>} />
              <Route path="/admin/directory/events/discover" element={<RequireRole role="admin"><EventDiscovery /></RequireRole>} />
              <Route path="/admin/blog" element={<RequireRole role="admin"><BlogManagement /></RequireRole>} />
              
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
