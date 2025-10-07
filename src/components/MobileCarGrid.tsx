import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Star, CheckCircle, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  location: string;
  condition: string;
  mileage?: string;
  color?: string;
  description?: string;
  created_at: string;
  car_listing_images?: { image_url: string; is_primary: boolean }[];
}

export const MobileCarGrid = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // Expire any outdated featured/boosted listings first
      await supabase.rpc('expire_featured_listings');

      const { data: listings, error } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('is_top_listing', { ascending: false })
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get unique user IDs from listings
      const userIds = [...new Set(listings?.map(listing => listing.user_id).filter(Boolean))];
      
      // Fetch all profiles at once for better efficiency with RLS
      let profiles = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, user_type, show_profile')
          .in('id', userIds);

        if (!profilesError) {
          profiles = profilesData || [];
        }
      }

      // Fetch dealer information for dealer users
      const { data: dealersData } = await supabase.rpc('get_public_dealers');

      // Enrich listings with seller information
      const enrichedListings = (listings || []).map(listing => {
        const profile = profiles?.find(p => p.id === listing.user_id);
        let dealerInfo = null;
        
        // If seller is a dealer, find dealer information
        if (profile && profile.user_type === 'dealer') {
          const dealerData = dealersData?.find(dealer => 
            dealer.id === listing.user_id
          );

          if (dealerData) {
            dealerInfo = {
              id: dealerData.id, 
              business_name: dealerData.business_name
            };
          }
        }

        return {
          ...listing,
          profiles: profile,
          dealers: dealerInfo ? [dealerInfo] : []
        };
      });

      setListings(enrichedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'brand_new': return 'bg-green-100 text-green-800';
      case 'foreign_used': return 'bg-blue-100 text-blue-800';
      case 'local_used': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'brand_new': return 'Brand New';
      case 'foreign_used': return 'Foreign Used';
      case 'local_used': return 'Local Used';
      default: return condition;
    }
  };

  const getSellerName = (listing: any) => {
    // If it's a dealer, show business name
    if (listing.profiles?.user_type === 'dealer' && listing.dealers?.[0]) {
      return listing.dealers[0].business_name;
    } 
    
    // If it's a regular user
    if (listing.profiles) {
      // Check privacy settings
      const showProfile = listing.profiles.show_profile ?? true;
      
      if (!showProfile) {
        return 'Private Seller';
      }
      
      const fullName = `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim();
      return fullName || 'Private Seller';
    }
    
    return 'Private Seller';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 p-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-lg"></div>
            <div className="p-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white px-2 py-4">
      {/* Divider */}
      <div className="border-t border-gray-200 mb-4"></div>
      
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Available Cars</h2>
        <p className="text-sm text-gray-600">Discover the best cars available right now</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 relative">
        {/* Vertical divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-200/50 transform -translate-x-1/2 z-10"></div>
        
        {listings.map((listing, index) => {
          const primaryImage = listing.car_listing_images?.find(img => img.is_primary)?.image_url || 
                              listing.car_listing_images?.[0]?.image_url;

          return (
            <div key={listing.id} className="relative">
              {/* Horizontal divider after every 2 cards (after each row) */}
              {index > 1 && index % 2 === 0 && (
                <div className="absolute -top-1 left-0 right-0 h-px bg-red-200/50 z-10"></div>
              )}
              
              <Link to={`/cars/${listing.id}`}>
                <Card className={`overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-lg relative ${index % 2 === 0 ? 'mr-1' : 'ml-1'}`}>
                  {/* Image */}
                  <div className="relative">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={`${listing.make} ${listing.model}`}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                    
                    {/* Fixed badge positioning to prevent overlap */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5 flex items-center">
                        <CheckCircle className="w-2.5 h-2.5 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-2">
                    {/* Price */}
                    <div className="font-bold text-lg text-red-600 mb-1">
                      {formatPrice(listing.price)}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {listing.make} {listing.model} {listing.year}
                    </h3>

                    {/* Details */}
                    <div className="space-y-1 text-xs text-gray-600">
                      {listing.condition && (
                        <Badge className={`${getConditionColor(listing.condition)} text-xs`}>
                          {getConditionLabel(listing.condition)}
                        </Badge>
                      )}
                      
                      {listing.mileage && (
                        <div>• {listing.mileage} km</div>
                      )}
                      
                      {listing.color && (
                        <div>• {listing.color}</div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.location}
                      </div>
                    </div>

                    {/* Seller */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {user ? (
                        <div className="text-xs text-gray-600">{getSellerName(listing)}</div>
                      ) : (
                        <div className="text-xs text-blue-600 flex items-center gap-1">
                          <LogIn className="w-3 h-3" />
                          Sign in to see seller
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};