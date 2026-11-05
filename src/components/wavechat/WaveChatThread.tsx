import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, CalendarCheck, CalendarClock, Camera, Car, CheckCircle2, CircleHelp, ClipboardCheck, FileText, HandCoins, Receipt, Wallet, Wrench, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatDate, formatNaira } from "@/lib/format";
import {
  ACTION_LABELS, STAGES, availableActions, lagosToday, lastSeenLabel, promiseState, stageIndex, type WaveChatAction,
} from "@/lib/wavechat";
import { waveChatService, type AttachmentType, type ChatMessage, type PresenceHandle } from "@/services/wavechat";
import { ChatActionForm, FORM_ACTIONS, type FormAction } from "./ChatActionForm";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageItem } from "./ChatMessageItem";
import { HandoverChecklist } from "./HandoverChecklist";

const ICONS: Partial<Record<WaveChatAction, typeof Car>> = {
  ask_availability: CircleHelp,
  request_photos: Camera,
  book_inspection: Wrench,
  make_offer: HandCoins,
  confirm_available: CheckCircle2,
  reply_not_available: XCircle,
  confirm_inspection: CalendarCheck,
  send_quote: FileText,
  promise_payment: CalendarClock,
  record_payment: Wallet,
  record_sale: Receipt,
  start_handover: ClipboardCheck,
};

interface WaveChatThreadProps {
  conversationId: string;
  userId: string;
  onBack?: () => void;
}

export const WaveChatThread = ({ conversationId, userId, onBack }: WaveChatThreadProps) => {
  const mode = useFeatureMode("wavechat");
  const service = waveChatService(mode);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormAction | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [presence, setPresence] = useState({ online: false, typing: false });
  const presenceRef = useRef<PresenceHandle | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const key = (name: string) => ["wavechat", name, conversationId];
  // Live updates do the work; the slow refetch covers a dropped connection
  const conversationQuery = useQuery({ queryKey: key("conversation"), queryFn: () => service.getConversation(conversationId, userId), refetchInterval: 30_000 });
  const messagesQuery = useQuery({ queryKey: key("messages"), queryFn: () => service.listMessages(conversationId), refetchInterval: 30_000 });
  const receiptsQuery = useQuery({ queryKey: key("receipts"), queryFn: () => service.listReceipts(conversationId) });
  const promisesQuery = useQuery({ queryKey: key("promises"), queryFn: () => service.listPromises(conversationId) });
  const handoverQuery = useQuery({ queryKey: key("handover"), queryFn: () => service.listHandover(conversationId) });
  const lastSeenQuery = useQuery({ queryKey: key("last-seen"), queryFn: () => service.partnerLastSeen(conversationId), refetchInterval: 60_000 });

  const messages = messagesQuery.data ?? [];
  const messageIds = messages.map((message) => message.id);
  const reactionsQuery = useQuery({
    queryKey: [...key("reactions"), messageIds.length],
    queryFn: () => service.listReactions(messageIds),
    enabled: messageIds.length > 0,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["wavechat"] });
  };

  useEffect(() => service.subscribe(conversationId, refresh), [conversationId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    presenceRef.current = service.joinPresence(conversationId, userId, setPresence);
    return () => presenceRef.current?.leave();
  }, [conversationId, userId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
    if (messages.some((message) => message.senderId !== userId && !message.isRead)) {
      service.markRead(conversationId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["wavechat", "list"] });
        queryClient.invalidateQueries({ queryKey: ["wavechat", "unread"] });
      });
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const onError = (error: Error) => toast.error(error.message);

  const act = useMutation({
    mutationFn: ({ action, payload }: { action: WaveChatAction; payload?: Record<string, unknown> }) => service.act(conversationId, action, payload),
    onSuccess: () => {
      setForm(null);
      refresh();
    },
    onError,
  });

  const send = useMutation({
    mutationFn: async ({ text, file }: { text: string; file?: { blob: Blob; type: AttachmentType; name: string; duration?: number } }) => {
      const attachment = file ? await service.uploadAttachment(conversationId, file.blob, file.type, file.name, file.duration) : null;
      await service.sendText(conversationId, userId, text, { replyToId: replyingTo?.id, attachment });
    },
    onSuccess: () => {
      setReplyingTo(null);
      refresh();
    },
    onError,
  });

  const react = useMutation({
    mutationFn: ({ message, emoji }: { message: ChatMessage; emoji: string | null }) => service.react(message.id, userId, emoji),
    onSuccess: refresh,
    onError,
  });

  const remove = useMutation({
    mutationFn: (message: ChatMessage) => service.deleteMessage(message.id),
    onSuccess: refresh,
    onError,
  });

  const conversation = conversationQuery.data;
  if (conversationQuery.isLoading) return <div className="h-full min-h-[420px] animate-pulse rounded-2xl bg-muted" />;
  if (!conversation) return <p className="p-6 text-muted-foreground">This conversation couldn't be loaded.</p>;

  const receipts = receiptsQuery.data ?? [];
  const promises = promisesQuery.data ?? [];
  const handover = handoverQuery.data ?? [];
  const reactions = reactionsQuery.data ?? [];
  const closed = conversation.stage === "closed";
  const negotiating = !["paid", "completed", "closed"].includes(conversation.stage);
  const actions = availableActions(conversation.role, {
    stage: conversation.stage,
    inspectionRequested: Boolean(conversation.inspectionAt),
    inspectionConfirmed: conversation.inspectionConfirmed,
    carAvailable: conversation.car?.availabilityStatus === "available",
    handoverStarted: handover.length > 0,
  });
  const progress = stageIndex(conversation.stage);
  const today = lagosToday();
  const openPromise = [...promises].reverse().find((promise) => ["open", "overdue"].includes(promiseState(promise, today)));
  const status = presence.typing ? "typing…" : presence.online ? "online" : lastSeenLabel(lastSeenQuery.data ?? null);

  const onAction = (action: WaveChatAction) => {
    if ((FORM_ACTIONS as WaveChatAction[]).includes(action)) {
      setForm(form === action ? null : (action as FormAction));
      return;
    }
    act.mutate({ action });
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
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
            <p className="truncate text-sm text-muted-foreground">
              {conversation.car && <span className="font-bold text-primary">{formatNaira(conversation.car.price)}</span>}
              {" · "}{conversation.otherName}
              {status && <span className={presence.typing || presence.online ? "font-medium text-primary" : ""}> · {status}</span>}
            </p>
          </div>
        </div>
        {progress >= 0 && (
          <ol className="mt-3 grid grid-cols-6 gap-1" aria-label="Progress">
            {STAGES.map((stage, index) => (
              <li key={stage.id} className="text-center">
                <span className={`block h-1.5 rounded-full ${index <= progress ? "bg-primary" : "bg-muted"}`} />
                <span className={`mt-1 block truncate text-[11px] ${index === progress ? "font-bold text-foreground" : "text-muted-foreground"}`}>{stage.label}</span>
              </li>
            ))}
          </ol>
        )}
        {conversation.inspectionAt && negotiating && (
          <p className="mt-2 text-xs text-muted-foreground">
            Inspection {conversation.inspectionConfirmed ? "confirmed" : "requested"} for{" "}
            {new Date(conversation.inspectionAt).toLocaleString("en-NG", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        )}
        {openPromise && (
          <p className={`mt-2 text-xs font-medium ${promiseState(openPromise, today) === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
            {formatNaira(openPromise.amount)} promised by {formatDate(openPromise.dueDate)}
            {promiseState(openPromise, today) === "overdue" ? " · overdue" : openPromise.dueDate === today ? " · due today" : ""}
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
            userId={userId}
            role={conversation.role}
            open={negotiating}
            receipts={receipts}
            promises={promises}
            replyTarget={message.replyToId ? messages.find((item) => item.id === message.replyToId) : undefined}
            reactions={reactions.filter((reaction) => reaction.messageId === message.id)}
            busy={act.isPending}
            onAct={(action, payload) => act.mutate({ action, payload })}
            onReply={setReplyingTo}
            onReact={(target, emoji) => react.mutate({ message: target, emoji })}
            onDelete={(target) => remove.mutate(target)}
          />
        ))}
        <div ref={endRef} />
      </div>

      {handover.length > 0 && conversation.stage !== "completed" && (
        <HandoverChecklist
          items={handover}
          role={conversation.role}
          busy={act.isPending}
          onConfirm={(item) => act.mutate({ action: "confirm_handover_item", payload: { item } })}
        />
      )}

      {actions.length > 0 && (
        <div className="max-h-[45%] overflow-y-auto border-t p-3">
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = ICONS[action] ?? CircleHelp;
              return (
                <Button key={action} type="button" size="sm" variant={form === action ? "default" : "outline"} disabled={act.isPending} onClick={() => onAction(action)}>
                  <Icon className="mr-1.5 h-4 w-4" />
                  {ACTION_LABELS[action]}
                </Button>
              );
            })}
          </div>
          {form && (
            <ChatActionForm
              key={form}
              form={form}
              defaultAmount={form === "record_sale" || form === "send_quote" ? conversation.agreedPrice ?? conversation.car?.price ?? null : null}
              busy={act.isPending}
              onSubmit={(action, payload) => act.mutate({ action, payload })}
            />
          )}
        </div>
      )}

      {!closed && (
        <ChatComposer
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          sending={send.isPending}
          onSendText={(text) => send.mutate({ text })}
          onSendFile={(blob, type, name, duration) => send.mutate({ text: "", file: { blob, type, name, duration } })}
          onTyping={(typing) => presenceRef.current?.setTyping(typing)}
        />
      )}
    </div>
  );
};
