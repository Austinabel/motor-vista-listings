import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, Search, Building2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { SearchFilters } from "./SearchFilters";

export const MobileHero = () => {
  const [activeTab, setActiveTab] = useState<'cars' | 'dealers'>('cars');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-16 pt-24 md:hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 leading-tight">
            Nigeria's Most Trusted Car Marketplace
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Find your perfect car from verified dealers across Nigeria
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-3">
            <Button 
              size="lg" 
              className={`flex-1 ${activeTab === 'cars' ? 'bg-white text-red-600' : 'bg-white/20 text-white border-white'} hover:bg-gray-100 hover:text-red-600`}
              onClick={() => setActiveTab('cars')}
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Cars
            </Button>
            <Button 
              size="lg" 
              className={`flex-1 ${activeTab === 'dealers' ? 'bg-white text-red-600' : 'bg-white/20 text-white border-white'} hover:bg-gray-100 hover:text-red-600`}
              onClick={() => setActiveTab('dealers')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Dealers
            </Button>
          </div>
          <Link to="/sell" className="w-full">
            <Button size="lg" className="w-full bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500">
              <Car className="mr-2 h-4 w-4" />
              Sell Your Car
            </Button>
          </Link>
        </div>

        {/* Minimized Filter Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full text-white"
          >
            <span className="font-medium">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilters && (
            <div className="mt-4">
              <SearchFilters />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};