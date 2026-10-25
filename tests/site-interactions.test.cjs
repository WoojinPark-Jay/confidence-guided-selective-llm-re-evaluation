const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const site = path.join(__dirname, '..', 'site');

// A small DOM double exercises event wiring without adding a browser dependency.
class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.dataset = {};
    this.style = {};
    this.value = '';
    this.open = false;
  }
  get options() { return this.children; }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return (this.text || '') + this.children.map(child => child.textContent).join(''); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.text = ''; this.children = children; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key]; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  dispatch(name, properties = {}) {
    const event = { button: 0, preventDefault() { this.defaultPrevented = true; }, ...properties };
    for (const callback of this.listeners[name] || []) callback(event);
    return event;
  }
  focus() { this.focused = true; }
  querySelector(selector) { return selector === 'summary' ? this.summary : null; }
}

function setup(hash = '') {
  const nodes = new Map();
  for (const id of ['prompt-file', 'prompt-text', 'prompt-source', 'prompt-stage-note', 'prompt-panel',
    'prompt-description', 'result-dataset', 'matrix-dataset', 'result-model', 'matrix-pair',
    'matrix-gain', 'matrix-source', 'result-context', 'outcome-chart']) nodes.set(id, new Element());
  for (const id of ['result-dataset', 'matrix-dataset']) nodes.get(id).value = 'Additional Reddit 9000';
  const models = nodes.get('result-model');
  models.value = 'Llama 3';
  models.append(...['Llama 3', 'Llama 2'].map(value => Object.assign(new Element('option'), { value })));
  const tabs = ['Direct', 'CoT', 'SELF-DISCOVER', 'Saved plans'].map((group, index) =>
    Object.assign(new Element('button'), { id: `prompt-${index}`, dataset: { prompt: group } }));
  const links = [1, 2, 3, 4].map(number => {
    const panel = new Element('details');
    panel.open = number === 1;
    panel.summary = new Element('summary');
    nodes.set(`algorithm-${number}`, panel);
    const link = new Element('a');
    link.setAttribute('href', `#algorithm-${number}`);
    return link;
  });
  const pre = new Element('pre');
  const window = new Element();
  window.location = { hash };
  const context = vm.createContext({ window, document: {
    getElementById: id => nodes.get(id) || null,
    createElement: tag => new Element(tag),
    querySelector: selector => selector === '.prompt-reader pre' ? pre : null,
    querySelectorAll: selector => selector === '[data-prompt]' ? tabs : links
  } });
  for (const file of ['results-data.js', 'prompt-data.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(site, file), 'utf8'), context, { filename: file });
  }
  function change(id, value) { nodes.get(id).value = value; nodes.get(id).dispatch('change'); }
  return { nodes, tabs, links, window, change };
}

test('dataset selectors synchronize in both directions and retain a valid model', () => {
  const { nodes, change } = setup();
  assert.equal(nodes.get('result-model').options[1].disabled, true);
  change('matrix-dataset', 'Reddit');
  assert.equal(nodes.get('result-dataset').value, 'Reddit');
  change('result-model', 'Llama 2');
  change('result-dataset', 'Mixed Emotion');
  assert.equal(nodes.get('matrix-dataset').value, 'Mixed Emotion');
  assert.equal(nodes.get('result-model').value, 'Llama 2');
  assert.match(nodes.get('result-context').textContent, /Phase 2: Llama 2/);
  assert.match(nodes.get('result-context').textContent, /86 of 300 posts/);
  assert.match(nodes.get('matrix-gain').textContent, /49 errors.*22 errors/);
  assert.equal(nodes.get('outcome-chart').children.length, 3);
  change('matrix-dataset', 'Additional Reddit 9000');
  assert.equal(nodes.get('result-model').value, 'Llama 3');
  assert.equal(nodes.get('result-model').options[1].disabled, true);
  assert.match(nodes.get('result-context').textContent, /Only Llama 3 was evaluated/);
});

test('Phase 2 selection never relabels or changes the Llama 3 matrices', () => {
  const { nodes, change } = setup();
  change('result-dataset', 'Reddit');
  const matrices = nodes.get('matrix-pair').textContent;
  change('result-model', 'Llama 2');
  assert.equal(nodes.get('matrix-pair').textContent, matrices);
  assert.match(matrices, /Final: Llama 3 SELF-DISCOVER/);
  assert.match(nodes.get('result-context').textContent, /Matrices above always show Llama 3 SELF-DISCOVER/);
});

test('algorithm links open and focus their targets, including repeated clicks', () => {
  const { nodes, links } = setup();
  assert.deepEqual([1, 2, 3, 4].map(n => nodes.get(`algorithm-${n}`).open), [true, false, false, false]);
  links[3].dispatch('click');
  assert.equal(nodes.get('algorithm-4').open, true);
  assert.equal(nodes.get('algorithm-4').summary.focused, true);
  nodes.get('algorithm-4').open = false;
  links[3].dispatch('click');
  assert.equal(nodes.get('algorithm-4').open, true);
  links[1].dispatch('click', { ctrlKey: true });
  assert.equal(nodes.get('algorithm-2').open, false);
});

test('initial deep links and hash navigation open the targeted algorithm', () => {
  const { nodes, window } = setup('#algorithm-3');
  assert.equal(nodes.get('algorithm-3').open, true);
  window.location.hash = '#algorithm-2';
  window.dispatch('hashchange');
  assert.equal(nodes.get('algorithm-2').open, true);
  window.location.hash = '#algorithm-invalid';
  assert.doesNotThrow(() => window.dispatch('hashchange'));
});

test('prompt tabs retain the selected stage and support keyboard navigation', () => {
  const { nodes, tabs, change } = setup();
  tabs[2].dispatch('click');
  change('prompt-file', '1');
  const text = nodes.get('prompt-text').textContent;
  tabs[0].dispatch('click');
  tabs[2].dispatch('click');
  assert.equal(nodes.get('prompt-file').value, '1');
  assert.equal(nodes.get('prompt-text').textContent, text);
  const event = tabs[2].dispatch('keydown', { key: 'End' });
  assert.equal(event.defaultPrevented, true);
  assert.equal(tabs[3].focused, true);
  assert.equal(tabs[3].getAttribute('aria-selected'), 'true');
  assert.equal(nodes.get('prompt-panel').getAttribute('aria-labelledby'), tabs[3].id);
  tabs[3].dispatch('keydown', { key: 'ArrowRight' });
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  assert.equal(tabs[3].tabIndex, -1);
});
