/** Revelação suave de blocos ao entrar na tela (respeita prefers-reduced-motion). */

export function initReveal() {
  const alvos = [...document.querySelectorAll("[data-reveal]")];
  if (!alvos.length) return;

  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduzir || !("IntersectionObserver" in window)) {
    alvos.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver(
    entradas => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  alvos.forEach(alvo => observador.observe(alvo));
}
