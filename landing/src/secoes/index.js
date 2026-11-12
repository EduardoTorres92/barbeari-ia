// As seções de baixo do hero. Regra da casa: textos e estados entram por marco, com tempo (parar no meio nunca deixa
// nada pela metade); o que é imagem anda preso à rolagem; e toda troca que existe no hover também acontece rolando
// (a prévia é gravada rolando, sem mouse).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REDUZIDO, TOQUE, CELULAR, clamp } from '../motion/ease.js';
import { manifesto } from './manifesto.js';
import { odometro } from './odometro.js';
import { proximaCadeira } from './horario.js';

export function secoes({ lenis } = {}) {
  horario();
  cardapio();
  manifesto();
  espelhos();
  cortes();
  clube();
  loja();
  presente();
  avaliacoes();
  endereco();
  duvidas();
  rodape();
}

/* ---------- horário de verdade: status do hero e frase do fecho ---------- */
function horario() {
  const p = proximaCadeira();
  const status = document.querySelector('[data-status]');
  const ponto = document.querySelector('.hero__status .ponto');
  if (status) status.textContent = p.aberto ? `Aberto agora · próxima cadeira ${p.hora}` : `Fechado agora · abre ${p.quando} às ${p.hora}`;
  ponto?.classList.toggle('is-fechado', !p.aberto);
  const leve = document.querySelector('[data-fecho-leve]'), hora = document.querySelector('[data-fecho-hora]');
  if (leve && hora) {
    if (p.aberto) { leve.textContent = 'A cadeira fica livre'; hora.textContent = `às ${p.hora}.`; }
    else { leve.textContent = `A cadeira abre ${p.quando}`; hora.textContent = `às ${p.hora}.`; }
  }
}

/* ---------- #0 cardápio: a linha acende e a ferramenta dela segue o cursor ---------- */
function cardapio() {
  const sec = document.querySelector('.cardapio');
  const linhas = [...sec.querySelectorAll('.linha')];
  const caixa = sec.querySelector('.cardapio__ferramenta');
  const nomes = [...new Set(linhas.map((l) => l.dataset.ferramenta))];
  const imgs = Object.fromEntries(nomes.map((n) => {
    const i = new Image();
    i.src = `${import.meta.env.BASE_URL}img/ferramentas/${n}.webp`;
    i.alt = '';
    i.decoding = 'async';
    caixa.append(i);
    return [n, i];
  }));
  let ativa = -1, dentro = false, visivel = false;
  const pos = { x: 0, y: 0, vx: 0, r: 0 }, alvo = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };

  function acende(i) {
    if (i === ativa) return;
    const antes = linhas[ativa]?.dataset.ferramenta;
    ativa = i;
    linhas.forEach((l, k) => l.classList.toggle('is-ativa', k === i));
    const agora = linhas[i]?.dataset.ferramenta;
    if (antes === agora) return;
    if (antes) gsap.to(imgs[antes], { opacity: 0, scale: 0.7, rotation: -18, duration: 0.3, ease: 'pf-in', overwrite: true });
    if (agora) gsap.fromTo(imgs[agora], { opacity: 0, scale: 0.55, rotation: 22 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(1.6)', overwrite: true });
  }

  // sem o mouse por cima, acende a linha que passa pelo meio da tela
  function pelaRolagem() {
    if (dentro) return;
    const meio = innerHeight * 0.52;
    let melhor = 0, dist = 1e9;
    linhas.forEach((l, i) => { const r = l.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - meio); if (d < dist) { dist = d; melhor = i; } });
    acende(melhor);
  }

  sec.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = sec.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    const sobre = e.target.closest?.('.linha');
    dentro = !!sobre;
    if (sobre) acende(linhas.indexOf(sobre));
  });
  sec.addEventListener('pointerleave', () => { dentro = false; pelaRolagem(); });
  linhas.forEach((l, i) => l.addEventListener('focusin', () => acende(i)));
  for (const l of linhas) l.addEventListener('click', (e) => { if (!e.target.closest('button')) l.querySelector('[data-agendar]')?.click(); });

  function quadro() {
    if (!visivel) return;
    const s = caixa.offsetWidth;
    if (dentro) { alvo.x = mouse.x + 24; alvo.y = mouse.y - s * 0.62; }
    else if (linhas[ativa]) {
      const r = linhas[ativa].getBoundingClientRect(), rs = sec.getBoundingClientRect();
      if (CELULAR()) {
        // no celular ela fica pequena embaixo do número da linha acesa (a coluna do número tem espaço livre ali)
        alvo.x = r.left - rs.left - 6;
        alvo.y = r.top - rs.top + r.height - s - 8;
      } else {
        alvo.x = r.left - rs.left + r.width * 0.56;
        alvo.y = r.top - rs.top + r.height / 2 - s * 0.55;
      }
    }
    const vx = (alvo.x - pos.x) * 0.16;
    pos.x += vx; pos.y += (alvo.y - pos.y) * 0.16;
    pos.r += (clamp(vx * (CELULAR() ? 0.3 : 0.9), -22, 22) - pos.r) * 0.12;
    caixa.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${pos.r.toFixed(2)}deg)`;
  }
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(sec);
  gsap.ticker.add(quadro);
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onUpdate: pelaRolagem, onEnter: pelaRolagem });
  if (!REDUZIDO) {
    gsap.from(linhas, { opacity: 0, y: 24, duration: 0.9, ease: 'pf-out', stagger: 0.06, scrollTrigger: { trigger: sec.querySelector('.cardapio__lista'), start: 'top 85%' } });
  }
}

/* ---------- #2 espelhos: o escolhido abre e acende; rolando, a luz passa de um a um ---------- */
function espelhos() {
  const sec = document.querySelector('.espelhos');
  const fixo = sec.querySelector('.espelhos__fixo');
  const itens = [...sec.querySelectorAll('.espelho')];
  let pelaRolagem = 0, escolhido = null, sobre = null;
  const mostra = () => {
    const i = sobre ?? escolhido ?? pelaRolagem;
    itens.forEach((el, k) => { const on = k === i; el.classList.toggle('is-ativo', on); el.setAttribute('aria-selected', String(on)); });
  };
  itens.forEach((el, i) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { sobre = i; mostra(); } });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { sobre = null; mostra(); } });
    el.addEventListener('click', () => { escolhido = i; mostra(); });
    el.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const n = (i + (e.key === 'ArrowRight' ? 1 : itens.length - 1)) % itens.length;
      escolhido = n; mostra(); itens[n].focus();
    });
  });
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: () => `+=${Math.round(innerHeight * (CELULAR() ? 1.1 : 1.4))}`,
    pin: fixo, pinSpacing: true,
    onUpdate: (st) => {
      const i = Math.min(itens.length - 1, Math.floor(st.progress * itens.length * 0.999));
      if (i !== pelaRolagem) { pelaRolagem = i; escolhido = null; mostra(); }
    },
  });
  mostra();
}

/* ---------- cortes: filtro por barbeiro (FLIP) e frente/costas ---------- */
function cortes() {
  const sec = document.querySelector('.cortes');
  const filtros = [...sec.querySelectorAll('.filtro')];
  const cards = [...sec.querySelectorAll('.corte')];
  filtros.forEach((f) => f.addEventListener('click', () => {
    const valor = f.dataset.filtro;
    filtros.forEach((g) => { const on = g === f; g.classList.toggle('is-ativo', on); g.setAttribute('aria-pressed', String(on)); });
    const antes = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    cards.forEach((c) => c.classList.toggle('is-fora', valor !== 'todos' && c.dataset.barbeiro !== valor));
    cards.forEach((c) => {
      if (c.classList.contains('is-fora')) return;
      const a = antes.get(c), b = c.getBoundingClientRect();
      if (a.width === 0) { gsap.fromTo(c, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'pf-out' }); return; }
      gsap.fromTo(c, { x: a.left - b.left, y: a.top - b.top }, { x: 0, y: 0, duration: 0.75, ease: 'pf-io' });
    });
    ScrollTrigger.refresh();
  }));
  // toque: o toque vira a foto; no mouse o hover já vira (e o clique fixa)
  for (const c of cards) c.querySelector('.corte__foto').addEventListener('click', () => c.classList.toggle('is-costas'));
  if (!REDUZIDO) gsap.from(cards, { opacity: 0, y: 40, duration: 1, ease: 'pf-out', stagger: 0.08, scrollTrigger: { trigger: sec.querySelector('.cortes__grade'), start: 'top 85%' } });
  // no celular a foto de costas aparece quando o card passa pelo meio da tela (sem hover)
  if (TOQUE) for (const c of cards) ScrollTrigger.create({ trigger: c, start: 'top 45%', end: 'bottom 30%', onToggle: (st) => c.classList.toggle('is-costas', st.isActive) });
}

/* ---------- #3 clube: o leque abre preso à rolagem; a economia conta quando aparece ---------- */
function clube() {
  const sec = document.querySelector('.clube');
  const [a, b, c] = sec.querySelectorAll('.plano');
  if (!REDUZIDO && !CELULAR()) {
    gsap.timeline({ scrollTrigger: { trigger: sec.querySelector('.clube__leque'), start: 'top 95%', end: 'top 35%', scrub: true } })
      .fromTo(a, { xPercent: 38, y: 70, rotation: 0 }, { xPercent: 0, y: 0, rotation: -3.2, ease: 'none' }, 0)
      .fromTo(c, { xPercent: -38, y: 70, rotation: 0 }, { xPercent: 0, y: 0, rotation: 3.2, ease: 'none' }, 0)
      .fromTo(b, { y: 90 }, { y: 0, ease: 'none' }, 0);
  }
  const contas = [...sec.querySelectorAll('[data-conta]')];
  ScrollTrigger.create({
    trigger: sec.querySelector('.clube__leque'), start: 'top 70%', once: true,
    onEnter: () => contas.forEach((el, i) => {
      const fim = Number(el.dataset.conta), o = { v: 0 };
      gsap.to(o, { v: fim, duration: 1.6, delay: 0.25 + i * 0.12, ease: 'power3.out', onUpdate: () => { el.textContent = `R$ ${String(Math.round(o.v)).padStart(2, '0')}`; } });
    }),
  });
  for (const p of [a, c]) {
    p.addEventListener('pointerenter', () => gsap.to(p, { y: -10, duration: 0.5, ease: 'pf-out', overwrite: 'auto' }));
    p.addEventListener('pointerleave', () => gsap.to(p, { y: 0, duration: 0.6, ease: 'pf-out', overwrite: 'auto' }));
  }
}

/* ---------- #4 loja: adicionar à sacola ---------- */
function loja() {
  for (const b of document.querySelectorAll('[data-sacola]')) {
    b.addEventListener('click', () => {
      const ok = b.classList.toggle('is-ok');
      b.textContent = ok ? 'Na sacola' : 'Adicionar';
      gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' });
    });
  }
  if (!REDUZIDO) gsap.from('.produto', { opacity: 0, y: 40, duration: 1, ease: 'pf-out', stagger: 0.08, scrollTrigger: { trigger: '.loja__grade', start: 'top 85%' } });
}

/* ---------- vale-presente: o cartão assenta com a rolagem, inclina com o mouse e troca o valor como hodômetro ---------- */
function presente() {
  const sec = document.querySelector('.presente');
  const palco = sec.querySelector('.presente__palco');
  const cartao = sec.querySelector('.cartao-metal');
  const valor = sec.querySelector('.cartao-metal__valor .odometro');
  odometro(valor, '150', { instantaneo: true });
  if (!REDUZIDO) {
    gsap.fromTo(cartao, { x: '-14%', y: '38%', rotation: -9, rotationX: 22 }, { x: 0, y: 0, rotation: 0, rotationX: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 30%', scrub: true } });
    gsap.fromTo(cartao, { '--brilho': '-45%' }, { '--brilho': '45%', ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    const rx = gsap.quickTo(cartao, 'rotationY', { duration: 0.8, ease: 'pf-out' });
    const ry = gsap.quickTo(cartao, 'rotationX', { duration: 0.8, ease: 'pf-out' });
    palco.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = palco.getBoundingClientRect();
      rx(((e.clientX - r.left) / r.width - 0.5) * 16);
      ry(-((e.clientY - r.top) / r.height - 0.5) * 12);
      cartao.style.setProperty('--brilho', `${((e.clientX - r.left) / r.width - 0.5) * 80}%`);
    });
    palco.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
  const chips = [...sec.querySelectorAll('.valor')];
  chips.forEach((ch) => ch.addEventListener('click', () => {
    chips.forEach((c) => { const on = c === ch; c.classList.toggle('is-ativo', on); c.setAttribute('aria-checked', String(on)); });
    odometro(valor, ch.dataset.valor);
    gsap.fromTo(cartao, { rotationZ: -1.5 }, { rotationZ: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
  }));
  sec.querySelector('[data-presente]').addEventListener('click', () => {
    const v = chips.find((c) => c.classList.contains('is-ativo'))?.dataset.valor ?? '150';
    aviso(`Demonstração: o vale de R$ ${v} chegaria por e-mail em um minuto.`);
  });
}

/* ---------- #5 avaliações: a nota rola como hodômetro e a pilha de depoimentos gira ---------- */
function avaliacoes() {
  const sec = document.querySelector('.avaliacoes');
  const [d1, d2] = sec.querySelectorAll('.nota-grande .odometro');
  odometro(d1, '0', { instantaneo: true });
  odometro(d2, '0', { instantaneo: true });
  ScrollTrigger.create({
    trigger: sec, start: 'top 70%',
    onEnter: () => { odometro(d1, '4', { duracao: 1.5 }); setTimeout(() => odometro(d2, '9', { duracao: 1.8 }), 120); },
    onLeaveBack: () => { odometro(d1, '0', { duracao: 0.4 }); odometro(d2, '0', { duracao: 0.4 }); },
  });

  const pilha = sec.querySelector('.pilha');
  const cards = [...pilha.querySelectorAll('.depo')];
  const n = pilha.querySelector('[data-pilha-n]');
  let ordem = cards.map((_, i) => i), timer = null, vista = false;
  function arruma(animado = true) {
    ordem.forEach((ci, pos) => {
      const c = cards[ci];
      const props = { y: pos * 14, scale: 1 - pos * 0.045, rotation: pos === 0 ? 0 : (pos % 2 ? -1.6 : 1.4) * pos, opacity: pos > 2 ? 0 : 1 - pos * 0.18, zIndex: cards.length - pos };
      animado ? gsap.to(c, { ...props, duration: 0.8, ease: 'pf-out' }) : gsap.set(c, props);
      c.setAttribute('aria-hidden', String(pos !== 0));
    });
    n.textContent = `${ordem[0] + 1} / ${cards.length}`;
  }
  function proximo() {
    const topo = cards[ordem[0]];
    gsap.timeline()
      .to(topo, { y: -60, x: 80, rotation: 8, opacity: 0, duration: 0.45, ease: 'pf-in' })
      .add(() => { ordem.push(ordem.shift()); arruma(); gsap.set(topo, { x: 0 }); });
  }
  const agenda = () => { clearTimeout(timer); if (vista && !REDUZIDO) timer = setTimeout(() => { proximo(); agenda(); }, 6000); };
  pilha.querySelector('.pilha__proximo').addEventListener('click', () => { proximo(); agenda(); });
  pilha.addEventListener('pointerenter', () => clearTimeout(timer));
  pilha.addEventListener('pointerleave', agenda);
  new IntersectionObserver(([e]) => { vista = e.isIntersecting; agenda(); }).observe(pilha);
  arruma(false);
}

/* ---------- #6 endereço: hoje marcado e o caminho do metrô desenhado ---------- */
function endereco() {
  const hoje = new Date().getDay();
  for (const d of document.querySelectorAll('.horario [data-dias]')) {
    const [a, b = a] = d.dataset.dias.split('-').map(Number);
    d.classList.toggle('is-hoje', hoje >= a && hoje <= b);
  }
  const rota = document.querySelector('.mapa__rota');
  rota.setAttribute('pathLength', '1');
  if (REDUZIDO) { rota.style.strokeDashoffset = '0'; return; }
  gsap.to(rota, { strokeDashoffset: 0, duration: 1.8, ease: 'pf-io', scrollTrigger: { trigger: '.mapa', start: 'top 70%' } });
  gsap.from('.mapa__nos', { scale: 0, svgOrigin: '452 280', duration: 0.9, ease: 'back.out(2)', delay: 1.2, scrollTrigger: { trigger: '.mapa', start: 'top 70%' } });
}

/* ---------- dúvidas: acordeão com altura animada (um aberto por vez) ---------- */
function duvidas() {
  const itens = [...document.querySelectorAll('.acordeao details')];
  for (const d of itens) {
    const corpo = d.querySelector('.acordeao__corpo');
    d.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) fecha(d); else { itens.filter((o) => o.open && o !== d).forEach(fecha); abre(d); }
    });
    function abre(x) { x.open = true; gsap.fromTo(corpo, { height: 0, opacity: 0 }, { height: corpo.scrollHeight, opacity: 1, duration: 0.6, ease: 'pf-out', clearProps: 'height', onComplete: () => ScrollTrigger.refresh() }); }
    d._fecha = () => gsap.to(corpo, { height: 0, opacity: 0, duration: 0.45, ease: 'pf-io', onComplete: () => { d.open = false; gsap.set(corpo, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
  }
  function fecha(d) { d._fecha(); }
}

/* ---------- rodapé: o foco do nome segue o mouse ---------- */
function rodape() {
  const nome = document.querySelector('.rodape__nome');
  const rod = document.querySelector('.rodape');
  const mx = { v: 50, alvo: 50 };
  rod.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') mx.alvo = (e.clientX / innerWidth) * 100; });
  rod.addEventListener('pointerleave', () => { mx.alvo = 50; });
  gsap.ticker.add(() => {
    if (Math.abs(mx.alvo - mx.v) < 0.05) return;
    mx.v += (mx.alvo - mx.v) * 0.06;
    nome.style.setProperty('--mx', `${mx.v.toFixed(2)}%`);
  });
  if (!REDUZIDO) gsap.from(nome, { yPercent: 30, opacity: 0, duration: 1.4, ease: 'pf-out', scrollTrigger: { trigger: rod, start: 'top 92%' } });
}

/* ---------- aviso curto (demonstrações) ---------- */
let caixaAviso;
export function aviso(texto) {
  if (!caixaAviso) {
    caixaAviso = document.createElement('div');
    caixaAviso.className = 'aviso-flutuante mono';
    caixaAviso.setAttribute('role', 'status');
    document.body.append(caixaAviso);
  }
  caixaAviso.textContent = texto;
  gsap.killTweensOf(caixaAviso);
  gsap.timeline().fromTo(caixaAviso, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'pf-out' }).to(caixaAviso, { opacity: 0, y: 10, duration: 0.4, ease: 'pf-in' }, '+=3.2');
}
