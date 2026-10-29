
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DealerProvider, useDealer } from "@/contexts/DealerContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import Index from "./pages/Index";
import CarListings from "./pages/CarListings";
import CarDetail from "./pages/CarDetail";
import DealerProfile from "./pages/DealerProfile";
import Dealers from "./pages/Dealers";
import DealerRegistration from "./pages/DealerRegistration";
import BuyFromAbroad from "./pages/BuyFromAbroad";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SellYourCar from "./pages/SellYourCar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CarValuation from "./pages/CarValuation";
import Insurance from "./pages/Insurance";
import Financing from "./pages/Financing";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import EditProfile from "./pages/EditProfile";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import BoostSales from "./pages/BoostSales";
import DealerDashboard from "./pages/DealerDashboard";
import AccountSettings from "./pages/AccountSettings";
import Feedback from "./pages/Feedback";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { safeRedirectPath } from "@/lib/redirect";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, lastAuthEvent, clearLastAuthEvent, loading: authLoading } = useAuth();
  const { dealerInfo, loading: dealerLoading } = useDealer();

  useEffect(() => {
    if (authLoading || dealerLoading || !user || isAdmin === null) return;

    const onAuthPage = ['/login', '/register'].includes(location.pathname);
    const onAdminAuthPage = ['/admin/login', '/admin/register'].includes(location.pathname);
    const justSignedIn = lastAuthEvent === 'SIGNED_IN';
    // Where the buyer was before signing in, e.g. a listing (validated to stay on this site)
    const returnTo = safeRedirectPath(new URLSearchParams(location.search).get('redirect'));

    if (justSignedIn) {
      clearLastAuthEvent();

      // Check if user came from admin login and is admin
      if (isAdmin && onAdminAuthPage) {
        navigate('/admin', { replace: true });
        return;
      }

      const userType = user.user_metadata?.user_type;
      if (userType === 'dealer') {
        if (dealerInfo) {
          navigate('/dealer/dashboard', { replace: true });
        } else {
          navigate('/dealer-registration', { replace: true });
        }
      } else {
        // Return regular users to the page they came from, or the homepage
        navigate(returnTo ?? '/', { replace: true });
      }
    } else if (onAuthPage && !onAdminAuthPage) {
      // Already signed in on an auth page: go where they were heading, or the homepage
      navigate(returnTo ?? '/', { replace: true });
    }
  }, [user, isAdmin, lastAuthEvent, authLoading, dealerLoading, dealerInfo, location.pathname, location.search, navigate, clearLastAuthEvent]);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";
  const isAdminPage = location.pathname === "/admin" || location.pathname.startsWith("/admin");

  return (
    <>
      {/* Navigation is sticky and in the page flow, so content needs no top offset */}
      {!isAuthPage && !isAdminPage && <Navigation />}
      <div className={!isAuthPage && !isAdminPage ? "pb-20 lg:pb-0" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cars" element={<CarListings />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/dealer/:id" element={<DealerProfile />} />
          <Route path="/dealer-registration" element={<DealerRegistration />} />
          <Route path="/dealer/dashboard" element={<DealerDashboard />} />
          <Route path="/buy-from-abroad" element={<BuyFromAbroad />} />
          <Route path="/sell" element={<SellYourCar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/favorites" element={<Favorites />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile/boost-sales" element={<BoostSales />} />
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/car-valuation" element={<CarValuation />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/financing" element={<Financing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <MobileBottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MessagingProvider>
            <DealerProvider>
              <AppContent />
            </DealerProvider>
          </MessagingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
