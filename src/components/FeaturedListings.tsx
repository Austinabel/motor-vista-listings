import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";

const allCars = [
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
  {
    id: 4,
    title: "2018 BMW X5",
    price: "₦22,500,000",
    location: "Lagos, Nigeria",
    mileage: "65,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    title: "2019 Audi A4",
    price: "₦18,700,000",
    location: "Abuja, Nigeria",
    mileage: "38,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    title: "2020 Lexus RX 350",
    price: "₦32,000,000",
    location: "Lagos, Nigeria",
    mileage: "25,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 7,
    title: "2018 Ford Explorer",
    price: "₦14,500,000",
    location: "Port Harcourt, Nigeria",
    mileage: "78,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
  },
  {
    id: 8,
    title: "2019 Nissan Altima",
    price: "₦11,800,000",
    location: "Abuja, Nigeria",
    mileage: "45,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: 9,
    title: "2020 Hyundai Sonata",
    price: "₦12,900,000",
    location: "Lagos, Nigeria",
    mileage: "32,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 10,
    title: "2018 Volkswagen Passat",
    price: "₦13,500,000",
    location: "Port Harcourt, Nigeria",
    mileage: "56,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 11,
    title: "2019 Kia Optima",
    price: "₦10,500,000",
    location: "Abuja, Nigeria",
    mileage: "48,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
  },
  {
    id: 12,
    title: "2020 Peugeot 508",
    price: "₦16,200,000",
    location: "Lagos, Nigeria",
    mileage: "22,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: 13,
    title: "2018 Mazda CX-5",
    price: "₦17,800,000",
    location: "Port Harcourt, Nigeria",
    mileage: "62,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 14,
    title: "2019 Subaru Outback",
    price: "₦19,300,000",
    location: "Abuja, Nigeria",
    mileage: "35,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 15,
    title: "2020 Infiniti Q50",
    price: "₦21,700,000",
    location: "Lagos, Nigeria",
    mileage: "28,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
  },
  {
    id: 16,
    title: "2018 Acura TLX",
    price: "₦18,900,000",
    location: "Port Harcourt, Nigeria",
    mileage: "55,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: 17,
    title: "2019 Cadillac XT5",
    price: "₦24,500,000",
    location: "Abuja, Nigeria",
    mileage: "42,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 18,
    title: "2020 Lincoln MKZ",
    price: "₦20,800,000",
    location: "Lagos, Nigeria",
    mileage: "30,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
];

export const FeaturedListings = () => {
  const [visibleRows, setVisibleRows] = useState(3);
  const carsPerRow = 6;
  const totalCarsPerPage = visibleRows * carsPerRow;
  const maxRows = 6;

  const displayedCars = allCars.slice(0, totalCarsPerPage);
  const canLoadMore = visibleRows < maxRows;
  const isViewListings = visibleRows >= maxRows;

  const handleLoadMore = () => {
    if (canLoadMore) {
      setVisibleRows(prev => prev + 3);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-white">Featured Listings</h2>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">View All</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayedCars.map((car) => (
            <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={car.image} alt={car.title} className="w-full h-32 object-cover" />
                <Button size="sm" variant="secondary" className="absolute top-1 right-1 p-1">
                  <Heart className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-3">
                <h3 className="font-bold text-sm mb-2 truncate">{car.title}</h3>
                <p className="text-lg font-bold text-red-600 mb-1">{car.price}</p>
                <p className="text-xs text-gray-600 mb-2 truncate">{car.location}</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <span className="truncate">{car.mileage}</span>
                  <span className="truncate">{car.fuel} • {car.transmission}</span>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Button className="w-full text-xs py-1">
                  <Eye className="mr-1 h-3 w-3" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Load More / View Listings Button */}
        <div className="flex justify-center mt-12">
          <Button 
            onClick={handleLoadMore}
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-3"
            disabled={!canLoadMore && !isViewListings}
          >
            {isViewListings ? 'View All Listings' : 'Load More'}
          </Button>
        </div>
      </div>
    </section>
  );
};
