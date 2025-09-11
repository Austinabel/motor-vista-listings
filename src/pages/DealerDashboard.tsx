
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Car, Eye, TrendingUp, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDealer } from "@/contexts/DealerContext";
import { DealerRegistrationBanner } from "@/components/DealerRegistrationBanner";
import { toast } from "sonner";

const DealerDashboard = () => {
  const { user } = useAuth();
  const { dealerInfo, isDealer, loading: dealerLoading } = useDealer();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDealerData();
    }
  }, [user]);

  const fetchDealerData = async () => {
    try {
      // Fetch dealer's listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images (
            image_url,
            is_primary
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        toast.error('Failed to load listings');
      } else {
        setListings(listingsData || []);
      }
    } catch (error) {
      console.error('Error in fetchDealerData:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };

  if (loading || dealerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingListings = listings.filter(l => l.status === 'pending_review').length;
  const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Show registration banner if dealer is not verified */}
          {user && (!isDealer || dealerInfo?.status !== 'verified') && (
            <DealerRegistrationBanner 
              dealerStatus={dealerInfo?.status || null} 
            />
          )}
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dealer Dashboard</h1>
              {dealerInfo && (
                <p className="text-gray-600">{dealerInfo.business_name}</p>
              )}
            </div>
            <Link to="/sell">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                List a New Car
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Listings</p>
                    <p className="text-2xl font-bold">{listings.length}</p>
                  </div>
                  <Car className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-green-600">{activeListings}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingListings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold">{totalViews}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Your Car Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car Details</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Listed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {listing.year} {listing.make} {listing.model}
                            </div>
                            <div className="text-sm text-gray-500">{listing.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">₦{listing.price.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(listing.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(listing.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link to={`/cars/${listing.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't listed any cars yet.</p>
                  <Link to="/sell">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      List Your First Car
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DealerDashboard;
