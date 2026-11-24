import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { getCurrentTimeContext } from "./ia-clock.ts";

describe("IA current date and time", () => {
  const now = new Date("2026-01-03T03:30:00.000Z");

  test("answers the current day using the user's timezone", () => {
    const result = getCurrentTimeContext("Que dia é hoje?", "America/Sao_Paulo", now);

    assert.match(result.resposta ?? "", /sábado, 3 de janeiro de 2026/i);
  });

  test("answers the current time without relying on the model", () => {
    const result = getCurrentTimeContext("Que horas são agora?", "America/Sao_Paulo", now);

    assert.equal(result.resposta, "Agora são 00:30.");
  });

  test("answers date and time together", () => {
    const result = getCurrentTimeContext(
      "Que dia é hoje e que horas são?",
      "America/Sao_Paulo",
      now,
    );

    assert.match(result.resposta ?? "", /Hoje é sábado, 3 de janeiro de 2026\./i);
    assert.match(result.resposta ?? "", /Agora são 00:30\./);
  });

  test("leaves unrelated questions for the AI provider", () => {
    const result = getCurrentTimeContext("Qual é a capital do Japão?", "America/Sao_Paulo", now);

    assert.equal(result.resposta, undefined);
  });
});
