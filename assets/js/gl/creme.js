/** Hero: colheradas de creme acetinado com brilho que segue o ponteiro. */

import { criarCena, glPermitido } from "./core.js";

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float valor = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    valor += amp * ruido(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return valor;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;

  // domain warping: o creme se dobra sobre si mesmo
  vec2 q = vec2(
    fbm(p * 1.7 + vec2(t, -t * 0.6)),
    fbm(p * 1.7 + vec2(-t * 0.75, t * 0.9))
  );
  float n = fbm(p * 2.3 + q * 1.7);
  float redemoinho = smoothstep(0.22, 0.86, n);

  vec3 creme     = vec3(1.0, 0.992, 0.973);   // #FFFDF8
  vec3 baunilha  = vec3(0.960, 0.898, 0.780); // #F5E5C7
  vec3 caramelo  = vec3(0.890, 0.760, 0.560); // #E3C28F

  vec3 cor = mix(creme, baunilha, redemoinho * 0.9);
  cor = mix(cor, caramelo, smoothstep(0.58, 0.95, n) * 0.42);

  // brilho de glacê nas cristas
  float brilho = pow(smoothstep(0.5, 0.9, n), 2.0);
  cor += brilho * vec3(0.075, 0.055, 0.02);

  // ondulação que nasce do ponteiro
  vec2 d = (gl_FragCoord.xy / uRes) - uPointer;
  d.x *= uRes.x / uRes.y;
  float dist = length(d);
  float onda = exp(-dist * 6.5) * (0.5 + 0.5 * sin(dist * 42.0 - uTime * 1.7));
  cor = mix(cor, caramelo * 1.01, onda * 0.4);

  // vinheta quente e grão para não faixear
  cor *= 1.0 - 0.07 * pow(length(uv - 0.5), 1.5);
  cor += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.01;

  gl_FragColor = vec4(cor, 1.0);
}`;

export function initCreme(canvas) {
  if (!canvas || !glPermitido()) {
    canvas?.closest("[data-gl-wrap]")?.setAttribute("data-gl-fallback", "true");
    return null;
  }
  const cena = criarCena(canvas, FRAG);
  if (!cena) {
    canvas.hidden = true;
    canvas.closest("[data-gl-wrap]")?.setAttribute("data-gl-fallback", "true");
    return null;
  }
  canvas.hidden = false;
  cena.iniciar();
  return cena;
}
