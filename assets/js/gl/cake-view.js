/**
 * Visualizador 3D procedural do bolo (raymarching de SDF).
 * Sem modelo, sem textura, sem Three.js: a forma e as camadas nascem do shader
 * e as cores seguem o sabor escolhido no montador de encomendas.
 */

import { criarCena, glPermitido } from "./core.js";
import { saborAtual } from "../estado.js";

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uMassa;
uniform vec3 uRecheio;
uniform vec3 uCobertura;

float sdCilindro(vec3 p, vec2 h) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - h;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float mapa(vec3 p, out float id) {
  // prato raso
  float prato = sdCilindro(p - vec3(0.0, -0.56, 0.0), vec2(1.16, 0.026)) - 0.02;
  // bolo com bordas arredondadas
  vec3 q = p;
  float bolo = sdCilindro(q, vec2(0.78, 0.44)) - 0.05;
  // cobertura ondulada no topo
  bolo += 0.018 * sin(q.x * 9.0) * sin(q.z * 9.0) * smoothstep(0.12, 0.4, q.y);
  id = bolo < prato ? 1.0 : 2.0;
  return min(bolo, prato);
}

vec3 normalDe(vec3 p) {
  float e = 0.0018;
  float id;
  vec3 n = vec3(
    mapa(p + vec3(e, 0.0, 0.0), id) - mapa(p - vec3(e, 0.0, 0.0), id),
    mapa(p + vec3(0.0, e, 0.0), id) - mapa(p - vec3(0.0, e, 0.0), id),
    mapa(p + vec3(0.0, 0.0, e), id) - mapa(p - vec3(0.0, 0.0, e), id)
  );
  return normalize(n + vec3(0.0001));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float ang = uTime * 0.14 + (uPointer.x - 0.5) * 1.6;
  float altura = 1.02 + (uPointer.y - 0.5) * 0.5;
  vec3 ro = vec3(2.55 * sin(ang), altura, 2.55 * cos(ang));
  vec3 ta = vec3(0.0, -0.02, 0.0);

  vec3 f = normalize(ta - ro);
  vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
  vec3 u = cross(f, r);
  vec3 rd = normalize(uv.x * r + uv.y * u + 1.52 * f);

  float t = 0.0;
  float id = 0.0;
  bool acertou = false;
  for (int i = 0; i < 120; i++) {
    vec3 p = ro + rd * t;
    float d = mapa(p, id);
    if (d < 0.0016) {
      acertou = true;
      break;
    }
    t += d * 0.88;
    if (t > 8.0) break;
  }

  if (!acertou) discard;

  vec3 p = ro + rd * t;
  vec3 n = normalDe(p);
  vec3 cor;

  if (id > 1.5) {
    // prato de cerâmica com sombra de contato
    cor = vec3(0.968, 0.941, 0.902);
    float d = length(p.xz);
    float sombra = smoothstep(0.0, 0.95, d);
    cor *= 0.78 + 0.22 * sombra;
  } else {
    if (p.y > 0.34) {
      cor = uCobertura;
      // fios de calda descendo pelas laterais
      float angulo = atan(p.z, p.x);
      float fio = smoothstep(0.35, 0.85, sin(angulo * 6.0 + 1.3) * 0.5 + 0.5);
      fio *= smoothstep(0.36, 0.02, p.y) * smoothstep(0.02, 0.36, p.y);
      cor = mix(cor, uCobertura * 0.72, fio * 0.75);
      // brilho úmido no topo
      cor += smoothstep(0.4, 0.46, p.y) * 0.06;
    } else if (p.y < -0.38) {
      cor = uMassa * 0.88;
    } else {
      float camada = fract((p.y + 0.38) / 0.155);
      cor = camada < 0.5 ? uMassa : uRecheio;
      // migalha: variação fina de tom
      cor *= 0.96 + 0.08 * fract(sin(dot(p, vec3(12.9, 78.2, 37.7))) * 43758.5);
    }
  }

  vec3 luz = normalize(vec3(-0.5, 1.0, 0.6));
  vec3 meio = normalize(luz - rd);
  float dif = clamp(dot(n, luz), 0.0, 1.0);
  float esp = pow(clamp(dot(meio, n), 0.0, 1.0), 54.0);
  float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 2.6);
  float ao = clamp(1.0 - float(t) * 0.055, 0.6, 1.0);

  // luz ambiente quente vinda de cima
  cor *= 0.5 + 0.68 * dif + 0.12 * clamp(n.y, 0.0, 1.0);
  cor += esp * 0.55 + rim * 0.09;
  cor *= ao;

  gl_FragColor = vec4(cor, 1.0);
}`;

const hexParaRgb = hex => {
  const v = hex.replace("#", "");
  return [parseInt(v.slice(0, 2), 16) / 255, parseInt(v.slice(2, 4), 16) / 255, parseInt(v.slice(4, 6), 16) / 255];
};

const misturar = (atual, alvo, fator) => atual.map((v, i) => v + (alvo[i] - v) * fator);

export function initCake(canvas) {
  if (!canvas || !glPermitido()) {
    canvas?.closest("[data-cake-wrap]")?.setAttribute("data-gl-fallback", "true");
    return null;
  }

  const alvo = {
    massa: hexParaRgb(saborAtual.cores?.massa ?? "#6b4423"),
    recheio: hexParaRgb(saborAtual.cores?.recheio ?? "#3a1f12"),
    cobertura: hexParaRgb(saborAtual.cores?.cobertura ?? "#2b1509"),
  };
  const atual = { ...alvo };

  const cena = criarCena(canvas, FRAG, {
    extras: ["uMassa", "uRecheio", "uCobertura"],
    dprMax: 1.5,
    onFrame: ({ gl, locais }) => {
      for (const chave of ["massa", "recheio", "cobertura"]) {
        atual[chave] = misturar(atual[chave], alvo[chave], 0.06);
      }
      gl.uniform3fv(locais.uMassa, atual.massa);
      gl.uniform3fv(locais.uRecheio, atual.recheio);
      gl.uniform3fv(locais.uCobertura, atual.cobertura);
    },
  });

  if (!cena) {
    canvas.hidden = true;
    canvas.closest("[data-cake-wrap]")?.setAttribute("data-gl-fallback", "true");
    return null;
  }

  document.addEventListener("cake:flavor", evento => {
    const cores = evento.detail;
    if (!cores) return;
    alvo.massa = hexParaRgb(cores.massa);
    alvo.recheio = hexParaRgb(cores.recheio);
    alvo.cobertura = hexParaRgb(cores.cobertura);
  });

  canvas.hidden = false;
  cena.iniciar();
  return cena;
}
