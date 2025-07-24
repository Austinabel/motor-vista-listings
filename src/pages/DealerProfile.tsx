
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Star, Eye, Heart, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Tables } from "@/integrations/supabase/types";

type ListingWithImages = Tables<'car_listings'> & {
  car_listing_images: {
    image_url: string;
    is_primary: boolean | null;
  }[];
};

const DealerProfile = () => {
  const { dealerId } = useParams<{ dealerId: string }>();
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const { data: dealer, isLoading: isLoadingDealer } = useQuery({
    queryKey: ['dealer', dealerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .eq('status', 'verified')
        .single();
      if (error) {
        console.error("Error fetching dealer:", error);
        return null;
      };
      return data;
    },
    enabled: !!dealerId,
  });

  const { data: listings, isLoading: isLoadingListings } = useQuery({
    queryKey: ['dealerListings', dealer?.user_id],
    queryFn: async () => {
      if (!dealer?.user_id) return [];
      const { data, error } = await supabase
        .from('car_listings')
        .select(`
          id,
          make,
          model,
          year,
          price,
          mileage,
          car_listing_images (
            image_url,
            is_primary
          )
        `)
        .eq('user_id', dealer.user_id)
        .eq('status', 'active');

      if (error) {
        console.error("Error fetching listings:", error);
        return [];
      };
      return data as ListingWithImages[];
    },
    enabled: !!dealer?.user_id,
  });

  const reviews = [
    {
      id: 1,
      customerName: "John Doe",
      rating: 5,
      comment: "Excellent service and quality cars. The buying process was smooth and professional.",
      date: "2 weeks ago"
    },
    {
      id: 2,
      customerName: "Jane Smith", 
      rating: 4,
      comment: "Great selection of vehicles. Staff was helpful and knowledgeable.",
      date: "1 month ago"
    },
    {
      id: 3,
      customerName: "Mike Johnson",
      rating: 5,
      comment: "Very satisfied with my purchase. Highly recommend this dealer.",
      date: "3 weeks ago"
    }
  ];

  const handleRatingSubmit = () => {
    if (userRating > 0 && reviewText.trim()) {
      // Handle review submission here
      console.log("Rating:", userRating, "Review:", reviewText);
      setUserRating(0);
      setReviewText("");
      alert("Thank you for your review!");
    }
  };
  
  const getPrimaryImage = (images: ListingWithImages['car_listing_images']) => {
    if (!images || images.length === 0) {
      return "/placeholder.svg"; // Placeholder
    }
    const primary = images.find(img => img.is_primary);
    return primary?.image_url || images[0].image_url;
  };

  if (isLoadingDealer) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-red-600" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold">Dealer Not Found</h1>
                <p className="text-gray-600 mt-2">The dealer you are looking for does not exist.</p>
            </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Dealer Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={"https://images.unsplash.com/photo-1486162928267-e6274cb3106f?w=400&h=250&fit=crop"} 
                  alt={dealer.business_name}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{dealer.business_name}</h1>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">4.8</span>
                        </div>
                        <span className="text-gray-600">({reviews.length} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{dealer.address}, {dealer.state}</span>
                      </div>
                      <p className="text-sm text-gray-600">Established {dealer.year_established}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${dealer.phone}`}>
                        <Button>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                      </a>
                      <a href={`mailto:${dealer.email}`}>
                        <Button variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </a>
                    </div>
                  </div>
                  <p className="text-gray-600">{dealer.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cars Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Available Cars ({listings?.length || 0})</h2>
              <Button variant="outline">View All</Button>
            </div>
            
            {isLoadingListings ? (
              <div className="flex justify-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600" />
              </div>
            ) : listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((car) => (
                    <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={getPrimaryImage(car.car_listing_images)} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-48 object-cover bg-gray-200" />
                        <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">{`${car.year} ${car.make} ${car.model}`}</h3>
                        <p className="text-2xl font-bold text-red-600 mb-2">₦{car.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mb-4">{car.mileage ? `${parseInt(car.mileage).toLocaleString()} km` : 'N/A'}</p>
                        <Button className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center">
                        <p className="text-gray-500">This dealer has no active car listings at the moment.</p>
                    </CardContent>
                </Card>
            )}
          </div>

          {/* Public Rating System */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Rate This Dealer</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-medium">Your Rating:</p>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || userRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-medium">Your Review:</p>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this dealer..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button 
                  onClick={handleRatingSubmit}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!userRating || !reviewText.trim()}
                >
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section - Enhanced */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Customer Reviews ({reviews.length})</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{review.customerName}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DealerProfile;
