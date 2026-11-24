import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { useSaxxi } from "@/lib/saxxi-store";

export const Route = createFileRoute("/caixinha/nova")({
  head: () => ({ meta: [{ title: "Nova caixinha — SAXXI" }, { name: "description", content: "Crie uma caixinha para organizar suas despesas no SAXXI." }, { property: "og:title", content: "Nova caixinha — SAXXI" }, { property: "og:description", content: "Crie uma caixinha para organizar suas despesas no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: NovaCaixinhaScreen,
});

const EMOJIS = ["🪙", "✨", "🎮", "🍕", "👕", "🚗", "🏠", "💊", "📚", "🐶", "🎁", "✈️"];

function NovaCaixinhaScreen() {
  const { dispatch } = useSaxxi();
  const navigate = useNavigate();
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("🪙");

  const valid = label.trim().length > 0;

  function handleCreate() {
    if (!valid) return;
    const id = label.toLowerCase().replace(/\s+/g, "-").slice(0, 20) + "-" + Date.now().toString(36).slice(-4);
    dispatch({ type: "ADD_CAIXINHA", caixinha: { id, label: label.trim(), emoji } });
    navigate({ to: "/adicionar" });
  }

  return (
    <PhoneFrame>
      <ScreenHeader title="Nova caixinha" subtitle="Criar" back="/adicionar" />

      <section className="px-5">
        <div className="glass rounded-3xl p-6 text-center shadow-card">
          <div className="text-6xl">{emoji}</div>
          <p className="font-display font-bold text-2xl mt-2">{label || "Nome da caixinha"}</p>
        </div>
      </section>

      <section className="px-5 mt-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 px-1">Nome</p>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Pet, Academia, Mãe..."
          className="w-full glass rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none"
          autoFocus
        />
      </section>

      <section className="px-5 mt-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 px-1">Emoji</p>
        <div className="grid grid-cols-6 gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={
                "aspect-square rounded-2xl text-2xl flex items-center justify-center transition " +
                (emoji === e ? "bg-holo shadow-pop" : "glass")
              }
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 pb-8">
        <button
          onClick={handleCreate}
          disabled={!valid}
          className="w-full bg-holo text-primary-foreground font-display font-bold py-4 rounded-2xl shadow-pop disabled:opacity-40"
        >
          Criar caixinha
        </button>
      </section>
    </PhoneFrame>
  );
}
