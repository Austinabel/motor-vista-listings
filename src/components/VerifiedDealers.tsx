
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, MapPin, Star } from "lucide-react";

const allDealers = [
  {
    id: 1,
    name: "Premium Auto Lagos",
    location: "Victoria Island, Lagos",
    rating: 4.8,
    totalCars: 45,
    verified: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    specialization: "Luxury Cars"
  },
  {
    id: 2,
    name: "Capital Motors Abuja",
    location: "Maitama, Abuja",
    rating: 4.7,
    totalCars: 32,
    verified: true,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
    specialization: "Foreign Used"
  },
  {
    id: 3,
    name: "Elite Car Gallery",
    location: "GRA, Port Harcourt",
    rating: 4.9,
    totalCars: 28,
    verified: true,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
    specialization: "SUVs & Trucks"
  },
  {
    id: 4,
    name: "Royal Auto Collection",
    location: "Ikeja, Lagos",
    rating: 4.6,
    totalCars: 38,
    verified: true,
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
    specialization: "Sports Cars"
  },
  {
    id: 5,
    name: "Metro Car Hub",
    location: "Wuse, Abuja",
    rating: 4.5,
    totalCars: 55,
    verified: true,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
    specialization: "Family Cars"
  },
  {
    id: 6,
    name: "Prestige Motors",
    location: "Lekki, Lagos",
    rating: 4.8,
    totalCars: 42,
    verified: true,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
    specialization: "Brand New"
  },
  {
    id: 7,
    name: "Executive Auto",
    location: "Garki, Abuja",
    rating: 4.7,
    totalCars: 35,
    verified: true,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
    specialization: "Executive Cars"
  },
  {
    id: 8,
    name: "Grand Motors",
    location: "Old GRA, Port Harcourt",
    rating: 4.6,
    totalCars: 29,
    verified: true,
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
    specialization: "Commercial Vehicles"
  },
  {
    id: 9,
    name: "First Class Auto",
    location: "Victoria Island, Lagos",
    rating: 4.9,
    totalCars: 48,
    verified: true,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
    specialization: "Exotic Cars"
  },
  {
    id: 10,
    name: "Sterling Motors",
    location: "Asokoro, Abuja",
    rating: 4.4,
    totalCars: 33,
    verified: true,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
    specialization: "Hybrid & Electric"
  },
  {
    id: 11,
    name: "Luxury Auto Mall",
    location: "Surulere, Lagos",
    rating: 4.7,
    totalCars: 41,
    verified: true,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
    specialization: "Luxury & Premium"
  },
  {
    id: 12,
    name: "Crown Motors",
    location: "Gwarinpa, Abuja",
    rating: 4.5,
    totalCars: 36,
    verified: true,
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
    specialization: "Affordable Cars"
  }
];

export const VerifiedDealers = () => {
  const [visibleRows, setVisibleRows] = useState(3);
  const dealersPerRow = 4;
  const totalDealersPerPage = visibleRows * dealersPerRow;
  const maxRows = 6;

  const displayedDealers = allDealers.slice(0, totalDealersPerPage);
  const canLoadMore = visibleRows < maxRows;
  const isViewListings = visibleRows >= maxRows;

  const handleLoadMore = () => {
    if (canLoadMore) {
      setVisibleRows(prev => prev + 3);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Verified Dealers</h2>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            View All Dealers
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedDealers.map((dealer) => (
            <Card key={dealer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={dealer.image} alt={dealer.name} className="w-full h-48 object-cover" />
                <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{dealer.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {dealer.location}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{dealer.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{dealer.totalCars} cars</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {dealer.specialization}
                </Badge>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Dealer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <Button 
            onClick={handleLoadMore}
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3"
            disabled={!canLoadMore && !isViewListings}
          >
            {isViewListings ? 'View All Dealers' : 'Load More'}
          </Button>
        </div>
      </div>
    </section>
  );
};
