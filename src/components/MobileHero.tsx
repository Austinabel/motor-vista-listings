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
  { id: 'post', name: 'Post ad', icon: Plus, color: 'bg-orange-400', link: '/sell' },
  { id: 'trending', name: 'Trending', icon: TrendingUp, color: 'bg-red-400', link: '/cars' },
  { id: 'vehicles', name: 'Vehicles', icon: Car, color: 'bg-blue-400', link: '/cars' },
  { id: 'property', name: 'Property', icon: Home, color: 'bg-gray-400', link: '/cars' },
  { id: 'phones', name: 'Mobile Phones & Tablets', icon: Smartphone, color: 'bg-purple-400', link: '/cars' },
  { id: 'electronics', name: 'Electronics', icon: Monitor, color: 'bg-blue-300', link: '/cars' },
  { id: 'furniture', name: 'Home, Furniture & Appliances', icon: Sofa, color: 'bg-indigo-400', link: '/cars' },
  { id: 'beauty', name: 'Beauty & Personal Care', icon: Sparkles, color: 'bg-pink-400', link: '/cars' },
  { id: 'fashion', name: 'Fashion', icon: Shirt, color: 'bg-red-300', link: '/cars' },
  { id: 'leisure', name: 'Leisure & Activities', icon: Gamepad2, color: 'bg-gray-300', link: '/cars' },
  { id: 'jobs', name: 'Seeking Work CVs', icon: FileText, color: 'bg-blue-500', link: '/cars' },
  { id: 'services', name: 'Services', icon: Wrench, color: 'bg-yellow-600', link: '/cars' },
  { id: 'employment', name: 'Jobs', icon: Briefcase, color: 'bg-brown-400', link: '/cars' },
  { id: 'babies', name: 'Babies & Kids', icon: Baby, color: 'bg-orange-300', link: '/cars' },
  { id: 'animals', name: 'Animals & Pets', icon: PawPrint, color: 'bg-yellow-700', link: '/cars' },
  { id: 'food', name: 'Food, Agriculture & Farming', icon: Wheat, color: 'bg-green-400', link: '/cars' },
  { id: 'commercial', name: 'Commercial Equipment & Tools', icon: HardHat, color: 'bg-gray-600', link: '/cars' },
  { id: 'construction', name: 'Repair & Construction', icon: Construction, color: 'bg-yellow-500', link: '/cars' },
];

const actionCards = [
  { title: 'Apply for job', bg: 'bg-green-100', icon: Briefcase },
  { title: 'How to sell', bg: 'bg-yellow-100', icon: Plus },
  { title: 'How to buy', bg: 'bg-blue-100', icon: Search },
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
    "All Nigeria", "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", 
    "Kaduna", "Jos", "Warri", "Benin City", "Enugu"
  ];

  return (
    <div className="md:hidden bg-white">
      {/* Green Header */}
      <section className="bg-green-500 text-white py-8 pt-20">
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

      {/* Action Cards */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-3">
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`${card.bg} p-4 rounded-lg text-center`}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {card.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};