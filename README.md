# Vila dos Doces Confeitaria — site

Site multipágina da Vila dos Doces Confeitaria (Vila Belmiro, Santos/SP, desde 2015):
HTML, CSS e JavaScript puros, **sem nenhuma dependência em runtime**, fontes
hospedadas localmente, fotos reais da marca e efeitos em **WebGL escrito à mão**
(creme vivo no hero, calda escorrendo nas fotos e bolo 3D procedural).

## Rodar

```bash
node tools/serve.mjs        # http://localhost:8003
```

ES modules e texturas WebGL não funcionam por `file://` — por isso o servidor sem
dependências em `tools/`. Em produção, qualquer hospedagem estática serve (Vercel,
Netlify, Cloudflare Pages, GitHub Pages): o site é um conjunto de arquivos.

## Páginas

| Página | O que tem |
|---|---|
| `index.html` | hero com creme em WebGL, história (Viena, 2015, 16 pessoas), vitrine de 6 destaques, kits festa, feed do Instagram, mapa da Vila Belmiro |
| `cardapio.html` | 74 itens em 7 categorias, busca com normalização de acento, chips com scroll-spy, preço por quilo/cento/unidade e pedido direto no WhatsApp |
| `encomendas.html` | funil de 3 etapas (convidados → bolo/doces/salgados → entrega), total ao vivo, prévia 3D do bolo e mensagem estruturada no WhatsApp |
| `loja.html` | galeria com zoom, horários, pagamento, entrega, mapa, como chegar e dúvidas |
| `404.html` | "Esse bolo já saiu da vitrine." |

## Pipeline (só desenvolvimento — nunca vai para o deploy)

```bash
cd tools
npm i                        # sharp, puppeteer-core, axe-core
node fetch-fonts.mjs         # woff2 locais do Google Fonts + fonts.css
node fetch-instagram.mjs     # fotos públicas do @viladosdoces.santos
node build-images.mjs        # AVIF/WebP/JPG 480/960/1600/2400 + LQIP + images.js
node build-icons.mjs         # favicons e ícones de PWA
node serve.mjs               # servidor local
node check-assets.mjs        # integridade: toda referência local existe, zero CDN
node --test test-order.mjs   # 17 testes de cálculo, validação e mensagem
node qa.mjs --full           # axe-core, console, 4 larguras, vitals, fluxo
```

`node qa.mjs` (sem `--full`) roda 375 e 1440; `--full` inclui 768 e 1024.

## Estrutura

```
assets/css/      tokens, base, layout, components, pages/{home,cardapio,encomendas,loja}
assets/js/       main, nav, reveal, lightbox, menu-render, order-builder,
                 order-message, ui, estado, gl/{core,creme,drip,cake-view,index}
assets/data/     menu.js (74 itens), kit-festa.js, images.js (gerado)
assets/fonts/    Playfair Display, Plus Jakarta Sans e Great Vibes (woff2, OFL)
assets/img/      hero, products, loja, instagram, brand + manifest.json
assets/svg/      icons.svg (sprite de 24 ícones), mapa-santos.svg
docs/            PRODUCT.md (marca, oferta, pendências) e DESIGN.md (sistema visual)
tools/           pipeline e QA
```

## Resultado da auditoria (`tools/qa-report.md`)

| Verificação | Resultado |
|---|---|
| axe-core (WCAG 2.1 AA + best practices) | **0 violações** em 20 combinações página × largura (375, 768, 1024, 1440) |
| Erros de console / exceções | **0** |
| Respostas HTTP ≥ 400 | **0** |
| Overflow horizontal | **0** |
| LCP (headless, sem throttling) | **~120–170 ms** |
| CLS | **0,040** (troca de fonte do Playfair; dentro de "bom") |
| Fluxo do montador | 1 → 2 → 3, total R$ 314,00 e link `wa.me` com mensagem codificada |
| Sem WebGL (`?gl=off`) e movimento reduzido | nenhum canvas criado, conteúdo completo visível |
| Testes unitários | **17/17** |

Telas em `tools/shots/` (geradas pelo QA, fora do git).

## Dependências de runtime

Nenhuma. O `check-assets.mjs` falha se aparecer domínio externo fora dos links de
contato (WhatsApp, Instagram, Google Maps, Waze). Fontes são `woff2` locais e as
imagens têm `srcset` em AVIF/WebP/JPG.

## Fotos

Fotografia real da confeitaria: posts públicos do **@viladosdoces.santos**,
divulgação do **Juicy Santos** (fotos de @dougsant8s) e **Jornal da Orla**. O selo
da marca aparece nas fotos de bolo (tag de chocolate) e nos posts de kit festa.
Antes do deploy, vale trocar por originais da própria confeitaria em alta resolução
— o `build-images.mjs` recebe qualquer JPG/PNG em `assets/_raw`.

## Pendências de conteúdo

1. Confirmar **preços** de cardápio e kits na data de publicação (os atuais são de
   referência, e o site avisa isso em três lugares).
2. Confirmar atendimento de **domingos e feriados**.
3. Decidir se haverá **iFood** ou delivery próprio além do WhatsApp.
4. Fotos que faltam: docinhos em close, fachada atualizada e bastidores.
5. Revisar a composição de cada tamanho de kit com a produção.

## Decisões técnicas

- **Um canvas WebGL por cena**, pausado fora da tela e com DPR limitado; o site usa
  no máximo 3 contextos, longe do limite do navegador (ver `docs/DESIGN.md`).
- **Shaders analíticos** em vez de FBO ping-pong: evita extensões de float buffer,
  principal causa de falha em GPU móvel.
- **Ordem do cardápio renderizada no cliente** a partir de `assets/data/menu.js`,
  com `<noscript>` apontando para o WhatsApp — 74 itens em um HTML leve.
- **Verde do WhatsApp** escurecido para `#0F7A5A` (4,9:1 com texto branco); o
  `#25D366` fica no anel de pulso.
- **Turquesa do selo** (`#12B8D8`) entra como acento de marca, tirado do logo real.
