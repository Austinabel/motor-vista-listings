import { test } from "node:test";
import assert from "node:assert/strict";
import { describeAvailability } from "@/lib/availability";

const now = new Date("2026-10-29T12:00:00Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

test("never-confirmed listings are not presented as available", () => {
  const view = describeAvailability("available", null, 14, now);
  assert.equal(view.tone, "unconfirmed");
  assert.equal(view.label, "Availability not confirmed");
});

test("before the migration (no status) behaves like never confirmed", () => {
  assert.equal(describeAvailability(null, null, 14, now).tone, "unconfirmed");
});

test("a recent confirmation reads as confirmed", () => {
  assert.equal(describeAvailability("available", daysAgo(3), 14, now).tone, "confirmed");
});

test("an old confirmation needs reconfirmation", () => {
  const view = describeAvailability("available", daysAgo(20), 14, now);
  assert.equal(view.tone, "unconfirmed");
  assert.equal(view.label, "Needs reconfirmation");
});

test("sold, unavailable and reserved are reported as such", () => {
  assert.equal(describeAvailability("sold", daysAgo(1), 14, now).label, "Sold");
  assert.equal(describeAvailability("unavailable", null, 14, now).tone, "closed");
  assert.equal(describeAvailability("reserved", daysAgo(1), 14, now).tone, "reserved");
});
