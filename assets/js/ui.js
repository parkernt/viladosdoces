/** Utilidades de interface: markup seguro, imagens responsivas e ícones. */

import { IMAGENS, urlImagem } from "../data/images.js";

/** Escapa texto para interpolação em HTML. */
export function esc(valor = "") {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Minúsculas e sem acento — para busca ("limao" acha "Limão"). */
export function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Ícone do sprite. Decorativo por padrão. */
export function icone(nome, classe = "icon") {
  return `<svg class="${classe}" aria-hidden="true" focusable="false"><use href="assets/svg/icons.svg#${nome}"/></svg>`;
}

/**
 * <picture> com AVIF, WebP e JPG nas larguras disponíveis, mais o LQIP no fundo.
 * width/height reais evitam layout shift durante o carregamento.
 */
export function foto(slug, { tamanho = "4x3", sizes = "(min-width: 900px) 33vw, 100vw", eager = false, alt = "", classe = "", zoom = true } = {}) {
  const m = IMAGENS[slug];
  if (!m) return "";
  const srcset = ext => m.widths.map(w => `${urlImagem(slug, w, ext)} ${w}w`).join(", ");
  const legenda = alt || m.alt;
  return `<div class="photo photo--${tamanho} ${zoom ? "photo--zoom" : ""} ${classe}" data-foto="${slug}" style="background-image:url('${m.lqip}');background-size:cover">
      <picture>
        <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
        <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
        <img src="${urlImagem(slug, m.widths[0], "jpg")}" srcset="${srcset("jpg")}" sizes="${sizes}"
             width="${m.w}" height="${m.h}" alt="${esc(legenda)}" loading="${eager ? "eager" : "lazy"}"
             decoding="async" ${eager ? 'fetchpriority="high"' : ""}>
      </picture>
    </div>`;
}

/** Texto de data por extenso, curto: "sábado, 22 de novembro". */
export function dataLonga(iso) {
  if (!iso) return "";
  const data = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

/** Hoje + n dias em ISO (yyyy-mm-dd), no fuso local. */
export function isoDaqui(dias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}
