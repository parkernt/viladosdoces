// Testes do núcleo da encomenda (cálculo, validação e mensagem do WhatsApp).
// node --test tools/test-order.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { calcularTotal, validar, montarMensagem, montarMensagemProduto, urlWhatsApp, resolverEstado } from '../assets/js/order-message.js';
import { TELEFONE_WHATSAPP } from '../assets/data/kit-festa.js';
import { PRODUTOS, CATEGORIAS, rotuloPreco, precoTexto, formatarPreco } from '../assets/data/menu.js';

const base = {
  tamanhoId: '20',
  boloId: 'tres-brigadeiros',
  docinhosIds: ['brigadeiro'],
  salgadosIds: ['coxinha'],
  extrasIds: [],
  entregaId: 'retirada',
  nome: 'Ana',
  data: '2030-05-20',
  observacao: '',
};

test('kit base de 20 convidados custa o preço do kit', () => {
  assert.equal(calcularTotal(base).total, 260);
});

test('sabor do bolo entra proporcional ao peso', () => {
  const comNinho = { ...base, boloId: 'ninho-morango' }; // +8/kg × 2 kg
  assert.equal(calcularTotal(comNinho).total, 276);
  const comFerrero = { ...base, boloId: 'ferrero' }; // +18/kg × 2 kg
  assert.equal(calcularTotal(comFerrero).total, 296);
});

test('docinhos e salgados com acréscimo entram por cento', () => {
  const estado = { ...base, docinhosIds: ['camafeu'], salgadosIds: ['empada'] };
  // camafeu +34 por cento × 50/100 = 17 · empada +12 × 100/100 = 12
  assert.equal(calcularTotal(estado).total, 260 + 17 + 12);
});

test('extras e entrega somam ao total', () => {
  const estado = { ...base, extrasIds: ['descartaveis', 'velas'], entregaId: 'entrega-santos' };
  assert.equal(calcularTotal(estado).total, 260 + 38 + 18 + 25);
});

test('sem tamanho escolhido o total é zero', () => {
  assert.deepEqual(calcularTotal({}).total, 0);
});

test('validação aponta os campos que faltam', () => {
  const erros = validar({}, new Date('2026-01-01T10:00:00'));
  const campos = erros.map(e => e.campo);
  for (const campo of ['tamanho', 'bolo', 'docinhos', 'salgados', 'nome', 'data']) {
    assert.ok(campos.includes(campo), `faltou validar ${campo}`);
  }
});

test('validação exige 2 dias de antecedência', () => {
  const hoje = new Date('2026-01-10T10:00:00');
  const amanha = validar({ ...base, data: '2026-01-11' }, hoje);
  assert.ok(amanha.some(e => e.campo === 'data'));

  const doisDias = validar({ ...base, data: '2026-01-12' }, hoje);
  assert.equal(doisDias.length, 0);
});

test('validação rejeita data passada', () => {
  const erros = validar({ ...base, data: '2020-01-01' }, new Date('2026-01-10T10:00:00'));
  assert.ok(erros.some(e => e.campo === 'data'));
});

test('mensagem traz kit, bolo, entrega e total', () => {
  const estado = {
    ...base,
    boloId: 'ninho-morango',
    docinhosIds: ['brigadeiro', 'beijinho'],
    salgadosIds: ['coxinha', 'kibe'],
    extrasIds: ['descartaveis'],
    entregaId: 'entrega-santos',
    nome: 'Ana Teste',
    data: '2030-05-20',
    observacao: 'Tema floral',
  };
  const texto = montarMensagem(estado);
  assert.match(texto, /\*Encomenda — Vila dos Doces\*/);
  assert.match(texto, /20 convidados/);
  assert.match(texto, /Ninho com Morango \(2 kg\)/);
  assert.match(texto, /Brigadeiro tradicional, Beijinho de coco/);
  assert.match(texto, /Coxinha de frango, Kibe/);
  assert.match(texto, /Kit descartáveis/);
  assert.match(texto, /Entrega em Santos/);
  assert.match(texto, /20\/05\/2030/);
  assert.match(texto, /Ana Teste/);
  assert.match(texto, /Tema floral/);
  assert.match(texto, /Total estimado: R\$\s339,00/);
});

test('mensagem vazia não quebra', () => {
  const texto = montarMensagem({});
  assert.match(texto, /Encomenda/);
  assert.doesNotMatch(texto, /undefined/);
  assert.doesNotMatch(texto, /NaN/);
});

test('URL do WhatsApp codifica acentos e quebras de linha', () => {
  const url = urlWhatsApp('Olá, coração!\nLinha 2');
  assert.ok(url.startsWith(`https://wa.me/${TELEFONE_WHATSAPP}?text=`));
  const texto = decodeURIComponent(url.split('?text=')[1]);
  assert.equal(texto, 'Olá, coração!\nLinha 2');
  assert.ok(!url.includes(' '), 'a URL não pode ter espaço cru');
});

test('mensagem de produto cita nome e preço', () => {
  const produto = PRODUTOS.find(p => p.id === 'bolo-tres-brigadeiros');
  const categoria = CATEGORIAS.find(c => c.id === produto.categoria);
  const texto = montarMensagemProduto(produto, categoria);
  assert.match(texto, /Bolo Três Brigadeiros/);
  assert.match(texto, /R\$\s96,00 o quilo/);
  assert.match(texto, /Bolos Confeitados/);
});

test('cardápio tem mais de 70 itens e todas as categorias têm itens', () => {
  assert.ok(PRODUTOS.length >= 70, `só ${PRODUTOS.length} itens`);
  for (const categoria of CATEGORIAS) {
    const itens = PRODUTOS.filter(p => p.categoria === categoria.id);
    assert.ok(itens.length >= 5, `categoria ${categoria.id} tem ${itens.length}`);
  }
});

test('todo produto tem preço positivo e descrição', () => {
  for (const produto of PRODUTOS) {
    assert.ok(produto.preco > 0, `${produto.id} sem preço`);
    assert.ok(produto.descricao.length > 40, `${produto.id} com descrição curta`);
    assert.ok(['kg', 'cento', 'un', 'kit'].includes(produto.unidade), `${produto.id} unidade ${produto.unidade}`);
  }
});

test('rótulos de preço seguem a unidade', () => {
  const kg = PRODUTOS.find(p => p.unidade === 'kg');
  const cento = PRODUTOS.find(p => p.unidade === 'cento');
  const un = PRODUTOS.find(p => p.unidade === 'un');
  assert.match(rotuloPreco(kg), /\/ kg/);
  assert.match(rotuloPreco(cento), /\/ cento/);
  assert.ok(!rotuloPreco(un).includes('/'));
  assert.equal(precoTexto(kg).includes('o quilo'), true);
  assert.match(formatarPreco(96), /96,00/);
});

test('ids de produto são únicos', () => {
  const ids = new Set(PRODUTOS.map(p => p.id));
  assert.equal(ids.size, PRODUTOS.length);
});

test('resolverEstado ignora ids inexistentes', () => {
  const estado = resolverEstado({ tamanhoId: 'nao-existe', docinhosIds: ['x', 'y'] });
  assert.equal(estado.tamanho, null);
  assert.deepEqual(estado.docinhos, []);
});
