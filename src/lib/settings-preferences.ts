export type SettingsPreferences = {
  fontSize: "standard" | "large";
  language: "pt-BR" | "en";
  push: boolean;
  email: boolean;
  sound: boolean;
  vibration: boolean;
};
export const preferencesKey = "saxxi:preferences";
export const defaultPreferences: SettingsPreferences = {
  fontSize: "standard", language: "pt-BR", push: false, email: false, sound: false, vibration: false,
};
export function readPreferences(raw: string | null): SettingsPreferences {
  try {
    const value = JSON.parse(raw || "null");
    if (!value || typeof value !== "object") return { ...defaultPreferences };
    return {
      fontSize: value.fontSize === "large" ? "large" : "standard",
      language: value.language === "en" ? "en" : "pt-BR",
      push: value.push === true, email: value.email === true,
      sound: value.sound === true, vibration: value.vibration === true,
    };
  } catch { return { ...defaultPreferences }; }
}
export function canDeleteAccount(confirmation: string, lastSignIn: string | undefined, now: number) {
  if (confirmation !== "EXCLUIR" || !lastSignIn) return false;
  const age = now - Date.parse(lastSignIn);
  return Number.isFinite(age) && age >= 0 && age <= 10 * 60 * 1000;
}