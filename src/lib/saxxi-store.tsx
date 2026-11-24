import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type Caixinha = { id: string; label: string; emoji: string };
export type Sonho = { id: string; title: string; emoji: string; current: number; target: number; tag: string };
export type Transacao = {
  id: string;
  type: "entrada" | "gasto" | "guardar" | "retirar";
  amount: number;
  label: string;
  caixinhaId?: string;
  sonhoId?: string;
  date: string;
};

export type State = {
  caixinhas: Caixinha[];
  sonhos: Sonho[];
  transacoes: Transacao[];
  isPro: boolean;
};

type Action =
  | { type: "HYDRATE"; state: State }
  | { type: "ADD_ENTRADA"; amount: number; label: string }
  | { type: "ADD_GASTO"; amount: number; label: string; caixinhaId: string }
  | { type: "REMOVE_GASTO"; amount: number; label: string; caixinhaId: string } // estorno
  | { type: "ADD_CAIXINHA"; caixinha: Caixinha }
  | { type: "ADD_SONHO"; sonho: Omit<Sonho, "id" | "current"> & { current?: number } }
  | { type: "GUARDAR_SONHO"; sonhoId: string; amount: number }
  | { type: "RETIRAR_SONHO"; sonhoId: string; amount: number }
  | { type: "SET_PRO"; value: boolean };

const STORAGE_KEY = "saxxi:v1";

const initial: State = {
  isPro: true,
  caixinhas: [
    { id: "role", label: "Rolê", emoji: "✨" },
    { id: "games", label: "Setup / Games", emoji: "🎮" },
    { id: "comida", label: "Comida", emoji: "🍕" },
    { id: "roupas", label: "Roupas", emoji: "👕" },
  ],
  sonhos: [
    { id: "viagem", title: "Viagem com os amigos", emoji: "🌴", current: 1240, target: 3500, tag: "Verão 2026" },
    { id: "pc", title: "PC Gamer novo", emoji: "🎮", current: 4820, target: 8000, tag: "Setup dos sonhos" },
    { id: "reserva", title: "Reserva de Emergência", emoji: "🛡️", current: 2100, target: 6000, tag: "Você no controle" },
  ],
  transacoes: [
    { id: "t1", type: "entrada", amount: 3200, label: "Salário", date: new Date().toISOString() },
    { id: "t2", type: "gasto", amount: 487.9, label: "Balada", caixinhaId: "role", date: new Date().toISOString() },
    { id: "t3", type: "gasto", amount: 312, label: "Jogo novo", caixinhaId: "games", date: new Date().toISOString() },
    { id: "t4", type: "gasto", amount: 268.5, label: "iFood", caixinhaId: "comida", date: new Date().toISOString() },
    { id: "t5", type: "gasto", amount: 215, label: "Tênis", caixinhaId: "roupas", date: new Date().toISOString() },
  ],
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "HYDRATE":
      return a.state;
    case "ADD_ENTRADA":
      return {
        ...state,
        transacoes: [
          { id: uid(), type: "entrada", amount: a.amount, label: a.label, date: new Date().toISOString() },
          ...state.transacoes,
        ],
      };
    case "ADD_GASTO":
      return {
        ...state,
        transacoes: [
          {
            id: uid(),
            type: "gasto",
            amount: a.amount,
            label: a.label,
            caixinhaId: a.caixinhaId,
            date: new Date().toISOString(),
          },
          ...state.transacoes,
        ],
      };
    case "REMOVE_GASTO":
      // estorno = entrada negativa de gasto
      return {
        ...state,
        transacoes: [
          {
            id: uid(),
            type: "entrada",
            amount: a.amount,
            label: `Estorno: ${a.label}`,
            date: new Date().toISOString(),
          },
          ...state.transacoes,
        ],
      };
    case "ADD_CAIXINHA":
      return { ...state, caixinhas: [...state.caixinhas, a.caixinha] };
    case "ADD_SONHO":
      return {
        ...state,
        sonhos: [
          ...state.sonhos,
          { id: uid(), current: a.sonho.current ?? 0, title: a.sonho.title, emoji: a.sonho.emoji, target: a.sonho.target, tag: a.sonho.tag },
        ],
      };
    case "GUARDAR_SONHO":
      return {
        ...state,
        sonhos: state.sonhos.map((s) => (s.id === a.sonhoId ? { ...s, current: s.current + a.amount } : s)),
        transacoes: [
          { id: uid(), type: "guardar", amount: a.amount, label: "Guardado no sonho", sonhoId: a.sonhoId, date: new Date().toISOString() },
          ...state.transacoes,
        ],
      };
    case "RETIRAR_SONHO":
      return {
        ...state,
        sonhos: state.sonhos.map((s) => (s.id === a.sonhoId ? { ...s, current: Math.max(0, s.current - a.amount) } : s)),
        transacoes: [
          { id: uid(), type: "retirar", amount: a.amount, label: "Retirado do sonho", sonhoId: a.sonhoId, date: new Date().toISOString() },
          ...state.transacoes,
        ],
      };
    case "SET_PRO":
      return { ...state, isPro: a.value };
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  saldo: number;
  totalEntradas: number;
  totalGastos: number;
  totalGuardado: number;
  gastoPorCaixinha: (id: string) => number;
};

const SaxxiCtx = createContext<Ctx | null>(null);

export function SaxxiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as State });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  // cloud sync for signed-in users (guests stay local only)
  const userRef = useRef<string | null>(null);
  const loadedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const load = async (uidv: string | null) => {
      userRef.current = uidv;
      loadedRef.current = false;
      if (!uidv) return;
      const { data } = await supabase.from("user_finances").select("data").eq("user_id", uidv).maybeSingle();
      if (data?.data) dispatch({ type: "HYDRATE", state: data.data as unknown as State });
      else await supabase.from("user_finances").upsert({
        user_id: uidv, data: stateRef.current as unknown as Json, updated_at: new Date().toISOString(),
      });
      loadedRef.current = true;
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uidv = userRef.current;
    if (!uidv || !loadedRef.current) return;
    const t = setTimeout(() => {
      supabase.from("user_finances").upsert({
        user_id: uidv, data: state as unknown as Json, updated_at: new Date().toISOString(),
      });
    }, 600);
    return () => clearTimeout(t);
  }, [state]);

  const value = useMemo<Ctx>(() => {
    const totalEntradas = state.transacoes.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
    const totalGastos = state.transacoes.filter((t) => t.type === "gasto").reduce((s, t) => s + t.amount, 0);
    const totalGuardado = state.transacoes.filter((t) => t.type === "guardar").reduce((s, t) => s + t.amount, 0);
    const totalRetirado = state.transacoes.filter((t) => t.type === "retirar").reduce((s, t) => s + t.amount, 0);
    const saldo = totalEntradas - totalGastos - totalGuardado + totalRetirado;
    return {
      state,
      dispatch,
      saldo,
      totalEntradas,
      totalGastos,
      totalGuardado,
      gastoPorCaixinha: (id: string) =>
        state.transacoes.filter((t) => t.type === "gasto" && t.caixinhaId === id).reduce((s, t) => s + t.amount, 0),
    };
  }, [state]);

  return <SaxxiCtx.Provider value={value}>{children}</SaxxiCtx.Provider>;
}

export function useSaxxi() {
  const ctx = useContext(SaxxiCtx);
  if (!ctx) throw new Error("useSaxxi must be used inside SaxxiProvider");
  return ctx;
}

export function brl(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
