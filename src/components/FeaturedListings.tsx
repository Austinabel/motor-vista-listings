import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, User, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
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
      // First fetch car listings
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images(image_url, is_primary)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(108); // 6 rows * 6 cars * 3 pages

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        setCarListings([]);
        return;
      }

      // Get unique user IDs from listings
      const userIds = [...new Set(listings?.map(listing => listing.user_id).filter(Boolean))];
      
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
          .from('dealers')
          .select('id, business_name, contact_name')
          .in('id', dealerUserIds);

        if (!dealersError) {
          dealers = dealersData || [];
        }
      }

      // Combine the data
      const enrichedListings = listings?.map(listing => {
        const profile = profiles?.find(p => p.id === listing.user_id);
        const dealer = dealers?.find(d => d.id === listing.user_id);
        
        return {
          ...listing,
          profiles: profile,
          dealers: dealer ? [dealer] : []
        };
      }) || [];

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
      return {
        type: 'user',
        name: 'Private Seller',
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
    const images = listing.car_listing_images || [];
    const primaryImage = images.find(img => img.is_primary)?.image_url;
    return primaryImage || images[0]?.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop";
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
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
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
                className="overflow-hidden hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img src={getCarImage(car)} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-32 object-cover" />
                  <FavoriteButton listingId={car.id} className="absolute top-1 right-1 p-1" size="sm" />
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
                className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-3"
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
