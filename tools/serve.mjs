// Servidor estático de desenvolvimento, sem dependências.
// node tools/serve.mjs [porta]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const RAIZ = resolve(process.cwd());
const PORTA = Number(process.argv[2] || process.env.PORT || 8003);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORTA}`);
    let caminho = decodeURIComponent(url.pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';

    const alvo = join(RAIZ, normalize(caminho).replace(/^(\.\.[/\\])+/, ''));
    if (!alvo.startsWith(RAIZ)) {
      res.writeHead(403).end('Fora do diretório servido');
      return;
    }

    let info;
    try {
      info = await stat(alvo);
    } catch {
      // rota amigável: /loja -> loja.html
      try {
        const html = `${alvo}.html`;
        info = await stat(html);
        const corpo = await readFile(html);
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        res.end(corpo);
        return;
      } catch {
        const naoAchou = await readFile(join(RAIZ, '404.html')).catch(() => Buffer.from('404'));
        res.writeHead(404, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        res.end(naoAchou);
        return;
      }
    }

    if (info.isDirectory()) {
      const index = join(alvo, 'index.html');
      const corpo = await readFile(index);
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      res.end(corpo);
      return;
    }

    const ext = extname(alvo).toLowerCase();
    const corpo = await readFile(alvo);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': corpo.length,
      'Cache-Control': ext === '.html' ? 'no-store' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(corpo);
  } catch (erro) {
    console.error(erro);
    res.writeHead(500).end('Erro interno do servidor de desenvolvimento');
  }
});

servidor.listen(PORTA, () => {
  console.log(`Vila dos Doces em http://localhost:${PORTA}`);
});
