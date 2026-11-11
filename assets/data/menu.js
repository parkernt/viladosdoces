/**
 * Cardápio da Vila dos Doces Confeitaria — Santos/SP.
 *
 * `preco` em reais. `unidade` diz como o item é vendido:
 *   kg    → preço por quilo (bolos confeitados e caseiros)
 *   cento → preço por cento (salgados e docinhos de festa)
 *   un    → preço unitário
 *   kit   → preço fechado do kit
 *
 * `foto` aponta para assets/img/products/<slug> (ver manifest.json).
 * Fotos reais do balcão e do Instagram @viladosdoces.santos.
 */

export const CATEGORIAS = [
  {
    id: "bolos-confeitados",
    nome: "Bolos Confeitados & Festivos",
    resumo: "O centro da mesa: camadas generosas, cobertura de verdade e acabamento de vitrine.",
    nota: "Preço por quilo. Bolos a partir de 1,5 kg, prontos em 48 h.",
  },
  {
    id: "naked-cakes",
    nome: "Naked Cakes & Frutas Vermelhas",
    resumo: "Massa aparente, creme leve e fruta fresca — o bolo que combina com foto de família.",
    nota: "Preço por quilo. Montagem no dia da entrega.",
  },
  {
    id: "bolos-caseiros",
    nome: "Bolos Caseiros & da Vovó",
    resumo: "As receitas de tabuleiro que enchem a casa de cheiro: fubá, cenoura, laranja, coco.",
    nota: "Preço por quilo. Assados todos os dias da manhã.",
  },
  {
    id: "tortas-doces",
    nome: "Tortas & Sobremesas de Vitrine",
    resumo: "O balcão muda todo dia. Estas são as que voltam, porque o freguês pede.",
    nota: "Preço por unidade (tortas de 8 a 12 fatias).",
  },
  {
    id: "docinhos-finos",
    nome: "Docinhos Tradicionais & Finos",
    resumo: "Brigadeiro de panela, beijinho de coco fresco e os finos que fecham uma festa.",
    nota: "Preço por cento (100 unidades).",
  },
  {
    id: "salgados-artesanais",
    nome: "Salgados de Festa & Forno",
    resumo: "Fritura na hora e assados dourados — a produção passa de 3 mil salgados por dia.",
    nota: "Preço por cento. Pedido mínimo de 50 unidades por sabor.",
  },
  {
    id: "kits-festa",
    nome: "Kits Festa Completos",
    resumo: "Bolo, doces e salgados na proporção certa. De 10 a 100 convidados, sem dor de cabeça.",
    nota: "Escolha o tamanho e monte o kit na página de encomendas.",
  },
];

export const PRODUTOS = [
  /* ---------------- Bolos confeitados ---------------- */
  {
    id: "bolo-tres-brigadeiros",
    nome: "Bolo Três Brigadeiros",
    categoria: "bolos-confeitados",
    tag: "Campeão de vendas",
    descricao:
      "Massa fofa de chocolate com três camadas de brigadeiro: tradicional, branco e de leite ninho, cobertas com raspas artesanais.",
    preco: 96,
    unidade: "kg",
    foto: "bolo-brigadeiro",
  },
  {
    id: "bolo-brigadeiro-bolas",
    nome: "Bolo de Brigadeiro com Bolas",
    categoria: "bolos-confeitados",
    tag: "Direto do balcão",
    descricao:
      "Recheio cremoso de brigadeiro de panela e bolas de chocolate ao leite por cima, do jeito que sai da vitrine.",
    preco: 98,
    unidade: "kg",
    foto: "bolo-brigadeiro-bolas",
  },
  {
    id: "bolo-ferrero",
    nome: "Bolo Ferrero Rocher",
    categoria: "bolos-confeitados",
    tag: "Pedido de aniversário",
    descricao:
      "Chantilly, creme de avelã e bombons de chocolate com avelã inteira salpicados entre os suspiros.",
    preco: 128,
    unidade: "kg",
    foto: "bolo-ferrero",
  },
  {
    id: "bolo-confete",
    nome: "Bolo Confete",
    categoria: "bolos-confeitados",
    tag: "Nossa vitrine",
    descricao:
      "Bolo de baunilha com recheio de brigadeiro branco, meringas, morangos frescos e raspas de chocolate.",
    preco: 112,
    unidade: "kg",
    foto: "bolo-confete",
  },
  {
    id: "bolo-granulado",
    nome: "Bolo de Chocolate com Granulado",
    categoria: "bolos-confeitados",
    descricao:
      "O clássico que não tem erro: massa de cacau, ganache de chocolate meio amargo e granulado de verdade.",
    preco: 89.9,
    unidade: "kg",
    foto: "bolo-chocolate-granulado",
  },
  {
    id: "bolo-mesclado",
    nome: "Bolo Mesclado de Chocolate",
    categoria: "bolos-confeitados",
    descricao:
      "Massa mesclada de chocolate e baunilha, cobertura branca e chuva de chocolate picado.",
    preco: 92,
    unidade: "kg",
    foto: "bolo-mesclado",
  },
  {
    id: "bolo-pudim",
    nome: "Bolo Pudim com Ganache",
    categoria: "bolos-confeitados",
    tag: "Dois em um",
    descricao:
      "Pudim de leite condensado sobre massa de bolo, com ganache brilhante e biscoitos ao redor. Duas sobremesas numa fatia.",
    preco: 118,
    unidade: "kg",
    foto: "pudim-ganache",
  },
  {
    id: "bolo-prestigio",
    nome: "Bolo Prestígio",
    categoria: "bolos-confeitados",
    tag: "Tradição Viena",
    descricao:
      "Coco fresco, leite condensado e chocolate meio amargo — receita resgatada da confeitaria clássica de Santos.",
    preco: 94,
    unidade: "kg",
  },
  {
    id: "bolo-kitkat",
    nome: "Bolo Kit Kat",
    categoria: "bolos-confeitados",
    descricao:
      "Cercado de barras de Kit Kat e coroado com chocolate ao leite, doces e morango. Feito para a foto do parabéns.",
    preco: 138,
    unidade: "kg",
  },
  {
    id: "bolo-red-velvet",
    nome: "Bolo Red Velvet",
    categoria: "bolos-confeitados",
    descricao:
      "Massa de cacau avermelhada, recheio de cream cheese e cobertura aveludada. Doce na medida, com acidez no fim.",
    preco: 124,
    unidade: "kg",
  },
  {
    id: "bolo-limao-cacau",
    nome: "Bolo de Limão com Chocolate Meio Amargo",
    categoria: "bolos-confeitados",
    tag: "Tradição Viena",
    descricao:
      "O contraste refrescante do creme de limão com o cacau intenso. Receita da casa desde 2015.",
    preco: 105,
    unidade: "kg",
    foto: "bolo-limao-cacau",
  },
  {
    id: "bolo-ninho-morango",
    nome: "Bolo de Ninho com Morango",
    categoria: "bolos-confeitados",
    descricao:
      "Creme de leite ninho e morangos inteiros entre camadas de massa branca, finalizado com chantilly.",
    preco: 116,
    unidade: "kg",
  },
  {
    id: "bolo-doce-de-leite",
    nome: "Bolo Crocante de Doce de Leite",
    categoria: "bolos-confeitados",
    descricao:
      "Doce de leite cozido na panela com crocante de castanha e massa amanteigada. Pede café.",
    preco: 108,
    unidade: "kg",
  },
  {
    id: "bolo-churros",
    nome: "Bolo de Churros",
    categoria: "bolos-confeitados",
    descricao:
      "Massa de canela com doce de leite, cobertura de chocolate e açúcar cristal. Gosto de festa junina o ano inteiro.",
    preco: 102,
    unidade: "kg",
  },

  /* ---------------- Naked cakes ---------------- */
  {
    id: "naked-frutas",
    nome: "Naked Cake de Frutas Vermelhas",
    categoria: "naked-cakes",
    tag: "Mais fotografado",
    descricao:
      "Massa aparente, creme de baunilha e morangos, framboesas e amoras frescas entre as camadas.",
    preco: 132,
    unidade: "kg",
    foto: "torta-morango",
  },
  {
    id: "naked-cacau",
    nome: "Naked Cake de Cacau e Cereja",
    categoria: "naked-cakes",
    descricao:
      "Massa de cacau intenso, ganache semiavermelhada e cerejas. Finalizado com raspas de chocolate.",
    preco: 136,
    unidade: "kg",
  },
  {
    id: "naked-vovo",
    nome: "Naked Cake de Bolo de Vovó",
    categoria: "naked-cakes",
    descricao:
      "Bolo caseiro de baunilha com doce de leite e frutas da estação. Rústico de propósito.",
    preco: 118,
    unidade: "kg",
  },
  {
    id: "naked-flores",
    nome: "Naked Cake com Flores",
    categoria: "naked-cakes",
    tag: "Casamentos",
    descricao:
      "O mesmo bolo de frutas vermelhas, decorado com flores naturais comestíveis do ateliê parceiro.",
    preco: 148,
    unidade: "kg",
  },
  {
    id: "naked-morango",
    nome: "Naked Cake de Morango",
    categoria: "naked-cakes",
    descricao:
      "Morangos em rodelas entre camadas de creme leve, sem açúcar demais. O preferido das tardes de sábado.",
    preco: 126,
    unidade: "kg",
  },
  {
    id: "naked-pistache",
    nome: "Naked Cake de Pistache",
    categoria: "naked-cakes",
    descricao:
      "Creme de pistache e amêndoas laminadas sobre massa clara. Para quem quer fugir do chocolate.",
    preco: 156,
    unidade: "kg",
  },

  /* ---------------- Bolos caseiros ---------------- */
  {
    id: "fuba-rosquinha",
    nome: "Bolo de Fubá com Rosquinha",
    categoria: "bolos-caseiros",
    tag: "Da manhã",
    descricao:
      "Bolo de fubá molhadinho, açúcar de confeiteiro por cima e rosquinhas de chocolate ao lado — como em Minas, como na vila.",
    preco: 64,
    unidade: "kg",
    foto: "bolo-fuba",
  },
  {
    id: "cenoura-chocolate",
    nome: "Bolo de Cenoura com Chocolate",
    categoria: "bolos-caseiros",
    descricao:
      "Cenoura de verdade na massa, cobertura de chocolate meio amargo feita na panela. O bolo de toda casa.",
    preco: 62,
    unidade: "kg",
  },
  {
    id: "laranja-especiarias",
    nome: "Bolo de Laranja com Especiarias",
    categoria: "bolos-caseiros",
    descricao:
      "Laranja pera, canela e um toque de noz-moscada. Assado em forma de rosca, fatia generosa.",
    preco: 58,
    unidade: "kg",
  },
  {
    id: "coco-cremoso",
    nome: "Bolo de Coco Cremoso",
    categoria: "bolos-caseiros",
    descricao:
      "Massa branca com coco fresco ralado e calda de leite condensado que penetra na fatia.",
    preco: 66,
    unidade: "kg",
  },
  {
    id: "banana-aveia",
    nome: "Bolo de Banana com Aveia",
    categoria: "bolos-caseiros",
    descricao:
      "Banana prata madura, aveia e mel. Açúcar reduzido para o café da tarde sem culpa.",
    preco: 58,
    unidade: "kg",
  },
  {
    id: "milho-cremoso",
    nome: "Bolo de Milho Cremoso",
    categoria: "bolos-caseiros",
    descricao:
      "Milho verde na espiga, leite condensado e uma casquinha dourada. Junino em qualquer mês.",
    preco: 62,
    unidade: "kg",
  },
  {
    id: "pao-de-lo",
    nome: "Pão de Ló de Vó",
    categoria: "bolos-caseiros",
    descricao:
      "Só ovos, açúcar e farinha — e a mão de quem bate a massa. Vai bem puro ou com doce de leite.",
    preco: 54,
    unidade: "kg",
  },
  {
    id: "mesclado-caseiro",
    nome: "Bolo Mesclado Caseiro",
    categoria: "bolos-caseiros",
    descricao:
      "Metade chocolate, metade baunilha, feito para não deixar ninguém na dúvida na hora de escolher.",
    preco: 58,
    unidade: "kg",
  },

  /* ---------------- Tortas e sobremesas ---------------- */
  {
    id: "torta-maca",
    nome: "Torta de Maçã Crocante",
    categoria: "tortas-doces",
    tag: "Da vitrine",
    descricao:
      "Maçãs caramelizadas com canela sob uma farofa de manteiga e nozes. Servida morna nos fins de semana.",
    preco: 98,
    unidade: "un",
    foto: "torta-maca",
  },
  {
    id: "torta-morango",
    nome: "Torta de Morango",
    categoria: "tortas-doces",
    tag: "Sai todo dia",
    descricao:
      "Base de biscoito amanteigado, creme de confeiteiro e uma camada grossa de morangos frescos.",
    preco: 104,
    unidade: "un",
    foto: "torta-morango",
  },
  {
    id: "torta-morango-vitrine",
    nome: "Torta de Morango da Vitrine",
    categoria: "tortas-doces",
    descricao:
      "A versão farta que ocupa a bandeja do balcão: creme, morango em rodelas e calda de brilho.",
    preco: 112,
    unidade: "un",
    foto: "torta-morango-alta",
  },
  {
    id: "torta-limao",
    nome: "Torta de Limão",
    categoria: "tortas-doces",
    descricao:
      "Creme de limão siciliano sobre massa sablée, com merengue maçaricado no dia da venda.",
    preco: 96,
    unidade: "un",
  },
  {
    id: "torta-holandesa",
    nome: "Torta Holandesa",
    categoria: "tortas-doces",
    descricao:
      "Creme branco aveludado, cobertura de chocolate e a coroa de biscoitos. A que todo mundo conhece.",
    preco: 98,
    unidade: "un",
  },
  {
    id: "cheesecake-frutas",
    nome: "Cheesecake de Frutas Vermelhas",
    categoria: "tortas-doces",
    descricao:
      "Base crocante, cream cheese batido e geleia de frutas vermelhas feita na casa.",
    preco: 108,
    unidade: "un",
  },
  {
    id: "pudim-leite",
    nome: "Pudim de Leite Condensado",
    categoria: "tortas-doces",
    descricao:
      "Sem furos e com calda escura: o pudim de panela que a vila pede desde a inauguração.",
    preco: 52,
    unidade: "un",
  },
  {
    id: "banoffee",
    nome: "Banoffee",
    categoria: "tortas-doces",
    descricao:
      "Doce de leite, banana em rodelas, chantilly e raspas de chocolate sobre massa crocante.",
    preco: 96,
    unidade: "un",
  },
  {
    id: "torta-sonho",
    nome: "Torta Sonho de Valsa",
    categoria: "tortas-doces",
    descricao:
      "Massa de baunilha, recheio de brigadeiro branco e bombeiros partidos que estalam na mordida.",
    preco: 102,
    unidade: "un",
  },
  {
    id: "cheesecake-maracuja",
    nome: "Cheesecake de Maracujá",
    categoria: "tortas-doces",
    descricao:
      "Calda de maracujá com sementes, azedinha na medida para cortar o doce do recheio.",
    preco: 104,
    unidade: "un",
  },

  /* ---------------- Docinhos ---------------- */
  {
    id: "brigadeiro-tradicional",
    nome: "Brigadeiro Tradicional",
    categoria: "docinhos-finos",
    tag: "Clássico",
    descricao:
      "Chocolate ao leite, manteiga e creme de leite cozidos na panela até dar ponto de enrolar.",
    preco: 78,
    unidade: "cento",
  },
  {
    id: "brigadeiro-branco",
    nome: "Brigadeiro Branco",
    categoria: "docinhos-finos",
    descricao: "O mesmo carinho em versão branca, com chocolate branco nobre e granulado fino.",
    preco: 82,
    unidade: "cento",
  },
  {
    id: "beijinho",
    nome: "Beijinho de Coco",
    categoria: "docinhos-finos",
    descricao: "Coco fresco ralado na hora, leite condensado e cravo no topo. Fecha qualquer festa.",
    preco: 80,
    unidade: "cento",
  },
  {
    id: "ninho-nutella",
    nome: "Brigadeiro de Ninho com Nutella",
    categoria: "docinhos-finos",
    tag: "Mais pedido",
    descricao:
      "Leite ninho no ponto de enrolar, recheio de creme de avelã e banho de chocolate ao leite.",
    preco: 118,
    unidade: "cento",
  },
  {
    id: "dois-amores",
    nome: "Dois Amores",
    categoria: "docinhos-finos",
    descricao: "Metade brigadeiro branco, metade preto, em um só docinho. Para quem não decide.",
    preco: 96,
    unidade: "cento",
  },
  {
    id: "casadinho",
    nome: "Casadinho",
    categoria: "docinhos-finos",
    descricao:
      "Dois brigadeiros — branco e preto — unidos por uma camada de doce de leite. Nossa tradição.",
    preco: 94,
    unidade: "cento",
  },
  {
    id: "camafeu",
    nome: "Camafeu de Doce de Leite",
    categoria: "docinhos-finos",
    descricao: "Nozes, doce de leite e banho de chocolate: o docinho fino que não falta em casamento.",
    preco: 124,
    unidade: "cento",
  },
  {
    id: "trufa-morango",
    nome: "Trufa de Morango",
    categoria: "docinhos-finos",
    descricao:
      "Morangos frescos banhados em chocolate meio amargo, com base de brigadeiro branco.",
    preco: 148,
    unidade: "cento",
  },
  {
    id: "bem-casado",
    nome: "Bem-Casado de Doce de Leite",
    categoria: "docinhos-finos",
    descricao: "Massa leve polvilhada de açúcar, recheio generoso de doce de leite argentino.",
    preco: 92,
    unidade: "cento",
  },
  {
    id: "cajuzinho",
    nome: "Cajuzinho",
    categoria: "docinhos-finos",
    descricao: "Amendoim torrado moído com açúcar e manteiga, em forma de caju. Doce de festa de vó.",
    preco: 82,
    unidade: "cento",
  },
  {
    id: "bolinha-chocolate",
    nome: "Bolinha de Chocolate com Crocante",
    categoria: "docinhos-finos",
    descricao: "Recheio de brigadeiro com pedaços de flocos de arroz crocante por dentro e por fora.",
    preco: 108,
    unidade: "cento",
  },
  {
    id: "palha-italiana",
    nome: "Palha Italiana",
    categoria: "docinhos-finos",
    descricao: "Quadradinhos de brigadeiro denso com biscoito de maisena e açúcar de confeiteiro.",
    preco: 88,
    unidade: "cento",
  },

  /* ---------------- Salgados ---------------- */
  {
    id: "coxinha",
    nome: "Coxinha de Frango",
    categoria: "salgados-artesanais",
    tag: "Campeã",
    descricao:
      "Frango desfiado cozido com tempero da casa, massa leve e empanado que estala. Frita na hora.",
    preco: 98,
    unidade: "cento",
    foto: "salgados-assados",
  },
  {
    id: "kibe",
    nome: "Kibe Frito",
    categoria: "salgados-artesanais",
    descricao: "Trigo hidratado de um dia para o outro, carne temperada e muito orégano.",
    preco: 92,
    unidade: "cento",
  },
  {
    id: "risoles",
    nome: "Risoles de Queijo",
    categoria: "salgados-artesanais",
    descricao: "Massa fina e queijo derretido no meio, empanado com farinha de rosca fininha.",
    preco: 96,
    unidade: "cento",
  },
  {
    id: "bolinho-queijo",
    nome: "Bolinho de Queijo",
    categoria: "salgados-artesanais",
    descricao: "Queijo minas e massa fermentada, fritura curta para ficar puxento sem encharcar.",
    preco: 94,
    unidade: "cento",
  },
  {
    id: "croquete-carne",
    nome: "Croquete de Carne",
    categoria: "salgados-artesanais",
    descricao: "Carne moída refogada com ervas, massa firme e casca crocante. Sem exagero de tempero.",
    preco: 98,
    unidade: "cento",
  },
  {
    id: "empada-frango",
    nome: "Empada de Frango",
    categoria: "salgados-artesanais",
    descricao: "Massa podre que desmancha, recheio cremoso de frango com catupiry de verdade.",
    preco: 108,
    unidade: "cento",
  },
  {
    id: "esfirra-carne",
    nome: "Esfirra de Carne",
    categoria: "salgados-artesanais",
    descricao: "Massa aberta na mão, carne com cebola e limão. Assada em forno alto.",
    preco: 102,
    unidade: "cento",
  },
  {
    id: "pastel-forno",
    nome: "Pastel de Forno de Palmito",
    categoria: "salgados-artesanais",
    descricao: "Recheio de palmito com bacon e tomate seco, massa assada e douradinha por cima.",
    preco: 106,
    unidade: "cento",
  },
  {
    id: "pao-queijo",
    nome: "Pão de Queijo Mineiro",
    categoria: "salgados-artesanais",
    descricao: "Polvilho azedo, queijo meia cura e o coqueiro da receita. Sai do forno de hora em hora.",
    preco: 88,
    unidade: "cento",
  },
  {
    id: "enroladinho-salsicha",
    nome: "Enroladinho de Salsicha",
    categoria: "salgados-artesanais",
    descricao: "Salsicha besuntada no molho de tomate da casa, enrolada em massa de pão.",
    preco: 86,
    unidade: "cento",
  },
  {
    id: "travesseiro-frango",
    nome: "Travesseiro de Frango com Requeijão",
    categoria: "salgados-artesanais",
    descricao: "Pão de forma prensado com frango e requeijão cremoso, assado até criar casquinha.",
    preco: 96,
    unidade: "cento",
  },
  {
    id: "empadao",
    nome: "Empadão de Frango (porção)",
    categoria: "salgados-artesanais",
    descricao: "Fatia generosa do empadão do balcão, com mistura de frango, milho e requeijão.",
    preco: 22,
    unidade: "un",
  },
  {
    id: "esfiha-baiana",
    nome: "Esfiha Baiana",
    categoria: "salgados-artesanais",
    descricao: "Carne seca e um toque de pimenta, para quem gosta de um salgado com personalidade.",
    preco: 104,
    unidade: "cento",
  },
  {
    id: "cone-requeijao",
    nome: "Cone de Requeijão",
    categoria: "salgados-artesanais",
    descricao: "Cone crocante recheado na hora com requeijão cremoso e orégano.",
    preco: 98,
    unidade: "cento",
  },

  {
    id: "bolo-vulcao",
    nome: "Bolo Vulcão de Brigadeiro",
    categoria: "bolos-confeitados",
    descricao:
      "Massa de cacau com um vulcão de brigadeiro quente escorrendo pelo buraco do meio. Servido na hora.",
    preco: 94,
    unidade: "kg",
  },
  {
    id: "bolo-morango-chantilly",
    nome: "Bolo de Morango com Chantilly",
    categoria: "bolos-confeitados",
    descricao:
      "Massa branca leve, chantilly batido na hora e morangos frescos em camadas generosas.",
    preco: 108,
    unidade: "kg",
  },
  {
    id: "torta-chocolate",
    nome: "Torta de Chocolate Trufada",
    categoria: "tortas-doces",
    descricao:
      "Ganache meio amargo, massa úmida de cacau e flor de sal por cima. Para os adultos da mesa.",
    preco: 112,
    unidade: "un",
  },
  {
    id: "pastel-carne",
    nome: "Pastel de Carne",
    categoria: "salgados-artesanais",
    descricao: "Massa fina frita na hora, carne moída temperada e suco de limão ao lado.",
    preco: 96,
    unidade: "cento",
  },

  /* ---------------- Kits festa ---------------- */
  {
    id: "kit-10",
    nome: "Kit Festa Vila Belmiro (10 convidados)",
    categoria: "kits-festa",
    descricao:
      "Bolo de 1,5 kg à escolha, 50 salgadinhos fritos e assados e 30 docinhos tradicionais, em embalagem de presente.",
    preco: 165,
    unidade: "kit",
    foto: "feed-kit-chocolate",
  },
  {
    id: "kit-20",
    nome: "Kit Festa Vila Belmiro (20 convidados)",
    categoria: "kits-festa",
    tag: "Mais pedido",
    descricao:
      "Bolo de 2 kg à escolha, 100 salgadinhos frescos fritos e assados e 50 docinhos tradicionais.",
    preco: 260,
    unidade: "kit",
  },
  {
    id: "kit-30",
    nome: "Kit Festa Vila Belmiro (30 convidados)",
    categoria: "kits-festa",
    descricao:
      "Bolo de 3 kg, 150 salgadinhos variados e 80 docinhos, com descartáveis para servir.",
    preco: 375,
    unidade: "kit",
  },
  {
    id: "kit-50",
    nome: "Kit Festa Vila Belmiro (50 convidados)",
    categoria: "kits-festa",
    descricao:
      "Bolo de 4 kg, 250 salgadinhos, 130 docinhos e toalha para a mesa do bolo.",
    preco: 590,
    unidade: "kit",
  },
  {
    id: "kit-100",
    nome: "Kit Festa Vila Belmiro (100 convidados)",
    categoria: "kits-festa",
    descricao:
      "Evento grande: bolo de 6 kg, 500 salgadinhos, 260 docinhos e montagem acompanhada pela nossa equipe.",
    preco: 1090,
    unidade: "kit",
  },
  {
    id: "kit-arraia",
    nome: "Kit Arraiá da Vila",
    categoria: "kits-festa",
    tag: "Sazonal",
    descricao:
      "Bolo de milho e de fubá, pé de moleque, paçoca, bolo confeitado e salgados juninos. Para 30 pessoas.",
    preco: 420,
    unidade: "kit",
    foto: "feed-kit-arraia",
  },
];

export const DESTAQUES = [
  "bolo-tres-brigadeiros",
  "bolo-ferrero",
  "torta-morango",
  "coxinha",
  "kit-20",
  "naked-frutas",
];

/** Formata preço em reais: 96 → "R$ 96,00". */
export function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** "R$ 96,00 / kg" | "R$ 98,00 / cento" | "R$ 165,00" */
export function rotuloPreco(produto) {
  const preco = formatarPreco(produto.preco);
  switch (produto.unidade) {
    case "kg":
      return `${preco} <span class="nowrap">/ kg</span>`;
    case "cento":
      return `${preco} <span class="nowrap">/ cento</span>`;
    default:
      return preco;
  }
}

/** Texto puro do preço, para a mensagem do WhatsApp. */
export function precoTexto(produto) {
  const preco = formatarPreco(produto.preco);
  if (produto.unidade === "kg") return `${preco} o quilo`;
  if (produto.unidade === "cento") return `${preco} o cento`;
  return preco;
}
