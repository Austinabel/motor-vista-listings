
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings } from "lucide-react";

const CarDetail = () => {
  const car = {
    id: 1,
    title: "2020 Toyota Camry LE",
    price: "₦15,500,000",
    location: "Lagos, Nigeria",
    mileage: "45,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2020,
    color: "Silver",
    engine: "2.5L 4-Cylinder",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=500&fit=crop",
    ],
    dealer: {
      name: "Premium Auto Lagos",
      rating: 4.8,
      location: "Victoria Island, Lagos",
      phone: "+234 808 123 4567",
      email: "info@premiumauto.ng",
    },
    features: [
      "Air Conditioning",
      "Power Steering",
      "Electric Windows",
      "Central Locking",
      "Alloy Wheels",
      "Bluetooth",
      "Backup Camera",
      "Keyless Entry",
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <img 
                src={car.images[0]} 
                alt={car.title} 
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              <div className="grid grid-cols-3 gap-2">
                {car.images.slice(1).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${car.title} ${index + 2}`}
                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>

            {/* Car Details */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{car.title}</h1>
                    <p className="text-3xl font-bold text-red-600">{car.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-gray-500" />
                    <span>{car.mileage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-gray-500" />
                    <span>{car.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span>{car.transmission}</span>
                  </div>
                </div>

                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="features" className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="description" className="mt-4">
                    <p className="text-gray-600">
                      This well-maintained 2020 Toyota Camry LE offers exceptional reliability and comfort. 
                      With only 45,000 km on the odometer, this vehicle has been carefully maintained and 
                      is ready for its next owner. Perfect for both city driving and long trips.
                    </p>
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <p className="text-gray-600">
                      Single owner vehicle with complete service records. No accidents reported. 
                      All maintenance performed at authorized Toyota service centers.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Contact Dealer</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{car.dealer.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{car.dealer.location}</span>
                    </div>
                    <div className="text-sm text-yellow-600">
                      ⭐ {car.dealer.rating} rating
                    </div>
                  </div>
                  
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Dealer
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Schedule Test Drive
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Vehicle Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Make:</span>
                    <span>Toyota</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span>Camry LE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Year:</span>
                    <span>{car.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color:</span>
                    <span>{car.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engine:</span>
                    <span>{car.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{car.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
