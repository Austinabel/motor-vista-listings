// WaveChat rules shared by the screens. The database (wavechat_action) enforces the same rules;
// this copy decides which buttons to show so nobody is offered an action that would be refused.

export type ChatStage = "enquiry" | "inspection" | "offer" | "agreed" | "paid" | "completed" | "closed";
export type ChatRole = "buyer" | "seller";
export type MessageKind =
  | "text"
  | "action"
  | "offer"
  | "offer_response"
  | "quote"
  | "quote_response"
  | "payment"
  | "promise"
  | "receipt"
  | "handover";

export type WaveChatAction =
  | "ask_availability"
  | "confirm_available"
  | "reply_not_available"
  | "request_photos"
  | "book_inspection"
  | "confirm_inspection"
  | "make_offer"
  | "accept_offer"
  | "decline_offer"
  | "withdraw_offer"
  | "send_quote"
  | "accept_quote"
  | "request_quote_changes"
  | "promise_payment"
  | "record_payment"
  | "record_sale"
  | "confirm_receipt"
  | "start_handover"
  | "confirm_handover_item";

/** WaveChat's own page; ?c= opens a conversation. */
export const WAVECHAT_PATH = "/wavechat";
export const waveChatLink = (conversationId?: string) =>
  conversationId ? `${WAVECHAT_PATH}?c=${conversationId}` : WAVECHAT_PATH;

export const STAGES: { id: ChatStage; label: string }[] = [
  { id: "enquiry", label: "Enquiry" },
  { id: "inspection", label: "Inspection" },
  { id: "offer", label: "Offer" },
  { id: "agreed", label: "Agreed" },
  { id: "paid", label: "Paid" },
  { id: "completed", label: "Handed over" },
];

export const ACTION_LABELS: Record<WaveChatAction, string> = {
  ask_availability: "Ask if available",
  confirm_available: "Yes, still available",
  reply_not_available: "No longer available",
  request_photos: "Request more photos",
  book_inspection: "Arrange inspection",
  confirm_inspection: "Confirm inspection",
  make_offer: "Make an offer",
  accept_offer: "Accept",
  decline_offer: "Decline",
  withdraw_offer: "Withdraw",
  send_quote: "Send a quote",
  accept_quote: "Accept quote",
  request_quote_changes: "Ask for changes",
  promise_payment: "Promise a payment",
  record_payment: "Record deposit",
  record_sale: "Record final payment",
  confirm_receipt: "Confirm receipt",
  start_handover: "Start handover",
  confirm_handover_item: "Confirm",
};

export const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank transfer" },
  { id: "cash", label: "Cash" },
  { id: "pos", label: "POS" },
  { id: "ussd", label: "USSD" },
  { id: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

/** Items a seller can tick as included in a quote. */
export const QUOTE_INCLUSIONS = [
  "Original papers",
  "Change of ownership",
  "Registration and plate number",
  "Customs duty paid",
  "Delivery to buyer",
  "Spare key",
  "Full tank of fuel",
] as const;

export const REACTIONS = ["👍", "❤️", "😂", "😮", "🙏", "👎"] as const;

export interface ChatState {
  stage: ChatStage;
  inspectionRequested: boolean;
  inspectionConfirmed: boolean;
  /** The car is currently marked available */
  carAvailable: boolean;
  /** The handover checklist exists */
  handoverStarted: boolean;
}

/**
 * The quick actions shown in the action bar. Answers that belong to a card (accept or decline an
 * offer or quote, confirm a receipt, tick a handover item) appear on that card instead.
 */
export const availableActions = (role: ChatRole, state: ChatState): WaveChatAction[] => {
  if (state.stage === "completed" || state.stage === "closed") return [];

  if (state.stage === "paid") {
    return role === "seller" && !state.handoverStarted ? ["start_handover"] : [];
  }

  const agreed = state.stage === "agreed";
  if (role === "buyer") {
    const actions: WaveChatAction[] = ["ask_availability", "request_photos"];
    if (!state.inspectionConfirmed) actions.push("book_inspection");
    if (!agreed) actions.push("make_offer");
    actions.push("promise_payment");
    return actions;
  }

  const actions: WaveChatAction[] = [];
  if (state.carAvailable) actions.push("confirm_available");
  actions.push("reply_not_available");
  if (state.inspectionRequested && !state.inspectionConfirmed) actions.push("confirm_inspection");
  if (!agreed) actions.push("send_quote");
  actions.push("record_payment");
  if (state.carAvailable) actions.push("record_sale");
  if (agreed && !state.handoverStarted) actions.push("start_handover");
  return actions;
};

/** Index of the stage in the progress bar; closed conversations show no progress. */
export const stageIndex = (stage: ChatStage) => STAGES.findIndex((item) => item.id === stage);

export const paymentMethodLabel = (method: string) =>
  PAYMENT_METHODS.find((item) => item.id === method)?.label ?? method;

/** Delivery ticks, WhatsApp-style. */
export type Tick = "sent" | "delivered" | "read";
export const tickFor = (message: { deliveredAt: string | null; readAt: string | null; isRead: boolean }): Tick =>
  message.isRead || message.readAt ? "read" : message.deliveredAt ? "delivered" : "sent";

/** "online" within the last two minutes, otherwise a last-seen phrase. */
export const lastSeenLabel = (lastSeen: string | null, now: Date = new Date()): string | null => {
  if (!lastSeen) return null;
  const minutes = Math.floor((now.getTime() - new Date(lastSeen).getTime()) / 60_000);
  if (minutes < 2) return "online";
  if (minutes < 60) return `last seen ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `last seen ${hours} h ago`;
  return `last seen ${new Date(lastSeen).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`;
};

/** A payment promise's state on a given day (Lagos dates as YYYY-MM-DD). */
export const promiseState = (promise: { dueDate: string; keptAt: string | null; keptOnTime: boolean | null; cancelledAt: string | null }, today: string) => {
  if (promise.cancelledAt) return "replaced";
  if (promise.keptAt) return promise.keptOnTime ? "kept" : "kept_late";
  return promise.dueDate < today ? "overdue" : "open";
};

/** Today's date in Lagos as YYYY-MM-DD. */
export const lagosToday = (now: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
