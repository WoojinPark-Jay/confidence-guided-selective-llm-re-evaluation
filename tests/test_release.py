from __future__ import annotations

import csv
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cgslr.metrics import exact_mcnemar_p, holm_adjust, summarize_rows  # noqa: E402


class ReleaseTests(unittest.TestCase):
    def test_exact_mcnemar_known_result(self):
        self.assertAlmostEqual(exact_mcnemar_p(30, 13), 0.0137181850586785)

    def test_holm_known_family(self):
        values = holm_adjust([0.0919145498158542, 0.0659940344557981, 0.0137181850586785])
        self.assertAlmostEqual(values[0], 0.1319880689115962)
        self.assertAlmostEqual(values[1], 0.1319880689115962)
        self.assertAlmostEqual(values[2], 0.0411545551760355)

    def test_all_prediction_metrics_match_manifest(self):
        path = ROOT / "results" / "predictions" / "manifest.csv"
        with path.open(newline="", encoding="utf-8") as handle:
            entries = list(csv.DictReader(handle))
        self.assertEqual(len(entries), 15)
        for entry in entries:
            with (ROOT / entry["path"]).open(newline="", encoding="utf-8-sig") as handle:
                summary = summarize_rows(csv.DictReader(handle))
            self.assertEqual(summary["n"], int(entry["n"]))
            self.assertEqual(summary["corrected"], int(entry["corrected"]))
            self.assertEqual(summary["introduced"], int(entry["introduced"]))
            self.assertAlmostEqual(summary["accuracy_percent"], float(entry["accuracy_percent"]))
            self.assertAlmostEqual(summary["macro_f1_percent"], float(entry["macro_f1_percent"]))


if __name__ == "__main__":
    unittest.main()

