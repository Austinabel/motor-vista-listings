import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera, Car, CircleHelp, HandCoins, Receipt, Send, Wrench, CheckCircle2, XCircle, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatNaira } from "@/lib/format";
import {
  ACTION_LABELS, PAYMENT_METHODS, STAGES, availableActions, stageIndex, type PaymentMethod, type WaveChatAction,
} from "@/lib/wavechat";
import { waveChatService } from "@/services/wavechat";
import { ChatMessageItem } from "./ChatMessageItem";

const ICONS: Partial<Record<WaveChatAction, typeof Car>> = {
  ask_availability: CircleHelp,
  request_photos: Camera,
  book_inspection: Wrench,
  make_offer: HandCoins,
  confirm_available: CheckCircle2,
  reply_not_available: XCircle,
  confirm_inspection: CalendarCheck,
  record_sale: Receipt,
  confirm_receipt: CheckCircle2,
};

// Actions that need a value before they can be sent
type FormAction = "make_offer" | "book_inspection" | "record_sale";

interface WaveChatThreadProps {
  conversationId: string;
  userId: string;
  onBack?: () => void;
}

export const WaveChatThread = ({ conversationId, userId, onBack }: WaveChatThreadProps) => {
  const mode = useFeatureMode("wavechat");
  const service = waveChatService(mode);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [form, setForm] = useState<FormAction | null>(null);
  const [amount, setAmount] = useState("");
  const [when, setWhen] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const endRef = useRef<HTMLDivElement>(null);

  const keys = {
    conversation: ["wavechat", "conversation", conversationId],
    messages: ["wavechat", "messages", conversationId],
    receipt: ["wavechat", "receipt", conversationId],
  };
  const conversationQuery = useQuery({ queryKey: keys.conversation, queryFn: () => service.getConversation(conversationId, userId) });
  const messagesQuery = useQuery({ queryKey: keys.messages, queryFn: () => service.listMessages(conversationId) });
  const receiptQuery = useQuery({ queryKey: keys.receipt, queryFn: () => service.getReceipt(conversationId) });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["wavechat"] });
  };

  // Live updates: new messages, offer answers and stage changes arrive without reloading
  useEffect(() => service.subscribe(conversationId, refresh), [conversationId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const messages = messagesQuery.data ?? [];
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
    if (messages.some((message) => message.senderId !== userId && !message.isRead)) {
      service.markRead(conversationId, userId).then(() => queryClient.invalidateQueries({ queryKey: ["wavechat", "list"] }));
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = useMutation({
    mutationFn: ({ action, payload }: { action: WaveChatAction; payload?: Record<string, unknown> }) =>
      service.act(conversationId, action, payload),
    onSuccess: () => {
      setForm(null);
      setAmount("");
      setWhen("");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const send = useMutation({
    mutationFn: (content: string) => service.sendText(conversationId, userId, content),
    onSuccess: () => {
      setText("");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const conversation = conversationQuery.data;
  if (conversationQuery.isLoading) return <div className="h-full min-h-[420px] animate-pulse rounded-2xl bg-muted" />;
  if (!conversation) return <p className="p-6 text-muted-foreground">This conversation couldn't be loaded.</p>;

  const receipt = receiptQuery.data ?? null;
  const ended = conversation.stage === "completed" || conversation.stage === "closed";
  const pendingOffer = messages.some((message) => message.kind === "offer" && message.payload?.status === "pending");
  const actions = availableActions(conversation.role, {
    stage: conversation.stage,
    pendingOffer,
    inspectionRequested: Boolean(conversation.inspectionAt),
    inspectionConfirmed: conversation.inspectionConfirmed,
    carAvailable: conversation.car?.availabilityStatus === "available",
    receiptToConfirm: Boolean(receipt && !receipt.buyerConfirmedAt),
  });
  const progress = stageIndex(conversation.stage);

  const onAction = (action: WaveChatAction) => {
    if (action === "make_offer" || action === "book_inspection" || action === "record_sale") {
      setForm(form === action ? null : action);
      if (action === "record_sale" && conversation.agreedPrice) setAmount(String(conversation.agreedPrice));
      return;
    }
    act.mutate({ action });
  };

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    if (form === "make_offer") act.mutate({ action: "make_offer", payload: { amount: Number(amount) } });
    if (form === "book_inspection") act.mutate({ action: "book_inspection", payload: { proposed_at: new Date(when).toISOString() } });
    if (form === "record_sale") act.mutate({ action: "record_sale", payload: { amount: Number(amount), payment_method: method } });
  };

  const amountValid = Number(amount) > 0;
  const whenValid = Boolean(when) && new Date(when).getTime() > Date.now();

  return (
    <div className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* The car stays in view for the whole conversation */}
      <div className="border-b p-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onBack} aria-label="Back to conversations">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {conversation.car?.imageUrl ? (
              <img src={conversation.car.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground"><Car className="h-5 w-5" /></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {conversation.car ? (
              <Link to={`/cars/${conversation.car.id}`} className="block truncate font-semibold hover:underline">{conversation.car.title}</Link>
            ) : (
              <p className="font-semibold">Car no longer listed</p>
            )}
            <p className="text-sm text-muted-foreground">
              {conversation.car && <span className="font-bold text-primary">{formatNaira(conversation.car.price)}</span>}
              {" · "}
              {conversation.role === "buyer" ? "Seller" : "Buyer"}: {conversation.otherName}
            </p>
          </div>
        </div>
        {progress >= 0 && (
          <ol className="mt-3 grid grid-cols-5 gap-1" aria-label="Progress">
            {STAGES.map((stage, index) => (
              <li key={stage.id} className="text-center">
                <span className={`block h-1.5 rounded-full ${index <= progress ? "bg-primary" : "bg-muted"}`} />
                <span className={`mt-1 block text-[11px] ${index === progress ? "font-bold text-foreground" : "text-muted-foreground"}`}>{stage.label}</span>
              </li>
            ))}
          </ol>
        )}
        {conversation.inspectionAt && !ended && (
          <p className="mt-2 text-xs text-muted-foreground">
            Inspection {conversation.inspectionConfirmed ? "confirmed" : "requested"} for{" "}
            {new Date(conversation.inspectionAt).toLocaleString("en-NG", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4" aria-live="polite">
        {messagesQuery.isLoading && <div className="h-24 animate-pulse rounded-xl bg-muted" />}
        {messages.length === 0 && !messagesQuery.isLoading && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {conversation.role === "buyer" ? "Start with a question below." : "No messages yet."}
          </p>
        )}
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            mine={message.senderId === userId}
            role={conversation.role}
            ended={ended}
            receipt={receipt}
            busy={act.isPending}
            onAct={(action, payload) => act.mutate({ action, payload })}
          />
        ))}
        <div ref={endRef} />
      </div>

      {actions.length > 0 && (
        <div className="border-t p-3">
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = ICONS[action] ?? CircleHelp;
              return (
                <Button
                  key={action}
                  type="button"
                  size="sm"
                  variant={form === action ? "default" : "outline"}
                  disabled={act.isPending}
                  onClick={() => onAction(action)}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {ACTION_LABELS[action]}
                </Button>
              );
            })}
          </div>

          {form && (
            <form onSubmit={submitForm} className="mt-3 flex flex-col gap-2 rounded-xl bg-muted/60 p-3 sm:flex-row sm:items-end">
              {form === "book_inspection" ? (
                <label className="flex-1 text-sm">
                  <span className="mb-1 block font-medium">When would you like to inspect it?</span>
                  <Input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
                </label>
              ) : (
                <label className="flex-1 text-sm">
                  <span className="mb-1 block font-medium">{form === "make_offer" ? "Your offer (₦)" : "Amount paid (₦)"}</span>
                  <Input inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 12500000" />
                </label>
              )}
              {form === "record_sale" && (
                <label className="text-sm sm:w-44">
                  <span className="mb-1 block font-medium">Paid by</span>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                    value={method}
                    onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                  >
                    {PAYMENT_METHODS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
              )}
              <Button type="submit" disabled={act.isPending || (form === "book_inspection" ? !whenValid : !amountValid)}>
                {form === "make_offer" ? "Send offer" : form === "book_inspection" ? "Ask for this time" : "Record sale"}
              </Button>
            </form>
          )}
          {form === "make_offer" && <p className="mt-2 text-xs text-muted-foreground">An offer in chat is not a sale or a payment.</p>}
          {form === "record_sale" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Only record a sale once you have been paid. This marks the car sold and sends the buyer a receipt.
            </p>
          )}
        </div>
      )}

      {!ended && (
        <form
          className="flex items-center gap-2 border-t p-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) send.mutate(text);
          }}
        >
          <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message" maxLength={2000} aria-label="Message" />
          <Button type="submit" size="icon" disabled={!text.trim() || send.isPending} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
};
