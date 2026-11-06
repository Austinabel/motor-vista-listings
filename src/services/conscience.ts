import { supabase } from "@/integrations/supabase/client";
import type {
  ConscienceCycle, ConscienceFinding, CycleOutcome, CycleStatus, FindingKind, FindingStatus, PublicConscience,
} from "@/lib/conscience";
import { MoatwaveNotConnectedError } from "@/services/mid";
import type { FeatureMode } from "@/services/platformFeatures";

// Conscience Protocol. The Motorcars version runs 14-day cycles in Motorcars' own database;
// the Moatwave version isn't connected yet. Pages call conscienceService(mode).

export interface MyConscience {
  /** The cycle under way, if any. */
  current: ConscienceCycle | null;
  /** Newest first. */
  sealed: ConscienceCycle[];
  /** Findings on the current cycle and the listed sealed cycles. */
  findings: ConscienceFinding[];
}

export interface ConscienceService {
  getMyRecord(userId: string): Promise<MyConscience>;
  getPublicRecord(sellerId: string): Promise<PublicConscience | null>;
  upholdReport(reportId: string, note: string): Promise<void>;
  runCycles(): Promise<number>;
}

const SEALED_SHOWN = 6;

const motorcarsConscience: ConscienceService = {
  async getMyRecord(userId) {
    const { error: refreshError } = await supabase.rpc("refresh_my_conscience");
    if (refreshError) throw new Error(refreshError.message);

    const { data, error } = await supabase
      .from("conscience_cycles")
      .select("id, cycle_number, status, starts_at, observation_ends_at, reconcile_ends_at, cars_tracked, cars_confirmed, outcome, points_awarded, sealed_at")
      .eq("seller_id", userId)
      .order("cycle_number", { ascending: false })
      .limit(SEALED_SHOWN + 1);
    if (error) throw new Error(error.message);

    const cycles: ConscienceCycle[] = (data ?? []).map((row) => ({
      id: row.id,
      cycleNumber: row.cycle_number,
      status: row.status as CycleStatus,
      startsAt: row.starts_at,
      observationEndsAt: row.observation_ends_at,
      reconcileEndsAt: row.reconcile_ends_at,
      carsTracked: row.cars_tracked,
      carsConfirmed: row.cars_confirmed,
      outcome: row.outcome as CycleOutcome | null,
      pointsAwarded: Number(row.points_awarded),
      sealedAt: row.sealed_at,
    }));
    if (cycles.length === 0) return { current: null, sealed: [], findings: [] };

    const { data: findings, error: findingsError } = await supabase
      .from("conscience_findings")
      .select("id, cycle_id, listing_id, car_title, kind, status")
      .in("cycle_id", cycles.map((cycle) => cycle.id))
      .order("opened_at", { ascending: true });
    if (findingsError) throw new Error(findingsError.message);

    return {
      current: cycles.find((cycle) => cycle.status !== "sealed") ?? null,
      sealed: cycles.filter((cycle) => cycle.status === "sealed").slice(0, SEALED_SHOWN),
      findings: (findings ?? []).map((row) => ({
        id: row.id,
        cycleId: row.cycle_id,
        listingId: row.listing_id,
        carTitle: row.car_title,
        kind: row.kind as FindingKind,
        status: row.status as FindingStatus,
      })),
    };
  },

  async getPublicRecord(sellerId) {
    const { data, error } = await supabase.rpc("get_public_conscience", { _seller_id: sellerId });
    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row) return null;
    return {
      cyclesSealed: row.cycles_sealed,
      cleanCycles: row.clean_cycles,
      lastSealedAt: row.last_sealed_at,
      cycleInProgress: row.cycle_in_progress,
    };
  },

  async upholdReport(reportId, note) {
    const { error } = await supabase.rpc("conscience_uphold_report", { _report_id: reportId, _note: note });
    if (error) throw new Error(error.message);
  },

  async runCycles() {
    const { data, error } = await supabase.rpc("conscience_run");
    if (error) throw new Error(error.message);
    return data ?? 0;
  },
};

const notConnected = async (): Promise<never> => {
  throw new MoatwaveNotConnectedError();
};

const moatwaveConscience: ConscienceService = {
  getMyRecord: notConnected,
  getPublicRecord: notConnected,
  upholdReport: notConnected,
  runCycles: notConnected,
};

export const conscienceService = (mode: FeatureMode): ConscienceService =>
  mode === "moatwave" ? moatwaveConscience : motorcarsConscience;
