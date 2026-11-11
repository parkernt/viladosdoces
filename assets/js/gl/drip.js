/**
 * Efeito drip cake: a calda escorre sobre a foto conforme a página rola.
 * Cada foto com data-gl="drip" ganha uma camada de glacê desenhada no shader,
 * com a cor vinda de data-glaze (chocolate | morango).
 */

import { criarCena, glPermitido } from "./core.js";

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
uniform vec3 uA;
uniform vec3 uB;

float hash(vec2 p) {
  p = fract(p * vec2(127.31, 311.7));
  p += dot(p, p + 34.21);
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
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * ruido(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float distTopo = 1.0 - uv.y;

  float largo = fbm(vec2(uv.x * 5.0, 1.3));
  float fino = fbm(vec2(uv.x * 22.0, 7.7));
  float gota = fbm(vec2(uv.x * 38.0, 3.3));

  // faixa fina de cobertura no topo, que cresce com o scroll
  float faixa = mix(0.03, 0.1, uProgress) + 0.035 * pow(largo, 2.0);

  // escorridos: poucas colunas, comprimentos variados
  float coluna = smoothstep(0.64, 0.96, gota);
  float comprimento = 0.12 + 0.34 * smoothstep(0.5, 1.0, fino);

  float corpo = smoothstep(faixa + 0.006, faixa - 0.006, distTopo);
  float pingos = smoothstep(faixa + comprimento, faixa + 0.012, distTopo) * coluna;
  float mascara = clamp(corpo + pingos, 0.0, 1.0);
  if (mascara < 0.01) discard;

  vec3 cor = mix(uA, uB, smoothstep(0.15, 0.92, fino));
  cor *= 0.88 + 0.18 * (1.0 - distTopo);

  // brilho de calda molhada exatamente na borda do escorrido
  float contorno = mascara * (1.0 - mascara) * 4.0;
  cor += contorno * vec3(0.34, 0.22, 0.14);

  float alfa = mascara * mix(0.88, 0.97, corpo);
  gl_FragColor = vec4(cor, alfa);
}`;

const CORES = {
  chocolate: { a: [0.145, 0.071, 0.041], b: [0.361, 0.19, 0.098] },
  morango: { a: [0.31, 0.055, 0.075], b: [0.62, 0.16, 0.22] },
};

export function initDrip(elementos) {
  if (!glPermitido()) return [];
  const cenas = [];

  for (const el of elementos) {
    // o canvas é criado aqui: no HTML basta marcar a foto com data-drip
    let canvas = el.querySelector(":scope > canvas[data-gl]");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("data-gl", "");
      canvas.setAttribute("aria-hidden", "true");
      el.appendChild(canvas);
    }
    const cor = CORES[el.dataset.drip] ?? CORES.chocolate;
    const cena = criarCena(canvas, FRAG, {
      extras: ["uA", "uB"],
      dprMax: 1.4,
      onFrame: ({ gl, locais, progresso }) => {
        if (locais.uA) gl.uniform3fv(locais.uA, cor.a);
        if (locais.uB) gl.uniform3fv(locais.uB, cor.b);
        if (locais.uProgress) gl.uniform1f(locais.uProgress, progresso);
      },
    });
    if (!cena) {
      canvas.remove();
      el.dataset.glFallback = "true";
      continue;
    }
    canvas.hidden = false;
    cena.iniciar();
    cenas.push(cena);
  }
  return cenas;
}
