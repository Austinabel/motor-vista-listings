import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Phone, Mail, Calendar, Gauge, Fuel, Settings, User, Building, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MessageSellerButton from "@/components/MessageSellerButton";

const FALLBACK_IMAGE = "https://via.placeholder.com/800x500?text=No+Image";

// ✅ Helper to resolve Supabase storage URLs
const getImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
  const { data } = supabase.storage.from("car-listing-images").getPublicUrl(path);
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

      // ✅ Map images to public URLs
      const images = (carData.images || []).map((path) => getImageUrl(path));

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
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
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
                    <p className="text-gray-600">
                      {listing.description ||
                        `This ${listing.year} ${listing.make} ${listing.model} is in ${listing.condition.toLowerCase()} condition and ready for its next owner.`}
                    </p>
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
                        <p>{new Date(listing.created_at).toLocaleDateString()}</p>
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
                    {listedBy.type === "dealer" ? (
                      <Building className="w-8 h-8 text-blue-600" />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                    <div>
                      <h4 className="font-semibold">{listedBy.name}</h4>
                      {listedBy.contact && <p className="text-sm text-gray-600">{listedBy.contact}</p>}
                      <div className="flex items-center gap-1 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {listedBy.type === "dealer" ? "Verified Dealer" : "Private Seller"}
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
                        sellerName={listedBy.name}
                      />

                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => window.open(`tel:${listedBy.phone}`, "_self")}
                        disabled={!listedBy.phone}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        {listedBy.phone ? "Call Seller" : "No Phone Available"}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          listedBy.email
                            ? window.open(
                                `mailto:${listedBy.email}?subject=Test Drive Request&body=I would like to schedule a test drive.`,
                                "_self"
                              )
                            : toast.error("Contact info not available")
                        }
                        disabled={!listedBy.email && !listedBy.phone}
                      >
                        Schedule Test Drive
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.error("Please sign in to contact the seller")}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in to Contact
                      </Button>
                      <p className="text-xs text-gray-600 text-center">Contact details available after sign in</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Vehicle Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Make:</span>
                    <span>{listing.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span>{listing.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Year:</span>
                    <span>{listing.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span>{listing.condition}</span>
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
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
