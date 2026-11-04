import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fingerprint, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatDate } from "@/lib/format";
import { formatMid, midFromPhone } from "@/lib/mid";
import { midService } from "@/services/mid";
import { MidRing } from "./MidRing";

const fetchMyPhone = async (userId: string) => {
  const { data } = await supabase.from("profiles").select("phone").eq("id", userId).maybeSingle();
  return data?.phone ?? null;
};

/** The signed-in person's MID: create it, then see the ring, tier and how each point was earned. */
export const MyMidCard = ({ userId }: { userId: string }) => {
  const mode = useFeatureMode("mid");
  const service = midService(mode);
  const queryClient = useQueryClient();

  const midQuery = useQuery({ queryKey: ["mid", "public", mode, userId], queryFn: () => service.getPublicMid(userId), retry: false });
  const ledgerQuery = useQuery({
    queryKey: ["mid", "ledger", mode, userId],
    queryFn: () => service.getMyLedger(userId),
    enabled: Boolean(midQuery.data),
    retry: false,
  });
  const phoneQuery = useQuery({ queryKey: ["my-phone", userId], queryFn: () => fetchMyPhone(userId), enabled: midQuery.isSuccess && !midQuery.data });

  const issue = useMutation({
    mutationFn: () => service.issueMyMid(),
    onSuccess: (mid) => {
      toast.success(`Your MID is ready: ${formatMid(mid)}`);
      queryClient.invalidateQueries({ queryKey: ["mid"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const mid = midQuery.data;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm" aria-labelledby="my-mid">
      <div className="flex items-center gap-2">
        <Fingerprint className="h-5 w-5 text-primary" />
        <h2 id="my-mid" className="text-lg font-bold">My MID</h2>
      </div>

      {midQuery.isLoading && <div className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />}
      {midQuery.isError && <p className="mt-3 text-sm text-muted-foreground">Your MID couldn't be loaded right now.</p>}

      {midQuery.isSuccess && !mid && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            Your MID is your identity on Motorcars and, later, across Moatwave. It's made from your phone number and builds
            a record from what you actually do here, such as keeping your cars' availability up to date.
          </p>
          {phoneQuery.data && midFromPhone(phoneQuery.data) ? (
            <>
              <p className="text-sm">
                From your phone number, your MID will be{" "}
                <span className="font-mono font-semibold">{formatMid(midFromPhone(phoneQuery.data)!)}</span>.
              </p>
              <Button onClick={() => issue.mutate()} disabled={issue.isPending}>
                <Fingerprint className="mr-2 h-4 w-4" />
                {issue.isPending ? "Creating…" : "Create my MID"}
              </Button>
            </>
          ) : (
            phoneQuery.isSuccess && (
              <Button asChild variant="outline">
                <Link to="/profile/edit"><Phone className="mr-2 h-4 w-4" />Add a Nigerian phone number first</Link>
              </Button>
            )
          )}
        </div>
      )}

      {mid && (
        <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-4 sm:flex-col sm:items-start">
            <MidRing score={mid.score} size={104} notches={mid.cyclesSealed} />
            <div>
              <p className="font-mono text-lg font-bold">{mid.mid && formatMid(mid.mid)}</p>
              <p className="text-sm font-semibold text-primary">{mid.tier}</p>
              {!mid.phoneVerified && (
                <p className="mt-1 text-xs text-muted-foreground">Phone not yet verified. SMS verification is coming.</p>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">How you earned it</p>
            {ledgerQuery.data && ledgerQuery.data.length > 0 ? (
              <ul className="mt-2 divide-y text-sm">
                {ledgerQuery.data.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate">{entry.label}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
                      <span className={`w-12 text-right font-semibold ${entry.points < 0 ? "text-destructive" : "text-primary"}`}>
                        {entry.points > 0 ? "+" : ""}{entry.points}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No points recorded yet.</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Point values are Motorcars' interim settings, taken from the Moatwave plan. They will follow Moatwave's once it
              is connected; points already earned stay as they are.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
