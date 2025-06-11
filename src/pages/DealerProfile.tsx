
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Star, Eye, Heart } from "lucide-react";

const DealerProfile = () => {
  const dealer = {
    name: "Premium Auto Lagos",
    rating: 4.8,
    reviews: 156,
    location: "Victoria Island, Lagos",
    phone: "+234 808 123 4567",
    email: "info@premiumauto.ng",
    established: "2015",
    description: "We specialize in premium quality used cars with comprehensive warranties and after-sales service.",
    image: "https://images.unsplash.com/photo-1486162928267-e6274cb3106f?w=400&h=250&fit=crop",
  };

  const cars = [
    {
      id: 1,
      title: "2020 Toyota Camry LE",
      price: "₦15,500,000",
      mileage: "45,000 km",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
    },
    {
      id: 2,
      title: "2019 Honda Accord Sport",
      price: "₦13,200,000",
      mileage: "52,000 km",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
    },
    {
      id: 3,
      title: "2021 Mercedes C-Class",
      price: "₦28,900,000",
      mileage: "28,000 km",
      image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Dealer Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={dealer.image} 
                alt={dealer.name}
                className="w-full md:w-48 h-48 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{dealer.name}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{dealer.rating}</span>
                      </div>
                      <span className="text-gray-600">({dealer.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{dealer.location}</span>
                    </div>
                    <p className="text-sm text-gray-600">Established {dealer.established}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600">{dealer.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Cars ({cars.length})</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-sm text-gray-600 mb-4">{car.mileage}</p>
                  <Button className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((review) => (
                <div key={review} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold">Customer {review}</span>
                    <span className="text-sm text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-gray-600">
                    Excellent service and quality cars. The buying process was smooth and professional.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealerProfile;
