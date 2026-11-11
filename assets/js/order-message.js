/**
 * Montador da mensagem de pedido — funções puras, sem DOM.
 * É o coração do funil: o que o cliente vê no resumo é exatamente o texto que
 * chega no WhatsApp da confeitaria. Testado por tools/test-order.mjs.
 */

import { TAMANHOS, BOLOS, DOCINHOS, SALGADOS, EXTRAS, ENTREGAS, TELEFONE_WHATSAPP } from "../data/kit-festa.js";
import { formatarPreco, precoTexto } from "../data/menu.js";

export const byId = (lista, id) => lista.find(item => item.id === id) || null;

export const brl = formatarPreco;

/** Normaliza o estado do formulário para o cálculo (ids → objetos). */
export function resolverEstado(estado = {}) {
  const tamanho = byId(TAMANHOS, estado.tamanhoId);
  const bolo = byId(BOLOS, estado.boloId);
  const entrega = byId(ENTREGAS, estado.entregaId) ?? ENTREGAS[0];
  return {
    tamanho,
    bolo,
    entrega,
    docinhos: (estado.docinhosIds ?? []).map(id => byId(DOCINHOS, id)).filter(Boolean),
    salgados: (estado.salgadosIds ?? []).map(id => byId(SALGADOS, id)).filter(Boolean),
    extras: (estado.extrasIds ?? []).map(id => byId(EXTRAS, id)).filter(Boolean),
    nome: (estado.nome ?? "").trim(),
    data: estado.data ?? "",
    observacao: (estado.observacao ?? "").trim(),
  };
}

/**
 * Total estimado e as linhas que compõem o preço.
 * O acréscimo de sabor é proporcional: por quilo do bolo, por cento de doces.
 */
export function calcularTotal(estado = {}) {
  const s = resolverEstado(estado);
  if (!s.tamanho) return { total: 0, linhas: [], tamanho: null };

  const linhas = [{ rotulo: `Kit para ${s.tamanho.convidados} convidados`, valor: s.tamanho.preco }];

  if (s.bolo && s.bolo.acrescimoKg > 0) {
    const valor = s.bolo.acrescimoKg * s.tamanho.boloKg;
    linhas.push({ rotulo: `Bolo ${s.bolo.nome}`, valor });
  }

  const media = (lista, chave) => (lista.length ? lista.reduce((soma, i) => soma + i[chave], 0) / lista.length : 0);
  const acrescimoDoces = media(s.docinhos, "acrescimoCento") * (s.tamanho.docinhos / 100);
  if (acrescimoDoces > 0) linhas.push({ rotulo: "Docinhos escolhidos", valor: acrescimoDoces });

  const acrescimoSalgados = media(s.salgados, "acrescimoCento") * (s.tamanho.salgados / 100);
  if (acrescimoSalgados > 0) linhas.push({ rotulo: "Salgados escolhidos", valor: acrescimoSalgados });

  for (const extra of s.extras) linhas.push({ rotulo: extra.nome, valor: extra.preco });

  if (s.entrega && s.entrega.preco > 0) linhas.push({ rotulo: s.entrega.nome, valor: s.entrega.preco });

  const total = linhas.reduce((soma, linha) => soma + linha.valor, 0);
  return { total, linhas, tamanho: s.tamanho };
}

/** Problemas que impedem o envio. Devolve [{ campo, mensagem }]. */
export function validar(estado = {}, hoje = new Date()) {
  const s = resolverEstado(estado);
  const erros = [];
  if (!s.tamanho) erros.push({ campo: "tamanho", mensagem: "Escolha o tamanho da comemoração." });
  if (!s.bolo) erros.push({ campo: "bolo", mensagem: "Escolha o sabor do bolo." });
  if (s.docinhos.length === 0) erros.push({ campo: "docinhos", mensagem: "Escolha pelo menos um tipo de docinho." });
  if (s.salgados.length === 0) erros.push({ campo: "salgados", mensagem: "Escolha pelo menos um tipo de salgado." });
  if (!s.nome) erros.push({ campo: "nome", mensagem: "Diga pra gente como podemos te chamar." });

  if (!s.data) {
    erros.push({ campo: "data", mensagem: "Escolha a data da festa." });
  } else {
    const alvo = new Date(`${s.data}T12:00:00`);
    const minimo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2);
    if (Number.isNaN(alvo.getTime())) erros.push({ campo: "data", mensagem: "Data inválida." });
    else if (alvo < minimo) erros.push({ campo: "data", mensagem: "Precisamos de 2 dias de antecedência." });
  }
  return erros;
}

const formatarData = iso => {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

/** Mensagem estruturada para o WhatsApp. `*negrito*` é a marcação do app. */
export function montarMensagem(estado = {}) {
  const s = resolverEstado(estado);
  const { total, linhas } = calcularTotal(estado);
  const partes = [];

  partes.push("*Encomenda — Vila dos Doces*");
  partes.push("Olá! Montei um kit festa pelo site e queria confirmar:");
  partes.push("");

  if (s.tamanho) {
    partes.push(`*Kit:* ${s.tamanho.convidados} convidados — ${brl(s.tamanho.preco)}`);
    partes.push(`_Inclui ${s.tamanho.descricao.toLowerCase()}_`);
  }
  if (s.bolo) partes.push(`*Bolo:* ${s.bolo.nome} (${s.tamanho?.boloKg ?? 0} kg)`);
  if (s.docinhos.length) partes.push(`*Docinhos (${s.tamanho?.docinhos ?? 0}):* ${s.docinhos.map(d => d.nome).join(", ")}`);
  if (s.salgados.length) partes.push(`*Salgados (${s.tamanho?.salgados ?? 0}):* ${s.salgados.map(d => d.nome).join(", ")}`);
  if (s.extras.length) partes.push(`*Extras:* ${s.extras.map(e => e.nome).join(", ")}`);
  if (s.entrega) partes.push(`*Entrega:* ${s.entrega.nome}${s.entrega.preco ? ` — ${brl(s.entrega.preco)}` : " (sem custo)"}`);
  if (s.data) partes.push(`*Data da festa:* ${formatarData(s.data)}`);
  if (s.nome) partes.push(`*Nome:* ${s.nome}`);
  if (s.observacao) partes.push(`*Observações:* ${s.observacao}`);

  partes.push("");
  partes.push("*Resumo do valor*");
  for (const linha of linhas) partes.push(`• ${linha.rotulo}: ${brl(linha.valor)}`);
  partes.push(`*Total estimado: ${brl(total)}*`);
  partes.push("");
  partes.push("_Valores de referência do site — confirmo tudo com vocês por aqui._");

  return partes.join("\n");
}

/** Mensagem curta de um item do cardápio. */
export function montarMensagemProduto(produto, categoria) {
  const preco = precoTexto(produto);
  const linhas = [
    "*Encomenda — Vila dos Doces*",
    `Olá! Vi o *${produto.nome}* no site (${preco}) e gostaria de encomendar.`,
  ];
  if (categoria?.nome) linhas.push(`Categoria: ${categoria.nome}.`);
  linhas.push("Vocês têm disponibilidade para esta semana?");
  return linhas.join("\n");
}

/** URL do WhatsApp com a mensagem codificada. */
export function urlWhatsApp(mensagem, telefone = TELEFONE_WHATSAPP) {
  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}
