import { sources, types, origins, demo, demoInput } from './data.js';

const $ = id => document.getElementById(id);
const element = (tag, text, className) => {
  const item = document.createElement(tag);
  if (text) item.textContent = text;
  if (className) item.className = className;
  return item;
};
const button = (text, handler, className = 'secondary') => {
  const item = element('button', text, className);
  item.type = 'button';
  item.addEventListener('click', handler);
  return item;
};
const sourceLink = source => {
  const link = element('a', source.title);
  link.href = source.url;
  return link;
};
for (const source of sources) {
  const card = element('article');
  const title = element('h3');
  title.append(sourceLink(source));
  card.append(title, element('p', source.author + ' · ' + source.year + ' · ' + source.type, 'muted'),
    element('p', source.location), element('p', source.note));
  $('library').append(card);
}

const form = $('form');
const generate = $('generate');
let enabled = false;
let busy = false;
fetch('/api/status').then(r => r.json()).then(status => {
  enabled = status.enabled === true;
  generate.disabled = !enabled;
  $('provider').textContent = enabled
    ? 'Ao gerar, o texto será enviado ao provedor de IA configurado. Evite dados pessoais ou sensíveis.'
    : 'Modo demonstração. Para analisar um texto próprio, configure o provedor de IA no servidor.';
}).catch(() => {
  $('provider').textContent = 'Servidor indisponível. O caso de demonstração continua disponível.';
});

function openDemo() {
  if (busy) return;
  $('error').textContent = '';
  render(demo, true, demoInput);
}
$('demo').addEventListener('click', openDemo);
$('teaser').addEventListener('click', openDemo);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!enabled || busy) return;
  const payload = Object.fromEntries(new FormData(form));
  if (payload.dilemma.trim().length < 35) {
    $('error').textContent = 'Inclua mais contexto sobre quem decide e qual uso de IA está em debate.';
    $('dilemma').focus();
    return;
  }
  busy = true;
  generate.disabled = $('demo').disabled = $('teaser').disabled = true;
  $('error').textContent = '';
  $('status').textContent = 'Investigando o dilema…';
  form.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/analyze', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    render(data.result, false, [payload.dilemma, payload.context, payload.priorities].filter(Boolean).join('\n'));
  } catch (error) {
    const message = error instanceof TypeError ? 'A conexão falhou. Verifique o servidor e tente novamente.' : error.message;
    const previous = $('result').hidden ? '' : ' A análise anterior continua disponível abaixo.';
    $('error').textContent = message + previous;
  } finally {
    busy = false;
    form.removeAttribute('aria-busy');
    generate.disabled = $('demo').disabled = $('teaser').disabled = false;
    $('status').textContent = '';
  }
});

function render(data, sample, input) {
  const root = $('result');
  root.replaceChildren();
  const heading = element('h2', 'Mapa do dilema');
  heading.id = 'result-heading';
  heading.tabIndex = -1;
  const provided = element('details');
  provided.append(element('summary', 'Informação fornecida no caso'), element('p', input));
  root.append(element('p', sample ? 'Demonstração · análise preparada' : 'Análise gerada por IA', 'intro-label'),
    heading, element('p', sample ? 'Descrição do caso' : 'Síntese gerada por IA', 'intro-label'),
    element('p', data.summary, 'case-summary'), provided);
  const mapLayout = element('div', '', 'map-layout');
  const map = element('div', '', 'map');
  const inspector = element('aside', '', 'inspector');
  const list = element('details', '', 'text-map');
  list.append(element('summary', 'Explorar em lista'));
  mapLayout.append(map, inspector, list);
  root.append(mapLayout);

  const byId = new Map(data.nodes.map(node => [node.id, node]));
  const controls = new Map();
  let selection;
  let listOrigin;
  function focusDetail() {
    const title = inspector.querySelector('h3');
    title.tabIndex = -1;
    title.focus();
  }
  function select(id) {
    const node = byId.get(id);
    selection = id;
    for (const [key, items] of controls) {
      for (const item of items) item.setAttribute('aria-pressed', String(key === id));
    }
    for (const line of wire.children) {
      line.classList.toggle('active', line.dataset.from === id || line.dataset.to === id);
    }
    inspector.replaceChildren(element('p', types[node.kind] + ' · ' + origins[node.origin], 'intro-label'),
      element('h3', node.title), element('p', node.detail));
    for (const source of sources.filter(source => node.sourceIds.includes(source.id))) {
      const reference = element('p');
      reference.append(sourceLink(source));
      inspector.append(reference);
    }
    const connected = data.edges.filter(([from,,to]) => from === id || to === id);
    inspector.append(element('h4', 'Relações'));
    if (!connected.length) inspector.append(element('p', 'Nenhuma relação registrada.', 'muted'));
    const links = element('ul');
    for (const [from, relation, to] of connected) {
      const other = from === id ? to : from;
      const label = byId.get(from).title + ' ' + relation + ' ' + byId.get(to).title;
      const li = element('li');
      li.append(button(label, () => {
        select(other);
        focusDetail();
      }, 'relation'));
      links.append(li);
    }
    inspector.append(links);
    if (listOrigin) inspector.append(button('Voltar ao item na lista', () => listOrigin.focus()));
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const wire = document.createElementNS(svgNS, 'svg');
  wire.setAttribute('aria-hidden', 'true');
  map.append(wire);
  const columns = [['group','value'], ['alternative','argument','objection'], ['perspective','evidence','assumption','uncertainty']];
  const graphButtons = new Map();
  function makeControl(node, fromList = false) {
    const control = button(node.title, () => {
      listOrigin = fromList ? control : undefined;
      select(node.id);
      if (fromList) focusDetail();
    }, 'node ' + node.kind);
    control.setAttribute('aria-pressed', 'false');
    controls.set(node.id, [...(controls.get(node.id) ?? []), control]);
    return control;
  }
  for (const kinds of columns) {
    const column = element('div', '', 'map-column');
    for (const node of data.nodes.filter(n => kinds.includes(n.kind))) {
      const control = makeControl(node);
      graphButtons.set(node.id, control);
      column.append(control);
    }
    map.append(column);
  }
  for (const [kind, label] of Object.entries(types)) {
    const nodes = data.nodes.filter(n => n.kind === kind);
    if (!nodes.length) continue;
    const section = element('section');
    section.append(element('h4', label), ...nodes.map(node => makeControl(node, true)));
    list.append(section);
  }
  function draw() {
    wire.replaceChildren();
    const box = map.getBoundingClientRect();
    if (!box.width) return;
    for (const [from,,to] of data.edges) {
      const a = graphButtons.get(from).getBoundingClientRect();
      const b = graphButtons.get(to).getBoundingClientRect();
      const sameColumn = a.left === b.left;
      const forward = b.left > a.left;
      const x1 = (forward || sameColumn ? a.right : a.left) - box.left;
      const x2 = (forward ? b.left : b.right) - box.left;
      const y1 = a.top + a.height / 2 - box.top;
      const y2 = b.top + b.height / 2 - box.top;
      const mid = sameColumn ? x1 + 10 : (x1 + x2) / 2;
      const line = document.createElementNS(svgNS, 'path');
      line.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + mid + ' ' + y1 + ', ' + mid + ' ' + y2 + ', ' + x2 + ' ' + y2);
      line.dataset.from = from;
      line.dataset.to = to;
      line.classList.toggle('active', from === selection || to === selection);
      wire.append(line);
    }
  }
  select(data.nodes.find(n => n.kind === 'alternative').id);
  render.observer?.disconnect();
  render.observer = new ResizeObserver(draw);
  render.observer.observe(map);

  const compare = element('section', '', 'comparison');
  compare.append(element('h2', 'Comparar caminhos'));
  const cards = element('div', '', 'paths');
  const labels = {groups:'Grupos afetados', benefits:'Benefícios possíveis', risks:'Riscos possíveis', values:'Valores priorizados', needs:'O que falta saber'};
  for (const node of data.nodes.filter(n => n.kind === 'alternative')) {
    const article = element('article');
    const terms = element('dl');
    for (const [key, label] of Object.entries(labels)) terms.append(element('dt', label), element('dd', node.comparison[key]));
    article.append(element('h3', node.title), terms);
    cards.append(article);
  }
  compare.append(cards);
  const missing = element('section', '', 'questions');
  missing.append(element('h2', 'O que ainda precisamos saber?'));
  const prompts = element('ul');
  for (const node of data.nodes.filter(n => n.kind === 'uncertainty')) prompts.append(element('li', node.detail));
  missing.append(prompts, element('h3', 'Limites desta análise'));
  for (const limit of data.limitations) missing.append(element('p', limit));
  if (!sample) missing.append(element('p', 'A verificação automática checa a estrutura e os IDs das fontes. A fidelidade das paráfrases e a qualidade das interpretações exigem revisão humana.'));
  root.append(compare, missing);
  root.hidden = false;
  draw();
  heading.focus();
}

