import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { argusService } from "@/services/argus";

/** The monthly spending cap and daily limit for Argus. Nothing is spent on Claude while the cap is 0. */
export const ArgusBudgetSettings = () => {
  const service = argusService("motorcars");
  const queryClient = useQueryClient();
  const { data, isError } = useQuery({ queryKey: ["argus-budget"], queryFn: () => service.getBudget(), retry: false });
  const [cap, setCap] = useState("");
  const [daily, setDaily] = useState("");

  useEffect(() => {
    if (data) {
      setCap(String(data.monthlyCapUsd));
      setDaily(String(data.dailyQuestionsPerUser));
    }
  }, [data]);

  const monthlyCapUsd = Number(cap);
  const dailyQuestionsPerUser = Number(daily);
  const valid = cap !== "" && daily !== "" && monthlyCapUsd >= 0 && Number.isInteger(dailyQuestionsPerUser) && dailyQuestionsPerUser >= 0;

  const save = useMutation({
    mutationFn: () => service.setBudget({ monthlyCapUsd, dailyQuestionsPerUser }),
    onSuccess: () => {
      toast.success("Argus limits saved");
      queryClient.invalidateQueries({ queryKey: ["argus-budget"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isError) return <p className="mt-4 text-sm text-muted-foreground">Argus limits couldn't be loaded.</p>;
  if (!data) return null;

  return (
    <div className="mt-4 rounded-lg bg-muted p-3">
      <p className="text-sm font-semibold">Argus spending</p>
      <p className="mt-1 text-sm text-muted-foreground">
        ${data.spentThisMonthUsd.toFixed(2)} of ${data.monthlyCapUsd.toFixed(2)} used this month, across {data.questionsThisMonth}{" "}
        {data.questionsThisMonth === 1 ? "question" : "questions"}. At the cap, Argus switches to fixed rules until next month.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium">
          Monthly cap (US$)
          <Input className="mt-1 w-32 bg-background" type="number" min={0} step="1" value={cap} onChange={(event) => setCap(event.target.value)} />
        </label>
        <label className="text-xs font-medium">
          Questions per person per day
          <Input className="mt-1 w-32 bg-background" type="number" min={0} step="1" value={daily} onChange={(event) => setDaily(event.target.value)} />
        </label>
        <Button size="sm" onClick={() => save.mutate()} disabled={!valid || save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
};
