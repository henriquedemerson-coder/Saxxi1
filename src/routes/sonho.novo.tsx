import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { MoneyKeypad, centsToBRL } from "@/components/saxxi/MoneyKeypad";
import { useSaxxi } from "@/lib/saxxi-store";

import { fitFont } from "@/lib/money-fit";

export const Route = createFileRoute("/sonho/novo")({
  head: () => ({ meta: [{ title: "Novo sonho — SAXXI" }, { name: "description", content: "Crie seu próximo sonho e defina sua meta de economia no SAXXI." }, { property: "og:title", content: "Novo sonho — SAXXI" }, { property: "og:description", content: "Crie seu próximo sonho e defina sua meta de economia no SAXXI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: NovoSonhoScreen,
});

const EMOJIS = ["🌴", "🎮", "🛡️", "✈️", "🏠", "🚗", "💍", "📱", "🎸", "🐶", "📚", "👟"];

function NovoSonhoScreen() {
  const { dispatch } = useSaxxi();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [emoji, setEmoji] = useState("🌴");
  const [cents, setCents] = useState(0);

  const valid = title.trim().length > 0 && cents > 0;

  function handleCreate() {
    if (!valid) return;
    dispatch({
      type: "ADD_SONHO",
      sonho: { title: title.trim(), tag: tag.trim() || "Meu sonho", emoji, target: cents / 100 },
    });
    navigate({ to: "/metas" });
  }

  return (
    <PhoneFrame>
      <ScreenHeader title="Novo sonho" subtitle="Criar" back="/metas" />

      <section className="px-5">
        <div className="rounded-3xl bg-liquid p-6 text-center shadow-pop overflow-hidden">
          <div className="text-6xl">{emoji}</div>
          <p className="font-display font-bold text-xl text-primary-foreground mt-2">{title || "Seu sonho aqui"}</p>
          <p className="text-primary-foreground/80 text-xs uppercase tracking-widest mt-1">{tag || "Tag opcional"}</p>
          <p className="font-display font-bold text-3xl text-primary-foreground mt-3 min-w-0 max-w-full overflow-hidden whitespace-nowrap text-ellipsis" style={fitFont(`R$ ${centsToBRL(cents)}`, 1.875, 14)}>R$ {centsToBRL(cents)}</p>
        </div>
      </section>

      <section className="px-5 mt-5 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do sonho (ex: iPhone novo)"
          className="w-full glass rounded-2xl px-4 py-3 outline-none"
          autoFocus
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag (ex: Aniversário 2026)"
          className="w-full glass rounded-2xl px-4 py-3 outline-none"
        />
      </section>

      <section className="px-5 mt-4">
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

      <section className="px-5 mt-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 px-1">Quanto custa?</p>
        <MoneyKeypad value={cents} onChange={setCents} />
      </section>

      <section className="px-5 mt-4 pb-8">
        <button
          onClick={handleCreate}
          disabled={!valid}
          className="w-full bg-holo text-primary-foreground font-display font-bold py-4 rounded-2xl shadow-pop disabled:opacity-40"
        >
          Criar sonho
        </button>
      </section>
    </PhoneFrame>
  );
}
