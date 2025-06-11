
import { Button } from "@/components/ui/button";
import { Car, Search } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-32 pt-40 overflow-hidden">
      {/* Animated background boxes */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-lg animate-pulse"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-white/5 rounded-lg animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-white/5 rounded-lg animate-bounce" style={{ animationDelay: '2.5s' }}></div>
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
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Browse Cars
              </Button>
              <Button size="lg" className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500">
                <Car className="mr-2 h-5 w-5" />
                Sell Your Car
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img 
              src="/lovable-uploads/8ed7331e-9e69-40c7-956c-21e5c5e7050a.png" 
              alt="Car showcase" 
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
