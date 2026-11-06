import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import {
  cycleOutcomeLabel, cycleProgress, cycleStageLabel, describeFinding, findingStatusLabel, timeLeft,
  type ConscienceFinding,
} from "@/lib/conscience";
import { formatDate } from "@/lib/format";
import { conscienceService } from "@/services/conscience";

const FindingRow = ({ finding }: { finding: ConscienceFinding }) => {
  const { problem, fix } = describeFinding(finding);
  const open = finding.status === "open";
  return (
    <li className="py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0">{problem}</p>
        <span className={`shrink-0 text-xs font-semibold ${finding.status === "reconciled" ? "text-primary" : "text-destructive"}`}>
          {findingStatusLabel(finding.status)}
        </span>
      </div>
      {open && <p className="mt-1 text-muted-foreground">{fix} You can do this on the car below.</p>}
    </li>
  );
};

/** A seller's own Conscience record: the cycle under way, what needs fixing, and sealed cycles. */
export const MyConscienceCard = ({ userId }: { userId: string }) => {
  const mode = useFeatureMode("conscience");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conscience", "mine", mode, userId],
    queryFn: () => conscienceService(mode).getMyRecord(userId),
    retry: false,
  });

  const current = data?.current ?? null;
  const currentFindings = data?.findings.filter((finding) => finding.cycleId === current?.id) ?? [];
  const toFix = currentFindings.filter((finding) => finding.status === "open").length;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm" aria-labelledby="my-conscience">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 id="my-conscience" className="text-lg font-bold">Conscience record</h2>
      </div>

      {isLoading && <div className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />}
      {isError && <p className="mt-3 text-sm text-muted-foreground">Your record couldn't be loaded right now.</p>}

      {data && !current && data.sealed.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Your first 14-day cycle starts when you have a live car on Motorcars.</p>
      )}

      {current && (
        <div className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">Cycle {current.cycleNumber}: {cycleStageLabel(current.status)}</p>
            <p className="text-sm text-muted-foreground">
              {timeLeft(current.status === "observing" ? current.observationEndsAt : current.reconcileEndsAt)}
            </p>
          </div>
          <Progress className="mt-2 h-2" value={cycleProgress(current) * 100} aria-label="How far through this cycle you are" />

          {current.status === "observing" && currentFindings.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Keep your cars' availability up to date. Each live car needs a confirmation or status update before day 12.
            </p>
          )}
          {current.status === "reconciling" && toFix === 0 && currentFindings.length === 0 && (
            <p className="mt-3 flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Nothing to fix. This cycle will seal clean.</p>
          )}
          {toFix > 0 && (
            <p className="mt-3 flex gap-2 rounded-lg bg-accent/60 px-3 py-2 text-sm text-accent-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Fix {toFix === 1 ? "this" : `these ${toFix}`} before the cycle seals. Once sealed, it can't be changed.
            </p>
          )}
          {currentFindings.length > 0 && <ul className="mt-2 divide-y">{currentFindings.map((finding) => <FindingRow key={finding.id} finding={finding} />)}</ul>}
        </div>
      )}

      {data && data.sealed.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sealed cycles</p>
          <ul className="mt-2 divide-y text-sm">
            {data.sealed.map((cycle) => (
              <li key={cycle.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate">Cycle {cycle.cycleNumber} · {cycle.sealedAt && formatDate(cycle.sealedAt)}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className={cycle.outcome === "flagged" ? "font-semibold text-destructive" : "text-muted-foreground"}>{cycleOutcomeLabel(cycle.outcome)}</span>
                  <span className={`w-12 text-right font-semibold ${cycle.pointsAwarded < 0 ? "text-destructive" : "text-primary"}`}>
                    {cycle.pointsAwarded > 0 ? "+" : ""}{cycle.pointsAwarded}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Each cycle is 12 days observed plus 48 hours to put things right, then it's sealed for good. Buyers see how many of your
        cycles were clean, never the details. These are Motorcars' interim rules, taken from the Moatwave plan.
      </p>
    </section>
  );
};
