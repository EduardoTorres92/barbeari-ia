// #1 Por que agendar: a frase fica parada no meio e três peças da bancada (relógio, lata de pomada, borrifador) giram
// numa órbita inclinada em volta dela, como um carrossel. A peça da frente passa NA FRENTE da frase (canvas de cima) e
// as de trás passam atrás (canvas de baixo, com as sombras na parede). A pílula mostra o fato da peça da frente.
//
// O carrossel anda de duas formas que se somam e nunca brigam:
//   - a rolagem: dois passos de 1/3 de volta ao longo da cena presa, com patamares (a peça para um pouco na frente);
//   - os cliques: cada clique gira o carrossel pelo caminho mais curto (±1 passo) até a peça clicada e fica assim.
// O ajuste do clique é sempre um número inteiro de passos, então os patamares da rolagem continuam alinhados: rolar
// depois de clicar segue da peça escolhida para a próxima (para baixo) ou a anterior (para cima).
// Arrastar gira a peça no próprio eixo, com inércia limitada; solta, ela desacelera e volta a balançar de frente.
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { estudio } from '../gl/estudio.js';
import { CELULAR } from '../motion/ease.js';

const FATOS = [
  { grande: '−1 dia', legenda: 'lembrete no WhatsApp na véspera' },
  { grande: 'R$ 10', legenda: 'de sinal, que sai do valor do corte' },
  { grande: '60 s', legenda: 'para agendar, de madrugada ou não' },
];
const PASSO = (Math.PI * 2) / 3;
const VOLTA = Math.PI * 2;
// de que lado cada peça olha para a câmera (o mostrador, a tampa, o bico de perfil)
const FRENTE = [0, 0, -0.55];
// quanto cada peça desce a mais quando está na frente (o borrifador é alto, o relógio é largo)
const ALTO = [-0.18, 0, -0.3];
const mod3 = (n) => ((n % 3) + 3) % 3;
const limita = (v, m) => Math.max(-m, Math.min(m, v));

export function manifesto() {
  const sec = document.querySelector('.manifesto');
  const fixo = sec.querySelector('.manifesto__fixo');
  const cFundo = sec.querySelector('.manifesto__gl--fundo');
  const cFrente = sec.querySelector('.manifesto__gl--frente');
  const grande = sec.querySelector('[data-fato-grande]');
  const legenda = sec.querySelector('[data-fato-legenda]');

  const palcos = [cFundo, cFrente].map((canvas) => palco(canvas));
  const [fundo, frente] = palcos;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 0.25, 11);
  camera.lookAt(0, 0.1, 0);

  // carrossel: fase = rolagem + ajuste (o ajuste vem dos cliques, sempre em passos inteiros no alvo)
  const orbita = { rolagem: 0, ajuste: 0 };
  let ajusteAlvo = 0;
  const fase = () => orbita.rolagem + orbita.ajuste;
  // giro de cada peça no próprio eixo: solta = desacelerando depois do arraste; alvo = volta inteira de descanso
  const giro = [0, 1, 2].map(() => ({ y: 0, vy: 0, x: 0, vx: 0, solta: false, alvo: 0, pulo: 0 }));
  let degrauMostrado = 0, frenteAtual = -1, visivel = false;
  window.__pfManifesto = { giro, orbita }; // gancho para conferir o carrossel com um navegador automático

  function mostraFato(i) {
    if (i === frenteAtual) return;
    frenteAtual = i;
    const f = FATOS[i];
    gsap.timeline()
      .to([grande, legenda], { y: -12, opacity: 0, duration: 0.2, ease: 'pf-in', stagger: 0.03, overwrite: true })
      .add(() => { grande.textContent = f.grande; legenda.textContent = f.legenda; })
      .fromTo([grande, legenda], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'pf-out', stagger: 0.05 });
  }

  // posição de cada peça na órbita (a da frente embaixo e maior, as de trás em cima e menores)
  const cel = () => CELULAR();
  function poe(t) {
    const f = fase();
    for (let i = 0; i < 3; i++) {
      const th = f + i * PASSO;
      const rx = cel() ? 1.45 : 4.3, rz = cel() ? 1.6 : 2.3;
      const x = Math.sin(th) * rx;
      const z = Math.cos(th) * rz;
      const c = Math.cos(th);
      const y = (c >= 0 ? -c * ((cel() ? 1.25 : 0.86) - ALTO[i]) : -c * (cel() ? 3.8 : 1.75)) + 0.08 + Math.sin(t * 0.9 + i * 2.1) * 0.06;
      const g = giro[i];
      const pulo = 1 + Math.sin(g.pulo * Math.PI) * 0.07;
      for (const p of palcos) {
        const o = p.pecas[i];
        o.position.set(x, y, z);
        o.rotation.set(g.x + Math.sin(t * 0.7 + i) * 0.06, g.y + FRENTE[i], Math.sin(t * 0.5 + i * 1.7) * 0.05);
        o.scale.setScalar(o.userData.escala * pulo);
        const naFrente = z >= 0;
        o.visible = p === frente ? naFrente : !naFrente;
        p.sombras[i].position.set(x * 0.9 + 0.22, y - 0.7, -3.4);
        p.sombras[i].visible = p === fundo;
        p.sombras[i].material.opacity = 0.1 + 0.08 * (z / rz + 1) * 0.5;
      }
    }
    // a pílula troca com folga: só quando o carrossel passa bem do meio entre duas peças (nada de piscar na fronteira)
    const d = -f / PASSO;
    if (Math.abs(d - degrauMostrado) > 0.6) degrauMostrado = Math.round(d);
    mostraFato(mod3(degrauMostrado));
  }

  // ---- rolagem: a seção fica presa e o carrossel dá dois passos (três peças, três fatos) ----
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: () => `+=${Math.round(innerHeight * (cel() ? 1.6 : 2.1))}`,
    pin: fixo, pinSpacing: true,
    onUpdate: (st) => {
      // patamares: a peça para um pouco na frente antes de a próxima vir (o carrossel anda em degraus suaves)
      const s = st.progress * 2;
      const k = Math.floor(s), f = s - k;
      const degrau = k + gsap.parseEase('pf-io')(Math.min(1, Math.max(0, (f - 0.25) / 0.5)));
      orbita.rolagem = -degrau * PASSO;
    },
  });

  // ---- arrastar gira a peça; clicar traz ela para a frente ----
  const ray = new THREE.Raycaster(), ponto = new THREE.Vector2();
  function pega(ev) {
    const r = cFrente.getBoundingClientRect();
    ponto.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ponto, camera);
    // as peças das duas cenas estão no mesmo lugar: testa na cena de cima, com todas visíveis
    const vis = frente.pecas.map((o) => o.visible);
    frente.pecas.forEach((o) => { o.visible = true; });
    const hit = ray.intersectObjects(frente.pecas, true)[0];
    frente.pecas.forEach((o, i) => { o.visible = vis[i]; });
    if (!hit) return -1;
    let o = hit.object;
    while (o && !frente.pecas.includes(o)) o = o.parent;
    return frente.pecas.indexOf(o);
  }
  let arrasto = null;
  cFrente.addEventListener('pointerdown', (ev) => {
    const i = pega(ev);
    if (i < 0) return;
    arrasto = { i, x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY, t: performance.now(), moveu: false };
    cFrente.setPointerCapture(ev.pointerId);
    cFrente.classList.add('is-girando');
  });
  cFrente.addEventListener('pointermove', (ev) => {
    if (!arrasto) {
      if (ev.pointerType === 'mouse') cFrente.classList.toggle('is-pega', pega(ev) >= 0);
      return;
    }
    const agora = performance.now();
    const dx = ev.clientX - arrasto.x, dy = ev.clientY - arrasto.y, dt = Math.max(16, agora - arrasto.t) / 1000;
    if (Math.hypot(ev.clientX - arrasto.x0, ev.clientY - arrasto.y0) > 6) arrasto.moveu = true;
    const g = giro[arrasto.i];
    g.y += dx * 0.012; g.x = limita(g.x + dy * 0.006, 0.6);
    // velocidade suavizada (média dos últimos movimentos), para a inércia não sair de um pico de um evento só
    g.vy += ((dx * 0.012) / dt - g.vy) * 0.4;
    g.vx += ((dy * 0.006) / dt - g.vx) * 0.4;
    Object.assign(arrasto, { x: ev.clientX, y: ev.clientY, t: agora });
  });
  const solta = () => {
    if (!arrasto) return;
    const g = giro[arrasto.i];
    if (!arrasto.moveu) traz(arrasto.i);
    else { g.solta = true; g.vy = limita(g.vy, 7); g.vx = limita(g.vx, 3); }
    arrasto = null;
    cFrente.classList.remove('is-girando');
  };
  cFrente.addEventListener('pointerup', solta);
  cFrente.addEventListener('pointercancel', solta);

  function traz(i) {
    // a peça da frente, contada no alvo (se um giro de clique ainda está andando, conta de onde ele vai parar)
    const atual = mod3(Math.round(-(orbita.rolagem + ajusteAlvo) / PASSO));
    let k = mod3(i - atual);
    gsap.fromTo(giro[i], { pulo: 0 }, { pulo: 1, duration: 0.55, ease: 'power2.out', overwrite: true });
    if (k === 0) return;
    if (k === 2) k = -1; // a da esquerda vem pela esquerda
    ajusteAlvo = Math.round(ajusteAlvo / PASSO) * PASSO - k * PASSO;
    gsap.to(orbita, { ajuste: ajusteAlvo, duration: 0.95, ease: 'pf-io', overwrite: true });
  }

  // ---- laço ----
  let t0 = performance.now();
  function quadro(agora) {
    if (!visivel) return;
    const dt = Math.min(0.05, (agora - t0) / 1000); t0 = agora;
    const t = agora / 1000;
    giro.forEach((g, i) => {
      if (arrasto && arrasto.i === i) return;
      const balanco = Math.sin(t * 0.45 + i * 2.2) * 0.35;
      if (g.solta) {
        // desliza com atrito; devagar o bastante, escolhe a volta inteira mais perto e para lá vai de mola
        g.vy *= Math.exp(-2.4 * dt);
        g.y += g.vy * dt;
        if (Math.abs(g.vy) < 1.1) { g.solta = false; g.alvo = Math.round((g.y - balanco) / VOLTA) * VOLTA; }
      } else {
        // mola com amortecimento crítico até a frente (mais o balanço lento): sem passar do ponto, sem girar sozinha
        g.vy += ((g.alvo + balanco - g.y) * 9 - g.vy * 6) * dt;
        g.y += g.vy * dt;
      }
      g.vx += ((0 - g.x) * 12 - g.vx * 7) * dt;
      g.x += g.vx * dt;
    });
    poe(t);
    palcos.forEach((p) => p.pecas[0].userData.ponteiros?.(new Date()));
    for (const p of palcos) p.renderer.render(p.cena, camera);
  }
  gsap.ticker.add(() => quadro(performance.now()));

  function mede() {
    const w = fixo.clientWidth, h = fixo.clientHeight;
    camera.aspect = w / h;
    camera.fov = cel() ? 46 : 30;
    camera.position.z = cel() ? 9.5 : 11;
    camera.updateProjectionMatrix();
    for (const p of palcos) { p.renderer.setPixelRatio(Math.min(devicePixelRatio, cel() ? 1.6 : 2)); p.renderer.setSize(w, h, false); }
  }
  addEventListener('resize', mede);
  mede();
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { rootMargin: '20% 0px' }).observe(fixo);
  poe(0);
}

/* ---------------- um palco (um canvas, uma cena, as três peças) ---------------- */
function palco(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const cena = new THREE.Scene();
  cena.environment = estudio(renderer, { claro: true });
  cena.environmentIntensity = 0.95;
  const sol = new THREE.DirectionalLight(0xffffff, 2.2);
  sol.position.set(-3, 6, 5);
  cena.add(sol, new THREE.HemisphereLight(0xffffff, 0xbdbab5, 0.6));

  const m = materiais();
  const pecas = [relogio(m), lata(m), borrifador(m)];
  pecas.forEach((p) => { p.userData.escala = p.scale.x; cena.add(p); });
  const sombras = pecas.map((p, i) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(i === 2 ? 1.6 : 2.0, i === 2 ? 0.55 : 0.6), new THREE.MeshBasicMaterial({ map: sombra(), transparent: true, depthWrite: false, opacity: 0.2, color: 0x000000 }));
    cena.add(s);
    return s;
  });
  return { renderer, cena, pecas, sombras };
}

function materiais() {
  return {
    cromo: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.14 }),
    escovado: new THREE.MeshStandardMaterial({ color: 0xd9d9d6, metalness: 1, roughness: 0.32 }),
    preto: new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.45, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    couro: new THREE.MeshPhysicalMaterial({ color: 0x0d0d0d, roughness: 0.62, metalness: 0, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x555555) }),
    branco: new THREE.MeshBasicMaterial({ color: 0xf2f1ee }),
  };
}

// lathe a partir de pontos [raio, altura]
const torno = (pts, seg = 72) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

function relogio(m) {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  // aro cromado (perfil arredondado) com o mostrador virado para a câmera
  const aro = new THREE.Mesh(torno([[0.44, -0.07], [0.5, -0.075], [0.535, -0.04], [0.545, 0.01], [0.53, 0.06], [0.49, 0.085], [0.455, 0.075], [0.45, 0.03]]), m.cromo);
  const fundoRel = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.12, 64), m.preto);
  fundoRel.position.y = -0.02;
  // mostrador: preto, traços brancos, sem números
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#0d0d0d'; x.fillRect(0, 0, 512, 512);
  x.translate(256, 256);
  for (let i = 0; i < 60; i++) {
    const maior = i % 5 === 0;
    x.save(); x.rotate((i / 60) * Math.PI * 2);
    x.fillStyle = maior ? '#f2f1ee' : '#8d8c89';
    x.fillRect(-(maior ? 5 : 1.6), -236, maior ? 10 : 3.2, maior ? 46 : 18);
    x.restore();
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mostrador = new THREE.Mesh(new THREE.CircleGeometry(0.452, 64), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 }));
  mostrador.rotation.x = -Math.PI / 2;
  mostrador.position.y = 0.045;
  corpo.add(aro, fundoRel, mostrador);
  const ponteiro = (larg, comp, mat, h) => { const p = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.008, comp), mat); p.geometry.translate(0, 0, -comp / 2 + 0.04); p.position.y = h; corpo.add(p); return p; };
  const hora = ponteiro(0.032, 0.25, m.branco, 0.056), minuto = ponteiro(0.022, 0.37, m.branco, 0.062), segundo = ponteiro(0.008, 0.4, m.cromo, 0.068);
  const pino = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 24), m.cromo); pino.position.y = 0.07; corpo.add(pino);
  corpo.rotation.x = Math.PI / 2; // o mostrador olha para +z
  g.add(corpo);
  g.scale.setScalar(1.12);
  g.userData.ponteiros = (d) => {
    const s = d.getSeconds() + d.getMilliseconds() / 1000, mi = d.getMinutes() + s / 60, h = (d.getHours() % 12) + mi / 60;
    hora.rotation.y = -(h / 12) * Math.PI * 2; minuto.rotation.y = -(mi / 60) * Math.PI * 2; segundo.rotation.y = -(Math.floor(s) / 60) * Math.PI * 2;
  };
  return g;
}

function lata(m) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(torno([[0, -0.15], [0.39, -0.15], [0.415, -0.135], [0.42, -0.1], [0.42, 0.06], [0.405, 0.07]]), m.escovado);
  const tampa = new THREE.Mesh(torno([[0.43, 0.04], [0.445, 0.055], [0.448, 0.14], [0.44, 0.165], [0.42, 0.175], [0.3, 0.18], [0, 0.183]]), m.preto);
  const friso = new THREE.Mesh(new THREE.TorusGeometry(0.446, 0.009, 12, 96), m.cromo);
  friso.rotation.x = Math.PI / 2; friso.position.y = 0.048;
  // a marca em relevo leve na tampa (o pente)
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,255,255,0.2)';
  const k = 3.6, ox = 128 - 24 * k, oy = 128 - 10 * k;
  const ret = (rx, ry, w, h) => { x.beginPath(); x.roundRect(ox + rx * k, oy + ry * k, w * k, h * k, Math.min(w, h) * k / 2); x.fill(); };
  ret(1, 1, 46, 4.4);
  ret(1, 3, 2.6, 16); ret(44.4, 3, 2.6, 16);
  for (let i = 0; i < 4; i++) ret(6 + i * 4, 4.6, 2.2, 14);
  for (let i = 0; i < 8; i++) ret(22.9 + i * 2.7, 4.6, 1.3, 14);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const selo = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  selo.rotation.x = -Math.PI / 2; selo.position.y = 0.1845;
  g.add(corpo, tampa, friso, selo);
  g.rotation.x = 0.55;
  const h = new THREE.Group(); h.add(g); h.scale.setScalar(1.15);
  return h;
}

function borrifador(m) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(torno([[0, -0.62], [0.24, -0.62], [0.262, -0.6], [0.268, -0.52], [0.262, -0.5]]), m.cromo);
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.258, 0.262, 0.62, 64, 1, true), m.couro);
  corpo.position.y = -0.19;
  const ombro = new THREE.Mesh(torno([[0.262, 0.11], [0.262, 0.16], [0.24, 0.25], [0.16, 0.33], [0.1, 0.36], [0.095, 0.44], [0.11, 0.46], [0.11, 0.5], [0, 0.5]]), m.cromo);
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 24), m.cromo); haste.position.y = 0.6;
  const cabeca = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.15, 0.34, 4, 0.05), m.cromo); cabeca.position.set(0, 0.74, 0.04);
  const bico = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.12, 20), m.cromo); bico.rotation.x = Math.PI / 2; bico.position.set(0, 0.75, 0.25);
  const gatilho = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 10, 32, Math.PI * 0.7), m.cromo); gatilho.position.set(0, 0.62, 0.15); gatilho.rotation.set(0, Math.PI / 2, -0.6);
  g.add(base, corpo, ombro, haste, cabeca, bico, gatilho);
  g.rotation.z = -0.12;
  const h = new THREE.Group(); h.add(g); h.scale.setScalar(1.05);
  return h;
}

function sombra() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const r = x.createRadialGradient(64, 64, 0, 64, 64, 60);
  r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(0.4, 'rgba(0,0,0,0.5)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = r; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
