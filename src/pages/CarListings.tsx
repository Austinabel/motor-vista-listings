
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Eye, Filter } from "lucide-react";

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
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
];

const CarListings = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Car Listings</h1>
            <p className="text-gray-600">{cars.length} cars found</p>
          </div>
          <Button onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="priceRange">Price Range</Label>
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
                  <Label htmlFor="location">Location</Label>
                  <Input placeholder="Location" />
                </div>
                <Button className="w-full">Apply Filters</Button>
              </div>
            </Card>
          </div>

          {/* Car Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={car.image} alt={car.title} className="w-full h-48 object-cover" />
                    <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                      <Heart className="h-4 w-4" />
                    </Button>
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
                    <Button className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarListings;
