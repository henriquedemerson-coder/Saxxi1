/** Limite: R$ 999.999.999,99 (em centavos). */
export const MAX_CENTS = 99_999_999_999;

/** Reduz a fonte proporcionalmente quando o texto do valor fica longo. */
export function fitFont(text: string, baseRem: number, comfortable = 10) {
  const len = text.length;
  if (len <= comfortable) return undefined;
  return { fontSize: `${Math.max(baseRem * 0.45, (baseRem * comfortable) / len)}rem` };
}
