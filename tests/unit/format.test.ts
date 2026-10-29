import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCondition, formatNaira, toWhatsAppNumber } from "@/lib/format";

test("naira formatting", () => {
  assert.equal(formatNaira(4800000), "₦4,800,000");
});

test("every stored condition spelling gets a label", () => {
  assert.equal(formatCondition("nigerian-used"), "Nigerian used");
  assert.equal(formatCondition("foreign_used"), "Foreign used");
  assert.equal(formatCondition("brand-new"), "Brand new");
  assert.equal(formatCondition(null), null);
});

test("WhatsApp numbers are converted to international format", () => {
  assert.equal(toWhatsAppNumber("0803 123 4567"), "2348031234567");
  assert.equal(toWhatsAppNumber("+234 803 123 4567"), "2348031234567");
  assert.equal(toWhatsAppNumber("12345"), null);
});

test("text mileage is parsed, junk becomes null", async () => {
  const { parseMileage } = await import("@/lib/format");
  assert.equal(parseMileage("45000"), 45000);
  assert.equal(parseMileage("45,000 km"), 45000);
  assert.equal(parseMileage("N/A"), null);
  assert.equal(parseMileage(""), null);
  assert.equal(parseMileage(null), null);
  assert.equal(parseMileage("-5"), null);
});
