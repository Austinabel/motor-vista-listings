import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { loginPathFor } from "@/lib/redirect";
import { REPORT_REASONS, createListingReport, type ReportReason } from "@/services/reports";

interface ReportListingDialogProps {
  listingId: string;
  signedIn: boolean;
}

/** Lets a signed-in buyer flag a misleading or suspicious listing for admin review. */
export const ReportListingDialog = ({ listingId, signedIn }: ReportListingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");

  const submit = useMutation({
    mutationFn: () => createListingReport(listingId, reason as ReportReason, details),
    onSuccess: () => {
      toast.success("Thanks. Our team will review this listing.");
      setOpen(false);
      setReason("");
      setDetails("");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't send your report. Try again."),
  });

  if (!signedIn) {
    return (
      <Link to={loginPathFor(window.location.pathname)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline">
        <Flag className="h-4 w-4" />
        Sign in to report this listing
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline">
          <Flag className="h-4 w-4" />
          Report this listing
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
          <DialogDescription>Reports go to the Motorcars team. The seller is not told who reported it.</DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">What's wrong?</legend>
          {REPORT_REASONS.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent/50">
              <input
                type="radio"
                name="report-reason"
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
                className="accent-[hsl(var(--primary))]"
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="space-y-1.5">
          <Label htmlFor="report-details">Details (optional)</Label>
          <Textarea id="report-details" rows={3} maxLength={1000} value={details} onChange={(event) => setDetails(event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => submit.mutate()} disabled={!reason || submit.isPending}>
            {submit.isPending ? "Sending…" : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
