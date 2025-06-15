
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Clock, IdCard, CreditCard, Car, Eye, Calendar, MapPin, Fuel, User, Building, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [dealers, setDealers] = useState([]);
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDealers();
    fetchCarListings();
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("You have been logged out.");
      navigate("/admin-login");
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

  const fetchCarListings = async () => {
    try {
      // First fetch car listings
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        toast.error('Failed to load car listings');
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
      let dealersData = [];
      
      if (dealerUserIds.length > 0) {
        const { data: dealers, error: dealersError } = await supabase
          .from('dealers')
          .select('business_name, contact_name')
          .in('id', dealerUserIds);

        if (!dealersError) {
          dealersData = dealers || [];
        }
      }

      // Combine the data
      const enrichedListings = listings?.map(listing => {
        const profile = profiles?.find(p => p.id === listing.user_id);
        const dealer = dealersData?.find(d => d.id === listing.user_id);
        
        return {
          ...listing,
          profiles: profile,
          dealers: dealer ? [dealer] : []
        };
      }) || [];

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
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Car Listings Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Car Listings Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Car Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Listed By</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carListings.map((listing: any) => {
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
                              {getStatusBadge(listing.status)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(listing.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedListing(listing)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Selected Listing Details */}
              {selectedListing && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      {selectedListing.year} {selectedListing.make} {selectedListing.model} - Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Basic Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Basic Information</h4>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Make & Model:</Label>
                            <p className="text-sm">{selectedListing.make} {selectedListing.model}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Year:</Label>
                            <p className="text-sm">{selectedListing.year}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Price:</Label>
                            <p className="text-sm font-semibold">₦{selectedListing.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Condition:</Label>
                            <p className="text-sm">{selectedListing.condition}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Location:</Label>
                            <p className="text-sm">{selectedListing.location}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Listed By:</Label>
                            <div className="flex items-center gap-2 mt-1">
                              {getListedBy(selectedListing).type === 'dealer' ? (
                                <Building className="w-4 h-4 text-blue-600" />
                              ) : (
                                <User className="w-4 h-4 text-gray-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{getListedBy(selectedListing).name}</p>
                                <p className="text-xs text-gray-500 capitalize">{getListedBy(selectedListing).type}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Technical Details</h4>
                        <div className="space-y-2">
                          {selectedListing.mileage && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Mileage:</Label>
                              <p className="text-sm">{selectedListing.mileage} km</p>
                            </div>
                          )}
                          {selectedListing.fuel_type && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Fuel Type:</Label>
                              <p className="text-sm">{selectedListing.fuel_type}</p>
                            </div>
                          )}
                          {selectedListing.transmission && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Transmission:</Label>
                              <p className="text-sm">{selectedListing.transmission}</p>
                            </div>
                          )}
                          {selectedListing.color && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Color:</Label>
                              <p className="text-sm">{selectedListing.color}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Listing Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Listing Information</h4>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Plan:</Label>
                            <div>{getPlanBadge(selectedListing.listing_plan)}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Listing Fee:</Label>
                            <p className="text-sm">₦{selectedListing.listing_price.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Duration:</Label>
                            <p className="text-sm">{selectedListing.listing_duration} days</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Expires:</Label>
                            <p className="text-sm">{new Date(selectedListing.expires_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Status:</Label>
                            <div>{getStatusBadge(selectedListing.status)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {selectedListing.features && selectedListing.features.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-lg border-b pb-2 mb-3">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedListing.features.map((feature: string, index: number) => (
                            <Badge key={index} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedListing.description && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-lg border-b pb-2 mb-3">Description</h4>
                        <p className="text-sm text-gray-700">{selectedListing.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-6 border-t mt-6">
                      {selectedListing.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateListingStatus(selectedListing.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Listing
                          </Button>
                          <Button
                            onClick={() => updateListingStatus(selectedListing.id, 'rejected')}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Listing
                          </Button>
                        </>
                      )}
                      {selectedListing.status === 'approved' && (
                        <Button
                          onClick={() => updateListingStatus(selectedListing.id, 'rejected')}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Revoke Approval
                        </Button>
                      )}
                      {selectedListing.status === 'rejected' && (
                        <Button
                          onClick={() => updateListingStatus(selectedListing.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Listing
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedListing(null)}
                        variant="outline"
                      >
                        Close Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dealers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dealers List */}
              <Card>
                <CardHeader>
                  <CardTitle>Dealer Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dealers.map((dealer: any) => (
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
                  </div>
                </CardContent>
              </Card>

              {/* Dealer Details */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDealer ? `${selectedDealer.business_name} Details` : 'Select a Dealer'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDealer ? (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Business Name</Label>
                          <p className="text-sm text-gray-900">{selectedDealer.business_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Contact Person</Label>
                          <p className="text-sm text-gray-900">{selectedDealer.contact_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <p className="text-sm text-gray-900">{selectedDealer.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <p className="text-sm text-gray-900">{selectedDealer.phone}</p>
                        </div>
                      </div>

                      {/* ID Verification */}
                      {selectedDealer.id_card_number && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-700 flex items-center mb-2">
                            <IdCard className="w-4 h-4 mr-2" />
                            ID Card Verification
                          </h4>
                          <p className="text-sm text-gray-700">
                            ID Number: {selectedDealer.id_card_number}
                          </p>
                        </div>
                      )}

                      {/* Payment Information */}
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-700 flex items-center mb-2">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Payment Information
                        </h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            Status: {getPaymentStatusBadge(selectedDealer.payment_status)}
                          </p>
                          {selectedDealer.payment_reference && (
                            <p className="text-sm text-gray-700">
                              Reference: {selectedDealer.payment_reference}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Business Details */}
                      <div>
                        <Label className="text-sm font-medium">Business Description</Label>
                        <p className="text-sm text-gray-900 mt-1">{selectedDealer.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">CAC Number</Label>
                          <p className="text-sm text-gray-900">{selectedDealer.cac_number}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Year Established</Label>
                          <p className="text-sm text-gray-900">{selectedDealer.year_established}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-4 border-t">
                        {selectedDealer.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateDealerStatus(selectedDealer.id, 'verified')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateDealerStatus(selectedDealer.id, 'rejected')}
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        {selectedDealer.status === 'verified' && (
                          <Button
                            onClick={() => updateDealerStatus(selectedDealer.id, 'rejected')}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Revoke Verification
                          </Button>
                        )}
                        {selectedDealer.status === 'rejected' && (
                          <Button
                            onClick={() => updateDealerStatus(selectedDealer.id, 'verified')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Select a dealer from the list to view details
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
