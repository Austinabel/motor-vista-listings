import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Star, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setListings(data || []);
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
      <div className="grid grid-cols-2 gap-2">
        {listings.map((listing) => {
          const primaryImage = listing.car_listing_images?.find(img => img.is_primary)?.image_url || 
                              listing.car_listing_images?.[0]?.image_url;

          return (
            <Card key={listing.id} className="overflow-hidden border border-gray-200">
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
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified ID
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    POPULAR
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
                  <div className="text-xs text-gray-600">Private Seller</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};