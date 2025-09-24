import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Star, TrendingUp, Calendar, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancementRequest {
  id: string;
  listing_id: string;
  user_id: string;
  enhancement_type: string;
  status: string;
  duration_days: number;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  payment_reference?: string;
  car_listings?: {
    make: string;
    model: string;
    year: string;
    price: number;
    location: string;
  } | null;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const ListingEnhancementManager = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EnhancementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listing_enhancement_requests')
        .select(`
          *,
          car_listings (make, model, year, price, location),
          profiles (first_name, last_name)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch enhancement requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    if (!user) return;
    
    setProcessing(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update the request status
        const { error: requestError } = await supabase
        .from('listing_enhancement_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // If approved, update the car listing
      if (status === 'approved') {
        const updates: any = {};
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + request.duration_days);

        switch (request.enhancement_type) {
          case 'featured':
            updates.is_featured = true;
            updates.featured_until = expiryDate.toISOString();
            break;
          case 'boosted':
            updates.is_boosted = true;
            updates.boosted_until = expiryDate.toISOString();
            updates.boost_approved_by = user.id;
            updates.boost_approved_at = new Date().toISOString();
            break;
          case 'top_listing':
            updates.is_top_listing = true;
            break;
        }

        const { error: listingError } = await supabase
          .from('car_listings')
          .update(updates)
          .eq('id', request.listing_id);

        if (listingError) throw listingError;
      }

      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const getEnhancementIcon = (type: string) => {
    switch (type) {
      case 'featured': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'boosted': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'top_listing': return <Star className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.car_listings?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.car_listings?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.listing_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading enhancement requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Listing Enhancement Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Approved</h3>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold">Rejected</h3>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search Requests</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by car, request ID, or listing ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getEnhancementIcon(request.enhancement_type)}
                      <h3 className="font-semibold capitalize">
                        {request.enhancement_type.replace('_', ' ')} Request
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Request ID:</strong> {request.id.slice(0, 8)}...</p>
                        <p><strong>Listing ID:</strong> {request.listing_id.slice(0, 8)}...</p>
                        <p><strong>Car:</strong> {request.car_listings?.year} {request.car_listings?.make} {request.car_listings?.model}</p>
                        <p><strong>Price:</strong> ₦{request.car_listings?.price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p><strong>Requested by:</strong> {request.profiles?.first_name} {request.profiles?.last_name}</p>
                        <p><strong>Duration:</strong> {request.duration_days} days</p>
                        <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleDateString()}</p>
                        {request.payment_reference && (
                          <p><strong>Payment Ref:</strong> {request.payment_reference}</p>
                        )}
                      </div>
                    </div>

                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm"><strong>Admin Notes:</strong> {request.admin_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, 'approved')}
                        disabled={processing === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing === request.id ? '...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const notes = prompt('Add rejection notes (optional):');
                          handleRequest(request.id, 'rejected', notes || undefined);
                        }}
                        disabled={processing === request.id}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {processing === request.id ? '...' : 'Reject'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No requests match your search criteria.' 
                : 'No enhancement requests found.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};