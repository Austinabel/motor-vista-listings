import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Car, 
  Truck, 
  Zap, 
  Bike,
  Bus,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroBgPattern from "@/assets/hero-bg-pattern.jpg";

const categories = [
  { id: 'post', name: 'Post ad', icon: Plus, color: 'bg-red-500', link: '/sell' },
  { id: 'verified-dealers', name: 'Verified Dealers', icon: TrendingUp, color: 'bg-red-600', link: '/dealers' },
  { id: 'brand-new', name: 'Brand New', icon: Car, color: 'bg-red-400', link: '/cars?type=brand-new' },
  { id: 'foreign-used', name: 'Foreign Used', icon: Car, color: 'bg-red-500', link: '/cars?type=foreign-used' },
  { id: 'local-used', name: 'Local Used', icon: Car, color: 'bg-red-600', link: '/cars?type=local-used' },
  { id: 'electric-cars', name: 'Electric Cars', icon: Zap, color: 'bg-red-400', link: '/cars?category=electric' },
  { id: 'tricycles', name: 'Tricycles', icon: Bike, color: 'bg-red-500', link: '/cars?category=tricycles' },
  { id: 'trucks', name: 'Trucks', icon: Truck, color: 'bg-red-600', link: '/cars?category=trucks' },
  { id: 'motorbikes', name: 'Motorbikes', icon: Bike, color: 'bg-red-400', link: '/cars?category=motorbikes' },
  { id: 'buses', name: 'Buses', icon: Bus, color: 'bg-red-500', link: '/cars?category=buses' },
];

export const MobileHero = () => {
  const [location, setLocation] = useState("All Nigeria");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cars?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const locations = [
    "All Nigeria", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", 
    "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", 
    "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  return (
    <div className="md:hidden bg-white">
      {/* Enhanced Red Header with Background */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-8 pt-20 overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroBgPattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 via-red-700/90 to-red-800/95" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              What are you looking for? 🚗
            </h1>
            <p className="text-red-100 text-sm">
              Nigeria's most trusted car marketplace
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="bg-white/95 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-l-lg flex items-center gap-2 h-12 whitespace-nowrap shadow-lg"
              >
                {location}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute top-full left-0 bg-white border rounded-lg shadow-xl z-20 w-48 mt-1 backdrop-blur-sm bg-white/95">
                  <div className="max-h-48 overflow-y-auto">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        onClick={() => {
                          setLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative flex-1">
              <Input
                placeholder="I am looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pr-12 rounded-l-none border-l-0 bg-white/95 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-white/50"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-1.5 rounded-full transition-colors"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Grid */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={category.link}
                  className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className={`${category.color} p-3 rounded-xl mb-2 shadow-md group-hover:shadow-lg transition-shadow`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium leading-tight group-hover:text-gray-900 transition-colors">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};