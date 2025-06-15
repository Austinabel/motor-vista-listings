
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings, User, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CarDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
      checkIfFavorite();
    }
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      console.log('Fetching car details for ID:', id);
      
      // Fetch the car listing
      const { data: carData, error: carError } = await supabase
        .from('car_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (carError) {
        console.error('Error fetching car details:', carError);
        toast.error('Failed to load car details');
        return;
      }

      console.log('Car data:', carData);

      // Fetch images separately
      const { data: images, error: imagesError } = await supabase
        .from('car_listing_images')
        .select('*')
        .eq('listing_id', id)
        .order('is_primary', { ascending: false });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      console.log('Images:', images);

      // Fetch user profile if user_id exists
      let profileData = null;
      if (carData.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, user_type, phone')
          .eq('id', carData.user_id)
          .single();

        if (!profileError) {
          profileData = profile;
        }
      }

      // Fetch dealer info if user is a dealer
      let dealerData = null;
      if (profileData?.user_type === 'dealer' && carData.user_id) {
        const { data: dealer, error: dealerError } = await supabase
          .from('dealers')
          .select('business_name, contact_name, phone, email')
          .eq('id', carData.user_id)
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
        dealers: dealerData ? [dealerData] : []
      };

      console.log('Enriched listing:', enrichedListing);
      setListing(enrichedListing);
    } catch (error) {
      console.error('Error in fetchCarDetails:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single();

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const getListedBy = () => {
    if (!listing) return { type: 'unknown', name: 'Unknown Seller', phone: null, email: null };
    
    if (listing.profiles?.user_type === 'dealer' && listing.dealers?.[0]) {
      return {
        type: 'dealer',
        name: listing.dealers[0].business_name,
        contact: listing.dealers[0].contact_name,
        phone: listing.dealers[0].phone,
        email: listing.dealers[0].email
      };
    } else if (listing.profiles) {
      const fullName = `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim();
      return {
        type: 'user',
        name: fullName || 'Private Seller',
        phone: listing.profiles.phone,
        email: null // Private sellers don't expose email directly
      };
    }
    return {
      type: 'unknown',
      name: 'Unknown Seller',
      phone: null,
      email: null
    };
  };

  const handleAddToFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to add to favorites');
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);

        if (error) {
          console.error('Error removing favorite:', error);
          toast.error('Failed to remove from favorites');
          return;
        }

        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: id });

        if (error) {
          console.error('Error adding favorite:', error);
          toast.error('Failed to add to favorites');
          return;
        }

        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error handling favorites:', error);
      toast.error('An error occurred');
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
        toast.success('Shared successfully');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(url, title);
        }
      }
    } else {
      fallbackShare(url, title);
    }
  };

  const fallbackShare = (url, title) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    } else {
      toast.error('Sharing not supported on this device');
    }
  };

  const handleCallSeller = () => {
    const listedBy = getListedBy();
    if (listedBy.phone) {
      window.open(`tel:${listedBy.phone}`, '_self');
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleSendMessage = () => {
    const listedBy = getListedBy();
    const subject = `Inquiry about ${listing?.year} ${listing?.make} ${listing?.model}`;
    const body = `Hi, I'm interested in your ${listing?.year} ${listing?.make} ${listing?.model} listed for ₦${listing?.price?.toLocaleString()}. Please let me know if it's still available.`;
    
    if (listedBy.email) {
      window.open(`mailto:${listedBy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    } else if (listedBy.phone) {
      // Fallback to WhatsApp if no email
      const message = `Hi, I'm interested in your ${listing?.year} ${listing?.make} ${listing?.model} listed for ₦${listing?.price?.toLocaleString()}. Please let me know if it's still available.`;
      window.open(`https://wa.me/${listedBy.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast.error('Contact information not available');
    }
  };

  const handleScheduleTestDrive = () => {
    const listedBy = getListedBy();
    const subject = `Test Drive Request for ${listing?.year} ${listing?.make} ${listing?.model}`;
    const body = `Hi, I would like to schedule a test drive for your ${listing?.year} ${listing?.make} ${listing?.model}. Please let me know your availability.`;
    
    if (listedBy.email) {
      window.open(`mailto:${listedBy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    } else if (listedBy.phone) {
      const message = `Hi, I would like to schedule a test drive for your ${listing?.year} ${listing?.make} ${listing?.model}. Please let me know your availability.`;
      window.open(`https://wa.me/${listedBy.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast.error('Contact information not available');
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
  const displayImage = currentImage.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

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
                      src={image.image_url} 
                      alt={`${listing.year} ${listing.make} ${listing.model} ${index + 1}`}
                      className={`w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 ${
                        index === currentImageIndex ? 'ring-2 ring-red-600' : ''
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
                    <h1 className="text-3xl font-bold mb-2">{listing.year} {listing.make} {listing.model}</h1>
                    <p className="text-3xl font-bold text-red-600">₦{parseFloat(listing.price).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddToFavorites}
                      className={isFavorite ? 'text-red-600 border-red-600' : ''}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
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
                      {listing.description || `This ${listing.year} ${listing.make} ${listing.model} is in ${listing.condition.toLowerCase()} condition and ready for its next owner.`}
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
                <h3 className="font-bold text-lg mb-4">Contact Seller</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {listedBy.type === 'dealer' ? (
                      <Building className="w-8 h-8 text-blue-600" />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                    <div>
                      <h4 className="font-semibold">{listedBy.name}</h4>
                      {listedBy.contact && (
                        <p className="text-sm text-gray-600">{listedBy.contact}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {listedBy.type === 'dealer' ? 'Verified Dealer' : 'Private Seller'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleCallSeller}
                    disabled={!listedBy.phone}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {listedBy.phone ? 'Call Seller' : 'No Phone Available'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSendMessage}
                    disabled={!listedBy.email && !listedBy.phone}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleScheduleTestDrive}
                    disabled={!listedBy.email && !listedBy.phone}
                  >
                    Schedule Test Drive
                  </Button>
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
