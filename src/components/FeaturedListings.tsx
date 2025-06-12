
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";

const featuredCars = [
  {
    id: 1,
    title: "2020 Toyota Camry LE",
    price: "₦15,500,000",
    location: "Lagos, Nigeria",
    mileage: "45,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
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
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
  },
];

export const FeaturedListings = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-white">Featured Listings</h2>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCars.map((car) => (
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
    </section>
  );
};
