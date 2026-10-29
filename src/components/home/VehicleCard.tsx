import { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Gauge, MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatCondition, formatListedAgo, formatMileage, formatNaira } from "@/lib/format";
import type { ListingSummary } from "@/services/listings";

export const VehicleCard = ({ listing }: { listing: ListingSummary }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const title = `${listing.year} ${listing.make} ${listing.model}`;
  const condition = formatCondition(listing.condition);
  const showImage = listing.imageUrl && !imageFailed;

  return (
    <Link
      to={`/cars/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {showImage ? (
          <img
            src={listing.imageUrl!}
            alt={title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Car className="h-12 w-12" />
            <span className="text-sm">{imageFailed ? "Photo unavailable" : "No photo provided"}</span>
          </div>
        )}
        {listing.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-foreground shadow">
            Featured
          </span>
        )}
        {/* Keep favourite clicks from opening the listing */}
        <div
          className="absolute right-3 top-3"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <FavoriteButton listingId={listing.id} className="rounded-full bg-card/95 shadow" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-foreground">{title}</h3>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {condition && <span className="font-medium text-foreground/80">{condition}</span>}
          {listing.mileage != null && (
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              {formatMileage(listing.mileage)}
            </span>
          )}
          {listing.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <p className="text-2xl font-extrabold text-primary">{formatNaira(listing.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Listed {formatListedAgo(listing.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
};

export const VehicleCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden>
    <div className="aspect-[4/3] animate-pulse bg-muted" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-7 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  </div>
);
