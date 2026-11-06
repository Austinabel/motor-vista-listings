import { supabase } from "@/integrations/supabase/client";
import type { ArgusFallback, ArgusReply } from "@/lib/argus";
import { MoatwaveNotConnectedError } from "@/services/mid";
import type { FeatureMode } from "@/services/platformFeatures";

// Argus. The Motorcars version asks Claude through the argus server function; the Moatwave version
// isn't connected yet. A reply carrying `fallback` means Claude wasn't used, and the page shows why.

export interface ArgusQuestion {
  surface: "search" | "car";
  question: string;
  listingId?: string;
}

export interface ArgusBudget {
  monthlyCapUsd: number;
  dailyQuestionsPerUser: number;
  spentThisMonthUsd: number;
  questionsThisMonth: number;
}

export interface ArgusService {
  ask(question: ArgusQuestion): Promise<ArgusReply>;
  getBudget(): Promise<ArgusBudget | null>;
  setBudget(change: { monthlyCapUsd: number; dailyQuestionsPerUser: number }): Promise<void>;
}

const unavailable = { fallback: "unavailable" as ArgusFallback };

const motorcarsArgus: ArgusService = {
  async ask(question) {
    const { data, error } = await supabase.functions.invoke("argus", { body: question });
    if (error || !data) return unavailable;
    if (data.fallback) return { fallback: data.fallback as ArgusFallback };
    if (typeof data.answer !== "string") return unavailable;
    return { answer: data.answer, cars: data.cars ?? [] };
  },

  async getBudget() {
    const { data, error } = await supabase.rpc("get_argus_budget");
    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row) return null;
    return {
      monthlyCapUsd: Number(row.monthly_cap_usd),
      dailyQuestionsPerUser: row.daily_questions_per_user,
      spentThisMonthUsd: Number(row.spent_this_month_usd),
      questionsThisMonth: row.questions_this_month,
    };
  },

  async setBudget({ monthlyCapUsd, dailyQuestionsPerUser }) {
    const { error } = await supabase
      .from("argus_settings")
      .update({ monthly_cap_usd: monthlyCapUsd, daily_questions_per_user: dailyQuestionsPerUser })
      .eq("id", true);
    if (error) throw new Error(error.message);
  },
};

const notConnected = async (): Promise<never> => {
  throw new MoatwaveNotConnectedError();
};

const moatwaveArgus: ArgusService = { ask: notConnected, getBudget: notConnected, setBudget: notConnected };

export const argusService = (mode: FeatureMode): ArgusService => (mode === "moatwave" ? moatwaveArgus : motorcarsArgus);
