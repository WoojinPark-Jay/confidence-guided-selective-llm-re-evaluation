(() => {
  'use strict';
  if (!window.CASE_DATA) return;
  const records = window.CASE_DATA.cases;
  const choices = [...document.querySelectorAll('input[name="case-choice"]')];
  const put = (id, value) => { document.getElementById(id).textContent = value; };

  // Text-only rendering preserves the model output without interpreting its HTML.
  function sections(response) {
    const parts = response.split(/\*\*([^*\n]+)\*\*/g);
    const result = [];
    for (let i = 1; i < parts.length; i += 2) result.push({ title: parts[i], text: parts[i + 1].trim() });
    return result;
  }

  function render() {
    const item = records[Number(choices.find(choice => choice.checked).value)];
    const confidence = (item.confidence * 100).toFixed(2) + '%';
    put('case-id', item.example_id);
    put('case-post', item.text);
    const ending = item.text.match(/[^.!?]+[.!?]$/);
    if (ending) {
      const post = document.getElementById('case-post');
      const mark = document.createElement('mark');
      mark.textContent = ending[0];
      post.replaceChildren(document.createTextNode(item.text.slice(0, ending.index)), mark);
    }
    put('case-phase1', item.phase1_label);
    put('case-confidence', confidence + ' calibrated confidence');
    put('case-routing', item.routed ? 'Re-evaluate' : 'Keep Phase 1');
    put('case-route-note', confidence + (item.routed ? ' < 70% threshold' : ' >= 70% threshold'));
    put('case-final', item.final_label);
    put('case-target', item.target_label);
    const outcomes = {
      'Correction': 'Corrected against the reference target',
      'Introduced error': 'Changed from correct to incorrect',
      'Parsing fallback': 'No terminal label; Phase 1 retained',
      'Not routed': 'Accepted prediction remains incorrect'
    };
    put('case-outcome', outcomes[item.outcome]);
    document.getElementById('case-reasoning').hidden = !item.response;
    document.getElementById('case-no-response').hidden = Boolean(item.response);
    document.querySelector('.case-model-note').hidden = !item.response;
    document.getElementById('case-full').hidden = !item.response;
    document.getElementById('case-content').dataset.outcome = item.outcome;
    document.getElementById('case-full').open = false;
    put('case-report', item.response || 'No LLM call was made.');
    const excerpt = document.getElementById('case-excerpt');
    excerpt.replaceChildren();
    if (item.response) {
      const selected = sections(item.response).filter(part => /Emotional Arc|Counterfactual/.test(part.title));
      for (const part of selected) {
        const heading = document.createElement('h4');
        heading.textContent = part.title;
        const paragraph = document.createElement('p');
        paragraph.textContent = part.text;
        excerpt.append(heading, paragraph);
      }
    }
    const interpretations = {
      'Correction': 'The label changes from Happy to Depression. This is one of 28 corrections in the 300-example set; one new error gives 27 net corrections.',
      'Introduced error': 'The response recognizes the positive ending but selects Neutral. The reference target is Happy. This is the sole introduced error in this run, showing why new errors must be counted alongside corrections.',
      'Parsing fallback': 'The response discusses Neutral but does not supply a valid terminal label. The pipeline retains the Phase 1 prediction, Neutral. This is the sole parsing fallback in the Mixed Emotion Llama 3 SELF-DISCOVER run.',
      'Not routed': 'Confidence exceeds the threshold, so Phase 2 never sees this post. Happy remains the final prediction even though the reference target is Depression. Selective re-evaluation cannot correct errors outside the routed set.'
    };
    put('case-interpretation', interpretations[item.outcome]);
  }
  choices.forEach(choice => choice.addEventListener('change', render));
  document.querySelectorAll('.procedure-map a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector(link.getAttribute('href')).open = true;
    });
  });
  render();
})();
