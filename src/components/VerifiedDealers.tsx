
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const VerifiedDealers = () => {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [visibleDealers, setVisibleDealers] = useState(12);
  const [showLoadMore, setShowLoadMore] = useState(true);

  useEffect(() => {
    fetchVerifiedDealers();
  }, []);

  const fetchVerifiedDealers = async () => {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching dealers:', error);
      } else {
        setDealers(data || []);
        if ((data || []).length <= 12) {
          setShowLoadMore(false);
        }
      }
    } catch (error) {
      console.error('Error in fetchVerifiedDealers:', error);
    }
  };

  const getDealerImage = (dealer: any) => {
    // Use uploaded dealer image if available, otherwise fallback to random image
    if (dealer.image_url && (
      dealer.image_url.startsWith('http') || 
      dealer.image_url.includes('supabase') ||
      dealer.image_url.includes('car-listing-images')
    )) {
      return dealer.image_url;
    }
    return getRandomImage();
  };

  const handleLoadMore = () => {
    if (visibleDealers >= dealers.length) {
      setShowLoadMore(false);
      return;
    }
    
    const newVisible = Math.min(visibleDealers + 6, dealers.length);
    setVisibleDealers(newVisible);
    
    if (newVisible >= dealers.length) {
      setShowLoadMore(false);
    }
  };

  const handleViewDealer = (dealer: any) => {
    navigate(`/dealer/${dealer.id}`);
  };

  const getRandomImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1562141961-f1e70c7d2ac6?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1517524206127-6d22353d8482?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop",
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  return (
    <section className="py-16 bg-gradient-to-b from-red-600 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Verified Dealers</h2>
          <p className="text-white/90 text-lg">Trusted car dealers verified by our team</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {dealers.slice(0, visibleDealers).map((dealer: any) => (
            <Card key={dealer.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <img 
                  src={getDealerImage(dealer)} 
                  alt={dealer.business_name}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-1 right-1 bg-green-500 hover:bg-green-600 text-xs">
                  <Shield className="w-2 h-2 mr-1" />
                  Verified
                </Badge>
              </div>
              <CardContent className="p-3">
                <h3 className="font-bold text-sm mb-2 truncate">{dealer.business_name}</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{dealer.state}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    <span className="truncate">{dealer.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                      <span>4.{Math.floor(Math.random() * 4) + 5}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      {dealer.monthly_inventory} cars
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-xs py-1"
                  onClick={() => handleViewDealer(dealer)}
                >
                  View Dealer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {showLoadMore && dealers.length > visibleDealers && (
          <div className="text-center mt-8">
            <Button 
              onClick={handleLoadMore}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              Load More Dealers
            </Button>
          </div>
        )}

        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/dealers')}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
          >
            View All Dealers
          </Button>
        </div>
      </div>
    </section>
  );
};
