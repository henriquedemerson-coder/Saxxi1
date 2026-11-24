import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Bookmark, Undo2 } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { BottomNav } from "@/components/saxxi/BottomNav";
import { brl, useSaxxi } from "@/lib/saxxi-store";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/grana")({
  head: () => ({ meta: [{ title: "Grana — SAXXI" }, { name: "description", content: "Acompanhe seu saldo, entradas, despesas e histórico no SAXXI." }, { property: "og:title", content: "Grana — SAXXI" }, { property: "og:description", content: "Acompanhe seu saldo, entradas, despesas e histórico no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: GranaScreen,
});

function GranaScreen() {
  const { state, saldo, totalEntradas, totalGastos } = useSaxxi();

  return (
    <PhoneFrame>
      <header className="px-6 pt-8 pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Grana</p>
        <h1 className="font-display text-3xl font-bold mt-1">Tudo que rolou 💸</h1>
      </header>

      <section className="px-5 grid grid-cols-2 gap-2.5">
        <Link to="/saldo" className="glass rounded-2xl p-4 active:scale-[0.99] transition min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-success">
            <ArrowDownLeft className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Entrou</span>
          </div>
          <p className="font-display font-bold text-2xl mt-1 text-success min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`R$ ${brl(totalEntradas)}`, 1.5, 9)}>R$ {brl(totalEntradas)}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">+ Adicionar</p>
        </Link>
        <Link to="/adicionar" className="glass rounded-2xl p-4 active:scale-[0.99] transition min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-destructive">
            <ArrowUpRight className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Saiu</span>
          </div>
          <p className="font-display font-bold text-2xl mt-1 text-destructive min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`R$ ${brl(totalGastos)}`, 1.5, 9)}>R$ {brl(totalGastos)}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">+ Gasto</p>
        </Link>
      </section>

      <section className="px-5 mt-4">
        <div className="rounded-2xl bg-liquid p-4 shadow-pop overflow-hidden">
          <p className="text-primary-foreground/80 text-xs uppercase tracking-widest font-bold">Saldo livre</p>
          <p className={"font-display font-bold text-3xl min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis " + (saldo >= 0 ? "text-success-on-primary" : "text-expense-on-primary")} style={fitFont(`R$ ${brl(saldo)}`, 1.875, 16)}>R$ {brl(saldo)}</p>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-display font-bold text-xl mb-3 px-1">Histórico</h2>
        <div className="space-y-2">
          {state.transacoes.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nada por aqui ainda. Bora movimentar?</p>
          )}
          {state.transacoes.map((t) => {
            const isOut = t.type === "gasto" || t.type === "guardar";
            const cx = state.caixinhas.find((c) => c.id === t.caixinhaId);
            const sn = state.sonhos.find((s) => s.id === t.sonhoId);
            const Icon =
              t.type === "guardar" ? Bookmark : t.type === "retirar" ? Undo2 : isOut ? ArrowUpRight : ArrowDownLeft;
            const tint = t.type === "guardar" ? "text-primary" : isOut ? "text-destructive" : "text-success";
            return (
              <div key={t.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
                <div className={"size-10 rounded-xl bg-secondary flex items-center justify-center " + tint}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {cx?.label || sn?.title || t.type.toUpperCase()} ·{" "}
                    {new Date(t.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className={"font-display font-bold truncate max-w-[45%] shrink-0 " + tint}>
                  {isOut ? "−" : "+"} R$ {brl(t.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
