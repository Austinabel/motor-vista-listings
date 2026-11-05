import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { ChatRole, ChatStage, MessageKind, PaymentMethod, WaveChatAction } from "@/lib/wavechat";
import { MoatwaveNotConnectedError } from "@/services/mid";
import type { FeatureMode } from "@/services/platformFeatures";

// WaveChat. The Motorcars version keeps conversations in Motorcars' own database (the same
// conversations/messages tables the old inbox used, so history carries over); the Moatwave version
// isn't connected yet. Screens call waveChatService(mode).

const BUCKET = "wavechat";

export interface ChatCar {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  availabilityStatus: string;
}

export interface ChatConversation {
  id: string;
  role: ChatRole;
  otherName: string;
  stage: ChatStage;
  inspectionAt: string | null;
  inspectionConfirmed: boolean;
  agreedPrice: number | null;
  updatedAt: string;
  car: ChatCar | null;
  lastMessage: string | null;
  unread: number;
}

export type AttachmentType = "image" | "file" | "voice";

export interface ChatAttachment {
  path: string;
  type: AttachmentType;
  name: string;
  size: number;
  /** Seconds, for voice notes */
  duration: number | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  kind: MessageKind;
  action: WaveChatAction | null;
  payload: Record<string, unknown> | null;
  replyToId: string | null;
  attachment: ChatAttachment | null;
  isRead: boolean;
  deliveredAt: string | null;
  readAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface ChatReaction {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface ChatReceipt {
  id: string;
  receiptNumber: string;
  kind: "deposit" | "part_payment" | "final";
  carTitle: string;
  amount: number;
  paymentMethod: PaymentMethod;
  issuedAt: string;
  buyerConfirmedAt: string | null;
}

export interface ChatPromise {
  id: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  keptAt: string | null;
  keptOnTime: boolean | null;
  cancelledAt: string | null;
}

export interface HandoverItem {
  key: string;
  label: string;
  sellerConfirmedAt: string | null;
  buyerConfirmedAt: string | null;
}

export interface PresenceHandle {
  setTyping(typing: boolean): void;
  leave(): void;
}

export interface SendOptions {
  replyToId?: string | null;
  attachment?: ChatAttachment | null;
}

export interface WaveChatService {
  listConversations(userId: string): Promise<ChatConversation[]>;
  getConversation(id: string, userId: string): Promise<ChatConversation | null>;
  listMessages(conversationId: string): Promise<ChatMessage[]>;
  listReactions(messageIds: string[]): Promise<ChatReaction[]>;
  listReceipts(conversationId: string): Promise<ChatReceipt[]>;
  listPromises(conversationId: string): Promise<ChatPromise[]>;
  listHandover(conversationId: string): Promise<HandoverItem[]>;
  start(listingId: string): Promise<string>;
  sendText(conversationId: string, senderId: string, content: string, options?: SendOptions): Promise<void>;
  uploadAttachment(conversationId: string, file: Blob, type: AttachmentType, name: string, duration?: number): Promise<ChatAttachment>;
  attachmentUrl(path: string): Promise<string>;
  act(conversationId: string, action: WaveChatAction, payload?: Record<string, unknown>): Promise<void>;
  react(messageId: string, userId: string, emoji: string | null): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  markRead(conversationId: string): Promise<void>;
  markDelivered(conversationId: string): Promise<void>;
  countUnread(): Promise<number>;
  touchPresence(): Promise<void>;
  partnerLastSeen(conversationId: string): Promise<string | null>;
  /** Calls onChange whenever something in the conversation changes. Returns an unsubscribe. */
  subscribe(conversationId: string, onChange: () => void): () => void;
  /** Live "online" and "typing…" for the other person, while both have the conversation open. */
  joinPresence(conversationId: string, userId: string, onChange: (state: { online: boolean; typing: boolean }) => void): PresenceHandle;
  /** Calls onMessage for each new message from someone else, in any conversation. */
  onIncoming(userId: string, onMessage: (message: { conversationId: string; content: string; kind: string }) => void): () => void;
}

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  stage: string;
  inspection_at: string | null;
  inspection_confirmed: boolean;
  agreed_price: number | null;
  updated_at: string;
};

const asRecord = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : null);

const displayName = (profile?: { first_name: string | null; last_name: string | null }) => {
  const first = profile?.first_name?.trim();
  if (!first) return null;
  const initial = profile?.last_name?.trim()?.charAt(0);
  return initial ? `${first} ${initial}.` : first;
};

/** How a message reads in the conversation list. */
const previewOf = (message: { content: string; attachment_type: string | null; deleted_at: string | null }) => {
  if (message.deleted_at) return "Message deleted";
  if (message.content) return message.content;
  if (message.attachment_type === "voice") return "Voice note";
  if (message.attachment_type === "image") return "Photo";
  return message.attachment_type ? "Document" : null;
};

const enrich = async (rows: ConversationRow[], userId: string): Promise<ChatConversation[]> => {
  if (rows.length === 0) return [];
  const listingIds = [...new Set(rows.map((row) => row.listing_id))];
  const otherIds = [...new Set(rows.map((row) => (row.buyer_id === userId ? row.seller_id : row.buyer_id)))];

  // Buyers see a dealer's business name; get_public_dealer_by_seller returns approved dealers only
  const sellerIds = [...new Set(rows.filter((row) => row.buyer_id === userId).map((row) => row.seller_id))];
  const [listings, profiles, dealerNames, messages] = await Promise.all([
    supabase.from("car_listings").select("id, make, model, year, price, images, availability_status").in("id", listingIds),
    supabase.from("profiles").select("id, first_name, last_name").in("id", otherIds),
    Promise.all(
      sellerIds.map(async (sellerId) => {
        const { data } = await supabase.rpc("get_public_dealer_by_seller", { seller_id: sellerId });
        return [sellerId, data?.[0]?.business_name ?? null] as const;
      })
    ).then((pairs) => new Map(pairs)),
    supabase
      .from("messages")
      .select("conversation_id, sender_id, content, attachment_type, deleted_at, is_read, created_at")
      .in("conversation_id", rows.map((row) => row.id))
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return rows.map((row) => {
    const listing = listings.data?.find((item) => item.id === row.listing_id);
    const otherId = row.buyer_id === userId ? row.seller_id : row.buyer_id;
    const thread = (messages.data ?? []).filter((message) => message.conversation_id === row.id);
    const role: ChatRole = row.seller_id === userId ? "seller" : "buyer";
    return {
      id: row.id,
      role,
      otherName:
        (role === "buyer" ? dealerNames.get(otherId) : null) ??
        displayName(profiles.data?.find((profile) => profile.id === otherId)) ??
        (role === "buyer" ? "Seller" : "Buyer"),
      stage: row.stage as ChatStage,
      inspectionAt: row.inspection_at,
      inspectionConfirmed: row.inspection_confirmed,
      agreedPrice: row.agreed_price,
      updatedAt: row.updated_at,
      car: listing
        ? {
            id: listing.id,
            title: `${listing.year} ${listing.make} ${listing.model}`,
            price: listing.price,
            imageUrl: listing.images?.[0] ?? null,
            availabilityStatus: listing.availability_status,
          }
        : null,
      lastMessage: thread[0] ? previewOf(thread[0]) : null,
      unread: thread.filter((message) => message.sender_id !== userId && !message.is_read && !message.deleted_at).length,
    };
  });
};

const CONVERSATION_COLUMNS = "id, listing_id, buyer_id, seller_id, stage, inspection_at, inspection_confirmed, agreed_price, updated_at";

const motorcarsChat: WaveChatService = {
  async listConversations(userId) {
    const { data, error } = await supabase
      .from("conversations")
      .select(CONVERSATION_COLUMNS)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return enrich((data ?? []) as ConversationRow[], userId);
  },

  async getConversation(id, userId) {
    const { data, error } = await supabase.from("conversations").select(CONVERSATION_COLUMNS).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const [conversation] = await enrich([data as ConversationRow], userId);
    return conversation;
  },

  async listMessages(conversationId) {
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, content, kind, action, payload, reply_to_id, attachment_path, attachment_type, attachment_name, attachment_size, attachment_duration, is_read, delivered_at, read_at, deleted_at, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      senderId: row.sender_id,
      content: row.content,
      kind: row.kind as MessageKind,
      action: (row.action as WaveChatAction | null) ?? null,
      payload: asRecord(row.payload),
      replyToId: row.reply_to_id,
      attachment: row.attachment_path
        ? {
            path: row.attachment_path,
            type: row.attachment_type as AttachmentType,
            name: row.attachment_name ?? "Attachment",
            size: row.attachment_size ?? 0,
            duration: row.attachment_duration,
          }
        : null,
      isRead: row.is_read,
      deliveredAt: row.delivered_at,
      readAt: row.read_at,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
    }));
  },

  async listReactions(messageIds) {
    if (messageIds.length === 0) return [];
    const { data, error } = await supabase.from("message_reactions").select("message_id, user_id, emoji").in("message_id", messageIds);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({ messageId: row.message_id, userId: row.user_id, emoji: row.emoji }));
  },

  async listReceipts(conversationId) {
    const { data, error } = await supabase
      .from("sale_receipts")
      .select("id, receipt_number, kind, car_title, amount, payment_method, issued_at, buyer_confirmed_at")
      .eq("conversation_id", conversationId)
      .order("issued_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      receiptNumber: row.receipt_number,
      kind: row.kind as ChatReceipt["kind"],
      carTitle: row.car_title,
      amount: Number(row.amount),
      paymentMethod: row.payment_method as PaymentMethod,
      issuedAt: row.issued_at,
      buyerConfirmedAt: row.buyer_confirmed_at,
    }));
  },

  async listPromises(conversationId) {
    const { data, error } = await supabase
      .from("payment_promises")
      .select("id, amount, due_date, created_at, kept_at, kept_on_time, cancelled_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      amount: Number(row.amount),
      dueDate: row.due_date,
      createdAt: row.created_at,
      keptAt: row.kept_at,
      keptOnTime: row.kept_on_time,
      cancelledAt: row.cancelled_at,
    }));
  },

  async listHandover(conversationId) {
    const { data, error } = await supabase
      .from("handover_items")
      .select("item_key, label, seller_confirmed_at, buyer_confirmed_at")
      .eq("conversation_id", conversationId)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      key: row.item_key,
      label: row.label,
      sellerConfirmedAt: row.seller_confirmed_at,
      buyerConfirmedAt: row.buyer_confirmed_at,
    }));
  },

  async start(listingId) {
    const { data, error } = await supabase.rpc("start_wavechat", { _listing_id: listingId });
    if (error) throw new Error(error.message);
    return data;
  },

  async sendText(conversationId, senderId, content, options = {}) {
    const { attachment, replyToId } = options;
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
      reply_to_id: replyToId ?? null,
      attachment_path: attachment?.path ?? null,
      attachment_type: attachment?.type ?? null,
      attachment_name: attachment?.name ?? null,
      attachment_size: attachment?.size ?? null,
      attachment_duration: attachment?.duration ?? null,
    });
    if (error) throw new Error(error.message);
  },

  async uploadAttachment(conversationId, file, type, name, duration) {
    const safeName = name.replace(/[^\w.-]+/g, "_").slice(-80);
    const path = `${conversationId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
    if (error) throw new Error(error.message);
    return { path, type, name, size: file.size, duration: duration ?? null };
  },

  async attachmentUrl(path) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (error || !data) throw new Error(error?.message ?? "The attachment couldn't be opened");
    return data.signedUrl;
  },

  async act(conversationId, action, payload = {}) {
    const { error } = await supabase.rpc("wavechat_action", {
      _conversation_id: conversationId,
      _action: action,
      _payload: payload as Json,
      // One id per tap: a retried request returns the message already created instead of a duplicate
      _client_event_id: crypto.randomUUID(),
    });
    if (error) throw new Error(error.message);
  },

  async react(messageId, userId, emoji) {
    const { error } = emoji
      ? await supabase.from("message_reactions").upsert({ message_id: messageId, user_id: userId, emoji })
      : await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async deleteMessage(messageId) {
    const { data, error } = await supabase.rpc("delete_my_message", { _message_id: messageId });
    if (error) throw new Error(error.message);
    if (data) await supabase.storage.from(BUCKET).remove([data]);
  },

  async markRead(conversationId) {
    await supabase.rpc("mark_conversation_read", { _conversation_id: conversationId });
  },

  async markDelivered(conversationId) {
    await supabase.rpc("mark_conversation_delivered", { _conversation_id: conversationId });
  },

  async countUnread() {
    const { data, error } = await supabase.rpc("count_unread_messages");
    if (error) throw new Error(error.message);
    return data ?? 0;
  },

  async touchPresence() {
    await supabase.rpc("touch_presence");
  },

  async partnerLastSeen(conversationId) {
    const { data } = await supabase.rpc("get_chat_partner_last_seen", { _conversation_id: conversationId });
    return data ?? null;
  },

  subscribe(conversationId, onChange) {
    const channel = supabase
      .channel(`wavechat-${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `id=eq.${conversationId}` }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "handover_items", filter: `conversation_id=eq.${conversationId}` }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, onChange)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },

  joinPresence(conversationId, userId, onChange) {
    const channel = supabase.channel(`wavechat-presence-${conversationId}`, { config: { presence: { key: userId } } });
    let joined = false;
    const report = () => {
      const others = Object.entries(channel.presenceState<{ typing?: boolean }>()).filter(([key]) => key !== userId);
      onChange({
        online: others.length > 0,
        typing: others.some(([, metas]) => metas.some((meta) => meta.typing)),
      });
    };
    channel
      .on("presence", { event: "sync" }, report)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          joined = true;
          channel.track({ typing: false });
        }
      });
    return {
      setTyping: (typing) => {
        if (joined) channel.track({ typing });
      },
      leave: () => {
        supabase.removeChannel(channel);
      },
    };
  },

  onIncoming(userId, onMessage) {
    // Row-level security means this only ever receives messages from the person's own conversations
    const channel = supabase
      .channel(`wavechat-incoming-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (change) => {
        const row = change.new as { conversation_id: string; sender_id: string; content: string; kind: string };
        if (row.sender_id !== userId) onMessage({ conversationId: row.conversation_id, content: row.content, kind: row.kind });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};

const notConnected = async (): Promise<never> => {
  throw new MoatwaveNotConnectedError();
};

const moatwaveChat: WaveChatService = {
  listConversations: notConnected,
  getConversation: notConnected,
  listMessages: notConnected,
  listReactions: notConnected,
  listReceipts: notConnected,
  listPromises: notConnected,
  listHandover: notConnected,
  start: notConnected,
  sendText: notConnected,
  uploadAttachment: notConnected,
  attachmentUrl: notConnected,
  act: notConnected,
  react: notConnected,
  deleteMessage: notConnected,
  markRead: notConnected,
  markDelivered: notConnected,
  countUnread: notConnected,
  touchPresence: notConnected,
  partnerLastSeen: notConnected,
  subscribe: () => () => undefined,
  joinPresence: () => ({ setTyping: () => undefined, leave: () => undefined }),
  onIncoming: () => () => undefined,
};

export const waveChatService = (mode: FeatureMode): WaveChatService => (mode === "moatwave" ? moatwaveChat : motorcarsChat);
