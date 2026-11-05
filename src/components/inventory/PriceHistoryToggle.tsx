import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { inventoryService } from "@/services/inventory";

/**
 * The seller's choice of whether buyers see their cars' price history (Open Inventory).
 * Off by default; the history is still recorded either way. Shown only while Open Inventory is live.
 */
export const PriceHistoryToggle = ({ userId }: { userId: string }) => {
  const mode = useFeatureMode("oio");
  const live = mode === "motorcars" || mode === "moatwave";
  const queryClient = useQueryClient();

  const { data: enabled, isSuccess } = useQuery({
    queryKey: ["inventory", "price-history-public", mode, userId],
    queryFn: () => inventoryService(mode).getPriceHistoryPublic(userId),
    enabled: live,
    retry: false,
  });

  const change = useMutation({
    mutationFn: (value: boolean) => inventoryService(mode).setPriceHistoryPublic(userId, value),
    onSuccess: (_, value) => {
      toast.success(value ? "Buyers can now see your price history" : "Your price history is now hidden from buyers");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!live || !isSuccess) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor="show-price-history" className="text-base font-medium">Show price history to buyers</Label>
        <p className="text-sm text-muted-foreground">
          When on, buyers see each car's price changes (for example "Price reduced from ₦15,000,000 to ₦13,500,000"). When
          off, they see the history without prices. You always see the full history.
        </p>
      </div>
      <Switch
        id="show-price-history"
        checked={Boolean(enabled)}
        disabled={change.isPending}
        onCheckedChange={(value) => change.mutate(value)}
      />
    </div>
  );
};
