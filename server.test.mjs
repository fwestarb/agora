import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp, retrieve, validAnalysis } from './server.mjs';
import { demo, demoInput } from './public/data.js';

async function serve(t, options) {
  const server = createApp(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return 'http://127.0.0.1:' + server.address().port;
}
const submit = (url, dilemma) => fetch(url + '/api/analyze', {
  method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({dilemma})
});
const fake = result => Response.json({choices:[{message:{content:JSON.stringify(result)}}]});
const env = {AI_API_KEY:'test-placeholder', AI_MODEL:'fake-model'};

test('o caso de evasão contém as categorias, fontes e relações esperadas', () => {
  assert.equal(validAnalysis(demo), true);
  assert.ok(demo.nodes.some(n => n.id === 'students'));
  assert.ok(demo.nodes.some(n => n.id === 'privacy'));
  assert.ok(demo.nodes.some(n => n.origin === 'source'));
  assert.ok(demo.nodes.some(n => n.origin === 'open'));
  assert.ok(demo.edges.some(e => e[1] === 'contesta'));
});

test('detecta IDs duplicados, relações órfãs, fontes inventadas e alternativas incompletas', () => {
  for (const corrupt of [
    data => data.nodes.push(data.nodes[0]),
    data => data.edges.push(['early','apoia','inexistente']),
    data => data.nodes.find(n => n.id === 'rights').sourceIds.push('falsa'),
    data => data.nodes.find(n => n.id === 'pilot').comparison = {},
    data => data.nodes.find(n => n.id === 'outcomes').origin = 'input'
  ]) {
    const data = structuredClone(demo);
    corrupt(data);
    assert.equal(validAnalysis(data), false);
  }
});

test('recupera acervo de acordo com os sinais do dilema', () => {
  assert.deepEqual(retrieve(demoInput).map(s => s.id), ['unicef','edgov']);
  for (const scenario of ['A escola deve usar tutor generativo?', 'A escola deve usar IA para corrigir redação?']) {
    assert.ok(retrieve(scenario).some(s => s.id === 'unesco'));
  }
});

test('cada alternativa liga um grupo a uma razão e há uma objeção conectada', () => {
  const mutations = [
    edges => edges.slice(0, 1),
    edges => edges.filter(([from, link]) => from !== 'human' || link !== 'afeta'),
    edges => edges.filter(([, link, to]) => to !== 'human' || link !== 'apoia'),
    edges => edges.filter(([, link]) => link !== 'contesta')
  ];
  for (const change of mutations) {
    assert.equal(validAnalysis({...demo, edges:change(demo.edges)}), false);
  }
});

test('rejeita tipos não textuais e procedência atribuída pelo modelo ao usuário', () => {
  const base = demo.nodes.find(node => node.id === 'early');
  const badNodes = [
    {...base, kind:['argument']},
    {...base, origin:['inference']},
    {...base, origin:'input'}
  ];
  for (const bad of badNodes) {
    assert.equal(validAnalysis({...demo, nodes:[...demo.nodes, {...bad, id:'extra'}]}), false);
  }
});

test('serve interface e demonstração sem credenciais', async t => {
  const url = await serve(t, {env:{}});
  assert.deepEqual(await (await fetch(url + '/api/status')).json(), {enabled:false});
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Abrir exemplo/);
  for (const asset of ['/app.js','/style.css','/data.js']) assert.equal((await fetch(url + asset)).status, 200);
  assert.equal((await submit(url, 'Pouco contexto')).status, 400);
  assert.equal((await submit(url, demoInput)).status, 503);
});

test('integra provedor simulado e separa as instruções do texto fornecido', async t => {
  const url = await serve(t, {env, request: async (endpoint, options) => {
    assert.equal(endpoint.pathname, '/v1/chat/completions');
    const body = JSON.parse(options.body);
    assert.equal(body.model, env.AI_MODEL);
    assert.equal(body.messages[0].role, 'system');
    assert.equal(body.messages[1].role, 'user');
    assert.equal(JSON.parse(body.messages[1].content).dilemma, demoInput);
    return fake(demo);
  }});
  assert.deepEqual(await (await fetch(url + '/api/status')).json(), {enabled:true});
  const response = await submit(url, demoInput);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).result, demo);
});

test('recusa fonte do acervo que não foi recuperada para o caso', async t => {
  const result = structuredClone(demo);
  result.nodes.find(n => n.id === 'rights').sourceIds = ['unesco'];
  const url = await serve(t, {env, request: async () => fake(result)});
  assert.equal((await submit(url, demoInput)).status, 502);
});

test('apresenta erros recuperáveis para limite, falha de rede e tempo esgotado', async t => {
  const replies = [
    async () => new Response(null, {status:429}),
    async () => { throw new TypeError('network'); },
    async () => { throw new DOMException('timeout', 'TimeoutError'); }
  ];
  const url = await serve(t, {env, request: (...args) => replies.shift()(...args)});
  for (const status of [429,502,504]) {
    const response = await submit(url, demoInput);
    assert.equal(response.status, status);
    assert.ok((await response.json()).error);
  }
});

