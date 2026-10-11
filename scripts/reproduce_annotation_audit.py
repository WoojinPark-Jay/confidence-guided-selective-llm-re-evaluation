#!/usr/bin/env python3
"""Recompute the released Mixed Emotion independent-annotation audit."""

from __future__ import annotations

import csv
import json
import math
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "mixed_emotion" / "mixed_emotion_annotation_audit.csv"
OUTPUT = ROOT / "results" / "reports" / "mixed_emotion_annotation_audit.json"
LABELS = ("Depression", "Neutral", "Happy")


def cohen_kappa(pairs: list[tuple[str, str]]) -> tuple[float, float, float]:
    n = len(pairs)
    observed = sum(a == b for a, b in pairs) / n
    counts_a = Counter(a for a, _ in pairs)
    counts_b = Counter(b for _, b in pairs)
    expected = sum(counts_a[label] * counts_b[label] for label in LABELS) / (n * n)
    return observed, expected, (observed - expected) / (1 - expected)


def percentile(values: list[float], probability: float) -> float:
    ordered = sorted(values)
    position = (len(ordered) - 1) * probability
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    fraction = position - lower
    return ordered[lower] * (1 - fraction) + ordered[upper] * fraction


def bootstrap_kappa(
    pairs: list[tuple[str, str]], *, resamples: int = 10_000, seed: int = 42
) -> list[float]:
    rng = random.Random(seed)
    n = len(pairs)
    values = []
    for _ in range(resamples):
        sample = [pairs[rng.randrange(n)] for _ in range(n)]
        values.append(cohen_kappa(sample)[2])
    return [percentile(values, 0.025), percentile(values, 0.975)]


def main() -> None:
    with INPUT.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) != 300:
        raise AssertionError(f"expected 300 audit rows, found {len(rows)}")
    if len({row["example_id"] for row in rows}) != 300:
        raise AssertionError("annotation audit contains duplicate example_id values")

    pairs = [(row["annotator_a_label"], row["annotator_b_label"]) for row in rows]
    observed, expected, kappa = cohen_kappa(pairs)
    agreements = sum(a == b for a, b in pairs)
    direct_depression_happy = sum({a, b} == {"Depression", "Happy"} for a, b in pairs)
    disagreements_with_low = sum(
        row["annotator_a_label"] != row["annotator_b_label"]
        and "Low" in (row["annotator_a_confidence"], row["annotator_b_confidence"])
        for row in rows
    )
    matrix = {
        a: {b: sum(x == a and y == b for x, y in pairs) for b in LABELS}
        for a in LABELS
    }
    agreed_target_matches = sum(
        row["annotator_a_label"] == row["annotator_b_label"] == row["target_label"]
        for row in rows
    )
    output = {
        "n": len(rows),
        "initial_agreements": agreements,
        "initial_disagreements": len(rows) - agreements,
        "raw_agreement": observed,
        "expected_agreement": expected,
        "unweighted_cohen_kappa": kappa,
        "kappa_bootstrap": {
            "method": "paired-case percentile bootstrap",
            "resamples": 10_000,
            "seed": 42,
            "confidence_level": 0.95,
            "ci": bootstrap_kappa(pairs),
        },
        "annotator_a_vs_target": sum(
            row["annotator_a_label"] == row["target_label"] for row in rows
        ),
        "annotator_b_vs_target": sum(
            row["annotator_b_label"] == row["target_label"] for row in rows
        ),
        "agreed_labels_matching_target": agreed_target_matches,
        "agreed_cases": agreements,
        "direct_depression_happy_disagreements": direct_depression_happy,
        "disagreements_with_at_least_one_low_confidence_rating": disagreements_with_low,
        "confusion_matrix_annotator_a_rows_annotator_b_columns": matrix,
        "adjudication_performed": False,
        "targets_modified_after_audit": False,
    }
    OUTPUT.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(
        f"Verified {agreements}/300 agreements and kappa={kappa:.4f}; "
        f"wrote {OUTPUT.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
