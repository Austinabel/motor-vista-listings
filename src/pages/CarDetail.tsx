
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

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('car_listings')
        .select(`
          *,
          profiles!car_listings_user_id_fkey(first_name, last_name, user_type),
          dealers!left(business_name, contact_name, phone, email),
          car_listing_images(image_url, is_primary)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching car details:', error);
        toast.error('Failed to load car details');
      } else {
        setListing(data);
      }
    } catch (error) {
      console.error('Error in fetchCarDetails:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getListedBy = () => {
    if (!listing) return { type: 'unknown', name: 'Unknown' };
    
    if (listing.profiles?.user_type === 'dealer' && listing.dealers?.[0]) {
      return {
        type: 'dealer',
        name: listing.dealers[0].business_name,
        contact: listing.dealers[0].contact_name,
        phone: listing.dealers[0].phone,
        email: listing.dealers[0].email
      };
    } else if (listing.profiles) {
      return {
        type: 'user',
        name: `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim() || 'Private User'
      };
    }
    return {
      type: 'unknown',
      name: 'Unknown'
    };
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
  const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <img 
                src={primaryImage} 
                alt={`${listing.year} ${listing.make} ${listing.model}`} 
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.slice(0, 3).map((image, index) => (
                    <img 
                      key={index}
                      src={image.image_url} 
                      alt={`${listing.year} ${listing.make} ${listing.model} ${index + 1}`}
                      className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
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
                    <p className="text-3xl font-bold text-red-600">₦{listing.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
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
                  
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Seller
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline" className="w-full">
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
