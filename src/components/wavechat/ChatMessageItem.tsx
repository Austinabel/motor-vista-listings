import { BadgeCheck, HandCoins, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira } from "@/lib/format";
import { paymentMethodLabel, type ChatRole, type WaveChatAction } from "@/lib/wavechat";
import type { ChatMessage, ChatReceipt } from "@/services/wavechat";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

const OFFER_STATUS: Record<string, string> = {
  pending: "Waiting for the seller",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
  replaced: "Replaced by a newer offer",
};

interface ChatMessageItemProps {
  message: ChatMessage;
  mine: boolean;
  role: ChatRole;
  ended: boolean;
  receipt: ChatReceipt | null;
  busy: boolean;
  onAct: (action: WaveChatAction, payload?: Record<string, unknown>) => void;
}

/** One message. Offers and receipts render as cards with their own buttons; everything else is a bubble. */
export const ChatMessageItem = ({ message, mine, role, ended, receipt, busy, onAct }: ChatMessageItemProps) => {
  const align = mine ? "items-end" : "items-start";

  if (message.kind === "offer") {
    const amount = Number(message.payload?.amount);
    const status = String(message.payload?.status ?? "pending");
    const open = status === "pending" && !ended;
    return (
      <div className={`flex flex-col ${align}`}>
        <div className="w-full max-w-sm rounded-2xl border-2 border-gold/60 bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <HandCoins className="h-4 w-4" />
            {mine ? "Your offer" : "Offer"}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{Number.isFinite(amount) ? formatNaira(amount) : "—"}</p>
          <p className="text-sm text-muted-foreground">{OFFER_STATUS[status] ?? status}</p>
          {open && role === "seller" && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" disabled={busy} onClick={() => onAct("accept_offer", { offer_id: message.id })}>Accept</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onAct("decline_offer", { offer_id: message.id })}>Decline</Button>
            </div>
          )}
          {open && role === "buyer" && mine && (
            <Button size="sm" variant="outline" className="mt-3" disabled={busy} onClick={() => onAct("withdraw_offer", { offer_id: message.id })}>
              Withdraw
            </Button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">An offer in chat is not a sale or a payment.</p>
        </div>
        <span className="mt-1 text-[11px] text-muted-foreground">{time(message.createdAt)}</span>
      </div>
    );
  }

  if (message.kind === "receipt" && receipt) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm">
          <p className="flex items-center gap-2 font-bold">
            <Receipt className="h-5 w-5 text-primary" />
            Receipt {receipt.receiptNumber}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Car</dt>
            <dd className="font-medium">{receipt.carTitle}</dd>
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-bold text-primary">{formatNaira(receipt.amount)}</dd>
            <dt className="text-muted-foreground">Paid by</dt>
            <dd className="font-medium">{paymentMethodLabel(receipt.paymentMethod)}</dd>
            <dt className="text-muted-foreground">Issued</dt>
            <dd className="font-medium">{formatDate(receipt.issuedAt)}</dd>
          </dl>
          {receipt.buyerConfirmedAt ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
              <BadgeCheck className="h-4 w-4" />
              Confirmed by the buyer on {formatDate(receipt.buyerConfirmedAt)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {role === "buyer" ? "Check the details, then confirm the receipt below." : "Waiting for the buyer to confirm."}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Recorded by the seller in WaveChat. Motorcars did not handle this payment.
          </p>
        </div>
      </div>
    );
  }

  const structured = message.kind !== "text";
  return (
    <div className={`flex flex-col ${align}`}>
      <p
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
          mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground"
        } ${structured ? "font-medium" : ""}`}
      >
        {message.content}
      </p>
      <span className="mt-1 text-[11px] text-muted-foreground">
        {time(message.createdAt)}
        {mine && message.isRead && " · read"}
      </span>
    </div>
  );
};
