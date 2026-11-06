import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_TURNS, PUBLIC_COLUMNS, TOOLS, buildPrompt, costUsd, runArgus, toPublicCar, toSearchFilters,
  type CreateMessage, type PublicCar, type RunTool,
} from "../../supabase/functions/argus/core";

const car = (id: string, price = 9000000): PublicCar =>
  toPublicCar({ id, year: "2018", make: "Toyota", model: "Camry", price, location: "Lagos", availability_status: "available" });

const usage = { input_tokens: 100, output_tokens: 10 };
const say = (text: string) => ({ stop_reason: "end_turn", content: [{ type: "text", text }], usage });
const call = (name: string, input: unknown, id = "t1") => ({
  stop_reason: "tool_use",
  content: [{ type: "tool_use", id, name, input }],
  usage,
});

const scripted = (...replies: unknown[]) => {
  const sent: unknown[][] = [];
  const create = (async (messages) => {
    sent.push(JSON.parse(JSON.stringify(messages)));
    return replies.shift();
  }) as CreateMessage;
  return { create, sent };
};

const noTools: RunTool = async () => {
  throw new Error("no tool should run");
};

test("a plain answer comes back with its token usage", async () => {
  const { create } = scripted(say("Yes, it's a petrol car."));
  const run = await runArgus(create, noTools, "Is it petrol?", car("a"));
  assert.equal(run.answer, "Yes, it's a petrol car.");
  assert.equal(run.failure, null);
  assert.equal(run.usage.inputTokens, 100);
});

test("the tool loop feeds results back and adds up usage", async () => {
  const { create, sent } = scripted(call("search_listings", { make: "Toyota" }), say("One car matches."));
  const runTool: RunTool = async () => ({ content: "[...]", cars: [car("a")] });
  const run = await runArgus(create, runTool, "Toyota?", null);
  assert.equal(run.answer, "One car matches.");
  assert.equal(run.usage.outputTokens, 20);
  const last = sent[1].at(-1) as { role: string; content: { type: string; tool_use_id: string }[] };
  assert.equal(last.role, "user");
  assert.equal(last.content[0].type, "tool_result");
  assert.equal(last.content[0].tool_use_id, "t1");
});

test("only cars a tool really returned can be shown to the buyer", async () => {
  const { create } = scripted(
    call("search_listings", {}),
    call("show_cars", { listing_ids: ["real", "invented"] }, "t2"),
    say("Here you go."),
  );
  const runTool: RunTool = async () => ({ content: "[...]", cars: [car("real", 5000000)] });
  const run = await runArgus(create, runTool, "Any car?", null);
  assert.deepEqual(run.cars.map((shown) => shown.id), ["real"]);
  assert.equal(run.cars[0].price, 5000000);
});

test("a failed lookup is reported to Claude instead of ending the question", async () => {
  const { create, sent } = scripted(call("get_listing", { listing_id: "x" }), say("I couldn't find that car."));
  const run = await runArgus(create, noTools, "Tell me about x", null);
  assert.equal(run.answer, "I couldn't find that car.");
  const last = sent[1].at(-1) as { content: { is_error: boolean }[] };
  assert.equal(last.content[0].is_error, true);
});

test("refusals, cut-off replies and endless tool calls give no answer", async () => {
  const refused = await runArgus(scripted({ stop_reason: "refusal", content: [], usage }).create, noTools, "q", null);
  assert.equal(refused.failure, "refusal");
  assert.equal(refused.answer, null);

  const cut = await runArgus(scripted({ stop_reason: "max_tokens", content: [{ type: "text", text: "Half a sen" }], usage }).create, noTools, "q", null);
  assert.equal(cut.failure, "truncated");
  assert.equal(cut.answer, null);

  const endless = Array.from({ length: MAX_TURNS + 2 }, () => call("show_cars", { listing_ids: [] }));
  const looped = await runArgus(scripted(...endless).create, noTools, "q", null);
  assert.equal(looped.failure, "too_many_turns");
  assert.equal(looped.usage.inputTokens, MAX_TURNS * 100);
});

test("search filters can't be widened by what the model sends", () => {
  const filters = toSearchFilters({ make: "%_Toyota,(x)", min_price: -5, max_price: "lots", year_from: 2015.7, condition: "tokunbo", fuel: null });
  assert.deepEqual(filters.text, [{ column: "make", pattern: "%Toyota  x%" }]);
  assert.equal(filters.minPrice, null);
  assert.equal(filters.maxPrice, null);
  assert.equal(filters.yearFrom, "2015");
  assert.equal(filters.conditions, null);
  assert.equal(filters.fuel, null);
  assert.ok(toSearchFilters({ condition: "foreign_used" }).conditions?.includes("tokunbo"));
});

test("Argus reads no seller identity or contact details", () => {
  for (const column of ["user_id", "phone", "email", "seller", "vin"]) assert.ok(!PUBLIC_COLUMNS.includes(column), column);
  assert.ok(!("user_id" in toPublicCar({ id: "a", user_id: "secret", price: 1 })));
});

test("Argus has read-only tools and nothing else", () => {
  assert.deepEqual(TOOLS.map((tool) => tool.name), ["search_listings", "get_listing", "show_cars"]);
});

test("long seller descriptions are cut, and listing text is marked as the seller's", () => {
  assert.equal(toPublicCar({ id: "a", price: 1, description: "x".repeat(5000) }).description?.length, 1500);
  assert.match(buildPrompt("Is it clean?", car("a")), /written by the seller/);
  assert.equal(buildPrompt("Is it clean?", null), "Buyer's question: Is it clean?");
});

test("cost follows the model, and an unknown model counts at the top price", () => {
  const tokens = { inputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 0, cacheWriteTokens: 0 };
  assert.equal(costUsd("claude-opus-5-5", tokens), 6);
  assert.equal(costUsd("claude-haiku-5-5", tokens), 0.15);
  assert.equal(costUsd("some-future-model", tokens), 15);
  assert.equal(costUsd("claude-opus-5-5", { ...tokens, inputTokens: 0, outputTokens: 0, cacheReadTokens: 1_000_000 }), 0.4);
});
