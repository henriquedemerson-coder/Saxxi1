import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Bell, TrendingUp, Plus } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { BottomNav } from "@/components/saxxi/BottomNav";
import { RingGauge } from "@/components/saxxi/RingGauge";
import { ProgressBar } from "@/components/saxxi/ProgressBar";
import { brl, useSaxxi } from "@/lib/saxxi-store";
import { Button } from "@/components/ui/button";
import { ThemeSettings } from "@/components/saxxi/ThemeSettings";
import { useGuestName, initials } from "@/lib/guest-name";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAXXI — Onde está seu dinheiro?" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Dashboard SAXXI: veja seu saldo, gastos e metas sem economês." },
      { property: "og:title", content: "SAXXI — Seu dinheiro. Suas regras." },
      { property: "og:description", content: "Dashboard gamificado de finanças pra Gen Z." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { saldo, totalEntradas, totalGastos, state, gastoPorCaixinha } = useSaxxi();
  const guestName = useGuestName();
  const sobrou = totalEntradas - totalGastos;
  const pctSaude = totalEntradas > 0 ? Math.max(0, Math.min(100, Math.round((sobrou / totalEntradas) * 100))) : 0;
  const totalCat = state.caixinhas.reduce((s, c) => s + gastoPorCaixinha(c.id), 0);

  return (
    <PhoneFrame>
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ThemeSettings><Button variant="default" aria-label="Configurações de tema" className="size-11 p-0 border-0 rounded-2xl bg-holo flex items-center justify-center font-display font-bold text-base text-primary-foreground shadow-pop">
            {initials(guestName)}
          </Button></ThemeSettings>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-widest truncate max-w-[180px]">E aí, {guestName || "João"}</p>
            <h1 className="text-lg font-bold leading-tight">Onde tá seu $?</h1>
          </div>
        </div>
        <Link to="/ia" className="glass size-11 rounded-2xl flex items-center justify-center text-foreground relative" aria-label="IA SAXXI">
          <Sparkles className="size-5 text-primary" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary animate-pulse-glow" />
        </Link>
      </header>

      {/* VC S/A — hero card (clicável → /saldo) */}
      <section className="px-5">
        <Link
          to="/saldo"
          className="block relative rounded-[2rem] p-6 bg-liquid shadow-pop overflow-hidden active:scale-[0.99] transition-transform"
        >
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{ backgroundImage: "var(--balance-overlay)" }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-[0.25em] text-primary-foreground/80 font-bold">VC S/A</span>
              <span className="text-[10px] glass rounded-full px-2.5 py-1 text-foreground font-semibold uppercase flex items-center gap-1">
                <Plus className="size-3" /> Receber
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm mt-3">Saldo livre</p>
            <p className={"font-display font-bold text-5xl tracking-tight min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis " + (saldo >= 0 ? "text-success-on-primary" : "text-expense-on-primary")} style={fitFont(`R$ ${brl(saldo)}`, 3)}>R$ {brl(saldo)}</p>

            <div className="mt-6 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-primary-foreground/70 text-xs uppercase tracking-wider">Gastou</p>
                <p className="font-bold text-expense-on-primary text-lg truncate">R$ {brl(totalGastos)}</p>
              </div>
              <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                <TrendingUp className="size-3.5 text-success" />
                <span className="text-xs font-semibold text-foreground">Toca pra adicionar grana</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-[2rem] glass p-6 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-display font-bold text-xl">Tá no flow</h2>
              <p className="text-sm text-muted-foreground">{sobrou >= 0 ? "Sobrando grana 🔥" : "Atenção: no vermelho"}</p>
            </div>
            <Link to="/grana" className="text-primary text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              Detalhes <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="flex justify-center py-2">
            <RingGauge value={pctSaude} label={`${pctSaude}%`} sub="Saúde" size={220} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Stat top={`R$ ${brl(totalEntradas)}`} bottom="Entrou" tint="text-success" />
            <Stat top={`R$ ${brl(totalGastos)}`} bottom="Saiu" tint="text-destructive" />
            <Stat top={`R$ ${brl(sobrou)}`} bottom="Sobrou" highlight tint={sobrou >= 0 ? "text-success-on-primary" : "text-expense-on-primary"} />
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="font-display font-bold text-xl">Pra onde foi</h2>
          <Link to="/adicionar" className="text-xs text-primary font-semibold uppercase tracking-wider">+ Gasto</Link>
        </div>
        <div className="space-y-2.5">
          {state.caixinhas.map((c) => {
            const amount = gastoPorCaixinha(c.id);
            const pct = totalCat > 0 ? Math.round((amount / totalCat) * 100) : 0;
            return (
              <Link
                key={c.id}
                to="/caixinha/$id"
                params={{ id: c.id }}
                className="glass rounded-2xl p-4 flex items-center gap-4 shadow-card active:scale-[0.99] transition-transform"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/10 flex items-center justify-center text-2xl border border-border">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-semibold text-foreground">{c.label}</span>
                    <span className="font-display font-bold text-destructive truncate max-w-[45%]">R$ {brl(amount)}</span>
                  </div>
                  <ProgressBar value={pct} height={6} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function Stat({ top, bottom, highlight, tint }: { top: string; bottom: string; highlight?: boolean; tint: string }) {
  return (
    <div className={"rounded-2xl px-3 py-3 text-center min-w-0 overflow-hidden " + (highlight ? "bg-holo text-primary-foreground" : "bg-secondary")}>
      <p className={"font-bold text-sm truncate " + tint} style={fitFont(top, 0.875, 11)} title={top}>{top}</p>
      <p
        className={
          "text-[10px] uppercase tracking-wider font-semibold " +
          (highlight ? "text-primary-foreground/80" : "text-muted-foreground")
        }
      >
        {bottom}
      </p>
    </div>
  );
}
