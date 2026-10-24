#!/usr/bin/env python3
"""Export verified metrics for the dependency-free project page."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / 'results/recomputed_metrics.json').read_text())
fields = ('dataset', 'model', 'method', 'accuracy_percent', 'macro_f1_percent',
          'corrected', 'introduced', 'net_corrections')
payload = [{key: row[key] for key in fields} for row in rows]
(ROOT / 'site/results-data.js').write_text(
    'window.studyResults = ' + json.dumps(payload, indent=2) + ';\n', encoding='utf-8')
print(f'Exported {len(payload)} verified result rows')
