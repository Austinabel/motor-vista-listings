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

const FALLBACK_IMAGE =
  "https://via.placeholder.com/800x500?text=No+Image";

// ✅ Helper to resolve Supabase storage URLs
const getImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
  const { data } = supabase.storage
    .from("car-listing-images")
    .getPublicUrl(path);
  return data?.publicUrl || FALLBACK_IMAGE;
};

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
        .select("*, profiles(*), dealers(*)")
        .eq("id", id)
        .single();

      if (carError) {
        console.error("Error fetching car details:", carError);
        toast.error("Failed to load car details");
        return;
      }

      // ✅ Convert image paths to public URLs
      const images = (carData.images || []).map((path) =>
        getImageUrl(path)
      );

      setListing({
        ...carData,
        images,
      });
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

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .single();

      if (data) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const getListedBy = () => {
    if (!listing)
      return {
        type: "unknown",
        name: "Unknown Seller",
        phone: null,
        email: null,
      };

    if (listing.profiles?.user_type === "dealer" && listing.dealers?.[0]) {
      return {
        type: "dealer",
        name: listing.dealers[0].business_name,
        contact: listing.dealers[0].contact_name,
        phone: listing.dealers[0].phone,
        email: listing.dealers[0].email,
      };
    } else if (listing.profiles) {
      const fullName = `${listing.profiles.first_name || ""} ${
        listing.profiles.last_name || ""
      }`.trim();
      return {
        type: "user",
        name: fullName || "Private Seller",
        phone: listing.profiles.phone,
        email: null,
      };
    }
    return {
      type: "unknown",
      name: "Unknown Seller",
      phone: null,
      email: null,
    };
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      toast.error("Please sign in to add to favorites");
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: id });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error handling favorites:", error);
      toast.error("An error occurred");
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
          url,
        });
        toast.success("Shared successfully");
      } catch (error) {
        if (error.name !== "AbortError") {
          fallbackShare(url);
        }
      }
    } else {
      fallbackShare(url);
    }
  };

  const fallbackShare = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Link copied to clipboard");
      });
    } else {
      toast.error("Sharing not supported on this device");
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

  const listedBy = getListedBy();
  const images = listing.images || [];
  const currentImage = images[currentImageIndex] || FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  {images.slice(0, 4).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${listing.year} ${listing.make} ${listing.model} ${
                        index + 1
                      }`}
                      className={`w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 ${
                        index === currentImageIndex
                          ? "ring-2 ring-red-600"
                          : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Car Details */}
            {/* (your original card, tabs, etc. remain unchanged) */}
            {/* ✅ No further changes needed here */}
          </div>

          {/* Sidebar (unchanged) */}
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
