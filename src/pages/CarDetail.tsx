import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Phone, Calendar, Gauge, Fuel, Settings, User, Building, LogIn } from "lucide-react";
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
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, user_type, phone")
          .eq("id", carData.user_id)
          .single();
        if (!profileError) profileData = profile;
      }

      let dealerData = null;
      if (profileData?.user_type === "dealer" && carData.user_id) {
        const { data: dealer, error: dealerError } = await supabase
          .from("dealers")
          .select("business_name, contact_name, phone, email")
          .eq("id", carData.user_id)
          .single();
        if (!dealerError) dealerData = dealer;
      }

      const enrichedListing = {
        ...carData,
        profiles: profileData,
        dealers: dealerData ? [dealerData] : [],
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
    try {
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

  const getListedBy = () => {
    if (!listing) return { type: "unknown", name: "Unknown Seller", phone: null, email: null };

    if (listing.profiles?.user_type === "dealer" && listing.dealers?.[0]) {
      return {
        type: "dealer",
        name: listing.dealers[0].business_name,
        contact: listing.dealers[0].contact_name,
        phone: listing.dealers[0].phone,
        email: listing.dealers[0].email,
      };
    } else if (listing.profiles) {
      const fullName = `${listing.profiles.first_name || ""} ${listing.profiles.last_name || ""}`.trim();
      return {
        type: "user",
        name: fullName || "Private Seller",
        phone: listing.profiles.phone,
        email: null,
      };
    }

    return { type: "unknown", name: "Unknown Seller", phone: null, email: null };
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      toast.error("Please sign in to add to favorites");
      return;
    }
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
        if (error) {
          toast.error("Failed to remove from favorites");
          return;
        }
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: id });
        if (error) {
          toast.error("Failed to add to favorites");
          return;
        }
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
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
      } catch (error: any) {
        if (error.name !== "AbortError") fallbackShare(url, title);
      }
    } else {
      fallbackShare(url, title);
    }
  };

  const fallbackShare = (url: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Link copied to clipboard"),
        () => toast.error("Failed to copy link")
      );
    } else {
      toast.error("Sharing not supported on this device");
    }
  };

  const handleCallSeller = () => {
    if (!user) {
      toast.error("Please sign in to contact the seller");
      return;
    }
    const listedBy = getListedBy();
    if (listedBy.phone) {
      window.open(`tel:${listedBy.phone}`, "_self");
    } else {
      toast.error("Phone number not available");
    }
  };

  const handleScheduleTestDrive = () => {
    if (!user) {
      toast.error("Please sign in to schedule a test drive");
      return;
    }
    const listedBy = getListedBy();
    const subject = `Test Drive Request for ${listing?.year} ${listing?.make} ${listing?.model}`;
    const body = `Hi, I would like to schedule a test drive for your ${listing?.year} ${listing?.make} ${listing?.model}. Please let me know your availability.`;

    if (listedBy.email) {
      window.open(`mailto:${listedBy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
    } else if (listedBy.phone) {
      const message = `Hi, I would like to schedule a test drive for your ${listing?.year} ${listing?.make} ${listing?.model}. Please let me know your availability.`;
      window.open(`https://wa.me/${listedBy.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      toast.error("Contact information not available");
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
  const images: string[] = listing.images || [];
  const currentImage = images[currentImageIndex] || "";

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

            {/* Car Details (unchanged) */}
            {/* ✅ Keep rest of details, tabs, description, etc. */}
          </div>

          {/* Sidebar (unchanged) */}
          {/* ✅ Keep sidebar with seller info and vehicle summary */}
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
