import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings, User, Building, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MessageSellerButton from "@/components/MessageSellerButton";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

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
      if (user) {
        checkIfFavorite();
      }
    }
  }, [id, user]);

  const fetchCarDetails = async () => {
    try {
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

      let profileData = null;
      if (carData.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, user_type, phone")
          .eq("id", carData.user_id)
          .single();
        if (profile) profileData = profile;
      }

      let dealerData = null;
      if (profileData?.user_type === "dealer" && carData.user_id) {
        const { data: dealer } = await supabase
          .from("dealers")
          .select("business_name, contact_name, phone, email")
          .eq("id", carData.user_id)
          .single();
        if (dealer) dealerData = dealer;
      }

      const enrichedListing = {
        ...carData,
        profiles: profileData,
        dealers: dealerData ? [dealerData] : []
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
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .single();
    if (data) setIsFavorite(true);
  };

  const getListedBy = () => {
    if (!listing) return { type: "unknown", name: "Unknown Seller", phone: null, email: null };

    if (listing.profiles?.user_type === "dealer" && listing.dealers?.[0]) {
      return {
        type: "dealer",
        name: listing.dealers[0].business_name,
        contact: listing.dealers[0].contact_name,
        phone: listing.dealers[0].phone,
        email: listing.dealers[0].email
      };
    } else if (listing.profiles) {
      const fullName = `${listing.profiles.first_name || ""} ${listing.profiles.last_name || ""}`.trim();
      return {
        type: "user",
        name: fullName || "Private Seller",
        phone: listing.profiles.phone,
        email: null
      };
    }
    return {
      type: "unknown",
      name: "Unknown Seller",
      phone: null,
      email: null
    };
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      toast.error("Please sign in to add to favorites");
      return;
    }
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${listing?.year} ${listing?.make} ${listing?.model}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this ${title} for ₦${listing?.price?.toLocaleString()}`,
          url
        });
        toast.success("Shared successfully");
      } catch (error) {
        if (error.name !== "AbortError") fallbackShare(url);
      }
    } else {
      fallbackShare(url);
    }
  };

  const fallbackShare = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading car details...</div>;
  }
  if (!listing) {
    return <div className="min-h-screen flex items-center justify-center">Car not found</div>;
  }

  const listedBy = getListedBy();
  const images: string[] = listing.images || [];
  const currentImage = images[currentImageIndex] || FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* ✅ Image Gallery */}
            <div className="mb-8">
              <img
                src={currentImage}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image || FALLBACK_IMAGE}
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddToFavorites}
                      className={isFavorite ? "text-red-600 border-red-600" : ""}
                      disabled={!user}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* ... keep rest of your details/tabs/summary/seller info exactly same ... */}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — left untouched */}
          <div>
            {/* Seller Info + Vehicle Summary (same as your original) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
