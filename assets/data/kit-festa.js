/**
 * Configuração do montador de kits festa da Vila dos Doces.
 *
 * Os valores são a referência da casa para 2025/2026 e estão calibrados pela
 * proporção real de produção (3 mil salgados por dia, kits de 10 a 100 pessoas).
 * A confeitaria confirma o valor final no atendimento — a página avisa isso.
 */

export const TELEFONE_WHATSAPP = "5513992051188";
export const TELEFONE_EXIBIDO = "(13) 99205-1188";
export const TELEFONE_FIXO = "(13) 3349-8988";
export const ENDERECO = {
  rua: "R. Dr. Carvalho de Mendonça, 452",
  bairro: "Vila Belmiro",
  cidade: "Santos",
  uf: "SP",
  cep: "11050-170",
};
export const HORARIO = "Segunda a sábado, das 09h30 às 20h";
export const INSTAGRAM = "https://www.instagram.com/viladosdoces.santos/";
export const MAPS = "https://www.google.com/maps/search/?api=1&query=R.+Dr.+Carvalho+de+Mendon%C3%A7a%2C+452+-+Vila+Belmiro%2C+Santos+-+SP";
export const WAZE = "https://waze.com/ul?q=R.%20Dr.%20Carvalho%20de%20Mendon%C3%A7a%20452%20Vila%20Belmiro%20Santos";

export const TAMANHOS = [
  {
    id: "10",
    convidados: 10,
    titulo: "Mesa pequena",
    boloKg: 1.5,
    salgados: 50,
    docinhos: 30,
    preco: 165,
    descricao: "Bolo de 1,5 kg + 50 salgados + 30 docinhos",
  },
  {
    id: "20",
    convidados: 20,
    titulo: "Festa de casa",
    boloKg: 2,
    salgados: 100,
    docinhos: 50,
    preco: 260,
    descricao: "Bolo de 2 kg + 100 salgados + 50 docinhos",
  },
  {
    id: "30",
    convidados: 30,
    titulo: "Aniversário",
    boloKg: 3,
    salgados: 150,
    docinhos: 80,
    preco: 375,
    descricao: "Bolo de 3 kg + 150 salgados + 80 docinhos",
  },
  {
    id: "50",
    convidados: 50,
    titulo: "Festa grande",
    boloKg: 4,
    salgados: 250,
    docinhos: 130,
    preco: 590,
    descricao: "Bolo de 4 kg + 250 salgados + 130 docinhos",
  },
  {
    id: "100",
    convidados: 100,
    titulo: "Evento",
    boloKg: 6,
    salgados: 500,
    docinhos: 260,
    preco: 1090,
    descricao: "Bolo de 6 kg + 500 salgados + 260 docinhos",
  },
];

/** Sabores de bolo. `acrescimoKg` entra no preço multiplicado pelo peso do bolo.
 *  `cores` alimenta a prévia 3D do bolo (massa, recheio, cobertura). */
export const BOLOS = [
  { id: "tres-brigadeiros", nome: "Três Brigadeiros", acrescimoKg: 0, cores: { massa: "#6b4423", recheio: "#3a1f12", cobertura: "#2b1509" } },
  { id: "prestigio", nome: "Prestígio (coco e chocolate)", acrescimoKg: 0, cores: { massa: "#7a5230", recheio: "#f3ead9", cobertura: "#3a2318" } },
  { id: "ninho-morango", nome: "Ninho com Morango", acrescimoKg: 8, cores: { massa: "#f2dfc4", recheio: "#f3b7c1", cobertura: "#fdf6ea" } },
  { id: "ferrero", nome: "Ferrero Rocher", acrescimoKg: 18, cores: { massa: "#6a4526", recheio: "#5b3a22", cobertura: "#4a2a17" } },
  { id: "red-velvet", nome: "Red Velvet", acrescimoKg: 14, cores: { massa: "#8e2230", recheio: "#fdf8f2", cobertura: "#a62d3b" } },
  { id: "limao-cacau", nome: "Limão com Chocolate Meio Amargo", acrescimoKg: 6, cores: { massa: "#4a2f1c", recheio: "#efe0a0", cobertura: "#3a2313" } },
  { id: "churros", nome: "Churros com Doce de Leite", acrescimoKg: 4, cores: { massa: "#c98a44", recheio: "#b06a24", cobertura: "#8a4d18" } },
  { id: "naked-frutas", nome: "Naked Cake de Frutas Vermelhas", acrescimoKg: 22, cores: { massa: "#e8cfa8", recheio: "#f7e7dc", cobertura: "#fdf8ef" } },
];

/** Docinhos: acrescimo por cento. */
export const DOCINHOS = [
  { id: "brigadeiro", nome: "Brigadeiro tradicional", acrescimoCento: 0 },
  { id: "beijinho", nome: "Beijinho de coco", acrescimoCento: 0 },
  { id: "dois-amores", nome: "Dois Amores", acrescimoCento: 12 },
  { id: "ninho-nutella", nome: "Ninho com Nutella", acrescimoCento: 28 },
  { id: "camafeu", nome: "Camafeu de doce de leite", acrescimoCento: 34 },
  { id: "trufa-morango", nome: "Trufa de morango", acrescimoCento: 48 },
];

/** Salgados: acrescimo por cento. */
export const SALGADOS = [
  { id: "coxinha", nome: "Coxinha de frango", acrescimoCento: 0 },
  { id: "kibe", nome: "Kibe", acrescimoCento: 0 },
  { id: "bolinho-queijo", nome: "Bolinho de queijo", acrescimoCento: 0 },
  { id: "risoles", nome: "Risoles de queijo", acrescimoCento: 4 },
  { id: "empada", nome: "Empada de frango", acrescimoCento: 12 },
  { id: "esfirra", nome: "Esfirra de carne", acrescimoCento: 6 },
  { id: "pao-queijo", nome: "Pão de queijo", acrescimoCento: 0 },
];

export const EXTRAS = [
  { id: "bolo-extra", nome: "Quilo de bolo extra", descricao: "Mais 1 kg no bolo do kit", preco: 96, unidade: "kg" },
  { id: "salgados-extra", nome: "Cento de salgados extra", descricao: "Cem salgadinhos variados", preco: 98, unidade: "cento" },
  { id: "docinhos-extra", nome: "Cento de docinhos extra", descricao: "Cem docinhos tradicionais", preco: 80, unidade: "cento" },
  { id: "descartaveis", nome: "Kit descartáveis", descricao: "Pratos, copos e guardanapos para a mesa", preco: 38, unidade: "kit" },
  { id: "velas", nome: "Velas e suporte", descricao: "Velas de aniversário e suporte de número", preco: 18, unidade: "kit" },
];

export const ENTREGAS = [
  { id: "retirada", nome: "Retirar na loja", descricao: "Vila Belmiro, sem custo", preco: 0 },
  { id: "entrega-santos", nome: "Entrega em Santos", descricao: "Taxa confirmada por bairro no atendimento", preco: 25 },
  { id: "entrega-baixada", nome: "Entrega na Baixada", descricao: "São Vicente, Praia Grande e Guarujá", preco: 60 },
];

export const PAGAMENTOS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"];

/** Antecedência mínima recomendada, em dias. */
export const ANTECEDENCIA_DIAS = 2;
