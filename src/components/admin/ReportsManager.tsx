import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, ExternalLink, Flag, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatDate } from "@/lib/format";
import { conscienceService } from "@/services/conscience";
import { fetchOpenReports, reportReasonLabel, resolveReport, type ListingReport } from "@/services/reports";

const ReportCard = ({ report, adminId }: { report: ListingReport; adminId: string }) => {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const conscienceMode = useFeatureMode("conscience");
  const canUphold = report.reason === "sold_or_unavailable" && (conscienceMode === "motorcars" || conscienceMode === "moatwave");
  const uphold = useMutation({
    mutationFn: () => conscienceService(conscienceMode).upholdReport(report.id, notes),
    onSuccess: () => {
      toast.success("Upheld. The deduction lands when the seller's cycle seals.");
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't uphold the report"),
  });
  const resolve = useMutation({
    mutationFn: (outcome: "resolved" | "dismissed") => resolveReport(report.id, outcome, adminId, notes),
    onSuccess: (_, outcome) => {
      toast.success(outcome === "resolved" ? "Report resolved" : "Report dismissed");
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't update the report"),
  });

  return (
    <li className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{report.listingTitle}</p>
          <p className="text-sm text-muted-foreground">Reported {formatDate(report.createdAt)}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/cars/${report.listingId}`} target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Open listing</Link>
        </Button>
      </div>
      <p className="mt-3 font-medium">{reportReasonLabel(report.reason)}</p>
      {report.details && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{report.details}</p>}
      <Textarea
        className="mt-3"
        rows={2}
        placeholder="Notes for the record (what you checked, what you did)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => resolve.mutate("resolved")} disabled={resolve.isPending}>
          <CheckCircle className="mr-2 h-4 w-4" />Resolved
        </Button>
        <Button size="sm" variant="outline" onClick={() => resolve.mutate("dismissed")} disabled={resolve.isPending}>
          <XCircle className="mr-2 h-4 w-4" />Dismiss
        </Button>
        {canUphold && (
          <Button size="sm" variant="destructive" onClick={() => uphold.mutate()} disabled={uphold.isPending || !notes.trim()}>
            <ShieldAlert className="mr-2 h-4 w-4" />Uphold as availability lie
          </Button>
        )}
      </div>
      {canUphold && (
        <p className="mt-2 text-xs text-muted-foreground">
          Uphold only with evidence that the car had gone while it was shown as available, and record that evidence in the notes.
          It goes on the seller's Conscience record and can't be undone once the cycle seals.
        </p>
      )}
    </li>
  );
};

/** Open listing reports from buyers. Acting on a listing (rejecting it, contacting the seller) happens in the Listings tab. */
export const ReportsManager = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: fetchOpenReports,
    enabled: Boolean(user),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Flag className="h-5 w-5" />Listing reports</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="h-24 animate-pulse rounded-xl bg-muted" />}
        {isError && (
          <div className="flex items-center gap-3">
            <p>Couldn't load reports.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
          </div>
        )}
        {data && data.length === 0 && <p className="text-muted-foreground">No open reports.</p>}
        {data && data.length > 0 && user && (
          <ul className="space-y-3">
            {data.map((report) => <ReportCard key={report.id} report={report} adminId={user.id} />)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
