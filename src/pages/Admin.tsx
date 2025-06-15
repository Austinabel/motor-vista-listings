
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Admin: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Rename state to reflect proper table name
  const [carListings, setCarListings] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCarListings = async () => {
      // Use correct table name
      const { data, error } = await supabase
        .from('car_listings')
        .select('*');

      if (error) {
        console.error('Error fetching car listings:', error);
      } else {
        setCarListings(data || []);
      }
    };

    const fetchDealers = async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select('*');

      if (error) {
        console.error('Error fetching dealers:', error);
      } else {
        setDealers(data || []);
      }
    };

    fetchCarListings();
    fetchDealers();
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been logged out of the admin panel."
      });
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full flex justify-end">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="w-full mt-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Car Listings</h2>
          {carListings.length > 0 ? (
            <ul className="list-disc pl-5">
              {carListings.map((car) => (
                <li key={car.id}>
                  {/* Use car_listings fields: make, model, status */}
                  {car.make} - {car.model} ({car.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>No car listings found.</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Dealers</h2>
          {dealers.length > 0 ? (
            <ul className="list-disc pl-5">
              {dealers.map((dealer) => (
                <li key={dealer.id}>{dealer.business_name} - {dealer.state}</li>
              ))}
            </ul>
          ) : (
            <p>No dealers found.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin;
