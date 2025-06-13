
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import CarListings from "./pages/CarListings";
import CarDetail from "./pages/CarDetail";
import DealerProfile from "./pages/DealerProfile";
import Dealers from "./pages/Dealers";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SellYourCar from "./pages/SellYourCar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <div className="pt-24">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cars" element={<CarListings />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/dealer/:id" element={<DealerProfile />} />
            <Route path="/sell" element={<SellYourCar />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
