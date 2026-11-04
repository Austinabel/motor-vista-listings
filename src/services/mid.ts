import { supabase } from "@/integrations/supabase/client";
import type { FeatureMode } from "@/services/platformFeatures";

// MID (Moatwave identity). One interface, two providers: the interim Motorcars version, which
// stores MIDs in Motorcars' own database, and Moatwave, which isn't connected yet. Pages call
// midService(mode) and never know which one answered.

export interface PublicMid {
  /** Hidden (null) when the person's phone number isn't public: a MID is the number reversed. */
  mid: string | null;
  /** 0–1000, the MID ring */
  score: number;
  tier: string;
  phoneVerified: boolean;
  issuedBy: "motorcars" | "moatwave";
  cyclesSealed: number;
}

export interface MidLedgerEntry {
  id: number;
  label: string;
  points: number;
  createdAt: string;
}

export interface MidService {
  getPublicMid(userId: string): Promise<PublicMid | null>;
  getMyLedger(userId: string): Promise<MidLedgerEntry[]>;
  issueMyMid(): Promise<string>;
}

export class MoatwaveNotConnectedError extends Error {
  constructor() {
    super("Moatwave isn't connected yet.");
  }
}

const motorcarsMid: MidService = {
  async getPublicMid(userId) {
    const { data, error } = await supabase.rpc("get_public_mid", { _user_id: userId });
    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row) return null;
    return {
      mid: row.mid,
      score: Number(row.score),
      tier: row.tier,
      phoneVerified: row.phone_verified,
      issuedBy: row.issued_by === "moatwave" ? "moatwave" : "motorcars",
      cyclesSealed: row.cycles_sealed,
    };
  },

  async getMyLedger(userId) {
    const [ledger, rules] = await Promise.all([
      supabase
        .from("mid_score_ledger")
        .select("id, event_type, points, config_version_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("mid_point_rules").select("version_id, event_type, label"),
    ]);
    if (ledger.error) throw new Error(ledger.error.message);
    const labels = new Map((rules.data ?? []).map((rule) => [`${rule.version_id}:${rule.event_type}`, rule.label]));
    return (ledger.data ?? []).map((row) => ({
      id: row.id,
      label: labels.get(`${row.config_version_id}:${row.event_type}`) ?? row.event_type,
      points: Number(row.points),
      createdAt: row.created_at,
    }));
  },

  async issueMyMid() {
    const { data, error } = await supabase.rpc("issue_my_mid");
    if (error) throw new Error(error.message);
    return data;
  },
};

const notConnected = async (): Promise<never> => {
  throw new MoatwaveNotConnectedError();
};

const moatwaveMid: MidService = {
  getPublicMid: notConnected,
  getMyLedger: notConnected,
  issueMyMid: notConnected,
};

export const midService = (mode: FeatureMode): MidService => (mode === "moatwave" ? moatwaveMid : motorcarsMid);
