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
import LovePlace from "./pages/LovePlace";
import ExploreCities from "./pages/ExploreCities";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Saved from "./pages/Saved";
import Preferences from "./pages/Preferences";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import PostManagement from "./pages/admin/PostManagement";
import PlaceManagement from "./pages/admin/PlaceManagement";
import EventManagement from "./pages/admin/EventManagement";
import InterestManagement from "./pages/admin/InterestManagement";
import CityManagement from "./pages/admin/CityManagement";
import ProContextManagement from "./pages/admin/ProContextManagement";
import FoundersManagement from "./pages/admin/FoundersManagement";
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
              <Route path="/love/:placeId" element={<LovePlace />} />
              <Route path="/places" element={<Places />} />
              <Route path="/places/explore" element={<ExploreCities />} />
              
              {/* Blog for announcements */}
              <Route path="/blog" element={<Blog />} />
              
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Auth & User Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/saved" element={<Saved />} />
              
              {/* Settings & Preferences */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/preferences" element={<Preferences />} />
              
              {/* Legacy redirects - consolidated */}
              <Route path="/directory" element={<Navigate to="/places" replace />} />
              <Route path="/dashboard" element={<Navigate to="/places" replace />} />
              <Route path="/onboarding/*" element={<Navigate to="/places" replace />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
              <Route path="/admin/users" element={<RequireRole role="admin"><UserManagement /></RequireRole>} />
              <Route path="/admin/founders" element={<RequireRole role="admin"><FoundersManagement /></RequireRole>} />
              <Route path="/admin/interests" element={<RequireRole role="admin"><InterestManagement /></RequireRole>} />
              <Route path="/admin/directory/cities" element={<RequireRole role="admin"><CityManagement /></RequireRole>} />
              <Route path="/admin/directory/places" element={<RequireRole role="admin"><PlaceManagement /></RequireRole>} />
              <Route path="/admin/directory/events" element={<RequireRole role="admin"><EventManagement /></RequireRole>} />
              <Route path="/admin/posts" element={<RequireRole role="admin"><PostManagement /></RequireRole>} />
              <Route path="/admin/pro-contexts" element={<RequireRole role="admin"><ProContextManagement /></RequireRole>} />
              
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