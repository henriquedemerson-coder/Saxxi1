import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { MoneyKeypad, centsToBRL } from "@/components/saxxi/MoneyKeypad";
import { brl, useSaxxi } from "@/lib/saxxi-store";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/caixinha/$id")({
  head: () => ({ meta: [{ title: "Caixinha — SAXXI" }, { name: "description", content: "Veja despesas da caixinha e registre gastos ou estornos no SAXXI." }, { property: "og:title", content: "Caixinha — SAXXI" }, { property: "og:description", content: "Veja despesas da caixinha e registre gastos ou estornos no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CaixinhaDetail,
});

function CaixinhaDetail() {
  const { id } = useParams({ from: "/caixinha/$id" });
  const { state, gastoPorCaixinha, dispatch } = useSaxxi();
  const navigate = useNavigate();
  const cx = state.caixinhas.find((c) => c.id === id);
  const total = cx ? gastoPorCaixinha(cx.id) : 0;
  const txs = state.transacoes.filter((t) => t.caixinhaId === id && t.type === "gasto");

  const [mode, setMode] = useState<"add" | "remove">("add");
  const [cents, setCents] = useState(0);
  const [label, setLabel] = useState("");

  if (!cx) {
    return (
      <PhoneFrame>
        <ScreenHeader title="Caixinha não encontrada" back="/" />
        <div className="px-5">
          <Link to="/" className="text-primary">Voltar pra Home</Link>
        </div>
      </PhoneFrame>
    );
  }

  const valid = cents > 0;

  function handle() {
    if (!valid || !cx) return;
    if (mode === "add") {
      dispatch({ type: "ADD_GASTO", amount: cents / 100, label: label.trim() || "Gasto", caixinhaId: cx.id });
    } else {
      dispatch({ type: "REMOVE_GASTO", amount: cents / 100, label: label.trim() || cx.label, caixinhaId: cx.id });
    }
    navigate({ to: "/" });
  }

  return (
    <PhoneFrame>
      <ScreenHeader title={cx.label} subtitle="Caixinha" back="/" />

      <section className="px-5">
        <div className="rounded-3xl bg-liquid p-6 shadow-pop text-center overflow-hidden">
          <div className="text-5xl">{cx.emoji}</div>
          <p className="text-primary-foreground/80 text-xs uppercase tracking-widest font-bold mt-3">Gasto no mês</p>
          <p className="font-display font-bold text-4xl text-expense-on-primary min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`R$ ${brl(total)}`, 2.25, 12)}>R$ {brl(total)}</p>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="glass rounded-2xl p-1.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setMode("add")}
            className={
              "rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-1.5 " +
              (mode === "add" ? "bg-holo text-primary-foreground" : "text-muted-foreground")
            }
          >
            <Plus className="size-4" /> Adicionar gasto
          </button>
          <button
            onClick={() => setMode("remove")}
            className={
              "rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-1.5 " +
              (mode === "remove" ? "bg-holo text-primary-foreground" : "text-muted-foreground")
            }
          >
            <Minus className="size-4" /> Estornar
          </button>
        </div>
      </section>

      <section className="px-5 mt-4">
        <div className="glass rounded-3xl p-5 text-center overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {mode === "add" ? "Quanto gastou?" : "Quanto remover?"}
          </p>
          <p className={"font-display font-bold text-4xl mt-1 min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis " + (mode === "add" ? "text-destructive" : "text-success")} style={fitFont(`+ R$ ${centsToBRL(cents)}`, 2.25, 12)}>
            {mode === "add" ? "−" : "+"} R$ {centsToBRL(cents)}
          </p>
        </div>
      </section>

      <section className="px-5 mt-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={mode === "add" ? "O que foi? (opcional)" : "Motivo do estorno (opcional)"}
          className="w-full glass rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
        />
      </section>

      <section className="px-5 mt-4">
        <MoneyKeypad value={cents} onChange={setCents} />
      </section>

      <section className="px-5 mt-4">
        <button
          onClick={handle}
          disabled={!valid}
          className="w-full bg-holo text-primary-foreground font-display font-bold py-4 rounded-2xl shadow-pop disabled:opacity-40"
        >
          Confirmar
        </button>
      </section>

      <section className="px-5 mt-6 pb-12">
        <h2 className="font-display font-bold text-lg mb-3 px-1">Últimos gastos</h2>
        <div className="space-y-2">
          {txs.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">Nada por aqui ainda.</p>}
          {txs.map((t) => (
            <div key={t.id} className="glass rounded-2xl p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</p>
              </div>
              <p className="font-display font-bold text-destructive truncate max-w-[45%] shrink-0">− R$ {brl(t.amount)}</p>
            </div>
          ))}
        </div>
      </section>
    </PhoneFrame>
  );
}
