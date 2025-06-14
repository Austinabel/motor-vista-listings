
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const carMakes = [
  "Toyota", "Honda", "Mercedes-Benz", "BMW", "Audi", "Lexus", "Nissan", 
  "Hyundai", "Ford", "Volkswagen", "Peugeot", "Kia", "Acura", "Innoson"
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export const SearchFilters = () => {
  const [searchForm, setSearchForm] = useState({
    make: "",
    model: "",
    priceRange: "",
    location: ""
  });
  const navigate = useNavigate();

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    navigate(`/cars?${searchParams.toString()}`);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">Find Your Perfect Car</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
