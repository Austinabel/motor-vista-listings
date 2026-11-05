import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHODS, QUOTE_INCLUSIONS, lagosToday, type PaymentMethod, type WaveChatAction } from "@/lib/wavechat";

export type FormAction = "make_offer" | "book_inspection" | "send_quote" | "promise_payment" | "record_payment" | "record_sale";

export const FORM_ACTIONS: FormAction[] = ["make_offer", "book_inspection", "send_quote", "promise_payment", "record_payment", "record_sale"];

const selectClass = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm";

const NOTES: Partial<Record<FormAction, string>> = {
  make_offer: "An offer in chat is not a sale or a payment.",
  send_quote: "A quote is an agreement in chat once accepted, not a sale or a payment.",
  promise_payment: "Keeping a promise on time adds to your MID record.",
  record_payment: "Only record money you have actually received. The buyer gets a receipt to confirm.",
  record_sale: "Only record this once you have been paid in full. It marks the car sold and sends the buyer a final receipt.",
};

const SUBMIT: Record<FormAction, string> = {
  make_offer: "Send offer",
  book_inspection: "Ask for this time",
  send_quote: "Send quote",
  promise_payment: "Send promise",
  record_payment: "Record and send receipt",
  record_sale: "Record and send receipt",
};

interface ChatActionFormProps {
  form: FormAction;
  /** Starting amount, such as the agreed price */
  defaultAmount: number | null;
  busy: boolean;
  onSubmit: (action: WaveChatAction, payload: Record<string, unknown>) => void;
}

/** The small form an action needs before it can be sent. */
export const ChatActionForm = ({ form, defaultAmount, busy, onSubmit }: ChatActionFormProps) => {
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [when, setWhen] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentKind, setPaymentKind] = useState<"deposit" | "part_payment">("deposit");
  const [includes, setIncludes] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const today = lagosToday();
  const amountValid = Number(amount) > 0;
  const valid =
    form === "book_inspection"
      ? Boolean(when) && new Date(when).getTime() > Date.now()
      : form === "send_quote" || form === "promise_payment"
        ? amountValid && date >= today
        : amountValid;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    if (form === "make_offer") onSubmit(form, { amount: Number(amount) });
    if (form === "book_inspection") onSubmit(form, { proposed_at: new Date(when).toISOString() });
    if (form === "send_quote") onSubmit(form, { amount: Number(amount), valid_until: date, includes, note });
    if (form === "promise_payment") onSubmit(form, { amount: Number(amount), due_date: date });
    if (form === "record_payment") onSubmit(form, { amount: Number(amount), payment_method: method, kind: paymentKind });
    if (form === "record_sale") onSubmit(form, { amount: Number(amount), payment_method: method });
  };

  const amountLabel: Partial<Record<FormAction, string>> = {
    make_offer: "Your offer (₦)",
    send_quote: "Quoted price (₦)",
    promise_payment: "Amount you will pay (₦)",
    record_payment: "Amount received (₦)",
    record_sale: "Final amount received (₦)",
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl bg-muted/60 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {form === "book_inspection" ? (
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">When would you like to inspect it?</span>
            <Input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
          </label>
        ) : (
          <label className="text-sm">
            <span className="mb-1 block font-medium">{amountLabel[form]}</span>
            <Input inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 12500000" />
          </label>
        )}

        {(form === "send_quote" || form === "promise_payment") && (
          <label className="text-sm">
            <span className="mb-1 block font-medium">{form === "send_quote" ? "Valid until" : "Pay by"}</span>
            <Input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        )}

        {(form === "record_payment" || form === "record_sale") && (
          <label className="text-sm">
            <span className="mb-1 block font-medium">Paid by</span>
            <select className={selectClass} value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        )}

        {form === "record_payment" && (
          <label className="text-sm">
            <span className="mb-1 block font-medium">This payment is a</span>
            <select className={selectClass} value={paymentKind} onChange={(event) => setPaymentKind(event.target.value as "deposit" | "part_payment")}>
              <option value="deposit">Deposit</option>
              <option value="part_payment">Part payment</option>
            </select>
          </label>
        )}
      </div>

      {form === "send_quote" && (
        <>
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Included in this price</legend>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {QUOTE_INCLUSIONS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={includes.includes(item)}
                    onCheckedChange={(checked) => setIncludes(checked ? [...includes, item] : includes.filter((value) => value !== item))}
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Note (optional)</span>
            <Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} />
          </label>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || !valid}>{SUBMIT[form]}</Button>
        {NOTES[form] && <p className="min-w-0 flex-1 text-xs text-muted-foreground">{NOTES[form]}</p>}
      </div>
    </form>
  );
};
