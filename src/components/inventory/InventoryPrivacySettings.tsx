import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { inventoryService, type InventoryPrivacy } from "@/services/inventory";

const SETTINGS: { key: keyof InventoryPrivacy; id: string; label: string; help: string; on: string; off: string }[] = [
  {
    key: "priceHistory",
    id: "show-price-history",
    label: "Show price history to buyers",
    help: 'When on, buyers see each car\'s price changes (for example "Price reduced from ₦15,000,000 to ₦13,500,000"). When off, they see the history without prices.',
    on: "Buyers can now see your price history",
    off: "Your price history is now hidden from buyers",
  },
  {
    key: "salesCount",
    id: "show-sales-count",
    label: "Show how many cars you've sold",
    help: 'When on, your profile shows "Sold through Motorcars" with the number of cars you marked sold. When off, only your available and reserved cars are counted publicly.',
    on: "Your sales count is now shown on your profile",
    off: "Your sales count is now hidden",
  },
];

/**
 * A seller's choices about what buyers see from Open Inventory. Both off by default; the history is
 * recorded either way and the seller always sees all of it. Shown only while Open Inventory is live.
 */
export const InventoryPrivacySettings = ({ userId }: { userId: string }) => {
  const mode = useFeatureMode("oio");
  const live = mode === "motorcars" || mode === "moatwave";
  const queryClient = useQueryClient();

  const { data, isSuccess } = useQuery({
    queryKey: ["inventory", "privacy", mode, userId],
    queryFn: () => inventoryService(mode).getPrivacy(userId),
    enabled: live,
    retry: false,
  });

  const change = useMutation({
    mutationFn: (update: Partial<InventoryPrivacy>) => inventoryService(mode).setPrivacy(userId, update),
    onSuccess: (_, update) => {
      const setting = SETTINGS.find((item) => update[item.key] !== undefined);
      if (setting) toast.success(update[setting.key] ? setting.on : setting.off);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!live || !isSuccess) return null;

  return (
    <div className="space-y-6">
      {SETTINGS.map((setting) => (
        <div key={setting.key} className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor={setting.id} className="text-base font-medium">{setting.label}</Label>
            <p className="text-sm text-muted-foreground">{setting.help} You always see everything.</p>
          </div>
          <Switch
            id={setting.id}
            checked={data[setting.key]}
            disabled={change.isPending}
            onCheckedChange={(value) => change.mutate({ [setting.key]: value })}
          />
        </div>
      ))}
    </div>
  );
};
