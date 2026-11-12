// A abertura é o próprio hero no primeiro estado: o cabelo em macro, o nome no meio e o pente fino passando, com cada
// dente deixando um fio de luz (a marca). Os fios brilham, o cabelo apaga de baixo para cima, a cadeira aparece no
// escuro, as duas metades do nome vão para os cantos e o canhão de luz acende tudo. ~3,8 s; rolar ou "Pular" acelera.
import gsap from 'gsap';
import { REDUZIDO, CELULAR, unidade } from './ease.js';

const NS = 'http://www.w3.org/2000/svg';
const DENTES = [-3, -2, -1, 0, 1, 2, 3];

export function abertura({ lenis, cena, aoTerminar }) {
  const html = document.documentElement;
  const fixo = document.querySelector('.hero__fixo');
  const cabelo = fixo.querySelector('.hero__cabelo');
  const focoCss = fixo.querySelector('.hero__foco');
  const trilha = fixo.querySelector('.hero__trilha');
  const pente = fixo.querySelector('.hero__pente');
  const p1 = fixo.querySelector('.hero__p--1');
  const p2 = fixo.querySelector('.hero__p--2');
  const ui = [...document.querySelectorAll('[data-ui]')];
  const nav = document.querySelector('.nav');
  const contador = fixo.querySelector('[data-contador]');
  const pular = fixo.querySelector('.abertura__pular');
  const cantos = fixo.querySelector('.abertura__ui');
  const frase = fixo.querySelector('.hero__frase');
  const gl = fixo.querySelector('.hero__gl');

  // a frase do canto entra digitada: cada letra num span
  const letras = [];
  for (const parte of frase.children) {
    const txt = parte.textContent;
    parte.textContent = '';
    parte.setAttribute('aria-label', txt);
    for (const ch of txt) {
      const s = document.createElement('span');
      s.className = 'letra';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      parte.append(s);
      letras.push(s);
    }
  }

  function estadoFinal() {
    html.classList.remove('abertura-on');
    html.classList.add('abertura-fim');
    gsap.set([p1, p2], { clearProps: 'transform,opacity' });
    gsap.set([p1, p2], { '--luz': 1 });
    gsap.set(ui, { opacity: 1, y: 0 });
    gsap.set(letras, { opacity: 1 });
    gsap.set(nav, { opacity: 1, y: 0 });
    gsap.set(focoCss, { opacity: 1 });
    cabelo.classList.add('is-sopro');
    gsap.set(cabelo, { opacity: 0.09, clearProps: 'webkitMaskImage,maskImage,filter' });
    trilha.innerHTML = '';
    pente.style.opacity = 0;
    Object.assign(cena.e, { luz: 1, contorno: 1, chao: 1, poeira: 1 });
    lenis?.start();
    aoTerminar?.();
  }

  if (REDUZIDO || !html.classList.contains('abertura-on')) { estadoFinal(); return; }
  window.__aberturaViva = true;
  lenis?.stop();
  scrollTo(0, 0);

  // ---- espera o que a abertura mostra: as duas fontes do nome, o cabelo e o pente ----
  const img = (src) => new Promise((ok) => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(ok) : ok()); i.src = src; });
  const fontes = Promise.all([
    document.fonts.load('200 100px "Unbounded Variable"'),
    document.fonts.load('800 100px "Unbounded Variable"'),
  ]).catch(() => {});
  const tempo = (ms) => new Promise((ok) => setTimeout(ok, ms));
  Promise.race([Promise.all([fontes, img(getComputedStyle(cabelo).backgroundImage.slice(5, -2) || `${import.meta.env.BASE_URL}img/cabelo.webp`), img(pente.src)]), tempo(2500)]).then(comecar);

  function comecar() {
    const W = fixo.clientWidth, H = fixo.clientHeight, u = unidade(W, H);
    const cel = CELULAR();

    // ---- as metades do nome saem do centro (abertura) para os cantos (hero): FLIP ----
    const caixa = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; };
    const a = caixa(p1), b = caixa(p2);
    const s1 = Math.min((cel ? 0.84 : 0.58) * W / a.w, 1.4);
    const s2 = Math.min((cel ? 0.66 : 0.44) * W / b.w, 1.4);
    const y1 = H * (cel ? 0.36 : 0.32), y2 = H * (cel ? 0.62 : 0.71);
    gsap.set(p1, { x: W / 2 - a.x, y: y1 - a.y, scale: s1, opacity: 1, '--luz': 0 });
    gsap.set(p2, { x: W / 2 - b.x, y: y2 - b.y, scale: s2, opacity: 1, '--luz': 0 });

    // ---- o caminho do pente e os fios dos dentes ----
    trilha.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const meioY = H * (cel ? 0.49 : 0.505);
    const d = cel
      ? `M ${W * 1.05} ${H * 0.16} C ${W * 0.86} ${H * 0.3}, ${W * 0.86} ${meioY - 6}, ${W * 0.55} ${meioY} L ${-W * 0.1} ${meioY + 8}`
      : `M ${W * 1.015} ${-H * 0.05} C ${W * 0.93} ${H * 0.22}, ${W * 0.875} ${meioY - 4}, ${W * 0.64} ${meioY} L ${-W * 0.06} ${meioY + 14 * u}`;
    const guia = document.createElementNS(NS, 'path');
    guia.setAttribute('d', d);
    const L = guia.getTotalLength();
    const AMOSTRAS = 160, passo = (cel ? 6.5 : 8.5) * u;
    const pts = [];
    for (let i = 0; i <= AMOSTRAS; i++) {
      const q = guia.getPointAtLength((i / AMOSTRAS) * L), q2 = guia.getPointAtLength(Math.min(L, (i / AMOSTRAS) * L + 1));
      const ang = Math.atan2(q2.y - q.y, q2.x - q.x) || (pts.at(-1)?.ang ?? 0);
      pts.push({ x: q.x, y: q.y, ang });
    }
    const fios = DENTES.map((k) => {
      const p = document.createElementNS(NS, 'path');
      const dd = pts.map((q, i) => `${i ? 'L' : 'M'}${(q.x - Math.sin(q.ang) * k * passo).toFixed(1)} ${(q.y + Math.cos(q.ang) * k * passo).toFixed(1)}`).join(' ');
      p.setAttribute('d', dd);
      p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1 1';
      p.style.strokeDashoffset = '1';
      p.style.strokeWidth = `${(k === 0 ? 1.7 : Math.abs(k) === 1 ? 1.35 : 1.05) * u}px`;
      p.style.opacity = [0.42, 0.6, 0.82, 1, 0.82, 0.6, 0.42][k + 3];
      trilha.append(p);
      return p;
    });

    // o pente atravessa o caminho deitado na perpendicular (os dentes na direção do movimento)
    const larguraPente = (DENTES.length + 1.6) * passo;
    pente.style.width = `${(cel ? 150 : 215) * u}px`;
    const anda = { p: 0 };
    function poePente() {
      const i = Math.min(AMOSTRAS, Math.round(anda.p * AMOSTRAS));
      const q = pts[i];
      const ang = (q.ang * 180) / Math.PI + 117 - 38; // o eixo do pente na foto sobe a 27°: +117 deixaria ele de pé; -38 inclina como na mão, mostrando os dentes
      gsap.set(pente, { x: q.x - pente.offsetWidth / 2, y: q.y - pente.offsetHeight / 2, rotation: ang });
      for (const f of fios) f.style.strokeDashoffset = String(1 - anda.p);
      contador.textContent = `#${Math.max(0, 8 - Math.floor(anda.p * 9))}`;
    }

    const tl = gsap.timeline({ defaults: { ease: 'pf-out' }, onComplete: () => { lenis?.start(); } });
    tl.addLabel('inicio')
      .fromTo(cabelo, { scale: 1.035 }, { scale: 1, duration: 1.6, ease: 'pf-out' }, 0)
      .fromTo([p1, p2], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.08 }, 0.05)
      .fromTo(cantos, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.1)
      .fromTo(pente, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.35)
      .to(anda, { p: 1, duration: 1.15, ease: 'power1.inOut', onUpdate: poePente, onStart: poePente }, 0.35)
      .to(pente, { opacity: 0, duration: 0.2 }, 1.42)
      // os fios brilham
      .to(fios, { strokeWidth: (i) => `${(i === 3 ? 3.4 : 2.4) * u}px`, duration: 0.4, ease: 'power2.out' }, 1.45)
      .fromTo(trilha, { filter: 'drop-shadow(0 0 0px #fff)' }, { filter: `drop-shadow(0 0 ${10 * u}px rgba(255,255,255,.9))`, duration: 0.4 }, 1.45)
      // o cabelo apaga de baixo para cima
      .fromTo(cabelo, { '--apaga': '-20%' }, { '--apaga': '120%', duration: 0.75, ease: 'pf-io' }, 1.62)
      .to(cabelo, { filter: 'contrast(1.25) brightness(0.35)', duration: 0.75, ease: 'pf-io' }, 1.62)
      .to(trilha, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.9)
      .to(cena.e, { contorno: 1, chao: 0.6, duration: 0.7, ease: 'power2.out' }, 1.85)
      .fromTo(gl, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.85)
      .to(cantos, { opacity: 0, duration: 0.35 }, 1.9)
      // as metades vão para os cantos
      .to([p1, p2], { x: 0, y: 0, scale: 1, duration: 1.15, ease: 'pf-io' }, 2.0)
      // acende
      .to(focoCss, { opacity: 1, duration: 1.0, ease: 'power2.inOut' }, 2.6)
      .to(cena.e, { luz: 1, chao: 1, poeira: 1, duration: 1.1, ease: 'power2.inOut' }, 2.6)
      .to([p1, p2], { '--luz': 1, duration: 1.0, ease: 'power2.inOut' }, 2.62)
      .call(() => { cabelo.classList.add('is-sopro'); gsap.set(cabelo, { clearProps: 'webkitMaskImage,maskImage' }); }, null, 2.7)
      .fromTo(cabelo, { opacity: 0 }, { opacity: 0.09, duration: 1, immediateRender: false }, 2.7)
      .to(cabelo, { filter: 'contrast(1.25) brightness(0.92)', duration: 0.1 }, 2.7)
      // a interface
      .fromTo(nav, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.9 }, 2.95)
      .to(letras, { opacity: 1, duration: 0.01, stagger: 0.022, ease: 'none' }, 2.95)
      .fromTo(ui.filter((el) => el !== frase), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 3.05)
      .set(frase, { opacity: 1 }, 2.95)
      .call(() => { html.classList.remove('abertura-on'); html.classList.add('abertura-fim'); lenis?.start(); aoTerminar?.(); }, null, 3.25);

    // a máscara que apaga o cabelo (o --apaga anda de baixo para cima)
    cabelo.style.webkitMaskImage = cabelo.style.maskImage = 'linear-gradient(to top, transparent var(--apaga, -20%), #000 calc(var(--apaga, -20%) + 22%))';

    // pular: acelera até o fim (não corta seco)
    let acelerou = false;
    const acelera = () => { if (acelerou || tl.progress() > 0.86) return; acelerou = true; tl.timeScale(5); };
    pular.addEventListener('click', acelera);
    addEventListener('wheel', acelera, { passive: true, once: true });
    addEventListener('touchstart', acelera, { passive: true, once: true });
    addEventListener('keydown', (ev) => { if (['Escape', ' ', 'ArrowDown', 'PageDown', 'Enter'].includes(ev.key)) acelera(); });
  }
}
