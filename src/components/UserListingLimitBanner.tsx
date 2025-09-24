import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDealer } from "@/contexts/DealerContext";
import { supabase } from "@/integrations/supabase/client";

export const UserListingLimitBanner = () => {
  const { user } = useAuth();
  const { isDealer } = useDealer();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || isDealer) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('monthly_listings_used, monthly_listings_reset_date')
        .eq('id', user.id)
        .single();

      if (!error && profile) {
        setUserProfile(profile);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [user, isDealer]);

  // Don't show for dealers or when loading
  if (loading || isDealer || !user || !userProfile) {
    return null;
  }

  const usedListings = userProfile.monthly_listings_used || 0;
  const remainingListings = 5 - usedListings;

  // Don't show if user hasn't used any listings yet
  if (usedListings === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Car className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-900">Monthly Free Listings</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {remainingListings > 0 ? (
                <>
                  You have <span className="font-semibold">{remainingListings} free listings</span> remaining this month.
                </>
              ) : (
                <>
                  You've used all 5 free listings this month. 
                  <span className="font-semibold"> Upgrade to a paid plan</span> to list more cars.
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};