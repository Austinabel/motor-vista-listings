import { test } from "node:test";
import assert from "node:assert/strict";
import { describeInventoryEvent, normaliseVin, type InventoryEvent } from "@/lib/inventory";

const event = (partial: Partial<InventoryEvent>): InventoryEvent => ({
  eventType: "listed",
  occurredAt: "2026-11-06T10:00:00Z",
  fromValue: null,
  toValue: null,
  backfilled: false,
  ...partial,
});

test("price changes say which way and by how much", () => {
  const cut = describeInventoryEvent(event({ eventType: "price_changed", fromValue: { price: 15000000 }, toValue: { price: 13500000 } }));
  assert.match(cut.label, /^Price reduced from ₦15,000,000 to ₦13,500,000$/);
  const rise = describeInventoryEvent(event({ eventType: "price_changed", fromValue: { price: 9000000 }, toValue: { price: 9500000 } }));
  assert.match(rise.label, /^Price raised/);
  assert.equal(describeInventoryEvent(event({ eventType: "price_changed" })).label, "Price changed");
});

test("availability events carry their tone", () => {
  assert.equal(describeInventoryEvent(event({ eventType: "availability_confirmed" })).tone, "good");
  assert.equal(describeInventoryEvent(event({ eventType: "reserved" })).tone, "warning");
  assert.equal(describeInventoryEvent(event({ eventType: "sold" })).tone, "closed");
  assert.equal(describeInventoryEvent(event({ eventType: "withdrawn" })).label, "Withdrawn from sale");
});

test("a listing shows its price only when one was recorded", () => {
  assert.equal(describeInventoryEvent(event({ toValue: { price: 8000000 } })).label, "Listed at ₦8,000,000");
  assert.equal(describeInventoryEvent(event({ toValue: {} })).label, "Listed");
});

test("VINs are normalised and checked", () => {
  assert.equal(normaliseVin(" 1hgcm82633a004352 "), "1HGCM82633A004352");
  assert.equal(normaliseVin("1HGCM 8263 3A004352"), "1HGCM82633A004352");
  assert.equal(normaliseVin("1HGCM82633A00435"), null);
  assert.equal(normaliseVin("1HGCM82633A00435O"), null);
  assert.equal(normaliseVin(""), null);
});
