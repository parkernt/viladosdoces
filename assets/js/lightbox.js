/** Lightbox das fotos: <dialog> nativo, teclado, contador e legenda. */

import { IMAGENS, urlImagem } from "../data/images.js";

export function initLightbox() {
  const dialogo = document.querySelector("[data-lightbox]");
  if (!dialogo) return;

  const imagem = dialogo.querySelector("[data-lightbox-img]");
  const legenda = dialogo.querySelector("[data-lightbox-caption]");
  const contador = dialogo.querySelector("[data-lightbox-count]");
  const anterior = dialogo.querySelector("[data-lightbox-prev]");
  const proximo = dialogo.querySelector("[data-lightbox-next]");
  const fechar = dialogo.querySelector("[data-lightbox-close]");

  let grupo = [];
  let indice = 0;

  const maiorJpg = slug => urlImagem(slug, IMAGENS[slug].widths.at(-1), "jpg");

  function mostrar(n) {
    if (!grupo.length) return;
    indice = (n + grupo.length) % grupo.length;
    const slug = grupo[indice];
    const dados = IMAGENS[slug];
    imagem.src = maiorJpg(slug);
    imagem.alt = dados.alt;
    legenda.textContent = dados.alt;
    contador.textContent = `${indice + 1} de ${grupo.length}`;
    const soUm = grupo.length < 2;
    if (anterior) anterior.hidden = soUm;
    if (proximo) proximo.hidden = soUm;
  }

  function abrir(slug, escopo) {
    const raiz = escopo || document;
    grupo = [...raiz.querySelectorAll("[data-foto]")].map(el => el.dataset.foto).filter(s => IMAGENS[s]);
    if (!grupo.length) grupo = [slug];
    mostrar(Math.max(0, grupo.indexOf(slug)));
    if (typeof dialogo.showModal === "function") dialogo.showModal();
    else dialogo.setAttribute("open", "");
  }

  document.addEventListener("click", evento => {
    const alvo = evento.target.closest("[data-foto]");
    if (!alvo) return;
    // não sequestra cliques em links
    if (evento.target.closest("a")) return;
    evento.preventDefault();
    const escopo = alvo.closest("[data-gallery]");
    abrir(alvo.dataset.foto, escopo);
  });

  // navegação por teclado dentro do diálogo
  dialogo.addEventListener("keydown", evento => {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      mostrar(indice + 1);
    }
    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      mostrar(indice - 1);
    }
  });

  dialogo.querySelectorAll("[data-lightbox-prev], [data-lightbox-next]").forEach(botao => {
    botao.addEventListener("click", () => mostrar(indice + (botao.hasAttribute("data-lightbox-next") ? 1 : -1)));
  });

  fechar?.addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("click", evento => {
    if (evento.target === dialogo) dialogo.close();
  });
}
