"""Public site displays the released evidence without rewriting it."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def payload(name, variable):
    text = (ROOT / 'site' / name).read_text()
    prefix = 'window.' + variable + ' = '
    assert text.startswith(prefix) and text.endswith(';\n')
    return json.loads(text[len(prefix):-2])


class SiteExportTests(unittest.TestCase):
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
