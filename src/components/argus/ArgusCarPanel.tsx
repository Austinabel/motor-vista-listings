import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { argusFallbackMessage, inspectionQuestions, missingListingDetails, type ListingDetailsInput } from "@/lib/argus";
import { argusService } from "@/services/argus";
import { ArgusAnswer } from "./ArgusAnswer";

interface ArgusCarPanelProps {
  listingId: string;
  listing: ListingDetailsInput & { condition: string | null };
}

/** Argus on a car page: what the listing leaves out, what to ask at inspection, and questions about this car. */
export const ArgusCarPanel = ({ listingId, listing }: ArgusCarPanelProps) => {
  const mode = useFeatureMode("argus");
  const [text, setText] = useState("");
  const missing = missingListingDetails(listing);

  const ask = useMutation({
    mutationFn: (question: string) => argusService(mode).ask({ surface: "car", question, listingId }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const question = text.trim();
    if (question) ask.mutate(question);
  };

  const reply = ask.data;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-primary" />Argus on this car</h2>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <input
          value={text}
          maxLength={500}
          onChange={(event) => setText(event.target.value)}
          aria-label="Ask Argus about this car"
          placeholder="Ask anything about this car"
          className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={!text.trim() || ask.isPending}>{ask.isPending ? "Asking…" : "Ask"}</Button>
      </form>
      {ask.isError && <p className="mt-3 text-sm text-muted-foreground">Argus couldn't answer just now. Try again.</p>}
      {reply && "fallback" in reply && <p className="mt-3 text-sm text-muted-foreground">{argusFallbackMessage(reply.fallback)}</p>}
      {reply && !("fallback" in reply) && <ArgusAnswer answer={reply.answer} cars={reply.cars} />}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <CircleAlert className="h-3.5 w-3.5" />Not in this listing
          </p>
          {missing.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm">
              {missing.map((item) => (
                <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />The seller filled in all the main details.</p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <ClipboardCheck className="h-3.5 w-3.5" />Questions to ask at inspection
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
            {inspectionQuestions(listing.condition).map((question) => <li key={question}>{question}</li>)}
          </ol>
        </div>
      </div>
    </section>
  );
};
