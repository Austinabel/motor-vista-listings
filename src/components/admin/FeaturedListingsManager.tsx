import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Star, TrendingUp, Calendar, Users, Car, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const FeaturedListingsManager = () => {
  const { user } = useAuth();
  const [carListings, setCarListings] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [carSearchTerm, setCarSearchTerm] = useState("");
  const [dealerSearchTerm, setDealerSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch car listings
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          id, make, model, year, price, location, status, created_at,
          is_featured, is_top_listing, is_boosted, featured_until, boosted_until,
          boost_approved_by, boost_approved_at
        `)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Fetch dealers
      const { data: dealerData, error: dealersError } = await supabase
        .from('dealers')
        .select(`
          id, business_name, contact_name, state, status, created_at,
          is_featured, featured_until
        `)
        .order('created_at', { ascending: false });

      if (dealersError) throw dealersError;

      setCarListings(listings || []);
      setDealers(dealerData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateCarListing = async (id: string, updates: any) => {
    if (!user) return;
    
    setUpdating(id);
    try {
      const updateData = {
        ...updates,
        boost_approved_by: updates.is_boosted ? user.id : null,
        boost_approved_at: updates.is_boosted ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('car_listings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Car listing updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating car listing:', error);
      toast.error('Failed to update car listing');
    } finally {
      setUpdating(null);
    }
  };

  const updateDealer = async (id: string, updates: any) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('dealers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Dealer updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating dealer:', error);
      toast.error('Failed to update dealer');
    } finally {
      setUpdating(null);
    }
  };

  const getExpiryDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Featured Listings Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cars" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cars" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Car Listings ({carListings.length})
            </TabsTrigger>
            <TabsTrigger value="dealers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Dealers ({dealers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4 text-center">
                    <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Featured</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {carListings.filter(c => c.is_featured).length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Top Listings</h3>
                    <p className="text-2xl font-bold text-red-600">
                      {carListings.filter(c => c.is_top_listing).length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Boosted</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {carListings.filter(c => c.is_boosted).length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Car Search */}
              <div className="mb-4">
                <Label htmlFor="car-search">Search Car Listings</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="car-search"
                    placeholder="Search by make, model, year, or listing ID..."
                    value={carSearchTerm}
                    onChange={(e) => setCarSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {carListings
                  .filter(listing => 
                    listing.make?.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
                    listing.model?.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
                    listing.year?.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
                    listing.id.toLowerCase().includes(carSearchTerm.toLowerCase())
                  )
                  .map((listing) => (
                  <Card key={listing.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {listing.year} {listing.make} {listing.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <strong>ID:</strong> {listing.id.slice(0, 8)}... • ₦{listing.price?.toLocaleString()} • {listing.location}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {listing.is_featured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Featured {formatDate(listing.featured_until)}
                              </Badge>
                            )}
                            {listing.is_top_listing && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <Star className="h-3 w-3 mr-1" />
                                Top Listing
                              </Badge>
                            )}
                            {listing.is_boosted && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Boosted {formatDate(listing.boosted_until)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 ml-4">
                          <div className="space-y-3">
                            {/* Featured Toggle */}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={listing.is_featured}
                                onCheckedChange={(checked) => {
                                  updateCarListing(listing.id, {
                                    is_featured: checked,
                                    featured_until: checked ? getExpiryDate(30) : null
                                  });
                                }}
                                disabled={updating === listing.id}
                              />
                              <Label className="text-sm">Featured (30 days)</Label>
                            </div>
                            
                            {/* Top Listing Toggle */}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={listing.is_top_listing}
                                onCheckedChange={(checked) => {
                                  updateCarListing(listing.id, {
                                    is_top_listing: checked
                                  });
                                }}
                                disabled={updating === listing.id}
                              />
                              <Label className="text-sm">Top Listing</Label>
                            </div>
                            
                            {/* Boosted Toggle */}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={listing.is_boosted}
                                onCheckedChange={(checked) => {
                                  updateCarListing(listing.id, {
                                    is_boosted: checked,
                                    boosted_until: checked ? getExpiryDate(14) : null
                                  });
                                }}
                                disabled={updating === listing.id}
                              />
                              <Label className="text-sm">Boosted (14 days)</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {carListings
                  .filter(listing => 
                    listing.make?.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
                    listing.model?.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
                    listing.year?.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
                    listing.id.toLowerCase().includes(carSearchTerm.toLowerCase())
                  ).length === 0 && carSearchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    No car listings match your search criteria.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dealers" className="mt-6">
            <div className="space-y-4">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Featured Dealers</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dealers.filter(d => d.is_featured).length}
                  </p>
                </CardContent>
              </Card>

              {/* Dealer Search */}
              <div className="mb-4">
                <Label htmlFor="dealer-search">Search Dealers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dealer-search"
                    placeholder="Search by business name, contact name, or dealer ID..."
                    value={dealerSearchTerm}
                    onChange={(e) => setDealerSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {dealers
                  .filter(dealer => 
                    dealer.business_name?.toLowerCase().includes(dealerSearchTerm.toLowerCase()) ||
                    dealer.contact_name?.toLowerCase().includes(dealerSearchTerm.toLowerCase()) ||
                    dealer.id.toLowerCase().includes(dealerSearchTerm.toLowerCase())
                  )
                  .map((dealer) => (
                  <Card key={dealer.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{dealer.business_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            <strong>ID:</strong> {dealer.id.slice(0, 8)}... • {dealer.contact_name} • {dealer.state}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={dealer.status === 'verified' ? 'default' : 'secondary'}>
                              {dealer.status}
                            </Badge>
                            {dealer.is_featured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Featured {formatDate(dealer.featured_until)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Switch
                            checked={dealer.is_featured}
                            onCheckedChange={(checked) => {
                              updateDealer(dealer.id, {
                                is_featured: checked,
                                featured_until: checked ? getExpiryDate(30) : null
                              });
                            }}
                            disabled={updating === dealer.id}
                          />
                          <Label className="text-sm">Featured (30 days)</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {dealers
                  .filter(dealer => 
                    dealer.business_name?.toLowerCase().includes(dealerSearchTerm.toLowerCase()) ||
                    dealer.contact_name?.toLowerCase().includes(dealerSearchTerm.toLowerCase()) ||
                    dealer.id.toLowerCase().includes(dealerSearchTerm.toLowerCase())
                  ).length === 0 && dealerSearchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    No dealers match your search criteria.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};