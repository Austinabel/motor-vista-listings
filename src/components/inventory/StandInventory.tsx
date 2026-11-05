import { useQuery } from "@tanstack/react-query";
import { Boxes } from "lucide-react";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatListedAgo } from "@/lib/format";
import { inventoryService } from "@/services/inventory";

/** A stand's stock at a glance, worked out from its listings and their recorded history. */
export const StandInventory = ({ sellerId, title = "Stock on this stand" }: { sellerId: string; title?: string }) => {
  const mode = useFeatureMode("oio");
  const live = mode === "motorcars" || mode === "moatwave";
  const { data } = useQuery({
    queryKey: ["inventory", "stand", mode, sellerId],
    queryFn: () => inventoryService(mode).getStandInventory(sellerId),
    enabled: live,
    retry: false,
    staleTime: 60_000,
  });

  if (!live || !data) return null;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Boxes className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <div className={`mt-4 grid gap-3 text-center ${data.soldRecorded === null ? "grid-cols-2" : "grid-cols-3"}`}>
        {[
          ["Available", data.available],
          ["Reserved", data.reserved],
          ...(data.soldRecorded === null ? [] : [["Sold through Motorcars", data.soldRecorded]]),
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl bg-muted px-2 py-3">
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {data.lastActivityAt ? `Stock last updated ${formatListedAgo(data.lastActivityAt)}.` : "No stock updates recorded yet."} Counts
        come from the stand's recorded history, kept by Open Inventory.
      </p>
    </section>
  );
};
