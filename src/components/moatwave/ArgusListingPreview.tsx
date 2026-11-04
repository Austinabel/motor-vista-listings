import { CheckCircle2, CircleAlert, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inspectionQuestions, missingListingDetails, type ListingDetailsInput } from "@/lib/argus";
import { PreviewPanel } from "./PreviewPanel";

interface ArgusListingPreviewProps {
  listing: ListingDetailsInput & { condition: string | null };
}

/**
 * Argus on a car page. Both lists come from fixed rules: what the seller left empty, and general
 * inspection questions for the car's condition. The free-text question box opens with Argus.
 */
export const ArgusListingPreview = ({ listing }: ArgusListingPreviewProps) => {
  const missing = missingListingDetails(listing);
  const questions = inspectionQuestions(listing.condition);

  return (
    <PreviewPanel feature="argus" title="Argus on this car" subtitle="Intelligence · Powered by Moatwave">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <CircleAlert className="h-3.5 w-3.5" />
            Not in this listing
          </p>
          {missing.length > 0 ? (
            <>
              <ul className="mt-2 space-y-1.5 text-sm">
                {missing.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Ask the seller for these before you travel to see the car.</p>
            </>
          ) : (
            <p className="mt-2 flex gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              The seller filled in all the main details.
            </p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Questions to ask at inspection
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
            {questions.map((question) => <li key={question}>{question}</li>)}
          </ol>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          disabled
          aria-label="Ask Argus about this car (available when Argus is active)"
          placeholder="Ask Argus anything about this car, once Argus is active"
          className="h-10 min-w-0 flex-1 rounded-lg border bg-muted px-3 text-sm"
        />
        <Button type="button" disabled>
          <Sparkles className="mr-2 h-4 w-4" />
          Ask
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        For now these lists come from simple fixed checks, not from AI. Argus will answer questions using only this
        listing's real details.
      </p>
    </PreviewPanel>
  );
};
