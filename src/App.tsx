import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToAnchor from "@/components/ScrollToAnchor";
import { CoupleProvider } from "@/contexts/CoupleContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Places from "./pages/Places";
import LovePlace from "./pages/LovePlace";
import ExploreCities from "./pages/ExploreCities";
import NationalParks from "./pages/NationalParks";
import NationalParkDetail from "./pages/NationalParkDetail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Sitemap from "./pages/Sitemap";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Community from "./pages/Community";
import Outdoors from "./pages/Outdoors";
import FindFriends from "./pages/FindFriends";

import Ambassadors from "./pages/Ambassadors";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPostPage";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Saved from "./pages/Saved";
import Preferences from "./pages/Preferences";
import Settings from "./pages/Settings";
import DiscoverTogether from "./pages/DiscoverTogether";
import Contribute from "./pages/Contribute";
import Contributions from "./pages/Contributions";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import PostManagement from "./pages/admin/PostManagement";
import PlaceManagement from "./pages/admin/PlaceManagement";
import EventManagement from "./pages/admin/EventManagement";
import InterestManagement from "./pages/admin/InterestManagement";
import CityManagement from "./pages/admin/CityManagement";
import MetroManagement from "./pages/admin/MetroManagement";
import ProContextManagement from "./pages/admin/ProContextManagement";

import LogoTesting from "./pages/admin/LogoTesting";
import TagManagement from "./pages/admin/TagManagement";
import TrailBlazerManagement from "./pages/admin/TrailBlazerManagement";
import TagPage from "./pages/TagPage";
import { RequireRole } from "./components/auth/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToAnchor />
            <AuthProvider>
              <CoupleProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/love/:placeId" element={<LovePlace />} />
                  <Route path="/places" element={<Places />} />
                  <Route path="/places/explore" element={<ExploreCities />} />
                  <Route path="/places/national-parks" element={<NationalParks />} />
                  <Route path="/places/national-parks/:parkId" element={<NationalParkDetail />} />
                  <Route path="/together" element={<DiscoverTogether />} />
                  <Route path="/together/:token" element={<DiscoverTogether />} />
                  
                  {/* Blog for announcements */}
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  
                  {/* Tag pages */}
                  <Route path="/tags/:slug" element={<TagPage />} />
                  
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                  
                  {/* SEO Intent Capture Pages */}
                  <Route path="/community" element={<Community />} />
                  <Route path="/outdoors" element={<Outdoors />} />
                  <Route path="/find-friends" element={<FindFriends />} />
                  <Route path="/couples" element={<Navigate to="/together" replace />} />
                  <Route path="/ambassadors" element={<Ambassadors />} />
                  
                  {/* Auth & User Routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/saved" element={<Saved />} />
                  
                  {/* Settings & Preferences */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/preferences" element={<Preferences />} />
                  
                  {/* Trail Blazer Contribution Routes */}
                  <Route path="/contribute" element={<Contribute />} />
                  <Route path="/contributions" element={<Contributions />} />
                  
                  {/* Legacy redirects - consolidated */}
                  <Route path="/directory" element={<Navigate to="/places" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/places" replace />} />
                  <Route path="/onboarding/*" element={<Navigate to="/places" replace />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
                  <Route path="/admin/users" element={<RequireRole role="admin"><UserManagement /></RequireRole>} />
                  
                  <Route path="/admin/interests" element={<RequireRole role="admin"><InterestManagement /></RequireRole>} />
                  <Route path="/admin/directory/cities" element={<RequireRole role="admin"><CityManagement /></RequireRole>} />
                  <Route path="/admin/directory/metros" element={<RequireRole role="admin"><MetroManagement /></RequireRole>} />
                  <Route path="/admin/directory/places" element={<RequireRole role="admin"><PlaceManagement /></RequireRole>} />
                  <Route path="/admin/directory/events" element={<RequireRole role="admin"><EventManagement /></RequireRole>} />
                  <Route path="/admin/posts" element={<RequireRole role="admin"><PostManagement /></RequireRole>} />
                  <Route path="/admin/pro-contexts" element={<RequireRole role="admin"><ProContextManagement /></RequireRole>} />
                  <Route path="/admin/logo-testing" element={<RequireRole role="admin"><LogoTesting /></RequireRole>} />
                  <Route path="/admin/tags" element={<RequireRole role="admin"><TagManagement /></RequireRole>} />
                  <Route path="/admin/trail-blazer" element={<RequireRole role="admin"><TrailBlazerManagement /></RequireRole>} />
                  
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
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;