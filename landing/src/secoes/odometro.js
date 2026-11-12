// Hodômetro: cada dígito é uma coluna 0–9 que rola até o número (o CSS dá a curva; altura de 1em por dígito).
export function odometro(el, valor, { instantaneo = false, duracao = 1.1 } = {}) {
  const digitos = String(valor).split('');
  let cols = [...el.querySelectorAll(':scope > .odometro__col')];
  if (!cols.length) el.textContent = '';
  const nova = () => {
    const c = document.createElement('span');
    c.className = 'odometro__col';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '0123456789'.split('').map((d) => `<span>${d}</span>`).join('');
    return c;
  };
  while (cols.length < digitos.length) { const c = nova(); el.prepend(c); cols.unshift(c); c.style.transition = 'none'; }
  while (cols.length > digitos.length) cols.shift().remove();
  void el.offsetWidth;
  cols.forEach((c, i) => {
    c.style.transition = instantaneo ? 'none' : `transform ${duracao + i * 0.12}s var(--curva)`;
    c.style.transform = `translateY(${-Number(digitos[i])}em)`;
  });
  el.setAttribute('aria-label', String(valor));
}
