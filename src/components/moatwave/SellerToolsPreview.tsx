import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Inbox, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVAILABILITY_FRESH_DAYS, LISTING_LIFECYCLE } from "@/config/features";
import { missingListingDetails } from "@/lib/argus";
import type { MyListing } from "@/services/myListings";
import type { FeatureModes } from "@/services/platformFeatures";
import { PreviewPanel } from "./PreviewPanel";
import { MidIdentityPreview, OpenInventoryPreview } from "./StandPreviews";

const DAY = 24 * 60 * 60 * 1000;

interface SellerToolsPreviewProps {
  /** Only features set to "preview" are shown here. */
  modes: FeatureModes;
  listings: MyListing[];
  /** Shown for dealers and stands; private sellers see only the listing tools. */
  business: { name: string; verified: boolean } | null;
}

/** The Moatwave tools a seller will manage from the dashboard, each shown as a preview. */
export const SellerToolsPreview = ({ modes, listings, business }: SellerToolsPreviewProps) => {
  const live = listings.filter((listing) => listing.status === "active");
  const needsWork = live
    .map((listing) => ({ listing, missing: missingListingDetails(listing) }))
    .filter((item) => item.missing.length > 0);
  const recentlyConfirmed = live.filter(
    (listing) => listing.availabilityConfirmedAt && Date.now() - new Date(listing.availabilityConfirmedAt).getTime() < AVAILABILITY_FRESH_DAYS * DAY
  ).length;

  return (
    <section className="mt-12" aria-labelledby="moatwave-tools">
      <h2 id="moatwave-tools" className="text-2xl font-extrabold">Coming with Moatwave</h2>
      <p className="mt-1 max-w-3xl text-muted-foreground">
        A preview of the tools you'll use once Motorcars is connected to Moatwave. None is active yet; the numbers shown
        come from your real listings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {modes.wavechat === "preview" && <PreviewPanel feature="wavechat" title="WaveChat inbox" subtitle="Every enquiry with its car attached">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-background p-6 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold">No WaveChat conversations yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Buyer questions such as “Is it available?”, photo requests, inspection bookings and offers will arrive here,
              each with the car attached. Today, buyers reach you by WhatsApp, phone or Messages.
            </p>
          </div>
        </PreviewPanel>}

        {modes.argus === "preview" && <PreviewPanel feature="argus" title="Argus listing check" subtitle="What your live listings are missing">
          {live.length === 0 ? (
            <p className="text-sm text-muted-foreground">Argus checks your live listings once you have some.</p>
          ) : needsWork.length === 0 ? (
            <p className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />All your live listings have their main details filled in.</p>
          ) : (
            <ul className="space-y-3">
              {needsWork.slice(0, 4).map(({ listing, missing }) => (
                <li key={listing.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">Missing: {missing.join(", ")}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link to={`/sell/edit/${listing.id}`}><Pencil className="mr-1.5 h-3.5 w-3.5" />Add</Link>
                  </Button>
                </li>
              ))}
              {needsWork.length > 4 && <li className="text-xs text-muted-foreground">And {needsWork.length - 4} more.</li>}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Fixed checks for now. Argus will also draft descriptions and summarise enquiries.</p>
        </PreviewPanel>}

        {modes.conscience === "preview" && <PreviewPanel feature="conscience" title="Your trust record" subtitle="Conscience Protocol · built from recorded events">
          <ul className="space-y-2 text-sm">
            {business?.verified && (
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />Business reviewed by Motorcars</li>
            )}
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />{live.length} live {live.length === 1 ? "listing" : "listings"}</li>
            {LISTING_LIFECYCLE && (
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                {recentlyConfirmed} of {live.length} confirmed available in the last {AVAILABILITY_FRESH_DAYS} days
              </li>
            )}
            {["Reply times to buyers", "Inspections and completed sales", "Buyer feedback"].map((text) => (
              <li key={text} className="flex gap-2 text-muted-foreground"><Circle className="h-4 w-4 shrink-0" />{text} · not recorded yet</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Once active, this runs in sealed 14-day cycles built from recorded events.</p>
        </PreviewPanel>}

        {business && modes.oio === "preview" && (
          <OpenInventoryPreview
            listed={live.length}
            available={LISTING_LIFECYCLE ? live.filter((listing) => (listing.availabilityStatus ?? "available") === "available").length : undefined}
            reserved={LISTING_LIFECYCLE ? live.filter((listing) => listing.availabilityStatus === "reserved").length : undefined}
          />
        )}

        {business && modes.mid === "preview" && <MidIdentityPreview businessName={business.name} verified={business.verified} />}
      </div>
    </section>
  );
};
