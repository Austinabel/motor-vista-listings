import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatDate } from "@/lib/format";
import { describeInventoryEvent, type EventTone } from "@/lib/inventory";
import { inventoryService } from "@/services/inventory";

const DOT: Record<EventTone, string> = {
  neutral: "bg-muted-foreground/50",
  good: "bg-primary",
  warning: "bg-gold",
  closed: "bg-destructive",
};

interface ListingHistoryProps {
  listingId: string;
  /** Compact list without the card frame, for the seller's own listings. */
  compact?: boolean;
}

/** A car's Open Inventory history, newest first, exactly as recorded. */
export const ListingHistory = ({ listingId, compact = false }: ListingHistoryProps) => {
  const mode = useFeatureMode("oio");
  const live = mode === "motorcars" || mode === "moatwave";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", "history", mode, listingId],
    queryFn: () => inventoryService(mode).getListingHistory(listingId),
    enabled: live,
    retry: false,
  });

  if (!live) return null;

  const body = (
    <>
      {isLoading && <div className="h-16 animate-pulse rounded-lg bg-muted" />}
      {isError && <p className="text-sm text-muted-foreground">The history couldn't be loaded.</p>}
      {data && data.events.length === 0 && <p className="text-sm text-muted-foreground">No history recorded yet.</p>}
      {data && data.events.length > 0 && (
        <ol className="relative space-y-3 border-l pl-5">
          {data.events.slice(0, compact ? 6 : 20).map((event, index) => {
            const { label, tone } = describeInventoryEvent(event);
            return (
              <li key={`${event.occurredAt}-${index}`} className="relative">
                <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-card ${DOT[tone]}`} />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(event.occurredAt)}
                  {event.backfilled && " · from records kept before full history began"}
                </p>
              </li>
            );
          })}
        </ol>
      )}
      {compact && data && (
        <p className="mt-3 text-xs text-muted-foreground">
          {data.pricesPublic ? "Buyers can see this car's price changes." : "Buyers see this history without prices or price changes."}{" "}
          <Link to="/account/settings" className="font-semibold text-primary hover:underline">Change</Link>
        </p>
      )}
    </>
  );

  if (compact) return <div className="pt-1">{body}</div>;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <History className="h-5 w-5 text-primary" />
        This car's history
      </h2>
      <p className="mb-4 mt-1 text-xs text-muted-foreground">
        Every change to this listing is recorded and kept, so you can see when it was listed, repriced, reserved or last
        confirmed available.
      </p>
      {body}
    </section>
  );
};
