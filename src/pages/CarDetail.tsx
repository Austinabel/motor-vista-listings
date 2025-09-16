import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Palette,
} from "lucide-react";

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
      console.log("Fetching car details for ID:", id);

      const { data: carData, error: carError } = await supabase
        .from("car_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (carError) {
        console.error("Error fetching car details:", carError);
        toast.error("Failed to load car details");
        return;
      }

      setListing(carData);
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

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      toast.error("You must be logged in to add favorites");
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);

        if (error) throw error;

        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase.from("favorites").insert([
          {
            user_id: user.id,
            listing_id: id,
          },
        ]);

        if (error) throw error;

        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const getListedBy = () => {
    if (listing.dealers && listing.dealers.length > 0) {
      return listing.dealers[0];
    }
    if (listing.profiles && listing.profiles.length > 0) {
      return listing.profiles[0];
    }
    return null;
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

  const listedBy = getListedBy();
  const images: string[] = listing.images || [];
  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              {currentImage && (
                <img
                  src={currentImage}
                  alt={`${listing.year} ${listing.make} ${listing.model}`}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
              )}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${listing.year} ${listing.make} ${listing.model} ${index + 1}`}
                      className={`w-28 h-20 object-cover rounded cursor-pointer hover:opacity-80 flex-shrink-0 ${
                        index === currentImageIndex ? "ring-2 ring-red-600" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Car Details */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                  {listing.year} {listing.make} {listing.model}
                </h1>
                <p className="text-3xl font-semibold text-red-600 mb-6">
                  ₦{listing.price?.toLocaleString()}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{listing.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-gray-500" />
                    <span>{listing.mileage} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-gray-500" />
                    <span>{listing.fuel_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cog className="h-5 w-5 text-gray-500" />
                    <span>{listing.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-gray-500" />
                    <span>{listing.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>{listing.location}</span>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Seller Information</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAddToFavorites}
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        isFavorite ? "fill-red-600 text-red-600" : "text-gray-500"
                      }`}
                    />
                  </Button>
                </div>
                {listedBy ? (
                  <div>
                    <p className="font-medium">{listedBy.name}</p>
                    <p className="text-gray-600">{listedBy.email}</p>
                    <p className="text-gray-600">{listedBy.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No seller info available</p>
                )}
                <Button
                  className="w-full mt-4"
                  onClick={handleShare}
                  variant="outline"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
