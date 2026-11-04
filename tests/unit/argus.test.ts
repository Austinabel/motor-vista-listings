import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectionQuestions, interpretSearchRequest, missingListingDetails } from "@/lib/argus";

test("a full request becomes filters", () => {
  const { criteria, understood } = interpretSearchRequest("Toyota SUV under 15 million in Lagos, 2015 or newer");
  assert.equal(criteria.make, "Toyota");
  assert.equal(criteria.category, "suv");
  assert.equal(criteria.maxPrice, "15000000");
  assert.equal(criteria.location, "Lagos");
  assert.equal(criteria.yearFrom, "2015");
  assert.equal(criteria.yearTo, "");
  assert.equal(criteria.search, "");
  assert.equal(understood.length, 5);
});

test("prices are read in millions, thousands and full naira", () => {
  assert.equal(interpretSearchRequest("under 8.5m").criteria.maxPrice, "8500000");
  assert.equal(interpretSearchRequest("below ₦12,000,000").criteria.maxPrice, "12000000");
  assert.equal(interpretSearchRequest("under 900k").criteria.maxPrice, "900000");
  assert.equal(interpretSearchRequest("under 20").criteria.maxPrice, "20000000");
  const range = interpretSearchRequest("between 5 and 10 million").criteria;
  assert.equal(range.minPrice, "5000000");
  assert.equal(range.maxPrice, "10000000");
});

test("a year after a price word is not read as a price", () => {
  const { criteria } = interpretSearchRequest("honda before 2012");
  assert.equal(criteria.maxPrice, "");
  assert.equal(criteria.yearTo, "2012");
  assert.equal(interpretSearchRequest("camry 2018").criteria.yearFrom, "2018");
});

test("conditions, aliases and two-word places are recognised", () => {
  const { criteria } = interpretSearchRequest("tokunbo benz automatic in port harcourt");
  assert.equal(criteria.condition, "foreign_used");
  assert.equal(criteria.make, "Mercedes-Benz");
  assert.equal(criteria.transmission, "automatic");
  assert.equal(criteria.location, "Rivers");
  assert.equal(interpretSearchRequest("land rover").criteria.make, "Land Rover");
  assert.equal(interpretSearchRequest("car in abuja").criteria.location, "FCT");
});

test("unmatched words are kept as a keyword instead of being dropped", () => {
  const { criteria } = interpretSearchRequest("I want a clean Toyota Camry");
  assert.equal(criteria.make, "Toyota");
  assert.equal(criteria.search, "camry");
  assert.equal(criteria.sort, "relevance");
});

test("missing listing details are listed, photos only when counted", () => {
  const complete = { mileage: 50000, transmission: "automatic", fuelType: "petrol", color: "black", description: "One owner." };
  assert.deepEqual(missingListingDetails(complete), []);
  assert.deepEqual(missingListingDetails({ ...complete, photoCount: 8 }), []);
  assert.deepEqual(missingListingDetails({ ...complete, photoCount: 2 }), ["More photos (2 of 5 recommended)"]);
  assert.deepEqual(
    missingListingDetails({ mileage: null, transmission: null, fuelType: "petrol", color: null, description: "  " }),
    ["Mileage", "Gearbox (automatic or manual)", "Colour", "A description of the car's history and condition"]
  );
});

test("inspection questions add condition-specific ones", () => {
  const general = inspectionQuestions(null);
  assert.ok(inspectionQuestions("foreign_used").length > general.length);
  assert.ok(inspectionQuestions("Tokunbo").some((question) => question.includes("customs duty")));
  assert.ok(inspectionQuestions("nigerian-used").some((question) => question.includes("owners")));
});
