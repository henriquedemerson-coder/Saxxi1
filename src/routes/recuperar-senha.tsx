import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/saxxi/PhoneFrame";
import { ScreenHeader } from "@/components/saxxi/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar senha — SAXXI" }, { name: "description", content: "Defina uma nova senha para sua conta SAXXI." }, { property: "og:title", content: "Recuperar senha — SAXXI" }, { property: "og:description", content: "Recupere o acesso à sua conta SAXXI com segurança." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: RecoveryScreen,
});

function RecoveryScreen() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange(event => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <PhoneFrame><ScreenHeader title="Recuperar senha" back="/login" /><form className="px-5 space-y-4" onSubmit={async e => { e.preventDefault(); setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? "Não foi possível alterar sua senha. Solicite um novo link." : "Senha alterada! Você já pode entrar com sua nova senha."); setPassword(""); setBusy(false); }}>
    {ready ? <><label className="block text-sm">Nova senha<Input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label><Button disabled={busy} type="submit">Salvar nova senha</Button></> : <p className="text-muted-foreground text-sm">Abra o link de recuperação enviado ao seu e-mail para continuar.</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </form></PhoneFrame>;
}