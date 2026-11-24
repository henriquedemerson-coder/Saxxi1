export function getCurrentTimeContext(pergunta: string, fusoHorario: string, agora = new Date()) {
  const data = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeZone: fusoHorario,
  }).format(agora);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: fusoHorario,
  }).format(agora);
  const perguntaNormalizada = pergunta
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const perguntaData =
    /\b(?:que dia e hoje|qual dia e hoje|hoje e que dia|qual(?: e)? a data(?: de hoje)?|que data e hoje|data de hoje|dia de hoje|que dia estamos)\b/.test(
      perguntaNormalizada,
    );
  const perguntaHora =
    /\b(?:que horas sao(?: agora)?|que hora e(?: agora)?|qual e o horario(?: atual)?|horario atual|hora atual)\b/.test(
      perguntaNormalizada,
    );
  const resposta = [perguntaData && `Hoje é ${data}.`, perguntaHora && `Agora são ${hora}.`]
    .filter(Boolean)
    .join(" ");

  return { data, hora, resposta: resposta || undefined };
}
