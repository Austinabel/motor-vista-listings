import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { argusFallbackMessage, interpretSearchRequest } from "@/lib/argus";
import type { SearchCriteria } from "@/lib/vehicleSearch";
import { argusService } from "@/services/argus";
import { ArgusAnswer } from "./ArgusAnswer";

const EXAMPLE = "Family SUV under 15 million in Lagos";

/** Ask Argus on the search page. When Claude can't be used, fixed rules turn the words into filters instead. */
export const ArgusSearchAssistant = ({ onApply }: { onApply: (criteria: SearchCriteria) => void }) => {
  const mode = useFeatureMode("argus");
  const [text, setText] = useState("");
  const [understood, setUnderstood] = useState<string[]>([]);

  const ask = useMutation({
    mutationFn: (question: string) => argusService(mode).ask({ surface: "search", question }),
    onSuccess: (reply, question) => {
      if (!("fallback" in reply)) {
        setUnderstood([]);
        return;
      }
      const result = interpretSearchRequest(question);
      setUnderstood(result.understood);
      if (result.understood.length > 0) onApply(result.criteria);
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const question = text.trim();
    if (question) ask.mutate(question);
  };

  const reply = ask.data;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-gold">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-bold">Ask Argus</span>
        </div>
        <label htmlFor="argus-ask" className="sr-only">Describe the car you want</label>
        <input
          id="argus-ask"
          value={text}
          maxLength={500}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Describe the car you want, e.g. “${EXAMPLE}”`}
          className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={!text.trim() || ask.isPending}>{ask.isPending ? "Asking…" : "Ask"}</Button>
      </form>

      {ask.isError && <p className="mt-3 text-sm text-muted-foreground">Argus couldn't answer just now. Try again.</p>}
      {reply && !("fallback" in reply) && <ArgusAnswer answer={reply.answer} cars={reply.cars} />}
      {reply && "fallback" in reply && (
        <div className="mt-3 text-sm" aria-live="polite">
          <p className="text-muted-foreground">{argusFallbackMessage(reply.fallback)}</p>
          {understood.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Searching for:</span>
              {understood.map((label) => (
                <span key={label} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">{label}</span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground">Try naming a make, price, place or year.</p>
          )}
        </div>
      )}
    </div>
  );
};
