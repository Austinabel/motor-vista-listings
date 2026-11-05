import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Camera, CircleHelp, HandCoins, MessagesSquare, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { ACTION_LABELS, type WaveChatAction } from "@/lib/wavechat";
import { waveChatService } from "@/services/wavechat";

const START_ACTIONS: { action: WaveChatAction; icon: typeof CircleHelp }[] = [
  { action: "ask_availability", icon: CircleHelp },
  { action: "request_photos", icon: Camera },
  { action: "book_inspection", icon: Wrench },
  { action: "make_offer", icon: HandCoins },
];

/** WaveChat on a car page: one tap opens a conversation about this car with the question already asked. */
export const WaveChatStart = ({ listingId }: { listingId: string }) => {
  const mode = useFeatureMode("wavechat");
  const service = waveChatService(mode);
  const navigate = useNavigate();
  const [form, setForm] = useState<"make_offer" | "book_inspection" | null>(null);
  const [value, setValue] = useState("");

  const start = useMutation({
    mutationFn: async ({ action, payload }: { action: WaveChatAction | null; payload?: Record<string, unknown> }) => {
      const conversationId = await service.start(listingId);
      if (action) await service.act(conversationId, action, payload);
      return conversationId;
    },
    onSuccess: (conversationId) => navigate(`/messages?c=${conversationId}`),
    onError: (error: Error) => toast.error(error.message),
  });

  const choose = (action: WaveChatAction) => {
    if (action === "make_offer" || action === "book_inspection") {
      setForm(form === action ? null : action);
      setValue("");
      return;
    }
    start.mutate({ action });
  };

  const valid = form === "make_offer" ? Number(value) > 0 : Boolean(value) && new Date(value).getTime() > Date.now();

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="flex items-center gap-2 font-bold">
        <MessagesSquare className="h-5 w-5 text-primary" />
        WaveChat with the seller
      </p>
      <p className="mt-1 text-sm text-muted-foreground">The conversation keeps this car attached, so the seller knows exactly what you're asking about.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {START_ACTIONS.map(({ action, icon: Icon }) => (
          <Button
            key={action}
            type="button"
            variant={form === action ? "default" : "outline"}
            size="sm"
            className="h-auto justify-start whitespace-normal py-2 text-left text-xs"
            disabled={start.isPending}
            onClick={() => choose(action)}
          >
            <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            {ACTION_LABELS[action]}
          </Button>
        ))}
      </div>
      {form && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            start.mutate({
              action: form,
              payload: form === "make_offer" ? { amount: Number(value) } : { proposed_at: new Date(value).toISOString() },
            });
          }}
        >
          {form === "make_offer" ? (
            <Input inputMode="numeric" aria-label="Your offer in naira" placeholder="Your offer (₦)" value={value} onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, ""))} />
          ) : (
            <Input type="datetime-local" aria-label="Inspection time" value={value} onChange={(event) => setValue(event.target.value)} />
          )}
          <Button type="submit" disabled={!valid || start.isPending}>Send</Button>
        </form>
      )}
      {form === "make_offer" && <p className="mt-2 text-xs text-muted-foreground">An offer in chat is not a sale or a payment.</p>}
      <Button variant="link" className="mt-1 h-auto px-0 text-sm" disabled={start.isPending} onClick={() => start.mutate({ action: null })}>
        Or write your own message
      </Button>
    </section>
  );
};
