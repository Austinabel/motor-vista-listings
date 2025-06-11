
import { Button } from "@/components/ui/button";
import { Car, Search } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
      <div className="container mx-auto px-4">
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
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
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
