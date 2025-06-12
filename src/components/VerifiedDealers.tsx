
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const dealers = [
  {
    id: 1,
    name: "Premium Auto Lagos",
    location: "Victoria Island, Lagos",
    phone: "+234 801 234 5678",
    rating: 4.8,
    totalCars: 45,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 2,
    name: "Royal Motors Abuja",
    location: "Wuse 2, Abuja",
    phone: "+234 802 345 6789",
    rating: 4.9,
    totalCars: 32,
    image: "https://images.unsplash.com/photo-1562141961-f1e70c7d2ac6?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 3,
    name: "Elite Car Center",
    location: "GRA, Port Harcourt",
    phone: "+234 803 456 7890",
    rating: 4.7,
    totalCars: 28,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 4,
    name: "Luxury Auto Hub",
    location: "Ikeja, Lagos",
    phone: "+234 804 567 8901",
    rating: 4.6,
    totalCars: 38,
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 5,
    name: "Metro Car Sales",
    location: "Surulere, Lagos",
    phone: "+234 805 678 9012",
    rating: 4.5,
    totalCars: 25,
    image: "https://images.unsplash.com/photo-1517524206127-6d22353d8482?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 6,
    name: "Crown Motors",
    location: "Kaduna",
    phone: "+234 806 789 0123",
    rating: 4.8,
    totalCars: 31,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 7,
    name: "Diamond Auto",
    location: "Enugu",
    phone: "+234 807 890 1234",
    rating: 4.7,
    totalCars: 22,
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 8,
    name: "Golden Gate Motors",
    location: "Ilorin",
    phone: "+234 808 901 2345",
    rating: 4.6,
    totalCars: 29,
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop",
    verified: true,
  },
];

export const VerifiedDealers = () => {
  const [visibleDealers, setVisibleDealers] = useState(8);
  const [showLoadMore, setShowLoadMore] = useState(true);

  const handleLoadMore = () => {
    if (visibleDealers >= dealers.length) {
      setShowLoadMore(false);
      return;
    }
    
    const newVisible = Math.min(visibleDealers + 4, dealers.length);
    setVisibleDealers(newVisible);
    
    if (newVisible >= dealers.length) {
      setShowLoadMore(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-red-600 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Verified Dealers</h2>
          <p className="text-white/90 text-lg">Trusted car dealers verified by our team</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealers.slice(0, visibleDealers).map((dealer) => (
            <Card key={dealer.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-4 border-lime-400">
              <div className="relative">
                <img 
                  src={dealer.image} 
                  alt={dealer.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {dealer.verified && (
                  <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{dealer.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{dealer.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{dealer.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      <span>{dealer.rating}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {dealer.totalCars} cars
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                  View Dealer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {showLoadMore && (
          <div className="text-center mt-8">
            <Button 
              onClick={handleLoadMore}
              className="bg-white text-red-600 hover:bg-gray-100 border-2 border-red-600"
            >
              Load More Dealers
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
