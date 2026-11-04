import { useState } from "react";
import { Camera, Car, CircleHelp, HandCoins, Send, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { PreviewPanel, SampleLabel } from "./PreviewPanel";

interface WaveChatPreviewProps {
  title: string;
  price: number;
  imageUrl: string | null;
}

const ACTIONS = [
  { id: "available", label: "Ask if available", icon: CircleHelp, message: () => "Hello, is this car still available?" },
  { id: "photos", label: "Request more photos", icon: Camera, message: () => "Could you send more photos, including the engine bay and the interior?" },
  { id: "inspection", label: "Arrange inspection", icon: Wrench, message: () => "I'd like to inspect the car. Which days can I come to the stand?" },
  { id: "offer", label: "Make an offer", icon: HandCoins, message: () => "I'd like to make an offer of ₦[your amount] for this car." },
] as const;

/**
 * WaveChat on a car page: the conversation carries the car with it, and the common questions are
 * one tap. Nothing is sent: tapping an action only shows the message the buyer would send.
 */
export const WaveChatPreview = ({ title, price, imageUrl }: WaveChatPreviewProps) => {
  const [chosen, setChosen] = useState<(typeof ACTIONS)[number]["id"] | null>(null);
  const action = ACTIONS.find((item) => item.id === chosen);

  return (
    <PreviewPanel feature="wavechat" subtitle="Chat with the seller, with this car attached">
      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center gap-3 border-b bg-card p-3">
          <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground"><Car className="h-5 w-5" /></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="text-sm font-bold text-primary">{formatNaira(price)}</p>
          </div>
        </div>

        <div className="min-h-[96px] space-y-2 p-3" aria-live="polite">
          {action ? (
            <>
              <SampleLabel>Your message would read</SampleLabel>
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                {action.message()}
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Not sent. In WaveChat this goes to the seller with the car attached.
                {action.id === "offer" && " An offer in chat is not a sale or a payment."}
              </p>
            </>
          ) : (
            <p className="py-5 text-center text-sm text-muted-foreground">Tap a question below to see how it would be sent.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t p-3">
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              variant={chosen === id ? "default" : "outline"}
              size="sm"
              className="h-auto justify-start whitespace-normal py-2 text-left text-xs"
              onClick={() => setChosen(id)}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              {label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t p-3">
          <input
            disabled
            aria-label="Message (available when WaveChat is active)"
            placeholder="Opens with WaveChat"
            className="h-9 min-w-0 flex-1 rounded-lg border bg-muted px-3 text-sm"
          />
          <Button type="button" size="icon" className="h-9 w-9" disabled aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">For now, contact the seller with the buttons above.</p>
    </PreviewPanel>
  );
};
