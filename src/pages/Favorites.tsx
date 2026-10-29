import { useState, useEffect } from "react";
import { Heart, Eye, User, Building, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { usePageMeta } from "@/hooks/usePageMeta";
const Favorites = () => {
  usePageMeta({ title: "Saved cars", noIndex: true });
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      // First get the favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, listing_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        toast.error('Failed to load favorites');
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // Get the listing IDs
      const listingIds = favoritesData.map(fav => fav.listing_id);

      // Fetch car listings
      const { data: carListings, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images (image_url, is_primary)
        `)
        .in('id', listingIds);

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        toast.error('Failed to load listings');
        return;
      }

      // Get unique user IDs from car listings
      const userIds = [...new Set(carListings?.map(listing => listing.user_id).filter(Boolean))];
      
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch dealers for dealer users
      const dealerUserIds = profiles?.filter(p => p.user_type === 'dealer').map(p => p.id) || [];
      let dealers = [];
      
      if (dealerUserIds.length > 0) {
        const { data: dealersData, error: dealersError } = await supabase
          .rpc('get_public_dealers');

        if (!dealersError) {
          // Match dealers with basic public info only
          dealers = (dealersData || []).map(dealer => ({
            id: dealer.id,
            business_name: dealer.business_name,
            contact_name: 'Dealer' // Generic name for security
          }));
        }
      }

      // Combine the data
      const enrichedFavorites = favoritesData.map(favorite => {
        const listing = carListings?.find(l => l.id === favorite.listing_id);
        if (!listing) return null;

        const profile = profiles?.find(p => p.id === listing.user_id);
        const dealer = dealers?.find(d => d.id === listing.user_id);
        
        return {
          ...favorite,
          car_listings: {
            ...listing,
            profiles: profile,
            dealers: dealer ? [dealer] : []
          }
        };
      }).filter(Boolean);

      setFavorites(enrichedFavorites);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (favoriteId, listingId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
        return;
      }

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error handling remove favorite:', error);
      toast.error('An error occurred');
    }
  };

  const getListedBy = (listing) => {
    if (listing?.profiles?.user_type === 'dealer' && listing?.dealers?.[0]) {
      return {
        type: 'dealer',
        name: listing.dealers[0].business_name,
        icon: <Building className="w-3 h-3 text-blue-600" />
      };
    } else if (listing?.profiles) {
      const fullName = `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim();
      return {
        type: 'user',
        name: fullName || 'Private Seller',
        icon: <User className="w-3 h-3 text-gray-600" />
      };
    }
    return {
      type: 'unknown',
      name: 'Unknown Seller',
      icon: <User className="w-3 h-3 text-gray-600" />
    };
  };

  const getCarImage = (listing) => {
    const images = listing?.car_listing_images || [];
    const primaryImage = images.find(img => img.is_primary)?.image_url;
    return primaryImage || images[0]?.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-600" />
                <span>My Favorites</span>
              </CardTitle>
              <CardDescription>
                View and manage your favorite car listings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LogIn className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
                <p className="text-gray-500 mb-6">
                  You need to sign in to view your favorite listings.
                </p>
                <Link to="/login">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-600" />
                <span>My Favorites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div>Loading your favorites...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-600" />
              <span>My Favorites</span>
            </CardTitle>
            <CardDescription>
              View and manage your favorite car listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">
                  Start exploring cars and save your favorites by clicking the heart icon on any listing.
                </p>
                <Link to="/cars">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Browse Cars
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const listing = favorite.car_listings;
                  const listedBy = getListedBy(listing);
                  
                  return (
                    <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <img 
                          src={getCarImage(listing)} 
                          alt={`${listing.year} ${listing.make} ${listing.model}`} 
                          className="w-full h-48 object-cover" 
                        />
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleRemoveFromFavorites(favorite.id, listing.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 truncate">
                          {listing.year} {listing.make} {listing.model}
                        </h3>
                        <p className="text-2xl font-bold text-red-600 mb-2">
                          ₦{parseFloat(listing.price).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-3 truncate">{listing.location}</p>
                        
                        <div className="space-y-2 text-sm mb-4">
                          {listing.mileage && <span className="block">{listing.mileage}</span>}
                          <span className="block">
                            {listing.fuel_type || 'Petrol'} • {listing.transmission || 'Automatic'}
                          </span>
                          <div className="flex items-center gap-2">
                            {listedBy.icon}
                            <span className="text-gray-500 truncate">{listedBy.name}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Link to={`/cars/${listing.id}`} className="w-full">
                          <Button className="w-full bg-red-600 hover:bg-red-700">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Favorites;
