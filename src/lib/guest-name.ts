import { useEffect, useState } from "react";

export const GUEST_NAME_KEY = "saxxi:guest-name";
export const GUEST_NAME_MAX = 20;
const EVT = "saxxi:guest-name";

export function cleanGuestName(v: string) {
  return v.replace(/\s+/g, " ").trimStart().slice(0, GUEST_NAME_MAX);
}

export function saveGuestName(name: string) {
  localStorage.setItem(GUEST_NAME_KEY, cleanGuestName(name).trim());
  window.dispatchEvent(new Event(EVT));
}

/** Nome do convidado, lido após hidratação e sincronizado entre telas. */
export function useGuestName() {
  const [name, setName] = useState("");
  useEffect(() => {
    const read = () => setName(localStorage.getItem(GUEST_NAME_KEY) ?? "");
    read();
    window.addEventListener(EVT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(EVT, read); window.removeEventListener("storage", read); };
  }, []);
  return name;
}

export function initials(name: string) {
  const p = name.trim().split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "JV";
}
