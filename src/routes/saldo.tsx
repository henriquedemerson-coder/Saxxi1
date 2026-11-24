import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { MoneyKeypad, centsToBRL } from "@/components/saxxi/MoneyKeypad";
import { useSaxxi } from "@/lib/saxxi-store";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/saldo")({
  head: () => ({ meta: [{ title: "Receber grana — SAXXI" }, { name: "description", content: "Registre salário, freela e outras entradas no seu saldo SAXXI." }, { property: "og:title", content: "Receber grana — SAXXI" }, { property: "og:description", content: "Registre salário, freela e outras entradas no seu saldo SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: SaldoScreen,
});

const PRESETS = [
  { label: "💼 Salário", value: "Salário" },
  { label: "💻 Freela", value: "Freela" },
  { label: "🎁 Presente", value: "Presente" },
  { label: "💰 Vendi algo", value: "Venda" },
  { label: "🪙 Outro", value: "Outro" },
];

function SaldoScreen() {
  const { saldo, dispatch } = useSaxxi();
  const [cents, setCents] = useState(0);
  const [preset, setPreset] = useState("Salário");
  const [custom, setCustom] = useState("");
  const navigate = useNavigate();

  const isOutro = preset === "Outro";
  const label = isOutro ? custom.trim() || "Entrada" : preset;
  const valid = cents > 0 && (!isOutro || custom.trim().length > 0);

  function handleAdd() {
    if (!valid) return;
    dispatch({ type: "ADD_ENTRADA", amount: cents / 100, label });
    navigate({ to: "/" });
  }

  return (
    <PhoneFrame>
      <ScreenHeader title="Caiu uma grana?" subtitle="Receber" back="/" />

      <section className="px-5">
        <div className="glass rounded-3xl p-6 text-center shadow-card overflow-hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Saldo atual</p>
          <p className={"font-display font-bold text-xl mt-1 truncate " + (saldo >= 0 ? "text-success" : "text-destructive")}>
            R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-4 uppercase tracking-widest">Quanto entrou?</p>
          <p className="font-display font-bold text-5xl text-success mt-2 min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`R$ ${centsToBRL(cents)}`, 3)}>R$ {centsToBRL(cents)}</p>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={
                "shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap " +
                (preset === p.value ? "bg-holo text-primary-foreground shadow-pop" : "glass text-foreground")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        {isOutro && (
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Digite o que foi..."
            className="mt-3 w-full glass rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
          />
        )}
      </section>

      <section className="px-5 mt-5">
        <MoneyKeypad value={cents} onChange={setCents} />
      </section>

      <section className="px-5 mt-4 pb-8">
        <button
          onClick={handleAdd}
          disabled={!valid}
          className="w-full bg-holo text-primary-foreground font-display font-bold py-4 rounded-2xl shadow-pop disabled:opacity-40 disabled:shadow-none"
        >
          + Somar no saldo
        </button>
      </section>
    </PhoneFrame>
  );
}
