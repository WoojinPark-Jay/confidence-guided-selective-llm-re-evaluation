const body = document.getElementById('all-results-body');
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
