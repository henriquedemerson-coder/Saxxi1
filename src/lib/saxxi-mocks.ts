import { useEffect, useState } from "react";

export type Bank = { id: string; name: string; emoji: string };
export type ConnectedBank = Bank & { lastSync: string };

export const BANKS: Bank[] = [
  { id: "nubank", name: "Nubank", emoji: "💜" },
  { id: "itau", name: "Itaú", emoji: "🟠" },
  { id: "inter", name: "Inter", emoji: "🧡" },
  { id: "bb", name: "Banco do Brasil", emoji: "💛" },
  { id: "bradesco", name: "Bradesco", emoji: "❤️" },
  { id: "c6", name: "C6 Bank", emoji: "🖤" },
  { id: "santander", name: "Santander", emoji: "🔴" },
];

export const PLANS = { monthly: 19.9, yearly: 179.9 };
export function yearlyDiscount() {
  return Math.round((1 - PLANS.yearly / (PLANS.monthly * 12)) * 100);
}

const KEY = "saxxi:banks";
const seed: ConnectedBank[] = [{ ...BANKS[0], lastSync: new Date().toISOString() }];

/** Mock de bancos conectados (simulado, salvo no navegador). */
export function useConnectedBanks() {
  const [banks, setBanks] = useState<ConnectedBank[]>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setBanks(JSON.parse(raw)); } catch { /* defaults */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(banks)); } catch { /* ignore */ } }, [banks, ready]);
  return {
    banks,
    connect: (b: Bank) => setBanks(c => c.some(x => x.id === b.id) ? c : [...c, { ...b, lastSync: new Date().toISOString() }]),
    disconnect: (id: string) => setBanks(c => c.filter(x => x.id !== id)),
    sync: (id: string) => setBanks(c => c.map(x => x.id === id ? { ...x, lastSync: new Date().toISOString() } : x)),
  };
}
