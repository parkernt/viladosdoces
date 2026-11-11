# Design — "A vitrine de confeiteiro"

## Ideia

O site é a vitrine iluminada da Vila: creme, caramelo e cacau, tipografia de
confeitaria de bairro com acabamento de vitrine europeia, e a foto sempre como
protagonista. O funil vai da boca aberta ao pedido pronto no WhatsApp sem sair da
página.

O turquesa do selo da marca entra como único acento frio — é a cor real do logo da
confeitaria, que aparece nas embalagens e nos posts. Sem ele, o site ficaria bonito
e genérico.

## Tipografia

- **Playfair Display** (variável) — títulos, preços grandes, números de categoria.
  Itálico usado para a palavra-chave do hero e para citações.
- **Plus Jakarta Sans** (variável) — interface, corpo, rótulos em caixa alta
  espaçada, preços de tabela.
- **Great Vibes** — só o wordmark do logo e assinaturas ("feito com carinho").
  Subset latino apenas (42 kB), carregado depois das outras duas fontes.

Escala modular fluida em `clamp()` (`--step--2` a `--step-5`), entrelinha 1.08 nos
títulos, `text-wrap: balance` nos headings e `pretty` nos parágrafos.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#92400E` | botão principal, preço, foco (7.3:1 no creme) |
| `--color-primary-hover` | `#78350F` | hover do botão |
| `--color-accent` | `#A62639` | selos de destaque ("campeão de vendas") |
| `--color-brand` | `#0B7C93` | turquesa do selo, em texto sobre creme |
| `--color-brand-bright` | `#12B8D8` | preenchimento do selo e detalhes |
| `--color-background` | `#FFFDF8` | fundo creme baunilha |
| `--color-background-alt` | `#FBF4E8` | seções alternadas |
| `--color-foreground` | `#23120B` | texto principal (15.8:1) |
| `--color-foreground-muted` | `#5E453B` | descrições (7.6:1) |
| `--color-border` | `#F3E5CE` | fios e divisores |

**WhatsApp**: o verde oficial `#25D366` com texto branco reprova em contraste
(≈2.6:1). O botão usa `#0F7A5A` (4.9:1 com branco) e o `#25D366` fica só no anel de
pulso. Mesma leitura de marca, acessível.

## Layout

Container de 1240 px, gutter fluido, grade de 12 colunas nos blocos editoriais.
Seções com `padding-block` de 56 px a 112 px. Elevação em três níveis de sombra
quente (`--shadow-sm/md/lg`), bordas de 1 px e raios de 10/16/24 px. O arco
(`--arch`, 200 px no topo) marca as fotos de herói, como a moldura de uma vitrine.

Componentes: botão (primário, outline, ghost, WhatsApp, light), chip de categoria,
selo circular, card de produto 1:1, linha de cardápio com miniatura, opção em
cartão (radio/checkbox), passo de funil, resumo pegajoso e diálogo de zoom.

## Movimento

- Easing `cubic-bezier(.16,1,.3,1)`; entradas de 700 ms com revelação por
  `IntersectionObserver`.
- Hover de card: `translateY(-4px)` e sombra, sem deslocar o conteúdo vizinho.
- Zoom de foto: `scale(1.045)` em 700 ms.
- `prefers-reduced-motion`: nenhuma animação, nenhum canvas criado, conteúdo visível.

## WebGL

Quatro cenas, cada uma com seu contexto e pausa quando saem da tela
(`IntersectionObserver`) ou quando a aba está oculta.

| Cena | Onde | Técnica |
|---|---|---|
| `creme.js` | hero da home | FBM com domain warping, ondulação radial no ponteiro, brilho de glacê, grão para evitar banding |
| `drip.js` | foto do balcão (loja) e post do feed | máscara de colunas com ruído 1D, faixa que cresce com o scroll, brilho na borda do escorrido |
| `cake-view.js` | prévia do bolo em encomendas | raymarching de SDF (cilindro arredondado + prato), camadas de massa/recheio/cobertura por altura, Blinn-Phong, AO por passo, cores vindas do sabor |
| `core.js` | — | compilação de shader, quad único, DPR limitado, ponteiro suavizado, `?gl=off` |

Decisões e desvios do plano original, com motivo:

1. **Um canvas por cena, não um canvas global com `scissor`.** Com cenas em pontos
   distantes da página, o contexto por cena simplifica resize, descarte e fallback
   individual; o limite de ~16 contextos do navegador não é ameaçado (o site usa no
   máximo 3). O canvas global exigiria conteúdo acima dele, o que impede texto sobre
   o creme.
2. **Ondas analíticas em vez de simulação ping-pong em FBO.** Evita extensões de
   float buffer (principal fonte de falha em GPU móvel) e mantém o shader legível.
3. **Fallback sempre visível.** Sem WebGL, com `?gl=off` ou com movimento reduzido,
   as fotos assumem e o montador continua funcionando — a prévia 3D vira um aviso
   curto e o resto do funil não muda.

## Acessibilidade

- Contraste AA em texto e componentes; foco visível próprio em todos os
  interativos, inclusive sobre fundo escuro.
- Alvos de toque ≥ 44 px (botões 48 px, chips 44 px, links de menu 44 px).
- Menu móvel com `inert` fechado, foco preso, Escape e devolução de foco.
- Lightbox em `<dialog>` nativo: foco preso pelo navegador, setas e Escape.
- Passos do funil: `aria-current="step"`, título recebendo foco ao trocar de etapa,
  erros em lista com links para o campo.
- Canvas sempre `aria-hidden`; a informação mora no texto e no `alt`.
- Fotos com `width`/`height` e `aspect-ratio` — zero layout shift de imagem.
- Selo do hero e ícones decorativos fora da árvore de acessibilidade.

## Arquitetura de arquivos

```
assets/css/     tokens, base, layout, components, pages/*
assets/js/      main, nav, reveal, lightbox, menu-render, order-builder,
                order-message, ui, estado, gl/*
assets/data/    menu.js, kit-festa.js, images.js (gerado)
assets/fonts/   playfair-*, jakarta-*, great-vibes-* (woff2) + fonts.css
assets/img/     hero/, products/, loja/, instagram/, brand/ + manifest.json
assets/svg/     icons.svg (sprite), mapa-santos.svg
docs/           PRODUCT.md, DESIGN.md
tools/          pipeline de imagem/fonte, servidor e QA (fora do deploy)
```
