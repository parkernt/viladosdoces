/** Funil de encomenda em 3 etapas: tamanho → combinação → entrega. */

import { TAMANHOS, BOLOS, DOCINHOS, SALGADOS, EXTRAS, ENTREGAS, PAGAMENTOS, HORARIO } from "../data/kit-festa.js";
import { formatarPreco } from "../data/menu.js";
import { calcularTotal, validar, montarMensagem, urlWhatsApp } from "./order-message.js";
import { icone, esc, isoDaqui } from "./ui.js";
import { saborAtual } from "./estado.js";

const MAX_DOCINHOS = 3;
const MAX_SALGADOS = 3;

const estado = {
  tamanhoId: "",
  boloId: "",
  docinhosIds: [],
  salgadosIds: [],
  extrasIds: [],
  entregaId: "retirada",
  nome: "",
  data: "",
  observacao: "",
};

const $ = (sel, raiz = document) => raiz.querySelector(sel);

function opcaoTamanho(t) {
  return `<label class="option option--tamanho">
    <input type="radio" name="tamanho" value="${t.id}">
    <span class="option__title">${t.convidados} convidados</span>
    <span class="option__meta">${esc(t.titulo)} · ${esc(t.descricao)}</span>
    <span class="option__price">${formatarPreco(t.preco)}</span>
  </label>`;
}

function opcaoDoce(tipo, item, nome) {
  return `<label class="check">
    <input type="${tipo}" name="${nome}" value="${item.id}">
    <span class="check__box" aria-hidden="true">${icone("check", "icon icon--sm")}</span>
    <span class="check__text">${esc(item.nome)}</span>
  </label>`;
}

function opcaoExtra(extra) {
  return `<label class="check check--extra">
    <input type="checkbox" name="extras" value="${extra.id}">
    <span class="check__box" aria-hidden="true">${icone("check", "icon icon--sm")}</span>
    <span class="check__text">${esc(extra.nome)} <small class="soft">${esc(extra.descricao)}</small></span>
    <span class="check__price">${formatarPreco(extra.preco)}</span>
  </label>`;
}

function opcaoEntrega(e) {
  return `<label class="option option--entrega">
    <input type="radio" name="entrega" value="${e.id}">
    <span class="option__title">${esc(e.nome)}</span>
    <span class="option__meta">${esc(e.descricao)}</span>
    <span class="option__price">${e.preco ? formatarPreco(e.preco) : "Sem custo"}</span>
  </label>`;
}

export function initOrderBuilder() {
  const form = $("[data-order-form]");
  if (!form) return;

  /* ---- Markup dinâmico ------------------------------------------------ */
  const alvoTamanhos = $("[data-tamanhos]", form);
  if (alvoTamanhos) alvoTamanhos.innerHTML = TAMANHOS.map(opcaoTamanho).join("");

  const alvoBolos = $("[data-bolos]", form);
  if (alvoBolos) {
    alvoBolos.innerHTML =
      '<option value="">Escolha um sabor</option>' +
      BOLOS.map(
        b => `<option value="${b.id}">${esc(b.nome)}${b.acrescimoKg ? ` (+${formatarPreco(b.acrescimoKg)}/kg)` : ""}</option>`,
      ).join("");
  }

  const alvoDocinhos = $("[data-docinhos]", form);
  if (alvoDocinhos) alvoDocinhos.innerHTML = DOCINHOS.map(d => opcaoDoce("checkbox", d, "docinhos")).join("");

  const alvoSalgados = $("[data-salgados]", form);
  if (alvoSalgados) alvoSalgados.innerHTML = SALGADOS.map(s => opcaoDoce("checkbox", s, "salgados")).join("");

  const alvoExtras = $("[data-extras]", form);
  if (alvoExtras) alvoExtras.innerHTML = EXTRAS.map(opcaoExtra).join("");

  const alvoEntregas = $("[data-entregas]", form);
  if (alvoEntregas) alvoEntregas.innerHTML = ENTREGAS.map(opcaoEntrega).join("");

  const pagamentos = $("[data-pagamentos]", form);
  if (pagamentos) pagamentos.innerHTML = PAGAMENTOS.map(p => `<li>${esc(p)}</li>`).join("");

  const campoData = $("[data-campo=data]", form);
  if (campoData) {
    campoData.min = isoDaqui(2);
    campoData.value = isoDaqui(5);
    estado.data = campoData.value;
  }

  /* ---- Resumo ao vivo -------------------------------------------------- */
  const resumo = $("[data-resumo]");
  const totalEl = $("[data-total]");
  const waLink = $("[data-wa]");
  const preview = $("[data-message-preview]");

  function renderResumo() {
    const { total, linhas, tamanho } = calcularTotal(estado);
    if (resumo) {
      resumo.innerHTML = tamanho
        ? `<div class="summary__kit">
             <p class="summary__title">${tamanho.convidados} convidados</p>
             <p class="summary__sub">${esc(tamanho.descricao)}</p>
           </div>
           <dl class="summary__list">
             ${linhas
               .map(l => `<div><dt>${esc(l.rotulo)}</dt><dd>${formatarPreco(l.valor)}</dd></div>`)
               .join("")}
           </dl>`
        : `<p class="summary__empty">Comece escolhendo o tamanho da comemoração. O valor aparece aqui na hora.</p>`;
    }
    if (totalEl) totalEl.textContent = formatarPreco(total);
    if (preview) preview.textContent = montarMensagem(estado);
    if (waLink) waLink.href = urlWhatsApp(montarMensagem(estado));
  }

  function sincronizar() {
    const escolhidos = [...form.querySelectorAll('input[name="docinhos"]:checked')];
    if (escolhidos.length > MAX_DOCINHOS) {
      escolhidos.at(-1).checked = false;
      avisar(`Escolha até ${MAX_DOCINHOS} tipos de docinho — a gente distribui a quantidade entre eles.`);
    }
    const salgadosEscolhidos = [...form.querySelectorAll('input[name="salgados"]:checked')];
    if (salgadosEscolhidos.length > MAX_SALGADOS) {
      salgadosEscolhidos.at(-1).checked = false;
      avisar(`Escolha até ${MAX_SALGADOS} tipos de salgado para manter a variedade da mesa.`);
    }
    renderResumo();
  }

  form.addEventListener("change", evento => {
    const alvo = evento.target;
    if (alvo.name === "tamanho") estado.tamanhoId = alvo.value;
    else if (alvo.name === "bolo") estado.boloId = alvo.value;
    else if (alvo.name === "docinhos") estado.docinhosIds = [...form.querySelectorAll('input[name="docinhos"]:checked')].map(i => i.value);
    else if (alvo.name === "salgados") estado.salgadosIds = [...form.querySelectorAll('input[name="salgados"]:checked')].map(i => i.value);
    else if (alvo.name === "extras") estado.extrasIds = [...form.querySelectorAll('input[name="extras"]:checked')].map(i => i.value);
    else if (alvo.name === "entrega") estado.entregaId = alvo.value;
    else if (alvo.name === "nome") estado.nome = alvo.value;
    else if (alvo.name === "data") estado.data = alvo.value;
    else if (alvo.name === "observacao") estado.observacao = alvo.value;

    if (alvo.name === "bolo") {
      const bolo = BOLOS.find(b => b.id === alvo.value);
      saborAtual.cores = bolo?.cores ?? null;
      document.dispatchEvent(new CustomEvent("cake:flavor", { detail: bolo?.cores }));
    }
    sincronizar();
  });

  form.addEventListener("input", evento => {
    const alvo = evento.target;
    if (alvo.name === "nome") estado.nome = alvo.value;
    if (alvo.name === "observacao") estado.observacao = alvo.value;
    if (alvo.name === "nome") renderResumo();
  });

  /* ---- Etapas ---------------------------------------------------------- */
  const etapas = [...form.querySelectorAll("[data-step]")];
  const marcadores = [...document.querySelectorAll("[data-steps] li")];
  let atual = 1;

  function irPara(passo, { rolar = true, focar = true } = {}) {
    atual = Math.max(1, Math.min(etapas.length, passo));
    etapas.forEach(secao => {
      secao.hidden = Number(secao.dataset.step) !== atual;
    });
    marcadores.forEach(li => {
      const n = Number(li.dataset.step);
      li.toggleAttribute("aria-current", n === atual);
      if (n === atual) li.setAttribute("aria-current", "step");
      li.dataset.complete = String(n < atual);
    });
    if (focar) {
      const novo = etapas.find(s => Number(s.dataset.step) === atual);
      const titulo = novo?.querySelector("h2, [data-step-title]");
      titulo?.setAttribute("tabindex", "-1");
      titulo?.focus({ preventScroll: true });
    }
    if (rolar) {
      const novo = etapas.find(s => Number(s.dataset.step) === atual);
      novo?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    document.dispatchEvent(new CustomEvent("order:step", { detail: { step: atual } }));
    limparErros();
  }

  const regras = {
    1: ["tamanho"],
    2: ["bolo", "docinhos", "salgados"],
    3: ["nome", "data"],
  };

  function errosDaEtapa(passo) {
    const campos = regras[passo] ?? [];
    return validar(estado).filter(e => campos.includes(e.campo));
  }

  function mostrarErros(erros) {
    const alvo = $("[data-form-errors]");
    limparErros();
    if (!erros.length) return;
    if (alvo) {
      alvo.hidden = false;
      alvo.innerHTML = `<p class="errors__title">${icone("alert", "icon")} Falta pouco:</p>
        <ul>${erros.map(e => `<li><a href="#campo-${e.campo}">${esc(e.mensagem)}</a></li>`).join("")}</ul>`;
      alvo.scrollIntoView({ block: "center", behavior: "smooth" });
      alvo.querySelector("a")?.focus({ preventScroll: true });
    }
  }

  function limparErros() {
    const alvo = $("[data-form-errors]");
    if (alvo) {
      alvo.hidden = true;
      alvo.innerHTML = "";
    }
    form.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
  }

  let avisoTimer;
  function avisar(mensagem) {
    const alvo = $("[data-hint-live]");
    if (!alvo) return;
    alvo.textContent = mensagem;
    alvo.dataset.visible = "true";
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => {
      alvo.textContent = "";
      alvo.dataset.visible = "false";
    }, 5200);
  }

  form.addEventListener("click", evento => {
    const proximo = evento.target.closest("[data-next]");
    const voltar = evento.target.closest("[data-back]");
    if (proximo) {
      evento.preventDefault();
      const erros = errosDaEtapa(atual);
      if (erros.length) {
        mostrarErros(erros);
        return;
      }
      irPara(atual + 1);
    }
    if (voltar) {
      evento.preventDefault();
      irPara(atual - 1);
    }
  });

  /* ---- Envio ----------------------------------------------------------- */
  const botaoEnviar = $("[data-submit]", form);
  botaoEnviar?.addEventListener("click", evento => {
    const erros = validar(estado);
    if (erros.length) {
      evento.preventDefault();
      const etapaDoErro = Number(erros[0].campo === "tamanho" ? 1 : ["bolo", "docinhos", "salgados"].includes(erros[0].campo) ? 2 : 3);
      irPara(etapaDoErro);
      mostrarErros(erros);
      return;
    }
    const mensagem = montarMensagem(estado);
    if (waLink) waLink.href = urlWhatsApp(mensagem);
    const status = $("[data-send-status]");
    if (status) {
      status.textContent = "Pedido montado! Se o WhatsApp não abrir, toque no botão verde novamente.";
      status.hidden = false;
    }
  });

  waLink?.addEventListener("click", evento => {
    const erros = validar(estado);
    if (erros.length) {
      evento.preventDefault();
      mostrarErros(erros);
    }
  });

  /* ---- Inicialização --------------------------------------------------- */
  document.querySelectorAll("[data-choose-size]").forEach(botao => {
    botao.addEventListener("click", () => {
      const id = botao.dataset.chooseSize;
      const radio = form.querySelector(`input[name="tamanho"][value="${id}"]`);
      if (radio) {
        radio.checked = true;
        estado.tamanhoId = id;
        sincronizar();
        irPara(2);
      }
    });
  });

  renderResumo();
  irPara(1, { rolar: false, focar: false });

  // Link direto de um kit (ex.: encomendas.html?kit=20)
  const idDoKit = new URLSearchParams(window.location.search).get("kit");
  if (idDoKit && TAMANHOS.some(t => t.id === idDoKit)) {
    const radio = form.querySelector(`input[name="tamanho"][value="${idDoKit}"]`);
    if (radio) {
      radio.checked = true;
      estado.tamanhoId = idDoKit;
      sincronizar();
      irPara(2, { rolar: false });
    }
  }
}
