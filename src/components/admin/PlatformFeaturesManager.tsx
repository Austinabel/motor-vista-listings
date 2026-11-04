import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MOATWAVE_FEATURES, type MoatwaveFeatureId } from "@/config/moatwave";
import { FEATURE_MODES_KEY, useFeatureModes } from "@/hooks/useFeatureMode";
import {
  FEATURE_MODES, MOATWAVE_CONNECTED, MOTORCARS_BUILT, setFeatureMode, type FeatureMode,
} from "@/services/platformFeatures";

const MODE_HELP: Record<FeatureMode, string> = {
  off: "Hidden everywhere",
  preview: "Labelled previews",
  motorcars: "Working Motorcars version",
  moatwave: "Real Moatwave service",
};

const unavailableReason = (feature: MoatwaveFeatureId, mode: FeatureMode) => {
  if (mode === "moatwave" && !MOATWAVE_CONNECTED) return "Moatwave isn't connected yet";
  if (mode === "motorcars" && !MOTORCARS_BUILT[feature]) return "Not built yet";
  return null;
};

interface PointRule {
  event_type: string;
  label: string;
  points: number;
}

const fetchActiveRules = async () => {
  const { data: version, error } = await supabase
    .from("score_config_versions")
    .select("id, label, created_at")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!version) return null;
  const { data: rules, error: rulesError } = await supabase
    .from("mid_point_rules")
    .select("event_type, label, points")
    .eq("version_id", version.id)
    .order("points", { ascending: false });
  if (rulesError) throw new Error(rulesError.message);
  return { version, rules: (rules ?? []).map((rule) => ({ ...rule, points: Number(rule.points) })) as PointRule[] };
};

const PointValuesEditor = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["score-config"], queryFn: fetchActiveRules, retry: false });
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setDraft(Object.fromEntries(data.rules.map((rule) => [rule.event_type, String(rule.points)])));
  }, [data]);

  const changed = data?.rules.filter((rule) => draft[rule.event_type] !== undefined && Number(draft[rule.event_type]) !== rule.points) ?? [];
  const invalid = changed.some((rule) => !Number.isFinite(Number(draft[rule.event_type])));

  const publish = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("publish_score_config", {
        _label: `Motorcars interim, edited ${new Date().toLocaleDateString("en-NG")}`,
        _rules: changed.map((rule) => ({ event_type: rule.event_type, points: Number(draft[rule.event_type]) })),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("New point values published. Points already earned are unchanged.");
      queryClient.invalidateQueries({ queryKey: ["score-config"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  if (isError || !data) return <p className="text-sm text-muted-foreground">Point values aren't available until the migration is applied.</p>;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Active version: <span className="font-semibold text-foreground">{data.version.label}</span>. Publishing creates a new
        version; points already in anyone's history keep the value they were earned at.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-medium">Event</th>
              <th className="w-28 py-2 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {data.rules.map((rule) => (
              <tr key={rule.event_type} className="border-b last:border-0">
                <td className="py-2">{rule.label}</td>
                <td className="py-2">
                  <Input
                    aria-label={`Points for ${rule.label}`}
                    inputMode="decimal"
                    value={draft[rule.event_type] ?? ""}
                    onChange={(event) => setDraft({ ...draft, [rule.event_type]: event.target.value })}
                    className="h-9"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button className="mt-4" disabled={changed.length === 0 || invalid || publish.isPending} onClick={() => publish.mutate()}>
        Publish {changed.length > 0 ? `${changed.length} change${changed.length === 1 ? "" : "s"}` : "changes"}
      </Button>
    </div>
  );
};

/** Admin control over which version of each Moatwave feature runs. */
export const PlatformFeaturesManager = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useFeatureModes();

  const change = useMutation({
    mutationFn: ({ feature, mode }: { feature: MoatwaveFeatureId; mode: FeatureMode }) => setFeatureMode(feature, mode),
    onSuccess: () => {
      toast.success("Feature updated");
      queryClient.invalidateQueries({ queryKey: FEATURE_MODES_KEY });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const fallback = data?.source === "fallback";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-bold">Moatwave features</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose what visitors get for each feature. Switch to Moatwave once the Moatwave connection is set up; pages don't
          change when you do.
        </p>

        {fallback && (
          <p className="mt-4 flex gap-2 rounded-lg border border-gold/60 bg-accent/60 px-3 py-2 text-sm text-accent-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            These settings can't be changed until migration 20261105120000_platform_features_and_mid.sql is applied.
            Every feature shows its preview until then.
          </p>
        )}

        {isLoading ? (
          <div className="mt-4 h-48 animate-pulse rounded-xl bg-muted" />
        ) : (
          <ul className="mt-4 divide-y">
            {MOATWAVE_FEATURES.map(({ id, name, role, icon: Icon }) => {
              const current = data?.modes[id] ?? "preview";
              return (
                <li key={id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-gold"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">{role} · now: {MODE_HELP[current]}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`${name} mode`}>
                    {FEATURE_MODES.map((mode) => {
                      const reason = unavailableReason(id, mode.id);
                      const selected = current === mode.id;
                      return (
                        <Button
                          key={mode.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          disabled={fallback || Boolean(reason) || change.isPending}
                          title={reason ?? MODE_HELP[mode.id]}
                          onClick={() => !selected && change.mutate({ feature: id, mode: mode.id })}
                        >
                          {mode.label}
                          {reason && <span className="ml-1 text-[10px] font-normal opacity-80">({reason})</span>}
                        </Button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-bold">MID point values</h2>
        <PointValuesEditor />
      </section>
    </div>
  );
};
