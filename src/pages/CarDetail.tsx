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

const CarDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper function to resolve correct image URL
  const getImageUrl = (path) => {
    if (!path) {
      return "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";
    }
    if (path.startsWith("http")) {
      return path;
    }
    const { data } = supabase.storage
      .from("car-listing-images")
      .getPublicUrl(path);

    return (
      data?.publicUrl ||
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop"
    );
  };

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

      // Fetch the car listing
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

      console.log("Car data:", carData);

      // Fetch images separately
      const { data: images, error: imagesError } = await supabase
        .from("car_listing_images")
        .select("*")
        .eq("listing_id", id)
        .order("is_primary", { ascending: false });

      if (imagesError) {
        console.error("Error fetching images:", imagesError);
      }

      console.log("Images:", images);

      // Fetch user profile
      let profileData = null;
      if (carData.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, user_type, phone")
          .eq("id", carData.user_id)
          .single();

        if (!profileError) {
          profileData = profile;
        }
      }

      // Fetch dealer info
      let dealerData = null;
      if (profileData?.user_type === "dealer" && carData.user_id) {
        const { data: dealer, error: dealerError } = await supabase
          .from("dealers")
          .select("business_name, contact_name, phone, email")
          .eq("id", carData.user_id)
          .single();

        if (!dealerError) {
          dealerData = dealer;
        }
      }

      // Combine all the data
      const enrichedListing = {
        ...carData,
        car_listing_images: images || [],
        profiles: profileData,
        dealers: dealerData ? [dealerData] : [],
      };

      console.log("Enriched listing:", enrichedListing);
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

      if (!error && data) {
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
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);

        if (error) {
          console.error("Error removing favorite:", error);
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
          console.error("Error adding favorite:", error);
          toast.error("Failed to add to favorites");
          return;
        }

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
          title: title,
          text: `Check out this ${title} for ₦${listing?.price?.toLocaleString()}`,
          url: url,
        });
        toast.success("Shared successfully");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          fallbackShare(url, title);
        }
      }
    } else {
      fallbackShare(url, title);
    }
  };

  const fallbackShare = (url, title) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success("Link copied to clipboard");
        })
        .catch(() => {
          toast.error("Failed to copy link");
        });
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
      window.open(
        `mailto:${listedBy.email}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`,
        "_self"
      );
    } else if (listedBy.phone) {
      const message = `Hi, I would like to schedule a test drive for your ${listing?.year} ${listing?.make} ${listing?.model}. Please let me know your availability.`;
      window.open(
        `https://wa.me/${listedBy.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
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
  const images = listing.car_listing_images || [];
  const currentImage = images[currentImageIndex] || {};
  const displayImage = getImageUrl(currentImage.image_url);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
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
                      src={getImageUrl(image.image_url)}
                      alt={`${listing.year} ${listing.make} ${
                        listing.model
                      } ${index + 1}`}
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
            {/* ... rest of your component stays unchanged */}
          </div>

          {/* Sidebar */}
          {/* ... rest of your component stays unchanged */}
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
