// O agendamento: gaveta à direita em quatro passos (serviço, barbeiro, horário, dados) e a confirmação, que já sugere
// o próximo corte. Os serviços e os barbeiros saem do próprio HTML (cardápio e espelhos): um lugar só para editar.
// É demonstração: nada é enviado nem cobrado.
import gsap from 'gsap';
import { HORARIO, agora } from './secoes/horario.js';

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const DIAS_LONGOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const TITULOS = ['Escolha o serviço', 'Escolha o barbeiro', 'Escolha o horário', 'Segure a cadeira'];
const WHATSAPP = '5515991040846';
const fmtHora =(m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const dataLonga = (d) => `${DIAS_LONGOS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
const curta = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

export function agenda({ lenis }) {
  const raiz = document.querySelector('.agenda');
  const gaveta = raiz.querySelector('.agenda__gaveta');
  const veu = raiz.querySelector('.agenda__veu');
  const corpo = raiz.querySelector('[data-corpo]');
  const rotulo = raiz.querySelector('[data-passo-rotulo]');
  const titulo = raiz.querySelector('[data-passo-titulo]');
  const barra = raiz.querySelector('.agenda__barra i');
  const resumo = raiz.querySelector('[data-resumo]');
  const voltar = raiz.querySelector('[data-voltar]');
  const seguir = raiz.querySelector('[data-seguir]');
  const rodape = raiz.querySelector('.agenda__rodape');

  // dados lidos da página
  const servicos = [...document.querySelectorAll('.cardapio .linha')].map((l) => ({
    num: l.querySelector('.linha__num').textContent.trim(),
    nome: l.querySelector('.linha__nome strong').textContent.trim(),
    min: parseInt(l.querySelector('.linha__tempo').textContent, 10),
    preco: parseInt(l.querySelector('.linha__preco').textContent.replace(/\D/g, ''), 10),
    ferramenta: l.dataset.ferramenta,
  }));
  const barbeiros = [...document.querySelectorAll('.espelho')].map((e) => ({
    nome: e.querySelector('.espelho__nome').textContent.trim(),
    extra: e.querySelector('.espelho__extra').textContent.trim(),
    foto: e.querySelector('img').getAttribute('src'),
  }));

  const s = { passo: 0, servico: null, barbeiro: null, dia: null, hora: null, nome: '', fone: '', cartao: '', proximoSegurado: false };
  let gatilho = null, aberta = false;

  /* ---------- abrir e fechar ---------- */
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-agendar]');
    if (!b) return;
    ev.preventDefault();
    // todo botão "Agendar" abre o WhatsApp com a mensagem pronta (cita o serviço quando o botão é de um serviço)
    const sv = b.dataset.agendar;
    const servico = sv !== '' && sv != null ? servicos[Number(sv)] : null;
    let texto = 'Olá! Vim pelo site da barbearia e gostaria de um orçamento';
    texto += servico ? ` para ${servico.nome}.` : '.';
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  });
  raiz.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', fecha));
  addEventListener('keydown', (ev) => {
    if (!aberta) return;
    if (ev.key === 'Escape') fecha();
    if (ev.key === 'Tab') prende(ev);
  });

  function abre(passo) {
    aberta = true;
    raiz.hidden = false;
    lenis?.stop();
    document.documentElement.classList.add('agenda-aberta');
    vai(passo, false);
    gsap.fromTo(veu, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(gaveta, { xPercent: 100 }, { xPercent: 0, duration: 0.75, ease: 'pf-out', onComplete: () => gaveta.querySelector('.agenda__fechar').focus({ preventScroll: true }) });
  }
  function fecha() {
    if (!aberta) return;
    aberta = false;
    gsap.to(veu, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    gsap.to(gaveta, { xPercent: 100, duration: 0.5, ease: 'pf-in', onComplete: () => { raiz.hidden = true; document.documentElement.classList.remove('agenda-aberta'); lenis?.start(); gatilho?.focus({ preventScroll: true }); } });
  }
  function prende(ev) {
    const foco = [...gaveta.querySelectorAll('button:not([disabled]), input, a[href]')].filter((el) => el.offsetParent !== null);
    if (!foco.length) return;
    const [primeiro, ultimo] = [foco[0], foco.at(-1)];
    if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
  }

  /* ---------- passos ---------- */
  voltar.addEventListener('click', () => vai(Math.max(0, s.passo - 1)));
  seguir.addEventListener('click', () => {
    if (s.passo === 3) return paga();
    vai(s.passo + 1);
  });

  function vai(passo, animado = true) {
    const dir = passo >= s.passo ? 1 : -1;
    s.passo = passo;
    const monta = () => {
      corpo.innerHTML = '';
      corpo.scrollTop = 0;
      [servico, barbeiro, horario, dados][passo]();
      rotulo.textContent = `Passo ${passo + 1} de 4`;
      titulo.textContent = TITULOS[passo];
      barra.style.width = `${((passo + 1) / 4) * 100}%`;
      voltar.hidden = passo === 0;
      rodape.hidden = false;
      atualiza();
    };
    if (!animado) { monta(); return; }
    gsap.timeline()
      .to([corpo, titulo], { x: -24 * dir, opacity: 0, duration: 0.22, ease: 'pf-in' })
      .add(monta)
      .fromTo([titulo, corpo], { x: 30 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'pf-out', stagger: 0.04 });
  }

  function atualiza() {
    const sv = servicos[s.servico], bb = s.barbeiro == null ? null : s.barbeiro === 0 ? { nome: 'Primeira livre' } : barbeiros[s.barbeiro - 1];
    const partes = [];
    if (sv) partes.push(sv.nome, `R$ ${sv.preco}`);
    if (bb) partes.push(bb.nome);
    if (s.dia && s.hora != null) partes.push(`${curta(s.dia)} ${fmtHora(s.hora)}`);
    resumo.textContent = partes.length ? partes.join(' · ') : 'Nada escolhido ainda';
    const pode = [s.servico != null, s.barbeiro != null, s.dia && s.hora != null, valido()][s.passo];
    seguir.disabled = !pode;
    seguir.querySelector('.botao__txt')?.setAttribute('data-txt', s.passo === 3 ? 'Pagar sinal de R$ 10' : 'Continuar');
    const txt = seguir.querySelector('.botao__txt > span');
    if (txt) txt.textContent = s.passo === 3 ? 'Pagar sinal de R$ 10' : 'Continuar';
  }

  const opcao = (html, on, ao) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opcao';
    b.innerHTML = html;
    b.setAttribute('aria-pressed', String(on));
    if (on) b.classList.add('is-on');
    b.addEventListener('click', ao);
    corpo.append(b);
    return b;
  };

  function servico() {
    servicos.forEach((sv, i) => {
      opcao(`<img src="${import.meta.env.BASE_URL}img/ferramentas/${sv.ferramenta}.webp" alt="" class="opcao__icone"><span class="opcao__nome">${sv.num} ${sv.nome}<small class="mono">${sv.min} min</small></span><span class="opcao__preco">R$ ${sv.preco}</span>`,
        s.servico === i, () => { s.servico = i; marca(i); atualiza(); });
    });
  }
  function barbeiro() {
    const carregando = document.createElement('div');
    carregando.className = 'carregando';
    carregando.innerHTML = '<i></i>';
    corpo.append(carregando);
    setTimeout(() => {
      if (s.passo !== 1) return;
      carregando.remove();
      const lista = [{ nome: 'Primeira cadeira livre', extra: 'quem estiver livre primeiro', foto: null }, ...barbeiros];
      lista.forEach((bb, i) => {
        const b = opcao(`<span class="opcao__avatar">${bb.foto ? `<img src="${bb.foto}" alt="">` : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'}</span><span class="opcao__nome">${bb.nome}<small class="mono">${bb.extra}</small></span><span class="opcao__seta" aria-hidden="true">→</span>`,
          s.barbeiro === i, () => { s.barbeiro = i; marca(i); atualiza(); setTimeout(() => s.passo === 1 && vai(2), 260); });
        gsap.from(b, { opacity: 0, y: 10, duration: 0.45, delay: i * 0.05, ease: 'pf-out' });
      });
    }, 520);
  }
  function horario() {
    const hoje = agora();
    const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(hoje); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0); return d; });
    if (!s.dia) s.dia = dias[0];
    const faixa = document.createElement('div');
    faixa.className = 'datas';
    dias.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'data';
      b.innerHTML = `<small class="mono">${i === 0 ? 'hoje' : DIAS[d.getDay()]}</small><b>${d.getDate()}</b>`;
      if (d.getTime() === s.dia.getTime()) b.classList.add('is-on');
      b.addEventListener('click', () => { s.dia = d; s.hora = null; faixa.querySelectorAll('.data').forEach((x) => x.classList.toggle('is-on', x === b)); horas(); atualiza(); });
      faixa.append(b);
    });
    corpo.append(faixa);
    const grade = document.createElement('div');
    grade.className = 'horas';
    corpo.append(grade);
    function horas() {
      grade.innerHTML = '';
      const [abre, fechaH] = HORARIO[s.dia.getDay()];
      const agoraMin = hoje.getHours() * 60 + hoje.getMinutes();
      const eHoje = s.dia.toDateString() === hoje.toDateString();
      let semente = s.dia.getDate() * 7 + (s.barbeiro ?? 0) * 13;
      const sorteio = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
      for (let m = abre * 60; m <= fechaH * 60 - 40; m += 20) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hora';
        b.textContent = fmtHora(m);
        const ocupada = sorteio() < 0.38 || (eHoje && m < agoraMin + 20);
        if (ocupada) { b.disabled = true; b.classList.add('is-ocupada'); b.setAttribute('aria-label', `${fmtHora(m)}, ocupado`); }
        if (s.hora === m) b.classList.add('is-on');
        b.addEventListener('click', () => { s.hora = m; grade.querySelectorAll('.hora').forEach((x) => x.classList.toggle('is-on', x === b)); atualiza(); });
        grade.append(b);
      }
      if (!grade.querySelector('.hora:not(.is-ocupada)')) grade.innerHTML = '<p class="horas__vazio">Esse dia já fechou. Escolha outro ali em cima.</p>';
      gsap.from(grade.children, { opacity: 0, y: 6, duration: 0.35, stagger: 0.008, ease: 'pf-out' });
    }
    horas();
  }
  function dados() {
    const campo = (id, rotuloTxt, attrs, valor, mascara) => {
      const w = document.createElement('label');
      w.className = 'campo';
      w.innerHTML = `<span class="mono">${rotuloTxt}</span><input id="${id}" ${attrs} value="${valor}"><em class="campo__erro mono" aria-live="polite"></em>`;
      const input = w.querySelector('input');
      input.addEventListener('input', () => { if (mascara) input.value = mascara(input.value); s[id] = input.value; w.classList.remove('is-erro'); w.classList.toggle('is-cheio', !!input.value); atualiza(); });
      input.addEventListener('blur', () => checa(w, id));
      if (valor) w.classList.add('is-cheio');
      corpo.append(w);
      return input;
    };
    const fone = (v) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d; };
    const cartao = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    campo('nome', 'Nome', 'type="text" autocomplete="name" placeholder="Como chamamos você"', s.nome).focus?.();
    campo('fone', 'Celular, para o lembrete', 'type="tel" inputmode="numeric" autocomplete="tel" placeholder="(00) 00000-0000"', s.fone, fone);
    campo('cartao', 'Cartão, para o sinal de R$ 10', 'type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000"', s.cartao, cartao);
    const aviso = document.createElement('p');
    aviso.className = 'aviso-agenda';
    aviso.innerHTML = '<strong>O sinal de R$ 10 sai do valor do corte.</strong> Desmarcou até 12 horas antes, ele volta inteiro. Depois disso, ou se faltar, ele cobre o tempo do barbeiro. A gente avisa na véspera.';
    corpo.append(aviso);
  }
  function checa(w, id) {
    const erro = { nome: s.nome.trim().length < 2 ? 'Escreva seu nome' : '', fone: s.fone.replace(/\D/g, '').length < 10 ? 'Celular com DDD' : '', cartao: s.cartao.replace(/\D/g, '').length < 16 ? 'Os 16 números do cartão' : '' }[id];
    w.classList.toggle('is-erro', !!erro && !!s[id]);
    w.querySelector('.campo__erro').textContent = s[id] ? erro : '';
  }
  const valido = () => s.nome.trim().length > 1 && s.fone.replace(/\D/g, '').length >= 10 && s.cartao.replace(/\D/g, '').length === 16;

  function marca(i) { corpo.querySelectorAll('.opcao').forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); }); }

  /* ---------- pagar (de mentira) e confirmar ---------- */
  function paga() {
    seguir.disabled = true;
    seguir.classList.add('is-pagando');
    setTimeout(() => { seguir.classList.remove('is-pagando'); confirma(); }, 1100);
  }
  function confirma() {
    const sv = servicos[s.servico];
    const bb = s.barbeiro === 0 ? barbeiros[0] : barbeiros[s.barbeiro - 1];
    const quando = new Date(s.dia); quando.setHours(Math.floor(s.hora / 60), s.hora % 60);
    const proximo = new Date(quando); proximo.setDate(proximo.getDate() + 21);
    rotulo.textContent = 'Confirmado';
    titulo.textContent = 'Sua cadeira está segurada';
    barra.style.width = '100%';
    rodape.hidden = true;
    corpo.innerHTML = `
      <svg class="confirma__marca" viewBox="0 0 48 20" aria-hidden="true"><use href="#marca"/></svg>
      <dl class="confirma__lista">
        <div><dt class="mono">Serviço</dt><dd>${sv.nome} · ${sv.min} min</dd></div>
        <div><dt class="mono">Barbeiro</dt><dd>${bb.nome}</dd></div>
        <div><dt class="mono">Quando</dt><dd>${dataLonga(quando)}, ${fmtHora(s.hora)}</dd></div>
        <div><dt class="mono">Pago agora</dt><dd>R$ 10 de sinal · R$ ${sv.preco - 10} na cadeira</dd></div>
      </dl>
      <p class="confirma__msg">A gente manda mensagem para ${s.fone} na véspera. Um ${sv.nome.toLowerCase()} segura umas três semanas, então o próximo cai por volta de <strong>${dataLonga(proximo)}</strong>. Quer segurar esse também?</p>
      <div class="confirma__botoes">
        <button class="botao botao--claro botao--pequeno" type="button" data-ics>Adicionar à agenda</button>
        <button class="botao botao--linha botao--pequeno" type="button" data-proximo>Segurar ${curta(proximo)} também</button>
      </div>
      <a class="confirma__gerenciar mono" href="#topo" data-fechar>Gerenciar agendamento</a>
      <div class="confirma__pe"><p class="mono">Demonstração · nada foi cobrado</p><button class="botao botao--claro botao--pequeno" type="button" data-fechar>Pronto</button></div>`;
    for (const b of corpo.querySelectorAll('.botao')) { const t = b.textContent.trim(); b.innerHTML = `<span class="botao__txt" data-txt="${t}"><span>${t}</span></span>`; }
    corpo.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); fecha(); }));
    corpo.querySelector('[data-ics]').addEventListener('click', () => ics(sv, bb, quando));
    const bp = corpo.querySelector('[data-proximo]');
    bp.addEventListener('click', () => { const t = bp.querySelector('.botao__txt'); t.firstChild.textContent = `${curta(proximo)} segurado ✓`; t.dataset.txt = `${curta(proximo)} segurado ✓`; bp.disabled = true; });
    gsap.timeline()
      .fromTo(corpo.querySelector('.confirma__marca'), { clipPath: 'inset(0 100% 0 0)', x: -10 }, { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 0.9, ease: 'pf-io' })
      .from(corpo.querySelectorAll('.confirma__lista > div, .confirma__msg, .confirma__botoes, .confirma__gerenciar, .confirma__pe'), { opacity: 0, y: 14, duration: 0.6, stagger: 0.07, ease: 'pf-out' }, 0.2);
  }
  function ics(sv, bb, quando) {
    const fim = new Date(quando.getTime() + sv.min * 60000);
    const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pente Fino//Agenda//PT', 'BEGIN:VEVENT', `UID:${Date.now()}@pentefino`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(quando)}`, `DTEND:${z(fim)}`, `SUMMARY:${sv.nome} com ${bb.nome} · Pente Fino`, 'LOCATION:Rua das Palmeiras\\, 240 · Centro', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' }));
    a.download = 'pente-fino.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
}
