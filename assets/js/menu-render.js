/** Renderização do cardápio, dos destaques e da busca instantânea. */

import { CATEGORIAS, PRODUTOS, DESTAQUES, formatarPreco, rotuloPreco } from "../data/menu.js";
import { montarMensagemProduto, urlWhatsApp } from "./order-message.js";
import { icone, esc, normalizar, foto } from "./ui.js";

const porId = new Map(PRODUTOS.map(p => [p.id, p]));
const catPorId = new Map(CATEGORIAS.map(c => [c.id, c]));

const linkWhats = produto => urlWhatsApp(montarMensagemProduto(produto, catPorId.get(produto.categoria)));

export function cardDestaque(produto) {
  const cat = catPorId.get(produto.categoria);
  const convidados = produto.unidade === "kit" ? produto.nome.match(/\((\d+) convidados\)/)?.[1] : null;
  const midia = produto.foto
    ? `<div class="product-card__media" data-gallery="destaques">
         ${foto(produto.foto, { tamanho: "1x1", sizes: "(min-width: 1000px) 380px, (min-width: 640px) 50vw, 100vw" })}
         ${produto.tag ? `<span class="badge badge--accent">${esc(produto.tag)}</span>` : ""}
       </div>`
    : `<div class="product-card__media product-card__media--ticket" aria-hidden="true">
         <span class="product-card__ticket-num">${esc(convidados ?? "Vila")}</span>
         <span class="product-card__ticket-label">${convidados ? "convidados" : "confeitaria"}</span>
       </div>`;
  return `<article class="product-card" data-item>
    ${midia}
    <div class="product-card__body">
      <p class="product-card__cat">${esc(cat?.nome ?? "")}</p>
      <h3 class="product-card__title">${esc(produto.nome)}</h3>
      <p class="product-card__desc">${esc(produto.descricao)}</p>
      <div class="product-card__foot">
        <p class="product-card__price"><span class="price">${rotuloPreco(produto)}</span></p>
        <a class="btn btn--whatsapp btn--sm" href="${linkWhats(produto)}" target="_blank" rel="noopener">
          ${icone("whatsapp")}<span>Encomendar</span>
        </a>
      </div>
    </div>
  </article>`;
}

export function renderDestaques() {
  const alvo = document.querySelector("[data-highlights]");
  if (!alvo) return;
  const lista = DESTAQUES.map(id => porId.get(id)).filter(Boolean);
  alvo.innerHTML = lista.map(cardDestaque).join("");
}

function linhaCardapio(produto) {
  const busca = normalizar(`${produto.nome} ${produto.descricao} ${produto.tag ?? ""} ${catPorId.get(produto.categoria)?.nome ?? ""}`);
  return `<article class="menu-item" data-item data-busca="${esc(busca)}">
    <div class="menu-item__body">
      <div class="menu-item__head">
        <h3 class="menu-item__title">${esc(produto.nome)}</h3>
        ${produto.tag ? `<span class="badge badge--primary">${esc(produto.tag)}</span>` : ""}
      </div>
      <p class="menu-item__desc">${esc(produto.descricao)}</p>
      <div class="menu-item__foot">
        <p class="menu-item__price price">${rotuloPreco(produto)}</p>
        <a class="menu-item__cta" href="${linkWhats(produto)}" target="_blank" rel="noopener">
          ${icone("whatsapp")}<span>Encomendar</span>
        </a>
      </div>
    </div>
    ${
      produto.foto
        ? `<div class="menu-item__thumb" data-gallery="cat-${produto.categoria}">${foto(produto.foto, {
            tamanho: "1x1",
            sizes: "112px",
            zoom: true,
          })}</div>`
        : ""
    }
  </article>`;
}

export function renderCardapio() {
  const alvo = document.querySelector("[data-menu]");
  if (!alvo) return;

  alvo.innerHTML = CATEGORIAS.map((cat, i) => {
    const itens = PRODUTOS.filter(p => p.categoria === cat.id);
    return `<section class="cat" id="cat-${cat.id}" data-cat="${cat.id}" data-gallery="cat-${cat.id}" aria-labelledby="cat-${cat.id}-titulo">
      <header class="cat__head">
        <span class="cat__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div class="cat__head-text">
          <h2 id="cat-${cat.id}-titulo">${esc(cat.nome)}</h2>
          <p class="cat__resumo">${esc(cat.resumo)}</p>
        </div>
        <p class="cat__nota">${icone("info", "icon icon--sm")}<span>${esc(cat.nota)}</span></p>
      </header>
      <div class="cat__items">${itens.map(linhaCardapio).join("")}</div>
    </section>`;
  }).join("");

  const total = document.querySelector("[data-total-itens]");
  if (total) total.textContent = String(PRODUTOS.length);
}

/** Monta os chips de categoria e o atalho de sabores. */
function renderChips() {
  const alvo = document.querySelector("[data-chips]");
  if (!alvo) return;
  alvo.innerHTML = CATEGORIAS.map(
    cat => `<a class="chip" href="#cat-${cat.id}" data-chip="${cat.id}">
      ${esc(cat.nome.replace(" & ", " e "))}
      <span class="chip__count">${PRODUTOS.filter(p => p.categoria === cat.id).length}</span>
    </a>`,
  ).join("");
}

/**
 * Busca com normalização de acentos + scroll-spy das categorias.
 * A busca esconde itens e categorias vazias; o contador anuncia o resultado.
 */
export function initBusca() {
  const campo = document.querySelector("[data-search]");
  const menu = document.querySelector("[data-menu]");
  if (!campo || !menu) return;

  renderChips();

  const itens = [...menu.querySelectorAll("[data-item]")];
  const secoes = [...menu.querySelectorAll("[data-cat]")];
  const vazio = document.querySelector("[data-empty]");
  const contador = document.querySelector("[data-count]");
  const limpar = document.querySelector("[data-clear]");

  const filtrar = () => {
    const termo = normalizar(campo.value);
    let visiveis = 0;
    for (const item of itens) {
      const ok = !termo || item.dataset.busca.includes(termo);
      item.hidden = !ok;
      if (ok) visiveis++;
    }
    for (const secao of secoes) {
      const temVisivel = [...secao.querySelectorAll("[data-item]")].some(i => !i.hidden);
      secao.hidden = !temVisivel;
    }
    if (vazio) vazio.hidden = visiveis > 0;
    if (contador) {
      contador.textContent = termo
        ? `${visiveis} ${visiveis === 1 ? "item encontrado" : "itens encontrados"} para “${campo.value.trim()}”`
        : `${PRODUTOS.length} itens no cardápio`;
    }
    if (limpar) limpar.hidden = !termo;
    document.documentElement.toggleAttribute("data-buscando", Boolean(termo));
  };

  campo.addEventListener("input", filtrar);
  campo.addEventListener("search", filtrar);
  limpar?.addEventListener("click", () => {
    campo.value = "";
    filtrar();
    campo.focus();
  });

  document.querySelectorAll("[data-termo]").forEach(botao => {
    botao.addEventListener("click", () => {
      campo.value = botao.dataset.termo;
      filtrar();
      campo.focus();
      document.querySelector("[data-menu]")?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  });

  // Scroll-spy: marca o chip da categoria visível
  const chips = [...document.querySelectorAll("[data-chip]")];
  if ("IntersectionObserver" in window && chips.length) {
    const spy = new IntersectionObserver(
      entradas => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const id = entrada.target.dataset.cat;
          chips.forEach(c => c.toggleAttribute("aria-current", c.dataset.chip === id));
          const ativo = chips.find(c => c.dataset.chip === id);
          ativo?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    secoes.forEach(secao => spy.observe(secao));
  }

  filtrar();
}
