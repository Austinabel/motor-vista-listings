import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { interpretSearchRequest } from "@/lib/argus";
import type { SearchCriteria } from "@/lib/vehicleSearch";
import { PreviewBadge } from "./PreviewPanel";

const EXAMPLE = "Toyota SUV under 15 million in Lagos, 2015 or newer";

/**
 * Argus search: the buyer describes the car in their own words and the request becomes ordinary
 * filters, shown back so they can check them. For now fixed rules do the reading, and the page says so.
 */
export const ArgusSearchBox = ({ onApply }: { onApply: (criteria: SearchCriteria) => void }) => {
  const [text, setText] = useState("");
  const [understood, setUnderstood] = useState<string[] | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const request = text.trim();
    if (!request) return;
    const result = interpretSearchRequest(request);
    setUnderstood(result.understood);
    if (result.understood.length > 0) onApply(result.criteria);
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-gold/60 bg-card p-4 shadow-sm">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-gold">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-bold">Ask Argus</span>
          <PreviewBadge />
        </div>
        <label htmlFor="argus-search" className="sr-only">Describe the car you want</label>
        <input
          id="argus-search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Describe the car you want, e.g. “${EXAMPLE}”`}
          className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={!text.trim()}>Find cars</Button>
      </form>

      {understood && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
          {understood.length > 0 ? (
            <>
              <span className="text-muted-foreground">Searching for:</span>
              {understood.map((label) => (
                <span key={label} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">{label}</span>
              ))}
            </>
          ) : (
            <span className="text-muted-foreground">
              Argus couldn't pick out a make, price, place or year from that. Try something like “{EXAMPLE}”.
            </span>
          )}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Preview: simple fixed rules turn your words into the filters below, not AI. The full Argus assistant arrives with
        Moatwave.{" "}
        <Link to="/moatwave#argus" className="font-semibold text-primary hover:underline">How it will work</Link>
      </p>
    </div>
  );
};
