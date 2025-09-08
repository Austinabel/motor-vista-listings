import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Car, 
  Home, 
  Smartphone, 
  Monitor, 
  Sofa, 
  Sparkles, 
  Shirt, 
  Gamepad2, 
  FileText, 
  Wrench, 
  Briefcase, 
  Baby, 
  PawPrint, 
  Wheat, 
  HardHat, 
  Construction,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  { id: 'post', name: 'Post ad', icon: Plus, color: 'bg-red-500', link: '/sell' },
  { id: 'verified-dealers', name: 'Verified Dealers', icon: TrendingUp, color: 'bg-red-600', link: '/dealers' },
  { id: 'brand-new', name: 'Brand New', icon: Car, color: 'bg-red-400', link: '/cars?type=brand-new' },
  { id: 'foreign-used', name: 'Foreign Used', icon: Car, color: 'bg-red-500', link: '/cars?type=foreign-used' },
  { id: 'local-used', name: 'Local Used', icon: Car, color: 'bg-red-600', link: '/cars?type=local-used' },
  { id: 'electric-cars', name: 'Electric Cars', icon: Car, color: 'bg-red-400', link: '/cars?category=electric' },
  { id: 'tricycles', name: 'Tricycles', icon: Car, color: 'bg-red-500', link: '/cars?category=tricycles' },
  { id: 'trucks', name: 'Trucks', icon: Car, color: 'bg-red-600', link: '/cars?category=trucks' },
  { id: 'motorbikes', name: 'Motorbikes', icon: Car, color: 'bg-red-400', link: '/cars?category=motorbikes' },
  { id: 'buses', name: 'Buses', icon: Car, color: 'bg-red-500', link: '/cars?category=buses' },
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
      {/* Red Header */}
      <section className="bg-red-500 text-white py-8 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-4">
              What are you looking for?
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="bg-white text-gray-700 px-4 py-3 rounded-l-lg flex items-center gap-2 h-12 whitespace-nowrap"
              >
                {location}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute top-full left-0 bg-white border rounded-lg shadow-lg z-10 w-48 mt-1">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setLocation(loc);
                        setShowLocationDropdown(false);
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative flex-1">
              <Input
                placeholder="I am looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pr-12 rounded-l-none border-l-0"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={category.link}
                  className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`${category.color} p-3 rounded-lg mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium leading-tight">
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