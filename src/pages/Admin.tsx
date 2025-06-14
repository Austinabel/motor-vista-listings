import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Clock, IdCard, CreditCard } from "lucide-react";

const Admin = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState(null);

  useEffect(() => {
    fetchDealers();
  }, []);

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
        fetchDealers(); // Refresh the list
        setSelectedDealer(null);
      }
    } catch (error) {
      console.error('Error in updateDealerStatus:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
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
              Total Dealers: {dealers.length}
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dealers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dealers">Dealer Management</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Applications</p>
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
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rejected Applications</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dealers.filter(d => d.status === 'rejected').length}
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
