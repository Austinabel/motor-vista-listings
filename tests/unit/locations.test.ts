import { test } from "node:test";
import assert from "node:assert/strict";
import { locationMatches, toStateName } from "@/lib/locations";

test("FCT and Abuja match each other", () => {
  assert.equal(locationMatches("Garki, Abuja", "FCT"), true);
  assert.equal(locationMatches("Wuse, FCT", "Abuja"), true);
  assert.equal(locationMatches("Federal Capital Territory", "FCT"), true);
  assert.equal(toStateName("Abuja"), "FCT");
});

test("a state matches its cities and districts", () => {
  assert.equal(locationMatches("Ikeja", "Lagos"), true);
  assert.equal(locationMatches("Port Harcourt, Rivers", "Rivers"), true);
  assert.equal(locationMatches("Asaba", "Delta"), true);
});

test("short names never match inside longer words", () => {
  assert.equal(locationMatches("Kabala, Kaduna", "Abia"), false);
  assert.equal(locationMatches("Imota, Lagos", "Imo"), false);
});

test("different states do not match", () => {
  assert.equal(locationMatches("Garki, Abuja", "Lagos"), false);
});

test("free text matches whole words; empty filter matches everything", () => {
  assert.equal(locationMatches("Lekki Phase 1, Lagos", "lekki"), true);
  assert.equal(locationMatches(null, ""), true);
  assert.equal(locationMatches(null, "Lagos"), false);
});
