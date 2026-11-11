/** Ponto de entrada dos efeitos: só roda o que a página tem. */

import { glPermitido } from "./core.js";
import { initCreme } from "./creme.js";
import { initDrip } from "./drip.js";
import { initCake } from "./cake-view.js";

export function initGL() {
  if (!glPermitido()) {
    document.documentElement.setAttribute("data-gl", "off");
    return { criados: 0 };
  }

  let criados = 0;

  const heroCanvas = document.querySelector('canvas[data-gl="creme"]');
  if (heroCanvas) {
    if (initCreme(heroCanvas)) criados++;
  }

  const drips = [...document.querySelectorAll("[data-drip]")];
  if (drips.length) criados += initDrip(drips).length;

  const cakeCanvas = document.querySelector('canvas[data-gl="cake"]');
  if (cakeCanvas) {
    if (initCake(cakeCanvas)) criados++;
  }

  document.documentElement.setAttribute("data-gl", criados ? "on" : "off");
  return { criados };
}
