import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { GUEST_NAME_MAX, cleanGuestName, saveGuestName } from "@/lib/guest-name";

export const GUEST_KEY = "saxxi:guest";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — SAXXI" },
      { name: "description", content: "Entre na sua conta SAXXI ou continue como convidado." },
      { property: "og:title", content: "Entrar — SAXXI" },
      { property: "og:description", content: "Seu dinheiro. Suas regras. Entre ou use como convidado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginScreen,
});

const inputCls =
  "w-full h-14 rounded-2xl bg-secondary border border-border px-5 text-base text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function LoginScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [askName, setAskName] = useState(false);
  const [guestName, setGuestName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("E-mail ou senha incorretos.");
      else navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? error.message : "Conta criada! Confirme no seu e-mail pra entrar.");
    }
    setLoading(false);
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res?.error) setMsg("Não deu pra entrar agora. Tenta de novo.");
  }

  function guest(e?: React.FormEvent) {
    e?.preventDefault();
    if (!guestName.trim()) return;
    saveGuestName(guestName);
    localStorage.setItem(GUEST_KEY, "1");
    sessionStorage.setItem("saxxi:guest-session", "1");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-dvh w-full flex justify-center">
      <main className="w-full max-w-[440px] px-6 pt-14 pb-10 flex flex-col">
        <header className="flex flex-col items-center text-center">
          <div className="size-20 rounded-3xl bg-holo shadow-pop flex items-center justify-center font-display font-bold text-4xl text-primary-foreground">S</div>
          <h1 className="font-display font-bold text-4xl mt-5 tracking-tight">SAXXI</h1>
          <p className="text-muted-foreground mt-2 uppercase tracking-[0.25em] text-xs font-semibold">Seu dinheiro. Suas regras.</p>
          <p className="mt-4 text-lg font-semibold">{mode === "entrar" ? "Pronto para dominar suas finanças?" : "Bora começar sua jornada?"}</p>
        </header>

        <form onSubmit={submit} className="mt-10 space-y-4">
          <label className="block">
            <span className="sr-only">E-mail</span>
            <input type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </label>
          <div className="relative">
            <label className="block">
              <span className="sr-only">Senha</span>
              <input type={show ? "text" : "password"} required minLength={6} autoComplete={mode === "entrar" ? "current-password" : "new-password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls + " pr-14"} />
            </label>
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
                {show && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>
          {mode === "entrar" && (
            <div className="flex justify-end">
              <Link to="/recuperar-senha" className="text-sm text-muted-foreground hover:text-primary transition">Esqueci minha senha</Link>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-holo text-primary-foreground font-bold text-base shadow-pop transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60">
            {loading ? "Carregando..." : mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>
          {msg && <p role="status" className="text-sm text-center text-muted-foreground">{msg}</p>}
        </form>

        <div className="flex items-center gap-3 my-8">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Ou continue com</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <button type="button" onClick={google} style={{ background: "#FFFFFF", color: "#1F1F1F", borderColor: "#747775" }} className="w-full h-14 rounded-2xl border flex items-center justify-center gap-[10px] px-3 font-medium text-sm transition active:scale-[0.98] hover:opacity-90">
            <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continuar com Google
          </button>
          <button type="button" onClick={() => setMsg("Login com Facebook chega em breve. Usa e-mail ou Google por enquanto.")} style={{ background: "#1877F2", color: "#FFFFFF" }} className="w-full h-14 rounded-2xl flex items-center justify-center gap-[10px] px-3 font-medium text-sm transition active:scale-[0.98] hover:opacity-90">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
            Continuar com Facebook
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          {mode === "entrar" ? "Ainda não tem uma conta? " : "Já tem uma conta? "}
          <button type="button" onClick={() => { setMode(mode === "entrar" ? "criar" : "entrar"); setMsg(null); }} className="text-primary font-bold hover:underline">
            {mode === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>

        <button type="button" onClick={() => setAskName(true)} className="w-full mt-4 py-3 text-primary font-semibold uppercase tracking-wider text-sm hover:opacity-80">
          Entrar como convidado →
        </button>
      </main>
      {askName && (
        <div role="dialog" aria-modal="true" aria-labelledby="guest-title" className="fixed inset-0 z-[90] bg-overlay/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setAskName(false)}>
          <form onSubmit={guest} onClick={(e) => e.stopPropagation()} className="w-full max-w-[400px] glass rounded-3xl p-6 shadow-pop">
            <h2 id="guest-title" className="font-display font-bold text-2xl">Como você quer ser chamado?</h2>
            <p className="text-sm text-muted-foreground mt-1">Sem conta, sem enrolação. Só teu nome ou apelido.</p>
            <input autoFocus value={guestName} maxLength={GUEST_NAME_MAX} onChange={(e) => setGuestName(cleanGuestName(e.target.value))} placeholder="Nome ou apelido" aria-label="Nome ou apelido" className={inputCls + " mt-5"} />
            <p className="text-xs text-muted-foreground text-right mt-1">{guestName.length}/{GUEST_NAME_MAX}</p>
            <button type="submit" disabled={!guestName.trim()} className="w-full h-14 mt-3 rounded-2xl bg-holo text-primary-foreground font-bold text-base shadow-pop transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50">Começar</button>
            <button type="button" onClick={() => setAskName(false)} className="w-full mt-2 py-2 text-sm text-muted-foreground">Voltar</button>
          </form>
        </div>
      )}
    </div>
  );
}
