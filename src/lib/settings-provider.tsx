import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultPreferences, preferencesKey, readPreferences, type SettingsPreferences } from "./settings-preferences";

const SettingsContext = createContext<{
  preferences: SettingsPreferences;
  update: <K extends keyof SettingsPreferences>(key: K, value: SettingsPreferences[K]) => void;
} | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setPreferences(readPreferences(localStorage.getItem(preferencesKey))); } catch { /* Use defaults. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(preferencesKey, JSON.stringify(preferences)); } catch { /* Session-only preferences. */ }
    document.documentElement.dataset.fontSize = preferences.fontSize;
  }, [preferences, ready]);
  return <SettingsContext.Provider value={{ preferences, update: (key, value) => setPreferences(current => ({ ...current, [key]: value })) }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("SettingsProvider is required");
  return value;
}