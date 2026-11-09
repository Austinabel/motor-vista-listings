import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface DealerContextType {
  dealerInfo: any | null;
  isDealer: boolean;
  isDealerRegistered: boolean;
  isDealerVerified: boolean;
  loading: boolean;
  refetchDealerInfo: () => Promise<void>;
}

const DealerContext = createContext<DealerContextType | undefined>(undefined);

export const useDealer = () => {
  const context = useContext(DealerContext);
  if (context === undefined) {
    throw new Error('useDealer must be used within a DealerProvider');
  }
  return context;
};

export const DealerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dealerInfo, setDealerInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDealerInfo = async () => {
    if (!user) {
      setDealerInfo(null);
      return;
    }

    setLoading(true);
    try {
      const { data: dealer, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching dealer info:', error);
      }

      setDealerInfo(dealer || null);
    } catch (error) {
      console.error('Error in fetchDealerInfo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealerInfo();
  }, [user]);

  const refetchDealerInfo = async () => {
    await fetchDealerInfo();
  };

  const isDealer = dealerInfo !== null;
  const isDealerRegistered = dealerInfo && dealerInfo.status !== null;
  const isDealerVerified = dealerInfo && dealerInfo.status === 'verified';

  const value = {
    dealerInfo,
    isDealer,
    isDealerRegistered,
    isDealerVerified,
    loading,
    refetchDealerInfo
  };

  return <DealerContext.Provider value={value}>{children}</DealerContext.Provider>;
};