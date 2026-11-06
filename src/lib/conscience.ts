// Conscience Protocol cycles as sellers and buyers read them. Every line says what was recorded;
// nothing here adds to or weighs the evidence.

export type CycleStatus = "observing" | "reconciling" | "sealed";
export type CycleOutcome = "clean" | "flagged" | "quiet";
export type FindingKind = "not_confirmed" | "chat_says_unavailable" | "paid_still_available" | "availability_lie";
export type FindingStatus = "open" | "reconciled" | "unreconciled" | "upheld";

export interface ConscienceCycle {
  id: string;
  cycleNumber: number;
  status: CycleStatus;
  startsAt: string;
  observationEndsAt: string;
  reconcileEndsAt: string;
  carsTracked: number;
  carsConfirmed: number;
  outcome: CycleOutcome | null;
  pointsAwarded: number;
  sealedAt: string | null;
}

export interface ConscienceFinding {
  id: string;
  cycleId: string;
  listingId: string;
  carTitle: string;
  kind: FindingKind;
  status: FindingStatus;
}

export interface PublicConscience {
  cyclesSealed: number;
  cleanCycles: number;
  lastSealedAt: string | null;
  cycleInProgress: boolean;
}

const HOUR = 60 * 60 * 1000;

/** Share of the whole cycle already gone, from 0 to 1. */
export const cycleProgress = (cycle: Pick<ConscienceCycle, "startsAt" | "reconcileEndsAt">, now = Date.now()) => {
  const start = new Date(cycle.startsAt).getTime();
  const end = new Date(cycle.reconcileEndsAt).getTime();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
};

/** "3 days left", "5 hours left", or "Ending soon" once under an hour remains. */
export const timeLeft = (until: string, now = Date.now()) => {
  const hours = (new Date(until).getTime() - now) / HOUR;
  if (hours < 1) return "Ending soon";
  if (hours < 48) {
    const whole = Math.floor(hours);
    return `${whole} ${whole === 1 ? "hour" : "hours"} left`;
  }
  return `${Math.floor(hours / 24)} days left`;
};

export const cycleStageLabel = (status: CycleStatus) =>
  status === "observing" ? "Being observed" : status === "reconciling" ? "48 hours to reconcile" : "Sealed";

export const cycleOutcomeLabel = (outcome: CycleOutcome | null) =>
  outcome === "clean" ? "Clean" : outcome === "flagged" ? "Problems recorded" : "No cars on sale";

export const describeFinding = (finding: Pick<ConscienceFinding, "kind" | "carTitle">) => {
  switch (finding.kind) {
    case "not_confirmed":
      return {
        problem: `${finding.carTitle} wasn't confirmed during this cycle.`,
        fix: "Confirm it's still available, or update its status.",
      };
    case "chat_says_unavailable":
      return {
        problem: `You told a buyer the ${finding.carTitle} is no longer available, but it's still listed as available.`,
        fix: "Mark it sold or unavailable, or confirm it's available after all.",
      };
    case "paid_still_available":
      return {
        problem: `A payment is recorded for the ${finding.carTitle}, but it's still listed as available.`,
        fix: "Mark it reserved. If the buyer was refunded, mark it reserved and then available again.",
      };
    case "availability_lie":
      return {
        problem: `Motorcars upheld a report that the ${finding.carTitle} was shown available after it had gone.`,
        fix: "This can't be reconciled. It stays on this cycle's record.",
      };
  }
};

export const findingStatusLabel = (status: FindingStatus) =>
  status === "open" ? "Needs fixing" : status === "reconciled" ? "Put right" : status === "upheld" ? "Upheld" : "Not put right";

/** The public line. Null until a cycle with cars has been sealed: nothing has been proven yet. */
export const publicConscienceSummary = (record: Pick<PublicConscience, "cyclesSealed" | "cleanCycles">) =>
  record.cyclesSealed > 0
    ? `${record.cleanCycles} of ${record.cyclesSealed} ${record.cyclesSealed === 1 ? "cycle" : "cycles"} clean`
    : null;
