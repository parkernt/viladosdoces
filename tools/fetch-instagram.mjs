// Coleta fotos públicas do @viladosdoces.santos.
//
// Instagram bloqueia o perfil anônimo, mas o crawler SEO do Bing indexa as imagens
// do perfil. Cada resultado traz o título do post ("vila dos doces santos | ..."),
// o que permite verificar que a foto é da conta. O media_id respondido pelo
// lookaside do Instagram redireciona para o post; /p/<shortcode>/media/?size=l
// entrega a foto original.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const OUT = path.resolve('assets/_raw/ig');
const MANIFEST = path.resolve('assets/_raw/ig-manifest.json');
await mkdir(OUT, { recursive: true });

const QUERIES = [
  'viladosdoces.santos',
  'vila dos doces santos bolo',
  'vila dos doces santos confeitaria',
  'viladosdoces santos salgados',
  'vila dos doces vila belmiro',
  'vila dos doces santos instagram',
  'vila dos doces santos kit festa',
  'viladosdoces.santos bolo confeitado',
];
// Marca d'água dos títulos indexados do perfil.
const OURS = /vila dos doces santos|viladosdoces/i;
const decode = s => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const found = new Map(); // mediaId -> { title, purl }

for (const [qi, q] of QUERIES.entries()) {
  for (const first of [1, 36, 71, 106]) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=${first}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' } });
      const html = await res.text();
      let n = 0;
      for (const m of html.matchAll(/m="(\{&quot;sid&quot;[\s\S]*?)"/g)) {
        let j;
        try { j = JSON.parse(decode(m[1])); } catch { continue; }
        if (!OURS.test(j.t || '')) continue;
        const mid = (j.murl || '').match(/media_id=(\d+)/)?.[1];
        if (!mid || found.has(mid)) continue;
        found.set(mid, { title: (j.t || '').replace(/\s+/g, ' ').trim(), purl: j.purl });
        n++;
      }
      console.log(`q${qi}:${first} "${q}" -> +${n} (total ${found.size})`);
    } catch (e) {
      console.log(`q${qi}:${first} falhou: ${e.message}`);
    }
    await sleep(500);
  }
}

const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {};
let ok = 0, fail = 0;
const ids = [...found.keys()];
for (const mediaId of ids) {
  if (manifest[mediaId]?.file) continue;
  try {
    const res = await fetch(`https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=${mediaId}`, {
      redirect: 'manual', headers: { 'User-Agent': UA },
    });
    const loc = res.headers.get('location') || '';
    const shortcode = loc.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1];
    if (!shortcode) { fail++; continue; }
    const media = await fetch(`https://www.instagram.com/p/${shortcode}/media/?size=l`, { headers: { 'User-Agent': UA } });
    if (!media.ok || !(media.headers.get('content-type') || '').startsWith('image/')) { fail++; continue; }
    const buf = Buffer.from(await media.arrayBuffer());
    const file = `ig-${shortcode}.jpg`;
    await writeFile(path.join(OUT, file), buf);
    manifest[mediaId] = { shortcode, file, bytes: buf.length, title: found.get(mediaId).title, purl: found.get(mediaId).purl };
    console.log(`  ok ${shortcode} ${(buf.length / 1024).toFixed(0)}kB  ${found.get(mediaId).title.slice(0, 80)}`);
    ok++;
    await sleep(300);
  } catch (e) {
    fail++;
  }
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nbaixadas ${ok}, falhas ${fail}, manifesto ${Object.keys(manifest).length}`);
