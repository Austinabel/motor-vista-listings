import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Car, MapPin, Calendar, Heart, Crown, Star, TrendingUp, Eye, User, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import MessageSellerButton from "@/components/MessageSellerButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const FeaturedListings = () => {
  const { user } = useAuth();
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleRows, setVisibleRows] = useState(3);
  const carsPerRow = 6;
  const totalCarsPerPage = visibleRows * carsPerRow;
  const maxRows = 6;

  useEffect(() => {
    fetchCarListings();
  }, [user]);

  const fetchCarListings = async () => {
    try {
      // First expire any expired featured/boosted listings
      await supabase.rpc('expire_featured_listings');

      // Fetch car listings first - include pending_review for own listings
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images (
            image_url,
            is_primary
          )
        `)
        .or(`status.eq.active${user ? `,and(status.eq.pending_review,user_id.eq.${user.id})` : ''}`)
        .order('is_top_listing', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(108); // 6 rows * 6 cars * 3 pages

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        setCarListings([]);
        return;
      }

      // Fetch images for all listings (if not already included)
      const { data: allImages, error: imagesError } = await supabase
        .from('car_listing_images')
        .select('listing_id, image_url, is_primary')
        .in('listing_id', (listings || []).map(l => l.id));

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      // Use secure function to get seller info for each listing
      const enrichedListings = await Promise.all(
        (listings || []).map(async (listing) => {
          // Get images for this listing from car_listing_images relation or fallback
          const listingImages = listing.car_listing_images?.length > 0 
            ? listing.car_listing_images 
            : allImages?.filter(img => img.listing_id === listing.id) || [];
          
          // Get seller info with privacy settings
          const { data: sellerInfo, error: sellerError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, user_type, show_profile, show_phone_number')
            .eq('id', listing.user_id)
            .maybeSingle();

          const sellerArray = sellerInfo ? [sellerInfo] : [];

          let dealerInfo = null;
          
          // If seller is a dealer, fetch dealer information using secure function
          if (sellerInfo && sellerInfo.user_type === 'dealer') {
            const { data: dealersData, error: dealersError } = await supabase
              .rpc('get_public_dealers')

            const dealerData = dealersData?.find(dealer => 
              // Match by comparing with user profiles - we need a safer way to link this
              sellerInfo?.id === listing.user_id
            );

            if (dealerData) {
              dealerInfo = {
                id: dealerData.id, 
                business_name: dealerData.business_name,
                contact_name: sellerInfo?.first_name || 'Dealer'
              };
            }
          }

          return {
            ...listing,
            car_listing_images: listingImages,
            profiles: sellerInfo ? sellerInfo : null,
            dealers: dealerInfo ? [dealerInfo] : []
          };
        })
      );

      setCarListings(enrichedListings);
    } catch (error) {
      console.error('Error in fetchCarListings:', error);
      setCarListings([]);
    } finally {
      setLoading(false);
    }
  };

  const getListedBy = (listing) => {
    if (listing.profiles?.user_type === 'dealer' && listing.dealers?.[0]) {
      return {
        type: 'dealer',
        name: listing.dealers[0].business_name,
        icon: <Building className="w-3 h-3 text-blue-600" />
      };
    } else if (listing.profiles) {
      // Check privacy settings
      const showProfile = listing.profiles.show_profile ?? true;
      
      if (!showProfile) {
        return {
          type: 'user',
          name: 'Private Seller',
          icon: <User className="w-3 h-3 text-gray-600" />
        };
      }
      
      const fullName = `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim();
      return {
        type: 'user',
        name: fullName || 'Private Seller',
        icon: <User className="w-3 h-3 text-gray-600" />
      };
    }
    return {
      type: 'unknown',
      name: 'Unknown',
      icon: <User className="w-3 h-3 text-gray-600" />
    };
  };

  const getCarImage = (listing) => {
    console.log('Getting car image for listing:', listing.id, 'Images:', listing.car_listing_images);
    const images = listing.car_listing_images || [];
    const primaryImage = images.find(img => img.is_primary)?.image_url;
    const imageUrl = primaryImage || images[0]?.image_url;
    
    console.log('Primary image:', primaryImage, 'First image:', images[0]?.image_url, 'Final URL:', imageUrl);
    
    // Check if it's a real uploaded image URL (not a placeholder)
    if (imageUrl && (
      imageUrl.startsWith('http') || 
      imageUrl.includes('supabase.co/storage') ||
      imageUrl.includes('car-listing-images') ||
      imageUrl.startsWith('/')
    ) && !imageUrl.includes('placeholder-image')) {
      console.log('Using real image:', imageUrl);
      return imageUrl;
    }
    
    // Return fallback image for placeholders or missing images
    console.log('Using fallback image for listing:', listing.id, 'because imageUrl was:', imageUrl);
    return "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop";
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading featured listings...</div>
        </div>
      </section>
    );
  }

  const displayedCars = carListings.slice(0, totalCarsPerPage);
  const canLoadMore = visibleRows < maxRows && displayedCars.length >= totalCarsPerPage;

  const handleLoadMore = () => {
    if (canLoadMore) {
      setVisibleRows(prev => prev + 3);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-white">Featured Listings</h2>
          <Link to="/cars">
            <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayedCars.map((car, index) => {
            const listedBy = getListedBy(car);
            return (
              <Card 
                key={car.id} 
                className={`overflow-hidden hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in ${
                  car.is_top_listing ? 'ring-2 ring-yellow-500 shadow-lg' : 
                  car.is_featured ? 'ring-2 ring-blue-500 shadow-md' : 
                  car.is_boosted ? 'ring-2 ring-green-500 shadow-md' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                 <div className="relative">
                   {/* Priority Badges */}
                   <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
                     {car.is_top_listing && (
                       <Badge className="bg-yellow-500 text-white text-xs px-1 py-0">
                         <Star className="h-2 w-2 mr-1" />
                         Top
                       </Badge>
                     )}
                     {car.is_featured && (
                       <Badge className="bg-blue-500 text-white text-xs px-1 py-0">
                         <Crown className="h-2 w-2 mr-1" />
                         Featured
                       </Badge>
                     )}
                     {car.is_boosted && (
                       <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                         <TrendingUp className="h-2 w-2 mr-1" />
                         Boosted
                       </Badge>
                     )}
                   </div>

                    <img src={getCarImage(car)} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-32 object-cover" />
                    <FavoriteButton listingId={car.id} className="absolute top-1 right-1 p-1" size="sm" />
                    {user && car.user_id === user.id && car.status === 'pending_review' && (
                      <div className="absolute top-1 left-1">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Pending Review</span>
                     </div>
                   )}
                 </div>
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm mb-2 truncate">{car.year} {car.make} {car.model}</h3>
                  <p className="text-lg font-bold text-red-600 mb-1">₦{car.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mb-2 truncate">{car.location}</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {car.mileage && <span className="truncate">{car.mileage}</span>}
                    <span className="truncate">{car.fuel_type || 'Petrol'} • {car.transmission || 'Automatic'}</span>
                    <div className="flex items-center gap-1 mt-1">
                      {listedBy.icon}
                      <span className="text-xs text-gray-500 truncate">{listedBy.name}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Link to={`/cars/${car.id}`} className="w-full">
                    <Button className="w-full text-xs py-1 bg-red-600 hover:bg-red-700 text-white border-none">
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        {/* Load More Button */}
        <div className="flex justify-center mt-12">
          {canLoadMore ? (
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-3"
            >
              Load More
            </Button>
          ) : (
            <Link to="/cars">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm px-8 py-3"
              >
                View All Listings
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
