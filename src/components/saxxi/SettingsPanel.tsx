import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { Crown, Landmark, Bell, ChevronLeft, ChevronRight, CreditCard, Globe, HelpCircle, KeyRound, LogOut, Monitor, Palette, ShieldCheck, Smartphone, Trash2, UserRound, Volume2, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTheme, type ThemeColor, type ThemeMode } from "@/lib/saxxi-theme";
import { useSettings } from "@/lib/settings-provider";
import { useSaxxi } from "@/lib/saxxi-store";
import { deleteOwnAccount } from "@/lib/account.functions";
import { useGuestName } from "@/lib/guest-name";

type Page = "main" | "password" | "mfa" | "history" | "delete" | "plan" | "permissions" | "terms" | "privacy" | "help";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="py-4 border-b border-border last:border-0"><h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">{title}</h3><div className="space-y-1">{children}</div></section>;
}
function Row({ icon, label, children, onClick, danger = false, disabled = false }: { icon: ReactNode; label: string; children?: ReactNode; onClick?: () => void; danger?: boolean; disabled?: boolean }) {
  const content = <><span className={danger ? "text-destructive" : "text-primary"}>{icon}</span><span className="flex-1 min-w-0 text-left whitespace-normal">{label}</span>{children || (onClick && <ChevronRight className="size-4 text-muted-foreground" />)}</>;
  return onClick ? <Button variant="ghost" disabled={disabled} className={`w-full h-auto min-h-11 px-2 py-2 justify-start ${danger ? "text-destructive" : ""}`} onClick={onClick}>{content}</Button> : <div className="flex items-center gap-2 px-2 min-h-11 text-sm">{content}</div>;
}

export function SettingsPanel() {
  const { theme, setColor, setMode } = useTheme();
  const { preferences, update } = useSettings();
  const { state, dispatch } = useSaxxi();
  const guestName = useGuestName();
  const navigate = useNavigate();
  const deleteAccount = useServerFn(deleteOwnAccount);
  const [user, setUser] = useState<User | null>(null);
  const [accountReady, setAccountReady] = useState(false);
  const [page, setPage] = useState<Page>("main");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [factorId, setFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [mfaVerified, setMfaVerified] = useState(false);
  const english = preferences.language === "en";
  const t = (pt: string, en: string) => english ? en : pt;

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setUser(data.session?.user || null); setAccountReady(true); } }).catch(() => { if (active) setAccountReady(true); });
    supabase.auth.mfa.listFactors().then(({ data }) => { if (active) setFactorId(data?.totp.find(f => f.status === "verified")?.id || ""); });
    return () => { active = false; };
  }, []);

  function open(next: Page) { setPage(next); setMessage(""); setConfirmation(""); }
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : t("Não foi possível concluir. Tente novamente.", "Unable to complete. Try again.")); }
    finally { setBusy(false); }
  }
  async function leave() {
    await run(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem("saxxi:guest");
      await navigate({ to: "/login" });
    });
  }
  async function push(enabled: boolean) {
    if (!enabled) { update("push", false); return; }
    await run(async () => {
      if (!("Notification" in window)) throw new Error(t("Notificações não estão disponíveis neste navegador.", "Notifications are unavailable in this browser."));
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error(t("Permissão não concedida. Verifique as permissões do site.", "Permission not granted. Check site permissions."));
      update("push", true);
      setMessage(t("Preferência salva. Envio de notificações ainda não está conectado.", "Preference saved. Notification delivery is not connected yet."));
    });
  }
  async function startMfa() {
    await run(async () => {
      // Remove only unfinished factors before starting a fresh enrollment.
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      for (const factor of factors.all.filter(f => f.factor_type === "totp" && f.status === "unverified")) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw error;
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "SAXXI" });
      if (error) throw error;
      setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    });
  }
  async function verifyMfa() {
    await run(async () => {
      const id = enrollment?.id || factorId;
      if (!id) return;
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code });
      if (error) throw new Error(t("Código inválido ou expirado.", "Invalid or expired code."));
      setFactorId(id); setEnrollment(null); setCode(""); setMfaVerified(true);
      setMessage(t("Autenticação em duas etapas confirmada.", "Two-factor authentication confirmed."));
    });
  }

  const names: Record<Page, string> = {
    main: t("Configurações", "Settings"), password: t("Alterar senha", "Change password"), mfa: t("Autenticação em duas etapas", "Two-factor authentication"), history: t("Excluir histórico", "Delete history"), delete: t("Excluir conta", "Delete account"), plan: t("Seu plano", "Your plan"), permissions: t("Permissões do dispositivo", "Device permissions"), terms: t("Termos de Uso", "Terms of Use"), privacy: t("Política de Privacidade", "Privacy Policy"), help: t("Ajuda e FAQ", "Help & FAQ"),
  };
  const loginNeeded = !user;
  return <div className="min-w-0">
    {page !== "main" && <Button variant="ghost" className="px-0 mb-3" onClick={() => open("main")}><ChevronLeft />{t("Voltar", "Back")}</Button>}
    {page !== "main" && <h3 className="text-lg font-bold mb-4">{names[page]}</h3>}
    {page === "main" && <>
      <button onClick={() => navigate({ to: "/pro" })} className="w-full mb-2 rounded-2xl bg-liquid p-4 shadow-pop flex items-center gap-3 text-left text-primary-foreground transition-transform active:scale-[0.98]">
        <Crown className="size-8 text-amber shrink-0" />
        <span className="flex-1"><span className="block font-display font-bold">{state.isPro ? t("Você é SAXXI Pro 👑", "You're SAXXI Pro 👑") : t("Seja SAXXI Pro", "Go SAXXI Pro")}</span><span className="block text-xs text-primary-foreground/80">{t("Metas ilimitadas, cashback e relatórios com IA", "Unlimited goals, cashback and AI reports")}</span></span>
        <ChevronRight className="size-5" />
      </button>
      <Section title={t("Conta e perfil", "Account & profile")}>
        <div className="flex gap-3 items-center px-2 py-2">
          {user?.user_metadata.avatar_url && /^https:\/\//.test(user.user_metadata.avatar_url) ? <img src={user.user_metadata.avatar_url} alt={t("Foto de perfil", "Profile picture")} className="size-11 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="size-11 rounded-full bg-secondary flex shrink-0 items-center justify-center text-primary"><UserRound /></div>}
          <div className="min-w-0"><p className="font-semibold truncate">{user?.user_metadata.full_name || user?.user_metadata.display_name || user?.email?.split("@")[0] || guestName || t(accountReady ? "Convidado" : "Carregando…", accountReady ? "Guest" : "Loading…")}</p><p className="text-xs text-muted-foreground break-all">{user?.email || t("Dados salvos neste navegador", "Data saved in this browser")}</p></div>
        </div>
        <Row icon={<CreditCard className="size-4" />} label={t("Meu plano", "My plan")} onClick={() => open("plan")}><span className="text-xs font-bold text-primary">{state.isPro ? "PRO" : "Free"}</span><ChevronRight className="size-4" /></Row>
        <Row icon={<Landmark className="size-4" />} label={t("Contas Conectadas", "Connected accounts")} onClick={() => navigate({ to: "/bancos" })}><ChevronRight className="size-4" /></Row>
        <Row icon={<UserRound className="size-4" />} label={t(user ? "Trocar de conta" : "Entrar ou criar conta", user ? "Switch account" : "Sign in or create account")} disabled={busy} onClick={() => { void leave(); }} />
        <Row icon={<LogOut className="size-4" />} label={t(user ? "Sair" : "Sair do modo convidado", user ? "Sign out" : "Leave guest mode")} onClick={() => { void leave(); }} disabled={busy} />
      </Section>
      <Section title={t("Aparência e tema", "Appearance & theme")}>
        <Row icon={<Palette className="size-4" />} label={t("Cor principal", "Accent color")} />
        <div className="flex gap-3 pl-8 pb-3">{([{ value: "blue", pt: "Azul clássico", en: "Classic blue", swatch: "bg-theme-blue" }, { value: "green", pt: "Verde", en: "Green", swatch: "bg-theme-green" }, { value: "purple", pt: "Roxo", en: "Purple", swatch: "bg-theme-purple" }] as const).map(c => <Button key={c.value} variant="outline" size="icon" className={`rounded-full ${theme.color === c.value ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`} aria-label={t(c.pt, c.en)} title={t(c.pt, c.en)} aria-pressed={theme.color === c.value} onClick={() => setColor(c.value as ThemeColor)}><span className={`size-6 rounded-full ${c.swatch}`} /></Button>)}</div>
        <Row icon={<Monitor className="size-4" />} label={t("Tema", "Theme")}><Select value={theme.mode} onValueChange={v => setMode(v as ThemeMode)}><SelectTrigger aria-label={t("Tema", "Theme")} className="w-32"><SelectValue /></SelectTrigger><SelectContent className="z-[100]"><SelectItem value="light">{t("Claro", "Light")}</SelectItem><SelectItem value="dark">{t("Escuro", "Dark")}</SelectItem><SelectItem value="system">{t("Sistema", "System")}</SelectItem></SelectContent></Select></Row>
        <Row icon={<span className="font-bold text-sm">Aa</span>} label={t("Tamanho da fonte", "Text size")}><Select value={preferences.fontSize} onValueChange={v => update("fontSize", v === "large" ? "large" : "standard")}><SelectTrigger aria-label={t("Tamanho da fonte", "Text size")} className="w-32"><SelectValue /></SelectTrigger><SelectContent className="z-[100]"><SelectItem value="standard">{t("Padrão", "Standard")}</SelectItem><SelectItem value="large">{t("Ampliada", "Large")}</SelectItem></SelectContent></Select></Row>
      </Section>
      <Section title={t("Notificações", "Notifications")}>
        <Row icon={<Bell className="size-4" />} label="Push"><Switch aria-label="Push" disabled={busy} checked={preferences.push} onCheckedChange={v => { void push(v); }} /></Row>
        <Row icon={<Bell className="size-4" />} label="E-mail"><Switch aria-label="E-mail" checked={preferences.email} onCheckedChange={v => update("email", v)} /></Row>
        <Row icon={<Volume2 className="size-4" />} label={t("Alertas sonoros", "Sound alerts")}><Switch aria-label={t("Alertas sonoros", "Sound alerts")} checked={preferences.sound} onCheckedChange={v => update("sound", v)} /></Row>
        <Row icon={<Vibrate className="size-4" />} label={t("Vibração", "Vibration")}><Switch aria-label={t("Vibração", "Vibration")} checked={preferences.vibration} onCheckedChange={v => update("vibration", v)} /></Row>
        <p className="text-xs text-muted-foreground px-2 py-1">{t("Preferências locais; envio de push e e-mail ainda não conectado.", "Local preferences; push and email delivery are not connected yet.")}</p>
        <Row icon={<Smartphone className="size-4" />} label={t("Permissões do dispositivo", "Device permissions")} onClick={() => open("permissions")} />
      </Section>
      <Section title={t("Privacidade e segurança", "Privacy & security")}>
        <Row icon={<KeyRound className="size-4" />} label={names.password} disabled={loginNeeded} onClick={() => open("password")} />
        <Row icon={<ShieldCheck className="size-4" />} label={t("Autenticação em duas etapas", "Two-factor authentication")} disabled={loginNeeded} onClick={() => open("mfa")}><span className="text-xs text-muted-foreground">{factorId ? t("Ativa", "On") : t("Inativa", "Off")}</span><ChevronRight className="size-4" /></Row>
        <Row icon={<Trash2 className="size-4" />} label={t("Limpar cache", "Clear cache")} onClick={() => { void run(async () => { if ("caches" in window) { const keys = await caches.keys(); await Promise.all(keys.filter(key => key.startsWith("saxxi:")).map(key => caches.delete(key))); } setMessage(t("Cache temporário limpo. Saldo, metas e histórico preservados.", "Temporary cache cleared. Balance, goals and history preserved.")); }); }} />
        <Row icon={<Trash2 className="size-4" />} label={names.history} onClick={() => open("history")} danger />
        <Row icon={<Trash2 className="size-4" />} label={names.delete} disabled={loginNeeded} onClick={() => open("delete")} danger />
        {loginNeeded && <p className="text-xs text-muted-foreground px-2">{t("Entre em uma conta para gerenciar senha e segurança.", "Sign in to manage password and security.")}</p>}
      </Section>
      <Section title={t("Idioma e região", "Language & region")}>
        <Row icon={<Globe className="size-4" />} label={t("Idioma", "Language")}><Select value={preferences.language} onValueChange={v => update("language", v === "en" ? "en" : "pt-BR")}><SelectTrigger aria-label={t("Idioma", "Language")} className="w-36"><SelectValue /></SelectTrigger><SelectContent className="z-[100]"><SelectItem value="pt-BR">Português (BR)</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></Row>
        <p className="text-xs text-muted-foreground px-2">{t("Idioma das configurações. Telas financeiras: português (BR). Região: Brasil · BRL.", "Settings language. Financial screens: Portuguese (BR). Region: Brazil · BRL.")}</p>
      </Section>
      <Section title={t("Informações e suporte", "About & support")}>
        <Row icon={<HelpCircle className="size-4" />} label={names.terms} onClick={() => open("terms")} />
        <Row icon={<ShieldCheck className="size-4" />} label={names.privacy} onClick={() => open("privacy")} />
        <Row icon={<HelpCircle className="size-4" />} label={names.help} onClick={() => open("help")} />
        <p className="text-xs text-muted-foreground text-center pt-4">SAXXI · v0.1.0 · build 1 · Web</p>
      </Section>
    </>}
    {page === "password" && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void run(async () => { if (!user?.email) throw new Error(t("Conta sem e-mail disponível.", "No email is available for this account.")); const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword }); if (signInError) throw new Error(t("Senha atual incorreta. Contas sociais precisam definir uma senha por recuperação.", "Incorrect current password. Social accounts must set a password through recovery.")); const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; setPassword(""); setCurrentPassword(""); setMessage(t("Senha alterada.", "Password changed.")); }); }}><label className="block text-sm">{t("Senha atual", "Current password")}<Input type="password" autoComplete="current-password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label><label className="block text-sm">{t("Nova senha", "New password")}<Input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label><Button disabled={busy} type="submit">{t("Salvar senha", "Save password")}</Button><Button type="button" variant="link" disabled={busy || !user?.email} onClick={() => { void run(async () => { if (!user?.email) return; const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/recuperar-senha` }); if (error) throw error; setMessage(t("Confira o link de recuperação no seu e-mail.", "Check your email for the recovery link.")); }); }}>{t("Esqueci minha senha", "Forgot my password")}</Button></form>}
    {page === "mfa" && <div className="space-y-4">{!factorId && !enrollment && <><p className="text-sm text-muted-foreground">{t("Proteja sua conta com códigos de um aplicativo autenticador.", "Protect your account with codes from an authenticator app.")}</p><Button disabled={busy} onClick={() => { void startMfa(); }}>{t("Configurar autenticador", "Set up authenticator")}</Button></>}{enrollment && <><img src={enrollment.qr} alt={t("QR code do autenticador", "Authenticator QR code")} className="size-48 mx-auto bg-card rounded-lg" /><p className="text-xs text-muted-foreground">{t("Chave manual", "Manual key")}</p><code className="block text-xs break-all select-all">{enrollment.secret}</code></>}{(factorId || enrollment) && <><label className="block text-sm">{t("Código de 6 dígitos", "6-digit code")}<Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} /></label><Button disabled={busy || code.length !== 6} onClick={() => { void verifyMfa(); }}>{t("Confirmar código", "Confirm code")}</Button>{factorId && <Button variant="destructive" className="ml-2" disabled={busy || !mfaVerified} onClick={() => { void run(async () => { const { error } = await supabase.auth.mfa.unenroll({ factorId }); if (error) throw error; setFactorId(""); setMfaVerified(false); setMessage(t("Autenticação em duas etapas desativada.", "Two-factor authentication disabled.")); }); }}>{t("Desativar 2FA", "Disable 2FA")}</Button>}</>}</div>}
    {page === "history" && <div className="space-y-4"><p className="text-sm text-muted-foreground">{t("Esta ação apaga entradas, gastos e movimentações deste navegador. O saldo será zerado. Caixinhas, sonhos e seus valores guardados serão preservados. Não pode ser desfeita.", "This erases income, expenses and movements in this browser. Balance resets to zero. Categories, goals and saved goal amounts are preserved. This cannot be undone.")}</p><label className="block text-sm">{t("Digite EXCLUIR para confirmar", "Type EXCLUIR to confirm")}<Input value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label><Button variant="destructive" disabled={confirmation !== "EXCLUIR"} onClick={() => { dispatch({ type: "HYDRATE", state: { ...state, transacoes: [] } }); setConfirmation(""); setMessage(t("Histórico excluído deste navegador.", "History deleted from this browser.")); }}>{names.history}</Button></div>}
    {page === "delete" && <div className="space-y-4"><p className="text-sm text-destructive">{t("Sua conta será excluída permanentemente. Os dados financeiros deste navegador também serão removidos. Entre novamente há no máximo 10 minutos para confirmar.", "Your account will be permanently deleted. Financial data in this browser will also be removed. Sign in again within 10 minutes to confirm.")}</p>{factorId && <Button variant="outline" onClick={() => open("mfa")}>{t("Verificar código 2FA", "Verify 2FA code")}</Button>}<label className="block text-sm">{t("Digite EXCLUIR para confirmar", "Type EXCLUIR to confirm")}<Input value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => open("main")}>{t("Cancelar", "Cancel")}</Button><Button variant="destructive" disabled={busy || confirmation !== "EXCLUIR"} onClick={() => { void run(async () => { await deleteAccount({ data: { confirmation } }); localStorage.removeItem("saxxi:v1"); localStorage.removeItem("saxxi:guest"); await supabase.auth.signOut({ scope: "local" }); window.location.assign("/login"); }); }}>{names.delete}</Button></div></div>}
    {page === "plan" && <div className="space-y-3"><p className="text-xl font-bold text-primary">SAXXI {state.isPro ? "PRO" : "Free"}</p><p className="text-sm text-muted-foreground">{t("PRO liberado nesta versão. Não há assinatura paga ou cobrança ativa para gerenciar.", "PRO is unlocked in this version. There is no paid subscription or active billing to manage.")}</p></div>}
    {page === "permissions" && <div className="space-y-3 text-sm text-muted-foreground"><p>{t("A versão web não pode abrir diretamente os ajustes nativos do Android ou iOS.", "The web version cannot directly open Android or iOS system settings.")}</p><p>{t("Android: Configurações → Apps → seu navegador ou SAXXI → Notificações. iPhone: Ajustes → Notificações → SAXXI (quando instalado). No navegador, use o ícone ao lado do endereço → Permissões do site.", "Android: Settings → Apps → your browser or SAXXI → Notifications. iPhone: Settings → Notifications → SAXXI (when installed). In a browser, open the icon beside the address → Site permissions.")}</p><Button disabled={busy} onClick={() => { void push(true); }}>{t("Solicitar permissão de notificações", "Request notification permission")}</Button></div>}
    {(page === "terms" || page === "privacy") && <div className="space-y-3 text-sm text-muted-foreground"><p className="font-semibold text-foreground">{t("Informações provisórias — documentos oficiais pendentes", "Provisional information — official documents pending")}</p>{page === "terms" ? <><p>{t("SAXXI é uma ferramenta de organização financeira pessoal. Não movimenta dinheiro, não oferece crédito e não substitui orientação financeira profissional.", "SAXXI is a personal finance organizer. It does not transfer money, provide credit or replace professional financial advice.")}</p><p>{t("O PRO está liberado sem cobrança nesta versão. Os termos oficiais ainda não foram fornecidos pelo responsável pelo app.", "PRO is available at no charge in this version. Official terms have not yet been supplied by the app owner.")}</p></> : <><p>{t("Saldo, transações e metas são armazenados neste navegador. Aparência e preferências também ficam locais. Os dados não são sincronizados entre dispositivos.", "Balance, transactions and goals are stored in this browser. Appearance and preferences are also local. Data is not synchronized across devices.")}</p><p>{t("Ao entrar em uma conta, e-mail, informações de perfil e sessão são tratados pelo serviço de autenticação do Lovable Cloud. A política oficial e o contato do responsável ainda precisam ser fornecidos.", "When signing in, email, profile information and session are handled by Lovable Cloud authentication. The official policy and owner contact still need to be supplied.")}</p></>}</div>}
    {page === "help" && <div className="space-y-4 text-sm"><details><summary className="cursor-pointer font-semibold">{t("Onde meus dados ficam?", "Where is my data stored?")}</summary><p className="mt-2 text-muted-foreground">{t("Neste navegador, inclusive no modo convidado. Trocar de conta não separa o histórico local nesta versão.", "In this browser, including guest mode. Switching accounts does not separate local history in this version.")}</p></details><details><summary className="cursor-pointer font-semibold">{t("Como mudar as cores?", "How can I change colors?")}</summary><p className="mt-2 text-muted-foreground">{t("Em Aparência e tema, escolha azul, verde ou roxo. Sua escolha fica salva.", "Under Appearance & theme, choose blue, green or purple. Your choice is saved.")}</p></details><details><summary className="cursor-pointer font-semibold">{t("O PRO é pago?", "Does PRO cost anything?")}</summary><p className="mt-2 text-muted-foreground">{t("Não nesta versão. Não há cobrança ativa.", "Not in this version. There is no active billing.")}</p></details><p className="text-muted-foreground">{t("Canal de contato com suporte ainda não informado pelo responsável pelo app.", "The app owner has not yet provided a support contact.")}</p></div>}
    {message && <p role="status" className="mt-4 text-sm text-foreground break-words border-l-2 border-primary pl-3">{message}</p>}
  </div>;
}