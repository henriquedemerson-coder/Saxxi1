import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Crown } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { brl, useSaxxi } from "@/lib/saxxi-store";
import { perguntarSaxxiAI } from "@/lib/ia.functions";

export const Route = createFileRoute("/ia")({
  head: () => ({
    meta: [
      { title: "SAXXI AI — Conselheiro de grana" },
      {
        name: "description",
        content: "Converse com SAXXI AI sobre seus gastos, economias e sonhos.",
      },
      { property: "og:title", content: "SAXXI AI — Conselheiro de grana" },
      {
        property: "og:description",
        content: "Converse com SAXXI AI sobre seus gastos, economias e sonhos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IAScreen,
});

type Msg = { role: "user" | "ai"; text: string };

function IAScreen() {
  const { state, saldo, totalEntradas, totalGastos, gastoPorCaixinha } = useSaxxi();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "Salve! 🤖✨ Eu sou a SAXXI AI. Manda aí: quer dicas pra economizar, entender pra onde vai sua grana, ou bater meta mais rápido? Eu olho seus números reais.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  function montarResumoFinanceiro(): string {
    const caixinhasTxt = state.caixinhas
      .map((c) => `- ${c.label}: R$ ${brl(gastoPorCaixinha(c.id))}`)
      .join("\n");
    const sonhosTxt = state.sonhos
      .map((s) => `- ${s.title}: guardado R$ ${brl(s.current)} de R$ ${brl(s.target)}`)
      .join("\n");

    return [
      `Saldo livre atual: R$ ${brl(saldo)}`,
      `Total de entradas registradas: R$ ${brl(totalEntradas)}`,
      `Total de gastos registrados: R$ ${brl(totalGastos)}`,
      `Gastos por caixinha:\n${caixinhasTxt || "Nenhuma caixinha."}`,
      `Sonhos e metas:\n${sonhosTxt || "Nenhum sonho cadastrado."}`,
    ].join("\n");
  }

  async function send() {
    const q = input.trim();
    if (!q || thinking) return;
    const historico = msgs.slice(-12);

    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    try {
      const { resposta } = await perguntarSaxxiAI({
        data: {
          pergunta: q,
          fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
          historico,
          resumoFinanceiro: montarResumoFinanceiro(),
        },
      });
      setMsgs((m) => [...m, { role: "ai", text: resposta }]);
    } catch (error) {
      console.error("Erro ao chamar SAXXI AI:", error);
      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text:
            error instanceof Error
              ? error.message
              : "Não consegui conectar à IA agora. Confira as configurações do servidor e tente novamente.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  const sugestoes = [
    "Como economizar?",
    "Pra onde vai meu dinheiro?",
    "Bater meu sonho mais rápido",
  ];

  return (
    <PhoneFrame>
      <ScreenHeader title="SAXXI AI" subtitle="Conselheiro" back="/" />

      <section className="px-5">
        <div className="rounded-3xl bg-holo p-4 shadow-pop flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-primary-foreground font-display font-bold">PRO desbloqueado</p>
              <Crown className="size-4 text-primary-foreground" />
            </div>
            <p className="text-primary-foreground/80 text-xs">
              Análise ilimitada dos seus dados reais
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5 space-y-3 min-h-[40vh]">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                (m.role === "user"
                  ? "bg-holo text-primary-foreground rounded-br-sm"
                  : "glass text-foreground rounded-bl-sm")
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3 text-sm flex gap-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:120ms]" />
              <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:240ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </section>

      <section className="px-5 mt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sugestoes.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="shrink-0 glass rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-3 pb-8 sticky bottom-0">
        <div className="glass rounded-2xl p-2 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pergunta qualquer coisa..."
            className="flex-1 bg-transparent px-3 py-2 outline-none text-sm"
          />
          <button
            onClick={send}
            disabled={!input.trim() || thinking}
            className="bg-holo text-primary-foreground size-10 rounded-xl flex items-center justify-center shadow-pop disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </section>
    </PhoneFrame>
  );
}
