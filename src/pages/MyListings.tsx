import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, Car, CheckCircle2, ChevronDown, Eye, LogIn, Pencil, PlusCircle, RefreshCw, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Footer } from "@/components/Footer";
import { DealerRegistrationBanner } from "@/components/DealerRegistrationBanner";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useDealer } from "@/contexts/DealerContext";
import { AVAILABILITY_FRESH_DAYS, LISTING_LIFECYCLE, MOATWAVE_PREVIEWS } from "@/config/features";
import { SellerToolsPreview } from "@/components/moatwave/SellerToolsPreview";
import { describeAvailability, type AvailabilityTone } from "@/lib/availability";
import { formatDate, formatNaira } from "@/lib/format";
import { loginPathFor } from "@/lib/redirect";
import {
  confirmListingAvailability, fetchMyListings, renewListing, setListingAvailability, type MyListing,
} from "@/services/myListings";
import type { AvailabilityStatus } from "@/services/listings";

const MODERATION: Record<string, { label: string; className: string }> = {
  active: { label: "Live", className: "bg-primary text-primary-foreground" },
  pending_review: { label: "In review", className: "bg-gold text-gold-foreground" },
  pending_payment: { label: "Awaiting payment", className: "bg-accent text-accent-foreground" },
  rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground" },
};

const TONE_CLASS: Record<AvailabilityTone, string> = {
  confirmed: "text-primary",
  unconfirmed: "text-foreground/80",
  reserved: "text-foreground/80",
  closed: "text-muted-foreground",
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border bg-card p-5 shadow-sm">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-3xl font-extrabold">{value}</p>
  </div>
);

const ListingRow = ({ listing, userId }: { listing: MyListing; userId: string }) => {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["my-listings"] });

  const run = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => refresh(),
    onError: (error: Error) => toast.error(error.message || "That didn't work. Try again."),
  });

  const moderation = MODERATION[listing.status] ?? { label: listing.status, className: "bg-muted text-foreground" };
  const isLive = listing.status === "active";
  const availability = LISTING_LIFECYCLE
    ? describeAvailability(listing.availabilityStatus, listing.availabilityConfirmedAt, AVAILABILITY_FRESH_DAYS)
    : null;
  const expired = listing.expiresAt ? new Date(listing.expiresAt).getTime() < Date.now() : false;

  const setStatus = (status: AvailabilityStatus, message: string) =>
    run.mutate(() => setListingAvailability(listing.id, userId, status).then(() => toast.success(message)));

  return (
    <li className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-36">
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground"><Car className="h-8 w-8" /></div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-bold">{listing.title}</h3>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${moderation.className}`}>{moderation.label}</span>
        </div>
        <p className="mt-1 text-xl font-extrabold text-primary">{formatNaira(listing.price)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Listed {formatDate(listing.createdAt)}
          {listing.location ? ` · ${listing.location}` : ""}
        </p>
        {isLive && availability && (
          <p className={`mt-1 text-sm font-semibold ${TONE_CLASS[availability.tone]}`}>
            {availability.label}
            {listing.expiresAt && (
              <span className="font-normal text-muted-foreground">
                {" · "}{expired ? "listing period ended" : `listed until ${formatDate(listing.expiresAt)}`}
              </span>
            )}
          </p>
        )}
        {listing.status === "rejected" && (
          <p className="mt-1 text-sm text-muted-foreground">Contact support if you think this was a mistake.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {isLive && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/cars/${listing.id}`}><Eye className="mr-2 h-4 w-4" />View</Link>
          </Button>
        )}
        <Button asChild variant="outline" size="sm">
          <Link to={`/sell/edit/${listing.id}`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
        </Button>

        {LISTING_LIFECYCLE && isLive && (
          <>
            {(listing.availabilityStatus ?? "available") === "available" && (
              <Button
                size="sm"
                disabled={run.isPending}
                onClick={() => run.mutate(() => confirmListingAvailability(listing.id, userId).then(() => toast.success("Availability confirmed")))}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Still available
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={run.isPending}>
                  Update status
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>This car is…</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setStatus("available", "Marked available")}>Available</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatus("reserved", "Marked reserved")}>Reserved for a buyer</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatus("sold", "Marked sold")}>Sold</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatus("unavailable", "Withdrawn from search")}>No longer for sale</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => run.mutate(() => renewListing(listing.id).then((until) => toast.success(`Renewed until ${formatDate(until)}`)))}
                  disabled={!["available", "reserved", null].includes(listing.availabilityStatus)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Renew listing period
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </li>
  );
};

const MyListings = ({ dealerView = false }: { dealerView?: boolean }) => {
  usePageMeta({ title: dealerView ? "Dealer dashboard" : "My listings", noIndex: true });
  const { user, loading: authLoading } = useAuth();
  const { dealerInfo, isDealer, loading: dealerLoading } = useDealer();

  const listingsQuery = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: () => fetchMyListings(user!.id),
    enabled: Boolean(user),
    retry: 1,
  });

  if (authLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-10"><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <Car className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign in to manage your listings</h1>
        <Button asChild>
          <Link to={loginPathFor(dealerView ? "/dealer/dashboard" : "/my-listings")}><LogIn className="mr-2 h-4 w-4" />Sign in</Link>
        </Button>
      </div>
    );
  }

  const listings = listingsQuery.data ?? [];
  const live = listings.filter((listing) => listing.status === "active");
  const sold = listings.filter((listing) => listing.availabilityStatus === "sold");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {dealerView && !dealerLoading && (!isDealer || dealerInfo?.status !== "verified") && (
          <div className="mb-6">
            <DealerRegistrationBanner dealerStatus={dealerInfo?.status || null} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">{dealerView ? "Dealer dashboard" : "My listings"}</h1>
            {dealerView && dealerInfo?.business_name && <p className="mt-1 text-muted-foreground">{dealerInfo.business_name}</p>}
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/sell"><PlusCircle className="mr-2 h-5 w-5" />List a car</Link>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="All listings" value={listings.length} />
          <Stat label="Live" value={live.length} />
          <Stat label="In review" value={listings.filter((listing) => listing.status === "pending_review").length} />
          {LISTING_LIFECYCLE ? (
            <Stat label="Sold" value={sold.length} />
          ) : (
            <Stat label="Awaiting payment" value={listings.filter((listing) => listing.status === "pending_payment").length} />
          )}
        </div>

        {LISTING_LIFECYCLE && live.length > 0 && (
          <p className="mt-6 rounded-xl bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
            Buyers see when you last confirmed a car is available. Confirm at least every {AVAILABILITY_FRESH_DAYS} days so
            your listings don't show as needing reconfirmation.
          </p>
        )}

        <section className="mt-8" aria-label="Your listings">
          {listingsQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          )}
          {listingsQuery.isError && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="font-medium">We couldn't load your listings.</p>
              <Button variant="outline" onClick={() => listingsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
            </div>
          )}
          {listingsQuery.data && listings.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
              <Car className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">You haven't listed any cars yet.</p>
              <Button asChild><Link to="/sell">List your first car</Link></Button>
            </div>
          )}
          {listings.length > 0 && (
            <ul className="space-y-3">
              {listings.map((listing) => <ListingRow key={listing.id} listing={listing} userId={user.id} />)}
            </ul>
          )}
        </section>

        {MOATWAVE_PREVIEWS && listingsQuery.data && (
          <SellerToolsPreview
            listings={listings}
            business={
              dealerView && isDealer && dealerInfo?.business_name
                ? { name: dealerInfo.business_name, verified: dealerInfo.status === "verified" }
                : null
            }
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyListings;
