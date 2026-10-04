#!/usr/bin/env python3
"""Recompute exact paired tests and Holm adjustments from released labels."""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cgslr.metrics import exact_mcnemar_p, holm_adjust  # noqa: E402


def read_manifest() -> list[dict[str, str]]:
    with (ROOT / "results" / "predictions" / "manifest.csv").open(
        newline="", encoding="utf-8"
    ) as handle:
        return list(csv.DictReader(handle))


def read_predictions(relative: str) -> dict[str, dict[str, str]]:
    with (ROOT / relative).open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    return {row["example_id"]: row for row in rows}


def paired(reference: dict[str, dict[str, str]], candidate: dict[str, dict[str, str]]) -> dict:
    if set(reference) != set(candidate):
        raise ValueError("paired files have different example_id sets")
    candidate_only = reference_only = 0
    for example_id in reference:
        a = reference[example_id]
        b = candidate[example_id]
        if a["target_label"] != b["target_label"]:
            raise ValueError(f"target mismatch at {example_id}")
        a_correct = a["final_label"] == a["target_label"]
        b_correct = b["final_label"] == b["target_label"]
        candidate_only += int(not a_correct and b_correct)
        reference_only += int(a_correct and not b_correct)
    n = len(reference)
    return {
        "n": n,
        "candidate_only_correct": candidate_only,
        "reference_only_correct": reference_only,
        "change_pp": 100 * (candidate_only - reference_only) / n,
        "exact_p": exact_mcnemar_p(candidate_only, reference_only),
    }


def main() -> None:
    entries = read_manifest()
    predictions = {
        (entry["dataset"], entry["model"], entry["method"]): read_predictions(entry["path"])
        for entry in entries
    }

    phase1_rows = []
    for entry in entries:
        rows = predictions[(entry["dataset"], entry["model"], entry["method"])]
        reference = {
            key: {**row, "final_label": row["phase1_label"]}
            for key, row in rows.items()
        }
        stats = paired(reference, rows)
        family = "additional_3" if entry["dataset"] == "Additional Reddit 9000" else "main_12"
        phase1_rows.append({
            "dataset": entry["dataset"], "model": entry["model"], "method": entry["method"],
            "family": family, **stats,
        })
    for family_name in {row["family"] for row in phase1_rows}:
        members = [row for row in phase1_rows if row["family"] == family_name]
        adjusted = holm_adjust(row["exact_p"] for row in members)
        for row, value in zip(members, adjusted):
            row["holm_p"] = value

    protocol_rows = []
    groups = defaultdict(dict)
    for key, value in predictions.items():
        groups[key[:2]][key[2]] = value
    for (dataset, model), methods in groups.items():
        if not {"Direct", "CoT", "SELF-DISCOVER"}.issubset(methods):
            continue
        family = []
        for reference_name in ("Direct", "CoT"):
            stats = paired(methods[reference_name], methods["SELF-DISCOVER"])
            family.append({
                "dataset": dataset,
                "model": model,
                "comparison": f"SELF-DISCOVER vs {reference_name}",
                **stats,
            })
        for row, value in zip(family, holm_adjust(item["exact_p"] for item in family)):
            row["holm_p"] = value
        protocol_rows.extend(family)

    output = {
        "phase1_comparisons": phase1_rows,
        "protocol_comparisons": protocol_rows,
    }
    path = ROOT / "results" / "recomputed_statistics.json"
    path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(
        f"Verified {len(phase1_rows)} Phase 1 comparisons and "
        f"{len(protocol_rows)} protocol comparisons; wrote {path.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()

