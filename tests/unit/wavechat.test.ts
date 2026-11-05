import { test } from "node:test";
import assert from "node:assert/strict";
import { availableActions, paymentMethodLabel, stageIndex, type ChatState } from "@/lib/wavechat";

const state = (partial: Partial<ChatState> = {}): ChatState => ({
  stage: "enquiry",
  pendingOffer: false,
  inspectionRequested: false,
  inspectionConfirmed: false,
  carAvailable: true,
  receiptToConfirm: false,
  ...partial,
});

test("a buyer starts with the four questions", () => {
  assert.deepEqual(availableActions("buyer", state()), ["ask_availability", "request_photos", "book_inspection", "make_offer"]);
});

test("buyers can't book a second inspection or offer after agreement", () => {
  const actions = availableActions("buyer", state({ stage: "agreed", inspectionRequested: true, inspectionConfirmed: true }));
  assert.ok(!actions.includes("book_inspection"));
  assert.ok(!actions.includes("make_offer"));
});

test("sellers confirm inspections only once asked, and sell only available cars", () => {
  assert.ok(!availableActions("seller", state()).includes("confirm_inspection"));
  assert.ok(availableActions("seller", state({ inspectionRequested: true })).includes("confirm_inspection"));
  const unavailable = availableActions("seller", state({ carAvailable: false }));
  assert.ok(!unavailable.includes("record_sale"));
  assert.ok(!unavailable.includes("confirm_available"));
  assert.ok(unavailable.includes("reply_not_available"));
});

test("after the sale only the buyer's receipt confirmation remains", () => {
  assert.deepEqual(availableActions("buyer", state({ stage: "completed", receiptToConfirm: true })), ["confirm_receipt"]);
  assert.deepEqual(availableActions("buyer", state({ stage: "completed" })), []);
  assert.deepEqual(availableActions("seller", state({ stage: "completed", receiptToConfirm: true })), []);
});

test("stage progress and payment labels", () => {
  assert.equal(stageIndex("enquiry"), 0);
  assert.equal(stageIndex("completed"), 4);
  assert.equal(stageIndex("closed"), -1);
  assert.equal(paymentMethodLabel("bank_transfer"), "Bank transfer");
});
