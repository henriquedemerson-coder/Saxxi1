import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { brl, useSaxxi } from "@/lib/saxxi-store";
import { PLANS, yearlyDiscount } from "@/lib/saxxi-mocks";

export const Route = createFileRoute("/pro")({
  head: () => ({ meta: [
    { title: "SAXXI Pro — Planos" }, { name: "description", content: "Assine o SAXXI Pro: metas ilimitadas, cashback e relatórios com IA." },
    { property: "og:title", content: "SAXXI Pro" }, { property: "og:description", content: "Metas ilimitadas, cashback exclusivo e relatórios com IA." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProScreen,
});

const perks = ["Metas ilimitadas", "Cashback exclusivo com parceiros", "Relatórios avançados gerados por IA", "SAXXI AI sem limites"];

function ProScreen() {
  const { state, dispatch } = useSaxxi();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(true);
  const [busy, setBusy] = useState(false);
  const price = yearly ? PLANS.yearly : PLANS.monthly;

  const subscribe = () => {
    setBusy(true);
    // Compra simulada (sem cobrança real)
    setTimeout(() => {
      dispatch({ type: "SET_PRO", value: true });
      setBusy(false);
      toast.success("Bem-vindo ao SAXXI Pro! 👑 (compra simulada)");
      navigate({ to: "/" });
    }, 900);
  };

  return (
    <PhoneFrame>
      <ScreenHeader title="SAXXI Pro" subtitle="Sobe de nível" />
      <section className="px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[2rem] bg-liquid p-6 shadow-pop text-primary-foreground text-center">
          <Crown className="size-12 mx-auto text-amber" />
          <h2 className="font-display text-2xl font-bold mt-2">Desbloqueia tudo</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">Menos planilha, mais conquista.</p>
        </div>

        <div className="glass rounded-2xl p-4 mt-5 flex items-center justify-between">
          <span className={!yearly ? "font-bold" : "text-muted-foreground"}>Mensal</span>
          <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Plano anual" />
          <span className={yearly ? "font-bold" : "text-muted-foreground"}>
            Anual <span className="ml-1 text-xs bg-success text-primary-foreground rounded-full px-2 py-0.5">-{yearlyDiscount()}%</span>
          </span>
        </div>

        <div className="text-center mt-5">
          <p className="font-display text-4xl font-bold">R$ {brl(price)}</p>
          <p className="text-sm text-muted-foreground">{yearly ? `por ano · R$ ${brl(PLANS.yearly / 12)}/mês` : "por mês"}</p>
        </div>

        <ul className="mt-5 space-y-2">
          {perks.map(p => (
            <li key={p} className="glass rounded-xl p-3 flex items-center gap-3">
              <span className="size-7 rounded-full bg-holo flex items-center justify-center"><Check className="size-4 text-primary-foreground" strokeWidth={3} /></span>
              <span className="font-semibold">{p}</span>
            </li>
          ))}
        </ul>

        <Button size="lg" className="w-full h-14 mt-6 text-lg font-bold rounded-2xl shadow-pop" disabled={busy} onClick={subscribe}>
          {busy ? "Processando…" : state.isPro ? "Você já é Pro 👑 · Renovar" : "Assinar Agora"}
        </Button>
        <p className="text-[11px] text-center text-muted-foreground mt-2">Pagamento simulado — nenhuma cobrança real.</p>

        <div className="flex justify-center gap-6 mt-4 mb-8 text-xs text-muted-foreground">
          <button className="underline" onClick={() => toast(state.isPro ? "Compra restaurada ✅" : "Nenhuma compra encontrada")}>Restaurar Compra</button>
          <button className="underline" onClick={() => toast("Renovação automática; cancele quando quiser.")}>Termos de Assinatura</button>
        </div>
      </section>
    </PhoneFrame>
  );
}
