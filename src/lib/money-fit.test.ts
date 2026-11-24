import { test } from "node:test";
import { strict as assert } from "node:assert";
import { MAX_CENTS } from "./money-fit";
import { cleanGuestName } from "./guest-name";
test("max value is R$ 999.999.999,99", () => assert.equal(MAX_CENTS / 100, 999999999.99));
test("guest name max 20 chars", () => assert.equal(cleanGuestName("a".repeat(30)).length, 20));
