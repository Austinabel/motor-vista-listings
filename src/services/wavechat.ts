import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { ChatRole, ChatStage, MessageKind, PaymentMethod, WaveChatAction } from "@/lib/wavechat";
import { MoatwaveNotConnectedError } from "@/services/mid";
import type { FeatureMode } from "@/services/platformFeatures";

// WaveChat. The Motorcars version keeps conversations in Motorcars' own database (the same
// conversations/messages tables the old inbox used, so history carries over); the Moatwave version
// isn't connected yet. Screens call waveChatService(mode).

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

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  kind: MessageKind;
  action: WaveChatAction | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChatReceipt {
  id: string;
  receiptNumber: string;
  carTitle: string;
  amount: number;
  paymentMethod: PaymentMethod;
  issuedAt: string;
  buyerConfirmedAt: string | null;
}

export interface WaveChatService {
  listConversations(userId: string): Promise<ChatConversation[]>;
  getConversation(id: string, userId: string): Promise<ChatConversation | null>;
  listMessages(conversationId: string): Promise<ChatMessage[]>;
  getReceipt(conversationId: string): Promise<ChatReceipt | null>;
  start(listingId: string): Promise<string>;
  sendText(conversationId: string, senderId: string, content: string): Promise<void>;
  act(conversationId: string, action: WaveChatAction, payload?: Record<string, unknown>): Promise<void>;
  markRead(conversationId: string, userId: string): Promise<void>;
  /** Calls onChange whenever a message arrives or the conversation changes. Returns an unsubscribe. */
  subscribe(conversationId: string, onChange: () => void): () => void;
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
      .select("conversation_id, sender_id, content, is_read, created_at")
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
      lastMessage: thread[0]?.content ?? null,
      unread: thread.filter((message) => message.sender_id !== userId && !message.is_read).length,
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
      .select("id, sender_id, content, kind, action, payload, is_read, created_at")
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
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  },

  async getReceipt(conversationId) {
    const { data, error } = await supabase
      .from("sale_receipts")
      .select("id, receipt_number, car_title, amount, payment_method, issued_at, buyer_confirmed_at")
      .eq("conversation_id", conversationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      receiptNumber: data.receipt_number,
      carTitle: data.car_title,
      amount: Number(data.amount),
      paymentMethod: data.payment_method as PaymentMethod,
      issuedAt: data.issued_at,
      buyerConfirmedAt: data.buyer_confirmed_at,
    };
  },

  async start(listingId) {
    const { data, error } = await supabase.rpc("start_wavechat", { _listing_id: listingId });
    if (error) throw new Error(error.message);
    return data;
  },

  async sendText(conversationId, senderId, content) {
    const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() });
    if (error) throw new Error(error.message);
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

  async markRead(conversationId, userId) {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);
  },

  subscribe(conversationId, onChange) {
    const channel = supabase
      .channel(`wavechat-${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, onChange)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations", filter: `id=eq.${conversationId}` }, onChange)
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
  getReceipt: notConnected,
  start: notConnected,
  sendText: notConnected,
  act: notConnected,
  markRead: notConnected,
  subscribe: () => () => undefined,
};

export const waveChatService = (mode: FeatureMode): WaveChatService => (mode === "moatwave" ? moatwaveChat : motorcarsChat);
