/**
 * Suíte de QA do site: acessibilidade (axe-core), console limpo, responsividade,
 * Core Web Vitals e fluxo do montador de encomendas.
 *
 * Uso: node tools/qa.mjs [--full]   (--full inclui 1024px e todos os prints)
 * Requer o servidor: node tools/serve.mjs 8003
 */
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:8003';
const FULL = process.argv.includes('--full');
const PAGINAS = [
  { arquivo: 'index.html', nome: 'home' },
  { arquivo: 'cardapio.html', nome: 'cardapio' },
  { arquivo: 'encomendas.html', nome: 'encomendas' },
  { arquivo: 'loja.html', nome: 'loja' },
  { arquivo: '404.html', nome: '404' },
];
const LARGURAS = FULL ? [375, 768, 1024, 1440] : [375, 1440];

const SHOTS = path.resolve('tools/shots');
await mkdir(SHOTS, { recursive: true });

const relatorio = { geradoEm: new Date().toISOString(), base: BASE, paginas: [], resumo: {} };

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--font-render-hinting=none'],
});

async function novaPagina(largura, altura = 900) {
  const page = await browser.newPage();
  await page.setViewport({ width: largura, height: altura, deviceScaleFactor: 1 });
  const log = { erros: [], avisos: [], falhas: [], respostas404: [] };
  page.on('console', m => {
    if (m.type() === 'error') log.erros.push(m.text());
    if (m.type() === 'warning') log.avisos.push(m.text());
  });
  page.on('pageerror', e => log.erros.push(`pageerror: ${e.message}`));
  page.on('requestfailed', r => {
    const erro = r.failure()?.errorText || '';
    if (!/ERR_ABORTED/.test(erro)) log.falhas.push(`${r.url()} ${erro}`);
  });
  page.on('response', r => {
    if (r.status() >= 400) log.respostas404.push(`${r.status()} ${r.url()}`);
  });
  return { page, log };
}

async function rolarTudo(page) {
  await page.evaluate(async () => {
    const passo = Math.max(320, window.innerHeight * 0.7);
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 90));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 250));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 250));
  });
}

for (const pagina of PAGINAS) {
  for (const largura of LARGURAS) {
    const { page, log } = await novaPagina(largura);
    await page.goto(`${BASE}/${pagina.arquivo}`, { waitUntil: 'networkidle0', timeout: 90000 });
    await rolarTudo(page);
    await new Promise(r => setTimeout(r, 400));

    // axe-core
    await page.addScriptTag({ path: path.resolve('tools/node_modules/axe-core/axe.min.js') });
    const axe = await page.evaluate(async () => {
      const resultado = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
      });
      return resultado.violations.map(v => ({
        id: v.id,
        impacto: v.impact,
        descricao: v.help,
        nos: v.nodes.length,
        alvos: v.nodes.slice(0, 3).map(n => n.target.join(' ')),
      }));
    });

    const layout = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      gl: document.documentElement.getAttribute('data-gl'),
      canvases: document.querySelectorAll('canvas').length,
      itens: document.querySelectorAll('[data-item]').length,
      imagens: document.images.length,
      semAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
      altura: document.body.scrollHeight,
      h1: document.querySelectorAll('h1').length,
    }));

    await page.screenshot({ path: path.join(SHOTS, `${pagina.nome}-${largura}.png`), fullPage: true });

    relatorio.paginas.push({ pagina: pagina.nome, largura, axe, layout, console: log });
    const graves = axe.filter(v => v.impacto === 'serious' || v.impacto === 'critical');
    console.log(
      `${pagina.nome} @${largura}: axe ${axe.length} (graves ${graves.length}), console ${log.erros.length}, 404 ${log.respostas404.length}, overflow ${layout.overflowX}`,
    );
    await page.close();
  }
}

/* --- Core Web Vitals na home ----------------------------------------- */
{
  const { page, log } = await novaPagina(1440);
  await page.evaluateOnNewDocument(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver(lista => {
      for (const entrada of lista.getEntries()) window.__vitals.lcp = entrada.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(lista => {
      for (const entrada of lista.getEntries()) {
        if (!entrada.hadRecentInput) window.__vitals.cls += entrada.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle0' });
  await rolarTudo(page);
  const vitals = await page.evaluate(() => window.__vitals);
  const ttfb = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return nav ? nav.responseStart - nav.requestStart : null;
  });
  relatorio.vitals = { ...vitals, ttfb };
  relatorio.paginas.push({ pagina: 'home', largura: 1440, vitals: 'coletado', console: log });
  console.log(`vitals: LCP ${Math.round(vitals.lcp)}ms, CLS ${vitals.cls.toFixed(4)}`);
  await page.close();
}

/* --- Fluxo do montador ----------------------------------------------- */
{
  const { page, log } = await novaPagina(1440);
  await page.goto(`${BASE}/encomendas.html`, { waitUntil: 'networkidle0' });
  const fluxo = { etapas: [], total: null, wa: null, erro: null };
  try {
    // passo 1
    await page.evaluate(() => document.querySelector('input[name="tamanho"][value="20"]').click());
    await page.click('[data-step="1"] [data-next]');
    await page.waitForSelector('[data-step="2"]:not([hidden])', { timeout: 5000 });
    fluxo.etapas.push('passo 1 → 2');

    // passo 2
    await page.select('select[name="bolo"]', 'ninho-morango');
    await page.evaluate(() => document.querySelector('input[name="docinhos"][value="brigadeiro"]').click());
    await page.evaluate(() => document.querySelector('input[name="docinhos"][value="beijinho"]').click());
    await page.evaluate(() => document.querySelector('input[name="salgados"][value="coxinha"]').click());
    await page.evaluate(() => document.querySelector('input[name="extras"][value="descartaveis"]').click());
    await page.waitForFunction(() => document.querySelector('[data-total]')?.textContent?.includes('R$'));
    await page.click('[data-step="2"] [data-next]');
    await page.waitForSelector('[data-step="3"]:not([hidden])', { timeout: 5000 });
    fluxo.etapas.push('passo 2 → 3');

    // passo 3
    await page.type('#campo-nome', 'Ana Teste');
    await page.evaluate(() => {
      const campo = document.querySelector('#campo-data');
      const d = new Date();
      d.setDate(d.getDate() + 6);
      campo.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      campo.dispatchEvent(new Event('change', { bubbles: true }));
    });
    fluxo.total = await page.$eval('[data-total]', el => el.textContent.trim());
    fluxo.wa = await page.$eval('aside [data-wa]', el => el.href);
    fluxo.etapas.push('passo 3 preenchido');

    // validação: data inválida deve barrar
    await page.evaluate(() => {
      const campo = document.querySelector('#campo-data');
      campo.value = '2020-01-01';
      campo.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.evaluate(() => document.querySelector('aside [data-wa]').click());
    const erroVisivel = await page.evaluate(() => !document.querySelector('[data-form-errors]').hidden);
    fluxo.validacaoBarraDataPassada = erroVisivel;
    await page.close();
    relatorio.fluxo = { ...fluxo, console: log };
    console.log(`fluxo: ${fluxo.etapas.join(' · ')} · total ${fluxo.total}`);
  } catch (erro) {
    relatorio.fluxo = { ...fluxo, erro: erro.message, console: log };
    console.log('fluxo falhou:', erro.message);
    await page.close();
  }
}

/* --- Sem WebGL / movimento reduzido ---------------------------------- */
{
  const { page } = await novaPagina(1440);
  await page.goto(`${BASE}/index.html?gl=off`, { waitUntil: 'networkidle0' });
  const semGl = await page.evaluate(() => ({
    gl: document.documentElement.getAttribute('data-gl'),
    canvasVisiveis: [...document.querySelectorAll('canvas')].filter(c => c.offsetParent !== null).length,
    heroVisivel: !!document.querySelector('.hero__title')?.textContent,
    conteudoVisivel: document.querySelector('[data-reveal]')?.classList.contains('is-visible') ?? null,
  }));
  relatorio.semGl = semGl;
  console.log('sem WebGL:', JSON.stringify(semGl));
  await page.close();
}

await browser.close();

/* --- Resumo ----------------------------------------------------------- */
const todas = relatorio.paginas.filter(p => p.axe);
const graves = todas.flatMap(p => p.axe.filter(v => v.impacto === 'serious' || v.impacto === 'critical').map(v => ({ ...v, pagina: p.pagina, largura: p.largura })));
const consoleErros = todas.flatMap(p => p.console.erros.map(e => ({ pagina: p.pagina, largura: p.largura, erro: e })));
const nao404 = relatorio.paginas.filter(p => p.console?.respostas404?.length);
const overflow = todas.filter(p => p.layout.overflowX);

relatorio.resumo = {
  combinacoes: todas.length,
  violacoesAxe: todas.reduce((s, p) => s + p.axe.length, 0),
  violacoesGraves: graves.length,
  errosConsole: consoleErros.length,
  respostas404: nao404.length,
  overflowHorizontal: overflow.length,
  vitals: relatorio.vitals,
};

await writeFile('tools/qa-report.json', JSON.stringify(relatorio, null, 2));

const md = `# QA — Vila dos Doces Confeitaria

Gerado em ${relatorio.geradoEm} contra ${BASE}.

## Resumo

| Verificação | Resultado |
|---|---|
| Combinações página × largura | ${relatorio.resumo.combinacoes} |
| Violações axe-core | ${relatorio.resumo.violacoesAxe} (graves: ${relatorio.resumo.violacoesGraves}) |
| Erros de console | ${relatorio.resumo.errosConsole} |
| Respostas HTTP ≥ 400 | ${relatorio.resumo.respostas404} |
| Overflow horizontal | ${relatorio.resumo.overflowHorizontal} |
| LCP (headless, sem throttling) | ${Math.round(relatorio.vitals?.lcp ?? 0)} ms |
| CLS | ${(relatorio.vitals?.cls ?? 0).toFixed(4)} |

## axe-core por página

| Página | Largura | Violações | Graves |
|---|---|---|---|
${todas.map(p => `| ${p.pagina} | ${p.largura} | ${p.axe.length} | ${p.axe.filter(v => v.impacto === 'serious' || v.impacto === 'critical').length} |`).join('\n')}

${graves.length ? `## Violações graves\n\n${graves.map(v => `- **${v.pagina} @${v.largura}** — ${v.id} (${v.impacto}): ${v.descricao}\n  - ${v.alvos.join(', ')}`).join('\n')}` : '## Violações graves\n\nNenhuma violação serious/critical.'}

${consoleErros.length ? `## Erros de console\n\n${consoleErros.map(e => `- ${e.pagina} @${e.largura}: ${e.erro}`).join('\n')}` : '## Console\n\nNenhum erro ou exceção.'}

## Montador de encomendas

- Etapas: ${relatorio.fluxo?.etapas?.join(' → ') ?? 'não executado'}
- Total exibido: ${relatorio.fluxo?.total ?? '—'}
- Link do WhatsApp: ${relatorio.fluxo?.wa ? 'gerado' : '—'}
- Erro: ${relatorio.fluxo?.erro ?? 'nenhum'}

## Sem WebGL / movimento reduzido

- \`data-gl\`: ${relatorio.semGl?.gl ?? '—'}
- Canvas visíveis: ${relatorio.semGl?.canvasVisiveis ?? '—'}
- Título do hero visível: ${relatorio.semGl?.heroVisivel ? 'sim' : 'não'}
`;
await writeFile('tools/qa-report.md', md);
console.log('\nrelatório: tools/qa-report.md');
console.log(JSON.stringify(relatorio.resumo, null, 2));
