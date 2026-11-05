import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatRole } from "@/lib/wavechat";
import type { HandoverItem } from "@/services/wavechat";

const Tick = ({ done, label }: { done: boolean; label: string }) => (
  <span className={`inline-flex items-center gap-1 text-xs ${done ? "font-semibold text-primary" : "text-muted-foreground"}`}>
    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
    {label}
  </span>
);

interface HandoverChecklistProps {
  items: HandoverItem[];
  role: ChatRole;
  busy: boolean;
  onConfirm: (itemKey: string) => void;
}

/** Papers and handover: each item is confirmed by both sides, completing the record of the sale. */
export const HandoverChecklist = ({ items, role, busy, onConfirm }: HandoverChecklistProps) => {
  const done = items.filter((item) => item.sellerConfirmedAt && item.buyerConfirmedAt).length;

  return (
    <div className="border-t bg-card p-3">
      <p className="flex items-center gap-2 text-sm font-bold">
        <ClipboardCheck className="h-4 w-4 text-primary" />
        Papers and handover · {done} of {items.length} confirmed by both
      </p>
      <ul className="mt-2 max-h-52 divide-y overflow-y-auto">
        {items.map((item) => {
          const mine = role === "seller" ? item.sellerConfirmedAt : item.buyerConfirmedAt;
          return (
            <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm">{item.label}</p>
                <p className="flex gap-3">
                  <Tick done={Boolean(item.sellerConfirmedAt)} label="Seller" />
                  <Tick done={Boolean(item.buyerConfirmedAt)} label="Buyer" />
                </p>
              </div>
              {!mine && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => onConfirm(item.key)}>Confirm</Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
