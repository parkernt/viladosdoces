# Produto — Vila dos Doces Confeitaria

## O que é

Site institucional e de encomendas da **Vila dos Doces Confeitaria**, confeitaria
artesanal na Vila Belmiro, em Santos/SP, aberta em 2015. HTML, CSS e JavaScript
puros: nenhuma dependência em runtime, fontes hospedadas localmente e efeitos em
WebGL escrito à mão.

## Para quem

- **Freguês de bairro**, que passa na frente da loja e quer ver a vitrine do dia.
- **Quem vai comemorar**, procurando kit festa com bolo, doces e salgados sem
  precisar ligar: monta no site e envia pelo WhatsApp.
- **Buffets e empresas** de Santos, que precisam de salgados em volume.

## Objetivos comerciais

1. Tirar a encomenda do "manda mensagem que eu explico" e transformar em um pedido
   estruturado, com quantidades e valor estimado, já pronto no WhatsApp.
2. Tornar visíveis as informações que mais geram pergunta no balcão: endereço,
   horário, prazo de antecedência e formas de pagamento.
3. Mostrar o produto com fotografia real — bolo, salgado, docinho, balcão —, porque
   doce se vende com os olhos.

## Oferta

| Linha | Como é vendida | Observação |
|---|---|---|
| Bolos confeitados e naked cakes | por quilo, mínimo 1,5 kg | 48h de antecedência |
| Bolos caseiros e de vitrine | por quilo | assados diariamente |
| Tortas e sobremesas | por unidade | o balcão muda todo dia |
| Docinhos finos | por cento (100 un.) | tradicionais e recheados |
| Salgados de festa | por cento (100 un.) | produção passa de 3 mil/dia |
| Kits festa | valor fechado | 10 a 100 convidados |

## Fatos usados no site

- Fundada em 2015 por **Marcelo Correa**, de família com tradição em panificação.
- Consultoria de um ex-funcionário da **Confeitaria Viena**, referência de Santos que
  fechou em 2015 — daí as receitas "Tradição Viena".
- **16 pessoas** na produção; mais de **3 mil salgados por dia**.
- Fornece para buffets de Santos.
- **R. Dr. Carvalho de Mendonça, 452 — Vila Belmiro, Santos/SP**
- WhatsApp encomendas: **(13) 99205-1188** · fixo: **(13) 3349-8988**
- Segunda a sábado, **09h30 às 20h**.

Fontes: matéria do Juicy Santos (ago/2023) e perfis públicos da confeitaria.

## Pendências de conteúdo (antes do deploy)

1. **Preços**: todos os valores do cardápio e dos kits são referência. Precisam ser
   confirmados pela confeitaria na data de publicação.
2. **Domingos e feriados**: o site informa "sob consulta"; confirmar se haverá
   atendimento de balcão.
3. **iFood / delivery próprio**: o site só menciona WhatsApp. Se houver iFood,
   incluir o link na página da loja.
4. **Fotos**: o acervo público cobre bolos, salgados e balcão. Faltam fotos de
   docinhos em close, interior/fachada atualizada e bastidores.
5. **Kit festa**: confirmar a composição de cada tamanho (o site usa bolo + salgados
   + docinhos proporcionais ao número de convidados).

## Como medir

- Cliques em "Enviar pedido no WhatsApp" (link `wa.me` com mensagem estruturada).
- Cliques em "Encomendar" por item do cardápio (sabemos qual produto puxa pedido).
- Busca do cardápio: termos mais digitados revelam o que falta no cardápio.
- Core Web Vitals: LCP e CLS medidos em `tools/qa-report.md`.
