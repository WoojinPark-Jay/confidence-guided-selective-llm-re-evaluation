"""Public site displays the released evidence without rewriting it."""
import json
import csv
from pathlib import Path
import unittest
import tempfile
from html.parser import HTMLParser
from scripts.build_site import build

ROOT = Path(__file__).resolve().parents[1]


def payload(name, variable):
    text = (ROOT / 'site' / name).read_text()
    prefix = 'window.' + variable + ' = '
    assert text.startswith(prefix) and text.endswith(';\n')
    return json.loads(text[len(prefix):-2])


class SiteExportTests(unittest.TestCase):
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
