import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Calendar, Car, Globe, MapPin, Phone, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { VerifiedBusinessBadge } from "@/components/VerifiedBusinessBadge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { VehicleCard, VehicleCardSkeleton } from "@/components/home/VehicleCard";
import { fetchPublicDealer } from "@/services/dealers";
import { fetchSellerListings } from "@/services/listings";

const websiteHref = (website: string) => (/^https?:\/\//i.test(website) ? website : `https://${website}`);

const DealerProfile = () => {
  const { id: dealerId } = useParams<{ id: string }>();

  const dealerQuery = useQuery({
    queryKey: ["dealer", dealerId],
    queryFn: () => fetchPublicDealer(dealerId!),
    enabled: Boolean(dealerId),
    retry: 1,
  });
  const dealer = dealerQuery.data;
  usePageMeta(
    dealer
      ? {
          title: `${dealer.businessName}${dealer.state ? `, ${dealer.state}` : ""}`,
          description: `${dealer.businessName} on Motorcars: see the cars this stand has for sale and contact them directly.`,
          image: dealer.imageUrl,
        }
      : { title: "Car stand" }
  );

  const listingsQuery = useQuery({
    queryKey: ["dealer-listings", dealer?.userId],
    queryFn: () => fetchSellerListings(dealer!.userId),
    enabled: Boolean(dealer?.userId),
    retry: 1,
  });

  if (dealerQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (dealerQuery.isError || !dealer) {
    const failed = dealerQuery.isError;
    return (
      <>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
          {failed ? <AlertCircle className="h-12 w-12 text-destructive" /> : <Store className="h-12 w-12 text-muted-foreground" />}
          <h1 className="text-2xl font-bold">{failed ? "We couldn't load this dealer" : "This dealer isn't available"}</h1>
          <p className="text-muted-foreground">
            {failed
              ? "Check your connection and try again."
              : "The profile may have been removed, may still be under review, or the link may be wrong."}
          </p>
          {failed ? (
            <Button variant="outline" onClick={() => dealerQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          ) : (
            <Button asChild>
              <Link to="/dealers">Browse car stands</Link>
            </Button>
          )}
        </div>
        <Footer />
      </>
    );
  }

  const listings = listingsQuery.data ?? [];
  const location = [dealer.address, dealer.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/dealers" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          All car stands
        </Link>

        <section className="mt-4 overflow-hidden rounded-3xl bg-brand-dark text-primary-foreground shadow-lg">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-10">
            {dealer.imageUrl ? (
              <img src={dealer.imageUrl} alt="" className="h-28 w-28 shrink-0 rounded-2xl object-cover md:h-36 md:w-36" />
            ) : (
              <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gold text-5xl font-black text-gold-foreground md:h-36 md:w-36">
                {dealer.businessName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Car stand</p>
              <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{dealer.businessName}</h1>
              <VerifiedBusinessBadge className="mt-2 bg-gold/20 text-gold" />
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-primary-foreground/80">
                {location && (
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{location}</span>
                )}
                {dealer.yearEstablished && (
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />Established {dealer.yearEstablished}</span>
                )}
              </div>
              {dealer.description && <p className="mt-4 max-w-3xl text-primary-foreground/85">{dealer.description}</p>}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
              {dealer.phone && (
                <Button asChild size="lg" className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                  <a href={`tel:${dealer.phone}`}><Phone className="mr-2 h-4 w-4" />Call the stand</a>
                </Button>
              )}
              {dealer.website && (
                <Button asChild variant="outline" size="lg" className="rounded-xl border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <a href={websiteHref(dealer.website)} target="_blank" rel="noopener noreferrer"><Globe className="mr-2 h-4 w-4" />Website</a>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Cars from this stand{listingsQuery.data ? ` (${listings.length})` : ""}
          </h2>
          <div className="mt-6">
            {listingsQuery.isLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => <VehicleCardSkeleton key={index} />)}
              </div>
            )}
            {listingsQuery.isError && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-8 text-center">
                <p className="font-medium">We couldn't load this stand's cars.</p>
                <Button variant="outline" onClick={() => listingsQuery.refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            )}
            {listingsQuery.data && listings.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-8 text-center">
                <Car className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">This stand has no cars listed right now.</p>
              </div>
            )}
            {listings.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => <VehicleCard key={listing.id} listing={listing} />)}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default DealerProfile;
