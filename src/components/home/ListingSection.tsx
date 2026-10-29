import { type ReactNode } from "react";
import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/home/SectionHeading";
import { VehicleCard, VehicleCardSkeleton } from "@/components/home/VehicleCard";
import type { ListingSummary } from "@/services/listings";

const gridClass = {
  4: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6",
  3: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
};

interface ListingSectionProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  listings: ListingSummary[];
  viewAllHref: string;
  viewAllLabel?: string;
  columns?: 3 | 4;
  /** Shown when there are no listings. Omit to render nothing instead. */
  emptyState?: ReactNode;
}

/** A titled grid of real listings. Renders nothing when empty unless an empty state is given. */
export const ListingSection = ({
  title,
  subtitle,
  icon,
  listings,
  viewAllHref,
  viewAllLabel = "View all cars",
  columns = 4,
  emptyState,
}: ListingSectionProps) => {
  if (listings.length === 0 && !emptyState) return null;

  return (
    <div>
      <SectionHeading title={title} subtitle={subtitle} icon={icon} actionLabel={viewAllLabel} actionHref={viewAllHref} />
      {listings.length === 0 ? (
        emptyState
      ) : (
        <div className={gridClass[columns]}>
          {listings.map((listing) => (
            <VehicleCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ListingSectionSkeleton = ({ title, columns = 4 }: { title: string; columns?: 3 | 4 }) => (
  <div aria-busy="true" aria-label={`Loading ${title}`}>
    <div className="mb-7 h-9 w-56 animate-pulse rounded-lg bg-muted" />
    <div className={gridClass[columns]}>
      {Array.from({ length: columns }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export const ListingsUnavailable = ({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
    <AlertCircle className="h-10 w-10 text-destructive" />
    <p className="text-lg font-semibold">We couldn't load cars right now.</p>
    <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
    <Button variant="outline" onClick={onRetry} disabled={retrying}>
      <RefreshCw className={`mr-2 h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
      Try again
    </Button>
  </div>
);
