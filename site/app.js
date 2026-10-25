const body = document.getElementById('all-results-body');
const promptTabs = [...document.querySelectorAll('[data-prompt]')];
const fileSelect = document.getElementById('prompt-file');
let currentGroup = 'Direct';
const promptSelections = new Map();
const descriptions = {
  Direct: 'One user message includes the shared policy, original text, and Phase 1 prediction. No rationale is requested.',
  CoT: 'A system message precedes five generation calls: acknowledgment, text response, independent analysis, comparison, and final decision. Assistant responses remain in the conversation.',
  'SELF-DISCOVER': 'Task-level SELECT, ADAPT, and IMPLEMENT precede per-post execution. The evidence ledger and counterfactual check are researcher-authored execution instructions.',
  'Saved plans': 'Unedited model-generated task-level plans used in the experiments, not per-post answers. The Llama 2 output is preserved even where it differs from the requested compact format.'
};
function showPrompt() {
  promptSelections.set(currentGroup, fileSelect.value);
  const file = window.studyPrompts[currentGroup][Number(fileSelect.value)];
  document.getElementById('prompt-text').textContent = file.text;
  document.getElementById('prompt-source').href = 'https://github.com/WoojinPark-Jay/confidence-guided-selective-llm-re-evaluation/blob/main/' + file.path;
  document.querySelector('.prompt-reader pre').scrollTop = 0;
  const notes = {
    'Saved plans': 'This is a task-level procedure generated before post evaluation. It is reused, not regenerated for each post.',
    'CoT': 'The system message sets the role; the five numbered stages each trigger a model response. The post template supplies {text}.',
    'SELF-DISCOVER': 'SELECT chooses modules; ADAPT specializes them; IMPLEMENT writes the saved plan. Per-post execution inserts that plan as {structure}, together with {policy} and {text}.',
    'Direct': '{policy} is the shared label policy; {text} is one post; {phase1_label} is the classifier prediction.'
  };
  document.getElementById('prompt-stage-note').textContent = notes[currentGroup];
}
function choosePrompt(tab) {
  currentGroup = tab.dataset.prompt;
  promptTabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  document.getElementById('prompt-panel').setAttribute('aria-labelledby', tab.id);
  fileSelect.replaceChildren(...window.studyPrompts[currentGroup].map((file, index) => {
    const option = document.createElement('option'); option.value = index; option.textContent = file.title; return option;
  }));
  fileSelect.value = promptSelections.get(currentGroup) || '0';
  document.getElementById('prompt-description').textContent = descriptions[currentGroup];
  showPrompt();
}
if (window.studyPrompts) {
  fileSelect.disabled = false;
  promptTabs.forEach((tab,index) => {
    tab.addEventListener('click', () => choosePrompt(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? promptTabs.length-1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + promptTabs.length) % promptTabs.length;
      promptTabs[next].focus(); choosePrompt(promptTabs[next]);
    });
  });
  fileSelect.addEventListener('change', showPrompt);
  choosePrompt(promptTabs[0]);
}

const datasetSelect = document.getElementById('result-dataset');
const matrixSelect = document.getElementById('matrix-dataset');
function showMatrices() {
  const data = window.studyMatrices[matrixSelect.value];
  const host = document.getElementById('matrix-pair');
  host.replaceChildren();
  const errors = [];
  ['phase1_label', 'final_label'].forEach((key, stage) => {
    const matrix = data[key];
    const correct = matrix.reduce((sum, row, i) => sum + row[i], 0);
    errors.push(data.n - correct);
    const figure = document.createElement('figure');
    const title = document.createElement('figcaption');
    title.textContent = `${stage ? 'Final: Llama 3 SELF-DISCOVER' : 'Phase 1: DistilBERT'} | ${(correct/data.n*100).toFixed(2)}%`;
    const table = document.createElement('table');
    table.className = 'confusion-table';
    const head = document.createElement('thead');
    const heading = document.createElement('tr');
    ['Reference / predicted', ...data.labels].forEach(label => {
      const th = document.createElement('th'); th.scope = 'col'; th.textContent = label; heading.append(th);
    });
    head.append(heading); table.append(head);
    const tbody = document.createElement('tbody');
    matrix.forEach((row, i) => {
      const tr = document.createElement('tr');
      const label = document.createElement('th'); label.scope = 'row'; label.textContent = data.labels[i]; tr.append(label);
      const total = row.reduce((a,b) => a+b, 0);
      row.forEach(value => {
        const td = document.createElement('td');
        const share = value / total;
        td.style.backgroundColor = `rgba(48, 104, 143, ${share})`;
        td.style.color = share > 0.55 ? '#fff' : '#252525';
        const count = document.createElement('strong'); count.textContent = value.toLocaleString('en-US');
        const percent = document.createElement('small'); percent.textContent = (share*100).toFixed(1) + '%';
        td.append(count, percent); tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(tbody); figure.append(title, table); host.append(figure);
  });
  const scope = matrixSelect.value === 'Additional Reddit 9000' ? 'Fixed-protocol evaluation.' : 'Exploratory evaluation used during prompt development.';
  document.getElementById('matrix-gain').textContent = `${errors[0]} errors → ${errors[1]} errors: ${errors[0]-errors[1]} net corrections, +${((errors[0]-errors[1])/data.n*100).toFixed(2)} percentage points. ${scope}`;
  document.getElementById('matrix-source').href = 'https://github.com/WoojinPark-Jay/confidence-guided-selective-llm-re-evaluation/blob/main/' + data.source;
}
const modelSelect = document.getElementById('result-model');
function showOutcomes() {
  const dataset = datasetSelect.value;
  const availableModels = new Set(window.studyResults.filter(row => row.dataset === dataset).map(row => row.model));
  [...modelSelect.options].forEach(option => { option.disabled = !availableModels.has(option.value); });
  if (!availableModels.has(modelSelect.value)) {
    modelSelect.value = [...modelSelect.options].find(option => !option.disabled)?.value || '';
  }
  const methods = ['Direct','CoT','SELF-DISCOVER'];
  const rows = window.studyResults.filter(row => row.dataset === dataset && row.model === modelSelect.value)
    .sort((a,b) => methods.indexOf(a.method)-methods.indexOf(b.method));
  const scale = Math.max(...rows.flatMap(row => [row.corrected,row.introduced]),1);
  const routed = dataset === 'Reddit' ? 218 : dataset === 'Mixed Emotion' ? 86 : 111;
  const chart = document.getElementById('outcome-chart'); chart.replaceChildren();
  if (!rows.length) {
    document.getElementById('result-context').textContent = 'No released results are available for this dataset and Phase 2 model.';
    return;
  }
  document.getElementById('result-context').textContent =
    `Phase 2: ${modelSelect.value}. ` +
    (dataset === 'Additional Reddit 9000' ? 'Fixed-protocol evaluation. ' : 'Exploratory prompt-development evaluation. ') +
    `${routed} of ${rows[0].n.toLocaleString('en-US')} posts routed; Phase 1 accuracy ${rows[0].phase1_accuracy_percent.toFixed(2)}%. ` +
    'Matrices above always show Llama 3 SELF-DISCOVER. ' +
    (availableModels.size === 1 ? `Only ${modelSelect.value} was evaluated on this dataset.` : '');
  rows.forEach(row => {
    const item = document.createElement('div'); item.className = 'outcome-row';
    const label = document.createElement('strong'); label.className = 'outcome-name'; label.textContent = row.method;
    const bars = document.createElement('div'); bars.className = 'bar-pair'; bars.setAttribute('aria-hidden','true');
    ['corrected','introduced'].forEach(key => {
      const track = document.createElement('div'); track.className = 'bar-track';
      const bar = document.createElement('span'); bar.className = 'bar ' + key;
      bar.style.width = (100*row[key]/scale) + '%'; track.append(bar); bars.append(track);
    });
    const count = document.createElement('div'); count.className = 'outcome-count';
    count.textContent = `${row.corrected} − ${row.introduced} = ${row.net_corrections > 0 ? '+' : ''}${row.net_corrections}`;
    count.setAttribute('aria-label',`${row.corrected} corrected, ${row.introduced} introduced, ${row.net_corrections} net corrections`);
    const detail = document.createElement('small');
    const gain = row.net_corrections / row.n * 100;
    detail.textContent = `${row.accuracy_percent.toFixed(2)}% accuracy (${gain > 0 ? '+' : ''}${gain.toFixed(2)} pp)`;
    count.append(detail); item.append(label,bars,count); chart.append(item);
  });
}
function chooseDataset(dataset) {
  if (datasetSelect) datasetSelect.value = dataset;
  if (matrixSelect) matrixSelect.value = dataset;
  if (matrixSelect && window.studyMatrices) showMatrices();
  if (datasetSelect && modelSelect && window.studyResults) showOutcomes();
}
if (matrixSelect) matrixSelect.addEventListener('change', () => chooseDataset(matrixSelect.value));
if (datasetSelect) datasetSelect.addEventListener('change', () => chooseDataset(datasetSelect.value));
if (window.studyResults && datasetSelect && modelSelect) {
  modelSelect.setAttribute('aria-label', 'Phase 2 model for correction outcomes');
  modelSelect.addEventListener('change',showOutcomes);
}
if (datasetSelect || matrixSelect) chooseDataset((datasetSelect || matrixSelect).value);

function openAlgorithm(hash, focus = false) {
  if (!/^#algorithm-[1-4]$/.test(hash)) return;
  const panel = document.getElementById(hash.slice(1));
  if (!panel || panel.tagName !== 'DETAILS') return;
  panel.open = true;
  if (focus) panel.querySelector('summary')?.focus({ preventScroll: true });
}
document.querySelectorAll('a[href^="#algorithm-"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // Open before native fragment navigation, even when the URL already has this hash.
    openAlgorithm(link.getAttribute('href'), true);
  });
});
window.addEventListener('hashchange', () => openAlgorithm(window.location.hash));
openAlgorithm(window.location.hash);
if (body && window.studyResults) {
  const datasets = ['Reddit', 'Mixed Emotion', 'Additional Reddit 9000'];
  const methods = ['Direct', 'CoT', 'SELF-DISCOVER'];
  const rows = [...window.studyResults].sort((a, b) =>
    datasets.indexOf(a.dataset) - datasets.indexOf(b.dataset) ||
    a.model.localeCompare(b.model) || methods.indexOf(a.method) - methods.indexOf(b.method));
  const percent = value => (Math.round((value + Number.EPSILON * 100) * 100) / 100).toFixed(2);
  rows.forEach(row => {
    const tr = document.createElement('tr');
    const group = rows.filter(other => other.dataset === row.dataset && other.model === row.model);
    const values = [row.dataset.replace('9000', '9,000'), row.model, row.method,
      percent(row.accuracy_percent), percent(row.macro_f1_percent), row.corrected, row.introduced,
      (row.net_corrections > 0 ? '+' : '') + row.net_corrections];
    values.forEach((value, index) => {
      const td = document.createElement('td');
      const metric = index === 3 ? 'accuracy_percent' : index === 4 ? 'macro_f1_percent' : null;
      if (metric && row[metric] === Math.max(...group.map(item => item[metric]))) {
        const strong = document.createElement('strong');
        strong.textContent = value;
        td.append(strong);
      } else td.textContent = value;
      tr.append(td);
    });
    body.append(tr);
  });
}
