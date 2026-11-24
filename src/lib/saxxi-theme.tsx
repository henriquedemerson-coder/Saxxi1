import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeColor = "blue" | "green" | "purple";
export type ThemeMode = "light" | "dark" | "system";
type Theme = { color: ThemeColor; mode: ThemeMode };
const ThemeContext = createContext<{
  theme: Theme;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
} | null>(null);
const defaultTheme: Theme = { color: "blue", mode: "light" };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [ready, setReady] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("saxxi:theme") || "null");
      if (saved && ["blue", "green", "purple"].includes(saved.color) && ["light", "dark", "system"].includes(saved.mode)) {
        setTheme({ color: saved.color, mode: saved.mode });
      }
    } catch { /* Keep defaults when storage is unavailable. */ }
    setReady(true);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const sync = () => setSystemDark(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.color = theme.color;
    const mode = theme.mode === "system" ? (systemDark ? "dark" : "light") : theme.mode;
    document.documentElement.dataset.mode = mode;
    document.documentElement.classList.toggle("dark", mode === "dark");
    try { localStorage.setItem("saxxi:theme", JSON.stringify(theme)); } catch { /* Theme remains usable. */ }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    themeMeta?.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--background").trim());
  }, [theme, ready, systemDark]);
  return <ThemeContext.Provider value={{ theme, setColor: color => setTheme(t => ({ ...t, color })), setMode: mode => setTheme(t => ({ ...t, mode })) }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is required");
  return context;
}