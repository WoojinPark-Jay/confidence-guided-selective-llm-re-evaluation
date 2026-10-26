"""Public site displays the released evidence without rewriting it."""
import json
import csv
import struct
from pathlib import Path
import unittest
import tempfile
from html.parser import HTMLParser
from scripts.build_site import build

ROOT = Path(__file__).resolve().parents[1]


def payload(name, variable):
    text = (ROOT / 'site' / name).read_text()
    prefix = 'window.' + variable + ' = '
    assert prefix in text
    return json.JSONDecoder().raw_decode(text.split(prefix, 1)[1])[0]


class SiteExportTests(unittest.TestCase):
    def test_matched_baseline_matrices(self):
        matrices = payload('results-data.js', 'studyMatrices')
        expected = {'Reddit': (370, 336), 'Mixed Emotion': (49, 22),
                    'Additional Reddit 9000': (218, 201)}
        for dataset, data in matrices.items():
            with (ROOT / data['source']).open() as source:
                records = list(csv.DictReader(source))
            self.assertEqual(data['n'], len(records))
            for stage, key in enumerate(('phase1_label', 'final_label')):
                actual = [[sum(r['target_label'] == truth and r[key] == pred for r in records)
                           for pred in data['labels']] for truth in data['labels']]
                self.assertEqual(data[key], actual)
                self.assertEqual(data['n'] - sum(actual[i][i] for i in range(3)), expected[dataset][stage])

    def test_original_algorithm_figures_and_research_summary(self):
        html = (ROOT / 'site/index.html').read_text()
        for number in range(1, 5):
            relative = 'assets/algorithm-%d.png' % number
            self.assertIn('src="' + relative + '"', html)
            data = (ROOT / 'site' / relative).read_bytes()
            self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n')
            width, height = struct.unpack('>II', data[16:24])
            self.assertGreaterEqual(width, 1000)
            self.assertGreater(height, 500)
        self.assertEqual(html.count('<dt><span>'), 4)
        self.assertIn('id="findings"', html)
        self.assertIn('<details class="protocol-details">', html)
        self.assertIn('aria-label="Fixed-protocol evaluation summary"', html)
        self.assertIn('1.23% <span>111 of 9,000', html)
        self.assertIn('+17 <span>30 corrected &minus; 13 introduced', html)
        self.assertIn('97.77% <span>from 97.58%', html)
        self.assertLess(html.index('class="evidence-overview"'), html.index('id="contributions"'))

    def test_four_manuscript_algorithms_and_case_controls(self):
        html = (ROOT / 'site/index.html').read_text()
        self.assertIn('id="algorithm-1" open>', html)
        for number in (2, 3, 4):
            self.assertNotIn('id="algorithm-%d" open>' % number, html)
        for number in range(1, 5):
            self.assertEqual(html.count('id="algorithm-%d"' % number), 1)
        for title in ('Calibrated confidence-guided routing',
                      'Two-phase inference with fixed calibrated routing policy',
                      'Audited end-to-end evaluation of routed predictions',
                      'Final task-level SELF-DISCOVER re-evaluation'):
            self.assertIn(title, html)
        self.assertEqual(html.count('name="case-choice"'), 4)
        self.assertIn('Highlighting is editorial, not model attribution.', html)
        self.assertIn('a fallback is not risk-feasible', html)

    def test_release_uses_fingerprinted_assets(self):
        class Assets(HTMLParser):
            def __init__(self):
                super().__init__()
                self.urls = []
            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                if tag == 'script':
                    self.urls.append(attrs['src'])
                if tag == 'link' and attrs.get('rel') == 'stylesheet':
                    self.urls.append(attrs['href'])
        with tempfile.TemporaryDirectory() as directory:
            output = build(directory)
            html = (output / 'index.html').read_text()
            parser = Assets()
            parser.feed(html)
            self.assertEqual(len(parser.urls), 6)
            for url in parser.urls:
                self.assertRegex(url, r'\.[0-9a-f]{12}\.(css|js)$')
                self.assertTrue((output / url).is_file())
            self.assertIn('Final label: Depression', html)
            self.assertIn('SELF-DISCOVER: 30 &minus; 13 = +17', html)
            tutorial = (output / 'tutorial.html').read_text()
            parser = Assets()
            parser.feed(tutorial)
            self.assertEqual(len(parser.urls), 4)
            for url in parser.urls:
                self.assertRegex(url, r'\.[0-9a-f]{12}\.(css|js)$')
                self.assertTrue((output / url).is_file())
            self.assertIn('href="calibration-core.js"', tutorial)
            self.assertIn('value="600" selected', tutorial)
            self.assertIn('not research results', tutorial)
            self.assertIn('Temperature Scaling &amp; Calibration', tutorial)
            self.assertIn('<details class="example-description">', tutorial)
            self.assertIn('<summary>About these examples</summary>', tutorial)
            self.assertIn('id="data-description"', tutorial)
            self.assertIn('aria-label="Temperature controls"', tutorial)
            self.assertIn('aria-label="Calibration metrics"', tutorial)
            self.assertEqual(html.count('class="tutorial-cta" href="tutorial.html"'), 2)

    def test_cases_match_released_predictions_and_synthetic_text(self):
        exported = payload('case-data.js', 'CASE_DATA')
        self.assertEqual(exported, json.loads((ROOT / 'data/mixed_emotion/site_case_records.json').read_text()))
        def load(path):
            with (ROOT / path).open() as source:
                return {r['example_id']: r for r in csv.DictReader(source)}
        data = load('data/mixed_emotion/mixed_emotion_stress_test_300.csv')
        phase1 = load('data/mixed_emotion/mixed_emotion_phase1_outputs.csv')
        final = load('results/predictions/mixed_emotion__llama3__self_discover.csv')
        self.assertEqual(len(exported['cases']), 4)
        for case in exported['cases']:
            key = case['example_id']
            self.assertEqual(case['text'], data[key]['text'])
            self.assertEqual(case['target_label'], data[key]['target_label'])
            self.assertEqual(case['phase1_label'], phase1[key]['phase1_label'])
            self.assertAlmostEqual(case['confidence'], float(phase1[key]['phase1_confidence']))
            self.assertEqual(case['routed'], case['confidence'] < .70)
            self.assertEqual(case['final_label'], final[key]['final_label'])
            if case['routed']:
                self.assertTrue(case['response'])
                self.assertEqual(case['final_label'], case['parsed_label'] or case['phase1_label'])
            else:
                self.assertIsNone(case['response'])
        self.assertEqual(exported['cases'][1]['outcome'], 'Introduced error')
        self.assertNotEqual(exported['cases'][1]['final_label'], exported['cases'][1]['target_label'])
        self.assertEqual(exported['cases'][2]['parsed_label'], '')

    def test_findings_open_distinct_inline_evidence(self):
        html = (ROOT / 'site/index.html').read_text()
        findings = html.split('<ol class="finding-list">')[1].split('</ol>')[0]
        self.assertEqual(findings.count('<details class="finding-evidence">'), 3)
        self.assertNotIn('href="#', findings)
        for title in ('View routing evidence', 'View paired comparisons', 'View generation workload'):
            self.assertEqual(findings.count(f'<summary>{title}</summary>'), 1)
        self.assertIn('src="assets/routing.webp"', findings)
        self.assertIn('0.0412', findings)
        self.assertIn('54.9 s', findings)
        for target in ('routing-analysis', 'paired-comparisons', 'generation-workload'):
            self.assertEqual(html.count(f'id="{target}"'), 1)

    def test_prompt_text_matches_public_files(self):
        groups = payload('prompt-data.js', 'studyPrompts')
        self.assertEqual(set(groups), {'Direct', 'CoT', 'SELF-DISCOVER', 'Saved plans'})
        for entries in groups.values():
            for entry in entries:
                self.assertTrue(entry['path'].startswith(('prompts/', 'plans/')))
                self.assertEqual(entry['text'], (ROOT / entry['path']).read_text())

    def test_all_results_match_recomputed_metrics(self):
        exported = payload('results-data.js', 'studyResults')
        original = json.loads((ROOT / 'results/recomputed_metrics.json').read_text())
        self.assertEqual(len(exported), 15)
        for row, source in zip(exported, original):
            for key, value in row.items():
                self.assertEqual(value, source[key])
            self.assertEqual(row['net_corrections'], row['corrected'] - row['introduced'])
            self.assertAlmostEqual(row['accuracy_percent'] - row['phase1_accuracy_percent'],
                                   100 * row['net_corrections'] / row['n'])
