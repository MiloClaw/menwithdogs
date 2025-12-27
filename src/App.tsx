import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Places from "./pages/Places";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CoupleProfile from "./pages/CoupleProfile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Invite from "./pages/Invite";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import DiscoverCoupleView from "./pages/DiscoverCoupleView";
import OnboardingEntry from "./pages/onboarding/OnboardingEntry";
import CreateCouple from "./pages/onboarding/CreateCouple";
import MyProfile from "./pages/onboarding/MyProfile";
import InvitePartner from "./pages/onboarding/InvitePartner";
import CoupleProfileEdit from "./pages/onboarding/CoupleProfileEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/places" element={<Places />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/profile/:id" element={<CoupleProfile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          {/* Auth & Onboarding */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/invite/:token" element={<Invite />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/:coupleId" element={<DiscoverCoupleView />} />
          <Route path="/onboarding" element={<OnboardingEntry />} />
          <Route path="/onboarding/create-couple" element={<CreateCouple />} />
          <Route path="/onboarding/my-profile" element={<MyProfile />} />
          <Route path="/onboarding/invite-partner" element={<InvitePartner />} />
          <Route path="/onboarding/couple-profile" element={<CoupleProfileEdit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
