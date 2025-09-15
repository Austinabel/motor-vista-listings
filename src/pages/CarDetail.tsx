import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Phone, LogIn, Calendar, Gauge, Fuel, Settings, User, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MessageSellerButton from "@/components/MessageSellerButton";

const CarDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
      if (user) {
        checkIfFavorite();
      }
    }
  }, [id, user]);

  const fetchCarDetails = async () => {
    try {
      const { data: carData, error } = await supabase
        .from("car_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setListing(carData);
    } catch (err) {
      console.error("Error fetching car details:", err);
      toast.error("Failed to load car details");
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();

    if (data) setIsFavorite(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading car details...</div>;
  }

  if (!listing) {
    return <div className="min-h-screen flex items-center justify-center">Car not found</div>;
  }

  const images: string[] = listing.images || [];
  const currentImage = images[currentImageIndex] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <img
              src={currentImage}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${listing.year} ${listing.make} ${listing.model} ${index + 1}`}
                    className={`w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 ${
                      index === currentImageIndex ? "ring-2 ring-red-600" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {listing.year} {listing.make} {listing.model}
                  </h1>
                  <p className="text-3xl font-bold text-red-600">₦{parseFloat(listing.price).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Favorites not wired yet")}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>{listing.year}</span>
                </div>
                {listing.mileage && (
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-gray-500" />
                    <span>{listing.mileage}</span>
                  </div>
                )}
                {listing.fuel_type && (
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-gray-500" />
                    <span>{listing.fuel_type}</span>
                  </div>
                )}
                {listing.transmission && (
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span>{listing.transmission}</span>
                  </div>
                )}
              </div>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-gray-600">{listing.description}</p>
                </TabsContent>
                <TabsContent value="features" className="mt-4">
                  {listing.features?.length > 0 ? (
                    <ul className="grid grid-cols-2 gap-2">
                      {listing.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No features listed</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Seller Information</h3>
              {/* simplified for now */}
              <User className="w-8 h-8 text-gray-600" />
              <p className="mt-2">Private Seller</p>
              {user ? (
                <>
                  <MessageSellerButton
                    listingId={listing.id}
                    sellerId={listing.user_id}
                    carTitle={`${listing.year} ${listing.make} ${listing.model}`}
                    sellerName="Seller"
                  />
                  <Button className="w-full bg-red-600 hover:bg-red-700 mt-2">
                    <Phone className="mr-2 h-4 w-4" /> Call Seller
                  </Button>
                </>
              ) : (
                <Button className="w-full" variant="outline">
                  <LogIn className="mr-2 h-4 w-4" /> Sign in to Contact
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
