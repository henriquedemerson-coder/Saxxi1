import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function ScreenHeader({
  title,
  subtitle,
  back = "/",
}: {
  title: string;
  subtitle?: string;
  back?: string;
}) {
  return (
    <header className="px-5 pt-8 pb-4 flex items-center gap-3">
      <Link
        to={back}
        className="glass size-11 rounded-2xl flex items-center justify-center"
        aria-label="Voltar"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <div className="flex-1 min-w-0">
        {subtitle && <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold">{subtitle}</p>}
        <h1 className="font-display text-2xl font-bold leading-tight">{title}</h1>
      </div>
    </header>
  );
}
