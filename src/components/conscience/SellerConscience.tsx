import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { publicConscienceSummary } from "@/lib/conscience";
import { formatDate } from "@/lib/format";
import { conscienceService } from "@/services/conscience";

/** What buyers see of a seller's Conscience record. Hidden until there is a sealed cycle to show. */
export const SellerConscience = ({ sellerId }: { sellerId: string }) => {
  const mode = useFeatureMode("conscience");
  const live = mode === "motorcars" || mode === "moatwave";
  const { data } = useQuery({
    queryKey: ["conscience", "public", mode, sellerId],
    queryFn: () => conscienceService(mode).getPublicRecord(sellerId),
    enabled: live,
    retry: false,
    staleTime: 60_000,
  });

  const summary = data ? publicConscienceSummary(data) : null;
  if (!live || !data || !summary) return null;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Conscience record
      </h2>
      <p className="mt-2 text-2xl font-extrabold">{summary}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        A clean 14-day cycle means this seller's stock matched the records and anything out of line was put right in time.
        {data.lastSealedAt && ` Last sealed ${formatDate(data.lastSealedAt)}.`} Sealed cycles can't be changed.
      </p>
    </section>
  );
};
