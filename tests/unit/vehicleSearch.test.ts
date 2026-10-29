import { test } from "node:test";
import assert from "node:assert/strict";
import {
  criteriaToParams,
  makeMatches,
  matchesKeyword,
  matchesVehicleType,
  parseCriteria,
} from "@/lib/vehicleSearch";

const car = (make: string, model: string, fuel_type: string | null = null) => ({
  make, model, year: 2018, location: null, description: null, fuel_type,
});

test("make spellings match", () => {
  assert.equal(makeMatches("Mercedes Benz", "Mercedes-Benz"), true);
  assert.equal(makeMatches("Mercedes", "Mercedes-Benz"), true);
  assert.equal(makeMatches("Mercedes‑Benz", "mercedes-benz"), true);
  assert.equal(makeMatches("Lexus", "Toyota"), false);
});

test("vehicle types are recognised from model names", () => {
  assert.equal(matchesVehicleType(car("Lexus", "RX350"), "suv"), true);
  assert.equal(matchesVehicleType(car("Toyota", "Land Cruiser 300"), "suv"), true);
  assert.equal(matchesVehicleType(car("Land Rover", "Range Rover Sport"), "suv"), true);
  assert.equal(matchesVehicleType(car("Toyota", "Corolla"), "suv"), false);
  assert.equal(matchesVehicleType(car("Toyota", "Camry"), "sedan"), true);
  assert.equal(matchesVehicleType(car("Toyota", "Hilux"), "pickups"), true);
  assert.equal(matchesVehicleType(car("Toyota", "Hiace"), "buses-shuttles"), true);
  assert.equal(matchesVehicleType(car("Honda", "Accord", "petrol"), "motorbikes"), false);
});

test("keyword search needs every word", () => {
  assert.equal(matchesKeyword({ ...car("Toyota", "Corolla"), year: 2012 }, "toyota corolla 2012"), true);
  assert.equal(matchesKeyword(car("Toyota", "Camry"), "toyota corolla"), false);
});

test("legacy URL parameters fold into canonical criteria", () => {
  const legacy = parseCriteria(new URLSearchParams("category=toyota&type=foreign-used"));
  assert.equal(legacy.make, "Toyota");
  assert.equal(legacy.condition, "foreign_used");
  assert.equal(parseCriteria(new URLSearchParams("category=electric")).category, "electric-cars");
  assert.equal(parseCriteria(new URLSearchParams("condition=nigerian-used")).condition, "local_used");
  assert.equal(parseCriteria(new URLSearchParams("category=suv")).category, "suv");
});

test("sort defaults and validation", () => {
  assert.equal(parseCriteria(new URLSearchParams("search=corolla")).sort, "relevance");
  assert.equal(parseCriteria(new URLSearchParams("sort=hack")).sort, "newest");
});

test("criteria round-trip through the URL", () => {
  const params = "search=corolla&location=FCT&maxPrice=5000000";
  assert.equal(criteriaToParams(parseCriteria(new URLSearchParams(params))).toString(), params);
});
