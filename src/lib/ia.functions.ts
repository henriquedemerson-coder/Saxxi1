import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentTimeContext } from "./ia-clock";

const inputSchema = z.object({
  pergunta: z.string().trim().min(1).max(2000),
  fusoHorario: z
    .string()
    .max(100)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("pt-BR", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Fuso horário inválido."),
  historico: z
    .array(
      z.object({
        role: z.enum(["user", "ai"]),
        text: z.string().max(2000),
      }),
    )
    .max(12),
  resumoFinanceiro: z.string().max(6000),
});

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function extractGroqText(payload: unknown): string | undefined {
  if (!isJsonObject(payload) || !Array.isArray(payload.choices)) return;
  const choice = payload.choices[0];
  if (!isJsonObject(choice) || !isJsonObject(choice.message)) return;
  return typeof choice.message.content === "string" ? choice.message.content.trim() : undefined;
}

function extractGeminiText(payload: unknown): string | undefined {
  if (!isJsonObject(payload) || !Array.isArray(payload.candidates)) return;
  const candidate = payload.candidates[0];
  if (
    !isJsonObject(candidate) ||
    !isJsonObject(candidate.content) ||
    !Array.isArray(candidate.content.parts)
  )
    return;
  const text = candidate.content.parts
    .filter((part): part is JsonObject => isJsonObject(part) && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
  return text || undefined;
}

export const perguntarSaxxiAI = createServerFn({ method: "POST" })
  .validator(inputSchema)
  .handler(async ({ data }) => {
    const contextoTemporal = getCurrentTimeContext(data.pergunta, data.fusoHorario);
    if (contextoTemporal.resposta) return { resposta: contextoTemporal.resposta };

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      throw new Error(
        "Configure GROQ_API_KEY e/ou GEMINI_API_KEY nas variáveis de ambiente do servidor.",
      );
    }

    const instrucaoSistema = `Você é a SAXXI AI, uma assistente geral amigável, direta e prática, com foco especial em finanças pessoais.
Responda em português do Brasil, com no máximo 3 parágrafos curtos e emojis com moderação.
Responda perguntas gerais normalmente; use os dados financeiros abaixo somente quando forem relevantes, sem forçar o assunto financeiro.
Use esta referência atual do usuário: ${contextoTemporal.data}, às ${contextoTemporal.hora} (fuso ${data.fusoHorario}). Para perguntas sobre hoje ou agora, use essa referência, nunca uma data presumida pelo seu treinamento.
Se não souber algo ou a resposta depender de informação atual que não foi fornecida (como notícias, clima ou cotações), deixe a limitação clara e não invente.
Dados financeiros do usuário:
${data.resumoFinanceiro}`;

    // Tenta Groq primeiro; se estiver indisponível, usa Gemini como alternativa.
    if (groqKey) {
      try {
        const messages = [
          { role: "system", content: instrucaoSistema },
          ...data.historico.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: data.pergunta },
        ];

        const resGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
            messages,
            temperature: 0.7,
            max_tokens: 450,
          }),
        });

        const payload: unknown = await resGroq.json();
        if (resGroq.ok) {
          const resposta = extractGroqText(payload);
          if (resposta) return { resposta };
        }
        console.warn(
          `Groq não retornou resposta válida (HTTP ${resGroq.status}); tentando Gemini.`,
        );
      } catch {
        console.warn("Falha de conexão com Groq; tentando Gemini.");
      }
    }

    if (geminiKey) {
      try {
        const contents = [
          ...data.historico.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
          { role: "user", parts: [{ text: data.pergunta }] },
        ];
        const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const resGemini = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: instrucaoSistema }] },
              contents,
            }),
          },
        );

        const payload: unknown = await resGemini.json();
        if (resGemini.ok) {
          const resposta = extractGeminiText(payload);
          if (resposta) return { resposta };
        }
        console.error(`Gemini não retornou resposta válida (HTTP ${resGemini.status}).`);
      } catch {
        console.error("Falha de conexão com Gemini.");
      }
    }

    throw new Error(
      "Não foi possível obter resposta da IA. Confira as chaves e os modelos configurados e tente novamente.",
    );
  });
