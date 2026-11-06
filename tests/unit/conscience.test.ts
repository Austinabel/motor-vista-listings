import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cycleOutcomeLabel, cycleProgress, describeFinding, findingStatusLabel, publicConscienceSummary, timeLeft,
} from "@/lib/conscience";

const start = "2026-11-01T00:00:00Z";
const end = "2026-11-15T00:00:00Z";
const at = (iso: string) => new Date(iso).getTime();

test("progress runs from 0 to 1 and stays inside the cycle", () => {
  const cycle = { startsAt: start, reconcileEndsAt: end };
  assert.equal(cycleProgress(cycle, at("2026-11-08T00:00:00Z")), 0.5);
  assert.equal(cycleProgress(cycle, at("2026-10-01T00:00:00Z")), 0);
  assert.equal(cycleProgress(cycle, at("2026-12-01T00:00:00Z")), 1);
});

test("time left switches from days to hours for the last two days", () => {
  assert.equal(timeLeft(end, at("2026-11-05T00:00:00Z")), "10 days left");
  assert.equal(timeLeft(end, at("2026-11-14T00:00:00Z")), "24 hours left");
  assert.equal(timeLeft(end, at("2026-11-14T22:30:00Z")), "1 hour left");
  assert.equal(timeLeft(end, at("2026-11-14T23:30:00Z")), "Ending soon");
  assert.equal(timeLeft(end, at("2026-11-20T00:00:00Z")), "Ending soon");
});

test("every finding names the car and says what to do", () => {
  for (const kind of ["not_confirmed", "chat_says_unavailable", "paid_still_available", "availability_lie"] as const) {
    const { problem, fix } = describeFinding({ kind, carTitle: "2018 Toyota Camry" });
    assert.match(problem, /2018 Toyota Camry/);
    assert.ok(fix.length > 0);
  }
  assert.match(describeFinding({ kind: "availability_lie", carTitle: "x" }).fix, /can't be reconciled/);
});

test("labels never call a cycle without cars clean", () => {
  assert.equal(cycleOutcomeLabel("quiet"), "No cars on sale");
  assert.equal(cycleOutcomeLabel("clean"), "Clean");
  assert.equal(findingStatusLabel("reconciled"), "Put right");
});

test("the public line appears only once a cycle has been sealed", () => {
  assert.equal(publicConscienceSummary({ cyclesSealed: 0, cleanCycles: 0 }), null);
  assert.equal(publicConscienceSummary({ cyclesSealed: 1, cleanCycles: 1 }), "1 of 1 cycle clean");
  assert.equal(publicConscienceSummary({ cyclesSealed: 5, cleanCycles: 4 }), "4 of 5 cycles clean");
});
