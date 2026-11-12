// O horário da casa e a próxima cadeira livre (de 20 em 20 minutos, com 20 de folga). ?hora=14:20 simula a hora
// (para gravar a prévia sempre com a casa aberta).
export const HORARIO = { 0: [10, 16], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [9, 21], 6: [9, 20] };
const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

export function agora() {
  const d = new Date();
  const h = new URLSearchParams(location.search).get('hora');
  if (h && /^\d{1,2}:\d{2}$/.test(h)) { const [a, b] = h.split(':').map(Number); d.setHours(a, b, 0, 0); }
  return d;
}

export function proximaCadeira(quando = agora()) {
  const dia = quando.getDay();
  const [abre, fecha] = HORARIO[dia];
  const min = quando.getHours() * 60 + quando.getMinutes();
  const prox = Math.ceil((min + 20) / 20) * 20;
  if (min < abre * 60) return { aberto: false, hora: fmt(abre * 60), quando: 'hoje' };
  if (prox <= fecha * 60 - 20) return { aberto: true, hora: fmt(prox), quando: 'hoje' };
  return { aberto: false, hora: fmt(HORARIO[(dia + 1) % 7][0] * 60), quando: 'amanhã' };
}
