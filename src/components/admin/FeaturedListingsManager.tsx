import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Crown, Star, TrendingUp, Users, Car, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const FeaturedListingsManager = () => {
  const { user } = useAuth();
  const [carSearchResults, setCarSearchResults] = useState<any[]>([]);
  const [dealerSearchResults, setDealerSearchResults] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [carSearchTerm, setCarSearchTerm] = useState("");
  const [dealerSearchTerm, setDealerSearchTerm] = useState("");
  const [carSearching, setCarSearching] = useState(false);
  const [dealerSearching, setDealerSearching] = useState(false);
  
  // Pagination states
  const [carPage, setCarPage] = useState(1);
  const [dealerPage, setDealerPage] = useState(1);
  const [carTotal, setCarTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const itemsPerPage = 10;

  const searchCarListings = useCallback(async (page = 1) => {
    if (!carSearchTerm.trim()) {
      setCarSearchResults([]);
      setCarTotal(0);
      return;
    }
    
    setCarSearching(true);
    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: listings, error, count } = await supabase
        .from('car_listings')
        .select(`
          id, make, model, year, price, location, status, created_at,
          is_featured, is_top_listing, is_boosted, featured_until, boosted_until,
          boost_approved_by, boost_approved_at
        `, { count: 'exact' })
        .or(`make.ilike.%${carSearchTerm}%,model.ilike.%${carSearchTerm}%,year.ilike.%${carSearchTerm}%,id::text.ilike.%${carSearchTerm}%`)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCarSearchResults(listings || []);
      setCarTotal(count || 0);
      setCarPage(page);
    } catch (error) {
      console.error('Error searching car listings:', error);
      toast.error('Failed to search car listings');
    } finally {
      setCarSearching(false);
    }
  }, [carSearchTerm]);

  const searchDealers = useCallback(async (page = 1) => {
    if (!dealerSearchTerm.trim()) {
      setDealerSearchResults([]);
      setDealerTotal(0);
      return;
    }
    
    setDealerSearching(true);
    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: dealers, error, count } = await supabase
        .from('dealers')
        .select(`
          id, business_name, contact_name, email, state, status, created_at,
          is_featured, featured_until
        `, { count: 'exact' })
        .or(`business_name.ilike.%${dealerSearchTerm}%,contact_name.ilike.%${dealerSearchTerm}%,email.ilike.%${dealerSearchTerm}%,id::text.ilike.%${dealerSearchTerm}%`)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDealerSearchResults(dealers || []);
      setDealerTotal(count || 0);
      setDealerPage(page);
    } catch (error) {
      console.error('Error searching dealers:', error);
      toast.error('Failed to search dealers');
    } finally {
      setDealerSearching(false);
    }
  }, [dealerSearchTerm]);

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
      // Refresh search results
      searchCarListings(carPage);
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
      // Refresh search results
      searchDealers(dealerPage);
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

  // Debounced search effect for live search
  useEffect(() => {
    if (!carSearchTerm.trim()) {
      setCarSearchResults([]);
      setCarTotal(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchCarListings(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [carSearchTerm, searchCarListings]);

  useEffect(() => {
    if (!dealerSearchTerm.trim()) {
      setDealerSearchResults([]);
      setDealerTotal(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchDealers(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dealerSearchTerm, searchDealers]);

  const handleCarSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchCarListings(1);
    }
  };

  const handleDealerSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchDealers(1);
    }
  };

  const CarPagination = () => {
    const totalPages = Math.ceil(carTotal / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((carPage - 1) * itemsPerPage) + 1} to {Math.min(carPage * itemsPerPage, carTotal)} of {carTotal} results
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => searchCarListings(carPage - 1)}
                disabled={carPage <= 1 || carSearching}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <Button
                    variant={carPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => searchCarListings(pageNum)}
                    disabled={carSearching}
                  >
                    {pageNum}
                  </Button>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => searchCarListings(carPage + 1)}
                disabled={carPage >= totalPages || carSearching}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const DealerPagination = () => {
    const totalPages = Math.ceil(dealerTotal / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((dealerPage - 1) * itemsPerPage) + 1} to {Math.min(dealerPage * itemsPerPage, dealerTotal)} of {dealerTotal} results
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => searchDealers(dealerPage - 1)}
                disabled={dealerPage <= 1 || dealerSearching}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <Button
                    variant={dealerPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => searchDealers(pageNum)}
                    disabled={dealerSearching}
                  >
                    {pageNum}
                  </Button>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => searchDealers(dealerPage + 1)}
                disabled={dealerPage >= totalPages || dealerSearching}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

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
              Car Listings
            </TabsTrigger>
            <TabsTrigger value="dealers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Dealers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="mt-6">
            <div className="space-y-4">
              {/* Car Search */}
              <div className="space-y-4">
                <Label htmlFor="car-search">Search Car Listings</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="car-search"
                      placeholder="Search by make, model, year, or listing ID..."
                      value={carSearchTerm}
                      onChange={(e) => setCarSearchTerm(e.target.value)}
                      onKeyDown={handleCarSearch}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={() => searchCarListings(1)} 
                    disabled={carSearching || !carSearchTerm.trim()}
                  >
                    {carSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* Car Search Results */}
              {carSearchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Search Results
                    </h3>
                  </div>
                  <CarPagination />
                  {carSearchResults.map((listing) => (
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
                  <CarPagination />
                </div>
              )}

              {carSearchTerm && carSearchResults.length === 0 && !carSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  No car listings match your search criteria.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dealers" className="mt-6">
            <div className="space-y-4">
              {/* Dealer Search */}
              <div className="space-y-4">
                <Label htmlFor="dealer-search">Search Dealers</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dealer-search"
                      placeholder="Search by business name, contact name, email, or dealer ID..."
                      value={dealerSearchTerm}
                      onChange={(e) => setDealerSearchTerm(e.target.value)}
                      onKeyDown={handleDealerSearch}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={() => searchDealers(1)} 
                    disabled={dealerSearching || !dealerSearchTerm.trim()}
                  >
                    {dealerSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* Dealer Search Results */}
              {dealerSearchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Search Results
                    </h3>
                  </div>
                  <DealerPagination />
                  {dealerSearchResults.map((dealer) => (
                    <Card key={dealer.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{dealer.business_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              <strong>ID:</strong> {dealer.id.slice(0, 8)}... • {dealer.contact_name} • {dealer.email} • {dealer.state}
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
                  <DealerPagination />
                </div>
              )}

              {dealerSearchTerm && dealerSearchResults.length === 0 && !dealerSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  No dealers match your search criteria.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};