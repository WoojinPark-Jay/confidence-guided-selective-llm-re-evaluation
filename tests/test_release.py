from __future__ import annotations

import csv
import json
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

    def test_prediction_ids_and_phase1_contracts_align(self):
        manifest_path = ROOT / "results" / "predictions" / "manifest.csv"
        with manifest_path.open(newline="", encoding="utf-8") as handle:
            entries = list(csv.DictReader(handle))
        contracts = {}
        labels = {"Depression", "Neutral", "Happy"}
        for entry in entries:
            with (ROOT / entry["path"]).open(newline="", encoding="utf-8-sig") as handle:
                rows = list(csv.DictReader(handle))
            ids = [row["example_id"] for row in rows]
            self.assertEqual(len(ids), len(set(ids)))
            self.assertTrue(all(ids))
            self.assertTrue(
                all(
                    row[column] in labels
                    for row in rows
                    for column in ("target_label", "phase1_label", "final_label")
                )
            )
            contract = {
                row["example_id"]: (row["target_label"], row["phase1_label"])
                for row in rows
            }
            if entry["dataset"] in contracts:
                self.assertEqual(contract, contracts[entry["dataset"]])
            else:
                contracts[entry["dataset"]] = contract

    def test_public_mixed_phase1_contract(self):
        path = ROOT / "data" / "mixed_emotion" / "mixed_emotion_phase1_outputs.csv"
        with path.open(newline="", encoding="utf-8") as handle:
            rows = list(csv.DictReader(handle))
        self.assertEqual(len(rows), 300)
        self.assertEqual(len({row["example_id"] for row in rows}), 300)
        self.assertEqual(sum(row["phase1_routed"].lower() == "true" for row in rows), 86)
        self.assertTrue(all(0.0 <= float(row["phase1_confidence"]) <= 1.0 for row in rows))

    def test_mixed_emotion_annotation_audit(self):
        report_path = ROOT / "results" / "reports" / "mixed_emotion_annotation_audit.json"
        report = json.loads(report_path.read_text(encoding="utf-8"))
        self.assertEqual(report["n"], 300)
        self.assertEqual(report["initial_agreements"], 277)
        self.assertEqual(report["annotator_a_vs_target"], 288)
        self.assertEqual(report["annotator_b_vs_target"], 289)
        self.assertEqual(report["agreed_labels_matching_target"], 277)
        self.assertEqual(report["direct_depression_happy_disagreements"], 0)
        self.assertEqual(
            report["disagreements_with_at_least_one_low_confidence_rating"], 23
        )
        self.assertAlmostEqual(report["raw_agreement"], 277 / 300)
        self.assertAlmostEqual(report["unweighted_cohen_kappa"], 0.8846886593803269)
        self.assertEqual(
            [round(value, 4) for value in report["kappa_bootstrap"]["ci"]],
            [0.8350, 0.9294],
        )


if __name__ == "__main__":
    unittest.main()
