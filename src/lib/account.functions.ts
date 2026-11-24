import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canDeleteAccount } from "./settings-preferences";

export const deleteOwnAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { confirmation: string }) => ({ confirmation: data.confirmation }))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.auth.getUser();
    if (error || result.user?.id !== context.userId) throw new Error("Entre novamente para excluir sua conta.");
    if (!canDeleteAccount(data.confirmation, result.user.last_sign_in_at, Date.now())) {
      throw new Error("Digite EXCLUIR e entre novamente na sua conta antes de continuar (até 10 minutos).");
    }
    const { data: factors, error: factorError } = await context.supabase.auth.mfa.listFactors();
    if (factorError) throw new Error("Não foi possível verificar a segurança da conta.");
    if (factors.all.some(factor => factor.status === "verified") && context.claims.aal !== "aal2") {
      throw new Error("Confirme seu código de autenticação em duas etapas antes de excluir.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (deleteError) throw new Error("Não foi possível excluir a conta. Tente novamente.");
    return { deleted: true };
  });