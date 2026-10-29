import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Heart, LogIn, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { VehicleCard } from "@/components/home/VehicleCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatDate } from "@/lib/format";
import { loginPathFor } from "@/lib/redirect";
import { fetchSavedCars, removeSavedCar } from "@/services/favorites";

const Favorites = () => {
  usePageMeta({ title: "Saved cars", noIndex: true });
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: ["saved-cars", user?.id],
    queryFn: () => fetchSavedCars(user!.id),
    enabled: Boolean(user),
    retry: 1,
  });

  const remove = useMutation({
    mutationFn: (listingId: string) => removeSavedCar(user!.id, listingId),
    onSuccess: () => {
      toast.success("Removed from saved cars");
      queryClient.invalidateQueries({ queryKey: ["saved-cars"] });
    },
    onError: () => toast.error("Couldn't remove it. Try again."),
  });

  if (authLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-10"><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <Heart className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign in to see your saved cars</h1>
        <Button asChild><Link to={loginPathFor("/profile/favorites")}><LogIn className="mr-2 h-4 w-4" />Sign in</Link></Button>
      </div>
    );
  }

  const saved = savedQuery.data ?? [];
  const available = saved.filter((item) => item.listing);
  const gone = saved.filter((item) => !item.listing);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold md:text-4xl">Saved cars</h1>
        <p className="mt-1 text-muted-foreground">
          {savedQuery.data ? `${saved.length} saved` : "Cars you have saved to look at again."}
        </p>

        <div className="mt-8">
          {savedQuery.isLoading && <div className="h-64 animate-pulse rounded-2xl bg-muted" />}

          {savedQuery.isError && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="font-medium">We couldn't load your saved cars.</p>
              <Button variant="outline" onClick={() => savedQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
            </div>
          )}

          {savedQuery.data && saved.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
              <Heart className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">You haven't saved any cars yet.</p>
              <p className="text-sm text-muted-foreground">Tap the heart on any car to keep it here.</p>
              <Button asChild><Link to="/cars">Browse cars</Link></Button>
            </div>
          )}

          {available.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {available.map((item) => <VehicleCard key={item.favoriteId} listing={item.listing!} />)}
            </div>
          )}

          {gone.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold">No longer available</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These cars were sold, withdrawn by the seller, or taken down.
              </p>
              <ul className="mt-4 space-y-2">
                {gone.map((item) => (
                  <li key={item.favoriteId} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
                    <span className="text-sm text-muted-foreground">Saved {formatDate(item.savedAt)}</span>
                    <Button variant="ghost" size="sm" onClick={() => remove.mutate(item.listingId)} disabled={remove.isPending}>
                      <Trash2 className="mr-2 h-4 w-4" />Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
