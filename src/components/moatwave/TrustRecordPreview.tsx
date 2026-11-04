import { BadgeCheck, CalendarClock, CheckCircle2, Circle, History } from "lucide-react";
import { formatDate } from "@/lib/format";
import { PreviewPanel } from "./PreviewPanel";

interface TrustRecordPreviewProps {
  verifiedBusiness: boolean;
  listedAt: string;
  updatedAt: string;
  /** Only when the seller has confirmed availability and the lifecycle feature is on. */
  availabilityConfirmedAt: string | null;
}

// Evidence the Conscience Protocol will record. None exists on Motorcars yet, so each shows as not recorded.
const PENDING_EVIDENCE = [
  "How quickly the seller replies to buyers",
  "Inspection reports",
  "Sales completed through the platform",
  "Feedback from buyers who saw the car",
  "Reports about listing accuracy",
];

/**
 * Conscience Protocol on a car page. The top list holds only facts Motorcars has recorded; the
 * rest are named as not recorded. No score is calculated: Moatwave will define how evidence is weighed.
 */
export const TrustRecordPreview = ({ verifiedBusiness, listedAt, updatedAt, availabilityConfirmedAt }: TrustRecordPreviewProps) => {
  const recorded = [
    verifiedBusiness && { icon: BadgeCheck, text: "Business reviewed by Motorcars (CAC number and owner ID)" },
    { icon: CalendarClock, text: `Listed on ${formatDate(listedAt)}` },
    new Date(updatedAt).getTime() - new Date(listedAt).getTime() > 60 * 60 * 1000 && {
      icon: History,
      text: `Listing last updated on ${formatDate(updatedAt)}`,
    },
    availabilityConfirmedAt && { icon: CheckCircle2, text: `Seller confirmed availability on ${formatDate(availabilityConfirmedAt)}` },
  ].filter(Boolean) as { icon: typeof BadgeCheck; text: string }[];

  return (
    <PreviewPanel feature="conscience" title="Seller trust record" subtitle="Conscience Protocol · Powered by Moatwave">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Recorded on Motorcars</p>
          <ul className="mt-2 space-y-2">
            {recorded.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recorded once Conscience is active</p>
          <ul className="mt-2 space-y-2">
            {PENDING_EVIDENCE.map((text) => (
              <li key={text} className="flex gap-2 text-sm text-muted-foreground">
                <Circle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {text} <span className="text-xs">· not recorded yet</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        There is no trust score. Conscience will build indicators only from recorded events, using rules set by Moatwave.
      </p>
    </PreviewPanel>
  );
};
