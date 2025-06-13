
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
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

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navigation />}
      <div className={isHomepage || isAuthPage ? "" : "pt-24"}>
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
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
