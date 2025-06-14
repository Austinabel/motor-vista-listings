
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Phone, Star, Mail, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");

  const states = [
    "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
  ];

  useEffect(() => {
    fetchVerifiedDealers();
  }, []);

  useEffect(() => {
    filterDealers();
  }, [dealers, searchTerm, selectedState]);

  const fetchVerifiedDealers = async () => {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dealers:', error);
        toast.error('Failed to load dealers');
      } else {
        setDealers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchVerifiedDealers:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterDealers = () => {
    let filtered = dealers;

    if (searchTerm) {
      filtered = filtered.filter(dealer => 
        dealer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState && selectedState !== "all") {
      filtered = filtered.filter(dealer => dealer.state === selectedState);
    }

    setFilteredDealers(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading dealers...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Car Dealers</h1>
            <p className="text-xl text-gray-600">
              Find trusted car dealers across Nigeria
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search dealers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="md:w-48">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Dealers Grid */}
          {filteredDealers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No dealers found matching your criteria</p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDealers.map((dealer: any) => (
                <Card key={dealer.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{dealer.business_name}</h3>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealer.state}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealer.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealer.email}</span>
                      </div>
                      {dealer.website && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="w-4 h-4 mr-2" />
                          <a 
                            href={dealer.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-red-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">Est. {dealer.year_established}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {dealer.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          ~{dealer.monthly_inventory} cars/month
                        </span>
                      </div>
                      <Button className="bg-red-600 hover:bg-red-700">
                        View Inventory
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Contact: {dealer.contact_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to become a verified dealer?</h2>
            <p className="text-gray-600 mb-6">
              Join our platform and reach thousands of potential customers across Nigeria
            </p>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => window.location.href = '/dealer-registration'}
            >
              Register as Dealer
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dealers;
