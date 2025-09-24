
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Clock, IdCard, CreditCard, Car, Eye, Calendar, MapPin, Fuel, User, Building, LogOut, Settings, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DealerDetails } from "@/components/admin/DealerDetails";
import { ListingModal } from "@/components/admin/ListingModal";

const Admin = () => {
  const [dealers, setDealers] = useState([]);
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingPlansEnabled, setListingPlansEnabled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchDealers();
      fetchCarListings();
      fetchListingPlansStatus();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      // Check if user is logged in
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: isUserAdmin, error } = await supabase
        .rpc('is_admin', { user_id: user.id });

      if (error) {
        console.error('Error checking admin status:', error);
        toast.error('Access verification failed');
        navigate("/");
        return;
      }

      if (!isUserAdmin) {
        toast.error('Access denied. Admin privileges required.');
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error in checkAdminAccess:', error);
      toast.error('Access verification failed');
      navigate("/");
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("You have been logged out.");
      navigate("/");
    }
  };

  const fetchDealers = async () => {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dealers:', error);
        toast.error('Failed to load dealers');
      } else {
        setDealers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDealers:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchListingPlansStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'listing_plans_enabled')
        .single();
      
      if (!error && data) {
        setListingPlansEnabled(data.value === 'true' || data.value === true);
      }
    } catch (error) {
      console.error('Error fetching listing plans status:', error);
    }
  };

  const toggleListingPlans = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'listing_plans_enabled');

      if (error) {
        console.error('Error updating listing plans status:', error);
        toast.error('Failed to update listing plans status');
      } else {
        setListingPlansEnabled(enabled);
        toast.success(`Listing plans ${enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error('Error in toggleListingPlans:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const fetchCarListings = async () => {
    try {
      // First fetch car listings with images
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images(id, image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        toast.error('Failed to load car listings');
        return;
      }

      // For admin access, use secure function to get seller info
      const enrichedListings = await Promise.all(
        (listings || []).map(async (listing) => {
          // Get seller info using secure function (works for active listings)
          const { data: sellerInfo, error: sellerError } = await supabase
            .rpc('get_seller_info_for_listing', { listing_user_id: listing.user_id });

          let dealerInfo = null;
          
          // If seller is a dealer, fetch dealer information
          if (sellerInfo && sellerInfo.length > 0 && sellerInfo[0]?.user_type === 'dealer') {
            const { data: dealersData, error: dealersError } = await supabase
              .from('dealers')
              .select('user_id, business_name, contact_name')
              .eq('user_id', listing.user_id)
              .single();

            if (!dealersError) {
              dealerInfo = dealersData;
            }
          }

          return {
            ...listing,
            profiles: sellerInfo && sellerInfo.length > 0 ? sellerInfo[0] : null,
            dealers: dealerInfo ? [dealerInfo] : []
          };
        })
      );

      setCarListings(enrichedListings);
    } catch (error) {
      console.error('Error in fetchCarListings:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const updateDealerStatus = async (dealerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('dealers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId);

      if (error) {
        console.error('Error updating dealer status:', error);
        toast.error('Failed to update dealer status');
      } else {
        toast.success(`Dealer ${newStatus} successfully`);
        fetchDealers();
        setSelectedDealer(null);
      }
    } catch (error) {
      console.error('Error in updateDealerStatus:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const updateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      console.log('Updating listing status:', { listingId, newStatus });
      
      const { error } = await supabase
        .from('car_listings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) {
        console.error('Error updating listing status:', error);
        toast.error(`Failed to update listing status: ${error.message}`);
      } else {
        toast.success(`Listing ${newStatus} successfully`);
        fetchCarListings();
        setSelectedListing(null);
      }
    } catch (error) {
      console.error('Error in updateListingStatus:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      // First delete related images
      await supabase
        .from('car_listing_images')
        .delete()
        .eq('listing_id', listingId);

      // Then delete the listing
      const { error } = await supabase
        .from('car_listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        console.error('Error deleting listing:', error);
        toast.error(`Failed to delete listing: ${error.message}`);
      } else {
        toast.success('Listing deleted successfully');
        fetchCarListings();
        setSelectedListing(null);
      }
    } catch (error) {
      console.error('Error in deleteListing:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const deleteDealer = async (dealerId: string) => {
    try {
      const { error } = await supabase
        .from('dealers')
        .delete()
        .eq('id', dealerId);

      if (error) {
        console.error('Error deleting dealer:', error);
        toast.error(`Failed to delete dealer: ${error.message}`);
      } else {
        toast.success('Dealer deleted successfully');
        fetchDealers();
        setSelectedDealer(null);
      }
    } catch (error) {
      console.error('Error in deleteDealer:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const getListedBy = (listing: any) => {
    if (listing.profiles?.user_type === 'dealer' && listing.dealers?.[0]) {
      return {
        type: 'dealer',
        name: listing.dealers[0].business_name,
        contact: listing.dealers[0].contact_name
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'featured':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>;
      case 'standard':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Standard</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Free</Badge>;
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <div>Verifying admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Dealers: {dealers.length} | Car Listings: {carListings.length}
            </div>
            <Button onClick={() => { fetchDealers(); fetchCarListings(); }} variant="outline">
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">Car Listings</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Review ({carListings.filter((l: any) => l.status === 'pending_review').length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approved ({carListings.filter((l: any) => l.status === 'active').length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Rejected ({carListings.filter((l: any) => l.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Listings */}
              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      Pending Review Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Car Details</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Listed By</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carListings
                          .filter((listing: any) => listing.status === 'pending_review')
                          .map((listing: any) => {
                            const listedBy = getListedBy(listing);
                            return (
                              <TableRow 
                                key={listing.id}
                                className={selectedListing?.id === listing.id ? 'bg-red-50' : ''}
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-semibold">
                                      {listing.year} {listing.make} {listing.model}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {listing.location}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold">₦{listing.price.toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">{listing.condition}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {listedBy.type === 'dealer' ? (
                                      <Building className="w-3 h-3 text-blue-600" />
                                    ) : (
                                      <User className="w-3 h-3 text-gray-600" />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium">{listedBy.name}</div>
                                      {listedBy.contact && (
                                        <div className="text-xs text-gray-500">{listedBy.contact}</div>
                                      )}
                                      <div className="text-xs text-gray-400 capitalize">{listedBy.type}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getPlanBadge(listing.listing_plan)}
                                  <div className="text-xs text-gray-500 mt-1">
                                    ₦{listing.listing_price.toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {new Date(listing.created_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        console.log('Opening modal for listing:', listing);
                                        console.log('Listing images:', listing.car_listing_images);
                                        setSelectedListing(listing);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Review
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => updateListingStatus(listing.id, 'active')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateListingStatus(listing.id, 'rejected')}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {carListings.filter((l: any) => l.status === 'pending_review').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                              <div className="font-medium">No pending listings</div>
                              <div className="text-sm">All listings have been reviewed</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Approved Listings */}
              <TabsContent value="approved">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Approved Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Car Details</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Listed By</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carListings
                          .filter((listing: any) => listing.status === 'active')
                          .map((listing: any) => {
                            const listedBy = getListedBy(listing);
                            return (
                              <TableRow 
                                key={listing.id}
                                className={selectedListing?.id === listing.id ? 'bg-red-50' : ''}
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-semibold">
                                      {listing.year} {listing.make} {listing.model}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {listing.location}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold">₦{listing.price.toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">{listing.condition}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {listedBy.type === 'dealer' ? (
                                      <Building className="w-3 h-3 text-blue-600" />
                                    ) : (
                                      <User className="w-3 h-3 text-gray-600" />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium">{listedBy.name}</div>
                                      {listedBy.contact && (
                                        <div className="text-xs text-gray-500">{listedBy.contact}</div>
                                      )}
                                      <div className="text-xs text-gray-400 capitalize">{listedBy.type}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getPlanBadge(listing.listing_plan)}
                                  <div className="text-xs text-gray-500 mt-1">
                                    ₦{listing.listing_price.toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {new Date(listing.created_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        console.log('Opening modal for listing:', listing);
                                        console.log('Listing images:', listing.car_listing_images);
                                        setSelectedListing(listing);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`/cars/${listing.id}`, '_blank')}
                                    >
                                      Public View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateListingStatus(listing.id, 'rejected')}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {carListings.filter((l: any) => l.status === 'active').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                              <div className="font-medium">No approved listings</div>
                              <div className="text-sm">No active listings found</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rejected Listings */}
              <TabsContent value="rejected">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Rejected Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Car Details</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Listed By</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carListings
                          .filter((listing: any) => listing.status === 'rejected')
                          .map((listing: any) => {
                            const listedBy = getListedBy(listing);
                            return (
                              <TableRow 
                                key={listing.id}
                                className={selectedListing?.id === listing.id ? 'bg-red-50' : ''}
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-semibold">
                                      {listing.year} {listing.make} {listing.model}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {listing.location}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold">₦{listing.price.toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">{listing.condition}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {listedBy.type === 'dealer' ? (
                                      <Building className="w-3 h-3 text-blue-600" />
                                    ) : (
                                      <User className="w-3 h-3 text-gray-600" />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium">{listedBy.name}</div>
                                      {listedBy.contact && (
                                        <div className="text-xs text-gray-500">{listedBy.contact}</div>
                                      )}
                                      <div className="text-xs text-gray-400 capitalize">{listedBy.type}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getPlanBadge(listing.listing_plan)}
                                  <div className="text-xs text-gray-500 mt-1">
                                    ₦{listing.listing_price.toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {new Date(listing.created_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        console.log('Opening modal for listing:', listing);
                                        console.log('Listing images:', listing.car_listing_images);
                                        setSelectedListing(listing);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Review
                                    </Button>
                                     <Button
                                       size="sm"
                                       onClick={() => updateListingStatus(listing.id, 'active')}
                                       className="bg-green-600 hover:bg-green-700"
                                     >
                                       <CheckCircle className="w-4 h-4 mr-1" />
                                       Approve
                                     </Button>
                                     <Button
                                       size="sm"
                                       variant="destructive"
                                       onClick={() => deleteListing(listing.id)}
                                     >
                                       <Trash2 className="w-4 h-4 mr-1" />
                                       Delete
                                     </Button>
                                   </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {carListings.filter((l: any) => l.status === 'rejected').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              <XCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                              <div className="font-medium">No rejected listings</div>
                              <div className="text-sm">All listings are in good standing</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Listing Modal */}
            <ListingModal
              listing={selectedListing}
              isOpen={!!selectedListing}
              onClose={() => setSelectedListing(null)}
              onUpdateStatus={updateListingStatus}
            />
          </TabsContent>

          <TabsContent value="dealers">
            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({dealers.filter((d: any) => d.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verified ({dealers.filter((d: any) => d.status === 'verified').length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Rejected ({dealers.filter((d: any) => d.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Dealers */}
              <TabsContent value="pending">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        Pending Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {dealers
                          .filter((dealer: any) => dealer.status === 'pending')
                          .map((dealer: any) => (
                            <div
                              key={dealer.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedDealer?.id === dealer.id
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedDealer(dealer)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {dealer.business_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {dealer.contact_name} • {dealer.state}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Applied: {new Date(dealer.created_at).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    {getStatusBadge(dealer.status)}
                                    {getPaymentStatusBadge(dealer.payment_status)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(dealer.status)}
                                  {dealer.id_card_number && (
                                    <IdCard className="w-4 h-4 text-blue-600" />
                                  )}
                                  {dealer.payment_status === 'completed' && (
                                    <CreditCard className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        {dealers.filter((d: any) => d.status === 'pending').length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <div className="font-medium">No pending applications</div>
                            <div className="text-sm">All applications have been reviewed</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <DealerDetails 
                    dealer={selectedDealer} 
                    onUpdateStatus={updateDealerStatus}
                    onDelete={deleteDealer}
                  />
                </div>
              </TabsContent>

              {/* Approved Dealers */}
              <TabsContent value="approved">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Verified Dealers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {dealers
                          .filter((dealer: any) => dealer.status === 'verified')
                          .map((dealer: any) => (
                            <div
                              key={dealer.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedDealer?.id === dealer.id
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedDealer(dealer)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {dealer.business_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {dealer.contact_name} • {dealer.state}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Verified: {new Date(dealer.created_at).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    {getStatusBadge(dealer.status)}
                                    {getPaymentStatusBadge(dealer.payment_status)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(dealer.status)}
                                  {dealer.id_card_number && (
                                    <IdCard className="w-4 h-4 text-blue-600" />
                                  )}
                                  {dealer.payment_status === 'completed' && (
                                    <CreditCard className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        {dealers.filter((d: any) => d.status === 'verified').length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <div className="font-medium">No verified dealers</div>
                            <div className="text-sm">No dealers have been verified yet</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <DealerDetails 
                    dealer={selectedDealer} 
                    onUpdateStatus={updateDealerStatus}
                    onDelete={deleteDealer}
                  />
                </div>
              </TabsContent>

              {/* Rejected Dealers */}
              <TabsContent value="rejected">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        Rejected Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {dealers
                          .filter((dealer: any) => dealer.status === 'rejected')
                          .map((dealer: any) => (
                            <div
                              key={dealer.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedDealer?.id === dealer.id
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedDealer(dealer)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {dealer.business_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {dealer.contact_name} • {dealer.state}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Rejected: {new Date(dealer.created_at).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    {getStatusBadge(dealer.status)}
                                    {getPaymentStatusBadge(dealer.payment_status)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(dealer.status)}
                                  {dealer.id_card_number && (
                                    <IdCard className="w-4 h-4 text-blue-600" />
                                  )}
                                  {dealer.payment_status === 'completed' && (
                                    <CreditCard className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        {dealers.filter((d: any) => d.status === 'rejected').length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <XCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <div className="font-medium">No rejected applications</div>
                            <div className="text-sm">All applications are in good standing</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <DealerDetails 
                    dealer={selectedDealer} 
                    onUpdateStatus={updateDealerStatus}
                    onDelete={deleteDealer}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Application Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Listing Plans</Label>
                    <p className="text-sm text-gray-600">
                      Enable or disable pricing plans for car listings. When disabled, all listings are free.
                    </p>
                  </div>
                  <Switch
                    checked={listingPlansEnabled}
                    onCheckedChange={toggleListingPlans}
                  />
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Current Status</h4>
                      <p className="text-sm text-blue-700">
                        Listing plans are currently <strong>{listingPlansEnabled ? 'enabled' : 'disabled'}</strong>.
                        {listingPlansEnabled ? ' Users can choose between free, standard, and featured plans.' : ' All listings are free for users.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Dealers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dealers.filter(d => d.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Verified Dealers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dealers.filter(d => d.status === 'verified').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Car className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Listings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {carListings.filter(l => l.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Approved Listings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {carListings.filter(l => l.status === 'approved').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
