// WaveChat rules shared by the screens. The database (wavechat_action) enforces the same rules;
// this copy decides which buttons to show so nobody is offered an action that would be refused.

export type ChatStage = "enquiry" | "inspection" | "offer" | "agreed" | "completed" | "closed";
export type ChatRole = "buyer" | "seller";
export type MessageKind = "text" | "action" | "offer" | "offer_response" | "receipt";

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
  | "record_sale"
  | "confirm_receipt";

export const STAGES: { id: ChatStage; label: string }[] = [
  { id: "enquiry", label: "Enquiry" },
  { id: "inspection", label: "Inspection" },
  { id: "offer", label: "Offer" },
  { id: "agreed", label: "Agreed" },
  { id: "completed", label: "Sold" },
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
  record_sale: "Record sale and send receipt",
  confirm_receipt: "Confirm receipt",
};

export const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank transfer" },
  { id: "cash", label: "Cash" },
  { id: "pos", label: "POS" },
  { id: "ussd", label: "USSD" },
  { id: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

export interface ChatState {
  stage: ChatStage;
  /** An offer is waiting for the seller's answer */
  pendingOffer: boolean;
  inspectionRequested: boolean;
  inspectionConfirmed: boolean;
  /** The car is currently marked available */
  carAvailable: boolean;
  /** A receipt exists and the buyer hasn't confirmed it yet */
  receiptToConfirm: boolean;
}

/**
 * The quick actions shown in the action bar. Offer answers (accept, decline, withdraw) appear on
 * the offer card itself, so they are not listed here.
 */
export const availableActions = (role: ChatRole, state: ChatState): WaveChatAction[] => {
  if (state.stage === "completed" || state.stage === "closed") {
    return role === "buyer" && state.receiptToConfirm ? ["confirm_receipt"] : [];
  }

  if (role === "buyer") {
    const actions: WaveChatAction[] = ["ask_availability", "request_photos"];
    if (!state.inspectionConfirmed) actions.push("book_inspection");
    if (state.stage !== "agreed") actions.push("make_offer");
    return actions;
  }

  const actions: WaveChatAction[] = [];
  if (state.carAvailable) actions.push("confirm_available");
  actions.push("reply_not_available");
  if (state.inspectionRequested && !state.inspectionConfirmed) actions.push("confirm_inspection");
  if (state.carAvailable) actions.push("record_sale");
  return actions;
};

/** Index of the stage in the progress bar; closed conversations show no progress. */
export const stageIndex = (stage: ChatStage) => STAGES.findIndex((item) => item.id === stage);

export const paymentMethodLabel = (method: string) =>
  PAYMENT_METHODS.find((item) => item.id === method)?.label ?? method;
