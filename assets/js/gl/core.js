/**
 * WebGL puro, sem biblioteca. Um contexto por cena (o limite de ~16 contextos do
 * navegador não é ameaçado) e renderização pausada quando o canvas sai da tela.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** Ambientes sem WebGL, com movimento reduzido ou com ?gl=off não criam canvas. */
export function glPermitido() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("gl") === "off") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return typeof WebGLRenderingContext !== "undefined";
}

function compilar(gl, tipo, fonte) {
  const shader = gl.createShader(tipo);
  gl.shaderSource(shader, fonte);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[gl] shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function criarPrograma(gl, frag) {
  const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
  const fs = compilar(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[gl] link:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

/**
 * Cria uma cena de fragment shader em tela cheia.
 * `onFrame` recebe o estado (tempo, ponteiro, scroll) e desenha os uniforms.
 */
export function criarCena(canvas, fragmento, { onFrame, dprMax = 1.75, extras = [] } = {}) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const programa = criarPrograma(gl, fragmento);
  if (!programa) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(programa, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(programa);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const nomes = ["uTime", "uRes", "uPointer", "uScroll", "uProgress", ...extras];
  const locais = {};
  nomes.forEach(nome => (locais[nome] = gl.getUniformLocation(programa, nome)));

  let largura = 0;
  let altura = 0;
  let dpr = 1;
  let visivel = true;
  let rodando = false;
  let frame = 0;
  const ponteiro = { x: 0.5, y: 0.5, alvoX: 0.5, alvoY: 0.5 };
  const inicio = performance.now();

  function medir() {
    const retangulo = canvas.getBoundingClientRect();
    if (!retangulo.width || !retangulo.height) return false;
    dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    const nova = { w: Math.round(retangulo.width * dpr), h: Math.round(retangulo.height * dpr) };
    if (nova.w === largura && nova.h === altura) return true;
    largura = nova.w;
    altura = nova.h;
    canvas.width = largura;
    canvas.height = altura;
    gl.viewport(0, 0, largura, altura);
    return true;
  }

  function progresso() {
    const retangulo = canvas.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // 0 quando o topo do elemento está na base da tela, 1 quando já subiu 60%
    return Math.min(1, Math.max(0, (vh - retangulo.top) / (retangulo.height * 0.9 + vh * 0.15)));
  }

  function desenhar(agora) {
    if (!rodando) return;
    frame = requestAnimationFrame(desenhar);
    if (!visivel || document.hidden) return;
    if (!medir()) return;

    const tempo = (agora - inicio) / 1000;
    ponteiro.x += (ponteiro.alvoX - ponteiro.x) * 0.08;
    ponteiro.y += (ponteiro.alvoY - ponteiro.y) * 0.08;

    gl.useProgram(programa);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (locais.uTime) gl.uniform1f(locais.uTime, tempo);
    if (locais.uRes) gl.uniform2f(locais.uRes, largura, altura);
    if (locais.uPointer) gl.uniform2f(locais.uPointer, ponteiro.x, ponteiro.y);
    if (locais.uScroll) gl.uniform1f(locais.uScroll, window.scrollY);
    if (locais.uProgress) gl.uniform1f(locais.uProgress, progresso());

    onFrame?.({ gl, locais, tempo, ponteiro, largura, altura, progresso: progresso() });
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function aoMover(evento) {
    const retangulo = canvas.getBoundingClientRect();
    if (!retangulo.width) return;
    const x = (evento.clientX - retangulo.left) / retangulo.width;
    const y = (evento.clientY - retangulo.top) / retangulo.height;
    // sistema de coordenadas do GL: y para cima
    ponteiro.alvoX = Math.min(1, Math.max(0, x));
    ponteiro.alvoY = Math.min(1, Math.max(0, 1 - y));
  }

  function aoTocar(evento) {
    const toque = evento.touches?.[0] ?? evento.changedTouches?.[0];
    if (!toque) return;
    aoMover({ clientX: toque.clientX, clientY: toque.clientY });
  }

  window.addEventListener("pointermove", aoMover, { passive: true });
  window.addEventListener("touchmove", aoTocar, { passive: true });

  let observador;
  if ("IntersectionObserver" in window) {
    observador = new IntersectionObserver(
      entradas => entradas.forEach(entrada => (visivel = entrada.isIntersecting)),
      { rootMargin: "120px" },
    );
    observador.observe(canvas);
  }

  return {
    gl,
    canvas,
    programa,
    iniciar() {
      if (rodando) return;
      rodando = true;
      medir();
      frame = requestAnimationFrame(desenhar);
    },
    parar() {
      rodando = false;
      cancelAnimationFrame(frame);
    },
    destruir() {
      this.parar();
      observador?.disconnect();
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("touchmove", aoTocar);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(programa);
    },
  };
}
