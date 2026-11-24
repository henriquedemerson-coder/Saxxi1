import { createFileRoute } from "@tanstack/react-router";
import { Flame, Zap, Gift, Trophy, Lock, Check, Coffee, Target as TargetIcon } from "lucide-react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { BottomNav } from "@/components/saxxi/BottomNav";
import { Button } from "@/components/ui/button";
import { ThemeSettings } from "@/components/saxxi/ThemeSettings";
import { ProgressBar } from "@/components/saxxi/ProgressBar";
import { useGuestName, initials } from "@/lib/guest-name";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Level Up — SAXXI" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Suas missões, XP e recompensas no SAXXI." },
      { property: "og:title", content: "Level Up no SAXXI" },
      { property: "og:description", content: "Sistema de níveis, missões e recompensas pra Gen Z." },
    ],
  }),
  component: PerfilScreen,
});

type Mission = {
  title: string;
  reward: string;
  icon: typeof Coffee;
  progress: number;
  done?: boolean;
};

const missions: Mission[] = [
  { title: "Fique 3 dias sem delivery", reward: "+150 XP", icon: Coffee, progress: 66 },
  { title: "Crie uma nova caixinha", reward: "+80 XP", icon: TargetIcon, progress: 100, done: true },
  { title: "Guarde R$ 100 essa semana", reward: "+200 XP", icon: Zap, progress: 45 },
];

const rewards = [
  { brand: "Steam", desc: "10% off · jogos selecionados", color: "from-primary/40 to-accent/10", locked: false },
  { brand: "Alura", desc: "1 mês grátis · cursos tech", color: "from-primary/40 to-accent/10", locked: false },
  { brand: "iFood", desc: "R$ 15 cashback", color: "from-primary/30 to-accent/10", locked: true },
];

function PerfilScreen() {
  const level = 7;
  const xp = 1820;
  const xpNext = 2400;
  const pct = Math.round((xp / xpNext) * 100);
  const guestName = useGuestName();
  const displayName = guestName || "João Victor";

  return (
    <PhoneFrame>
      <header className="px-6 pt-8 pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Level up</p>
        <h1 className="font-display text-3xl font-bold mt-1">Tá ficando insano 🔥</h1>
      </header>

      {/* Player card */}
      <section className="px-5">
        <div className="relative rounded-[2rem] bg-liquid p-6 shadow-pop overflow-hidden">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
            backgroundImage:
              "var(--player-overlay)",
          }} />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <ThemeSettings><Button aria-label="Configurações de tema" className="size-20 p-0 border-0 rounded-3xl bg-holo flex items-center justify-center font-display font-bold text-3xl text-primary-foreground shadow-pop">
                {initials(displayName)}
              </Button></ThemeSettings>
              <div className="absolute -bottom-2 -right-2 bg-background border-2 border-primary rounded-full px-2.5 py-0.5 font-display font-bold text-sm text-primary">
                {level}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground/70 text-xs uppercase tracking-widest font-bold truncate">{displayName}</p>
              <p className="font-display font-bold text-xl text-primary-foreground">Money Hacker</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="size-3.5 text-amber" />
                <span className="text-xs text-primary-foreground/90 font-semibold">12 dias de streak</span>
              </div>
            </div>
          </div>

          <div className="relative mt-5">
            <div className="flex justify-between text-xs font-semibold text-primary-foreground/90 mb-1.5">
              <span>{xp} XP</span>
              <span>{xpNext} XP · Nível {level + 1}</span>
            </div>
            <div className="h-2.5 rounded-full bg-overlay/30 overflow-hidden">
              <div className="h-full bg-amber-grad animate-shimmer rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Missões */}
      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="font-display font-bold text-xl">Missões da semana</h2>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">3 ativas</span>
        </div>
        <div className="space-y-2.5">
          {missions.map((m) => (
            <MissionRow key={m.title} m={m} />
          ))}
        </div>
      </section>

      {/* Recompensas */}
      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Gift className="size-5 text-primary" /> Recompensas
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Parceiros</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
          {rewards.map((r) => (
            <div
              key={r.brand}
              className={
                "min-w-[200px] rounded-2xl p-4 glass shadow-card relative overflow-hidden " +
                (r.locked ? "opacity-60" : "")
              }
            >
              <div className={"absolute -top-6 -right-6 size-24 rounded-full bg-gradient-to-br " + r.color + " blur-2xl"} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <Trophy className="size-5 text-primary" />
                  {r.locked ? (
                    <Lock className="size-4 text-muted-foreground" />
                  ) : (
                    <span className="text-[10px] bg-holo text-primary-foreground font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="font-display font-bold text-lg mt-4">{r.brand}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </PhoneFrame>
  );
}

function MissionRow({ m }: { m: Mission }) {
  const Icon = m.icon;
  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={"size-11 rounded-xl flex items-center justify-center shrink-0 " + (m.done ? "bg-holo" : "bg-secondary")}>
          {m.done ? <Check className="size-5 text-primary-foreground" strokeWidth={3} /> : <Icon className="size-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className={"font-semibold truncate " + (m.done ? "line-through text-muted-foreground" : "")}>{m.title}</p>
            <span className="text-xs font-display font-bold text-gradient-holo shrink-0">{m.reward}</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={m.progress} height={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
