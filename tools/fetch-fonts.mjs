// Baixa as fontes do Google Fonts como woff2 locais e gera o fonts.css.
// Sem dependência em runtime: nenhuma requisição a fonts.gstatic.com em produção.
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('assets/fonts');
await mkdir(OUT, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const API = 'https://fonts.googleapis.com/css2';

const FAMILIES = [
  {
    name: 'Playfair Display',
    query: 'Playfair+Display:ital,wght@0,400..900;1,400..900',
    slug: 'playfair',
    // duas variáveis (normal e itálico)
    style: [['normal', 'italic']],
  },
  {
    name: 'Plus Jakarta Sans',
    query: 'Plus+Jakarta+Sans:wght@200..800',
    slug: 'jakarta',
    style: [['normal']],
  },
  {
    name: 'Great Vibes',
    query: 'Great+Vibes',
    slug: 'great-vibes',
    style: [['normal']],
    // só o wordmark do logo usa esta fonte: o subset latino basta
    subsets: ['latin'],
  },
];

// só os subsets que o português precisa
const KEEP = new Set(['latin', 'latin-ext']);

for (const f of await readdir(OUT).catch(() => [])) {
  if (f.endsWith('.woff2') || f === 'fonts.css') await rm(path.join(OUT, f), { force: true });
}

const blocks = [];

for (const fam of FAMILIES) {
  const url = `${API}?family=${fam.query}&display=swap`;
  const css = await fetch(url, { headers: { 'User-Agent': UA } }).then(r => r.text());
  // cada @font-face vem precedido por um comentário /* subset */
  const faces = [...css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*@font-face\s*\{([\s\S]*?)\}/g)];
  let n = 0;
  for (const face of faces) {
    const subset = face[1];
    if (!KEEP.has(subset)) continue;
    if (fam.subsets && !fam.subsets.includes(subset)) continue;
    const body = face[2];
    const src = body.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    const weight = body.match(/font-weight:\s*([^;]+);/)?.[1]?.trim() || '400';
    const style = body.match(/font-style:\s*([^;]+);/)?.[1]?.trim() || 'normal';
    const range = body.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
    if (!src) continue;
    const file = `${fam.slug}-${style === 'italic' ? 'italic' : 'normal'}-${subset}.woff2`;
    const buf = Buffer.from(await fetch(src, { headers: { 'User-Agent': UA } }).then(r => r.arrayBuffer()));
    await writeFile(path.join(OUT, file), buf);
    blocks.push({ family: fam.name, file, weight, style, range, bytes: buf.length, subset });
    n++;
    console.log(`  ${file} ${(buf.length / 1024).toFixed(0)}kB`);
  }
  if (!n) console.log(`! ${fam.name}: nenhum woff2 encontrado`);
}

const css = `/* Fontes hospedadas localmente (OFL). Gerado por tools/fetch-fonts.mjs — não editar. */

${blocks.map(b => `/* ${b.family} ${b.style === 'italic' ? 'itálico' : 'normal'} ${b.subset} */
@font-face {
  font-family: "${b.family}";
  font-style: ${b.style};
  font-weight: ${b.weight};
  font-display: swap;
  src: url("./${b.file}") format("woff2");
  unicode-range: ${b.range};
}`).join('\n\n')}
`;
await writeFile(path.join(OUT, 'fonts.css'), css, 'utf8');
console.log(`\n${blocks.length} arquivos woff2, ${(blocks.reduce((s, b) => s + b.bytes, 0) / 1024).toFixed(0)}kB no total`);
