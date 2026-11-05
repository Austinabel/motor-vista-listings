import { useState } from "react";
import { BadgeCheck, CalendarClock, FileText, HandCoins, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNaira } from "@/lib/format";
import { lagosToday, paymentMethodLabel, promiseState, type ChatRole, type WaveChatAction } from "@/lib/wavechat";
import type { ChatMessage, ChatPromise, ChatReceipt } from "@/services/wavechat";

type Act = (action: WaveChatAction, payload?: Record<string, unknown>) => void;

const NOT_A_SALE = "This is an agreement in chat, not a sale or a payment.";

const OFFER_STATUS: Record<string, string> = {
  pending: "Waiting for the seller",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
  replaced: "Replaced by a newer offer",
};

export const OfferCard = ({ message, mine, role, open, busy, onAct }: { message: ChatMessage; mine: boolean; role: ChatRole; open: boolean; busy: boolean; onAct: Act }) => {
  const amount = Number(message.payload?.amount);
  const status = String(message.payload?.status ?? "pending");
  const waiting = status === "pending" && open;
  return (
    <div className="w-full max-w-sm rounded-2xl border-2 border-gold/60 bg-card p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <HandCoins className="h-4 w-4" />
        {mine ? "Your offer" : "Offer"}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-primary">{Number.isFinite(amount) ? formatNaira(amount) : "—"}</p>
      <p className="text-sm text-muted-foreground">{OFFER_STATUS[status] ?? status}</p>
      {waiting && role === "seller" && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={busy} onClick={() => onAct("accept_offer", { offer_id: message.id })}>Accept</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onAct("decline_offer", { offer_id: message.id })}>Decline</Button>
        </div>
      )}
      {waiting && role === "buyer" && mine && (
        <Button size="sm" variant="outline" className="mt-3" disabled={busy} onClick={() => onAct("withdraw_offer", { offer_id: message.id })}>Withdraw</Button>
      )}
      <p className="mt-3 text-xs text-muted-foreground">An offer in chat is not a sale or a payment.</p>
    </div>
  );
};

const QUOTE_STATUS: Record<string, string> = {
  pending: "Waiting for the buyer",
  accepted: "Accepted",
  changes_requested: "Buyer asked for changes",
  replaced: "Replaced by a newer quote",
};

export const QuoteCard = ({ message, role, open, busy, onAct }: { message: ChatMessage; role: ChatRole; open: boolean; busy: boolean; onAct: Act }) => {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const amount = Number(message.payload?.amount);
  const validUntil = String(message.payload?.valid_until ?? "");
  const includes = Array.isArray(message.payload?.includes) ? (message.payload?.includes as string[]) : [];
  const status = String(message.payload?.status ?? "pending");
  const expired = status === "pending" && validUntil < lagosToday();
  const waiting = status === "pending" && open && !expired;

  return (
    <div className="w-full max-w-sm rounded-2xl border-2 border-primary/40 bg-card p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <FileText className="h-4 w-4" />
        Quote from the seller
      </p>
      <p className="mt-1 text-2xl font-extrabold text-primary">{Number.isFinite(amount) ? formatNaira(amount) : "—"}</p>
      {includes.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {includes.map((item) => (
            <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{item}</li>
          ))}
        </ul>
      )}
      {typeof message.payload?.note === "string" && message.payload.note && <p className="mt-2 text-sm text-muted-foreground">{message.payload.note}</p>}
      <p className="mt-2 text-sm text-muted-foreground">
        Valid until {validUntil ? formatDate(validUntil) : "—"} · {expired ? "Expired" : QUOTE_STATUS[status] ?? status}
      </p>
      {waiting && role === "buyer" && !asking && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={busy} onClick={() => onAct("accept_quote", { quote_id: message.id })}>Accept quote</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setAsking(true)}>Ask for changes</Button>
        </div>
      )}
      {waiting && role === "buyer" && asking && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onAct("request_quote_changes", { quote_id: message.id, note });
          }}
        >
          <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What should change?" maxLength={300} aria-label="What should change" />
          <Button type="submit" size="sm" disabled={busy}>Send</Button>
        </form>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{NOT_A_SALE}</p>
    </div>
  );
};

const RECEIPT_TITLE: Record<ChatReceipt["kind"], string> = {
  deposit: "Deposit receipt",
  part_payment: "Part-payment receipt",
  final: "Final receipt",
};

export const ReceiptCard = ({ receipt, role, busy, onAct }: { receipt: ChatReceipt; role: ChatRole; busy: boolean; onAct: Act }) => (
  <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm">
    <p className="flex items-center gap-2 font-bold">
      <Receipt className="h-5 w-5 text-primary" />
      {RECEIPT_TITLE[receipt.kind]} {receipt.receiptNumber}
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
    ) : role === "buyer" ? (
      <Button size="sm" className="mt-3" disabled={busy} onClick={() => onAct("confirm_receipt", { receipt_id: receipt.id })}>Confirm receipt</Button>
    ) : (
      <p className="mt-3 text-sm text-muted-foreground">Waiting for the buyer to confirm.</p>
    )}
    <p className="mt-3 text-xs text-muted-foreground">Recorded by the seller in WaveChat. Motorcars did not handle this payment.</p>
  </div>
);

const PROMISE_STATE: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "text-muted-foreground" },
  overdue: { label: "Overdue", tone: "text-destructive" },
  kept: { label: "Kept on time", tone: "text-primary" },
  kept_late: { label: "Paid after the date", tone: "text-muted-foreground" },
  replaced: { label: "Replaced by a newer promise", tone: "text-muted-foreground" },
};

export const PromiseCard = ({ promise, mine }: { promise: ChatPromise; mine: boolean }) => {
  const state = PROMISE_STATE[promiseState(promise, lagosToday())];
  return (
    <div className="w-full max-w-sm rounded-2xl border bg-card p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <CalendarClock className="h-4 w-4" />
        {mine ? "Your payment promise" : "Payment promise"}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-primary">{formatNaira(promise.amount)}</p>
      <p className="text-sm">by {formatDate(promise.dueDate)}</p>
      <p className={`mt-1 text-sm font-semibold ${state.tone}`}>{state.label}</p>
    </div>
  );
};
