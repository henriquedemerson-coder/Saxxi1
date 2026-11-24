import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { canDeleteAccount, readPreferences } from "./settings-preferences";

describe("settings safety", () => {
  test("notification types remain independent", () => {
    const prefs = readPreferences('{"push":true,"email":false,"sound":true,"vibration":false}');
    assert.deepEqual([prefs.push, prefs.email, prefs.sound, prefs.vibration], [true, false, true, false]);
  });
  test("invalid saved preferences have safe defaults", () => {
    const prefs = readPreferences('{"language":"unknown","fontSize":"huge","push":"true"}');
    assert.deepEqual([prefs.language, prefs.fontSize, prefs.push], ["pt-BR", "standard", false]);
  });
  test("account deletion requires exact confirmation", () => {
    assert.equal(canDeleteAccount("excluir", "2026-11-04T00:40:00Z", Date.parse("2026-11-04T00:42:00Z")), false);
    assert.equal(canDeleteAccount("EXCLUIR", "2026-11-04T00:40:00Z", Date.parse("2026-11-04T00:42:00Z")), true);
  });
  test("stale sessions cannot delete an account", () => {
    assert.equal(canDeleteAccount("EXCLUIR", "2026-11-04T00:00:00Z", Date.parse("2026-11-04T00:42:00Z")), false);
  });
});