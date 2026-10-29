
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const FavoriteButton = ({ listingId, className = "", size = "sm" }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && listingId) {
      checkIfFavorite();
    }
  }, [user, listingId]);

  const checkIfFavorite = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single();

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (error) {
      // Not an error if no favorite found
      console.log('No favorite found:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to add to favorites');
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) {
          console.error('Error removing favorite:', error);
          toast.error('Failed to remove from favorites');
          return;
        }

        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: listingId });

        if (error) {
          console.error('Error adding favorite:', error);
          toast.error('Failed to add to favorites');
          return;
        }

        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error handling favorites:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size={size}
      variant="secondary" 
      className={`${
        isFavorite
          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
          : 'bg-card hover:bg-muted text-muted-foreground'
      } ${className}`}
      onClick={handleToggleFavorite}
      disabled={loading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from saved cars' : 'Save this car'}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
    </Button>
  );
};
