import { useQuery } from "@tanstack/react-query";
import { Fingerprint } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatMid } from "@/lib/mid";
import { midService } from "@/services/mid";
import { MidRing } from "./MidRing";

interface MidBadgeProps {
  userId: string;
  /** "dark" for the dealer header, "light" on cards */
  tone?: "light" | "dark";
}

/** A seller's MID, ring and tier, shown only when the MID feature is live and the seller has one. */
export const MidBadge = ({ userId, tone = "light" }: MidBadgeProps) => {
  const mode = useFeatureMode("mid");
  const live = mode === "motorcars" || mode === "moatwave";
  const { data } = useQuery({
    queryKey: ["mid", "public", mode, userId],
    queryFn: () => midService(mode).getPublicMid(userId),
    enabled: live,
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (!live || !data) return null;
  const muted = tone === "dark" ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex items-center gap-2">
          <MidRing score={data.score} size={40} notches={data.cyclesSealed} />
          <span className="leading-tight">
            <span className="flex items-center gap-1 font-mono text-sm font-semibold">
              <Fingerprint className="h-3.5 w-3.5" />
              {data.mid ? `MID ${formatMid(data.mid)}` : "Has a MID"}
            </span>
            <span className={`block text-xs ${muted}`}>
              {data.tier}
              {!data.phoneVerified && " · phone not yet verified"}
            </span>
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        A MID is this seller's identity on Motorcars and Moatwave. The score comes only from recorded activity, such as
        confirming cars are still available.
        {data.issuedBy === "motorcars" && " Issued by Motorcars until Moatwave is connected."}
      </TooltipContent>
    </Tooltip>
  );
};
