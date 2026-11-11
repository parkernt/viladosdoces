/** Ponto de entrada: inicializa só o que existe na página. */

import { initNav } from "./nav.js";
import { initReveal } from "./reveal.js";
import { initLightbox } from "./lightbox.js";
import { renderDestaques, renderCardapio, initBusca } from "./menu-render.js";
import { initOrderBuilder } from "./order-builder.js";

function iniciar() {
  initNav();
  initReveal();
  initLightbox();

  renderDestaques();
  renderCardapio();
  initBusca();
  initOrderBuilder();

  const ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = String(new Date().getFullYear());

  if (document.querySelector('canvas[data-gl="creme"], [data-drip], canvas[data-gl="cake"]')) {
    import("./gl/index.js")
      .then(modulo => modulo.initGL())
      .catch(erro => {
        document.documentElement.setAttribute("data-gl", "off");
        console.warn("[gl] indisponível:", erro);
      });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}
