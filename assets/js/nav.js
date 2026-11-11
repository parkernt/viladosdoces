/** Menu móvel acessível: abre, fecha, prende o foco e devolve para o botão. */

export function initNav() {
  const botao = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav]");
  if (!botao || !menu) return;

  const links = [...menu.querySelectorAll("a")];
  const abrir = () => {
    botao.setAttribute("aria-expanded", "true");
    menu.dataset.open = "true";
    menu.removeAttribute("inert");
    document.body.style.overflow = "hidden";
    // espera o painel ficar visível antes de mover o foco (senão o focus() é ignorado)
    setTimeout(() => links[0]?.focus({ preventScroll: true }), 60);
  };

  const fechar = ({ devolverFoco = false } = {}) => {
    botao.setAttribute("aria-expanded", "false");
    menu.dataset.open = "false";
    menu.setAttribute("inert", "");
    document.body.style.overflow = "";
    if (devolverFoco) botao.focus({ preventScroll: true });
  };

  // Começa fechado e fora da ordem de tabulação no mobile
  if (window.matchMedia("(max-width: 980px)").matches) menu.setAttribute("inert", "");

  botao.addEventListener("click", () => {
    const aberto = botao.getAttribute("aria-expanded") === "true";
    if (aberto) fechar({ devolverFoco: true });
    else abrir();
  });

  links.forEach(link => link.addEventListener("click", () => fechar()));

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && botao.getAttribute("aria-expanded") === "true") {
      fechar({ devolverFoco: true });
    }
    if (evento.key === "Tab" && botao.getAttribute("aria-expanded") === "true" && links.length) {
      const primeiro = links[0];
      const ultimo = links.at(-1);
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
  });

  document.addEventListener("click", evento => {
    if (botao.getAttribute("aria-expanded") !== "true") return;
    if (menu.contains(evento.target) || botao.contains(evento.target)) return;
    fechar();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && botao.getAttribute("aria-expanded") === "true") {
      fechar();
    }
  });
}
