// Integridade: todo arquivo local referenciado existe e nada de CDN em runtime.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const RAIZ = process.cwd();
const PAGINAS = ['index.html', 'cardapio.html', 'encomendas.html', 'loja.html', '404.html'];
const problemas = [];
const externos = new Set();

const existe = async rel => {
  try {
    await stat(path.join(RAIZ, rel));
    return true;
  } catch {
    return false;
  }
};

const limpar = url => url.split('#')[0].split('?')[0];

for (const pagina of PAGINAS) {
  const html = await readFile(pagina, 'utf8');

  // src/href locais
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith('http')) {
      externos.add(new URL(url).host);
      continue;
    }
    if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) continue;
    const alvo = limpar(url);
    if (!(await existe(alvo))) problemas.push(`${pagina}: arquivo ausente → ${alvo}`);
  }

  // srcset das imagens
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const alvo = limpar(parte.trim().split(/\s+/)[0]);
      if (!alvo) continue;
      if (!(await existe(alvo))) problemas.push(`${pagina}: srcset ausente → ${alvo}`);
    }
  }

  // sprites de ícones
  for (const m of html.matchAll(/href="(assets\/svg\/icons\.svg#[^"]+)"/g)) {
    const [arquivo, id] = m[1].split('#');
    const svg = await readFile(arquivo, 'utf8');
    if (!svg.includes(`id="${id}"`)) problemas.push(`${pagina}: ícone #${id} não existe no sprite`);
  }
}

// CSS: url() e @import
const cssDir = 'assets/css';
const cssArquivos = [];
const andar = async dir => {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const alvo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) await andar(alvo);
    else if (entrada.name.endsWith('.css')) cssArquivos.push(alvo);
  }
};
await andar(cssDir);

for (const arquivo of cssArquivos) {
  const css = await readFile(arquivo, 'utf8');
  for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const url = m[1];
    if (url.startsWith('data:')) continue;
    const alvo = path.normalize(path.join(path.dirname(arquivo), limpar(url)));
    if (!(await existe(alvo))) problemas.push(`${arquivo}: url() ausente → ${alvo}`);
  }
  for (const m of css.matchAll(/@import\s+url\(['"]?([^'")]+)['"]?\)/g)) {
    const alvo = path.normalize(path.join(path.dirname(arquivo), limpar(m[1])));
    if (!(await existe(alvo))) problemas.push(`${arquivo}: @import ausente → ${alvo}`);
  }
}

// JS: imports relativos
const jsDir = 'assets/js';
const jsArquivos = [];
const andarJs = async dir => {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const alvo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) await andarJs(alvo);
    else if (entrada.name.endsWith('.js')) jsArquivos.push(alvo);
  }
};
await andarJs(jsDir);
for (const arquivo of jsArquivos) {
  const js = await readFile(arquivo, 'utf8');
  for (const m of js.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const alvo = path.normalize(path.join(path.dirname(arquivo), m[1]));
    if (!(await existe(alvo))) problemas.push(`${arquivo}: import ausente → ${alvo}`);
  }
}

// Toda imagem do manifesto precisa existir nos três formatos
const imagens = await import('../assets/data/images.js').then(m => m.IMAGENS).catch(() => ({}));
for (const [slug, dados] of Object.entries(imagens)) {
  for (const largura of dados.widths) {
    for (const ext of ['avif', 'webp', 'jpg']) {
      const alvo = `assets/img/${dados.folder}/${slug}-${largura}.${ext}`;
      if (!(await existe(alvo))) problemas.push(`manifesto: ${alvo} ausente`);
    }
  }
}

const permitidos = ['wa.me', 'api.whatsapp.com', 'www.google.com', 'waze.com', 'www.instagram.com', 'viladosdoces.com.br'];
const inesperados = [...externos].filter(host => !permitidos.includes(host));

console.log(`arquivos verificados: ${cssArquivos.length} CSS, ${jsArquivos.length} JS, ${Object.keys(imagens).length} fotos`);
console.log(`domínios externos: ${[...externos].join(', ') || 'nenhum'}`);
if (inesperados.length) console.log(`! domínios inesperados: ${inesperados.join(', ')}`);
if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  problemas.slice(0, 40).forEach(p => console.log(' -', p));
  process.exitCode = 1;
} else {
  console.log('\nOK: todas as referências locais existem.');
}

if (inesperados.length) {
  // CDN em runtime é proibido pelo plano
  process.exitCode = 1;
  console.log('FALHA: dependência externa em runtime.');
}
