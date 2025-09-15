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
      if (user) {
        checkIfFavorite();
      }
    }
  }, [id, user]);

  const fetchCarDetails = async () => {
    try {
      console.log("Fetching car details for ID:", id);
      const { data, error } = await supabase
        .from("car_listings")
        .select(
          `
          *,
          car_listing_images (*),
          profiles (
            first_name,
            last_name,
            user_type,
            phone
          ),
          dealers (
            business_name,
            contact_name,
            phone,
            email
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching car details:", error);
        toast.error("Failed to load car details");
        return;
      }

      setListing(data);
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

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.image_url) {
      if (image.image_url.startsWith("http")) {
        return image.image_url;
      }
      const { data } = supabase.storage
        .from("car-listing-images")
        .getPublicUrl(image.image_url);
      return data?.publicUrl;
    }
    return null;
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
        .then(() => toast.success("Link copied to clipboard"))
        .catch(() => toast.error("Failed to copy link"));
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
  const displayImage =
    getImageUrl(currentImage) ||
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

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
                      src={
                        getImageUrl(image) ||
                        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop"
                      }
                      alt={`${listing.year} ${listing.make} ${
                        listing.model
                      } ${index + 1}`}
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {listing.year} {listing.make} {listing.model}
              </h1>
              <p className="text-2xl font-semibold text-red-600 mb-4">
                ₦{listing.price?.toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {listing.year}
                </div>
                <div className="flex items-center">
                  <Gauge className="w-4 h-4 mr-2" />
                  {listing.mileage?.toLocaleString()} km
                </div>
                <div className="flex items-center">
                  <Fuel className="w-4 h-4 mr-2" />
                  {listing.fuel_type}
                </div>
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  {listing.transmission}
                </div>
              </div>
            </div>

            {/* Tabs for Description and Features */}
            <Tabs defaultValue="description" className="mb-8">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <Card>
                  <CardContent className="p-4">
                    <p>{listing.description || "No description provided."}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {listing.features?.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      )) || <p>No features listed.</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
                <div className="flex items-center mb-4">
                  {listedBy.type === "dealer" ? (
                    <Building className="w-5 h-5 mr-2" />
                  ) : (
                    <User className="w-5 h-5 mr-2" />
                  )}
                  <div>
                    <p className="font-medium">{listedBy.name}</p>
                    {listedBy.contact && (
                      <p className="text-sm text-gray-600">
                        Contact: {listedBy.contact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCallSeller}
                    className="w-full flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Seller
                  </Button>
                  <Button
                    onClick={handleScheduleTestDrive}
                    className="w-full flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Test Drive
                  </Button>
                  <MessageSellerButton listingId={id} sellerId={listing.user_id} />
                  <Button
                    onClick={handleAddToFavorites}
                    variant={isFavorite ? "secondary" : "outline"}
                    className="w-full flex items-center justify-center"
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
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
