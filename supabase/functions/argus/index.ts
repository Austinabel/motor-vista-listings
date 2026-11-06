import Anthropic from "npm:@anthropic-ai/sdk@1.6.0";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";
import {
  DEFAULT_MODEL, MAX_QUESTION_LENGTH, MAX_RESULTS, PUBLIC_COLUMNS, SYSTEM_PROMPT, TOOLS,
  costUsd, runArgus, toPublicCar, toSearchFilters, type PublicCar, type RunTool, type Surface, type Usage,
} from "./core.ts";

// Answers a buyer's question with Claude, using read-only access to live listings.
// Secrets: ANTHROPIC_API_KEY (required for Claude), ARGUS_MODEL (optional, defaults to DEFAULT_MODEL).
// Whenever Claude can't be used the reply says why in `fallback`, and the app uses its fixed rules.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

const fallback = (reason: string) => json({ fallback: reason });

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
// Listings are read as a visitor, so database rules still decide what Argus can see
const visitor = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

const liveListings = () =>
  visitor.from("car_listings").select(PUBLIC_COLUMNS).eq("status", "active").in("availability_status", ["available", "reserved"]);

const fetchCar = async (id: string): Promise<PublicCar | null> => {
  const { data, error } = await liveListings().eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toPublicCar(data) : null;
};

const runTool: RunTool = async (name, input) => {
  if (name === "get_listing") {
    const car = await fetchCar(String(input.listing_id));
    return car
      ? { content: JSON.stringify(car), cars: [car] }
      : { content: "No live listing has that id.", isError: true };
  }
  if (name === "search_listings") {
    const filters = toSearchFilters(input);
    let query = liveListings();
    for (const { column, pattern } of filters.text) query = query.ilike(column, pattern);
    if (filters.minPrice !== null) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice !== null) query = query.lte("price", filters.maxPrice);
    if (filters.yearFrom !== null) query = query.gte("year", filters.yearFrom);
    if (filters.yearTo !== null) query = query.lte("year", filters.yearTo);
    if (filters.conditions) query = query.in("condition", filters.conditions);
    if (filters.transmission) query = query.ilike("transmission", filters.transmission);
    if (filters.fuel) query = query.ilike("fuel_type", filters.fuel);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(MAX_RESULTS);
    if (error) throw new Error(error.message);
    const cars = (data ?? []).map(toPublicCar);
    return { content: cars.length > 0 ? JSON.stringify(cars) : "No live listings match.", cars };
  }
  return { content: `Unknown tool ${name}.`, isError: true };
};

const signedInUser = async (req: Request) => {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await client.auth.getUser();
  return user;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return fallback("not_configured");

  const user = await signedInUser(req);
  if (!user) return fallback("sign_in");

  let body: { surface?: string; question?: string; listingId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Send a JSON body" }, 400);
  }
  const surface: Surface = body.surface === "car" ? "car" : "search";
  const question = (body.question ?? "").trim();
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return json({ error: `Ask a question of up to ${MAX_QUESTION_LENGTH} characters` }, 400);
  }

  const { data: gate, error: gateError } = await service.rpc("argus_gate", { _user_id: user.id });
  if (gateError) {
    console.error("Argus gate failed", gateError.message);
    return fallback("unavailable");
  }
  if (gate !== "ok") return fallback(gate);

  const model = Deno.env.get("ARGUS_MODEL") || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey, timeout: 45_000, maxRetries: 1 });
  // Haiku has no server-side fallback; on the others a declined request is retried on another model
  const refusalFallback = model.startsWith("claude-haiku") ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };

  let usage: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  let outcome: "answered" | "failed" = "failed";
  try {
    const car = surface === "car" && body.listingId ? await fetchCar(body.listingId) : null;
    if (surface === "car" && !car) return json({ error: "That car isn't live" }, 404);

    const run = await runArgus(
      (messages) =>
        client.beta.messages.create({
          model,
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          output_config: { effort: "low" },
          messages,
          ...refusalFallback,
        } as never) as never,
      runTool,
      question,
      car,
    );
    usage = run.usage;
    if (!run.answer) {
      console.error("Argus gave no answer", run.failure);
      return fallback("unavailable");
    }
    outcome = "answered";
    return json({
      answer: run.answer,
      cars: run.cars.map(({ id, title, price, location }) => ({ id, title, price, location })),
    });
  } catch (error) {
    console.error("Argus failed", error instanceof Error ? error.message : error);
    return fallback("unavailable");
  } finally {
    // Failed questions still count: they may have cost money and they use up the daily limit
    const { error } = await service.rpc("argus_record_usage", {
      _user_id: user.id,
      _surface: surface,
      _model: model,
      _input_tokens: usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens,
      _output_tokens: usage.outputTokens,
      _cost_usd: costUsd(model, usage),
      _outcome: outcome,
    });
    if (error) console.error("Argus usage not recorded", error.message);
  }
});
