import { supabase } from "@/integrations/supabase/client";
import { MOATWAVE_PREVIEWS } from "@/config/features";
import { MOATWAVE_FEATURES, type MoatwaveFeatureId } from "@/config/moatwave";

// Which version of each Moatwave feature runs, as chosen by admins in the platform_features table:
//   off       – hidden
//   preview   – the labelled previews
//   motorcars – the interim version built into Motorcars
//   moatwave  – the real Moatwave service (refused by the database until Moatwave is connected)

export type FeatureMode = "off" | "preview" | "motorcars" | "moatwave";
export type FeatureModes = Record<MoatwaveFeatureId, FeatureMode>;

export const FEATURE_MODES: { id: FeatureMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "preview", label: "Preview" },
  { id: "motorcars", label: "Motorcars" },
  { id: "moatwave", label: "Moatwave" },
];

/** Features whose Motorcars version exists. Mirrors motorcars_feature_built() in the database. */
export const MOTORCARS_BUILT: Record<MoatwaveFeatureId, boolean> = {
  mid: true,
  wavechat: false,
  oio: true,
  conscience: false,
  argus: false,
};

/** Mirrors moatwave_connected() in the database. */
export const MOATWAVE_CONNECTED = false;

export interface FeatureModesResult {
  modes: FeatureModes;
  /** "fallback" when the platform_features table isn't in the database yet. */
  source: "database" | "fallback";
}

const allModes = (mode: FeatureMode) =>
  Object.fromEntries(MOATWAVE_FEATURES.map(({ id }) => [id, mode])) as FeatureModes;

/** Before the migration is applied, every feature keeps today's behaviour: previews unless turned off. */
export const FALLBACK_MODES: FeatureModes = allModes(MOATWAVE_PREVIEWS ? "preview" : "off");

const isMode = (value: unknown): value is FeatureMode => FEATURE_MODES.some((mode) => mode.id === value);

export const fetchFeatureModes = async (): Promise<FeatureModesResult> => {
  const { data, error } = await supabase.from("platform_features").select("feature, mode");
  if (error || !data) return { modes: FALLBACK_MODES, source: "fallback" };

  const modes = { ...FALLBACK_MODES };
  for (const row of data) {
    if (row.feature in modes && isMode(row.mode)) modes[row.feature as MoatwaveFeatureId] = row.mode;
  }
  return { modes, source: "database" };
};

export const setFeatureMode = async (feature: MoatwaveFeatureId, mode: FeatureMode) => {
  const { error } = await supabase.from("platform_features").update({ mode }).eq("feature", feature);
  if (error) throw new Error(error.message);
};
