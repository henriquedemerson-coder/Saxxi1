import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { MoneyKeypad, centsToBRL } from "@/components/saxxi/MoneyKeypad";
import { useSaxxi } from "@/lib/saxxi-store";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/adicionar")({
  head: () => ({ meta: [{ title: "Adicionar gasto — SAXXI" }, { name: "description", content: "Registre gastos e organize despesas por caixinha no SAXXI." }, { property: "og:title", content: "Adicionar gasto — SAXXI" }, { property: "og:description", content: "Registre gastos e organize despesas por caixinha no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AdicionarScreen,
});

function AdicionarScreen() {
  const { state, dispatch, saldo } = useSaxxi();
  const navigate = useNavigate();
  const [cents, setCents] = useState(0);
  const [caixinhaId, setCaixinhaId] = useState<string>(state.caixinhas[0]?.id ?? "");
  const [isOutro, setIsOutro] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [desc, setDesc] = useState("");

  const valid = cents > 0 && (isOutro ? customLabel.trim().length > 0 : caixinhaId.length > 0);

  function handleSave() {
    if (!valid) return;
    let cid = caixinhaId;
    if (isOutro) {
      const newId = customLabel.toLowerCase().replace(/\s+/g, "-").slice(0, 20) + "-" + Date.now().toString(36).slice(-4);
      dispatch({ type: "ADD_CAIXINHA", caixinha: { id: newId, label: customLabel.trim(), emoji: "🪙" } });
      cid = newId;
    }
    dispatch({ type: "ADD_GASTO", amount: cents / 100, label: desc.trim() || (isOutro ? customLabel : "Gasto"), caixinhaId: cid });
    navigate({ to: "/" });
  }

  return (
    <PhoneFrame>
      <ScreenHeader title="Pra onde foi?" subtitle="Novo gasto" back="/" />

      <section className="px-5">
        <div className="glass rounded-3xl p-6 text-center shadow-card overflow-hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Saldo livre</p>
          <p className={"text-sm font-semibold truncate " + (saldo >= 0 ? "text-success" : "text-destructive")}>R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest">Valor do gasto</p>
          <p className="font-display font-bold text-5xl text-destructive mt-2 min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`− R$ ${centsToBRL(cents)}`, 3)}>− R$ {centsToBRL(cents)}</p>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Caixinha</p>
          <Link to="/caixinha/nova" className="text-xs text-primary font-semibold flex items-center gap-1">
            <Plus className="size-3" /> Nova caixinha
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {state.caixinhas.map((c) => {
            const active = !isOutro && caixinhaId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setIsOutro(false);
                  setCaixinhaId(c.id);
                }}
                className={
                  "rounded-2xl p-3 text-center transition " +
                  (active ? "bg-holo text-primary-foreground shadow-pop" : "glass")
                }
              >
                <div className="text-2xl">{c.emoji}</div>
                <p className="text-xs font-semibold mt-1 truncate">{c.label}</p>
              </button>
            );
          })}
          <button
            onClick={() => setIsOutro(true)}
            className={
              "rounded-2xl p-3 text-center transition " +
              (isOutro ? "bg-holo text-primary-foreground shadow-pop" : "glass border-dashed")
            }
          >
            <div className="text-2xl">🪙</div>
            <p className="text-xs font-semibold mt-1">Outro</p>
          </button>
        </div>

        {isOutro && (
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Cria o nome da caixinha (ex: Pet, Academia...)"
            className="mt-3 w-full glass rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
          />
        )}

        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="O que foi? (opcional)"
          className="mt-3 w-full glass rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
        />
      </section>

      <section className="px-5 mt-5">
        <MoneyKeypad value={cents} onChange={setCents} />
      </section>

      <section className="px-5 mt-4 pb-8">
        <button
          onClick={handleSave}
          disabled={!valid}
          className="w-full bg-holo text-primary-foreground font-display font-bold py-4 rounded-2xl shadow-pop disabled:opacity-40 disabled:shadow-none"
        >
          − Registrar gasto
        </button>
      </section>
    </PhoneFrame>
  );
}
