import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMid, midFromPhone, ringFraction } from "@/lib/mid";

test("the PRD's own example", () => {
  assert.equal(midFromPhone("07038259694"), "4969528307");
});

test("international and spaced forms give the same MID", () => {
  assert.equal(midFromPhone("+234 703 825 9694"), "4969528307");
  assert.equal(midFromPhone("2347038259694"), "4969528307");
  assert.equal(midFromPhone("0703-825-9694"), "4969528307");
});

test("numbers that aren't Nigerian mobile numbers get no MID", () => {
  assert.equal(midFromPhone(""), null);
  assert.equal(midFromPhone(null), null);
  assert.equal(midFromPhone("12345"), null);
  assert.equal(midFromPhone("00000000000"), null);
  assert.equal(midFromPhone("+44 7700 900123"), null);
});

test("MIDs display in groups and the ring stays within 0–1000", () => {
  assert.equal(formatMid("4969528307"), "4969 528 307");
  assert.equal(ringFraction(-5), 0);
  assert.equal(ringFraction(500), 0.5);
  assert.equal(ringFraction(1200), 1);
});
