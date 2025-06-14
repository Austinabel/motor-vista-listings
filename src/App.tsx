
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";
  const isAdminAuthPage = location.pathname === "/admin/login" || location.pathname === "/admin/register";

  return (
    <>
      {!isAuthPage && !isAdminAuthPage && <Navigation />}
      <div className={isHomepage || isAuthPage || isAdminAuthPage ? "" : "pt-24"}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cars" element={<CarListings />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/dealer/:id" element={<DealerProfile />} />
          <Route path="/dealer-registration" element={<DealerRegistration />} />
          <Route path="/buy-from-abroad" element={<BuyFromAbroad />} />
          <Route path="/sell" element={<SellYourCar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/favorites" element={<Favorites />} />
          <Route path="/profile/messages" element={<Messages />} />
          <Route path="/profile/boost-sales" element={<BoostSales />} />
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
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
