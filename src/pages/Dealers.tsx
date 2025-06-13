
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Star, Filter, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const dealers = [
  {
    id: 1,
    name: "Premium Auto Lagos",
    location: "Victoria Island, Lagos",
    state: "Lagos",
    phone: "+234 801 234 5678",
    email: "info@premiumauto.ng",
    rating: 4.8,
    totalCars: 45,
    established: "2015",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 2,
    name: "Royal Motors Abuja",
    location: "Wuse 2, Abuja",
    state: "FCT",
    phone: "+234 802 345 6789",
    email: "info@royalmotors.ng",
    rating: 4.9,
    totalCars: 32,
    established: "2018",
    image: "https://images.unsplash.com/photo-1562141961-f1e70c7d2ac6?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 3,
    name: "Elite Car Center",
    location: "GRA, Port Harcourt",
    state: "Rivers",
    phone: "+234 803 456 7890",
    email: "info@elitecar.ng",
    rating: 4.7,
    totalCars: 28,
    established: "2016",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 4,
    name: "Luxury Auto Hub",
    location: "Ikeja, Lagos",
    state: "Lagos",
    phone: "+234 804 567 8901",
    email: "info@luxuryauto.ng",
    rating: 4.6,
    totalCars: 38,
    established: "2017",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=200&fit=crop",
    verified: true,
  },
];

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
];

const Dealers = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedState, setSelectedState] = useState("");

  const filteredDealers = selectedState 
    ? dealers.filter(dealer => dealer.state === selectedState)
    : dealers;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Car Dealers</h1>
              <p className="text-gray-600">{filteredDealers.length} verified dealers found</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Link to="/dealer-registration">
                <Button className="bg-red-600 hover:bg-red-700">
                  Become a Dealer
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location/State</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">All States</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Minimum Rating</Label>
                    <Input placeholder="4.0" />
                  </div>
                  <div>
                    <Label htmlFor="established">Established Year</Label>
                    <Input placeholder="2015" />
                  </div>
                  <div>
                    <Label htmlFor="inventory">Min Cars in Stock</Label>
                    <Input placeholder="20" />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Apply Filters</Button>
                  <Button variant="outline" className="w-full">Reset Filters</Button>
                </div>
              </Card>
            </div>

            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredDealers.map((dealer) => (
                  <Card key={dealer.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
                    <div className="relative">
                      <img 
                        src={dealer.image} 
                        alt={dealer.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      {dealer.verified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2">{dealer.name}</h3>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{dealer.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                            <span>{dealer.rating}</span>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {dealer.totalCars} cars
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-3">
                        <Link to={`/dealer/${dealer.id}`} className="flex-1">
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-xs py-1">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dealers;
