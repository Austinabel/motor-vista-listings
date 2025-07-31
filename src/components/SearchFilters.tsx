
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const carMakes = [
  "Acura", "Audi", "Bestune", "BMW", "Brilliance", "Buick", "Cadillac", 
  "Changan", "Chevrolet", "Chrysler", "Daihatsu", "Dodge", "Ford", "GAC", 
  "GMC", "Honda", "Hyundai", "Infiniti", "IVM", "Jeep", "Kia", "Land Rover", 
  "Lexus", "Lincoln", "Mazda", "Mercedes‑Benz", "Mini", "Mitsubishi", 
  "Nissan", "Opel", "Peugeot", "Pontiac", "Porsche", "Renault", "Rover", 
  "Saturn", "Scion", "Subaru", "Suzuki", "Toyota", "Volkswagen", "Volvo"
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const quickCategories = [
  { id: "brand-new", name: "Brand New", icon: "✨" },
  { id: "foreign-used", name: "Foreign Used", icon: "🌍" },
  { id: "toyota", name: "Toyota", icon: "🚗" },
  { id: "honda", name: "Honda", icon: "🚗" },
  { id: "mercedes-benz", name: "Mercedes", icon: "🚗" },
  { id: "electric-cars", name: "Electric", icon: "⚡" },
];

export const SearchFilters = () => {
  const [searchForm, setSearchForm] = useState({
    make: "",
    model: "",
    priceRange: "",
    location: "",
    condition: ""
  });
  const navigate = useNavigate();

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    navigate(`/cars?${searchParams.toString()}`);
  };

  const handleQuickCategory = (categoryId) => {
    navigate(`/cars?categories=${categoryId}`);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">Find Your Perfect Car</h2>
          
          {/* Quick Category Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-600">Quick Categories</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  className="rounded-full flex items-center gap-1"
                  onClick={() => handleQuickCategory(category.id)}
                >
                  <span className="text-xs">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <select 
                id="make" 
                className="w-full p-2 border rounded-md"
                value={searchForm.make}
                onChange={(e) => setSearchForm({...searchForm, make: e.target.value})}
              >
                <option value="">Select make</option>
                {carMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input 
                id="model" 
                placeholder="Select model" 
                value={searchForm.model}
                onChange={(e) => setSearchForm({...searchForm, model: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <select 
                id="condition" 
                className="w-full p-2 border rounded-md"
                value={searchForm.condition}
                onChange={(e) => setSearchForm({...searchForm, condition: e.target.value})}
              >
                <option value="">Any condition</option>
                <option value="brand_new">Brand New</option>
                <option value="foreign_used">Foreign Used</option>
                <option value="local_used">Local Used</option>
              </select>
            </div>
            <div>
              <Label htmlFor="price">Price Range</Label>
              <select 
                id="price" 
                className="w-full p-2 border rounded-md"
                value={searchForm.priceRange}
                onChange={(e) => setSearchForm({...searchForm, priceRange: e.target.value})}
              >
                <option value="">Any price</option>
                <option value="0-5000000">Under ₦5M</option>
                <option value="5000000-15000000">₦5M - ₦15M</option>
                <option value="15000000-30000000">₦15M - ₦30M</option>
                <option value="30000000+">Above ₦30M</option>
              </select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select 
                  id="location" 
                  className="w-full p-2 pl-10 border rounded-md"
                  value={searchForm.location}
                  onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                >
                  <option value="">All States</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
