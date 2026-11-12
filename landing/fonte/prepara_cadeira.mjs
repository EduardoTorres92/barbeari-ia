// Prepara a cadeira baixada do Sketchfab ("Barber Chair", sweedboy69, CC-BY 4.0) para o site.
// uso (da pasta da template): node fonte/prepara_cadeira.mjs <download .zip | scene.gltf | .glb>
// Descompacta numa pasta temporária, junta e solda a malha, tira o que sobra, passa as texturas para WebP
// (até 1024 px) e comprime a geometria com meshopt. Sai em public/modelos/cadeira.glb e lista as malhas e
// materiais (o src/gl/cadeira.js separa couro, cromo e borracha pelo nome).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, flatten, prune, weld, textureCompress, meshopt, resample } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

const entrada = process.argv[2];
if (!entrada) { console.log('uso: node fonte/prepara_cadeira.mjs <zip|gltf|glb>'); process.exit(2); }
let arquivo = entrada;
if (extname(entrada).toLowerCase() === '.zip') {
  const dir = mkdtempSync(join(tmpdir(), 'cadeira-'));
  execFileSync('unzip', ['-q', '-o', entrada, '-d', dir]);
  const acha = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? acha(p) : [p]; });
  arquivo = acha(dir).find((f) => /\.(gltf|glb)$/i.test(f));
  if (!arquivo) throw new Error('o zip não tem .gltf nem .glb');
}

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(arquivo);
const raiz = doc.getRoot();
console.log('malhas:', raiz.listMeshes().map((m) => `${m.getName()} (${m.listPrimitives().map((p) => p.getMaterial()?.getName()).join(', ')})`).join(' | '));
console.log('materiais:', raiz.listMaterials().map((m) => `${m.getName()} metal=${m.getMetallicFactor()} rough=${m.getRoughnessFactor()} tex=${[m.getBaseColorTexture(), m.getNormalTexture(), m.getMetallicRoughnessTexture()].filter(Boolean).length}`).join(' | '));

await doc.transform(
  dedup(), flatten(), weld(), resample(), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 82 }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
mkdirSync('public/modelos', { recursive: true });
await io.write('public/modelos/cadeira.glb', doc);
console.log('pronto: public/modelos/cadeira.glb', (statSync('public/modelos/cadeira.glb').size / 1024 / 1024).toFixed(2), 'MB');
