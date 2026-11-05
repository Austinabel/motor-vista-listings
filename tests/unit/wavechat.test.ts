import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableActions, lagosToday, lastSeenLabel, paymentMethodLabel, promiseState, stageIndex, tickFor, type ChatState,
} from "@/lib/wavechat";

const state = (partial: Partial<ChatState> = {}): ChatState => ({
  stage: "enquiry",
  inspectionRequested: false,
  inspectionConfirmed: false,
  carAvailable: true,
  handoverStarted: false,
  ...partial,
});

test("a buyer starts with the questions, an offer and a payment promise", () => {
  assert.deepEqual(availableActions("buyer", state()), ["ask_availability", "request_photos", "book_inspection", "make_offer", "promise_payment"]);
});

test("after agreement buyers can't offer and sellers can't quote", () => {
  assert.ok(!availableActions("buyer", state({ stage: "agreed" })).includes("make_offer"));
  const seller = availableActions("seller", state({ stage: "agreed" }));
  assert.ok(!seller.includes("send_quote"));
  assert.ok(seller.includes("start_handover"));
  assert.ok(!availableActions("seller", state({ stage: "agreed", handoverStarted: true })).includes("start_handover"));
});

test("sellers confirm inspections only once asked, and take final payment only for available cars", () => {
  assert.ok(!availableActions("seller", state()).includes("confirm_inspection"));
  assert.ok(availableActions("seller", state({ inspectionRequested: true })).includes("confirm_inspection"));
  const unavailable = availableActions("seller", state({ carAvailable: false }));
  assert.ok(!unavailable.includes("record_sale"));
  assert.ok(unavailable.includes("record_payment"));
});

test("once paid only the handover remains, and nothing after it", () => {
  assert.deepEqual(availableActions("seller", state({ stage: "paid" })), ["start_handover"]);
  assert.deepEqual(availableActions("seller", state({ stage: "paid", handoverStarted: true })), []);
  assert.deepEqual(availableActions("buyer", state({ stage: "paid" })), []);
  assert.deepEqual(availableActions("buyer", state({ stage: "completed" })), []);
});

test("ticks, last seen and promise states", () => {
  assert.equal(tickFor({ deliveredAt: null, readAt: null, isRead: false }), "sent");
  assert.equal(tickFor({ deliveredAt: "2026-11-08T10:00:00Z", readAt: null, isRead: false }), "delivered");
  assert.equal(tickFor({ deliveredAt: null, readAt: null, isRead: true }), "read");

  const now = new Date("2026-11-08T12:00:00Z");
  assert.equal(lastSeenLabel("2026-11-08T11:59:30Z", now), "online");
  assert.equal(lastSeenLabel("2026-11-08T11:30:00Z", now), "last seen 30 min ago");
  assert.equal(lastSeenLabel("2026-11-08T07:00:00Z", now), "last seen 5 h ago");
  assert.equal(lastSeenLabel(null, now), null);

  const base = { dueDate: "2026-11-10", keptAt: null, keptOnTime: null, cancelledAt: null };
  assert.equal(promiseState(base, "2026-11-09"), "open");
  assert.equal(promiseState(base, "2026-11-11"), "overdue");
  assert.equal(promiseState({ ...base, keptAt: "2026-11-09T09:00:00Z", keptOnTime: true }, "2026-11-11"), "kept");
  assert.equal(promiseState({ ...base, cancelledAt: "2026-11-09T09:00:00Z" }, "2026-11-09"), "replaced");
  assert.equal(lagosToday(new Date("2026-11-08T23:30:00Z")), "2026-11-09");
});

test("stage progress and payment labels", () => {
  assert.equal(stageIndex("enquiry"), 0);
  assert.equal(stageIndex("completed"), 5);
  assert.equal(stageIndex("closed"), -1);
  assert.equal(paymentMethodLabel("bank_transfer"), "Bank transfer");
});
