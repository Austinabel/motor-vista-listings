
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Eye, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cars = [
  {
    id: 1,
    title: "2020 Toyota Camry LE",
    price: "₦15,500,000",
    location: "Lagos, Nigeria",
    mileage: "45,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2020,
    type: "brand-new",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "2019 Honda Accord Sport",
    price: "₦13,200,000",
    location: "Abuja, Nigeria",
    mileage: "52,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2019,
    type: "foreign-used",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "2021 Mercedes C-Class",
    price: "₦28,900,000",
    location: "Port Harcourt, Nigeria",
    mileage: "28,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2021,
    type: "brand-new",
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    title: "2018 BMW 3 Series",
    price: "₦18,750,000",
    location: "Lagos, Nigeria",
    mileage: "68,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2018,
    type: "local-used",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    title: "2022 Toyota Corolla",
    price: "₦12,500,000",
    location: "Kano, Nigeria",
    mileage: "15,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2022,
    type: "foreign-used",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    title: "2017 Hyundai Elantra",
    price: "₦8,200,000",
    location: "Ibadan, Nigeria",
    mileage: "85,000 km",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2017,
    type: "local-used",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
];

const popularBrands = [
  "Toyota", "Honda", "Mercedes", "BMW", "Hyundai", "Nissan", "Lexus", "Volkswagen"
];

const CarListings = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("");

  const filterCarsByType = (type: string) => {
    if (type === "all") return cars;
    return cars.filter(car => car.type === type);
  };

  const filteredCars = filterCarsByType(selectedTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Car Listings</h1>
            <p className="text-gray-600">{filteredCars.length} cars found</p>
          </div>
          <Button onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Car Type Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Listings</TabsTrigger>
            <TabsTrigger value="brand-new">Brand New</TabsTrigger>
            <TabsTrigger value="foreign-used">Foreign Used</TabsTrigger>
            <TabsTrigger value="local-used">Local Used</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Popular Brands */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Popular Brands</h3>
          <div className="flex flex-wrap gap-3">
            {popularBrands.map((brand) => (
              <Button
                key={brand}
                variant={selectedBrand === brand ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedBrand(selectedBrand === brand ? "" : brand)}
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="priceRange">Price Range (₦)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" />
                    <Input placeholder="Max" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input placeholder="Select make" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input placeholder="Select model" />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <div className="flex gap-2">
                    <Input placeholder="From" />
                    <Input placeholder="To" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" />
                    <Input placeholder="Max" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Input placeholder="Any" />
                </div>
                <div>
                  <Label htmlFor="fuel">Fuel Type</Label>
                  <Input placeholder="Any" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input placeholder="Location" />
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Input placeholder="Any condition" />
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">Apply Filters</Button>
                <Button variant="outline" className="w-full">Reset Filters</Button>
              </div>
            </Card>
          </div>

          {/* Car Grid */}
          <div className="lg:w-3/4">
            <TabsContent value={selectedTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img src={car.image} alt={car.title} className="w-full h-48 object-cover" />
                      <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                          {car.type === "brand-new" ? "Brand New" : 
                           car.type === "foreign-used" ? "Foreign Used" : "Local Used"}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{car.title}</h3>
                      <p className="text-2xl font-bold text-red-600 mb-2">{car.price}</p>
                      <p className="text-sm text-gray-600 mb-4">{car.location}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span>{car.mileage}</span>
                        <span>{car.fuel}</span>
                        <span>{car.transmission}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarListings;
