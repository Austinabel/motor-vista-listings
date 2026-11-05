import { useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle, ArrowLeft, Building, CalendarClock, Car, CircleHelp, Info, LogIn, MapPin, Phone, RefreshCw,
  Share2, ShieldAlert, User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { FavoriteButton } from "@/components/FavoriteButton";
import MessageSellerButton from "@/components/MessageSellerButton";
import { ImageGallery } from "@/components/listing/ImageGallery";
import { ReportListingDialog } from "@/components/listing/ReportListingDialog";
import { AVAILABILITY_FRESH_DAYS, LISTING_LIFECYCLE } from "@/config/features";
import { useAllFeatureModes } from "@/hooks/useFeatureMode";
import { MidBadge } from "@/components/mid/MidBadge";
import { ListingHistory } from "@/components/inventory/ListingHistory";
import { WaveChatStart } from "@/components/wavechat/WaveChatStart";
import { WaveChatPreview } from "@/components/moatwave/WaveChatPreview";
import { TrustRecordPreview } from "@/components/moatwave/TrustRecordPreview";
import { ArgusListingPreview } from "@/components/moatwave/ArgusListingPreview";
import { describeAvailability } from "@/lib/availability";
import { VehicleCard } from "@/components/home/VehicleCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { loginPathFor } from "@/lib/redirect";
import { fetchListingDetail, fetchSimilarListings, type ListingDetail } from "@/services/listings";
import { fetchSellerPublicInfo, type SellerPublicInfo } from "@/services/sellers";
import {
  capitalise, formatCondition, formatDate, formatListedAgo, formatMileage, formatNaira, toWhatsAppNumber,
} from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  pending_review: "waiting for review",
  pending_payment: "waiting for payment",
  rejected: "rejected",
};

const titleOf = (listing: ListingDetail) => `${listing.year} ${listing.make} ${listing.model}`;

/** Specifications the seller actually filled in; nothing is inferred. */
const specsOf = (listing: ListingDetail) =>
  [
    ["Year", String(listing.year)],
    ["Make", listing.make],
    ["Model", listing.model],
    ["Condition", formatCondition(listing.condition)],
    ["Mileage", listing.mileage != null ? formatMileage(listing.mileage) : null],
    ["Gearbox", listing.transmission ? capitalise(listing.transmission) : null],
    ["Fuel", listing.fuelType ? capitalise(listing.fuelType) : null],
    ["Colour", listing.color ? capitalise(listing.color) : null],
  ].filter((spec): spec is [string, string] => Boolean(spec[1]));

const DetailSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading car details">
    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="aspect-[16/10] animate-pulse rounded-2xl bg-muted" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  </div>
);

const StateMessage = ({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action: ReactNode }) => (
  <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
    {icon}
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground">{text}</p>
    <div className="mt-2">{action}</div>
  </div>
);

const SellerCard = ({
  listing,
  seller,
  sellerLoading,
  isOwner,
  signedIn,
  waveChatLive,
}: {
  listing: ListingDetail;
  seller: SellerPublicInfo | undefined;
  sellerLoading: boolean;
  isOwner: boolean;
  signedIn: boolean;
  /** WaveChat replaces the old message button when it is live */
  waveChatLive: boolean;
}) => {
  const title = titleOf(listing);
  const isDealer = seller?.kind === "dealer";
  const name = isDealer
    ? seller?.dealer?.businessName ?? "Dealer"
    : seller?.kind === "private"
      ? seller.displayName ?? "Private seller"
      : "Seller";
  const whatsApp = seller?.phone ? toWhatsAppNumber(seller.phone) : null;
  const whatsAppText = `Hello, I saw your ${title} on Motorcars (${window.location.href}). Is it still available?`;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Seller</p>

      {sellerLoading ? (
        <div className="mt-3 h-12 animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-gold">
            {isDealer ? <Building className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              {/* The type is repeated only under a real name, never as "Dealer / Dealer" */}
              {isDealer
                ? seller?.dealer ? "Dealer" : "Business name shown once the dealer is approved"
                : seller?.kind === "private"
                  ? seller.displayName ? "Private seller" : "Name hidden by the seller"
                  : "Seller type not available"}
              {seller?.dealer?.state ? ` · ${seller.dealer.state}` : ""}
            </p>
            <div className="mt-2">
              <MidBadge userId={listing.userId} />
            </div>
            {seller?.dealer && (
              <Link to={`/dealer/${seller.dealer.id}`} className="text-sm font-semibold text-primary hover:underline">
                View dealer profile
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {isOwner ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">This is your listing.</p>
        ) : signedIn ? (
          <>
            {whatsApp && (
              <Button asChild size="lg" className="w-full">
                <a href={`https://wa.me/${whatsApp}?text=${encodeURIComponent(whatsAppText)}`} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            )}
            {seller?.phone && (
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href={`tel:${seller.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call seller
                </a>
              </Button>
            )}
            {!waveChatLive && (
              <MessageSellerButton listingId={listing.id} sellerId={listing.userId} carTitle={title} sellerName={name} />
            )}
            {!sellerLoading && !seller?.phone && (
              <p className="text-xs text-muted-foreground">This seller has not shared a phone number. Send a message instead.</p>
            )}
          </>
        ) : (
          <>
            <Button asChild size="lg" className="w-full">
              <Link to={loginPathFor(window.location.pathname)}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in to contact the seller
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Phone numbers and messages are available to signed-in buyers.
            </p>
          </>
        )}
      </div>

      <p className="mt-5 flex gap-2 rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        Never pay before you have seen the car and its papers in person.
      </p>
    </div>
  );
};

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const modes = useAllFeatureModes();

  const listingQuery = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingDetail(id!),
    enabled: Boolean(id),
    retry: 1,
  });
  const listing = listingQuery.data;
  usePageMeta(
    listing
      ? {
          title: `${listing.year} ${listing.make} ${listing.model} for ${formatNaira(listing.price)}${listing.location ? ` in ${listing.location}` : ""}`,
          description: `${listing.year} ${listing.make} ${listing.model}${listing.condition ? `, ${formatCondition(listing.condition)?.toLowerCase()}` : ""}, ${formatNaira(listing.price)}. See photos and contact the seller on Motorcars.`,
          image: listing.images[0]?.url ?? null,
        }
      : { title: "Car for sale" }
  );

  const sellerQuery = useQuery({
    queryKey: ["seller", listing?.userId, Boolean(user)],
    queryFn: () => fetchSellerPublicInfo(listing!.userId, Boolean(user)),
    enabled: Boolean(listing),
    retry: 1,
  });

  const similarQuery = useQuery({
    queryKey: ["similar", id],
    queryFn: () => fetchSimilarListings(listing!),
    enabled: Boolean(listing) && listing?.status === "active",
    retry: 1,
  });

  // Opening a similar car reuses this page, so start it at the top
  useEffect(() => window.scrollTo(0, 0), [id]);

  // Back returns to the results with their filters when the visitor came from inside the site
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/cars"));

  if (listingQuery.isLoading) return <DetailSkeleton />;

  if (listingQuery.isError) {
    return (
      <StateMessage
        icon={<AlertCircle className="h-12 w-12 text-destructive" />}
        title="We couldn't load this car"
        text="Check your connection and try again."
        action={
          <Button variant="outline" onClick={() => listingQuery.refetch()} disabled={listingQuery.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${listingQuery.isFetching ? "animate-spin" : ""}`} />
            Try again
          </Button>
        }
      />
    );
  }

  if (!listing) {
    return (
      <StateMessage
        icon={<Car className="h-12 w-12 text-muted-foreground" />}
        title="This car isn't available"
        text="It may have been sold or removed by the seller, or the link may be wrong."
        action={
          <Button asChild>
            <Link to="/cars">Browse cars</Link>
          </Button>
        }
      />
    );
  }

  const title = titleOf(listing);
  const specs = specsOf(listing);
  const isOwner = user?.id === listing.userId;
  const condition = formatCondition(listing.condition);
  const wasUpdated = new Date(listing.updatedAt).getTime() - new Date(listing.createdAt).getTime() > 60 * 60 * 1000;
  const availability = describeAvailability(listing.availabilityStatus, listing.availabilityConfirmedAt, AVAILABILITY_FRESH_DAYS);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} for ${formatNaira(listing.price)} on Motorcars`, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>

        {listing.status !== "active" && (
          <p className="mt-4 flex gap-2 rounded-xl border border-gold/60 bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
            <Info className="h-4 w-4 shrink-0" />
            This listing is {STATUS_LABELS[listing.status] ?? listing.status} and is not public. Only you can see it.
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <ImageGallery images={listing.images} title={title} />

            {/* Title block repeats here on small screens, where the sidebar sits below the photos */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-extrabold">{title}</h1>
              <p className="mt-1 text-3xl font-extrabold text-primary">{formatNaira(listing.price)}</p>
            </div>

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-bold">Specifications</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 flex gap-2 text-xs text-muted-foreground">
                <CircleHelp className="h-4 w-4 shrink-0" />
                Details are provided by the seller. Motorcars has not independently checked them.
              </p>
            </section>

            {listing.description && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-bold">Seller's description</h2>
                <p className="mt-3 whitespace-pre-line text-foreground/90">{listing.description}</p>
              </section>
            )}

            {listing.features.length > 0 && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-bold">Features listed by the seller</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {listing.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ListingHistory listingId={listing.id} />

            {modes.conscience === "preview" && (
              <TrustRecordPreview
                verifiedBusiness={Boolean(sellerQuery.data?.dealer)}
                listedAt={listing.createdAt}
                updatedAt={listing.updatedAt}
                availabilityConfirmedAt={LISTING_LIFECYCLE ? listing.availabilityConfirmedAt : null}
              />
            )}
            {modes.argus === "preview" && <ArgusListingPreview listing={{ ...listing, photoCount: listing.images.length }} />}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="hidden lg:block">
              <h1 className="text-3xl font-extrabold leading-tight">{title}</h1>
              <p className="mt-2 text-4xl font-extrabold text-primary">{formatNaira(listing.price)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {condition && <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{condition}</span>}
              {listing.isFeatured && (
                <span className="rounded-full bg-gold px-3 py-1 text-sm font-bold text-gold-foreground">Featured</span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {listing.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {listing.location}
                </p>
              )}
              <p className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                Listed {formatDate(listing.createdAt)} ({formatListedAgo(listing.createdAt)})
                {wasUpdated && ` · updated ${formatListedAgo(listing.updatedAt)}`}
              </p>
            </div>

            {/* Availability is shown as confirmed only when the seller confirmed it recently */}
            <div
              className={`rounded-2xl border p-4 ${
                availability.tone === "confirmed"
                  ? "border-primary/40 bg-accent/40"
                  : availability.tone === "closed"
                    ? "border-destructive/40 bg-card"
                    : "border-dashed border-gold/70 bg-card"
              }`}
            >
              <p className="font-semibold">{availability.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{availability.detail}</p>
            </div>

            <SellerCard
              listing={listing}
              seller={sellerQuery.data}
              sellerLoading={sellerQuery.isLoading}
              isOwner={isOwner}
              signedIn={Boolean(user)}
              waveChatLive={modes.wavechat === "motorcars" || modes.wavechat === "moatwave"}
            />

            {(modes.wavechat === "motorcars" || modes.wavechat === "moatwave") && user && !isOwner && listing.status === "active" && (
              <WaveChatStart listingId={listing.id} />
            )}

            <div className="flex gap-2">
              <FavoriteButton listingId={listing.id} size="default" className="flex-1 border" />
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            {modes.wavechat === "preview" && !isOwner && (
              <WaveChatPreview title={title} price={listing.price} imageUrl={listing.images[0]?.url ?? null} />
            )}

            {LISTING_LIFECYCLE && !isOwner && (
              <div className="pt-1 text-center">
                <ReportListingDialog listingId={listing.id} signedIn={Boolean(user)} />
              </div>
            )}
          </aside>
        </div>

        {similarQuery.data && similarQuery.data.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">Similar cars</h2>
            <p className="mt-1 text-muted-foreground">Other {listing.make} listings and cars at a similar price.</p>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similarQuery.data.map((item) => (
                <VehicleCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CarDetail;
