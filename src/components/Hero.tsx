
import { Button } from "@/components/ui/button";
import { Car, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Squares from "./Squares";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-32 pt-40 overflow-hidden">
      {/* Animated Squares background */}
      <div className="absolute inset-0">
        <Squares 
          direction="diagonal"
          speed={0.5}
          borderColor="rgba(255, 255, 255, 0.1)"
          squareSize={50}
          hoverFillColor="rgba(255, 255, 255, 0.05)"
          className="opacity-30"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Nigeria's Most Trusted Car Marketplace
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Find your perfect car from verified dealers across Nigeria
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cars">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Cars
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500">
                  <Car className="mr-2 h-5 w-5" />
                  Sell Your Car
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img 
              src="/lovable-uploads/dcc60f45-82ad-459b-8fb0-d1cd9fc186ea.png" 
              alt="Car showcase" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
