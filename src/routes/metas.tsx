import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { BottomNav } from "@/components/saxxi/BottomNav";
import { ProgressBar } from "@/components/saxxi/ProgressBar";
import { brl, useSaxxi } from "@/lib/saxxi-store";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Caixinhas — SAXXI" }, { property: "og:title", content: "Caixinhas — SAXXI" }, { property: "og:description", content: "Crie sonhos e acompanhe suas economias no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Crie caixinhas pros seus sonhos e veja o progresso de forma gamificada." },
    ],
  }),
  component: MetasScreen,
});

function MetasScreen() {
  const { state } = useSaxxi();
  const totalGuardado = state.sonhos.reduce((s, m) => s + m.current, 0);

  return (
    <PhoneFrame>
      <header className="px-6 pt-8 pb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Sonhos</p>
        <h1 className="font-display text-3xl font-bold mt-1">
          Sonhos com<br />endereço 📦
        </h1>
      </header>

      <section className="px-5">
        <div className="rounded-[2rem] bg-holo p-6 shadow-pop relative overflow-hidden">
          <Sparkles className="absolute -top-2 -right-2 size-24 text-primary-foreground/10" />
          <p className="text-primary-foreground/80 text-xs uppercase tracking-widest font-bold">Total guardado</p>
          <p className="font-display font-bold text-4xl text-success-on-primary mt-1 min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`R$ ${brl(totalGuardado)}`, 2.25, 12)}>R$ {brl(totalGuardado)}</p>
          <p className="text-primary-foreground/80 text-sm mt-2">{state.sonhos.length} sonhos ativos</p>
        </div>
      </section>

      <section className="px-5 mt-4">
        <Link
          to="/sonho/novo"
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-primary/5 transition"
        >
          <div className="size-12 rounded-xl bg-holo flex items-center justify-center shadow-pop">
            <Plus className="size-5 text-primary-foreground" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <p className="font-bold">Criar novo sonho</p>
            <p className="text-xs text-muted-foreground">Em 3 toques. Sem burocracia.</p>
          </div>
          <span className="text-primary text-xl">→</span>
        </Link>
      </section>

      <section className="px-5 mt-6 space-y-3">
        {state.sonhos.map((m) => {
          const pct = Math.round((m.current / m.target) * 100);
          const restante = Math.max(0, m.target - m.current);
          return (
            <article key={m.id} className="glass rounded-3xl p-5 shadow-card relative overflow-hidden">
              <div className="absolute -top-8 -right-8 size-32 rounded-full bg-holo opacity-20 blur-2xl" />
              <div className="relative">
                <div className="flex items-start gap-3 mb-4">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/10 flex items-center justify-center text-3xl border border-border">
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{m.tag}</span>
                    <h3 className="font-display font-bold text-lg leading-tight">{m.title}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-2xl text-gradient-holo">{pct}%</p>
                  </div>
                </div>

                <ProgressBar value={Math.min(100, pct)} height={12} />

                <div className="flex items-center justify-between mt-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Já tem</p>
                    <p className="font-bold text-success truncate">R$ {brl(m.current)}</p>
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Falta</p>
                    <p className="font-bold text-primary truncate">R$ {brl(restante)}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    to="/sonho/$id"
                    params={{ id: m.id }}
                    search={{ mode: "guardar" }}
                    className="flex-1 text-center bg-holo text-primary-foreground font-bold py-2.5 rounded-xl text-sm shadow-pop"
                  >
                    + Guardar
                  </Link>
                  <Link
                    to="/sonho/$id"
                    params={{ id: m.id }}
                    search={{ mode: "retirar" }}
                    className="px-4 py-2.5 glass rounded-xl text-sm font-semibold"
                  >
                    Retirar
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}
