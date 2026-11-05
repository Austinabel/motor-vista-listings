import { useQuery } from "@tanstack/react-query";
import { Check, CheckCheck, FileText, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { REACTIONS, tickFor, type ChatRole, type WaveChatAction } from "@/lib/wavechat";
import { waveChatService, type ChatAttachment, type ChatMessage, type ChatPromise, type ChatReaction, type ChatReceipt } from "@/services/wavechat";
import { OfferCard, PromiseCard, QuoteCard, ReceiptCard } from "./ChatCards";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

const sizeLabel = (bytes: number) => (bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);

/** Files live in a private bucket, so each is opened through a short-lived signed link. */
const AttachmentView = ({ attachment }: { attachment: ChatAttachment }) => {
  const mode = useFeatureMode("wavechat");
  const { data: url, isError } = useQuery({
    queryKey: ["wavechat", "attachment", attachment.path],
    queryFn: () => waveChatService(mode).attachmentUrl(attachment.path),
    staleTime: 50 * 60_000,
    retry: 1,
  });

  if (isError) return <p className="text-sm opacity-80">This attachment couldn't be opened.</p>;
  if (!url) return <div className="h-24 w-48 animate-pulse rounded-lg bg-muted" />;

  if (attachment.type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt={attachment.name} className="max-h-64 max-w-full rounded-lg object-cover" />
      </a>
    );
  }
  if (attachment.type === "voice") {
    return <audio controls src={url} className="h-10 max-w-[260px]" aria-label="Voice note" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline-offset-2 hover:underline">
      <FileText className="h-5 w-5 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{attachment.name}</span>
        <span className="block text-xs opacity-80">{sizeLabel(attachment.size)}</span>
      </span>
    </a>
  );
};

const replySnippet = (message: ChatMessage) => {
  if (message.deletedAt) return "Message deleted";
  if (message.content) return message.content;
  if (message.attachment?.type === "voice") return "Voice note";
  if (message.attachment?.type === "image") return "Photo";
  return message.attachment ? message.attachment.name : "Message";
};

const Ticks = ({ message }: { message: ChatMessage }) => {
  const tick = tickFor(message);
  if (tick === "sent") return <Check className="inline h-3.5 w-3.5" aria-label="Sent" />;
  return <CheckCheck className={`inline h-3.5 w-3.5 ${tick === "read" ? "text-primary" : ""}`} aria-label={tick === "read" ? "Read" : "Delivered"} />;
};

interface ChatMessageItemProps {
  message: ChatMessage;
  userId: string;
  role: ChatRole;
  /** False once the sale is finished, so cards stop offering answers */
  open: boolean;
  receipts: ChatReceipt[];
  promises: ChatPromise[];
  replyTarget: ChatMessage | undefined;
  reactions: ChatReaction[];
  busy: boolean;
  onAct: (action: WaveChatAction, payload?: Record<string, unknown>) => void;
  onReply: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string | null) => void;
  onDelete: (message: ChatMessage) => void;
}

/** One message: a card for structured records, otherwise a bubble with replies, reactions and ticks. */
export const ChatMessageItem = ({
  message, userId, role, open, receipts, promises, replyTarget, reactions, busy, onAct, onReply, onReact, onDelete,
}: ChatMessageItemProps) => {
  const mine = message.senderId === userId;
  const align = mine ? "items-end" : "items-start";
  const deleted = Boolean(message.deletedAt);
  const myReaction = reactions.find((reaction) => reaction.userId === userId)?.emoji ?? null;
  const counts = reactions.reduce<Record<string, number>>((all, { emoji }) => ({ ...all, [emoji]: (all[emoji] ?? 0) + 1 }), {});

  const stamp = (
    <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
      {time(message.createdAt)}
      {mine && !deleted && <Ticks message={message} />}
    </span>
  );

  if (message.kind === "offer") {
    return <div className={`flex flex-col ${align}`}><OfferCard message={message} mine={mine} role={role} open={open} busy={busy} onAct={onAct} />{stamp}</div>;
  }
  if (message.kind === "quote") {
    return <div className={`flex flex-col ${align}`}><QuoteCard message={message} role={role} open={open} busy={busy} onAct={onAct} />{stamp}</div>;
  }
  if (message.kind === "receipt") {
    const receipt = receipts.find((item) => item.id === message.payload?.receipt_id);
    if (receipt) return <div className="flex flex-col items-center"><ReceiptCard receipt={receipt} role={role} busy={busy} onAct={onAct} /></div>;
  }
  if (message.kind === "promise") {
    const promise = promises.find((item) => item.id === message.payload?.promise_id);
    if (promise) return <div className={`flex flex-col ${align}`}><PromiseCard promise={promise} mine={mine} />{stamp}</div>;
  }
  if (message.kind === "handover") {
    return <p className="mx-auto w-fit max-w-[90%] rounded-full bg-accent px-3 py-1 text-center text-xs font-medium text-accent-foreground">{message.content}</p>;
  }

  const bubble = mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground";

  return (
    <div className={`group flex flex-col ${align}`}>
      <div className={`flex max-w-[85%] items-center gap-1 ${mine ? "flex-row-reverse" : ""}`}>
        <div className={`min-w-0 rounded-2xl px-3.5 py-2 text-sm ${bubble} ${message.kind !== "text" ? "font-medium" : ""}`}>
          {replyTarget && (
            <p className="mb-1 truncate rounded-md border-l-2 border-gold bg-black/10 px-2 py-1 text-xs opacity-90">{replySnippet(replyTarget)}</p>
          )}
          {deleted ? (
            <p className="italic opacity-75">Message deleted</p>
          ) : (
            <>
              {message.attachment && <AttachmentView attachment={message.attachment} />}
              {message.content && <p className={`whitespace-pre-line ${message.attachment ? "mt-1" : ""}`}>{message.content}</p>}
            </>
          )}
        </div>

        {!deleted && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Message options"
              className="shrink-0 rounded-full p-1 text-muted-foreground opacity-60 hover:bg-muted group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={mine ? "end" : "start"}>
              <div className="flex gap-1 px-1 py-1" role="group" aria-label="React">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`React ${emoji}`}
                    className={`rounded-md px-1.5 py-1 text-lg hover:bg-muted ${myReaction === emoji ? "bg-muted" : ""}`}
                    onClick={() => onReact(message, myReaction === emoji ? null : emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onReply(message)}><Reply className="mr-2 h-4 w-4" />Reply</DropdownMenuItem>
              {mine && message.kind === "text" && (
                <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(message)}>
                  <Trash2 className="mr-2 h-4 w-4" />Delete for everyone
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {Object.keys(counts).length > 0 && (
        <div className="-mt-1 flex gap-1">
          {Object.entries(counts).map(([emoji, count]) => (
            <button
              key={emoji}
              type="button"
              className={`rounded-full border bg-card px-1.5 text-xs ${myReaction === emoji ? "border-primary" : ""}`}
              aria-label={`${emoji} ${count}`}
              onClick={() => onReact(message, myReaction === emoji ? null : emoji)}
            >
              {emoji}{count > 1 ? ` ${count}` : ""}
            </button>
          ))}
        </div>
      )}
      {stamp}
    </div>
  );
};
