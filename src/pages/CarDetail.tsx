import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from("car_listings")
        .select("*, profiles(*), dealers(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching car details:", error);
        toast.error("Failed to load car details");
        return;
      }

      setListing(data);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
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
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", id);

      if (!error) {
        setIsFavorite(false);
        toast.success("Removed from favorites");
      }
    } else {
      const { error } = await supabase.from("favorites").insert([
        {
          user_id: user.id,
          listing_id: id,
        },
      ]);

      if (!error) {
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading car details...</div>;
  }

  if (!listing) {
    return <div className="p-6">Car not found</div>;
  }

  const images = listing.images || [];
  const currentImage = images[currentImageIndex];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
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
              {images.map((image: string, index: number) => (
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

        {/* Car Info */}
        <h1 className="text-3xl font-bold mb-2">
          {listing.year} {listing.make} {listing.model}
        </h1>
        <p className="text-xl text-red-600 font-semibold mb-4">
          ₦{listing.price?.toLocaleString()}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="text-lg font-semibold mb-3">Car Details</h2>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span>{listing.condition}</span>
                  </div>
                  {listing.mileage && (
                    <div className="flex justify-between">
                      <span>Mileage:</span>
                      <span>{listing.mileage} km</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Fuel Type:</span>
                    <span>{listing.fuel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transmission:</span>
                    <span>{listing.transmission}</span>
                  </div>
                  {listing.color && (
                    <div className="flex justify-between">
                      <span>Color:</span>
                      <span>{listing.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{listing.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div>
            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {listing.features && listing.features.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-4 space-y-3">
                  <h2 className="text-lg font-semibold mb-3">Features</h2>
                  <ul className="list-disc list-inside text-gray-700 grid grid-cols-2 gap-2">
                    {listing.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={toggleFavorite} variant="outline">
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
