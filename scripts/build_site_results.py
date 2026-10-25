#!/usr/bin/env python3
"""Export verified metrics for the dependency-free project page."""
import json
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / 'results/recomputed_metrics.json').read_text())
fields = ('dataset', 'model', 'method', 'n', 'phase1_accuracy_percent', 'accuracy_percent', 'macro_f1_percent',
          'corrected', 'introduced', 'net_corrections')
payload = [{key: row[key] for key in fields} for row in rows]
(ROOT / 'site/results-data.js').write_text(
    'window.studyResults = ' + json.dumps(payload, indent=2) + ';\n', encoding='utf-8')
print(f'Exported {len(payload)} verified result rows')

# Matched baseline and final predictions, never pooled across training seeds.
labels = ['Depression', 'Neutral', 'Happy']
matrices = {}
for dataset, slug in [('Reddit', 'reddit'), ('Mixed Emotion', 'mixed_emotion'),
                      ('Additional Reddit 9000', 'additional_reddit_9000')]:
    path = f'results/predictions/{slug}__llama3__self_discover.csv'
    records = list(csv.DictReader((ROOT / path).open()))
    pair = {key: [[0]*3 for _ in labels] for key in ['phase1_label', 'final_label']}
    for record in records:
        for key in pair:
            pair[key][labels.index(record['target_label'])][labels.index(record[key])] += 1
    matrices[dataset] = dict(labels=labels, source=path, n=len(records), **pair)
with (ROOT / 'site/results-data.js').open('a') as output:
    output.write('window.studyMatrices = ' + json.dumps(matrices, indent=2) + ';\n')

# Keep displayed templates byte-for-byte equal to the released source files.
groups = {
    'Direct': [('Prompt', 'prompts/direct/prompt.txt'), ('Shared policy', 'prompts/policy.txt')],
    'CoT': [('System message', 'prompts/cot/turn_0.txt'),
            ('1. Acknowledgment instruction', 'prompts/cot/turn_1.txt'),
            ('2. Post text', 'prompts/cot/text_template.txt'),
            ('3. Independent analysis', 'prompts/cot/turn_2.txt'),
            ('4. Phase 1 comparison', 'prompts/cot/turn_3.txt'),
            ('5. Final decision', 'prompts/cot/turn_4.txt'),
            ('Shared policy', 'prompts/policy.txt')],
    'SELF-DISCOVER': [('Per-post execution', 'prompts/self_discover/execute.txt'),
                      ('System message', 'prompts/self_discover/system.txt'),
                      ('Task specification', 'prompts/self_discover/task.txt'),
                      ('18 reasoning modules', 'prompts/self_discover/modules.txt'),
                      ('SELECT', 'prompts/self_discover/select.txt'),
                      ('ADAPT', 'prompts/self_discover/adapt.txt'),
                      ('IMPLEMENT', 'prompts/self_discover/implement_compact.txt'),
                      ('Shared policy', 'prompts/policy.txt')],
    'Saved plans': [('Llama 3', 'plans/llama3_plan.txt'), ('Llama 2', 'plans/llama2_plan.txt')],
}
prompts = {group: [{'title': title, 'path': path, 'text': (ROOT / path).read_text()}
                   for title, path in entries] for group, entries in groups.items()}
(ROOT / 'site/prompt-data.js').write_text(
    'window.studyPrompts = ' + json.dumps(prompts, indent=2) + ';\n', encoding='utf-8')
print('Exported exact public prompts and saved plans')
