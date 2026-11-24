import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Target, Trophy, Wallet, Plus } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/grana", label: "Grana", icon: Wallet },
  { to: "/metas", label: "Caixinhas", icon: Target },
  { to: "/perfil", label: "Level Up", icon: Trophy },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Floating central + button */}
      <Link
        to="/adicionar"
        aria-label="Adicionar gasto"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] size-16 rounded-full bg-holo flex items-center justify-center shadow-pop animate-pulse-glow"
      >
        <Plus className="size-7 text-primary-foreground" strokeWidth={3} />
      </Link>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 pb-4 pt-2 z-50">
        <div className="glass rounded-3xl shadow-pop grid grid-cols-4 items-center py-2 px-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-all"
              >
                <div
                  className={
                    active
                      ? "bg-holo text-primary-foreground rounded-2xl px-4 py-2 shadow-pop"
                      : "text-muted-foreground px-4 py-2"
                  }
                >
                  <Icon className="size-5" strokeWidth={2.4} />
                </div>
                <span
                  className={
                    "text-[10px] font-semibold tracking-wide uppercase " +
                    (active ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
