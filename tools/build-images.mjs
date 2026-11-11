// Gera AVIF/WebP/JPG responsivos + LQIP a partir das fotos originais em assets/_raw.
// Ferramenta de desenvolvimento: o site em produção usa apenas o resultado em assets/img.
import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const RAW = 'assets/_raw';
const OUT = 'assets/img';

// Árvore de arquivos (como o <picture> vai precisar) e origem de cada foto.
const PHOTOS = [
  { slug: 'hero-camadas', folder: 'hero', src: 'juicy-01.jpg', sizes: [640, 1024, 1600, 2400], alt: 'Fatia alta de bolo de chocolate em camadas, com brigadeiro, morangos e raspas de chocolate, em prato preto' },
  { slug: 'bolo-ferrero', folder: 'products', src: 'juicy-03.jpg', featured: true, alt: 'Bolo confeitado com chantilly, chocolate ao leite e bombons, sobre prato de vidro' },
  { slug: 'bolo-brigadeiro', folder: 'products', src: 'ig/ig-DIgWgQUsQfX.jpg', featured: true, alt: 'Bolo de chocolate coberto com brigadeiro e bombons, com o selo da Vila dos Doces' },
  { slug: 'bolo-brigadeiro-bolas', folder: 'products', src: 'ig/ig-DIlf75QgRWu.jpg', featured: true, alt: 'Bolo de brigadeiro com bolas de chocolate e raspas ao redor' },
  { slug: 'bolo-confete', folder: 'products', src: 'ig/ig-C_-d2BOvULg.jpg', featured: true, alt: 'Bolo confeitado com suspiros, morangos e raspas de chocolate' },
  { slug: 'bolo-chocolate-granulado', folder: 'products', src: 'ig/ig-DGLASKuzrug.jpg', alt: 'Bolo de chocolate com granulado e cobertura espessa sobre prato' },
  { slug: 'bolo-mesclado', folder: 'products', src: 'ig/ig-DG0M2YLN-oK.jpg', alt: 'Bolo escuro com cobertura branca salpicada de chocolate' },
  { slug: 'pudim-ganache', folder: 'products', src: 'ig/ig-DGX4MP8twDn.jpg', featured: true, alt: 'Bolo de pudim com ganache de chocolate e biscoitos ao redor, em suporte de vidro' },
  { slug: 'torta-maca', folder: 'products', src: 'ig/ig-DHdZ0TRND3p.jpg', featured: true, alt: 'Torta rústica de maçã com farofa crocante e ameixas' },
  { slug: 'torta-morango', folder: 'products', src: 'ig/ig-DIoErphztay.jpg', featured: true, alt: 'Torta de morangos frescos sobre creme, com borda crocante' },
  { slug: 'torta-morango-alta', folder: 'products', src: 'ig/ig-DJWbDTCNUOZ.jpg', alt: 'Torta de morango com creme e base crocante vista de cima' },
  { slug: 'bolo-fuba', folder: 'products', src: 'ig/ig-DJeJSlFx4lY.jpg', alt: 'Bolo de fubá com açúcar de confeiteiro e rosquinhas de chocolate ao lado' },
  { slug: 'salgados-assados', folder: 'products', src: 'juicy-02.jpg', featured: true, alt: 'Salgados dourados de festa em forminhas brancas sobre bandeja' },
  { slug: 'balcao', folder: 'loja', src: 'atribuna.jpg', featured: true, alt: 'Balcão da Vila dos Doces com bolinhos cobertos de geleia e doces ao lado de uma bandeira de Portugal' },
  { slug: 'bolo-rosas', folder: 'loja', src: 'orla-01.jpeg', alt: 'Bolo de chocolate com rosas de chantilly, morangos e o selo da Vila dos Doces' },
  { slug: 'feed-kit-chocolate', folder: 'instagram', src: 'ig/ig-DG28WzBTJQa.jpg', square: true, alt: 'Post da Vila dos Doces: kit festa com bolo de chocolate e doces' },
  { slug: 'feed-kit-arraia', folder: 'instagram', src: 'ig/ig-DKfmJChOvdn.jpg', square: true, alt: 'Post da Vila dos Doces: kit festa junina' },
];

const FORMATS = [
  { ext: 'avif', opts: { quality: 55, effort: 5 } },
  { ext: 'webp', opts: { quality: 75 } },
  { ext: 'jpg', opts: { quality: 80, mozjpeg: true } },
];

const manifest = {};
let total = 0;

for (const p of PHOTOS) {
  const srcPath = path.join(RAW, p.src);
  await stat(srcPath).catch(() => { throw new Error(`origem ausente: ${srcPath}`); });
  const img = sharp(srcPath);
  const meta = await img.metadata();

  // LQIP: miniatura borrada embutida em data URI (evita "salto" no carregamento)
  const lqip = await sharp(srcPath).resize(24, null, { fit: 'inside' }).blur(1.4).webp({ quality: 40 }).toBuffer();

  const dir = path.join(OUT, p.folder);
  await mkdir(dir, { recursive: true });

  const widths = p.sizes || (p.featured ? [480, 960, 1600] : [480, 960]);
  const files = [];
  for (const w of widths.filter(w => w <= Math.max(meta.width, 480))) {
    for (const f of FORMATS) {
      const name = `${p.slug}-${w}.${f.ext}`;
      const target = path.join(dir, name);
      let pipe = sharp(srcPath).rotate();
      if (p.square) pipe = pipe.resize(w, w, { fit: 'cover', position: 'attention' });
      else pipe = pipe.resize({ width: w, withoutEnlargement: true });
      const buf = await pipe.toFormat(f.ext, f.opts).toBuffer();
      await writeFile(target, buf);
      total += buf.length;
      files.push({ file: `${p.folder}/${name}`, w, ext: f.ext, bytes: buf.length });
    }
  }

  manifest[p.slug] = {
    folder: p.folder,
    widths,
    ratio: +(meta.width / meta.height).toFixed(4),
    w: meta.width,
    h: meta.height,
    alt: p.alt,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    files,
  };
  console.log(`${p.slug}: ${files.length} arquivos`);
}

await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Módulo ES com os dados de imagem: o site importa isso estaticamente (sem fetch,
// sem atraso de renderização) para montar <picture> com width/height corretos.
const jsEntries = Object.entries(manifest).map(([slug, m]) => {
  const larguras = [...new Set(m.files.map(f => f.w))].sort((a, b) => a - b);
  return `  "${slug}": ${JSON.stringify({ folder: m.folder, alt: m.alt, w: m.w, h: m.h, ratio: m.ratio, lqip: m.lqip, widths: larguras })},`;
});
const modulo = `/** Gerado por tools/build-images.mjs — não editar à mão. */
export const IMAGENS = {
${jsEntries.join('\n')}
};

/** Menor largura disponível para um slug. */
export const larguraBase = slug => IMAGENS[slug]?.widths?.[0] ?? 480;

/** URL de uma variante (ext: avif | webp | jpg). */
export const urlImagem = (slug, largura, ext = 'jpg') =>
  \`assets/img/\${IMAGENS[slug].folder}/\${slug}-\${largura}.\${ext}\`;
`;
await writeFile(path.resolve('assets/data/images.js'), modulo, 'utf8');
console.log('assets/data/images.js gerado');

// OG image 1200x630 com a assinatura da marca
const ogBase = await sharp(path.join(RAW, 'juicy-01.jpg')).resize(1200, 630, { fit: 'cover', position: 'centre' }).toBuffer();
const ogText = Buffer.from(`<svg width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#23120B" stop-opacity=".82"/>
    <stop offset=".55" stop-color="#23120B" stop-opacity=".35"/>
    <stop offset="1" stop-color="#23120B" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="72" y="470" font-family="Georgia,serif" font-size="66" fill="#FFFDF8">A tradição da Vila Belmiro</text>
  <text x="72" y="536" font-family="Georgia,serif" font-size="34" fill="#F3E5CE">Vila dos Doces Confeitaria — desde 2015</text>
</svg>`);
await mkdir(path.join(OUT, 'brand'), { recursive: true });
await sharp(ogBase).composite([{ input: ogText, top: 0, left: 0 }]).jpeg({ quality: 82 }).toFile(path.join(OUT, 'brand', 'og.jpg'));
console.log(`og.jpg gerado`);
console.log(`\n${PHOTOS.length} fotos, ${(total / 1024 / 1024).toFixed(1)}MB em assets/img`);
