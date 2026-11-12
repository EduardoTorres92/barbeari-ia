// Prepara as imagens do site a partir das imagens geradas (fonte/bruto/*.png) para public/img/*.webp.
// uso (da raiz do projeto): node fonte/imagens.mjs   (ou node arquivos/fonte/imagens.mjs, no projeto montado do pacote)
// - cabelo: textura da abertura; espelhos: os barbeiros; produtos: a bancada
// - cortes: cada geração é um díptico (frente | costas) com um vão preto no meio: corta no vão e enquadra em 4:5
// - ferramentas: recorte do objeto pelo Vision do macOS (fonte/recorta.swift) e aparo das bordas vazias
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BRUTO = 'fonte/bruto', IMG = 'public/img';
const AQUI = dirname(fileURLToPath(import.meta.url)); // o recorta.swift mora ao lado deste arquivo
for (const d of ['', 'cortes', 'produtos', 'ferramentas']) mkdirSync(join(IMG, d), { recursive: true });
const tem = (n) => existsSync(join(BRUTO, `${n}.png`));
const feito = [];

if (tem('cabelo')) {
  await sharp(join(BRUTO, 'cabelo.png')).grayscale().resize({ width: 2000, withoutEnlargement: false }).webp({ quality: 74 }).toFile(join(IMG, 'cabelo.webp'));
  feito.push('cabelo');
}

for (let i = 1; i <= 4; i++) {
  if (!tem(`espelho-${i}`)) continue;
  await sharp(join(BRUTO, `espelho-${i}.png`)).grayscale().resize({ width: 1400 }).webp({ quality: 78 }).toFile(join(IMG, `espelho-${i}.webp`));
  feito.push(`espelho-${i}`);
}

const PRODUTOS = { 'produto-1': 'pomada', 'produto-2': 'oleo', 'produto-3': 'tonico', 'produto-4': 'pente' };
for (const [n, nome] of Object.entries(PRODUTOS)) {
  if (!tem(n)) continue;
  await sharp(join(BRUTO, `${n}.png`)).grayscale().resize({ width: 820 }).webp({ quality: 78 }).toFile(join(IMG, 'produtos', `${nome}.webp`));
  feito.push(nome);
}

// díptico: acha o vão (as colunas mais escuras perto do meio) e corta as duas fotos
for (let i = 1; i <= 8; i++) {
  if (!tem(`corte-${i}`)) continue;
  const src = sharp(join(BRUTO, `corte-${i}.png`));
  const { width: W, height: H } = await src.metadata();
  const { data } = await sharp(join(BRUTO, `corte-${i}.png`)).grayscale().raw().toBuffer({ resolveWithObject: true });
  const media = (x) => { let s = 0; for (let y = 0; y < H; y += 2) s += data[y * W + x]; return s / (H / 2); };
  let ini = -1, fim = -1;
  const meio = Math.round(W / 2), busca = Math.round(W * 0.12);
  let melhor = { x: meio, v: 1e9 };
  for (let x = meio - busca; x <= meio + busca; x++) { const v = media(x); if (v < melhor.v) melhor = { x, v }; }
  ini = melhor.x; fim = melhor.x;
  while (ini > meio - busca && media(ini - 1) < melhor.v + 6) ini--;
  while (fim < meio + busca && media(fim + 1) < melhor.v + 6) fim++;
  const esq = { left: 0, top: 0, width: ini, height: H }, dir = { left: fim + 1, top: 0, width: W - fim - 1, height: H };
  for (const [lado, caixa] of [['frente', esq], ['costas', dir]]) {
    // enquadra em 4:5 pelo centro (as fotos vêm 3:4)
    const alvoH = Math.min(caixa.height, Math.round(caixa.width * 1.25));
    const topo = Math.round((caixa.height - alvoH) * 0.3);
    await sharp(join(BRUTO, `corte-${i}.png`)).extract({ left: caixa.left, top: caixa.top + topo, width: caixa.width, height: alvoH }).grayscale().resize({ width: 760 }).webp({ quality: 78 }).toFile(join(IMG, 'cortes', `corte-${i}-${lado}.webp`));
  }
  feito.push(`corte-${i} (vão ${ini}–${fim})`);
}

const FERRAMENTAS = ['maquina', 'aparador', 'tesoura', 'pente', 'pincel', 'navalha'];
for (const nome of FERRAMENTAS) {
  const n = `ferramenta-${nome}`;
  if (!tem(n)) continue;
  const recorte = join(BRUTO, `${n}-recorte.png`);
  if (!existsSync(recorte)) execFileSync('swift', [join(AQUI, 'recorta.swift'), join(BRUTO, `${n}.png`), recorte], { stdio: 'inherit' });
  await sharp(recorte).trim({ threshold: 1 }).resize({ height: 760, width: 760, fit: 'inside' }).webp({ quality: 82, alphaQuality: 90 }).toFile(join(IMG, 'ferramentas', `${nome}.webp`));
  feito.push(nome);
}

console.log('pronto:', feito.join(', '));
