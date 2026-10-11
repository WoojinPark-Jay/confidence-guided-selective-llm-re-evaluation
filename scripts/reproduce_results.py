#!/usr/bin/env python3
"""Recompute all released point metrics from text-free aligned predictions."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cgslr.metrics import summarize_rows  # noqa: E402

PREDICTION_COLUMNS = {"example_id", "target_label", "phase1_label", "final_label"}


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if set(reader.fieldnames or []) != PREDICTION_COLUMNS:
            raise ValueError(f"unexpected prediction columns in {path}")
        rows = list(reader)
    ids = [row["example_id"].strip() for row in rows]
    if any(not value for value in ids) or len(ids) != len(set(ids)):
        raise ValueError(f"empty or duplicate example_id in {path}")
    return rows


def main() -> None:
    manifest_path = ROOT / "results" / "predictions" / "manifest.csv"
    with manifest_path.open(newline="", encoding="utf-8") as handle:
        manifest = list(csv.DictReader(handle))
    summaries = []
    for entry in manifest:
        path = ROOT / entry["path"]
        summary = summarize_rows(load_csv(path))
        for key in ("n", "corrected", "introduced"):
            if int(entry[key]) != int(summary[key]):
                raise AssertionError(f"{path}: {key} mismatch")
        for key in ("accuracy_percent", "macro_f1_percent"):
            if abs(float(entry[key]) - float(summary[key])) > 1e-9:
                raise AssertionError(f"{path}: {key} mismatch")
        summaries.append({
            "dataset": entry["dataset"],
            "model": entry["model"],
            "method": entry["method"],
            **summary,
        })
    output = ROOT / "results" / "recomputed_metrics.json"
    output.write_text(json.dumps(summaries, indent=2), encoding="utf-8")
    print(f"Verified {len(summaries)} conditions; wrote {output.relative_to(ROOT)}")
    for row in summaries:
        print(
            f"{row['dataset']:<24} {row['model']:<8} {row['method']:<14} "
            f"acc={row['accuracy_percent']:.4f} macroF1={row['macro_f1_percent']:.4f} "
            f"corrected={row['corrected']:>2} introduced={row['introduced']:>2}"
        )


if __name__ == "__main__":
    main()
