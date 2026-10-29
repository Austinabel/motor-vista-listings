import { test } from "node:test";
import assert from "node:assert/strict";
import { loginPathFor, safeRedirectPath } from "@/lib/redirect";

test("same-site paths are accepted", () => {
  assert.equal(safeRedirectPath("/cars/123"), "/cars/123");
  assert.equal(safeRedirectPath("/cars?make=Toyota"), "/cars?make=Toyota");
});

test("off-site and unsafe destinations are rejected", () => {
  assert.equal(safeRedirectPath("https://evil.example"), null);
  assert.equal(safeRedirectPath("//evil.example"), null);
  assert.equal(safeRedirectPath("/\\evil.example"), null);
  assert.equal(safeRedirectPath("javascript:alert(1)"), null);
  assert.equal(safeRedirectPath("/cars\n/x"), null);
  assert.equal(safeRedirectPath(""), null);
  assert.equal(safeRedirectPath(null), null);
});

test("auth pages are never a destination", () => {
  assert.equal(safeRedirectPath("/login"), null);
  assert.equal(safeRedirectPath("/register?x=1"), null);
});

test("login link round-trips the return path", () => {
  const link = loginPathFor("/cars/abc?x=1");
  const redirect = new URLSearchParams(link.split("?")[1]).get("redirect");
  assert.equal(safeRedirectPath(redirect), "/cars/abc?x=1");
});
