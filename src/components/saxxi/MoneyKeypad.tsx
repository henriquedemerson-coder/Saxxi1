import { Delete } from "lucide-react";
import { MAX_CENTS } from "@/lib/money-fit";

/** Teclado numérico estilo bank-app. Valor em centavos. */
export function MoneyKeypad({
  value,
  onChange,
}: {
  value: number; // em centavos
  onChange: (v: number) => void;
}) {
  const press = (k: string) => {
    if (k === "del") return onChange(Math.floor(value / 10));
    const next = k === "00" ? value * 100 : value * 10 + Number(k);
    if (next <= MAX_CENTS) onChange(next);
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => press(k)}
          className="glass rounded-2xl py-4 font-display font-bold text-xl active:scale-95 transition-transform flex items-center justify-center"
        >
          {k === "del" ? <Delete className="size-5" /> : k}
        </button>
      ))}
    </div>
  );
}

export function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
