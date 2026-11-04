import { useQuery } from "@tanstack/react-query";
import type { MoatwaveFeatureId } from "@/config/moatwave";
import { FALLBACK_MODES, fetchFeatureModes, type FeatureMode, type FeatureModes } from "@/services/platformFeatures";

export const FEATURE_MODES_KEY = ["platform-features"];

export const useFeatureModes = () =>
  useQuery({ queryKey: FEATURE_MODES_KEY, queryFn: fetchFeatureModes, staleTime: 60_000, retry: 1 });

/** All modes, using today's defaults while the settings load. */
export const useAllFeatureModes = (): FeatureModes => useFeatureModes().data?.modes ?? FALLBACK_MODES;

export const useFeatureMode = (feature: MoatwaveFeatureId): FeatureMode => useAllFeatureModes()[feature];
