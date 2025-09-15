import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  User,
  Building,
  LogIn,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MessageSellerButton from "@/components/MessageSellerButton";

const CarDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
      if (user) checkIfFavorite();
    }
  }, [id, user]);

  const fetchCarDetails = async () => {
    try {
      console.log("Fetching car details for ID:", id);

      // Fetch car details
      const { data: carData, error: carError } = await supabase
        .from("car_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (carError || !carData) {
        console.error("Error fetching car details:", carError);
        toast.error("Car not found");
        return;
      }

      // Fetch related images
      const { data: images, error: imagesError } = await supabase
        .from("car_listing_images")
        .select("*")
        .eq("listing_id", id)
        .order("is_primary", { ascending: false });

      if (imagesError) {
        console.error("Error fetching images:", imagesError);
      }

      // Enrich with public URLs
      const enrichedImages =
        images?.map((img) => {
          if (!img?.image_url) return img;

          if (img.image_url.startsWith("http")) {
            return { ...img, public_url: img.image_url };
          }

          const { data } = supabase.storage
            .from("car-listing-images")
            .getPublicUrl(img.image_url);

          return {
            ...img,
            public_url:
              data?.publicUrl ||
              "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop",
          };
        }) || [];

      // Final enriched listing
      const enrichedListing = {
        ...carData,
        car_listing_images: enrichedImages,
      };

      setListing(enrichedListing);
    } catch (error) {
      console.error("Error in fetchCarDetails:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .single();

      if (!error && data) setIsFavorite(true);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading car details...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Car not found</div>
      </div>
    );
  }

  const images = listing.car_listing_images || [];
  const currentImage = images[currentImageIndex] || {};
  const displayImage =
    currentImage.public_url ||
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <img
                src={displayImage}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image.public_url}
                      alt={`${listing.year} ${listing.make} ${listing.model} ${
                        index + 1
                      }`}
                      className={`w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 ${
                        index === currentImageIndex ? "ring-2 ring-red-600" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {listing.year} {listing.make} {listing.model}
                    </h1>
                    <p className="text-3xl font-bold text-red-600">
                      ₦{parseFloat(listing.price).toLocaleString()}
                    </p>
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

                {/* Tabs */}
                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="features" className="mt-4">
                    {listing.features && listing.features.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {listing.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No features listed</p>
                    )}
                  </TabsContent>

                  <TabsContent value="description" className="mt-4">
                    <p className="text-gray-600">{listing.description}</p>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Condition:</span>
                        <p>{listing.condition}</p>
                      </div>
                      {listing.color && (
                        <div>
                          <span className="font-medium">Color:</span>
                          <p>{listing.color}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Location:</span>
                        <p>{listing.location}</p>
                      </div>
                      <div>
                        <span className="font-medium">Listed:</span>
                        <p>
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
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
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-8 h-8 text-gray-600" />
                    <div>
                      <h4 className="font-semibold">Private Seller</h4>
                      <div className="flex items-center gap-1 text-sm">
                        <Badge variant="outline" className="text-xs">
                          Unverified
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {user ? (
                    <>
                      <MessageSellerButton
                        listingId={listing.id}
                        sellerId={listing.user_id || ""}
                        carTitle={`${listing.year} ${listing.make} ${listing.model}`}
                        sellerName={"Seller"}
                      />

                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Seller
                      </Button>

                      <Button variant="outline" className="w-full">
                        Schedule Test Drive
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          toast.error("Please sign in to contact the seller")
                        }
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in to Contact
                      </Button>
                      <p className="text-xs text-gray-600 text-center">
                        Contact details available after sign in
                      </p>
                    </div>
                  )}
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
