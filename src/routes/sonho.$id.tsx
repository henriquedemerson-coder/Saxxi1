import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { z } from "zod";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { MoneyKeypad, centsToBRL } from "@/components/saxxi/MoneyKeypad";
import { ProgressBar } from "@/components/saxxi/ProgressBar";
import { brl, useSaxxi } from "@/lib/saxxi-store";

const searchSchema = z.object({
  mode: z.enum(["guardar", "retirar"]).optional(),
});

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/sonho/$id")({
  head: () => ({ meta: [{ title: "Sonho — SAXXI" }, { name: "description", content: "Acompanhe seu sonho e guarde ou retire dinheiro no SAXXI." }, { property: "og:title", content: "Sonho — SAXXI" }, { property: "og:description", content: "Acompanhe seu sonho e guarde ou retire dinheiro no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  validateSearch: searchSchema,
  component: SonhoDetail,
});

function SonhoDetail() {
  const { id } = useParams({ from: "/sonho/$id" });
  const { mode: initial } = useSearch({ from: "/sonho/$id" });
  const { state, saldo, dispatch } = useSaxxi();
  const navigate = useNavigate();
  const sn = state.sonhos.find((s) => s.id === id);

  const [mode, setMode] = useState<"guardar" | "retirar">(initial ?? "guardar");
  const [cents, setCents] = useState(0);

  if (!sn) {
    return (
      <PhoneFrame>
        <ScreenHeader title="Sonho não encontrado" back="/metas" />
        <div className="px-5">
          <Link to="/metas" className="text-primary">Voltar</Link>
        </div>
      </PhoneFrame>
    );
  }

  const pct = Math.min(100, Math.round((sn.current / sn.target) * 100));
  const restante = Math.max(0, sn.target - sn.current);
  const valid = cents > 0 && (mode === "guardar" ? cents / 100 <= saldo : cents / 100 <= sn.current);

  function handle() {
    if (!valid || !sn) return;
    if (mode === "guardar") dispatch({ type: "GUARDAR_SONHO", sonhoId: sn.id, amount: cents / 100 });
    else dispatch({ type: "RETIRAR_SONHO", sonhoId: sn.id, amount: cents / 100 });
    navigate({ to: "/metas" });
  }

  return (
    <PhoneFrame>
      <ScreenHeader title={sn.title} subtitle={sn.tag} back="/metas" />

      <section className="px-5">
        <div className="rounded-3xl bg-liquid p-6 shadow-pop overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center text-3xl">{sn.emoji}</div>
            <div className="flex-1">
              <p className="text-primary-foreground/80 text-xs uppercase tracking-widest font-bold">Progresso</p>
              <p className="font-display font-bold text-3xl text-primary-foreground">{pct}%</p>
            </div>
          </div>
          <div className="mt-3"><ProgressBar value={pct} height={10} /></div>
          <div className="flex justify-between mt-3 text-primary-foreground/90">
            <div>
              <p className="text-[10px] uppercase tracking-widest">Tem</p>
              <p className="font-bold text-success-on-primary truncate">R$ {brl(sn.current)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest">Falta</p>
              <p className="font-bold truncate">R$ {brl(restante)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="glass rounded-2xl p-1.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setMode("guardar")}
            className={
              "rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-1.5 " +
              (mode === "guardar" ? "bg-holo text-primary-foreground" : "text-muted-foreground")
            }
          >
            <Plus className="size-4" /> Guardar
          </button>
          <button
            onClick={() => setMode("retirar")}
            className={
              "rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-1.5 " +
              (mode === "retirar" ? "bg-holo text-primary-foreground" : "text-muted-foreground")
            }
          >
            <Minus className="size-4" /> Retirar
          </button>
        </div>
      </section>

      <section className="px-5 mt-4">
        <div className="glass rounded-3xl p-5 text-center overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-muted-foreground truncate">
            {mode === "guardar" ? `Saldo livre: R$ ${brl(saldo)}` : `Disponível pra retirar: R$ ${brl(sn.current)}`}
          </p>
          <p className="font-display font-bold text-4xl text-gradient-holo mt-1 min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`+ R$ ${centsToBRL(cents)}`, 2.25, 12)}>
            {mode === "guardar" ? "+" : "−"} R$ {centsToBRL(cents)}
          </p>
          {cents > 0 && !valid && (
            <p className="text-destructive text-xs mt-2 font-semibold">
              {mode === "guardar" ? "Saldo insuficiente" : "Maior do que o disponível"}
            </p>
          )}
        </div>
      </section>

      <section className="px-5 mt-4">
        <MoneyKeypad value={cents} onChange={setCents} />
      </section>

      <section className="px-5 mt-4 pb-8">
        <button
          onClick={handle}
          disabled={!valid}
          className="w-full bg-holo text-primary-foreground font-display font-bold py-4 rounded-2xl shadow-pop disabled:opacity-40"
        >
          {mode === "guardar" ? "Guardar no sonho" : "Retirar do sonho"}
        </button>
      </section>
    </PhoneFrame>
  );
}
