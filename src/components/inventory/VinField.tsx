import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { normaliseVin } from "@/lib/inventory";
import { inventoryService } from "@/services/inventory";

/** Add a car's VIN to its Open Inventory record. Once saved it is locked; support can correct it. */
export const VinField = ({ listingId }: { listingId: string }) => {
  const mode = useFeatureMode("oio");
  const live = mode === "motorcars" || mode === "moatwave";
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");

  const vinQuery = useQuery({
    queryKey: ["inventory", "vin", mode, listingId],
    queryFn: () => inventoryService(mode).getVin(listingId),
    enabled: live,
    retry: false,
  });

  const save = useMutation({
    mutationFn: (vin: string) => inventoryService(mode).setVin(listingId, vin),
    onSuccess: () => {
      toast.success("VIN added");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!live || vinQuery.isLoading || vinQuery.isError) return null;

  const saved = vinQuery.data;
  const vin = normaliseVin(value);

  return (
    <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
      <Label htmlFor="vin" className="text-base font-bold">Vehicle identification number (VIN)</Label>
      <p className="mt-1 text-sm text-muted-foreground">
        The 17-character number on the dashboard, door frame and papers. It ties this listing to one car, so the same car
        can't be listed twice. It can't be changed once saved.
      </p>
      {saved ? (
        <p className="mt-3 flex items-center gap-2 font-mono text-sm font-semibold">
          <Lock className="h-4 w-4 text-muted-foreground" />
          {saved}
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            id="vin"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 1HGCM82633A004352"
            className="font-mono uppercase"
            aria-invalid={value.length > 0 && !vin}
          />
          <Button type="button" disabled={!vin || save.isPending} onClick={() => vin && save.mutate(vin)}>
            Save VIN
          </Button>
        </div>
      )}
      {!saved && value.length > 0 && !vin && (
        <p className="mt-2 text-sm text-destructive">A VIN has 17 letters and numbers, and never contains I, O or Q.</p>
      )}
    </section>
  );
};
