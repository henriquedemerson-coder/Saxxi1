import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, RefreshCw, ShieldCheck, Unplug, Plus } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { BANKS, useConnectedBanks } from "@/lib/saxxi-mocks";

export const Route = createFileRoute("/bancos")({
  head: () => ({ meta: [
    { title: "Contas Conectadas — SAXXI" }, { name: "description", content: "Conecte seu banco via Open Finance e deixe a SAXXI organizar seus gastos." },
    { property: "og:title", content: "Contas Conectadas — SAXXI" }, { property: "og:description", content: "Sincronização bancária segura via Open Finance." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: BancosScreen,
});

function BancosScreen() {
  const { banks, connect, disconnect, sync } = useConnectedBanks();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  return (
    <PhoneFrame>
      <ScreenHeader title="Contas Conectadas" subtitle="Open Finance" />
      <section className="px-5 space-y-4 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass rounded-2xl p-5">
          <Landmark className="size-8 text-primary" />
          <p className="font-display font-bold text-lg mt-2">Diga adeus ao preenchimento manual!</p>
          <p className="text-sm text-muted-foreground mt-1">Conecte seu banco e deixe que a SAXXI organize seus gastos automaticamente.</p>
        </div>

        <div className="rounded-2xl p-4 border border-success/40 bg-success/10 flex gap-3">
          <ShieldCheck className="size-6 text-success shrink-0" />
          <p className="text-sm"><b>Conexão segura via Open Finance.</b> A SAXXI apenas lê seus dados para organizar suas finanças. Nunca faremos movimentações na sua conta.</p>
        </div>

        <Button size="lg" className="w-full h-14 rounded-2xl font-bold shadow-pop" onClick={() => setOpen(true)}><Plus /> Conectar Novo Banco</Button>

        <h2 className="font-display font-bold text-xl pt-2">Seus bancos</h2>
        {banks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum banco conectado ainda.</p>}
        {banks.map(b => (
          <div key={b.id} className="glass rounded-2xl p-4 shadow-card animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{b.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-success font-bold">● Sincronizado · {new Date(b.lastSync).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" size="sm" className="flex-1" disabled={syncing === b.id} onClick={() => { setSyncing(b.id); setTimeout(() => { sync(b.id); setSyncing(null); toast.success(`${b.name} sincronizado`); }, 800); }}>
                <RefreshCw className={syncing === b.id ? "animate-spin" : ""} /> Forçar Sincronização
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => { disconnect(b.id); toast(`${b.name} desconectado`); }}><Unplug /> Desconectar</Button>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-center text-muted-foreground">Conexão simulada — nenhum dado bancário real é acessado.</p>
      </section>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-[440px] mx-auto z-[90]">
          <DrawerHeader><DrawerTitle>Escolha seu banco</DrawerTitle><DrawerDescription>Você será levado ao app do banco para autorizar.</DrawerDescription></DrawerHeader>
          <div className="px-4 pb-6 space-y-2 max-h-[60dvh] overflow-y-auto">
            {BANKS.map(b => {
              const on = banks.some(x => x.id === b.id);
              return (
                <button key={b.id} disabled={on} onClick={() => { connect(b); setOpen(false); toast.success(`${b.name} conectado ✅`); }}
                  className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left disabled:opacity-50 transition-transform active:scale-[0.98]">
                  <span className="text-2xl">{b.emoji}</span><span className="flex-1 font-semibold">{b.name}</span>
                  <span className="text-xs text-muted-foreground">{on ? "Conectado" : "Conectar"}</span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </PhoneFrame>
  );
}
